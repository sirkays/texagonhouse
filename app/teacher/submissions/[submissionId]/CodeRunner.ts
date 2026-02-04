// app/teacher/submissions/CodeRunner.ts
import { useState, useEffect } from "react";

export type Lang = "javascript" | "python" | "java" | "cpp" | "html" | "css";

const languages = {
  javascript: { judgeId: 63 },
  python: { judgeId: 71 },
  java: { judgeId: 62 },
  cpp: { judgeId: 54 },
  html: { judgeId: null },
  css: { judgeId: null },
} as const;

export function useCodeRunner(initialFiles: Record<Lang, string>) {
  const [files, setFiles] = useState(initialFiles);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [activeLang, setActiveLang] = useState<Lang>("javascript");
  const [ready] = useState({ pyodide: true, cheerpj: true, emception: true });

  const run = async () => {
    setIsRunning(true);
    setOutput("");

    const code = files[activeLang];
    if (!code.trim()) {
      setOutput("No code to run.");
      setIsRunning(false);
      return;
    }
    if (activeLang === "html" || activeLang === "css") {
      const html = activeLang === "html" ? code : files.html;
      const css = activeLang === "css" ? code : files.css;
      const js = files.javascript ?? "";

      setOutput(`
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <style>${css ?? ""}</style>
  </head>
  <body>
    ${html ?? ""}

    <script>
      try {
        ${js}
      } catch (e) {
        document.body.insertAdjacentHTML(
          "beforeend",
          "<pre style='white-space:pre-wrap;color:#ff6b6b;background:#111;padding:12px;border-radius:8px;'>"
          + (e?.stack || e?.message || String(e)) +
          "</pre>"
        );
      }
    </script>
  </body>
</html>
  `);

      setIsRunning(false);
      return;
    }


    if (activeLang === "javascript") {
      // ... existing js logic ...
      const logs: string[] = [];
      const original = console.log;
      console.log = (...a) => logs.push(a.map(String).join(" "));
      try {
        new Function(code)();
        setOutput(logs.join("\n") || "Success (no output)");
      } catch (e: any) {
        setOutput(`Error: ${e.message}`);
      } finally {
        console.log = original;
        setIsRunning(false);
      }
      return;
    }

    // Online execution via Judge0
    const cfg = languages[activeLang];
    if (!cfg.judgeId) {
      setOutput("Execution not supported.");
      setIsRunning(false);
      return;
    }

    let codeToRun = code;

    // Auto-wrap Java/C++ execution
    if (activeLang === "java" && !code.includes("class Main")) {
      codeToRun = `public class Main {\n    public static void main(String[] args) {\n        ${code}\n    }\n}`;
    } else if (activeLang === "cpp" && !code.includes("int main")) {
      codeToRun = `#include <iostream>\n\nusing namespace std;\n\nint main() {\n    ${code}\n    return 0;\n}`;
    }

    try {
      const res = await fetch(
        "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-RapidAPI-Key":
              "aa76b3efa6msh96695e665e5f57fp105d9cjsn87230da97198",
            "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
          },
          body: JSON.stringify({
            source_code: codeToRun,
            language_id: cfg.judgeId,
            stdin: "",
          }),
        }
      );

      const result = await res.json();

      if (result.status?.id === 3) {
        setOutput(result.stdout || "Success (no output)");
      } else if (result.compile_output) {
        setOutput(`Compilation Error:\n${result.compile_output}`);
      } else if (result.stderr) {
        setOutput(`Runtime Error:\n${result.stderr}`);
      } else {
        setOutput(result.stdout || "Unknown result");
      }
    } catch (err: any) {
      console.error("[CodeRunner] API Error:", err);
      setOutput("Online execution unavailable. Try local JS.");
    } finally {
      setIsRunning(false);
    }
  };

const renderWeb = () => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <style>${files.css ?? ""}</style>
  </head>
  <body>
    ${files.html ?? ""}

    <script>
      (function () {
        const send = (level, args) => {
          try {
            window.parent.postMessage(
              { type: "web-console", level, args: Array.from(args).map(String) },
              "*"
            );
          } catch (_) {}
        };

        // forward logs
        const origLog = console.log;
        const origWarn = console.warn;
        const origErr = console.error;

        console.log = function (...a) { send("log", a); origLog.apply(console, a); };
        console.warn = function (...a) { send("warn", a); origWarn.apply(console, a); };
        console.error = function (...a) { send("error", a); origErr.apply(console, a); };

        // forward runtime errors
        window.addEventListener("error", (e) => {
          send("error", [e.message || "Script error"]);
        });

        window.addEventListener("unhandledrejection", (e) => {
          send("error", [e.reason?.message || String(e.reason)]);
        });
      })();
    </script>

    <script>
      try {
        ${files.javascript ?? ""}
      } catch (e) {
        console.error(e?.stack || e?.message || String(e));
      }
    </script>
  </body>
</html>
`;



  const download = () => {
    const ext = {
      javascript: "js",
      python: "py",
      java: "java",
      cpp: "cpp",
      html: "html",
      css: "css",
    };
    const code = files[activeLang];

    if (!code || code.trim() === "") {
      console.warn("[CodeRunner] Warning: No code to download!");
      return;
    }

    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `code.${ext[activeLang]}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    files,
    setFiles,
    activeLang,
    setActiveLang,
    output,
    isRunning,
    run,
    ready,
    renderWeb,
    download,
  };
}

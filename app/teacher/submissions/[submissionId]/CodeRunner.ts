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

// ✅ NEW: parse input() prompts from python code
export function parsePythonInputs(code: string): string[] {
  const regex = /input\s*\(\s*(?:"([^"]*?)"|'([^']*?)')?\s*\)/g;
  const prompts: string[] = [];
  let match;
  while ((match = regex.exec(code)) !== null) {
    prompts.push(match[1] ?? match[2] ?? `Input ${prompts.length + 1}`);
  }
  return prompts;
}

export function useCodeRunner(
  initialFiles: Record<Lang, string>,
  // ✅ NEW: caller provides this to show their input modal
  onNeedInput?: (prompts: string[], resolve: (stdin: string) => void) => void
) {
  const [files, setFiles] = useState(initialFiles);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [activeLang, setActiveLang] = useState<Lang>("javascript");
  const [ready] = useState({ pyodide: true, cheerpj: true, emception: true });

  const runWithJudge0 = async (
    codeToRun: string,
    judgeId: number,
    stdin: string
  ) => {
    const res = await fetch(
      "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Key": "aa76b3efa6msh96695e665e5f57fp105d9cjsn87230da97198",
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        },
        body: JSON.stringify({
          source_code: codeToRun,
          language_id: judgeId,
          stdin,
        }),
      }
    );

    const result = await res.json();

    if (result.status?.id === 3) {
      setOutput(result.stdout || "Success (no output)");
    } else if (result.status?.id === 6) {
      setOutput(`Compilation Error:\n${result.compile_output || result.stderr}`);
    } else if (result.status?.id === 5) {
      setOutput("Time Limit Exceeded");
    } else if (result.status?.id === 4) {
      setOutput(`Runtime Error:\n${result.stderr}`);
    } else {
      setOutput(result.stderr || result.stdout || "Unknown error");
    }
  };

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
      setIsRunning(false);
      return; // handled via renderWeb() + iframe
    }

    if (activeLang === "javascript") {
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

    const cfg = languages[activeLang];
    if (!cfg.judgeId) {
      setOutput("Execution not supported.");
      setIsRunning(false);
      return;
    }

    let codeToRun = code;
    if (activeLang === "java" && !code.includes("class Main")) {
      codeToRun = `public class Main {\n    public static void main(String[] args) {\n        ${code}\n    }\n}`;
    } else if (activeLang === "cpp" && !code.includes("int main")) {
      codeToRun = `#include <iostream>\n\nusing namespace std;\n\nint main() {\n    ${code}\n    return 0;\n}`;
    }

    try {
      // ✅ Python input() interception
      if (activeLang === "python") {
        const prompts = parsePythonInputs(code);

        if (prompts.length > 0 && onNeedInput) {
          // pause — modal will call resolve(stdin) when user fills in values
          const stdin = await new Promise<string>((resolve) => {
            onNeedInput(prompts, resolve);
          });

          // user cancelled → resolve("") or modal sets empty string, still run
          await runWithJudge0(codeToRun, cfg.judgeId, stdin);
          setIsRunning(false);
          return;
        }
      }

      // no input() or non-python — run immediately
      await runWithJudge0(codeToRun, cfg.judgeId, "");
    } catch (err: any) {
      setOutput("Online execution unavailable.");
    } finally {
      setIsRunning(false);
    }
  };

  // renderWeb, download — unchanged from your original
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
        const origLog = console.log;
        const origWarn = console.warn;
        const origErr = console.error;
        console.log = function (...a) { send("log", a); origLog.apply(console, a); };
        console.warn = function (...a) { send("warn", a); origWarn.apply(console, a); };
        console.error = function (...a) { send("error", a); origErr.apply(console, a); };
        window.addEventListener("error", (e) => { send("error", [e.message || "Script error"]); });
        window.addEventListener("unhandledrejection", (e) => { send("error", [e.reason?.message || String(e.reason)]); });
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
    const ext = { javascript: "js", python: "py", java: "java", cpp: "cpp", html: "html", css: "css" };
    const code = files[activeLang];
    if (!code?.trim()) return;
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), {
      href: url,
      download: `code.${ext[activeLang]}`,
    });
    a.click();
    URL.revokeObjectURL(url);
  };

  return { files, setFiles, activeLang, setActiveLang, output, isRunning, run, ready, renderWeb, download };
}
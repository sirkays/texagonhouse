// app/teacher/submissions/[submissionId]/CodeRunner.ts
// Multi-file preview with virtual filesystem and inter-page navigation
import { useState, useCallback } from "react";

export type Lang = "javascript" | "python" | "java" | "cpp" | "html" | "css";

const languages = {
  javascript: { judgeId: 63 },
  python: { judgeId: 71 },
  java: { judgeId: 62 },
  cpp: { judgeId: 54 },
  html: { judgeId: null },
  css: { judgeId: null },
} as const;

export function parsePythonInputs(code: string): string[] {
  const regex = /input\s*\(\s*(?:"([^"]*?)"|'([^']*?)'|f"[^"]*?"|f'[^']*?')?\s*\)/g;
  const prompts: string[] = [];
  let match;
  while ((match = regex.exec(code)) !== null) {
    prompts.push(match[1] ?? match[2] ?? `Input ${prompts.length + 1}`);
  }
  return prompts;
}

export interface ProjectFile {
  id: number;
  file_name: string;
  language: string;
  code_text: string;
  correction_code?: string | null;
}

/**
 * Build a virtual filesystem from project files and produce an HTML preview
 * that properly handles:
 * - Multiple HTML pages
 * - <link> and <script> with src/href to other project files
 * - In-iframe navigation between HTML pages
 */
export function buildMultiFilePreview(
  projectFiles: ProjectFile[],
  editedCode: Record<string, string>,
  entryFile: string,
  runId: number
): string {
  // Build the virtual FS: filename -> content
  const fs: Record<string, { content: string; lang: string }> = {};
  for (const f of projectFiles) {
    const fname = (f.file_name || "").toLowerCase();
    const code = editedCode[f.file_name] ?? ((f.correction_code ?? "").trim() || f.code_text);
    fs[fname] = { content: code, lang: f.language };
  }

  const normalizePath = (p: string) =>
    p.replace(/^\.?\//, "").split(/[?#]/)[0].toLowerCase();

  // Get the entry HTML content
  const entryKey = normalizePath(entryFile);
  const entry = fs[entryKey];
  if (!entry || entry.lang !== "html") {
    // Fallback: find any HTML file
    const htmlFiles = Object.entries(fs).filter(([, v]) => v.lang === "html");
    if (htmlFiles.length === 0) return "<p>No HTML file to preview</p>";
    const [fallbackKey, fallbackEntry] = htmlFiles[0];
    return buildHtmlDoc(fallbackEntry.content, fs, fallbackKey, runId);
  }

  return buildHtmlDoc(entry.content, fs, entryKey, runId);
}

function buildHtmlDoc(
  htmlContent: string,
  fs: Record<string, { content: string; lang: string }>,
  currentPage: string,
  runId: number
): string {
  const normalizePath = (p: string) =>
    p.replace(/^\.?\//, "").split(/[?#]/)[0].toLowerCase();

  let processed = htmlContent;

  // Resolve <link rel="stylesheet" href="..."> with inline CSS
  processed = processed.replace(
    /<link\s+([^>]*?)href\s*=\s*["']([^"']+?)["']([^>]*?)\/?>/gi,
    (match, before, href, after) => {
      if (!/rel\s*=\s*["']stylesheet["']/i.test(before + after)) return match;
      const key = normalizePath(href);
      const file = fs[key];
      if (file && file.lang === "css") {
        return `<style data-file="${href}">${file.content}</style>`;
      }
      return match;
    }
  );

  // Resolve <script src="..."> with inline JS
  processed = processed.replace(
    /<script\s+([^>]*?)src\s*=\s*["']([^"']+?)["']([^>]*?)>\s*<\/script>/gi,
    (_match, _before, src, _after) => {
      const key = normalizePath(src);
      const file = fs[key];
      if (file && file.lang === "javascript") {
        return `<script data-file="${src}">${file.content}</script>`;
      }
      return _match;
    }
  );

  // Rewrite <a href="page.html"> to use postMessage navigation
  processed = processed.replace(
    /<a\s+([^>]*?)href\s*=\s*["']([^"']+?)["']([^>]*?)>/gi,
    (match, before, href, after) => {
      if (href.startsWith("http") || href.startsWith("#") || href.startsWith("mailto:")) return match;
      const key = normalizePath(href);
      if (fs[key] && fs[key].lang === "html") {
        return `<a ${before}href="#" data-nav="${href}" onclick="event.preventDefault();window.parent.postMessage({source:'web-iframe',runId:${runId},type:'navigate',message:'${href}'},'*')"${after}>`;
      }
      return match;
    }
  );

  // Console bridge
  const bridge = `<script>
(function(){
  var RUN_ID=${runId};
  var send=function(t,m){try{window.parent.postMessage({source:"web-iframe",runId:RUN_ID,type:t,message:String(m)},"*")}catch(_){}};
  var oL=console.log,oW=console.warn,oE=console.error;
  console.log=function(){var a=Array.prototype.slice.call(arguments).map(String).join(" ");send("log",a);oL.apply(console,arguments)};
  console.warn=function(){var a=Array.prototype.slice.call(arguments).map(String).join(" ");send("warn",a);oW.apply(console,arguments)};
  console.error=function(){var a=Array.prototype.slice.call(arguments).map(String).join(" ");send("error",a);oE.apply(console,arguments)};
  window.addEventListener("error",function(e){send("error",e.message||"Script error")});
  window.addEventListener("unhandledrejection",function(e){send("error",e.reason?.message||String(e.reason))});
})();
</script>`;

  // Inject bridge before </head> or at the start of body
  if (processed.includes("</head>")) {
    processed = processed.replace("</head>", bridge + "</head>");
  } else if (processed.includes("<body")) {
    processed = processed.replace(/<body([^>]*)>/i, `<body$1>${bridge}`);
  } else {
    processed = bridge + processed;
  }

  return processed;
}

export function useCodeRunner(
  onNeedInput?: (prompts: string[], resolve: (stdin: string) => void) => void
) {
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [activeLang, setActiveLang] = useState<Lang>("html");
  const [ready] = useState({ pyodide: true, cheerpj: true, emception: true });

  const runWithJudge0 = async (code: string, judgeId: number, stdin: string) => {
    const res = await fetch(
      "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Key": "aa76b3efa6msh96695e665e5f57fp105d9cjsn87230da97198",
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        },
        body: JSON.stringify({ source_code: code, language_id: judgeId, stdin }),
      }
    );
    const result = await res.json();
    if (result.status?.id === 3) setOutput(result.stdout || "Success (no output)");
    else if (result.status?.id === 6) setOutput(`Compilation Error:\n${result.compile_output || result.stderr}`);
    else if (result.status?.id === 5) setOutput("Time Limit Exceeded");
    else if (result.status?.id === 4) setOutput(`Runtime Error:\n${result.stderr}`);
    else setOutput(result.stderr || result.stdout || "Unknown error");
  };

  const runCode = useCallback(async (code: string, lang: Lang) => {
    setIsRunning(true);
    setOutput("");

    if (!code.trim()) { setOutput("No code to run."); setIsRunning(false); return; }
    if (lang === "html" || lang === "css") { setIsRunning(false); return; }

    if (lang === "javascript") {
      const logs: string[] = [];
      const orig = console.log;
      console.log = (...a) => logs.push(a.map(String).join(" "));
      try { new Function(code)(); setOutput(logs.join("\n") || "Success (no output)"); }
      catch (e: any) { setOutput(`Error: ${e.message}`); }
      finally { console.log = orig; setIsRunning(false); }
      return;
    }

    const cfg = languages[lang];
    if (!cfg?.judgeId) { setOutput("Execution not supported."); setIsRunning(false); return; }

    let codeToRun = code;
    if (lang === "java" && !code.includes("class Main"))
      codeToRun = `public class Main {\n    public static void main(String[] args) {\n        ${code}\n    }\n}`;
    else if (lang === "cpp" && !code.includes("int main"))
      codeToRun = `#include <iostream>\nusing namespace std;\nint main() {\n    ${code}\n    return 0;\n}`;

    try {
      if (lang === "python" && onNeedInput) {
        const prompts = parsePythonInputs(code);
        if (prompts.length > 0) {
          const stdin = await new Promise<string>(r => onNeedInput(prompts, r));
          await runWithJudge0(codeToRun, cfg.judgeId, stdin);
          setIsRunning(false);
          return;
        }
      }
      await runWithJudge0(codeToRun, cfg.judgeId, "");
    } catch { setOutput("Online execution unavailable."); }
    finally { setIsRunning(false); }
  }, [onNeedInput]);

  const download = useCallback((code: string, lang: Lang, fileName: string) => {
    if (!code?.trim()) return;
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), { href: url, download: fileName });
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  return { output, isRunning, activeLang, setActiveLang, runCode, ready, download };
}
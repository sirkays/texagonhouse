// app/teacher/submissions/[submissionId]/CodeRunner.ts
// Multi-file preview with virtual filesystem and inter-page navigation.
//
// Key behaviors:
// 1. <link rel="stylesheet" href="..."> referencing a project CSS file becomes inline <style>.
// 2. <script src="..."> referencing a project JS file becomes inline <script>.
// 3. <a href="page.html"> referencing a project HTML file becomes a postMessage navigation.
// 4. A global click interceptor inside the iframe catches ANY relative-link click
//    (including dynamically-added links and links missed by the regex) so the iframe
//    NEVER navigates to a 404 — it either jumps to the matching project page or
//    surfaces a friendly "page not in project" message in the console.
// 5. Path matching is case-insensitive, strips ./, leading /, query strings, and fragments.

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

/** Normalise a path/href so we can match it against fs keys.
 *  Lowercases, strips leading "./" or "/", drops ?query and #fragment. */
function normalizePath(p: string): string {
  if (!p) return "";
  let s = p.trim();
  // strip query and fragment
  s = s.split("?")[0].split("#")[0];
  // strip leading ./ and /
  s = s.replace(/^\.?\/+/, "");
  return s.toLowerCase();
}

/** Decide whether an href should be intercepted. */
function isExternalLink(href: string): boolean {
  if (!href) return true;
  const h = href.trim().toLowerCase();
  return (
    h.startsWith("http://") ||
    h.startsWith("https://") ||
    h.startsWith("//") ||
    h.startsWith("mailto:") ||
    h.startsWith("tel:") ||
    h.startsWith("javascript:") ||
    h.startsWith("#")
  );
}

/**
 * Build an HTML preview for the entry file, inlining all project assets
 * and turning cross-page links into postMessage navigation events.
 */
export function buildMultiFilePreview(
  projectFiles: ProjectFile[],
  editedCode: Record<string, string>,
  entryFile: string,
  runId: number
): string {
  // Build the virtual FS: lowercased filename -> { content, lang, originalName }
  const fs: Record<string, { content: string; lang: string; originalName: string }> = {};
  for (const f of projectFiles) {
    if (!f.file_name) continue;
    const key = normalizePath(f.file_name);
    if (!key) continue;
    const code = editedCode[f.file_name] ?? ((f.correction_code ?? "").trim() || f.code_text);
    fs[key] = { content: code, lang: f.language, originalName: f.file_name };
  }

  // Resolve entry: prefer the requested file, else first HTML, else error message.
  const entryKey = normalizePath(entryFile);
  let chosenKey = entryKey;
  if (!fs[chosenKey] || fs[chosenKey].lang !== "html") {
    chosenKey = Object.keys(fs).find((k) => fs[k].lang === "html") || "";
  }
  if (!chosenKey) {
    return "<!doctype html><html><body style=\"font-family:system-ui;padding:24px;color:#64748b\"><p>No HTML file to preview.</p></body></html>";
  }

  return buildHtmlDoc(fs[chosenKey].content, fs, chosenKey, runId);
}

function buildHtmlDoc(
  htmlContent: string,
  fs: Record<string, { content: string; lang: string; originalName: string }>,
  currentPage: string,
  runId: number
): string {
  let processed = htmlContent;

  // ---- 1. Inline <link rel="stylesheet" href="..."> for project CSS -------
  processed = processed.replace(
    /<link\b([^>]*?)\bhref\s*=\s*(["'])([^"']+?)\2([^>]*?)\/?>/gi,
    (full, before, _q, href, after) => {
      const allAttrs = `${before} ${after}`;
      // Must be a stylesheet link
      if (!/\brel\s*=\s*["']?\s*stylesheet\s*["']?/i.test(allAttrs)) return full;
      if (isExternalLink(href)) return full;
      const key = normalizePath(href);
      const file = fs[key];
      if (file && file.lang === "css") {
        return `<style data-file="${escapeAttr(href)}">\n${file.content}\n</style>`;
      }
      return full;
    }
  );

  // ---- 2. Inline <script src="..."> for project JS ------------------------
  processed = processed.replace(
    /<script\b([^>]*?)\bsrc\s*=\s*(["'])([^"']+?)\2([^>]*?)>\s*<\/script>/gi,
    (full, _before, _q, src, _after) => {
      if (isExternalLink(src)) return full;
      const key = normalizePath(src);
      const file = fs[key];
      if (file && file.lang === "javascript") {
        return `<script data-file="${escapeAttr(src)}">\n${file.content}\n</script>`;
      }
      return full;
    }
  );

  // ---- 3. Tag <a href="..."> with a data-project-link attribute when it
  //         points at another project file. The global click handler
  //         (injected below) does the actual navigation, so we don't need
  //         brittle inline onclick handlers.
  processed = processed.replace(
    /<a\b([^>]*?)\bhref\s*=\s*(["'])([^"']+?)\2([^>]*)>/gi,
    (full, before, _q, href, after) => {
      if (isExternalLink(href)) return full;
      const key = normalizePath(href);
      // Mark every relative link, even unknown ones — the click handler will
      // either navigate or report a friendly "not in project" message.
      const known = fs[key] && fs[key].lang === "html" ? "1" : "0";
      // Sanitize: don't double-tag if already tagged
      if (/data-project-link\s*=/i.test(before + after)) return full;
      return `<a${before} href="${escapeAttr(href)}" data-project-link="${known}" data-project-target="${escapeAttr(href)}"${after}>`;
    }
  );

  // ---- 4. Build the bridge: console forwarding + click interceptor --------
  const bridge = `<script>
(function(){
  var RUN_ID=${runId};
  var send=function(t,m){try{window.parent.postMessage({source:"web-iframe",runId:RUN_ID,type:t,message:String(m)},"*")}catch(_){}};

  // ---- console forwarding ----
  var oL=console.log,oW=console.warn,oE=console.error;
  console.log=function(){var a=Array.prototype.slice.call(arguments).map(String).join(" ");send("log",a);oL.apply(console,arguments)};
  console.warn=function(){var a=Array.prototype.slice.call(arguments).map(String).join(" ");send("warn",a);oW.apply(console,arguments)};
  console.error=function(){var a=Array.prototype.slice.call(arguments).map(String).join(" ");send("error",a);oE.apply(console,arguments)};
  window.addEventListener("error",function(e){send("error",e.message||"Script error")});
  window.addEventListener("unhandledrejection",function(e){send("error",(e.reason&&e.reason.message)||String(e.reason))});

  // ---- known project files (lowercased keys) ----
  var FS_KEYS = ${JSON.stringify(Object.keys(fs).filter((k) => fs[k].lang === "html"))};
  var KNOWN = {}; for (var i=0;i<FS_KEYS.length;i++) KNOWN[FS_KEYS[i]]=1;

  function norm(p){
    if(!p) return "";
    var s=String(p).trim();
    s=s.split("?")[0].split("#")[0];
    while(s.charAt(0)==="."||s.charAt(0)==="/") s=s.substring(1);
    return s.toLowerCase();
  }

  // ---- click interceptor: catch ALL <a> clicks, even on dynamic links ----
  document.addEventListener("click", function(ev){
    // Find nearest <a>
    var el = ev.target;
    while (el && el.nodeName !== "A") el = el.parentNode;
    if (!el) return;
    var href = el.getAttribute("href") || "";
    if (!href) return;
    var lower = href.trim().toLowerCase();
    // External links: let them through (or open in a new tab in the parent)
    if (lower.indexOf("http://")===0 || lower.indexOf("https://")===0 || lower.indexOf("//")===0) return;
    if (lower.indexOf("mailto:")===0 || lower.indexOf("tel:")===0 || lower.indexOf("javascript:")===0) return;
    // Pure fragment: let browser handle
    if (lower.charAt(0) === "#") return;
    // Relative link → intercept
    ev.preventDefault();
    var target = norm(href);
    if (KNOWN[target]) {
      send("navigate", href);
    } else {
      send("warn", "Link points to '" + href + "' but that page is not in this project.");
    }
  }, true);

  // ---- form interceptor: stop submissions from leaving the iframe ----
  document.addEventListener("submit", function(ev){
    var f = ev.target;
    var action = (f && f.getAttribute && f.getAttribute("action")) || "";
    if (!action || action.charAt(0) === "#") {
      ev.preventDefault();
      send("log", "Form submission intercepted (no real backend in preview).");
    }
  }, true);
})();
</script>`;

  // Inject bridge as early as possible (before </head> if present, else before <body> close)
  if (/<\/head>/i.test(processed)) {
    processed = processed.replace(/<\/head>/i, bridge + "</head>");
  } else if (/<body[^>]*>/i.test(processed)) {
    processed = processed.replace(/<body([^>]*)>/i, `<body$1>${bridge}`);
  } else {
    processed = bridge + processed;
  }

  // Tag the preview with the current page so the parent can correlate logs
  processed = processed.replace(
    /<\/body>/i,
    `<script>document.documentElement.setAttribute("data-current-page",${JSON.stringify(currentPage)});</script></body>`
  );

  return processed;
}

function escapeAttr(s: string): string {
  return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

// ---------------------------------------------------------------------------
// useCodeRunner — runs JS in-process, sends Python/Java/C++ to Judge0.
// ---------------------------------------------------------------------------
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
          const stdin = await new Promise<string>((r) => onNeedInput(prompts, r));
          await runWithJudge0(codeToRun, cfg.judgeId, stdin);
          setIsRunning(false);
          return;
        }
      }
      await runWithJudge0(codeToRun, cfg.judgeId, "");
    } catch { setOutput("Online execution unavailable."); }
    finally { setIsRunning(false); }
  }, [onNeedInput]);

  const download = useCallback((code: string, _lang: Lang, fileName: string) => {
    if (!code?.trim()) return;
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), { href: url, download: fileName });
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  return { output, isRunning, activeLang, setActiveLang, runCode, ready, download };
}
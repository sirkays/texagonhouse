// app/teacher/submissions/[submissionId]/CodeRunner.ts
import {useEffect, useState} from "react";

export type Lang = "python" | "javascript" | "html" | "css" | "java" | "cpp";

export interface CodeFiles {
  python?: string;
  javascript?: string;
  html?: string;
  css?: string;
  java?: string;
  cpp?: string;
}

export const useCodeRunner = (initial: CodeFiles) => {
  const [files, setFiles] = useState<CodeFiles>(initial);
  const [activeLang, setActiveLang] = useState<Lang>("html");
  const [output, setOutput] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [pyodideReady, setPyodideReady] = useState(false);
  const [cheerpjReady, setCheerpjReady] = useState(false);
  const [emceptionReady, setEmceptionReady] = useState(false);
  const [pyodide, setPyodide] = useState<any>(null);

  // Load runtimes
  useEffect(() => {
    const pyScript = document.createElement("script");
    pyScript.src = "https://cdn.jsdelivr.net/pyodide/v0.26.1/full/pyodide.js";
    pyScript.onload = () => setPyodideReady(true);
    document.body.appendChild(pyScript);

    const cjScript = document.createElement("script");
    cjScript.src = "https://cjrtnc.leaningtech.com/4.0/loader.js";
    cjScript.onload = () => setCheerpjReady(true);
    document.body.appendChild(cjScript);

    const emScript = document.createElement("script");
    emScript.src = "https://emception.dev/emception.js";
    emScript.onload = () => setEmceptionReady(true);
    document.body.appendChild(emScript);

    return () => {
      [pyScript, cjScript, emScript].forEach((s) => {
        if (document.body.contains(s)) document.body.removeChild(s);
      });
    };
  }, []);

  const loadPyodide = async () => {
    if (!pyodide && pyodideReady) {
      // @ts-ignore
      const p = await window.loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.1/full/",
      });
      setPyodide(p);
      return p;
    }
    return pyodide;
  };

  // FULL PREVIEW: HTML + CSS + JS
  const renderWeb = () => {
    const html = files.html || "<body><h1>Hello World</h1></body>";
    const css = files.css ? `<style>${files.css}</style>` : "";
    const js = files.javascript ? `<script>${files.javascript}</script>` : "";
    return `<!DOCTYPE html><html><head>${css}</head>${html}${js}</html>`;
  };

  const run = async () => {
    setIsRunning(true);
    setOutput("");

    try {
      // HTML, CSS, JS → ALWAYS show full combined output
      if (["html", "css", "javascript"].includes(activeLang)) {
        setOutput(renderWeb());
      }
      // Python
      else if (activeLang === "python") {
        const py = await loadPyodide();
        if (!py) throw new Error("Pyodide not ready");
        const msgs: string[] = [];
        py.setStdout({batched: (m: string) => msgs.push(m)});
        py.setStderr({batched: (m: string) => msgs.push(`Error: ${m}`)});
        await py.runPythonAsync(files.python || "");
        setOutput(msgs.join("\n") || "No output");
      }
      // Java
      else if (activeLang === "java") {
        if (!cheerpjReady) throw new Error("CheerpJ not ready");
        await (window as any).cheerpjInit();
        const className =
          files.java?.match(/public\s+class\s+(\w+)/)?.[1] ?? "Main";
        (window as any).cheerpOSAddStringFile(
          `/str/${className}.java`,
          files.java!
        );
        const javac = await (window as any).cheerpjRunMain(
          "com.sun.tools.javac.Main",
          "/app/tools.jar",
          "-d",
          "/str/",
          `/str/${className}.java`
        );
        if (javac.exitCode !== 0) {
          setOutput(javac.stdErr || javac.stdOut);
        } else {
          const run = await (window as any).cheerpjRunMain(className, "/str/");
          setOutput(run.stdOut || run.stdErr);
        }
      }
      // C++
      else if (activeLang === "cpp") {
        if (!emceptionReady) throw new Error("Emception not ready");
        const Em = (window as any).Emception;
        const em = await Em.init();
        const msgs: string[] = [];
        const res = await em.run(
          `em++ input.cpp -o out.js -s MODULARIZE=1 -s EXPORT_NAME='createModule' -s ENVIRONMENT='web'`,
          {files: {"input.cpp": files.cpp!}}
        );
        if (res.returncode !== 0) {
          setOutput(res.stderr);
        } else {
          const js = res.files["out.js"];
          const factory = new Function(js + "; return createModule;")();
          const mod = await factory({
            print: (t: string) => msgs.push(t),
            printErr: (t: string) => msgs.push(`Error: ${t}`),
          });
          await mod.callMain();
          setOutput(msgs.join("\n"));
        }
      }
    } catch (e: any) {
      setOutput(`Error: ${e.message || e}`);
    } finally {
      setIsRunning(false);
    }
  };

  return {
    files,
    setFiles,
    activeLang,
    setActiveLang,
    output,
    isRunning,
    run,
    ready: {
      pyodide: pyodideReady,
      cheerpj: cheerpjReady,
      emception: emceptionReady,
    },
    renderWeb,
  };
};

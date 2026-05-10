// app/teacher/submissions/[submissionId]/code/page.tsx
"use client";
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useCodeRunner, buildMultiFilePreview, ProjectFile, Lang } from "../CodeRunner";
import { ArrowLeft, Download, FileCode2, Layers, ChevronRight, Play, RefreshCw, ArrowLeft as Back } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const LANG_ICON: Record<string, string> = {
  python: "text-blue-500", javascript: "text-amber-500", html: "text-orange-500",
  css: "text-purple-500", java: "text-red-500", cpp: "text-sky-500",
};

const monacoLang = (f: string) => {
  const e = f.split(".").pop()?.toLowerCase() || "";
  return ({ js: "javascript", py: "python", html: "html", css: "css", java: "java", cpp: "cpp" } as Record<string, string>)[e] || "plaintext";
};

const API_BASE = "/api/teacher/submissions";

interface SubmissionDetail {
  id: number;
  title?: string | null;
  status: string;
  student_name: string;
  lesson: { id: number; title: string };
  course: { id: number; name: string };
  classroom: { id: number; name: string };
  score?: string | null;
  feedback?: string;
  files?: ProjectFile[];
}

export default function CodePage() {
  const { submissionId } = useParams();
  const router = useRouter();
  const id = parseInt(submissionId as string, 10);

  const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeFileIdx, setActiveFileIdx] = useState(0);
  const [activeView, setActiveView] = useState<"code" | "output">("code");
  const [previewPage, setPreviewPage] = useState("");
  const [previewHistory, setPreviewHistory] = useState<string[]>([]);
  const [runKey, setRunKey] = useState(0);
  const [webConsole, setWebConsole] = useState("");

  // Python input modal (for read-only Run)
  const [showInputModal, setShowInputModal] = useState(false);
  const [inputPrompts, setInputPrompts] = useState<string[]>([]);
  const [inputValues, setInputValues] = useState<string[]>([]);
  const pendingStdinRef = useRef<((s: string) => void) | null>(null);

  const { output, isRunning, runCode, download } = useCodeRunner((prompts, resolve) => {
    pendingStdinRef.current = resolve;
    setInputPrompts(prompts);
    setInputValues(Array(prompts.length).fill(""));
    setShowInputModal(true);
  });

  // Fetch submission
  useEffect(() => {
    if (!id || Number.isNaN(id)) return;
    (async () => {
      setLoading(true); setError(null);
      try {
        const r = await fetch(`${API_BASE}/${id}/`);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        setSubmission(await r.json());
      } catch (e: any) {
        setError("Submission not found");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Build the project file list (same logic as grade page).
  const projectFiles = useMemo((): ProjectFile[] => {
    if (submission?.files?.length) return submission.files;
    return [];
  }, [submission]);

  // Read-only "edited" code is just the original code_text (no correction overlay
  // in the view-code page — that's what the grade page is for).
  const fileContent = useMemo(() => {
    const m: Record<string, string> = {};
    for (const f of projectFiles) m[f.path] = f.code_text;
    return m;
  }, [projectFiles]);

  // Pick first HTML as preview entry; reset whenever project changes
  useEffect(() => {
    if (!projectFiles.length) return;
    const html = projectFiles.find((f) => f.language === "html");
    setPreviewPage(html ? html.path : projectFiles[0].path);
    setPreviewHistory([]);
    setActiveFileIdx((idx) => Math.min(idx, projectFiles.length - 1));
  }, [projectFiles]);

  // Listen for iframe messages
  useEffect(() => {
    const h = (e: MessageEvent) => {
      const d = e.data;
      if (!d || d.source !== "web-iframe" || d.runId !== runKey) return;
      if (d.type === "navigate") {
        setPreviewHistory((p) => [...p, previewPage]);
        setPreviewPage(d.message);
        setRunKey((k) => k + 1);
        return;
      }
      const pfx = d.type === "error" ? "❌ " : d.type === "warn" ? "⚠ " : "";
      setWebConsole((p) => (p ? p + "\n" : "") + pfx + d.message);
    };
    window.addEventListener("message", h);
    return () => window.removeEventListener("message", h);
  }, [runKey, previewPage]);

  // Resolve upload labels in HTML
  const resolveUrls = useCallback(async (raw: string) => {
    const pat = /\/api\/code-ide\/uploads\/file\?label=([^\s"'`)>]+)/g;
    const ms = [...raw.matchAll(pat)];
    if (!ms.length) return raw;
    const labels = [...new Set(ms.map((m) => decodeURIComponent(m[1])))];
    const resolved = await Promise.all(labels.map(async (l) => {
      try {
        const r = await fetch(`/api/uploads/resolve/?label=${encodeURIComponent(l)}`);
        if (!r.ok) return { l, u: null as string | null };
        const d = await r.json();
        return { l, u: d.url as string };
      } catch { return { l, u: null as string | null }; }
    }));
    let res = raw;
    for (const { l, u } of resolved) {
      if (u) {
        res = res.split(`/api/code-ide/uploads/file?label=${encodeURIComponent(l)}`).join(u);
        res = res.split(`/api/code-ide/uploads/file?label=${l}`).join(u);
      }
    }
    return res;
  }, []);

  const [resolvedPreview, setResolvedPreview] = useState("");
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const raw = buildMultiFilePreview(projectFiles, fileContent, previewPage, runKey);
      const out = await resolveUrls(raw);
      if (!cancelled) setResolvedPreview(out);
    })();
    return () => { cancelled = true; };
  }, [runKey, fileContent, projectFiles, previewPage, resolveUrls]);

  const activeFile = projectFiles[activeFileIdx];
  const isWebProject = projectFiles.some((f) => f.language === "html");
  const htmlPages = projectFiles.filter((f) => f.language === "html");

  const handleRun = () => {
    setWebConsole("");
    setActiveView("output");
    setRunKey((k) => k + 1);
    if (activeFile && !["html", "css"].includes(activeFile.language)) {
      runCode(fileContent[activeFile.path] || "", activeFile.language as Lang);
    }
  };

  const handlePreviewBack = () => {
    setPreviewHistory((prev) => {
      if (!prev.length) return prev;
      const next = [...prev];
      const target = next.pop()!;
      setPreviewPage(target);
      setRunKey((k) => k + 1);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-transparent">
        <Spinner size="md" className="text-orange-500" />
      </div>
    );
  }
  if (error || !submission) {
    return <p className="text-red-500 text-center text-sm p-4">{error || "Submission not found"}</p>;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto w-full px-3 py-4 sm:px-5 sm:py-6 max-w-6xl">
        {/* Python Input Modal */}
        <Dialog open={showInputModal} onOpenChange={(v) => {
          if (!v) {
            setShowInputModal(false);
            pendingStdinRef.current?.("");
            pendingStdinRef.current = null;
          }
        }}>
          <DialogContent className="sm:max-w-md rounded-2xl border-slate-200 shadow-2xl p-0 overflow-hidden">
            <div className="px-6 pt-6 pb-4 bg-gradient-to-br from-[#EF7B55] to-[#F79771]">
              <DialogHeader>
                <DialogTitle className="text-white font-bold">Program Input</DialogTitle>
                <DialogDescription className="text-white/70 text-sm">
                  Provide values for <code className="text-white font-semibold">input()</code>
                </DialogDescription>
              </DialogHeader>
            </div>
            <div className="px-6 py-4 space-y-3">
              {inputPrompts.map((p, i) => (
                <div key={i} className="space-y-1">
                  <Label className="text-sm text-slate-700">{p || `Input ${i + 1}`}</Label>
                  <input
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg bg-slate-50 focus:ring-2 focus:ring-[#EF7B55]/40 focus:outline-none"
                    value={inputValues[i] ?? ""}
                    autoFocus={i === 0}
                    onChange={(e) => { const u = [...inputValues]; u[i] = e.target.value; setInputValues(u); }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && i === inputPrompts.length - 1) {
                        setShowInputModal(false);
                        pendingStdinRef.current?.(inputValues.join("\n"));
                        pendingStdinRef.current = null;
                      }
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="px-6 pb-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setShowInputModal(false);
                pendingStdinRef.current?.("");
                pendingStdinRef.current = null;
              }}>Cancel</Button>
              <Button className="bg-[#EF7B55] hover:bg-[#F79771] text-white" onClick={() => {
                setShowInputModal(false);
                pendingStdinRef.current?.(inputValues.join("\n"));
                pendingStdinRef.current = null;
              }}>Run</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Header */}
        <Button variant="ghost" onClick={() => router.back()} className="mb-3 text-[#EF7B55] hover:bg-[#EF7B55]/10 text-xs h-8">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />Back
        </Button>
        <h1 className="text-lg sm:text-xl font-bold text-slate-800 mb-1">View Code</h1>
        <p className="text-xs text-slate-500 mb-3">
          {submission.title || "Untitled"} • {submission.student_name}
        </p>

        {/* Submission info */}
        <div className="bg-gray-50 p-3 rounded-lg mb-4 text-xs text-slate-600 space-y-0.5">
          <p>
            <span className="font-medium text-slate-700">Lesson:</span> {submission.lesson?.title} •{" "}
            <span className="font-medium text-slate-700">Course:</span> {submission.course?.name}
            {submission.classroom?.name && (<> • <span className="font-medium text-slate-700">Class:</span> {submission.classroom.name}</>)}
          </p>
          <p>
            <span className="font-medium text-slate-700">Status:</span> {submission.status}
            {submission.score ? <> • <span className="font-medium text-slate-700">Score:</span> {submission.score}</> : null}
          </p>
        </div>

        {/* Tabs (file list) */}
        <div className="flex items-center gap-1 px-2 py-1.5 border border-slate-200 border-b-0 rounded-t-lg bg-slate-50/80 overflow-x-auto">
          <Layers className="w-3.5 h-3.5 text-slate-400 mr-1 shrink-0" />
          {projectFiles.map((f, i) => (
            <button
              key={f.id}
              onClick={() => { setActiveFileIdx(i); setActiveView("code"); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${activeFileIdx === i && activeView === "code"
                  ? "bg-[#EF7B55] text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                }`}
            >
              <FileCode2 className={`w-3.5 h-3.5 ${activeFileIdx === i && activeView === "code" ? "text-white" : LANG_ICON[f.language] || "text-slate-400"
                }`} />
              {f.path || `${f.language} file`}
            </button>
          ))}
          <button
            onClick={() => setActiveView("output")}
            className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${activeView === "output" ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:bg-slate-100"
              }`}
          >
            <ChevronRight className="w-3 h-3" />Output / Preview
          </button>
        </div>

        {/* Mobile select */}
        <select
          className="mb-3 w-full p-2 text-xs border border-[#EF7B55]/30 rounded-md focus:outline-none focus:ring-1 focus:ring-[#EF7B55]/50 md:hidden mt-2"
          value={activeView === "output" ? "__output__" : String(activeFileIdx)}
          onChange={(e) => {
            const v = e.target.value;
            if (v === "__output__") setActiveView("output");
            else { setActiveFileIdx(parseInt(v, 10)); setActiveView("code"); }
          }}
        >
          {projectFiles.map((f, i) => (<option key={f.id} value={i}>{f.path}</option>))}
          <option value="__output__">Output / Preview</option>
        </select>

        {/* Editor or Output */}
        {activeView === "code" && activeFile ? (
          <div className="border border-slate-200 rounded-b-lg overflow-hidden shadow-sm">
            <Editor
              height="55vh"
              language={monacoLang(activeFile.path)}
              value={fileContent[activeFile.path] ?? ""}
              options={{
                readOnly: true, theme: "vs-dark", minimap: { enabled: false },
                wordWrap: "on", fontSize: 12, padding: { top: 8, bottom: 8 },
                lineNumbers: "on", scrollBeyondLastLine: false, folding: false,
                glyphMargin: false, lineDecorationsWidth: 0, lineNumbersMinChars: 3,
              }}
            />
          </div>
        ) : (
          <div className="border border-slate-200 rounded-b-lg overflow-hidden shadow-sm bg-slate-900 flex flex-col min-h-[55vh]">
            {isWebProject ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 border-b border-slate-700">
                  <button onClick={handlePreviewBack} disabled={!previewHistory.length} className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30" title="Back">
                    <Back className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setRunKey((k) => k + 1)} className="p-1 rounded text-slate-400 hover:text-white" title="Refresh">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs text-slate-500 font-mono truncate flex-1">{previewPage || "No HTML"}</span>
                  {htmlPages.length > 1 && (
                    <select
                      value={previewPage}
                      onChange={(e) => {
                        setPreviewHistory((p) => [...p, previewPage]);
                        setPreviewPage(e.target.value);
                        setRunKey((k) => k + 1);
                      }}
                      className="text-xs bg-slate-700 text-slate-300 border-none rounded px-2 py-1 focus:outline-none"
                    >
                      {htmlPages.map((f) => (<option key={f.id} value={f.path}>{f.path}</option>))}
                    </select>
                  )}
                </div>
                <iframe
                  key={`${runKey}-${previewPage}`}
                  srcDoc={resolvedPreview}
                  sandbox="allow-scripts allow-same-origin allow-forms"
                  className="flex-1 w-full min-h-[40vh] bg-white"
                  title="Preview"
                />
                <pre className="p-3 text-xs font-mono text-slate-300 overflow-auto max-h-40 border-t border-slate-700">
                  {webConsole || "Console output appears here..."}
                </pre>
              </>
            ) : (
              <pre className="flex-1 p-4 font-mono text-sm text-emerald-400 overflow-auto">
                {output || "Click ▶ Run to execute"}
              </pre>
            )}
          </div>
        )}

        {/* Run / Download */}
        <div className="flex flex-col sm:flex-row gap-2 mt-3">
          <Button onClick={handleRun} disabled={isRunning} className="bg-slate-800 hover:bg-slate-700 text-white text-xs h-9 px-4">
            <Play className="w-3.5 h-3.5 mr-1" />
            {isRunning ? "Running…" : "Run"}
          </Button>
          {activeFile && (
            <Button
              onClick={() => download(fileContent[activeFile.path] || "", activeFile.language as Lang, activeFile.path)}
              variant="outline"
              className="text-xs h-9 px-4"
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              Download {activeFile.path}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
"use client";
import React, { useState, useEffect, useRef, useContext, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { SubmissionContext } from "../../layout";
import dynamic from "next/dynamic";
import { useCodeRunner, buildMultiFilePreview, ProjectFile, Lang } from "../CodeRunner";
import { ArrowLeft, Download, Send, Play, MessageSquare, FileCode2, ChevronRight, Layers, Award, ArrowLeft as Back, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const LANG_ICON: Record<string, string> = {
  python: "text-blue-500", javascript: "text-amber-500", html: "text-orange-500",
  css: "text-purple-500", java: "text-red-500", cpp: "text-sky-500",
};

const monacoLang = (f: string) => {
  const e = f.split(".").pop()?.toLowerCase() || "";
  return ({ js: "javascript", py: "python", html: "html", css: "css", java: "java", cpp: "cpp" } as Record<string, string>)[e] || "plaintext";
};

// Match the Next.js API route structure:
//   /api/teacher/code/submissions/[id]
//   /api/teacher/code/submissions/[id]/grade
//   /api/teacher/code/submissions/[id]/comments
const API_BASE = "/api/teacher/code/submissions";

interface SubmissionDetail {
  id: number;
  title?: string | null;
  language: string;
  code_text: string;
  file_name?: string;
  status: string;
  student_name: string;
  student_id: number;
  lesson: { id: number; title: string };
  course: { id: number; name: string };
  classroom: { id: number; name: string };
  score?: string | null;
  feedback?: string;
  correction_code?: string | null;
  comments: Array<{ id: number; created_at: string; author: number; author_role: string; author_name: string; message: string }>;
  all_project_files?: ProjectFile[];
}

export default function GradePage() {
  const { submissionId } = useParams();
  const router = useRouter();
  const id = parseInt(submissionId as string, 10);
  const { setSubmissions } = useContext(SubmissionContext);

  const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Python input modal
  const [showInputModal, setShowInputModal] = useState(false);
  const [inputPrompts, setInputPrompts] = useState<string[]>([]);
  const [inputValues, setInputValues] = useState<string[]>([]);
  const pendingStdinRef = useRef<((s: string) => void) | null>(null);

  // Grading
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [newComment, setNewComment] = useState("");

  // Editor / preview state
  const [activeFileIdx, setActiveFileIdx] = useState(0);
  const [activeView, setActiveView] = useState<"code" | "output">("code");
  const [webConsole, setWebConsole] = useState("");
  const [runKey, setRunKey] = useState(0);
  const [previewPage, setPreviewPage] = useState("");
  const [previewHistory, setPreviewHistory] = useState<string[]>([]);

  // Edited code per file_name
  const [editedCode, setEditedCode] = useState<Record<string, string>>({});

  // Build the project file list. Always prefer the backend's all_project_files;
  // fall back to a single-file project if only the legacy fields are present.
  const projectFiles = useMemo((): ProjectFile[] => {
    if (submission?.all_project_files?.length) return submission.all_project_files;
    if (!submission) return [];
    const ext = ({ javascript: "js", python: "py" } as Record<string, string>)[submission.language] || submission.language;
    return [{
      id: submission.id,
      language: submission.language,
      code_text: submission.code_text,
      correction_code: submission.correction_code ?? "",
      file_name: submission.file_name || `untitled.${ext}`,
    }];
  }, [submission]);

  // Initialize editedCode from project files whenever the project changes.
  // We start each file at its correction (if any) or its original code.
  useEffect(() => {
    if (!projectFiles.length) return;
    const map: Record<string, string> = {};
    for (const f of projectFiles) {
      const draft = (f.correction_code ?? "").trim();
      map[f.file_name] = draft || f.code_text;
    }
    setEditedCode(map);

    // Pick first HTML file as the default preview entry; else first file.
    const htmlFile = projectFiles.find((f) => f.language === "html");
    setPreviewPage(htmlFile ? htmlFile.file_name : (projectFiles[0]?.file_name ?? ""));
    setPreviewHistory([]);
    // Keep the active tab valid
    setActiveFileIdx((idx) => Math.min(idx, projectFiles.length - 1));
  }, [projectFiles]);

  const { output, isRunning, runCode, download } = useCodeRunner((prompts, resolve) => {
    pendingStdinRef.current = resolve;
    setInputPrompts(prompts);
    setInputValues(Array(prompts.length).fill(""));
    setShowInputModal(true);
  });

  // Fetch submission detail
  useEffect(() => {
    if (!id || Number.isNaN(id)) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const r = await fetch(`${API_BASE}/${id}/`);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        setSubmission(await r.json());
      } catch (e: any) {
        setError(e?.message ? `Could not load submission (${e.message})` : "Submission not found");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    if (submission) {
      setScore(submission.score ? parseInt(String(submission.score), 10) || 0 : 0);
      setFeedback(submission.feedback ?? "");
    }
  }, [submission]);

  // Listen for messages from the iframe (console + navigate)
  useEffect(() => {
    const h = (e: MessageEvent) => {
      const d = e.data;
      if (!d || d.source !== "web-iframe" || d.runId !== runKey) return;
      if (d.type === "navigate") {
        // Push the *current* page onto history so Back works
        setPreviewHistory((prev) => [...prev, previewPage]);
        setPreviewPage(d.message);
        // Force the iframe to re-render with the new entry page
        setRunKey((k) => k + 1);
        return;
      }
      const pfx = d.type === "error" ? "❌ " : d.type === "warn" ? "⚠ " : "";
      setWebConsole((p) => (p ? p + "\n" : "") + pfx + d.message);
    };
    window.addEventListener("message", h);
    return () => window.removeEventListener("message", h);
  }, [runKey, previewPage]);

  // Resolve any /api/code-ide/uploads/file?label=... references in the HTML
  // to absolute upload URLs so the iframe can actually load them.
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
      const raw = buildMultiFilePreview(projectFiles, editedCode, previewPage, runKey);
      const out = await resolveUrls(raw);
      if (!cancelled) setResolvedPreview(out);
    })();
    return () => { cancelled = true; };
  }, [runKey, editedCode, projectFiles, previewPage, resolveUrls]);

  const activeFile = projectFiles[activeFileIdx];
  const isWebProject = projectFiles.some((f) => f.language === "html");
  const isGraded = submission?.status === "graded";

  const handleRun = () => {
    setWebConsole("");
    setActiveView("output");
    setRunKey((k) => k + 1);
    if (activeFile && !["html", "css"].includes(activeFile.language)) {
      runCode(editedCode[activeFile.file_name] || activeFile.code_text, activeFile.language as Lang);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submission || isGraded) return;
    if (score < 0 || score > 100) { setError("Score must be 0–100"); return; }
    setSubmitting(true);
    setError(null);
    try {
      // Send corrections for all sibling files, keyed by submission id.
      // The "main" file gets `correction_code`; the rest go in `all_corrections`.
      const allCorr: Record<string, string> = {};
      for (const pf of projectFiles) {
        if (pf.id !== id) allCorr[String(pf.id)] = editedCode[pf.file_name] ?? "";
      }
      const mainFile = projectFiles.find((f) => f.id === id) || projectFiles[0];
      const body = {
        score,
        feedback,
        correction_code: editedCode[mainFile?.file_name ?? ""] ?? "",
        all_corrections: allCorr,
      };
      const r = await fetch(`${API_BASE}/${id}/grade/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) {
        let msg = "Failed to submit grade";
        try { const d = await r.json(); msg = d.detail || msg; } catch { /* ignore */ }
        throw new Error(msg);
      }
      const up = await r.json();
      setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, status: up.status, score: up.score } : s)));
      router.push("/teacher/submissions");
    } catch (e: any) {
      setError(e.message || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !submission) return;
    setCommenting(true);
    try {
      const r = await fetch(`${API_BASE}/${id}/comments/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newComment }),
      });
      if (!r.ok) throw new Error("Comment failed");
      setNewComment("");
      const fr = await fetch(`${API_BASE}/${id}/`);
      if (fr.ok) setSubmission(await fr.json());
    } catch {
      setError("Failed to add comment");
    } finally {
      setCommenting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="md" className="text-orange-500" />
      </div>
    );
  }
  if (error && !submission) return <p className="text-red-500 text-center p-8">{error}</p>;
  if (!submission) return null;

  const htmlPages = projectFiles.filter((f) => f.language === "html");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/20">
      <div className="mx-auto max-w-7xl px-4 py-5">
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
                    onChange={(e) => {
                      const u = [...inputValues];
                      u[i] = e.target.value;
                      setInputValues(u);
                    }}
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
        <div className="flex items-center gap-3 mb-5">
          <Button variant="ghost" onClick={() => router.back()} className="text-[#EF7B55] hover:bg-[#EF7B55]/10 h-9 px-3 rounded-lg text-xs">
            <ArrowLeft className="w-4 h-4 mr-1" />Back
          </Button>
          <div className="h-5 w-px bg-slate-200" />
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-slate-800 truncate">
              {submission.title || "Untitled"}{" "}
              <span className="text-sm font-normal text-slate-400">by {submission.student_name}</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {submission.lesson?.title} • {submission.course?.name}
              {submission.classroom?.name ? ` • ${submission.classroom.name}` : ""}
            </p>
          </div>
          <span className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${isGraded ? "bg-emerald-50 text-emerald-700" :
              submission.status === "revised" ? "bg-sky-50 text-sky-700" :
                "bg-amber-50 text-amber-700"
            }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isGraded ? "bg-emerald-500" : submission.status === "revised" ? "bg-sky-500" : "bg-amber-500"
              }`} />
            {submission.status}
          </span>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5">
          {/* IDE */}
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              {/* File tabs */}
              <div className="flex items-center gap-1 px-2 py-1.5 border-b border-slate-100 bg-slate-50/80 overflow-x-auto">
                <Layers className="w-3.5 h-3.5 text-slate-400 mr-1 shrink-0" />
                {projectFiles.map((f, i) => (
                  <button
                    key={f.id}
                    onClick={() => { setActiveFileIdx(i); setActiveView("code"); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${activeFileIdx === i && activeView === "code"
                        ? "bg-[#EF7B55] text-white shadow-sm"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                      }`}
                  >
                    <FileCode2 className={`w-3.5 h-3.5 ${activeFileIdx === i && activeView === "code" ? "text-white" : LANG_ICON[f.language] || "text-slate-400"
                      }`} />
                    {f.file_name || `${f.language} file`}
                  </button>
                ))}
                <button
                  onClick={() => setActiveView("output")}
                  className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${activeView === "output" ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:bg-slate-100"
                    }`}
                >
                  <ChevronRight className="w-3 h-3" />Output / Preview
                </button>
              </div>

              {/* Editor or Output */}
              {activeView === "code" && activeFile ? (
                <Editor
                  height="55vh"
                  language={monacoLang(activeFile.file_name)}
                  value={editedCode[activeFile.file_name] ?? ""}
                  onChange={(v) => setEditedCode((prev) => ({ ...prev, [activeFile.file_name]: v ?? "" }))}
                  options={{
                    readOnly: false, theme: "vs", minimap: { enabled: false },
                    wordWrap: "on", fontSize: 13, padding: { top: 12, bottom: 12 },
                    lineNumbers: "on", scrollBeyondLastLine: false, folding: true,
                    glyphMargin: false, lineDecorationsWidth: 0, lineNumbersMinChars: 3,
                  }}
                />
              ) : (
                <div className="min-h-[55vh] bg-slate-900 flex flex-col">
                  {isWebProject ? (
                    <>
                      {/* Preview navigation bar */}
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 border-b border-slate-700">
                        <button
                          onClick={handlePreviewBack}
                          disabled={!previewHistory.length}
                          className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30"
                          title="Back"
                        >
                          <Back className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setRunKey((k) => k + 1)}
                          className="p-1 rounded text-slate-400 hover:text-white"
                          title="Refresh"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs text-slate-500 font-mono truncate flex-1">{previewPage || "No HTML"}</span>
                        {/* Page selector */}
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
                            {htmlPages.map((f) => (<option key={f.id} value={f.file_name}>{f.file_name}</option>))}
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
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleRun} disabled={isRunning} className="bg-slate-800 hover:bg-slate-700 text-white h-10 px-5 rounded-xl text-sm font-medium">
                <Play className="w-4 h-4 mr-1.5" />{isRunning ? "Running…" : "Run"}
              </Button>
              {activeFile && (
                <Button
                  variant="outline"
                  onClick={() => download(editedCode[activeFile.file_name] || "", activeFile.language as Lang, activeFile.file_name)}
                  className="h-10 px-4 rounded-xl border-slate-200 text-slate-600 text-sm"
                >
                  <Download className="w-4 h-4 mr-1.5" />Download
                </Button>
              )}
            </div>
          </div>

          {/* Right Panel */}
          <div className="space-y-4">
            {/* Files Summary */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Project Files ({projectFiles.length})
              </h3>
              <div className="space-y-1.5">
                {projectFiles.map((f, i) => (
                  <button
                    key={f.id}
                    onClick={() => { setActiveFileIdx(i); setActiveView("code"); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all ${activeFileIdx === i && activeView === "code"
                        ? "bg-[#EF7B55]/10 border border-[#EF7B55]/20"
                        : "hover:bg-slate-50 border border-transparent"
                      }`}
                  >
                    <FileCode2 className={`w-4 h-4 shrink-0 ${LANG_ICON[f.language] || "text-slate-400"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{f.file_name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {(editedCode[f.file_name] || f.code_text).split("\n").length} lines • {f.language}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Score + Feedback + Submit */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-[#EF7B55]" />Score
                  </Label>
                  <div className="flex items-center gap-1">
                    <span className="text-2xl font-bold text-[#EF7B55]">{score}</span>
                    <span className="text-sm text-slate-400">/100</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Slider
                    min={0} max={100} step={1}
                    value={[score]}
                    onValueChange={(v) => { if (!isGraded) setScore(v[0]); }}
                    disabled={isGraded}
                    className="flex-1"
                  />
                  <input
                    type="number" value={score} min={0} max={100}
                    onChange={(e) => { if (!isGraded) setScore(Math.min(100, Math.max(0, parseInt(e.target.value) || 0))); }}
                    readOnly={isGraded}
                    className={`w-14 px-2 py-1.5 text-sm text-center border rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#EF7B55]/40 border-slate-200 ${isGraded ? "opacity-50 cursor-not-allowed" : ""}`}
                  />
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Feedback</Label>
                <Textarea
                  value={feedback}
                  onChange={(e) => { if (!isGraded) setFeedback(e.target.value); }}
                  readOnly={isGraded}
                  placeholder="Great work..."
                  className={`min-h-28 resize-none text-sm border-slate-200 bg-slate-50 focus:ring-2 focus:ring-[#EF7B55]/40 rounded-lg ${isGraded ? "opacity-50 cursor-not-allowed" : ""}`}
                />
              </div>
              <Button
                type="submit"
                disabled={submitting || isGraded}
                className={`w-full h-11 rounded-xl font-medium text-sm shadow-sm ${isGraded
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
                    : "bg-[#EF7B55] hover:bg-[#F79771] text-white shadow-[#EF7B55]/20"
                  }`}
              >
                <Send className="w-4 h-4 mr-2" />
                {submitting ? "Submitting..." : isGraded ? "Already Graded" : "Submit Grade"}
              </Button>
              {error && <p className="text-red-500 text-xs">{error}</p>}
            </form>

            {/* Comments */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
              <Label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-slate-400" />Comments ({submission.comments.length})
              </Label>
              {submission.comments.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {submission.comments.map((c) => (
                    <div key={c.id} className={`p-3 rounded-xl border text-sm ${c.author_role === "teacher" ? "bg-[#EF7B55]/5 border-[#EF7B55]/10" : "bg-slate-50 border-slate-100"
                      }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-slate-700 text-xs">{c.author_name}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${c.author_role === "teacher" ? "bg-[#EF7B55]/10 text-[#EF7B55]" : "bg-slate-200 text-slate-500"
                          }`}>{c.author_role}</span>
                      </div>
                      <p className="text-slate-600 text-xs leading-relaxed">{c.message}</p>
                      <p className="text-[10px] text-slate-400 mt-1.5">{new Date(c.created_at).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No comments yet.</p>
              )}
              <div className="flex gap-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 min-h-[70px] text-sm border-slate-200 bg-slate-50 rounded-lg"
                />
                <Button
                  type="button"
                  onClick={handleAddComment}
                  disabled={commenting || !newComment.trim()}
                  className="bg-[#EF7B55] hover:bg-[#F79771] text-white text-xs h-[70px] px-3 rounded-xl"
                >
                  {commenting ? "..." : "Send"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import React, { useContext, useMemo, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { SubmissionContext } from "../../layout";
import dynamic from "next/dynamic";
import { useCodeRunner, Lang } from "../CodeRunner";
import { ArrowLeft, Download, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSession } from "next-auth/react";

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

type Tab = Lang | "output";

const LANG_LABEL: Record<Lang, string> = {
  python: "Python",
  javascript: "JavaScript",
  html: "HTML",
  css: "CSS",
  java: "Java",
  cpp: "C++",
};

type AuthorRole = "teacher" | "student";

interface RelatedSubmissionMini {
  id: number;
  language: Lang;
  code_text: string;
  correction_code?: string | null;
  created_at: string;
  updated_at?: string; // optional (depends on serializer)
}

interface SubmissionDetail {
  id: number;
  language: Lang;
  code_text: string;
  status: string;
  student_name: string;
  student_id: string;
  lesson_title: string;
  course_name: string;
  class_name: string;
  score?: string | null;
  feedback?: string;
  correction_code?: string | null;
  comments: Array<{
    id: number;
    created_at: string;
    author: number;
    author_role: AuthorRole;
    author_name: string;
    message: string;
  }>;

  // ✅ backend should provide this (from your serializer method)
  latest_same_title_submission?: Partial<Record<Lang, RelatedSubmissionMini>> | null;
}



const pickCode = (s: { code_text?: string | null; correction_code?: string | null }) =>
  (s.correction_code ?? "").trim() || (s.code_text ?? "").trim();

const appendRelatedOnce = (
  existing: string,
  relatedId: number,
  relatedCode: string
) => {
  if (!relatedCode) return existing;

  const marker = `// --- related submission #${relatedId} ---`;

  // already appended → do nothing
  if ((existing || "").includes(marker)) return existing;

  if (!existing) {
    return `${marker}\n${relatedCode}`;
  }

  return `${existing}\n\n${marker}\n${relatedCode}`;
};
export default function GradePage() {
  const { submissionId } = useParams();
  const router = useRouter();
  const id = parseInt(submissionId as string, 10);
  const { data: session } = useSession();
  const { submissions, setSubmissions } = useContext(SubmissionContext);

  const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [runKey, setRunKey] = useState(0);
  const [webConsole, setWebConsole] = useState("");
  const [showInputModal, setShowInputModal] = useState(false);
  const [inputPrompts, setInputPrompts] = useState<string[]>([]);
  const [inputValues, setInputValues] = useState<string[]>([]);
  const pendingStdinRef = React.useRef<((stdin: string) => void) | null>(null);
  // Add with other state declarations
  const [resolvedPreview, setResolvedPreview] = useState("");

  // Add this helper inside GradePage (above handleRun)
  const resolveFileUrls = async (content: string): Promise<string> => {
    const pattern = /\/api\/code-ide\/uploads\/file\?label=([^\s"'`)>]+)/g;
    const matches = [...content.matchAll(pattern)];
    if (matches.length === 0) return content;

    const uniqueLabels = [...new Set(matches.map((m) => decodeURIComponent(m[1])))];
    console.log(uniqueLabels, " called..")
    const resolved = await Promise.all(
      uniqueLabels.map(async (label) => {
        try {
          // let server read cookies/session -> no client-side token
          // inside resolveFileUrls (client-side)
          const res = await fetch(
            `/api/code-ide/uploads/resolve?label=${encodeURIComponent(label)}`,
            { method: "GET", credentials: "same-origin" } // ensure cookies are sent
          );
          if (!res.ok) return { label, url: null };
          const data = await res.json();
          return { label, url: data.url as string };
        } catch {
          return { label, url: null };
        }
      })
    );

    let result = content;
    for (const { label, url } of resolved) {
      if (!url) continue;
      result = result.replaceAll(
        `/api/code-ide/uploads/file?label=${encodeURIComponent(label)}`,
        url
      );
      result = result.replaceAll(
        `/api/code-ide/uploads/file?label=${label}`,
        url
      );
    }
    return result;
  };


  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (!e.data || e.data.type !== "web-console") return;

      const level = e.data.level;
      const line = `[${level}] ${Array.isArray(e.data.args) ? e.data.args.join(" ") : ""}`;

      setWebConsole((prev) => (prev ? prev + "\n" + line : line));
    };

    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);


  const handleRun = () => {
    // lock immediately so second click does nothing until edit/tab switch
    setRunLocked(true);

    setWebConsole("");

    // always show output tab, even if output doesn't change
    setActiveTab("output");

    // make runner follow current tab
    if (activeTab !== "output") setActiveLang(activeTab as Lang);

    // for iframe rerun
    setRunKey((k) => k + 1);

    run();
  };



  useEffect(() => {
    const fetchSubmission = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/teacher/code/submissions/${id}`);
        if (!res.ok) throw new Error("Failed to fetch submission");
        const data = (await res.json()) as SubmissionDetail;
        setSubmission(data);

      } catch (err) {
        setError("Submission not found");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchSubmission();
  }, [id]);

  /**
   * Build Monaco/runner files:
   * - main submission goes in its language tab
   * - latest_same_title_submission (if exists) goes into its own language tab
   * - if same language, we append
   */
  const initialFiles = useMemo(() => {
    const empty: Record<Lang, string> = {
      python: "",
      javascript: "",
      html: "",
      css: "",
      java: "",
      cpp: "",
    };

    if (!submission) return empty;

    const merged = { ...empty };

    // main submission
    const mainLang = submission.language as Lang;
    const mainCode = pickCode(submission);
    if (mainCode) merged[mainLang] = mainCode;

    // ✅ latest per language
    const latestMap = submission.latest_same_title_submission || null;
    if (latestMap) {
      (Object.entries(latestMap) as Array<[Lang, RelatedSubmissionMini]>).forEach(
        ([lang, latest]) => {
          if (!latest) return;

          const latestCode = pickCode(latest);
          if (!latestCode) return;

          if (lang === mainLang) {
            // ✅ prevent duplication when latest === current submission
            if (latest.id !== submission.id) {
              merged[lang] = appendRelatedOnce(merged[lang], latest.id, latestCode);
            }
          } else {
            merged[lang] = latestCode;
          }
        }
      );
    }


    return merged;
  }, [submission]);

  const {
    files, setFiles, activeLang, setActiveLang,
    output, isRunning, run, ready, renderWeb, download,
  } = useCodeRunner(initialFiles, (prompts, resolve) => {
    // called by runner when input() is detected
    pendingStdinRef.current = resolve;
    setInputPrompts(prompts);
    setInputValues(Array(prompts.length).fill(""));
    setShowInputModal(true);
  });

  // Sync runner state when submission loads/changes
  useEffect(() => {
    if (submission) {
      setActiveLang(submission.language as any);
      setFiles(initialFiles);
    }
  }, [submission, initialFiles, setFiles, setActiveLang]);

  // --- MOVE the resolve preview effect HERE (unconditionally) ---
  useEffect(() => {
    const resolve = async () => {
      const raw = renderWeb();
      const resolved = await resolveFileUrls(raw);
      setResolvedPreview(resolved);
    };
    resolve();
  }, [runKey, files, renderWeb]);

  const [activeTab, setActiveTab] = useState<Tab>("html");

  const [score, setScore] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>("");
  const [newComment, setNewComment] = useState("");
  const [errors, setErrors] = useState<{ score?: string }>({});
  const [runLocked, setRunLocked] = useState(false);
  const lastTabRef = React.useRef<Tab>(activeTab);
  const lastCodeRef = React.useRef<string>("");
  useEffect(() => {
    if (activeTab === "output") return;

    const codeNow = files[activeTab as Lang] ?? "";

    // if code changed since we last remembered, unlock
    if (codeNow !== lastCodeRef.current) {
      setRunLocked(false);
      lastCodeRef.current = codeNow;
    }
  }, [files, activeTab]);
  useEffect(() => {
    if (activeTab !== lastTabRef.current) {
      setRunLocked(false);           // tab switch unlocks Run
      lastTabRef.current = activeTab;

      // update snapshot for new tab
      if (activeTab !== "output") {
        lastCodeRef.current = files[activeTab as Lang] ?? "";
      }
    }
  }, [activeTab, files]);

  // When submission arrives, hydrate UI state
  useEffect(() => {
    if (submission) {
      setActiveTab(submission.language as Tab);
      setScore(submission.score ? parseInt(submission.score) : 0);
      setFeedback(submission.feedback ?? "");
    }
  }, [submission]);

  useEffect(() => {
    if (!isRunning && output) setActiveTab("output");
  }, [isRunning, output]);

  const updateFile = (lang: Lang, value: string) => {
    setFiles((prev) => ({ ...prev, [lang]: value }));
    setActiveLang(lang);
  };

  const isLangDisabled = (lang: Lang) =>
    !files[lang] && lang !== "html" && lang !== "css" && lang !== "javascript";

  const validate = () => {
    const err: typeof errors = {};
    if (score < 0 || score > 100) err.score = "Score must be 0–100";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !submission) return;

    setSubmitting(true);
    setError(null);

    try {
      const body = {
        score: score,
        feedback,
        // save correction_code for the "main" language tab (same as your previous logic)
        correction_code: files[submission.language as Lang] ?? "",
      };

      const res = await fetch(`/api/teacher/code/submissions/${id}/grade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to submit grade");
      }

      const updatedData = await res.json();

      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
              ...s,
              status: updatedData.status,
              score: updatedData.score,
              feedback: updatedData.feedback,
            }
            : s
        )
      );

      router.push("/teacher/submissions");
    } catch (err: any) {
      setError(err.message || "Failed to submit grade");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !submission) return;

    setCommenting(true);
    setError(null);

    try {
      const res = await fetch(`/api/teacher/code/submissions/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newComment }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to add comment");
      }

      setNewComment("");

      // Refetch submission to update comments (and keep related submission in sync too)
      const fetchRes = await fetch(`/api/teacher/code/submissions/${id}`);
      if (fetchRes.ok) {
        const updated = (await fetchRes.json()) as SubmissionDetail;
        setSubmission(updated);
      }
    } catch (err: any) {
      setError(err.message || "Failed to add comment");
    } finally {
      setCommenting(false);
    }
  };


  // ✅ early returns AFTER all hooks
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-transparent">
        <Spinner size="md" className="text-orange-500" />
      </div>
    );
  }

  if (error || !submission) {
    return (
      <p className="text-red-500 text-center text-sm p-4">
        {error || "Submission not found"}
      </p>
    );
  }
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto w-full px-3 py-4 sm:px-5 sm:py-6 max-w-6xl">
        {/* Python Input Modal */}
        <Dialog open={showInputModal} onOpenChange={(v) => {
          if (!v) {
            // cancelled — resolve with empty so runner doesn't hang
            setShowInputModal(false);
            pendingStdinRef.current?.("");
            pendingStdinRef.current = null;
          }
        }}>
          <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
            <div className="px-7 pt-7 pb-5 bg-gradient-to-br from-[#1a1a2e] to-[#16213e]">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-white tracking-tight">
                  Program Input
                </DialogTitle>
                <DialogDescription className="text-sm text-white/50 mt-1">
                  Your code calls{" "}
                  <code className="text-[#EF7B55]">input()</code> — provide values before running
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="px-6 py-5 space-y-4 bg-white dark:bg-[#0f0f23]">
              {inputPrompts.map((prompt, i) => (
                <div key={i} className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {prompt || `Input ${i + 1}`}
                  </Label>
                  <input
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF7B55]/50"
                    placeholder={`Value for input ${i + 1}...`}
                    value={inputValues[i] ?? ""}
                    autoFocus={i === 0}
                    onChange={(e) => {
                      const updated = [...inputValues];
                      updated[i] = e.target.value;
                      setInputValues(updated);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && i === inputPrompts.length - 1) {
                        const stdin = inputValues.join("\n");
                        setShowInputModal(false);
                        pendingStdinRef.current?.(stdin);
                        pendingStdinRef.current = null;
                      }
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="px-6 pb-6 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowInputModal(false);
                  pendingStdinRef.current?.("");
                  pendingStdinRef.current = null;
                }}
              >
                Cancel
              </Button>
              <Button
                className="bg-[#EF7B55] hover:bg-[#F79771] text-white"
                onClick={() => {
                  const stdin = inputValues.join("\n");
                  setShowInputModal(false);
                  pendingStdinRef.current?.(stdin);
                  pendingStdinRef.current = null;
                }}
              >
                Run with inputs
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        {/* Back */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 text-[#EF7B55] hover:bg-[#EF7B55]/10 text-xs h-9">
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back
        </Button>

        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 mb-5">
          Grade Submission
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Score */}
          <div className="space-y-3">
            <Label htmlFor="score" className="text-sm font-semibold">
              Score <span className="text-[#EF7B55] font-bold">{score}</span>
              /100
            </Label>

            <div className="flex items-center gap-3">
              <Slider
                id="score"
                min={0}
                max={100}
                step={1}
                value={[score]}
                onValueChange={(v) => setScore(v[0])}
                className="flex-1"
              />

              <input
                type="number"
                value={score}
                onChange={(e) =>
                  setScore(
                    Math.min(100, Math.max(0, parseInt(e.target.value) || 0))
                  )
                }
                className={`w-16 px-2 py-1.5 text-sm text-center border rounded-md focus:outline-none focus:ring-2 focus:ring-[#EF7B55]/50 ${errors.score ? "border-red-500" : "border-[#EF7B55]/30"
                  }`}
                min="0"
                max="100"
              />
            </div>

            {errors.score && (
              <p className="text-red-500 text-xs mt-1">{errors.score}</p>
            )}
          </div>

          {/* Feedback */}
          <div className="space-y-2">
            <Label htmlFor="feedback" className="text-sm font-semibold">
              Feedback
            </Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Great logic, but add error handling..."
              className="min-h-32 resize-none text-sm focus:ring-2 focus:ring-[#EF7B55]/50"
            />
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-1 mb-3 border-b border-[#EF7B55]/20 text-xs sm:text-sm">
            {Object.entries(LANG_LABEL).map(([k, l]) => {
              const lang = k as Lang;
              const disabled = isLangDisabled(lang);
              return (
                <button
                  key={lang}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    setActiveTab(lang);
                    setActiveLang(lang);
                  }}
                  className={`px-3 py-1.5 rounded-t-md transition text-xs sm:text-sm ${activeTab === lang
                    ? "bg-[#EF7B55] text-white"
                    : disabled
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-50 hover:bg-[#EF7B55]/10 text-slate-700"
                    }`}
                >
                  {l}
                </button>
              );
            })}


            <button
              type="button"
              onClick={() => setActiveTab("output")}
              className={`px-3 py-1.5 rounded-t-md transition text-xs sm:text-sm ml-1 ${activeTab === "output"
                ? "bg-[#EF7B55] text-white"
                : "bg-gray-50 hover:bg-[#EF7B55]/10 text-slate-700"
                }`}>
              Output
            </button>
          </div>

          {/* Mobile Select */}
          <select
            className="mb-4 w-full p-2.5 text-sm border border-[#EF7B55]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF7B55]/50 md:hidden"
            value={activeTab}
            onChange={(e) => {
              const t = e.target.value as Tab;
              setActiveTab(t);
              if (t !== "output") setActiveLang(t as Lang);
            }}
          >
            {Object.entries(LANG_LABEL).map(([k, l]) => (
              <option key={k} value={k} disabled={isLangDisabled(k as Lang)}>
                {l}
              </option>
            ))}
            <option value="output">Output</option>
          </select>

          {/* Editor / Output */}
          {activeTab !== "output" ? (
            <div className="border border-[#EF7B55]/20 rounded-xl overflow-hidden shadow-sm">
              <Editor
                height="50dvh"
                language={activeTab}
                value={files[activeTab] ?? ""}
                onChange={(v) => updateFile(activeTab as Lang, v ?? "")}
                options={{
                  readOnly: false,
                  theme: "vs-dark",
                  minimap: { enabled: false },
                  wordWrap: "on",
                  fontSize: 13,
                  padding: { top: 12, bottom: 12 },
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  folding: false,
                  glyphMargin: false,
                  lineDecorationsWidth: 0,
                  lineNumbersMinChars: 3,
                }}
              />
            </div>
          ) : (
            <div className="mt-3 border border-[#EF7B55]/20 rounded-xl overflow-hidden shadow-sm">
              {["html", "css", "javascript"].includes(activeLang) ? (
                <>
                  <iframe
                    key={runKey}
                    srcDoc={resolvedPreview || renderWeb()}
                    sandbox="allow-scripts allow-same-origin"
                    className="w-full h-64 sm:h-80 md:h-96"
                    title="Web Preview"
                  />

                  <pre className="bg-slate-900 text-slate-100 p-3 mt-2 rounded-lg overflow-auto max-h-48 font-mono text-xs sm:text-sm">
                    {webConsole || "Console output will appear here..."}
                  </pre>
                </>
              ) : (
                <pre className="bg-slate-900 text-green-400 p-3 sm:p-4 rounded-lg overflow-auto h-64 sm:h-80 md:h-96 font-mono text-xs sm:text-sm">
                  {output || "Click Run to see output"}
                </pre>
              )}
            </div>

          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 mt-6 sm:flex-row">
            {activeTab !== "output" && activeTab !== "css" && activeTab !== "javascript" && (
              <Button
                type="button"
                onClick={handleRun}
                disabled={
                  runLocked ||
                  isRunning ||
                  !ready[
                  activeTab === "python"
                    ? "pyodide"
                    : activeTab === "java"
                      ? "cheerpj"
                      : "emception"
                  ]
                }
              >
                {isRunning ? "Running…" : "Run "}
              </Button>
            )}


            <Button
              type="button"
              onClick={download}
              variant="outline"
              className="w-full sm:w-auto text-sm h-11 px-5">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>

            {/* ✅ Submit Grade button now same color as Run */}
            <Button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto bg-[#EF7B55] hover:bg-[#EF7B55]/90 text-white font-medium text-sm h-11 px-5">
              <Send className="w-4 h-4 mr-2" />
              {submitting ? "Submitting..." : "Submit Grade"}
            </Button>
          </div>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </form>

        {/* Comments Section */}
        <div className="mt-8 space-y-4">
          <Label className="text-sm font-semibold">Comments</Label>

          {submission.comments.length > 0 ? (
            <div className="space-y-3">
              {submission.comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-slate-700">
                    {comment.author_name} ({comment.author_role})
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    {comment.message}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(comment.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No comments yet.</p>
          )}

          <div className="flex gap-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 min-h-[80px] text-sm focus:ring-2 focus:ring-[#EF7B55]/50"
            />

            <Button
              type="button"
              onClick={handleAddComment}
              disabled={commenting || !newComment.trim()}
              className="bg-[#EF7B55] hover:bg-[#EF7B55]/90 text-white text-sm h-[80px] px-4">
              {commenting ? "Adding..." : "Add Comment"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

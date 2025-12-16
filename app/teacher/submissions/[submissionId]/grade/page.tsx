"use client";

import React, { useContext, useMemo, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { SubmissionContext } from "../../layout";
import dynamic from "next/dynamic";
import { useCodeRunner, Lang } from "../CodeRunner";
import { ArrowLeft, Download, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
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
interface SubmissionDetail {
  id: number;
  language: Lang;
  code_text: string;
  status: string;
  student_name: string;
  lesson_title: string;
  course_name: string;
  class_name: string;
  score?: string | null;
  feedback?: string;
  correction_code?: string;
  comments: Array<{
    id: number;
    created_at: string;
    author: number;
    author_role: "teacher" | "student";
    author_name: string;
    message: string;
  }>;
}
export default function GradePage() {
  const { submissionId } = useParams();
  const router = useRouter();
  const id = parseInt(submissionId as string, 10);
  const { submissions, setSubmissions } = useContext(SubmissionContext);
  const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialSubmission = submissions.find((s) => s.id === id);
  useEffect(() => {
    const fetchSubmission = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/teacher/code/submissions/${id}`);
        if (!res.ok) throw new Error("Failed to fetch submission");
        const data = await res.json();
        setSubmission(data);
      } catch (err) {
        setError("Submission not found");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchSubmission();
  }, [id]);
  const initialFiles = useMemo(() => {
    const empty = {
      python: "",
      javascript: "",
      html: "",
      css: "",
      java: "",
      cpp: "",
    };
    if (!submission) return empty;
    const key = submission.language as Lang;
    return {
      ...empty,
      [key]: submission.correction_code ?? submission.code_text,
    };
  }, [submission]);
  const {
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
  } = useCodeRunner(initialFiles);

  // Sync runner state when submission loads
  useEffect(() => {
    console.log("[GradePage] useEffect triggered. Submission:", !!submission);
    console.log("[GradePage] initialFiles:", initialFiles);
    if (submission) {
      console.log("[GradePage] Calling setFiles with initialFiles");
      setFiles(initialFiles);
    }
  }, [submission, initialFiles, setFiles]);

  const [activeTab, setActiveTab] = useState<Tab>(
    (submission?.language as Lang) ?? "html"
  );
  const [score, setScore] = useState<number>(
    submission?.score ? parseInt(submission.score) : 0
  );
  const [feedback, setFeedback] = useState<string>(submission?.feedback ?? "");
  const [newComment, setNewComment] = useState("");
  const [errors, setErrors] = useState<{ score?: string }>({});
  useEffect(() => {
    if (!isRunning && output) setActiveTab("output");
  }, [isRunning, output]);
  useEffect(() => {
    if (submission) {
      setActiveTab(submission.language as Tab);
    }
  }, [submission]);
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
        score: score * 10, // Scale to 0-1000 as per API
        feedback,
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
      // Refetch submission to update comments
      const fetchRes = await fetch(`/api/teacher/code/submissions/${id}`);
      if (fetchRes.ok) {
        const updatedData = await fetchRes.json();
        setSubmission(updatedData);
      }
    } catch (err: any) {
      setError(err.message || "Failed to add comment");
    } finally {
      setCommenting(false);
    }
  };
  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-transparent">
        <Spinner size="md" className="text-orange-500" />
      </div>
    );
  if (error || !submission)
    return (
      <p className="text-red-500 text-center text-sm p-4">
        {error || "Submission not found"}
      </p>
    );
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto w-full px-3 py-4 sm:px-5 sm:py-6 max-w-6xl">
        {/* Back */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 text-[#EF7B55] hover:bg-[#EF7B55]/10 text-xs h-9"
        >
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
                  onClick={() => setActiveTab(lang)}
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
                }`}
            >
              Output
            </button>
          </div>
          {/* Mobile Select */}
          <select
            className="mb-4 w-full p-2.5 text-sm border border-[#EF7B55]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF7B55]/50 md:hidden"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as Tab)}
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
                <iframe
                  srcDoc={output || renderWeb()}
                  sandbox="allow-scripts"
                  className="w-full h-64 sm:h-80 md:h-96"
                  title="Web Preview"
                />
              ) : (
                <pre className="bg-slate-900 text-green-400 p-3 sm:p-4 rounded-lg overflow-auto h-64 sm:h-80 md:h-96 font-mono text-xs sm:text-sm">
                  {output || "Click Run to see output"}
                </pre>
              )}
            </div>
          )}
          {/* Action Buttons */}
          <div className="flex flex-col gap-3 mt-6 sm:flex-row">
            {activeTab !== "output" && (
              <Button
                type="button"
                onClick={run}
                disabled={
                  isRunning ||
                  !ready[
                  activeTab === "python"
                    ? "pyodide"
                    : activeTab === "java"
                      ? "cheerpj"
                      : "emception"
                  ]
                }
                className="order-1 w-full sm:w-auto bg-[#EF7B55] hover:bg-[#EF7B55]/90 text-white font-medium text-sm h-11 px-5"
              >
                {isRunning ? "Running…" : "Run Correction"}
              </Button>
            )}
            <Button
              type="button"
              onClick={download}
              variant="outline"
              className="w-full sm:w-auto text-sm h-11 px-5"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-medium text-sm h-11 px-5"
            >
              <Send className="w-4 h-4 mr-2" />
              {submitting ? "Submitting..." : "Submit Grade"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/teacher/submissions")}
              className="w-full sm:w-auto border-red-500/30 text-red-600 hover:bg-red-50 font-medium text-sm h-11 px-5"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
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
              className="bg-[#EF7B55] hover:bg-[#EF7B55]/90 text-white text-sm h-[80px] px-4"
            >
              {commenting ? "Adding..." : "Add Comment"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

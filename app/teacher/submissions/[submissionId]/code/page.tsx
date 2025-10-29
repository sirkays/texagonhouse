// app/teacher/submissions/[submissionId]/code/page.tsx
"use client";

import React, { useContext, useMemo, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { SubmissionContext } from "../../layout";
import dynamic from "next/dynamic";
import { useCodeRunner } from "../CodeRunner"; // correct import
import { ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

type Tab = "python" | "javascript" | "html" | "css" | "java" | "cpp" | "output";

const LANG_LABEL: Record<Exclude<Tab, "output">, string> = {
  python: "Python",
  javascript: "JavaScript",
  html: "HTML",
  css: "CSS",
  java: "Java",
  cpp: "C++",
};

export default function CodePage() {
  const { submissionId } = useParams();
  const router = useRouter();
  const id = parseInt(submissionId as string, 10);
  const { submissions } = useContext(SubmissionContext);
  const submission = submissions.find((s) => s.id === id);

  const initialFiles = useMemo(() => {
    const empty = { python: "", javascript: "", html: "", css: "", java: "", cpp: "" };
    if (!submission) return empty;
    const key = submission.language as keyof typeof empty;
    return { ...empty, [key]: submission.code_text };
  }, [submission]);

  const {
    files,
    activeLang,
    output,
    isRunning,
    run,
    renderWeb,
    download,
  } = useCodeRunner(initialFiles);

  const [activeTab, setActiveTab] = useState<Tab>((submission?.language as Tab) ?? "html");

  // auto-switch to output when execution finishes
  useEffect(() => {
    if (!isRunning && output) setActiveTab("output");
  }, [isRunning, output]);

  const isLangDisabled = (lang: Exclude<Tab, "output">) =>
    !files[lang] && lang !== "html" && lang !== "css" && lang !== "javascript";

  if (!submission)
    return <p className="text-red-500 text-center text-sm p-4">Submission not found</p>;

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto w-full px-3 py-4 sm:px-5 sm:py-6 max-w-6xl">
        {/* Back */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-3 text-[#EF7B55] hover:bg-[#EF7B55]/10 text-xs h-8"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back
        </Button>

        <h1 className="text-lg sm:text-xl font-bold text-slate-800 mb-3">View Code</h1>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 mb-2 border-b border-[#EF7B55]/20 text-xs">
          {Object.entries(LANG_LABEL).map(([k, l]) => {
            const lang = k as Exclude<Tab, "output">;
            const disabled = isLangDisabled(lang);
            return (
              <button
                key={lang}
                type="button"
                disabled={disabled}
                onClick={() => setActiveTab(lang)}
                className={`px-2 py-1 rounded-t-md text-xs transition ${
                  activeTab === lang
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
            className={`px-2 py-1 rounded-t-md text-xs transition ml-1 ${
              activeTab === "output"
                ? "bg-[#EF7B55] text-white"
                : "bg-gray-50 hover:bg-[#EF7B55]/10 text-slate-700"
            }`}
          >
            Output
          </button>
        </div>

        {/* Mobile select */}
        <select
          className="mb-3 w-full p-2 text-xs border border-[#EF7B55]/30 rounded-md focus:outline-none focus:ring-1 focus:ring-[#EF7B55]/50 md:hidden"
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value as Tab)}
        >
          {Object.entries(LANG_LABEL).map(([k, l]) => (
            <option key={k} value={k} disabled={isLangDisabled(k as any)}>
              {l}
            </option>
          ))}
          <option value="output">Output</option>
        </select>

        {/* Editor / Output */}
        {activeTab !== "output" ? (
          <div className="border border-[#EF7B55]/20 rounded-lg overflow-hidden shadow-sm">
            <Editor
              height="50dvh"
              language={activeTab}
              value={files[activeTab] ?? ""}
              options={{
                // **READ-ONLY** – this is a *view* page
                readOnly: true,
                theme: "vs-dark",
                minimap: { enabled: false },
                wordWrap: "on",
                fontSize: 12,
                padding: { top: 8, bottom: 8 },
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
          <div className="mt-2 border border-[#EF7B55]/20 rounded-lg overflow-hidden shadow-sm">
            {["html", "css", "javascript"].includes(activeLang) ? (
              <iframe
                srcDoc={output || renderWeb()}
                sandbox="allow-scripts"
                className="w-full h-64 sm:h-80"
                title="Web Preview"
              />
            ) : (
              <pre className="bg-slate-900 text-green-400 p-2.5 rounded-lg overflow-auto h-64 sm:h-80 font-mono text-xs">
                {output || "Click Run to see output"}
              </pre>
            )}
          </div>
        )}

        {/* Run & Download */}
        <div className="flex flex-col sm:flex-row gap-2 mt-3">
          {activeTab !== "output" && (
            <Button
              onClick={run}
              disabled={isRunning}
              className="w-full sm:w-auto bg-[#EF7B55] hover:bg-[#EF7B55]/90 text-white text-xs h-9 px-4"
            >
              {isRunning ? "Running…" : "Run Code"}
            </Button>
          )}
          <Button
            onClick={download}
            variant="outline"
            className="w-full sm:w-auto text-xs h-9 px-4"
          >
            <Download className="w-3.5 h-3.5 mr-1" />
            Download
          </Button>
        </div>
      </div>
    </div>
  );
}
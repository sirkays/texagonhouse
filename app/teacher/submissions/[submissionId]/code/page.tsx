"use client";

import React, {useContext, useMemo, useState} from "react";
import {useParams, useRouter} from "next/navigation"; // 🆕 import useRouter
import {SubmissionContext} from "../../layout";
import dynamic from "next/dynamic";
import {useCodeRunner, Lang} from "../CodeRunner";
import {ArrowLeft} from "lucide-react";

const Editor = dynamic(() => import("@monaco-editor/react"), {ssr: false});

type Tab = Lang | "output";

const LANG_LABEL: Record<Lang, string> = {
  python: "Python",
  javascript: "JavaScript",
  html: "HTML",
  css: "CSS",
  java: "Java",
  cpp: "C++",
};

export default function CodePage() {
  const {submissionId} = useParams();
  const router = useRouter(); // 🆕 initialize router
  const id = parseInt(submissionId as string, 10);
  const {submissions} = useContext(SubmissionContext);
  const submission = submissions.find((s) => s.id === id);

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
    return {...empty, [key]: submission.code_text};
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
  } = useCodeRunner(initialFiles);

  const [activeTab, setActiveTab] = useState<Tab>(
    (submission?.language as Lang) ?? "html"
  );

  const updateFile = (lang: Lang, value: string) => {
    setFiles((prev) => ({...prev, [lang]: value}));
    setActiveLang(lang);
  };

  const isLangDisabled = (lang: Lang) =>
    !files[lang] && lang !== "html" && lang !== "css" && lang !== "javascript";

  if (!submission)
    return <p className="text-red-500 p-4">Submission not found</p>;

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* 🆕 Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center  gap-3 mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition">
        <ArrowLeft className="w-5 h-5" /> {/* 🆕 Lucide back arrow */}
        <span>Back</span>
      </button>

      <h1 className="text-2xl font-bold mb-6">View Submitted Code</h1>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-4 border-b border-gray-300">
        {Object.entries(LANG_LABEL).map(([k, l]) => {
          const lang = k as Lang;
          const disabled = isLangDisabled(lang);
          return (
            <button
              key={lang}
              type="button"
              disabled={disabled}
              onClick={() => setActiveTab(lang)}
              className={`px-4 py-2 text-sm font-medium rounded-t-md transition ${
                activeTab === lang
                  ? "bg-blue-600 text-white"
                  : disabled
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}>
              {l}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setActiveTab("output")}
          className={`px-4 py-2 text-sm font-medium rounded-t-md transition ml-2 ${
            activeTab === "output"
              ? "bg-green-600 text-white"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          }`}>
          Output
        </button>
      </div>

      {/* Mobile Dropdown */}
      <select
        className="md:hidden mb-4 w-full p-3 border rounded-lg"
        value={activeTab}
        onChange={(e) => setActiveTab(e.target.value as Tab)}>
        {Object.entries(LANG_LABEL).map(([k, l]) => (
          <option key={k} value={k} disabled={isLangDisabled(k as Lang)}>
            {l}
          </option>
        ))}
        <option value="output">Output</option>
      </select>

      {/* Editor / Output */}
      {activeTab !== "output" ? (
        <div className="mb-4">
          <Editor
            height="60vh"
            language={activeTab}
            value={files[activeTab] ?? ""}
            onChange={(v) => updateFile(activeTab as Lang, v ?? "")}
            options={{
              readOnly: true,
              theme: "vs-dark",
              minimap: {enabled: true},
              wordWrap: "on",
              fontSize: 14,
            }}
          />
        </div>
      ) : (
        <div className="mt-4">
          {["html", "css", "javascript"].includes(activeLang) ? (
            <iframe
              srcDoc={output || renderWeb()}
              sandbox="allow-scripts"
              className="w-full h-96 border rounded-lg"
              title="Full Web Preview"
            />
          ) : (
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto h-96 font-mono text-sm">
              {output || "No output yet."}
            </pre>
          )}
        </div>
      )}

      {/* Run Button */}
      {activeTab !== "output" && (
        <button
          onClick={run}
          disabled={
            isRunning ||
            (activeTab === "python" && !ready.pyodide) ||
            (activeTab === "java" && !ready.cheerpj) ||
            (activeTab === "cpp" && !ready.emception)
          }
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 transition">
          {isRunning ? "Running..." : "Run"}
        </button>
      )}
    </div>
  );
}

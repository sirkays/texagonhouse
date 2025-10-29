// // // app/teacher/submissions/[submissionId]/grade/page.tsx
// // "use client";

// // import React, {useContext, useMemo, useState} from "react";
// // import {useParams, useRouter} from "next/navigation";
// // import {SubmissionContext} from "../../layout";
// // import dynamic from "next/dynamic";
// // import {useCodeRunner, Lang} from "../CodeRunner";

// // const Editor = dynamic(() => import("@monaco-editor/react"), {ssr: false});

// // type Tab = Lang | "output";

// // const LANG_LABEL: Record<Lang, string> = {
// //   python: "Python",
// //   javascript: "JavaScript",
// //   html: "HTML",
// //   css: "CSS",
// //   java: "Java",
// //   cpp: "C++",
// // };

// // export default function GradePage() {
// //   const {submissionId} = useParams();
// //   const router = useRouter();
// //   const id = parseInt(submissionId as string, 10);
// //   const {submissions, setSubmissions} = useContext(SubmissionContext);
// //   const submission = submissions.find((s) => s.id === id);

// //   const initialFiles = useMemo(() => {
// //     const empty = {
// //       python: "",
// //       javascript: "",
// //       html: "",
// //       css: "",
// //       java: "",
// //       cpp: "",
// //     };
// //     if (!submission) return empty;
// //     const key = submission.language as Lang;
// //     return {
// //       ...empty,
// //       [key]: submission.correction_code ?? submission.code_text,
// //     };
// //   }, [submission]);

// //   const {
// //     files,
// //     setFiles,
// //     activeLang,
// //     setActiveLang,
// //     output,
// //     isRunning,
// //     run,
// //     ready,
// //     renderWeb,
// //   } = useCodeRunner(initialFiles);

// //   const [activeTab, setActiveTab] = useState<Tab>(
// //     (submission?.language as Lang) ?? "html"
// //   );
// //   const [score, setScore] = useState(submission?.score?.toString() ?? "");
// //   const [feedback, setFeedback] = useState(submission?.feedback ?? "");

// //   const updateFile = (lang: Lang, value: string) => {
// //     setFiles((prev) => ({...prev, [lang]: value}));
// //     setActiveLang(lang);
// //   };

// //   const isLangDisabled = (lang: Lang) =>
// //     !files[lang] && lang !== "html" && lang !== "css" && lang !== "javascript";

// //   const handleSubmit = (e: React.FormEvent) => {
// //     e.preventDefault();
// //     if (!submission) return;
// //     const updated = {
// //       ...submission,
// //       score: parseFloat(score) || 0,
// //       feedback,
// //       correction_code: files[submission.language as Lang] ?? "",
// //       status: "graded" as const,
// //     };
// //     setSubmissions((prev) => prev.map((s) => (s.id === id ? updated : s)));
// //     router.push("/teacher/submissions");
// //   };

// //   if (!submission)
// //     return <p className="text-red-500 p-4">Submission not found</p>;

// //   return (
// //     <div className="container mx-auto p-4 max-w-6xl">
// //       <h1 className="text-2xl font-bold mb-6">Grade Submission</h1>

// //       <form onSubmit={handleSubmit} className="space-y-6">
// //         {/* Score & Feedback */}
// //         <div className="grid md:grid-cols-2 gap-6">
// //           <div>
// //             <label className="block font-semibold mb-2 text-gray-700">
// //               Score
// //             </label>
// //             <input
// //               type="number"
// //               value={score}
// //               onChange={(e) => setScore(e.target.value)}
// //               className="border rounded-lg w-full p-3 focus:ring-2 focus:ring-blue-500"
// //               required
// //               min="0"
// //               max="100"
// //             />
// //           </div>
// //           <div>
// //             <label className="block font-semibold mb-2 text-gray-700">
// //               Feedback
// //             </label>
// //             <textarea
// //               value={feedback}
// //               onChange={(e) => setFeedback(e.target.value)}
// //               className="border rounded-lg w-full p-3 h-28 focus:ring-2 focus:ring-blue-500 resize-none"
// //               placeholder="Provide detailed feedback..."
// //             />
// //           </div>
// //         </div>

// //         {/* Tabs */}
// //         <div className="flex flex-wrap gap-1 mb-4 border-b border-gray-300">
// //           {Object.entries(LANG_LABEL).map(([k, l]) => {
// //             const lang = k as Lang;
// //             const disabled = isLangDisabled(lang);
// //             return (
// //               <button
// //                 key={lang}
// //                 type="button"
// //                 disabled={disabled}
// //                 onClick={() => setActiveTab(lang)}
// //                 className={`px-4 py-2 text-sm font-medium rounded-t-md transition ${
// //                   activeTab === lang
// //                     ? "bg-blue-600 text-white"
// //                     : disabled
// //                     ? "bg-gray-200 text-gray-400 cursor-not-allowed"
// //                     : "bg-gray-100 hover:bg-gray-200 text-gray-700"
// //                 }`}>
// //                 {l}
// //               </button>
// //             );
// //           })}
// //           <button
// //             type="button"
// //             onClick={() => setActiveTab("output")}
// //             className={`px-4 py-2 text-sm font-medium rounded-t-md transition ml-2 ${
// //               activeTab === "output"
// //                 ? "bg-green-600 text-white"
// //                 : "bg-gray-100 hover:bg-gray-200 text-gray-700"
// //             }`}>
// //             Output
// //           </button>
// //         </div>

// //         {/* Mobile Dropdown */}
// //         <select
// //           className="md:hidden mb-4 w-full p-3 border rounded-lg"
// //           value={activeTab}
// //           onChange={(e) => setActiveTab(e.target.value as Tab)}>
// //           {Object.entries(LANG_LABEL).map(([k, l]) => (
// //             <option key={k} value={k} disabled={isLangDisabled(k as Lang)}>
// //               {l}
// //             </option>
// //           ))}
// //           <option value="output">Output</option>
// //         </select>

// //         {/* Editor / Output */}
// //         {activeTab !== "output" ? (
// //           <Editor
// //             height="50vh"
// //             language={activeTab}
// //             value={files[activeTab] ?? ""}
// //             onChange={(v) => updateFile(activeTab as Lang, v ?? "")}
// //             options={{
// //               readOnly: false,
// //               theme: "vs-dark",
// //               minimap: {enabled: true},
// //               wordWrap: "on",
// //               fontSize: 14,
// //             }}
// //           />
// //         ) : (
// //           <div className="mt-4">
// //             {["html", "css", "javascript"].includes(activeLang) ? (
// //               <iframe
// //                 srcDoc={output || renderWeb()}
// //                 sandbox="allow-scripts"
// //                 className="w-full h-80 border rounded-lg"
// //                 title="Full Web Preview"
// //               />
// //             ) : (
// //               <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto h-80 font-mono text-sm">
// //                 {output || "No output yet."}
// //               </pre>
// //             )}
// //           </div>
// //         )}

// //         {/* Run & Submit */}
// //         <div className="flex flex-wrap gap-3 mt-6">
// //           {activeTab !== "output" && (
// //             <button
// //               type="button"
// //               onClick={run}
// //               disabled={
// //                 isRunning ||
// //                 (activeTab === "python" && !ready.pyodide) ||
// //                 (activeTab === "java" && !ready.cheerpj) ||
// //                 (activeTab === "cpp" && !ready.emception)
// //               }
// //               className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 transition">
// //               {isRunning ? "Running..." : "Run Correction"}
// //             </button>
// //           )}
// //           <button
// //             type="submit"
// //             className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition">
// //             Submit Grade
// //           </button>
// //           <button
// //             type="button"
// //             onClick={() => router.push("/teacher/submissions")}
// //             className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition">
// //             Cancel
// //           </button>
// //         </div>
// //       </form>
// //     </div>
// //   );
// // }

// // app/teacher/submissions/[submissionId]/grade/page.tsx
// "use client";

// import React, {useContext, useMemo, useState} from "react";
// import {useParams, useRouter} from "next/navigation";
// import {SubmissionContext} from "../../layout";
// import dynamic from "next/dynamic";
// import {useCodeRunner, Lang} from "../CodeRunner";
// import {ArrowLeft} from "lucide-react";

// const Editor = dynamic(() => import("@monaco-editor/react"), {ssr: false});

// type Tab = Lang | "output";

// const LANG_LABEL: Record<Lang, string> = {
//   python: "Python",
//   javascript: "JavaScript",
//   html: "HTML",
//   css: "CSS",
//   java: "Java",
//   cpp: "C++",
// };

// export default function GradePage() {
//   const {submissionId} = useParams();
//   const router = useRouter();
//   const id = parseInt(submissionId as string, 10);
//   const {submissions, setSubmissions} = useContext(SubmissionContext);
//   const submission = submissions.find((s) => s.id === id);

//   // -------------------------------------------------
//   // 1. Initialise files (submitted code + correction)
//   // -------------------------------------------------
//   const initialFiles = useMemo(() => {
//     const empty = {
//       python: "",
//       javascript: "",
//       html: "",
//       css: "",
//       java: "",
//       cpp: "",
//     };
//     if (!submission) return empty;
//     const key = submission.language as Lang;
//     return {
//       ...empty,
//       [key]: submission.correction_code ?? submission.code_text,
//     };
//   }, [submission]);

//   const {
//     files,
//     setFiles,
//     activeLang,
//     setActiveLang,
//     output,
//     isRunning,
//     run,
//     ready,
//     renderWeb,
//   } = useCodeRunner(initialFiles);

//   const [activeTab, setActiveTab] = useState<Tab>(
//     (submission?.language as Lang) ?? "html"
//   );
//   const [score, setScore] = useState<string>(
//     submission?.score?.toString() ?? ""
//   );
//   const [feedback, setFeedback] = useState<string>(submission?.feedback ?? "");

//   // -------------------------------------------------
//   // 2. Helper – update a file and keep active language
//   // -------------------------------------------------
//   const updateFile = (lang: Lang, value: string) => {
//     setFiles((prev) => ({...prev, [lang]: value}));
//     setActiveLang(lang);
//   };

//   // -------------------------------------------------
//   // 3. Helper – is a language tab disabled?
//   // -------------------------------------------------
//   const isLangDisabled = (lang: Lang) =>
//     !files[lang] && lang !== "html" && lang !== "css" && lang !== "javascript";

//   // -------------------------------------------------
//   // 4. Submit grade
//   // -------------------------------------------------
//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!submission) return;

//     const updated = {
//       ...submission,
//       score: parseFloat(score) || 0,
//       feedback,
//       correction_code: files[submission.language as Lang] ?? "",
//       status: "graded" as const, // <-- literal type
//     };

//     // Type-safe updater – TS now knows the shape is correct
//     setSubmissions((prev) => prev.map((s) => (s.id === id ? updated : s)));

//     router.push("/teacher/submissions");
//   };

//   if (!submission)
//     return <p className="text-red-500 p-4">Submission not found</p>;

//   // -------------------------------------------------
//   // 5. UI
//   // -------------------------------------------------
//   return (
//     <div className="container mx-auto p-4 max-w-6xl">
//       {/* 🆕 Back Button */}
//       <button
//         onClick={() => router.back()}
//         className="flex items-center  gap-3 mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition">
//         <ArrowLeft className="w-5 h-5" /> {/* 🆕 Lucide back arrow */}
//         <span>Back</span>
//       </button>

//       <h1 className="text-2xl font-bold mb-6">Grade Submission</h1>

//       <form onSubmit={handleSubmit} className="space-y-6">
//         {/* ----- Score & Feedback ----- */}
//         <div className="grid md:grid-cols-2 gap-6">
//           <div>
//             <label className="block font-semibold mb-2 text-gray-700">
//               Score
//             </label>
//             <input
//               type="number"
//               value={score}
//               onChange={(e) => setScore(e.target.value)}
//               className="border rounded-lg w-full p-3 focus:ring-2 focus:ring-blue-500"
//               required
//               min="0"
//               max="100"
//             />
//           </div>
//           <div>
//             <label className="block font-semibold mb-2 text-gray-700">
//               Feedback
//             </label>
//             <textarea
//               value={feedback}
//               onChange={(e) => setFeedback(e.target.value)}
//               className="border rounded-lg w-full p-3 h-28 focus:ring-2 focus:ring-blue-500 resize-none"
//               placeholder="Provide detailed feedback..."
//             />
//           </div>
//         </div>

//         {/* ----- Language + Output tabs ----- */}
//         <div className="flex flex-wrap gap-1 mb-4 border-b border-gray-300">
//           {Object.entries(LANG_LABEL).map(([k, l]) => {
//             const lang = k as Lang;
//             const disabled = isLangDisabled(lang);
//             return (
//               <button
//                 key={lang}
//                 type="button"
//                 disabled={disabled}
//                 onClick={() => setActiveTab(lang)}
//                 className={`px-4 py-2 text-sm font-medium rounded-t-md transition ${
//                   activeTab === lang
//                     ? "bg-blue-600 text-white"
//                     : disabled
//                     ? "bg-gray-200 text-gray-400 cursor-not-allowed"
//                     : "bg-gray-100 hover:bg-gray-200 text-gray-700"
//                 }`}>
//                 {l}
//               </button>
//             );
//           })}

//           <button
//             type="button"
//             onClick={() => setActiveTab("output")}
//             className={`px-4 py-2 text-sm font-medium rounded-t-md transition ml-2 ${
//               activeTab === "output"
//                 ? "bg-green-600 text-white"
//                 : "bg-gray-100 hover:bg-gray-200 text-gray-700"
//             }`}>
//             Output
//           </button>
//         </div>

//         {/* ----- Mobile dropdown ----- */}
//         <select
//           className="md:hidden mb-4 w-full p-3 border rounded-lg"
//           value={activeTab}
//           onChange={(e) => setActiveTab(e.target.value as Tab)}>
//           {Object.entries(LANG_LABEL).map(([k, l]) => (
//             <option key={k} value={k} disabled={isLangDisabled(k as Lang)}>
//               {l}
//             </option>
//           ))}
//           <option value="output">Output</option>
//         </select>

//         {/* ----- Editor / Output ----- */}
//         {activeTab !== "output" ? (
//           <Editor
//             height="50vh"
//             language={activeTab}
//             value={files[activeTab] ?? ""}
//             onChange={(v) => updateFile(activeTab as Lang, v ?? "")}
//             options={{
//               readOnly: false,
//               theme: "vs-dark",
//               minimap: {enabled: true},
//               wordWrap: "on",
//               fontSize: 14,
//             }}
//           />
//         ) : (
//           <div className="mt-4">
//             {["html", "css", "javascript"].includes(activeLang) ? (
//               <iframe
//                 srcDoc={output || renderWeb()}
//                 sandbox="allow-scripts"
//                 className="w-full h-80 border rounded-lg"
//                 title="Full Web Preview"
//               />
//             ) : (
//               <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto h-80 font-mono text-sm">
//                 {output || "No output yet."}
//               </pre>
//             )}
//           </div>
//         )}

//         {/* ----- Run / Submit buttons ----- */}
//         <div className="flex flex-wrap gap-3 mt-6">
//           {activeTab !== "output" && (
//             <button
//               type="button"
//               onClick={run}
//               disabled={
//                 isRunning ||
//                 (activeTab === "python" && !ready.pyodide) ||
//                 (activeTab === "java" && !ready.cheerpj) ||
//                 (activeTab === "cpp" && !ready.emception)
//               }
//               className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 transition">
//               {isRunning ? "Running…" : "Run Correction"}
//             </button>
//           )}

//           <button
//             type="submit"
//             className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition">
//             Submit Grade
//           </button>

//           <button
//             type="button"
//             onClick={() => router.push("/teacher/submissions")}
//             className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition">
//             Cancel
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }

// app/teacher/submissions/[submissionId]/grade/page.tsx
// app/teacher/submissions/[submissionId]/grade/page.tsx
"use client";

import React, { useContext, useMemo, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { SubmissionContext } from "../../layout";
import dynamic from "next/dynamic";
import { useCodeRunner, Lang } from "../CodeRunner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

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

export default function GradePage() {
  const { submissionId } = useParams();
  const router = useRouter();
  const id = parseInt(submissionId as string, 10);
  const { submissions, setSubmissions } = useContext(SubmissionContext);
  const submission = submissions.find((s) => s.id === id);

  const initialFiles = useMemo(() => {
    const empty = { python: "", javascript: "", html: "", css: "", java: "", cpp: "" };
    if (!submission) return empty;
    const key = submission.language as Lang;
    return { ...empty, [key]: submission.correction_code ?? submission.code_text };
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

  const [activeTab, setActiveTab] = useState<Tab>((submission?.language as Lang) ?? "html");
  const [score, setScore] = useState<string>(submission?.score?.toString() ?? "");
  const [feedback, setFeedback] = useState<string>(submission?.feedback ?? "");

  useEffect(() => {
    if (!isRunning && output) setActiveTab("output");
  }, [isRunning, output]);

  const updateFile = (lang: Lang, value: string) => {
    setFiles((prev) => ({ ...prev, [lang]: value }));
    setActiveLang(lang);
  };

  const isLangDisabled = (lang: Lang) =>
    !files[lang] && lang !== "html" && lang !== "css" && lang !== "javascript";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submission) return;

    const updated = {
      ...submission,
      score: parseFloat(score) || 0,
      feedback,
      correction_code: files[submission.language as Lang] ?? "",
      status: "graded" as const,
    };

    setSubmissions((prev) => prev.map((s) => (s.id === id ? updated : s)));
    router.push("/teacher/submissions");
  };

  if (!submission)
    return <p className="text-red-500 text-center text-sm p-4">Submission not found</p>;

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto w-full px-3 py-4 sm:px-5 sm:py-6 max-w-6xl">
        {/* Back */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-3 text-[#EF7B55] hover:bg-[#EF7B55]/10 text-xs sm:text-sm h-8"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back
        </Button>

        <h1 className="text-lg sm:text-xl font-bold text-slate-800 mb-3">Grade Submission</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Score & Feedback */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Score</label>
              <input
                type="number"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm border border-[#EF7B55]/30 rounded-md focus:outline-none focus:ring-1 focus:ring-[#EF7B55]/50"
                required
                min="0"
                max="100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Feedback</label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm border border-[#EF7B55]/30 rounded-md h-20 resize-none focus:outline-none focus:ring-1 focus:ring-[#EF7B55]/50"
                placeholder="Provide feedback..."
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-1 mb-2 border-b border-[#EF7B55]/20 text-xs">
            {Object.entries(LANG_LABEL).map(([k, l]) => {
              const lang = k as Lang;
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

          {/* Mobile Select */}
          <select
            className="mb-3 w-full p-2 text-xs border border-[#EF7B55]/30 rounded-md focus:outline-none focus:ring-1 focus:ring-[#EF7B55]/50 md:hidden"
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
            <div className="border border-[#EF7B55]/20 rounded-lg overflow-hidden shadow-sm">
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
                  {output || "No output yet. Click Run to see results."}
                </pre>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 mt-3 sm:flex-row">
            {activeTab !== "output" && (
              <Button
                type="button"
                onClick={run}
                disabled={
                  isRunning ||
                  (activeTab === "python" && !ready.pyodide) ||
                  (activeTab === "java" && !ready.cheerpj) ||
                  (activeTab === "cpp" && !ready.emception)
                }
                className="w-full sm:w-auto bg-[#EF7B55] hover:bg-[#EF7B55]/90 text-white text-xs h-9 px-4"
              >
                {isRunning ? "Running…" : "Run Correction"}
              </Button>
            )}

            <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white text-xs h-9 px-4">
              Submit Grade
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/teacher/submissions")}
              className="w-full sm:w-auto border-red-500/30 text-red-600 hover:bg-red-50 text-xs h-9 px-4"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
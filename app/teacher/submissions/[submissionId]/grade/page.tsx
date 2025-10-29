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
"use client";

import React, {useContext, useMemo, useState} from "react";
import {useParams, useRouter} from "next/navigation";
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

export default function GradePage() {
  const {submissionId} = useParams();
  const router = useRouter();
  const id = parseInt(submissionId as string, 10);
  const {submissions, setSubmissions} = useContext(SubmissionContext);
  const submission = submissions.find((s) => s.id === id);

  // -------------------------------------------------
  // 1. Initialise files (submitted + correction)
  // -------------------------------------------------
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
  } = useCodeRunner(initialFiles);

  const [activeTab, setActiveTab] = useState<Tab>(
    (submission?.language as Lang) ?? "html"
  );
  const [score, setScore] = useState<string>(
    submission?.score?.toString() ?? ""
  );
  const [feedback, setFeedback] = useState<string>(submission?.feedback ?? "");

  // -------------------------------------------------
  // 2. Update file + keep active language
  // -------------------------------------------------
  const updateFile = (lang: Lang, value: string) => {
    setFiles((prev) => ({...prev, [lang]: value}));
    setActiveLang(lang);
  };

  // -------------------------------------------------
  // 3. Disable empty language tabs
  // -------------------------------------------------
  const isLangDisabled = (lang: Lang) =>
    !files[lang] && lang !== "html" && lang !== "css" && lang !== "javascript";

  // -------------------------------------------------
  // 4. Submit grade – type-safe
  // -------------------------------------------------
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submission) return;

    const updated = {
      ...submission,
      score: parseFloat(score) || 0,
      feedback,
      correction_code: files[submission.language as Lang] ?? "",
      status: "graded" as const, // <-- matches Submission["status"]
    };

    setSubmissions((prev) => prev.map((s) => (s.id === id ? updated : s)));

    router.push("/teacher/submissions");
  };

  if (!submission)
    return <p className="text-red-500 p-4">Submission not found</p>;

  // -------------------------------------------------
  // 5. UI
  // -------------------------------------------------
  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-3 mb-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition">
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>

      <h1 className="text-2xl font-bold mb-6">Grade Submission</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Score & Feedback */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block font-semibold mb-2 text-gray-700">
              Score
            </label>
            <input
              type="number"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="border rounded-lg w-full p-3 focus:ring-2 focus:ring-blue-500"
              required
              min="0"
              max="100"
            />
          </div>
          <div>
            <label className="block font-semibold mb-2 text-gray-700">
              Feedback
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="border rounded-lg w-full p-3 h-28 focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Provide detailed feedback..."
            />
          </div>
        </div>

        {/* Language + Output Tabs */}
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
          <Editor
            height="50vh"
            language={activeTab}
            value={files[activeTab] ?? ""}
            onChange={(v) => updateFile(activeTab as Lang, v ?? "")}
            options={{
              readOnly: false,
              theme: "vs-dark",
              minimap: {enabled: true},
              wordWrap: "on",
              fontSize: 14,
            }}
          />
        ) : (
          <div className="mt-4">
            {["html", "css", "javascript"].includes(activeLang) ? (
              <iframe
                srcDoc={output || renderWeb()}
                sandbox="allow-scripts"
                className="w-full h-80 border rounded-lg"
                title="Full Web Preview"
              />
            ) : (
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto h-80 font-mono text-sm">
                {output || "No output yet. Click Run to see results."}
              </pre>
            )}
          </div>
        )}

        {/* Run & Submit Buttons */}
        <div className="flex flex-wrap gap-3 mt-6">
          {activeTab !== "output" && (
            <button
              type="button"
              onClick={run}
              disabled={
                isRunning ||
                (activeTab === "python" && !ready.pyodide) ||
                (activeTab === "java" && !ready.cheerpj) ||
                (activeTab === "cpp" && !ready.emception)
              }
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 transition">
              {isRunning ? "Running…" : "Run Correction"}
            </button>
          )}

          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition">
            Submit Grade
          </button>

          <button
            type="button"
            onClick={() => router.push("/teacher/submissions")}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

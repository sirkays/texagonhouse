"use client";

import React, { useState } from "react";

type UploadResult = {
  rows_processed?: number;
  users_created?: number;
  parents_created?: number;
  students_created?: number;
  teachers_created?: number;
  courses_created?: number;
  errors?: any[];
};

export default function ImportUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const downloadTemplate = async () => {
    try {
      setError(null);
      const res = await fetch("/api/admin/import/template", {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Template download failed: ${res.status} ${txt}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "parent_student_template.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to download template");
    }
  };

  const handleFileChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setResult(null);
    setError(null);
    setFile(ev.target.files?.[0] ?? null);
  };

  const doUpload = async () => {
    if (!file) {
      setError("Please select a CSV file first.");
      return;
    }
    setLoading(true);
    setProgress(0);
    setError(null);
    setResult(null);

    try {
      const form = new FormData();
      form.append("file", file);

      // We don't have a direct progress with fetch in browsers without XHR,
      // so we show an indeterminate progress then a quick update.
      setProgress(25);

      const res = await fetch("/api/admin/import/upload", {
        method: "POST",
        credentials: "include", // forward cookies (session)
        body: form,
      });

      setProgress(80);

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Upload failed: ${res.status} ${text}`);
      }

      const json = await res.json();
      setResult(json);
      setProgress(100);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Upload failed");
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(null), 800);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Bulk Create Parents & Students (CSV)</h2>

      <p className="text-sm text-slate-600 mb-4">
        Download the CSV template, fill it and upload. Each row should represent a single student and the parent details.
      </p>

      <div className="flex gap-3 mb-4">
        <button
          type="button"
          onClick={downloadTemplate}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Download CSV Template
        </button>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <span className="px-3 py-2 border rounded">{file ? file.name : "Choose CSV file"}</span>
        </label>

        <button
          onClick={doUpload}
          disabled={loading}
          className={`px-4 py-2 rounded ${loading ? "bg-gray-400 text-white" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}
        >
          {loading ? "Uploading..." : "Upload CSV"}
        </button>
      </div>

      {progress !== null && (
        <div className="mb-4">
          <div className="w-full bg-slate-100 h-2 rounded overflow-hidden">
            <div
              className="h-2 rounded bg-emerald-500 transition-all"
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
        </div>
      )}

      {error && <div className="text-red-600 mb-4">{error}</div>}

      {result && (
        <div className="bg-slate-50 p-4 rounded border">
          <h3 className="font-medium mb-2">Import summary</h3>
          <ul className="text-sm space-y-1">
            <li>Rows processed: {result.rows_processed ?? "—"}</li>
            <li>Users created: {result.users_created ?? 0}</li>
            <li>Parents created: {result.parents_created ?? 0}</li>
            <li>Students created: {result.students_created ?? 0}</li>
            <li>Teachers created: {result.teachers_created ?? 0}</li>
            <li>Courses created: {result.courses_created ?? 0}</li>
            <li>Errors: {(result.errors && result.errors.length) || 0}</li>
          </ul>

          {result.errors && result.errors.length > 0 && (
            <details className="mt-3">
              <summary className="cursor-pointer text-sm text-amber-700">Show row errors</summary>
              <pre className="text-xs mt-2 max-h-48 overflow-auto bg-white p-2 border rounded text-red-700">
                {JSON.stringify(result.errors, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
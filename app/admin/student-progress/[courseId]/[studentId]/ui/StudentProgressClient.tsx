// app/teacher/student-progress/[courseId]/[studentId]/ui/StudentProgressClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react"; // Added icon for cleaner mobile look

type Metrics = {
  course: { id: number; name: string };
  student: { id: number; name: string; email: string };
  season: null | { name: string; start_at: string; end_at: string };
  targets: {
    cbt_required_count: number;
    code_required_count: number;
    cbt_required_pass_mark: number;
    code_required_pass_mark: number;
  };
  cbt: {
    attempts_submitted: number;
    tests_taken_distinct: number;
    earned_marks: string; // decimal-as-string from backend
    marks_progress_pct: number;
  };
  code: {
    submissions_total: number;
    submissions_submitted: number;
    submissions_graded: number;
    earned_marks: string; // decimal-as-string from backend
    marks_progress_pct: number;
  };
};

function fmtDate(d?: string | null) {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function safeNum(v: any): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function clampPct(p: any): number {
  const n = safeNum(p);
  if (n < 0) return 0;
  if (n > 100) return 100;
  return Math.round(n);
}

export default function StudentProgressClient({
  courseId,
  studentId,
}: {
  courseId: number;
  studentId: number;
}) {
  const [data, setData] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch(
        `/api/courses/${courseId}/students/${studentId}/activity-metrics/`,
        { method: "GET", cache: "no-store" }
      );
      const text = await res.text();
      const json = text ? JSON.parse(text) : null;

      if (!res.ok) throw new Error(json?.detail ?? "Failed to load metrics");
      setData(json as Metrics);
    } catch (e: any) {
      setErr(e?.message ?? "Error");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, studentId]);

  const derived = useMemo(() => {
    if (!data) return null;

    const cbtEarned = safeNum(data.cbt.earned_marks);
    const codeEarned = safeNum(data.code.earned_marks);

    const cbtReqCount = safeNum(data.targets.cbt_required_count);
    const codeReqCount = safeNum(data.targets.code_required_count);

    const cbtReqMark = safeNum(data.targets.cbt_required_pass_mark);
    const codeReqMark = safeNum(data.targets.code_required_pass_mark);

    const cbtCountPct =
      cbtReqCount > 0
        ? clampPct((data.cbt.tests_taken_distinct / cbtReqCount) * 100)
        : 0;
    const codeCountPct =
      codeReqCount > 0
        ? clampPct((data.code.submissions_total / codeReqCount) * 100)
        : 0;

    return {
      cbtEarned,
      codeEarned,
      cbtReqCount,
      codeReqCount,
      cbtReqMark,
      codeReqMark,
      cbtCountPct,
      codeCountPct,
      cbtMarksPct: clampPct(data.cbt.marks_progress_pct),
      codeMarksPct: clampPct(data.code.marks_progress_pct),
    };
  }, [data]);

  return (
    // 'px-2' for tiny screens to maximize width usage
    <div className="space-y-4 px-2 sm:px-0 w-full overflow-hidden">
      {/* HEADER: Flex-col on mobile ensures the button doesn't squash the text */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold text-slate-800 break-words">
            Student Progress
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Activity & Performance Targets
          </p>

          {data ? (
            <div className="mt-3 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="font-medium break-words">{data.student.name}</div>
              {/* break-all is CRITICAL for emails on 200px screens */}
              <div className="text-slate-500 break-all">
                {data.student.email}
              </div>
              <div className="text-slate-500 mt-1 break-words">
                Course: {data.course.name}
              </div>

              {data.season ? (
                <div className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-200">
                  <div>
                    Season:{" "}
                    <span className="font-medium text-slate-700">
                      {data.season.name}
                    </span>
                  </div>
                  <div className="mt-0.5">
                    {fmtDate(data.season.start_at)} –{" "}
                    {fmtDate(data.season.end_at)}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500 mt-1">Season: —</div>
              )}
            </div>
          ) : null}
        </div>

        <Button
          onClick={load}
          variant="outline"
          disabled={loading}
          className="w-full sm:w-auto shrink-0"
        >
          <RefreshCcw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="text-sm text-slate-600 animate-pulse">Loading...</div>
      ) : null}

      {err ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-700 text-sm break-words">
          {err}
        </div>
      ) : null}

      {!loading && !err && !data ? (
        <div className="text-sm text-slate-600">No data found.</div>
      ) : null}

      {!loading && !err && data && derived ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* CBT CARD */}
          <div className="rounded-md border bg-white p-3 sm:p-4 shadow-sm">
            {/* Header: Stack on small, Row on large */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b pb-3 mb-3">
              <div className="text-base font-semibold text-slate-800">CBT</div>
              <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                <span className="bg-slate-100 px-2 py-1 rounded">
                  Count:{" "}
                  <span className="font-semibold text-slate-700">
                    {derived.cbtCountPct}%
                  </span>
                </span>
                <span className="bg-slate-100 px-2 py-1 rounded">
                  Marks:{" "}
                  <span className="font-semibold text-slate-700">
                    {derived.cbtMarksPct}%
                  </span>
                </span>
              </div>
            </div>

            <div className="text-sm text-slate-700 space-y-3">
              <div className="flex flex-col gap-1">
                <span className="text-slate-500 text-xs uppercase tracking-wide">
                  Tests Distinct
                </span>
                <div>
                  <span className="font-medium text-lg">
                    {data.cbt.tests_taken_distinct}
                  </span>
                  <span className="text-slate-400 mx-1">/</span>
                  <span className="text-slate-500">
                    {derived.cbtReqCount} required
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 text-xs">Total Attempts: </span>
                <span className="font-medium">
                  {data.cbt.attempts_submitted}
                </span>
              </div>

              <div className="pt-3 border-t grid grid-cols-1 gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-slate-500 text-xs uppercase tracking-wide">
                    Pass Mark
                  </span>
                  <span className="font-medium">{derived.cbtReqMark}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-slate-500 text-xs uppercase tracking-wide">
                    Earned
                  </span>
                  <div>
                    <span className="font-medium text-lg text-emerald-600">
                      {derived.cbtEarned}
                    </span>
                    <span className="text-slate-400 text-xs ml-2">
                      ({derived.cbtMarksPct}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CODE CARD */}
          <div className="rounded-md border bg-white p-3 sm:p-4 shadow-sm">
            {/* Header */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b pb-3 mb-3">
              <div className="text-base font-semibold text-slate-800">Code</div>
              <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                <span className="bg-slate-100 px-2 py-1 rounded">
                  Count:{" "}
                  <span className="font-semibold text-slate-700">
                    {derived.codeCountPct}%
                  </span>
                </span>
                <span className="bg-slate-100 px-2 py-1 rounded">
                  Marks:{" "}
                  <span className="font-semibold text-slate-700">
                    {derived.codeMarksPct}%
                  </span>
                </span>
              </div>
            </div>

            <div className="text-sm text-slate-700 space-y-3">
              <div className="flex flex-col gap-1">
                <span className="text-slate-500 text-xs uppercase tracking-wide">
                  Submissions
                </span>
                <div>
                  <span className="font-medium text-lg">
                    {data.code.submissions_total}
                  </span>
                  <span className="text-slate-400 mx-1">/</span>
                  <span className="text-slate-500">
                    {derived.codeReqCount} required
                  </span>
                </div>
              </div>

              <div className="flex gap-4">
                <div>
                  <span className="text-slate-500 text-xs block">
                    Submitted
                  </span>
                  <span className="font-medium">
                    {data.code.submissions_submitted}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block">Graded</span>
                  <span className="font-medium">
                    {data.code.submissions_graded}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t grid grid-cols-1 gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-slate-500 text-xs uppercase tracking-wide">
                    Pass Mark
                  </span>
                  <span className="font-medium">{derived.codeReqMark}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-slate-500 text-xs uppercase tracking-wide">
                    Earned
                  </span>
                  <div>
                    <span className="font-medium text-lg text-emerald-600">
                      {derived.codeEarned}
                    </span>
                    <span className="text-slate-400 text-xs ml-2">
                      ({derived.codeMarksPct}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
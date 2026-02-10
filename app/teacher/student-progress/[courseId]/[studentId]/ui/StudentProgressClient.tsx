// app/teacher/student-progress/[courseId]/[studentId]/ui/StudentProgressClient.tsx
"use client";

import {useEffect, useMemo, useState} from "react";
import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";

type Metrics = {
  course: {id: number; name: string};
  student: {id: number; name: string; email: string};
  season: null | {name: string; start_at: string; end_at: string};
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
  const router = useRouter();

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch(
        `/api/courses/${courseId}/students/${studentId}/activity-metrics/`,
        {method: "GET", cache: "no-store"},
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
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            ← Back
          </Button>
        </div>

        <Button onClick={load} variant="outline" disabled={loading}>
          Refresh
        </Button>
      </div>

      <div>
        <h1 className="text-lg font-semibold text-slate-800">
          Student Progress
        </h1>
        <p className="text-sm text-slate-600">
          CBT and Code progress — showing both required targets and what the
          student has earned.
        </p>

        {data ? (
          <div className="mt-2 text-sm text-slate-700">
            <div className="font-medium">{data.student.name}</div>
            <div className="text-slate-500">{data.student.email}</div>
            <div className="text-slate-500">Course: {data.course.name}</div>

            {data.season ? (
              <div className="text-xs text-slate-500 mt-1">
                Season:{" "}
                <span className="font-medium text-slate-700">
                  {data.season.name}
                </span>{" "}
                • {fmtDate(data.season.start_at)} –{" "}
                {fmtDate(data.season.end_at)}
              </div>
            ) : (
              <div className="text-xs text-slate-500 mt-1">Season: —</div>
            )}
          </div>
        ) : null}
      </div>

      {loading ? <div className="text-sm text-slate-600">Loading…</div> : null}

      {err ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-700 text-sm">
          {err}
        </div>
      ) : null}

      {!loading && !err && !data ? (
        <div className="text-sm text-slate-600">No data.</div>
      ) : null}

      {!loading && !err && data && derived ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* CBT CARD */}
          <div className="rounded-md border bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-slate-800">CBT</div>
              <div className="text-xs text-slate-500">
                Count:{" "}
                <span className="font-semibold text-slate-700">
                  {derived.cbtCountPct}%
                </span>{" "}
                • Marks:{" "}
                <span className="font-semibold text-slate-700">
                  {derived.cbtMarksPct}%
                </span>
              </div>
            </div>

            <div className="mt-3 text-sm text-slate-700 space-y-1">
              <div>
                Tests done (distinct): <b>{data.cbt.tests_taken_distinct}</b> /{" "}
                <b>{derived.cbtReqCount}</b>
              </div>
              <div>
                Attempts submitted: <b>{data.cbt.attempts_submitted}</b>
              </div>

              <div className="pt-3 mt-3 border-t">
                <div>
                  Pass Mark (Required): <b>{derived.cbtReqMark}</b>
                </div>
                <div>
                  Marks Earned (So far): <b>{derived.cbtEarned}</b>
                </div>
                <div className="mt-1">
                  Marks Progress: <b>{derived.cbtMarksPct}%</b>
                </div>
              </div>
            </div>
          </div>

          {/* CODE CARD */}
          <div className="rounded-md border bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-slate-800">
                Code Submissions
              </div>
              <div className="text-xs text-slate-500">
                Count:{" "}
                <span className="font-semibold text-slate-700">
                  {derived.codeCountPct}%
                </span>{" "}
                • Marks:{" "}
                <span className="font-semibold text-slate-700">
                  {derived.codeMarksPct}%
                </span>
              </div>
            </div>

            <div className="mt-3 text-sm text-slate-700 space-y-1">
              <div>
                Submissions: <b>{data.code.submissions_total}</b> /{" "}
                <b>{derived.codeReqCount}</b>
              </div>
              <div>
                Submitted: <b>{data.code.submissions_submitted}</b>
              </div>
              <div>
                Graded: <b>{data.code.submissions_graded}</b>
              </div>

              <div className="pt-3 mt-3 border-t">
                <div>
                  Pass Mark (Required): <b>{derived.codeReqMark}</b>
                </div>
                <div>
                  Marks Earned (So far): <b>{derived.codeEarned}</b>
                </div>
                <div className="mt-1">
                  Marks Progress: <b>{derived.codeMarksPct}%</b>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

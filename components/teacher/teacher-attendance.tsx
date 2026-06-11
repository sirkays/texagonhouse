"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  ChevronDown,
  ChevronRight,
  Users,
  AlertCircle,
  Loader2,
  Search,
  Filter,
  Save,
  Eye,
  Radio,
  Trash2,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Course {
  id: string;
  name: string;
  subject: string;
  classroom: string;
}

interface Student {
  student_id: number;
  name: string;
  admission_no?: string;
}

interface AttendanceRecord {
  student_id: number;
  name: string;
  present: boolean;
  note: string;
}

interface AttendanceSession {
  session_id: number;
  date: string;
  topic: string;
  total_students: number;
  present: number;
  absent: number;
  records: AttendanceRecord[];
}

type TabId = "mark" | "records" | "auto";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const today = () => new Date().toISOString().split("T")[0];

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const pct = (n: number, d: number) =>
  d === 0 ? 0 : Math.round((n / d) * 100);

function csvCell(val: string | number | boolean): string {
  const s = String(val);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function exportSessionCsv(session: AttendanceSession, courseName: string) {
  const rows: string[][] = [
    [`Course: ${courseName}`],
    [`Date: ${formatDate(session.date)}`],
    ...(session.topic ? [[`Topic: ${session.topic}`]] : []),
    [
      `Present: ${session.present}`,
      `Absent: ${session.absent}`,
      `Rate: ${pct(session.present, session.total_students)}%`,
    ],
    [],
    ["#", "Student Name", "Status", "Note"],
    ...session.records.map((r, i) => [
      String(i + 1),
      r.name,
      r.present ? "Present" : "Absent",
      r.note || "",
    ]),
  ];

  const csv = rows.map((r) => r.map(csvCell).join(",")).join("\r\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `attendance_${courseName.replace(/\s+/g, "_").toLowerCase()}_${session.date}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

function StatPill({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/60 border border-slate-100 shadow-sm">
      <span className={cn("p-1.5 rounded-lg", accent)}>
        <Icon className="w-3.5 h-3.5" />
      </span>
      <div className="leading-tight">
        <p className="text-[11px] text-slate-500 font-medium">{label}</p>
        <p className="text-sm font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function AttendancePill({ present }: { present: boolean }) {
  return present ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
      <CheckCircle2 className="w-3 h-3" /> Present
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200">
      <XCircle className="w-3 h-3" /> Absent
    </span>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
      <AlertCircle className="w-4 h-4 shrink-0" />
      {message}
    </div>
  );
}

// ─── Tab: Mark Attendance ─────────────────────────────────────────────────────

function MarkAttendanceTab({ courses }: { courses: Course[] }) {
  const [courseId, setCourseId] = useState("");
  const [date, setDate] = useState(today());
  const [topic, setTopic] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<number, boolean>>({});
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [search, setSearch] = useState("");
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<null | {
    created: number;
    updated: number;
    errors: any[];
  }>(null);
  const [error, setError] = useState("");

  const fetchStudents = useCallback(async (cid: string) => {
    if (!cid) return;
    setLoadingStudents(true);
    setStudents([]);
    setAttendance({});
    setNotes({});
    setResult(null);
    setError("");
    try {
      const res = await fetch(
        `/api/teacher/fetch-course-students/?course_id=${cid}&limit=200`
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.detail ?? data?.error ?? `Server error ${res.status}`
        );
      }

      const raw: any[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.students)
        ? data.students
        : Array.isArray(data?.results)
        ? data.results
        : [];

      if (raw.length === 0) {
        setError("No enrolled students found for this course.");
        return;
      }

      const list: Student[] = raw.map((s: any) => ({
        student_id: s.id ?? s.student_id,
        name: s.full_name ?? s.name ?? `Student ${s.id ?? s.student_id}`,
        admission_no: s.admission_no ?? "",
      }));

      setStudents(list);
      const init: Record<number, boolean> = {};
      list.forEach((s) => (init[s.student_id] = true));
      setAttendance(init);
    } catch (e: any) {
      setError(e.message ?? "Failed to load students.");
    } finally {
      setLoadingStudents(false);
    }
  }, []);

  useEffect(() => {
    if (courseId) fetchStudents(courseId);
  }, [courseId, fetchStudents]);

  const toggle = (id: number) =>
    setAttendance((prev) => ({ ...prev, [id]: !prev[id] }));

  const markAll = (val: boolean) => {
    const next: Record<number, boolean> = {};
    students.forEach((s) => (next[s.student_id] = val));
    setAttendance(next);
  };

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const presentCount = Object.values(attendance).filter(Boolean).length;

  const submit = async () => {
    if (!courseId) return;
    setSaving(true);
    setResult(null);
    setError("");
    try {
      const records = students.map((s) => ({
        student_id: s.student_id,
        present: attendance[s.student_id] ?? false,
        note: notes[s.student_id] ?? "",
      }));

      const res = await fetch("/api/teacher/attendance/mark/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course_id: courseId, date, topic, records }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? "Error saving attendance");
      setResult(data);
    } catch (e: any) {
      setError(e.message ?? "Unexpected error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
            Course
          </label>
          <Select onValueChange={setCourseId} value={courseId}>
            <SelectTrigger className="bg-white border-slate-200 h-10 text-sm">
              <SelectValue placeholder="Select course…" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
            Date
          </label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-white border-slate-200 h-10 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
            Topic (optional)
          </label>
          <Input
            placeholder="e.g. Photosynthesis"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="bg-white border-slate-200 h-10 text-sm"
          />
        </div>
      </div>

      {/* Student list */}
      {courseId && (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          {/* List header */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-50 border-b border-slate-100">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <Input
                  placeholder="Search student…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-8 text-sm w-44 bg-white border-slate-200"
                />
              </div>
              {students.length > 0 && (
                <div className="flex gap-1">
                  <button
                    onClick={() => markAll(true)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium border border-emerald-200 transition-colors"
                  >
                    All present
                  </button>
                  <button
                    onClick={() => markAll(false)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 font-medium border border-rose-200 transition-colors"
                  >
                    All absent
                  </button>
                </div>
              )}
            </div>

            {students.length > 0 && (
              <div className="flex gap-2">
                <StatPill
                  icon={CheckCircle2}
                  label="Present"
                  value={presentCount}
                  accent="bg-emerald-50 text-emerald-600"
                />
                <StatPill
                  icon={XCircle}
                  label="Absent"
                  value={students.length - presentCount}
                  accent="bg-rose-50 text-rose-500"
                />
              </div>
            )}
          </div>

          {/* List body */}
          {loadingStudents ? (
            <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading students…</span>
            </div>
          ) : students.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Users className="w-8 h-8 mb-2 opacity-40" />
              <p className="text-sm">No enrolled students found</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50 max-h-[420px] overflow-y-auto">
              {filtered.map((s, i) => (
                <div
                  key={s.student_id}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 transition-colors",
                    attendance[s.student_id]
                      ? "hover:bg-emerald-50/40"
                      : "bg-rose-50/10 hover:bg-rose-50/30"
                  )}
                >
                  <span className="w-6 text-center text-xs text-slate-400 font-mono shrink-0">
                    {i + 1}
                  </span>

                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {s.name
                      .split(" ")
                      .slice(0, 2)
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {s.name}
                    </p>
                    {s.admission_no && (
                      <p className="text-xs text-slate-400">{s.admission_no}</p>
                    )}
                  </div>

                  <Input
                    placeholder="Note…"
                    value={notes[s.student_id] ?? ""}
                    onChange={(e) =>
                      setNotes((prev) => ({
                        ...prev,
                        [s.student_id]: e.target.value,
                      }))
                    }
                    className="h-7 text-xs w-32 border-slate-200 bg-white/80 shrink-0"
                  />

                  <button
                    onClick={() => toggle(s.student_id)}
                    className={cn(
                      "w-24 shrink-0 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-semibold border transition-all",
                      attendance[s.student_id]
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                        : "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100"
                    )}
                  >
                    {attendance[s.student_id] ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Present
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5" /> Absent
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {error && <ErrorBanner message={error} />}

      {result && (
        <div className="flex items-center gap-3 text-sm bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="text-emerald-700 font-medium">
            Saved — {result.created} new records, {result.updated} updated.
            {result.errors.length > 0 && (
              <span className="text-amber-600 ml-2">
                {result.errors.length} skipped.
              </span>
            )}
          </span>
        </div>
      )}

      {students.length > 0 && (
        <div className="flex justify-end">
          <Button
            onClick={submit}
            disabled={saving || !courseId}
            className="gap-2 bg-[#ef7b55] hover:bg-[#e06840] text-white px-6 h-10 rounded-xl text-sm font-semibold shadow-sm"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Attendance
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Tab: View Records ────────────────────────────────────────────────────────

function RecordsTab({ courses }: { courses: Course[] }) {
  const [courseId, setCourseId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AttendanceSession | null>(
    null
  );
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const selectedCourse = courses.find((c) => c.id === courseId);

  const fetchRecords = async () => {
    if (!courseId) return;
    setLoading(true);
    setError("");
    setSessions([]);
    try {
      const qs = new URLSearchParams();
      if (startDate) qs.append("start_date", startDate);
      if (endDate) qs.append("end_date", endDate);

      const res = await fetch(
        `/api/teacher/attendance/${courseId}/records/?${qs}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? "Error fetching records");
      setSessions(data.sessions ?? []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch(
        `/api/teacher/attendance/session/${deleteTarget.session_id}/delete/`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail ?? `Error ${res.status}`);
      }
      setSessions((prev) =>
        prev.filter((s) => s.session_id !== deleteTarget.session_id)
      );
      if (expanded === deleteTarget.session_id) setExpanded(null);
      setDeleteTarget(null);
    } catch (e: any) {
      setDeleteError(e.message ?? "Failed to delete session.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
            Course
          </label>
          <Select onValueChange={setCourseId} value={courseId}>
            <SelectTrigger className="bg-white border-slate-200 h-10 text-sm">
              <SelectValue placeholder="Select course…" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
            From
          </label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-white border-slate-200 h-10 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
            To
          </label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-white border-slate-200 h-10 text-sm"
          />
        </div>

        <div className="flex items-end">
          <Button
            onClick={fetchRecords}
            disabled={!courseId || loading}
            className="w-full gap-2 bg-[#ef7b55] hover:bg-[#e06840] text-white h-10 rounded-xl text-sm font-semibold"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
            View Records
          </Button>
        </div>
      </div>

      {error && <ErrorBanner message={error} />}

      {/* Summary bar */}
      {sessions.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-600">
          <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
          <span>
            <strong>{sessions.length}</strong> session
            {sessions.length !== 1 ? "s" : ""} •{" "}
            <strong>{sessions.reduce((a, s) => a + s.present, 0)}</strong>{" "}
            total present /{" "}
            <strong>
              {sessions.reduce((a, s) => a + s.total_students, 0)}
            </strong>{" "}
            total records
          </span>
        </div>
      )}

      {sessions.length === 0 && !loading && courseId && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Calendar className="w-8 h-8 mb-2 opacity-40" />
          <p className="text-sm">No sessions found for the selected range</p>
        </div>
      )}

      {/* Session cards */}
      <div className="space-y-3">
        {sessions.map((session) => {
          const rate = pct(session.present, session.total_students);
          const isExpanded = expanded === session.session_id;

          return (
            <div
              key={session.session_id}
              className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm"
            >
              {/* Card header row */}
              <div className="flex items-stretch">
                {/* Expand / collapse */}
                <button
                  onClick={() =>
                    setExpanded(isExpanded ? null : session.session_id)
                  }
                  className="flex-1 flex items-center gap-4 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
                >
                  {/* Date badge */}
                  <div className="w-12 shrink-0 text-center">
                    <p className="text-xs text-slate-400 font-medium">
                      {new Date(session.date).toLocaleDateString("en-GB", {
                        month: "short",
                      })}
                    </p>
                    <p className="text-lg font-bold text-slate-800 leading-tight">
                      {new Date(session.date).getDate()}
                    </p>
                  </div>

                  {/* Title + topic */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">
                      {formatDate(session.date)}
                    </p>
                    {session.topic && (
                      <p className="text-xs text-slate-500 truncate">
                        {session.topic}
                      </p>
                    )}
                  </div>

                  {/* Stats + progress bar */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="hidden sm:flex gap-2">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        {session.present}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                        <XCircle className="w-3 h-3" />
                        {session.absent}
                      </span>
                    </div>

                    <div className="w-24">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs text-slate-500">
                          {session.total_students} students
                        </span>
                        <span
                          className={cn(
                            "text-xs font-bold",
                            rate >= 75
                              ? "text-emerald-600"
                              : rate >= 50
                              ? "text-amber-600"
                              : "text-rose-600"
                          )}
                        >
                          {rate}%
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            rate >= 75
                              ? "bg-emerald-500"
                              : rate >= 50
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          )}
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                    </div>

                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Export this session */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    exportSessionCsv(
                      session,
                      selectedCourse?.name ?? "course"
                    );
                  }}
                  className="flex items-center justify-center px-3 border-l border-slate-100 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                  title="Export session as CSV"
                >
                  <Download className="w-4 h-4" />
                </button>

                {/* Delete session */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteError("");
                    setDeleteTarget(session);
                  }}
                  className="flex items-center justify-center px-3 border-l border-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                  title="Delete session"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Expanded: student records */}
              {isExpanded && (
                <div className="border-t border-slate-100">
                  {session.records.length === 0 ? (
                    <div className="flex items-center justify-center py-8 text-slate-400">
                      <p className="text-sm">No records in this session yet</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
                      {session.records.map((r, i) => (
                        <div
                          key={r.student_id}
                          className={cn(
                            "flex items-center gap-3 px-4 py-2.5",
                            !r.present && "bg-rose-50/30"
                          )}
                        >
                          <span className="w-5 text-center text-xs text-slate-400 font-mono shrink-0">
                            {i + 1}
                          </span>
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                            {r.name
                              .split(" ")
                              .slice(0, 2)
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </div>
                          <p className="flex-1 text-sm text-slate-700 font-medium truncate">
                            {r.name}
                          </p>
                          {r.note && (
                            <p className="text-xs text-slate-400 italic truncate max-w-[120px] shrink-0">
                              {r.note}
                            </p>
                          )}
                          <AttendancePill present={r.present} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
            setDeleteError("");
          }
        }}
      >
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600">
              <Trash2 className="w-4 h-4" />
              Delete Attendance Session
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500 mt-1">
              This will permanently delete the session for{" "}
              <strong>
                {deleteTarget ? formatDate(deleteTarget.date) : ""}
              </strong>
              {deleteTarget?.topic ? ` (${deleteTarget.topic})` : ""} and all{" "}
              <strong>{deleteTarget?.total_students ?? 0}</strong> records
              within it. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {deleteError && <ErrorBanner message={deleteError} />}

          <div className="flex gap-2 mt-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteTarget(null);
                setDeleteError("");
              }}
              disabled={deleting}
              className="flex-1 rounded-xl border-slate-200"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={deleting}
              className="flex-1 gap-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl"
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Tab: Auto Mark ───────────────────────────────────────────────────────────

function AutoMarkTab({ courses }: { courses: Course[] }) {
  const [courseId, setCourseId] = useState("");
  const [mode, setMode] = useState<"today" | "range">("today");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [date, setDate] = useState(today());
  const [topic, setTopic] = useState("Auto (online)");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const run = async () => {
    setConfirmOpen(false);
    setLoading(true);
    setResult(null);
    setError("");
    try {
      const body: any = { mode, date, topic };
      if (mode === "range") {
        body.start = start;
        body.end = end;
      }

      const res = await fetch(`/api/teacher/attendance/${courseId}/auto/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? "Error");
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = courseId && (mode === "today" || (start && end));

  return (
    <div className="space-y-5">
      {/* Info banner */}
      <div className="flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
        <Zap className="w-4 h-4 text-[#ef7b55] mt-0.5 shrink-0" />
        <p className="text-sm text-orange-700">
          Auto-mark uses each student's <strong>last login time</strong> to
          determine if they were online during the session window. Students
          logged in within the window are marked <strong>Present</strong>;
          others are marked <strong>Absent</strong>.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
            Course
          </label>
          <Select onValueChange={setCourseId} value={courseId}>
            <SelectTrigger className="bg-white border-slate-200 h-10 text-sm">
              <SelectValue placeholder="Select course…" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
            Attendance Date
          </label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-white border-slate-200 h-10 text-sm"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
            Topic (optional)
          </label>
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="bg-white border-slate-200 h-10 text-sm"
          />
        </div>
      </div>

      {/* Mode selector */}
      <div>
        <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
          Online Window
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setMode("today")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all",
              mode === "today"
                ? "bg-[#ef7b55] text-white border-[#ef7b55] shadow-sm"
                : "bg-white border-slate-200 text-slate-600 hover:border-[#ef7b55]/50"
            )}
          >
            <Clock className="w-4 h-4" />
            Today (midnight → now)
          </button>
          <button
            onClick={() => setMode("range")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all",
              mode === "range"
                ? "bg-[#ef7b55] text-white border-[#ef7b55] shadow-sm"
                : "bg-white border-slate-200 text-slate-600 hover:border-[#ef7b55]/50"
            )}
          >
            <Filter className="w-4 h-4" />
            Custom time range
          </button>
        </div>
      </div>

      {mode === "range" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-3 border-l-2 border-[#ef7b55]/30">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
              Window Start
            </label>
            <Input
              type="datetime-local"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="bg-white border-slate-200 h-10 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
              Window End
            </label>
            <Input
              type="datetime-local"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="bg-white border-slate-200 h-10 text-sm"
            />
          </div>
        </div>
      )}

      {error && <ErrorBanner message={error} />}

      {/* Result card */}
      {result && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <p className="text-sm font-bold text-emerald-800">
              Auto-mark complete
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <StatPill
              icon={Users}
              label="Total"
              value={result.total}
              accent="bg-indigo-50 text-indigo-600"
            />
            <StatPill
              icon={CheckCircle2}
              label="Present"
              value={result.marked_present}
              accent="bg-emerald-50 text-emerald-600"
            />
            <StatPill
              icon={XCircle}
              label="Absent"
              value={result.marked_absent}
              accent="bg-rose-50 text-rose-500"
            />
          </div>
          <div className="h-2 rounded-full bg-white overflow-hidden border border-emerald-200">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{
                width: `${pct(result.marked_present, result.total)}%`,
              }}
            />
          </div>
          <p className="text-xs text-emerald-700">
            {pct(result.marked_present, result.total)}% attendance rate •
            Window: {new Date(result.window_start).toLocaleTimeString()} →{" "}
            {new Date(result.window_end).toLocaleTimeString()}
          </p>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          onClick={() => setConfirmOpen(true)}
          disabled={!canSubmit || loading}
          className="gap-2 bg-[#ef7b55] hover:bg-[#e06840] text-white px-6 h-10 rounded-xl text-sm font-semibold shadow-sm"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Zap className="w-4 h-4" />
          )}
          Run Auto-mark
        </Button>
      </div>

      {/* Confirm dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#ef7b55]" />
              Confirm Auto-mark
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500 mt-1">
              This will automatically update attendance records for{" "}
              <strong>{formatDate(date)}</strong> based on online activity.
              Existing records for this session will be overwritten.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 mt-2">
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              className="flex-1 rounded-xl border-slate-200"
            >
              Cancel
            </Button>
            <Button
              onClick={run}
              className="flex-1 gap-2 bg-[#ef7b55] hover:bg-[#e06840] text-white rounded-xl"
            >
              <Zap className="w-4 h-4" />
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────

export function TeacherAttendance() {
  const [activeTab, setActiveTab] = useState<TabId>("mark");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/teacher/courses/");
        const data = await res.json();
        setCourses(Array.isArray(data) ? data : []);
      } catch {
        setCourses([]);
      } finally {
        setLoadingCourses(false);
      }
    })();
  }, []);

  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: "mark", label: "Mark Attendance", icon: CheckCircle2 },
    { id: "records", label: "View Records", icon: Calendar },
    { id: "auto", label: "Auto-mark", icon: Zap },
  ];

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Attendance
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage and track student attendance across your courses
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 bg-white border border-slate-200 rounded-2xl p-1 shadow-sm w-full sm:w-fit overflow-x-auto scrollbar-none whitespace-nowrap">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all shrink-0",
                activeTab === t.id
                  ? "bg-[#ef7b55] text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              )}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Content card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
          {loadingCourses ? (
            <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading courses…</span>
            </div>
          ) : courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <AlertCircle className="w-8 h-8 mb-2 opacity-40" />
              <p className="text-sm">No active courses found</p>
            </div>
          ) : (
            <>
              {activeTab === "mark" && (
                <MarkAttendanceTab courses={courses} />
              )}
              {activeTab === "records" && <RecordsTab courses={courses} />}
              {activeTab === "auto" && <AutoMarkTab courses={courses} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
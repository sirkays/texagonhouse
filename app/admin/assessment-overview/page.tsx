"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  BarChart3, Search, Users, ChevronLeft, ChevronRight,
  TestTube2, Code2, FileText, ClipboardList, Star,
  TrendingUp, Award, Filter, RefreshCw, Download,
  CheckCircle2, AlertCircle, Minus, X, ChevronDown, ChevronUp,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StudentRow {
  student_id: number;
  student_name: string;
  student_email: string;
  classroom_id: number | null;
  classroom_name: string | null;
  cbt_avg: number | null;
  cbt_count: number;
  code_avg: number | null;
  code_count: number;
  assignment_avg: number | null;
  assignment_count: number;
  opw_avg: number | null;
  opw_count: number;
  overall_avg: number | null;
}

interface Summary {
  platform_avg: number | null;
  total_students: number;
}

interface Pagination {
  page: number;
  page_size: number;
  total: number;
  pages: number;
}

interface ApiResponse {
  results: StudentRow[];
  summary: Summary;
  pagination: Pagination;
}

interface Classroom {
  id: number;
  name: string;
}

interface Course {
  id: number;
  name: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function grade(pct: number | null): { label: string; color: string; bg: string } {
  if (pct === null) return { label: "—", color: "text-slate-400", bg: "bg-slate-100" };
  if (pct >= 90) return { label: "A", color: "text-emerald-700", bg: "bg-emerald-100" };
  if (pct >= 80) return { label: "B", color: "text-blue-700", bg: "bg-blue-100" };
  if (pct >= 70) return { label: "C", color: "text-amber-700", bg: "bg-amber-100" };
  if (pct >= 50) return { label: "D", color: "text-orange-700", bg: "bg-orange-100" };
  return { label: "F", color: "text-red-700", bg: "bg-red-100" };
}

function ScorePill({ value, count, label }: { value: number | null; count: number; label: string }) {
  const g = grade(value);
  if (count === 0) return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[11px] font-medium text-slate-300">—</span>
      <span className="text-[9px] text-slate-300">No data</span>
    </div>
  );
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className={`text-xs font-bold ${g.color}`}>{value?.toFixed(1)}%</span>
      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${g.bg} ${g.color}`}>{g.label}</span>
    </div>
  );
}

function OverallRing({ value }: { value: number | null }) {
  const g = grade(value);
  const radius = 16;
  const circ = 2 * Math.PI * radius;
  const pct = value ?? 0;
  const dash = (pct / 100) * circ;

  const ringColor = value === null ? "#e2e8f0"
    : pct >= 90 ? "#10b981"
    : pct >= 80 ? "#3b82f6"
    : pct >= 70 ? "#f59e0b"
    : pct >= 50 ? "#f97316"
    : "#ef4444";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-10 h-10">
        <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="4" />
          {value !== null && (
            <circle
              cx="20" cy="20" r={radius} fill="none"
              stroke={ringColor} strokeWidth="4"
              strokeDasharray={`${dash} ${circ}`}
              strokeLinecap="round"
            />
          )}
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-extrabold ${g.color}`}>
          {value !== null ? g.label : "—"}
        </span>
      </div>
      <span className={`text-[10px] font-bold ${g.color}`}>
        {value !== null ? `${value.toFixed(1)}%` : "N/A"}
      </span>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function AssessmentOverviewPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedClassroom, setSelectedClassroom] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<keyof StudentRow | "">("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchData = useCallback(async (pg = 1, q = search, cls = selectedClassroom, crs = selectedCourse) => {
    setLoading(true);
    try {
      let url = `/api/admin/assessment-overview?page=${pg}&page_size=20`;
      if (q) url += `&search=${encodeURIComponent(q)}`;
      if (cls) url += `&classroom=${cls}`;
      if (crs) url += `&course=${crs}`;
      const res = await fetch(url);
      if (res.ok) setData(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [search, selectedClassroom, selectedCourse]);

  const fetchFilters = useCallback(async () => {
    try {
      const [resCls, resCrs] = await Promise.all([
        fetch("/api/admin/assessment-overview/classrooms"),
        fetch("/api/admin/assessment-overview/courses")
      ]);
      if (resCls.ok) setClassrooms(await resCls.json());
      if (resCrs.ok) setCourses(await resCrs.json());
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    fetchFilters();
    fetchData(1);
  }, []);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      setPage(1);
      fetchData(1, search, selectedClassroom, selectedCourse);
    }, 400);
    return () => { if (debounce.current) clearTimeout(debounce.current); };
  }, [search]);

  const handleClassroomChange = (cls: string) => {
    setSelectedClassroom(cls);
    setPage(1);
    fetchData(1, search, cls, selectedCourse);
  };

  const handleCourseChange = (crs: string) => {
    setSelectedCourse(crs);
    setPage(1);
    fetchData(1, search, selectedClassroom, crs);
  };

  const handlePage = (p: number) => {
    setPage(p);
    fetchData(p, search, selectedClassroom, selectedCourse);
  };

  const handleSort = (key: keyof StudentRow) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const SortIcon = ({ k }: { k: keyof StudentRow }) => {
    if (sortKey !== k) return <span className="w-3 h-3 opacity-30 inline-block"><ChevronDown className="w-3 h-3" /></span>;
    return sortDir === "asc"
      ? <ChevronUp className="w-3 h-3 inline text-[#EF7B55]" />
      : <ChevronDown className="w-3 h-3 inline text-[#EF7B55]" />;
  };

  // Client-side sort
  const rows = [...(data?.results ?? [])].sort((a, b) => {
    if (!sortKey) return 0;
    const av = a[sortKey] as number | null;
    const bv = b[sortKey] as number | null;
    if (av === null && bv === null) return 0;
    if (av === null) return 1;
    if (bv === null) return -1;
    return sortDir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
  });

  const summary = data?.summary;
  const pagination = data?.pagination;
  const overallGrade = grade(summary?.platform_avg ?? null);

  // Export CSV
  const exportCSV = () => {
    if (!data?.results.length) return;
    const header = ["Name", "Email", "Classroom", "CBT Avg%", "CBT Count", "Code Avg%", "Code Count", "Assignment Avg%", "Assignment Count", "OPW Avg%", "OPW Count", "Overall%"];
    const csv = [header.join(","), ...data.results.map(r => [
      `"${r.student_name}"`, r.student_email, `"${r.classroom_name ?? ""}"`,
      r.cbt_avg ?? "", r.cbt_count, r.code_avg ?? "", r.code_count,
      r.assignment_avg ?? "", r.assignment_count, r.opw_avg ?? "", r.opw_count,
      r.overall_avg ?? "",
    ].join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "assessment_overview.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const categories = [
    { key: "cbt_avg" as const, label: "CBT Tests", icon: TestTube2, color: "text-violet-600 bg-violet-50", countKey: "cbt_count" as const },
    { key: "code_avg" as const, label: "Code IDE", icon: Code2, color: "text-blue-600 bg-blue-50", countKey: "code_count" as const },
    { key: "assignment_avg" as const, label: "Assignments", icon: FileText, color: "text-amber-600 bg-amber-50", countKey: "assignment_count" as const },
    { key: "opw_avg" as const, label: "Off-Practical", icon: ClipboardList, color: "text-emerald-600 bg-emerald-50", countKey: "opw_count" as const },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-[#e26d47] p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 h-64 w-64 -translate-y-12 translate-x-12 rounded-full bg-[#EF7B55]/20 blur-3xl" />
        <div className="absolute left-1/4 bottom-0 h-40 w-40 translate-y-12 rounded-full bg-orange-300/10 blur-3xl" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-2">
            <Badge className="bg-[#EF7B55]/20 text-orange-200 border border-[#EF7B55]/30 px-3 py-1 font-semibold text-xs tracking-wide">
              📊 Performance Intelligence
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Assessment Overview
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
              Unified view of every student's performance across CBT tests, Code IDE projects, assignment submissions, and off-practical work — with a weighted overall score.
            </p>
          </div>

          {/* Platform-wide stat */}
          {summary && (
            <div className="bg-white/10 backdrop-blur rounded-2xl p-5 text-center shrink-0 min-w-[140px] border border-white/20">
              <p className="text-xs text-slate-300 font-medium mb-1">Platform Average</p>
              <p className={`text-4xl font-extrabold ${summary.platform_avg !== null ? "text-white" : "text-slate-400"}`}>
                {summary.platform_avg !== null ? `${summary.platform_avg}%` : "—"}
              </p>
              <p className="text-xs text-slate-300 mt-1">{summary.total_students} students</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Category Summary Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {categories.map(({ key, label, icon: Icon, color, countKey }) => {
          const vals = data?.results.map(r => r[key]).filter((v): v is number => v !== null) ?? [];
          const avg = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length) : null;
          const g = grade(avg);
          return (
            <div key={key} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${g.bg} ${g.color}`}>{g.label}</span>
              </div>
              <p className={`text-2xl font-extrabold ${g.color}`}>
                {avg !== null ? `${avg.toFixed(1)}%` : "—"}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
              <p className="text-[10px] text-slate-400 mt-1">
                {vals.length} graded records
              </p>
            </div>
          );
        })}
      </div>

      {/* ── Table Panel ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-slate-100">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search student…"
                className="pl-9 h-9 rounded-xl border-slate-200 text-sm"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {/* Course */}
            <select
              value={selectedCourse}
              onChange={e => handleCourseChange(e.target.value)}
              className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#EF7B55] min-w-[140px]"
            >
              <option value="">All Courses</option>
              {courses.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
            </select>
            {/* Classroom */}
            <select
              value={selectedClassroom}
              onChange={e => handleClassroomChange(e.target.value)}
              className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#EF7B55] min-w-[140px]"
            >
              <option value="">All Classrooms</option>
              {classrooms.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost" size="sm"
              onClick={() => fetchData(page)}
              className="h-9 gap-1.5 text-slate-600 hover:text-[#EF7B55] rounded-xl"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </Button>
            <Button
              size="sm"
              onClick={exportCSV}
              disabled={!data?.results.length}
              className="h-9 gap-1.5 bg-[#EF7B55] hover:bg-[#d96a44] text-white rounded-xl font-semibold text-xs"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100">
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Student
                </th>
                {[
                  { key: "cbt_avg" as const, label: "CBT Tests", icon: TestTube2 },
                  { key: "code_avg" as const, label: "Code IDE", icon: Code2 },
                  { key: "assignment_avg" as const, label: "Assignments", icon: FileText },
                  { key: "opw_avg" as const, label: "Off-Practical", icon: ClipboardList },
                  { key: "overall_avg" as const, label: "Overall", icon: Star },
                ].map(({ key, label, icon: Icon }) => (
                  <th
                    key={key}
                    className="py-3 px-3 text-center cursor-pointer group select-none"
                    onClick={() => handleSort(key)}
                  >
                    <div className="flex items-center justify-center gap-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                      <SortIcon k={key} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-16">
                    <Spinner size="sm" className="text-[#EF7B55] mx-auto" />
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16">
                    <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-sm text-slate-400">No students found</p>
                  </td>
                </tr>
              ) : (
                rows.map((student, idx) => {
                  const g = grade(student.overall_avg);
                  return (
                    <tr key={student.student_id} className={`hover:bg-orange-50/30 transition-colors duration-150 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"}`}>
                      {/* Student info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#EF7B55] to-[#e26d47] flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {student.student_name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{student.student_name}</p>
                            <p className="text-[11px] text-slate-400 truncate">{student.classroom_name ?? "—"}</p>
                          </div>
                        </div>
                      </td>

                      {/* CBT */}
                      <td className="py-3 px-3 text-center">
                        <ScorePill value={student.cbt_avg} count={student.cbt_count} label="CBT" />
                        <p className="text-[9px] text-slate-400 mt-0.5">{student.cbt_count} attempt{student.cbt_count !== 1 ? "s" : ""}</p>
                      </td>

                      {/* Code IDE */}
                      <td className="py-3 px-3 text-center">
                        <ScorePill value={student.code_avg} count={student.code_count} label="Code" />
                        <p className="text-[9px] text-slate-400 mt-0.5">{student.code_count} project{student.code_count !== 1 ? "s" : ""}</p>
                      </td>

                      {/* Assignments */}
                      <td className="py-3 px-3 text-center">
                        <ScorePill value={student.assignment_avg} count={student.assignment_count} label="Assign" />
                        <p className="text-[9px] text-slate-400 mt-0.5">{student.assignment_count} submission{student.assignment_count !== 1 ? "s" : ""}</p>
                      </td>

                      {/* OPW */}
                      <td className="py-3 px-3 text-center">
                        <ScorePill value={student.opw_avg} count={student.opw_count} label="OPW" />
                        <p className="text-[9px] text-slate-400 mt-0.5">{student.opw_count} record{student.opw_count !== 1 ? "s" : ""}</p>
                      </td>

                      {/* Overall */}
                      <td className="py-3 px-4 text-center">
                        <OverallRing value={student.overall_avg} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/40">
            <Button
              variant="ghost" size="sm"
              disabled={page <= 1 || loading}
              onClick={() => handlePage(page - 1)}
              className="gap-1 text-xs text-slate-600 hover:text-[#EF7B55] rounded-lg"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </Button>
            <span className="text-xs text-slate-500">
              Page <strong>{pagination.page}</strong> of <strong>{pagination.pages}</strong>
              {" "}· {pagination.total} students
            </span>
            <Button
              variant="ghost" size="sm"
              disabled={page >= pagination.pages || loading}
              onClick={() => handlePage(page + 1)}
              className="gap-1 text-xs text-slate-600 hover:text-[#EF7B55] rounded-lg"
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* ── Grade Key ── */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Grade Scale</p>
        <div className="flex flex-wrap gap-3">
          {[
            { label: "A — Excellent", range: "90–100%", color: "text-emerald-700 bg-emerald-100" },
            { label: "B — Good", range: "80–89%", color: "text-blue-700 bg-blue-100" },
            { label: "C — Average", range: "70–79%", color: "text-amber-700 bg-amber-100" },
            { label: "D — Below Avg", range: "50–69%", color: "text-orange-700 bg-orange-100" },
            { label: "F — Failing", range: "0–49%", color: "text-red-700 bg-red-100" },
          ].map(({ label, range, color }) => (
            <div key={label} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${color}`}>
              <span>{label}</span>
              <span className="opacity-60">{range}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FileText, Loader2, AlertCircle, ClipboardList, Code, Award,
  Calendar, BookOpen, ChevronRight, RefreshCw, GraduationCap,
  Search, X, Filter, Users, SortAsc, SortDesc,
  ChevronDown, CheckCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ChildInfo = {
  id: number;
  name: string;
  admission_no: string;
  classroom: string;
};

type ReportSummary = {
  id: number;
  title: string;
  status: string;
  course_name: string;
  organization_name: string;
  organization_logo: string | null;
  published_at: string | null;
  period_start: string | null;
  period_end: string | null;
  share_token: string;
  recipients_count: number;
  children: ChildInfo[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

const CHILD_COLORS = [
  "from-violet-500 to-purple-600",
  "from-cyan-500 to-blue-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-emerald-500 to-teal-600",
  "from-indigo-500 to-blue-700",
];

function childColor(idx: number) {
  return CHILD_COLORS[idx % CHILD_COLORS.length];
}

// ─── Child Avatar ─────────────────────────────────────────────────────────────

function ChildAvatar({ child, colorIdx, size = "sm" }: { child: ChildInfo; colorIdx: number; size?: "sm" | "md" }) {
  const sz = size === "sm" ? "w-7 h-7 text-[10px]" : "w-9 h-9 text-xs";
  return (
    <div
      className={`${sz} rounded-full bg-gradient-to-br ${childColor(colorIdx)} flex items-center justify-center text-white font-bold flex-shrink-0 ring-2 ring-white shadow-sm`}
      title={`${child.name}${child.classroom ? ` · ${child.classroom}` : ""}`}
    >
      {getInitials(child.name)}
    </div>
  );
}

// ─── Custom Dropdown ──────────────────────────────────────────────────────────

function FilterDropdown({
  label, value, options, onChange, icon: Icon,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  icon: any;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all ${
          value ? "bg-[#EF7B55]/10 border-[#EF7B55]/30 text-[#EF7B55]" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
        }`}
      >
        <Icon className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{selected?.label || label}</span>
        <span className="sm:hidden">{label}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1.5 bg-white rounded-xl border border-slate-200 shadow-xl z-20 min-w-[180px] py-1 overflow-hidden">
            {options.map(opt => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors ${
                  value === opt.value ? "bg-[#EF7B55]/10 text-[#EF7B55] font-medium" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {opt.label}
                {value === opt.value && <CheckCircle className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ParentReportsListPage() {
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChild, setSelectedChild] = useState<string>("");      // child id or ""
  const [selectedCourse, setSelectedCourse] = useState<string>("");    // course_name or ""
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const fetchReports = () => {
    setLoading(true);
    setError("");
    fetch("/api/parent/reports")
      .then(async r => {
        const data = await r.json();
        if (!r.ok) {
          setError(data.detail || data.error || "Could not load reports.");
        } else {
          setReports(data.results || []);
        }
      })
      .catch(() => setError("Network error. Please try again."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReports(); }, []);

  // ── Derived filter options ────────────────────────────────────────────────

  // All unique children across all reports
  const allChildren = useMemo<ChildInfo[]>(() => {
    const seen = new Set<number>();
    const list: ChildInfo[] = [];
    for (const r of reports) {
      for (const c of r.children) {
        if (!seen.has(c.id)) { seen.add(c.id); list.push(c); }
      }
    }
    return list;
  }, [reports]);

  // Build a stable color index per child id
  const childColorMap = useMemo(() => {
    const map: Record<number, number> = {};
    allChildren.forEach((c, i) => { map[c.id] = i; });
    return map;
  }, [allChildren]);

  // All unique courses
  const allCourses = useMemo(() => {
    const set = new Set<string>();
    reports.forEach(r => { if (r.course_name) set.add(r.course_name); });
    return Array.from(set).sort();
  }, [reports]);

  // ── Filtered / sorted reports ─────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = [...reports];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.course_name.toLowerCase().includes(q) ||
        r.organization_name.toLowerCase().includes(q) ||
        r.children.some(c => c.name.toLowerCase().includes(q))
      );
    }

    // Filter by child
    if (selectedChild) {
      const cid = parseInt(selectedChild, 10);
      list = list.filter(r => r.children.some(c => c.id === cid));
    }

    // Filter by course
    if (selectedCourse) {
      list = list.filter(r => r.course_name === selectedCourse);
    }

    // Sort
    list.sort((a, b) => {
      const da = a.published_at ? new Date(a.published_at).getTime() : 0;
      const db = b.published_at ? new Date(b.published_at).getTime() : 0;
      return sortOrder === "newest" ? db - da : da - db;
    });

    return list;
  }, [reports, searchQuery, selectedChild, selectedCourse, sortOrder]);

  const hasFilters = !!(searchQuery || selectedChild || selectedCourse);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedChild("");
    setSelectedCourse("");
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 max-w-4xl mx-auto">

      {/* Page Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#EF7B55]/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-[#EF7B55]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Children&apos;s Reports</h1>
            <p className="text-sm text-slate-500">
              {loading ? "Loading…" : `${reports.length} report${reports.length !== 1 ? "s" : ""} from teachers`}
            </p>
          </div>
        </div>
        {!loading && (
          <button
            onClick={fetchReports}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-[#EF7B55] transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        )}
      </div>

      {/* Children Summary Banner — only when multiple children exist */}
      {!loading && !error && allChildren.length > 1 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-[#EF7B55]" />
            <span className="text-sm font-semibold text-slate-700">Your Children</span>
            <span className="ml-auto text-xs text-slate-400 font-medium">{allChildren.length} registered</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {allChildren.map((child) => {
              const colorIdx = childColorMap[child.id] ?? 0;
              const isSelected = selectedChild === String(child.id);
              const reportCount = reports.filter(r => r.children.some(c => c.id === child.id)).length;
              return (
                <button
                  key={child.id}
                  onClick={() => setSelectedChild(isSelected ? "" : String(child.id))}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                    isSelected
                      ? "border-[#EF7B55]/40 bg-[#EF7B55]/10 text-[#EF7B55]"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white"
                  }`}
                >
                  <ChildAvatar child={child} colorIdx={colorIdx} size="sm" />
                  <div className="text-left">
                    <p className="text-[13px] font-semibold leading-tight">{child.name}</p>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      {child.classroom || child.admission_no || ""}
                      {child.classroom && child.admission_no ? ` · ${child.admission_no}` : ""}
                    </p>
                  </div>
                  <span className={`ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isSelected ? "bg-[#EF7B55]/20 text-[#EF7B55]" : "bg-slate-200 text-slate-500"
                  }`}>
                    {reportCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 bg-[#EF7B55]/10 rounded-2xl flex items-center justify-center">
            <Image src="/texagon-logo.png" alt="Techxagon" width={36} height={36} className="object-contain animate-pulse" />
          </div>
          <Loader2 className="w-6 h-6 text-[#EF7B55] animate-spin" />
          <p className="text-sm text-slate-500">Loading your reports…</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-slate-700">Failed to load reports</p>
            <p className="text-sm text-slate-500 mt-0.5">{error}</p>
            <button onClick={fetchReports} className="mt-3 text-sm text-[#EF7B55] hover:underline font-medium">Try again</button>
          </div>
        </div>
      )}

      {/* Empty State — no reports at all */}
      {!loading && !error && reports.length === 0 && (
        <div className="space-y-6">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#EF7B55] via-[#F79771] to-[#EF9955] rounded-2xl p-8 text-white shadow-lg">
            <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
              <svg viewBox="0 0 200 200" fill="none"><circle cx="150" cy="50" r="120" fill="white" /></svg>
            </div>
            <div className="relative z-10 flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Image src="/texagon-logo.png" alt="Techxagon" width={40} height={40} className="object-contain brightness-0 invert" />
                </div>
              </div>
              <div>
                <p className="text-white/80 text-xs font-semibold tracking-widest uppercase mb-1">Techxagon Academy</p>
                <h2 className="text-2xl font-bold mb-2">No Reports Yet</h2>
                <p className="text-white/80 text-sm leading-relaxed max-w-md">
                  Your children&apos;s teachers haven&apos;t published any reports yet. When a teacher shares a report link with you, follow the link and you&apos;ll be taken straight to the report in this dashboard.
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: ClipboardList, title: "CBT Results", desc: "See your child's test scores and performance across all assessments", color: "from-blue-500 to-blue-600" },
              { icon: Code, title: "Coding Projects", desc: "Review grades and feedback on coding assignments and projects", color: "from-purple-500 to-purple-600" },
              { icon: Award, title: "Teacher's Notes", desc: "Read personalised remarks and observations from the teacher", color: "from-[#EF7B55] to-[#d96a44]" },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-3 shadow-sm`}>
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm font-semibold text-slate-700 mb-1">{item.title}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reports List with Filters */}
      {!loading && !error && reports.length > 0 && (
        <div className="space-y-4">

          {/* Search + Filter Bar */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search reports by name, course, or child…"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#EF7B55]/30 focus:border-[#EF7B55] transition placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter pills */}
            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex items-center gap-1 text-xs text-slate-400 font-medium pr-1">
                <Filter className="w-3.5 h-3.5" /> Filter:
              </div>

              {/* Child filter */}
              {allChildren.length > 1 && (
                <FilterDropdown
                  label="All Children"
                  value={selectedChild}
                  icon={GraduationCap}
                  onChange={setSelectedChild}
                  options={[
                    { value: "", label: "All Children" },
                    ...allChildren.map(c => ({
                      value: String(c.id),
                      label: c.name + (c.classroom ? ` (${c.classroom})` : ""),
                    })),
                  ]}
                />
              )}

              {/* Course filter */}
              {allCourses.length > 1 && (
                <FilterDropdown
                  label="All Courses"
                  value={selectedCourse}
                  icon={BookOpen}
                  onChange={setSelectedCourse}
                  options={[
                    { value: "", label: "All Courses" },
                    ...allCourses.map(c => ({ value: c, label: c })),
                  ]}
                />
              )}

              {/* Sort */}
              <button
                onClick={() => setSortOrder(s => s === "newest" ? "oldest" : "newest")}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:border-slate-300 transition-all"
              >
                {sortOrder === "newest"
                  ? <><SortDesc className="w-3.5 h-3.5" /><span className="hidden sm:inline">Newest First</span></>
                  : <><SortAsc className="w-3.5 h-3.5" /><span className="hidden sm:inline">Oldest First</span></>
                }
              </button>

              {/* Clear filters */}
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors border border-transparent hover:border-red-100"
                >
                  <X className="w-3.5 h-3.5" /> Clear
                </button>
              )}

              {/* Results count */}
              <span className="ml-auto text-xs text-slate-400 font-medium hidden sm:block">
                {filtered.length} of {reports.length}
              </span>
            </div>
          </div>

          {/* No results for filters */}
          {filtered.length === 0 && (
            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-10 text-center space-y-3">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto">
                <Search className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-600">No reports match your filters</p>
              <p className="text-xs text-slate-400">Try adjusting your search or filters</p>
              <button onClick={clearFilters} className="text-sm text-[#EF7B55] hover:underline font-medium mt-1">
                Clear all filters
              </button>
            </div>
          )}

          {/* Report Cards */}
          <div className="space-y-3">
            {filtered.map((report) => (
              <Link
                key={report.share_token}
                href={`/parent/reports/${report.share_token}`}
                className="block group"
              >
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-[#EF7B55]/20 transition-all duration-200">
                  <div className="flex items-start gap-4">
                    {/* Org logo or fallback icon */}
                    <div className="flex-shrink-0">
                      {report.organization_logo ? (
                        <img
                          src={report.organization_logo}
                          alt={report.organization_name}
                          className="w-12 h-12 rounded-xl object-contain bg-slate-50 border border-slate-100 p-1"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#EF7B55] to-[#F79771] flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          {/* Title + org */}
                          <p className="font-bold text-slate-800 group-hover:text-[#EF7B55] transition-colors truncate leading-tight">
                            {report.title}
                          </p>
                          {report.organization_name && (
                            <p className="text-[11px] text-slate-400 font-medium mt-0.5 truncate">{report.organization_name}</p>
                          )}

                          {/* Meta row */}
                          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-slate-500">
                            {report.course_name && (
                              <span className="flex items-center gap-1">
                                <BookOpen className="w-3 h-3" />{report.course_name}
                              </span>
                            )}
                            {report.period_start && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />{report.period_start}
                                {report.period_end ? ` — ${report.period_end}` : ""}
                              </span>
                            )}
                            {report.published_at && (
                              <span className="text-slate-400">
                                Published {formatDate(report.published_at)}
                              </span>
                            )}
                          </div>

                          {/* Children chips */}
                          {report.children.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2.5 items-center">
                              {report.children.length > 1 && (
                                <div className="flex -space-x-2 mr-1">
                                  {report.children.slice(0, 4).map(child => (
                                    <ChildAvatar
                                      key={child.id}
                                      child={child}
                                      colorIdx={childColorMap[child.id] ?? 0}
                                      size="sm"
                                    />
                                  ))}
                                  {report.children.length > 4 && (
                                    <div className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[9px] font-bold text-slate-500">
                                      +{report.children.length - 4}
                                    </div>
                                  )}
                                </div>
                              )}
                              {report.children.map(child => (
                                <span
                                  key={child.id}
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                    selectedChild === String(child.id)
                                      ? "bg-[#EF7B55]/15 text-[#EF7B55] ring-1 ring-[#EF7B55]/30"
                                      : "bg-slate-100 text-slate-600"
                                  }`}
                                >
                                  <GraduationCap className="w-2.5 h-2.5" />
                                  {child.name}
                                  {child.classroom && (
                                    <span className="text-slate-400 font-normal">· {child.classroom}</span>
                                  )}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Arrow + badge */}
                        <div className="flex-shrink-0 flex flex-col items-end gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-semibold uppercase tracking-wide hidden sm:block">
                            Published
                          </span>
                          <div className="w-8 h-8 rounded-lg bg-slate-50 group-hover:bg-[#EF7B55]/10 flex items-center justify-center transition-colors mt-auto">
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#EF7B55] transition-colors" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Footer count on mobile */}
          <p className="text-center text-xs text-slate-400 sm:hidden">
            Showing {filtered.length} of {reports.length} reports
          </p>
        </div>
      )}
    </div>
  );
}

"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Check, ChevronLeft, ChevronRight, ChevronsUpDown,
  Search, Filter, RotateCcw, Code2, Clock, CheckCircle2, AlertCircle, Layers,
  Download, GraduationCap,
} from "lucide-react";
import { Spinner } from "../ui/spinner";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "../ui/command";
import { cn } from "@/lib/utils";

interface Submission {
  id: number;
  title?: string | null;
  created_at?: string;
  status: "graded" | "submitted" | "revised";
  student_name: string;
  lesson_title: string;
  course_name: string;
  class_name: string | null;
  language: string;
  score?: number | null;
  file_count?: number;
  file_languages?: string[];
  file_names?: string[];
}

interface FilterOption { id: number; name: string; }

const STATUS_CONFIG: Record<string, { icon: React.ElementType; label: string; bg: string; text: string; dot: string }> = {
  submitted: { icon: Clock, label: "Pending", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  graded: { icon: CheckCircle2, label: "Graded", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  revised: { icon: AlertCircle, label: "Revised", bg: "bg-sky-50", text: "text-sky-700", dot: "bg-sky-500" },
};

const LANG_COLORS: Record<string, string> = {
  python: "from-blue-50 to-blue-100/60 text-blue-600 border-blue-200",
  javascript: "from-yellow-50 to-amber-100/60 text-amber-700 border-amber-200",
  html: "from-orange-50 to-orange-100/60 text-orange-600 border-orange-200",
  css: "from-purple-50 to-purple-100/60 text-purple-600 border-purple-200",
  java: "from-red-50 to-red-100/60 text-red-600 border-red-200",
};

const SubmissionList: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [courses, setCourses] = useState<FilterOption[]>([]);
  const [classes, setClasses] = useState<FilterOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<{ course_id?: number; classroom_id?: number; startDate?: string; endDate?: string; search?: string }>({});
  const [draftFilters, setDraftFilters] = useState<typeof filters>({});
  const [actionInProgress, setActionInProgress] = useState<"search" | "apply" | null>(null);
  const lastActionRef = useRef<"search" | "apply" | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const pageSize = 10;

  const handleDownload = async (sub: Submission) => {
    setDownloadingId(sub.id);
    try {
      const res = await fetch(`/api/teacher/code/submissions/${sub.id}/download`);
      if (!res.ok) throw new Error(`Download failed: ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      // Extract filename from Content-Disposition header, or build a fallback
      const cd = res.headers.get("content-disposition");
      const match = cd?.match(/filename="?([^"]+)"?/);
      a.download = match?.[1] || `${sub.student_name}_${sub.title || "submission"}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
    } finally {
      setDownloadingId(null);
    }
  };

  const fetchDetailForId = async (id: number): Promise<{ course?: { id: number; name: string }; classroom?: { id: number; name: string } } | null> => {
    try {
      const res = await fetch(`/api/teacher/code/submissions/${id}`);
      if (!res.ok) return null;
      return await res.json();
    } catch { return null; }
  };

  const extractFilters = async (results: Submission[]) => {
    const uniqueCourses = [...new Set(results.map((s) => s.course_name).filter(Boolean))];
    const uniqueClasses = [...new Set(results.map((s) => s.class_name).filter(Boolean))];
    const coursePromises = uniqueCourses.map(async (name) => {
      const sampleSub = results.find((s) => s.course_name === name);
      if (!sampleSub) return null;
      const detail = await fetchDetailForId(sampleSub.id);
      return detail?.course ? { id: detail.course.id, name } : null;
    });
    const classPromises = uniqueClasses.map(async (name) => {
      const sampleSub = results.find((s) => s.class_name === name);
      if (!sampleSub) return null;
      const detail = await fetchDetailForId(sampleSub.id);
      return detail?.classroom ? { id: detail.classroom.id, name } : null;
    });
    const courseResults = (await Promise.all(coursePromises)).filter((c): c is { id: number; name: string } => c !== null);
    const classResults = (await Promise.all(classPromises)).filter((c): c is { id: number; name: string } => c !== null);
    setCourses(courseResults.sort((a, b) => a.name.localeCompare(b.name)));
    setClasses(classResults.sort((a, b) => a.name.localeCompare(b.name)));
  };

  const formatDate = (iso?: string) => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/teacher/code/submissions?page_size=100`);
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        const data = await res.json();
        const results: Submission[] = data.results || [];
        await extractFilters(results);
        setSubmissions(results.slice(0, pageSize));
      } catch (err: any) {
        console.error("Load Error:", err.message);
      } finally { setLoading(false); }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (courses.length === 0 && classes.length === 0) return;
    const fetchPage = async () => {
      setLoading(true);
      setActionInProgress(lastActionRef.current);
      const params = new URLSearchParams();
      if (filters.course_id) params.append("course_id", filters.course_id.toString());
      if (filters.classroom_id) params.append("classroom_id", filters.classroom_id.toString());
      if (filters.startDate) params.append("created_at__gte", filters.startDate);
      if (filters.endDate) params.append("created_at__lte", filters.endDate);
      if (filters.search) params.append("search", filters.search);
      params.append("page", currentPage.toString());
      params.append("page_size", pageSize.toString());
      try {
        const res = await fetch(`/api/teacher/code/submissions?${params}`);
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setSubmissions(data.results || []);
      } catch { setSubmissions([]); }
      finally { setLoading(false); lastActionRef.current = null; setActionInProgress(null); }
    };
    fetchPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filters, courses.length, classes.length]);

  const hasNext = submissions.length === pageSize;

  const applyFilters = () => { lastActionRef.current = "apply"; setActionInProgress("apply"); setFilters({ ...draftFilters }); setCurrentPage(1); };
  const resetFilters = () => { lastActionRef.current = "apply"; setActionInProgress("apply"); setDraftFilters({}); setFilters({}); setCurrentPage(1); };

  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { lastActionRef.current = "search"; setActionInProgress("search"); setFilters((p) => ({ ...p, search: draftFilters.search })); setCurrentPage(1); }
  };
  const handleSearchClick = () => { lastActionRef.current = "search"; setActionInProgress("search"); setFilters((p) => ({ ...p, search: draftFilters.search })); setCurrentPage(1); };

  if (loading && submissions.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="md" className="text-[#EF7B55]" />
          <p className="text-sm text-slate-400 animate-pulse">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search + Filter Toggle */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={draftFilters.search || ""}
            onChange={(e) => setDraftFilters((p) => ({ ...p, search: e.target.value || undefined }))}
            onKeyDown={onSearchKeyDown}
            placeholder="Search by student name, title..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#EF7B55]/30 focus:border-[#EF7B55]/40 transition-all"
          />
        </div>
        <Button onClick={handleSearchClick} disabled={actionInProgress !== null} className="bg-[#EF7B55] hover:bg-[#F79771] text-white rounded-xl px-4 h-[42px]">
          {actionInProgress === "search" ? <Spinner size="sm" /> : <Search className="w-4 h-4" />}
        </Button>
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className={cn("rounded-xl border-slate-200 h-[42px] px-3 hover:bg-slate-50", showFilters && "bg-[#EF7B55]/5 border-[#EF7B55]/30 text-[#EF7B55]")}>
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {/* Collapsible Filters */}
      {showFilters && (
        <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Class Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between bg-white border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg h-10 text-sm">
                  {draftFilters.classroom_id ? classes.find((c) => c.id === draftFilters.classroom_id)?.name : "All Classes"}
                  <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search class..." className="h-9" />
                  <CommandEmpty>No class found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem value="All Classes" onSelect={() => setDraftFilters((p) => ({ ...p, classroom_id: undefined }))}>
                      <Check className={cn("mr-2 h-4 w-4", !draftFilters.classroom_id ? "opacity-100" : "opacity-0")} />All Classes
                    </CommandItem>
                    {classes.map((c) => (
                      <CommandItem key={c.id} value={c.name} onSelect={() => setDraftFilters((p) => ({ ...p, classroom_id: c.id }))}>
                        <Check className={cn("mr-2 h-4 w-4", draftFilters.classroom_id === c.id ? "opacity-100" : "opacity-0")} />{c.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Course Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between bg-white border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg h-10 text-sm">
                  {draftFilters.course_id ? courses.find((c) => c.id === draftFilters.course_id)?.name : "All Courses"}
                  <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search course..." className="h-9" />
                  <CommandEmpty>No course found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem value="All Courses" onSelect={() => setDraftFilters((p) => ({ ...p, course_id: undefined }))}>
                      <Check className={cn("mr-2 h-4 w-4", !draftFilters.course_id ? "opacity-100" : "opacity-0")} />All Courses
                    </CommandItem>
                    {courses.map((c) => (
                      <CommandItem key={c.id} value={c.name} onSelect={() => setDraftFilters((p) => ({ ...p, course_id: c.id }))}>
                        <Check className={cn("mr-2 h-4 w-4", draftFilters.course_id === c.id ? "opacity-100" : "opacity-0")} />{c.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Date Filters */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">From</label>
              <input type="date" value={draftFilters.startDate || ""} onChange={(e) => setDraftFilters((p) => ({ ...p, startDate: e.target.value || undefined }))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#EF7B55]/30 h-10" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">To</label>
              <input type="date" value={draftFilters.endDate || ""} onChange={(e) => setDraftFilters((p) => ({ ...p, endDate: e.target.value || undefined }))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#EF7B55]/30 h-10" />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Button onClick={applyFilters} disabled={actionInProgress !== null} className="bg-[#EF7B55] hover:bg-[#F79771] text-white rounded-lg h-9 px-4 text-sm">
              {actionInProgress === "apply" ? <Spinner size="sm" /> : "Apply Filters"}
            </Button>
            <Button variant="ghost" onClick={resetFilters} disabled={actionInProgress !== null} className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg h-9 px-4 text-sm">
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />Reset
            </Button>
          </div>
        </div>
      )}

      {/* Stats Bar */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        {["submitted", "graded", "revised"].map((s) => {
          const cfg = STATUS_CONFIG[s];
          const Icon = cfg.icon;
          return (
            <div key={s} className={cn("flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-100", cfg.bg)}>
              <Icon className={cn("w-3.5 h-3.5", cfg.text)} />
              <span className={cn("text-xs font-medium", cfg.text)}>{cfg.label}</span>
            </div>
          );
        })}
      </div>

      {/* MOBILE CARDS */}
      <div className="space-y-3 sm:hidden">
        {submissions.map((s) => {
          const sCfg = STATUS_CONFIG[s.status] || STATUS_CONFIG.submitted;
          const lColor = LANG_COLORS[s.language] || LANG_COLORS.python;
          return (
            <div key={s.id} className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 hover:border-[#EF7B55]/30 hover:shadow-sm transition-all group">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-800 text-sm">{s.student_name}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{formatDate(s.created_at)}</p>
                </div>
                <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium", sCfg.bg, sCfg.text)}>
                  <span className={cn("w-1.5 h-1.5 rounded-full", sCfg.dot)} />{sCfg.label}
                </span>
              </div>
              <div className="text-sm space-y-1.5">
                <p><span className="text-slate-400">Title:</span> <span className="text-slate-700">{s.title || "-"}</span></p>
                <p><span className="text-slate-400">Lesson:</span> <span className="text-slate-700">{s.lesson_title}</span></p>
                <div className="flex items-center gap-2 flex-wrap">
                  {(s.file_languages && s.file_languages.length > 1) ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono border bg-gradient-to-r from-slate-50 to-slate-100/60 text-slate-600 border-slate-200">
                      <Layers className="w-3 h-3" />{s.file_count || s.file_languages.length} files
                    </span>
                  ) : (
                    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono border bg-gradient-to-r", lColor)}>
                      <Code2 className="w-3 h-3" />{s.language}
                    </span>
                  )}
                  {s.score != null && <span className="text-xs text-emerald-600 font-mono font-semibold">{s.score}/100</span>}
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button size="sm" className="flex-1 bg-[#EF7B55] hover:bg-[#F79771] text-white rounded-lg text-xs h-8" asChild>
                  <a href={`/teacher/submissions/${s.id}/grade`}><GraduationCap className="w-3.5 h-3.5 mr-1" />Grade</a>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs h-8"
                  onClick={() => handleDownload(s)}
                  disabled={downloadingId === s.id}
                >
                  {downloadingId === s.id ? (
                    <Spinner size="sm" />
                  ) : (
                    <><Download className="w-3.5 h-3.5 mr-1" />Download</>
                  )}
                </Button>
              </div>
            </div>
          );
        })}
        {submissions.length === 0 && !loading && (
          <div className="text-center py-12">
            <Code2 className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No submissions found.</p>
          </div>
        )}
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden sm:block">
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[800px] table-auto">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                {["Student", "Title", "Language", "Lesson", "Class", "Course", "Submitted", "Status", "Score", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {submissions.map((s) => {
                const sCfg = STATUS_CONFIG[s.status] || STATUS_CONFIG.submitted;
                const lColor = LANG_COLORS[s.language] || LANG_COLORS.python;
                return (
                  <tr key={s.id} className="hover:bg-[#EF7B55]/[0.02] transition-colors group">
                    <td className="px-4 py-3 text-sm text-slate-800 font-medium">{s.student_name}</td>
                    <td className="px-4 py-3 text-sm text-slate-500 max-w-[150px] truncate">{s.title || "-"}</td>
                    <td className="px-4 py-3">
                      {(s.file_languages && s.file_languages.length > 1) ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono border bg-gradient-to-r from-slate-50 to-slate-100/60 text-slate-600 border-slate-200">
                          <Layers className="w-3 h-3" />{s.file_count || s.file_languages.length} files
                        </span>
                      ) : (
                        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono border bg-gradient-to-r", lColor)}>
                          <Code2 className="w-3 h-3" />{s.language}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500 max-w-[140px] truncate">{s.lesson_title}</td>
                    <td className="px-4 py-3 text-sm text-slate-400">{s.class_name ?? "-"}</td>
                    <td className="px-4 py-3 text-sm text-slate-400 max-w-[120px] truncate">{s.course_name}</td>
                    <td className="px-4 py-3 text-xs text-slate-400 font-mono">{formatDate(s.created_at)}</td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium", sCfg.bg, sCfg.text)}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", sCfg.dot)} />{sCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-mono">
                      {s.score != null ? <span className="text-emerald-600 font-semibold">{s.score}</span> : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" className="h-7 px-3 bg-[#EF7B55] hover:bg-[#F79771] text-white rounded-lg text-[11px]" asChild>
                          <a href={`/teacher/submissions/${s.id}/grade`}>Grade</a>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-3 border-slate-200 text-slate-500 hover:bg-slate-50 rounded-lg text-[11px]"
                          onClick={() => handleDownload(s)}
                          disabled={downloadingId === s.id}
                        >
                          {downloadingId === s.id ? (
                            <Spinner size="sm" />
                          ) : (
                            <><Download className="w-3 h-3 mr-1" />Download</>
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {submissions.length === 0 && !loading && (
            <div className="text-center py-16">
              <Code2 className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-400">No submissions found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {submissions.length > 0 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-400 font-mono">Page {currentPage}</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => { lastActionRef.current = null; setActionInProgress(null); setCurrentPage((p) => Math.max(1, p - 1)); }}
              disabled={currentPage === 1} className="h-8 w-8 rounded-lg border-slate-200 bg-white hover:bg-slate-50 text-slate-500 disabled:opacity-30">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => { lastActionRef.current = null; setActionInProgress(null); setCurrentPage((p) => p + 1); }}
              disabled={!hasNext} className="h-8 w-8 rounded-lg border-slate-200 bg-white hover:bg-slate-50 text-slate-500 disabled:opacity-30">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionList;

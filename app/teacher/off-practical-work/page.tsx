"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  ClipboardList, Plus, ArrowLeft, BookOpen, Search,
  Users, Download, CheckCircle2, Clock, Star,
  Trash2, Edit3, BarChart2, ChevronLeft, ChevronRight,
  Save, RefreshCw, Filter, X, Award, FileText,
  CheckCheck, AlertCircle, Loader2, Eye,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OPW {
  id: number;
  title: string;
  course: number;
  course_name: string;
  assessment_type: string;
  assessment_type_display: string;
  max_score: string;
  conducted_at: string | null;
  description: string;
  visibility: string;
  score_count: number;
  graded_count: number;
  pending_count: number;
  average_score: number | null;
  created_at: string;
}

interface Course {
  id: number;
  title: string;
  course_type: string;
}

interface Classroom {
  id: number;
  name: string;
}

interface StudentScore {
  student_id: number;
  student_name: string;
  student_email: string;
  classroom_id: number | null;
  classroom_name: string | null;
  score_id: number | null;
  score: string | null;
  feedback: string | null;
  recorded_at: string | null;
}

type View = "list" | "create" | "edit" | "scores";
type ScoreTab = "classroom" | "search";

const TYPE_COLORS: Record<string, string> = {
  assignment: "bg-blue-100 text-blue-700",
  assessment: "bg-orange-100 text-orange-700",
  exam: "bg-red-100 text-red-700",
  quiz: "bg-amber-100 text-amber-700",
  project: "bg-emerald-100 text-emerald-700",
  practical: "bg-teal-100 text-teal-700",
};

const TYPE_OPTIONS = [
  { value: "assignment", label: "Assignment" },
  { value: "assessment", label: "Assessment" },
  { value: "exam", label: "Exam" },
  { value: "quiz", label: "Quiz" },
  { value: "project", label: "Project" },
  { value: "practical", label: "Practical" },
];

// ─── Main Component ────────────────────────────────────────────────────────────

export default function OffPracticalWorkPage() {
  const [view, setView] = useState<View>("list");
  const [opwList, setOpwList] = useState<OPW[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOPW, setSelectedOPW] = useState<OPW | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formType, setFormType] = useState("assessment");
  const [formCourse, setFormCourse] = useState("");
  const [formMaxScore, setFormMaxScore] = useState("100");
  const [formDate, setFormDate] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Score entry state
  const [scoreTab, setScoreTab] = useState<ScoreTab>("classroom");
  const [selectedClassroom, setSelectedClassroom] = useState("");
  const [students, setStudents] = useState<StudentScore[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [scoreInputs, setScoreInputs] = useState<Record<number, { score: string; feedback: string; dirty: boolean; saving: boolean; saved: boolean }>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [searchStudents, setSearchStudents] = useState<StudentScore[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [isExporting, setIsExporting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchOPWList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/opw/works");
      if (res.ok) setOpwList(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  const fetchCourses = useCallback(async () => {
    try {
      const res = await fetch("/api/opw/courses");
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
        if (data.length > 0 && !formCourse) setFormCourse(String(data[0].id));
      }
    } catch (e) { console.error(e); }
  }, []);

  const fetchClassrooms = useCallback(async (courseId: string) => {
    if (!courseId) return;
    try {
      const res = await fetch(`/api/opw/classrooms?course_id=${courseId}`);
      if (res.ok) setClassrooms(await res.json());
      else setClassrooms([]);
    } catch (e) { console.error(e); setClassrooms([]); }
  }, []);

  const fetchStudents = useCallback(async (opwId: number, page = 1, classroom = "") => {
    setStudentsLoading(true);
    try {
      let url = `/api/opw/works/${opwId}/students?page=${page}&page_size=15`;
      if (classroom) url += `&classroom=${classroom}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const list: StudentScore[] = data.results || [];
        setStudents(list);
        setPagination({
          page: data.pagination?.page ?? 1,
          pages: data.pagination?.pages ?? 1,
          total: data.pagination?.total ?? 0,
        });
        // Populate score inputs with existing scores
        const inputs: typeof scoreInputs = {};
        list.forEach(s => {
          inputs[s.student_id] = {
            score: s.score ?? "",
            feedback: s.feedback ?? "",
            dirty: false,
            saving: false,
            saved: s.score !== null,
          };
        });
        setScoreInputs(prev => ({ ...inputs, ...Object.fromEntries(Object.entries(prev).filter(([k]) => !inputs[Number(k)])) }));
      }
    } catch (e) { console.error(e); }
    finally { setStudentsLoading(false); }
  }, []);

  const fetchSearch = useCallback(async (opwId: number, q: string) => {
    if (!q.trim()) { setSearchStudents([]); return; }
    setSearchLoading(true);
    try {
      const res = await fetch(`/api/opw/works/${opwId}/students?search=${encodeURIComponent(q)}&page_size=20`);
      if (res.ok) {
        const data = await res.json();
        const list: StudentScore[] = data.results || [];
        setSearchStudents(list);
        // Merge into score inputs
        const inputs: typeof scoreInputs = {};
        list.forEach(s => {
          if (!scoreInputs[s.student_id]) {
            inputs[s.student_id] = { score: s.score ?? "", feedback: s.feedback ?? "", dirty: false, saving: false, saved: s.score !== null };
          }
        });
        setScoreInputs(prev => ({ ...prev, ...inputs }));
      }
    } catch (e) { console.error(e); }
    finally { setSearchLoading(false); }
  }, [scoreInputs]);

  useEffect(() => { fetchOPWList(); fetchCourses(); }, []);

  useEffect(() => {
    if (formCourse) fetchClassrooms(formCourse);
  }, [formCourse]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const openCreate = () => {
    setFormTitle(""); setFormType("assessment"); setFormMaxScore("100");
    setFormDate(""); setFormDescription("");
    if (courses.length > 0) setFormCourse(String(courses[0].id));
    setSelectedOPW(null);
    setView("create");
  };

  const openEdit = (opw: OPW) => {
    setSelectedOPW(opw);
    setFormTitle(opw.title);
    setFormType(opw.assessment_type);
    setFormCourse(String(opw.course));
    setFormMaxScore(opw.max_score);
    setFormDate(opw.conducted_at ?? "");
    setFormDescription(opw.description ?? "");
    setView("edit");
  };

  const openScores = (opw: OPW) => {
    setSelectedOPW(opw);
    setScoreTab("classroom");
    setSelectedClassroom("");
    setStudents([]);
    setSearchStudents([]);
    setSearchQuery("");
    setScoreInputs({});
    // Fetch classrooms for the OPW course
    fetchClassrooms(String(opw.course));
    fetchStudents(opw.id, 1, "");
    setView("scores");
  };

  const handleSubmit = async () => {
    if (!formTitle.trim()) { alert("Title is required."); return; }
    if (!formCourse) { alert("Please select a course."); return; }
    setIsSubmitting(true);
    try {
      const payload = {
        title: formTitle.trim(),
        assessment_type: formType,
        course: parseInt(formCourse),
        max_score: parseFloat(formMaxScore) || 100,
        conducted_at: formDate || null,
        description: formDescription.trim(),
      };
      const url = view === "edit" && selectedOPW ? `/api/opw/works/${selectedOPW.id}` : "/api/opw/works";
      const method = view === "edit" ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        await fetchOPWList();
        setView("list");
      } else {
        const err = await res.json().catch(() => ({}));
        alert(`Failed: ${JSON.stringify(err)}`);
      }
    } catch (e) { console.error(e); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/opw/works/${id}`, { method: "DELETE" });
      if (res.ok || res.status === 204) {
        setOpwList(prev => prev.filter(o => o.id !== id));
        setDeleteConfirm(null);
      }
    } catch (e) { console.error(e); }
  };

  const updateScoreInput = (studentId: number, field: "score" | "feedback", value: string) => {
    setScoreInputs(prev => ({
      ...prev,
      [studentId]: { ...(prev[studentId] || { score: "", feedback: "", saving: false, saved: false }), [field]: value, dirty: true, saved: false },
    }));
  };

  const saveScore = async (opwId: number, studentId: number) => {
    const inp = scoreInputs[studentId];
    if (!inp) return;
    setScoreInputs(prev => ({ ...prev, [studentId]: { ...prev[studentId], saving: true } }));
    try {
      const res = await fetch(`/api/opw/works/${opwId}/scores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scores: [{ student_id: studentId, score: inp.score !== "" ? parseFloat(inp.score) : null, feedback: inp.feedback }],
        }),
      });
      if (res.ok) {
        setScoreInputs(prev => ({ ...prev, [studentId]: { ...prev[studentId], saving: false, saved: true, dirty: false } }));
        // Refresh OPW stats
        fetchOPWList();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(`Save failed: ${err?.errors?.[0]?.error || "Unknown error"}`);
        setScoreInputs(prev => ({ ...prev, [studentId]: { ...prev[studentId], saving: false } }));
      }
    } catch (e) {
      console.error(e);
      setScoreInputs(prev => ({ ...prev, [studentId]: { ...prev[studentId], saving: false } }));
    }
  };

  const saveAllVisible = async () => {
    if (!selectedOPW) return;
    const displayList = scoreTab === "classroom" ? students : searchStudents;
    const dirty = displayList.filter(s => scoreInputs[s.student_id]?.dirty);
    if (dirty.length === 0) return;

    const payload = dirty.map(s => ({
      student_id: s.student_id,
      score: scoreInputs[s.student_id]?.score !== "" ? parseFloat(scoreInputs[s.student_id]?.score) : null,
      feedback: scoreInputs[s.student_id]?.feedback ?? "",
    }));

    // Mark all as saving
    const saving: typeof scoreInputs = {};
    dirty.forEach(s => { saving[s.student_id] = { ...scoreInputs[s.student_id], saving: true }; });
    setScoreInputs(prev => ({ ...prev, ...saving }));

    try {
      const res = await fetch(`/api/opw/works/${selectedOPW.id}/scores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scores: payload }),
      });
      const data = await res.json();
      const saved: typeof scoreInputs = {};
      dirty.forEach(s => { saved[s.student_id] = { ...scoreInputs[s.student_id], saving: false, saved: true, dirty: false }; });
      setScoreInputs(prev => ({ ...prev, ...saved }));
      fetchOPWList();
    } catch (e) { console.error(e); }
  };

  const handleExport = async () => {
    if (!selectedOPW) return;
    setIsExporting(true);
    try {
      const res = await fetch(`/api/opw/works/${selectedOPW.id}/export`);
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `OPW_${selectedOPW.title.replace(/\s+/g, "_")}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (e) { console.error(e); }
    finally { setIsExporting(false); }
  };

  // Search debounce
  useEffect(() => {
    if (!selectedOPW || scoreTab !== "search") return;
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => fetchSearch(selectedOPW.id, searchQuery), 400);
    return () => { if (searchDebounce.current) clearTimeout(searchDebounce.current); };
  }, [searchQuery, selectedOPW, scoreTab]);

  // ── Render helpers ─────────────────────────────────────────────────────────

  const ScoreRow = ({ student, opwId }: { student: StudentScore; opwId: number }) => {
    const inp = scoreInputs[student.student_id] ?? { score: "", feedback: "", dirty: false, saving: false, saved: false };
    const maxS = parseFloat(selectedOPW?.max_score ?? "100");
    const scoreNum = parseFloat(inp.score);
    const pct = !isNaN(scoreNum) && scoreNum >= 0 ? Math.round((scoreNum / maxS) * 100) : null;
    const gradeColor = pct == null ? "text-slate-400" : pct >= 80 ? "text-emerald-600" : pct >= 50 ? "text-amber-600" : "text-red-500";

    return (
      <div className={`flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl border transition-all duration-200 ${inp.saved ? "bg-emerald-50/60 border-emerald-200" : inp.dirty ? "bg-amber-50/40 border-amber-200" : "bg-white border-slate-100 hover:border-slate-200"}`}>
        {/* Avatar + name */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#EF7B55] to-orange-300 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {student.student_name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{student.student_name}</p>
            <p className="text-[11px] text-slate-400 truncate">{student.classroom_name ?? "No classroom"}</p>
          </div>
        </div>

        {/* Score input */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <Input
              type="number"
              min={0}
              max={maxS}
              step="0.5"
              value={inp.score}
              onChange={e => updateScoreInput(student.student_id, "score", e.target.value)}
              placeholder="Score"
              className="w-24 h-9 text-sm rounded-xl border-slate-200 text-center pr-1"
            />
            {pct !== null && (
              <span className={`absolute -top-2 -right-2 text-[10px] font-bold ${gradeColor} bg-white rounded-full px-1 border`}>
                {pct}%
              </span>
            )}
          </div>

          {/* Save button */}
          <Button
            size="sm"
            disabled={!inp.dirty || inp.saving}
            onClick={() => saveScore(opwId, student.student_id)}
            className={`h-9 w-9 p-0 rounded-xl transition-all ${inp.saved && !inp.dirty ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200 border-0" : "bg-[#EF7B55] hover:bg-[#d96a44] text-white"}`}
          >
            {inp.saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : inp.saved && !inp.dirty ? <CheckCheck className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>
    );
  };

  // ── Views ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <Spinner size="lg" className="text-[#EF7B55]" />
      </div>
    );
  }

  // ── LIST VIEW ──────────────────────────────────────────────────────────────
  if (view === "list") return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-[#e26d47] p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 h-64 w-64 -translate-y-12 translate-x-12 rounded-full bg-[#EF7B55]/20 blur-3xl" />
        <div className="absolute left-1/4 bottom-0 h-40 w-40 translate-y-12 rounded-full bg-[#EF7B55]/20 blur-3xl" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <Badge className="bg-[#EF7B55]/20 text-[#ffae91] border border-[#EF7B55]/30 px-3 py-1 font-semibold text-xs tracking-wide">
              📋 Offline Record Keeping
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-orange-50 to-orange-200 bg-clip-text text-transparent">
              Off-Practical Work
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Record scores for assignments and assessments conducted outside the LMS — physical exams, field tests, classroom papers — and keep everything tracked in one place.
            </p>
          </div>
          <Button
            onClick={openCreate}
            className="h-11 bg-white text-[#d96a44] hover:bg-orange-50 font-bold rounded-xl shadow-md px-5 flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            New OPW Record
          </Button>
        </div>
      </div>

      {/* Stats bar */}
      {opwList.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Records", value: opwList.length, icon: FileText, color: "text-[#EF7B55] bg-orange-50" },
            { label: "Total Scored", value: opwList.reduce((a, o) => a + o.graded_count, 0), icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
            { label: "Pending Scores", value: opwList.reduce((a, o) => a + o.pending_count, 0), icon: Clock, color: "text-amber-600 bg-amber-50" },
            { label: "Avg Score", value: (() => { const scored = opwList.filter(o => o.average_score !== null); return scored.length ? (scored.reduce((a, o) => a + (o.average_score ?? 0), 0) / scored.length).toFixed(1) : "—"; })(), icon: Star, color: "text-blue-600 bg-blue-50" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-800">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* OPW Grid */}
      <div className="bg-white/80 backdrop-blur-md border border-slate-200/50 shadow-lg rounded-2xl p-6 min-h-[400px]">
        {opwList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4">
              <ClipboardList className="w-8 h-8 text-[#EF7B55]" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700">No OPW Records Yet</h3>
            <p className="text-sm mt-1 max-w-sm text-center text-slate-400">Create your first Off-Practical Work record to start logging scores for offline assessments.</p>
            <Button onClick={openCreate} variant="outline" className="mt-6 border-[#EF7B55] text-[#EF7B55] hover:bg-orange-50 rounded-xl">
              Create First Record
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {opwList.map(opw => {
              const maxS = parseFloat(opw.max_score);
              const avgPct = opw.average_score !== null ? Math.round((opw.average_score / maxS) * 100) : null;
              return (
                <div key={opw.id} className="relative overflow-hidden rounded-2xl border border-slate-150 bg-white hover:shadow-md hover:border-[#ffae91] transition-all duration-300 p-5 pl-6 flex flex-col gap-4">
                  {/* Left accent */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#EF7B55] to-[#EF7B55] rounded-l-2xl" />

                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <span className={`inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-full mb-2 ${TYPE_COLORS[opw.assessment_type] || "bg-slate-100 text-slate-600"}`}>
                        {opw.assessment_type_display}
                      </span>
                      <h3 className="font-bold text-slate-800 text-base leading-tight line-clamp-2">{opw.title}</h3>
                      <p className="text-xs text-slate-500 mt-1 truncate flex items-center gap-1">
                        <BookOpen className="w-3 h-3 shrink-0" />
                        {opw.course_name}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-lg font-extrabold text-[#EF7B55]">{opw.max_score}</p>
                      <p className="text-[10px] text-slate-400">max pts</p>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-slate-50 rounded-xl p-2">
                      <p className="text-base font-bold text-slate-800">{opw.graded_count}</p>
                      <p className="text-[10px] text-slate-500">Scored</p>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-2">
                      <p className="text-base font-bold text-amber-600">{opw.pending_count}</p>
                      <p className="text-[10px] text-slate-500">Pending</p>
                    </div>
                    <div className="bg-orange-50 rounded-xl p-2">
                      <p className="text-base font-bold text-[#EF7B55]">{avgPct !== null ? `${avgPct}%` : "—"}</p>
                      <p className="text-[10px] text-slate-500">Avg</p>
                    </div>
                  </div>

                  {/* Conducted date */}
                  {opw.conducted_at && (
                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Conducted {new Date(opw.conducted_at).toLocaleDateString()}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
                    <Button
                      size="sm"
                      onClick={() => openScores(opw)}
                      className="flex-1 h-8 bg-[#EF7B55] hover:bg-[#d96a44] text-white rounded-xl text-xs font-semibold gap-1"
                    >
                      <Users className="w-3.5 h-3.5" /> Enter Scores
                    </Button>
                    <Button
                      size="sm" variant="ghost"
                      onClick={() => openEdit(opw)}
                      className="h-8 w-8 p-0 rounded-xl text-slate-500 hover:text-[#EF7B55] hover:bg-orange-50"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    {deleteConfirm === opw.id ? (
                      <div className="flex gap-1">
                        <Button size="sm" onClick={() => handleDelete(opw.id)} className="h-8 px-2 bg-red-600 text-white rounded-xl text-xs">Confirm</Button>
                        <Button size="sm" variant="ghost" onClick={() => setDeleteConfirm(null)} className="h-8 px-2 rounded-xl text-xs">Cancel</Button>
                      </div>
                    ) : (
                      <Button
                        size="sm" variant="ghost"
                        onClick={() => setDeleteConfirm(opw.id)}
                        className="h-8 w-8 p-0 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  // ── CREATE / EDIT VIEW ─────────────────────────────────────────────────────
  if (view === "create" || view === "edit") return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-right-8 duration-500 pb-20">
      <div className="flex items-center gap-3">
        <Button onClick={() => setView("list")} variant="ghost" size="icon" className="rounded-full w-10 h-10 bg-white border shadow-sm text-slate-600 hover:text-[#EF7B55] hover:bg-orange-50">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{view === "edit" ? "Edit OPW Record" : "New Off-Practical Work"}</h1>
          <p className="text-sm text-slate-500">Record an assignment or assessment conducted outside the LMS.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8 space-y-6">

        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Title <span className="text-red-400">*</span></label>
          <Input
            value={formTitle}
            onChange={e => setFormTitle(e.target.value)}
            placeholder="e.g., Mid-Term Practical Exam — July 2025"
            className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white text-base"
          />
        </div>

        {/* Type + Course */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Assessment Type <span className="text-red-400">*</span></label>
            <select
              value={formType}
              onChange={e => setFormType(e.target.value)}
              className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#EF7B55]"
            >
              {TYPE_OPTIONS.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Target Course <span className="text-red-400">*</span></label>
            <select
              value={formCourse}
              onChange={e => setFormCourse(e.target.value)}
              className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#EF7B55]"
            >
              {courses.length === 0 && <option value="">No courses available</option>}
              {courses.map(c => <option key={c.id} value={String(c.id)}>{c.title}</option>)}
            </select>
          </div>
        </div>

        {/* Max Score + Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Maximum Score</label>
            <Input
              type="number"
              min={1}
              value={formMaxScore}
              onChange={e => setFormMaxScore(e.target.value)}
              className="h-11 rounded-xl border-slate-200 bg-slate-50/50"
              placeholder="100"
            />
            <p className="text-[11px] text-slate-400">Student scores will be entered out of this value.</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Date Conducted (Optional)</label>
            <Input
              type="date"
              value={formDate}
              onChange={e => setFormDate(e.target.value)}
              className="h-11 rounded-xl border-slate-200 bg-slate-50/50"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Notes / Description (Optional)</label>
          <Textarea
            value={formDescription}
            onChange={e => setFormDescription(e.target.value)}
            placeholder="Add any notes about this assessment — topics covered, special instructions, grading rubric, etc."
            className="rounded-xl border-slate-200 bg-slate-50/50 resize-none min-h-[100px]"
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !formTitle.trim() || !formCourse}
          className="w-full h-12 bg-[#EF7B55] hover:bg-[#d96a44] text-white rounded-xl shadow-md font-semibold text-base"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <CheckCircle2 className="w-5 h-5 mr-2" />}
          {view === "edit" ? "Update Record" : "Create OPW Record"}
        </Button>
      </div>
    </div>
  );

  // ── SCORE ENTRY VIEW ───────────────────────────────────────────────────────
  if (view === "scores" && selectedOPW) {
    const maxS = parseFloat(selectedOPW.max_score);
    const dirtyCount = (scoreTab === "classroom" ? students : searchStudents)
      .filter(s => scoreInputs[s.student_id]?.dirty).length;

    return (
      <div className="max-w-5xl mx-auto space-y-5 animate-in fade-in slide-in-from-right-8 duration-500 pb-20">

        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <Button onClick={() => setView("list")} variant="ghost" size="icon" className="rounded-full w-10 h-10 bg-white border shadow-sm text-slate-600 hover:text-[#EF7B55] hover:bg-orange-50 shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-slate-800 truncate">{selectedOPW.title}</h1>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${TYPE_COLORS[selectedOPW.assessment_type] || "bg-slate-100 text-slate-600"}`}>
                {selectedOPW.assessment_type_display}
              </span>
            </div>
            <p className="text-sm text-slate-500">{selectedOPW.course_name} · Max score: <strong>{selectedOPW.max_score}</strong></p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button onClick={handleExport} disabled={isExporting} size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs">
              {isExporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              Export CSV
            </Button>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Scored", value: selectedOPW.graded_count, color: "text-emerald-600 bg-emerald-50" },
            { label: "Pending", value: selectedOPW.pending_count, color: "text-amber-600 bg-amber-50" },
            { label: "Avg %", value: selectedOPW.average_score !== null ? `${Math.round((selectedOPW.average_score / maxS) * 100)}%` : "—", color: "text-[#EF7B55] bg-orange-50" },
          ].map(({ label, value, color }) => (
            <div key={label} className={`rounded-2xl p-3 text-center ${color}`}>
              <p className="text-lg font-extrabold">{value}</p>
              <p className="text-xs font-medium opacity-80">{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex border-b border-slate-100">
            {(["classroom", "search"] as ScoreTab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setScoreTab(tab)}
                className={`flex-1 py-3.5 text-sm font-semibold capitalize transition-colors flex items-center justify-center gap-2 ${scoreTab === tab ? "text-[#d96a44] border-b-2 border-[#EF7B55] bg-orange-50/50" : "text-slate-500 hover:text-slate-700"}`}
              >
                {tab === "classroom" ? <Users className="w-4 h-4" /> : <Search className="w-4 h-4" />}
                {tab === "classroom" ? "By Classroom" : "Search Student"}
              </button>
            ))}
          </div>

          {/* ── Classroom Tab ── */}
          {scoreTab === "classroom" && (
            <div className="p-4 space-y-4">
              {/* Classroom selector */}
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <select
                  value={selectedClassroom}
                  onChange={e => {
                    setSelectedClassroom(e.target.value);
                    fetchStudents(selectedOPW.id, 1, e.target.value);
                  }}
                  className="flex-1 h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#EF7B55]"
                >
                  <option value="">All Students</option>
                  {classrooms.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
                </select>

                {dirtyCount > 0 && (
                  <Button onClick={saveAllVisible} size="sm" className="gap-1.5 bg-[#EF7B55] hover:bg-[#d96a44] text-white rounded-xl font-semibold shrink-0">
                    <Save className="w-3.5 h-3.5" />
                    Save All ({dirtyCount})
                  </Button>
                )}
              </div>

              {/* Student list */}
              {studentsLoading ? (
                <div className="flex justify-center py-12"><Spinner size="sm" className="text-[#EF7B55]" /></div>
              ) : students.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No students found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {students.map(s => <ScoreRow key={s.student_id} student={s} opwId={selectedOPW.id} />)}
                </div>
              )}

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <Button
                    variant="ghost" size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => fetchStudents(selectedOPW.id, pagination.page - 1, selectedClassroom)}
                    className="rounded-lg gap-1 text-xs text-slate-600 hover:text-[#EF7B55]"
                  >
                    <ChevronLeft className="w-4 h-4" /> Prev
                  </Button>
                  <span className="text-xs text-slate-500">Page {pagination.page} of {pagination.pages} · {pagination.total} students</span>
                  <Button
                    variant="ghost" size="sm"
                    disabled={pagination.page >= pagination.pages}
                    onClick={() => fetchStudents(selectedOPW.id, pagination.page + 1, selectedClassroom)}
                    className="rounded-lg gap-1 text-xs text-slate-600 hover:text-[#EF7B55]"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* ── Search Tab ── */}
          {scoreTab === "search" && (
            <div className="p-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by student name or email…"
                  className="pl-9 h-10 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white"
                />
                {searchQuery && (
                  <button onClick={() => { setSearchQuery(""); setSearchStudents([]); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {searchLoading ? (
                <div className="flex justify-center py-8"><Spinner size="sm" className="text-[#EF7B55]" /></div>
              ) : !searchQuery ? (
                <div className="text-center py-10 text-slate-400">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Type a name or email to find a student</p>
                </div>
              ) : searchStudents.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No students found for "{searchQuery}"</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {searchStudents.map(s => <ScoreRow key={s.student_id} student={s} opwId={selectedOPW.id} />)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}


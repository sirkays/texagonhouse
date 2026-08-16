"use client";

import { useState, useEffect, use, useCallback, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft, Loader2, AlertCircle, FileText, ClipboardList, Code,
  Calendar, Video, Award, BookOpen, User, Star, TrendingUp,
  Play, ChevronRight, GraduationCap, Users,
} from "lucide-react";
import { useBrand } from "@/hooks/use-brand";

// ─── Types ────────────────────────────────────────────────────────────────────

type ChildInfo = { id: number; name: string; admission_no: string; classroom: string };
type StudentScore = { score: string; total: string; status: string };
type CodingScore = { score: string; feedback: string; project_title: string; status: string };
type OfflineScore = { score: string; max_score: string; feedback: string; status: string };

type ReportData = {
  id: number;
  title: string;
  description: string;
  organization: { name: string; logo: string | null };
  teacher: { name: string };
  course: { name: string };
  period_start: string | null;
  period_end: string | null;
  published_at: string;
  cbt_items: { test_title: string; total_marks: string }[];
  coding_items: { lesson_title: string }[];
  offline_items?: { opw_title: string; max_score: string }[];
  activities: { title: string; description: string; activity_date: string }[];
  videos: { title: string; video_url: string; video_file: string | null }[];
  student_data?: {
    student_name: string;
    admission_no: string;
    classroom: string;
    cbt_scores: Record<string, StudentScore>;
    coding_scores: Record<string, CodingScore>;
    offline_scores?: Record<string, OfflineScore>;
    teacher_remark: string;
  };
  linked_children?: ChildInfo[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DJANGO_BASE = process.env.NEXT_PUBLIC_DJANGO_BASE_URL || "";

function resolveVideoUrl(raw: string | null | undefined): string {
  if (!raw) return "";
  return raw.startsWith("http") ? raw : `${DJANGO_BASE}${raw}`;
}

function pct(score: string, total: string) {
  const s = parseFloat(score || "0");
  const t = parseFloat(total || "0");
  return t > 0 ? Math.round((s / t) * 100) : 0;
}
function pctBg(p: number) { return p >= 70 ? "bg-emerald-500" : p >= 50 ? "bg-amber-500" : "bg-red-400"; }
function pctText(p: number) { return p >= 70 ? "text-emerald-600" : p >= 50 ? "text-amber-600" : "text-red-500"; }
function pctBgLight(p: number) { return p >= 70 ? "bg-emerald-50" : p >= 50 ? "bg-amber-50" : "bg-red-50"; }

const CHILD_COLORS = [
  "from-violet-500 to-purple-600",
  "from-cyan-500 to-blue-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-emerald-500 to-teal-600",
];
function childColor(idx: number) { return CHILD_COLORS[idx % CHILD_COLORS.length]; }
function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

// ─── Child Switcher Tab ───────────────────────────────────────────────────────

function ChildSwitcher({
  children, activeId, onSelect,
}: { children: ChildInfo[]; activeId: number | null; onSelect: (id: number) => void }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-4 h-4 text-[#EF7B55]" />
        <span className="text-sm font-semibold text-slate-700">Viewing report for</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {children.map((child, idx) => {
          const isActive = activeId === child.id;
          return (
            <button
              key={child.id}
              onClick={() => onSelect(child.id)}
              className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl border text-sm font-medium transition-all ${
                isActive
                  ? "border-[#EF7B55]/40 bg-[#EF7B55]/10 text-[#EF7B55] shadow-sm"
                  : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${childColor(idx)} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                {getInitials(child.name)}
              </div>
              <div className="text-left">
                <p className="text-[13px] font-semibold leading-tight">{child.name}</p>
                <p className="text-[10px] text-slate-400 leading-tight">
                  {child.classroom || child.admission_no || ""}
                </p>
              </div>
              {isActive && (
                <span className="ml-1 w-1.5 h-1.5 rounded-full bg-[#EF7B55]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Inner Component (needs Suspense for useSearchParams) ────────────────────

function ReportDetailContent({ token }: { token: string }) {
  const brand = useBrand();
  const searchParams = useSearchParams();

  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeChildId, setActiveChildId] = useState<number | null>(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState({ title: "", url: "" });

  const loadReport = useCallback((studentId?: number) => {
    setLoading(true);
    setError("");
    const qs = studentId ? `&student_id=${studentId}` : "";
    fetch(`/api/parent/reports?token=${encodeURIComponent(token)}${qs}`)
      .then(async r => {
        const data = await r.json();
        if (!r.ok) {
          setError(data.detail || data.error || "Could not load this report.");
        } else {
          setReport(data);
          // Set active child from student_data
          if (data.student_data && data.linked_children?.length) {
            const found = data.linked_children.find(
              (c: ChildInfo) => c.name === data.student_data.student_name ||
                c.admission_no === data.student_data.admission_no
            );
            if (found) setActiveChildId(found.id);
            else if (data.linked_children[0]) setActiveChildId(data.linked_children[0].id);
          }
        }
      })
      .catch(() => setError("Network error. Please try again."))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    const sid = searchParams.get("student_id");
    loadReport(sid ? parseInt(sid, 10) : undefined);
  }, [token, searchParams, loadReport]);

  const handleChildSwitch = (childId: number) => {
    setActiveChildId(childId);
    loadReport(childId);
  };

  const handlePlayVideo = (title: string, rawUrl: string, rawFile: string | null) => {
    const url = resolveVideoUrl(rawUrl) || resolveVideoUrl(rawFile);
    if (!url) return;
    setSelectedVideo({ title: title || "Video", url });
    setVideoModalOpen(true);
  };

  const linkedChildren = report?.linked_children || [];
  const isMultiChild = linkedChildren.length > 1;

  // ── Loading ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="w-16 h-16 bg-[#EF7B55]/10 rounded-2xl flex items-center justify-center">
          <Image src={brand.logo} alt={brand.name} width={36} height={36} className="object-contain animate-pulse" />
        </div>
        <Loader2 className="w-6 h-6 text-[#EF7B55] animate-spin" />
        <p className="text-sm text-slate-500">Loading report...</p>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────
  if (error || !report) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Link href="/parent/reports" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#EF7B55] transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Reports
        </Link>
        <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center space-y-3">
          <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7 text-red-400" />
          </div>
          <p className="text-slate-700 font-semibold">Could not load report</p>
          <p className="text-sm text-slate-500">{error || "Report not found or you don't have access."}</p>
        </div>
      </div>
    );
  }

  const sd = report.student_data;
  const cbtEntries = sd ? Object.entries(sd.cbt_scores) : [];
  const codeEntries = sd ? Object.entries(sd.coding_scores) : [];
  const totalCbtScore = cbtEntries.reduce((s, [, v]) => s + parseFloat(v.score || "0"), 0);
  const totalCbtMax = cbtEntries.reduce((s, [, v]) => s + parseFloat(v.total || "0"), 0);
  const totalCodeScore = codeEntries.reduce((s, [, v]) => s + parseFloat(v.score || "0"), 0);
  const overallPct = totalCbtMax > 0 ? Math.round((totalCbtScore / totalCbtMax) * 100) : 0;
  const passedCbt = cbtEntries.filter(([, v]) =>
    parseFloat(v.total) > 0 && (parseFloat(v.score) / parseFloat(v.total)) >= 0.5
  ).length;

  return (
    <div className="space-y-5 max-w-4xl mx-auto">

      {/* Back navigation */}
      <div className="flex items-center gap-3">
        <Link
          href="/parent/reports"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#EF7B55] transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> All Reports
        </Link>
      </div>

      {/* Multi-child switcher */}
      {isMultiChild && (
        <ChildSwitcher
          children={linkedChildren}
          activeId={activeChildId}
          onSelect={handleChildSwitch}
        />
      )}

      {/* Header Card */}
      <div className="bg-gradient-to-r from-[#EF7B55] via-[#F79771] to-[#EF9955] rounded-2xl p-6 lg:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
          <svg viewBox="0 0 200 200" fill="none"><circle cx="150" cy="50" r="120" fill="white" /></svg>
        </div>
        <div className="relative z-10 flex items-start gap-5">
          {report.organization.logo ? (
            <img src={report.organization.logo} alt="" className="h-14 w-14 rounded-xl bg-white/20 p-1 object-contain flex-shrink-0" />
          ) : (
            <div className="h-14 w-14 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Image src={brand.logo} alt={brand.name} width={30} height={30} className={`object-contain ${brand.id === "techxagon" ? "brightness-0 invert" : ""}`} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-white/75 text-xs font-medium uppercase tracking-widest">{report.organization.name}</p>
            <h1 className="text-2xl lg:text-3xl font-bold mt-1">{report.title}</h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-white/80">
              <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{report.course.name}</span>
              <span className="flex items-center gap-1"><User className="w-3 h-3" />{report.teacher.name}</span>
              {report.period_start && (
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{report.period_start} — {report.period_end}</span>
              )}
              {report.published_at && (
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />Published {new Date(report.published_at).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
          {totalCbtMax > 0 && (
            <div className="flex-shrink-0 text-center hidden sm:block">
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="white" strokeWidth="3"
                    strokeDasharray={`${overallPct} ${100 - overallPct}`} strokeLinecap="round"
                    className="transition-all duration-1000" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-base font-bold">{overallPct}%</span>
                </div>
              </div>
              <p className="text-[10px] text-white/60 mt-1">Overall Score</p>
            </div>
          )}
        </div>
      </div>

      {/* Student Info */}
      {sd && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-sm flex-shrink-0 ${
            isMultiChild && activeChildId
              ? `bg-gradient-to-br ${childColor(linkedChildren.findIndex(c => c.id === activeChildId))}`
              : "bg-gradient-to-br from-[#EF7B55] to-[#F79771]"
          }`}>
            {sd.student_name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-lg font-bold text-slate-800">{sd.student_name}</p>
              {isMultiChild && (
                <span className="px-2 py-0.5 rounded-full bg-[#EF7B55]/10 text-[#EF7B55] text-[10px] font-semibold flex items-center gap-1">
                  <GraduationCap className="w-2.5 h-2.5" /> viewing this child
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 mt-1">
              {sd.admission_no && <span className="flex items-center gap-1"><FileText className="w-3 h-3" />Adm: {sd.admission_no}</span>}
              {sd.classroom && <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />Class: {sd.classroom}</span>}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {totalCbtMax > 0 && (
              <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${pctBgLight(overallPct)} ${pctText(overallPct)}`}>
                CBT: {overallPct}%
              </div>
            )}
            {codeEntries.length > 0 && (
              <div className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-50 text-purple-600">
                {codeEntries.length} Project{codeEntries.length !== 1 ? "s" : ""}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      {sd && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: ClipboardList, label: "Tests Taken", value: cbtEntries.length, sub: `${passedCbt} passed`, color: "from-blue-500 to-blue-600" },
            { icon: TrendingUp, label: "CBT Score", value: totalCbtMax > 0 ? `${totalCbtScore}/${totalCbtMax}` : "N/A", sub: totalCbtMax > 0 ? `${overallPct}% average` : "", color: "from-emerald-500 to-emerald-600" },
            { icon: Code, label: "Code Projects", value: codeEntries.length, sub: `${totalCodeScore} total pts`, color: "from-purple-500 to-purple-600" },
            { icon: Star, label: "Code Score", value: totalCodeScore, sub: codeEntries.length > 0 ? `${Math.round(totalCodeScore / codeEntries.length)} avg` : "", color: "from-amber-500 to-amber-600" },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3 shadow-sm`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-xl font-bold text-slate-800">{s.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
              {s.sub && <p className="text-[10px] text-slate-400 mt-0.5">{s.sub}</p>}
            </div>
          ))}
        </div>
      )}

      {/* CBT Results */}
      {sd && report.cbt_items.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-[#EF7B55]" /> CBT Test Results
            </h2>
            <span className="text-xs text-slate-400">{cbtEntries.length} test{cbtEntries.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="space-y-3">
            {report.cbt_items.map((item, i) => {
              const key = String(cbtEntries[i]?.[0]);
              const sc = sd.cbt_scores[key] || { score: "0", total: item.total_marks, status: "not_attempted" };
              const p = pct(sc.score, sc.total);
              return (
                <div key={i} className="flex items-center gap-4 p-3.5 rounded-xl bg-slate-50/80 hover:bg-slate-50 transition-colors">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0 ${pctBg(p)}`}>
                    {p}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">{item.test_title}</p>
                    <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-1000 ${pctBg(p)}`} style={{ width: `${p}%` }} />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-slate-800">{sc.score}/{sc.total}</p>
                    <p className={`text-[10px] font-medium capitalize ${sc.status === "graded" ? "text-emerald-500" : sc.status === "submitted" ? "text-blue-500" : "text-slate-400"}`}>
                      {sc.status === "graded" ? "Graded" : sc.status === "submitted" ? "Submitted" : "Not taken"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Coding Projects */}
      {sd && report.coding_items.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Code className="w-5 h-5 text-[#EF7B55]" /> Coding Projects
            </h2>
            <span className="text-xs text-slate-400">{codeEntries.length} project{codeEntries.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {report.coding_items.map((item, i) => {
              const key = String(codeEntries[i]?.[0]);
              const sc = sd.coding_scores[key] || { score: "0", project_title: "", status: "not_submitted", feedback: "" };
              return (
                <div key={i} className="border border-slate-100 rounded-xl p-4 hover:shadow-md transition-shadow hover:border-[#EF7B55]/20">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-semibold text-slate-700">{item.lesson_title}</p>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ml-2 ${sc.status === "graded" ? "bg-emerald-50 text-emerald-600" : sc.status === "submitted" ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-500"}`}>
                      {sc.status === "graded" ? "Graded" : sc.status === "submitted" ? "Submitted" : "Pending"}
                    </span>
                  </div>
                  {sc.score !== "0" && <p className="text-2xl font-bold text-slate-800">{sc.score} <span className="text-xs font-normal text-slate-400">points</span></p>}
                  {sc.feedback && <p className="text-xs text-slate-500 mt-2 italic border-l-2 border-[#EF7B55]/30 pl-2">&ldquo;{sc.feedback}&rdquo;</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Off-Practical Work */}
      {sd && report.offline_items && report.offline_items.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#EF7B55]" /> Off-Practical Work
            </h2>
            <span className="text-xs text-slate-400">{report.offline_items.length} item{report.offline_items.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {report.offline_items.map((item, i) => {
              const offEntries = sd.offline_scores ? Object.entries(sd.offline_scores) : [];
              const key = String(offEntries[i]?.[0]);
              const sc = (sd.offline_scores && sd.offline_scores[key]) || { score: "0", max_score: item.max_score, feedback: "", status: "not_graded" };
              return (
                <div key={i} className="border border-slate-100 rounded-xl p-4 hover:shadow-md transition-shadow hover:border-[#EF7B55]/20">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-semibold text-slate-700">{item.opw_title}</p>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ml-2 ${sc.status === "graded" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
                      {sc.status === "graded" ? "Graded" : "Not Graded"}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-slate-800">{sc.score} <span className="text-xs font-normal text-slate-400">/ {sc.max_score || item.max_score} marks</span></p>
                  {sc.feedback && <p className="text-xs text-slate-500 mt-2 italic border-l-2 border-[#EF7B55]/30 pl-2">&ldquo;{sc.feedback}&rdquo;</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Activities Timeline */}
      {report.activities.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#EF7B55]" /> Class Activities
            </h2>
            <span className="text-xs text-slate-400">{report.activities.length} activit{report.activities.length !== 1 ? "ies" : "y"}</span>
          </div>
          <div className="relative pl-7">
            <div className="absolute left-3 top-1 bottom-1 w-0.5 bg-gradient-to-b from-[#EF7B55] to-[#F79771]/20 rounded-full" />
            {report.activities.map((act, i) => (
              <div key={i} className="relative mb-4 last:mb-0">
                <div className="absolute -left-[17px] top-1.5 w-3 h-3 rounded-full bg-[#EF7B55] border-2 border-white shadow-sm" />
                <div className="bg-slate-50/70 rounded-xl p-4 ml-2 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-semibold text-slate-700">{act.title}</p>
                    {act.activity_date && (
                      <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        {new Date(act.activity_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {act.description && <p className="text-xs text-slate-500 leading-relaxed">{act.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Videos */}
      {report.videos.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Video className="w-5 h-5 text-[#EF7B55]" /> Videos
            </h2>
            <span className="text-xs text-slate-400">{report.videos.length} video{report.videos.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {report.videos.map((v, i) => {
              const hasUrl = !!(v.video_url || v.video_file);
              return (
                <button key={i} disabled={!hasUrl} onClick={() => handlePlayVideo(v.title, v.video_url, v.video_file)}
                  className="flex items-center gap-3 border border-slate-100 rounded-xl p-4 hover:shadow-md hover:border-[#EF7B55]/30 transition-all group text-left w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#EF7B55]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#EF7B55]/20 transition-colors">
                    <Play className="w-5 h-5 text-[#EF7B55]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-700 group-hover:text-[#EF7B55] transition-colors truncate">{v.title || "Watch Video"}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Click to play</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#EF7B55] transition-colors flex-shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Teacher Notes */}
      {(report.description || sd?.teacher_remark) && (
        <div className="bg-gradient-to-br from-[#EF7B55]/5 to-orange-50/50 rounded-2xl border border-[#EF7B55]/10 p-6">
          <h2 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Award className="w-5 h-5 text-[#EF7B55]" /> Teacher&apos;s Note
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{sd?.teacher_remark || report.description}</p>
          <p className="text-xs text-slate-400 mt-4 text-right">&mdash; {report.teacher.name}</p>
        </div>
      )}

      {/* Footer */}
      <div className="text-center py-6 border-t border-slate-100">
        <div className="flex items-center justify-center gap-2.5 mb-2">
          <Image src={brand.logo} alt={brand.name} width={20} height={20} className="object-contain" />
          <span className="text-sm font-bold text-slate-600">{brand.fullName}</span>
        </div>
        <p className="text-[10px] text-slate-400">Powered by {brand.name} &copy; {new Date().getFullYear()}</p>
      </div>

      {/* Video Modal */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setVideoModalOpen(false)}>
          <div className="bg-black rounded-2xl overflow-hidden w-full max-w-3xl shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900">
              <p className="text-sm font-medium text-white truncate">{selectedVideo.title}</p>
              <button onClick={() => setVideoModalOpen(false)} className="text-slate-400 hover:text-white transition text-xs px-2 py-1 rounded-lg hover:bg-white/10">✕ Close</button>
            </div>
            <video src={selectedVideo.url} controls autoPlay className="w-full max-h-[70vh]" />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Default Export with Suspense ─────────────────────────────────────────────

export default function ParentReportDetailPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="w-6 h-6 text-[#EF7B55] animate-spin" />
        <p className="text-sm text-slate-500">Loading report...</p>
      </div>
    }>
      <ReportDetailContent token={token} />
    </Suspense>
  );
}

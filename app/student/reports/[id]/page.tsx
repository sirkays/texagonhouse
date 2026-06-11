"use client";

import { useState, useEffect, use } from "react";
import { ArrowLeft, BookOpen, Calendar, User, ClipboardList, Code, Video, Star, TrendingUp, Award, FileText, Play } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { VideoModal } from "@/components/student/video-modal";

type StudentScore = { score: string; total: string; status: string };
type CodingScore = { score: string; feedback: string; project_title: string; status: string };
type ReportDetail = {
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
  activities: { title: string; description: string; activity_date: string }[];
  videos: { title: string; video_url: string; video_file: string | null }[];
  student_data?: {
    student_name: string;
    admission_no: string;
    classroom: string;
    cbt_scores: Record<string, StudentScore>;
    coding_scores: Record<string, CodingScore>;
    teacher_remark: string;
  };
};

const DJANGO_BASE = process.env.NEXT_PUBLIC_DJANGO_BASE_URL || "";

function resolveVideoUrl(raw: string | null | undefined): string {
  if (!raw) return "";
  if (raw.startsWith("http")) return raw;
  return `${DJANGO_BASE}${raw}`;
}

export default function StudentReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: session } = useSession();
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Video modal state
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState({ title: "", url: "" });

  useEffect(() => {
    fetch(`/api/student/reports/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error);
        else setReport(d);
      })
      .catch(() => setError("Failed to load report"))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePlayVideo = (title: string, rawUrl: string, rawFile: string | null) => {
    const url = resolveVideoUrl(rawUrl) || resolveVideoUrl(rawFile);
    if (!url) return;
    setSelectedVideo({ title: title || "Video", url });
    setVideoModalOpen(true);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EF7B55]" />
    </div>
  );

  if (error || !report) return (
    <div className="text-center py-20">
      <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
      <p className="text-slate-500">{error || "Report not found."}</p>
      <Link href="/student/reports" className="mt-4 inline-block text-sm text-[#EF7B55] hover:underline">← Back to Reports</Link>
    </div>
  );

  const sd = report.student_data;
  const cbtEntries = sd ? Object.entries(sd.cbt_scores) : [];
  const codeEntries = sd ? Object.entries(sd.coding_scores) : [];
  const totalCbtScore = cbtEntries.reduce((s, [, v]) => s + parseFloat(v.score || "0"), 0);
  const totalCbtMax = cbtEntries.reduce((s, [, v]) => s + parseFloat(v.total || "0"), 0);
  const cbtPct = totalCbtMax > 0 ? Math.round((totalCbtScore / totalCbtMax) * 100) : 0;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Back */}
      <Link href="/student/reports" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#EF7B55] transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Reports
      </Link>

      {/* Header Card */}
      <div className="bg-gradient-to-r from-[#EF7B55] via-[#F79771] to-[#EF7B55] rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-start gap-4">
          {report.organization.logo && (
            <img src={report.organization.logo} alt="" className="h-12 w-12 rounded-xl bg-white/20 p-1 object-contain" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-white/75 text-xs font-medium">{report.organization.name}</p>
            <h1 className="text-xl font-bold mt-0.5">{report.title}</h1>
            <div className="flex flex-wrap gap-3 mt-2 text-xs text-white/80">
              <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{report.course.name}</span>
              <span className="flex items-center gap-1"><User className="w-3 h-3" />{report.teacher.name}</span>
              {report.period_start && (
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{report.period_start} — {report.period_end}</span>
              )}
            </div>
          </div>
          {sd && totalCbtMax > 0 && (
            <div className="flex-shrink-0 text-center">
              <div className="relative w-14 h-14">
                <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="white" strokeWidth="3"
                    strokeDasharray={`${cbtPct} ${100 - cbtPct}`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold">{cbtPct}%</span>
                </div>
              </div>
              <p className="text-[10px] text-white/70 mt-1">Overall</p>
            </div>
          )}
        </div>
      </div>

      {/* Student Info */}
      {sd && (
        <div className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#EF7B55] to-[#F79771] flex items-center justify-center text-white text-lg font-bold shadow-sm">
            {sd.student_name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-slate-800">{sd.student_name}</p>
            <div className="flex gap-3 text-xs text-slate-500 mt-0.5">
              {sd.admission_no && <span>Adm: {sd.admission_no}</span>}
              {sd.classroom && <span>Class: {sd.classroom}</span>}
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      {sd && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: ClipboardList, label: "Tests", value: cbtEntries.length, color: "from-blue-500 to-blue-600" },
            { icon: TrendingUp, label: "CBT Score", value: totalCbtMax > 0 ? `${totalCbtScore}/${totalCbtMax}` : "N/A", color: "from-emerald-500 to-emerald-600" },
            { icon: Code, label: "Projects", value: codeEntries.length, color: "from-purple-500 to-purple-600" },
            { icon: Star, label: "Code Score", value: codeEntries.reduce((s, [, v]) => s + parseFloat(v.score || "0"), 0), color: "from-amber-500 to-amber-600" },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center mb-2 shadow-sm`}>
                <s.icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-lg font-bold text-slate-800">{s.value}</p>
              <p className="text-[11px] text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* CBT Results */}
      {sd && report.cbt_items.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-[#EF7B55]" /> CBT Test Results
          </h3>
          <div className="space-y-3">
            {report.cbt_items.map((item, i) => {
              const key = Object.keys(sd.cbt_scores)[i];
              const sc = key ? sd.cbt_scores[key] : { score: "0", total: item.total_marks, status: "not_attempted" };
              const pct = parseFloat(sc.total) > 0 ? Math.round((parseFloat(sc.score) / parseFloat(sc.total)) * 100) : 0;
              return (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 hover:bg-slate-100/50 transition-colors">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0 ${pct >= 70 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-400"}`}>
                    {pct}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{item.test_title}</p>
                    <div className="mt-1.5 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${pct >= 70 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-400"}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-slate-800">{sc.score}/{sc.total}</p>
                    <p className="text-[10px] text-slate-400 capitalize">{sc.status.replace("_", " ")}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Coding Projects */}
      {sd && report.coding_items.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Code className="w-4 h-4 text-[#EF7B55]" /> Coding Projects
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {report.coding_items.map((item, i) => {
              const key = Object.keys(sd.coding_scores)[i];
              const sc = key ? sd.coding_scores[key] : { score: "0", project_title: "", status: "not_submitted", feedback: "" };
              return (
                <div key={i} className="border border-slate-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-medium text-slate-700">{item.lesson_title}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0 ml-2 ${sc.status === "graded" ? "bg-emerald-50 text-emerald-600" : sc.status === "submitted" ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-500"}`}>
                      {sc.status === "graded" ? "Graded" : sc.status === "submitted" ? "Submitted" : "Pending"}
                    </span>
                  </div>
                  {sc.score !== "0" && (
                    <p className="text-xl font-bold text-slate-800">{sc.score} <span className="text-xs font-normal text-slate-400">points</span></p>
                  )}
                  {sc.feedback && <p className="text-xs text-slate-500 mt-1 italic">&quot;{sc.feedback}&quot;</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Activities */}
      {report.activities.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#EF7B55]" /> Class Activities
          </h3>
          <div className="relative pl-5">
            <div className="absolute left-2 top-1 bottom-1 w-0.5 bg-gradient-to-b from-[#EF7B55] to-[#EF7B55]/20 rounded-full" />
            {report.activities.map((act, i) => (
              <div key={i} className="relative mb-4 last:mb-0">
                <div className="absolute -left-[11px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#EF7B55] border-2 border-white shadow-sm" />
                <div className="bg-slate-50 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-slate-700">{act.title}</p>
                    {act.activity_date && (
                      <span className="text-[10px] text-slate-400">{new Date(act.activity_date).toLocaleDateString()}</span>
                    )}
                  </div>
                  {act.description && <p className="text-xs text-slate-500">{act.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Videos — plays inline via VideoModal, no new tab */}
      {report.videos.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Video className="w-4 h-4 text-[#EF7B55]" /> Videos
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {report.videos.map((v, i) => {
              const hasUrl = !!(v.video_url || v.video_file);
              return (
                <button
                  key={i}
                  disabled={!hasUrl}
                  onClick={() => handlePlayVideo(v.title, v.video_url, v.video_file)}
                  className="flex items-center gap-3 border border-slate-100 rounded-xl p-3 hover:shadow-md hover:border-[#EF7B55]/30 transition-all group text-left w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#EF7B55]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#EF7B55]/20 transition-colors">
                    <Play className="w-5 h-5 text-[#EF7B55]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-700 group-hover:text-[#EF7B55] transition-colors truncate">{v.title || "Watch Video"}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Click to play</p>
                  </div>
                  <Video className="w-4 h-4 text-slate-300 group-hover:text-[#EF7B55] transition-colors flex-shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Teacher Notes */}
      {(report.description || sd?.teacher_remark) && (
        <div className="bg-gradient-to-br from-[#EF7B55]/5 to-orange-50/50 rounded-xl border border-[#EF7B55]/10 p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
            <Award className="w-4 h-4 text-[#EF7B55]" /> Teacher&apos;s Note
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{sd?.teacher_remark || report.description}</p>
          <p className="text-xs text-slate-400 mt-3 text-right">— {report.teacher.name}</p>
        </div>
      )}

      {/* Video Player Modal — renders on top of current page */}
      <VideoModal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        title={selectedVideo.title}
        videoUrl={selectedVideo.url}
      />
    </div>
  );
}

"use client";

import { useState, useEffect, use } from "react";
import { GraduationCap, Award, Code, ClipboardList, Calendar, Video, BookOpen, CheckCircle, XCircle, Clock, Eye, EyeOff, User, Mail, Lock, ArrowRight, Star, TrendingUp, Trophy } from "lucide-react";

type ReportData = {
  id: number; title: string; description: string; organization: { name: string; logo: string | null }; teacher: { name: string }; course: { name: string };
  period_start: string | null; period_end: string | null; published_at: string;
  cbt_items: { test_title: string; total_marks: string }[];
  coding_items: { lesson_title: string }[];
  activities: { title: string; description: string; activity_date: string }[];
  videos: { title: string; video_url: string; video_file: string | null }[];
  student_data?: { student_name: string; admission_no: string; classroom: string; cbt_scores: Record<string, { score: string; total: string; status: string }>; coding_scores: Record<string, { score: string; feedback: string; project_title: string; status: string }>; teacher_remark: string };
};

export default function PublicReportPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [phase, setPhase] = useState<"loading" | "verify" | "setup" | "report">("loading");
  const [orgInfo, setOrgInfo] = useState<{ report_title: string; organization_name: string; organization_logo: string | null } | null>(null);
  const [report, setReport] = useState<ReportData | null>(null);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [studentId, setStudentId] = useState<number | null>(null);
  const [hasParent, setHasParent] = useState(false);
  // Parent setup
  const [parentEmail, setParentEmail] = useState("");
  const [useSamePassword, setUseSamePassword] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [setupLoading, setSetupLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/reports/${token}`).then(r => r.json()).then(d => {
      if (d.report_title) { setOrgInfo(d); setPhase("verify"); }
      else setPhase("verify");
    }).catch(() => setPhase("verify"));
  }, [token]);

  const handleVerify = async () => {
    setVerifying(true); setError("");
    try {
      const res = await fetch(`/api/reports/${token}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ identifier, password }) });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || "Verification failed"); return; }
      setStudentId(data.student_id);
      setHasParent(data.has_parent);
      setReport(data.report);
      if (data.needs_parent_setup) setPhase("setup");
      else setPhase("report");
    } catch { setError("Network error"); } finally { setVerifying(false); }
  };

  const handleParentSetup = async () => {
    setSetupLoading(true); setError("");
    try {
      const res = await fetch(`/api/reports/${token}?action=parent-setup`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: studentId, email: parentEmail, use_same_password: useSamePassword, new_password: newPassword, student_password: password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || "Setup failed"); return; }
      setReport(data.report);
      setPhase("report");
    } catch { setError("Network error"); } finally { setSetupLoading(false); }
  };

  if (phase === "loading") return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-slate-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#EF7B55]" />
    </div>
  );

  if (phase === "verify") return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          {orgInfo?.organization_logo && <img src={orgInfo.organization_logo} alt="" className="h-16 mx-auto mb-4 rounded-xl" />}
          <div className="flex items-center justify-center gap-2 mb-2"><GraduationCap className="w-8 h-8 text-[#EF7B55]" /><span className="text-xl font-bold text-slate-800">TECHXAGON</span></div>
          <h1 className="text-lg font-semibold text-slate-700">{orgInfo?.report_title || "Student Report"}</h1>
          {orgInfo?.organization_name && <p className="text-sm text-slate-500">{orgInfo.organization_name}</p>}
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-800">View Your Child&apos;s Report</h2>
          <p className="text-xs text-slate-500">Enter the student&apos;s admission number or email and password to access the report.</p>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Admission No / Email</label>
            <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={identifier} onChange={e => { setIdentifier(e.target.value); setError(""); }} placeholder="e.g. 2026/A4K9X2" className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#EF7B55]/30 focus:border-[#EF7B55]" /></div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Password</label>
            <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type={showPw ? "text" : "password"} value={password} onChange={e => { setPassword(e.target.value); setError(""); }} placeholder="Student password" className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#EF7B55]/30 focus:border-[#EF7B55]" />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2">{showPw ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}</button></div>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button onClick={handleVerify} disabled={verifying || !identifier || !password} className="w-full py-2.5 bg-[#EF7B55] text-white rounded-lg hover:bg-[#d96a44] disabled:opacity-50 font-medium text-sm flex items-center justify-center gap-2">
            {verifying ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <><span>View Report</span><ArrowRight className="w-4 h-4" /></>}
          </button>
        </div>
      </div>
    </div>
  );

  if (phase === "setup") return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-[#EF7B55]/10 rounded-full flex items-center justify-center mx-auto mb-3"><Mail className="w-7 h-7 text-[#EF7B55]" /></div>
          <h2 className="text-lg font-bold text-slate-800">Set Up Your Parent Account</h2>
          <p className="text-xs text-slate-500 mt-1">Create an account to view reports and track your child&apos;s progress</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Your Email</label>
            <input type="email" value={parentEmail} onChange={e => { setParentEmail(e.target.value); setError(""); }} placeholder="parent@email.com" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#EF7B55]/30 focus:border-[#EF7B55]" />
          </div>
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={useSamePassword} onChange={e => setUseSamePassword(e.target.checked)} className="accent-[#EF7B55]" />
              <span className="text-sm text-slate-700">Use same password as student account</span>
            </label>
          </div>
          {!useSamePassword && (
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">New Password</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Create a password" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#EF7B55]/30 focus:border-[#EF7B55]" />
            </div>
          )}
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button onClick={handleParentSetup} disabled={setupLoading || !parentEmail} className="w-full py-2.5 bg-[#EF7B55] text-white rounded-lg hover:bg-[#d96a44] disabled:opacity-50 font-medium text-sm flex items-center justify-center gap-2">
            {setupLoading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <><span>Create Account & View Report</span><ArrowRight className="w-4 h-4" /></>}
          </button>
        </div>
      </div>
    </div>
  );

  // ── Report View ──
  if (!report || !report.student_data) return <div className="min-h-screen flex items-center justify-center"><p className="text-slate-500">Report data unavailable.</p></div>;

  const sd = report.student_data;
  const cbtEntries = Object.entries(sd.cbt_scores);
  const codeEntries = Object.entries(sd.coding_scores);
  const totalCbtScore = cbtEntries.reduce((s, [, v]) => s + parseFloat(v.score), 0);
  const totalCbtMax = cbtEntries.reduce((s, [, v]) => s + parseFloat(v.total), 0);
  const cbtPct = totalCbtMax > 0 ? Math.round((totalCbtScore / totalCbtMax) * 100) : 0;
  const totalCodeScore = codeEntries.reduce((s, [, v]) => s + parseFloat(v.score), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/20 to-blue-50/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#EF7B55] via-[#F79771] to-[#EF7B55] text-white">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-4">
            {report.organization.logo && <img src={report.organization.logo} alt="" className="h-14 w-14 rounded-xl bg-white/20 p-1" />}
            <div><p className="text-white/80 text-sm font-medium">{report.organization.name}</p><h1 className="text-2xl font-bold">{report.title}</h1></div>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-white/80">
            <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" />{report.course.name}</span>
            <span className="flex items-center gap-1"><User className="w-4 h-4" />{report.teacher.name}</span>
            {report.period_start && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{report.period_start} — {report.period_end}</span>}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-4 pb-12 space-y-6">
        {/* Student Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#EF7B55] to-[#F79771] flex items-center justify-center text-white text-xl font-bold shadow-md">
              {sd.student_name.charAt(0)}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-slate-800">{sd.student_name}</h2>
              <div className="flex gap-4 text-xs text-slate-500 mt-0.5">
                {sd.admission_no && <span>Adm: {sd.admission_no}</span>}
                {sd.classroom && <span>Class: {sd.classroom}</span>}
              </div>
            </div>
            <div className="text-right">
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36"><circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke={cbtPct >= 70 ? "#10b981" : cbtPct >= 50 ? "#f59e0b" : "#ef4444"} strokeWidth="3" strokeDasharray={`${cbtPct} ${100 - cbtPct}`} strokeLinecap="round" className="transition-all duration-1000" /></svg>
                <div className="absolute inset-0 flex items-center justify-center"><span className="text-sm font-bold text-slate-800">{cbtPct}%</span></div>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Overall</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: ClipboardList, label: "Tests Taken", value: cbtEntries.length, color: "from-blue-500 to-blue-600" },
            { icon: TrendingUp, label: "CBT Score", value: `${totalCbtScore}/${totalCbtMax}`, color: "from-emerald-500 to-emerald-600" },
            { icon: Code, label: "Code Projects", value: codeEntries.length, color: "from-purple-500 to-purple-600" },
            { icon: Star, label: "Code Score", value: totalCodeScore, color: "from-amber-500 to-amber-600" },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center mb-2 shadow-sm`}><s.icon className="w-4 h-4 text-white" /></div>
              <p className="text-lg font-bold text-slate-800">{s.value}</p>
              <p className="text-[11px] text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>

        {/* CBT Results */}
        {cbtEntries.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2"><ClipboardList className="w-5 h-5 text-[#EF7B55]" /> CBT Test Results</h3>
            <div className="space-y-3">
              {report.cbt_items.map((item, i) => {
                const sc = sd.cbt_scores[String(cbtEntries[i]?.[0])] || { score: "0", total: item.total_marks, status: "not_attempted" };
                const pct = parseFloat(sc.total) > 0 ? Math.round((parseFloat(sc.score) / parseFloat(sc.total)) * 100) : 0;
                return (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-sm ${pct >= 70 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-400"}`}>{pct}%</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{item.test_title}</p>
                      <div className="mt-1.5 h-1.5 bg-slate-200 rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all duration-700 ${pct >= 70 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-400"}`} style={{ width: `${pct}%` }} /></div>
                    </div>
                    <div className="text-right"><p className="text-sm font-semibold text-slate-800">{sc.score}/{sc.total}</p>
                    <p className="text-[10px] text-slate-400">{sc.status === "graded" ? "Graded" : sc.status === "submitted" ? "Submitted" : "Not taken"}</p></div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Coding Projects */}
        {codeEntries.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2"><Code className="w-5 h-5 text-[#EF7B55]" /> Coding Projects</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {report.coding_items.map((item, i) => {
                const sc = sd.coding_scores[String(codeEntries[i]?.[0])] || { score: "0", project_title: "", status: "not_submitted", feedback: "" };
                return (
                  <div key={i} className="border border-slate-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-medium text-slate-700">{item.lesson_title}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${sc.status === "graded" ? "bg-emerald-50 text-emerald-600" : sc.status === "submitted" ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-500"}`}>
                        {sc.status === "graded" ? "Graded" : sc.status === "submitted" ? "Submitted" : "Pending"}
                      </span>
                    </div>
                    {sc.score !== "0" && <p className="text-lg font-bold text-slate-800">{sc.score} <span className="text-xs font-normal text-slate-400">points</span></p>}
                    {sc.feedback && <p className="text-xs text-slate-500 mt-1 italic">&ldquo;{sc.feedback}&rdquo;</p>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Activities Timeline */}
        {report.activities.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2"><Calendar className="w-5 h-5 text-[#EF7B55]" /> Class Activities</h3>
            <div className="relative pl-6">
              <div className="absolute left-2.5 top-1 bottom-1 w-0.5 bg-gradient-to-b from-[#EF7B55] to-[#F79771]/30 rounded-full" />
              {report.activities.map((act, i) => (
                <div key={i} className="relative mb-4 last:mb-0">
                  <div className="absolute -left-[14px] top-1 w-3 h-3 rounded-full bg-[#EF7B55] border-2 border-white shadow-sm" />
                  <div className="bg-slate-50/50 rounded-xl p-3 ml-2">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-slate-700">{act.title}</p>
                      {act.activity_date && <span className="text-[10px] text-slate-400">{new Date(act.activity_date).toLocaleDateString()}</span>}
                    </div>
                    {act.description && <p className="text-xs text-slate-500">{act.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Videos */}
        {report.videos.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2"><Video className="w-5 h-5 text-[#EF7B55]" /> Videos</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {report.videos.map((v, i) => (
                <a key={i} href={v.video_url || v.video_file || "#"} target="_blank" rel="noopener noreferrer" className="block border border-slate-100 rounded-xl p-4 hover:shadow-md transition-shadow hover:border-[#EF7B55]/30 group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors"><Video className="w-5 h-5 text-red-500" /></div>
                    <div><p className="text-sm font-medium text-slate-700 group-hover:text-[#EF7B55] transition-colors">{v.title || "Watch Video"}</p>
                    <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{v.video_url}</p></div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Teacher Notes */}
        {(report.description || sd.teacher_remark) && (
          <div className="bg-gradient-to-br from-[#EF7B55]/5 to-orange-50/50 rounded-2xl border border-[#EF7B55]/10 p-6">
            <h3 className="text-base font-bold text-slate-800 mb-2 flex items-center gap-2"><Award className="w-5 h-5 text-[#EF7B55]" /> Teacher&apos;s Note</h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{sd.teacher_remark || report.description}</p>
            <p className="text-xs text-slate-400 mt-3 text-right">— {report.teacher.name}</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center py-6">
          <div className="flex items-center justify-center gap-2 mb-1"><GraduationCap className="w-5 h-5 text-[#EF7B55]" /><span className="text-sm font-semibold text-slate-600">TECHXAGON Academy</span></div>
          <p className="text-[10px] text-slate-400">Powered by Techxagon • {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, FileText, Send, Trash2, Eye, Copy, Check, ChevronDown, X, Video, Calendar, Users, BookOpen, Code, ClipboardList, Upload, Film, AlertCircle } from "lucide-react";

// ── Types ──
type Report = { id: number; title: string; status: string; recipient_mode: string; course_id: number; course_name: string; recipients_count: number; published_at: string | null; share_token: string; created_at: string; period_start: string | null; period_end: string | null };
type CourseOption = { id: number; name: string };
type TestOption = { id: number; title: string; total_marks: string; visibility: string };
type LessonOption = { id: number; name: string; module_name: string };
type StudentOption = { id: number; name: string; admission_no: string; classroom: string };
type VideoEntry = { title: string; video_url: string; uploading: boolean; fileName: string | null; error: string | null };

// ── VideoUploadCard ──
function VideoUploadCard({ entry, onTitleChange, onFilePick, onRemove }: {
  entry: VideoEntry;
  onTitleChange: (val: string) => void;
  onFilePick: (file: File) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploaded = !!entry.video_url && !entry.uploading;

  return (
    <div className="border rounded-xl p-3 mb-2 space-y-2.5 relative bg-slate-50/50">
      <button onClick={onRemove} className="absolute top-2.5 right-2.5 p-1 hover:bg-red-50 rounded-lg transition-colors">
        <X className="w-3 h-3 text-red-400" />
      </button>

      {/* Title */}
      <input
        placeholder="Video title"
        value={entry.title}
        onChange={e => onTitleChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#EF7B55]/30 focus:border-[#EF7B55] bg-white"
      />

      {/* File drop zone */}
      <div
        onClick={() => !entry.uploading && inputRef.current?.click()}
        className={`flex items-center gap-3 px-3 py-3 rounded-lg border-2 border-dashed transition-colors cursor-pointer select-none ${
          uploaded
            ? "border-green-300 bg-green-50"
            : entry.error
            ? "border-red-300 bg-red-50"
            : entry.uploading
            ? "border-[#EF7B55]/40 bg-orange-50 cursor-wait"
            : "border-slate-200 hover:border-[#EF7B55]/50 hover:bg-orange-50/30"
        }`}
      >
        {uploaded ? (
          <>
            <Film className="w-5 h-5 text-green-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-green-700 truncate">{entry.fileName}</p>
              <p className="text-[10px] text-green-500">Uploaded successfully</p>
            </div>
            <Check className="w-4 h-4 text-green-500 shrink-0" />
          </>
        ) : entry.uploading ? (
          <>
            <div className="w-5 h-5 rounded-full border-2 border-[#EF7B55] border-t-transparent animate-spin shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-600 truncate">{entry.fileName}</p>
              <div className="mt-1.5 h-1 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#EF7B55] rounded-full animate-pulse w-3/4" />
              </div>
            </div>
          </>
        ) : entry.error ? (
          <>
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-red-600">{entry.error}</p>
              <p className="text-[10px] text-red-400 mt-0.5">Click to try again</p>
            </div>
          </>
        ) : (
          <>
            <Upload className="w-5 h-5 text-slate-400 shrink-0" />
            <div>
              <p className="text-xs font-medium text-slate-600">Click to attach video</p>
              <p className="text-[10px] text-slate-400">MP4, WebM, MKV · Max 100 MB</p>
            </div>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm,video/ogg,video/x-matroska,video/mpeg"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onFilePick(f); e.target.value = ""; }}
      />
    </div>
  );
}

// Removed ReportPreviewModal as it's now a dedicated page

export function TeacherReports() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [copied, setCopied] = useState<number | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/teacher/reports");
      const data = await res.json();
      setReports(data.results || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  const fetchCourses = useCallback(async () => {
    try {
      const res = await fetch("/api/teacher/courses");
      const data = await res.json();
      setCourses(Array.isArray(data) ? data : data.results || data.courses || []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchReports(); fetchCourses(); }, [fetchReports, fetchCourses]);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this draft report?")) return;
    await fetch(`/api/teacher/reports/${id}`, { method: "DELETE" });
    fetchReports();
  };

  const handlePublish = async (id: number) => {
    if (!confirm("Publish this report? Scores will be snapshotted and sent to recipients.")) return;
    await fetch(`/api/teacher/reports/${id}/publish`, { method: "POST" });
    fetchReports();
  };

  const copyLink = (report: Report) => {
    const url = `${window.location.origin}/report/${report.share_token}`;
    navigator.clipboard.writeText(url);
    setCopied(report.id);
    setTimeout(() => setCopied(null), 2000);
  };

  if (showCreate) {
    return <CreateReportView courses={courses} onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); fetchReports(); }} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Student Reports</h1>
          <p className="text-sm text-slate-500 mt-1">Create and send activity reports to parents</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#EF7B55] text-white rounded-lg hover:bg-[#d96a44] transition-colors font-medium text-sm shadow-sm">
          <Plus className="w-4 h-4" /> New Report
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EF7B55]" /></div>
      ) : reports.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-100">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No reports yet. Create your first report!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {reports.map(r => (
            <div key={r.id} className="bg-white rounded-xl border border-slate-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-800 truncate">{r.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${r.status === "published" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                      {r.status === "published" ? "Published" : "Draft"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{r.course_name}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{r.recipients_count} students</span>
                    <span>{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 ml-4">
                  <button onClick={() => router.push(`/teacher/reports/${r.id}`)} className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-500 transition-colors" title="Preview">
                    <Eye className="w-4 h-4" />
                  </button>
                  {r.status === "published" && (
                    <button onClick={() => copyLink(r)} className="p-2 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-[#EF7B55] transition-colors" title="Copy share link">
                      {copied === r.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  )}
                  {r.status === "draft" && (
                    <>
                      <button onClick={() => handlePublish(r.id)} className="p-2 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-500 transition-colors" title="Publish"><Send className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(r.id)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

// ── Create Report View ──
function CreateReportView({ courses, onClose, onCreated }: { courses: CourseOption[]; onClose: () => void; onCreated: () => void }) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [courseId, setCourseId] = useState<number | null>(null);
  const [recipientMode, setRecipientMode] = useState("course");
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [selectedTests, setSelectedTests] = useState<number[]>([]);
  const [selectedLessons, setSelectedLessons] = useState<number[]>([]);
  const [activities, setActivities] = useState<{ title: string; description: string; activity_date: string }[]>([]);
  const [videos, setVideos] = useState<VideoEntry[]>([]);
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");

  const [tests, setTests] = useState<TestOption[]>([]);
  const [lessons, setLessons] = useState<LessonOption[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    setDataLoading(true);
    fetch(`/api/teacher/reports/student-data?course_id=${courseId}`)
      .then(r => r.json())
      .then(d => { setTests(d.tests || []); setLessons(d.lessons || []); setStudents(d.students || []); })
      .catch(() => { })
      .finally(() => setDataLoading(false));
  }, [courseId]);

  const handleSubmit = async () => {
    if (!courseId || !title.trim()) return;
    setSubmitting(true);
    try {
      const body = {
        course_id: courseId, title, description, recipient_mode: recipientMode,
        student_ids: recipientMode === "selected" ? selectedStudents : [],
        cbt_test_ids: selectedTests, coding_lesson_ids: selectedLessons,
        activities,
        videos: videos.filter(v => v.video_url && v.title).map(v => ({ title: v.title, video_url: v.video_url })),
        period_start: periodStart || null, period_end: periodEnd || null,
      };
      const res = await fetch("/api/teacher/reports", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) onCreated();
    } catch { /* ignore */ } finally { setSubmitting(false); }
  };

  const addActivity = () => setActivities([...activities, { title: "", description: "", activity_date: "" }]);
  const removeActivity = (i: number) => setActivities(activities.filter((_, idx) => idx !== i));
  const updateActivity = (i: number, field: string, val: string) => { const a = [...activities]; (a[i] as any)[field] = val; setActivities(a); };

  const addVideo = () => setVideos(prev => [...prev, { title: "", video_url: "", uploading: false, fileName: null, error: null }]);
  const removeVideo = (i: number) => setVideos(prev => prev.filter((_, idx) => idx !== i));
  const updateVideoTitle = (i: number, val: string) => setVideos(prev => prev.map((v, idx) => idx === i ? { ...v, title: val } : v));

  const handleVideoFilePick = async (i: number, file: File) => {
    const MAX = 100 * 1024 * 1024;
    if (file.size > MAX) {
      setVideos(prev => prev.map((v, idx) => idx === i ? { ...v, error: `File too large. Max 100 MB (this file is ${(file.size / 1024 / 1024).toFixed(1)} MB).`, uploading: false } : v));
      return;
    }
    setVideos(prev => prev.map((v, idx) => idx === i ? { ...v, fileName: file.name, uploading: true, error: null, video_url: "" } : v));
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/teacher/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setVideos(prev => prev.map((v, idx) => idx === i ? { ...v, uploading: false, video_url: data.url } : v));
    } catch (e: any) {
      setVideos(prev => prev.map((v, idx) => idx === i ? { ...v, uploading: false, error: e.message || "Upload failed" } : v));
    }
  };

  const toggleItem = (list: number[], setList: (v: number[]) => void, id: number) => {
    setList(list.includes(id) ? list.filter(x => x !== id) : [...list, id]);
  };

  return (
    <div className="bg-white rounded-2xl w-full border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-[#EF7B55]/5 to-transparent">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Create Report</h2>
          <p className="text-xs text-slate-400">Step {step} of 3</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4" /></button>
      </div>

      {/* Progress */}
      <div className="px-6 pt-3">
        <div className="flex gap-1">
          {[1, 2, 3].map(s => (<div key={s} className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? "bg-[#EF7B55]" : "bg-slate-100"}`} />))}
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-6">
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Report Title *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Term 2 Activity Report" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#EF7B55]/30 focus:border-[#EF7B55]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Course *</label>
              <select value={courseId || ""} onChange={e => setCourseId(Number(e.target.value))} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#EF7B55]/30">
                <option value="">Select course</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Period Start</label>
                <input type="date" value={periodStart} onChange={e => setPeriodStart(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#EF7B55]/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Period End</label>
                <input type="date" value={periodEnd} onChange={e => setPeriodEnd(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#EF7B55]/30" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Send To</label>
              <div className="flex gap-2">
                {[{ v: "course", l: "All in Course" }, { v: "classroom", l: "All in Class" }, { v: "selected", l: "Select Students" }].map(o => (
                  <button key={o.v} onClick={() => setRecipientMode(o.v)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${recipientMode === o.v ? "bg-[#EF7B55] text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}>{o.l}</button>
                ))}
              </div>
            </div>
            {recipientMode === "selected" && courseId && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Students ({selectedStudents.length})</label>
                <div className="max-h-40 overflow-y-auto border rounded-lg p-2 space-y-1">
                  {dataLoading ? <p className="text-xs text-slate-400 p-2">Loading...</p> : students.map(s => (
                    <label key={s.id} className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded cursor-pointer">
                      <input type="checkbox" checked={selectedStudents.includes(s.id)} onChange={() => toggleItem(selectedStudents, setSelectedStudents, s.id)} className="accent-[#EF7B55]" />
                      <span className="text-sm text-slate-700">{s.name}</span>
                      <span className="text-xs text-slate-400 ml-auto">{s.admission_no}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Teacher Notes</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Add notes about student performance..." rows={3} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#EF7B55]/30 resize-none" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            {/* CBT Tests */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2"><ClipboardList className="w-4 h-4 text-[#EF7B55]" /> CBT Tests ({selectedTests.length} selected)</h3>
              <div className="max-h-44 overflow-y-auto border rounded-lg p-2 space-y-1">
                {dataLoading ? <p className="text-xs text-slate-400 p-2">Loading...</p> : tests.length === 0 ? <p className="text-xs text-slate-400 p-2">No tests found</p> : tests.map(t => (
                  <label key={t.id} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer">
                    <input type="checkbox" checked={selectedTests.includes(t.id)} onChange={() => toggleItem(selectedTests, setSelectedTests, t.id)} className="accent-[#EF7B55]" />
                    <span className="text-sm text-slate-700 flex-1">{t.title}</span>
                    <span className="text-xs text-slate-400">{t.total_marks} marks</span>
                  </label>
                ))}
              </div>
            </div>
            {/* Coding Lessons */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2"><Code className="w-4 h-4 text-[#EF7B55]" /> Coding Submissions ({selectedLessons.length} selected)</h3>
              <div className="max-h-44 overflow-y-auto border rounded-lg p-2 space-y-1">
                {dataLoading ? <p className="text-xs text-slate-400 p-2">Loading...</p> : lessons.length === 0 ? <p className="text-xs text-slate-400 p-2">No lessons found</p> : lessons.map(l => (
                  <label key={l.id} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer">
                    <input type="checkbox" checked={selectedLessons.includes(l.id)} onChange={() => toggleItem(selectedLessons, setSelectedLessons, l.id)} className="accent-[#EF7B55]" />
                    <span className="text-sm text-slate-700 flex-1">{l.name}</span>
                    <span className="text-xs text-slate-400">{l.module_name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            {/* Activities */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2"><Calendar className="w-4 h-4 text-[#EF7B55]" /> Class Activities</h3>
                <button onClick={addActivity} className="text-xs text-[#EF7B55] hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
              </div>
              {activities.map((a, i) => (
                <div key={i} className="border rounded-lg p-3 mb-2 space-y-2 relative">
                  <button onClick={() => removeActivity(i)} className="absolute top-2 right-2 p-1 hover:bg-red-50 rounded"><X className="w-3 h-3 text-red-400" /></button>
                  <input placeholder="Activity title" value={a.title} onChange={e => updateActivity(i, "title", e.target.value)} className="w-full px-2 py-1.5 rounded border border-slate-200 text-sm" />
                  <textarea placeholder="Description" value={a.description} onChange={e => updateActivity(i, "description", e.target.value)} rows={2} className="w-full px-2 py-1.5 rounded border border-slate-200 text-sm resize-none" />
                  <input type="date" value={a.activity_date} onChange={e => updateActivity(i, "activity_date", e.target.value)} className="px-2 py-1.5 rounded border border-slate-200 text-sm" />
                </div>
              ))}
              {activities.length === 0 && <p className="text-xs text-slate-400 py-2">No activities added yet</p>}
            </div>
            {/* Videos */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2"><Video className="w-4 h-4 text-[#EF7B55]" /> Video Attachments</h3>
                <button onClick={addVideo} className="text-xs text-[#EF7B55] hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
              </div>
              {videos.map((v, i) => (
                <VideoUploadCard
                  key={i}
                  index={i}
                  entry={v}
                  onTitleChange={(val) => updateVideoTitle(i, val)}
                  onFilePick={(file) => handleVideoFilePick(i, file)}
                  onRemove={() => removeVideo(i)}
                />
              ))}
              {videos.length === 0 && <p className="text-xs text-slate-400 py-2">No videos added yet</p>}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-100 flex justify-between">
        <button onClick={() => step > 1 ? setStep(step - 1) : onClose()} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">{step > 1 ? "Back" : "Cancel"}</button>
        {step < 3 ? (
          <button onClick={() => setStep(step + 1)} disabled={step === 1 && (!title.trim() || !courseId)} className="px-5 py-2 text-sm bg-[#EF7B55] text-white rounded-lg hover:bg-[#d96a44] disabled:opacity-50 font-medium">Next</button>
        ) : (
          <button onClick={handleSubmit} disabled={submitting} className="px-5 py-2 text-sm bg-[#EF7B55] text-white rounded-lg hover:bg-[#d96a44] disabled:opacity-50 font-medium flex items-center gap-2">
            {submitting && <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />} Create Report
          </button>
        )}
      </div>
    </div>
  );
}

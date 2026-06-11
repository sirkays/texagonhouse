"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Plus, FileText, Trash, Edit, CheckCircle, Clock, Upload, ArrowLeft, Users, Download, Star, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Submissions
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [subLoading, setSubLoading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [gradingScore, setGradingScore] = useState("");
  const [gradingFeedback, setGradingFeedback] = useState("");
  const [isGrading, setIsGrading] = useState(false);

  // Resolved presigned download URLs for selected submission attachments
  type ResolvedFile = { key: string; url: string; filename: string };
  const [resolvedSubFiles, setResolvedSubFiles] = useState<ResolvedFile[]>([]);
  const [isResolvingSubFiles, setIsResolvingSubFiles] = useState(false);

  // View state: 'list' | 'create' | 'view' | 'edit'
  const [view, setView] = useState<'list' | 'create' | 'view' | 'edit'>('list');
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);

  // Form State
  const [newTitle, setNewTitle] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [steps, setSteps] = useState<string[]>([""]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [assnRes, coursesRes] = await Promise.all([
        fetch("/api/assignments"),
        fetch("/api/teacher/courses")
      ]);

      if (assnRes.ok) {
        const data = await assnRes.json();
        setAssignments(data.results || data || []);
      }

      if (coursesRes.ok) {
        const data = await coursesRes.json();
        const publicCourses = (data.results || data || []).filter((c: any) => c.course_type === "public" || c.course_type === "Public");
        const coursesList = publicCourses.length > 0 ? publicCourses : (data.results || data || []);
        setCourses(coursesList);
        if (coursesList.length > 0 && !selectedCourseId) {
          setSelectedCourseId(coursesList[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async (courseId: string) => {
    if (!courseId) return;
    try {
      const res = await fetch(`/api/teacher/modules?course_id=${courseId}&include_lessons=1`);
      if (res.ok) {
        const data = await res.json();
        const modules = data.results || data || [];
        const hasLessons = modules.some((m: any) => m.lessons && m.lessons.length > 0);
        if (hasLessons) {
          const allLessons = modules.flatMap((m: any) => m.lessons || []);
          setLessons(allLessons);
        } else {
          setLessons(modules);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Submissions Pagination and Classroom Filtering State
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalSubmissions, setTotalSubmissions] = useState<number>(0);

  const fetchClassrooms = async () => {
    try {
      const res = await fetch("/api/admin/students/classrooms?page_size=100");
      if (res.ok) {
        const data = await res.json();
        setClassrooms(data.results || data || []);
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchData();
    fetchClassrooms();
  }, []);

  useEffect(() => {
    if (selectedCourseId) fetchLessons(selectedCourseId);
  }, [selectedCourseId]);

  const fetchSubmissions = async (assignmentId: string, page = 1, classroom = "") => {
    setSubLoading(true);
    setSubmissions([]);
    setSelectedSubmission(null);
    setResolvedSubFiles([]);
    try {
      let url = `/api/submissions/by-assignment/${assignmentId}?page=${page}&page_size=10`;
      if (classroom) {
        url += `&classroom=${encodeURIComponent(classroom)}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data && data.results !== undefined) {
          setSubmissions(data.results);
          setTotalSubmissions(data.count ?? 0);
          setTotalPages(Math.ceil((data.count ?? 0) / 10));
        } else {
          setSubmissions(data || []);
          setTotalSubmissions(data?.length ?? 0);
          setTotalPages(1);
        }
      }
    } catch (err) { console.error(err); }
    finally { setSubLoading(false); }
  };

  const resolveSubmissionFiles = async (keys: string[]) => {
    if (!keys || keys.length === 0) { setResolvedSubFiles([]); return; }
    setIsResolvingSubFiles(true);
    try {
      const res = await fetch("/api/presign-attachment-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keys }),
      });
      if (res.ok) {
        const data = await res.json();
        setResolvedSubFiles(data.files || []);
      }
    } catch (err) { console.error(err); }
    finally { setIsResolvingSubFiles(false); }
  };

  const handleGrade = async (submissionId: string) => {
    if (!gradingScore) return;

    // Validate score is between 0 and 100
    const parsedScore = parseFloat(gradingScore);
    if (isNaN(parsedScore) || parsedScore < 0 || parsedScore > 100) {
      alert("Please enter a valid score between 0 and 100.");
      return;
    }

    setIsGrading(true);
    try {
      const res = await fetch(`/api/submissions/${submissionId}/grade`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: parsedScore, feedback: gradingFeedback }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSubmissions(prev => prev.map(s => s.id === submissionId ? { ...s, ...updated } : s));
        setSelectedSubmission((prev: any) => prev ? { ...prev, ...updated } : prev);
        setGradingScore("");
        setGradingFeedback("");
      } else {
        const err = await res.json().catch(() => ({}));
        alert(`Failed to grade: ${err?.error || res.statusText}`);
      }
    } catch (err) { console.error(err); }
    finally { setIsGrading(false); }
  };

  const addStep = () => setSteps([...steps, ""]);
  const updateStep = (index: number, val: string) => {
    const newSteps = [...steps];
    newSteps[index] = val;
    setSteps(newSteps);
  };
  const removeStep = (index: number) => {
    if (steps.length === 1) return;
    const newSteps = steps.filter((_, i) => i !== index);
    setSteps(newSteps);
  };

  const openCreate = () => {
    setNewTitle("");
    setSteps([""]);
    setSelectedCourseId(courses.length > 0 ? courses[0].id : "");
    setSelectedLessonId("");
    setDueDate("");
    setAttachments([]);
    setExistingAttachments([]);
    setSelectedAssignment(null);
    setView('create');
  };

  const openEdit = (a: any) => {
    setSelectedAssignment(a);
    setNewTitle(a.title);
    const courseIdStr = a.course ? String(a.course) : "";
    setSelectedCourseId(courseIdStr);
    setSelectedLessonId(a.lesson ? String(a.lesson) : "");
    setDueDate(a.due_at ? new Date(a.due_at).toISOString().split('T')[0] : "");

    // Explicitly fetch lessons for the editing assignment's course to populate the dropdown options immediately
    if (courseIdStr) {
      fetchLessons(courseIdStr);
    }

    // Parse steps from description
    try {
      const parsed = JSON.parse(a.description);
      if (parsed.type === 'steps' && Array.isArray(parsed.items)) {
        setSteps(parsed.items.length > 0 ? parsed.items : [""]);
      } else {
        setSteps([a.description]);
      }
    } catch {
      setSteps([a.description || ""]);
    }

    setAttachments([]);
    setExistingAttachments(Array.isArray(a.attachments) ? a.attachments : []);
    setView('edit');
  };

  const { data: session } = useSession();
  const sessionToken = (session?.user as any)?.sessionToken;

  const UPLOAD_BUCKET = process.env.NEXT_PUBLIC_UPLOAD_BUCKET || "s3";
  const DJANGO_BASE = process.env.NEXT_PUBLIC_DJANGO_BASE_URL || "https://texagon-backend.onrender.com";

  async function uploadToCloudinary(file: File): Promise<string> {
    const sig = await fetch(`${DJANGO_BASE}/learning/api/cloudinary-signature/`, {
      headers: { "X-Session-Token": sessionToken },
    }).then(async (r) => {
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.detail || j?.error || "Cloudinary signature failed");
      return j;
    });

    const fd = new FormData();
    fd.append("file", file);
    fd.append("api_key", sig.api_key);
    fd.append("timestamp", String(sig.timestamp));
    fd.append("signature", sig.signature);
    fd.append("folder", sig.folder);

    const resource = file.type.startsWith("video/") || file.type.startsWith("audio/") ? "video" : "raw";
    const url = `https://api.cloudinary.com/v1_1/${sig.cloud_name}/${resource}/upload`;

    const data = await new Promise<any>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", url, true);
      xhr.onload = () => {
        const json = JSON.parse(xhr.responseText || "{}");
        if (xhr.status >= 200 && xhr.status < 300) resolve(json);
        else reject(new Error(json?.error?.message || "Cloudinary upload failed"));
      };
      xhr.onerror = () => reject(new Error("Cloudinary network error"));
      xhr.send(fd);
    });

    return data.secure_url as string;
  }

  async function uploadToS3(file: File): Promise<string> {
    // ── LOCAL MODE: send file directly as multipart to the backend ──
    // The backend's presign_s3 view in local mode saves the file and returns
    // upload_url: null, so we must not try to PUT to a null URL.
    if (UPLOAD_BUCKET !== "cloudinary") {
      // Probe local mode with a filename-only pre-check
      const probe = await fetch(`${DJANGO_BASE}/learning/api/presign-s3/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Token": sessionToken,
        },
        body: JSON.stringify({
          filename: file.name,
          content_type: file.type || "application/octet-stream",
        }),
      }).then(async (r) => {
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j?.detail || j?.error || "Failed to presign S3 upload");
        return j;
      });

      // LOCAL mode: upload_url is null — send file as multipart directly
      if (!probe.upload_url || probe.mode === "local") {
        const fd = new FormData();
        fd.append("file", file);
        const uploadRes = await fetch(`${DJANGO_BASE}/learning/api/presign-s3/`, {
          method: "POST",
          headers: { "X-Session-Token": sessionToken },
          body: fd,
        });
        const uploadJson = await uploadRes.json().catch(() => ({}));
        if (!uploadRes.ok) throw new Error(uploadJson?.detail || "Local file upload failed");
        return uploadJson.key as string;
      }

      // S3 mode: use the presigned PUT URL
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", probe.upload_url, true);
        xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`S3 upload failed (${xhr.status})`));
        };
        xhr.onerror = () => reject(new Error("Network error during S3 upload"));
        xhr.send(file);
      });

      return probe.key as string;
    }

    // Fallback (should not reach here if UPLOAD_BUCKET is cloudinary)
    throw new Error("Unexpected upload path");
  }

  const handleSubmit = async () => {
    if (!selectedCourseId) {
      alert("Please select a course.");
      return;
    }
    if (!newTitle.trim()) {
      alert("Please enter a title.");
      return;
    }

    // Validate file sizes (10MB max)
    for (const f of attachments) {
      if (f.size > 10 * 1024 * 1024) {
        alert(`File ${f.name} exceeds the 10MB limit.`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      // Upload files first
      const uploadedUrls: string[] = [];
      for (const file of attachments) {
        let url = "";
        if (UPLOAD_BUCKET === "cloudinary") {
          url = await uploadToCloudinary(file);
        } else {
          url = await uploadToS3(file);
        }
        uploadedUrls.push(url);
      }

      // Serialize steps into description
      const finalDescription = JSON.stringify({
        type: "steps",
        items: steps.filter(s => s.trim() !== "")
      });

      const payload = {
        title: newTitle,
        description: finalDescription,
        course: parseInt(selectedCourseId),
        lesson: selectedLessonId ? parseInt(selectedLessonId) : null,
        due_at: dueDate ? new Date(dueDate).toISOString() : null,
        attachments: [...existingAttachments, ...uploadedUrls],
      };

      const url = view === 'edit' && selectedAssignment
        ? `/api/assignments/${selectedAssignment.id}/`
        : "/api/assignments/";

      const res = await fetch(url, {
        method: view === 'edit' ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setView('list');
        fetchData();
      } else {
        alert(`${view === 'edit' ? 'Update' : 'Creation'} failed. Please try again.`);
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during submission. Check console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><Spinner size="lg" className="text-[#EF7B55]" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {view === 'list' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Premium Hero Header Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-[#e26d47] p-6 sm:p-8 text-white shadow-xl dark:shadow-none mb-6">
            <div className="absolute right-0 top-0 h-64 w-64 -translate-y-12 translate-x-12 rounded-full bg-[#EF7B55]/15 blur-3xl" />
            <div className="absolute left-1/3 bottom-0 h-40 w-40 translate-y-12 rounded-full bg-indigo-500/15 blur-3xl" />
            
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <Badge className="bg-[#EF7B55]/20 text-[#ffae91] border border-[#EF7B55]/30 hover:bg-[#EF7B55]/30 px-3 py-1 font-semibold text-xs tracking-wide">
                  Academic Gradebook Desk
                </Badge>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-orange-100 bg-clip-text text-transparent">
                  Assignments Workspace
                </h1>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
                  Design tasks and study steps, link reference module videos, receive student submission files, and evaluate assignments with grade scores and professional feedback.
                </p>
              </div>
              
              <div className="flex gap-2 shrink-0">
                <Button onClick={openCreate} className="h-11 backdrop-blur-md bg-[#EF7B55] hover:bg-[#d96a44] border border-white/20 text-white font-bold rounded-xl shadow-md transition-all duration-300 text-xs sm:text-sm flex items-center gap-2">
                  <Plus className="w-4.5 h-4.5 text-white" />
                  <span>New Assignment</span>
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/60 shadow-lg shadow-slate-100/40 dark:shadow-none rounded-2xl overflow-hidden transition-all duration-300 p-6 min-h-[400px]">
            {assignments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-[#EF7B55] opacity-80" />
                </div>
                <h3 className="text-lg font-medium text-slate-700">No Assignments Yet</h3>
                <p className="text-sm mt-1 max-w-sm text-center">Get started by creating your first assignment. You can link lessons and add step-by-step instructions.</p>
                <Button onClick={openCreate} variant="outline" className="mt-6 border-[#EF7B55] text-[#EF7B55] hover:bg-orange-50 rounded-xl">
                  Create First Assignment
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assignments.map(a => (
                  <div key={a.id} className="relative overflow-hidden p-5 border border-slate-150 dark:border-slate-800 bg-white/40 dark:bg-slate-950/20 hover:bg-slate-50/50 dark:hover:bg-slate-850/20 hover:border-[#EF7B55]/50 transition-all duration-300 shadow-sm rounded-2xl flex flex-col justify-between h-[220px] pl-6">
                    {/* Left glowing border */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#EF7B55] to-orange-500" />
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div className="p-2 bg-orange-50 rounded-lg">
                          <FileText className="w-5 h-5 text-[#EF7B55]" />
                        </div>
                        {a.due_at && (
                          <span className="text-[10px] font-medium px-2 py-1 bg-red-50 text-red-600 rounded-full flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Due {new Date(a.due_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-slate-800 text-lg leading-tight line-clamp-2">{a.title}</h3>
                      <p className="text-xs text-slate-500 mt-2 line-clamp-1">Course ID: {a.course}</p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <span className="text-xs font-medium text-slate-400 flex items-center gap-1"><Users className="w-3 h-3" /> Submissions</span>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(a)} className="text-slate-500 hover:text-[#EF7B55] hover:bg-orange-50 rounded-lg px-2">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedAssignment(a); setSelectedSubmission(null); setCurrentPage(1); setSelectedClassroom(""); fetchSubmissions(a.id, 1, ""); setView('view'); }} className="text-[#EF7B55] hover:bg-orange-50 rounded-lg px-3">
                          View Submissions
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {(view === 'create' || view === 'edit') && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500 pb-20">
          <div className="flex items-center gap-4">
            <Button onClick={() => setView('list')} variant="ghost" size="icon" className="rounded-full w-10 h-10 bg-white border shadow-sm text-slate-600 hover:text-[#EF7B55] hover:bg-orange-50">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{view === 'edit' ? 'Edit Assignment' : 'Create Assignment'}</h1>
              <p className="text-sm text-slate-500">{view === 'edit' ? 'Update the details for this assignment.' : 'Design a step-by-step task for your students.'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">

              {/* Core Information */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#EF7B55] text-white text-xs font-bold">1</span>
                    Basic Information
                  </h2>
                  <div className="space-y-4 ml-8">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">Assignment Title</label>
                      <Input
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                        placeholder="e.g., Build a personal portfolio website"
                        className="h-12 bg-slate-50/50 border-slate-200 focus:bg-white rounded-xl text-base"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Step-by-Step Instructions */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-1">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#EF7B55] text-white text-xs font-bold">2</span>
                    Step-by-Step Instructions
                  </h2>
                  <p className="text-xs text-slate-500 ml-8 mb-6">Break down the assignment into clear, actionable steps for your students.</p>

                  <div className="space-y-4 ml-8">
                    {steps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3 group">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-medium text-sm mt-1">
                          {idx + 1}
                        </div>
                        <div className="flex-1 relative">
                          <Textarea
                            value={step}
                            onChange={e => updateStep(idx, e.target.value)}
                            placeholder={`Describe step ${idx + 1}...`}
                            className="min-h-[80px] bg-slate-50/50 border-slate-200 focus:bg-white rounded-xl resize-none pr-12"
                          />
                          {steps.length > 1 && (
                            <button
                              onClick={() => removeStep(idx)}
                              className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                              title="Remove step"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    <Button
                      variant="outline"
                      onClick={addStep}
                      className="border-dashed border-2 border-slate-200 text-slate-500 hover:text-[#EF7B55] hover:border-[#EF7B55] hover:bg-orange-50 rounded-xl h-12 w-full mt-2"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add Another Step
                    </Button>
                  </div>
                </div>
              </div>

            </div>

            <div className="space-y-6">

              {/* Configuration Sidebar */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-6">
                <h3 className="font-semibold text-slate-800 text-base">Configuration</h3>

                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-wider text-slate-500 uppercase">Target Course</label>
                  <select
                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#EF7B55]"
                    value={selectedCourseId ? String(selectedCourseId) : ""}
                    onChange={e => {
                      setSelectedCourseId(e.target.value);
                      setSelectedLessonId("");
                    }}
                  >
                    {courses.length === 0 && <option value="">No public courses available</option>}
                    {courses.map(c => (
                      <option key={String(c.id)} value={String(c.id)}>{c.name || `Course #${c.id}`}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-wider text-slate-500 uppercase">Link Lesson Guide (Optional)</label>
                  <select
                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#EF7B55]"
                    value={selectedLessonId ? String(selectedLessonId) : ""}
                    onChange={e => setSelectedLessonId(e.target.value)}
                    disabled={!selectedCourseId || lessons.length === 0}
                  >
                    <option value="">No lesson linked</option>
                    {lessons.map(l => (
                      <option key={String(l.id)} value={String(l.id)}>{l.title}</option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-400">Links the student directly to a module video.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-wider text-slate-500 uppercase">Due Date (Optional)</label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="h-11 bg-slate-50/50 border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Attachments Sidebar */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                <h3 className="font-semibold text-slate-800 text-base">Resource Files</h3>
                <p className="text-xs text-slate-500">Upload starter files or pdf guides.</p>

                <label className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer group relative">
                  <input
                    type="file"
                    multiple
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={e => {
                      if (e.target.files) {
                        setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
                      }
                    }}
                  />
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-3 group-hover:bg-[#EF7B55] group-hover:text-white transition-colors">
                    <Upload className="w-5 h-5 text-slate-400 group-hover:text-white" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">Click to upload files</span>
                  <span className="text-xs text-slate-400 mt-1">PDF, ZIP, Images</span>
                </label>

                {/* Existing attachments from server */}
                {existingAttachments.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <p className="text-xs font-semibold text-slate-500">Previously Attached</p>
                    {existingAttachments.map((url, i) => {
                      const filename = url.split('/').pop()?.split('?')[0] || `File ${i + 1}`;
                      return (
                        <div key={`existing-${i}`} className="flex items-center justify-between bg-emerald-50 px-3 py-2 rounded-xl text-sm border border-emerald-100">
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="truncate max-w-[150px]" title={filename}>{decodeURIComponent(filename)}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setExistingAttachments(prev => prev.filter((_, idx) => idx !== i))}
                            className="text-slate-400 hover:text-red-500"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Newly added files */}
                {attachments.length > 0 && (
                  <div className="space-y-2 mt-4">
                    {view === 'edit' && <p className="text-xs font-semibold text-slate-500">New Files</p>}
                    {attachments.map((file, i) => (
                      <div key={i} className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-xl text-sm border border-slate-100">
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-4 h-4 text-[#EF7B55] shrink-0" />
                          <span className="truncate max-w-[150px]">{file.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                          className="text-slate-400 hover:text-red-500"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Action */}
              <div className="pt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !newTitle.trim()}
                  className="w-full h-12 bg-[#EF7B55] hover:bg-[#d96a44] text-white rounded-xl shadow-md text-base font-medium transition-all"
                >
                  {isSubmitting ? <Spinner size="sm" className="text-white mr-2" /> : <CheckCircle className="w-5 h-5 mr-2" />}
                  {view === 'edit' ? 'Update Assignment' : 'Publish Assignment'}
                </Button>
              </div>

            </div>
          </div>
        </div>
      )}

      {view === 'view' && selectedAssignment && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500 pb-20">
          <div className="flex items-center gap-4 mb-4">
            <Button onClick={() => { setView('list'); setSelectedSubmission(null); }} variant="ghost" size="icon" className="rounded-full w-10 h-10 bg-white border shadow-sm text-slate-600 hover:text-[#EF7B55] hover:bg-orange-50">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-800">Student Submissions</h1>
              <p className="text-sm text-slate-500">{selectedAssignment.title}</p>
            </div>
            <span className="text-xs font-semibold px-3 py-1.5 bg-orange-50 text-[#EF7B55] rounded-full">{totalSubmissions} submitted</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Submissions List */}
            <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col justify-between min-h-[480px]">
              <div>
                <div className="p-4 border-b border-slate-100 flex flex-col gap-3">
                  <h3 className="font-semibold text-slate-700 text-sm">All Submissions</h3>
                  {/* Classroom Filter Dropdown */}
                  <select
                    className="w-full h-9 rounded-xl border border-slate-200 bg-slate-50 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#EF7B55]"
                    value={selectedClassroom}
                    onChange={e => {
                      const cid = e.target.value;
                      setSelectedClassroom(cid);
                      setCurrentPage(1);
                      fetchSubmissions(selectedAssignment.id, 1, cid);
                    }}
                  >
                    <option value="">All Classes</option>
                    {classrooms
                      .filter(c => {
                        const isPrivateCourse = selectedAssignment?.course_type?.toLowerCase() === 'private';
                        const isPrivateClass = c.class_type?.toLowerCase() === 'private';
                        return isPrivateCourse ? isPrivateClass : !isPrivateClass;
                      })
                      .map(c => (
                        <option key={c.id} value={c.id}>{c.name || `Class #${c.id}`}</option>
                      ))}
                  </select>
                </div>
                {subLoading ? (
                  <div className="flex justify-center py-12"><Spinner size="sm" className="text-[#EF7B55]" /></div>
                ) : submissions.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No submissions yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50 max-h-[350px] overflow-y-auto">
                    {submissions.map(sub => (
                      <button key={sub.id} onClick={() => { setSelectedSubmission(sub); setGradingScore(sub.score ?? ""); setGradingFeedback(sub.feedback ?? ""); resolveSubmissionFiles(Array.isArray(sub.attachments) ? sub.attachments : []); }}
                        className={`w-full text-left px-4 py-3 hover:bg-orange-50 transition-colors ${selectedSubmission?.id === sub.id ? 'bg-orange-50 border-r-2 border-[#EF7B55]' : ''}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#EF7B55] to-orange-300 flex items-center justify-center text-white text-xs font-bold">
                              {(sub.student_name || 'S').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-800 truncate max-w-[120px]">{sub.student_name || `Student #${sub.student}`}</p>
                              <p className="text-[10px] text-slate-400">{new Date(sub.submitted_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          {sub.score != null ? (
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{sub.score}pts</span>
                          ) : (
                            <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Pending</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Submissions Pagination Controls */}
              {totalPages > 1 && (
                <div className="p-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => {
                      const prevPage = currentPage - 1;
                      setCurrentPage(prevPage);
                      fetchSubmissions(selectedAssignment.id, prevPage, selectedClassroom);
                    }}
                    className="h-8 text-xs font-semibold px-3 text-slate-600 hover:text-[#EF7B55] hover:bg-orange-50 rounded-lg"
                  >
                    Prev
                  </Button>
                  <span className="text-xs text-slate-500 font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => {
                      const nextPage = currentPage + 1;
                      setCurrentPage(nextPage);
                      fetchSubmissions(selectedAssignment.id, nextPage, selectedClassroom);
                    }}
                    className="h-8 text-xs font-semibold px-3 text-slate-600 hover:text-[#EF7B55] hover:bg-orange-50 rounded-lg"
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>

            {/* Submission Detail + Grading */}
            <div className="lg:col-span-2">
              {!selectedSubmission ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center min-h-[400px] text-slate-400">
                  <div className="text-center">
                    <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Select a submission to review</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Student answer */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#EF7B55] to-orange-300 flex items-center justify-center text-white font-bold">
                          {(selectedSubmission.student_name || 'S').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{selectedSubmission.student_name || `Student #${selectedSubmission.student}`}</p>
                          <p className="text-xs text-slate-400">Submitted {new Date(selectedSubmission.submitted_at).toLocaleString()}</p>
                        </div>
                      </div>
                      {selectedSubmission.score != null && (
                        <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full flex items-center gap-1"><Star className="w-3.5 h-3.5" />{selectedSubmission.score} pts</span>
                      )}
                    </div>

                    {selectedSubmission.text && (
                      <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap border border-slate-100">
                        {selectedSubmission.text}
                      </div>
                    )}

                    {(isResolvingSubFiles || resolvedSubFiles.length > 0) && (
                      <div className="mt-4">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Attached Files</p>
                        {isResolvingSubFiles ? (
                          <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
                            <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                            Preparing download links…
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {resolvedSubFiles.map((file, i) => (
                              <a key={i} href={file.url} download={file.filename} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-[#EF7B55] hover:underline bg-orange-50 px-3 py-2 rounded-lg cursor-pointer">
                                <Download className="w-4 h-4 shrink-0" />
                                <span className="truncate">{file.filename || `File ${i + 1}`}</span>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {selectedSubmission.feedback && (
                      <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                        <p className="text-xs font-semibold text-emerald-700 mb-1">Your Feedback</p>
                        <p className="text-sm text-emerald-800">{selectedSubmission.feedback}</p>
                      </div>
                    )}
                  </div>

                  {/* Grading panel */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><Star className="w-4 h-4 text-[#EF7B55]" />Grade Submission</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-slate-600 mb-1 block">Score (0 - 100)</label>
                        <Input value={gradingScore} onChange={e => setGradingScore(e.target.value)} type="number" min={0} max={100} placeholder="Enter score..." className="h-10 rounded-xl border-slate-200" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-600 mb-1 block">Feedback (optional)</label>
                        <Textarea value={gradingFeedback} onChange={e => setGradingFeedback(e.target.value)} placeholder="Write feedback for the student..." className="rounded-xl border-slate-200 resize-none min-h-[80px]" />
                      </div>
                      <Button onClick={() => handleGrade(selectedSubmission.id)} disabled={isGrading || !gradingScore} className="w-full h-10 bg-[#EF7B55] hover:bg-[#d96a44] text-white rounded-xl">
                        {isGrading ? <Spinner size="sm" className="text-white mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                        {selectedSubmission.score != null ? 'Update Grade' : 'Submit Grade'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

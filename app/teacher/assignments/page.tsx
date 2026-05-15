"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Plus, FileText, Link as LinkIcon, Trash, Edit, ChevronDown, CheckCircle, Clock, Upload, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // View state: 'list' | 'create' | 'view' | 'edit'
  const [view, setView] = useState<'list' | 'create' | 'view' | 'edit'>('list');
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);

  // Form State
  const [newTitle, setNewTitle] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [steps, setSteps] = useState<string[]>([""]);
  const [attachments, setAttachments] = useState<File[]>([]);
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
      // Typically lessons for a course: /api/teacher/courses/[id]/modules or similar.
      // NextJS might not have proxy. We will just use the available modules endpoint or ignore if missing.
      // We will mock fetching lessons to prevent crashing, wait, let's use the actual api if available.
      // The user has 'module-categories' and 'modules'. 
      const res = await fetch(`/api/teacher/modules?course_id=${courseId}`);
      if (res.ok) {
        const data = await res.json();
        // Assuming data is an array of modules which contain lessons, or directly lessons.
        setLessons(data.results || data || []);
      }
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      fetchLessons(selectedCourseId);
    }
  }, [selectedCourseId]);

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
    setSelectedAssignment(null);
    setView('create');
  };

  const openEdit = (a: any) => {
    setSelectedAssignment(a);
    setNewTitle(a.title);
    setSelectedCourseId(a.course?.toString() || "");
    setSelectedLessonId(a.lesson?.toString() || "");
    setDueDate(a.due_at ? new Date(a.due_at).toISOString().split('T')[0] : "");
    
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
    
    setAttachments([]); // We mock attachments for now
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
    const pres = await fetch(`${DJANGO_BASE}/learning/api/presign-s3/`, {
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

    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", pres.upload_url, true);
      xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else reject(new Error(`S3 upload failed (${xhr.status})`));
      };
      xhr.onerror = () => reject(new Error("Network error during S3 upload"));
      xhr.send(file);
    });

    return pres.key as string;
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
        attachments: uploadedUrls,
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Assignments Workspace</h1>
              <p className="text-slate-500 mt-1 text-sm">Manage all assignments and evaluate student submissions.</p>
            </div>
            
            <Button onClick={openCreate} className="bg-[#EF7B55] hover:bg-[#d96a44] text-white flex items-center gap-2 shadow-sm rounded-xl px-5 h-11">
              <Plus className="w-4 h-4" /> New Assignment
            </Button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2 min-h-[400px]">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {assignments.map(a => (
                  <div key={a.id} className="group relative p-5 border border-slate-100 rounded-2xl hover:border-[#EF7B55] hover:shadow-md transition-all duration-300 bg-white flex flex-col justify-between h-[200px]">
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
                      <span className="text-xs font-medium text-slate-400">0 Submissions</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => openEdit(a)}
                          className="text-slate-500 hover:text-[#EF7B55] hover:bg-orange-50 rounded-lg px-2"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            setSelectedAssignment(a);
                            setView('view');
                          }}
                          className="text-[#EF7B55] hover:bg-orange-50 rounded-lg px-3"
                        >
                          View
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
                    value={selectedCourseId}
                    onChange={e => setSelectedCourseId(e.target.value)}
                  >
                    {courses.length === 0 && <option value="">No public courses available</option>}
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.name || `Course #${c.id}`}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-wider text-slate-500 uppercase">Link Lesson Guide (Optional)</label>
                  <select 
                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#EF7B55]"
                    value={selectedLessonId}
                    onChange={e => setSelectedLessonId(e.target.value)}
                    disabled={!selectedCourseId || lessons.length === 0}
                  >
                    <option value="">No lesson linked</option>
                    {lessons.map(l => (
                      <option key={l.id} value={l.id}>{l.title}</option>
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
                
                {attachments.length > 0 && (
                  <div className="space-y-2 mt-4">
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
            <Button onClick={() => setView('list')} variant="ghost" size="icon" className="rounded-full w-10 h-10 bg-white border shadow-sm text-slate-600 hover:text-[#EF7B55] hover:bg-orange-50">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Assignment Submissions</h1>
              <p className="text-sm text-slate-500">{selectedAssignment.title}</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 min-h-[400px]">
            <div className="text-center py-20 text-slate-500">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-700">No Submissions Yet</h3>
              <p className="text-sm mt-1">Students haven't submitted anything for this assignment.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

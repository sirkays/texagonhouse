"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Link as LinkIcon, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/use-toast";

interface Config {
  id: number;
  name: string;
}

interface Classroom {
  id: number;
  name: string;
}

interface Course {
  id: number;
  name: string;
}

export default function AttachConfigPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { toast } = useToast();
  
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  
  const [attachType, setAttachType] = useState<"classroom" | "course">("classroom");
  const [attachId, setAttachId] = useState("");
  const [attaching, setAttaching] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [resConf, resCls, resCrs] = await Promise.all([
        fetch(`/api/assessment-configs/${id}/`),
        fetch("/api/admin/assessment-overview/classrooms/"),
        fetch("/api/admin/assessment-overview/courses/")
      ]);
      
      if (resConf.ok) setConfig(await resConf.json());
      else {
        toast({ title: "Error", description: "Configuration not found.", variant: "destructive" });
        router.push("/admin/assessment-configs");
        return;
      }
      
      if (resCls.ok) setClassrooms(await resCls.json());
      if (resCrs.ok) setCourses(await resCrs.json());
      
    } catch (e) {
      toast({ title: "Error", description: "Failed to load data.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [id, router, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAttach = async () => {
    if (!attachId) return;
    setAttaching(true);
    try {
      const payload: any = {};
      if (attachType === "classroom") payload.classroom_id = attachId;
      if (attachType === "course") payload.course_id = attachId;
      
      const res = await fetch(`/api/assessment-configs/${id}/attach/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const data = await res.json();
        toast({ title: "Attached", description: data.detail });
        router.push("/admin/assessment-configs");
      } else {
        const err = await res.json();
        toast({ title: "Error", description: err.detail || "Failed to attach.", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Error", description: "Network error.", variant: "destructive" });
    } finally {
      setAttaching(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="text-blue-500 w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* ── Header ── */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/admin/assessment-configs")} className="rounded-full">
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </Button>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">
            Attach Configuration
          </h1>
          <p className="text-sm text-slate-500">
            Apply <strong className="text-slate-700">{config?.name}</strong> to multiple student enrollments at once.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        
        {/* Warning Banner */}
        <div className="bg-amber-50 border-b border-amber-100 p-4 sm:px-8 flex gap-3 text-amber-800">
          <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
          <div className="text-sm leading-relaxed">
            <strong>Warning:</strong> Attaching this configuration will overwrite any custom grade settings previously set for individual students in the selected classroom or course.
          </div>
        </div>
        
        <div className="p-6 sm:p-8 space-y-8">
          
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Apply By</label>
            <div className="flex gap-3">
              <Button 
                variant={attachType === "classroom" ? "default" : "outline"} 
                onClick={() => { setAttachType("classroom"); setAttachId(""); }}
                className={`h-12 px-6 rounded-xl font-semibold transition-all ${
                  attachType === "classroom" 
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 ring-2 ring-blue-600 ring-offset-2" 
                    : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                Classroom
              </Button>
              <Button 
                variant={attachType === "course" ? "default" : "outline"} 
                onClick={() => { setAttachType("course"); setAttachId(""); }}
                className={`h-12 px-6 rounded-xl font-semibold transition-all ${
                  attachType === "course" 
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 ring-2 ring-blue-600 ring-offset-2" 
                    : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                Course
              </Button>
            </div>
          </div>
          
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Select {attachType}</label>
            <div className="relative">
              <select
                value={attachId}
                onChange={e => setAttachId(e.target.value)}
                className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 px-4 text-base font-medium text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
              >
                <option value="">-- Choose {attachType} --</option>
                {attachType === "classroom" 
                  ? classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                  : courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                }
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
          
          <div className="pt-8 mt-4 border-t border-slate-100">
            <Button 
              onClick={handleAttach} 
              disabled={!attachId || attaching} 
              className="w-full sm:w-auto sm:min-w-[200px] h-12 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all text-base"
            >
              {attaching ? <Spinner className="mr-2" size="sm" /> : <LinkIcon className="mr-2 w-5 h-5" />} Apply Configuration
            </Button>
          </div>
          
        </div>
      </div>
      
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Users, BookOpen, Building, Search, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface EnrollmentUsage {
  enrollment_id: number;
  student_name: string;
  course_name: string | null;
  classroom_name: string | null;
}

export default function AssessmentConfigUsagePage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { toast } = useToast();
  
  const [configName, setConfigName] = useState("");
  const [enrollments, setEnrollments] = useState<EnrollmentUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  const [removeId, setRemoveId] = useState<number | null>(null);
  const [removing, setRemoving] = useState(false);

  const fetchUsage = useCallback(async () => {
    try {
      const [confRes, usageRes] = await Promise.all([
        fetch(`/api/assessment-configs/${id}/`),
        fetch(`/api/assessment-configs/${id}/usage/`)
      ]);
      
      if (confRes.ok) {
        const c = await confRes.json();
        setConfigName(c.name);
      } else {
        toast({ title: "Error", description: "Config not found.", variant: "destructive" });
        router.push("/admin/assessment-configs");
        return;
      }
      
      if (usageRes.ok) {
        const u = await usageRes.json();
        setEnrollments(u.enrollments || []);
      }
    } catch (e) {
      toast({ title: "Error", description: "Network error.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [id, router, toast]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  const handleRemove = async () => {
    if (!removeId) return;
    setRemoving(true);
    try {
      const res = await fetch(`/api/assessment-configs/${id}/remove-enrollment/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollment_id: removeId })
      });
      if (res.ok) {
        toast({ title: "Removed", description: "Configuration removed from enrollment." });
        setRemoveId(null);
        fetchUsage(); // refresh list
      } else {
        const err = await res.json();
        toast({ title: "Error", description: err.detail || "Failed to remove.", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Error", description: "Network error.", variant: "destructive" });
    } finally {
      setRemoving(false);
    }
  };

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return enrollments.filter(e => 
      e.student_name.toLowerCase().includes(s) ||
      (e.course_name && e.course_name.toLowerCase().includes(s)) ||
      (e.classroom_name && e.classroom_name.toLowerCase().includes(s))
    );
  }, [search, enrollments]);

  const uniqueCourses = useMemo(() => new Set(enrollments.map(e => e.course_name).filter(Boolean)).size, [enrollments]);
  const uniqueClassrooms = useMemo(() => new Set(enrollments.map(e => e.classroom_name).filter(Boolean)).size, [enrollments]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="text-indigo-500 w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* ── Header ── */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/admin/assessment-configs")} className="rounded-full">
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </Button>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">
            Usage Statistics
          </h1>
          <p className="text-sm text-slate-500">
            Viewing enrollments attached to <strong className="text-slate-700">{configName}</strong>
          </p>
        </div>
      </div>

      {/* ── Stats Summary ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Total Students</p>
            <p className="text-2xl font-black text-slate-800">{enrollments.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Unique Courses</p>
            <p className="text-2xl font-black text-slate-800">{uniqueCourses}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Unique Classrooms</p>
            <p className="text-2xl font-black text-slate-800">{uniqueClassrooms}</p>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">Enrollment List</h2>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search student, course..."
              className="pl-9 h-10 rounded-xl bg-slate-50 border-slate-200"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-left">
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Student Name</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Course</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Classroom</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-slate-400 text-sm">
                    No enrollments found.
                  </td>
                </tr>
              ) : (
                filtered.map(e => (
                  <tr key={e.enrollment_id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-semibold text-slate-800">{e.student_name}</td>
                    <td className="py-3 px-4 text-sm text-slate-600">{e.course_name || "—"}</td>
                    <td className="py-3 px-4 text-sm text-slate-600">{e.classroom_name || "—"}</td>
                    <td className="py-3 px-4 text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setRemoveId(e.enrollment_id)}
                        className="text-red-500 hover:bg-red-50 hover:text-red-600 h-8 gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Detach
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!removeId} onOpenChange={(open) => !open && setRemoveId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Configuration</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-slate-600 text-sm">
            Are you sure you want to remove this configuration from the selected student? Their score will fall back to default equal weighting.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveId(null)} disabled={removing}>Cancel</Button>
            <Button onClick={handleRemove} disabled={removing} variant="destructive">
              {removing ? <Spinner className="mr-2" size="sm" /> : <Trash2 className="mr-2 w-4 h-4" />} Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
    </div>
  );
}

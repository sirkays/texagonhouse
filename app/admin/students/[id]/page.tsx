"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/app/admin/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, RefreshCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type EnrollmentRow = {
  id: number;
  status: string;
  progress_pct: number;
  completed_at?: string | null;
  created_at?: string;

  course: {
    id: number;
    name: string;
    subject: string;
    classroom: string;
    teacher: string;
    is_active?: boolean;
    course_type?: string;
  };
};

type CourseOption = {
  id: number;
  name: string;
  subject: string;
  classroom: string;
  teacher: string;
  course_type?: string;
};

export default function StudentEnrollmentsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const studentId = params?.id;

  const [studentName, setStudentName] = useState<string>("Student");

  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([]);
  const [availableCourses, setAvailableCourses] = useState<CourseOption[]>([]);

  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const [searchEnrolled, setSearchEnrolled] = useState("");
  const [searchAvailable, setSearchAvailable] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");

  const pageTitle = useMemo(() => `${studentName} — Enrollments`, [studentName]);

  const statusBadge = (s: string) => {
    if (s === "completed") return <Badge>Completed</Badge>;
    if (s === "dropped") return <Badge variant="destructive">Dropped</Badge>;
    return <Badge variant="secondary">Active</Badge>;
  };

  const fetchEnrollments = async (q = "") => {
    if (!studentId) return;
    const params = new URLSearchParams();
    if (q) params.append("q", q);

    const res = await fetch(
      `/api/admin/students/${studentId}/enrollments${params.toString() ? `?${params}` : ""}`
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Failed to load enrollments");

    setEnrollments(data);

    // best-effort student name: if at least one enrollment exists
    // (recommended: add a student detail endpoint for exact name)
    if (data?.length && data[0]?.course) {
      setStudentName((prev) => prev || "Student");
    }
  };

  const fetchAvailable = async (q = "") => {
    if (!studentId) return;
    const params = new URLSearchParams();
    if (q) params.append("q", q);

    const res = await fetch(
      `/api/admin/students/${studentId}/available-courses${params.toString() ? `?${params}` : ""}`
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Failed to load available courses");
    setAvailableCourses(data);
  };

  const refreshAll = async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      await Promise.all([fetchEnrollments(""), fetchAvailable("")]);
      setSelectedCourseId("");
      setSearchEnrolled("");
      setSearchAvailable("");
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  // debounced searches
  useEffect(() => {
    if (!studentId) return;
    const t = setTimeout(() => {
      fetchEnrollments(searchEnrolled).catch((e: any) =>
        toast({ title: "Error", description: e.message, variant: "destructive" })
      );
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchEnrolled]);

  useEffect(() => {
    if (!studentId) return;
    const t = setTimeout(() => {
      fetchAvailable(searchAvailable).catch((e: any) =>
        toast({ title: "Error", description: e.message, variant: "destructive" })
      );
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchAvailable]);

  const handleAssign = async () => {
    if (!studentId) return;
    if (!selectedCourseId) {
      toast({
        title: "Select a course",
        description: "Please pick a course to assign.",
        variant: "destructive",
      });
      return;
    }

    setAssigning(true);
    try {
      const res = await fetch(`/api/admin/students/${studentId}/enrollments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course_id: Number(selectedCourseId) }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to assign course");

      toast({ title: "Success", description: "Enrollment created successfully." });

      await Promise.all([fetchEnrollments(searchEnrolled), fetchAvailable(searchAvailable)]);
      setSelectedCourseId("");
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setAssigning(false);
    }
  };

  return (
  
      <div className="space-y-6 px-2 sm:px-0">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.back()} disabled={loading || assigning}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">{pageTitle}</h1>
              <p className="text-muted-foreground">
                View enrolled courses and assign a new course.
              </p>
            </div>
          </div>

          <Button variant="outline" onClick={refreshAll} disabled={loading || assigning}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Enrolled courses */}
        <Card>
          <CardHeader className="space-y-2">
            <CardTitle>Enrolled Courses ({enrollments.length})</CardTitle>
            <Input
              placeholder="Search enrolled courses…"
              value={searchEnrolled}
              onChange={(e) => setSearchEnrolled(e.target.value)}
              disabled={loading}
            />
          </CardHeader>

          <CardContent className="space-y-3">
            {enrollments.map((e) => (
              <div key={e.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-semibold">{e.course.name}</div>
                  {statusBadge(e.status)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {e.course.subject} • {e.course.classroom} • {e.course.teacher}
                </div>
                <div className="text-xs text-muted-foreground">
                  Progress: {Math.round(e.progress_pct)}%
                </div>
              </div>
            ))}

            {!loading && enrollments.length === 0 && (
              <p className="text-center text-muted-foreground py-10">
                No enrollments found.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Assign new course */}
        <Card>
          <CardHeader className="space-y-2">
            <CardTitle>Assign a New Course</CardTitle>
            <Input
              placeholder="Search available courses…"
              value={searchAvailable}
              onChange={(e) => setSearchAvailable(e.target.value)}
              disabled={loading || assigning}
            />
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {availableCourses.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name} — {c.subject} • {c.classroom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                onClick={handleAssign}
                disabled={loading || assigning || !selectedCourseId}
                className="w-full sm:w-auto"
              >
                {assigning ? "Assigning…" : "Assign"}
              </Button>
            </div>

            {!loading && availableCourses.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No available courses (student may already be enrolled in all active courses).
              </p>
            )}
          </CardContent>
        </Card>
      </div>
  );
}

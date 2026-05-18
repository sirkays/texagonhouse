"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import {
  Users,
  BookOpen,
  GraduationCap,
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  Search,
} from "lucide-react";

/* ─────────────── types ─────────────── */

type ModalStats = { students: number; teachers: number; courses: number };

type ModalStudent = {
  id: number;
  user_id: number;
  name: string;
  email?: string;
  avatar_url?: string | null;
  admission_no?: string;
};

type ModalTeacher = {
  user_id: number;
  name: string;
  email?: string;
  avatar_url?: string | null;
  specialties?: string[];
};

type ModalCourse = { id: number; title: string };

type ClassroomData = {
  id: number;
  name: string;
  code: string;
  description?: string;
  stats: ModalStats;
  students: ModalStudent[];
  teachers: ModalTeacher[];
  courses: ModalCourse[];
};

/* ─────────────── helpers ─────────────── */

function initials(name: string) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const second = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (first + second).toUpperCase() || "U";
}

/* ─────────────── page ─────────────── */

export default function ClassroomDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();

  const [data, setData] = useState<ClassroomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [studentSearch, setStudentSearch] = useState("");
  const [teacherSearch, setTeacherSearch] = useState("");
  const [courseSearch, setCourseSearch] = useState("");

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`/api/admin/classrooms/${id}/modal`);
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Failed to load classroom details.");
      }
      const json = (await res.json()) as ClassroomData;
      setData(json);
    } catch (e: any) {
      const msg = e?.message || "Failed to load classroom details.";
      setErr(msg);
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ── stat cards ── */
  const stats = data?.stats ?? { students: 0, teachers: 0, courses: 0 };

  const statCards = [
    { label: "Students", value: stats.students, icon: Users, color: "bg-primary/10 text-primary" },
    { label: "Teachers", value: stats.teachers, icon: GraduationCap, color: "bg-amber-500/10 text-amber-500" },
    { label: "Courses", value: stats.courses, icon: BookOpen, color: "bg-emerald-500/10 text-emerald-500" },
  ];

  /* ── filtered lists ── */
  const filteredStudents = (data?.students ?? []).filter((s) => {
    const q = studentSearch.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.email ?? "").toLowerCase().includes(q) ||
      (s.admission_no ?? "").toLowerCase().includes(q)
    );
  });

  const filteredTeachers = (data?.teachers ?? []).filter((t) => {
    const q = teacherSearch.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      (t.email ?? "").toLowerCase().includes(q)
    );
  });

  const filteredCourses = (data?.courses ?? []).filter((c) =>
    c.title.toLowerCase().includes(courseSearch.toLowerCase())
  );

  /* ── skeleton header ── */
  if (loading && !data) {
    return (
      <div className="space-y-6">
        {/* back */}
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        {/* heading */}
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-32" />
        </div>

        {/* stat cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>

        {/* tabs */}
        <Skeleton className="h-10 w-full" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  /* ── error state ── */
  if (err && !loading) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertTriangle className="h-10 w-10 text-destructive" />
              <div>
                <p className="font-semibold text-lg">Couldn&apos;t load classroom details</p>
                <p className="text-sm text-muted-foreground mt-1">{err}</p>
              </div>
              <Button onClick={fetchData} variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" /> Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── back button ── */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="gap-2 -ml-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Classrooms
      </Button>

      {/* ── heading ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {data?.name ?? "Classroom"}
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            {data?.code && (
              <Badge variant="secondary" className="font-mono">
                {data.code}
              </Badge>
            )}
            {data?.description && (
              <p className="text-sm text-muted-foreground">{data.description}</p>
            )}
          </div>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/classrooms/${id}/students`}>
              <Users className="mr-2 h-4 w-4" />
              Manage Students
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* ── stat cards ── */}
      <div className="grid gap-4 md:grid-cols-3">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  {loading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p className="text-2xl font-bold">{value}</p>
                  )}
                  <p className="text-sm text-muted-foreground">{label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── tabs ── */}
      <Tabs defaultValue="students" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="students">
            Students {data ? `(${data.students?.length ?? 0})` : ""}
          </TabsTrigger>
          <TabsTrigger value="teachers">
            Teachers {data ? `(${data.teachers?.length ?? 0})` : ""}
          </TabsTrigger>
          <TabsTrigger value="courses">
            Courses {data ? `(${data.courses?.length ?? 0})` : ""}
          </TabsTrigger>
        </TabsList>

        {/* STUDENTS */}
        <TabsContent value="students" className="space-y-3">
          {/* search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, email or admission no…"
              className="pl-9"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredStudents.length > 0 ? (
            filteredStudents.map((student) => (
              <div
                key={student.id}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/40 transition-colors"
              >
                <Avatar>
                  <AvatarImage src={student.avatar_url ?? undefined} />
                  <AvatarFallback>{initials(student.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{student.name}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {student.email || "—"}
                  </p>
                  {student.admission_no && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Admission No:{" "}
                      <span className="font-mono">{student.admission_no}</span>
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                {studentSearch
                  ? `No students match "${studentSearch}".`
                  : "No students found in this classroom."}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* TEACHERS */}
        <TabsContent value="teachers" className="space-y-3">
          {/* search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or email…"
              className="pl-9"
              value={teacherSearch}
              onChange={(e) => setTeacherSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredTeachers.length > 0 ? (
            filteredTeachers.map((teacher) => (
              <div
                key={teacher.user_id}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/40 transition-colors"
              >
                <Avatar>
                  <AvatarImage src={teacher.avatar_url ?? undefined} />
                  <AvatarFallback>{initials(teacher.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{teacher.name}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {teacher.email || "—"}
                  </p>
                  {(teacher.specialties?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {teacher.specialties!.slice(0, 6).map((s) => (
                        <Badge key={s} variant="secondary" className="text-xs">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                {teacherSearch
                  ? `No teachers match "${teacherSearch}".`
                  : "No teachers assigned to this classroom."}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* COURSES */}
        <TabsContent value="courses" className="space-y-3">
          {/* search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search courses…"
              className="pl-9"
              value={courseSearch}
              onChange={(e) => setCourseSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <div
                key={course.id}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/40 transition-colors"
              >
                <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{course.title}</p>
                </div>
              </div>
            ))
          ) : (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                {courseSearch
                  ? `No courses match "${courseSearch}".`
                  : "No courses found for this classroom."}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Users, BookOpen, GraduationCap, AlertTriangle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

type ModalStats = {
  students: number;
  teachers: number;
  courses: number;
};

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

type ModalCourse = {
  id: number;
  title: string;
};

type ClassroomModalData = {
  id: number;
  name: string;
  code: string;
  description?: string;
  stats: ModalStats;
  students: ModalStudent[];
  teachers: ModalTeacher[];
  courses: ModalCourse[];
};

interface ClassroomDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classroom: any; // you pass {id,name,code,students,teachers,courses} from list
}

function initials(name: string) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const second = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (first + second).toUpperCase() || "U";
}

export function ClassroomDetailsModal({
  open,
  onOpenChange,
  classroom,
}: ClassroomDetailsModalProps) {
  const { toast } = useToast();

  const classroomId = classroom?.id as number | undefined;

  const [data, setData] = useState<ClassroomModalData | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const title = useMemo(() => {
    return data?.name || classroom?.name || "Classroom";
  }, [data?.name, classroom?.name]);

  const code = useMemo(() => {
    return data?.code || classroom?.code || "";
  }, [data?.code, classroom?.code]);

  // Fetch when opened + has id
  useEffect(() => {
    if (!open) return;
    if (!classroomId) return;

    let mounted = true;

    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch(`/api/admin/classrooms/${classroomId}/modal`, {
          method: "GET",
        });

        if (!res.ok) {
          const t = await res.text();
          throw new Error(t || "Failed to load classroom details.");
        }

        const json = (await res.json()) as ClassroomModalData;

        if (mounted) setData(json);
      } catch (e: any) {
        const msg = e?.message || "Failed to load classroom details.";
        if (mounted) setErr(msg);
        toast({
          title: "Error",
          description: msg,
          variant: "destructive",
        });
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [open, classroomId, toast]);

  // Reset on close (optional but clean)
  useEffect(() => {
    if (!open) {
      setData(null);
      setErr(null);
      setLoading(false);
    }
  }, [open]);

  if (!classroom) return null;

  const stats = data?.stats || {
    students: classroom?.students ?? 0,
    teachers: classroom?.teachers ?? 0,
    courses: classroom?.courses ?? 0,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-none sm:max-w-3xl sm:max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{title}</DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            {code ? (
              <Badge variant="secondary" className="font-mono">
                {code}
              </Badge>
            ) : null}
          </DialogDescription>
        </DialogHeader>

        {/* Error state */}
        {err && !loading ? (
          <div className="mt-4 rounded-lg border p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">Couldn’t load classroom details</p>
                <p className="text-sm text-muted-foreground mt-1">{err}</p>
                <Button
                  className="mt-3"
                  variant="outline"
                  onClick={() => {
                    // quick re-open fetch by toggling open true (or just refetch)
                    // simplest: call onOpenChange(true) won't change; just refetch by triggering effect:
                    // we can do a tiny hack by resetting then setting open, but not allowed.
                    // So we just do a local refetch:
                    if (!classroomId) return;
                    setLoading(true);
                    setErr(null);
                    fetch(`/api/admin/classrooms/${classroomId}/modal`, {
                      method: "GET",
                    })
                      .then(async (res) => {
                        if (!res.ok) throw new Error(await res.text());
                        return res.json();
                      })
                      .then((json) => setData(json))
                      .catch((e) => setErr(e?.message || "Retry failed."))
                      .finally(() => setLoading(false));
                  }}
                >
                  Retry
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
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

          {/* OVERVIEW */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      {loading ? (
                        <Skeleton className="h-8 w-16" />
                      ) : (
                        <p className="text-2xl font-bold">{stats.students}</p>
                      )}
                      <p className="text-sm text-muted-foreground">Students</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <GraduationCap className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      {loading ? (
                        <Skeleton className="h-8 w-16" />
                      ) : (
                        <p className="text-2xl font-bold">{stats.teachers}</p>
                      )}
                      <p className="text-sm text-muted-foreground">Teachers</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      {loading ? (
                        <Skeleton className="h-8 w-16" />
                      ) : (
                        <p className="text-2xl font-bold">{stats.courses}</p>
                      )}
                      <p className="text-sm text-muted-foreground">Courses</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {data?.description ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="mt-1">{data.description}</p>
                </CardContent>
              </Card>
            ) : null}
          </TabsContent>

          {/* STUDENTS (NO GRADE) */}
          <TabsContent value="students" className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (data?.students?.length ?? 0) > 0 ? (
              data!.students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={student.avatar_url ?? undefined} />
                      <AvatarFallback>{initials(student.name)}</AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <p className="font-medium truncate">{student.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {student.email || "—"}
                      </p>
                      {student.admission_no ? (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Admission No:{" "}
                          <span className="font-mono">{student.admission_no}</span>
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                  No students found in this classroom.
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* TEACHERS */}
          <TabsContent value="teachers" className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (data?.teachers?.length ?? 0) > 0 ? (
              data!.teachers.map((teacher) => (
                <div
                  key={teacher.user_id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={teacher.avatar_url ?? undefined} />
                      <AvatarFallback>{initials(teacher.name)}</AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <p className="font-medium truncate">{teacher.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {teacher.email || "—"}
                      </p>
                      {(teacher.specialties?.length ?? 0) > 0 ? (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {teacher.specialties!.slice(0, 6).map((s) => (
                            <Badge key={s} variant="secondary" className="text-xs">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                  No teachers assigned to this classroom.
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* COURSES */}
          <TabsContent value="courses" className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (data?.courses?.length ?? 0) > 0 ? (
              data!.courses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{course.title}</p>
                  </div>
                </div>
              ))
            ) : (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                  No courses found for this classroom.
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

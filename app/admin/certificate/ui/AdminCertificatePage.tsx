"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge"; // Assuming you have this, otherwise standard div classes work
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, Clock, Eye, ShieldCheck, UserCheck } from "lucide-react";

type CourseRow = {
  id: number | string;
  name: string;
  subject?: string;
  classroom?: string;
  description?: string;
  is_active?: boolean;
  isActive?: boolean;
};

type CompletedStudentsResponse = {
  course?: { id: number; name: string };
  season?: null | {
    name: string;
    start_at: string;
    end_at: string;
  };
  results: Array<{
    enrollment_id: number;
    student_id: number;
    student_name: string;
    student_email: string;
    progress_pct: string;
    enrollment_status: string;
    certificate: null | {
      id: number;
      number: string;
      status: string;
      teacher_approved: boolean;
      admin_approved: boolean;
      fully_approved: boolean;
      downloadable_at: string | null;
      title: String;
    };
  }>;
};

function normalizeCourses(payload: any): CourseRow[] {
  if (!payload) return [];
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.results)
    ? payload.results
    : Array.isArray(payload?.courses)
    ? payload.courses
    : [];

  return list.map((c: any) => ({
    id: c.id,
    name: c.name ?? c.course_name ?? "",
    subject: c.subject?.name ?? c.subject ?? "",
    classroom: c.classroom?.name ?? c.classroom ?? "",
    description: c.description ?? "",
    is_active: c.is_active ?? c.isActive ?? true,
  }));
}

export default function AdminCertificatePage() {
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [rows, setRows] = useState<CompletedStudentsResponse | null>(null);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingRows, setLoadingRows] = useState(false);
  const [busyCertId, setBusyCertId] = useState<number | null>(null);
  const [error, setError] = useState<string>("");

  async function loadCourses() {
    setLoadingCourses(true);
    setError("");
    try {
      const res = await fetch("/api/admin/courses", {
        method: "GET",
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(
          data?.error ?? data?.detail ?? "Failed to load courses"
        );
      const normalized = normalizeCourses(data).filter((c) => c.name);
      setCourses(normalized);
      if (normalized.length > 0 && !selectedCourseId) {
        setSelectedCourseId(String(normalized[0].id));
      }
    } catch (e: any) {
      setError(e?.message ?? "Error");
    } finally {
      setLoadingCourses(false);
    }
  }

  async function loadCompletedStudents(courseId: string) {
    setLoadingRows(true);
    setError("");
    try {
      const res = await fetch(
        `/api/courses/${courseId}/completed-students/`,
        {
          method: "GET",
          cache: "no-store",
        }
      );
      const text = await res.text();
      const json = text ? JSON.parse(text) : null;
      if (!res.ok)
        throw new Error(json?.detail ?? "Failed to load enrolled students");
      setRows(json);
    } catch (e: any) {
      setError(e?.message ?? "Error");
      setRows(null);
    } finally {
      setLoadingRows(false);
    }
  }

  async function approveAdmin(certId: number) {
    setBusyCertId(certId);
    setError("");
    try {
      const res = await fetch(
        `/api/admin/certificates/${certId}/approve/admin`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ approval: true }),
        }
      );
      const text = await res.text();
      const json = text ? JSON.parse(text) : null;
      if (!res.ok)
        throw new Error(
          json?.detail ?? json?.error ?? "Admin approval failed"
        );
      if (selectedCourseId) await loadCompletedStudents(selectedCourseId);
    } catch (e: any) {
      setError(e?.message ?? "Error");
    } finally {
      setBusyCertId(null);
    }
  }

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) loadCompletedStudents(selectedCourseId);
  }, [selectedCourseId]);

  return (
    <div className="space-y-6 px-2 sm:px-0 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Certificate Approvals
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage student certifications (Admin)
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            onClick={loadCourses}
            disabled={loadingCourses}
            className="w-full sm:w-auto"
          >
            Refresh Courses
          </Button>
          <Button
            onClick={() =>
              selectedCourseId && loadCompletedStudents(selectedCourseId)
            }
            disabled={!selectedCourseId || loadingRows}
            className="w-full sm:w-auto"
          >
            Refresh List
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Course Selection */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Select Course
            </label>
            {loadingCourses ? (
              <div className="text-sm text-muted-foreground">
                Loading courses...
              </div>
            ) : courses.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No courses found.
              </div>
            ) : (
              <Select
                value={selectedCourseId}
                onValueChange={setSelectedCourseId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a course..." />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={String(c.id)} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Area */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground px-1">
          Enrolled Students
        </h2>

        {loadingRows ? (
          <div className="p-8 text-center text-muted-foreground">
            Loading students...
          </div>
        ) : !rows || !rows.results || rows.results.length === 0 ? (
          <div className="p-8 text-center border rounded-lg bg-muted/10 text-muted-foreground">
            No enrolled students yet.
          </div>
        ) : (
          <>
            {/* --- DESKTOP VIEW (Table) --- */}
            <div className="hidden md:block border rounded-lg overflow-hidden bg-card">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Student</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Progress</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Certificate</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Teacher</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Admin</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {rows.results.map((r) => (
                      <tr key={r.enrollment_id} className="hover:bg-muted/30">
                        <td className="py-3 px-4">
                          <div className="font-medium text-foreground">{r.student_name}</div>
                          <div className="text-xs text-muted-foreground">{r.student_email}</div>
                        </td>
                        <td className="py-3 px-4">{r.progress_pct}%</td>
                        <td className="py-3 px-4">
                          {r.certificate ? (
                            <div>
                              <div className="font-mono text-xs">{r.certificate.number}</div>
                              <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                                {r.certificate.title}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs italic">None</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {r.certificate?.teacher_approved ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {r.certificate?.admin_approved ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">Pending</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            {r.certificate && !r.certificate.admin_approved && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => approveAdmin(r.certificate!.id)}
                                disabled={busyCertId === r.certificate.id}
                              >
                                Approve
                              </Button>
                            )}
                            <Link href={`/admin/student-progress/${selectedCourseId}/${r.student_id}`}>
                              <Button size="sm" variant="ghost">View</Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* --- MOBILE VIEW (Cards) --- */}
            {/* This view is optimized for screens as small as 200px */}
            <div className="md:hidden space-y-4">
              {rows.results.map((r) => {
                const cert = r.certificate;
                return (
                  <Card key={r.enrollment_id} className="overflow-hidden">
                    <CardHeader className="p-4 pb-2 bg-muted/10 border-b">
                      <div className="flex flex-col gap-1">
                        <CardTitle className="text-base truncate">
                          {r.student_name}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground break-all">
                          {r.student_email}
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      {/* Progress Bar/Stat */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <Badge variant="secondary">{r.progress_pct}%</Badge>
                      </div>

                      {/* Certificate Info */}
                      <div className="space-y-2 pt-2 border-t border-border">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Certificate Status
                        </div>
                        
                        {!cert ? (
                          <div className="text-sm text-muted-foreground italic">
                            No certificate issued yet.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="bg-muted/30 p-2 rounded text-xs font-mono break-all border">
                              {cert.number}
                            </div>
                            
                            <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
                              <div className="flex items-center gap-2 text-sm">
                                <UserCheck className={`h-4 w-4 ${cert.teacher_approved ? "text-green-600" : "text-muted-foreground"}`} />
                                <span className={cert.teacher_approved ? "text-green-700" : "text-muted-foreground"}>
                                  {cert.teacher_approved ? "Teacher OK" : "Teacher Pending"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <ShieldCheck className={`h-4 w-4 ${cert.admin_approved ? "text-green-600" : "text-orange-500"}`} />
                                <span className={cert.admin_approved ? "text-green-700" : "text-orange-600"}>
                                  {cert.admin_approved ? "Admin OK" : "Admin Pending"}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 pt-2">
                        {cert && !cert.admin_approved && (
                          <Button
                            className="w-full bg-[#EF7B55] hover:bg-[#d96a47]"
                            size="sm"
                            onClick={() => approveAdmin(cert.id)}
                            disabled={busyCertId === cert.id}
                          >
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            Approve Certificate
                          </Button>
                        )}
                        
                        <Link 
                          href={`/admin/student-progress/${selectedCourseId}/${r.student_id}`}
                          className="w-full"
                        >
                          <Button variant="outline" size="sm" className="w-full">
                            <Eye className="mr-2 h-4 w-4" />
                            View Progress
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
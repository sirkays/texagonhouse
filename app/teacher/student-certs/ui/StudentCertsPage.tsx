
//texagon_academy/texagonui/app/teacher/student-certs/ui/StudentCertsPage.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type CourseRow = {
  id: number;
  name: string;
  subject?: string;
  classroom?: string;
};

type CompletedStudentsResponse = {
  course?: { id: number; name: string };
  season?: null | {
    name: string;
    start_at: string; // backend returns datetimes; treat as ISO strings
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


export default function StudentCertsPage() {
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

  const [rows, setRows] = useState<CompletedStudentsResponse | null>(null);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingRows, setLoadingRows] = useState(false);

  const [busyCertId, setBusyCertId] = useState<number | null>(null);
  const [error, setError] = useState<string>("");

  async function loadCourses() {
    setLoadingCourses(true);
    setError("");
    try {
      const res = await fetch("/api/teacher/courses", { method: "GET", cache: "no-store" });
      const text = await res.text();
      const json = text ? JSON.parse(text) : null;
      if (!res.ok) throw new Error(json?.detail ?? "Failed to load courses");

      // Expecting: { results: [...] }
      const list: CourseRow[] = json?.results ?? json ?? [];
      setCourses(list);

      // auto-select first course
      if (list.length > 0 && !selectedCourseId) {
        setSelectedCourseId(list[0].id);
      }
    } catch (e: any) {
      setError(e?.message ?? "Error");
    } finally {
      setLoadingCourses(false);
    }
  }

  async function loadCompletedStudents(courseId: number) {
    setLoadingRows(true);
    setError("");
    try {
      const res = await fetch(`/api/courses/${courseId}/completed-students/`, {
        method: "GET",
        cache: "no-store",
      });
      const text = await res.text();
      const json = text ? JSON.parse(text) : null;
      if (!res.ok) throw new Error(json?.detail ?? "Failed to load enrolled students");
      setRows(json);
    } catch (e: any) {
      setError(e?.message ?? "Error");
      setRows(null);
    } finally {
      setLoadingRows(false);
    }
  }


  function fmtDate(d?: string | null) {
    if (!d) return "—";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return d; // fallback if not ISO
    return dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }

  async function approveTeacher(certId: number) {
    console.log(certId, " emkvkldmvlfkmvlkfvm")
    setBusyCertId(certId);
    setError("");
    try {
      const res = await fetch(`/api/teacher/certificates/${certId}/approve/teacher/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approval: true }),
      });
      const text = await res.text();
      const json = text ? JSON.parse(text) : null;
      if (!res.ok) throw new Error(json?.detail ?? "Teacher approval failed");

      if (selectedCourseId) await loadCompletedStudents(selectedCourseId);
    } catch (e: any) {
      setError(e?.message ?? "Error");
    } finally {
      setBusyCertId(null);
    }
  }


  useEffect(() => {
    loadCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedCourseId) loadCompletedStudents(selectedCourseId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourseId]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-slate-800">
            Student Certificates
          </h1>
          <p className="text-sm text-slate-600">
            Select a course to view enrolled students and approve certificates.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={loadCourses} disabled={loadingCourses}>
            Refresh courses
          </Button>
          <Button
            onClick={() => selectedCourseId && loadCompletedStudents(selectedCourseId)}
            disabled={!selectedCourseId || loadingRows}
          >
            Refresh list
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-700 text-sm">
          {error}
        </div>
      ) : null}

      <div className="rounded-md border bg-white p-3">
        <div className="text-sm font-medium text-slate-700 mb-2">Course</div>

        {loadingCourses ? (
          <div className="text-sm text-slate-600">Loading courses…</div>
        ) : courses.length === 0 ? (
          <div className="text-sm text-slate-600">No courses found.</div>
        ) : (
          <select
            className="w-full sm:w-[420px] border rounded-md px-3 py-2 text-sm"
            value={selectedCourseId ?? ""}
            onChange={(e) => setSelectedCourseId(Number(e.target.value))}
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.subject ? ` • ${c.subject}` : ""}
                {c.classroom ? ` • ${c.classroom}` : ""}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="rounded-md border bg-white p-3">
        <div className="text-sm font-medium text-slate-700 mb-2">
          Enrolled Students
        </div>
        {rows?.season ? (
          <div className="text-xs text-slate-600">
            <span className="font-semibold text-slate-700">Season:</span>{" "}
            {rows.season.name} • {fmtDate(rows.season.start_at)} – {fmtDate(rows.season.end_at)}
          </div>
        ) : (
          <div className="text-xs text-slate-500">Season: —</div>
        )}
        {loadingRows ? (
          <div className="text-sm text-slate-600">Loading enrolled students…</div>
        ) : !rows || !rows.results || rows.results.length === 0 ? (
          <div className="text-sm text-slate-600">No enrolled students yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left text-xs font-semibold text-slate-600 py-2 pr-3">
                    Student
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-600 py-2 pr-3">
                    Email
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-600 py-2 pr-3">
                    Progress
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-600 py-2 pr-3">
                    Certificate
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-600 py-2 pr-3">
                    Teacher
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-600 py-2 pr-3">
                    Admin
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-600 py-2 pr-3">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {rows.results.map((r) => {
                  const cert = r.certificate;
                  return (
                    <tr key={r.enrollment_id} className="border-b last:border-b-0">
                      <td className="py-3 pr-3 text-sm text-slate-800">
                        {r.student_name}
                      </td>
                      <td className="py-3 pr-3 text-sm text-slate-600">
                        {r.student_email}
                      </td>
                      <td className="py-3 pr-3 text-sm text-slate-700">
                        {r.progress_pct}%
                      </td>

                      <td className="py-3 pr-3 text-sm">
                        {cert ? (
                          <div>
                            <div className="font-semibold text-slate-800">{cert.number}</div>
                            <div className="text-xs text-slate-500">
                              {cert.title}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500">No certificate</span>
                        )}
                      </td>

                      <td className="py-3 pr-3 text-sm">
                        {cert ? (cert.teacher_approved ? "✅ Approved" : "⏳ Pending") : "—"}
                      </td>

                      <td className="py-3 pr-3 text-sm">
                        {cert ? (cert.admin_approved ? "✅ Approved" : "⏳ Pending") : "—"}
                      </td>

                      <td className="py-3 pr-3 text-sm">
                        {!cert ? (
                          <div className="flex flex-wrap gap-2">
                            <Link
                              className="inline-flex"
                              href={`/teacher/student-progress/${selectedCourseId}/${r.student_id}`}
                            >
                              <Button size="sm" variant="outline">View Progress</Button>
                            </Link>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={busyCertId === cert.id || cert.teacher_approved}
                              onClick={() => approveTeacher(cert.id)}
                            >
                              {cert.teacher_approved ? "Teacher Approved" : "Approve (Teacher)"}
                            </Button>


                            <Link
                              className="inline-flex"
                              href={`/teacher/student-progress/${selectedCourseId}/${r.student_id}`}
                            >
                              <Button size="sm" variant="outline">View Progress</Button>
                            </Link>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

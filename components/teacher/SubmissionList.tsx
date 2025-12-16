// components/SubmissionList.tsx
"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Spinner } from "../ui/spinner";
interface Submission {
  id: number;
  status: "graded" | "submitted" | "revised";
  student_name: string;
  lesson_title: string;
  course_name: string;
  class_name: string | null;
}
interface FilterOption {
  id: number;
  name: string;
}
const SubmissionList: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [courses, setCourses] = useState<FilterOption[]>([]);
  const [classes, setClasses] = useState<FilterOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<{
    course_id?: number;
    classroom_id?: number;
    startDate?: string;
    endDate?: string;
  }>({});
  const pageSize = 5;
  // Fetch detail to get ID for a given submission ID
  const fetchDetailForId = async (
    id: number
  ): Promise<{
    course?: { id: number; name: string };
    classroom?: { id: number; name: string };
  } | null> => {
    try {
      const res = await fetch(`/api/teacher/code/submissions/${id}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  };
  // Extract filter options by fetching details for unique names
  const extractFilters = async (results: Submission[]) => {
    const uniqueCourses = [
      ...new Set(results.map((s) => s.course_name).filter(Boolean)),
    ];
    const uniqueClasses = [
      ...new Set(results.map((s) => s.class_name).filter(Boolean)),
    ];
    const coursePromises = uniqueCourses.map(async (name) => {
      const sampleSub = results.find((s) => s.course_name === name);
      if (!sampleSub) return null;
      const detail = await fetchDetailForId(sampleSub.id);
      if (detail?.course) {
        return { id: detail.course.id, name };
      }
      return null;
    });
    const classPromises = uniqueClasses.map(async (name) => {
      const sampleSub = results.find((s) => s.class_name === name);
      if (!sampleSub) return null;
      const detail = await fetchDetailForId(sampleSub.id);
      if (detail?.classroom) {
        return { id: detail.classroom.id, name };
      }
      return null;
    });
    const courseResults = (await Promise.all(coursePromises)).filter(Boolean);
    const classResults = (await Promise.all(classPromises)).filter(Boolean);
    setCourses(courseResults.sort((a, b) => a.name.localeCompare(b.name)));
    setClasses(classResults.sort((a, b) => a.name.localeCompare(b.name)));
  };
  // Fetch initial data + extract filter options
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/teacher/code/submissions?page_size=100`);
        if (!res.ok) {
          const errText = await res.text();
          console.error("API Fetch Error:", res.status, errText);
          throw new Error(`Failed to fetch: ${res.status}`);
        }
        const data = await res.json();
        const results: Submission[] = data.results || [];
        await extractFilters(results);
        // Set first page
        setSubmissions(results.slice(0, pageSize));
      } catch (err: any) {
        console.error("Load Error:", err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);
  // Refetch when filters or page change
  useEffect(() => {
    if (courses.length === 0 && classes.length === 0) return;
    const fetchPage = async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.course_id)
        params.append("course_id", filters.course_id.toString());
      if (filters.classroom_id)
        params.append("classroom_id", filters.classroom_id.toString());
      if (filters.startDate)
        params.append("created_at__gte", filters.startDate);
      if (filters.endDate) params.append("created_at__lte", filters.endDate);
      params.append("page", currentPage.toString());
      params.append("page_size", pageSize.toString());
      try {
        const res = await fetch(`/api/teacher/code/submissions?${params}`);
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setSubmissions(data.results || []);
      } catch (err) {
        console.error(err);
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, [currentPage, filters, courses.length, classes.length]);
  const hasNext = submissions.length === pageSize;
  const getStatusColor = (status: string) => {
    switch (status) {
      case "graded":
        return "bg-green-100 text-green-800";
      case "submitted":
        return "bg-yellow-100 text-yellow-800";
      case "revised":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  const handleDateChange = (key: "startDate" | "endDate", value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }));
    setCurrentPage(1);
  };
  if (loading && submissions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-transparent">
        <Spinner size="md" className="text-orange-500" />
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select
          value={filters.classroom_id?.toString() ?? ""}
          onValueChange={(v) => {
            setFilters((prev) => ({
              ...prev,
              classroom_id: v ? Number(v) : undefined,
            }));
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Classes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Classes">All Classes</SelectItem>
            {classes.map((c) => (
              <SelectItem key={c.id} value={c.id.toString()}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.course_id?.toString() ?? ""}
          onValueChange={(v) => {
            setFilters((prev) => ({
              ...prev,
              course_id: v ? Number(v) : undefined,
            }));
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Courses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Courses">All Courses</SelectItem>
            {courses.map((c) => (
              <SelectItem key={c.id} value={c.id.toString()}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-3 items-center justify-center self-start">
          <p className="">Start Date</p>
          <input
            type="date"
            value={filters.startDate || ""}
            onChange={(e) => handleDateChange("startDate", e.target.value)}
            className="w-full sm:w-48 px-3 py-2 border border-[#EF7B55]/30 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#EF7B55]/50"
            placeholder="Start Date"
          />
        </div>

        <div className="flex gap-3 items-center justify-center self-start">
          <p className="">End Date</p>
          <input
            type="date"
            value={filters.endDate || ""}
            onChange={(e) => handleDateChange("endDate", e.target.value)}
            className="w-full sm:w-48 px-3 py-2 border border-[#EF7B55]/30 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#EF7B55]/50"
            placeholder="End Date"
          />
        </div>
      </div>
      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[#EF7B55]/20 shadow-sm">
        <table className="w-full min-w-[640px] table-auto">
          <thead className="bg-[#EF7B55]/5">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">
                Student
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">
                Lesson
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">
                Class
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">
                Course
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EF7B55]/10">
            {submissions.map((s) => (
              <tr key={s.id} className="hover:bg-[#EF7B55]/5 transition-colors">
                <td className="px-4 py-3 text-sm text-slate-800">
                  {s.student_name}
                </td>
                <td className="px-4 py-3 text-sm text-slate-800">
                  {s.lesson_title}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {s.class_name ?? "-"}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {s.course_name}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      s.status
                    )}`}
                  >
                    {s.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-[#EF7B55] hover:bg-[#EF7B55]/10"
                      asChild
                    >
                      <a href={`/teacher/submissions/${s.id}/code`}>View</a>
                    </Button>
                    {s.status !== "graded" && (
                      <Button
                        size="sm"
                        className="bg-[#EF7B55] hover:bg-[#EF7B55]/90 text-white"
                        asChild
                      >
                        <a href={`/teacher/submissions/${s.id}/grade`}>Grade</a>
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {submissions.length === 0 && !loading && (
          <div className="text-center py-8 text-muted-foreground">
            No submissions found.
          </div>
        )}
      </div>
      {/* Pagination */}
      {submissions.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Page {currentPage}</p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={currentPage === 1}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={!hasNext}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
export default SubmissionList;

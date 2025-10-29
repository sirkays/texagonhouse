// components/SubmissionList.tsx
"use client";

import React, { useState, useContext, useMemo } from "react";
import { SubmissionContext } from "@/app/teacher/submissions/layout";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Submission {
  id: string | number;
  status: "graded" | "submitted" | "revised" | string;
  student: {
    user: {
      username: string;
    };
  };
  lesson: {
    title?: string | null;
    class_name?: string | null;
    course_title?: string | null;
  };
}

interface Filters {
  class?: string;
  course?: string;
}

const SubmissionList: React.FC = () => {
  const { submissions } = useContext(SubmissionContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Filters>({});
  const pageSize = 5;

  const { classes, courses, filtered } = useMemo(() => {
    // Extract class and course from lesson or fallback to empty
    const classes = [...new Set(submissions.map(s => s.lesson.class_name ?? "").filter(Boolean))].sort();
    const courses = [...new Set(submissions.map(s => s.lesson.title ?? "").filter(Boolean))].sort();

    const filtered = submissions.filter(s => {
      if (filters.class && (s.lesson.class_name ?? "") !== filters.class) return false;
      if (filters.course && (s.lesson.title ?? "") !== filters.course) return false;
      return true;
    });

    return { classes, courses, filtered };
  }, [submissions, filters]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginated = filtered.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const resetPage = () => setCurrentPage(1);

  const getStatusColor = (status: Submission["status"]) => {
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

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select
          value={filters.class ?? ""}
          onValueChange={(v) => {
            setFilters(prev => ({ ...prev, class: v || undefined }));
            resetPage();
          }}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Classes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Classes">All Classes</SelectItem>
            {classes.length > 0 ? (
              classes.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))
            ) : (
              <SelectItem value="none" disabled>No classes available</SelectItem>
            )}
          </SelectContent>
        </Select>

        <Select
          value={filters.course ?? ""}
          onValueChange={(v) => {
            setFilters(prev => ({ ...prev, course: v || undefined }));
            resetPage();
          }}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Courses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Courses">All Courses</SelectItem>
            {courses.length > 0 ? (
              courses.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))
            ) : (
              <SelectItem value="none" disabled>No courses available</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[#EF7B55]/20 shadow-sm">
        <table className="w-full min-w-[640px] table-auto">
          <thead className="bg-[#EF7B55]/5">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Student</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Lesson</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Class</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Course</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EF7B55]/10">
            {paginated.map((submission) => (
              <tr key={submission.id} className="hover:bg-[#EF7B55]/5 transition-colors">
                <td className="px-4 py-3 text-sm text-slate-800">
                  {submission.student.user.username}
                </td>
                <td className="px-4 py-3 text-sm text-slate-800">
                  {submission.lesson.title}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {submission.lesson.class_name ?? "-"}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {submission.lesson.title ?? "-"}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                    {submission.status}
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
                      <a href={`/teacher/submissions/${submission.id}/code`}>View</a>
                    </Button>
                    {submission.status !== "graded" && (
                      <Button
                        size="sm"
                        className="bg-[#EF7B55] hover:bg-[#EF7B55]/90 text-white"
                        asChild
                      >
                        <a href={`/teacher/submissions/${submission.id}/grade`}>Grade</a>
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {paginated.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No submissions match your filters.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1}–{Math.min(startIndex + pageSize, filtered.length)} of {filtered.length}
          </p>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="icon"
                className="h-8 w-8"
                onClick={() => handlePageChange(page)}
              >
                {page}
              </Button>
            ))}

            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
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
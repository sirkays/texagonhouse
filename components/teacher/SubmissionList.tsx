"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
} from "lucide-react";
import { Spinner } from "../ui/spinner";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../ui/command";
import { cn } from "@/lib/utils";

interface Submission {
  id: number;
  title?: string | null;
  created_at?: string;
  status: "graded" | "submitted" | "revised";
  student_name: string;
  lesson_title: string;
  course_name: string;
  class_name: string | null;
  language: string;
}

interface FilterOption {
  id: number;
  name: string;
}

const SubmissionList: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [courses, setCourses] = useState<FilterOption[]>([]);
  const [classes, setClasses] = useState<FilterOption[]>([]);
  const [loading, setLoading] = useState(true); // initial / global loading
  const [currentPage, setCurrentPage] = useState(1);

  // applied filters used for fetching
  const [filters, setFilters] = useState<{
    course_id?: number;
    classroom_id?: number;
    startDate?: string;
    endDate?: string;
    search?: string;
  }>({});

  // local draft filters changed by the user; applied only when user clicks Apply
  const [draftFilters, setDraftFilters] = useState<typeof filters>({});

  // which action is currently showing a button-level spinner: 'search' | 'apply' | null
  const [actionInProgress, setActionInProgress] = useState<"search" | "apply" | null>(null);

  // helper ref to remember last action that triggered a fetch (keeps effect simple)
  const lastActionRef = useRef<"search" | "apply" | null>(null);

  const pageSize = 5;

  // Fetch detail to get ID for a given submission ID
  const fetchDetailForId = async (
    id: number,
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

    const courseResults = (await Promise.all(coursePromises)).filter(
      (c): c is { id: number; name: string } => c !== null,
    );
    const classResults = (await Promise.all(classPromises)).filter(
      (c): c is { id: number; name: string } => c !== null,
    );

    setCourses(courseResults.sort((a, b) => a.name.localeCompare(b.name)));
    setClasses(classResults.sort((a, b) => a.name.localeCompare(b.name)));
  };

  // helper: format created_at
  const formatDate = (iso?: string) => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  // Initial load to get results for building filter lists
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
        // Set first page (applied filters still empty)
        setSubmissions(results.slice(0, pageSize));
      } catch (err: any) {
        console.error("Load Error:", err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch when applied filters or page change
  useEffect(() => {
    // don't fetch until filter options have been loaded (so labels are available)
    if (courses.length === 0 && classes.length === 0) return;

    const fetchPage = async () => {
      setLoading(true); // keep global loading for the content area
      // mark which button should show spinner
      setActionInProgress(lastActionRef.current);

      const params = new URLSearchParams();

      if (filters.course_id) params.append("course_id", filters.course_id.toString());
      if (filters.classroom_id) params.append("classroom_id", filters.classroom_id.toString());

      if (filters.startDate) params.append("created_at__gte", filters.startDate);
      if (filters.endDate) params.append("created_at__lte", filters.endDate);
      if (filters.search) params.append("search", filters.search);

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
        // clear action spinner
        lastActionRef.current = null;
        setActionInProgress(null);
      }
    };

    fetchPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleDraftDateChange = (key: "startDate" | "endDate", value: string) => {
    setDraftFilters((prev) => ({ ...prev, [key]: value || undefined }));
  };

  // Apply draftFilters to actual filters (trigger fetch)
  const applyFilters = () => {
    // mark action so effect knows which button to show spinner for
    lastActionRef.current = "apply";
    setActionInProgress("apply");
    // use a new object reference so React state changes even if values are same
    setFilters({ ...draftFilters });
    setCurrentPage(1);
  };

  // Reset both draft and applied filters
  const resetFilters = () => {
    lastActionRef.current = "apply";
    setActionInProgress("apply");
    setDraftFilters({});
    setFilters({});
    setCurrentPage(1);
  };

  // Enter key on search triggers apply (search action)
  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      // treat Enter as a quick search
      lastActionRef.current = "search";
      setActionInProgress("search");
      // create new filters object so effect triggers even if search text unchanged
      setFilters((prev) => ({ ...prev, search: draftFilters.search }));
      setCurrentPage(1);
    }
  };

  // Clicking the small search button performs a quick apply (search action)
  const handleSearchClick = () => {
    lastActionRef.current = "search";
    setActionInProgress("search");
    // always create a new object to ensure the effect runs even when value unchanged
    setFilters((prev) => ({ ...prev, search: draftFilters.search }));
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
    <div className="space-y-4 sm:space-y-3">
      {/* Filters */}
      <div className="flex flex-col gap-1 w-full">
        <p className="text-xs text-muted-foreground">Search</p>

        {/* Search input + Button (inline) */}
        <div className="flex gap-2 w-full">
          <input
            type="text"
            value={draftFilters.search || ""}
            onChange={(e) => setDraftFilters((p) => ({ ...p, search: e.target.value || undefined }))}
            onKeyDown={onSearchKeyDown}
            placeholder="Search by student, title..."
            className="
              flex-1
              px-3 py-2.5
              text-sm
              border border-[#EF7B55]/30
              rounded-md
              focus:outline-none focus:ring-1 focus:ring-[#EF7B55]/50
            "
          />

          <Button
            size="sm"
            onClick={handleSearchClick}
            className="flex items-center gap-2 px-3"
            aria-label="Search"
            disabled={actionInProgress === "apply" || actionInProgress === "search" && actionInProgress !== "search"}>
            {actionInProgress === "search" ? (
              <Spinner size="sm" />
            ) : (
              <>
                <span className="hidden sm:inline">Search</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="w-full sm:w-48 justify-between">
              {draftFilters.classroom_id
                ? classes.find((c) => c.id === draftFilters.classroom_id)?.name
                : "All Classes"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full sm:w-48 p-0">
            <Command>
              <CommandInput placeholder="Search class..." className="h-9" />
              <CommandEmpty>No class found.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value="All Classes"
                  onSelect={() => {
                    setDraftFilters((prev) => ({ ...prev, classroom_id: undefined }));
                  }}>
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      !draftFilters.classroom_id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  All Classes
                </CommandItem>
                {classes.map((c) => (
                  <CommandItem
                    key={c.id}
                    value={c.name}
                    onSelect={() => {
                      setDraftFilters((prev) => ({ ...prev, classroom_id: c.id }));
                    }}>
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        draftFilters.classroom_id === c.id ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {c.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="w-full sm:w-48 justify-between">
              {draftFilters.course_id
                ? courses.find((c) => c.id === draftFilters.course_id)?.name
                : "All Courses"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full sm:w-48 p-0">
            <Command>
              <CommandInput placeholder="Search course..." className="h-9" />
              <CommandEmpty>No course found.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value="All Courses"
                  onSelect={() => {
                    setDraftFilters((prev) => ({ ...prev, course_id: undefined }));
                  }}>
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      !draftFilters.course_id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  All Courses
                </CommandItem>
                {courses.map((c) => (
                  <CommandItem
                    key={c.id}
                    value={c.name}
                    onSelect={() => {
                      setDraftFilters((prev) => ({ ...prev, course_id: c.id }));
                    }}>
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        draftFilters.course_id === c.id ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {c.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        <div className="flex flex-col gap-1 w-full sm:w-auto">
          <p className="text-xs text-muted-foreground">Start Date</p>
          <input
            type="date"
            value={draftFilters.startDate || ""}
            onChange={(e) => handleDraftDateChange("startDate", e.target.value)}
            className="w-full sm:w-48 px-3 py-2 border border-[#EF7B55]/30 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#EF7B55]/50"
          />
        </div>

        <div className="flex flex-col gap-1 w-full sm:w-auto">
          <p className="text-xs text-muted-foreground">End Date</p>
          <input
            type="date"
            value={draftFilters.endDate || ""}
            onChange={(e) => handleDraftDateChange("endDate", e.target.value)}
            className="w-full sm:w-48 px-3 py-2 border border-[#EF7B55]/30 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#EF7B55]/50"
          />
        </div>

        {/* Apply / Reset buttons */}
        <div className="flex items-end gap-2">
          <Button
            onClick={applyFilters}
            disabled={actionInProgress === "search" || actionInProgress === "apply"}
            className="h-9">
            {actionInProgress === "apply" ? <Spinner size="sm" /> : "Apply filters"}
          </Button>

          <Button
            variant="ghost"
            onClick={resetFilters}
            disabled={actionInProgress === "search" || actionInProgress === "apply"}
            className="h-9">
            Reset
          </Button>
        </div>
      </div>

      {/* ================= MOBILE CARDS ================= */}
      <div className="space-y-4 sm:hidden">
        {submissions.map((s) => (
          <div
            key={s.id}
            className="rounded-xl border border-[#EF7B55]/20 p-4 shadow-sm space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-slate-800">{s.student_name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(s.created_at)}
                </p>
              </div>

              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                  s.status,
                )}`}>
                {s.status}
              </span>
            </div>

            <div className="text-sm space-y-1">
              <p>
                <span className="text-muted-foreground">Title:</span>{" "}
                {s.title || "-"}
              </p>
              <p>
                <span className="text-muted-foreground">Lesson:</span>{" "}
                {s.lesson_title}
              </p>
              <p>
                <span className="text-muted-foreground">Class:</span>{" "}
                {s.class_name ?? "-"}
              </p>
              <p>
                <span className="text-muted-foreground">Course:</span>{" "}
                {s.course_name}
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              {s.status !== "graded" && (
                <Button
                  size="sm"
                  className="flex-1 bg-[#EF7B55]/70 hover:bg-[#EF7B55]/90 text-white"
                  asChild>
                  <a href={`/teacher/submissions/${s.id}/grade`}>Grade</a>
                </Button>
              )}
            </div>
          </div>
        ))}

        {submissions.length === 0 && !loading && (
          <p className="text-center text-sm text-muted-foreground py-6">
            No submissions found.
          </p>
        )}
      </div>

      {/* ================= DESKTOP TABLE ================= */}
      <div className="hidden sm:block">
        <div className="overflow-x-auto rounded-xl border border-[#EF7B55]/20 shadow-sm">
          <table className="w-full min-w-[760px] table-auto">
            <thead className="bg-[#EF7B55]/5">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase">
                  Student
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase">
                  Title
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase">
                  Language
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase">
                  Lesson
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase">
                  Class
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase">
                  Course
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase">
                  Submitted
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#EF7B55]/10">
              {submissions.map((s) => (
                <tr
                  key={s.id}
                  className="hover:bg-[#EF7B55]/5 transition-colors">
                  <td className="px-4 py-3 text-sm">{s.student_name}</td>

                  <td className="px-4 py-3 text-sm">{s.title || "-"}</td>

                  <td className="px-4 py-3 text-sm">{s.language}</td>

                  <td className="px-4 py-3 text-sm">{s.lesson_title}</td>

                  <td className="px-4 py-3 text-sm text-slate-600">
                    {s.class_name ?? "-"}
                  </td>

                  <td className="px-4 py-3 text-sm text-slate-600">
                    {s.course_name}
                  </td>

                  <td className="px-4 py-3 text-sm text-slate-600">
                    {formatDate(s.created_at)}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        s.status,
                      )}`}>
                      {s.status}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      {s.status !== "graded" && (
                        <Button
                          size="sm"
                          className="bg-[#EF7B55]/70 hover:bg-[#EF7B55]/90 text-white"
                          asChild>
                          <a href={`/teacher/submissions/${s.id}/grade`}>
                            Grade
                          </a>
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
      </div>

      {/* Pagination */}
      {submissions.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">Page {currentPage}</p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                // pagination is not shown with a button-level spinner; use global loading
                lastActionRef.current = null;
                setActionInProgress(null);
                setCurrentPage((p) => Math.max(1, p - 1));
              }}
              disabled={currentPage === 1}
              className="h-9 w-9">
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                lastActionRef.current = null;
                setActionInProgress(null);
                setCurrentPage((p) => p + 1);
              }}
              disabled={!hasNext}
              className="h-9 w-9">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionList;

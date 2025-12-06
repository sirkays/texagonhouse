"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Plus,
  Trash2,
  Save,
  Eye,
  Clock,
  Users,
  TestTube,
  Copy,
  Edit,
  MoreHorizontal,
  CalendarDays,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Import with type assertions
const saveAs = require("file-saver").saveAs;
const html2pdf = require("html2pdf.js");

/* --------------------------------- Types -------------------------------- */

interface Question {
  id: string;
  type: "single-choice" | "true-false" | "short-answer" | "essay";
  question: string;
  options?: string[];
  correctAnswer: string | number | boolean;
  points: number;
  explanation?: string;
  difficulty?: "Easy" | "Medium" | "Hard";
}

interface Course {
  id: number;
  name: string;
  subject: string;
  classroom: string;
  description: string;
}
interface TeacherTestMini {
  id: string;
  title: string;
  // Optional extra fields if your serializer returns them:
  // subject_name?: string;
  // class_name?: string;
}

interface CBTTest {
  id: string;
  title: string;
  course_id: string,
  description: string;
  instructions: string;
  duration: number;
  totalPoints: number;
  questions: Question[];
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  courseId?: string;
  isPublished: boolean;
  questionsCount: number;
  createdAt: string;
  updatedAt: string;
  /** Backend-ready ISO value or empty string */
  start_at?: string;
  end_at?: string;
  total_marks?: number;
  /** UI-local string for datetime-local input (YYYY-MM-DDTHH:mm) */
  _startLocal?: string;
  _endLocal?: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface StudentPerformance {
  id: string;
  studentName: string;
  studentId: string;
  email: string;
  classGrade: string;
  score: number;
  totalMarks: number;
  percentage: number;
  completionTime: number;
  status: "Passed" | "Failed";
  submittedAt: string;
  testId: string;
  testTitle: string;
  // make CSV export safe
  answers?: Array<{
    question: string;
    selected: string;
    correct: string;
    status: string;
  }>;
}

interface PerformanceSummary {
  totalAttempts: number;
  averageScore: number;
  passRate: number;
  averageCompletionTime: number;
}

/* ----------------------------- Date Utilities --------------------------- */

/** Format Date -> "YYYY-MM-DDTHH:mm" for datetime-local */
function toLocalInputValue(date?: Date | null) {
  if (!date) return "";
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

/** Convert "YYYY-MM-DDTHH:mm" (local) -> ISO string with Z suffix */
function localInputToISO(localStr?: string) {
  if (!localStr) return undefined;
  // JS interprets "YYYY-MM-DDTHH:mm" as local time
  const dt = new Date(localStr);
  if (isNaN(dt.getTime())) return undefined;
  return dt.toISOString();
}

/** Convert ISO (or any parseable) -> Date or null */
function parseToDate(val?: string | null) {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

/* --------------------------- DateTimePicker UI -------------------------- */

function DateTimePicker({
  label,
  valueLocal,
  onChangeLocal,
  disabled,
}: {
  label: string;
  /** local string "YYYY-MM-DDTHH:mm" */
  valueLocal?: string;
  onChangeLocal: (v: string) => void;
  disabled?: boolean;
}) {
  const datePart = valueLocal?.split("T")[0] || "";
  const timePart = valueLocal?.split("T")[1] || "";

  const dateObj = datePart ? parseToDate(`${datePart}T${timePart || "00:00"}`) : null;

  const handleDateChange = (d?: Date) => {
    if (!d) {
      onChangeLocal("");
      return;
    }
    const currentTime = timePart || "00:00";
    const localStr = `${toLocalInputValue(d).split("T")[0]}T${currentTime}`;
    onChangeLocal(localStr);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = e.target.value; // "HH:mm"
    const currentDate = datePart || toLocalInputValue(new Date()).split("T")[0];
    onChangeLocal(`${currentDate}T${t}`);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="grid grid-cols-5 gap-2">
        <div className="col-span-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start text-left font-normal"
                disabled={disabled}
              >
                <CalendarDays className="mr-2 h-4 w-4" />
                {dateObj ? dateObj.toLocaleDateString() : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" align="start">
              <Calendar
                mode="single"
                selected={dateObj ?? undefined}
                onSelect={(d) => handleDateChange(d ?? undefined)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="col-span-2">
          <Input
            type="time"
            value={timePart || ""}
            onChange={handleTimeChange}
            disabled={disabled}
          />
        </div>
      </div>
      {/* small helper preview */}
      <p className="text-xs text-muted-foreground">
        {valueLocal
          ? new Date(valueLocal).toLocaleString()
          : "—"}
      </p>
    </div>
  );
}

/* ------------------------------ Main Page ------------------------------ */

export function TeacherCBTCreator() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("create");

  // Read tab from URL query parameter (for navigation from student performance detail page)
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "performance") {
      setActiveTab("student-performance");
    }
  }, [searchParams]);
  const [currentTest, setCurrentTest] = useState<CBTTest>({
    id: "",
    title: "",
    course_id: "",
    description: "",
    instructions: "",
    duration: 30,
    totalPoints: 0,
    questions: [],
    difficulty: "Medium",
    category: "",
    courseId: "",
    isPublished: false,
    questionsCount: 0,
    createdAt: "",
    updatedAt: "",
    start_at: "",
    end_at: "",
    total_marks: 0,
    _startLocal: "",
    _endLocal: "",
  });
  const [myTests, setMyTests] = useState<TeacherTestMini[]>([]);
  const [selectedTestFilter, setSelectedTestFilter] = useState<string>("all");

  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isEditTestOpen, setIsEditTestOpen] = useState(false);
  const [isPreviewTestOpen, setIsPreviewTestOpen] = useState(false);
  const [selectedTestForEdit, setSelectedTestForEdit] =
    useState<CBTTest | null>(null);
  const [selectedTestForPreview, setSelectedTestForPreview] =
    useState<CBTTest | null>(null);
  const [selectedTestForAnalytics, setSelectedTestForAnalytics] =
    useState<CBTTest | null>(null);
  const [isAnalyticsDetailOpen, setIsAnalyticsDetailOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [tests, setTests] = useState<CBTTest[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 3,
    total: 0,
    pages: 1,
  });
  const [performancePagination, setPerformancePagination] =
    useState<PaginationInfo>({
      page: 1,
      limit: 10,
      total: 0,
      pages: 1,
    });
  const [loadingTests, setLoadingTests] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPublished, setFilterPublished] = useState<
    "all" | "published" | "draft"
  >("all");
  const [studentFilter, setStudentFilter] = useState("");
  const [sortField, setSortField] = useState<
    "score" | "completionTime" | "submittedAt"
  >("score");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isSaving, setIsSaving] = useState(false);
  const [studentPerformances, setStudentPerformances] = useState<
    StudentPerformance[]
  >([]);
  const [summary, setSummary] = useState<PerformanceSummary | null>(null);
  const [analyticsSummary, setAnalyticsSummary] =
    useState<PerformanceSummary | null>(null);
  const [loadingPerformances, setLoadingPerformances] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);

useEffect(() => {
  const fetchCourses = async () => {
    setLoadingTests(true);
    const res = await fetch("/api/teacher/assessments/courses");
    if (!res.ok) {
      console.error("Failed to fetch courses");
      setLoadingTests(false);
      return;
    }
    const data = await res.json();
    if (data.error === "Session expired") {
      router.push("/login");
      setLoadingTests(false);
      return;
    }
    setCourses(data.courses || []);
    setLoadingTests(false);
  };

  const fetchMyTests = async () => {
    try {
      const res = await fetch("/api/teacher/fetch-my-tests");
      if (!res.ok) {
        console.error("Failed to fetch my tests");
        return;
      }
      const data = await res.json();
      if (data.error === "Session expired") {
        router.push("/login");
        return;
      }
      // Django view returns: { success, count, results: [...] }
      setMyTests(data.results || []);
    } catch (err) {
      console.error("Error fetching my tests:", err);
    }
  };

  fetchCourses();
  fetchMyTests();
}, [router]);


  const fetchTests = useCallback(async () => {
    setLoadingTests(true);
    const params = new URLSearchParams();
    params.append("page", pagination.page.toString());
    params.append("limit", pagination.limit.toString());
    if (searchQuery) params.append("search", searchQuery);
    if (filterPublished === "published") params.append("published", "true");
    if (filterPublished === "draft") params.append("published", "false");

    const res = await fetch(
      `/api/teacher/assessments/tests?${params.toString()}`
    );
    if (!res.ok) {
      console.error("Failed to fetch tests");
      setLoadingTests(false);
      return;
    }
    const data = await res.json();
    if (data.error === "Session expired") {
      router.push("/login");
      setLoadingTests(false);
      return;
    }
    setTests(
      (data.tests || []).map((t: any) => ({
        ...t,
        _startLocal: t.start_at ? toLocalInputValue(parseToDate(t.start_at)) : "",
        _endLocal: t.end_at ? toLocalInputValue(parseToDate(t.end_at)) : "",
      }))
    );
    setPagination(data.pagination || { page: 1, limit: 3, total: 0, pages: 1 });
    setLoadingTests(false);
  }, [pagination.page, pagination.limit, searchQuery, filterPublished, router]);

  const fetchTestById = async (testId: string): Promise<CBTTest | null> => {
    setLoadingTests(true);
    const res = await fetch(`/api/teacher/assessments/tests/${testId}`);
    if (!res.ok) {
      console.error(`Failed to fetch test ${testId}: ${res.status}`);
      setLoadingTests(false);
      return null;
    }
    const data = await res.json();
    if (data.error === "Session expired") {
      router.push("/login");
      setLoadingTests(false);
      return null;
    }
    setLoadingTests(false);

    const startLocal = data.test.start_at
      ? toLocalInputValue(parseToDate(data.test.start_at))
      : "";
    const endLocal = data.test.end_at
      ? toLocalInputValue(parseToDate(data.test.end_at))
      : "";

    return {
      id: data.test.id || "",
      course_id: data.test.course_id || "",
      title: data.test.title || "",
      description: data.test.description || "",
      instructions: data.test.instructions || "",
      duration: data.test.duration || 30,
      totalPoints: data.test.totalPoints || 0,
      questions:
        data.test.questions?.map((q: any) => ({
          ...q,
          correctAnswer:
            q.type === "single-choice"
              ? Number(q.correctAnswer) || 0
              : q.type === "true-false"
                ? q.correctAnswer === "true" || q.correctAnswer === true
                : q.correctAnswer?.toString() || "",
        })) || [],
      difficulty: data.test.difficulty || "Medium",
      category: data.test.category || "General",
      courseId: data.test.course_id?.toString() || "",
      isPublished: data.test.isPublished || false,
      questionsCount: data.test.questionsCount || 0,
      createdAt: data.test.createdAt || "",
      updatedAt: data.test.updatedAt || "",
      start_at: data.test.start_at || "",
      end_at: data.test.end_at || "",
      total_marks: Number(data.test.total_marks) || 0,
      _startLocal: startLocal,
      _endLocal: endLocal,
    };
  };

  const fetchSummary = useCallback(
    async (testId?: string) => {
      setLoadingSummary(true);
      const params = new URLSearchParams();
      if (testId) params.append("test_id", testId);
      const res = await fetch(
        `/api/teacher/performance-summary?${params.toString()}`
      );
      if (!res.ok) {
        console.error("Failed to fetch summary");
        setLoadingSummary(false);
        return null;
      }
      const data = await res.json();
      if (data.error === "Session expired") {
        router.push("/login");
        setLoadingSummary(false);
        return null;
      }
      setLoadingSummary(false);
      return data;
    },
    [router]
  );

const fetchPerformances = useCallback(async () => {
  setLoadingPerformances(true);
  const params = new URLSearchParams();

  if (studentFilter) params.append("student_filter", studentFilter);

  // ✅ Only filter when not 'all'
  if (selectedTestFilter && selectedTestFilter !== "all") {
    params.append("test_id", selectedTestFilter);
  }

  params.append("sort_field", sortField);
  params.append("sort_order", sortOrder);
  params.append("page", performancePagination.page.toString());
  params.append("limit", performancePagination.limit.toString());

  const res = await fetch(
    `/api/teacher/performance-list?${params.toString()}`
  );
  if (!res.ok) {
    console.error("Failed to fetch performances");
    setLoadingPerformances(false);
    return;
  }
  const data = await res.json();
  if (data.error === "Session expired") {
    router.push("/login");
    setLoadingPerformances(false);
    return;
  }
  setStudentPerformances(data.performances || []);
  setPerformancePagination(
    data.pagination || { page: 1, limit: 10, total: 0, pages: 1 }
  );
  setLoadingPerformances(false);
}, [
  studentFilter,
  selectedTestFilter,   // ✅ NEW
  sortField,
  sortOrder,
  performancePagination.page,
  performancePagination.limit,
  router,
]);


  useEffect(() => {
    if (activeTab === "manage" || activeTab === "analytics") {
      fetchTests();
    }
  }, [activeTab, fetchTests]);

  useEffect(() => {
    if (activeTab === "analytics") {
      fetchSummary().then(setSummary);
    }
  }, [activeTab, fetchSummary]);

  useEffect(() => {
    if (activeTab === "student-performance") {
      fetchPerformances();
    }
  }, [activeTab, fetchPerformances]);

  useEffect(() => {
    if (isAnalyticsDetailOpen && selectedTestForAnalytics) {
      fetchSummary(selectedTestForAnalytics.id).then(setAnalyticsSummary);
    }
  }, [isAnalyticsDetailOpen, selectedTestForAnalytics, fetchSummary]);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type: "single-choice",
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      points: 1,              // 🔁 was 5
      difficulty: "Medium",
    };
    setCurrentTest((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
      totalPoints: prev.totalPoints + 1,   // 🔁 was + 5
      questionsCount: prev.questionsCount + 1,
    }));
    setEditingQuestion(newQuestion);
  };


  const updateQuestion = (questionId: string, updates: Partial<Question>) => {
    setCurrentTest((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => {
        if (q.id !== questionId) return q;
        const updatedQuestion = { ...q, ...updates };
        if (updates.type && updates.type !== q.type) {
          updatedQuestion.correctAnswer =
            updates.type === "single-choice"
              ? 0
              : updates.type === "true-false"
                ? false
                : "";
        }
        return updatedQuestion;
      }),
    }));
    if (editingQuestion?.id === questionId) {
      setEditingQuestion((prev) => {
        if (!prev) return null;
        const updatedQuestion = { ...prev, ...updates };
        if (updates.type && updates.type !== prev.type) {
          updatedQuestion.correctAnswer =
            updates.type === "single-choice"
              ? 0
              : updates.type === "true-false"
                ? false
                : "";
        }
        return updatedQuestion;
      });
    }
  };

  /* -------------------------- Build Save Payload ------------------------- */

  function buildTestPayload(isEditing: boolean) {
    // Convert local UI strings to ISO for backend; omit if empty
    const startISO = localInputToISO(currentTest._startLocal);
    const endISO = localInputToISO(currentTest._endLocal);

    if (isEditing) {
      return {
        title: currentTest.title,
        instructions: currentTest.instructions,
        duration: currentTest.duration,
        difficulty: currentTest.difficulty,
        ...(startISO ? { start_at: startISO } : {}),
        ...(endISO ? { end_at: endISO } : {}),
        total_marks: currentTest.total_marks,
      };
    }
    return {
      title: currentTest.title,
      instructions: currentTest.instructions,
      duration: currentTest.duration,
      difficulty: currentTest.difficulty,
      course_id: Number.parseInt(currentTest.courseId || "0"),
      category: currentTest.category || "General",
      ...(startISO ? { start_at: startISO } : {}),
      ...(endISO ? { end_at: endISO } : {}),
      total_marks: currentTest.total_marks,
    };
  }

  const saveTest = async () => {
    setIsSaving(true);
    try {
      const isEditing = !!currentTest.id;
      const endpoint = isEditing
        ? `/api/teacher/assessments/tests/${currentTest.id}/update`
        : "/api/teacher/assessments/tests/create";
      const method = isEditing ? "PUT" : "POST";

      const body = buildTestPayload(isEditing);

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) {
        if (data.error === "Session expired") {
          router.push("/login");
          return;
        }
        throw new Error(
          data.error || `Failed to ${isEditing ? "update" : "create"} test`
        );
      }

      const updatedTestId = data.test.id;
      if (!updatedTestId) throw new Error("Test ID not returned from backend");

      const updatedQuestions = [...currentTest.questions];
      for (let i = 0; i < updatedQuestions.length; i++) {
        const question = updatedQuestions[i];
        let questionEndpoint;
        let questionMethod;
        if (question.id.length > 10) {
          questionEndpoint = `/api/teacher/assessments/tests/test/${updatedTestId}/questions/add`;
          questionMethod = "POST";
        } else {
          questionEndpoint = `/api/teacher/assessments/tests/test/${updatedTestId}/questions/${question.id}/update`;
          questionMethod = "PUT";
        }
        const questionResponse = await fetch(questionEndpoint, {
          method: questionMethod,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: question.type,
            question: question.question,
            options: question.options || [],
            correctAnswer:
              question.type === "single-choice"
                ? Number(question.correctAnswer) || 0
                : question.type === "true-false"
                  ? question.correctAnswer === "true" ||
                  question.correctAnswer === true
                  : (question.correctAnswer as string)?.toString() || "",
            points: question.points,
            explanation: question.explanation || "",
            difficulty: question.difficulty || "Medium",
          }),
        });
        if (!questionResponse.ok) {
          const questionData = await questionResponse.json();
          console.error(
            `[saveTest] Failed to ${questionMethod === "POST" ? "create" : "update"
            } question ${question.id}:`,
            questionData.error
          );
        } else {
          const questionData = await questionResponse.json();
          updatedQuestions[i] = {
            ...question,
            id: questionData.question.id,
            correctAnswer: questionData.question.correctAnswer,
          };
        }
      }

      // Reflect canonical values back to UI (including ISO -> local mirrors)
      const nextStartLocal = data.test.start_at
        ? toLocalInputValue(parseToDate(data.test.start_at))
        : "";
      const nextEndLocal = data.test.end_at
        ? toLocalInputValue(parseToDate(data.test.end_at))
        : "";

      setCurrentTest((prev) => ({
        ...prev,
        id: updatedTestId,
        title: data.test.title || prev.title,
        description: data.test.description || prev.description,
        instructions: data.test.instructions || prev.instructions || "",
        duration: data.test.duration || prev.duration,
        totalPoints: data.test.totalPoints || prev.totalPoints,
        questions: updatedQuestions,
        difficulty: data.test.difficulty || prev.difficulty,
        category: data.test.category || prev.category || "General",
        courseId: data.test.course_id?.toString() || prev.courseId || "",
        isPublished: data.test.isPublished || prev.isPublished,
        questionsCount: data.test.questionsCount || prev.questionsCount,
        createdAt: data.test.createdAt || prev.createdAt,
        updatedAt: data.test.updatedAt || prev.updatedAt,
        start_at: data.test.start_at || prev.start_at || "",
        end_at: data.test.end_at || prev.end_at || "",
        total_marks: Number(data.test.total_marks) || prev.total_marks || 0,
        _startLocal: nextStartLocal,
        _endLocal: nextEndLocal,
      }));
      alert(data.message);
      alert(`Test ${isEditing ? "updated" : "created"} successfully!`);
      if (isEditing) setIsEditTestOpen(false);
    } catch (error: any) {
      console.error(
        `Error ${currentTest.id ? "updating" : "creating"} test:`,
        error
      );
      alert(
        `Failed to ${currentTest.id ? "update" : "create"} test: ${error.message
        }`
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditTest = async (test: CBTTest) => {
    setIsSaving(true);
    const testData = await fetchTestById(test.id);
    if (testData) {
      setSelectedTestForEdit(testData);
      setCurrentTest(testData);
      setIsEditTestOpen(true);
    }
    setIsSaving(false);
  };

  const handlePreviewTest = async (test: CBTTest) => {
    setIsSaving(true);
    const testData = await fetchTestById(test.id);
    if (testData) {
      setSelectedTestForPreview(testData);
      setIsPreviewTestOpen(true);
    }
    setIsSaving(false);
  };

  const publishTest = async (testId: string, isPublished: boolean) => {
    try {
      const startISO = localInputToISO(currentTest._startLocal);
      const endISO = localInputToISO(currentTest._endLocal);

      const payload: any = { isPublished };
      if (startISO) payload.start_at = startISO;
      if (endISO) payload.end_at = endISO;
      if (typeof currentTest.total_marks === "number")
        payload.total_marks = currentTest.total_marks;

      const response = await fetch(
        `/api/teacher/assessments/tests/test/${testId}/publish`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        if (data.error === "Session expired") {
          router.push("/login");
          return;
        }
        throw new Error(
          data.error ||
          `Failed to ${isPublished ? "publish" : "unpublish"} test`
        );
      }
      const nextStartLocal = data.test.start_at
        ? toLocalInputValue(parseToDate(data.test.start_at))
        : "";
      const nextEndLocal = data.test.end_at
        ? toLocalInputValue(parseToDate(data.test.end_at))
        : "";

      setCurrentTest((prev) => ({
        ...prev,
        isPublished: data.test.isPublished,
        title: data.test.title || prev.title,
        description: data.test.description || prev.description,
        instructions: data.test.instructions || prev.instructions || "",
        duration: data.test.duration || prev.duration,
        totalPoints: data.test.totalPoints || prev.totalPoints,
        difficulty: data.test.difficulty || prev.difficulty,
        category: data.test.category || prev.category || "General",
        courseId: data.test.course_id?.toString() || prev.courseId || "",
        questionsCount: data.test.questionsCount || prev.questionsCount,
        createdAt: data.test.createdAt || prev.createdAt,
        updatedAt: data.test.updatedAt || prev.updatedAt,
        start_at: data.test.start_at || prev.start_at || "",
        end_at: data.test.end_at || prev.end_at || "",
        total_marks: Number(data.test.total_marks) || prev.total_marks || 0,
        _startLocal: nextStartLocal,
        _endLocal: nextEndLocal,
      }));
      setTests((prev) =>
        prev.map((test) =>
          test.id === testId
            ? {
              ...test,
              isPublished: data.test.isPublished,
              instructions: data.test.instructions || test.instructions || "",
              start_at: data.test.start_at || test.start_at || "",
              end_at: data.test.end_at || test.end_at || "",
              total_marks: Number(data.test.total_marks) || test.total_marks || 0,
              _startLocal: nextStartLocal,
              _endLocal: nextEndLocal,
            }
            : test
        )
      );
      alert(data.message);
    } catch (error: any) {
      console.error(
        `Error ${isPublished ? "publishing" : "unpublishing"} test:`,
        error
      );
      alert(
        `Failed to ${isPublished ? "publish" : "unpublish"} test: ${error.message
        }`
      );
    }
  };

  const duplicateTest = async (testId: string) => {
    try {
      const response = await fetch(
        `/api/teacher/assessments/tests/test/${testId}/duplicate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await response.json();
      if (!response.ok) {
        if (data.error === "Session expired") {
          router.push("/login");
          return;
        }
        throw new Error(data.error || "Failed to duplicate test");
      }
      alert("Test duplicated successfully!");
      router.push(`/teacher/create-cbt`);
    } catch (error: any) {
      console.error("Error duplicating test:", error);
      alert(`Failed to duplicate test: ${error.message}`);
    }
  };

  const deleteQuestion = async (testId: string, questionId: string) => {
    // 🧠 New logic: if test not yet saved OR question is "new" (added via +), 
    // just update local state, no API call.
    const isUnsavedTest = !testId;              // "", nullish => unsaved test
    const isUnsavedQuestion = questionId.length > 10; // same heuristic as saveTest

    if (isUnsavedTest || isUnsavedQuestion) {
      setCurrentTest((prev) => {
        const deletedQuestion = prev.questions.find((q) => q.id === questionId);
        return {
          ...prev,
          questions: prev.questions.filter((q) => q.id !== questionId),
          questionsCount: Math.max(prev.questionsCount - 1, 0),
          totalPoints: prev.totalPoints - (deletedQuestion?.points || 0),
        };
      });
      return;
    }

    // ✅ Persisted question for a saved test: call API as before
    try {
      const response = await fetch(
        `/api/teacher/assessments/tests/test/${testId}/questions/${questionId}/delete`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await response.json();
      if (!response.ok) {
        if (data.error === "Session expired") {
          router.push("/login");
          return;
        }
        throw new Error(data.error || "Failed to delete question");
      }

      setCurrentTest((prev) => {
        const deletedQuestion = prev.questions.find((q) => q.id === questionId);
        return {
          ...prev,
          questions: prev.questions.filter((q) => q.id !== questionId),
          questionsCount: prev.questionsCount - 1,
          totalPoints: prev.totalPoints - (deletedQuestion?.points || 0),
        };
      });

      setTests((prev) =>
        prev.map((test) =>
          test.id === testId
            ? {
              ...test,
              questionsCount: test.questionsCount - 1,
              totalPoints:
                test.totalPoints -
                (currentTest.questions.find((q) => q.id === questionId)?.points ||
                  0),
            }
            : test
        )
      );

      alert(data.message);
    } catch (error: any) {
      console.error("Error deleting question:", error);
      alert(`Failed to delete question: ${error.message}`);
    }
  };

  const deleteTest = async (testId: string) => {
    try {
      const response = await fetch(
        `/api/teacher/assessments/tests/test/${testId}/delete`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await response.json();
      if (!response.ok) {
        if (data.error === "Session expired") {
          router.push("/login");
          return;
        }
        throw new Error(data.error || "Failed to delete test");
      }
      setTests((prev) => prev.filter((test) => test.id !== testId));
      alert(data.message);
      router.push("/teacher/create-cbt");
    } catch (error: any) {
      console.error("Error deleting test:", error);
      alert(`Failed to delete test: ${error.message}`);
    }
  };

  const handleViewAnalyticsDetails = (test: CBTTest) => {
    setSelectedTestForAnalytics(test);
    setIsAnalyticsDetailOpen(true);
  };

  const handleViewStudentPerformance = (performance: StudentPerformance) => {
    router.push(`/teacher/student-performance/${performance.id}`);
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handlePerformancePageChange = (newPage: number) => {
    setPerformancePagination((prev) => ({ ...prev, page: newPage }));
  };

  const exportToCSV = (performance: StudentPerformance) => {
    const test = tests.find((t) => t.id === performance.testId);
    if (!test) return;

    let csvContent =
      "Student Name,Student ID,Email,Class,Test Title,Date,Duration,Total Questions,Passing Score,Total Score,Percentage,Status\n";
    csvContent += `"${performance.studentName}","${performance.studentId}","${performance.email
      }","${performance.classGrade}","${test.title}","${test.start_at ? new Date(test.start_at).toLocaleDateString() : "N/A"
      }","${test.duration} minutes",${test.questionsCount},${(test.total_marks || 0) * 0.7
      },${performance.score},${performance.percentage},"${performance.status
      }"\n\n`;
    csvContent += "Question,Selected Option,Correct Option,Status\n";
    (performance.answers || []).forEach((answer: any) => {
      csvContent += `"${String(answer.question || "").replace(/"/g, '""')}","${answer.selected ?? ""
        }","${answer.correct ?? ""}","${answer.status ?? ""}"\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${performance.studentName}_${test.title}_performance.csv`);
  };

  const exportToPDF = (performance: StudentPerformance) => {
    const test = tests.find((t) => t.id === performance.testId);
    if (!test) return;

    const element = document.getElementById("studentPerformanceDetails");
    if (!element) return;

    const opt = {
      margin: 1,
      filename: `${performance.studentName}_${test.title}_performance.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" as const },
    };
    html2pdf().from(element).set(opt).save();
  };

  // Filter and sort student performances (placeholder passthrough)
  const filteredPerformances = useMemo(() => {
    return studentPerformances;
  }, [studentPerformances]);

  const resetForm = useCallback(() => {
    setCurrentTest({
      id: "",
      title: "",
      description: "",
      instructions: "",
      duration: 30,
      totalPoints: 0,
      questions: [],
      difficulty: "Medium",
      category: "",
      courseId: "",
      isPublished: false,
      questionsCount: 0,
      course_id: "",
      createdAt: "",
      updatedAt: "",
      start_at: "",
      end_at: "",
      total_marks: 0,
      _startLocal: "",
      _endLocal: "",
    });
    setEditingQuestion(null);
  }, []);

  /* --------------------------------- UI --------------------------------- */
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">CBT Test Creator</h1>
        <p className="text-muted-foreground">
          Create and manage computer-based tests for your students
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-[#f797712e] text-slate-700 flex flex-col lg:flex-row w-full gap-2 mb-14">
          <TabsTrigger
            value="create"
            className="bg-transparent w-full sm:w-40 justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3"
            disabled={isSaving}
          >
            Create New Test
          </TabsTrigger>
          <TabsTrigger
            value="manage"
            className="bg-transparent w-full sm:w-40 justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3"
            disabled={isSaving}
          >
            Manage Tests
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="bg-transparent w-full sm:w-40 justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3"
            disabled={isSaving}
          >
            Test Analytics
          </TabsTrigger>
          <TabsTrigger
            value="student-performance"
            className="bg-transparent w-full sm:w-40 justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3"
            disabled={isSaving}
          >
            Student Performance
          </TabsTrigger>
        </TabsList>

        {/* ------------------------------ Create ------------------------------ */}
        <TabsContent value="create" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Test Configuration</CardTitle>
                <CardDescription>Set up your test parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Test Title</Label>
                  <Input
                    id="title"
                    value={currentTest.title}
                    onChange={(e) =>
                      setCurrentTest((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Enter test title"
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instructions">Instructions</Label>
                  <Textarea
                    id="instructions"
                    value={currentTest.instructions}
                    onChange={(e) =>
                      setCurrentTest((prev) => ({
                        ...prev,
                        instructions: e.target.value,
                      }))
                    }
                    placeholder="Provide instructions for this test"
                    rows={3}
                    disabled={isSaving}
                  />
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={currentTest.duration}
                      onChange={(e) =>
                        setCurrentTest((prev) => ({
                          ...prev,
                          duration: Number.parseInt(e.target.value),
                        }))
                      }
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label>Difficulty</Label>
                    <Select
                      value={currentTest.difficulty}
                      onValueChange={(value: "Easy" | "Medium" | "Hard") =>
                        setCurrentTest((prev) => ({
                          ...prev,
                          difficulty: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Better Date UI */}
                <DateTimePicker
                  label="Start Date & Time"
                  valueLocal={currentTest._startLocal}
                  onChangeLocal={(v) =>
                    setCurrentTest((prev) => ({ ...prev, _startLocal: v }))
                  }
                  disabled={isSaving}
                />
                <DateTimePicker
                  label="End Date & Time"
                  valueLocal={currentTest._endLocal}
                  onChangeLocal={(v) =>
                    setCurrentTest((prev) => ({ ...prev, _endLocal: v }))
                  }
                  disabled={isSaving}
                />

                {/* <div className="space-y-2">
                  <Label htmlFor="total_marks">Total Marks</Label>
                  <Input
                    id="total_marks"
                    type="number"
                    value={currentTest.total_marks || ""}
                    onChange={(e) =>
                      setCurrentTest((prev) => ({
                        ...prev,
                        total_marks: Number(e.target.value) || 0,
                      }))
                    }
                    min={1}
                    placeholder="Enter total marks"
                    disabled={isSaving}
                  />
                </div> */}
                <div className="space-y-2">
                  <Label>Course</Label>
                  <Select
                    value={currentTest.courseId || ""}
                    onValueChange={(value) =>
                      setCurrentTest((prev) => ({ ...prev, courseId: value }))
                    }
                    disabled={isSaving}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id.toString()}>
                          {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Questions:</span>
                    <span>{currentTest.questions.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Points:</span>
                    <span>{currentTest.totalPoints}</span>
                  </div>
                </div>
                <div className="pt-4 flex flex-col md:flex-row gap-4">
                  <Button
                    onClick={saveTest}
                    className="w-full bg-[#f79771] hover:bg-gray-300 shadow-md"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <Spinner size="sm" className="mr-2 text-white" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    {isSaving ? "Saving..." : "Save Test"}
                  </Button>
                  <Button
                    onClick={() =>
                      publishTest(
                        currentTest.id,
                        currentTest.isPublished ? false : true
                      )
                    }
                    variant="outline"
                    className="w-full bg-transparent shadow-md"
                    disabled={isSaving || !currentTest.id}
                  >
                    <TestTube className="mr-2 h-4 w-4" />
                    Publish Test
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-1">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Questions</CardTitle>
                    <CardDescription>
                      Manage your test questions
                    </CardDescription>
                  </div>
                  <Button
                    className="bg-[#f79771] text-white hover:bg-gray-300"
                    onClick={addQuestion}
                    size="sm"
                    disabled={isSaving}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentTest.questions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <TestTube className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No questions added yet</p>
                    <p className="text-sm">
                      Click the + button to add your first question
                    </p>
                  </div>
                ) : (
                  currentTest.questions.map((question, index) => (
                    <div
                      key={question.id}
                      className={`p-3 border-none rounded-lg cursor-pointer transition-colors shadow-md ${editingQuestion?.id === question.id
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                        }`}
                      onClick={() => setEditingQuestion(question)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">
                              Q{index + 1}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {question.type.replace("-", " ")}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {question.points} pts
                            </span>
                          </div>
                          <p className="text-sm line-clamp-2">
                            {question.question || "Untitled question"}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteQuestion(currentTest.id, question.id);
                          }}
                          disabled={isSaving}
                        >
                          <Trash2 className="h-3 w-3 text-[#DD2701]" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Question Editor</CardTitle>
                <CardDescription>
                  {editingQuestion
                    ? "Edit the selected question"
                    : "Select a question to edit"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {editingQuestion ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Question Type</Label>
                      <Select
                        value={editingQuestion.type}
                        onValueChange={(value: Question["type"]) =>
                          updateQuestion(editingQuestion.id, { type: value })
                        }
                        disabled={isSaving}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single-choice">
                            Single Choice
                          </SelectItem>
                          <SelectItem value="true-false">True/False</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Question</Label>
                      <Textarea
                        value={editingQuestion.question}
                        onChange={(e) =>
                          updateQuestion(editingQuestion.id, {
                            question: e.target.value,
                          })
                        }
                        placeholder="Enter your question here"
                        rows={3}
                        disabled={isSaving}
                      />
                    </div>
                    {editingQuestion.type === "single-choice" && (
                      <div className="space-y-3">
                        <Label>Answer Options</Label>
                        <RadioGroup
                          value={editingQuestion.correctAnswer.toString()}
                          onValueChange={(value) =>
                            updateQuestion(editingQuestion.id, {
                              correctAnswer: Number.parseInt(value),
                            })
                          }
                          disabled={isSaving}
                        >
                          {editingQuestion.options?.map((option, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-2"
                            >
                              <RadioGroupItem
                                value={index.toString()}
                                id={`option-${index}`}
                              />
                              <Input
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [
                                    ...(editingQuestion.options || []),
                                  ];
                                  newOptions[index] = e.target.value;
                                  updateQuestion(editingQuestion.id, {
                                    options: newOptions,
                                  });
                                }}
                                placeholder={`Option ${index + 1}`}
                                className="flex-1"
                                disabled={isSaving}
                              />
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    )}
                    {editingQuestion.type === "true-false" && (
                      <div className="space-y-2">
                        <Label>Correct Answer</Label>
                        <RadioGroup
                          value={editingQuestion.correctAnswer.toString()}
                          onValueChange={(value) =>
                            updateQuestion(editingQuestion.id, {
                              correctAnswer: value === "true",
                            })
                          }
                          disabled={isSaving}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="true" id="true" />
                            <Label htmlFor="true">True</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="false" id="false" />
                            <Label htmlFor="false">False</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>Points</Label>
                      <Input
                        type="number"
                        value={editingQuestion.points}
                        onChange={(e) =>
                          updateQuestion(editingQuestion.id, {
                            points: Number.parseInt(e.target.value),
                          })
                        }
                        min={1}
                        max={50}
                        disabled={isSaving}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Explanation (Optional)</Label>
                      <Textarea
                        value={editingQuestion.explanation || ""}
                        onChange={(e) =>
                          updateQuestion(editingQuestion.id, {
                            explanation: e.target.value,
                          })
                        }
                        placeholder="Explain the correct answer"
                        rows={2}
                        disabled={isSaving}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Edit className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>Select a question to edit</p>
                    <p className="text-sm">
                      Choose a question from the list to start editing
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ------------------------------ Manage ------------------------------ */}
        <TabsContent value="manage" className="space-y-6">
          <div className="sm:flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Manage Tests</h2>
              <p className="text-muted-foreground">
                View and manage all your created tests
              </p>
            </div>
            <Button
              className="mt-2 bg-[#f79771] hover:bg-gray-300 shadow-md"
              onClick={() => {
                setActiveTab("create");
                resetForm();
              }}
              disabled={isSaving}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create New Test
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1 w-full sm:w-auto">
              <Input
                placeholder="Search tests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isSaving}
              />
            </div>
            <Select
              value={filterPublished}
              onValueChange={(value: "all" | "published" | "draft") =>
                setFilterPublished(value)
              }
              disabled={isSaving}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {loadingTests ? (
            <div className="relative min-h-[200px] flex items-center justify-center bg-gray-100/50 rounded-lg">
              <Spinner size="md" className="text-[#f79771]" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tests.map((test) => (
                <Card key={test.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{test.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {test.instructions || "No description provided."}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" disabled={isSaving}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleEditTest(test)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => duplicateTest(test.id)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePreviewTest(test)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleViewAnalyticsDetails(test)}
                          >
                            <Clock className="mr-2 h-4 w-4" />
                            View Analytics
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => deleteTest(test.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={test.isPublished ? "default" : "secondary"}
                        className={
                          test.isPublished
                            ? "bg-[#EF7B55] text-white hover:bg-[#ef7c55b7]"
                            : "bg-gray-800 text-white hover:bg-gray-600"
                        }
                      >
                        {test.isPublished ? "Published" : "Draft"}
                      </Badge>
                      <Badge variant="outline">{test.difficulty}</Badge>
                      <Badge variant="outline">{test.category}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {test.duration} mins
                      </div>
                      <div className="flex items-center gap-1">
                        <TestTube className="h-3 w-3" />
                        {test.totalPoints} pts
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-[#f79771] hover:bg-gray-300 shadow-md"
                        onClick={() => handleEditTest(test)}
                        disabled={isSaving}
                      >
                        <Edit className="mr-2 h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePreviewTest(test)}
                        disabled={isSaving}
                        className="flex-1 bg-transparent shadow-md"
                      >
                        <Eye className="mr-2 h-3 w-3" />
                        Preview
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationPrevious
                onClick={() => handlePageChange(Math.max(pagination.page - 1, 1))}
                className={
                  pagination.page === 1 ? "pointer-events-none opacity-50" : ""
                }
              />
              {Array.from({ length: pagination.pages }, (_, index) => index + 1).map(
                (page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      isActive={pagination.page === page}
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(page);
                      }}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}
              {pagination.pages > 5 && <PaginationEllipsis />}
              <PaginationNext
                onClick={() =>
                  handlePageChange(Math.min(pagination.page + 1, pagination.pages))
                }
                className={
                  pagination.page === pagination.pages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationContent>
          </Pagination>
        </TabsContent>

        {/* ----------------------------- Analytics ---------------------------- */}
        <TabsContent value="analytics" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Test Analytics</h2>
            <p className="text-muted-foreground">Breif Overview of Performance</p>
          </div>
          {loadingSummary ? (
            <div className="flex justify-center">
              <Spinner />
            </div>
          ) : summary ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 overflow-hidden">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary.totalAttempts}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary.averageScore}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary.passRate}%</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Average Completion Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {summary.averageCompletionTime} mins
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <p>No analytics data available.</p>
          )}
        </TabsContent>

        {/* ----------------------- Student Performance ------------------------ */}
        <TabsContent value="student-performance" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Student Performance</h2>
            <p className="text-muted-foreground">
              View individual student performance across tests
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1 w-full sm:w-auto">
              <Input
                placeholder="Search students..."
                value={studentFilter}
                onChange={(e) => setStudentFilter(e.target.value)}
                disabled={isSaving}
              />
            </div>
            {/* 🔽 New Test filter */}
              <Select
                value={selectedTestFilter}
                onValueChange={(value) => setSelectedTestFilter(value)}
                disabled={isSaving}
              >
                <SelectTrigger className="w-full sm:w-[220px]">
                  <SelectValue placeholder="Filter by test" />
                </SelectTrigger>
                <SelectContent>
                  {/* ✅ value is 'all', not empty string */}
                  <SelectItem value="all">All Tests</SelectItem>
                  {myTests.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>


            <Select
              value={sortField}
              onValueChange={(value: "score" | "completionTime" | "submittedAt") =>
                setSortField(value)
              }
              disabled={isSaving}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score">Score</SelectItem>
                <SelectItem value="completionTime">Completion Time</SelectItem>
                <SelectItem value="submittedAt">Submission Date</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={sortOrder}
              onValueChange={(value: "asc" | "desc") => setSortOrder(value)}
              disabled={isSaving}
            >
              <SelectTrigger className="w-full sm:w-[120px]">
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Student Results..</CardTitle>
              <CardDescription>Detailed performance for each student</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingPerformances ? (
                <div className="flex justify-center">
                  <Spinner />
                </div>
              ) : filteredPerformances.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No student results found</p>
                  <p className="text-sm">Try adjusting your search or filters</p>
                </div>
              ) : (
                <>
                  {/* Mobile cards */}
                  <div className="space-y-4 sm:hidden">
                    {filteredPerformances.map((performance) => (
                      <Card
                        key={performance.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() =>
                          router.push(`/teacher/student-performance/${performance.id}`)
                        }
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">
                            {performance.studentName}
                          </CardTitle>
                          <CardDescription>
                            {performance.testTitle || "Unknown Test"}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Score:</span>
                            <span>
                              {performance.score}/{performance.totalMarks}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Completion Time:
                            </span>
                            <span>{performance.completionTime} mins</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge
                              variant={
                                performance.status === "Passed"
                                  ? "default"
                                  : "destructive"
                              }
                              className={
                                performance.status === "Passed"
                                  ? "bg-[#EF7B55]"
                                  : "bg-red-500"
                              }
                            >
                              {performance.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Submitted At:
                            </span>
                            <span>
                              {new Date(performance.submittedAt).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-end pt-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(
                                  `/teacher/student-performance/${performance.id}`
                                );
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Desktop table */}
                  <div className="overflow-x-auto hidden sm:block">
                    <Table className="min-w-full">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="whitespace-nowrap">
                            Student Name
                          </TableHead>
                          <TableHead className="whitespace-nowrap max-w-[220px]">
                            Test
                          </TableHead>
                          <TableHead className="whitespace-nowrap">Score</TableHead>
                          <TableHead className="hidden md:table-cell whitespace-nowrap">
                            Completion Time
                          </TableHead>
                          <TableHead className="whitespace-nowrap">Status</TableHead>
                          <TableHead className="hidden lg:table-cell whitespace-nowrap max-w-[160px]">
                            Submitted At
                          </TableHead>
                          <TableHead className="whitespace-nowrap">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPerformances.map((performance) => (
                          <TableRow
                            key={performance.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() =>
                              router.push(
                                `/teacher/student-performance/${performance.id}`
                              )
                            }
                          >
                            <TableCell className="whitespace-nowrap">
                              {performance.studentName}
                            </TableCell>
                            <TableCell
                              className="max-w-[220px] truncate"
                              title={performance.testTitle || "Unknown Test"}
                            >
                              {performance.testTitle || "Unknown Test"}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {performance.score}/{performance.totalMarks}
                            </TableCell>
                            <TableCell className="hidden md:table-cell whitespace-nowrap">
                              {performance.completionTime} mins
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  performance.status === "Passed"
                                    ? "default"
                                    : "destructive"
                                }
                                className={
                                  performance.status === "Passed"
                                    ? "bg-[#EF7B55]"
                                    : "bg-red-500"
                                }
                              >
                                {performance.status}
                              </Badge>
                            </TableCell>
                            <TableCell
                              className="hidden lg:table-cell max-w-[160px] truncate"
                              title={new Date(
                                performance.submittedAt
                              ).toLocaleString()}
                            >
                              {new Date(
                                performance.submittedAt
                              ).toLocaleDateString()}{" "}
                              {new Date(performance.submittedAt).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(
                                    `/teacher/student-performance/${performance.id}`
                                  );
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationPrevious
                onClick={() =>
                  handlePerformancePageChange(
                    Math.max(performancePagination.page - 1, 1)
                  )
                }
                className={
                  performancePagination.page === 1
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
              {Array.from(
                { length: performancePagination.pages },
                (_, index) => index + 1
              ).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    isActive={performancePagination.page === page}
                    onClick={(e) => {
                      e.preventDefault();
                      handlePerformancePageChange(page);
                    }}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              {performancePagination.pages > 5 && <PaginationEllipsis />}
              <PaginationNext
                onClick={() =>
                  handlePerformancePageChange(
                    Math.min(
                      performancePagination.page + 1,
                      performancePagination.pages
                    )
                  )
                }
                className={
                  performancePagination.page === performancePagination.pages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationContent>
          </Pagination>
        </TabsContent>
      </Tabs>

      {/* ------------------------------ Edit Modal ------------------------------ */}
      <Dialog open={isEditTestOpen} onOpenChange={setIsEditTestOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Test: {selectedTestForEdit?.title}</DialogTitle>
            <DialogDescription>
              Modify your test configuration and questions
            </DialogDescription>
          </DialogHeader>
          {selectedTestForEdit && (
            <div className="grid gap-6 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Test Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Test Title</Label>
                    <Input
                      value={currentTest.title}
                      onChange={(e) =>
                        setCurrentTest((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Instructions</Label>
                    <Textarea
                      value={currentTest.instructions}
                      onChange={(e) =>
                        setCurrentTest((prev) => ({
                          ...prev,
                          instructions: e.target.value,
                        }))
                      }
                      placeholder="Provide instructions for this test"
                      rows={3}
                      disabled={isSaving}
                    />
                  </div>

                  <DateTimePicker
                    label="Start Date & Time"
                    valueLocal={currentTest._startLocal}
                    onChangeLocal={(v) =>
                      setCurrentTest((prev) => ({ ...prev, _startLocal: v }))
                    }
                    disabled={isSaving}
                  />
                  <DateTimePicker
                    label="End Date & Time"
                    valueLocal={currentTest._endLocal}
                    onChangeLocal={(v) =>
                      setCurrentTest((prev) => ({ ...prev, _endLocal: v }))
                    }
                    disabled={isSaving}
                  />

                  {/* <div className="space-y-2">
                    <Label htmlFor="total_marks">Total Marks</Label>
                    <Input
                      id="total_marks"
                      type="number"
                      value={currentTest.total_marks || ""}
                      onChange={(e) =>
                        setCurrentTest((prev) => ({
                          ...prev,
                          total_marks: Number(e.target.value) || 0,
                        }))
                      }
                      min={1}
                      placeholder="Enter total marks"
                      disabled={isSaving}
                    />
                  </div> */}
                </CardContent>
              </Card>
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Questions ({currentTest.questions.length})</CardTitle>
                    <Button onClick={addQuestion} size="sm" disabled={isSaving}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Question
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {currentTest.questions.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <TestTube className="mx-auto h-12 w-12 mb-4 opacity-50" />
                        <p>No questions added yet</p>
                        <p className="text-sm">
                          Click "Add Question" to create your first question
                        </p>
                      </div>
                    ) : (
                      currentTest.questions.map((question, index) => (
                        <Card key={question.id} className="border-l-4 border-l-primary/20">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  Question {index + 1}
                                </span>
                                <Badge variant="outline">
                                  {question.type.replace("-", " ")}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {question.points} pts
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  deleteQuestion(currentTest.id, question.id)
                                }
                                disabled={isSaving}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-2">
                              <Label>Question Type</Label>
                              <Select
                                value={question.type}
                                onValueChange={(value: Question["type"]) =>
                                  updateQuestion(question.id, { type: value })
                                }
                                disabled={isSaving}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="single-choice">
                                    Single Choice
                                  </SelectItem>
                                  <SelectItem value="true-false">
                                    True/False
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Question</Label>
                              <Textarea
                                value={question.question}
                                onChange={(e) =>
                                  updateQuestion(question.id, {
                                    question: e.target.value,
                                  })
                                }
                                placeholder="Enter your question here"
                                rows={3}
                                disabled={isSaving}
                              />
                            </div>
                            {question.type === "single-choice" && (
                              <div className="space-y-3">
                                <Label>Answer Options</Label>
                                <RadioGroup
                                  value={question.correctAnswer.toString()}
                                  onValueChange={(value) =>
                                    updateQuestion(question.id, {
                                      correctAnswer: Number.parseInt(value),
                                    })
                                  }
                                  disabled={isSaving}
                                >
                                  {question.options?.map((option, optIndex) => (
                                    <div
                                      key={optIndex}
                                      className="flex items-center space-x-2"
                                    >
                                      <RadioGroupItem
                                        value={optIndex.toString()}
                                        id={`q${question.id}-option-${optIndex}`}
                                      />
                                      <Input
                                        value={option}
                                        onChange={(e) => {
                                          const newOptions = [
                                            ...(question.options || []),
                                          ];
                                          newOptions[optIndex] = e.target.value;
                                          updateQuestion(question.id, {
                                            options: newOptions,
                                          });
                                        }}
                                        placeholder={`Option ${optIndex + 1}`}
                                        className="flex-1"
                                        disabled={isSaving}
                                      />
                                      {optIndex === question.correctAnswer && (
                                        <Badge variant="default" className="text-xs">
                                          Correct
                                        </Badge>
                                      )}
                                    </div>
                                  ))}
                                </RadioGroup>
                              </div>
                            )}
                            {question.type === "true-false" && (
                              <div className="space-y-2">
                                <div
                                  className={`p-2 border rounded ${question.correctAnswer === true
                                    ? "border-green-500 bg-green-50"
                                    : "border-gray-200"
                                    }`}
                                >
                                  <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 border border-gray-300 rounded-full" />
                                    <span className="text-sm">True</span>
                                    {question.correctAnswer === true && (
                                      <Badge
                                        variant="default"
                                        className="text-xs ml-auto"
                                      >
                                        Correct Answer
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div
                                  className={`p-2 border rounded ${question.correctAnswer === false
                                    ? "border-green-500 bg-green-50"
                                    : "border-gray-200"
                                    }`}
                                >
                                  <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 border border-gray-300 rounded-full" />
                                    <span className="text-sm">False</span>
                                    {question.correctAnswer === false && (
                                      <Badge
                                        variant="default"
                                        className="text-xs ml-auto"
                                      >
                                        Correct Answer
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Points</Label>
                                <Input
                                  type="number"
                                  value={question.points}
                                  onChange={(e) => {
                                    const newPoints =
                                      Number.parseInt(e.target.value) || 0;
                                    const oldPoints = question.points;
                                    updateQuestion(question.id, {
                                      points: newPoints,
                                    });
                                    setCurrentTest((prev) => ({
                                      ...prev,
                                      totalPoints: prev.totalPoints - oldPoints + newPoints,
                                    }));
                                  }}
                                  min={1}
                                  max={50}
                                  disabled={isSaving}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Difficulty</Label>
                                <Select
                                  value={question.difficulty || "Medium"}
                                  onValueChange={(value: "Easy" | "Medium" | "Hard") =>
                                    updateQuestion(question.id, { difficulty: value })
                                  }
                                  disabled={isSaving}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Easy">Easy</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="Hard">Hard</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Explanation (Optional)</Label>
                              <Textarea
                                value={question.explanation || ""}
                                onChange={(e) =>
                                  updateQuestion(question.id, {
                                    explanation: e.target.value,
                                  })
                                }
                                placeholder="Explain the correct answer"
                                rows={2}
                                disabled={isSaving}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsEditTestOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={saveTest} disabled={isSaving}>
              {isSaving ? (
                <Spinner size="sm" className="mr-2 text-white" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ----------------------------- Preview Modal ----------------------------- */}
      <Dialog open={isPreviewTestOpen} onOpenChange={setIsPreviewTestOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview Test: {selectedTestForPreview?.title}</DialogTitle>
            <DialogDescription>
              Preview how students will see this test
            </DialogDescription>
          </DialogHeader>
          {selectedTestForPreview && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">
                        {selectedTestForPreview.title}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {selectedTestForPreview.instructions}
                      </CardDescription>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div className="flex items-center gap-1 mb-1">
                        <Clock className="h-3 w-3" />
                        {selectedTestForPreview.duration} minutes
                      </div>
                      <div>{selectedTestForPreview.totalPoints} points total</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {selectedTestForPreview.difficulty}
                    </Badge>
                    <Badge variant="outline">{selectedTestForPreview.category}</Badge>
                    <Badge
                      variant={
                        selectedTestForPreview.isPublished ? "default" : "secondary"
                      }
                    >
                      {selectedTestForPreview.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Questions ({selectedTestForPreview.questions.length})
                </h3>
                {selectedTestForPreview.questions.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8 text-muted-foreground">
                      <TestTube className="mx-auto h-12 w-12 mb-4 opacity-50" />
                      <p>No questions added to this test yet</p>
                    </CardContent>
                  </Card>
                ) : (
                  selectedTestForPreview.questions.map((question, index) => (
                    <Card key={question.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-base">
                            Question {index + 1} ({question.points} points)
                          </CardTitle>
                          <Badge variant="outline" className="text-xs">
                            {question.type.replace("-", " ")}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm">{question.question}</p>
                        {question.type === "single-choice" && question.options && (
                          <div className="space-y-2">
                            {question.options.map((option, optIndex) => (
                              <div
                                key={optIndex}
                                className={`p-2 border rounded ${optIndex === question.correctAnswer
                                  ? "border-green-500 bg-green-50"
                                  : "border-gray-200"
                                  }`}
                              >
                                <div className="flex items-center space-x-2">
                                  <div className="w-4 h-4 border border-gray-300 rounded-full" />
                                  <span className="text-sm">{option}</span>
                                  {optIndex === question.correctAnswer && (
                                    <Badge variant="default" className="text-xs ml-auto">
                                      Correct Answer
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {question.type === "true-false" && (
                          <div className="space-y-2">
                            <div
                              className={`p-2 border rounded ${question.correctAnswer === true
                                ? "border-green-500 bg-green-50"
                                : "border-gray-200"
                                }`}
                            >
                              <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 border border-gray-300 rounded-full" />
                                <span className="text-sm">True</span>
                                {question.correctAnswer === true && (
                                  <Badge variant="default" className="text-xs ml-auto">
                                    Correct Answer
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div
                              className={`p-2 border rounded ${question.correctAnswer === false
                                ? "border-green-500 bg-green-50"
                                : "border-gray-200"
                                }`}
                            >
                              <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 border border-gray-300 rounded-full" />
                                <span className="text-sm">False</span>
                                {question.correctAnswer === false && (
                                  <Badge variant="default" className="text-xs ml-auto">
                                    Correct Answer
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                        {question.explanation && (
                          <div className="mt-4">
                            <Label className="text-sm font-semibold">Explanation</Label>
                            <p className="text-sm text-muted-foreground">
                              {question.explanation}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ---------------------------- Analytics Modal ---------------------------- */}
      <Dialog
        open={isAnalyticsDetailOpen}
        onOpenChange={setIsAnalyticsDetailOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Analytics for {selectedTestForAnalytics?.title}
            </DialogTitle>
            <DialogDescription>
              Performance summary for this test
            </DialogDescription>
          </DialogHeader>
          {analyticsSummary ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analyticsSummary.totalAttempts}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analyticsSummary.averageScore}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analyticsSummary.passRate}%
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Average Completion Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analyticsSummary.averageCompletionTime} mins
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <p>No analytics data available for this test.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

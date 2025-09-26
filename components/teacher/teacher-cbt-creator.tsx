"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
interface Question {
  id: string;
  type: "multiple-choice" | "true-false" | "short-answer" | "essay";
  question: string;
  options?: string[];
  correctAnswer: string | number | boolean; // Update to include boolean
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

interface CBTTest {
  id: string;
  title: string;
  description: string; // Keep for backward compatibility if needed
  instructions: string; // Add this
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
  start_at?: string;
  end_at?: string;
  total_marks?: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export function TeacherCBTCreator() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("create");
  const [currentTest, setCurrentTest] = useState<CBTTest>({
    id: "",
    title: "",
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
    start_at: "", // Explicit default
    end_at: "", // Explicit default
    total_marks: 0, // Explicit default
  });
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
  const [loadingTests, setLoadingTests] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPublished, setFilterPublished] = useState<
    "all" | "published" | "draft"
  >("all");
  const [isSaving, setIsSaving] = useState(false);

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
    fetchCourses();
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
    setTests(data.tests || []);
    setPagination(data.pagination || { page: 1, limit: 3, total: 0, pages: 1 });
    setLoadingTests(false);
  }, [pagination.page, pagination.limit, searchQuery, filterPublished, router]);

  const fetchTestById = async (testId: string) => {
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
    console.log("[fetchTestById] Response data:", data); // Debug log
    return {
      id: data.test.id || "",
      title: data.test.title || "",
      instructions: data.test.instructions || "", // Explicitly map instructions
      duration: data.test.duration || 30,
      totalPoints: data.test.totalPoints || 0,
      questions:
        data.test.questions?.map((q: any) => ({
          ...q,
          correctAnswer:
            q.type === "multiple-choice"
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
      start_at: data.test.start_at || "", // Explicitly map start_at
      end_at: data.test.end_at || "", // Explicitly map end_at
      total_marks: Number(data.test.total_marks) || 0, // Explicitly map total_marks
    };
  };

  useEffect(() => {
    if (activeTab === "manage" || activeTab === "analytics") {
      fetchTests();
    }
  }, [activeTab, fetchTests]);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type: "multiple-choice",
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0, // Default for multiple-choice
      points: 5,
      difficulty: "Medium",
    };
    setCurrentTest((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
      totalPoints: prev.totalPoints + 5,
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
        // Set default correctAnswer based on type if changed
        if (updates.type && updates.type !== q.type) {
          updatedQuestion.correctAnswer =
            updates.type === "multiple-choice"
              ? 0
              : updates.type === "true-false"
              ? false // Changed from "true" to boolean false
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
            updates.type === "multiple-choice"
              ? 0
              : updates.type === "true-false"
              ? false // Changed from "true" to boolean false
              : "";
        }
        return updatedQuestion;
      });
    }
  };

  const saveTest = async () => {
    setIsSaving(true);
    try {
      const isEditing = !!currentTest.id;
      const endpoint = isEditing
        ? `/api/teacher/assessments/tests/${currentTest.id}/update`
        : "/api/teacher/assessments/tests/create";
      const method = isEditing ? "PUT" : "POST";
      const body = isEditing
        ? {
            title: currentTest.title,
            instructions: currentTest.instructions, // Changed from description
            duration: currentTest.duration,
            difficulty: currentTest.difficulty,
            start_at: currentTest.start_at,
            end_at: currentTest.end_at,
            total_marks: currentTest.total_marks,
          }
        : {
            title: currentTest.title,
            instructions: currentTest.instructions, // Changed from description
            duration: currentTest.duration,
            difficulty: currentTest.difficulty,
            course_id: parseInt(currentTest.courseId || "0"),
            category: currentTest.category || "General",
            start_at: currentTest.start_at,
            end_at: currentTest.end_at,
            total_marks: currentTest.total_marks,
          };

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
        console.log(
          `[saveTest] Sending ${questionMethod} request for question ${question.id} to ${questionEndpoint}`
        );
        const questionResponse = await fetch(questionEndpoint, {
          method: questionMethod,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: question.type,
            question: question.question,
            options: question.options || [],
            correctAnswer:
              question.type === "multiple-choice"
                ? Number(question.correctAnswer) || 0
                : question.type === "true-false"
                ? question.correctAnswer === "true" ||
                  question.correctAnswer === true
                : question.correctAnswer?.toString() || "", // Handle short-answer/essay
            points: question.points,
            explanation: question.explanation || "",
            difficulty: question.difficulty || "Medium",
          }),
        });
        if (!questionResponse.ok) {
          const questionData = await questionResponse.json();
          console.error(
            `[saveTest] Failed to ${
              questionMethod === "POST" ? "create" : "update"
            } question ${question.id}:`,
            questionData.error,
            { status: questionResponse.status, response: questionData }
          );
        } else {
          const questionData = await questionResponse.json();
          console.log(
            `[saveTest] Question ${
              questionMethod === "POST" ? "created" : "updated"
            } successfully:`,
            questionData
          );
          updatedQuestions[i] = {
            ...question,
            id: questionData.question.id,
            correctAnswer: questionData.question.correctAnswer,
          };
        }
      }

      setCurrentTest((prev) => ({
        ...prev,
        id: updatedTestId,
        title: data.test.title || prev.title,
        instructions: data.test.instructions || prev.instructions || "", // Ensure instructions update
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
        start_at: data.test.start_at || prev.start_at || "", // Ensure start_at update
        end_at: data.test.end_at || prev.end_at || "", // Ensure end_at update
        total_marks: Number(data.test.total_marks) || prev.total_marks || 0, // Ensure total_marks update
      }));
      alert(data.message); // Use backend message

      alert(`Test ${isEditing ? "updated" : "created"} successfully!`);
      if (isEditing) setIsEditTestOpen(false);
    } catch (error) {
      console.error(
        `Error ${currentTest.id ? "updating" : "creating"} test:`,
        error
      );
      alert(
        `Failed to ${currentTest.id ? "update" : "create"} test: ${
          error.message
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
      const response = await fetch(
        `/api/teacher/assessments/tests/test/${testId}/publish`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isPublished }), // Changed from `published`
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
      setCurrentTest((prev) => ({
        ...prev,
        isPublished: data.test.isPublished,
        title: data.test.title || prev.title,
        instructions: data.test.instructions || prev.instructions || "", // Ensure instructions update
        duration: data.test.duration || prev.duration,
        totalPoints: data.test.totalPoints || prev.totalPoints,
        difficulty: data.test.difficulty || prev.difficulty,
        category: data.test.category || prev.category || "General",
        courseId: data.test.course_id?.toString() || prev.courseId || "",
        questionsCount: data.test.questionsCount || prev.questionsCount,
        createdAt: data.test.createdAt || prev.createdAt,
        updatedAt: data.test.updatedAt || prev.updatedAt,
        start_at: data.test.start_at || prev.start_at || "", // Ensure start_at update
        end_at: data.test.end_at || prev.end_at || "", // Ensure end_at update
        total_marks: Number(data.test.total_marks) || prev.total_marks || 0, // Ensure total_marks update
      }));
      setTests((prev) =>
        prev.map((test) =>
          test.id === testId
            ? {
                ...test,
                isPublished: data.test.isPublished,
                instructions: data.test.instructions || test.instructions || "", // Update instructions
                start_at: data.test.start_at || test.start_at || "", // Update start_at
                end_at: data.test.end_at || test.end_at || "", // Update end_at
                total_marks:
                  Number(data.test.total_marks) || test.total_marks || 0, // Update total_marks
              }
            : test
        )
      );
      alert(data.message);
    } catch (error) {
      console.error(
        `Error ${isPublished ? "publishing" : "unpublishing"} test:`,
        error
      );
      alert(
        `Failed to ${isPublished ? "publish" : "unpublish"} test: ${
          (error as Error).message
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
      // Optionally redirect to the new test or update UI
      router.push(`/teacher/create-cbt`);
    } catch (error) {
      console.error("Error duplicating test:", error);
      alert(`Failed to duplicate test: ${error.message}`);
    }
  };

  const deleteQuestion = async (testId: string, questionId: string) => {
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
                  (currentTest.questions.find((q) => q.id === questionId)
                    ?.points || 0),
              }
            : test
        )
      );
      alert(data.message); // Use backend message
    } catch (error) {
      console.error("Error deleting question:", error);
      alert(`Failed to delete question: ${(error as Error).message}`);
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
      alert(data.message); // Use backend message
      router.push("/teacher/create-cbt");
    } catch (error) {
      console.error("Error deleting test:", error);
      alert(`Failed to delete test: ${(error as Error).message}`);
    }
  };

  const handleViewAnalyticsDetails = (test: CBTTest) => {
    setSelectedTestForAnalytics(test);
    setIsAnalyticsDetailOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

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
            className="bg-transparent w-full sm:w-32 justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3"
            disabled={isSaving}
          >
            Create New Test
          </TabsTrigger>
          <TabsTrigger
            value="manage"
            className="bg-transparent w-full sm:w-32 justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3"
            disabled={isSaving}
          >
            Manage Tests
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="bg-transparent w-full sm:w-32 justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3"
            disabled={isSaving}
          >
            Test Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Test Configuration */}
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_at">Start Date & Time</Label>
                    <Input
                      id="start_at"
                      type="datetime-local"
                      value={
                        currentTest.start_at
                          ? new Date(currentTest.start_at)
                              .toISOString()
                              .slice(0, 16)
                          : ""
                      }
                      onChange={(e) =>
                        setCurrentTest((prev) => ({
                          ...prev,
                          start_at: e.target.value
                            ? new Date(e.target.value).toISOString()
                            : "",
                        }))
                      }
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_at">End Date & Time</Label>
                    <Input
                      id="end_at"
                      type="datetime-local"
                      value={
                        currentTest.end_at
                          ? new Date(currentTest.end_at)
                              .toISOString()
                              .slice(0, 16)
                          : ""
                      }
                      onChange={(e) =>
                        setCurrentTest((prev) => ({
                          ...prev,
                          end_at: e.target.value
                            ? new Date(e.target.value).toISOString()
                            : "",
                        }))
                      }
                      disabled={isSaving}
                    />
                  </div>
                </div>
                <div className="space-y-2">
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
                    min="1"
                    placeholder="Enter total marks"
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Course</Label>
                  <Select
                    value={currentTest.courseId}
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
                        <SelectItem
                          key={course.id}
                          value={course.id.toString()}
                        >
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
                    disabled={isSaving}
                  >
                    <TestTube className="mr-2 h-4 w-4" />
                    Publish Test
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Questions List */}
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
                      className={`p-3 border-none rounded-lg cursor-pointer transition-colors shadow-md ${
                        editingQuestion?.id === question.id
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

            {/* Question Editor */}
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
                          <SelectItem value="multiple-choice">
                            Multiple Choice
                          </SelectItem>
                          <SelectItem value="true-false">True/False</SelectItem>
                          {/* <SelectItem value="short-answer">
                            Short Answer
                          </SelectItem>
                          <SelectItem value="essay">Essay</SelectItem> */}
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

                    {editingQuestion.type === "multiple-choice" && (
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
                              correctAnswer: value,
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
                        min="1"
                        max="50"
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
              onClick={() => setActiveTab("create")}
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
                <Card
                  key={test.id}
                  className="hover:shadow-lg transition-shadow"
                >
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
                          <DropdownMenuItem
                            onClick={() => handleEditTest(test)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => duplicateTest(test.id)}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handlePreviewTest(test)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Preview
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
                onClick={() =>
                  handlePageChange(Math.max(pagination.page - 1, 1))
                }
                className={
                  pagination.page === 1 ? "pointer-events-none opacity-50" : ""
                }
                disabled={isSaving}
              />
              {Array.from(
                { length: pagination.pages },
                (_, index) => index + 1
              ).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    isActive={pagination.page === page}
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(page);
                    }}
                    disabled={isSaving}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              {pagination.pages > 5 && <PaginationEllipsis />}
              <PaginationNext
                onClick={() =>
                  handlePageChange(
                    Math.min(pagination.page + 1, pagination.pages)
                  )
                }
                className={
                  pagination.page === pagination.pages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
                disabled={isSaving}
              />
            </PaginationContent>
          </Pagination>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Test Analytics</h2>
            <p className="text-muted-foreground">
              Monitor test performance and student results
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Attempts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,247</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">78%</div>
                <p className="text-xs text-muted-foreground">
                  +3% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">85%</div>
                <p className="text-xs text-muted-foreground">
                  +5% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Completion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">92%</div>
                <p className="text-xs text-muted-foreground">
                  +1% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Test Performance Overview</CardTitle>
              <CardDescription>
                Detailed analytics for your tests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingTests ? (
                <div className="relative min-h-[200px] flex items-center justify-center bg-gray-100/50 rounded-lg">
                  <Spinner size="md" className="text-[#f79771]" />
                </div>
              ) : (
                <div className="space-y-4">
                  {tests.map((test) => (
                    <div
                      key={test.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <h4 className="font-medium">{test.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {Math.floor(Math.random() * 500) + 100} attempts
                          </div>
                          <div>Avg: {Math.floor(Math.random() * 30) + 70}%</div>
                          <div>
                            Pass: {Math.floor(Math.random() * 20) + 80}%
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewAnalyticsDetails(test)}
                        disabled={isSaving}
                      >
                        <Eye className="mr-2 h-3 w-3" />
                        View Details
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Test Modal */}
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
              {/* Test Configuration */}
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start_at">Start Date & Time</Label>
                      <Input
                        id="start_at"
                        type="datetime-local"
                        value={
                          currentTest.start_at
                            ? new Date(currentTest.start_at)
                                .toISOString()
                                .slice(0, 16)
                            : ""
                        }
                        onChange={(e) =>
                          setCurrentTest((prev) => ({
                            ...prev,
                            start_at: e.target.value
                              ? new Date(e.target.value).toISOString()
                              : "",
                          }))
                        }
                        disabled={isSaving}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end_at">End Date & Time</Label>
                      <Input
                        id="end_at"
                        type="datetime-local"
                        value={
                          currentTest.end_at
                            ? new Date(currentTest.end_at)
                                .toISOString()
                                .slice(0, 16)
                            : ""
                        }
                        onChange={(e) =>
                          setCurrentTest((prev) => ({
                            ...prev,
                            end_at: e.target.value
                              ? new Date(e.target.value).toISOString()
                              : "",
                          }))
                        }
                        disabled={isSaving}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
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
                      min="1"
                      placeholder="Enter total marks"
                      disabled={isSaving}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Questions Management */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>
                      Questions ({currentTest.questions.length})
                    </CardTitle>
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
                        <Card
                          key={question.id}
                          className="border-l-4 border-l-primary/20"
                        >
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
                            {/* Question Type */}
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
                                  <SelectItem value="multiple-choice">
                                    Multiple Choice
                                  </SelectItem>
                                  <SelectItem value="true-false">
                                    True/False
                                  </SelectItem>
                                  {/* <SelectItem value="short-answer">
                                    Short Answer
                                  </SelectItem>
                                  <SelectItem value="essay">Essay</SelectItem> */}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Question Text */}
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

                            {/* Multiple Choice Options */}
                            {question.type === "multiple-choice" && (
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
                                        <Badge
                                          variant="default"
                                          className="text-xs"
                                        >
                                          Correct
                                        </Badge>
                                      )}
                                    </div>
                                  ))}
                                </RadioGroup>
                              </div>
                            )}

                            {/* True/False Options */}
                            {question.type === "true-false" && (
                              <div className="space-y-2">
                                <div
                                  className={`p-2 border rounded ${
                                    question.correctAnswer === true
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
                                  className={`p-2 border rounded ${
                                    question.correctAnswer === false
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

                            {/* Short Answer/Essay Sample Answer */}
                            {(question.type === "short-answer" ||
                              question.type === "essay") && (
                              <div className="space-y-2">
                                <Label>Sample Answer (Optional)</Label>
                                <Textarea
                                  value={
                                    question.correctAnswer
                                      ? question.correctAnswer.toString()
                                      : ""
                                  }
                                  onChange={(e) =>
                                    updateQuestion(question.id, {
                                      correctAnswer: e.target.value,
                                    })
                                  }
                                  placeholder={`Enter a sample ${
                                    question.type === "short-answer"
                                      ? "short answer"
                                      : "essay response"
                                  }`}
                                  rows={question.type === "essay" ? 4 : 2}
                                  disabled={isSaving}
                                />
                              </div>
                            )}

                            {/* Points and Explanation */}
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
                                      totalPoints:
                                        prev.totalPoints -
                                        oldPoints +
                                        newPoints,
                                    }));
                                  }}
                                  min="1"
                                  max="50"
                                  disabled={isSaving}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Difficulty</Label>
                                <Select
                                  value={question.difficulty || "Medium"}
                                  onValueChange={(
                                    value: "Easy" | "Medium" | "Hard"
                                  ) =>
                                    updateQuestion(question.id, {
                                      difficulty: value,
                                    })
                                  }
                                  disabled={isSaving}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Easy">Easy</SelectItem>
                                    <SelectItem value="Medium">
                                      Medium
                                    </SelectItem>
                                    <SelectItem value="Hard">Hard</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            {/* Explanation */}
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

      {/* Preview Test Modal */}
      <Dialog open={isPreviewTestOpen} onOpenChange={setIsPreviewTestOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Preview Test: {selectedTestForPreview?.title}
            </DialogTitle>
            <DialogDescription>
              Preview how students will see this test
            </DialogDescription>
          </DialogHeader>

          {selectedTestForPreview && (
            <div className="space-y-6">
              {/* Test Header */}
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
                      <div>
                        {selectedTestForPreview.totalPoints} points total
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {selectedTestForPreview.difficulty}
                    </Badge>
                    <Badge variant="outline">
                      {selectedTestForPreview.category}
                    </Badge>
                    <Badge
                      variant={
                        selectedTestForPreview.isPublished
                          ? "default"
                          : "secondary"
                      }
                    >
                      {selectedTestForPreview.isPublished
                        ? "Published"
                        : "Draft"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Questions Preview */}
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

                        {question.type === "multiple-choice" &&
                          question.options && (
                            <div className="space-y-2">
                              {question.options.map((option, optIndex) => (
                                <div
                                  key={optIndex}
                                  className={`p-2 border rounded ${
                                    optIndex === question.correctAnswer
                                      ? "border-green-500 bg-green-50"
                                      : "border-gray-200"
                                  }`}
                                >
                                  <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 border border-gray-300 rounded-full" />
                                    <span className="text-sm">{option}</span>
                                    {optIndex === question.correctAnswer && (
                                      <Badge
                                        variant="default"
                                        className="text-xs ml-auto"
                                      >
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
                              className={`p-2 border rounded ${
                                question.correctAnswer === "true"
                                  ? "border-green-500 bg-green-50"
                                  : "border-gray-200"
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 border border-gray-300 rounded-full" />
                                <span className="text-sm">True</span>
                                {question.correctAnswer === "true" && (
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
                              className={`p-2 border rounded ${
                                question.correctAnswer === "false"
                                  ? "border-green-500 bg-green-50"
                                  : "border-gray-200"
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 border border-gray-300 rounded-full" />
                                <span className="text-sm">False</span>
                                {question.correctAnswer === "false" && (
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

                        {(question.type === "short-answer" ||
                          question.type === "essay") && (
                          <div className="space-y-2">
                            <Label>Sample Answer (Optional)</Label>
                            <Textarea
                              value={
                                question.correctAnswer
                                  ? question.correctAnswer.toString()
                                  : ""
                              }
                              onChange={(e) =>
                                updateQuestion(question.id, {
                                  correctAnswer: e.target.value,
                                })
                              }
                              placeholder={`Enter a sample ${
                                question.type === "short-answer"
                                  ? "short answer"
                                  : "essay response"
                              }`}
                              rows={question.type === "essay" ? 4 : 2}
                              disabled={isSaving}
                            />
                          </div>
                        )}

                        {question.explanation && (
                          <div className="p-2 border border-blue-500 bg-blue-50 rounded">
                            <Label className="text-xs font-medium text-blue-700">
                              Explanation:
                            </Label>
                            <p className="text-sm mt-1">
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

      {/* Analytics Detail Modal */}
      <Dialog
        open={isAnalyticsDetailOpen}
        onOpenChange={setIsAnalyticsDetailOpen}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Test Analytics: {selectedTestForAnalytics?.title}
            </DialogTitle>
            <DialogDescription>
              Detailed performance analytics for this test
            </DialogDescription>
          </DialogHeader>

          {selectedTestForAnalytics && (
            <div className="space-y-6">
              {/* Overview Stats */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Attempts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.floor(Math.random() * 500) + 100}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      +{Math.floor(Math.random() * 20) + 5}% from last week
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Average Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.floor(Math.random() * 30) + 70}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      +{Math.floor(Math.random() * 10) + 1}% from last week
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Pass Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.floor(Math.random() * 20) + 80}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      +{Math.floor(Math.random() * 5) + 1}% from last week
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Avg. Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.floor(Math.random() * 20) + 25}m
                    </div>
                    <p className="text-xs text-muted-foreground">
                      -{Math.floor(Math.random() * 3) + 1}m from last week
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Score Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Score Distribution</CardTitle>
                  <CardDescription>
                    How students performed on this test
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      {
                        range: "90-100%",
                        count: Math.floor(Math.random() * 50) + 20,
                        color: "bg-green-500",
                      },
                      {
                        range: "80-89%",
                        count: Math.floor(Math.random() * 40) + 30,
                        color: "bg-blue-500",
                      },
                      {
                        range: "70-79%",
                        count: Math.floor(Math.random() * 30) + 25,
                        color: "bg-yellow-500",
                      },
                      {
                        range: "60-69%",
                        count: Math.floor(Math.random() * 20) + 15,
                        color: "bg-orange-500",
                      },
                      {
                        range: "Below 60%",
                        count: Math.floor(Math.random() * 15) + 5,
                        color: "bg-red-500",
                      },
                    ].map((item) => (
                      <div key={item.range} className="flex items-center gap-3">
                        <div className="w-20 text-sm font-medium">
                          {item.range}
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                          <div
                            className={`${item.color} h-6 rounded-full flex items-center justify-end pr-2`}
                            style={{ width: `${(item.count / 100) * 100}%` }}
                          >
                            <span className="text-white text-xs font-medium">
                              {item.count}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Question Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Question Analysis</CardTitle>
                  <CardDescription>
                    Performance breakdown by question
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedTestForAnalytics.questions
                      .slice(0, 5)
                      .map((question, index) => (
                        <div
                          key={question.id}
                          className="flex items-center justify-between p-3 border rounded"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              Question {index + 1}
                            </div>
                            <div className="text-xs text-muted-foreground line-clamp-1">
                              {question.question || "Untitled question"}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="text-center">
                              <div className="font-medium">
                                {Math.floor(Math.random() * 30) + 70}%
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Correct
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium">
                                {Math.floor(Math.random() * 10) + 15}s
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Avg Time
                              </div>
                            </div>
                            <Badge
                              variant={
                                Math.random() > 0.7
                                  ? "destructive"
                                  : Math.random() > 0.4
                                  ? "secondary"
                                  : "default"
                              }
                            >
                              {Math.random() > 0.7
                                ? "Hard"
                                : Math.random() > 0.4
                                ? "Medium"
                                : "Easy"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Attempts */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Attempts</CardTitle>
                  <CardDescription>Latest test submissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium">
                              {String.fromCharCode(
                                65 + Math.floor(Math.random() * 26)
                              )}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-sm">
                              Student {Math.floor(Math.random() * 1000) + 1}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {Math.floor(Math.random() * 24) + 1} hours ago
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-medium text-sm">
                              {Math.floor(Math.random() * 40) + 60}%
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {Math.floor(Math.random() * 20) + 20}m
                            </div>
                          </div>
                          <Badge
                            variant={
                              Math.random() > 0.3 ? "default" : "secondary"
                            }
                          >
                            {Math.random() > 0.3 ? "Passed" : "Failed"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Video,
  Headphones,
  FileText,
  BookOpen,
  Edit,
  Trash2,
  Eye,
  Users,
  Clock,
  Star,
  Save,
  Upload,
  Search,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { getSession } from "next-auth/react";
import { PreviewModal } from "@/components/ui/teacher-preview-modal"; // Adjust path based on your project structure
import { Spinner } from "../ui/spinner";

// Interfaces
interface Course {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

interface Lesson {
  id: string;
  title: string;
  type: "video" | "audio" | "text" | "quiz";
  duration: string;
  videoUrl?: string;
  audioUrl?: string;
  content?: string;
  file?: File | null;
  order?: number;
  active?: boolean;
  meta?: { description: string; tags: string[] };
}

interface Module {
  id: string;
  title: string;
  description: string;
  type: "video" | "audio" | "document" | "tutorial";
  duration: number; // Store duration as minutes internally
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  category?: string;
  enrollments: number;
  rating: number;
  isPublished: boolean;
  createdDate: string;
  lessons: Lesson[];
  lessonCount: number;
  order: number;
  active: boolean;
  course: { id?: string; name: string };
}

interface APIModule {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  category: { id: string; name: string };
  estimatedDuration: number;
  order: number;
  active: boolean;
  isPublished: boolean;
  course: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
  lessons: Lesson[];
  lessonCount: number;
}

interface APIError {
  error: string;
  redirect?: string;
}

const BASE_URL = "/api/teacher";
const API_KEY = "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

const headers = (sessionToken: string | null) => ({
  Authorization: `Api-Key ${API_KEY}`,
  "Content-Type": "application/json",
  ...(sessionToken && { "X-Session-Token": sessionToken }),
});

// Utilities
const durationToMinutes = (duration: string): number => {
  if (!duration) return 0;
  const parts = duration.match(/(\d+)h\s*(\d+)m/);
  if (!parts) return parseInt(duration) || 0;
  const hours = parseInt(parts[1]) || 0;
  const minutes = parseInt(parts[2]) || 0;
  return hours * 60 + minutes;
};

const minutesToDuration = (minutes: number): string => {
  if (!minutes) return "0m";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
};

export function TeacherLearningModules() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState("create");
  const [previewModule, setPreviewModule] = useState<Module | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [currentModule, setCurrentModule] = useState<Module>({
    id: "",
    title: "",
    description: "",
    type: "video",
    duration: "",
    difficulty: "Beginner",
    category: undefined,
    enrollments: 0,
    rating: 0,
    isPublished: false,
    createdDate: new Date().toISOString().split("T")[0],
    lessons: [],
    lessonCount: 0,
    order: 1,
    active: true,
    course: { id: undefined, name: "" },
  });
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [currentPageManage, setCurrentPageManage] = useState(1);
  const [currentPageAnalytics, setCurrentPageAnalytics] = useState(1);
  const [modules, setModules] = useState<Module[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingModules, setIsLoadingModules] = useState(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingLesson, setIsSavingLesson] = useState(false);
  const [difficultyFilter, setDifficultyFilter] = useState("Beginner");
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const modulesPerPage = 3;

  // Fetch session token
  useEffect(() => {
    const fetchToken = async () => {
      const session = await getSession();
      setSessionToken(session?.user?.sessionToken || null);
    };
    fetchToken();
  }, []);

  // Fetch courses and categories
  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoadingCourses(true);
      setError(null);
      try {
        const response = await fetch("/api/teacher/courses", {
          method: "GET",
          headers: headers(sessionToken),
        });
        if (!response.ok) {
          const errorData: APIError = await response.json();
          if (response.status === 401 && errorData.redirect) {
            window.location.href = errorData.redirect;
            return;
          }
          throw new Error(errorData.error || "Failed to fetch courses");
        }
        const data: Course[] = await response.json();
        setCourses(data);
      } catch (err) {
        setError(
          (err as Error).message || "An error occurred while fetching courses"
        );
      } finally {
        setIsLoadingCourses(false);
      }
    };

    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      setError(null);
      try {
        const response = await fetch("/api/teacher/module-categories", {
          method: "GET",
          headers: headers(sessionToken),
        });
        if (!response.ok) {
          const errorData: APIError = await response.json();
          if (response.status === 401 && errorData.redirect) {
            window.location.href = errorData.redirect;
            return;
          }
          throw new Error(errorData.error || "Failed to fetch categories");
        }
        const data: Category[] = await response.json();
        setCategories(data);
      } catch (err) {
        setError(
          (err as Error).message ||
            "An error occurred while fetching categories"
        );
      } finally {
        setIsLoadingCategories(false);
      }
    };

    if (sessionToken) {
      fetchCourses();
      fetchCategories();
    }
  }, [sessionToken]);

  // Fetch modules
  useEffect(() => {
    if ((activeTab === "manage" || activeTab === "analytics") && sessionToken) {
      const fetchModules = async () => {
        setIsLoadingModules(true);
        setError(null);
        try {
          const query = new URLSearchParams();
          if (search) query.set("search", search);
          if (difficultyFilter)
            query.set("difficulty", difficultyFilter.toLowerCase());
          query.set("active", "true");
          const response = await fetch(
            `${BASE_URL}/modules/?${query.toString()}`,
            {
              method: "GET",
              headers: headers(sessionToken),
            }
          );
          if (!response.ok) {
            const errorData: APIError = await response.json();
            if (response.status === 401 && errorData.redirect) {
              window.location.href = errorData.redirect;
              return;
            }
            throw new Error(errorData.error || "Failed to fetch modules");
          }
          const data: APIModule[] = await response.json();
          const sanitizedModules: Module[] = data.map((module) => ({
            id: module.id,
            title: module.title,
            description: module.description,
            type: module.type || "video",
            duration: minutesToDuration(module.estimatedDuration),
            difficulty:
              module.difficulty.charAt(0).toUpperCase() +
              module.difficulty.slice(1),
            category: module.category?.name || "Uncategorized",
            enrollments: module.enrollments || 0,
            rating: module.rating || 0,
            isPublished: module.isPublished,
            createdDate: formatDate(module.createdAt),
            course: {
              id: module.course?.id || "",
              name: module.course?.name || "",
            },
            lessons: module.lessons || [],
            lessonCount: module.lessonCount || 0,
            order: module.order,
            active: module.active,
          }));
          setModules(sanitizedModules);
        } catch (err) {
          setError(
            (err as Error).message || "An error occurred while fetching modules"
          );
        } finally {
          setIsLoadingModules(false);
        }
      };
      fetchModules();
    }
  }, [activeTab, search, difficultyFilter, sessionToken]);

  // Fetch module details
  const getModuleDetails = async (moduleId: string): Promise<Module | null> => {
    try {
      const response = await fetch(`${BASE_URL}/modules/${moduleId}`, {
        method: "GET",
        headers: headers(sessionToken),
      });
      if (!response.ok) {
        const errorData: APIError = await response.json();
        throw new Error(errorData.error || "Failed to fetch module details");
      }
      const module: APIModule = await response.json();
      return {
        id: module.id,
        title: module.title,
        description: module.description,
        type: module.type || "video",
        duration: minutesToDuration(module.estimatedDuration),
        difficulty:
          module.difficulty.charAt(0).toUpperCase() +
          module.difficulty.slice(1),
        category: module.category?.name || undefined,
        enrollments: module.enrollments || 0,
        rating: module.rating || 0,
        isPublished: module.isPublished,
        createdDate: formatDate(module.createdAt),
        course: {
          id: module.course?.id || "",
          name: module.course?.name || "",
        },
        lessons: module.lessons || [],
        lessonCount: module.lessonCount || 0,
        order: module.order,
        active: module.active,
      };
    } catch (err) {
      setError(
        (err as Error).message ||
          "An error occurred while fetching module details"
      );
      return null;
    }
  };

  // Pagination
  const getPaginatedModules = (modules: Module[], currentPage: number) => {
    const totalPages = Math.ceil(modules.length / modulesPerPage);
    const indexOfLastModule = currentPage * modulesPerPage;
    const indexOfFirstModule = indexOfLastModule - modulesPerPage;
    return {
      paginatedModules: modules.slice(indexOfFirstModule, indexOfLastModule),
      totalPages,
      totalCount: modules.length,
    };
  };

  const addLesson = () => {
    const newLesson: Lesson = {
      id: `temp-${Date.now()}`,
      title: "",
      type: "video",
      duration: "",
      content: "",
      videoUrl: "",
      audioUrl: "",
    };
    setCurrentModule((prev) => ({
      ...prev,
      lessons: [...prev.lessons, newLesson],
      lessonCount: prev.lessonCount + 1,
    }));
    setEditingLesson(newLesson);
  };

  const updateLessonFields = (lessonId: string, updates: Partial<Lesson>) => {
    setCurrentModule((prev) => ({
      ...prev,
      lessons: prev.lessons.map((lesson) =>
        lesson.id === lessonId ? { ...lesson, ...updates } : lesson
      ),
    }));
    if (editingLesson?.id === lessonId) {
      setEditingLesson((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  const deleteLesson = async (lessonId: string) => {
    if (!sessionToken) {
      setError("No session token available. Please log in again.");
      return;
    }
    if (!currentModule.id) {
      setError("No module selected.");
      return;
    }
    try {
      const response = await fetch(
        `${BASE_URL}/modules/${currentModule.id}/lessons/${lessonId}/delete/`,
        {
          method: "DELETE",
          headers: headers(sessionToken),
        }
      );
      if (!response.ok) {
        const errorData: APIError = await response.json();
        if (response.status === 401 && errorData.redirect) {
          window.location.href = errorData.redirect;
          return;
        }
        throw new Error(errorData.error || "Failed to delete lesson");
      }
      setCurrentModule((prev) => ({
        ...prev,
        lessons: prev.lessons.filter((lesson) => lesson.id !== lessonId),
        lessonCount: prev.lessonCount - 1,
      }));
      setModules((prev) =>
        prev.map((m) =>
          m.id === currentModule.id
            ? {
                ...m,
                lessons: m.lessons.filter((lesson) => lesson.id !== lessonId),
                lessonCount: m.lessonCount - 1,
              }
            : m
        )
      );
      if (editingLesson?.id === lessonId) {
        setEditingLesson(null);
      }
      alert("Lesson deleted successfully!");
    } catch (err) {
      setError(
        (err as Error).message || "An error occurred while deleting the lesson"
      );
    }
  };

  const publishModule = async (moduleId: string, active: boolean) => {
    if (!sessionToken) {
      setError("No session token available. Please log in again.");
      return;
    }
    try {
      const response = await fetch(`${BASE_URL}/modules/${moduleId}/publish/`, {
        method: "POST",
        headers: headers(sessionToken),
        body: JSON.stringify({ active }),
      });
      if (!response.ok) {
        const errorData: APIError = await response.json();
        if (response.status === 401 && errorData.redirect) {
          window.location.href = errorData.redirect;
          return;
        }
        throw new Error(
          errorData.error || "Failed to publish/unpublish module"
        );
      }
      setModules((prev) =>
        prev.map((m) => (m.id === moduleId ? { ...m, isPublished: active } : m))
      );
      if (currentModule.id === moduleId) {
        setCurrentModule((prev) => ({ ...prev, isPublished: active }));
      }
      alert(`Module ${active ? "published" : "unpublished"} successfully!`);
    } catch (err) {
      setError(
        (err as Error).message ||
          `An error occurred while ${
            active ? "publishing" : "unpublishing"
          } the module`
      );
    }
  };

  const deleteModule = async (moduleId: string) => {
    if (!sessionToken) {
      setError("No session token available. Please log in again.");
      return;
    }
    if (!confirm("Are you sure you want to delete this module?")) {
      return;
    }
    try {
      const response = await fetch(`${BASE_URL}/modules/${moduleId}/delete/`, {
        method: "DELETE",
        headers: headers(sessionToken),
      });
      if (!response.ok) {
        const errorData: APIError = await response.json();
        if (response.status === 401 && errorData.redirect) {
          window.location.href = errorData.redirect;
          return;
        }
        throw new Error(errorData.error || "Failed to delete module");
      }
      setModules((prev) => prev.filter((m) => m.id !== moduleId));
      if (currentModule.id === moduleId) {
        setCurrentModule({
          id: "",
          title: "",
          description: "",
          type: "video",
          duration: "",
          difficulty: "Beginner",
          category: undefined,
          enrollments: 0,
          rating: 0,
          isPublished: false,
          createdDate: new Date().toISOString().split("T")[0],
          order: 1,
          active: true,
          course: { id: undefined, name: "" },
          lessons: [],
          lessonCount: 0,
        });
        setEditingLesson(null);
      }
      alert("Module deleted successfully!");
    } catch (err) {
      setError(
        (err as Error).message || "An error occurred while deleting the module"
      );
    }
  };

  const getNextOrder = async (
    courseId: string,
    sessionToken: string | null
  ): Promise<number> => {
    if (!courseId || !sessionToken) return 1;
    try {
      const query = new URLSearchParams({ course_id: courseId });
      const response = await fetch(`${BASE_URL}/modules/?${query.toString()}`, {
        method: "GET",
        headers: headers(sessionToken),
      });
      if (!response.ok) return 1;
      const modules: APIModule[] = await response.json();
      const maxOrder = modules.length
        ? Math.max(...modules.map((m) => m.order || 0))
        : 0;
      return maxOrder + 1;
    } catch (err) {
      return 1;
    }
  };

  const saveModule = async () => {
    if (!sessionToken) {
      setError("No session token available. Please log in again.");
      return;
    }
    if (!currentModule.title) {
      setError("Module title is required.");
      return;
    }
    if (!currentModule.course.id) {
      setError("Please select a course.");
      return;
    }
    if (!currentModule.category) {
      setError("Please select a category.");
      return;
    }
    if (!currentModule.order || currentModule.order < 1) {
      setError("Please specify a valid order (1 or higher).");
      return;
    }
    try {
      const payload = {
        title: currentModule.title,
        description: currentModule.description,
        course_id: parseInt(currentModule.course.id),
        categoryId: categories.find((c) => c.name === currentModule.category)
          ?.id,
        difficulty: currentModule.difficulty.toLowerCase(),
        estimatedDuration: minutesToDuration(currentModule.duration), // Convert to string
        order: currentModule.order,
        active: currentModule.active,
      };
      const response = await fetch(`${BASE_URL}/modules/create/`, {
        method: "POST",
        headers: headers(sessionToken),
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData: APIError = await response.json();
        if (response.status === 401 && errorData.redirect) {
          window.location.href = errorData.redirect;
          return;
        }
        if (
          response.status === 400 &&
          errorData.error.includes("duplicate order")
        ) {
          setError(
            "The specified order already exists for this course. Please choose a different order."
          );
          return;
        }
        throw new Error(errorData.error || "Failed to create module");
      }
      const data: APIModule = await response.json();
      const newModule: Module = {
        id: data.id,
        title: data.title,
        description: data.description,
        type: currentModule.type,
        duration: durationToMinutes(data.estimatedDuration), // Convert back to number
        difficulty:
          data.difficulty.charAt(0).toUpperCase() + data.difficulty.slice(1),
        category: data.category?.name || "Uncategorized",
        enrollments: data.enrollments || 0,
        rating: data.rating || 0,
        isPublished: data.isPublished,
        createdDate: formatDate(data.createdAt),
        course: {
          id: data.course?.id || "",
          name: data.course?.name || "",
        },
        lessons: currentModule.lessons,
        lessonCount: data.lessonCount || currentModule.lessonCount,
        order: data.order,
        active: data.active,
      };
      setModules((prev) => [...prev, newModule]);
      alert(`Module saved successfully! ID: ${newModule.id}`);
      setCurrentModule({
        id: "",
        title: "",
        description: "",
        type: "video",
        duration: 0, // Initialize as number
        difficulty: "Beginner",
        category: undefined,
        enrollments: 0,
        rating: 0,
        isPublished: false,
        createdDate: new Date().toISOString().split("T")[0],
        order: 1,
        active: true,
        course: { id: undefined, name: "" },
        lessons: [],
        lessonCount: 0,
      });
      setEditingLesson(null);
    } catch (err) {
      setError(
        (err as Error).message || "An error occurred while saving the module"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const updateModule = async () => {
    if (!sessionToken) {
      setError("No session token available. Please log in again.");
      return;
    }
    if (!currentModule.id) {
      setError("No module ID provided for update.");
      return;
    }
    if (!currentModule.title) {
      setError("Module title is required.");
      return;
    }
    if (!currentModule.course.id) {
      setError("Please select a course.");
      return;
    }
    if (!currentModule.category) {
      setError("Please select a category.");
      return;
    }
    try {
      const payload = {
        title: currentModule.title,
        description: currentModule.description,
        difficulty: currentModule.difficulty.toLowerCase(),
        estimated_duration: minutesToDuration(currentModule.duration), // Convert to string
        order: currentModule.order,
      };
      const response = await fetch(
        `${BASE_URL}/modules/${currentModule.id}/update/`,
        {
          method: "PATCH",
          headers: headers(sessionToken),
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) {
        const errorData: APIError = await response.json();
        if (response.status === 401 && errorData.redirect) {
          window.location.href = errorData.redirect;
          return;
        }
        if (
          response.status === 400 &&
          errorData.error.includes("duplicate order")
        ) {
          setError(
            "The specified order already exists for this course. Please choose a different order."
          );
          return;
        }
        throw new Error(errorData.error || "Failed to update module");
      }
      const data: { module: APIModule } = await response.json();
      const updatedModule: Module = {
        id: data.module.id,
        title: data.module.title,
        description: data.module.description,
        type: currentModule.type,
        duration: durationToMinutes(data.module.estimatedDuration), // Convert back to number
        difficulty:
          data.module.difficulty.charAt(0).toUpperCase() +
          data.module.difficulty.slice(1),
        category: data.module.category?.name || "Uncategorized",
        enrollments: data.module.enrollments || currentModule.enrollments,
        rating: data.module.rating || currentModule.rating,
        isPublished: data.module.isPublished,
        createdDate: formatDate(data.module.createdAt),
        course: {
          id: data.module.course?.id || "",
          name: data.module.course?.name || "",
        },
        lessons: currentModule.lessons,
        lessonCount: data.module.lessonCount || currentModule.lessonCount,
        order: data.module.order || currentModule.order,
        active: data.module.active,
      };
      setModules((prev) =>
        prev.map((m) => (m.id === updatedModule.id ? updatedModule : m))
      );
      alert(`Module updated successfully! ID: ${updatedModule.id}`);
      setCurrentModule({
        id: "",
        title: "",
        description: "",
        type: "video",
        duration: 0, // Initialize as number
        difficulty: "Beginner",
        category: undefined,
        enrollments: 0,
        rating: 0,
        isPublished: false,
        createdDate: new Date().toISOString().split("T")[0],
        order: 1,
        active: true,
        course: { id: undefined, name: "" },
        lessons: [],
        lessonCount: 0,
      });
      setEditingLesson(null);
    } catch (err) {
      setError(
        (err as Error).message || "An error occurred while updating the module"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (file: File, type: "video" | "audio") => {
    if (!sessionToken) {
      setError("No session token available. Please log in again.");
      return null;
    }
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(`${BASE_URL}/upload/`, {
        method: "POST",
        headers: {
          "X-Session-Token": sessionToken,
        },
        body: formData,
      });
      if (!response.ok) {
        const errorData: APIError = await response.json();
        if (response.status === 401 && errorData.redirect) {
          window.location.href = errorData.redirect;
          return null;
        }
        throw new Error(errorData.error || "Failed to upload file");
      }
      const data = await response.json();
      return data.url;
    } catch (err) {
      setError(
        (err as Error).message || "An error occurred while uploading the file"
      );
      return null;
    }
  };

  const headers = (sessionToken: string) => ({
    Authorization: `Api-Key ${API_KEY}`,
    "X-Session-Token": sessionToken,
  });

  const saveLesson = async () => {
    if (!sessionToken) {
      setError("No session token available. Please log in again.");
      console.error("[saveLesson] No session token");
      return;
    }
    if (!currentModule.id) {
      setError("No module selected. Please save the module first.");
      console.error("[saveLesson] No module ID");
      return;
    }
    if (!editingLesson) {
      setError("No lesson selected for saving.");
      console.error("[saveLesson] No editing lesson");
      return;
    }
    if (!editingLesson.title) {
      setError("Lesson title is required.");
      console.error("[saveLesson] Missing lesson title");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", editingLesson.title);
      formData.append("content_type", editingLesson.type);
      formData.append(
        "duration_seconds",
        (durationToMinutes(editingLesson.duration) * 60).toString()
      );
      formData.append("order", (currentModule.lessons.length + 1).toString());
      formData.append(
        "meta",
        JSON.stringify({
          description: editingLesson.content || "",
          tags: editingLesson.title.toLowerCase().split(" ").filter(Boolean),
        })
      );
      formData.append("active", "true");

      if (
        editingLesson.file &&
        (editingLesson.type === "video" || editingLesson.type === "audio")
      ) {
        console.log("[saveLesson] File selected:", {
          name: editingLesson.file.name,
          type: editingLesson.file.type,
          size: editingLesson.file.size,
        });
        formData.append("file", editingLesson.file, editingLesson.file.name);
      } else if (
        editingLesson.type === "text" &&
        editingLesson.content &&
        !editingLesson.content.startsWith("http")
      ) {
        console.log(
          "[saveLesson] Text content provided:",
          editingLesson.content.slice(0, 200)
        );
        formData.append("content", editingLesson.content);
      } else if (
        (editingLesson.videoUrl || editingLesson.audioUrl) &&
        (editingLesson.videoUrl?.startsWith("http") ||
          editingLesson.audioUrl?.startsWith("http"))
      ) {
        const url = editingLesson.videoUrl || editingLesson.audioUrl || "";
        console.log("[saveLesson] External URL provided:", url);
        formData.append("url", url);
      } else {
        console.log("[saveLesson] No file or valid URL provided");
      }

      // Log FormData contents for debugging
      console.log("[saveLesson] FormData contents:");
      for (const [key, value] of formData.entries()) {
        console.log(
          `[saveLesson] ${key}:`,
          typeof value === "string" ? value : `[File: ${value.name}]`
        );
      }

      console.log(
        "[saveLesson] Sending POST to",
        `${BASE_URL}/modules/${currentModule.id}/lessons/`
      );
      const response = await fetch(
        `${BASE_URL}/modules/${currentModule.id}/lessons/`,
        {
          method: "POST",
          headers: headers(sessionToken),
          body: formData,
        }
      );

      console.log(`[saveLesson] Response status: ${response.status}`);
      const responseText = await response.text();
      console.log("[saveLesson] Raw response:", responseText.slice(0, 200));

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (e) {
          console.error(
            "[saveLesson] Failed to parse error response:",
            responseText.slice(0, 200)
          );
          throw new Error("Invalid response format from server");
        }
        console.error("[saveLesson] Fetch failed:", errorData);
        if (response.status === 401 && errorData.redirect) {
          window.location.href = errorData.redirect;
          return;
        }
        throw new Error(errorData.error || "Failed to create lesson");
      }

      const data: { lesson: Lesson } = JSON.parse(responseText);
      console.log("[saveLesson] Lesson created:", data);

      // Refresh module details to get updated lessons
      const moduleData = await getModuleDetails(currentModule.id);
      if (moduleData) {
        setCurrentModule(moduleData);
        setModules((prev) =>
          prev.map((m) => (m.id === currentModule.id ? moduleData : m))
        );
      }

      setEditingLesson(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset file input
      }
      alert(`Lesson created successfully! ID: ${data.lesson.id}`);
    } catch (err) {
      setError(
        (err as Error).message || "An error occurred while creating the lesson"
      );
      console.error("[saveLesson] Error:", err);
    }
  };

  const updateLesson = async (lessonId: string) => {
    if (!sessionToken) {
      setError("No session token available. Please log in again.");
      console.error("[updateLesson] No session token");
      return;
    }
    if (!currentModule.id) {
      setError("No module selected. Please save the module first.");
      console.error("[updateLesson] No module ID");
      return;
    }
    if (!editingLesson) {
      setError("No lesson selected for updating.");
      console.error("[updateLesson] No editing lesson");
      return;
    }
    if (!editingLesson.title) {
      setError("Lesson title is required.");
      console.error("[updateLesson] Missing lesson title");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", editingLesson.title);
      formData.append("content_type", editingLesson.type);
      formData.append(
        "duration_seconds",
        (durationToMinutes(editingLesson.duration) * 60).toString()
      );
      formData.append(
        "order",
        editingLesson.order?.toString() ||
          (currentModule.lessons.length + 1).toString()
      );
      formData.append(
        "meta",
        JSON.stringify({
          description: editingLesson.content || "",
          tags: editingLesson.title.toLowerCase().split(" ").filter(Boolean),
        })
      );
      formData.append("active", editingLesson.active ? "true" : "false");

      if (
        editingLesson.file &&
        (editingLesson.type === "video" || editingLesson.type === "audio")
      ) {
        console.log("[updateLesson] File selected:", {
          name: editingLesson.file.name,
          type: editingLesson.file.type,
          size: editingLesson.file.size,
        });
        formData.append("file", editingLesson.file, editingLesson.file.name);
      } else if (
        editingLesson.type === "text" &&
        editingLesson.content &&
        !editingLesson.content.startsWith("http")
      ) {
        console.log(
          "[updateLesson] Text content provided:",
          editingLesson.content.slice(0, 200)
        );
        formData.append("content", editingLesson.content);
      } else if (
        (editingLesson.videoUrl || editingLesson.audioUrl) &&
        (editingLesson.videoUrl?.startsWith("http") ||
          editingLesson.audioUrl?.startsWith("http"))
      ) {
        const url = editingLesson.videoUrl || editingLesson.audioUrl || "";
        console.log("[updateLesson] External URL provided:", url);
        formData.append("url", url);
      } else {
        console.log("[updateLesson] No file or valid URL provided");
      }

      // Log FormData contents for debugging
      console.log("[updateLesson] FormData contents:");
      for (const [key, value] of formData.entries()) {
        console.log(
          `[updateLesson] ${key}:`,
          typeof value === "string" ? value : `[File: ${value.name}]`
        );
      }

      console.log(
        "[updateLesson] Sending PATCH to",
        `${BASE_URL}/modules/${currentModule.id}/lessons/${lessonId}/`
      );
      const response = await fetch(
        `${BASE_URL}/modules/${currentModule.id}/lessons/${lessonId}/`,
        {
          method: "PATCH",
          headers: headers(sessionToken),
          body: formData,
        }
      );

      console.log(`[updateLesson] Response status: ${response.status}`);
      const responseText = await response.text();
      console.log("[updateLesson] Raw response:", responseText.slice(0, 200));

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (e) {
          console.error(
            "[updateLesson] Failed to parse error response:",
            responseText.slice(0, 200)
          );
          throw new Error("Invalid response format from server");
        }
        console.error("[updateLesson] Fetch failed:", errorData);
        if (response.status === 401 && errorData.redirect) {
          window.location.href = errorData.redirect;
          return;
        }
        throw new Error(errorData.error || "Failed to update lesson");
      }

      const data: { lesson: Lesson } = JSON.parse(responseText);
      console.log("[updateLesson] Lesson updated:", data);

      // Refresh module details to get updated lessons
      const moduleData = await getModuleDetails(currentModule.id);
      if (moduleData) {
        setCurrentModule(moduleData);
        setModules((prev) =>
          prev.map((m) => (m.id === currentModule.id ? moduleData : m))
        );
      }

      setEditingLesson(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset file input
      }
      alert(`Lesson updated successfully! ID: ${data.lesson.id}`);
    } catch (err) {
      setError(
        (err as Error).message || "An error occurred while updating the lesson"
      );
      console.error("[updateLesson] Error:", err);
    } finally { 
      setIsSavingLesson(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return Video;
      case "audio":
        return Headphones;
      case "document":
        return FileText;
      case "tutorial":
        return BookOpen;
      default:
        return FileText;
    }
  };

  return (
    <div className="space-y-4 p-3 xs:p-4 sm:p-6 max-w-full mx-auto">
      <div>
        <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold">
          Learning Modules
        </h1>
        <p className="text-muted-foreground text-xs xs:text-sm sm:text-base">
          Create and manage comprehensive learning experiences
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value);
          setCurrentPageManage(1);
          setCurrentPageAnalytics(1);
        }}
        className="w-full"
      >
        <TabsList className="bg-[#f797712e] text-slate-700 flex flex-col lg:flex-row w-full gap-2 mb-14">
          <TabsTrigger
            value="create"
            className="bg-transparent w-full sm:w-32 justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3"
          >
            Create Module
          </TabsTrigger>
          <TabsTrigger
            value="manage"
            className="bg-transparent w-full sm:w-32 justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3"
          >
            Manage Modules
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="bg-transparent w-full sm:w-32 justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3"
          >
            Module Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-3 xs:space-y-4">
          {isLoadingCourses || isLoadingCategories ? (
            <div className="relative min-h-[200px] flex items-center justify-center bg-gray-100/50 rounded-lg">
              <Spinner size="md" className="text-[#EF7B55]" />
            </div>
          ) : error ? (
            <div className="text-center py-8 xs:py-12 text-red-500">
              <p className="text-[0.85rem] xs:text-xs sm:text-sm">{error}</p>
            </div>
          ) : (
            <div className="grid gap-3 xs:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle className="text-sm xs:text-base sm:text-lg">
                    Module Configuration
                  </CardTitle>
                  <CardDescription className="text-[0.85rem] xs:text-xs sm:text-sm">
                    Set up your learning module
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 xs:space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="title"
                      className="text-xs xs:text-sm sm:text-base"
                    >
                      Module Title
                    </Label>
                    <Input
                      id="title"
                      value={currentModule.title}
                      onChange={(e) =>
                        setCurrentModule((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="Enter module title"
                      className="text-xs xs:text-sm sm:text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="order"
                      className="text-xs xs:text-sm sm:text-base"
                    >
                      Order
                    </Label>
                    <Input
                      id="order"
                      type="number"
                      min="1"
                      value={currentModule.order}
                      onChange={(e) =>
                        setCurrentModule((prev) => ({
                          ...prev,
                          order: parseInt(e.target.value) || 1,
                        }))
                      }
                      placeholder="e.g., 1"
                      className="text-xs xs:text-sm sm:text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="description"
                      className="text-xs xs:text-sm sm:text-base"
                    >
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={currentModule.description}
                      onChange={(e) =>
                        setCurrentModule((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Describe what students will learn"
                      rows={3}
                      className="text-xs xs:text-sm sm:text-base"
                    />
                  </div>

                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 xs:gap-4">
                    {/* <div className="space-y-2">
                      <Label className="text-xs xs:text-sm sm:text-base">
                        Module Type
                      </Label>
                      <Select
                        value={currentModule.type}
                        onValueChange={(value: Module["type"]) =>
                          setCurrentModule((prev) => ({...prev, type: value}))
                        }>
                        <SelectTrigger className="text-xs xs:text-sm sm:text-base">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem
                            value="video"
                            className="text-xs xs:text-sm sm:text-base">
                            Video Course
                          </SelectItem>
                          <SelectItem
                            value="audio"
                            className="text-xs xs:text-sm sm:text-base">
                            Audio Course
                          </SelectItem>
                          <SelectItem
                            value="document"
                            className="text-xs xs:text-sm sm:text-base">
                            Document Series
                          </SelectItem>
                          <SelectItem
                            value="tutorial"
                            className="text-xs xs:text-sm sm:text-base">
                            Interactive Tutorial
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div> */}
                    <div className="space-y-2">
                      <Label className="text-xs xs:text-sm sm:text-base">
                        Difficulty
                      </Label>
                      <Select
                        value={currentModule.difficulty}
                        onValueChange={(value: Module["difficulty"]) =>
                          setCurrentModule((prev) => ({
                            ...prev,
                            difficulty: value,
                          }))
                        }
                      >
                        <SelectTrigger className="text-xs xs:text-sm sm:text-base">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem
                            value="Beginner"
                            className="text-xs xs:text-sm sm:text-base"
                          >
                            Beginner
                          </SelectItem>
                          <SelectItem
                            value="Intermediate"
                            className="text-xs xs:text-sm sm:text-base"
                          >
                            Intermediate
                          </SelectItem>
                          <SelectItem
                            value="Advanced"
                            className="text-xs xs:text-sm sm:text-base"
                          >
                            Advanced
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs xs:text-sm sm:text-base">
                      Course
                    </Label>
                    <Select
                      value={currentModule.course.id}
                      onValueChange={(value) =>
                        setCurrentModule((prev) => ({
                          ...prev,
                          course: {
                            id: value === "none" ? undefined : value,
                            name:
                              courses.find((c) => c.id === value)?.name || "",
                          },
                        }))
                      }
                    >
                      <SelectTrigger className="text-xs xs:text-sm sm:text-base">
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          value="none"
                          className="text-xs xs:text-sm sm:text-base"
                        >
                          Select course
                        </SelectItem>
                        {courses
                          .filter((course) => course.id)
                          .map((course) => (
                            <SelectItem
                              key={course.id}
                              value={course.id}
                              className="text-xs xs:text-sm sm:text-base"
                            >
                              {course.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs xs:text-sm sm:text-base">
                      Category
                    </Label>
                    <Select
                      value={currentModule.category}
                      onValueChange={(value) =>
                        setCurrentModule((prev) => ({
                          ...prev,
                          category: value === "none" ? undefined : value,
                        }))
                      }
                    >
                      <SelectTrigger className="text-xs xs:text-sm sm:text-base">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          value="none"
                          className="text-xs xs:text-sm sm:text-base"
                        >
                          Select category
                        </SelectItem>
                        {categories
                          .filter((category) => category.name)
                          .map((category) => (
                            <SelectItem
                              key={category.id}
                              value={category.name}
                              className="text-xs xs:text-sm sm:text-base"
                            >
                              {category.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="duration"
                      className="text-xs xs:text-sm sm:text-base"
                    >
                      Estimated Duration (minutes)
                    </Label>
                    <Input
                      id="duration"
                      type="number"
                      min="0"
                      value={currentModule.duration || ""}
                      onChange={(e) =>
                        setCurrentModule((prev) => ({
                          ...prev,
                          duration: parseInt(e.target.value) || 0,
                        }))
                      }
                      placeholder="e.g., 270"
                      className="text-xs xs:text-sm sm:text-base"
                    />
                  </div>

                  <div className="pt-2 xs:pt-3 space-y-2">
                    <div className="flex justify-between text-[0.85rem] xs:text-xs sm:text-sm">
                      <span>Total Lessons:</span>
                      <span>{currentModule.lessonCount}</span>
                    </div>
                  </div>

                  <div className="pt-2 xs:pt-3 space-y-2">
                    <Button
                      onClick={currentModule.id ? updateModule : saveModule}
                      className="w-full text-xs xs:text-sm sm:text-base bg-[#f79771] hover:bg-gray-300 shadow-md"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <Spinner
                          size="sm"
                          className="mr-1 xs:mr-2 text-white"
                        />
                      ) : (
                        <Save className="mr-1 xs:mr-2 h-3 w-3 xs:h-4 xs:w-4" />
                      )}
                      {isSaving
                        ? "Saving..."
                        : currentModule.id
                        ? "Update Module"
                        : "Save Module"}
                    </Button>
                    <Button
                      onClick={() =>
                        publishModule(
                          currentModule.id,
                          !currentModule.isPublished
                        )
                      }
                      variant="outline"
                      className="w-full bg-transparent text-xs xs:text-sm sm:text-base shadow-md"
                      disabled={!currentModule.id}
                    >
                      <Upload className="mr-1 xs:mr-2 h-3 w-3 xs:h-4 xs:w-4" />
                      {currentModule.isPublished
                        ? "Unpublish Module"
                        : "Publish Module"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-1">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm xs:text-base sm:text-lg">
                        Lessons
                      </CardTitle>
                      <CardDescription className="text-[0.85rem] xs:text-xs sm:text-sm">
                        Manage module lessons
                      </CardDescription>
                    </div>
                    <Button
                      onClick={addLesson}
                      size="sm"
                      className="text-xs xs:text-sm sm:text-base bg-[#f79771] hover:bg-gray-300"
                    >
                      <Plus className="h-3 w-3 xs:h-4 xs:w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 xs:space-y-3">
                  {currentModule.lessonCount === 0 ? (
                    <div className="text-center py-6 xs:py-8 text-muted-foreground">
                      <BookOpen className="mx-auto h-8 w-8 xs:h-10 xs:w-10 sm:h-12 sm:w-12 mb-2 xs:mb-3 sm:mb-4 opacity-50" />
                      <p className="text-[0.85rem] xs:text-xs sm:text-sm">
                        No lessons added yet
                      </p>
                      <p className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs">
                        Click the + button to add your first lesson
                      </p>
                    </div>
                  ) : (
                    currentModule.lessons.map((lesson, index) => {
                      const Icon = getTypeIcon(lesson.type);
                      return (
                        <div
                          key={lesson.id}
                          className={`p-2 px-4 xs:p-3 rounded-lg cursor-pointer transition-colors shadow-md ${
                            editingLesson?.id === lesson.id
                              ? "border-primary bg-primary/5"
                              : "hover:bg-muted/50"
                          }`}
                          onClick={() => setEditingLesson(lesson)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-1 xs:gap-2 mb-1">
                                <Icon className="h-3 w-3 xs:h-4 xs:w-4" />
                                <span className="text-[0.85rem] xs:text-xs sm:text-sm font-medium">
                                  Lesson {index + 1}
                                </span>
                                <Badge
                                  variant="outline"
                                  className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs"
                                >
                                  {lesson.type}
                                </Badge>
                              </div>
                              <p className="text-[0.85rem] xs:text-xs sm:text-sm line-clamp-2">
                                {lesson.title || "Untitled lesson"}
                              </p>
                              {lesson.duration && (
                                <p className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs text-muted-foreground mt-0.5 xs:mt-1">
                                  {lesson.duration}
                                </p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-1 xs:p-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteLesson(lesson.id);
                              }}
                            >
                              <Trash2 className="h-2.5 w-2.5 xs:h-3 xs:w-3 text-[#DD2701]" />
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>

              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle className="text-sm xs:text-base sm:text-lg">
                    Lesson Editor
                  </CardTitle>
                  <CardDescription className="text-[0.85rem] xs:text-xs sm:text-sm">
                    {editingLesson
                      ? "Edit the selected lesson"
                      : "Select a lesson to edit"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {editingLesson ? (
                    <div className="space-y-3 xs:space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs xs:text-sm sm:text-base">
                          Lesson Type
                        </Label>
                        <Select
                          value={editingLesson.type}
                          onValueChange={(value: Lesson["type"]) =>
                            updateLessonFields(editingLesson.id, {
                              type: value,
                              videoUrl: "",
                              audioUrl: "",
                              content: "",
                              file: null, // Reset file
                            })
                          }
                        >
                          <SelectTrigger className="text-xs xs:text-sm sm:text-base">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem
                              value="video"
                              className="text-xs xs:text-sm sm:text-base"
                            >
                              Video
                            </SelectItem>
                            <SelectItem
                              value="audio"
                              className="text-xs xs:text-sm sm:text-base"
                            >
                              Audio
                            </SelectItem>
                            <SelectItem
                              value="pdf"
                              className="text-xs xs:text-sm sm:text-base"
                            >
                              PDF
                            </SelectItem>
                            {/* <SelectItem value="text" className="text-xs xs:text-sm sm:text-base">Text/Article</SelectItem> */}
                            {/* <SelectItem value="quiz" className="text-xs xs:text-sm sm:text-base">Quiz</SelectItem> */}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="lesson-title"
                          className="text-xs xs:text-sm sm:text-base font-medium"
                        >
                          {`Lesson ${
                            editingLesson.type.charAt(0).toUpperCase() +
                            editingLesson.type.slice(1)
                          }`}
                        </Label>
                        <Input
                          id="lesson-title"
                          value={editingLesson.title}
                          onChange={(e) =>
                            updateLessonFields(editingLesson.id, {
                              title: e.target.value,
                            })
                          }
                          placeholder={`Enter ${editingLesson.type} title`}
                          className="text-xs xs:text-sm sm:text-base w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs xs:text-sm sm:text-base">
                          Duration
                        </Label>
                        <Input
                          value={editingLesson.duration}
                          onChange={(e) =>
                            updateLessonFields(editingLesson.id, {
                              duration: e.target.value,
                            })
                          }
                          placeholder="e.g., 15 mins"
                          className="text-xs xs:text-sm sm:text-base"
                        />
                      </div>

                      {editingLesson.type === "video" && (
                        <div className="space-y-2">
                          <Label className="text-xs xs:text-sm sm:text-base">
                            Video{" "}
                            {editingLesson.file ? "File (Selected)" : "Upload"}
                          </Label>
                          {editingLesson.file ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={editingLesson.file.name}
                                readOnly
                                className="text-xs xs:text-sm sm:text-base bg-gray-100"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs xs:text-sm sm:text-base shadow-md"
                                onClick={() =>
                                  updateLessonFields(editingLesson.id, {
                                    file: null,
                                  })
                                }
                              >
                                Remove
                              </Button>
                            </div>
                          ) : (
                            <>
                              <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="video/mp4,video/mpeg,video/ogg,video/webm,video/x-matroska"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    console.log(
                                      "[LessonEditor] File selected:",
                                      {
                                        name: file.name,
                                        type: file.type,
                                        size: file.size,
                                      }
                                    );
                                    updateLessonFields(editingLesson.id, {
                                      file, // Store the file object
                                    });
                                  }
                                }}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full bg-transparent text-xs xs:text-sm sm:text-base shadow-md"
                                onClick={() => fileInputRef.current?.click()}
                              >
                                <Upload className="mr-1 xs:mr-2 h-2.5 w-2.5 xs:h-3 xs:w-3" />
                                Upload Video
                              </Button>
                            </>
                          )}
                        </div>
                      )}

                      {editingLesson.type === "audio" && (
                        <div className="space-y-2">
                          <Label className="text-xs xs:text-sm sm:text-base">
                            Audio{" "}
                            {editingLesson.file ? "File (Selected)" : "Upload"}
                          </Label>
                          {editingLesson.file ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={editingLesson.file.name}
                                readOnly
                                className="text-xs xs:text-sm sm:text-base bg-gray-100"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs xs:text-sm sm:text-base shadow-md"
                                onClick={() =>
                                  updateLessonFields(editingLesson.id, {
                                    file: null,
                                  })
                                }
                              >
                                Remove
                              </Button>
                            </div>
                          ) : (
                            <>
                              <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="audio/mpeg,audio/wav,audio/ogg,audio/mp3"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    console.log(
                                      "[LessonEditor] File selected:",
                                      {
                                        name: file.name,
                                        type: file.type,
                                        size: file.size,
                                      }
                                    );
                                    updateLessonFields(editingLesson.id, {
                                      file, // Store the file object
                                    });
                                  }
                                }}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full bg-transparent text-xs xs:text-sm sm:text-base shadow-md"
                                onClick={() => fileInputRef.current?.click()}
                              >
                                <Upload className="mr-1 xs:mr-2 h-2.5 w-2.5 xs:h-3 xs:w-3" />
                                Upload Audio
                              </Button>
                            </>
                          )}
                        </div>
                      )}

                      {editingLesson.type === "pdf" && (
                        <div className="space-y-2">
                          <Label className="text-xs xs:text-sm sm:text-base">
                            PDF{" "}
                            {editingLesson.file ? "File (Selected)" : "Upload"}
                          </Label>
                          {editingLesson.file ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={editingLesson.file.name}
                                readOnly
                                className="text-xs xs:text-sm sm:text-base bg-gray-100"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs xs:text-sm sm:text-base shadow-md"
                                onClick={() =>
                                  updateLessonFields(editingLesson.id, {
                                    file: null,
                                  })
                                }
                              >
                                Remove
                              </Button>
                            </div>
                          ) : (
                            <>
                              <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="pdf/epub,pdf/pdf,pdf/txt,pdf/docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    console.log(
                                      "[LessonEditor] File selected:",
                                      {
                                        name: file.name,
                                        type: file.type,
                                        size: file.size,
                                      }
                                    );
                                    updateLessonFields(editingLesson.id, {
                                      file, // Store the file object
                                    });
                                  }
                                }}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full bg-transparent text-xs xs:text-sm sm:text-base shadow-md"
                                onClick={() => fileInputRef.current?.click()}
                              >
                                <Upload className="mr-1 xs:mr-2 h-2.5 w-2.5 xs:h-3 xs:w-3" />
                                Upload PDF
                              </Button>
                            </>
                          )}
                        </div>
                      )}

                      {editingLesson.type === "text" && (
                        <div className="space-y-2">
                          <Label className="text-xs xs:text-sm sm:text-base">
                            {editingLesson.content &&
                            editingLesson.content.startsWith("http")
                              ? "Document URL (Uploaded)"
                              : "Content"}
                          </Label>
                          {editingLesson.content &&
                          editingLesson.content.startsWith("http") ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={editingLesson.content}
                                readOnly
                                className="text-xs xs:text-sm sm:text-base bg-gray-100"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs xs:text-sm sm:text-base shadow-md"
                                onClick={() =>
                                  updateLessonFields(editingLesson.id, {
                                    content: "",
                                  })
                                }
                              >
                                Remove
                              </Button>
                            </div>
                          ) : (
                            <>
                              <Textarea
                                value={editingLesson.content || ""}
                                onChange={(e) =>
                                  updateLessonFields(editingLesson.id, {
                                    content: e.target.value,
                                  })
                                }
                                placeholder="Write your lesson content here or upload a document..."
                                rows={4}
                                className="text-xs xs:text-sm sm:text-base"
                              />
                              <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    console.log(
                                      "[LessonEditor] File selected:",
                                      {
                                        name: file.name,
                                        type: file.type,
                                        size: file.size,
                                      }
                                    );
                                    updateLessonFields(editingLesson.id, {
                                      file, // Store the file object
                                    });
                                  }
                                }}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full bg-transparent text-xs xs:text-sm sm:text-base shadow-md"
                                onClick={() => fileInputRef.current?.click()}
                              >
                                <Upload className="mr-1 xs:mr-2 h-2.5 w-2.5 xs:h-3 xs:w-3" />
                                Upload Document
                              </Button>
                            </>
                          )}
                        </div>
                      )}

                      <Button
                        onClick={() =>
                          typeof editingLesson.id === "string" &&
                          editingLesson.id.startsWith("temp")
                            ? saveLesson()
                            : updateLesson(editingLesson.id)
                        }
                        className="w-full text-xs xs:text-sm sm:text-base bg-[#f79771] hover:bg-gray-300 shadow-md"
                        disabled={isSavingLesson}
                      >
                        {isSavingLesson ? (
                          <Spinner
                            size="sm"
                            className="mr-1 xs:mr-2 text-white"
                          />
                        ) : (
                          <Save className="mr-1 xs:mr-2 h-3 w-3 xs:h-4 xs:w-4" />
                        )}
                        {isSavingLesson
                          ? "Saving..."
                          : typeof editingLesson.id === "string" &&
                            editingLesson.id.startsWith("temp")
                          ? "Save Lesson"
                          : "Update Lesson"}
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-6 xs:py-8 text-muted-foreground">
                      <Edit className="mx-auto h-8 w-8 xs:h-10 xs:w-10 sm:h-12 sm:w-12 mb-2 xs:mb-3 sm:mb-4 opacity-50" />
                      <p className="text-[0.85rem] xs:text-xs sm:text-sm">
                        Select a lesson to edit
                      </p>
                      <p className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs">
                        Choose a lesson from the list to start editing
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="manage" className="space-y-3 xs:space-y-4">
          <div className="flex flex-wrap items-start xs:items-center justify-between gap-2 xs:gap-3">
            <div>
              <h2 className="text-lg xs:text-xl sm:text-2xl font-bold">
                Manage Modules
              </h2>
              <p className="text-muted-foreground text-[0.85rem] xs:text-xs sm:text-sm">
                View and manage all your learning modules
              </p>
            </div>
            <div className="flex gap-2 xs:gap-3 flex-col sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search modules..."
                  className="pl-8 text-xs xs:text-sm sm:text-base"
                />
              </div>
              <Select
                value={difficultyFilter}
                onValueChange={setDifficultyFilter}
              >
                <SelectTrigger className="w-[140px] text-xs xs:text-sm sm:text-base">
                  <SelectValue placeholder="Filter by difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value="Beginner"
                    className="text-xs xs:text-sm sm:text-base"
                  >
                    Beginner
                  </SelectItem>
                  <SelectItem
                    value="Intermediate"
                    className="text-xs xs:text-sm sm:text-base"
                  >
                    Intermediate
                  </SelectItem>
                  <SelectItem
                    value="Advanced"
                    className="text-xs xs:text-sm sm:text-base"
                  >
                    Advanced
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => setActiveTab("create")}
                className="text-xs xs:text-sm sm:text-base bg-[#f79771] hover:bg-gray-300 shadow-md"
              >
                <Plus className="mr-1 xs:mr-2 h-3 w-3 xs:h-4 xs:w-4" />
                Create New Module
              </Button>
            </div>
          </div>

          {isLoadingModules ? (
            <div className="relative min-h-[200px] flex items-center justify-center bg-gray-100/50 rounded-lg">
              <Spinner size="md" className="text-[#EF7B55]" />
            </div>
          ) : error ? (
            <div className="text-center py-8 xs:py-12 text-red-500">
              <p className="text-[0.85rem] xs:text-xs sm:text-sm">{error}</p>
            </div>
          ) : (
            <>
              <div className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
                Showing{" "}
                {
                  getPaginatedModules(modules, currentPageManage)
                    .paginatedModules.length
                }{" "}
                of {getPaginatedModules(modules, currentPageManage).totalCount}{" "}
                Modules
              </div>

              <div className="grid gap-3 xs:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {getPaginatedModules(
                  modules,
                  currentPageManage
                ).paginatedModules.map((module) => {
                  const Icon = getTypeIcon(module.type);
                  return (
                    <Card
                      key={module.id}
                      className="hover:shadow-lg transition-shadow"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <CardTitle className="text-sm xs:text-base sm:text-lg line-clamp-2">
                              {module.title}
                            </CardTitle>
                            <CardDescription className="text-[0.85rem] xs:text-xs sm:text-sm line-clamp-2">
                              {module.description}
                            </CardDescription>
                          </div>
                          <Icon className="h-4 w-4 xs:h-5 xs:w-5 text-muted-foreground" />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3 xs:space-y-4">
                        <div className="flex items-center flex-wrap gap-2">
                          <Badge
                            variant={
                              module.isPublished ? "default" : "secondary"
                            }
                            className={
                              module.isPublished
                                ? "bg-[#EF7B55] hover:bg-[#EF7B553a] hover:bg-gray-300"
                                : "bg-gray-500 text-white hover:bg-gray-600"
                            }
                          >
                            {module.isPublished ? "Published" : "Draft"}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-[0.85rem] xs:text-xs sm:text-sm"
                          >
                            {module.difficulty}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-[0.85rem] xs:text-xs sm:text-sm"
                          >
                            {module.category || "Uncategorized"}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-[0.85rem] xs:text-xs sm:text-sm"
                          >
                            {module.course.name}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-3 xs:gap-4 text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5 xs:h-3 xs:w-3" />
                            {module.duration}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-2.5 w-2.5 xs:h-3 xs:w-3" />
                            {module.enrollments}
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-2.5 w-2.5 xs:h-3 xs:w-3 fill-yellow-400 text-yellow-400" />
                            {module.rating}
                          </div>
                          <div>{module.createdDate}</div>
                        </div>

                        <div className="flex gap-2 flex-col lg:flex-row">
                          <Button
                            // size="sm"
                            className="flex-1 text-xs xs:text-sm sm:text-base bg-[#f79771] hover:bg-gray-300 shadow-md"
                            onClick={async () => {
                              const moduleData = await getModuleDetails(
                                module.id
                              );
                              if (moduleData) {
                                setCurrentModule(moduleData);
                                setActiveTab("create");
                              }
                            }}
                          >
                            <Edit className="mr-1 xs:mr-2 h-2.5 w-2.5 xs:h-3 xs:w-3" />
                            Edit
                          </Button>
                          <Button
                            // size="sm"
                            variant="outline"
                            className="flex-1 text-xs xs:text-sm sm:text-base shadow-md"
                            onClick={async () => {
                              const moduleData = await getModuleDetails(
                                module.id
                              );
                              if (moduleData) {
                                setPreviewModule(moduleData);
                                setIsPreviewOpen(true);
                              }
                            }}
                          >
                            <Eye className="mr-1 xs:mr-2 h-2.5 w-2.5 xs:h-3 xs:w-3" />
                            Preview
                          </Button>
                          <Button
                            // size="sm"
                            variant="destructive"
                            className="flex-1 text-xs xs:text-sm sm:text-base shadow-md"
                            onClick={() => deleteModule(module.id)}
                          >
                            <Trash2 className="mr-1 xs:mr-2 h-2.5 w-2.5 xs:h-3 xs:w-3" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {getPaginatedModules(modules, currentPageManage).totalCount ===
              0 ? (
                <div className="text-center py-8 xs:py-12">
                  <BookOpen className="mx-auto h-8 w-8 xs:h-12 xs:w-12 text-muted-foreground mb-3 xs:mb-4" />
                  <h3 className="text-base xs:text-lg sm:text-xl font-medium mb-2">
                    No Modules found
                  </h3>
                  <p className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
                    Create a new module to get started
                  </p>
                </div>
              ) : (
                <Pagination className="mt-4">
                  <PaginationContent>
                    <PaginationPrevious
                      onClick={() =>
                        setCurrentPageManage((prev) => Math.max(prev - 1, 1))
                      }
                      className={
                        currentPageManage === 1
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                    {Array.from(
                      {
                        length: getPaginatedModules(modules, currentPageManage)
                          .totalPages,
                      },
                      (_, index) => index + 1
                    ).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          isActive={currentPageManage === page}
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPageManage(page);
                          }}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    {getPaginatedModules(modules, currentPageManage)
                      .totalPages > 5 && <PaginationEllipsis />}
                    <PaginationNext
                      onClick={() =>
                        setCurrentPageManage((prev) =>
                          Math.min(
                            prev + 1,
                            getPaginatedModules(modules, currentPageManage)
                              .totalPages
                          )
                        )
                      }
                      className={
                        currentPageManage ===
                        getPaginatedModules(modules, currentPageManage)
                          .totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-3 xs:space-y-4">
          {isLoadingModules ? (
            <div className="relative min-h-[200px] flex items-center justify-center bg-gray-100/50 rounded-lg">
              <Spinner size="md" className="text-[#EF7B55]" />
            </div>
          ) : error ? (
            <div className="text-center py-8 xs:py-12 text-red-500">
              <p className="text-[0.85rem] xs:text-xs sm:text-sm">{error}</p>
            </div>
          ) : (
            <>
              <div>
                <h2 className="text-lg xs:text-xl sm:text-2xl font-bold">
                  Module Analytics
                </h2>
                <p className="text-muted-foreground text-[0.85rem] xs:text-xs sm:text-sm">
                  Track performance and engagement of your learning modules
                </p>
              </div>

              <div className="grid gap-3 xs:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-1 xs:pb-2">
                    <CardTitle className="text-[0.85rem] xs:text-xs sm:text-sm font-medium">
                      Total Enrollments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg xs:text-xl sm:text-2xl font-bold">
                      {modules.reduce(
                        (sum, module) => sum + module.enrollments,
                        0
                      )}
                    </div>
                    <p className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs text-muted-foreground">
                      +18% from last month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-1 xs:pb-2">
                    <CardTitle className="text-[0.85rem] xs:text-xs sm:text-sm font-medium">
                      Completion Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg xs:text-xl sm:text-2xl font-bold">
                      78%
                    </div>
                    <p className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs text-muted-foreground">
                      +5% from last month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-1 xs:pb-2">
                    <CardTitle className="text-[0.85rem] xs:text-xs sm:text-sm font-medium">
                      Average Rating
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg xs:text-xl sm:text-2xl font-bold">
                      {modules.length
                        ? (
                            modules.reduce(
                              (sum, module) => sum + module.rating,
                              0
                            ) / modules.length
                          ).toFixed(1)
                        : 0}
                    </div>
                    <p className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs text-muted-foreground">
                      +0.2 from last month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-1 xs:pb-2">
                    <CardTitle className="text-[0.85rem] xs:text-xs sm:text-sm font-medium">
                      Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg xs:text-xl sm:text-2xl font-bold">
                      12,450
                    </div>
                    <p className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs text-muted-foreground">
                      +22% from last month
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm xs:text-base sm:text-lg">
                    Module Performance
                  </CardTitle>
                  <CardDescription className="text-[0.85rem] xs:text-xs sm:text-sm">
                    Detailed analytics for each module
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground mb-2 xs:mb-3">
                    Showing{" "}
                    {
                      getPaginatedModules(modules, currentPageAnalytics)
                        .paginatedModules.length
                    }{" "}
                    of{" "}
                    {
                      getPaginatedModules(modules, currentPageAnalytics)
                        .totalCount
                    }{" "}
                    Modules
                  </div>
                  <div className="space-y-2 xs:space-y-3">
                    {getPaginatedModules(
                      modules,
                      currentPageAnalytics
                    ).paginatedModules.map((module) => (
                      <div
                        key={module.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 xs:p-4 border rounded-lg"
                      >
                        <div className="space-y-1 flex-1">
                          <h4 className="font-medium text-[0.85rem] xs:text-xs sm:text-sm">
                            {module.title}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 xs:gap-3 text-[0.6rem] xs:text-[0.65rem] sm:text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Users className="h-2.5 w-2.5 xs:h-3 xs:w-3" />
                              {module.enrollments} enrolled
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-2.5 w-2.5 xs:h-3 xs:w-3 fill-yellow-400 text-yellow-400" />
                              {module.rating}
                            </div>
                            <div>
                              Completion: {Math.floor(Math.random() * 30) + 70}%
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 sm:mt-0 text-right space-y-2">
                          <div className="text-[0.85rem] xs:text-xs sm:text-sm font-medium text-green-600">
                            {Math.floor(Math.random() * 5000) + 1000}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs xs:text-sm sm:text-base shadow-md"
                          >
                            <Eye className="mr-1 xs:mr-2 h-2.5 w-2.5 xs:h-3 xs:w-3" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {getPaginatedModules(modules, currentPageAnalytics)
                    .totalCount === 0 ? (
                    <div className="text-center py-8 xs:py-12">
                      <BookOpen className="mx-auto h-8 w-8 xs:h-12 xs:w-12 text-muted-foreground mb-3 xs:mb-4" />
                      <h3 className="text-base xs:text-lg sm:text-xl font-medium mb-2">
                        No Modules found
                      </h3>
                      <p className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
                        Create a new module to get started
                      </p>
                    </div>
                  ) : (
                    <Pagination className="mt-4">
                      <PaginationContent>
                        <PaginationPrevious
                          onClick={() =>
                            setCurrentPageAnalytics((prev) =>
                              Math.max(prev - 1, 1)
                            )
                          }
                          className={
                            currentPageAnalytics === 1
                              ? "pointer-events-none opacity-50"
                              : ""
                          }
                        />
                        {Array.from(
                          {
                            length: getPaginatedModules(
                              modules,
                              currentPageAnalytics
                            ).totalPages,
                          },
                          (_, index) => index + 1
                        ).map((page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              href="#"
                              isActive={currentPageAnalytics === page}
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPageAnalytics(page);
                              }}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        {getPaginatedModules(modules, currentPageAnalytics)
                          .totalPages > 5 && <PaginationEllipsis />}
                        <PaginationNext
                          onClick={() =>
                            setCurrentPageAnalytics((prev) =>
                              Math.min(
                                prev + 1,
                                getPaginatedModules(
                                  modules,
                                  currentPageAnalytics
                                ).totalPages
                              )
                            )
                          }
                          className={
                            currentPageAnalytics ===
                            getPaginatedModules(modules, currentPageAnalytics)
                              .totalPages
                              ? "pointer-events-none opacity-50"
                              : ""
                          }
                        />
                      </PaginationContent>
                    </Pagination>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
      <PreviewModal
        module={previewModule}
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setPreviewModule(null);
        }}
      />
    </div>
  );
}

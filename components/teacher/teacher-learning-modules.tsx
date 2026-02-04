"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {useState, useRef, useEffect} from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {Badge} from "@/components/ui/badge";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
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
import {getSession} from "next-auth/react";
import {PreviewModal} from "@/components/ui/teacher-preview-modal"; // Adjust path based on your project structure
import {Spinner} from "../ui/spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {MoreVertical} from "lucide-react";

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
  type: "video" | "audio" | "pdf" | "text" | "quiz";
  duration: string;
  videoUrl?: string;
  audioUrl?: string;
  content?: string;
  file?: File | null;
  coverImage?: File | null; // NEW: Cover image file
  coverImageUrl?: string; // NEW: Existing cover image URL
  order?: number;
  active?: boolean;
  remove_cover: boolean; // NEW: Flag to indicate cover removal
  meta?: {description: string; tags: string[]};
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
  course: {id?: string; name: string};
}

interface APIModule {
  id: string | number;
  title: string;
  description: string;
  difficulty: string;
  category: {id: string | number; name: string} | null;
  estimatedDuration: number;
  order: number;
  active: boolean;
  isPublished: boolean;
  course: {id: string | number; name: string} | null;
  createdAt: string | null;
  updatedAt: string | null;
  lessons: any[];
  lessonCount: number;

  // optional fields
  enrollments?: number;
  rating?: number;
  // 👇 important: make type compatible with Module["type"]
  type?: Module["type"] | string;
}

interface APIError {
  error: string;
  redirect?: string;
}
type TeacherCourse = {
  id: string;
  name: string;
  subject: string;
  classroom: string;
  description: string;
  isActive: boolean;
  course_type?: string;
  general_activation?: boolean;
  general_activation_date?: string | null;
};
const BASE_URL = "/api/teacher"; // Updated to match lesson routes; adjust module routes accordingly
const API_KEY =
  process.env.STORE_API_KEY || "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

const headers = (sessionToken: string | null) => ({
  Authorization: `Api-Key ${API_KEY}`,
  "Content-Type": "application/json",
  ...(sessionToken && {"X-Session-Token": sessionToken}),
});

// Utilities
const durationToMinutes = (duration: string): number => {
  if (!duration) return 0;
  duration = String(duration);
  const parts = duration.match(/(\d+)h\s*(\d+)m/);
  if (!parts) return parseInt(duration) || 0;
  const hours = parseInt(parts[1]) || 0;
  const minutes = parseInt(parts[2]) || 0;
  return hours * 60 + minutes;
};

const minutesToDuration = (
  minutes: number | string | null | undefined,
): string => {
  const total = Number(minutes);

  if (!total || isNaN(total)) return "0m";

  const hours = Math.floor(total / 60);
  const mins = total % 60;

  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
};
const shortenText = (text: string, maxLength: number) => {
  if (!text) return "";
  return text.length > maxLength ? text.slice(0, maxLength).trim() + "…" : text;
};

const normalizeDifficulty = (difficulty: string): Module["difficulty"] => {
  const v = (difficulty || "").toLowerCase();
  if (v === "beginner") return "Beginner";
  if (v === "intermediate") return "Intermediate";
  if (v === "advanced") return "Advanced";
  // Fallback
  return "Beginner";
};

const normalizeModuleType = (t?: string): Module["type"] => {
  switch ((t || "").toLowerCase()) {
    case "video":
      return "video";
    case "audio":
      return "audio";
    case "document":
      return "document";
    case "tutorial":
      return "tutorial";
    default:
      return "video"; // sensible default
  }
};

export function TeacherLearningModules() {
  const [teacherCourses, setTeacherCourses] = useState<TeacherCourse[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [coursesError, setCoursesError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState("create");
  const [previewModule, setPreviewModule] = useState<Module | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const initialModule: Module = {
    id: "",
    title: "",
    description: "",
    type: "video",
    duration: 0,
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
    course: {id: undefined, name: ""},
  };
  const [currentModule, setCurrentModule] = useState<Module>(initialModule);
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
  const coverImageInputRef = useRef<HTMLInputElement>(null); // Add this
  const [loadingModuleId, setLoadingModuleId] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<{
    aggregates: {total_enrollments: number; completion_rate: number};
    pagination: {
      total_count: number;
      total_pages: number;
      current_page: number;
      page_size: number;
    };
    modules: Module[];
  } | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(""); // NEW: Controlled input

  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  // Feedback dialog for success/info messages
  const [feedbackDialog, setFeedbackDialog] = useState<{
    open: boolean;
    title: string;
    description?: string;
  }>({
    open: false,
    title: "",
    description: "",
  });
  const [gaDialogOpen, setGaDialogOpen] = useState(false);
  const [gaCourse, setGaCourse] = useState<TeacherCourse | null>(null);
  const [gaEnabled, setGaEnabled] = useState(false);
  const [gaDateLocal, setGaDateLocal] = useState<string>(""); // datetime-local
  const [gaSaving, setGaSaving] = useState(false);
  const MAX_IMAGE_BYTES = 1 * 1024 * 1024; // 1MB
  const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50MB
  const MAX_AUDIO_BYTES = 10 * 1024 * 1024; // 10MB
  const MAX_PDF_BYTES = 5 * 1024 * 1024; // 5MB

  const formatBytes = (bytes: number) =>
    `${(bytes / (1024 * 1024)).toFixed(1)}MB`;

  const isoToLocalInput = (iso?: string | null) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    // datetime-local expects "YYYY-MM-DDTHH:mm"
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
      d.getDate(),
    )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const openGA = (course: TeacherCourse) => {
    const isPrivate = (course.course_type || "").toLowerCase() === "private";
    if (isPrivate) {
      openFeedback(
        "Private course",
        "General access is not available for private courses.",
      );
      return;
    }

    setGaCourse(course);
    setGaEnabled(Boolean(course.general_activation));
    setGaDateLocal(isoToLocalInput(course.general_activation_date));
    setGaDialogOpen(true);
  };

  const saveGA = async () => {
    if (!gaCourse?.id) return;
    setGaSaving(true);
    try {
      const payload = {
        general_activation: gaEnabled,
        general_activation_date: gaEnabled
          ? gaDateLocal
            ? new Date(gaDateLocal).toISOString()
            : null
          : null,
      };

      const res = await fetch(
        `/api/teacher/courses/${gaCourse.id}/general-activation`,
        {
          method: "PATCH",
          headers: headers(sessionToken),
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.detail || data?.error || "Update failed");

      // Update local list
      setTeacherCourses((prev) =>
        prev.map((c) =>
          c.id === gaCourse.id
            ? {
                ...c,
                general_activation: data.general_activation,
                general_activation_date: data.general_activation_date,
              }
            : c,
        ),
      );

      setGaDialogOpen(false);
      openFeedback("Saved", "General activation updated successfully.");
    } catch (e: any) {
      setCoursesError(e?.message || "Update failed");
    } finally {
      setGaSaving(false);
    }
  };

  const openFeedback = (title: string, description?: string) => {
    setFeedbackDialog({
      open: true,
      title,
      description,
    });
  };

  // Confirm delete dialog for modules
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState<string | null>(null);

  const handleDeleteModuleClick = (moduleId: string) => {
    setModuleToDelete(moduleId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDeleteModule = async () => {
    if (!moduleToDelete) return;
    const id = moduleToDelete;
    setDeleteDialogOpen(false);
    setModuleToDelete(null);
    await deleteModule(id);
  };

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
        let data: Course[] = await response.json();
        // Normalize IDs to strings
        data = data.map((c) => ({...c, id: String(c.id)}));
        setCourses(data);
      } catch (err) {
        setError(
          (err as Error).message || "An error occurred while fetching courses",
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
        let data: Category[] = await response.json();
        // Normalize IDs to strings
        data = data.map((c) => ({...c, id: String(c.id)}));
        setCategories(data);
      } catch (err) {
        setError(
          (err as Error).message ||
            "An error occurred while fetching categories",
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
  useEffect(() => {
    if (activeTab !== "course-access" || !sessionToken) return;

    const load = async () => {
      setCoursesLoading(true);
      setCoursesError(null);
      try {
        const res = await fetch("/api/teacher/courses", {
          method: "GET",
          headers: headers(sessionToken),
        });
        const data = await res.json();
        if (!res.ok)
          throw new Error(
            data?.detail || data?.error || "Failed to load courses",
          );

        setTeacherCourses(
          (data ?? []).map((c: any) => ({
            ...c,
            id: String(c.id),
            general_activation: Boolean(c.general_activation),
            general_activation_date: c.general_activation_date ?? null,
          })),
        );
      } catch (e: any) {
        setCoursesError(e?.message || "Failed to load courses");
      } finally {
        setCoursesLoading(false);
      }
    };

    load();
  }, [activeTab, sessionToken]);

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

          // You were forcing active=true here; keep or change as needed
          query.set("active", "true");

          // NEW: course filter (send course id as backend expects)
          if (courseFilter && courseFilter !== "all") {
            query.set("course", courseFilter);
          }

          // NEW: category filter (send category id)
          if (categoryFilter && categoryFilter !== "all") {
            query.set("category", categoryFilter);
          }

          const response = await fetch(
            `${BASE_URL}/modules/?${query.toString()}`,
            {
              method: "GET",
              headers: headers(sessionToken),
            },
          );
          if (!response.ok) {
            const errorData: APIError = await response.json();
            if (response.status === 401 && errorData.redirect) {
              window.location.href = errorData.redirect;
              return;
            }
            throw new Error(errorData.error || "Failed to fetch modules");
          }

          let data: APIModule[] = await response.json();

          const sanitizedModules: Module[] = data.map(
            (module: APIModule): Module => ({
              id: String(module.id),
              title: module.title,
              description: module.description,
              type: normalizeModuleType(module.type),
              duration: Number(module.estimatedDuration || 0), // ✅ FIX
              difficulty: normalizeDifficulty(module.difficulty),
              category: module.category?.name || "Uncategorized",
              enrollments: module.enrollments ?? 0,
              rating: module.rating ?? 0,
              isPublished: module.isPublished,
              createdDate: formatDate(module.createdAt || undefined),
              course: {
                id: module.course?.id ? String(module.course.id) : undefined,
                name: module.course?.name || "",
              },
              lessons: module.lessons || [],
              lessonCount: module.lessonCount || 0,
              order: module.order,
              active: module.active,
            }),
          );

          setModules(sanitizedModules);
        } catch (err) {
          setError(
            (err as Error).message ||
              "An error occurred while fetching modules",
          );
        } finally {
          setIsLoadingModules(false);
        }
      };
      fetchModules();
    }
  }, [
    activeTab,
    search,
    difficultyFilter,
    courseFilter,
    categoryFilter,
    sessionToken,
  ]);

  // NEW: Fetch analytics separately
  useEffect(() => {
    if (activeTab === "analytics" && sessionToken) {
      const fetchAnalytics = async () => {
        setAnalyticsLoading(true);
        setAnalyticsError(null);
        try {
          const query = new URLSearchParams();
          if (search) query.set("search", search);
          if (difficultyFilter)
            query.set("difficulty", difficultyFilter.toLowerCase());
          query.set("active", "true");
          query.set("page", currentPageAnalytics.toString());
          query.set("page_size", "10");

          const res = await fetch(`/api/teacher/module-analytics`, {
            headers: headers(sessionToken),
          });

          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || "Failed to load analytics");
          }

          let data = await res.json();
          // Normalize module IDs
          data.modules = data.modules.map((m: Module) => ({
            ...m,
            id: String(m.id),
            course: {
              ...m.course,
              id: m.course?.id ? String(m.course.id) : undefined,
            },
          }));
          setAnalytics(data);
        } catch (err) {
          setAnalyticsError((err as Error).message);
        } finally {
          setAnalyticsLoading(false);
        }
      };

      fetchAnalytics();
    }
  }, [activeTab, search, difficultyFilter, currentPageAnalytics, sessionToken]);

  // Auto-set next order when course is selected for new module
  useEffect(() => {
    const autoSetOrder = async () => {
      if (!currentModule.id && currentModule.course.id && sessionToken) {
        const nextOrder = await getNextOrder(
          currentModule.course.id,
          sessionToken,
        );
        setCurrentModule((prev) => ({...prev, order: nextOrder}));
      }
    };
    autoSetOrder();
  }, [currentModule.course.id, sessionToken]);

  // Fetch module details
  // Add this utility function at the top of your file with other utilities
  function normalizeMedia(media: string | undefined): string | undefined {
    if (!media) return undefined;
    const BASE_URL = process.env.BASE_URL;
    if (media.startsWith("http")) return media;
    let cleaned = media.replace(/^\/+/, "");
    if (cleaned.startsWith("media/")) return `${BASE_URL}/${cleaned}`;
    if (cleaned.startsWith("covers/")) return `${BASE_URL}/media/${cleaned}`;
    return `${BASE_URL}/media/covers/${cleaned}`;
  }

  const getModuleDetails = async (moduleId: string): Promise<Module | null> => {
    try {
      const response = await fetch(
        `${BASE_URL}/modules/${moduleId}?t=${Date.now()}`,
        {
          method: "GET",
          headers: headers(sessionToken),
        },
      );
      if (!response.ok) {
        const errorData: APIError = await response.json();
        throw new Error(errorData.error || "Failed to fetch module details");
      }
      const module: APIModule = await response.json();

      const lessonsWithCover =
        module.lessons?.map((lesson: any) => ({
          ...lesson,
          id: String(lesson.id),
          coverImageUrl: lesson.cover_image
            ? normalizeMedia(lesson.cover_image)
            : null,
        })) || [];

      return {
        id: String(module.id),
        title: module.title,
        description: module.description,
        type: normalizeModuleType(module.type),
        duration: module.estimatedDuration,
        difficulty: normalizeDifficulty(module.difficulty),
        category: module.category?.name || undefined,
        enrollments: module.enrollments ?? 0,
        rating: module.rating ?? 0,
        isPublished: module.isPublished,
        createdDate: formatDate(module.createdAt || undefined),
        course: {
          id: module.course?.id ? String(module.course.id) : undefined,
          name: module.course?.name || "",
        },
        lessons: lessonsWithCover,
        lessonCount: module.lessonCount || 0,
        order: module.order,
        active: module.active,
      };
    } catch (err) {
      setError(
        (err as Error).message ||
          "An error occurred while fetching module details",
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
      coverImage: null, // NEW
      coverImageUrl: "", // NEW
      remove_cover: false,
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
        lesson.id === lessonId ? {...lesson, ...updates} : lesson,
      ),
    }));
    if (editingLesson?.id === lessonId) {
      setEditingLesson((prev) => (prev ? {...prev, ...updates} : null));
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
        },
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
            : m,
        ),
      );
      if (editingLesson?.id === lessonId) {
        setEditingLesson(null);
      }
      openFeedback("Lesson deleted", "The lesson was deleted successfully.");
    } catch (err) {
      setError(
        (err as Error).message || "An error occurred while deleting the lesson",
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
        body: JSON.stringify({active}),
      });
      if (!response.ok) {
        const errorData: APIError = await response.json();
        if (response.status === 401 && errorData.redirect) {
          window.location.href = errorData.redirect;
          return;
        }
        throw new Error(
          errorData.error || "Failed to publish/unpublish module",
        );
      }
      setModules((prev) =>
        prev.map((m) => (m.id === moduleId ? {...m, isPublished: active} : m)),
      );
      if (currentModule.id === moduleId) {
        setCurrentModule((prev) => ({...prev, isPublished: active}));
      }
      openFeedback(
        `Module ${active ? "published" : "unpublished"}`,
        `The module was ${active ? "published" : "unpublished"} successfully.`,
      );
    } catch (err) {
      setError(
        (err as Error).message ||
          `An error occurred while ${
            active ? "publishing" : "unpublishing"
          } the module`,
      );
    }
  };

  const deleteModule = async (moduleId: string) => {
    if (!sessionToken) {
      setError("No session token available. Please log in again.");
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
        setCurrentModule(initialModule);
        setEditingLesson(null);
      }
      openFeedback("Module deleted", "The module was deleted successfully.");
    } catch (err) {
      setError(
        (err as Error).message || "An error occurred while deleting the module",
      );
    }
  };

  const getNextOrder = async (
    courseId: string,
    sessionToken: string | null,
  ): Promise<number> => {
    if (!courseId || !sessionToken) return 1;
    try {
      const query = new URLSearchParams({course_id: courseId});
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

  const createLesson = async (
    moduleId: string,
    lesson: Lesson,
  ): Promise<Lesson | null> => {
    if (!lesson.title) {
      throw new Error("Lesson title is required.");
    }
    try {
      const formData = new FormData();
      formData.append("title", lesson.title);
      formData.append("type", lesson.type); // Updated to "type" per API
      formData.append(
        "duration",
        (durationToMinutes(lesson.duration) * 60).toString(),
      ); // Updated to "duration"
      formData.append("order", (currentModule.lessons.length + 1).toString());
      formData.append(
        "meta",
        JSON.stringify({
          description: lesson.content || "",
          tags: lesson.title.toLowerCase().split(" ").filter(Boolean),
        }),
      );
      formData.append("active", "true");

      // Main file handling
      if (
        lesson.file &&
        lesson.file instanceof File &&
        (lesson.type === "video" ||
          lesson.type === "audio" ||
          lesson.type === "pdf")
      ) {
        formData.append("file", lesson.file, lesson.file.name);
      } else if (
        lesson.type === "text" &&
        lesson.content &&
        !lesson.content.startsWith("http")
      ) {
        formData.append("textContent", lesson.content); // Updated field name if needed
      } else if (
        (lesson.videoUrl || lesson.audioUrl) &&
        (lesson.videoUrl?.startsWith("http") ||
          lesson.audioUrl?.startsWith("http"))
      ) {
        const url = lesson.videoUrl || lesson.audioUrl || "";
        formData.append("url", url);
      }

      // NEW: Cover image handling
      if (lesson.coverImage && lesson.coverImage instanceof File) {
        formData.append(
          "cover_image",
          lesson.coverImage,
          lesson.coverImage.name,
        );
      }

      const response = await fetch(
        `/api/teacher/modules/${moduleId}/lessons/`,
        {
          method: "POST",
          headers: {
            "X-Session-Token": sessionToken || "",
          },
          body: formData,
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create lesson");
      }

      const data = await response.json();
      const serverLesson = data?.lesson ?? data;

      const newLesson: Lesson = {
        ...lesson,
        id: String(serverLesson.id),
        coverImageUrl: serverLesson.cover_image
          ? normalizeMedia(serverLesson.cover_image)
          : undefined,
        coverImage: null, // Clear temp file
        file: null, // Clear temp file if any
        remove_cover: false, // Reset if set
      };

      return newLesson;
    } catch (err) {
      console.error("[createLesson] Error:", err);
      throw err;
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
    if (currentModule.lessons.length === 0) {
      setError("Please add at least one lesson before creating the module.");
      return;
    }
    try {
      setIsSaving(true);
      const payload = {
        title: currentModule.title,
        description: currentModule.description,
        course_id: parseInt(currentModule.course.id),
        categoryId: categories.find((c) => c.name === currentModule.category)
          ?.id,
        difficulty: currentModule.difficulty.toLowerCase(),
        estimatedDuration: currentModule.duration, // Convert to string
        order: currentModule.order,
        active: currentModule.active,
      };
      const response = await fetch(`${BASE_URL}/modules/create/`, {
        method: "POST",
        headers: headers(sessionToken),
        body: JSON.stringify(payload),
      });
      let errorData;
      if (!response.ok) {
        try {
          errorData = await response.json();
        } catch (parseErr) {
          throw new Error("Server error occurred. Please try again later.");
        }
        if (errorData.redirect) {
          window.location.href = errorData.redirect;
          return;
        }
        if (
          errorData.error?.includes(
            "IntegrityError: duplicate key value violates unique constraint",
          )
        ) {
          setError(
            "The specified order already exists for this course. Please choose a different order.",
          );
          return;
        }
        throw new Error(
          errorData.error ||
            "Failed to create module. Please check the details and try again.",
        );
      }
      const data: APIModule = await response.json();
      const newModule: Module = {
        id: String(data.id),
        title: data.title,
        description: data.description,
        type: currentModule.type, // keep whatever the UI had
        duration: data.estimatedDuration,
        difficulty: normalizeDifficulty(data.difficulty),
        category: data.category?.name || "Uncategorized",
        enrollments: data.enrollments ?? 0,
        rating: data.rating ?? 0,
        isPublished: data.isPublished,
        createdDate: formatDate(data.createdAt || undefined),
        course: {
          id: data.course?.id ? String(data.course.id) : undefined,
          name: data.course?.name || "",
        },
        lessons: [],
        lessonCount:
          data.lessonCount ||
          currentModule.lessonCount ||
          currentModule.lessons.length,
        order: data.order,
        active: data.active,
      };

      setModules((prev) => [...prev, newModule]);

      // Now create the lessons
      const tempLessons = [...currentModule.lessons];
      const createdLessons: Lesson[] = [];
      for (const tempLesson of tempLessons) {
        try {
          const savedLesson = await createLesson(newModule.id, tempLesson);
          if (savedLesson) {
            createdLessons.push(savedLesson);
          }
        } catch (err) {
          console.error("Failed to create lesson:", err);
          // Continue, but log error
        }
      }

      // Refresh module details
      const refreshedModule = await getModuleDetails(newModule.id);
      if (refreshedModule) {
        setModules((prev) =>
          prev.map((m) => (m.id === refreshedModule.id ? refreshedModule : m)),
        );
      }

      openFeedback(
        "Module saved",
        "Module and lessons were saved successfully.",
      );
      setCurrentModule(initialModule);
      setEditingLesson(null);
      setActiveTab("manage");
    } catch (err) {
      setError(
        (err as Error).message ||
          "An unexpected error occurred while saving the module. Please try again.",
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
      setIsSaving(true);

      const payload: any = {
        title: currentModule.title,
        description: currentModule.description,
        difficulty: currentModule.difficulty.toLowerCase(),
        estimatedDuration: Number(currentModule.duration) || 0,
        order: currentModule.order,
      };

      // 🔹 Send course_id (int) for backend
      if (currentModule.course.id) {
        payload.course_id = parseInt(currentModule.course.id, 10);
      }

      // 🔹 Send categoryId (same way you do in createModule)
      const selectedCategory = categories.find(
        (c) => c.name === currentModule.category,
      );
      if (selectedCategory?.id) {
        payload.categoryId = parseInt(String(selectedCategory.id), 10);
      } else {
        // If you want to allow clearing category, send null
        // payload.categoryId = null;
      }

      const response = await fetch(
        `${BASE_URL}/modules/${currentModule.id}/update/`,
        {
          method: "PATCH",
          headers: headers(sessionToken),
          body: JSON.stringify(payload),
        },
      );

      let errorData;
      if (!response.ok) {
        try {
          errorData = await response.json();
        } catch {
          throw new Error("Server error occurred. Please try again later.");
        }
        if (response.status === 401 && errorData.redirect) {
          window.location.href = errorData.redirect;
          return;
        }
        if (
          errorData.error?.includes(
            "IntegrityError: duplicate key value violates unique constraint",
          )
        ) {
          setError(
            "The specified order already exists for this course. Please choose a different order.",
          );
          return;
        }
        throw new Error(
          errorData.error ||
            "Failed to update module. Please check the details and try again.",
        );
      }

      const data: {module: APIModule} = await response.json();

      const updatedModule: Module = {
        id: String(data.module.id),
        title: data.module.title,
        description: data.module.description,
        type: currentModule.type,
        duration: data.module.estimatedDuration,
        difficulty: normalizeDifficulty(data.module.difficulty),
        category: data.module.category?.name || "Uncategorized",
        enrollments: data.module.enrollments ?? currentModule.enrollments,
        rating: data.module.rating ?? currentModule.rating,
        isPublished: data.module.isPublished,
        createdDate: formatDate(data.module.createdAt || undefined),
        course: {
          id: data.module.course?.id
            ? String(data.module.course.id)
            : undefined,
          name: data.module.course?.name || "",
        },
        lessons: currentModule.lessons,
        lessonCount: data.module.lessonCount || currentModule.lessonCount,
        order: data.module.order || currentModule.order,
        active: data.module.active,
      };

      // Update list
      setModules((prev) =>
        prev.map((m) => (m.id === updatedModule.id ? updatedModule : m)),
      );

      // Refresh to be 100% in sync with backend (including lessons)
      const moduleData = await getModuleDetails(currentModule.id);
      if (moduleData) {
        setCurrentModule(moduleData);
      }

      openFeedback(
        "Module updated",
        `Module "${updatedModule.title}" was updated successfully.`,
      );
    } catch (err) {
      setError(
        (err as Error).message ||
          "An unexpected error occurred while updating the module. Please try again.",
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
        (err as Error).message || "An error occurred while uploading the file",
      );
      return null;
    }
  };

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
    if (editingLesson.file) {
      if (
        editingLesson.type === "video" &&
        editingLesson.file.size > MAX_VIDEO_BYTES
      ) {
        setError("Video must be 50MB or less.");
        return;
      }

      if (
        editingLesson.type === "audio" &&
        editingLesson.file.size > MAX_AUDIO_BYTES
      ) {
        setError("Audio must be 10MB or less.");
        return;
      }

      if (
        editingLesson.type === "pdf" &&
        editingLesson.file.size > MAX_PDF_BYTES
      ) {
        setError("PDF must be 5MB or less.");
        return;
      }
    }

    if (
      editingLesson.coverImage &&
      editingLesson.coverImage.size > MAX_IMAGE_BYTES
    ) {
      setError("Cover image must be 1MB or less.");
      return;
    }

    try {
      setIsSavingLesson(true);
      const formData = new FormData();
      formData.append("title", editingLesson.title);
      formData.append("type", editingLesson.type); // Updated to "type" per API
      formData.append(
        "duration",
        (durationToMinutes(editingLesson.duration) * 60).toString(),
      ); // Updated to "duration"
      formData.append("order", (currentModule.lessons.length + 1).toString());
      formData.append(
        "meta",
        JSON.stringify({
          description: editingLesson.content || "",
          tags: editingLesson.title.toLowerCase().split(" ").filter(Boolean),
        }),
      );
      formData.append("active", "true");

      // Main file handling
      if (
        editingLesson.file &&
        editingLesson.file instanceof File &&
        (editingLesson.type === "video" ||
          editingLesson.type === "audio" ||
          editingLesson.type === "pdf")
      ) {
        formData.append("file", editingLesson.file, editingLesson.file.name);
      } else if (
        editingLesson.type === "text" &&
        editingLesson.content &&
        !editingLesson.content.startsWith("http")
      ) {
        formData.append("textContent", editingLesson.content); // Updated field name if needed
      } else if (
        (editingLesson.videoUrl || editingLesson.audioUrl) &&
        (editingLesson.videoUrl?.startsWith("http") ||
          editingLesson.audioUrl?.startsWith("http"))
      ) {
        const url = editingLesson.videoUrl || editingLesson.audioUrl || "";
        formData.append("url", url);
      } else {
        console.log("[saveLesson] No file or valid URL provided");
      }

      // NEW: Cover image handling
      if (editingLesson.coverImage) {
        formData.append(
          "cover_image",
          editingLesson.coverImage,
          editingLesson.coverImage.name,
        );
      }

      // Log FormData contents for debugging

      for (const [key, value] of formData.entries()) {
        console.log(
          `[saveLesson] ${key}:`,
          typeof value === "string" ? value : `[File: ${value.name}]`,
        );
      }

      const response = await fetch(
        `/api/teacher/modules/${currentModule.id}/lessons/`,
        {
          method: "POST",
          headers: {
            "X-Session-Token": sessionToken,
          },
          body: formData,
        },
      );

      const responseText = await response.text();

      // Parse once
      let parsed: any;
      try {
        parsed = responseText ? JSON.parse(responseText) : null;
      } catch (e) {
        console.error(
          "[saveLesson] Failed to parse JSON:",
          responseText.slice(0, 200),
        );
        throw new Error("Invalid response format from server");
      }

      // Handle errors first
      if (!response.ok) {
        const errorData = parsed || {};
        console.error("[saveLesson] Fetch failed:", errorData);
        if (response.status === 401 && errorData.redirect) {
          window.location.href = errorData.redirect;
          return;
        }
        throw new Error(errorData.error || "Failed to create lesson");
      }

      // Success path — support both {lesson: {...}} and bare lesson
      const serverLesson = parsed?.lesson ?? parsed;

      const newLesson: Lesson = {
        ...editingLesson,
        id: String(serverLesson.id),
        coverImageUrl: serverLesson.cover_image
          ? normalizeMedia(serverLesson.cover_image)
          : undefined,
        coverImage: null, // Clear temp file
        file: null, // Clear temp file if any
        remove_cover: false, // Reset if set
      };

      setCurrentModule((prev) => ({
        ...prev,
        lessons: prev.lessons.map((lesson) =>
          lesson.id === editingLesson.id ? newLesson : lesson,
        ),
        lessonCount: prev.lessonCount, // Update if needed
      }));
      setEditingLesson(newLesson);
      openFeedback("Lesson saved", "Lesson saved successfully.");

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (e) {
          console.error(
            "[saveLesson] Failed to parse error response:",
            responseText.slice(0, 200),
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

      const data: {lesson: Lesson} = JSON.parse(responseText);

      // Refresh module data to sync with server
      const moduleData = await getModuleDetails(currentModule.id);
      if (moduleData) {
        setCurrentModule(moduleData);
        setModules((prev) =>
          prev.map((m) => (m.id === moduleData.id ? moduleData : m)),
        );
      }

      setEditingLesson(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset file input
      }
      alert(`Lesson created successfully! ID: ${data.lesson.id}`);
    } catch (err) {
      setError(
        (err as Error).message || "An error occurred while creating the lesson",
      );
      console.error("[saveLesson] Error:", err);
    } finally {
      setIsSavingLesson(false);
    }
  };

  const updateLesson = async (lessonId: string) => {
    if (!sessionToken) {
      setError("No session token available. Please log in again.");
      console.error("[updateLesson] No session token");
      return;
    }
    if (!currentModule.id) {
      setError("No module selected.");
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
      setIsSavingLesson(true);
      const formData = new FormData();
      formData.append("title", editingLesson.title);
      formData.append("type", editingLesson.type);
      formData.append(
        "duration",
        (durationToMinutes(editingLesson.duration) * 60).toString(),
      );
      formData.append(
        "meta",
        JSON.stringify({
          description: editingLesson.content || "",
          tags: editingLesson.title.toLowerCase().split(" ").filter(Boolean),
        }),
      );
      formData.append("active", "true");

      if (
        editingLesson.file &&
        editingLesson.file instanceof File &&
        (editingLesson.type === "video" ||
          editingLesson.type === "audio" ||
          editingLesson.type === "pdf")
      ) {
        formData.append("file", editingLesson.file, editingLesson.file.name);
      } else if (
        editingLesson.type === "text" &&
        editingLesson.content &&
        !editingLesson.content.startsWith("http")
      ) {
        formData.append("textContent", editingLesson.content);
      } else if (
        (editingLesson.videoUrl || editingLesson.audioUrl) &&
        (editingLesson.videoUrl?.startsWith("http") ||
          editingLesson.audioUrl?.startsWith("http"))
      ) {
        const url = editingLesson.videoUrl || editingLesson.audioUrl || "";
        formData.append("url", url);
      }

      if (editingLesson.coverImage) {
        formData.append(
          "cover_image",
          editingLesson.coverImage,
          editingLesson.coverImage.name,
        );
      } else if (editingLesson.remove_cover) {
        formData.append("remove_cover", "true");
      }

      for (const [key, value] of formData.entries()) {
        console.log(
          `[updateLesson] ${key}:`,
          typeof value === "string" ? value : `[File: ${value.name}]`,
        );
      }

      const response = await fetch(
        `/api/teacher/modules/${currentModule.id}/lessons/${lessonId}/`,
        {
          method: "PATCH",
          headers: {
            "X-Session-Token": sessionToken,
          },
          body: formData,
        },
      );

      const responseText = await response.text();

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (e) {
          console.error(
            "[updateLesson] Failed to parse error response:",
            responseText.slice(0, 200),
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

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error(
          "[updateLesson] Failed to parse success response:",
          responseText.slice(0, 200),
        );
        throw new Error("Invalid response format from server");
      }
      const updatedLesson: Lesson = {
        ...editingLesson,
        id: String(data.lesson.id),
        coverImageUrl: data.lesson.cover_image
          ? normalizeMedia(data.lesson.cover_image)
          : undefined,
        coverImage: null,
        file: null,
        remove_cover: false,
      };

      setCurrentModule((prev) => ({
        ...prev,
        lessons: prev.lessons.map((lesson) =>
          lesson.id === lessonId ? updatedLesson : lesson,
        ),
      }));
      setEditingLesson(updatedLesson);

      // Refresh module data to sync with server, but prioritize PATCH cover image if GET is stale
      const moduleData = await getModuleDetails(currentModule.id);
      if (moduleData) {
        setCurrentModule(moduleData);
        setModules((prev) =>
          prev.map((m) => (m.id === moduleData.id ? moduleData : m)),
        );
        const syncedLessons = moduleData.lessons.map((lesson) => {
          if (lesson.id === lessonId) {
            return {
              ...lesson,
              coverImageUrl: updatedLesson.coverImageUrl, // Override with PATCH's cover image
            };
          }
          return lesson;
        });
        setCurrentModule({...moduleData, lessons: syncedLessons});
      }

      openFeedback("Lesson updated", "Lesson was updated successfully.");
    } catch (err) {
      setError(
        (err as Error).message || "An error occurred while updating the lesson",
      );
      console.error("[updateLesson] Error:", err);
    } finally {
      setIsSavingLesson(false);
    }
  };

  // 🔧 Normalize cover image URLs so relative paths become full URLs
  const normalizeCoverImageUrl = (cover: string | null | undefined) => {
    if (!cover) return "/placeholder.jpg";
    return normalizeMedia(cover);
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

  function getFileName(input?: string | File | null): string {
    if (!input) return "";

    // If it's a File object, just return its name
    if (typeof File !== "undefined" && input instanceof File) {
      return input.name;
    }

    const str = String(input);

    // Try URL first (strips query/hash)
    try {
      const u = new URL(str);
      const name = u.pathname.split("/").filter(Boolean).pop() || "";
      return decodeURIComponent(name);
    } catch {
      // Not a URL — treat as path
      const name = str.split(/[\\/]/).filter(Boolean).pop() || "";
      return decodeURIComponent(name);
    }
  }

  return (
    <div className="space-y-4 xs:p-4 sm:p-4 max-w-full mx-auto">
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
        className="w-full">
        <TabsList className="bg-[#f797712e] text-slate-700 flex flex-col lg:flex-row w-full gap-2 mb-14">
          <TabsTrigger
            value="create"
            className="bg-transparent w-full sm:w-32 justify-center py-2 data-[state=active]:bg-[#EF7B55]/70 data-[state=active]:text-white gap-3">
            Create Module
          </TabsTrigger>
          <TabsTrigger
            value="manage"
            className="bg-transparent w-full sm:w-32 justify-center py-2 data-[state=active]:bg-[#EF7B55]/70 data-[state=active]:text-white gap-3">
            Manage Modules
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="bg-transparent w-full sm:w-32 justify-center py-2 data-[state=active]:bg-[#EF7B55]/70 data-[state=active]:text-white gap-3">
            Module Analytics
          </TabsTrigger>
          <TabsTrigger
            value="course-access"
            className="bg-transparent w-full sm:w-32 justify-center py-2 data-[state=active]:bg-[#EF7B55]/70 data-[state=active]:text-white gap-3">
            Course Access
          </TabsTrigger>
        </TabsList>
        <TabsContent value="course-access" className="space-y-3 xs:space-y-4">
          {coursesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="md" />
            </div>
          ) : coursesError ? (
            <div className="text-center py-8 text-red-500">{coursesError}</div>
          ) : (
            <div className="grid gap-3 xs:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {teacherCourses.map((c) => {
                const expired =
                  c.general_activation &&
                  c.general_activation_date &&
                  new Date(c.general_activation_date).getTime() < Date.now();
                const isPrivate =
                  (c.course_type || "").toLowerCase() === "private";

                return (
                  <Card
                    key={c.id}
                    className="flex flex-col h-full min-h-[240px]">
                    <CardHeader>
                      <CardTitle className="text-sm xs:text-base sm:text-lg line-clamp-2">
                        {c.name}
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm line-clamp-1">
                        {c.subject} • {c.classroom}
                        {c.course_type ? ` • ${c.course_type}` : ""}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="flex flex-col gap-3 flex-1">
                      <div className="flex flex-col sm:flex-row gap-2">
                        {!isPrivate && (
                          <span>
                            {" "}
                            <Badge
                              variant={
                                c.general_activation ? "default" : "secondary"
                              }
                              className={
                                c.general_activation
                                  ? "bg-[#EF7B55]/70 px-2"
                                  : "bg-gray-500 text-white"
                              }>
                              {c.general_activation
                                ? "General Access ON"
                                : "General Access OFF"}
                            </Badge>{" "}
                          </span>
                        )}
                        {isPrivate && (
                          <Badge className="bg-gray-700 text-white">
                            Private
                          </Badge>
                        )}

                        {c.general_activation && (
                          <Badge variant="outline">
                            Expiry:{" "}
                            {c.general_activation_date
                              ? new Date(
                                  c.general_activation_date,
                                ).toLocaleDateString()
                              : "No expiry"}
                          </Badge>
                        )}
                      </div>

                      {c.general_activation &&
                        c.general_activation_date &&
                        new Date(c.general_activation_date).getTime() <
                          Date.now() && (
                          <Badge className="bg-red-600/80 text-white w-fit">
                            Expired
                          </Badge>
                        )}

                      <Button
                        onClick={() => openGA(c)}
                        disabled={isPrivate}
                        className={`w-full text-xs xs:text-sm sm:text-base shadow-md mt-auto ${
                          isPrivate
                            ? "opacity-50 cursor-not-allowed"
                            : "bg-[#f79771]/70 hover:bg-[#EF7B55]/90"
                        }`}>
                        {isPrivate
                          ? "Not available for private courses"
                          : "Update Access"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="create" className="space-y-3 xs:space-y-4">
          {isLoadingCourses || isLoadingCategories ? (
            <div className="relative min-h-[200px] flex items-center justify-center bg-gray-100/50 rounded-lg">
              <Spinner size="md" className="text-[#EF7B55]" />
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
                      className="text-xs xs:text-sm sm:text-base">
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
                      className="text-xs xs:text-sm sm:text-base">
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
                      className="text-xs xs:text-sm sm:text-base">
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
                        }>
                        <SelectTrigger className="text-xs xs:text-sm sm:text-base">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem
                            value="Beginner"
                            className="text-xs xs:text-sm sm:text-base">
                            Beginner
                          </SelectItem>
                          <SelectItem
                            value="Intermediate"
                            className="text-xs xs:text-sm sm:text-base">
                            Intermediate
                          </SelectItem>
                          <SelectItem
                            value="Advanced"
                            className="text-xs xs:text-sm sm:text-base">
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
                      }>
                      <SelectTrigger className="text-xs xs:text-sm sm:text-base">
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          value="none"
                          className="text-xs xs:text-sm sm:text-base">
                          Select course
                        </SelectItem>
                        {courses
                          .filter((course) => course.id)
                          .map((course) => (
                            <SelectItem
                              key={course.id}
                              value={course.id}
                              className="text-xs xs:text-sm sm:text-base">
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
                      }>
                      <SelectTrigger className="text-xs xs:text-sm sm:text-base">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          value="none"
                          className="text-xs xs:text-sm sm:text-base">
                          Select category
                        </SelectItem>
                        {categories
                          .filter((category) => category.name)
                          .map((category) => (
                            <SelectItem
                              key={category.id}
                              value={category.name}
                              className="text-xs xs:text-sm sm:text-base">
                              {category.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="duration"
                      className="text-xs xs:text-sm sm:text-base">
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
                      placeholder="e.g., 37"
                      className="text-xs xs:text-sm sm:text-base"
                    />
                    <p className="text-[0.7rem] text-muted-foreground">
                      Enter total minutes (e.g., 37 for 37 minutes)
                    </p>
                  </div>

                  <div className="pt-2 xs:pt-3 space-y-2">
                    <div className="flex justify-between text-[0.85rem] xs:text-xs sm:text-sm">
                      <span>Total Lessons:</span>
                      <span>{currentModule.lessonCount}</span>
                    </div>
                  </div>

                  {error && (
                    <p className="text-red-500 text-[0.85rem] xs:text-xs sm:text-sm">
                      {error}
                    </p>
                  )}

                  <div className="pt-2 xs:pt-3 space-y-2">
                    <Button
                      onClick={currentModule.id ? updateModule : saveModule}
                      className="w-full text-xs xs:text-sm sm:text-base bg-[#f79771]/70 hover:bg-[#f79771]/80 shadow-md"
                      disabled={isSaving}>
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
                          !currentModule.isPublished,
                        )
                      }
                      variant="outline"
                      className="w-full bg-transparent text-xs xs:text-sm sm:text-base"
                      disabled={!currentModule.id}>
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
                      className="text-xs xs:text-sm sm:text-base bg-[#f79771]/70 hover:bg-[#f79771] shadow-md">
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
                          onClick={() => setEditingLesson(lesson)}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1 max-w-[85%]">
                              {/* Header row */}
                              <div className="flex items-center gap-1 xs:gap-2 mb-1">
                                <Icon className="h-3 w-3 xs:h-4 xs:w-4" />

                                <span className="text-[0.85rem] xs:text-xs sm:text-sm font-medium whitespace-nowrap">
                                  Lesson {index + 1}
                                </span>

                                <Badge
                                  variant="outline"
                                  className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs whitespace-nowrap">
                                  {lesson.type}
                                </Badge>

                                {normalizeCoverImageUrl(
                                  lesson.coverImageUrl,
                                ) && (
                                  <img
                                    src={normalizeCoverImageUrl(
                                      lesson.coverImageUrl,
                                    )}
                                    alt="Cover"
                                    onError={(e) => {
                                      e.currentTarget.src = "/placeholder.jpg";
                                    }}
                                    className="w-6 h-4 object-cover rounded ml-1 shrink-0"
                                  />
                                )}
                              </div>

                              {/* Title with 2-line ellipsis */}
                              <p className="text-[0.85rem] xs:text-xs sm:text-sm line-clamp-2 overflow-hidden text-ellipsis">
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
                              className="p-1 xs:p-2 shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteLesson(lesson.id);
                              }}>
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
                      {/* Cover Image Section */}
                      <div className="space-y-2">
                        <Label className="text-xs xs:text-sm sm:text-base">
                          Cover Image
                        </Label>
                        {editingLesson.coverImageUrl &&
                        !editingLesson.coverImage &&
                        !editingLesson.remove_cover ? (
                          <div className="flex items-center gap-2">
                            <img
                              src={normalizeCoverImageUrl(
                                editingLesson.coverImageUrl,
                              )}
                              alt="Cover"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder-cover.png";
                              }}
                              className="h-16 w-16 object-cover rounded"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs xs:text-sm sm:text-base shadow-md"
                              onClick={() =>
                                updateLessonFields(editingLesson.id, {
                                  remove_cover: true,
                                  coverImage: null,
                                })
                              }>
                              Remove Cover
                            </Button>
                          </div>
                        ) : editingLesson.coverImage ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={editingLesson.coverImage.name}
                              readOnly
                              className="text-xs xs:text-sm sm:text-base bg-gray-100"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs xs:text-sm sm:text-base shadow-md"
                              onClick={() =>
                                updateLessonFields(editingLesson.id, {
                                  coverImage: null,
                                  remove_cover: false,
                                })
                              }>
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <>
                            <input
                              type="file"
                              ref={coverImageInputRef}
                              className="hidden"
                              accept="image/jpeg,image/png,image/gif"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;

                                if (file.size > MAX_IMAGE_BYTES) {
                                  openFeedback(
                                    "Cover image too large",
                                    `Please upload an image up to 1MB. Selected: ${formatBytes(file.size)}`,
                                  );
                                  e.currentTarget.value = ""; // reset so user can re-select
                                  return;
                                }

                                updateLessonFields(editingLesson.id, {
                                  coverImage: file,
                                  remove_cover: false,
                                });
                              }}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full bg-transparent text-xs xs:text-sm sm:text-base shadow-md"
                              onClick={() =>
                                coverImageInputRef.current?.click()
                              }>
                              <Upload className="mr-1 xs:mr-2 h-2.5 w-2.5 xs:h-3 xs:w-3" />
                              Upload Cover Image
                            </Button>
                          </>
                        )}
                      </div>
                      {/* Lesson Type */}
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
                              file: null,
                              coverImage: null, // Reset cover when changing type
                            })
                          }>
                          <SelectTrigger className="text-xs xs:text-sm sm:text-base">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem
                              value="video"
                              className="text-xs xs:text-sm sm:text-base">
                              Video
                            </SelectItem>
                            <SelectItem
                              value="audio"
                              className="text-xs xs:text-sm sm:text-base">
                              Audio
                            </SelectItem>
                            <SelectItem
                              value="pdf"
                              className="text-xs xs:text-sm sm:text-base">
                              PDF
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="lesson-title"
                          className="text-xs xs:text-sm sm:text-base font-medium">
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
                          Duration (Minutes)
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

                      {/* Video Upload */}
                      {editingLesson.type === "video" && (
                        <div className="space-y-2">
                          <Label className="text-xs xs:text-sm sm:text-base">
                            Video{" "}
                            {editingLesson.file ? "File (Selected)" : "Upload"}
                          </Label>
                          {editingLesson.file ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={getFileName(
                                  editingLesson.file || editingLesson.videoUrl,
                                )}
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
                                }>
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
                                  if (!file) return;

                                  if (file.size > MAX_VIDEO_BYTES) {
                                    openFeedback(
                                      "Video too large",
                                      `Please upload a video up to 50MB. Selected: ${formatBytes(file.size)}`,
                                    );
                                    e.currentTarget.value = "";
                                    return;
                                  }

                                  updateLessonFields(editingLesson.id, {file});
                                }}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full bg-transparent text-xs xs:text-sm sm:text-base shadow-md"
                                onClick={() => fileInputRef.current?.click()}>
                                <Upload className="mr-1 xs:mr-2 h-2.5 w-2.5 xs:h-3 xs:w-3" />
                                Upload Video
                              </Button>
                            </>
                          )}
                        </div>
                      )}

                      {/* Audio Upload */}
                      {editingLesson.type === "audio" && (
                        <div className="space-y-2">
                          <Label className="text-xs xs:text-sm sm:text-base">
                            Audio{" "}
                            {editingLesson.file ? "File (Selected)" : "Upload"}
                          </Label>
                          {editingLesson.file ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={getFileName(
                                  editingLesson.file || editingLesson.videoUrl,
                                )}
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
                                }>
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
                                  if (!file) return;

                                  if (file.size > MAX_AUDIO_BYTES) {
                                    openFeedback(
                                      "Audio file too large",
                                      `Maximum allowed size is 10MB. Selected: ${formatBytes(file.size)}`,
                                    );
                                    e.currentTarget.value = "";
                                    return;
                                  }

                                  updateLessonFields(editingLesson.id, {file});
                                }}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full bg-transparent text-xs xs:text-sm sm:text-base shadow-md"
                                onClick={() => fileInputRef.current?.click()}>
                                <Upload className="mr-1 xs:mr-2 h-2.5 w-2.5 xs:h-3 xs:w-3" />
                                Upload Audio
                              </Button>
                            </>
                          )}
                        </div>
                      )}

                      {/* PDF Upload */}
                      {editingLesson.type === "pdf" && (
                        <div className="space-y-2">
                          <Label className="text-xs xs:text-sm sm:text-base">
                            PDF{" "}
                            {editingLesson.file ? "File (Selected)" : "Upload"}
                          </Label>
                          {editingLesson.file ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={getFileName(
                                  editingLesson.file || editingLesson.videoUrl,
                                )}
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
                                }>
                                Remove
                              </Button>
                            </div>
                          ) : (
                            <>
                              <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="application/pdf,application/epub+zip,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;

                                  if (file.size > MAX_PDF_BYTES) {
                                    openFeedback(
                                      "PDF too large",
                                      `Maximum allowed size is 5MB. Selected: ${formatBytes(file.size)}`,
                                    );
                                    e.currentTarget.value = "";
                                    return;
                                  }

                                  updateLessonFields(editingLesson.id, {file});
                                }}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full bg-transparent text-xs xs:text-sm sm:text-base shadow-md"
                                onClick={() => fileInputRef.current?.click()}>
                                <Upload className="mr-1 xs:mr-2 h-2.5 w-2.5 xs:h-3 xs:w-3" />
                                Upload PDF
                              </Button>
                            </>
                          )}
                        </div>
                      )}

                      {/* Text Upload - Simplified, as per original */}
                      {editingLesson.type === "text" && (
                        <div className="space-y-2">
                          <Label className="text-xs xs:text-sm sm:text-base">
                            Content
                          </Label>
                          <Textarea
                            value={editingLesson.content || ""}
                            onChange={(e) =>
                              updateLessonFields(editingLesson.id, {
                                content: e.target.value,
                              })
                            }
                            placeholder="Write your lesson content here..."
                            rows={4}
                            className="text-xs xs:text-sm sm:text-base"
                          />
                        </div>
                      )}

                      <Button
                        onClick={() =>
                          typeof editingLesson.id === "string" &&
                          editingLesson.id.startsWith("temp")
                            ? saveLesson()
                            : updateLesson(editingLesson.id)
                        }
                        className="w-full text-xs xs:text-sm sm:text-base bg-[#f79771]/70 hover:bg-[#f79771]/80"
                        disabled={isSavingLesson}>
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

        {/* Manage and Analytics tabs remain the same as original */}
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
            <div className="flex flex-col gap-3 w-full">
              {/* Search */}
              <div className="flex gap-2 w-full">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search modules..."
                    onKeyDown={(e) =>
                      e.key === "Enter" && setSearch(searchQuery)
                    }
                    className="pl-8 text-sm"
                  />
                </div>

                <Button
                  onClick={() => setSearch(searchQuery)}
                  className="px-3 bg-[#f79771] hover:bg-gray-300 shadow-md">
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex gap-3 w-full">
                <Select
                  value={difficultyFilter}
                  onValueChange={setDifficultyFilter}>
                  <SelectTrigger className="w-full text-sm">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={courseFilter} onValueChange={setCourseFilter}>
                  <SelectTrigger className="w-full text-sm">
                    <SelectValue placeholder="All Courses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {courses
                      .filter((c) => c.id)
                      .map((course) => (
                        <SelectItem key={course.id} value={String(course.id)}>
                          {course.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full text-sm">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories
                      .filter((cat) => cat.id)
                      .map((category) => (
                        <SelectItem
                          key={category.id}
                          value={String(category.id)}>
                          {category.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                {/* Create Button */}
                <Button
                  onClick={() => {
                    setCurrentModule(initialModule);
                    setActiveTab("create");
                  }}
                  className="
        w-full
        lg:w-auto
        bg-[#f79771]
        hover:bg-gray-300
        shadow-md
        text-sm
        flex items-center justify-center
      ">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New
                </Button>
              </div>
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
                  currentPageManage,
                ).paginatedModules.map((module) => {
                  const Icon = getTypeIcon(module.type);
                  return (
                    <Card
                      key={module.id}
                      className="hover:shadow-lg transition-shadow flex flex-col h-full">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <CardTitle
                              className="text-sm xs:text-base sm:text-lg"
                              title={module.title}>
                              {shortenText(module.title, 45)}
                            </CardTitle>

                            <CardDescription
                              className="text-xs sm:text-sm"
                              title={module.description}>
                              {shortenText(module.description, 90)}
                            </CardDescription>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={async () => {
                                  const moduleData = await getModuleDetails(
                                    module.id,
                                  );
                                  if (moduleData) {
                                    setCurrentModule(moduleData);
                                    setActiveTab("create");
                                  }
                                }}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={async () => {
                                  const moduleData = await getModuleDetails(
                                    module.id,
                                  );
                                  if (moduleData) {
                                    setPreviewModule(moduleData);
                                    setIsPreviewOpen(true);
                                  }
                                }}>
                                <Eye className="mr-2 h-4 w-4" />
                                <span>Preview</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleDeleteModuleClick(module.id)
                                }
                                className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>

                      <CardContent className="flex flex-col flex-1 justify-between space-y-3 xs:space-y-4">
                        <div>
                          <div className="flex items-center flex-wrap gap-2">
                            <Badge
                              variant={
                                module.isPublished ? "default" : "secondary"
                              }
                              className={
                                module.isPublished
                                  ? "bg-[#EF7B55]/70 hover:bg-[#EF7B55]/80"
                                  : "bg-gray-500 text-white hover:bg-gray-600"
                              }>
                              {module.isPublished ? "Published" : "Draft"}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="text-[0.85rem] xs:text-xs sm:text-sm">
                              {module.difficulty}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="text-[0.85rem] xs:text-xs sm:text-sm">
                              {module.category || "Uncategorized"}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="text-[0.85rem] xs:text-xs sm:text-sm">
                              {module.course.name}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-3 xs:gap-4 text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground mt-3">
                            <div className="flex items-center gap-1">
                              <Clock className="h-2.5 w-2.5 xs:h-3 xs:w-3" />
                              {module.duration} min
                            </div>
                            <div>{module.createdDate}</div>
                          </div>
                        </div>

                        {/* 👇 Buttons pushed to bottom */}
                        <div className="flex gap-2 flex-col lg:flex-row mt-auto">
                          <Button
                            className="flex-1 text-xs xs:text-sm sm:text-base bg-[#f79771]/70 hover:bg-[#f79771]/90"
                            disabled={loadingModuleId === module.id}
                            onClick={async () => {
                              setLoadingModuleId(module.id); // 🔹 start loading
                              try {
                                const moduleData = await getModuleDetails(
                                  module.id,
                                );
                                if (moduleData) {
                                  setCurrentModule(moduleData);
                                  setActiveTab("create");
                                }
                              } finally {
                                setLoadingModuleId(null); // 🔹 stop loading
                              }
                            }}>
                            {loadingModuleId === module.id ? (
                              <>
                                <Spinner
                                  size="sm"
                                  className="mr-1 xs:mr-2 text-white"
                                />
                                Loading...
                              </>
                            ) : (
                              <>
                                <Edit className="mr-1 xs:mr-2 h-2.5 w-2.5 xs:h-3 xs:w-3" />
                                Edit
                              </>
                            )}
                          </Button>

                          <Button
                            variant="outline"
                            className="flex-1 text-xs xs:text-sm sm:text-base"
                            disabled={loadingModuleId === module.id}
                            onClick={async () => {
                              setLoadingModuleId(module.id);
                              try {
                                const moduleData = await getModuleDetails(
                                  module.id,
                                );
                                if (moduleData) {
                                  setPreviewModule(moduleData);
                                  setIsPreviewOpen(true);
                                }
                              } finally {
                                setLoadingModuleId(null);
                              }
                            }}>
                            {loadingModuleId === module.id ? (
                              <>
                                <Spinner size="sm" className="mr-1 xs:mr-2" />
                                Loading...
                              </>
                            ) : (
                              <>
                                <Eye className="mr-1 xs:mr-2 h-2.5 w-2.5 xs:h-3 xs:w-3" />
                                Preview
                              </>
                            )}
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
                      (_, index) => index + 1,
                    ).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          isActive={currentPageManage === page}
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPageManage(page);
                          }}>
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
                              .totalPages,
                          ),
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
          {analyticsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="md" />
            </div>
          ) : analyticsError ? (
            <div className="text-center py-8 text-red-500">
              {analyticsError}
            </div>
          ) : analytics ? (
            <>
              <div>
                <h2 className="text-lg xs:text-xl sm:text-2xl font-bold">
                  Module Analytics
                </h2>
                <p className="text-muted-foreground text-[0.85rem] xs:text-xs sm:text-sm">
                  Track performance and engagement of your learning modules
                </p>
              </div>

              {/*  */}

              <div className="grid gap-3 xs:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-1 xs:pb-2">
                    <CardTitle className="text-[0.85rem] xs:text-xs sm:text-sm font-medium">
                      Total Enrollments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg xs:text-xl sm:text-2xl font-bold">
                      {analytics.aggregates.total_enrollments}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-1 xs:pb-2">
                    <CardTitle className="text-[0.85rem] xs:text-xs sm:text-sm font-medium">
                      Avg. Completion Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg xs:text-xl sm:text-2xl font-bold">
                      {analytics.aggregates.completion_rate.toFixed(1)}%
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm xs:text-base sm:text-lg">
                    Module Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground mb-2">
                    Page {analytics.pagination.current_page} of{" "}
                    {analytics.pagination.total_pages}
                  </div>
                  <div className="space-y-2 xs:space-y-3">
                    {analytics.modules.length === 0 ? (
                      <p className="text-center py-8 text-muted-foreground">
                        No modules found
                      </p>
                    ) : (
                      analytics.modules.map((module) => (
                        <div
                          key={module.id}
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 xs:p-4 border rounded-lg">
                          <div className="space-y-1 flex-1">
                            <h4 className="font-medium text-[0.85rem] xs:text-xs sm:text-sm">
                              {module.title}
                            </h4>
                            <div className="flex flex-wrap items-center gap-2 xs:gap-3 text-[0.6rem] xs:text-[0.65rem] sm:text-xs text-muted-foreground">
                              {/*<div>
                                Completion: {module.completion.toFixed(1)}%
                              </div>*/}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {analytics.pagination.total_pages > 1 && (
                    <Pagination className="mt-4">
                      <PaginationContent>
                        <PaginationPrevious
                          onClick={() =>
                            setCurrentPageAnalytics((p) => Math.max(p - 1, 1))
                          }
                          className={
                            currentPageAnalytics === 1
                              ? "pointer-events-none opacity-50"
                              : ""
                          }
                        />
                        {Array.from(
                          {length: analytics.pagination.total_pages},
                          (_, i) => (
                            <PaginationItem key={i + 1}>
                              <PaginationLink
                                isActive={currentPageAnalytics === i + 1}
                                onClick={() => setCurrentPageAnalytics(i + 1)}>
                                {i + 1}
                              </PaginationLink>
                            </PaginationItem>
                          ),
                        )}
                        <PaginationNext
                          onClick={() =>
                            setCurrentPageAnalytics((p) =>
                              Math.min(p + 1, analytics.pagination.total_pages),
                            )
                          }
                          className={
                            currentPageAnalytics ===
                            analytics.pagination.total_pages
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
          ) : null}
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

      {/* Feedback Dialog */}
      <AlertDialog
        open={feedbackDialog.open}
        onOpenChange={(open) => setFeedbackDialog((prev) => ({...prev, open}))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{feedbackDialog.title}</AlertDialogTitle>
            {feedbackDialog.description && (
              <AlertDialogDescription>
                {feedbackDialog.description}
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() =>
                setFeedbackDialog((prev) => ({...prev, open: false}))
              }>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm Delete Module Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete module?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              module and all its lessons.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeleteDialogOpen(false);
                setModuleToDelete(null);
              }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleConfirmDeleteModule}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={gaDialogOpen} onOpenChange={setGaDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Course general access</AlertDialogTitle>
            <AlertDialogDescription>
              {gaCourse ? (
                <>
                  Configure general access for <b>{gaCourse.name}</b>.
                  <br />
                  Students can log in without subscription when enabled, but
                  lesson access stops after expiry.
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between gap-3">
              <Label className="text-sm">Enable general activation</Label>
              <input
                type="checkbox"
                checked={gaEnabled}
                onChange={(e) => setGaEnabled(e.target.checked)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Expiry date (optional)</Label>
              <Input
                type="datetime-local"
                value={gaDateLocal}
                onChange={(e) => setGaDateLocal(e.target.value)}
                disabled={!gaEnabled}
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={gaSaving}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={saveGA} disabled={gaSaving}>
              {gaSaving ? "Saving..." : "Save"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// "use client";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
// import {useState, useRef, useEffect} from "react";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {Button} from "@/components/ui/button";
// import {Input} from "@/components/ui/input";
// import {Label} from "@/components/ui/label";
// import {Textarea} from "@/components/ui/textarea";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {Badge} from "@/components/ui/badge";
// import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
// import {
//   Plus,
//   Video,
//   Headphones,
//   FileText,
//   BookOpen,
//   Edit,
//   Trash2,
//   Eye,
//   Users,
//   Clock,
//   Star,
//   Save,
//   Upload,
//   Search,
// } from "lucide-react";
// import {
//   Pagination,
//   PaginationContent,
//   PaginationEllipsis,
//   PaginationItem,
//   PaginationLink,
//   PaginationNext,
//   PaginationPrevious,
// } from "@/components/ui/pagination";
// import {getSession} from "next-auth/react";
// import {PreviewModal} from "@/components/ui/teacher-preview-modal"; // Adjust path based on your project structure
// import {Spinner} from "../ui/spinner";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import {MoreVertical} from "lucide-react";
// // Interfaces
// interface Course {
//   id: string;
//   name: string;
// }
// interface Category {
//   id: string;
//   name: string;
// }
// interface Lesson {
//   id: string;
//   title: string;
//   type: "video" | "audio" | "pdf" | "text" | "quiz";
//   duration: string;
//   videoUrl?: string;
//   audioUrl?: string;
//   content?: string;
//   file?: File | null;
//   coverImage?: File | null; // NEW: Cover image file
//   coverImageUrl?: string; // NEW: Existing cover image URL
//   order?: number;
//   active?: boolean;
//   remove_cover: boolean; // NEW: Flag to indicate cover removal
//   meta?: {description: string; tags: string[]};
// }
// interface Module {
//   id: string;
//   title: string;
//   description: string;
//   type: "video" | "audio" | "document" | "tutorial";
//   duration: number; // Store duration as minutes internally
//   difficulty: "Beginner" | "Intermediate" | "Advanced";
//   category?: string;
//   enrollments: number;
//   rating: number;
//   isPublished: boolean;
//   createdDate: string;
//   lessons: Lesson[];
//   lessonCount: number;
//   order: number;
//   active: boolean;
//   course: {id?: string; name: string};
// }
// interface APIModule {
//   id: string | number;
//   title: string;
//   description: string;
//   difficulty: string;
//   category: {id: string | number; name: string} | null;
//   estimatedDuration: number;
//   order: number;
//   active: boolean;
//   isPublished: boolean;
//   course: {id: string | number; name: string} | null;
//   createdAt: string | null;
//   updatedAt: string | null;
//   lessons: any[];
//   lessonCount: number;
//   // optional fields
//   enrollments?: number;
//   rating?: number;
//   // 👇 important: make type compatible with Module["type"]
//   type?: Module["type"] | string;
// }
// interface APIError {
//   error: string;
//   redirect?: string;
// }
// type TeacherCourse = {
//   id: string;
//   name: string;
//   subject: string;
//   classroom: string;
//   description: string;
//   isActive: boolean;
//   course_type?: string;
//   general_activation?: boolean;
//   general_activation_date?: string | null;
// };

// type UploadProgress = {
//   percent: number; // 0..100
//   loaded: number; // bytes
//   total: number; // bytes
// };

// type UploadOptions = {
//   url: string;
//   method: "POST" | "PATCH";
//   sessionToken: string;
//   apiKey: string;
//   body: FormData;
//   onProgress?: (p: UploadProgress) => void;
// };

// const BASE_URL = "/api/teacher"; // Updated to match lesson routes; adjust module routes accordingly
// const headers = (sessionToken: string | null) => ({
//   Authorization: ``,
//   "Content-Type": "application/json",
//   ...(sessionToken && {"X-Session-Token": sessionToken}),
// });
// // Utilities
// const durationToMinutes = (duration: string): number => {
//   if (!duration) return 0;
//   duration = String(duration);
//   const parts = duration.match(/(\d+)h\s*(\d+)m/);
//   if (!parts) return parseInt(duration) || 0;
//   const hours = parseInt(parts[1]) || 0;
//   const minutes = parseInt(parts[2]) || 0;
//   return hours * 60 + minutes;
// };
// const minutesToDuration = (
//   minutes: number | string | null | undefined,
// ): string => {
//   const total = Number(minutes);
//   if (!total || isNaN(total)) return "0m";
//   const hours = Math.floor(total / 60);
//   const mins = total % 60;
//   return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
// };
// const formatDate = (dateString: string | undefined): string => {
//   if (!dateString) return "";
//   const date = new Date(dateString);
//   return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
// };
// const shortenText = (text: string, maxLength: number) => {
//   if (!text) return "";
//   return text.length > maxLength ? text.slice(0, maxLength).trim() + "…" : text;
// };
// const normalizeDifficulty = (difficulty: string): Module["difficulty"] => {
//   const v = (difficulty || "").toLowerCase();
//   if (v === "beginner") return "Beginner";
//   if (v === "intermediate") return "Intermediate";
//   if (v === "advanced") return "Advanced";
//   // Fallback
//   return "Beginner";
// };
// const normalizeModuleType = (t?: string): Module["type"] => {
//   switch ((t || "").toLowerCase()) {
//     case "video":
//       return "video";
//     case "audio":
//       return "audio";
//     case "document":
//       return "document";
//     case "tutorial":
//       return "tutorial";
//     default:
//       return "video"; // sensible default
//   }
// };
// export function TeacherLearningModules() {
//   const DJANGO_BASE =
//     process.env.NEXT_PUBLIC_DJANGO_BASE_URL ||
//     "https://texagon-backend.onrender.com";
//   const UPLOAD_BUCKET = process.env.NEXT_PUBLIC_UPLOAD_BUCKET || "s3";

//   const [teacherCourses, setTeacherCourses] = useState<TeacherCourse[]>([]);
//   const [coursesLoading, setCoursesLoading] = useState(false);
//   const [coursesError, setCoursesError] = useState<string | null>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const [activeTab, setActiveTab] = useState("create");
//   const [previewModule, setPreviewModule] = useState<Module | null>(null);
//   const [isPreviewOpen, setIsPreviewOpen] = useState(false);
//   const initialModule: Module = {
//     id: "",
//     title: "",
//     description: "",
//     type: "video",
//     duration: 0,
//     difficulty: "Beginner",
//     category: undefined,
//     enrollments: 0,
//     rating: 0,
//     isPublished: false,
//     createdDate: new Date().toISOString().split("T")[0],
//     lessons: [],
//     lessonCount: 0,
//     order: 1,
//     active: true,
//     course: {id: undefined, name: ""},
//   };
//   const [currentModule, setCurrentModule] = useState<Module>(initialModule);
//   const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
//   const [currentPageManage, setCurrentPageManage] = useState(1);
//   const [currentPageAnalytics, setCurrentPageAnalytics] = useState(1);
//   const [modules, setModules] = useState<Module[]>([]);
//   const [courses, setCourses] = useState<Course[]>([]);
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [isLoadingModules, setIsLoadingModules] = useState(false);
//   const [isLoadingCourses, setIsLoadingCourses] = useState(false);
//   const [isLoadingCategories, setIsLoadingCategories] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [search, setSearch] = useState("");
//   const [isSaving, setIsSaving] = useState(false);
//   const [isSavingLesson, setIsSavingLesson] = useState(false);
//   const [difficultyFilter, setDifficultyFilter] = useState("Beginner");
//   const [sessionToken, setSessionToken] = useState<string | null>(null);
//   const modulesPerPage = 3;
//   const coverImageInputRef = useRef<HTMLInputElement>(null); // Add this
//   const [loadingModuleId, setLoadingModuleId] = useState<string | null>(null);
//   const [analytics, setAnalytics] = useState<{
//     aggregates: {total_enrollments: number; completion_rate: number};
//     pagination: {
//       total_count: number;
//       total_pages: number;
//       current_page: number;
//       page_size: number;
//     };
//     modules: Module[];
//   } | null>(null);
//   const [analyticsLoading, setAnalyticsLoading] = useState(false);
//   const [analyticsError, setAnalyticsError] = useState<string | null>(null);
//   const [searchQuery, setSearchQuery] = useState(""); // NEW: Controlled input
//   const [courseFilter, setCourseFilter] = useState<string>("all");
//   const [categoryFilter, setCategoryFilter] = useState<string>("all");
//   // Feedback dialog for success/info messages
//   const [feedbackDialog, setFeedbackDialog] = useState<{
//     open: boolean;
//     title: string;
//     description?: string;
//   }>({
//     open: false,
//     title: "",
//     description: "",
//   });
//   const [gaDialogOpen, setGaDialogOpen] = useState(false);
//   const [gaCourse, setGaCourse] = useState<TeacherCourse | null>(null);
//   const [gaEnabled, setGaEnabled] = useState(false);
//   const [gaDateLocal, setGaDateLocal] = useState<string>(""); // datetime-local
//   const [gaSaving, setGaSaving] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState<number>(0);
//   const [isUploading, setIsUploading] = useState(false);
//   const [uploading, setUploading] = useState(false);
//   const [uploadInfo, setUploadInfo] = useState({
//     percent: 0,
//     loaded: 0,
//     total: 0,
//   });
//   const [uploadPhase, setUploadPhase] = useState<
//     "idle" | "uploading" | "finalizing"
//   >("idle");
//   const MAX_IMAGE_BYTES = 1 * 1024 * 1024; // 1MB
//   const MAX_VIDEO_BYTES = 500 * 1024 * 1024; // 50MB
//   const MAX_AUDIO_BYTES = 20 * 1024 * 1024; // 10MB
//   const MAX_PDF_BYTES = 10 * 1024 * 1024; // 5MB

//   async function uploadMediaByBucket(
//     file: File,
//     sessionToken: string,
//     onProgress?: (p: UploadProgress) => void,
//   ): Promise<string> {
//     if (UPLOAD_BUCKET === "cloudinary") {
//       return uploadToCloudinaryWithProgress(file, sessionToken, onProgress);
//     }

//     // default → S3
//     return uploadToS3WithProgress(file, sessionToken, onProgress);
//   }

//   async function uploadToCloudinaryWithProgress(
//     file: File,
//     sessionToken: string,
//     onProgress?: (p: UploadProgress) => void,
//   ) {
//     const sig = await fetch(
//       `${DJANGO_BASE}/learning/api/cloudinary-signature/`,
//       {
//         headers: {"X-Session-Token": sessionToken},
//       },
//     ).then(async (r) => {
//       const j = await r.json().catch(() => ({}));
//       if (!r.ok)
//         throw new Error(j?.detail || j?.error || "Cloudinary signature failed");
//       return j;
//     });

//     const fd = new FormData();
//     fd.append("file", file);
//     fd.append("api_key", sig.api_key);
//     fd.append("timestamp", String(sig.timestamp));
//     fd.append("signature", sig.signature);
//     fd.append("folder", sig.folder);

//     const resource =
//       file.type.startsWith("video/") || file.type.startsWith("audio/")
//         ? "video"
//         : "raw"; // pdf/doc

//     const url = `https://api.cloudinary.com/v1_1/${sig.cloud_name}/${resource}/upload`;

//     const data = await new Promise<any>((resolve, reject) => {
//       const xhr = new XMLHttpRequest();
//       xhr.open("POST", url, true);

//       xhr.upload.onprogress = (e) => {
//         if (!e.lengthComputable) return;
//         const percent = Math.min(99, Math.floor((e.loaded / e.total) * 100));
//         onProgress?.({percent, loaded: e.loaded, total: e.total});
//       };

//       xhr.onload = () => {
//         const json = JSON.parse(xhr.responseText || "{}");
//         if (xhr.status >= 200 && xhr.status < 300) {
//           onProgress?.({percent: 100, loaded: file.size, total: file.size});
//           resolve(json);
//         } else {
//           reject(new Error(json?.error?.message || "Cloudinary upload failed"));
//         }
//       };

//       xhr.onerror = () => reject(new Error("Cloudinary network error"));
//       xhr.send(fd);
//     });

//     return data.secure_url as string;
//   }

//   async function uploadToS3WithProgress(
//     file: File,
//     sessionToken: string,
//     onProgress?: (p: UploadProgress) => void,
//   ) {
//     // 1) Get presigned url from Django
//     const pres = await fetch(`${DJANGO_BASE}/learning/api/presign-s3/`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "X-Session-Token": sessionToken,
//       },
//       body: JSON.stringify({
//         filename: file.name,
//         content_type: file.type || "application/octet-stream",
//       }),
//     }).then(async (r) => {
//       const j = await r.json().catch(() => ({}));
//       if (!r.ok)
//         throw new Error(j?.detail || j?.error || "Failed to presign S3 upload");
//       return j;
//     });

//     // pres.upload_url (PUT) + pres.file_url (public url)

//     // 2) Upload to S3 using PUT
//     await new Promise<void>((resolve, reject) => {
//       const xhr = new XMLHttpRequest();
//       xhr.open("PUT", pres.upload_url, true);
//       xhr.setRequestHeader(
//         "Content-Type",
//         file.type || "application/octet-stream",
//       );

//       xhr.upload.onprogress = (evt) => {
//         if (!evt.lengthComputable) return;
//         const percent = Math.min(
//           99,
//           Math.floor((evt.loaded / evt.total) * 100),
//         );
//         onProgress?.({percent, loaded: evt.loaded, total: evt.total});
//       };

//       xhr.onload = () => {
//         if (xhr.status >= 200 && xhr.status < 300) {
//           onProgress?.({percent: 100, loaded: file.size, total: file.size});
//           resolve();
//         } else {
//           reject(new Error(`S3 upload failed (${xhr.status})`));
//         }
//       };

//       xhr.onerror = () => reject(new Error("Network error during S3 upload"));
//       xhr.send(file);
//     });

//     return pres.key as string;
//   }

//   function uploadWithProgress<T = any>({
//     url,
//     method,
//     sessionToken,
//     apiKey,
//     body,
//     onProgress,
//   }: UploadOptions): Promise<T> {
//     return new Promise((resolve, reject) => {
//       const xhr = new XMLHttpRequest();
//       xhr.open(method, url, true);

//       // ✅ Only set Api-Key if provided (browser uploads should NOT use it)
//       if (apiKey && apiKey.trim()) {
//         xhr.setRequestHeader("Authorization", `Api-Key ${apiKey}`);
//       }

//       // ✅ Your real auth for browser upload
//       if (sessionToken) {
//         xhr.setRequestHeader("X-Session-Token", sessionToken);
//       }

//       // (DON'T set Content-Type manually for FormData)

//       xhr.upload.onprogress = (evt) => {
//         if (!evt.lengthComputable) return;
//         const percent = Math.min(
//           99,
//           Math.floor((evt.loaded / evt.total) * 100),
//         );
//         onProgress?.({percent, loaded: evt.loaded, total: evt.total});
//       };

//       xhr.onload = () => {
//         const text = xhr.responseText || "";
//         let json: any = null;
//         try {
//           json = text ? JSON.parse(text) : null;
//         } catch {}

//         if (xhr.status >= 200 && xhr.status < 300) {
//           onProgress?.({percent: 100, loaded: 1, total: 1});
//           return resolve(json);
//         }
//         return reject(
//           new Error(
//             json?.detail || json?.error || `Upload failed (${xhr.status})`,
//           ),
//         );
//       };

//       xhr.onerror = () => reject(new Error("Network error during upload"));
//       xhr.send(body);
//     });
//   }

//   const formatBytes = (bytes: number) =>
//     `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
//   const isoToLocalInput = (iso?: string | null) => {
//     if (!iso) return "";
//     const d = new Date(iso);
//     if (isNaN(d.getTime())) return "";
//     // datetime-local expects "YYYY-MM-DDTHH:mm"
//     const pad = (n: number) => String(n).padStart(2, "0");
//     return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
//       d.getDate(),
//     )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
//   };
//   const openGA = (course: TeacherCourse) => {
//     const isPrivate = (course.course_type || "").toLowerCase() === "private";
//     if (isPrivate) {
//       openFeedback(
//         "Private course",
//         "General access is not available for private courses.",
//       );
//       return;
//     }
//     setGaCourse(course);
//     setGaEnabled(Boolean(course.general_activation));
//     setGaDateLocal(isoToLocalInput(course.general_activation_date));
//     setGaDialogOpen(true);
//   };
//   const saveGA = async () => {
//     if (!gaCourse?.id) return;
//     setGaSaving(true);
//     try {
//       const payload = {
//         general_activation: gaEnabled,
//         general_activation_date: gaEnabled
//           ? gaDateLocal
//             ? new Date(gaDateLocal).toISOString()
//             : null
//           : null,
//       };
//       const res = await fetch(
//         `/api/teacher/courses/${gaCourse.id}/general-activation`,
//         {
//           method: "PATCH",
//           headers: headers(sessionToken),
//           body: JSON.stringify(payload),
//         },
//       );
//       const data = await res.json();
//       if (!res.ok)
//         throw new Error(data?.detail || data?.error || "Update failed");
//       // Update local list
//       setTeacherCourses((prev) =>
//         prev.map((c) =>
//           c.id === gaCourse.id
//             ? {
//                 ...c,
//                 general_activation: data.general_activation,
//                 general_activation_date: data.general_activation_date,
//               }
//             : c,
//         ),
//       );
//       setGaDialogOpen(false);
//       openFeedback("Saved", "General activation updated successfully.");
//     } catch (e: any) {
//       setCoursesError(e?.message || "Update failed");
//     } finally {
//       setGaSaving(false);
//     }
//   };
//   const openFeedback = (title: string, description?: string) => {
//     setFeedbackDialog({
//       open: true,
//       title,
//       description,
//     });
//   };
//   // Confirm delete dialog for modules
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
//   const [moduleToDelete, setModuleToDelete] = useState<string | null>(null);
//   const handleDeleteModuleClick = (moduleId: string) => {
//     setModuleToDelete(moduleId);
//     setDeleteDialogOpen(true);
//   };
//   const handleConfirmDeleteModule = async () => {
//     if (!moduleToDelete) return;
//     const id = moduleToDelete;
//     setDeleteDialogOpen(false);
//     setModuleToDelete(null);
//     await deleteModule(id);
//   };
//   // Fetch session token
//   useEffect(() => {
//     const fetchToken = async () => {
//       const session = await getSession();
//       setSessionToken(session?.user?.sessionToken || null);
//     };
//     fetchToken();
//   }, []);
//   // Fetch courses and categories
//   useEffect(() => {
//     const fetchCourses = async () => {
//       setIsLoadingCourses(true);
//       setError(null);
//       try {
//         const response = await fetch("/api/teacher/courses", {
//           method: "GET",
//           headers: headers(sessionToken),
//         });
//         if (!response.ok) {
//           const errorData: APIError = await response.json();
//           if (response.status === 401 && errorData.redirect) {
//             window.location.href = errorData.redirect;
//             return;
//           }
//           throw new Error(errorData.error || "Failed to fetch courses");
//         }
//         let data: Course[] = await response.json();
//         // Normalize IDs to strings
//         data = data.map((c) => ({...c, id: String(c.id)}));
//         setCourses(data);
//       } catch (err) {
//         setError(
//           (err as Error).message || "An error occurred while fetching courses",
//         );
//       } finally {
//         setIsLoadingCourses(false);
//       }
//     };
//     const fetchCategories = async () => {
//       setIsLoadingCategories(true);
//       setError(null);
//       try {
//         const response = await fetch("/api/teacher/module-categories", {
//           method: "GET",
//           headers: headers(sessionToken),
//         });
//         if (!response.ok) {
//           const errorData: APIError = await response.json();
//           if (response.status === 401 && errorData.redirect) {
//             window.location.href = errorData.redirect;
//             return;
//           }
//           throw new Error(errorData.error || "Failed to fetch categories");
//         }
//         let data: Category[] = await response.json();
//         // Normalize IDs to strings
//         data = data.map((c) => ({...c, id: String(c.id)}));
//         setCategories(data);
//       } catch (err) {
//         setError(
//           (err as Error).message ||
//             "An error occurred while fetching categories",
//         );
//       } finally {
//         setIsLoadingCategories(false);
//       }
//     };
//     if (sessionToken) {
//       fetchCourses();
//       fetchCategories();
//     }
//   }, [sessionToken]);
//   useEffect(() => {
//     if (activeTab !== "course-access" || !sessionToken) return;
//     const load = async () => {
//       setCoursesLoading(true);
//       setCoursesError(null);
//       try {
//         const res = await fetch("/api/teacher/courses", {
//           method: "GET",
//           headers: headers(sessionToken),
//         });
//         const data = await res.json();
//         if (!res.ok)
//           throw new Error(
//             data?.detail || data?.error || "Failed to load courses",
//           );
//         setTeacherCourses(
//           (data ?? []).map((c: any) => ({
//             ...c,
//             id: String(c.id),
//             general_activation: Boolean(c.general_activation),
//             general_activation_date: c.general_activation_date ?? null,
//           })),
//         );
//       } catch (e: any) {
//         setCoursesError(e?.message || "Failed to load courses");
//       } finally {
//         setCoursesLoading(false);
//       }
//     };
//     load();
//   }, [activeTab, sessionToken]);
//   // Fetch modules
//   useEffect(() => {
//     if ((activeTab === "manage" || activeTab === "analytics") && sessionToken) {
//       const fetchModules = async () => {
//         setIsLoadingModules(true);
//         setError(null);
//         try {
//           const query = new URLSearchParams();
//           if (search) query.set("search", search);
//           if (difficultyFilter)
//             query.set("difficulty", difficultyFilter.toLowerCase());
//           // You were forcing active=true here; keep or change as needed
//           query.set("active", "true");
//           // NEW: course filter (send course id as backend expects)
//           if (courseFilter && courseFilter !== "all") {
//             query.set("course", courseFilter);
//           }
//           // NEW: category filter (send category id)
//           if (categoryFilter && categoryFilter !== "all") {
//             query.set("category", categoryFilter);
//           }
//           const response = await fetch(
//             `${BASE_URL}/modules/?${query.toString()}`,
//             {
//               method: "GET",
//               headers: headers(sessionToken),
//             },
//           );
//           if (!response.ok) {
//             const errorData: APIError = await response.json();
//             if (response.status === 401 && errorData.redirect) {
//               window.location.href = errorData.redirect;
//               return;
//             }
//             throw new Error(errorData.error || "Failed to fetch modules");
//           }
//           let data: APIModule[] = await response.json();
//           const sanitizedModules: Module[] = data.map(
//             (module: APIModule): Module => ({
//               id: String(module.id),
//               title: module.title,
//               description: module.description,
//               type: normalizeModuleType(module.type),
//               duration: Number(module.estimatedDuration || 0), // ✅ FIX
//               difficulty: normalizeDifficulty(module.difficulty),
//               category: module.category?.name || "Uncategorized",
//               enrollments: module.enrollments ?? 0,
//               rating: module.rating ?? 0,
//               isPublished: module.isPublished,
//               createdDate: formatDate(module.createdAt || undefined),
//               course: {
//                 id: module.course?.id ? String(module.course.id) : undefined,
//                 name: module.course?.name || "",
//               },
//               lessons: module.lessons || [],
//               lessonCount: module.lessonCount || 0,
//               order: module.order,
//               active: module.active,
//             }),
//           );
//           setModules(sanitizedModules);
//         } catch (err) {
//           setError(
//             (err as Error).message ||
//               "An error occurred while fetching modules",
//           );
//         } finally {
//           setIsLoadingModules(false);
//         }
//       };
//       fetchModules();
//     }
//   }, [
//     activeTab,
//     search,
//     difficultyFilter,
//     courseFilter,
//     categoryFilter,
//     sessionToken,
//   ]);
//   // NEW: Fetch analytics separately
//   useEffect(() => {
//     if (activeTab === "analytics" && sessionToken) {
//       const fetchAnalytics = async () => {
//         setAnalyticsLoading(true);
//         setAnalyticsError(null);
//         try {
//           const query = new URLSearchParams();
//           if (search) query.set("search", search);
//           if (difficultyFilter)
//             query.set("difficulty", difficultyFilter.toLowerCase());
//           query.set("active", "true");
//           query.set("page", currentPageAnalytics.toString());
//           query.set("page_size", "10");
//           const res = await fetch(`/api/teacher/module-analytics`, {
//             headers: headers(sessionToken),
//           });
//           if (!res.ok) {
//             const err = await res.json();
//             throw new Error(err.detail || "Failed to load analytics");
//           }
//           let data = await res.json();
//           // Normalize module IDs
//           data.modules = data.modules.map((m: Module) => ({
//             ...m,
//             id: String(m.id),
//             course: {
//               ...m.course,
//               id: m.course?.id ? String(m.course.id) : undefined,
//             },
//           }));
//           setAnalytics(data);
//         } catch (err) {
//           setAnalyticsError((err as Error).message);
//         } finally {
//           setAnalyticsLoading(false);
//         }
//       };
//       fetchAnalytics();
//     }
//   }, [activeTab, search, difficultyFilter, currentPageAnalytics, sessionToken]);
//   // Auto-set next order when course is selected for new module
//   useEffect(() => {
//     const autoSetOrder = async () => {
//       if (!currentModule.id && currentModule.course.id && sessionToken) {
//         const nextOrder = await getNextOrder(
//           currentModule.course.id,
//           sessionToken,
//         );
//         setCurrentModule((prev) => ({...prev, order: nextOrder}));
//       }
//     };
//     autoSetOrder();
//   }, [currentModule.course.id, sessionToken]);
//   // Fetch module details
//   // Add this utility function at the top of your file with other utilities
//   function normalizeMedia(media: string | undefined): string | undefined {
//     if (!media) return undefined;
//     const BASE_URL = process.env.BASE_URL;
//     if (media.startsWith("http")) return media;
//     let cleaned = media.replace(/^\/+/, "");
//     if (cleaned.startsWith("media/")) return `${BASE_URL}/${cleaned}`;
//     if (cleaned.startsWith("covers/")) return `${BASE_URL}/media/${cleaned}`;
//     return `${BASE_URL}/media/covers/${cleaned}`;
//   }
//   const getModuleDetails = async (moduleId: string): Promise<Module | null> => {
//     try {
//       const response = await fetch(
//         `${BASE_URL}/modules/${moduleId}?t=${Date.now()}`,
//         {
//           method: "GET",
//           headers: headers(sessionToken),
//         },
//       );
//       if (!response.ok) {
//         const errorData: APIError = await response.json();
//         throw new Error(errorData.error || "Failed to fetch module details");
//       }
//       const module: APIModule = await response.json();
//       const lessonsWithCover =
//         module.lessons?.map((lesson: any) => ({
//           ...lesson,
//           id: String(lesson.id),
//           coverImageUrl: lesson.cover_image
//             ? normalizeMedia(lesson.cover_image)
//             : null,
//         })) || [];
//       return {
//         id: String(module.id),
//         title: module.title,
//         description: module.description,
//         type: normalizeModuleType(module.type),
//         duration: module.estimatedDuration,
//         difficulty: normalizeDifficulty(module.difficulty),
//         category: module.category?.name || undefined,
//         enrollments: module.enrollments ?? 0,
//         rating: module.rating ?? 0,
//         isPublished: module.isPublished,
//         createdDate: formatDate(module.createdAt || undefined),
//         course: {
//           id: module.course?.id ? String(module.course.id) : undefined,
//           name: module.course?.name || "",
//         },
//         lessons: lessonsWithCover,
//         lessonCount: module.lessonCount || 0,
//         order: module.order,
//         active: module.active,
//       };
//     } catch (err) {
//       setError(
//         (err as Error).message ||
//           "An error occurred while fetching module details",
//       );
//       return null;
//     }
//   };
//   // Pagination
//   const getPaginatedModules = (modules: Module[], currentPage: number) => {
//     const totalPages = Math.ceil(modules.length / modulesPerPage);
//     const indexOfLastModule = currentPage * modulesPerPage;
//     const indexOfFirstModule = indexOfLastModule - modulesPerPage;
//     return {
//       paginatedModules: modules.slice(indexOfFirstModule, indexOfLastModule),
//       totalPages,
//       totalCount: modules.length,
//     };
//   };
//   const addLesson = () => {
//     const newLesson: Lesson = {
//       id: `temp-${Date.now()}`,
//       title: "",
//       type: "video",
//       duration: "",
//       content: "",
//       videoUrl: "",
//       audioUrl: "",
//       coverImage: null, // NEW
//       coverImageUrl: "", // NEW
//       remove_cover: false,
//     };
//     setCurrentModule((prev) => ({
//       ...prev,
//       lessons: [...prev.lessons, newLesson],
//       lessonCount: prev.lessonCount + 1,
//     }));
//     setEditingLesson(newLesson);
//   };
//   const updateLessonFields = (lessonId: string, updates: Partial<Lesson>) => {
//     setCurrentModule((prev) => ({
//       ...prev,
//       lessons: prev.lessons.map((lesson) =>
//         lesson.id === lessonId ? {...lesson, ...updates} : lesson,
//       ),
//     }));
//     if (editingLesson?.id === lessonId) {
//       setEditingLesson((prev) => (prev ? {...prev, ...updates} : null));
//     }
//   };
//   const deleteLesson = async (lessonId: string) => {
//     if (!sessionToken) {
//       setError("No session token available. Please log in again.");
//       return;
//     }
//     if (!currentModule.id) {
//       setError("No module selected.");
//       return;
//     }
//     try {
//       const response = await fetch(
//         `${BASE_URL}/modules/${currentModule.id}/lessons/${lessonId}/delete/`,
//         {
//           method: "DELETE",
//           headers: headers(sessionToken),
//         },
//       );
//       if (!response.ok) {
//         const errorData: APIError = await response.json();
//         if (response.status === 401 && errorData.redirect) {
//           window.location.href = errorData.redirect;
//           return;
//         }
//         throw new Error(errorData.error || "Failed to delete lesson");
//       }
//       setCurrentModule((prev) => ({
//         ...prev,
//         lessons: prev.lessons.filter((lesson) => lesson.id !== lessonId),
//         lessonCount: prev.lessonCount - 1,
//       }));
//       setModules((prev) =>
//         prev.map((m) =>
//           m.id === currentModule.id
//             ? {
//                 ...m,
//                 lessons: m.lessons.filter((lesson) => lesson.id !== lessonId),
//                 lessonCount: m.lessonCount - 1,
//               }
//             : m,
//         ),
//       );
//       if (editingLesson?.id === lessonId) {
//         setEditingLesson(null);
//       }
//       openFeedback("Lesson deleted", "The lesson was deleted successfully.");
//     } catch (err) {
//       setError(
//         (err as Error).message || "An error occurred while deleting the lesson",
//       );
//     }
//   };
//   const publishModule = async (moduleId: string, active: boolean) => {
//     if (!sessionToken) {
//       setError("No session token available. Please log in again.");
//       return;
//     }
//     try {
//       const response = await fetch(`${BASE_URL}/modules/${moduleId}/publish/`, {
//         method: "POST",
//         headers: headers(sessionToken),
//         body: JSON.stringify({active}),
//       });
//       if (!response.ok) {
//         const errorData: APIError = await response.json();
//         if (response.status === 401 && errorData.redirect) {
//           window.location.href = errorData.redirect;
//           return;
//         }
//         throw new Error(
//           errorData.error || "Failed to publish/unpublish module",
//         );
//       }
//       setModules((prev) =>
//         prev.map((m) => (m.id === moduleId ? {...m, isPublished: active} : m)),
//       );
//       if (currentModule.id === moduleId) {
//         setCurrentModule((prev) => ({...prev, isPublished: active}));
//       }
//       openFeedback(
//         `Module ${active ? "published" : "unpublished"}`,
//         `The module was ${active ? "published" : "unpublished"} successfully.`,
//       );
//     } catch (err) {
//       setError(
//         (err as Error).message ||
//           `An error occurred while ${
//             active ? "publishing" : "unpublishing"
//           } the module`,
//       );
//     }
//   };
//   const deleteModule = async (moduleId: string) => {
//     if (!sessionToken) {
//       setError("No session token available. Please log in again.");
//       return;
//     }
//     try {
//       const response = await fetch(`${BASE_URL}/modules/${moduleId}/delete/`, {
//         method: "DELETE",
//         headers: headers(sessionToken),
//       });
//       if (!response.ok) {
//         const errorData: APIError = await response.json();
//         if (response.status === 401 && errorData.redirect) {
//           window.location.href = errorData.redirect;
//           return;
//         }
//         throw new Error(errorData.error || "Failed to delete module");
//       }
//       setModules((prev) => prev.filter((m) => m.id !== moduleId));
//       if (currentModule.id === moduleId) {
//         setCurrentModule(initialModule);
//         setEditingLesson(null);
//       }
//       openFeedback("Module deleted", "The module was deleted successfully.");
//     } catch (err) {
//       setError(
//         (err as Error).message || "An error occurred while deleting the module",
//       );
//     }
//   };
//   const getNextOrder = async (
//     courseId: string,
//     sessionToken: string | null,
//   ): Promise<number> => {
//     if (!courseId || !sessionToken) return 1;
//     try {
//       const query = new URLSearchParams({course_id: courseId});
//       const response = await fetch(`${BASE_URL}/modules/?${query.toString()}`, {
//         method: "GET",
//         headers: headers(sessionToken),
//       });
//       if (!response.ok) return 1;
//       const modules: APIModule[] = await response.json();
//       const maxOrder = modules.length
//         ? Math.max(...modules.map((m) => m.order || 0))
//         : 0;
//       return maxOrder + 1;
//     } catch (err) {
//       return 1;
//     }
//   };
//   const createLesson = async (
//     moduleId: string,
//     lesson: Lesson,
//   ): Promise<Lesson | null> => {
//     if (!lesson.title) {
//       throw new Error("Lesson title is required.");
//     }
//     try {
//       const formData = new FormData();
//       formData.append("title", lesson.title);
//       formData.append("type", lesson.type); // Updated to "type" per API
//       formData.append(
//         "duration",
//         (durationToMinutes(lesson.duration) * 60).toString(),
//       ); // Updated to "duration"
//       formData.append("order", (currentModule.lessons.length + 1).toString());
//       formData.append(
//         "meta",
//         JSON.stringify({
//           description: lesson.content || "",
//           tags: lesson.title.toLowerCase().split(" ").filter(Boolean),
//         }),
//       );
//       formData.append("active", "true");
//       // Main file handling
//       if (
//         lesson.file &&
//         lesson.file instanceof File &&
//         (lesson.type === "video" ||
//           lesson.type === "audio" ||
//           lesson.type === "pdf")
//       ) {
//         formData.append("file", lesson.file, lesson.file.name);
//       } else if (
//         lesson.type === "text" &&
//         lesson.content &&
//         !lesson.content.startsWith("http")
//       ) {
//         formData.append("textContent", lesson.content); // Updated field name if needed
//       } else if (
//         (lesson.videoUrl || lesson.audioUrl) &&
//         (lesson.videoUrl?.startsWith("http") ||
//           lesson.audioUrl?.startsWith("http"))
//       ) {
//         const url = lesson.videoUrl || lesson.audioUrl || "";
//         formData.append("url", url);
//       }
//       // NEW: Cover image handling
//       if (lesson.coverImage && lesson.coverImage instanceof File) {
//         formData.append(
//           "cover_image",
//           lesson.coverImage,
//           lesson.coverImage.name,
//         );
//       }
//       const response = await fetch(
//         `/api/teacher/modules/${moduleId}/lessons/`,
//         {
//           method: "POST",
//           headers: {
//             "X-Session-Token": sessionToken || "",
//           },
//           body: formData,
//         },
//       );
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || "Failed to create lesson");
//       }
//       const data = await response.json();
//       const serverLesson = data?.lesson ?? data;
//       const newLesson: Lesson = {
//         ...lesson,
//         id: String(serverLesson.id),
//         coverImageUrl: serverLesson.cover_image
//           ? normalizeMedia(serverLesson.cover_image)
//           : undefined,
//         coverImage: null, // Clear temp file
//         file: null, // Clear temp file if any
//         remove_cover: false, // Reset if set
//       };
//       return newLesson;
//     } catch (err) {
//       console.error("[createLesson] Error:", err);
//       throw err;
//     }
//   };
//   const saveModule = async () => {
//     if (!sessionToken) {
//       setError("No session token available. Please log in again.");
//       return;
//     }
//     if (!currentModule.title) {
//       setError("Module title is required.");
//       return;
//     }
//     if (!currentModule.course.id) {
//       setError("Please select a course.");
//       return;
//     }
//     if (!currentModule.category) {
//       setError("Please select a category.");
//       return;
//     }
//     if (!currentModule.order || currentModule.order < 1) {
//       setError("Please specify a valid order (1 or higher).");
//       return;
//     }
//     if (currentModule.lessons.length === 0) {
//       setError("Please add at least one lesson before creating the module.");
//       return;
//     }
//     try {
//       setIsSaving(true);
//       const payload = {
//         title: currentModule.title,
//         description: currentModule.description,
//         course_id: parseInt(currentModule.course.id),
//         categoryId: categories.find((c) => c.name === currentModule.category)
//           ?.id,
//         difficulty: currentModule.difficulty.toLowerCase(),
//         estimatedDuration: currentModule.duration, // Convert to string
//         order: currentModule.order,
//         active: currentModule.active,
//       };
//       const response = await fetch(`${BASE_URL}/modules/create/`, {
//         method: "POST",
//         headers: headers(sessionToken),
//         body: JSON.stringify(payload),
//       });
//       let errorData;
//       if (!response.ok) {
//         try {
//           errorData = await response.json();
//         } catch (parseErr) {
//           throw new Error("Server error occurred. Please try again later.");
//         }
//         if (errorData.redirect) {
//           window.location.href = errorData.redirect;
//           return;
//         }
//         if (
//           errorData.error?.includes(
//             "IntegrityError: duplicate key value violates unique constraint",
//           )
//         ) {
//           setError(
//             "The specified order already exists for this course. Please choose a different order.",
//           );
//           return;
//         }
//         throw new Error(
//           errorData.error ||
//             "Failed to create module. Please check the details and try again.",
//         );
//       }
//       const data: APIModule = await response.json();
//       const newModule: Module = {
//         id: String(data.id),
//         title: data.title,
//         description: data.description,
//         type: currentModule.type, // keep whatever the UI had
//         duration: data.estimatedDuration,
//         difficulty: normalizeDifficulty(data.difficulty),
//         category: data.category?.name || "Uncategorized",
//         enrollments: data.enrollments ?? 0,
//         rating: data.rating ?? 0,
//         isPublished: data.isPublished,
//         createdDate: formatDate(data.createdAt || undefined),
//         course: {
//           id: data.course?.id ? String(data.course.id) : undefined,
//           name: data.course?.name || "",
//         },
//         lessons: [],
//         lessonCount:
//           data.lessonCount ||
//           currentModule.lessonCount ||
//           currentModule.lessons.length,
//         order: data.order,
//         active: data.active,
//       };
//       setModules((prev) => [...prev, newModule]);
//       // Now create the lessons
//       const tempLessons = [...currentModule.lessons];
//       const createdLessons: Lesson[] = [];
//       for (const tempLesson of tempLessons) {
//         try {
//           const savedLesson = await createLesson(newModule.id, tempLesson);
//           if (savedLesson) {
//             createdLessons.push(savedLesson);
//           }
//         } catch (err) {
//           console.error("Failed to create lesson:", err);
//           // Continue, but log error
//         }
//       }
//       // Refresh module details
//       const refreshedModule = await getModuleDetails(newModule.id);
//       if (refreshedModule) {
//         setModules((prev) =>
//           prev.map((m) => (m.id === refreshedModule.id ? refreshedModule : m)),
//         );
//       }
//       openFeedback(
//         "Module saved",
//         "Module and lessons were saved successfully.",
//       );
//       setCurrentModule(initialModule);
//       setEditingLesson(null);
//       setActiveTab("manage");
//     } catch (err) {
//       setError(
//         (err as Error).message ||
//           "An unexpected error occurred while saving the module. Please try again.",
//       );
//     } finally {
//       setIsSaving(false);
//     }
//   };
//   const updateModule = async () => {
//     if (!sessionToken) {
//       setError("No session token available. Please log in again.");
//       return;
//     }
//     if (!currentModule.id) {
//       setError("No module ID provided for update.");
//       return;
//     }
//     if (!currentModule.title) {
//       setError("Module title is required.");
//       return;
//     }
//     if (!currentModule.course.id) {
//       setError("Please select a course.");
//       return;
//     }
//     if (!currentModule.category) {
//       setError("Please select a category.");
//       return;
//     }
//     try {
//       setIsSaving(true);
//       const payload: any = {
//         title: currentModule.title,
//         description: currentModule.description,
//         difficulty: currentModule.difficulty.toLowerCase(),
//         estimatedDuration: Number(currentModule.duration) || 0,
//         order: currentModule.order,
//       };
//       // 🔹 Send course_id (int) for backend
//       if (currentModule.course.id) {
//         payload.course_id = parseInt(currentModule.course.id, 10);
//       }
//       // 🔹 Send categoryId (same way you do in createModule)
//       const selectedCategory = categories.find(
//         (c) => c.name === currentModule.category,
//       );
//       if (selectedCategory?.id) {
//         payload.categoryId = parseInt(String(selectedCategory.id), 10);
//       } else {
//         // If you want to allow clearing category, send null
//         // payload.categoryId = null;
//       }
//       const response = await fetch(
//         `${BASE_URL}/modules/${currentModule.id}/update/`,
//         {
//           method: "PATCH",
//           headers: headers(sessionToken),
//           body: JSON.stringify(payload),
//         },
//       );
//       let errorData;
//       if (!response.ok) {
//         try {
//           errorData = await response.json();
//         } catch {
//           throw new Error("Server error occurred. Please try again later.");
//         }
//         if (response.status === 401 && errorData.redirect) {
//           window.location.href = errorData.redirect;
//           return;
//         }
//         if (
//           errorData.error?.includes(
//             "IntegrityError: duplicate key value violates unique constraint",
//           )
//         ) {
//           setError(
//             "The specified order already exists for this course. Please choose a different order.",
//           );
//           return;
//         }
//         throw new Error(
//           errorData.error ||
//             "Failed to update module. Please check the details and try again.",
//         );
//       }
//       const data: {module: APIModule} = await response.json();
//       const updatedModule: Module = {
//         id: String(data.module.id),
//         title: data.module.title,
//         description: data.module.description,
//         type: currentModule.type,
//         duration: data.module.estimatedDuration,
//         difficulty: normalizeDifficulty(data.module.difficulty),
//         category: data.module.category?.name || "Uncategorized",
//         enrollments: data.module.enrollments ?? currentModule.enrollments,
//         rating: data.module.rating ?? currentModule.rating,
//         isPublished: data.module.isPublished,
//         createdDate: formatDate(data.module.createdAt || undefined),
//         course: {
//           id: data.module.course?.id
//             ? String(data.module.course.id)
//             : undefined,
//           name: data.module.course?.name || "",
//         },
//         lessons: currentModule.lessons,
//         lessonCount: data.module.lessonCount || currentModule.lessonCount,
//         order: data.module.order || currentModule.order,
//         active: data.module.active,
//       };
//       // Update list
//       setModules((prev) =>
//         prev.map((m) => (m.id === updatedModule.id ? updatedModule : m)),
//       );
//       // Refresh to be 100% in sync with backend (including lessons)
//       const moduleData = await getModuleDetails(currentModule.id);
//       if (moduleData) {
//         setCurrentModule(moduleData);
//       }
//       openFeedback(
//         "Module updated",
//         `Module "${updatedModule.title}" was updated successfully.`,
//       );
//     } catch (err) {
//       setError(
//         (err as Error).message ||
//           "An unexpected error occurred while updating the module. Please try again.",
//       );
//     } finally {
//       setIsSaving(false);
//     }
//   };
//   const handleFileUpload = async (file: File, type: "video" | "audio") => {
//     if (!sessionToken) {
//       setError("No session token available. Please log in again.");
//       return null;
//     }
//     try {
//       const formData = new FormData();
//       formData.append("file", file);
//       const response = await fetch(`${BASE_URL}/upload/`, {
//         method: "POST",
//         headers: {
//           "X-Session-Token": sessionToken,
//         },
//         body: formData,
//       });
//       if (!response.ok) {
//         const errorData: APIError = await response.json();
//         if (response.status === 401 && errorData.redirect) {
//           window.location.href = errorData.redirect;
//           return null;
//         }
//         throw new Error(errorData.error || "Failed to upload file");
//       }
//       const data = await response.json();
//       return data.url;
//     } catch (err) {
//       setError(
//         (err as Error).message || "An error occurred while uploading the file",
//       );
//       return null;
//     }
//   };
//   const saveLesson = async () => {
//     if (!sessionToken)
//       return setError("No session token available. Please log in again.");
//     if (!currentModule.id)
//       return setError("No module selected. Please save the module first.");
//     if (!editingLesson) return setError("No lesson selected for saving.");
//     if (!editingLesson.title) return setError("Lesson title is required.");

//     // size checks
//     if (editingLesson.file) {
//       if (
//         editingLesson.type === "video" &&
//         editingLesson.file.size > MAX_VIDEO_BYTES
//       )
//         return setError("Video must be 500MB or less.");
//       if (
//         editingLesson.type === "audio" &&
//         editingLesson.file.size > MAX_AUDIO_BYTES
//       )
//         return setError("Audio must be 200MB or less.");
//       if (
//         editingLesson.type === "pdf" &&
//         editingLesson.file.size > MAX_PDF_BYTES
//       )
//         return setError("PDF must be 10MB or less.");
//     }
//     if (
//       editingLesson.coverImage &&
//       editingLesson.coverImage.size > MAX_IMAGE_BYTES
//     ) {
//       return setError("Cover image must be 1MB or less.");
//     }
//     try {
//       setIsSavingLesson(true);
//       setError(null);

//       // ✅ reset progress UI
//       setUploading(true);
//       setUploadPhase("uploading");
//       setUploadInfo({percent: 0, loaded: 0, total: 0});

//       // ✅ let React paint before starting the request
//       await new Promise<void>((r) => requestAnimationFrame(() => r()));

//       const formData = new FormData();
//       formData.append("title", editingLesson.title);
//       formData.append("type", editingLesson.type);
//       formData.append(
//         "duration",
//         (durationToMinutes(editingLesson.duration) * 60).toString(),
//       );
//       formData.append(
//         "meta",
//         JSON.stringify({
//           description: editingLesson.content || "",
//           tags: editingLesson.title.toLowerCase().split(" ").filter(Boolean),
//         }),
//       );
//       formData.append("active", "true");

//       // file/url/text
//       const isMedia =
//         editingLesson.file instanceof File &&
//         (editingLesson.type === "video" ||
//           editingLesson.type === "audio" ||
//           editingLesson.type === "pdf");

//       if (isMedia && editingLesson.file) {
//         const fileUrl = await uploadMediaByBucket(
//           editingLesson.file,
//           sessionToken,
//           (p) => {
//             setUploadPhase(p.percent >= 99 ? "finalizing" : "uploading");
//             setUploadInfo(p);
//           },
//         );

//         // ✅ Always send URL to Django for cloud uploads
//         formData.append("url", fileUrl);
//       } else if (
//         editingLesson.type === "text" &&
//         editingLesson.content &&
//         !editingLesson.content.startsWith("http")
//       ) {
//         formData.append("textContent", editingLesson.content);
//       } else if (
//         editingLesson.videoUrl?.startsWith("http") ||
//         editingLesson.audioUrl?.startsWith("http")
//       ) {
//         formData.append(
//           "url",
//           editingLesson.videoUrl || editingLesson.audioUrl || "",
//         );
//       }
//       // ✅ cover image upload
//       if (editingLesson.remove_cover) {
//         formData.append("remove_cover", "true");
//       } else if (editingLesson.coverImage instanceof File) {
//         formData.append(
//           "cover_image",
//           editingLesson.coverImage,
//           editingLesson.coverImage.name,
//         );
//       }
//       const resp = await uploadWithProgress<any>({
//         url: `${DJANGO_BASE}/learning/api/teacher/modules/${currentModule.id}/lessons/`,
//         method: "POST",
//         sessionToken,
//         apiKey: "",
//         body: formData,
//         onProgress: (p) => {
//           // if we see progress events, keep phase uploading
//           setUploadPhase(p.percent >= 99 ? "finalizing" : "uploading");
//           setUploadInfo(p);
//         },
//       });

//       const serverLesson = resp?.lesson ?? resp;

//       const newLesson: Lesson = {
//         ...editingLesson,
//         id: String(serverLesson.id),
//         coverImageUrl: serverLesson.cover_image
//           ? normalizeMedia(serverLesson.cover_image)
//           : editingLesson.coverImageUrl,
//         coverImage: null,
//         file: null,
//         remove_cover: false,
//       };

//       // update local state
//       setCurrentModule((prev) => ({
//         ...prev,
//         lessons: prev.lessons.map((l) =>
//           l.id === editingLesson.id ? newLesson : l,
//         ),
//       }));
//       setEditingLesson(newLesson);

//       if (fileInputRef.current) fileInputRef.current.value = "";
//       if (coverImageInputRef.current) coverImageInputRef.current.value = "";

//       openFeedback("Lesson saved", "Lesson saved successfully.");
//     } catch (err: any) {
//       setError(err?.message || "An error occurred while creating the lesson");
//     } finally {
//       setIsSavingLesson(false);
//       setUploadPhase("idle");
//       setUploading(false);
//       setUploadInfo({percent: 0, loaded: 0, total: 0});
//     }
//   };
//   // ✅ REWRITE: updateLesson (UPDATE)
//   const updateLesson = async (lessonId: string) => {
//     if (!sessionToken)
//       return setError("No session token available. Please log in again.");
//     if (!currentModule.id) return setError("No module selected.");
//     if (!editingLesson) return setError("No lesson selected for updating.");
//     if (!editingLesson.title) return setError("Lesson title is required.");

//     // size checks
//     if (editingLesson.file) {
//       if (
//         editingLesson.type === "video" &&
//         editingLesson.file.size > MAX_VIDEO_BYTES
//       )
//         return setError("Video must be 500MB or less.");
//       if (
//         editingLesson.type === "audio" &&
//         editingLesson.file.size > MAX_AUDIO_BYTES
//       )
//         return setError("Audio must be 20MB or less.");
//       if (
//         editingLesson.type === "pdf" &&
//         editingLesson.file.size > MAX_PDF_BYTES
//       )
//         return setError("PDF must be 10MB or less.");
//     }
//     if (
//       editingLesson.coverImage &&
//       editingLesson.coverImage.size > MAX_IMAGE_BYTES
//     ) {
//       return setError("Cover image must be 1MB or less.");
//     }

//     try {
//       setIsSavingLesson(true);
//       setError(null);

//       setUploading(true);
//       setUploadPhase("uploading");
//       setUploadInfo({percent: 0, loaded: 0, total: 0});

//       await new Promise<void>((r) => requestAnimationFrame(() => r()));

//       const formData = new FormData();
//       formData.append("title", editingLesson.title);
//       formData.append("type", editingLesson.type);
//       formData.append(
//         "duration",
//         (durationToMinutes(editingLesson.duration) * 60).toString(),
//       );
//       formData.append(
//         "meta",
//         JSON.stringify({
//           description: editingLesson.content || "",
//           tags: editingLesson.title.toLowerCase().split(" ").filter(Boolean),
//         }),
//       );
//       formData.append("active", "true");

//       // file/url/text
//       const isMedia =
//         editingLesson.file instanceof File &&
//         (editingLesson.type === "video" ||
//           editingLesson.type === "audio" ||
//           editingLesson.type === "pdf");

//       if (isMedia && editingLesson.file) {
//         const fileUrl = await uploadMediaByBucket(
//           editingLesson.file,
//           sessionToken,
//           (p) => {
//             setUploadPhase(p.percent >= 99 ? "finalizing" : "uploading");
//             setUploadInfo(p);
//           },
//         );

//         // ✅ Always send URL to Django for cloud uploads
//         formData.append("url", fileUrl);
//       } else if (
//         editingLesson.type === "text" &&
//         editingLesson.content &&
//         !editingLesson.content.startsWith("http")
//       ) {
//         formData.append("textContent", editingLesson.content);
//       } else if (
//         editingLesson.videoUrl?.startsWith("http") ||
//         editingLesson.audioUrl?.startsWith("http")
//       ) {
//         formData.append(
//           "url",
//           editingLesson.videoUrl || editingLesson.audioUrl || "",
//         );
//       }
//       // ✅ cover image upload
//       if (editingLesson.remove_cover) {
//         formData.append("remove_cover", "true");
//       } else if (editingLesson.coverImage instanceof File) {
//         formData.append(
//           "cover_image",
//           editingLesson.coverImage,
//           editingLesson.coverImage.name,
//         );
//       }
//       const resp = await uploadWithProgress<any>({
//         url: `${DJANGO_BASE}/learning/api/teacher/modules/${currentModule.id}/lessons/${lessonId}/`,
//         method: "PATCH",
//         sessionToken,
//         apiKey: "",
//         body: formData,
//         onProgress: (p) => {
//           setUploadPhase(p.percent >= 99 ? "finalizing" : "uploading");
//           setUploadInfo(p);
//         },
//       });

//       const serverLesson = resp?.lesson ?? resp;

//       const updatedLesson: Lesson = {
//         ...editingLesson,
//         id: String(serverLesson.id ?? lessonId),
//         coverImageUrl: serverLesson.cover_image
//           ? normalizeMedia(serverLesson.cover_image)
//           : editingLesson.coverImageUrl,
//         coverImage: null,
//         file: null,
//         remove_cover: false,
//       };
//       setCurrentModule((prev) => ({
//         ...prev,
//         lessons: prev.lessons.map((l) =>
//           l.id === lessonId ? updatedLesson : l,
//         ),
//       }));
//       setEditingLesson(updatedLesson);

//       if (fileInputRef.current) fileInputRef.current.value = "";
//       if (coverImageInputRef.current) coverImageInputRef.current.value = "";

//       openFeedback("Lesson updated", "Lesson was updated successfully.");
//     } catch (err: any) {
//       setError(err?.message || "An error occurred while updating the lesson");
//     } finally {
//       setIsSavingLesson(false);
//       setUploadPhase("idle");
//       setUploading(false);
//       setUploadInfo({percent: 0, loaded: 0, total: 0});
//     }
//   };

//   // 🔧 Normalize cover image URLs so relative paths become full URLs
//   const normalizeCoverImageUrl = (cover: string | null | undefined) => {
//     if (!cover) return "/placeholder.jpg";
//     return normalizeMedia(cover);
//   };
//   const getTypeIcon = (type: string) => {
//     switch (type) {
//       case "video":
//         return Video;
//       case "audio":
//         return Headphones;
//       case "document":
//         return FileText;
//       case "tutorial":
//         return BookOpen;
//       default:
//         return FileText;
//     }
//   };
//   function getFileName(input?: string | File | null): string {
//     if (!input) return "";
//     // If it's a File object, just return its name
//     if (typeof File !== "undefined" && input instanceof File) {
//       return input.name;
//     }
//     const str = String(input);
//     // Try URL first (strips query/hash)
//     try {
//       const u = new URL(str);
//       const name = u.pathname.split("/").filter(Boolean).pop() || "";
//       return decodeURIComponent(name);
//     } catch {
//       // Not a URL — treat as path
//       const name = str.split(/[\\/]/).filter(Boolean).pop() || "";
//       return decodeURIComponent(name);
//     }
//   }
//   const isPageLoading = isLoadingCourses || isLoadingCategories;
//   if (isPageLoading) {
//     return (
//       <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
//         <img src="/logo.png" alt="Loading" className="h-32 animate-pulse" />
//       </div>
//     );
//   }
//   return (
//     <div className="space-y-4 xs:p-4 sm:p-4 max-w-full mx-auto">
//       <div>
//         <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold">
//           Learning Modules
//         </h1>
//         <p className="text-muted-foreground text-xs xs:text-sm sm:text-base">
//           Create and manage comprehensive learning experiences
//         </p>
//       </div>
//       <Tabs
//         value={activeTab}
//         onValueChange={(value) => {
//           setActiveTab(value);
//           setCurrentPageManage(1);
//           setCurrentPageAnalytics(1);
//         }}
//         className="w-full">
//         <TabsList className="bg-[#f797712e] text-slate-700 flex flex-col lg:flex-row w-full gap-2 mb-14">
//           <TabsTrigger
//             value="create"
//             className="bg-transparent w-full sm:w-32 justify-center py-2 data-[state=active]:bg-[#EF7B55]/70 data-[state=active]:text-white gap-3">
//             Create Module
//           </TabsTrigger>
//           <TabsTrigger
//             value="manage"
//             className="bg-transparent w-full sm:w-32 justify-center py-2 data-[state=active]:bg-[#EF7B55]/70 data-[state=active]:text-white gap-3">
//             Manage Modules
//           </TabsTrigger>
//           <TabsTrigger
//             value="analytics"
//             className="bg-transparent w-full sm:w-32 justify-center py-2 data-[state=active]:bg-[#EF7B55]/70 data-[state=active]:text-white gap-3">
//             Module Analytics
//           </TabsTrigger>
//           <TabsTrigger
//             value="course-access"
//             className="bg-transparent w-full sm:w-32 justify-center py-2 data-[state=active]:bg-[#EF7B55]/70 data-[state=active]:text-white gap-3">
//             Course Access
//           </TabsTrigger>
//         </TabsList>
//         <TabsContent value="course-access" className="space-y-3 xs:space-y-4">
//           {coursesLoading ? (
//             <div className="flex items-center justify-center py-12">
//               <Spinner size="md" />
//             </div>
//           ) : coursesError ? (
//             <div className="text-center py-8 text-red-500">{coursesError}</div>
//           ) : (
//             <div className="grid gap-3 xs:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
//               {teacherCourses.map((c) => {
//                 const expired =
//                   c.general_activation &&
//                   c.general_activation_date &&
//                   new Date(c.general_activation_date).getTime() < Date.now();
//                 const isPrivate =
//                   (c.course_type || "").toLowerCase() === "private";
//                 return (
//                   <Card
//                     key={c.id}
//                     className="flex flex-col h-full min-h-[240px]">
//                     <CardHeader>
//                       <CardTitle className="text-sm xs:text-base sm:text-lg line-clamp-2">
//                         {c.name}
//                       </CardTitle>
//                       <CardDescription className="text-xs sm:text-sm line-clamp-1">
//                         {c.subject} • {c.classroom}
//                         {c.course_type ? ` • ${c.course_type}` : ""}
//                       </CardDescription>
//                     </CardHeader>
//                     <CardContent className="flex flex-col gap-3 flex-1">
//                       <div className="flex flex-col sm:flex-row gap-2">
//                         {!isPrivate && (
//                           <span>
//                             {" "}
//                             <Badge
//                               variant={
//                                 c.general_activation ? "default" : "secondary"
//                               }
//                               className={
//                                 c.general_activation
//                                   ? "bg-[#EF7B55]/70 px-2"
//                                   : "bg-gray-500 text-white"
//                               }>
//                               {c.general_activation
//                                 ? "General Access ON"
//                                 : "General Access OFF"}
//                             </Badge>{" "}
//                           </span>
//                         )}
//                         {isPrivate && (
//                           <Badge className="bg-gray-700 text-white">
//                             Private
//                           </Badge>
//                         )}
//                         {c.general_activation && (
//                           <Badge variant="outline">
//                             Expiry:{" "}
//                             {c.general_activation_date
//                               ? new Date(
//                                   c.general_activation_date,
//                                 ).toLocaleDateString()
//                               : "No expiry"}
//                           </Badge>
//                         )}
//                       </div>
//                       {c.general_activation &&
//                         c.general_activation_date &&
//                         new Date(c.general_activation_date).getTime() <
//                           Date.now() && (
//                           <Badge className="bg-red-600/80 text-white w-fit">
//                             Expired
//                           </Badge>
//                         )}
//                       <Button
//                         onClick={() => openGA(c)}
//                         disabled={isPrivate}
//                         className={`w-full text-xs xs:text-sm sm:text-base shadow-md mt-auto ${
//                           isPrivate
//                             ? "opacity-50 cursor-not-allowed"
//                             : "bg-[#f79771]/70 hover:bg-[#EF7B55]/90"
//                         }`}>
//                         {isPrivate
//                           ? "Not available for private courses"
//                           : "Update Access"}
//                       </Button>
//                     </CardContent>
//                   </Card>
//                 );
//               })}
//             </div>
//           )}
//         </TabsContent>
//         <TabsContent value="create" className="space-y-3 xs:space-y-4">
//           {isLoadingCourses || isLoadingCategories ? (
//             <div className="relative min-h-[200px] flex items-center justify-center bg-gray-100/50 rounded-lg">
//               <Spinner size="md" className="text-[#EF7B55]" />
//             </div>
//           ) : (
//             <div className="grid gap-3 xs:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
//               <Card className="md:col-span-1">
//                 <CardHeader>
//                   <CardTitle className="text-sm xs:text-base sm:text-lg">
//                     Module Configuration
//                   </CardTitle>
//                   <CardDescription className="text-[0.85rem] xs:text-xs sm:text-sm">
//                     Set up your learning module
//                   </CardDescription>
//                 </CardHeader>
//                 <CardContent className="space-y-3 xs:space-y-4">
//                   <div className="space-y-2">
//                     <Label
//                       htmlFor="title"
//                       className="text-xs xs:text-sm sm:text-base">
//                       Module Title
//                     </Label>
//                     <Input
//                       id="title"
//                       value={currentModule.title}
//                       onChange={(e) =>
//                         setCurrentModule((prev) => ({
//                           ...prev,
//                           title: e.target.value,
//                         }))
//                       }
//                       placeholder="Enter module title"
//                       className="text-xs xs:text-sm sm:text-base"
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label
//                       htmlFor="order"
//                       className="text-xs xs:text-sm sm:text-base">
//                       Order
//                     </Label>
//                     <Input
//                       id="order"
//                       type="number"
//                       min="1"
//                       value={currentModule.order}
//                       onChange={(e) =>
//                         setCurrentModule((prev) => ({
//                           ...prev,
//                           order: parseInt(e.target.value) || 1,
//                         }))
//                       }
//                       placeholder="e.g., 1"
//                       className="text-xs xs:text-sm sm:text-base"
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label
//                       htmlFor="description"
//                       className="text-xs xs:text-sm sm:text-base">
//                       Description
//                     </Label>
//                     <Textarea
//                       id="description"
//                       value={currentModule.description}
//                       onChange={(e) =>
//                         setCurrentModule((prev) => ({
//                           ...prev,
//                           description: e.target.value,
//                         }))
//                       }
//                       placeholder="Describe what students will learn"
//                       rows={3}
//                       className="text-xs xs:text-sm sm:text-base"
//                     />
//                   </div>
//                   <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 xs:gap-4">
//                     <div className="space-y-2">
//                       <Label className="text-xs xs:text-sm sm:text-base">
//                         Difficulty
//                       </Label>
//                       <Select
//                         value={currentModule.difficulty}
//                         onValueChange={(value: Module["difficulty"]) =>
//                           setCurrentModule((prev) => ({
//                             ...prev,
//                             difficulty: value,
//                           }))
//                         }>
//                         <SelectTrigger className="text-xs xs:text-sm sm:text-base">
//                           <SelectValue />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem
//                             value="Beginner"
//                             className="text-xs xs:text-sm sm:text-base">
//                             Beginner
//                           </SelectItem>
//                           <SelectItem
//                             value="Intermediate"
//                             className="text-xs xs:text-sm sm:text-base">
//                             Intermediate
//                           </SelectItem>
//                           <SelectItem
//                             value="Advanced"
//                             className="text-xs xs:text-sm sm:text-base">
//                             Advanced
//                           </SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div>
//                   </div>
//                   <div className="space-y-2">
//                     <Label className="text-xs xs:text-sm sm:text-base">
//                       Course
//                     </Label>
//                     <Select
//                       value={currentModule.course.id}
//                       onValueChange={(value) =>
//                         setCurrentModule((prev) => ({
//                           ...prev,
//                           course: {
//                             id: value === "none" ? undefined : value,
//                             name:
//                               courses.find((c) => c.id === value)?.name || "",
//                           },
//                         }))
//                       }>
//                       <SelectTrigger className="text-xs xs:text-sm sm:text-base">
//                         <SelectValue placeholder="Select course" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem
//                           value="none"
//                           className="text-xs xs:text-sm sm:text-base">
//                           Select course
//                         </SelectItem>
//                         {courses
//                           .filter((course) => course.id)
//                           .map((course) => (
//                             <SelectItem
//                               key={course.id}
//                               value={course.id}
//                               className="text-xs xs:text-sm sm:text-base">
//                               {course.name}
//                             </SelectItem>
//                           ))}
//                       </SelectContent>
//                     </Select>
//                   </div>
//                   <div className="space-y-2">
//                     <Label className="text-xs xs:text-sm sm:text-base">
//                       Category
//                     </Label>
//                     <Select
//                       value={currentModule.category}
//                       onValueChange={(value) =>
//                         setCurrentModule((prev) => ({
//                           ...prev,
//                           category: value === "none" ? undefined : value,
//                         }))
//                       }>
//                       <SelectTrigger className="text-xs xs:text-sm sm:text-base">
//                         <SelectValue placeholder="Select category" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem
//                           value="none"
//                           className="text-xs xs:text-sm sm:text-base">
//                           Select category
//                         </SelectItem>
//                         {categories
//                           .filter((category) => category.name)
//                           .map((category) => (
//                             <SelectItem
//                               key={category.id}
//                               value={category.name}
//                               className="text-xs xs:text-sm sm:text-base">
//                               {category.name}
//                             </SelectItem>
//                           ))}
//                       </SelectContent>
//                     </Select>
//                   </div>
//                   <div className="space-y-2">
//                     <Label
//                       htmlFor="duration"
//                       className="text-xs xs:text-sm sm:text-base">
//                       Estimated Duration (minutes)
//                     </Label>
//                     <Input
//                       id="duration"
//                       type="number"
//                       min="0"
//                       value={currentModule.duration || ""}
//                       onChange={(e) =>
//                         setCurrentModule((prev) => ({
//                           ...prev,
//                           duration: parseInt(e.target.value) || 0,
//                         }))
//                       }
//                       placeholder="e.g., 37"
//                       className="text-xs xs:text-sm sm:text-base"
//                     />
//                     <p className="text-[0.7rem] text-muted-foreground">
//                       Enter total minutes (e.g., 37 for 37 minutes)
//                     </p>
//                   </div>
//                   <div className="pt-2 xs:pt-3 space-y-2">
//                     <div className="flex justify-between text-[0.85rem] xs:text-xs sm:text-sm">
//                       <span>Total Lessons:</span>
//                       <span>{currentModule.lessonCount}</span>
//                     </div>
//                   </div>
//                   {error && (
//                     <p className="text-red-500 text-[0.85rem] xs:text-xs sm:text-sm">
//                       {error}
//                     </p>
//                   )}
//                   <div className="pt-2 xs:pt-3 space-y-2">
//                     <Button
//                       onClick={currentModule.id ? updateModule : saveModule}
//                       className="w-full text-xs xs:text-sm sm:text-base bg-[#f79771]/70 hover:bg-[#f79771]/80 shadow-md"
//                       disabled={isSaving}>
//                       {isSaving ? (
//                         <Spinner
//                           size="sm"
//                           className="mr-1 xs:mr-2 text-white"
//                         />
//                       ) : (
//                         <Save className="mr-1 xs:mr-2 h-3 w-3 xs:h-4 xs:w-4" />
//                       )}
//                       {isSaving
//                         ? "Saving..."
//                         : currentModule.id
//                           ? "Update Module"
//                           : "Save Module"}
//                     </Button>
//                     <Button
//                       onClick={() =>
//                         publishModule(
//                           currentModule.id,
//                           !currentModule.isPublished,
//                         )
//                       }
//                       variant="outline"
//                       className="w-full bg-transparent text-xs xs:text-sm sm:text-base"
//                       disabled={!currentModule.id}>
//                       <Upload className="mr-1 xs:mr-2 h-3 w-3 xs:h-4 xs:w-4" />
//                       {currentModule.isPublished
//                         ? "Unpublish Module"
//                         : "Publish Module"}
//                     </Button>
//                   </div>
//                 </CardContent>
//               </Card>
//               <Card className="md:col-span-1">
//                 <CardHeader>
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <CardTitle className="text-sm xs:text-base sm:text-lg">
//                         Lessons
//                       </CardTitle>
//                       <CardDescription className="text-[0.85rem] xs:text-xs sm:text-sm">
//                         Manage module lessons
//                       </CardDescription>
//                     </div>
//                     <Button
//                       onClick={addLesson}
//                       size="sm"
//                       className="text-xs xs:text-sm sm:text-base bg-[#f79771]/70 hover:bg-[#f79771] shadow-md">
//                       <Plus className="h-3 w-3 xs:h-4 xs:w-4" />
//                     </Button>
//                   </div>
//                 </CardHeader>
//                 <CardContent className="space-y-2 xs:space-y-3">
//                   {currentModule.lessonCount === 0 ? (
//                     <div className="text-center py-6 xs:py-8 text-muted-foreground">
//                       <BookOpen className="mx-auto h-8 w-8 xs:h-10 xs:w-10 sm:h-12 sm:w-12 mb-2 xs:mb-3 sm:mb-4 opacity-50" />
//                       <p className="text-[0.85rem] xs:text-xs sm:text-sm">
//                         No lessons added yet
//                       </p>
//                       <p className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs">
//                         Click the + button to add your first lesson
//                       </p>
//                     </div>
//                   ) : (
//                     currentModule.lessons.map((lesson, index) => {
//                       const Icon = getTypeIcon(lesson.type);
//                       return (
//                         <div
//                           key={lesson.id}
//                           className={`p-2 px-4 xs:p-3 rounded-lg cursor-pointer transition-colors shadow-md ${
//                             editingLesson?.id === lesson.id
//                               ? "border-primary bg-primary/5"
//                               : "hover:bg-muted/50"
//                           }`}
//                           onClick={() => setEditingLesson(lesson)}>
//                           <div className="flex items-start justify-between">
//                             <div className="flex-1 max-w-[85%]">
//                               {/* Header row */}
//                               <div className="flex items-center gap-1 xs:gap-2 mb-1">
//                                 <Icon className="h-3 w-3 xs:h-4 xs:w-4" />
//                                 <span className="text-[0.85rem] xs:text-xs sm:text-sm font-medium whitespace-nowrap">
//                                   Lesson {index + 1}
//                                 </span>
//                                 <Badge
//                                   variant="outline"
//                                   className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs whitespace-nowrap">
//                                   {lesson.type}
//                                 </Badge>
//                                 {normalizeCoverImageUrl(
//                                   lesson.coverImageUrl,
//                                 ) && (
//                                   <img
//                                     src={normalizeCoverImageUrl(
//                                       lesson.coverImageUrl,
//                                     )}
//                                     alt="Cover"
//                                     onError={(e) => {
//                                       e.currentTarget.src = "/placeholder.jpg";
//                                     }}
//                                     className="w-6 h-4 object-cover rounded ml-1 shrink-0"
//                                   />
//                                 )}
//                               </div>
//                               {/* Title with 2-line ellipsis */}
//                               <p className="text-[0.85rem] xs:text-xs sm:text-sm line-clamp-2 overflow-hidden text-ellipsis">
//                                 {lesson.title || "Untitled lesson"}
//                               </p>
//                               {lesson.duration && (
//                                 <p className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs text-muted-foreground mt-0.5 xs:mt-1">
//                                   {lesson.duration}
//                                 </p>
//                               )}
//                             </div>
//                             <Button
//                               variant="ghost"
//                               size="sm"
//                               className="p-1 xs:p-2 shrink-0"
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 deleteLesson(lesson.id);
//                               }}>
//                               <Trash2 className="h-2.5 w-2.5 xs:h-3 xs:w-3 text-[#DD2701]" />
//                             </Button>
//                           </div>
//                         </div>
//                       );
//                     })
//                   )}
//                 </CardContent>
//               </Card>
//               <Card className="md:col-span-1">
//                 <CardHeader>
//                   <CardTitle className="text-sm xs:text-base sm:text-lg">
//                     Lesson Editor
//                   </CardTitle>
//                   <CardDescription className="text-[0.85rem] xs:text-xs sm:text-sm">
//                     {editingLesson
//                       ? "Edit the selected lesson"
//                       : "Select a lesson to edit"}
//                   </CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   {editingLesson ? (
//                     <div className="space-y-3 xs:space-y-4">
//                       {/* Cover Image Section */}
//                       <div className="space-y-2">
//                         <Label className="text-xs xs:text-sm sm:text-base">
//                           Cover Image
//                         </Label>
//                         {editingLesson.coverImageUrl &&
//                         !editingLesson.coverImage &&
//                         !editingLesson.remove_cover ? (
//                           <div className="flex items-center gap-2">
//                             <img
//                               src={normalizeCoverImageUrl(
//                                 editingLesson.coverImageUrl,
//                               )}
//                               alt="Cover"
//                               onError={(e) => {
//                                 e.currentTarget.src = "/placeholder.svg";
//                               }}
//                               className="h-16 w-16 object-cover rounded"
//                             />
//                             <Button
//                               variant="outline"
//                               size="sm"
//                               className="text-xs xs:text-sm sm:text-base shadow-md"
//                               onClick={() =>
//                                 updateLessonFields(editingLesson.id, {
//                                   remove_cover: true,
//                                   coverImage: null,
//                                 })
//                               }>
//                               Remove Cover
//                             </Button>
//                           </div>
//                         ) : editingLesson.coverImage ? (
//                           <div className="flex items-center gap-2">
//                             <Input
//                               value={editingLesson.coverImage.name}
//                               readOnly
//                               className="text-xs xs:text-sm sm:text-base bg-gray-100"
//                             />
//                             <Button
//                               variant="outline"
//                               size="sm"
//                               className="text-xs xs:text-sm sm:text-base shadow-md"
//                               onClick={() =>
//                                 updateLessonFields(editingLesson.id, {
//                                   coverImage: null,
//                                   remove_cover: false,
//                                 })
//                               }>
//                               Remove
//                             </Button>
//                           </div>
//                         ) : (
//                           <>
//                             <input
//                               type="file"
//                               ref={coverImageInputRef}
//                               className="hidden"
//                               accept="image/jpeg,image/png,image/gif"
//                               onChange={(e) => {
//                                 const file = e.target.files?.[0];
//                                 if (!file) return;
//                                 if (file.size > MAX_IMAGE_BYTES) {
//                                   openFeedback(
//                                     "Cover image too large",
//                                     `Please upload an image up to 1MB. Selected: ${formatBytes(file.size)}`,
//                                   );
//                                   e.currentTarget.value = ""; // reset so user can re-select
//                                   return;
//                                 }
//                                 updateLessonFields(editingLesson.id, {
//                                   coverImage: file,
//                                   remove_cover: false,
//                                 });
//                               }}
//                             />
//                             <Button
//                               variant="outline"
//                               size="sm"
//                               className="w-full bg-transparent text-xs xs:text-sm sm:text-base shadow-md"
//                               onClick={() =>
//                                 coverImageInputRef.current?.click()
//                               }>
//                               <Upload className="mr-1 xs:mr-2 h-2.5 w-2.5 xs:h-3 xs:w-3" />
//                               Upload Cover Image
//                             </Button>
//                           </>
//                         )}
//                       </div>
//                       {/* Lesson Type */}
//                       <div className="space-y-2">
//                         <Label className="text-xs xs:text-sm sm:text-base">
//                           Lesson Type
//                         </Label>
//                         <Select
//                           value={editingLesson.type}
//                           onValueChange={(value: Lesson["type"]) =>
//                             updateLessonFields(editingLesson.id, {
//                               type: value,
//                               videoUrl: "",
//                               audioUrl: "",
//                               content: "",
//                               file: null,
//                               coverImage: null, // Reset cover when changing type
//                             })
//                           }>
//                           <SelectTrigger className="text-xs xs:text-sm sm:text-base">
//                             <SelectValue />
//                           </SelectTrigger>
//                           <SelectContent>
//                             <SelectItem
//                               value="video"
//                               className="text-xs xs:text-sm sm:text-base">
//                               Video
//                             </SelectItem>
//                             <SelectItem
//                               value="audio"
//                               className="text-xs xs:text-sm sm:text-base">
//                               Audio
//                             </SelectItem>
//                             <SelectItem
//                               value="pdf"
//                               className="text-xs xs:text-sm sm:text-base">
//                               PDF
//                             </SelectItem>
//                           </SelectContent>
//                         </Select>
//                       </div>
//                       <div className="space-y-2">
//                         <Label
//                           htmlFor="lesson-title"
//                           className="text-xs xs:text-sm sm:text-base font-medium">
//                           {`Lesson ${
//                             editingLesson.type.charAt(0).toUpperCase() +
//                             editingLesson.type.slice(1)
//                           }`}
//                         </Label>
//                         <Input
//                           id="lesson-title"
//                           value={editingLesson.title}
//                           onChange={(e) =>
//                             updateLessonFields(editingLesson.id, {
//                               title: e.target.value,
//                             })
//                           }
//                           placeholder={`Enter ${editingLesson.type} title`}
//                           className="text-xs xs:text-sm sm:text-base w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         />
//                       </div>
//                       <div className="space-y-2">
//                         <Label className="text-xs xs:text-sm sm:text-base">
//                           Duration (Minutes)
//                         </Label>
//                         <Input
//                           value={editingLesson.duration}
//                           onChange={(e) =>
//                             updateLessonFields(editingLesson.id, {
//                               duration: e.target.value,
//                             })
//                           }
//                           placeholder="e.g., 15 mins"
//                           className="text-xs xs:text-sm sm:text-base"
//                         />
//                       </div>
//                       {/* Video Upload */}
//                       {editingLesson.type === "video" && (
//                         <div className="space-y-2">
//                           <Label className="text-xs xs:text-sm sm:text-base">
//                             Video{" "}
//                             {editingLesson.file ? "File (Selected)" : "Upload"}
//                           </Label>
//                           {editingLesson.file ? (
//                             <div className="flex items-center gap-2">
//                               <Input
//                                 value={getFileName(
//                                   editingLesson.file || editingLesson.videoUrl,
//                                 )}
//                                 readOnly
//                                 className="text-xs xs:text-sm sm:text-base bg-gray-100"
//                               />
//                               <Button
//                                 variant="outline"
//                                 size="sm"
//                                 className="text-xs xs:text-sm sm:text-base shadow-md"
//                                 onClick={() =>
//                                   updateLessonFields(editingLesson.id, {
//                                     file: null,
//                                   })
//                                 }>
//                                 Remove
//                               </Button>
//                             </div>
//                           ) : (
//                             <>
//                               <input
//                                 type="file"
//                                 ref={fileInputRef}
//                                 className="hidden"
//                                 accept="video/mp4,video/mpeg,video/ogg,video/webm,video/x-matroska"
//                                 onChange={(e) => {
//                                   const file = e.target.files?.[0];
//                                   if (!file) return;
//                                   if (file.size > MAX_VIDEO_BYTES) {
//                                     openFeedback(
//                                       "Video too large",
//                                       `Please upload a video up to 50MB. Selected: ${formatBytes(file.size)}`,
//                                     );
//                                     e.currentTarget.value = "";
//                                     return;
//                                   }
//                                   updateLessonFields(editingLesson.id, {file});
//                                 }}
//                               />
//                               <Button
//                                 variant="outline"
//                                 size="sm"
//                                 className="w-full bg-transparent text-xs xs:text-sm sm:text-base shadow-md"
//                                 onClick={() => fileInputRef.current?.click()}>
//                                 <Upload className="mr-1 xs:mr-2 h-2.5 w-2.5 xs:h-3 xs:w-3" />
//                                 Upload Video
//                               </Button>
//                             </>
//                           )}
//                         </div>
//                       )}
//                       {/* Audio Upload */}
//                       {editingLesson.type === "audio" && (
//                         <div className="space-y-2">
//                           <Label className="text-xs xs:text-sm sm:text-base">
//                             Audio{" "}
//                             {editingLesson.file ? "File (Selected)" : "Upload"}
//                           </Label>
//                           {editingLesson.file ? (
//                             <div className="flex items-center gap-2">
//                               <Input
//                                 value={getFileName(
//                                   editingLesson.file || editingLesson.videoUrl,
//                                 )}
//                                 readOnly
//                                 className="text-xs xs:text-sm sm:text-base bg-gray-100"
//                               />
//                               <Button
//                                 variant="outline"
//                                 size="sm"
//                                 className="text-xs xs:text-sm sm:text-base shadow-md"
//                                 onClick={() =>
//                                   updateLessonFields(editingLesson.id, {
//                                     file: null,
//                                   })
//                                 }>
//                                 Remove
//                               </Button>
//                             </div>
//                           ) : (
//                             <>
//                               <input
//                                 type="file"
//                                 ref={fileInputRef}
//                                 className="hidden"
//                                 accept="audio/mpeg,audio/wav,audio/ogg,audio/mp3"
//                                 onChange={(e) => {
//                                   const file = e.target.files?.[0];
//                                   if (!file) return;
//                                   if (file.size > MAX_AUDIO_BYTES) {
//                                     openFeedback(
//                                       "Audio file too large",
//                                       `Maximum allowed size is 10MB. Selected: ${formatBytes(file.size)}`,
//                                     );
//                                     e.currentTarget.value = "";
//                                     return;
//                                   }
//                                   updateLessonFields(editingLesson.id, {file});
//                                 }}
//                               />
//                               <Button
//                                 variant="outline"
//                                 size="sm"
//                                 className="w-full bg-transparent text-xs xs:text-sm sm:text-base shadow-md"
//                                 onClick={() => fileInputRef.current?.click()}>
//                                 <Upload className="mr-1 xs:mr-2 h-2.5 w-2.5 xs:h-3 xs:w-3" />
//                                 Upload Audio
//                               </Button>
//                             </>
//                           )}
//                         </div>
//                       )}
//                       {/* PDF Upload */}
//                       {editingLesson.type === "pdf" && (
//                         <div className="space-y-2">
//                           <Label className="text-xs xs:text-sm sm:text-base">
//                             PDF{" "}
//                             {editingLesson.file ? "File (Selected)" : "Upload"}
//                           </Label>
//                           {editingLesson.file ? (
//                             <div className="flex items-center gap-2">
//                               <Input
//                                 value={getFileName(
//                                   editingLesson.file || editingLesson.videoUrl,
//                                 )}
//                                 readOnly
//                                 className="text-xs xs:text-sm sm:text-base bg-gray-100"
//                               />
//                               <Button
//                                 variant="outline"
//                                 size="sm"
//                                 className="text-xs xs:text-sm sm:text-base shadow-md"
//                                 onClick={() =>
//                                   updateLessonFields(editingLesson.id, {
//                                     file: null,
//                                   })
//                                 }>
//                                 Remove
//                               </Button>
//                             </div>
//                           ) : (
//                             <>
//                               <input
//                                 type="file"
//                                 ref={fileInputRef}
//                                 className="hidden"
//                                 accept="application/pdf,application/epub+zip,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
//                                 onChange={(e) => {
//                                   const file = e.target.files?.[0];
//                                   if (!file) return;
//                                   if (file.size > MAX_PDF_BYTES) {
//                                     openFeedback(
//                                       "PDF too large",
//                                       `Maximum allowed size is 5MB. Selected: ${formatBytes(file.size)}`,
//                                     );
//                                     e.currentTarget.value = "";
//                                     return;
//                                   }
//                                   updateLessonFields(editingLesson.id, {file});
//                                 }}
//                               />
//                               <Button
//                                 variant="outline"
//                                 size="sm"
//                                 className="w-full bg-transparent text-xs xs:text-sm sm:text-base shadow-md"
//                                 onClick={() => fileInputRef.current?.click()}>
//                                 <Upload className="mr-1 xs:mr-2 h-2.5 w-2.5 xs:h-3 xs:w-3" />
//                                 Upload PDF
//                               </Button>
//                             </>
//                           )}
//                         </div>
//                       )}
//                       {/* Text Upload - Simplified, as per original */}
//                       {editingLesson.type === "text" && (
//                         <div className="space-y-2">
//                           <Label className="text-xs xs:text-sm sm:text-base">
//                             Content
//                           </Label>
//                           <Textarea
//                             value={editingLesson.content || ""}
//                             onChange={(e) =>
//                               updateLessonFields(editingLesson.id, {
//                                 content: e.target.value,
//                               })
//                             }
//                             placeholder="Write your lesson content here..."
//                             rows={4}
//                             className="text-xs xs:text-sm sm:text-base"
//                           />
//                         </div>
//                       )}
//                       <Button
//                         onClick={() =>
//                           typeof editingLesson.id === "string" &&
//                           editingLesson.id.startsWith("temp")
//                             ? saveLesson()
//                             : updateLesson(editingLesson.id)
//                         }
//                         className="w-full text-xs xs:text-sm sm:text-base bg-[#f79771]/70 hover:bg-[#f79771]/80"
//                         disabled={isSavingLesson}>
//                         {isSavingLesson ? (
//                           <Spinner
//                             size="sm"
//                             className="mr-1 xs:mr-2 text-white"
//                           />
//                         ) : (
//                           <Save className="mr-1 xs:mr-2 h-3 w-3 xs:h-4 xs:w-4" />
//                         )}
//                         {isSavingLesson
//                           ? "Saving..."
//                           : typeof editingLesson.id === "string" &&
//                               editingLesson.id.startsWith("temp")
//                             ? "Save Lesson"
//                             : "Update Lesson"}
//                       </Button>
//                     </div>
//                   ) : (
//                     <div className="text-center py-6 xs:py-8 text-muted-foreground">
//                       <Edit className="mx-auto h-8 w-8 xs:h-10 xs:w-10 sm:h-12 sm:w-12 mb-2 xs:mb-3 sm:mb-4 opacity-50" />
//                       <p className="text-[0.85rem] xs:text-xs sm:text-sm">
//                         Select a lesson to edit
//                       </p>
//                       <p className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs">
//                         Choose a lesson from the list to start editing
//                       </p>
//                     </div>
//                   )}

//                   {uploading && (
//                     <div className="space-y-2">
//                       <div className="flex items-center justify-between text-xs text-muted-foreground">
//                         <span>
//                           {uploadPhase === "finalizing"
//                             ? "Finalizing…"
//                             : "Uploading…"}{" "}
//                           {uploadInfo.total > 0
//                             ? `${(uploadInfo.loaded / (1024 * 1024)).toFixed(1)}MB / ${(uploadInfo.total / (1024 * 1024)).toFixed(1)}MB`
//                             : ""}
//                         </span>
//                         <span>{uploadInfo.percent}%</span>
//                       </div>

//                       <div className="h-2 w-full rounded bg-muted overflow-hidden">
//                         <div
//                           className="h-full bg-[#EF7B55]"
//                           style={{width: `${uploadInfo.percent}%`}}
//                         />
//                       </div>
//                     </div>
//                   )}
//                 </CardContent>
//               </Card>
//             </div>
//           )}
//         </TabsContent>
//         {/* Manage and Analytics tabs remain the same as original */}
//         <TabsContent value="manage" className="space-y-3 xs:space-y-4">
//           <div className="flex flex-wrap items-start xs:items-center justify-between gap-2 xs:gap-3">
//             <div>
//               <h2 className="text-lg xs:text-xl sm:text-2xl font-bold">
//                 Manage Modules
//               </h2>
//               <p className="text-muted-foreground text-[0.85rem] xs:text-xs sm:text-sm">
//                 View and manage all your learning modules
//               </p>
//             </div>
//             <div className="flex flex-col gap-3 w-full">
//               {/* Search */}
//               <div className="flex gap-2 w-full">
//                 <div className="relative flex-1">
//                   <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                   <Input
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     placeholder="Search modules..."
//                     onKeyDown={(e) =>
//                       e.key === "Enter" && setSearch(searchQuery)
//                     }
//                     className="pl-8 text-sm"
//                   />
//                 </div>
//                 <Button
//                   onClick={() => setSearch(searchQuery)}
//                   className="px-3 bg-[#f79771] hover:bg-gray-300 shadow-md">
//                   <Search className="h-4 w-4" />
//                 </Button>
//               </div>
//               {/* Filters */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex gap-3 w-full">
//                 <Select
//                   value={difficultyFilter}
//                   onValueChange={setDifficultyFilter}>
//                   <SelectTrigger className="w-full text-sm">
//                     <SelectValue placeholder="Difficulty" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="Beginner">Beginner</SelectItem>
//                     <SelectItem value="Intermediate">Intermediate</SelectItem>
//                     <SelectItem value="Advanced">Advanced</SelectItem>
//                   </SelectContent>
//                 </Select>
//                 <Select value={courseFilter} onValueChange={setCourseFilter}>
//                   <SelectTrigger className="w-full text-sm">
//                     <SelectValue placeholder="All Courses" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="all">All Courses</SelectItem>
//                     {courses
//                       .filter((c) => c.id)
//                       .map((course) => (
//                         <SelectItem key={course.id} value={String(course.id)}>
//                           {course.name}
//                         </SelectItem>
//                       ))}
//                   </SelectContent>
//                 </Select>
//                 <Select
//                   value={categoryFilter}
//                   onValueChange={setCategoryFilter}>
//                   <SelectTrigger className="w-full text-sm">
//                     <SelectValue placeholder="All Categories" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="all">All Categories</SelectItem>
//                     {categories
//                       .filter((cat) => cat.id)
//                       .map((category) => (
//                         <SelectItem
//                           key={category.id}
//                           value={String(category.id)}>
//                           {category.name}
//                         </SelectItem>
//                       ))}
//                   </SelectContent>
//                 </Select>
//                 {/* Create Button */}
//                 <Button
//                   onClick={() => {
//                     setCurrentModule(initialModule);
//                     setActiveTab("create");
//                   }}
//                   className="
//         w-full
//         lg:w-auto
//         bg-[#f79771]
//         hover:bg-gray-300
//         shadow-md
//         text-sm
//         flex items-center justify-center
//       ">
//                   <Plus className="mr-2 h-4 w-4" />
//                   Create New
//                 </Button>
//               </div>
//             </div>
//           </div>
//           {isLoadingModules ? (
//             <div className="relative min-h-[200px] flex items-center justify-center bg-gray-100/50 rounded-lg">
//               <Spinner size="md" className="text-[#EF7B55]" />
//             </div>
//           ) : error ? (
//             <div className="text-center py-8 xs:py-12 text-red-500">
//               <p className="text-[0.85rem] xs:text-xs sm:text-sm">{error}</p>
//             </div>
//           ) : (
//             <>
//               <div className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
//                 Showing{" "}
//                 {
//                   getPaginatedModules(modules, currentPageManage)
//                     .paginatedModules.length
//                 }{" "}
//                 of {getPaginatedModules(modules, currentPageManage).totalCount}{" "}
//                 Modules
//               </div>
//               <div className="grid gap-3 xs:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
//                 {getPaginatedModules(
//                   modules,
//                   currentPageManage,
//                 ).paginatedModules.map((module) => {
//                   const Icon = getTypeIcon(module.type);
//                   return (
//                     <Card
//                       key={module.id}
//                       className="hover:shadow-lg transition-shadow flex flex-col h-full">
//                       <CardHeader>
//                         <div className="flex items-start justify-between">
//                           <div className="space-y-1 flex-1">
//                             <CardTitle
//                               className="text-sm xs:text-base sm:text-lg"
//                               title={module.title}>
//                               {shortenText(module.title, 45)}
//                             </CardTitle>
//                             <CardDescription
//                               className="text-xs sm:text-sm"
//                               title={module.description}>
//                               {shortenText(module.description, 90)}
//                             </CardDescription>
//                           </div>
//                           <DropdownMenu>
//                             <DropdownMenuTrigger asChild>
//                               <Button variant="ghost" className="h-8 w-8 p-0">
//                                 <span className="sr-only">Open menu</span>
//                                 <MoreVertical className="h-4 w-4" />
//                               </Button>
//                             </DropdownMenuTrigger>
//                             <DropdownMenuContent align="end">
//                               <DropdownMenuItem
//                                 onClick={async () => {
//                                   const moduleData = await getModuleDetails(
//                                     module.id,
//                                   );
//                                   if (moduleData) {
//                                     setCurrentModule(moduleData);
//                                     setActiveTab("create");
//                                   }
//                                 }}>
//                                 <Edit className="mr-2 h-4 w-4" />
//                                 <span>Edit</span>
//                               </DropdownMenuItem>
//                               <DropdownMenuItem
//                                 onClick={async () => {
//                                   const moduleData = await getModuleDetails(
//                                     module.id,
//                                   );
//                                   if (moduleData) {
//                                     setPreviewModule(moduleData);
//                                     setIsPreviewOpen(true);
//                                   }
//                                 }}>
//                                 <Eye className="mr-2 h-4 w-4" />
//                                 <span>Preview</span>
//                               </DropdownMenuItem>
//                               <DropdownMenuItem
//                                 onClick={() =>
//                                   handleDeleteModuleClick(module.id)
//                                 }
//                                 className="text-red-600">
//                                 <Trash2 className="mr-2 h-4 w-4" />
//                                 <span>Delete</span>
//                               </DropdownMenuItem>
//                             </DropdownMenuContent>
//                           </DropdownMenu>
//                         </div>
//                       </CardHeader>
//                       <CardContent className="flex flex-col flex-1 justify-between space-y-3 xs:space-y-4">
//                         <div>
//                           <div className="flex items-center flex-wrap gap-2">
//                             <Badge
//                               variant={
//                                 module.isPublished ? "default" : "secondary"
//                               }
//                               className={
//                                 module.isPublished
//                                   ? "bg-[#EF7B55]/70 hover:bg-[#EF7B55]/80"
//                                   : "bg-gray-500 text-white hover:bg-gray-600"
//                               }>
//                               {module.isPublished ? "Published" : "Draft"}
//                             </Badge>
//                             <Badge
//                               variant="outline"
//                               className="text-[0.85rem] xs:text-xs sm:text-sm">
//                               {module.difficulty}
//                             </Badge>
//                             <Badge
//                               variant="outline"
//                               className="text-[0.85rem] xs:text-xs sm:text-sm">
//                               {module.category || "Uncategorized"}
//                             </Badge>
//                             <Badge
//                               variant="outline"
//                               className="text-[0.85rem] xs:text-xs sm:text-sm">
//                               {module.course.name}
//                             </Badge>
//                           </div>
//                           <div className="grid grid-cols-2 gap-3 xs:gap-4 text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground mt-3">
//                             <div className="flex items-center gap-1">
//                               <Clock className="h-2.5 w-2.5 xs:h-3 xs:w-3" />
//                               {module.duration} min
//                             </div>
//                             <div>{module.createdDate}</div>
//                           </div>
//                         </div>
//                         {/* 👇 Buttons pushed to bottom */}
//                         <div className="flex gap-2 flex-col lg:flex-row mt-auto">
//                           <Button
//                             className="flex-1 text-xs xs:text-sm sm:text-base bg-[#f79771]/70 hover:bg-[#f79771]/90"
//                             disabled={loadingModuleId === module.id}
//                             onClick={async () => {
//                               setLoadingModuleId(module.id); // 🔹 start loading
//                               try {
//                                 const moduleData = await getModuleDetails(
//                                   module.id,
//                                 );
//                                 if (moduleData) {
//                                   setCurrentModule(moduleData);
//                                   setActiveTab("create");
//                                 }
//                               } finally {
//                                 setLoadingModuleId(null); // 🔹 stop loading
//                               }
//                             }}>
//                             {loadingModuleId === module.id ? (
//                               <>
//                                 <Spinner
//                                   size="sm"
//                                   className="mr-1 xs:mr-2 text-white"
//                                 />
//                                 Loading...
//                               </>
//                             ) : (
//                               <>
//                                 <Edit className="mr-1 xs:mr-2 h-2.5 w-2.5 xs:h-3 xs:w-3" />
//                                 Edit
//                               </>
//                             )}
//                           </Button>
//                           <Button
//                             variant="outline"
//                             className="flex-1 text-xs xs:text-sm sm:text-base"
//                             disabled={loadingModuleId === module.id}
//                             onClick={async () => {
//                               setLoadingModuleId(module.id);
//                               try {
//                                 const moduleData = await getModuleDetails(
//                                   module.id,
//                                 );
//                                 if (moduleData) {
//                                   setPreviewModule(moduleData);
//                                   setIsPreviewOpen(true);
//                                 }
//                               } finally {
//                                 setLoadingModuleId(null);
//                               }
//                             }}>
//                             {loadingModuleId === module.id ? (
//                               <>
//                                 <Spinner size="sm" className="mr-1 xs:mr-2" />
//                                 Loading...
//                               </>
//                             ) : (
//                               <>
//                                 <Eye className="mr-1 xs:mr-2 h-2.5 w-2.5 xs:h-3 xs:w-3" />
//                                 Preview
//                               </>
//                             )}
//                           </Button>
//                         </div>
//                       </CardContent>
//                     </Card>
//                   );
//                 })}
//               </div>
//               {getPaginatedModules(modules, currentPageManage).totalCount ===
//               0 ? (
//                 <div className="text-center py-8 xs:py-12">
//                   <BookOpen className="mx-auto h-8 w-8 xs:h-12 xs:w-12 text-muted-foreground mb-3 xs:mb-4" />
//                   <h3 className="text-base xs:text-lg sm:text-xl font-medium mb-2">
//                     No Modules found
//                   </h3>
//                   <p className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
//                     Create a new module to get started
//                   </p>
//                 </div>
//               ) : (
//                 <Pagination className="mt-4">
//                   <PaginationContent>
//                     <PaginationPrevious
//                       onClick={() =>
//                         setCurrentPageManage((prev) => Math.max(prev - 1, 1))
//                       }
//                       className={
//                         currentPageManage === 1
//                           ? "pointer-events-none opacity-50"
//                           : ""
//                       }
//                     />
//                     {Array.from(
//                       {
//                         length: getPaginatedModules(modules, currentPageManage)
//                           .totalPages,
//                       },
//                       (_, index) => index + 1,
//                     ).map((page) => (
//                       <PaginationItem key={page}>
//                         <PaginationLink
//                           href="#"
//                           isActive={currentPageManage === page}
//                           onClick={(e) => {
//                             e.preventDefault();
//                             setCurrentPageManage(page);
//                           }}>
//                           {page}
//                         </PaginationLink>
//                       </PaginationItem>
//                     ))}
//                     <PaginationNext
//                       onClick={() =>
//                         setCurrentPageManage((prev) =>
//                           Math.min(
//                             prev + 1,
//                             getPaginatedModules(modules, currentPageManage)
//                               .totalPages,
//                           ),
//                         )
//                       }
//                       className={
//                         currentPageManage ===
//                         getPaginatedModules(modules, currentPageManage)
//                           .totalPages
//                           ? "pointer-events-none opacity-50"
//                           : ""
//                       }
//                     />
//                   </PaginationContent>
//                 </Pagination>
//               )}
//             </>
//           )}
//         </TabsContent>
//         <TabsContent value="analytics" className="space-y-3 xs:space-y-4">
//           {analyticsLoading ? (
//             <div className="flex items-center justify-center py-12">
//               <Spinner size="md" />
//             </div>
//           ) : analyticsError ? (
//             <div className="text-center py-8 text-red-500">
//               {analyticsError}
//             </div>
//           ) : analytics ? (
//             <>
//               <div>
//                 <h2 className="text-lg xs:text-xl sm:text-2xl font-bold">
//                   Module Analytics
//                 </h2>
//                 <p className="text-muted-foreground text-[0.85rem] xs:text-xs sm:text-sm">
//                   Track performance and engagement of your learning modules
//                 </p>
//               </div>
//               {/* */}
//               <div className="grid gap-3 xs:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
//                 <Card>
//                   <CardHeader className="pb-1 xs:pb-2">
//                     <CardTitle className="text-[0.85rem] xs:text-xs sm:text-sm font-medium">
//                       Total Enrollments
//                     </CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="text-lg xs:text-xl sm:text-2xl font-bold">
//                       {analytics.aggregates.total_enrollments}
//                     </div>
//                   </CardContent>
//                 </Card>
//                 <Card>
//                   <CardHeader className="pb-1 xs:pb-2">
//                     <CardTitle className="text-[0.85rem] xs:text-xs sm:text-sm font-medium">
//                       Avg. Completion Rate
//                     </CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="text-lg xs:text-xl sm:text-2xl font-bold">
//                       {analytics.aggregates.completion_rate.toFixed(1)}%
//                     </div>
//                   </CardContent>
//                 </Card>
//               </div>
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="text-sm xs:text-base sm:text-lg">
//                     Module Performance
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground mb-2">
//                     Page {analytics.pagination.current_page} of{" "}
//                     {analytics.pagination.total_pages}
//                   </div>
//                   <div className="space-y-2 xs:space-y-3">
//                     {analytics.modules.length === 0 ? (
//                       <p className="text-center py-8 text-muted-foreground">
//                         No modules found
//                       </p>
//                     ) : (
//                       analytics.modules.map((module) => (
//                         <div
//                           key={module.id}
//                           className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 xs:p-4 border rounded-lg">
//                           <div className="space-y-1 flex-1">
//                             <h4 className="font-medium text-[0.85rem] xs:text-xs sm:text-sm">
//                               {module.title}
//                             </h4>
//                             <div className="flex flex-wrap items-center gap-2 xs:gap-3 text-[0.6rem] xs:text-[0.65rem] sm:text-xs text-muted-foreground">
//                               {/*<div>
//                                 Completion: {module.completion.toFixed(1)}%
//                               </div>*/}
//                             </div>
//                           </div>
//                         </div>
//                       ))
//                     )}
//                   </div>
//                   {analytics.pagination.total_pages > 1 && (
//                     <Pagination className="mt-4">
//                       <PaginationContent>
//                         <PaginationPrevious
//                           onClick={() =>
//                             setCurrentPageAnalytics((p) => Math.max(p - 1, 1))
//                           }
//                           className={
//                             currentPageAnalytics === 1
//                               ? "pointer-events-none opacity-50"
//                               : ""
//                           }
//                         />
//                         {Array.from(
//                           {length: analytics.pagination.total_pages},
//                           (_, i) => (
//                             <PaginationItem key={i + 1}>
//                               <PaginationLink
//                                 isActive={currentPageAnalytics === i + 1}
//                                 onClick={() => setCurrentPageAnalytics(i + 1)}>
//                                 {i + 1}
//                               </PaginationLink>
//                             </PaginationItem>
//                           ),
//                         )}
//                         <PaginationNext
//                           onClick={() =>
//                             setCurrentPageAnalytics((p) =>
//                               Math.min(p + 1, analytics.pagination.total_pages),
//                             )
//                           }
//                           className={
//                             currentPageAnalytics ===
//                             analytics.pagination.total_pages
//                               ? "pointer-events-none opacity-50"
//                               : ""
//                           }
//                         />
//                       </PaginationContent>
//                     </Pagination>
//                   )}
//                 </CardContent>
//               </Card>
//             </>
//           ) : null}
//         </TabsContent>
//       </Tabs>
//       <PreviewModal
//         module={previewModule}
//         isOpen={isPreviewOpen}
//         onClose={() => {
//           setIsPreviewOpen(false);
//           setPreviewModule(null);
//         }}
//       />
//       {/* Feedback Dialog */}
//       <AlertDialog
//         open={feedbackDialog.open}
//         onOpenChange={(open) => setFeedbackDialog((prev) => ({...prev, open}))}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>{feedbackDialog.title}</AlertDialogTitle>
//             {feedbackDialog.description && (
//               <AlertDialogDescription>
//                 {feedbackDialog.description}
//               </AlertDialogDescription>
//             )}
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogAction
//               onClick={() =>
//                 setFeedbackDialog((prev) => ({...prev, open: false}))
//               }>
//               OK
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//       {/* Confirm Delete Module Dialog */}
//       <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Delete module?</AlertDialogTitle>
//             <AlertDialogDescription>
//               This action cannot be undone. This will permanently delete this
//               module and all its lessons.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel
//               onClick={() => {
//                 setDeleteDialogOpen(false);
//                 setModuleToDelete(null);
//               }}>
//               Cancel
//             </AlertDialogCancel>
//             <AlertDialogAction
//               className="bg-red-600 hover:bg-red-700"
//               onClick={handleConfirmDeleteModule}>
//               Delete
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//       <AlertDialog open={gaDialogOpen} onOpenChange={setGaDialogOpen}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Course general access</AlertDialogTitle>
//             <AlertDialogDescription>
//               {gaCourse ? (
//                 <>
//                   Configure general access for <b>{gaCourse.name}</b>.
//                   <br />
//                   Students can log in without subscription when enabled, but
//                   lesson access stops after expiry.
//                 </>
//               ) : null}
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <div className="space-y-4 py-2">
//             <div className="flex items-center justify-between gap-3">
//               <Label className="text-sm">Enable general activation</Label>
//               <input
//                 type="checkbox"
//                 checked={gaEnabled}
//                 onChange={(e) => setGaEnabled(e.target.checked)}
//               />
//             </div>
//             <div className="space-y-2">
//               <Label className="text-sm">Expiry date (optional)</Label>
//               <Input
//                 type="datetime-local"
//                 value={gaDateLocal}
//                 onChange={(e) => setGaDateLocal(e.target.value)}
//                 disabled={!gaEnabled}
//               />
//             </div>
//           </div>
//           <AlertDialogFooter>
//             <AlertDialogCancel disabled={gaSaving}>Cancel</AlertDialogCancel>
//             <AlertDialogAction onClick={saveGA} disabled={gaSaving}>
//               {gaSaving ? "Saving..." : "Save"}
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// }

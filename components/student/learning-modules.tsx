"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Play,
  Video,
  Headphones,
  BookOpen,
  FileText,
  Clock,
  Users,
  CheckCircle,
  Download,
  Eye,
  Star,
  Bookmark,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { VideoModal } from "@/components/student/video-modal";
import { AudioPlayer } from "@/components/student/audio-player";
import { PDFViewer } from "@/components/student/pdf-viewer";
import { useSession } from "next-auth/react";
import { Spinner } from "@/components/ui/spinner";
import toast from "react-hot-toast";
import { openDB } from "idb";

interface Module {
  id: number;
  title: string;
  content_type: string;
  duration: string;
  url: string | null;
  course: string;
  subject: string;
  instructor: string | null;
  module_order: number;
  lesson_order: number;
  progress: number;
  popularity: number;
  updated_at: string;
  type?: string;
  scheduledAt?: string;
  isActiveNow?: boolean;
}

interface ModulesData {
  videos: Module[];
  audio: Module[];
  pdfs: Module[];
  docs: Module[];
  links: Module[];
  tutorials: Module[];
}

interface ActiveModule {
  id: number;
  name: string;
  courseName: string;
}

const StarRating = ({ popularity }: { popularity: number | null }) => {
  if (!popularity || popularity <= 0) return null;
  const maxStars = 5;
  const filledStars = Math.min(Math.max(popularity, 0), maxStars);
  return (
    <div className="flex items-center gap-1">
      {[...Array(maxStars)].map((_, index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${
            index < filledStars
              ? "fill-current text-yellow-500"
              : "text-muted-foreground"
          }`}
        />
      ))}
    </div>
  );
};

export function LearningModules() {
  const { data: session, status } = useSession();
  const [currentPage, setCurrentPage] = useState({
    videos: 1,
    audio: 1,
    pdfs: 1,
    tutorials: 1,
  });
  const [modules, setModules] = useState<ModulesData | null>(null);
  const [activeModules, setActiveModules] = useState<ActiveModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [audioPlayerOpen, setAudioPlayerOpen] = useState(false);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Module | null>(null);
  const [selectedAudio, setSelectedAudio] = useState<Module | null>(null);
  const [selectedPdf, setSelectedPdf] = useState<Module | null>(null);
  const [selectedModuleName, setSelectedModuleName] = useState<string>("all");
  const [savedLessons, setSavedLessons] = useState<Set<number>>(new Set());
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const sessionToken = useMemo(
    () => session?.user?.sessionToken || null,
    [session?.user?.sessionToken]
  );

  const itemsPerPage = 3;
  const MAX_CACHE_SIZE = 500 * 1024 * 1024; // 500MB max storage

  // Fallback data for UI stability
  const fallbackData: ModulesData = {
    videos: [
      {
        id: 1,
        title: "React Hooks Masterclass",
        content_type: "video",
        duration: "4h 30m",
        url: "/sample-video.mp4",
        course: "Advanced React Development",
        subject: "Advanced React Development",
        instructor: "Sarah Wilson",
        module_order: 1,
        lesson_order: 1,
        progress: 65,
        popularity: 3,
        updated_at: "2025-08-27T14:17:18.781644+00:00",
      },
      {
        id: 2,
        title: "Python for Beginners",
        content_type: "video",
        duration: "6h 15m",
        url: "/sample-video.mp4",
        course: "Python for Data Science",
        subject: "Python for Data Science",
        instructor: "John Martinez",
        module_order: 2,
        lesson_order: 1,
        progress: 100,
        popularity: 4,
        updated_at: "2025-08-27T14:16:34.225646+00:00",
      },
    ],
    audio: [
      {
        id: 4,
        title: "Tech Career Podcast Series",
        content_type: "audio",
        duration: "12h total",
        url: "/sample-audio.mp3",
        course: "Career Development",
        subject: "Career Development",
        instructor: "Industry Experts",
        module_order: 1,
        lesson_order: 1,
        progress: 40,
        popularity: 2,
        updated_at: "2025-08-27T14:17:18.781644+00:00",
      },
    ],
    pdfs: [
      {
        id: 5,
        title: "JavaScript ES6 Guide",
        content_type: "pdf",
        duration: "N/A",
        url: "/sample.pdf",
        course: "JavaScript Algorithms",
        subject: "JavaScript Algorithms",
        instructor: "John Doe",
        module_order: 1,
        lesson_order: 1,
        progress: 0,
        popularity: 1,
        updated_at: "2025-08-27T14:17:18.781644+00:00",
      },
    ],
    docs: [],
    links: [],
    tutorials: [
      {
        id: 6,
        title: "Sample Tutorial",
        type: "Live Session",
        duration: "60m",
        scheduledAt: "2025-09-02T14:27:12+00:00",
        course: "Python for Data Science",
        subject: "Python for Data Science",
        instructor: null,
        module_order: 1,
        lesson_order: 1,
        progress: 0,
        popularity: 0,
        updated_at: "2025-08-27T14:17:18.781644+00:00",
        isActiveNow: false,
      },
    ],
  };

  // Initialize IndexedDB
  const openDB = async () => {
    const dbName = "studentDB";
    const storeName = "media";
    const version = 3;

    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(dbName, version);

      request.onupgradeneeded = (event) => {
        const db = request.result;
        console.log(
          `[LearningModules] Upgrading database ${dbName} to version ${version}`
        );
        if (!db.objectStoreNames.contains("dashboard")) {
          db.createObjectStore("dashboard", { keyPath: "key" });
        }
        if (!db.objectStoreNames.contains("liveSessions")) {
          db.createObjectStore("liveSessions", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("tests")) {
          db.createObjectStore("tests", { keyPath: "testId" });
        }
        if (!db.objectStoreNames.contains("modules")) {
          db.createObjectStore("modules", { keyPath: "key" });
        }
        if (!db.objectStoreNames.contains("activeModules")) {
          db.createObjectStore("activeModules", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: "moduleId" });
          console.log(`[LearningModules] Created object store ${storeName}`);
        }
      };

      request.onsuccess = () => {
        console.log(`[LearningModules] Opened database ${dbName}`);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error(
          `[LearningModules] Error opening database ${dbName}:`,
          request.error
        );
        reject(request.error);
      };
    });
  };

  // Cache modules data in IndexedDB
  const cacheModulesData = async (data: ModulesData) => {
    try {
      const db = await openDB();
      const tx = db.transaction("modules", "readwrite");
      const store = tx.objectStore("modules");
      await store.put({ key: "learning-modules", data });
      await tx.done;
      console.log("[LearningModules] Modules data cached successfully");
    } catch (error) {
      console.error("[LearningModules] Error caching modules data:", error);
    }
  };

  // Cache active modules in IndexedDB
  const cacheActiveModules = async (modules: ActiveModule[]) => {
    try {
      const db = await openDB();
      const tx = db.transaction("activeModules", "readwrite");
      const store = tx.objectStore("activeModules");
      await store.clear();
      for (const module of modules) {
        await store.put(module);
      }
      await tx.done;
      console.log("[LearningModules] Active modules cached successfully");
    } catch (error) {
      console.error("[LearningModules] Error caching active modules:", error);
    }
  };

  // Update headers to accept contentType
  const headers = (sessionToken: string | undefined, contentType: string) => ({
    Authorization: `Api-Key 1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz`,
    "Content-Type":
      contentType === "video"
        ? "video/mp4"
        : contentType === "audio"
        ? "audio/mpeg"
        : "application/pdf",
    ...(sessionToken && { "X-Session-Token": sessionToken }),
  });

  const cacheMedia = async (
    moduleId: number,
    url: string,
    contentType: string
  ) => {
    try {
      const proxyUrl = `/api/proxy-video?url=${encodeURIComponent(url)}`;
      console.log(
        `[LearningModules] Attempting to cache ${contentType} for module ${moduleId}: ${proxyUrl}`
      );
      const response = await fetch(proxyUrl, {
        headers: headers(sessionToken),
      });
      console.log(`[LearningModules] Cache response:`, {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        url: proxyUrl,
      });

      if (!response.ok) {
        const rawResponse = await response.text();
        console.error(`[LearningModules] Cache failed:`, {
          status: response.status,
          statusText: response.statusText,
          body: rawResponse.slice(0, 200),
          url: proxyUrl,
        });
        throw new Error(
          `Failed to fetch ${contentType}: ${response.status} ${response.statusText}`
        );
      }

      const blob = await response.blob();
      const db = await openDB();
      const tx = db.transaction("media", "readwrite");
      const store = tx.objectStore("media");
      await store.put({ moduleId, content: blob, contentType });
      await tx.done;
      console.log(
        `[LearningModules] Successfully cached ${contentType} for module ${moduleId}`
      );
      return true;
    } catch (error) {
      console.error(
        `[LearningModules] Error caching ${contentType} for module ${moduleId}:`,
        error
      );
      toast.error(`Failed to cache ${contentType} for module ${moduleId}.`);
      return false;
    }
  };

  const loadMediaFromDB = async (moduleId: number) => {
    try {
      const db = await openDB();
      const tx = db.transaction("media", "readonly");
      const store = tx.objectStore("media");
      const data = await store.get(moduleId);
      if (data?.content) {
        const blobUrl = URL.createObjectURL(data.content);
        console.log(
          `[LearningModules] Loaded blob URL for module ${moduleId}: ${blobUrl}`
        );
        return blobUrl;
      }
      console.log(
        `[LearningModules] No cached media found for module ${moduleId}`
      );
      return null;
    } catch (error) {
      console.error(
        `[LearningModules] Error loading media for module ${moduleId}:`,
        error
      );
      return null;
    }
  };

  // Load modules from IndexedDB
  const loadModulesFromDB = async () => {
    try {
      const db = await openDB();
      const tx = db.transaction("modules", "readonly");
      const store = tx.objectStore("modules");
      const cachedData = await store.get("learning-modules");
      if (cachedData?.data) {
        setModules(cachedData.data);
        setError(null);
        console.log("[LearningModules] Loaded modules from IndexedDB");
      } else {
        setModules(fallbackData);
        console.warn(
          "[LearningModules] No cached modules found, using fallback data"
        );
      }
    } catch (error) {
      console.error("[LearningModules] Error loading modules from DB:", error);
      setModules(fallbackData);
    }
    setLoading(false);
  };

  // Load active modules from IndexedDB
  const loadActiveModulesFromDB = async () => {
    try {
      const db = await openDB();
      const tx = db.transaction("activeModules", "readonly");
      const store = tx.objectStore("activeModules");
      const cachedModules = await store.getAll();
      if (cachedModules.length) {
        setActiveModules(cachedModules);
        setError(null);
        console.log("[LearningModules] Loaded active modules from IndexedDB");
      }
    } catch (error) {
      console.error(
        "[LearningModules] Error loading active modules from DB:",
        error
      );
    }
    setLoading(false);
  };

  const cacheAllMedia = async (modules: ModulesData) => {
    if (!navigator.onLine) {
      console.log("[LearningModules] Offline, skipping media caching");
      return;
    }

    const mediaTypes: { key: keyof ModulesData; contentType: string }[] = [
      { key: "videos", contentType: "video" },
      { key: "audio", contentType: "audio" },
      { key: "pdfs", contentType: "pdf" },
    ];

    try {
      const db = await openDB();
      let totalSize = 0;

      // Estimate current storage size with a separate transaction
      const sizeTx = db.transaction("media", "readonly");
      const sizeStore = sizeTx.objectStore("media");
      const cursorRequest = sizeStore.openCursor();
      await new Promise<void>((resolve, reject) => {
        cursorRequest.onsuccess = () => {
          const cursor = cursorRequest.result;
          if (cursor) {
            if (cursor.value.content instanceof Blob) {
              totalSize += cursor.value.content.size;
            }
            cursor.continue();
          } else {
            resolve();
          }
        };
        cursorRequest.onerror = () => reject(cursorRequest.error);
      });
      await sizeTx.done;
      console.log(
        `[LearningModules] Estimated current storage size: ${totalSize} bytes`
      );

      // Cache media files with individual transactions
      for (const { key, contentType } of mediaTypes) {
        for (const module of modules[key]) {
          if (module.url && totalSize < MAX_CACHE_SIZE) {
            console.log(
              `[LearningModules] Pre-caching ${contentType} for module ${module.id}`
            );
            const proxyUrl = `/api/proxy-video?url=${encodeURIComponent(
              module.url
            )}`;
            const response = await fetch(proxyUrl, {
              headers: headers(sessionToken, contentType),
            });
            if (response.ok) {
              const blob = await response.blob();
              totalSize += blob.size;
              if (totalSize <= MAX_CACHE_SIZE) {
                // Use a new transaction for each store operation
                const tx = db.transaction("media", "readwrite");
                const store = tx.objectStore("media");
                await store.put({
                  moduleId: module.id,
                  content: blob,
                  contentType,
                });
                await tx.done;
                console.log(
                  `[LearningModules] Pre-cached ${contentType} for module ${module.id}`
                );
              } else {
                console.warn(
                  `[LearningModules] Cache limit reached, skipping ${contentType} for module ${module.id}`
                );
                toast.error(
                  `Storage limit reached, some ${contentType}s may not be available offline.`
                );
                break;
              }
            } else {
              console.error(
                `[LearningModules] Failed to pre-cache ${contentType} for module ${module.id}: ${response.status}`
              );
            }
          }
        }
      }
      console.log("[LearningModules] All media caching completed");
    } catch (error) {
      console.error("[LearningModules] Error during media pre-caching:", error);
      toast.error("Failed to cache some media for offline use.");
    }
  };

  const handleLogout = async () => {
    console.log(
      "[LearningModules] Initiating logout, sessionToken:",
      session?.user?.sessionToken
    );
    try {
      const response = await fetch("/api/auth/logout-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      console.log(
        "[LearningModules] Logout API response status:",
        response.status
      );
      const data = await response.json();
      console.log("[LearningModules] Logout API response:", data);
      if (!response.ok) {
        console.error("[LearningModules] Logout failed:", data);
        throw new Error(data.error || "Logout failed");
      }
      console.log("[LearningModules] Logout successful, redirecting to /login");
      document.cookie = "next-auth.session-token=; Max-Age=0; path=/; secure";
      document.cookie = "next-auth.csrf-token=; Max-Age=0; path=/; secure";
      window.location.href = "/login";
    } catch (error) {
      console.error("[LearningModules] Logout error:", error);
      document.cookie = "next-auth.session-token=; Max-Age=0; path=/; secure";
      document.cookie = "next-auth.csrf-token=; Max-Age=0; path=/; secure";
      window.location.href = "/login";
    }
  };

  useEffect(() => {
    const fetchModules = async () => {
      console.log(
        "[LearningModules] Session status:",
        status,
        "Session token:",
        session?.user?.sessionToken
      );
      if (status !== "authenticated" || !sessionToken) {
        console.log(
          "[LearningModules] Session not authenticated, status:",
          status
        );
        setError("Not authenticated");
        loadModulesFromDB();
        return;
      }

      try {
        console.log(
          "[LearningModules] Fetching from /api/student/learning-modules with token:",
          session.user.sessionToken
        );
        const response = await fetch("/api/student/learning-modules", {
          headers: {
            "Content-Type": "application/json",
            "X-Session-Token": sessionToken,
          },
        });
        console.log(
          "[LearningModules] Fetch response status:",
          response.status
        );
        if (!response.ok) {
          console.error(
            "[LearningModules] Fetch failed with status:",
            response.status
          );
          if (response.status === 401 || response.status === 403) {
            setError("Session expired");
            setModules(null);
            loadModulesFromDB();
            return;
          }
          setError("Failed to fetch modules");
          setModules(fallbackData);
          throw new Error("Fetch failed");
        }
        const data = await response.json();
        console.log("[LearningModules] Fetch response data:", data);
        setModules(data);
        await cacheModulesData(data);
        // Cache all media files after fetching modules
        await cacheAllMedia(data);
        setError(null);
      } catch (e) {
        console.error("[LearningModules] Fetch error:", e);
        setError("Failed to fetch modules, using cached data");
        loadModulesFromDB();
      }
      setLoading(false);
    };

    const fetchActiveModules = async () => {
      console.log(
        "[LearningModules] Session status for active modules:",
        status,
        "Session token:",
        session?.user?.sessionToken
      );
      if (status !== "authenticated" || !sessionToken) {
        console.log(
          "[LearningModules] Skipping active modules fetch, not authenticated"
        );
        setActiveModules([]);
        loadActiveModulesFromDB();
        return;
      }

      try {
        console.log(
          "[LearningModules] Fetching from /api/student/modules/active with token:",
          session.user.sessionToken
        );
        const response = await fetch("/api/student/modules/active", {
          headers: {
            "Content-Type": "application/json",
            "X-Session-Token": sessionToken,
          },
        });
        console.log(
          "[LearningModules] Active modules fetch response status:",
          response.status
        );
        if (!response.ok) {
          console.error(
            "[LearningModules] Active modules fetch failed with status:",
            response.status
          );
          if (response.status === 401 || response.status === 403) {
            setError("Session expired");
            setActiveModules([]);
            loadActiveModulesFromDB();
            return;
          }
          throw new Error("Failed to fetch active modules");
        }
        const data = await response.json();
        console.log(
          "[LearningModules] Active modules fetch response data:",
          data
        );
        setActiveModules(data);
        await cacheActiveModules(data);
        setError(null);
      } catch (e) {
        console.error("[LearningModules] Active modules fetch error:", e);
        setError("Failed to fetch active modules, using cached data");
        loadActiveModulesFromDB();
      }
    };

    const handleOnline = () => {
      setIsOffline(false);
      fetchModules();
      fetchActiveModules();
    };

    const handleOffline = () => {
      setIsOffline(true);
      loadModulesFromDB();
      loadActiveModulesFromDB();
    };

    if (navigator.onLine) {
      fetchModules();
      fetchActiveModules();
    } else {
      handleOffline();
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [sessionToken, status]);

  const handleSaveLesson = async (module: Module) => {
    if (!session?.user?.sessionToken) {
      toast.error("Please log in to save lessons");
      return;
    }

    if (savedLessons.has(module.id)) {
      toast.error("Lesson already saved");
      return;
    }

    try {
      console.log("[LearningModules] Saving lesson:", module.id, module.title);
      const response = await fetch(`/api/student/save/lesson/${module.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Token": session.user.sessionToken,
        },
        body: JSON.stringify({}),
      });

      console.log("[LearningModules] Save response status:", response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error(
          "[LearningModules] Save failed:",
          response.status,
          errorData
        );
        if (response.status === 401 || response.status === 403) {
          setError("Session expired");
          setModules(null);
          toast.error("Session expired, please log in again");
          return;
        }
        if (response.status === 404) {
          toast.error("Lesson not found");
          return;
        }
        toast.error("Failed to save lesson");
        return;
      }

      const data = await response.json();
      console.log("[LearningModules] Save successful:", data);
      setSavedLessons((prev) => new Set([...prev, module.id]));
      toast.success("Lesson saved!");
    } catch (error) {
      console.error("[LearningModules] Save error:", error);
      setError("Session expired");
      setModules(null);
      toast.error("Session expired, please log in again");
    }
  };

  const handlePlayVideo = async (video: Module) => {
    if (!video.url) {
      console.error("[LearningModules] No video URL for:", video.title);
      setError("No video URL available");
      toast.error("No video URL available");
      return;
    }

    let finalUrl: string | undefined;
    if (isOffline) {
      const cachedUrl = await loadMediaFromDB(video.id);
      if (cachedUrl) {
        finalUrl = cachedUrl;
      } else {
        setError("Video not available offline");
        toast.error("Video not available offline");
        return;
      }
    } else {
      const cachedUrl = await loadMediaFromDB(video.id);
      finalUrl =
        cachedUrl || `/api/proxy-video?url=${encodeURIComponent(video.url)}`;
    }

    if (!finalUrl) {
      console.error("[LearningModules] No valid URL for video:", video.title);
      setError("Failed to load video URL");
      toast.error("Failed to load video URL");
      return;
    }

    setSelectedVideo({ ...video, url: finalUrl });
    setVideoModalOpen(true);
  };

  const handlePlayAudio = async (audio: Module) => {
    if (!audio.url) {
      console.error("[LearningModules] No audio URL for:", audio.title);
      setError("No audio URL available");
      toast.error("No audio URL available");
      return;
    }

    let finalUrl: string | undefined;
    if (isOffline) {
      const cachedUrl = await loadMediaFromDB(audio.id);
      if (cachedUrl) {
        finalUrl = cachedUrl;
      } else {
        setError("Audio not available offline");
        toast.error("Audio not available offline");
        return;
      }
    } else {
      const cachedUrl = await loadMediaFromDB(audio.id);
      finalUrl =
        cachedUrl || `/api/proxy-video?url=${encodeURIComponent(audio.url)}`;
    }

    if (!finalUrl) {
      console.error("[LearningModules] No valid URL for audio:", audio.title);
      setError("Failed to load audio URL");
      toast.error("Failed to load audio URL");
      return;
    }

    setSelectedAudio({ ...audio, url: finalUrl });
    setAudioPlayerOpen(true);
  };

  const handlePreviewPdf = async (pdf: Module) => {
    if (!pdf.url) {
      console.error("[LearningModules] No PDF URL for:", pdf.title);
      setError("No PDF URL available");
      toast.error("No PDF URL available");
      return;
    }

    let finalUrl: string | undefined;
    if (isOffline) {
      const cachedUrl = await loadMediaFromDB(pdf.id);
      if (cachedUrl) {
        finalUrl = cachedUrl;
      } else {
        setError("PDF not available offline");
        toast.error("PDF not available offline");
        return;
      }
    } else {
      const cachedUrl = await loadMediaFromDB(pdf.id);
      finalUrl =
        cachedUrl || `/api/proxy-video?url=${encodeURIComponent(pdf.url)}`;
    }

    if (!finalUrl) {
      console.error("[LearningModules] No valid URL for PDF:", pdf.title);
      setError("Failed to load PDF URL");
      toast.error("Failed to load PDF URL");
      return;
    }

    setSelectedPdf({ ...pdf, url: finalUrl });
    setPdfViewerOpen(true);
  };

  const handleDownloadPdf = (pdf: Module) => {
    if (!pdf.url) {
      console.error("[LearningModules] No PDF URL for download:", pdf.title);
      setError("No PDF URL available for download");
      toast.error("No PDF URL available for download");
      return;
    }
    const link = document.createElement("a");
    link.href = pdf.url;
    link.download = pdf.title || "document.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const moduleNameOptions = useMemo(() => {
    const modulesToUse = activeModules.length > 0 ? activeModules : [];
    return modulesToUse.sort((a, b) => a.name.localeCompare(b.name));
  }, [activeModules]);

  const filteredModules = useMemo(() => {
    const data = modules || fallbackData;
    if (selectedModuleName === "all") return data;
    const selectedModule = moduleNameOptions.find(
      (m) => m.name === selectedModuleName
    );
    if (!selectedModule) return data;
    const courseName = selectedModule.courseName;
    return {
      videos: data.videos.filter((video) => video.course === courseName),
      audio: data.audio.filter((audio) => audio.course === courseName),
      pdfs: data.pdfs.filter((pdf) => pdf.course === courseName),
      docs: data.docs.filter((doc) => doc.course === courseName),
      links: data.links.filter((link) => link.course === courseName),
      tutorials: data.tutorials.filter(
        (tutorial) => tutorial.course === courseName
      ),
    };
  }, [modules, selectedModuleName]);

  const getPaginatedItems = (items: any[], page: number) => {
    if (!items) return [];
    const startIndex = (page - 1) * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  };

  const getTotalPages = (items: any[]) => {
    if (!items) return 1;
    return Math.ceil(items.length / itemsPerPage);
  };

  const renderPagination = (tab: keyof typeof currentPage) => {
    const totalPages = getTotalPages(filteredModules[tab]);
    const current = currentPage[tab] || 1;

    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() =>
                setCurrentPage((prev) => ({
                  ...prev,
                  [tab]: Math.max(1, (prev[tab] || 1) - 1),
                }))
              }
            />
          </PaginationItem>
          {current > 2 && (
            <PaginationItem>
              <PaginationLink
                onClick={() =>
                  setCurrentPage((prev) => ({ ...prev, [tab]: 1 }))
                }
              >
                1
              </PaginationLink>
            </PaginationItem>
          )}
          {current > 3 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((page) => Math.abs(page - current) <= 1)
            .map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  isActive={page === current}
                  onClick={() =>
                    setCurrentPage((prev) => ({ ...prev, [tab]: page }))
                  }
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
          {current < totalPages - 2 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}
          {current < totalPages - 1 && (
            <PaginationItem>
              <PaginationLink
                onClick={() =>
                  setCurrentPage((prev) => ({ ...prev, [tab]: totalPages }))
                }
              >
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          )}
          <PaginationItem>
            <PaginationNext
              onClick={() =>
                setCurrentPage((prev) => ({
                  ...prev,
                  [tab]: Math.min(totalPages, (prev[tab] || 1) + 1),
                }))
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="md" className="text-orange-500" />
      </div>
    );
  }

  if (
    error === "Session expired" ||
    error === "Not authenticated" ||
    (status === "authenticated" && error === "Session expired")
  ) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Session Expired
            </CardTitle>
            <CardDescription className="text-center">
              Your session has expired or you are not authenticated. Please log
              in again to continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={handleLogout} className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Log In Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !modules) {
    return (
      <div className="p-6">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Error
            </CardTitle>
            <CardDescription className="text-center">{error}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Learning Modules</h1>
        <p className="text-muted-foreground">
          Structured learning paths with videos, audio, PDFs, and tutorials
        </p>
        {isOffline && (
          <p className="text-yellow-600 text-sm">
            Offline Mode: Using cached data
          </p>
        )}
        {error && <p className="text-yellow-600 text-sm">{error}</p>}
      </div>

      <div className="flex items-center gap-4">
        <label htmlFor="module-name-filter" className="text-sm font-medium">
          Filter by Module:
        </label>
        <Select
          value={selectedModuleName}
          onValueChange={(value) => {
            setSelectedModuleName(value);
            setCurrentPage({ videos: 1, audio: 1, pdfs: 1, tutorials: 1 });
          }}
        >
          <SelectTrigger id="module-name-filter" className="w-[180px]">
            <SelectValue placeholder="Select module" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modules</SelectItem>
            {moduleNameOptions.map((module) => (
              <SelectItem key={module.id} value={module.name}>
                {module.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="videos" className="w-full">
        <TabsList className="bg-[#f797712e] text-slate-700 flex flex-col lg:flex-row w-full gap-2 mb-14">
          <TabsTrigger
            value="videos"
            className="bg-transparent w-full sm:w-32 justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3"
          >
            <Video className="h-4 w-4" />
            Video
          </TabsTrigger>
          <TabsTrigger
            value="audio"
            className="bg-transparent w-full sm:w-32 justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3"
          >
            <Headphones className="h-4 w-4" />
            Audio
          </TabsTrigger>
          <TabsTrigger
            value="pdfs"
            className="bg-transparent w-full sm:w-32 justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3"
          >
            <FileText className="h-4 w-4" />
            PDFs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="videos" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {getPaginatedItems(filteredModules.videos, currentPage.videos).map(
              (video) => (
                <Card
                  key={video.id}
                  className="hover:shadow-lg transition-shadow flex flex-col h-full"
                >
                  <CardHeader className="p-0">
                    <div className="aspect-video bg-muted rounded-md mb-3 flex items-center justify-center relative">
                      <Video className="h-8 w-8 text-muted-foreground" />
                      {video.progress === 100 && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                      )}
                      <div className="absolute bottom-2 right-2">
                        <Badge variant="secondary" className="text-xs">
                          {video.progress > 0 ? "In Progress" : "Available"}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2 px-6">
                      <CardTitle className="text-lg">{video.title}</CardTitle>
                      <CardDescription>{video.course}</CardDescription>
                    </div>
                  </CardHeader>

                  <CardContent className="flex flex-col flex-1">
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {video.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {video.popularity} students
                      </div>
                      {video.instructor && (
                        <div className="col-span-2">
                          Instructor: {video.instructor}
                        </div>
                      )}
                      <div>Module: {video.module_order}</div>
                      <div>Lesson: {video.lesson_order}</div>
                      <div className="col-span-2">
                        Updated:{" "}
                        {new Date(video.updated_at).toLocaleDateString()}
                      </div>
                      {video.popularity > 0 && (
                        <div className="col-span-2">
                          <StarRating popularity={video.popularity} />
                        </div>
                      )}
                    </div>

                    <div className="mt-auto flex flex-wrap gap-3 pt-4">
                      <Button
                        className="flex-1 w-full h-10 bg-[#f79771] hover:bg-gray-300 shadow-md"
                        onClick={() => handlePlayVideo(video)}
                        disabled={!video.url}
                      >
                        {video.progress === 100 ? (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Review Video
                          </>
                        ) : video.progress > 0 ? (
                          <>
                            <Play className="mr-2 h-4 w-4" />
                            Continue Watching
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-4 w-4" />
                            Start Video
                          </>
                        )}
                      </Button>

                      <Button
                        variant={
                          savedLessons.has(video.id) ? "default" : "outline"
                        }
                        className="flex-1 w-full h-10 bg-transparent shadow-md"
                        onClick={() => handleSaveLesson(video)}
                        disabled={
                          !session?.user?.sessionToken ||
                          savedLessons.has(video.id)
                        }
                      >
                        <Bookmark
                          className={`mr-2 h-4 w-4 ${
                            savedLessons.has(video.id) ? "fill-current" : ""
                          }`}
                        />
                        {savedLessons.has(video.id) ? "Saved" : "Save"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </div>
          {renderPagination("videos")}
        </TabsContent>

        <TabsContent value="audio" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {getPaginatedItems(filteredModules.audio, currentPage.audio).map(
              (audio) => (
                <Card
                  key={audio.id}
                  className="flex flex-col min-h-[250px] max-h-auto hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-[#f797712f] rounded-lg flex items-center justify-center">
                        <Headphones className="h-8 w-8 text-[#EF7B55]" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <CardTitle className="text-lg">{audio.title}</CardTitle>
                        <CardDescription>{audio.course}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col justify-between flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div>{audio.duration}</div>
                      <div>{audio.popularity} listeners</div>
                      {audio.instructor && (
                        <div className="col-span-2">
                          Instructor: {audio.instructor}
                        </div>
                      )}
                      <div>Module: {audio.module_order}</div>
                      <div>Lesson: {audio.lesson_order}</div>
                      <div className="col-span-2">
                        Updated:{" "}
                        {new Date(audio.updated_at).toLocaleDateString()}
                      </div>
                      {audio.popularity > 0 && (
                        <div className="col-span-2">
                          <StarRating popularity={audio.popularity} />
                        </div>
                      )}
                    </div>
                    <div className="mt-auto flex flex-wrap gap-2">
                      <Button
                        className="flex-1 w-full h-10 bg-[#f79771] hover:bg-gray-300 shadow-md"
                        onClick={() => handlePlayAudio(audio)}
                        disabled={!audio.url}
                      >
                        <Headphones className="mr-2 h-4 w-4" />
                        {audio.progress > 0
                          ? "Continue Listening"
                          : "Start Listening"}
                      </Button>
                      <Button
                        variant={
                          savedLessons.has(audio.id) ? "default" : "outline"
                        }
                        className="flex-1 w-full h-10 bg-transparent shadow-md"
                        onClick={() => handleSaveLesson(audio)}
                        disabled={
                          !session?.user?.sessionToken ||
                          savedLessons.has(audio.id)
                        }
                      >
                        <Bookmark
                          className={`mr-2 h-4 w-4 ${
                            savedLessons.has(audio.id) ? "fill-current" : ""
                          }`}
                        />
                        {savedLessons.has(audio.id) ? "Saved" : "Save"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </div>
          {renderPagination("audio")}
        </TabsContent>

        <TabsContent value="pdfs" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {getPaginatedItems(filteredModules.pdfs, currentPage.pdfs).map(
              (pdf) => (
                <Card
                  key={pdf.id}
                  className="hover:shadow-lg transition-shadow flex flex-col min-h-[400px] max-h-auto"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{pdf.title}</CardTitle>
                        <CardDescription>{pdf.course}</CardDescription>
                      </div>
                      <FileText className="h-8 w-8 text-[#EF7B55]" />
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1">
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div>Course: {pdf.course}</div>
                      <div>
                        Updated: {new Date(pdf.updated_at).toLocaleDateString()}
                      </div>
                      {pdf.instructor && (
                        <div className="col-span-2">
                          Instructor: {pdf.instructor}
                        </div>
                      )}
                      <div>Module: {pdf.module_order}</div>
                      <div>Lesson: {pdf.lesson_order}</div>
                      {pdf.popularity > 0 && (
                        <div className="col-span-2">
                          <StarRating popularity={pdf.popularity} />
                        </div>
                      )}
                    </div>
                    <div className="mt-auto pt-4 flex flex-wrap gap-2">
                      <Button
                        className="flex-1 w-full h-10 bg-[#f79771] hover:bg-gray-300 shadow-md"
                        onClick={() => handlePreviewPdf(pdf)}
                        disabled={!pdf.url}
                      >
                        <Eye className="mr-2 h-3 w-3" />
                        Preview
                      </Button>
                      <Button
                        variant={
                          savedLessons.has(pdf.id) ? "default" : "outline"
                        }
                        className="flex-1 w-full h-10 bg-transparent shadow-md"
                        onClick={() => handleSaveLesson(pdf)}
                        disabled={
                          !session?.user?.sessionToken ||
                          savedLessons.has(pdf.id)
                        }
                      >
                        <Bookmark
                          className={`mr-2 h-3 w-3 ${
                            savedLessons.has(pdf.id) ? "fill-current" : ""
                          }`}
                        />
                        {savedLessons.has(pdf.id) ? "Saved" : "Save"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </div>
          {renderPagination("pdfs")}
        </TabsContent>

        <TabsContent value="tutorials" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {getPaginatedItems(
              filteredModules.tutorials,
              currentPage.tutorials
            ).map((tutorial) => (
              <Card
                key={tutorial.id}
                className="flex flex-col min-h-[250px] max-h-auto hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">
                        {tutorial.type || tutorial.content_type}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{tutorial.title}</CardTitle>
                    <CardDescription>{tutorial.course}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col justify-between flex-1 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>{tutorial.duration}</div>
                    <div>{tutorial.popularity || 0} participants</div>
                    {tutorial.instructor && (
                      <div className="col-span-2">
                        Instructor: {tutorial.instructor}
                      </div>
                    )}
                    <div>Module: {tutorial.module_order}</div>
                    <div>Lesson: {tutorial.lesson_order}</div>
                    <div className="col-span-2">
                      Scheduled:{" "}
                      {tutorial.scheduledAt
                        ? new Date(tutorial.scheduledAt).toLocaleString()
                        : "TBD"}
                    </div>
                    <div>Active: {tutorial.isActiveNow ? "Yes" : "No"}</div>
                    {tutorial.popularity > 0 && (
                      <div className="col-span-2">
                        <StarRating popularity={tutorial.popularity} />
                      </div>
                    )}
                  </div>
                  <Button
                    className="w-full mt-auto"
                    disabled={!tutorial.isActiveNow}
                  >
                    Join Session
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          {renderPagination("tutorials")}
        </TabsContent>
      </Tabs>

      <VideoModal
        isOpen={videoModalOpen}
        onClose={() => {
          setVideoModalOpen(false);
          setSelectedVideo(null);
        }}
        title={selectedVideo?.title || ""}
        videoUrl={selectedVideo?.url}
      />
      <AudioPlayer
        isOpen={audioPlayerOpen}
        onClose={() => {
          setAudioPlayerOpen(false);
          setSelectedAudio(null);
        }}
        title={selectedAudio?.title || ""}
        audioUrl={selectedAudio?.url}
        duration={selectedAudio?.duration}
      />
      <PDFViewer
        isOpen={pdfViewerOpen}
        onClose={() => {
          setPdfViewerOpen(false);
          setSelectedPdf(null);
        }}
        title={selectedPdf?.title || ""}
        pdfUrl={selectedPdf?.url}
      />
    </div>
  );
}

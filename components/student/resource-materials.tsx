"use client";

import {useState, useEffect, useMemo} from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Badge} from "@/components/ui/badge";
import {Tabs, TabsList, TabsTrigger, TabsContent} from "@/components/ui/tabs";
import {
  FileText,
  Video,
  Headphones,
  BookOpen,
  Download,
  Search,
  Filter,
  Star,
  Clock,
  Eye,
  LogIn,
  AlertCircle,
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
import {PDFViewer} from "./pdf-viewer";
import {VideoModal} from "./video-modal";
import {AudioPlayer} from "./audio-player";
import {useSession} from "next-auth/react";
import {Spinner} from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { openDB } from "idb";
import toast from "react-hot-toast";

interface Resource {
  id: string;
  title: string;
  author?: string | null;
  instructor?: string | null;
  speaker?: string | null;
  journal?: string;
  pages?: number;
  size?: string;
  rating: number;
  downloads?: number;
  duration?: string;
  views?: number;
  listens?: number;
  category: string;
  pdfUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  date?: string;
  citations?: number;
  content?: string;
}

interface ResourcesData {
  categories: string[];
  courses: {id: number; name: string}[];
  selected_course_id: number | null;
  selected_module_id: number | null;
  pdfs: Resource[];
  videos: Resource[];
  audio: Resource[];
  journals: Resource[];
}

export function ResourceMaterials() {
  const {data: session, status} = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState<Resource | null>(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Resource | null>(null);
  const [audioPlayerOpen, setAudioPlayerOpen] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState<Resource | null>(null);
  const [currentPage, setCurrentPage] = useState({
    pdfs: 1,
    videos: 1,
    audio: 1,
    journals: 1,
  });
  const [resourcesData, setResourcesData] = useState<ResourcesData | null>(
    null
  );
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const itemsPerPage = 3;

  const sessionToken = useMemo(
    () => session?.user?.sessionToken,
    [session?.user?.sessionToken]
  );

  const fallbackResources: ResourcesData = {
    categories: [
      "Frontend",
      "Backend",
      "AI/ML",
      "Database",
      "Security",
      "Career",
    ],
    courses: [],
    selected_course_id: null,
    selected_module_id: null,
    pdfs: [],
    videos: [],
    audio: [],
    journals: [],
  };

  const MAX_CACHE_SIZE = 500 * 1024 * 1024; // 500MB max storage

  // Initialize IndexedDB
  const openDB = async () => {
    const dbName = "studentDB";
    const storeName = "resources";
    const version = 6; // New store, start with version 6 to avoid conflicts

    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(dbName, version);

      request.onupgradeneeded = (event) => {
        const db = request.result;
        console.log(`[ResourceMaterials] Upgrading database ${dbName} to version ${version}`);
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
        if (!db.objectStoreNames.contains("materials")) {
          db.createObjectStore("materials", { keyPath: "key" });
        }
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: "key" });
          console.log(`[ResourceMaterials] Created object store ${storeName}`);
        }
      };

      request.onsuccess = () => {
        console.log(`[ResourceMaterials] Opened database ${dbName}`);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error(`[ResourceMaterials] Error opening database ${dbName}:`, request.error);
        reject(request.error);
      };
    });
  };

  // Cache resources data in IndexedDB
  const cacheResourcesData = async (data: ResourcesData) => {
    try {
      const db = await openDB();
      const tx = db.transaction("resources", "readwrite");
      const store = tx.objectStore("resources");
      await store.put({ key: "resource-materials", data });
      await tx.done;
      console.log("[ResourceMaterials] Resources data cached successfully");
    } catch (error) {
      console.error("[ResourceMaterials] Error caching resources data:", error);
    }
  };

  // Load resources from IndexedDB
  const loadResourcesFromDB = async () => {
    try {
      const db = await openDB();
      const tx = db.transaction("resources", "readonly");
      const store = tx.objectStore("resources");
      const cachedData = await store.get("resource-materials");
      if (cachedData?.data) {
        setResourcesData(cachedData.data);
        setCategories(cachedData.data.categories || []);
        setSelectedCourseId(cachedData.data.selected_course_id || null);
        setSelectedModuleId(cachedData.data.selected_module_id || null);
        setError(null);
        console.log("[ResourceMaterials] Loaded resources from IndexedDB");
      } else {
        setResourcesData(fallbackResources);
        setCategories(fallbackResources.categories);
        console.warn("[ResourceMaterials] No cached resources found, using fallback data");
      }
    } catch (error) {
      console.error("[ResourceMaterials] Error loading resources from DB:", error);
      setResourcesData(fallbackResources);
      setCategories(fallbackResources.categories);
    }
    setLoading(false);
  };

  // Check cache size for media
  const checkCacheSize = async (db: IDBDatabase) => {
    const tx = db.transaction("resources", "readwrite");
    const store = tx.objectStore("resources");
    const allMedia = await store.getAll();
    let totalSize = 0;
    if (Array.isArray(allMedia)) {
      totalSize = allMedia.reduce((sum, item) => sum + (item.content?.size || 0), 0);
    } else {
      console.warn("[ResourceMaterials] allMedia is not an array:", allMedia);
    }

    if (totalSize > MAX_CACHE_SIZE) {
      const sortedMedia = allMedia.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
      while (totalSize > MAX_CACHE_SIZE && sortedMedia.length > 0) {
        const oldest = sortedMedia.shift();
        await store.delete(oldest.key);
        totalSize -= oldest.content?.size || 0;
        console.log(`[ResourceMaterials] Deleted old cache for key ${oldest.key} to free space`);
      }
    }
    await tx.done;
  };

  const cacheMedia = async (key: string, url: string, contentType: string) => {
    if (!navigator.onLine) {
      console.log(`[ResourceMaterials] Offline, skipping cache attempt for key ${key}`);
      return false;
    }
    try {
      const proxyUrl = `/api/proxy-video?url=${encodeURIComponent(url)}`;
      console.log(`[ResourceMaterials] Attempting to cache ${contentType} for key ${key}: ${proxyUrl}`);
      const response = await fetch(proxyUrl, {
        headers: headers(sessionToken),
      });
      console.log(`[ResourceMaterials] Cache response:`, {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        url: proxyUrl,
      });

      if (!response.ok) {
        const rawResponse = await response.text();
        console.error(`[ResourceMaterials] Cache failed:`, {
          status: response.status,
          statusText: response.statusText,
          body: rawResponse.slice(0, 200),
          url: proxyUrl,
        });
        throw new Error(`Failed to fetch ${contentType}: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      console.log(`[ResourceMaterials] Created blob URL for key ${key}: ${objectUrl}`);

      const db = await openDB();
      await checkCacheSize(db);
      const tx = db.transaction("resources", "readwrite");
      const store = tx.objectStore("resources");
      await store.put({ key, content: blob, contentType, timestamp: Date.now() });
      await tx.done;
      console.log(`[ResourceMaterials] Successfully cached ${contentType} for key ${key}`);
      return true;
    } catch (error) {
      console.error(`[ResourceMaterials] Error caching ${contentType} for key ${key}:`, error);
      toast.error(`Failed to cache ${contentType}. It may not be available offline.`);
      return false;
    }
  };

  const loadMediaFromDB = async (key: string) => {
    try {
      const db = await openDB();
      const tx = db.transaction("resources", "readonly");
      const store = tx.objectStore("resources");
      const data = await store.get(key);
      if (data?.content) {
        const blobUrl = URL.createObjectURL(data.content);
        console.log(`[ResourceMaterials] Loaded blob URL for key ${key}: ${blobUrl}`);
        return blobUrl;
      }
      console.log(`[ResourceMaterials] No cached media found for key ${key}`);
      return null;
    } catch (error) {
      console.error(`[ResourceMaterials] Error loading media for key ${key}:`, error);
      return null;
    }
  };

  const handleLogout = async () => {
    console.log(
      "[ResourceMaterials] Initiating logout, sessionToken:",
      sessionToken
    );
    try {
      const response = await fetch("/api/auth/logout-route", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
      });
      console.log(
        "[ResourceMaterials] Logout API response status:",
        response.status
      );
      const data = await response.json();
      console.log("[ResourceMaterials] Logout API response:", data);
      if (!response.ok) {
        console.error("[ResourceMaterials] Logout failed:", data);
        throw new Error(data.error || "Logout failed");
      }
      console.log(
        "[ResourceMaterials] Logout successful, redirecting to /login"
      );
      document.cookie = "next-auth.session-token=; Max-Age=0; path=/; secure";
      document.cookie = "next-auth.csrf-token=; Max-Age=0; path=/; secure";
      window.location.href = "/login";
    } catch (error) {
      console.error("[ResourceMaterials] Logout error:", error);
      document.cookie = "next-auth.session-token=; Max-Age=0; path=/; secure";
      document.cookie = "next-auth.csrf-token=; Max-Age=0; path=/; secure";
      window.location.href = "/login";
    }
  };

  const headers = (sessionToken: string | undefined) => ({
    Authorization: `Api-Key 1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz`,
    ...(sessionToken && { "X-Session-Token": sessionToken }),
  });

  useEffect(() => {
    const fetchResources = async () => {
      if (status !== "authenticated" || !sessionToken) {
        console.log(
          "[ResourceMaterials] Session not authenticated, status:",
          status
        );
        setError("Not authenticated");
        loadResourcesFromDB();
        return;
      }

      try {
        const queryParams = new URLSearchParams();
        if (searchQuery) {
          queryParams.append("q", searchQuery);
        } else {
          if (selectedCourseId)
            queryParams.append("course_id", selectedCourseId.toString());
          if (selectedModuleId)
            queryParams.append("module_id", selectedModuleId.toString());
        }

        console.log(
          "[ResourceMaterials] Fetching from /api/student/resources with token:",
          sessionToken,
          "params:",
          queryParams.toString()
        );
        const response = await fetch(`/api/student/resources?${queryParams}`, {
          headers: {
            "Content-Type": "application/json",
            "X-Session-Token": sessionToken,
          },
        });
        console.log(
          "[ResourceMaterials] Fetch response status:",
          response.status
        );
        if (!response.ok) {
          console.error(
            "[ResourceMaterials] Fetch failed with status:",
            response.status
          );
          if (response.status === 401 || response.status === 403) {
            setError("Session expired");
            loadResourcesFromDB();
            return;
          }
          setError(
            response.status === 404
              ? "Resources not found"
              : "Failed to fetch resources"
          );
          setResourcesData(fallbackResources);
          setCategories([]);
          throw new Error("Fetch failed");
        }
        const data = await response.json();
        console.log("[ResourceMaterials] Fetch response data:", data);
        setResourcesData(data);
        await cacheResourcesData(data);
        setCategories(data.categories || []);
        setSelectedCourseId(
          data.selected_course_id || data.courses?.[0]?.id || null
        );
        setSelectedModuleId(data.selected_module_id || null);
        setError(null);
      } catch (e) {
        console.error("[ResourceMaterials] Fetch error:", e);
        setError("Failed to fetch resources");
        loadResourcesFromDB();
      } finally {
        setLoading(false);
      }
    };

    const handleOnline = () => {
      setIsOffline(false);
      fetchResources();
    };

    const handleOffline = () => {
      setIsOffline(true);
      loadResourcesFromDB();
    };

    if (navigator.onLine) {
      fetchResources();
    } else {
      handleOffline();
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [sessionToken, status, searchQuery, selectedCourseId, selectedModuleId]);

  const handlePreviewPdf = async (pdf: Resource) => {
    if (!pdf.pdfUrl) {
      console.error("[ResourceMaterials] No PDF URL for:", pdf.title);
      toast.error("No PDF URL available");
      return;
    }

    let finalUrl: string | null = null;

    const cachedUrl = await loadMediaFromDB(pdf.id);
    if (cachedUrl) {
      finalUrl = cachedUrl;
    }

    if (!finalUrl && navigator.onLine) {
      const proxyUrl = `/api/proxy-video?url=${encodeURIComponent(pdf.pdfUrl)}`;
      try {
        const response = await fetch(proxyUrl, { headers: headers(sessionToken) });
        if (!response.ok) {
          let errorText = await response.text();
          try { errorText = JSON.parse(errorText).details || errorText; } catch {}
          if (response.status === 500 && errorText.includes("fetch failed")) {
            toast.error("Network error to backend. Using cached version if available.");
            finalUrl = await loadMediaFromDB(pdf.id);
            if (!finalUrl) {
              toast.error("No cached PDF available offline.");
              return;
            }
          } else {
            toast.error(`Failed to load PDF: ${response.status} ${errorText.slice(0, 100)}`);
            return;
          }
        } else {
          const blob = await response.blob();
          const db = await openDB();
          await checkCacheSize(db);
          const tx = db.transaction("resources", "readwrite");
          const store = tx.objectStore("resources");
          await store.put({ key: pdf.id, content: blob, contentType: "pdf", timestamp: Date.now() });
          await tx.done;
          finalUrl = URL.createObjectURL(blob);
        }
      } catch (error) {
        console.error("[ResourceMaterials] Fetch/cache error for PDF:", error);
        if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
          toast.error("Network error. Using cached version if available.");
          finalUrl = await loadMediaFromDB(pdf.id);
          if (!finalUrl) {
            toast.error("No cached PDF available offline.");
            return;
          }
        } else {
          toast.error("Failed to load PDF from server");
          return;
        }
      }
    }

    if (!finalUrl) {
      toast.error(navigator.onLine ? "Failed to load PDF" : "PDF not available offline");
      return;
    }

    setSelectedPdf({ ...pdf, pdfUrl: finalUrl });
    setPdfViewerOpen(true);
  };

  const handleDownloadPdf = async (pdf: Resource) => {
    if (!pdf.pdfUrl) {
      console.error("[ResourceMaterials] No PDF URL for download:", pdf.title);
      toast.error("No PDF URL available for download");
      return;
    }

    let finalUrl: string | null = pdf.pdfUrl;

    const cachedUrl = await loadMediaFromDB(pdf.id);
    if (cachedUrl) {
      finalUrl = cachedUrl;
    } else if (navigator.onLine) {
      // Attempt to cache for future offline use
      await cacheMedia(pdf.id, pdf.pdfUrl, "pdf");
      const newCachedUrl = await loadMediaFromDB(pdf.id);
      if (newCachedUrl) {
        finalUrl = newCachedUrl;
      }
    }

    const link = document.createElement("a");
    link.href = finalUrl;
    link.download = pdf.title || "document.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleWatchVideo = async (video: Resource) => {
    if (!video.videoUrl) {
      console.error("[ResourceMaterials] No video URL for:", video.title);
      toast.error("No video URL available");
      return;
    }

    let finalUrl: string | null = null;

    const cachedUrl = await loadMediaFromDB(video.id);
    if (cachedUrl) {
      finalUrl = cachedUrl;
    }

    if (!finalUrl && navigator.onLine) {
      const proxyUrl = `/api/proxy-video?url=${encodeURIComponent(video.videoUrl)}`;
      try {
        const response = await fetch(proxyUrl, { headers: headers(sessionToken) });
        if (!response.ok) {
          let errorText = await response.text();
          try { errorText = JSON.parse(errorText).details || errorText; } catch {}
          if (response.status === 500 && errorText.includes("fetch failed")) {
            toast.error("Network error to backend. Using cached version if available.");
            finalUrl = await loadMediaFromDB(video.id);
            if (!finalUrl) {
              toast.error("No cached video available offline.");
              return;
            }
          } else {
            toast.error(`Failed to load video: ${response.status} ${errorText.slice(0, 100)}`);
            return;
          }
        } else {
          const blob = await response.blob();
          const db = await openDB();
          await checkCacheSize(db);
          const tx = db.transaction("resources", "readwrite");
          const store = tx.objectStore("resources");
          await store.put({ key: video.id, content: blob, contentType: "video", timestamp: Date.now() });
          await tx.done;
          finalUrl = URL.createObjectURL(blob);
        }
      } catch (error) {
        console.error("[ResourceMaterials] Fetch/cache error for video:", error);
        if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
          toast.error("Network error. Using cached version if available.");
          finalUrl = await loadMediaFromDB(video.id);
          if (!finalUrl) {
            toast.error("No cached video available offline.");
            return;
          }
        } else {
          toast.error("Failed to load video from server");
          return;
        }
      }
    }

    if (!finalUrl) {
      toast.error(navigator.onLine ? "Failed to load video" : "Video not available offline");
      return;
    }

    setSelectedVideo({ ...video, videoUrl: finalUrl });
    setVideoModalOpen(true);
  };

  const handlePlayAudio = async (audio: Resource) => {
    if (!audio.audioUrl) {
      console.error("[ResourceMaterials] No audio URL for:", audio.title);
      toast.error("No audio URL available");
      return;
    }

    let finalUrl: string | null = null;

    const cachedUrl = await loadMediaFromDB(audio.id);
    if (cachedUrl) {
      finalUrl = cachedUrl;
    }

    if (!finalUrl && navigator.onLine) {
      const proxyUrl = `/api/proxy-video?url=${encodeURIComponent(audio.audioUrl)}`;
      try {
        const response = await fetch(proxyUrl, { headers: headers(sessionToken) });
        if (!response.ok) {
          let errorText = await response.text();
          try { errorText = JSON.parse(errorText).details || errorText; } catch {}
          if (response.status === 500 && errorText.includes("fetch failed")) {
            toast.error("Network error to backend. Using cached version if available.");
            finalUrl = await loadMediaFromDB(audio.id);
            if (!finalUrl) {
              toast.error("No cached audio available offline.");
              return;
            }
          } else {
            toast.error(`Failed to load audio: ${response.status} ${errorText.slice(0, 100)}`);
            return;
          }
        } else {
          const blob = await response.blob();
          const db = await openDB();
          await checkCacheSize(db);
          const tx = db.transaction("resources", "readwrite");
          const store = tx.objectStore("resources");
          await store.put({ key: audio.id, content: blob, contentType: "audio", timestamp: Date.now() });
          await tx.done;
          finalUrl = URL.createObjectURL(blob);
        }
      } catch (error) {
        console.error("[ResourceMaterials] Fetch/cache error for audio:", error);
        if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
          toast.error("Network error. Using cached version if available.");
          finalUrl = await loadMediaFromDB(audio.id);
          if (!finalUrl) {
            toast.error("No cached audio available offline.");
            return;
          }
        } else {
          toast.error("Failed to load audio from server");
          return;
        }
      }
    }

    if (!finalUrl) {
      toast.error(navigator.onLine ? "Failed to load audio" : "Audio not available offline");
      return;
    }

    setSelectedAudio({ ...audio, audioUrl: finalUrl });
    setAudioPlayerOpen(true);
  };

  const handleReadJournal = async (journal: Resource) => {
    if (!journal.url) {
      console.error("[ResourceMaterials] No URL for journal:", journal.title);
      toast.error("No URL available for journal");
      return;
    }

    let finalUrl: string | null = null;

    const cachedUrl = await loadMediaFromDB(journal.id);
    if (cachedUrl) {
      finalUrl = cachedUrl;
    }

    if (!finalUrl && navigator.onLine) {
      const proxyUrl = `/api/proxy-video?url=${encodeURIComponent(journal.url)}`;
      try {
        const response = await fetch(proxyUrl, { headers: headers(sessionToken) });
        if (!response.ok) {
          let errorText = await response.text();
          try { errorText = JSON.parse(errorText).details || errorText; } catch {}
          if (response.status === 500 && errorText.includes("fetch failed")) {
            toast.error("Network error to backend. Using cached version if available.");
            finalUrl = await loadMediaFromDB(journal.id);
            if (!finalUrl) {
              toast.error("No cached journal available offline.");
              return;
            }
          } else {
            toast.error(`Failed to load journal: ${response.status} ${errorText.slice(0, 100)}`);
            return;
          }
        } else {
          const blob = await response.blob();
          const db = await openDB();
          await checkCacheSize(db);
          const tx = db.transaction("resources", "readwrite");
          const store = tx.objectStore("resources");
          await store.put({ key: journal.id, content: blob, contentType: "pdf", timestamp: Date.now() });
          await tx.done;
          finalUrl = URL.createObjectURL(blob);
        }
      } catch (error) {
        console.error("[ResourceMaterials] Fetch/cache error for journal:", error);
        if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
          toast.error("Network error. Using cached version if available.");
          finalUrl = await loadMediaFromDB(journal.id);
          if (!finalUrl) {
            toast.error("No cached journal available offline.");
            return;
          }
        } else {
          toast.error("Failed to load journal from server");
          return;
        }
      }
    }

    if (!finalUrl) {
      toast.error(navigator.onLine ? "Failed to load journal" : "Journal not available offline");
      return;
    }

    window.open(finalUrl, "_blank");
  };

  const handleDownloadJournal = async (journal: Resource) => {
    if (!journal.url) {
      console.error("[ResourceMaterials] No URL for journal download:", journal.title);
      toast.error("No URL available for journal download");
      return;
    }

    let finalUrl: string | null = journal.url;

    const cachedUrl = await loadMediaFromDB(journal.id);
    if (cachedUrl) {
      finalUrl = cachedUrl;
    } else if (navigator.onLine) {
      await cacheMedia(journal.id, journal.url, "pdf");
      const newCachedUrl = await loadMediaFromDB(journal.id);
      if (newCachedUrl) {
        finalUrl = newCachedUrl;
      }
    }

    const link = document.createElement("a");
    link.href = finalUrl;
    link.download = `${journal.title}.pdf` || "journal.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getPaginatedItems = (items: Resource[], page: number) => {
    const startIndex = (page - 1) * itemsPerPage;
    return items
      .filter((item) => !selectedCategory || item.category === selectedCategory)
      .slice(startIndex, startIndex + itemsPerPage);
  };

  const getTotalPages = (items: Resource[]) => {
    const filteredItems = items.filter(
      (item) => !selectedCategory || item.category === selectedCategory
    );
    return Math.ceil(filteredItems.length / itemsPerPage);
  };

  const renderPagination = (tab: keyof typeof currentPage) => {
    const resources = resourcesData || fallbackResources;
    const totalPages = getTotalPages(resources[tab]);
    const current = currentPage[tab];

    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() =>
                setCurrentPage((prev) => ({
                  ...prev,
                  [tab]: Math.max(1, prev[tab] - 1),
                }))
              }
            />
          </PaginationItem>

          {current > 2 && (
            <PaginationItem>
              <PaginationLink
                onClick={() => setCurrentPage((prev) => ({...prev, [tab]: 1}))}>
                1
              </PaginationLink>
            </PaginationItem>
          )}

          {current > 3 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          {Array.from({length: totalPages}, (_, i) => i + 1)
            .filter((page) => Math.abs(page - current) <= 1)
            .map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  isActive={page === current}
                  onClick={() =>
                    setCurrentPage((prev) => ({...prev, [tab]: page}))
                  }>
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
                  setCurrentPage((prev) => ({...prev, [tab]: totalPages}))
                }>
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          )}

          <PaginationItem>
            <PaginationNext
              onClick={() =>
                setCurrentPage((prev) => ({
                  ...prev,
                  [tab]: Math.min(totalPages, prev[tab] + 1),
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
              <LogIn className="h-4 w-4" />
              Log In Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (
    error === "Resources not found" ||
    (resourcesData &&
      resourcesData.pdfs.length === 0 &&
      resourcesData.videos.length === 0 &&
      resourcesData.audio.length === 0 &&
      resourcesData.journals.length === 0)
  ) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
              <AlertCircle className="h-6 w-6 text-red-500" />
              Resources Not Found
            </CardTitle>
            <CardDescription className="text-center">
              No resources were found for your query or selected course. Try a
              different search term or course.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center gap-2">
            <Button
              onClick={() => setSearchQuery("")}
              className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Clear Search
            </Button>
            <Button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !resourcesData) {
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
              className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const resources = resourcesData || fallbackResources;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Resource Materials</h1>
        <p className="text-muted-foreground">
          Access a comprehensive library of learning resources
        </p>
      </div>

      <div className="flex flex-col sm:flex-row w-full gap-4">
        <Select
          value={selectedCourseId?.toString() || ""}
          onValueChange={(value) =>
            setSelectedCourseId(value ? parseInt(value) : null)
          }>
          <SelectTrigger className="sm:w-[180px]">
            <SelectValue placeholder="Select course" />
          </SelectTrigger>
          <SelectContent className="w-full">
            {resources.courses.map((course) => (
              <SelectItem key={course.id} value={course.id.toString()}>
                {course.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button
          className="h-10 bg-transparent border border-[#EF7B55] text-[#EF7B55] hover:bg-[#F79771] hover:text-white"
          variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {categories.map((category) => (
          <Badge
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            className={`cursor-pointer hover:bg-[#F79771] hover:text-white 
    ${selectedCategory === category ? "bg-[#EF7B55] text-white" : ""}`}
            onClick={() => setSelectedCategory(category)}>
            {category}
          </Badge>
        ))}
      </div>

      <Tabs defaultValue="pdfs" className="w-full mr-auto relative">
        <TabsList className="bg-[#f797712e] text-slate-700 flex flex-col lg:flex-row w-full gap-2 mb-14">
          <TabsTrigger
            value="pdfs"
            className="bg-transparent w-full sm:w-32 justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3">
            <FileText className="h-4 w-4" />
            PDFs
          </TabsTrigger>
          <TabsTrigger
            value="videos"
            className="bg-transparent w-full sm:w-32 justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3">
            <Video className="h-4 w-4" />
            Videos
          </TabsTrigger>
          <TabsTrigger
            value="audio"
            className="bg-transparent w-full sm:w-32 justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3">
            <Headphones className="h-4 w-4" />
            Audio
          </TabsTrigger>
          <TabsTrigger
            value="journals"
            className="bg-transparent w-full sm:w-32 justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3">
            <BookOpen className="h-4 w-4" />
            Journals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pdfs" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {getPaginatedItems(resources.pdfs, currentPage.pdfs).map(
              (pdf, index) => (
                <Card
                  key={index}
                  className="hover:shadow-lg transition-shadow flex flex-col h-full">
                  <CardHeader>
                    <div className="flex flex-wrap gap-2 items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{pdf.title}</CardTitle>
                        <CardDescription>
                          by {pdf.author || "Unknown"}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">{pdf.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-wrap flex-1">
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div>Pages: {pdf.pages || "—"}</div>
                      <div>Size: {pdf.size || "—"}</div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {pdf.rating}
                      </div>
                      <div>{pdf.downloads || 0} downloads</div>
                    </div>
                    <div className="mt-auto w-full pt-4 flex flex-col sm:flex-row gap-2">
                      <Button
                        className="flex-1 w-full h-10 bg-[#f79771] hover:bg-gray-300 shadow-md"
                        onClick={() => handlePreviewPdf(pdf)}>
                        <Eye className="mr-2 h-3 w-3" />
                        Preview
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDownloadPdf(pdf)}
                        className="flex-1 w-full h-10 bg-transparent shadow-md">
                        <Download className="mr-2 h-3 w-3" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </div>
          {renderPagination("pdfs")}
        </TabsContent>

        <TabsContent value="videos" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {getPaginatedItems(resources.videos, currentPage.videos).map(
              (video, index) => (
                <Card
                  key={index}
                  className="hover:shadow-lg transition-shadow flex flex-col h-full">
                  <CardHeader>
                    <div className="aspect-video bg-muted rounded-md mb-2 flex items-center justify-center">
                      <Video className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="flex flex-wrap items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{video.title}</CardTitle>
                        <CardDescription>
                          by {video.instructor || "Unknown"}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">{video.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1">
                    <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {video.duration || "—"}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {video.views || 0} views
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {video.rating}
                      </div>
                    </div>
                    <div className="mt-auto pt-4">
                      <Button
                        size="sm"
                        className="w-full bg-[#f79771] hover:bg-gray-300 shadow-md"
                        onClick={() => handleWatchVideo(video)}>
                        <Video className="mr-2 h-3 w-3" />
                        Watch Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </div>
          {renderPagination("videos")}
        </TabsContent>

        <TabsContent value="audio" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {getPaginatedItems(resources.audio, currentPage.audio).map(
              (audio, index) => (
                <Card
                  key={index}
                  className="hover:shadow-lg transition-shadow flex flex-col h-full">
                  <CardHeader>
                    <div className="flex flex-wrap gap-3 items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{audio.title}</CardTitle>
                        <CardDescription>
                          by {audio.speaker || "Unknown"}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">{audio.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1">
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {audio.duration || "—"}
                      </div>
                      <div className="flex items-center gap-1">
                        <Headphones className="h-3 w-3" />
                        {audio.listens || 0} listens
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {audio.rating}
                      </div>
                    </div>
                    <div className="mt-auto pt-4">
                      <Button
                        size="sm"
                        className="flex-1 w-full h-10 bg-[#f79771] hover:bg-gray-300 shadow-md"
                        onClick={() => handlePlayAudio(audio)}>
                        <Headphones className="mr-2 h-3 w-3" />
                        Listen Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </div>
          {renderPagination("audio")}
        </TabsContent>

        <TabsContent value="journals" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {getPaginatedItems(resources.journals, currentPage.journals).map(
              (journal, index) => (
                <Card
                  key={index}
                  className="hover:shadow-lg transition-shadow flex flex-col h-full">
                  <CardHeader>
                    <div className="flex flex-wrap gap-2 items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">
                          {journal.title}
                        </CardTitle>
                        <CardDescription>
                          {journal.journal || "Unknown"}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">{journal.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1">
                    <div className="text-sm text-muted-foreground line-clamp-3">
                      {journal.content || "No description available"}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mt-3">
                      <div>Published: {journal.date || "—"}</div>
                      <div>Pages: {journal.pages || "—"}</div>
                      <div>Citations: {journal.citations || 0}</div>
                    </div>
                    <div className="mt-auto pt-4 flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 w-full h-10 bg-[#f79771] hover:bg-gray-300 shadow-md"
                        onClick={() => handleReadJournal(journal)}>
                        <BookOpen className="mr-2 h-3 w-3" />
                        Read
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadJournal(journal)}
                        className="flex-1 w-full h-10 bg-transparent shadow-md">
                        <Download className="mr-2 h-3 w-3" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </div>
          {renderPagination("journals")}
        </TabsContent>
      </Tabs>

      <PDFViewer
        isOpen={pdfViewerOpen}
        onClose={() => setPdfViewerOpen(false)}
        title={selectedPdf?.title || ""}
        pdfUrl={selectedPdf?.pdfUrl}
      />

      <VideoModal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        title={selectedVideo?.title || ""}
        videoUrl={selectedVideo?.videoUrl}
      />

      <AudioPlayer
        isOpen={audioPlayerOpen}
        onClose={() => setAudioPlayerOpen(false)}
        title={selectedAudio?.title || ""}
        audioUrl={selectedAudio?.audioUrl}
        duration={selectedAudio?.duration}
      />
    </div>
  );
}
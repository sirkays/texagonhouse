"use client";
import { useRef } from "react";


import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  FileText,
  Clock,
  Users,
  CheckCircle,
  Eye,
  Bookmark,
  Star,
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
import { VideoModal } from "@/components/student/video-modal";
import { AudioPlayer } from "@/components/student/audio-player";
import { useSession } from "next-auth/react";
import { Spinner } from "@/components/ui/spinner";
import toast from "react-hot-toast";
import AntiInspect from "@/components/AntiInspect";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// -------------------- Types --------------------
interface ModuleItem {
  id: number;
  title: string;
  content_type: string;
  duration: string;
  url: string | null;
  cover_image?: string | null;
  course: string;
  subject: string;
  instructor: string | null;
  module_id: number;
  module_order: number;
  lesson_order: number;
  progress: number;
  popularity: number;
  updated_at: string;

  // ✅ returned by backend (materials)
  is_saved?: boolean;
}

interface TutorialItem {
  id: number;
  title: string;
  type?: string;
  content_type?: string;
  duration: string;
  scheduledAt?: string;
  course: string;
  subject: string;
  host?: string | null;
  isActiveNow?: boolean;

  // If you want to support saving tutorials later:
  is_saved?: boolean;
}

interface ModulesData {
  videos: ModuleItem[];
  audio: ModuleItem[];
  pdfs: ModuleItem[];
  docs: ModuleItem[];
  links: ModuleItem[];
  tutorials: TutorialItem[];
}

interface ActiveModule {
  id: number;
  name: string;
  courseName: string;
}

// -------------------- Helpers --------------------
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

function markSavedInData(data: ModulesData, lessonId: number): ModulesData {
  // ✅ updates the returned modules state so the UI reflects saved without refresh
  const patch = <T extends { id: number; is_saved?: boolean }>(arr: T[]) =>
    arr.map((x) => (x.id === lessonId ? { ...x, is_saved: true } : x));

  return {
    ...data,
    videos: patch(data.videos),
    audio: patch(data.audio),
    pdfs: patch(data.pdfs),
    docs: patch(data.docs),
    links: patch(data.links),
    tutorials: data.tutorials, // not saving tutorials in this implementation
  };
}

export function LearningModules() {
  const [pageLoading, setPageLoading] = useState(true);     // first load only
  const [filterLoading, setFilterLoading] = useState(false); // module filter loading
  const didInitialLoadRef = useRef(false);
  const { data: session, status } = useSession();
  const [savingLessonIds, setSavingLessonIds] = useState<Set<number>>(new Set());
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
  const [selectedVideo, setSelectedVideo] = useState<ModuleItem | null>(null);
  const [selectedAudio, setSelectedAudio] = useState<ModuleItem | null>(null);

  // ✅ filter by module_id (recommended)
  const [selectedModuleId, setSelectedModuleId] = useState<string>("all");

  // ✅ local optimistic saved set (for instant button disable)
  const [savedLessons, setSavedLessons] = useState<Set<number>>(new Set());

  // Alert modal
  const [alertModal, setAlertModal] = useState<{
    open: boolean;
    title: string;
    message: string;
  }>({ open: false, title: "", message: "" });

  const showAlert = (title: string, message: string) => {
    setAlertModal({ open: true, title, message });
  };

  const sessionToken = useMemo(
    () => session?.user?.sessionToken || null,
    [session?.user?.sessionToken]
  );

  const itemsPerPage = 3;

  // -------------------- Fetch modules --------------------
useEffect(() => {
  const fetchModules = async () => {
    const isInitial = !didInitialLoadRef.current;
    if (isInitial) setPageLoading(true);

    if (status !== "authenticated" || !sessionToken) {
      setError("Not authenticated");
      setModules(null);
      setPageLoading(false);
      showAlert(
        "Not authenticated",
        "Your session is not active. Please log in again to access your learning modules."
      );
      return;
    }

    try {
      const response = await fetch("/api/student/learning-modules", {
        headers: {
          "Content-Type": "application/json",
          "X-Session-Token": sessionToken,
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setError("Session expired");
          setModules(null);
          showAlert(
            "Session expired",
            "Your session has expired. Please log in again to continue."
          );
          return;
        }
        setError("Failed to fetch modules");
        setModules(null);
        showAlert("Error", "Failed to fetch your learning modules.");
        return;
      }

      const data: ModulesData = await response.json();
      setModules(data);
      setError(null);

      // ✅ hydrate local saved set from backend is_saved flags
      const serverSaved = new Set<number>();
      [
        ...(data.videos || []),
        ...(data.audio || []),
        ...(data.pdfs || []),
        ...(data.docs || []),
        ...(data.links || []),
      ].forEach((x) => {
        if (x?.is_saved) serverSaved.add(x.id);
      });
      setSavedLessons(serverSaved);
    } catch (e) {
      setError("Session expired");
      setModules(null);
      showAlert(
        "Session expired",
        "Your session has expired or there was a network issue. Please log in again."
      );
    } finally {
      didInitialLoadRef.current = true;
      setPageLoading(false);
    }
  };

  fetchModules();
}, [sessionToken, status]);

  // -------------------- Fetch active modules (dropdown options) --------------------
  useEffect(() => {
    const fetchActiveModules = async () => {
      if (status !== "authenticated" || !sessionToken) {
        setActiveModules([]);
        return;
      }

      try {
        const response = await fetch("/api/student/modules/active", {
          headers: {
            "Content-Type": "application/json",
            "X-Session-Token": sessionToken,
          },
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            setActiveModules([]);
            return;
          }
          throw new Error("Failed to fetch active modules");
        }

        const data: ActiveModule[] = await response.json();
        setActiveModules(data || []);
      } catch {
        setActiveModules([]);
      }
    };

    fetchActiveModules();
  }, [sessionToken, status]);

  // -------------------- Save Lesson -> Material --------------------
const handleSaveLesson = async (module: ModuleItem) => {
  if (!session?.user?.sessionToken) {
    showAlert("Login required", "Please log in to your account to save lessons for later.");
    return;
  }

  if (savedLessons.has(module.id)) {
    showAlert("Already saved", "You have already saved this lesson.");
    return;
  }

  // ✅ start loading for this lesson
  setSavingLessonIds((prev) => new Set(prev).add(module.id));

  try {
    const response = await fetch(`/api/student/save/lesson/${module.id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Session-Token": session.user.sessionToken,
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 401 || response.status === 403) {
        setError("Session expired");
        setModules(null);
        showAlert("Session expired", "Your session has expired. Please log in again to save lessons.");
        return;
      }
      if (response.status === 404) {
        showAlert("Lesson not found", "This lesson could not be found.");
        return;
      }
      showAlert("Failed to save", errorData?.detail || "We could not save this lesson. Please try again later.");
      return;
    }

    await response.json().catch(() => null);

    setSavedLessons((prev) => new Set([...prev, module.id]));
    showAlert("Saved", `"${module.title}" has been saved successfully.`);
    toast.success("Lesson saved!");
  } catch (error) {
    console.error("[LearningModules] Save error:", error);
    showAlert("Network error", "Please check your connection and try again.");
  } finally {
    // ✅ stop loading for this lesson
    setSavingLessonIds((prev) => {
      const next = new Set(prev);
      next.delete(module.id);
      return next;
    });
  }
};


  // -------------------- Dropdown options --------------------
  const moduleOptions = useMemo(() => {
    const mods = activeModules || [];
    return [...mods].sort((a, b) => a.name.localeCompare(b.name));
  }, [activeModules]);

  // -------------------- Filter by module_id --------------------
  const filteredModules = useMemo(() => {
    const data = modules;
    if (!data) {
      return {
        videos: [],
        audio: [],
        pdfs: [],
        docs: [],
        links: [],
        tutorials: [],
      } as ModulesData;
    }

    if (selectedModuleId === "all") return data;

    const mid = Number(selectedModuleId);
    if (!Number.isFinite(mid)) return data;

    return {
      videos: data.videos.filter((x) => x.module_id === mid),
      audio: data.audio.filter((x) => x.module_id === mid),
      pdfs: data.pdfs.filter((x) => x.module_id === mid),
      docs: data.docs.filter((x) => x.module_id === mid),
      links: data.links.filter((x) => x.module_id === mid),
      tutorials: data.tutorials, // you can filter tutorials by course/module if you want
    };
  }, [modules, selectedModuleId]);

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
    const totalPages = getTotalPages((filteredModules as any)[tab]);
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

  // -------------------- Play handlers --------------------
  const handlePlayVideo = (video: ModuleItem) => {
    if (!video.url) {
      showAlert("Video unavailable", "No video URL is available for this lesson yet.");
      return;
    }
    setSelectedVideo(video);
    setVideoModalOpen(true);
  };

  const handlePlayAudio = (audio: ModuleItem) => {
    if (!audio.url) {
      showAlert("Audio unavailable", "No audio URL is available for this lesson yet.");
      return;
    }
    setSelectedAudio(audio);
    setAudioPlayerOpen(true);
  };

  const handlePreviewPdf = (pdf: ModuleItem) => {
    if (!pdf.url) {
      showAlert("PDF unavailable", "No PDF URL is available for this document yet.");
      return;
    }
    const url = new URL(pdf.url);
    if (sessionToken) url.searchParams.append("sessionToken", sessionToken);
    window.open(url.toString(), "_blank");
  };

  // -------------------- Loading / errors --------------------
  if (pageLoading) {
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
            <Button onClick={() => (window.location.href = "/login")}>
              Log In Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // -------------------- Main UI --------------------
  return (
    <>
      <AntiInspect />

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Learning Modules</h1>
          <p className="text-muted-foreground">
            Structured learning paths with videos, audio, PDFs, and tutorials
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-4">
          <label htmlFor="module-filter" className="text-sm font-medium">
            Filter by Module:
          </label>

          <Select
            value={selectedModuleId}
            onValueChange={(value) => {
              setFilterLoading(true); // ✅ start skeleton
              setSelectedModuleId(value);
              setCurrentPage({ videos: 1, audio: 1, pdfs: 1, tutorials: 1 });

              // ✅ let the UI update, then stop skeleton shortly after
              requestAnimationFrame(() => {
                setTimeout(() => setFilterLoading(false), 250);
              });
            }}
          >

            <SelectTrigger id="module-filter" className="w-[220px]">
              <SelectValue placeholder="Select module" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All Modules</SelectItem>
              {moduleOptions.map((m) => (
                <SelectItem key={m.id} value={String(m.id)}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="videos" className="w-full">
          <TabsList className="bg-[#f797712e] text-slate-700 flex flex-col lg:flex-row w-full gap-2 mb-14">
            <TabsTrigger
              value="videos"
              className="bg-transparent w-full justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3"
            >
              <Video className="h-4 w-4" />
              Video
            </TabsTrigger>
            <TabsTrigger
              value="audio"
              className="bg-transparent w-full justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3"
            >
              <Headphones className="h-4 w-4" />
              Audio
            </TabsTrigger>
            <TabsTrigger
              value="pdfs"
              className="bg-transparent w-full justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3"
            >
              <FileText className="h-4 w-4" />
              PDFs
            </TabsTrigger>
          </TabsList>

          {/* -------------------- VIDEOS -------------------- */}
          <TabsContent value="videos" className="space-y-6">
          {filterLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: itemsPerPage }).map((_, i) => (
                <Card key={`video-skel-${i}`} className="flex flex-col h-full">
                  <CardHeader className="p-0">
                    <div className="aspect-video bg-muted animate-pulse rounded-md mb-3" />
                    <div className="space-y-2 px-6 pb-4">
                      <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                      <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-3 w-full bg-muted animate-pulse rounded" />
                      <div className="h-3 w-full bg-muted animate-pulse rounded" />
                      <div className="h-3 w-full bg-muted animate-pulse rounded col-span-2" />
                      <div className="h-3 w-full bg-muted animate-pulse rounded" />
                      <div className="h-3 w-full bg-muted animate-pulse rounded" />
                      <div className="h-3 w-full bg-muted animate-pulse rounded col-span-2" />
                    </div>

                    <div className="mt-auto flex flex-wrap gap-3 pt-4">
                      <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
                      <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {getPaginatedItems(filteredModules.videos, currentPage.videos).map(
                (video) => {
                    const isSaving = savingLessonIds.has(video.id);
                    const isSaved = savedLessons.has(video.id);

                  return (
                    <Card
                      key={video.id}
                      className="hover:shadow-lg transition-shadow flex flex-col h-full"
                    >
                      <CardHeader className="p-0">
                      <div className="aspect-video bg-muted rounded-md mb-3 flex items-center justify-center relative overflow-hidden">
                        {video.cover_image ? (
                          <>
                            <img
                              src={
                                video.cover_image.startsWith("http")
                                  ? video.cover_image
                                  : `https://texagonbackend.onrender.com${video.cover_image}`
                              }
                              alt={video.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // hide broken image
                                e.currentTarget.style.display = "none";
                                // show placeholder icon
                                e.currentTarget.parentElement
                                  ?.querySelector(".fallback-icon")
                                  ?.classList.remove("hidden");
                              }}
                            />
                            <div className="fallback-icon absolute inset-0 flex items-center justify-center hidden">
                              <Video className="h-8 w-8 text-muted-foreground" />
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Video className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}

                        {/* keep your badges here */}
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
                        </div>

                        <div className="mt-auto flex flex-wrap gap-3 pt-4">
                          <Button
                            className="flex-1 w-full h-10 bg-[#f79771] hover:bg-gray-300 shadow-md"
                            onClick={() => handlePlayVideo(video)}
                            disabled={!video.url}
                          >
                            <Play className="mr-2 h-4 w-4" />
                            {video.progress === 100
                              ? "Review Video"
                              : video.progress > 0
                              ? "Continue Watching"
                              : "Start Video"}
                          </Button>

                          {/* ✅ Save button that stays readable */}
                          <Button
                            variant={isSaved ? "default" : "outline"}
                            className={`flex-1 w-full h-10 shadow-md ${
                              isSaved
                                ? "bg-[#EF7B55] text-white hover:bg-[#EF7B55]/90"
                                : "bg-transparent"
                            }`}
                            onClick={() => handleSaveLesson(video)}
                            disabled={!session?.user?.sessionToken || isSaved || isSaving}
                          >
                            {isSaving ? (
                              <span className="flex items-center gap-2">
                                <Spinner size="sm" className="text-current" />
                                Saving...
                              </span>
                            ) : (
                              <>
                                <Bookmark
                                  className={`mr-2 h-4 w-4 ${isSaved ? "fill-current" : ""}`}
                                />
                                {isSaved ? "Saved" : "Save"}
                              </>
                            )}
                          </Button>

                        </div>
                      </CardContent>
                    </Card>
                  );
                }
              )}
            </div>
            {renderPagination("videos")}
            </>
          )}
          </TabsContent>

          {/* -------------------- AUDIO -------------------- */}
          <TabsContent value="audio" className="space-y-6">
            {filterLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: itemsPerPage }).map((_, i) => (
                  <Card key={`video-skel-${i}`} className="flex flex-col h-full">
                    <CardHeader className="p-0">
                      <div className="aspect-video bg-muted animate-pulse rounded-md mb-3" />
                      <div className="space-y-2 px-6 pb-4">
                        <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                        <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-1">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="h-3 w-full bg-muted animate-pulse rounded" />
                        <div className="h-3 w-full bg-muted animate-pulse rounded" />
                        <div className="h-3 w-full bg-muted animate-pulse rounded col-span-2" />
                        <div className="h-3 w-full bg-muted animate-pulse rounded" />
                        <div className="h-3 w-full bg-muted animate-pulse rounded" />
                        <div className="h-3 w-full bg-muted animate-pulse rounded col-span-2" />
                      </div>

                      <div className="mt-auto flex flex-wrap gap-3 pt-4">
                        <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
                        <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <>
              <div className="grid gap-6 md:grid-cols-2">
                {getPaginatedItems(filteredModules.audio, currentPage.audio).map(
                  (audio) => {
                      const isSaving = savingLessonIds.has(audio.id);
                      const isSaved = savedLessons.has(audio.id);

                    return (
                      <Card
                        key={audio.id}
                        className="flex flex-col min-h-[250px] hover:shadow-lg transition-shadow"
                      >
                        <CardHeader>
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-[#f797712f] rounded-lg flex items-center justify-center relative">
                              <Headphones className="h-8 w-8 text-[#EF7B55]" />
                              {isSaved && (
                                <span className="absolute -top-2 -right-2">
                                  <Badge className="bg-black/70 text-white">
                                    Saved
                                  </Badge>
                                </span>
                              )}
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
                            variant={isSaved ? "default" : "outline"}
                            className={`flex-1 w-full h-10 shadow-md ${
                              isSaved
                                ? "bg-[#EF7B55] text-white hover:bg-[#EF7B55]/90"
                                : "bg-transparent"
                            }`}
                            onClick={() => handleSaveLesson(audio)}
                            disabled={!session?.user?.sessionToken || isSaved || isSaving}
                          >
                            {isSaving ? (
                              <span className="flex items-center gap-2">
                                <Spinner size="sm" className="text-current" />
                                Saving...
                              </span>
                            ) : (
                              <>
                                <Bookmark
                                  className={`mr-2 h-4 w-4 ${isSaved ? "fill-current" : ""}`}
                                />
                                {isSaved ? "Saved" : "Save"}
                              </>
                            )}
                          </Button>

                            
                          </div>
                        </CardContent>
                      </Card>
                    );
                  }
                )}
              </div>
              {renderPagination("audio")}
              </>
            )}
          </TabsContent>
          {/* -------------------- PDFS -------------------- */}
          <TabsContent value="pdfs" className="space-y-6">
          {filterLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: itemsPerPage }).map((_, i) => (
                <Card key={`video-skel-${i}`} className="flex flex-col h-full">
                  <CardHeader className="p-0">
                    <div className="aspect-video bg-muted animate-pulse rounded-md mb-3" />
                    <div className="space-y-2 px-6 pb-4">
                      <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                      <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-3 w-full bg-muted animate-pulse rounded" />
                      <div className="h-3 w-full bg-muted animate-pulse rounded" />
                      <div className="h-3 w-full bg-muted animate-pulse rounded col-span-2" />
                      <div className="h-3 w-full bg-muted animate-pulse rounded" />
                      <div className="h-3 w-full bg-muted animate-pulse rounded" />
                      <div className="h-3 w-full bg-muted animate-pulse rounded col-span-2" />
                    </div>

                    <div className="mt-auto flex flex-wrap gap-3 pt-4">
                      <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
                      <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {getPaginatedItems(filteredModules.pdfs, currentPage.pdfs).map(
                  (pdf) => {
                      const isSaving = savingLessonIds.has(pdf.id);
                      const isSaved = savedLessons.has(pdf.id);

                    return (
                      <Card
                        key={pdf.id}
                        className="hover:shadow-lg transition-shadow flex flex-col min-h-[400px]"
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <CardTitle className="text-lg">{pdf.title}</CardTitle>
                              <CardDescription>{pdf.course}</CardDescription>
                            </div>

                            <div className="relative">
                              <FileText className="h-8 w-8 text-[#EF7B55]" />
                              {isSaved && (
                                <span className="absolute -top-2 -right-2">
                                  <Badge className="bg-black/70 text-white">
                                    Saved
                                  </Badge>
                                </span>
                              )}
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="flex flex-col flex-1">
                          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                            <div>Course: {pdf.course}</div>
                            <div>
                              Updated:{" "}
                              {new Date(pdf.updated_at).toLocaleDateString()}
                            </div>
                            {pdf.instructor && (
                              <div className="col-span-2">
                                Instructor: {pdf.instructor}
                              </div>
                            )}
                            <div>Module: {pdf.module_order}</div>
                            <div>Lesson: {pdf.lesson_order}</div>
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
                              variant={isSaved ? "default" : "outline"}
                              className={`flex-1 w-full h-10 shadow-md ${
                                isSaved
                                  ? "bg-[#EF7B55] text-white hover:bg-[#EF7B55]/90"
                                  : "bg-transparent"
                              }`}
                              onClick={() => handleSaveLesson(pdf)}
                              disabled={!session?.user?.sessionToken || isSaved || isSaving}
                            >
                              {isSaving ? (
                                <span className="flex items-center gap-2">
                                  <Spinner size="sm" className="text-current" />
                                  Saving...
                                </span>
                              ) : (
                                <>
                                  <Bookmark
                                    className={`mr-2 h-4 w-4 ${isSaved ? "fill-current" : ""}`}
                                  />
                                  {isSaved ? "Saved" : "Save"}
                                </>
                              )}
                            </Button>

                          </div>
                        </CardContent>
                      </Card>
                    );
                  }
                )}
              </div>
              {renderPagination("pdfs")}
            </>
          )}
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <VideoModal
          isOpen={videoModalOpen}
          onClose={() => setVideoModalOpen(false)}
          title={selectedVideo?.title || ""}
          videoUrl={selectedVideo?.url ?? undefined}
        />

        <AudioPlayer
          isOpen={audioPlayerOpen}
          onClose={() => setAudioPlayerOpen(false)}
          title={selectedAudio?.title || ""}
          audioUrl={selectedAudio?.url ?? undefined}
          duration={selectedAudio?.duration}
        />

        {/* Global Alert Modal */}
        <Dialog
          open={alertModal.open}
          onOpenChange={(open) => setAlertModal((prev) => ({ ...prev, open }))}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{alertModal.title}</DialogTitle>
              <DialogDescription>{alertModal.message}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setAlertModal((prev) => ({ ...prev, open: false }))}>
                OK
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}

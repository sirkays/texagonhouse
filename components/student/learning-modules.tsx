"use client";
import { useRef, useState } from "react";
import { useEffect, useMemo } from "react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
  Inbox,
  Check,
  ChevronsUpDown,
  User,
  Calendar,
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
import { cn } from "@/lib/utils";

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
  blur?: boolean;
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


type MediaUrlResponse = {
  url: string; // signed url
  expires_in?: number;
};

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
          className={`h-4 w-4 ${index < filledStars
            ? "fill-current text-yellow-500"
            : "text-muted-foreground"
            }`}
        />
      ))}
    </div>
  );
};

function markSavedInData(data: ModulesData, lessonId: number): ModulesData {
  const patch = <T extends { id: number; is_saved?: boolean }>(arr: T[]) =>
    arr.map((x) => (x.id === lessonId ? { ...x, is_saved: true } : x));

  return {
    ...data,
    videos: patch(data.videos),
    audio: patch(data.audio),
    pdfs: patch(data.pdfs),
    docs: patch(data.docs),
    links: patch(data.links),
    tutorials: data.tutorials,
  };
}

export function LearningModules() {
  const [pageLoading, setPageLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const didInitialLoadRef = useRef(false);
  const { data: session, status } = useSession();
  const [savingLessonIds, setSavingLessonIds] = useState<Set<number>>(
    new Set()
  );
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

  const [selectedModuleId, setSelectedModuleId] = useState<string>("all");
  const [savedLessons, setSavedLessons] = useState<Set<number>>(new Set());

  // Combobox open state
  const [open, setOpen] = useState(false);

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

  const isLocked = (item: { blur?: boolean }) => !!item.blur;

  const resolveCoverSrc = (cover?: string | null) => {
    if (!cover) return null;
    return cover.startsWith("http")
      ? cover
      : `process.env.BASE_URL${cover}`;
  };

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

  // -------------------- Fetch active modules --------------------
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


  
async function fetchLessonMediaUrl(lessonId: number): Promise<string> {
  if (!sessionToken) throw new Error("No session token");

  // IMPORTANT: use your Next proxy route if you have one; otherwise call Django directly.
  // If Django is behind /api proxy in Next, use `/api/student/lesson-media-url/${lessonId}`
  // If calling Django directly, use `${DJANGO_BASE}/learning/api/lesson-media-url/${lessonId}/`

  const res = await fetch(`/api/student/lesson-media-url/${lessonId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Session-Token": sessionToken,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    let j: any = {};
    try {
      j = await res.json();
    } catch {}
    if (res.status === 401 || res.status === 403) throw new Error("SESSION_EXPIRED");
    throw new Error(j?.detail || j?.error || "Failed to get media url");
  }

  const data = (await res.json()) as MediaUrlResponse;
  if (!data?.url) throw new Error("Media URL missing");
  return data.url;
}
  // -------------------- Save Lesson --------------------
  const handleSaveLesson = async (module: ModuleItem) => {
    if (!session?.user?.sessionToken) {
      showAlert(
        "Login required",
        "Please log in to your account to save lessons for later."
      );
      return;
    }

    if (savedLessons.has(module.id)) {
      showAlert("Already saved", "You have already saved this lesson.");
      return;
    }

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
          showAlert(
            "Session expired",
            "Your session has expired. Please log in again to save lessons."
          );
          return;
        }
        if (response.status === 404) {
          showAlert("Lesson not found", "This lesson could not be found.");
          return;
        }
        showAlert(
          "Failed to save",
          errorData?.detail ||
          "We could not save this lesson. Please try again later."
        );
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
      setSavingLessonIds((prev) => {
        const next = new Set(prev);
        next.delete(module.id);
        return next;
      });
    }
  };

  // -------------------- Dropdown / Combobox options --------------------
  const moduleOptions = useMemo(() => {
    const mods = activeModules || [];
    return [...mods].sort((a, b) => a.name.localeCompare(b.name));
  }, [activeModules]);

  // -------------------- Filter logic --------------------
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
      tutorials: data.tutorials,
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
                onClick={() => setCurrentPage((prev) => ({ ...prev, [tab]: 1 }))}>
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
                  setCurrentPage((prev) => ({ ...prev, [tab]: totalPages }))
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
                  [tab]: Math.min(totalPages, (prev[tab] || 1) + 1),
                }))
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  // -------------------- Play / Preview handlers --------------------
const handlePlayVideo = async (video: ModuleItem) => {
  if (video.blur) {
    showAlert("Locked lesson", "Subscribe or upgrade your plan to access this video.");
    return;
  }

  try {
    // get signed url from endpoint
    const signedUrl = await fetchLessonMediaUrl(video.id);

    setSelectedVideo({ ...video, url: signedUrl });
    setVideoModalOpen(true);
  } catch (e: any) {
    if (e?.message === "SESSION_EXPIRED") {
      setError("Session expired");
      setModules(null);
      showAlert("Session expired", "Please log in again to continue.");
      return;
    }
    showAlert("Video unavailable", e?.message || "Unable to load video.");
  }
};
const handlePlayAudio = async (audio: ModuleItem) => {
  if (audio.blur) {
    showAlert("Locked lesson", "Subscribe or upgrade your plan to access this audio.");
    return;
  }

  try {
    const signedUrl = await fetchLessonMediaUrl(audio.id);

    setSelectedAudio({ ...audio, url: signedUrl });
    setAudioPlayerOpen(true);
  } catch (e: any) {
    if (e?.message === "SESSION_EXPIRED") {
      setError("Session expired");
      setModules(null);
      showAlert("Session expired", "Please log in again to continue.");
      return;
    }
    showAlert("Audio unavailable", e?.message || "Unable to load audio.");
  }
};


const handlePreviewPdf = async (pdf: ModuleItem) => {
  if (pdf.blur) {
    showAlert("Locked document", "Subscribe or upgrade your plan to access this PDF.");
    return;
  }

  try {
    const signedUrl = await fetchLessonMediaUrl(pdf.id);
    window.open(signedUrl, "_blank");
  } catch (e: any) {
    if (e?.message === "SESSION_EXPIRED") {
      setError("Session expired");
      setModules(null);
      showAlert("Session expired", "Please log in again to continue.");
      return;
    }
    showAlert("PDF unavailable", e?.message || "Unable to preview PDF.");
  }
};

  // -------------------- Loading / error states --------------------
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

  const renderEmptyState = (type: string) => (
    <div className="flex flex-col items-center justify-center py-12 text-center min-h-[400px] border-2 border-dashed rounded-lg bg-muted/30">
      <div className="bg-muted rounded-full p-4 mb-4">
        <Inbox className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold">No {type} Available</h3>
      <p className="text-sm text-muted-foreground max-w-sm mt-2">
        There are no {type.toLowerCase()} found for this module. Try selecting a
        different module filter or check back later.
      </p>
    </div>
  );

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

        {/* Searchable Module Filter */}
        <div className="flex items-center gap-4">
          <label htmlFor="module-filter" className="text-sm font-medium">
            Filter by Module:
          </label>

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-[240px] justify-between">
                {selectedModuleId === "all"
                  ? "All Modules"
                  : moduleOptions.find((m) => String(m.id) === selectedModuleId)
                    ?.name || "Select module"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[240px] p-0">
              <Command>
                <CommandInput placeholder="Search module..." />
                <CommandList>
                  <CommandEmpty>No module found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value="all modules"
                      onSelect={() => {
                        setOpen(false);
                        setFilterLoading(true);
                        setSelectedModuleId("all");
                        setCurrentPage({
                          videos: 1,
                          audio: 1,
                          pdfs: 1,
                          tutorials: 1,
                        });
                        requestAnimationFrame(() => {
                          setTimeout(() => setFilterLoading(false), 250);
                        });
                      }}>
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedModuleId === "all"
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      All Modules
                    </CommandItem>

                    {moduleOptions.map((m) => (
                      <CommandItem
                        key={m.id}
                        value={m.name.toLowerCase()}
                        onSelect={() => {
                          setOpen(false);
                          setFilterLoading(true);
                          setSelectedModuleId(String(m.id));
                          setCurrentPage({
                            videos: 1,
                            audio: 1,
                            pdfs: 1,
                            tutorials: 1,
                          });
                          requestAnimationFrame(() => {
                            setTimeout(() => setFilterLoading(false), 250);
                          });
                        }}>
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            String(m.id) === selectedModuleId
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {m.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <Tabs defaultValue="videos" className="w-full">
          <TabsList className="bg-[#f797712e] text-slate-700 flex flex-col lg:flex-row w-full gap-2 mb-14">
            <TabsTrigger
              value="videos"
              className="bg-transparent w-full justify-center py-2 data-[state=active]:bg-[#EF7B55]/70 data-[state=active]:text-white gap-3">
              <Video className="h-4 w-4" />
              Video
            </TabsTrigger>
            <TabsTrigger
              value="audio"
              className="bg-transparent w-full justify-center py-2 data-[state=active]:bg-[#EF7B55]/70 data-[state=active]:text-white gap-3">
              <Headphones className="h-4 w-4" />
              Audio
            </TabsTrigger>
            <TabsTrigger
              value="pdfs"
              className="bg-transparent w-full justify-center py-2 data-[state=active]:bg-[#EF7B55]/70 data-[state=active]:text-white gap-3">
              <FileText className="h-4 w-4" />
              PDFs
            </TabsTrigger>
          </TabsList>

          {/* VIDEOS */}
          <TabsContent value="videos" className="space-y-6">
            {filterLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: itemsPerPage }).map((_, i) => (
                  <Card
                    key={`video-skel-${i}`}
                    className="flex flex-col h-full">
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
                {filteredModules.videos.length === 0 ? (
                  renderEmptyState("Videos")
                ) : (
                  <>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {getPaginatedItems(
                        filteredModules.videos,
                        currentPage.videos
                      ).map((video) => {
                        const isSaving = savingLessonIds.has(video.id);
                        const isSaved = savedLessons.has(video.id);

                        return (
                          <Card
                            key={video.id}
                            className={cn(
                              "group hover:shadow-md transition-all duration-200",
                              "flex flex-col overflow-hidden rounded-xl border bg-white",
                              "h-full max-w-md mx-auto sm:max-w-none" // centered on mobile, full-width in lists
                            )}>
                            {/* Thumbnail - more prominent like Udemy */}
                            <div className="relative aspect-video w-full flex-shrink-0 bg-gray-100 overflow-hidden">
                              {video.cover_image ? (
                                <img
                                  src={resolveCoverSrc(video.cover_image) ?? ""}
                                  alt={video.title}
                                  className={cn(
                                    "h-full w-full object-cover transition-transform duration-300 group-hover:scale-105",
                                    video.blur && "blur-md scale-105"
                                  )}
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                    e.currentTarget.parentElement
                                      ?.querySelector(".fallback-icon")
                                      ?.classList.remove("hidden");
                                  }}
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gray-100">
                                  <Video className="h-10 w-10 text-gray-400" />
                                </div>
                              )}

                              {/* Locked overlay */}
                              {video.blur && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white">
                                  <div className="text-sm font-semibold">Locked</div>
                                  <div className="text-xs opacity-90 mt-1">Subscribe to access</div>
                                </div>
                              )}
                            </div>

                            <CardContent className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
                              {/* Title + Course – strong visual hierarchy */}
                              <div className="space-y-1.5">
                                <CardTitle className="line-clamp-2 text-base font-bold leading-tight tracking-tight sm:text-lg md:text-xl text-gray-900 group-hover:text-[#f57c50] transition-colors">
                                  {video.title}
                                </CardTitle>

                                <p className="line-clamp-1 text-sm font-medium text-gray-600">
                                  {video.course}
                                </p>

                                {video.instructor && (
                                  <p className="text-xs text-gray-500">
                                    {video.instructor}
                                  </p>
                                )}
                              </div>

                              {/* Metadata – compact, mobile stacked, larger screens more horizontal */}
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500 sm:text-sm">
                                <div className="flex items-center gap-1.5">
                                  <Clock className="h-3.5 w-3.5" />
                                  <span>{video.duration}</span>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <Users className="h-3.5 w-3.5" />
                                  <span>{video.popularity} students</span>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <span className="font-medium">
                                    Module {video.module_order}
                                  </span>
                                  <span className="text-gray-400">•</span>
                                  <span>Lesson {video.lesson_order}</span>
                                </div>

                                <div className="text-xs text-gray-400 w-full sm:w-auto">
                                  Updated{" "}
                                  {new Date(
                                    video.updated_at
                                  ).toLocaleDateString()}
                                </div>
                              </div>

                              {/* Action buttons – full width mobile, side-by-side desktop */}
                              <div className="mt-auto flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:gap-4">
                                <Button
                                  onClick={() => handlePlayVideo(video)}
                                  disabled={video.blur || !video.url}

                                  className={cn(
                                    "flex-1 justify-center gap-2 text-sm font-medium transition-colors",
                                    video.progress === 100
                                      ? "bg-green-600 hover:bg-green-700 text-white"
                                      : video.progress > 0
                                        ? "bg-[#f57c50]/70 hover:bg-[#e86a40]/50 text-white"
                                        : "bg-[#f57c50]/70 hover:bg-[#e86a40]/50 text-white"
                                  )}>
                                  <Play className="h-4 w-4" />
                                  {video.progress === 100
                                    ? "Review Video"
                                    : video.progress > 0
                                      ? "Continue Watching"
                                      : "Start Video"}
                                </Button>

                                <Button
                                  variant="outline"
                                  className={cn(
                                    "flex-1 justify-center gap-2 text-sm font-medium border-gray-300 hover:bg-gray-50",
                                    isSaved &&
                                    "bg-gray-50 text-gray-800 border-gray-400"
                                  )}
                                  onClick={() => handleSaveLesson(video)}
                                  disabled={
                                    !session?.user?.sessionToken ||
                                    isSaved ||
                                    isSaving
                                  }>
                                  {isSaving ? (
                                    <>
                                      <Spinner
                                        size="sm"
                                        className="text-current"
                                      />
                                      Saving...
                                    </>
                                  ) : (
                                    <>
                                      <Bookmark
                                        className={cn(
                                          "h-4 w-4",
                                          isSaved &&
                                          "fill-current text-gray-800"
                                        )}
                                      />
                                      {isSaved ? "Saved" : "Save for later"}
                                    </>
                                  )}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                    {renderPagination("videos")}
                  </>
                )}
              </>
            )}
          </TabsContent>

          {/* AUDIO */}
          <TabsContent value="audio" className="space-y-6">
            {filterLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: itemsPerPage }).map((_, i) => (
                  <Card
                    key={`audio-skel-${i}`}
                    className="flex flex-col h-full">
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
                {filteredModules.audio.length === 0 ? (
                  renderEmptyState("Audio Tracks")
                ) : (
                  <>
                    <div className="grid gap-6 md:grid-cols-2">
                      {getPaginatedItems(
                        filteredModules.audio,
                        currentPage.audio
                      ).map((audio) => {
                        const isSaving = savingLessonIds.has(audio.id);
                        const isSaved = savedLessons.has(audio.id);

                        return (
                          <Card
                            key={audio.id}
                            className={cn(
                              "group flex flex-col overflow-hidden rounded-xl border bg-white",
                              "hover:shadow-md transition-all duration-200",
                              "min-h-[240px] h-full max-w-md mx-auto sm:max-w-none",
                              audio.blur && "opacity-95"
                            )}
                          >
                            <CardContent className="relative flex flex-1 flex-col gap-4 p-4 sm:p-5">
                              {/* Locked overlay (covers card content) */}
                              {audio.blur && (
                                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/45 text-white">
                                  <div className="text-sm font-semibold">Locked</div>
                                  <div className="text-xs opacity-90 mt-1">Subscribe to access</div>
                                </div>
                              )}

                              {/* Icon + Title + Course */}
                              <div className={cn("flex items-start gap-4", audio.blur && "pointer-events-none")}>
                                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-[#f797712f]">
                                  <Headphones className="h-8 w-8 text-[#EF7B55]" />

                                  {/* Saved badge */}
                                  {isSaved && (
                                    <Badge
                                      variant="secondary"
                                      className="absolute -top-1.5 -right-1.5 bg-black/70 text-white text-[10px] px-1.5 py-0.5"
                                    >
                                      Saved
                                    </Badge>
                                  )}

                                  {/* Locked badge */}
                                  {audio.blur && (
                                    <Badge
                                      variant="secondary"
                                      className="absolute -bottom-1.5 -right-1.5 bg-black/70 text-white text-[10px] px-1.5 py-0.5"
                                    >
                                      Locked
                                    </Badge>
                                  )}
                                </div>

                                <div className="flex-1 space-y-1">
                                  <CardTitle
                                    className={cn(
                                      "line-clamp-2 text-base font-bold leading-tight tracking-tight sm:text-lg md:text-xl text-gray-900 group-hover:text-[#EF7B55] transition-colors",
                                      audio.blur && "text-gray-700"
                                    )}
                                  >
                                    {audio.title}
                                  </CardTitle>

                                  <p className="line-clamp-1 text-sm font-medium text-gray-600">{audio.course}</p>

                                  {audio.instructor && <p className="text-xs text-gray-500">{audio.instructor}</p>}
                                </div>
                              </div>

                              {/* Metadata */}
                              <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500 sm:text-sm", audio.blur && "pointer-events-none")}>
                                <div className="flex items-center gap-1.5">
                                  <Clock className="h-3.5 w-3.5" />
                                  <span>{audio.duration}</span>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <Users className="h-3.5 w-3.5" />
                                  <span>{audio.popularity} listeners</span>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <span className="font-medium">Module {audio.module_order}</span>
                                  <span className="text-gray-400">•</span>
                                  <span>Lesson {audio.lesson_order}</span>
                                </div>

                                <div className="text-xs text-gray-400 w-full sm:w-auto">
                                  Updated {new Date(audio.updated_at).toLocaleDateString()}
                                </div>
                              </div>

                              {/* Actions */}
                              <div className={cn("mt-auto flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:gap-4", audio.blur && "pointer-events-auto")}>
                                <Button
                                  onClick={() => handlePlayAudio(audio)}
                                  disabled={audio.blur || !audio.url}
                                  className={cn(
                                    "flex-1 justify-center gap-2 text-sm font-medium shadow transition-colors",
                                    audio.blur
                                      ? "bg-gray-300 text-gray-700 hover:bg-gray-300"
                                      : audio.progress > 0
                                        ? "bg-[#EF7B55]/70 hover:bg-[#f79771]/50 text-white"
                                        : "bg-[#f79771]/70 hover:bg-[#EF7B55]/50 text-white"
                                  )}
                                >
                                  <Headphones className="h-4 w-4" />
                                  {audio.blur ? "Locked" : audio.progress > 0 ? "Continue Listening" : "Start Listening"}
                                </Button>

                                <Button
                                  variant="outline"
                                  className={cn(
                                    "flex-1 justify-center gap-2 text-sm font-medium border-gray-300 hover:bg-gray-50 transition-colors",
                                    isSaved && "bg-gray-50 text-gray-800 border-gray-400"
                                  )}
                                  onClick={() => handleSaveLesson(audio)}
                                  disabled={
                                    audio.blur || !session?.user?.sessionToken || isSaved || isSaving
                                  }
                                >
                                  {isSaving ? (
                                    <>
                                      <Spinner size="sm" className="text-current" />
                                      Saving...
                                    </>
                                  ) : (
                                    <>
                                      <Bookmark className={cn("h-4 w-4", isSaved && "fill-current text-gray-800")} />
                                      {audio.blur ? "Locked" : isSaved ? "Saved" : "Save for later"}
                                    </>
                                  )}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>

                        );
                      })}
                    </div>
                    {renderPagination("audio")}
                  </>
                )}
              </>
            )}
          </TabsContent>

          {/* PDFS */}
          <TabsContent value="pdfs" className="space-y-6">
            {filterLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: itemsPerPage }).map((_, i) => (
                  <Card key={`pdf-skel-${i}`} className="flex flex-col h-full">
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
                {filteredModules.pdfs.length === 0 ? (
                  renderEmptyState("Documents")
                ) : (
                  <>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {getPaginatedItems(
                        filteredModules.pdfs,
                        currentPage.pdfs
                      ).map((pdf: any) => {
                        const isSaving = savingLessonIds.has(pdf.id);
                        const isSaved = savedLessons.has(pdf.id);

                        return (
                          <Card
                            key={pdf.id}
                            className={cn(
                              "group flex flex-col overflow-hidden rounded-xl border bg-white",
                              "hover:shadow-md transition-all duration-200",
                              "min-h-[260px] h-full max-w-md mx-auto sm:max-w-none",
                              pdf.blur && "opacity-95"
                            )}
                          >
                            <CardContent className="relative flex flex-1 flex-col gap-4 p-4 sm:p-5">
                              {/* Locked overlay */}
                              {pdf.blur && (
                                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/45 text-white">
                                  <div className="text-sm font-semibold">Locked</div>
                                  <div className="text-xs opacity-90 mt-1">Subscribe to access</div>
                                </div>
                              )}

                              {/* Icon + Title + Course */}
                              <div className={cn("flex items-start gap-4", pdf.blur && "pointer-events-none")}>
                                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-[#f797712f]">
                                  <FileText className="h-8 w-8 text-[#EF7B55]" />

                                  {isSaved && (
                                    <Badge
                                      variant="secondary"
                                      className="absolute -top-1.5 -right-1.5 bg-black/70 text-white text-[10px] px-1.5 py-0.5"
                                    >
                                      Saved
                                    </Badge>
                                  )}

                                  {pdf.blur && (
                                    <Badge
                                      variant="secondary"
                                      className="absolute -bottom-1.5 -right-1.5 bg-black/70 text-white text-[10px] px-1.5 py-0.5"
                                    >
                                      Locked
                                    </Badge>
                                  )}
                                </div>

                                <div className="flex-1 space-y-1">
                                  <CardTitle
                                    className={cn(
                                      "line-clamp-2 text-base font-bold leading-tight tracking-tight sm:text-lg md:text-xl text-gray-900 group-hover:text-[#EF7B55] transition-colors",
                                      pdf.blur && "text-gray-700"
                                    )}
                                  >
                                    {pdf.title}
                                  </CardTitle>

                                  <p className="line-clamp-1 text-sm font-medium text-gray-600">{pdf.course}</p>

                                  {pdf.instructor && <p className="text-xs text-gray-500">{pdf.instructor}</p>}
                                </div>
                              </div>

                              {/* Metadata */}
                              <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500 sm:text-sm", pdf.blur && "pointer-events-none")}>
                                <div className="flex items-center gap-1.5">
                                  <FileText className="h-3.5 w-3.5" />
                                  <span>PDF</span>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <Calendar className="h-3.5 w-3.5" />
                                  <span>Updated {new Date(pdf.updated_at).toLocaleDateString()}</span>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <span className="font-medium">Module {pdf.module_order}</span>
                                  <span className="text-gray-400">•</span>
                                  <span>Lesson {pdf.lesson_order}</span>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="mt-auto flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:gap-4">
                                <Button
                                  onClick={() => handlePreviewPdf(pdf)}
                                  disabled={pdf.blur || !pdf.url}
                                  className={cn(
                                    "flex-1 justify-center gap-2 text-sm font-medium shadow transition-colors",
                                    pdf.blur
                                      ? "bg-gray-300 text-gray-700 hover:bg-gray-300"
                                      : "bg-[#f79771]/70 hover:bg-[#EF7B55]/50 text-white"
                                  )}
                                >
                                  <Eye className="h-4 w-4" />
                                  {pdf.blur ? "Locked" : "Preview PDF"}
                                </Button>

                                <Button
                                  variant="outline"
                                  className={cn(
                                    "flex-1 justify-center gap-2 text-sm font-medium border-gray-300 hover:bg-gray-50 transition-colors",
                                    isSaved && "bg-gray-50 text-gray-800 border-gray-400"
                                  )}
                                  onClick={() => handleSaveLesson(pdf)}
                                  disabled={pdf.blur || !session?.user?.sessionToken || isSaved || isSaving}
                                >
                                  {isSaving ? (
                                    <>
                                      <Spinner size="sm" className="text-current" />
                                      Saving...
                                    </>
                                  ) : (
                                    <>
                                      <Bookmark className={cn("h-4 w-4", isSaved && "fill-current text-gray-800")} />
                                      {pdf.blur ? "Locked" : isSaved ? "Saved" : "Save for later"}
                                    </>
                                  )}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>

                        );
                      })}
                    </div>
                    {renderPagination("pdfs")}
                  </>
                )}
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

        <Dialog
          open={alertModal.open}
          onOpenChange={(open) => setAlertModal((prev) => ({ ...prev, open }))}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{alertModal.title}</DialogTitle>
              <DialogDescription>{alertModal.message}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                onClick={() =>
                  setAlertModal((prev) => ({ ...prev, open: false }))
                }>
                OK
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}

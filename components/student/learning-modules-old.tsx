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
import {Progress} from "@/components/ui/progress";
import {Badge} from "@/components/ui/badge";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
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
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {VideoModal} from "@/components/student/video-modal";
import {AudioPlayer} from "@/components/student/audio-player";
import {signOut, useSession} from "next-auth/react";
import {Spinner} from "@/components/ui/spinner";
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

interface Module {
  id: number;
  module_id: number;
  title: string;
  content_type: string;
  duration: string;
  url: string | null;
  cover_image?: string | null;
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
  is_saved?: boolean; // ✅ add
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

const StarRating = ({popularity}: {popularity: number | null}) => {
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
  const {data: session, status} = useSession();
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
  const [selectedVideo, setSelectedVideo] = useState<Module | null>(null);
  const [selectedAudio, setSelectedAudio] = useState<Module | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string>("all");
  const [savedLessons, setSavedLessons] = useState<Set<number>>(new Set());

  // NEW: alert modal state
  const [alertModal, setAlertModal] = useState<{
    open: boolean;
    title: string;
    message: string;
  }>({open: false, title: "", message: ""});

  const showAlert = (title: string, message: string) => {
    setAlertModal({open: true, title, message});
  };

  const sessionToken = useMemo(
    () => session?.user?.sessionToken || null,
    [session?.user?.sessionToken]
  );

  const itemsPerPage = 3;

  // Fallback data for UI stability
  const fallbackData: ModulesData = {
    videos: [],
    audio: [],
    pdfs: [],
    docs: [],
    links: [],
    tutorials: [],
  };

  const handleLogout = async () => {
    try {
      // 1. Call your custom backend logout
      const response = await fetch("/api/auth/logout-route", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
      });

      if (!response.ok) {
        console.error("[AdminLayout] Backend logout failed");
      }

      await signOut({redirect: false});

      window.location.href = "/login";
    } catch (error) {
      console.error("[AdminLayout] Logout error:", error);

      // Fallback: Ensure the user is still visually logged out if an error occurs
      await signOut({redirect: false});
      window.location.href = "/login";
    }
  };
  useEffect(() => {
    const fetchModules = async () => {
      if (status !== "authenticated" || !sessionToken) {
        setError("Not authenticated");
        setModules(fallbackData);
        setLoading(false);
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
          console.error(
            "[LearningModules] Fetch failed with status:",
            response.status
          );
          if (response.status === 401 || response.status === 403) {
            setError("Session expired");
            setModules(null);
            setLoading(false);
            showAlert(
              "Session expired",
              "Your session has expired. Please log in again to continue."
            );
            return;
          }
          setError("Failed to fetch modules");
          setModules(fallbackData);
          showAlert(
            "Error",
            "Failed to fetch your learning modules. Showing sample data instead."
          );
          throw new Error("Fetch failed");
        }
        const data = await response.json();
        setModules(data);
        setError(null);
      } catch (e) {
        console.error("[LearningModules] Fetch error:", e);
        setError("Session expired");
        setModules(null);
        showAlert(
          "Session expired",
          "Your session has expired or there was a network issue. Please log in again."
        );
      }
      setLoading(false);
    };

    fetchModules();
  }, [sessionToken, status]);

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
          console.error(
            "[LearningModules] Active modules fetch failed with status:",
            response.status
          );
          if (response.status === 401 || response.status === 403) {
            setError("Session expired");
            setActiveModules([]);
            showAlert(
              "Session expired",
              "Your session has expired. Please log in again to see active modules."
            );
            return;
          }
          throw new Error("Failed to fetch active modules");
        }
        const data = await response.json();
        setActiveModules(data);
        setError(null);
      } catch (e) {
        console.error("[LearningModules] Active modules fetch error:", e);
        setError("Session expired");
        setActiveModules([]);
        showAlert(
          "Session expired",
          "Your session has expired or there was a problem loading active modules."
        );
      }
    };

    fetchActiveModules();
  }, [sessionToken, status]);

  const handleSaveLesson = async (module: Module) => {
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
        const errorData = await response.json();
        console.error(
          "[LearningModules] Save failed:",
          response.status,
          errorData
        );
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
          "We could not save this lesson. Please try again later."
        );
        return;
      }

      const data = await response.json();
      setSavedLessons((prev) => new Set([...prev, module.id]));
      // ✅ show success modal
      showAlert("Saved", `"${module.title}" has been saved successfully.`);
    } catch (error) {
      console.error("[LearningModules] Save error:", error);
      setError("Session expired");
      setModules(null);
      showAlert(
        "Session expired",
        "Your session has expired or there was a network issue. Please log in again."
      );
    }
  };

  const moduleNameOptions = useMemo(() => {
    const modulesToUse = activeModules.length > 0 ? activeModules : [];
    return modulesToUse.sort((a, b) => a.name.localeCompare(b.name));
  }, [activeModules]);

  const filteredModules = useMemo(() => {
    const data = modules || fallbackData;
    if (selectedModuleId === "all") return data;

    const mid = Number(selectedModuleId);
    if (!Number.isFinite(mid)) return data;

    return {
      videos: data.videos.filter((x) => x.module_id === mid),
      audio: data.audio.filter((x) => x.module_id === mid),
      pdfs: data.pdfs.filter((x) => x.module_id === mid),
      docs: data.docs.filter((x) => x.module_id === mid),
      links: data.links.filter((x) => x.module_id === mid),
      tutorials: data.tutorials.filter((x) => x.module_id === mid),
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
                  [tab]: Math.min(totalPages, (prev[tab] || 1) + 1),
                }))
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  const handlePlayVideo = (video: Module) => {
    if (!video.url) {
      console.error("[LearningModules] No video URL for:", video.title);
      showAlert(
        "Video unavailable",
        "No video URL is available for this lesson yet."
      );
      return;
    }
    setSelectedVideo(video);
    setVideoModalOpen(true);
  };

  const handlePlayAudio = (audio: Module) => {
    if (!audio.url) {
      console.error("[LearningModules] No audio URL for:", audio.title);
      showAlert(
        "Audio unavailable",
        "No audio URL is available for this lesson yet."
      );
      return;
    }
    setSelectedAudio(audio);
    setAudioPlayerOpen(true);
  };

  const handlePreviewPdf = (pdf: Module) => {
    if (!pdf.url) {
      console.error("[LearningModules] No PDF URL for:", pdf.title);
      showAlert(
        "PDF unavailable",
        "No PDF URL is available for this document yet."
      );
      return;
    }
    const url = new URL(pdf.url);
    if (session?.user?.sessionToken) {
      url.searchParams.append("sessionToken", session.user.sessionToken);
    }
    window.open(url.toString(), "_blank");
  };

  const handleDownloadPdf = (pdf: Module) => {
    if (!pdf.url) {
      console.error("[LearningModules] No PDF URL for download:", pdf.title);
      showAlert(
        "Download unavailable",
        "No PDF URL is available for download for this document."
      );
      return;
    }
    const link = document.createElement("a");
    link.href = pdf.url;
    link.download = pdf.title || "document.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
              className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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

        <div className="flex items-center gap-4">
          <label htmlFor="module-name-filter" className="text-sm font-medium">
            Filter by Module:
          </label>
          <Select
            value={selectedModuleId}
            onValueChange={(value) => {
              setSelectedModuleId(value);
              setCurrentPage({videos: 1, audio: 1, pdfs: 1, tutorials: 1});
            }}>
            <SelectTrigger id="module-name-filter" className="w-[180px]">
              <SelectValue placeholder="Select module" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modules</SelectItem>
              {moduleNameOptions.map((m) => (
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
              className="bg-transparent w-full justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3">
              <Video className="h-4 w-4" />
              Video
            </TabsTrigger>
            <TabsTrigger
              value="audio"
              className="bg-transparent w-full justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3">
              <Headphones className="h-4 w-4" />
              Audio
            </TabsTrigger>
            <TabsTrigger
              value="pdfs"
              className="bg-transparent w-full justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3">
              <FileText className="h-4 w-4" />
              PDFs
            </TabsTrigger>
          </TabsList>

          {/* VIDEOS */}
          <TabsContent value="videos" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {getPaginatedItems(
                filteredModules.videos,
                currentPage.videos
              ).map((video) => (
                <Card
                  key={video.id}
                  className="hover:shadow-lg transition-shadow flex flex-col h-full">
                  <CardHeader className="p-0">
                    <div className="aspect-video bg-muted rounded-md mb-3 flex items-center justify-center relative overflow-hidden">
                      {video.cover_image ? (
                        <>
                          <img
                            src={
                              video.cover_image.startsWith("http")
                                ? video.cover_image
                                : `process.env.BASE_URL${video.cover_image}`
                            }
                            alt={video.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
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
                      {video.progress === 100 && (
                        <div className="absolute top-2 right-2 z-10">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                      )}
                      <div className="absolute bottom-2 right-2 z-10">
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
                    </div>

                    <div className="mt-auto flex flex-wrap gap-3 pt-4">
                      <Button
                        className="flex-1 w-full h-10 bg-[#f79771] hover:bg-gray-300 shadow-md"
                        onClick={() => handlePlayVideo(video)}
                        disabled={!video.url}>
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
                        className={`flex-1 w-full h-10 shadow-md ${
                          savedLessons.has(video.id)
                            ? "bg-[#EF7B55] text-white hover:bg-[#EF7B55]/90" // saved look
                            : "bg-transparent" // unsaved look
                        }`}
                        onClick={() => handleSaveLesson(video)}
                        disabled={
                          !session?.user?.sessionToken ||
                          savedLessons.has(video.id)
                        }>
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
              ))}
            </div>
            {renderPagination("videos")}
          </TabsContent>

          {/* AUDIO */}
          <TabsContent value="audio" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {getPaginatedItems(filteredModules.audio, currentPage.audio).map(
                (audio) => (
                  <Card
                    key={audio.id}
                    className="flex flex-col min-h-[250px] max-h-auto hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-[#f797712f] rounded-lg flex items-center justify-center">
                          <Headphones className="h-8 w-8 text-[#EF7B55]" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <CardTitle className="text-lg">
                            {audio.title}
                          </CardTitle>
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
                      <div className="space-y-2" />
                      <div className="mt-auto flex flex-wrap gap-2">
                        <Button
                          className="flex-1 w-full h-10 bg-[#f79771] hover:bg-gray-300 shadow-md"
                          onClick={() => handlePlayAudio(audio)}
                          disabled={!audio.url}>
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
                          }>
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

          {/* PDFS */}
          <TabsContent value="pdfs" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {getPaginatedItems(filteredModules.pdfs, currentPage.pdfs).map(
                (pdf) => (
                  <Card
                    key={pdf.id}
                    className="hover:shadow-lg transition-shadow flex flex-col min-h-[400px] max-h-auto">
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
                          disabled={!pdf.url}>
                          <Eye className="mr-2 h-3 w-3" />
                          Preview
                        </Button>
                        {/* If you later want download:
                        <Button
                          variant="outline"
                          className="flex-1 h-10"
                          onClick={() => handleDownloadPdf(pdf)}
                          disabled={!pdf.url}
                        >
                          <Download className="mr-2 h-3 w-3" />
                          Download
                        </Button>
                        */}
                        <Button
                          variant={
                            savedLessons.has(pdf.id) ? "default" : "outline"
                          }
                          className="flex-1 w-full h-10 bg-transparent shadow-md"
                          onClick={() => handleSaveLesson(pdf)}
                          disabled={
                            !session?.user?.sessionToken ||
                            savedLessons.has(pdf.id)
                          }>
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

          {/* TUTORIALS (if you enable the tab later) */}
          <TabsContent value="tutorials" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {getPaginatedItems(
                filteredModules.tutorials,
                currentPage.tutorials
              ).map((tutorial) => (
                <Card
                  key={tutorial.id}
                  className="flex flex-col min-h-[250px] max-h-auto hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">
                          {tutorial.type || tutorial.content_type}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">
                        {tutorial.title}
                      </CardTitle>
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
                    </div>
                    <Button
                      className="w-full mt-auto"
                      disabled={!tutorial.isActiveNow}>
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

        {/* GLOBAL ALERT MODAL */}
        <Dialog
          open={alertModal.open}
          onOpenChange={(open) => setAlertModal((prev) => ({...prev, open}))}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{alertModal.title}</DialogTitle>
              <DialogDescription>{alertModal.message}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                onClick={() =>
                  setAlertModal((prev) => ({...prev, open: false}))
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

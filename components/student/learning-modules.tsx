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
import {useSession} from "next-auth/react";
import {Spinner} from "@/components/ui/spinner";
import toast from "react-hot-toast";

interface Module {
  id: number;
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
  const [selectedModuleName, setSelectedModuleName] = useState<string>("all");
  const [savedLessons, setSavedLessons] = useState<Set<number>>(new Set());
  const sessionToken = useMemo(
    () => session?.user?.sessionToken || null,
    [session?.user?.sessionToken]
  );

  const itemsPerPage = 3;

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

  const handleLogout = async () => {
    console.log(
      "[LearningModules] Initiating logout, sessionToken:",
      session?.user?.sessionToken
    );
    try {
      const response = await fetch("/api/auth/logout-route", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
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
        setModules(fallbackData);
        setLoading(false);
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
            setLoading(false);
            return;
          }
          setError("Failed to fetch modules");
          setModules(fallbackData);
          throw new Error("Fetch failed");
        }
        const data = await response.json();
        console.log("[LearningModules] Fetch response data:", data);
        setModules(data);
        setError(null);
      } catch (e) {
        console.error("[LearningModules] Fetch error:", e);
        setError("Session expired");
        setModules(null);
      }
      setLoading(false);
    };

    fetchModules();
  }, [sessionToken, status]);

  useEffect(() => {
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
        setError(null);
      } catch (e) {
        console.error("[LearningModules] Active modules fetch error:", e);
        setError("Session expired");
        setActiveModules([]);
      }
    };

    fetchActiveModules();
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
      setError("No video URL available");
      return;
    }
    setSelectedVideo(video);
    setVideoModalOpen(true);
  };

  const handlePlayAudio = (audio: Module) => {
    if (!audio.url) {
      console.error("[LearningModules] No audio URL for:", audio.title);
      setError("No audio URL available");
      return;
    }
    setSelectedAudio(audio);
    setAudioPlayerOpen(true);
  };

  const handlePreviewPdf = (pdf: Module) => {
    if (!pdf.url) {
      console.error("[LearningModules] No PDF URL for:", pdf.title);
      setError("No PDF URL available");
      return;
    }
    console.log("[LearningModules] Opening PDF in new tab:", pdf.url);
    const url = new URL(pdf.url);
    if (session?.user?.sessionToken) {
      url.searchParams.append("sessionToken", session.user.sessionToken);
    }
    window.open(url.toString(), "_blank");
  };

  const handleDownloadPdf = (pdf: Module) => {
    if (!pdf.url) {
      console.error("[LearningModules] No PDF URL for download:", pdf.title);
      setError("No PDF URL available for download");
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
          value={selectedModuleName}
          onValueChange={(value) => {
            setSelectedModuleName(value);
            setCurrentPage({videos: 1, audio: 1, pdfs: 1, tutorials: 1});
          }}>
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
          {/* <TabsTrigger value="tutorials" className="bg-transparent w-full sm:w-32 justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3">
            <BookOpen className="h-4 w-4" />
            Live Session
          </TabsTrigger> */}
        </TabsList>

        <TabsContent value="videos" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {getPaginatedItems(filteredModules.videos, currentPage.videos).map(
              (video) => (
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
                                : `https://texagonbackend.onrender.com${video.cover_image}`
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
                      {/* {video.popularity > 0 && (
                        <div className="col-span-2">
                          <StarRating popularity={video.popularity} />
                        </div>
                      )} */}
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
                        className="flex-1 w-full h-10 bg-transparent shadow-md"
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
                  className="flex flex-col min-h-[250px] max-h-auto hover:shadow-lg transition-shadow">
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
                      {/* {audio.popularity > 0 && (
                        <div className="col-span-2">
                          <StarRating popularity={audio.popularity} />
                        </div>
                      )} */}
                    </div>
                    <div className="space-y-2">
                      {/* <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{audio.progress}%</span>
                    </div> */}
                      {/* <Progress value={audio.progress} className="h-2" /> */}
                    </div>
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
                        Updated: {new Date(pdf.updated_at).toLocaleDateString()}
                      </div>
                      {pdf.instructor && (
                        <div className="col-span-2">
                          Instructor: {pdf.instructor}
                        </div>
                      )}
                      <div>Module: {pdf.module_order}</div>
                      <div>Lesson: {pdf.lesson_order}</div>
                      {/* {pdf.popularity > 0 && (
                        <div className="col-span-2">
                          <StarRating popularity={pdf.popularity} />
                        </div>
                      )} */}
                    </div>
                    <div className="mt-auto pt-4 flex flex-wrap gap-2">
                      <Button
                        className="flex-1 w-full h-10 bg-[#f79771] hover:bg-gray-300 shadow-md"
                        onClick={() => handlePreviewPdf(pdf)}
                        disabled={!pdf.url}>
                        <Eye className="mr-2 h-3 w-3" />
                        Preview
                      </Button>
                      {/* <Button variant="outline" className="flex-1 h-10" onClick={() => handleDownloadPdf(pdf)} disabled={!pdf.url}>
                      <Download className="mr-2 h-3 w-3" />
                      Download
                    </Button> */}
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
                    {/* {tutorial.popularity > 0 && (
                      <div className="col-span-2">
                        <StarRating popularity={tutorial.popularity} />
                      </div>
                    )} */}
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
        videoUrl={selectedVideo?.url}
      />
      <AudioPlayer
        isOpen={audioPlayerOpen}
        onClose={() => setAudioPlayerOpen(false)}
        title={selectedAudio?.title || ""}
        audioUrl={selectedAudio?.url}
        duration={selectedAudio?.duration}
      />
    </div>
  );
}

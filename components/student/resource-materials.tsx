"use client";
import {useRef} from "react";
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
import {signOut, useSession} from "next-auth/react";
import {Spinner} from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../ui/command";
import {cn} from "@/lib/utils";

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
  thumbnail?: string | null; // Added for video cover images
  date?: string;
  citations?: number;
  content?: string;
  blur?: boolean; // ✅ add this
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
type LessonMediaResp = {
  url: string;
  blur?: boolean;
  expires_in?: number;
};
export function ResourceMaterials() {
  const [pageLoading, setPageLoading] = useState(true); // first load only
  const [dataLoading, setDataLoading] = useState(false); // filter/search reload
  const didInitialLoadRef = useRef(false);

  const {data: session, status} = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");
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
    null,
  );
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const itemsPerPage = 3;

  const sessionToken = useMemo(
    () => session?.user?.sessionToken,
    [session?.user?.sessionToken],
  );

  const [openingKey, setOpeningKey] = useState<string | null>(null);

  const isLocked = (item: Resource, kind: "pdf" | "video" | "audio") => {
    if (item.blur) return true;
    if (kind === "pdf") return !item.pdfUrl;
    if (kind === "video") return !item.videoUrl;
    return !item.audioUrl;
  };

  async function fetchLessonMediaUrl(params: {
    lesson_id: string | number;
    kind: "pdf" | "video" | "audio";
  }) {
    if (!sessionToken) throw new Error("Missing session token");

    const qs = new URLSearchParams({
      lesson_id: String(params.lesson_id),
      kind: params.kind,
    });

    const res = await fetch(
      `/api/student/lesson-media-url/${params.lesson_id}/`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Session-Token": sessionToken,
        },
      },
    );

    const payload = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(
        payload?.detail || payload?.error || "Failed to get media url",
      );
    }

    return payload as LessonMediaResp;
  }

  function getLessonId(item: Resource) {
    // ✅ best effort fallback if backend doesn't send lesson_id yet
    // If your backend sends lesson_id, use that instead
    return (
      (item as any).lesson_id ??
      (item as any).lessonId ??
      (item as any).lesson ??
      item.id
    );
  }
  const EMPTY_RESOURCES: ResourcesData = {
    categories: [],
    courses: [],
    selected_course_id: null,
    selected_module_id: null,
    pdfs: [],
    videos: [],
    audio: [],
    journals: [],
  };

  const LockedOverlay = ({label = "Locked content"}: {label?: string}) => (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
      <div className="flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-xs font-medium shadow-sm">
        <AlertCircle className="h-4 w-4 text-[#EF7B55]" />
        <span>{label}</span>
      </div>
    </div>
  );

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
    const fetchResources = async () => {
      const isInitial = !didInitialLoadRef.current;

      if (isInitial) setPageLoading(true);
      else setDataLoading(true);

      if (status !== "authenticated" || !sessionToken) {
        setError("Not authenticated");
        setResourcesData(null);
        setCategories([]);
        setPageLoading(false);
        setDataLoading(false);
        return;
      }

      try {
        const queryParams = new URLSearchParams();

        if (appliedSearchQuery) {
          queryParams.append("q", appliedSearchQuery);
        } else {
          if (selectedCourseId)
            queryParams.append("course_id", selectedCourseId.toString());
          if (selectedModuleId)
            queryParams.append("module_id", selectedModuleId.toString());
        }

        const response = await fetch(
          `/api/student/resources?${queryParams.toString()}`,
          {
            headers: {
              "Content-Type": "application/json",
              "X-Session-Token": sessionToken,
            },
          },
        );

        if (!response.ok) {
          if (response.status === 404) {
            setError("Resources not found");
            setResourcesData(EMPTY_RESOURCES);
            setCategories([]);
            return;
          }

          if (response.status === 401) {
            setError("Session expired");
            setResourcesData(null);
            setCategories([]);
            return;
          }

          setError("Failed to fetch resources");
          setResourcesData(null);
          setCategories([]);
          return;
        }

        const data = await response.json();
        setResourcesData(data);
        setCategories(data.categories || []);
        setSelectedCourseId(
          data.selected_course_id || data.courses?.[0]?.id || null,
        );
        setSelectedModuleId(data.selected_module_id || null);
        setError(null);

        // ✅ reset pages when filtering/searching (optional but recommended)
        setCurrentPage({pdfs: 1, videos: 1, audio: 1, journals: 1});
      } catch (e) {
        setError("Failed to fetch resources");
        setResourcesData(null);
        setCategories([]);
      } finally {
        didInitialLoadRef.current = true;
        setPageLoading(false);
        setDataLoading(false);
      }
    };

    fetchResources();
  }, [
    sessionToken,
    status,
    appliedSearchQuery,
    selectedCourseId,
    selectedModuleId,
  ]);

  const handlePreviewPdf = async (pdf: Resource) => {
    if (isLocked(pdf, "pdf")) return;

    const key = `pdf-preview-${pdf.id}`;
    setOpeningKey(key);

    try {
      const lessonId = getLessonId(pdf);
      const {url} = await fetchLessonMediaUrl({
        lesson_id: lessonId,
        kind: "pdf",
      });

      setSelectedPdf({...pdf, pdfUrl: url});
      setPdfViewerOpen(true);
    } catch (e: any) {
      setError(e?.message || "Failed to open PDF");
    } finally {
      setOpeningKey((prev) => (prev === key ? null : prev));
    }
  };

  const handleDownloadPdf = (pdf: Resource) => {
    if (pdf.blur || !pdf.pdfUrl) return; // ✅ block
    const link = document.createElement("a");
    link.href = pdf.pdfUrl;
    link.download = pdf.title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleWatchVideo = async (video: Resource) => {
    if (isLocked(video, "video")) return;

    const key = `video-${video.id}`;
    setOpeningKey(key);

    try {
      const lessonId = getLessonId(video);
      const {url} = await fetchLessonMediaUrl({
        lesson_id: lessonId,
        kind: "video",
      });

      setSelectedVideo({...video, videoUrl: url});
      setVideoModalOpen(true);
    } catch (e: any) {
      setError(e?.message || "Failed to open video");
    } finally {
      setOpeningKey((prev) => (prev === key ? null : prev));
    }
  };
  const handlePlayAudio = async (audio: Resource) => {
    if (isLocked(audio, "audio")) return;

    const key = `audio-${audio.id}`;
    setOpeningKey(key);

    try {
      const lessonId = getLessonId(audio);
      const {url} = await fetchLessonMediaUrl({
        lesson_id: lessonId,
        kind: "audio",
      });

      setSelectedAudio({...audio, audioUrl: url});
      setAudioPlayerOpen(true);
    } catch (e: any) {
      setError(e?.message || "Failed to open audio");
    } finally {
      setOpeningKey((prev) => (prev === key ? null : prev));
    }
  };
  const handleDownloadJournal = async (journal: Resource) => {
    if (isLocked(journal, "pdf")) return;

    const key = `journal-download-${journal.id}`;
    setOpeningKey(key);

    try {
      const lessonId = getLessonId(journal);
      const {url} = await fetchLessonMediaUrl({
        lesson_id: lessonId,
        kind: "pdf",
      });

      const link = document.createElement("a");
      link.href = url;
      link.download = `${journal.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e: any) {
      setError(e?.message || "Failed to download journal");
    } finally {
      setOpeningKey((prev) => (prev === key ? null : prev));
    }
  };

  const getPaginatedItems = (items: Resource[], page: number) => {
    const startIndex = (page - 1) * itemsPerPage;
    return items
      .filter((item) => !selectedCategory || item.category === selectedCategory)
      .slice(startIndex, startIndex + itemsPerPage);
  };

  const getTotalPages = (items: Resource[]) => {
    const filteredItems = items.filter(
      (item) => !selectedCategory || item.category === selectedCategory,
    );
    return Math.ceil(filteredItems.length / itemsPerPage);
  };

  const renderPagination = (tab: keyof typeof currentPage) => {
    const resources = resourcesData ?? EMPTY_RESOURCES;
    const totalPages = getTotalPages(resources[tab]);
    const current = currentPage[tab];

    if (totalPages <= 1) return null;

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

  const resources = resourcesData ?? EMPTY_RESOURCES;

  const EmptyState = ({
    title,
    subtitle,
    icon,
  }: {
    title: string;
    subtitle?: string;
    icon: React.ReactNode;
  }) => (
    <Card className="border-dashed">
      <CardHeader className="flex flex-row items-start gap-3">
        <div className="mt-1 text-muted-foreground">{icon}</div>
        <div className="space-y-1">
          <CardTitle className="text-base">{title}</CardTitle>
          {subtitle ? (
            <CardDescription className="text-sm">{subtitle}</CardDescription>
          ) : null}
        </div>
      </CardHeader>
    </Card>
  );

  const pdfItems = getPaginatedItems(resources.pdfs, currentPage.pdfs);
  const videoItems = getPaginatedItems(resources.videos, currentPage.videos);
  const audioItems = getPaginatedItems(resources.audio, currentPage.audio);
  const journalItems = getPaginatedItems(
    resources.journals,
    currentPage.journals,
  );

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
            {/* Show selected course name if selected, otherwise show placeholder */}
            <SelectValue>
              {selectedCourseId
                ? resources.courses.find((c) => c.id === selectedCourseId)?.name
                : "Select Resource"}
            </SelectValue>
          </SelectTrigger>

          <SelectContent className="p-0">
            <Command>
              <CommandInput placeholder="Search courses..." />
              <CommandEmpty>No courses found</CommandEmpty>
              <CommandGroup>
                {resources.courses.map((course) => (
                  <CommandItem
                    key={course.id}
                    onSelect={() => setSelectedCourseId(course.id)}>
                    {course.name}
                    {selectedCourseId === course.id && (
                      <span className="ml-auto text-muted-foreground">✔</span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
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
          className={`h-10 bg-transparent border border-[#EF7B55] text-[#EF7B55] hover:bg-[#F79771] hover:text-white ${
            appliedSearchQuery ? "bg-[#F79771] text-white" : ""
          }`}
          variant="outline"
          disabled={dataLoading}
          onClick={() => setAppliedSearchQuery(searchQuery)}>
          <Filter className="mr-2 h-4 w-4" />
          {dataLoading ? "Filtering..." : "Filter"}
        </Button>
      </div>

      {/* <div className="flex gap-2 flex-wrap">
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
      </div> */}

      <Tabs defaultValue="pdfs" className="w-full mr-auto relative">
        <TabsList className="bg-[#f797712e] text-slate-700 flex flex-col lg:flex-row w-full gap-2 mb-14">
          <TabsTrigger
            value="pdfs"
            className="bg-transparent w-full justify-center py-2 data-[state=active]:bg-[#EF7B55]/70 data-[state=active]:text-white gap-3">
            <FileText className="h-4 w-4" />
            PDFs
          </TabsTrigger>
          <TabsTrigger
            value="videos"
            className="bg-transparent w-full justify-center py-2 data-[state=active]:bg-[#EF7B55]/70 data-[state=active]:text-white gap-3">
            <Video className="h-4 w-4" />
            Videos
          </TabsTrigger>
          <TabsTrigger
            value="audio"
            className="bg-transparent w-full justify-center py-2 data-[state=active]:bg-[#EF7B55]/70 data-[state=active]:text-white gap-3">
            <Headphones className="h-4 w-4" />
            Audio
          </TabsTrigger>
          <TabsTrigger
            value="journals"
            className="bg-transparent w-full justify-center py-2 data-[state=active]:bg-[#EF7B55]/70 data-[state=active]:text-white gap-3">
            <BookOpen className="h-4 w-4" />
            Journals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pdfs" className="space-y-4">
          {dataLoading ? (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({length: itemsPerPage}).map((_, i) => (
                  <Card key={`pdf-skel-${i}`} className="flex flex-col h-full">
                    <CardHeader>
                      <div className="space-y-2">
                        <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                        <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-1">
                      <div className="h-3 w-2/3 bg-muted animate-pulse rounded" />
                      <div className="mt-auto pt-4 flex flex-col sm:flex-row gap-2">
                        <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
                        <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {/* no pagination while loading */}
            </>
          ) : (
            <>
              {(() => {
                const pdfItems = getPaginatedItems(
                  resources.pdfs,
                  currentPage.pdfs,
                );

                return pdfItems.length === 0 ? (
                  <Card className="border-dashed">
                    <CardHeader className="flex flex-row items-start gap-3">
                      <div className="mt-1 text-muted-foreground">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <CardTitle className="text-base">
                          No PDFs found
                        </CardTitle>
                        <CardDescription className="text-sm">
                          Try changing the course/module or search query.
                        </CardDescription>
                      </div>
                    </CardHeader>
                  </Card>
                ) : (
                  <>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {pdfItems.map((pdf, index) => (
                        <Card
                          key={pdf.id || index}
                          className={cn(
                            "hover:shadow-xl transition-shadow flex flex-col sm:flex-row h-full bg-white rounded-lg overflow-hidden shadow-sm max-w-md relative",
                            pdf.blur && "cursor-not-allowed",
                          )}>
                          {/* BLUR WRAPPER */}
                          <div
                            className={cn(
                              "flex flex-col sm:flex-row w-full",
                              pdf.blur && "blur-md",
                            )}>
                            <div className="relative w-full sm:w-40 flex-shrink-0 aspect-video bg-muted overflow-hidden flex items-center justify-center">
                              <FileText className="h-8 w-8 text-muted-foreground" />
                            </div>

                            <CardContent className="flex flex-col flex-1 p-3 sm:p-2.5">
                              <div className="flex flex-col sm:justify-between sm:items-start gap-1.5 sm:gap-2.5">
                                <div className="space-y-0.5">
                                  <CardTitle className="text-base font-semibold line-clamp-2">
                                    {pdf.title}
                                  </CardTitle>
                                  <CardDescription className="text-xs text-muted-foreground">
                                    by {pdf.author || "Unknown"}
                                  </CardDescription>
                                </div>
                                <Badge
                                  variant="secondary"
                                  className="self-start sm:self-auto text-xs px-2 py-0.5">
                                  {pdf.category}
                                </Badge>
                              </div>

                              <div className="mt-2 h-5" />

                              <div className="mt-3 flex flex-col sm:flex-row gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium"
                                  disabled={
                                    isLocked(pdf, "pdf") ||
                                    openingKey === `pdf-preview-${pdf.id}`
                                  }
                                  onClick={() => handlePreviewPdf(pdf)}>
                                  {openingKey === `pdf-preview-${pdf.id}` ? (
                                    <>
                                      <Spinner
                                        size="sm"
                                        className="text-orange-500"
                                      />
                                      Loading...
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="h-3.5 w-3.5 flex-shrink-0" />
                                      Preview
                                    </>
                                  )}
                                </Button>

                                {/* <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full sm:w-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium"
                                  disabled={
                                    isLocked(pdf, "pdf") ||
                                    openingKey === `pdf-download-${pdf.id}`
                                  }
                                  onClick={() => handleDownloadPdf(pdf)}>
                                  {openingKey === `pdf-download-${pdf.id}` ? (
                                    <>
                                      <Spinner
                                        size="sm"
                                        className="text-orange-500"
                                      />
                                      Loading...
                                    </>
                                  ) : (
                                    <>
                                      <Download className="h-3.5 w-3.5 flex-shrink-0" />
                                      Download
                                    </>
                                  )}
                                </Button> */}
                              </div>
                            </CardContent>
                          </div>

                          {/* OVERLAY */}
                          {pdf.blur && (
                            <LockedOverlay label="Login / Subscribe to unlock PDF" />
                          )}
                        </Card>
                      ))}
                    </div>

                    {renderPagination("pdfs")}
                  </>
                );
              })()}
            </>
          )}
        </TabsContent>

        <TabsContent value="videos" className="space-y-4">
          {dataLoading ? (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({length: itemsPerPage}).map((_, i) => (
                  <Card
                    key={`video-skel-${i}`}
                    className="flex flex-col h-full">
                    <CardHeader>
                      <div className="space-y-2">
                        <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                        <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-1">
                      <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                      <div className="mt-auto pt-4">
                        <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {/* no pagination while loading */}
            </>
          ) : (
            <>
              {(() => {
                const videoItems = getPaginatedItems(
                  resources.videos,
                  currentPage.videos,
                );

                return videoItems.length === 0 ? (
                  <Card className="border-dashed">
                    <CardHeader className="flex flex-row items-start gap-3">
                      <div className="mt-1 text-muted-foreground">
                        <Video className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <CardTitle className="text-base">
                          No videos found
                        </CardTitle>
                        <CardDescription className="text-sm">
                          Try changing the course/module or search query.
                        </CardDescription>
                      </div>
                    </CardHeader>
                  </Card>
                ) : (
                  <>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {videoItems.map((video, index) => (
                        <Card
                          key={video.id || index}
                          className={cn(
                            "hover:shadow-xl transition-shadow flex flex-col sm:flex-row h-full bg-white rounded-lg overflow-hidden shadow-sm max-w-md relative",
                            video.blur && "cursor-not-allowed",
                          )}>
                          <div
                            className={cn(
                              "flex flex-col sm:flex-row w-full",
                              video.blur && "blur-md",
                            )}>
                            <div className="relative w-full sm:w-40 flex-shrink-0 aspect-video bg-muted overflow-hidden flex items-center justify-center">
                              {video.thumbnail ? (
                                <img
                                  src={
                                    video.thumbnail.startsWith("http")
                                      ? video.thumbnail
                                      : `process.env.BASE_URL${video.thumbnail}`
                                  }
                                  alt={video.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Video className="h-8 w-8 text-muted-foreground" />
                              )}
                            </div>

                            <CardContent className="flex flex-col flex-1 p-3 sm:p-2.5">
                              <div className="flex flex-col sm:justify-between sm:items-start gap-1.5 sm:gap-2.5">
                                <div className="space-y-0.5">
                                  <CardTitle className="text-base font-semibold line-clamp-2">
                                    {video.title}
                                  </CardTitle>
                                  <CardDescription className="text-xs text-muted-foreground">
                                    by {video.instructor || "Unknown"}
                                  </CardDescription>
                                </div>

                                <Badge
                                  variant="secondary"
                                  className="self-start sm:self-auto text-xs px-2 py-0.5">
                                  {video.category}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mt-2">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  {video.duration || "—"}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Eye className="h-3.5 w-3.5" />
                                  {video.views || 0} views
                                </div>
                              </div>

                              <Button
                                size="sm"
                                variant="outline"
                                className="mt-3 w-full sm:w-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium"
                                disabled={
                                  isLocked(video, "video") ||
                                  openingKey === `video-${video.id}`
                                }
                                onClick={() => handleWatchVideo(video)}>
                                {openingKey === `video-${video.id}` ? (
                                  <>
                                    <Spinner
                                      size="sm"
                                      className="text-orange-500"
                                    />
                                    Loading...
                                  </>
                                ) : (
                                  <>
                                    <Video className="h-3.5 w-3.5 flex-shrink-0" />
                                    Watch Now
                                  </>
                                )}
                              </Button>
                            </CardContent>
                          </div>

                          {video.blur && (
                            <LockedOverlay label="Login / Subscribe to unlock Video" />
                          )}
                        </Card>
                      ))}
                    </div>

                    {renderPagination("videos")}
                  </>
                );
              })()}
            </>
          )}
        </TabsContent>

        <TabsContent value="audio" className="space-y-4">
          {dataLoading ? (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({length: itemsPerPage}).map((_, i) => (
                  <Card
                    key={`audio-skel-${i}`}
                    className="flex flex-col h-full">
                    <CardHeader>
                      <div className="space-y-2">
                        <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                        <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-1">
                      <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                      <div className="mt-auto pt-4">
                        <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {/* no pagination while loading */}
            </>
          ) : (
            <>
              {(() => {
                const audioItems = getPaginatedItems(
                  resources.audio,
                  currentPage.audio,
                );

                return audioItems.length === 0 ? (
                  <Card className="border-dashed">
                    <CardHeader className="flex flex-row items-start gap-3">
                      <div className="mt-1 text-muted-foreground">
                        <Headphones className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <CardTitle className="text-base">
                          No audio found
                        </CardTitle>
                        <CardDescription className="text-sm">
                          Try changing the course/module or search query.
                        </CardDescription>
                      </div>
                    </CardHeader>
                  </Card>
                ) : (
                  <>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {audioItems.map((audio, index) => (
                        <Card
                          key={audio.id || index}
                          className={cn(
                            "hover:shadow-xl transition-shadow flex flex-col sm:flex-row h-full bg-white rounded-lg overflow-hidden shadow-sm max-w-md relative",
                            audio.blur && "cursor-not-allowed",
                          )}>
                          <div
                            className={cn(
                              "flex flex-col sm:flex-row w-full",
                              audio.blur && "blur-md",
                            )}>
                            <div className="relative w-full sm:w-40 flex-shrink-0 aspect-video bg-muted overflow-hidden flex items-center justify-center">
                              <Headphones className="h-8 w-8 text-muted-foreground" />
                            </div>

                            <CardContent className="flex flex-col flex-1 p-3 sm:p-2.5">
                              <div className="flex flex-col sm:justify-between sm:items-start gap-1.5 sm:gap-2.5">
                                <div className="space-y-0.5">
                                  <CardTitle className="text-base font-semibold line-clamp-2">
                                    {audio.title}
                                  </CardTitle>
                                  <CardDescription className="text-xs text-muted-foreground">
                                    by {audio.speaker || "Unknown"}
                                  </CardDescription>
                                </div>

                                <Badge
                                  variant="secondary"
                                  className="self-start sm:self-auto text-xs px-2 py-0.5">
                                  {audio.category}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mt-2">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  {audio.duration || "—"}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Headphones className="h-3.5 w-3.5" />
                                  {audio.listens || 0} listens
                                </div>
                              </div>

                              <Button
                                size="sm"
                                variant="outline"
                                className="mt-3 w-full sm:w-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium"
                                disabled={
                                  isLocked(audio, "audio") ||
                                  openingKey === `audio-${audio.id}`
                                }
                                onClick={() => handlePlayAudio(audio)}>
                                {openingKey === `audio-${audio.id}` ? (
                                  <>
                                    <Spinner
                                      size="sm"
                                      className="text-orange-500"
                                    />
                                    Loading...
                                  </>
                                ) : (
                                  <>
                                    <Headphones className="h-3.5 w-3.5 flex-shrink-0" />
                                    Listen Now
                                  </>
                                )}
                              </Button>
                            </CardContent>
                          </div>

                          {audio.blur && (
                            <LockedOverlay label="Login / Subscribe to unlock Audio" />
                          )}
                        </Card>
                      ))}
                    </div>

                    {renderPagination("audio")}
                  </>
                );
              })()}
            </>
          )}
        </TabsContent>

        <TabsContent value="journals" className="space-y-4">
          {dataLoading ? (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({length: itemsPerPage}).map((_, i) => (
                  <Card
                    key={`journal-skel-${i}`}
                    className="flex flex-col h-full">
                    <CardHeader>
                      <div className="space-y-2">
                        <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                        <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-1">
                      <div className="h-3 w-2/3 bg-muted animate-pulse rounded" />
                      <div className="mt-auto pt-4 flex gap-2">
                        <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
                        <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {/* no pagination while loading */}
            </>
          ) : (
            <>
              {(() => {
                const journalItems = getPaginatedItems(
                  resources.journals,
                  currentPage.journals,
                );

                return journalItems.length === 0 ? (
                  <Card className="border-dashed">
                    <CardHeader className="flex flex-row items-start gap-3">
                      <div className="mt-1 text-muted-foreground">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <CardTitle className="text-base">
                          No journals found
                        </CardTitle>
                        <CardDescription className="text-sm">
                          Try changing the course/module or search query.
                        </CardDescription>
                      </div>
                    </CardHeader>
                  </Card>
                ) : (
                  <>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {journalItems.map((journal, index) => (
                        <Card
                          key={journal.id || index}
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
                              <Badge variant="secondary">
                                {journal.category}
                              </Badge>
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
                              {journal.pdfUrl && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="mt-3 w-full sm:w-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium hover:bg-[#f57c50]/20 hover:text-accent-foreground transition-colors"
                                  disabled={
                                    isLocked(journal, "pdf") ||
                                    openingKey === `pdf-preview-${journal.id}`
                                  }
                                  onClick={() => handlePreviewPdf(journal)}>
                                  {openingKey ===
                                  `pdf-preview-${journal.id}` ? (
                                    <>
                                      <Spinner
                                        size="sm"
                                        className="text-orange-500"
                                      />
                                      Loading...
                                    </>
                                  ) : (
                                    <>
                                      <BookOpen className="mr-2 h-3 w-3" />
                                      Read
                                    </>
                                  )}
                                </Button>
                              )}

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDownloadJournal(journal)}
                                className="mt-3 w-full sm:w-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium hover:bg-[#f57c50]/20 hover:text-accent-foreground transition-colors"
                                disabled={
                                  isLocked(journal, "pdf") ||
                                  openingKey ===
                                    `journal-download-${journal.id}`
                                }>
                                {openingKey ===
                                `journal-download-${journal.id}` ? (
                                  <>
                                    <Spinner
                                      size="sm"
                                      className="text-orange-500"
                                    />
                                    Loading...
                                  </>
                                ) : (
                                  <>
                                    <Download className="mr-2 h-3 w-3" />
                                    Download
                                  </>
                                )}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {renderPagination("journals")}
                  </>
                );
              })()}
            </>
          )}
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

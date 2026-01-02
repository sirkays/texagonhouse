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
import {useSession} from "next-auth/react";
import {Spinner} from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    null
  );
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const itemsPerPage = 3;

  const sessionToken = useMemo(
    () => session?.user?.sessionToken,
    [session?.user?.sessionToken]
  );

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

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout-route", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
      });
      const data = await response.json();
      if (!response.ok) {
        console.error("[ResourceMaterials] Logout failed:", data);
        throw new Error(data.error || "Logout failed");
      }
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
          }
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
          data.selected_course_id || data.courses?.[0]?.id || null
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

  const handlePreviewPdf = (pdf: Resource) => {
    setSelectedPdf(pdf);
    setPdfViewerOpen(true);
  };

  const handleDownloadPdf = (pdf: Resource) => {
    const link = document.createElement("a");
    link.href = pdf.pdfUrl || "#";
    link.download = pdf.title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleWatchVideo = (video: Resource) => {
    setSelectedVideo(video);
    setVideoModalOpen(true);
  };

  const handlePlayAudio = (audio: Resource) => {
    setSelectedAudio(audio);
    setAudioPlayerOpen(true);
  };

  const handleDownloadJournal = (journal: Resource) => {
    const link = document.createElement("a");
    link.href = journal.pdfUrl || `#`;
    link.download = `${journal.title}.pdf`;
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
    currentPage.journals
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
            className="bg-transparent w-full justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3">
            <FileText className="h-4 w-4" />
            PDFs
          </TabsTrigger>
          <TabsTrigger
            value="videos"
            className="bg-transparent w-full justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3">
            <Video className="h-4 w-4" />
            Videos
          </TabsTrigger>
          <TabsTrigger
            value="audio"
            className="bg-transparent w-full justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3">
            <Headphones className="h-4 w-4" />
            Audio
          </TabsTrigger>
          <TabsTrigger
            value="journals"
            className="bg-transparent w-full justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3">
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
                  currentPage.pdfs
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
                          className="hover:shadow-lg transition-shadow flex flex-col h-full">
                          <CardHeader>
                            <div className="flex flex-wrap gap-2 items-start justify-between">
                              <div className="space-y-1">
                                <CardTitle className="text-lg">
                                  {pdf.title}
                                </CardTitle>
                                <CardDescription>
                                  by {pdf.author || "Unknown"}
                                </CardDescription>
                              </div>
                              <Badge variant="secondary">{pdf.category}</Badge>
                            </div>
                          </CardHeader>

                          <CardContent className="flex flex-wrap flex-1">
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
                  currentPage.videos
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
                          className="hover:shadow-lg transition-shadow flex flex-col h-full">
                          <CardHeader>
                            <div className="aspect-video bg-muted rounded-md mb-2 flex items-center justify-center relative overflow-hidden">
                              {video.thumbnail ? (
                                <>
                                  <img
                                    src={
                                      video.thumbnail.startsWith("http")
                                        ? video.thumbnail
                                        : `https://texagonbackend.onrender.com${video.thumbnail}`
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
                                <Video className="h-8 w-8 text-muted-foreground" />
                              )}
                            </div>

                            <div className="flex flex-wrap items-start justify-between">
                              <div className="space-y-1">
                                <CardTitle className="text-lg">
                                  {video.title}
                                </CardTitle>
                                <CardDescription>
                                  by {video.instructor || "Unknown"}
                                </CardDescription>
                              </div>
                              <Badge variant="secondary">
                                {video.category}
                              </Badge>
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
                  currentPage.audio
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
                          className="hover:shadow-lg transition-shadow flex flex-col h-full">
                          <CardHeader>
                            <div className="flex flex-wrap gap-3 items-start justify-between">
                              <div className="space-y-1">
                                <CardTitle className="text-lg">
                                  {audio.title}
                                </CardTitle>
                                <CardDescription>
                                  by {audio.speaker || "Unknown"}
                                </CardDescription>
                              </div>
                              <Badge variant="secondary">
                                {audio.category}
                              </Badge>
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
                  currentPage.journals
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
                                  className="flex-1 w-full h-10 bg-[#f79771] hover:bg-gray-300 shadow-md"
                                  onClick={() => handlePreviewPdf(journal)}>
                                  <BookOpen className="mr-2 h-3 w-3" />
                                  Read
                                </Button>
                              )}

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

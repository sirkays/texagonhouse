"use client";

import {useState} from "react";
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
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
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
} from "lucide-react";
import {PDFViewer} from "./pdf-viewer";
import {VideoModal} from "./video-modal";
import {AudioPlayer} from "./audio-player";

export function ResourceMaterials() {
  const [searchQuery, setSearchQuery] = useState("");
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState<any>(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [audioPlayerOpen, setAudioPlayerOpen] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState<any>(null);

  const resources = {
    pdfs: [
      {
        id: "1",
        title: "React Complete Guide 2024 gjn;gjgn;ogkn;jn;oj",
        author: "John Smith",
        pages: 245,
        size: "12.5 MB",
        rating: 4.8,
        downloads: 1250,
        category: "Frontend",
        pdfUrl: "/sample.pdf",
      },
      {
        id: "2",
        title: "Python Data Structures",
        author: "Jane Doe",
        pages: 180,
        size: "8.2 MB",
        rating: 4.6,
        downloads: 890,
        category: "Programming",
        pdfUrl: "/sample.pdf",
      },
      {
        id: "3",
        title: "Machine Learning Fundamentals",
        author: "Dr. Wilson",
        pages: 320,
        size: "18.7 MB",
        rating: 4.9,
        downloads: 2100,
        category: "AI/ML",
        pdfUrl: "/sample.pdf",
      },
    ],
    videos: [
      {
        id: "1",
        title: "Advanced React Patterns falgjn;jn;sgkjfdn;kjnsd;fjknsdgf",
        instructor: "Sarah Johnson",
        duration: "2h 45m",
        views: 15600,
        rating: 4.7,
        category: "Frontend",
        videoUrl: "/sample-video.mp4",
      },
      {
        id: "2",
        title: "Python Web Scraping Tutorial",
        instructor: "Mike Chen",
        duration: "1h 30m",
        views: 8900,
        rating: 4.5,
        category: "Python",
        videoUrl: "/sample-video.mp4",
      },
      {
        id: "3",
        title: "Database Design Principles",
        instructor: "Alex Rodriguez",
        duration: "3h 15m",
        views: 12300,
        rating: 4.8,
        category: "Database",
        videoUrl: "/sample-video.mp4",
      },
    ],
    audio: [
      {
        id: "1",
        title:
          "Tech Talk: Future of Web Development gwugn;gjn;pggjobwgrjergbgjiwbeg;pijb",
        speaker: "Industry Panel",
        duration: "45m",
        listens: 5600,
        rating: 4.4,
        category: "Discussion",
        audioUrl: "/sample-audio.mp3",
      },
      {
        id: "2",
        title: "JavaScript Deep Dive Podcast",
        speaker: "Dev Community",
        duration: "1h 20m",
        listens: 8900,
        rating: 4.6,
        category: "Programming",
        audioUrl: "/sample-audio.mp3",
      },
      {
        id: "3",
        title: "Career in Tech - Interview Tips",
        speaker: "HR Expert",
        duration: "35m",
        listens: 3400,
        rating: 4.3,
        category: "Career",
        audioUrl: "/sample-audio.mp3",
      },
    ],
    journals: [
      {
        id: "1",
        title:
          "Modern JavaScript Development Practices  agubp;guqbgqgu bjgpji qgpjiq gp;eqigu reqp;giqueg p; ",
        journal: "Web Dev Quarterly",
        date: "Dec 2024",
        pages: 15,
        citations: 45,
        category: "Research",
        content:
          "This comprehensive study examines the latest trends in JavaScript development...",
      },
      {
        id: "2",
        title: "AI in Software Engineering",
        journal: "Tech Innovation Review",
        date: "Nov 2024",
        pages: 22,
        citations: 78,
        category: "AI/ML",
        content:
          "Artificial Intelligence is revolutionizing software engineering practices...",
      },
      {
        id: "3",
        title: "Cybersecurity Trends 2024",
        journal: "Security Today",
        date: "Oct 2024",
        pages: 18,
        citations: 32,
        category: "Security",
        content:
          "An analysis of emerging cybersecurity threats and defense strategies...",
      },
    ],
  };

  const categories = [
    "All",
    "Frontend",
    "Backend",
    "AI/ML",
    "Database",
    "Security",
    "Career",
  ];

  const handlePreviewPdf = (pdf: any) => {
    setSelectedPdf(pdf);
    setPdfViewerOpen(true);
  };

  const handleDownloadPdf = (pdf: any) => {
    const link = document.createElement("a");
    link.href = pdf.pdfUrl || "#";
    link.download = pdf.title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleWatchVideo = (video: any) => {
    setSelectedVideo(video);
    setVideoModalOpen(true);
  };

  const handlePlayAudio = (audio: any) => {
    setSelectedAudio(audio);
    setAudioPlayerOpen(true);
  };

  const handleReadJournal = (journal: any) => {
    // Open journal in a new tab or modal
    window.open(`/journal/${journal.id}`, "_blank");
  };

  const handleDownloadJournal = (journal: any) => {
    const link = document.createElement("a");
    link.href = `#`; // Mock download URL
    link.download = `${journal.title}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Resource Materials</h1>
        <p className="text-muted-foreground">
          Access a comprehensive library of learning resources
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Categories */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((category) => (
          <Badge
            key={category}
            variant="outline"
            className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
            {category}
          </Badge>
        ))}
      </div>

      <Tabs defaultValue="pdfs" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pdfs" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            PDFs
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Videos
          </TabsTrigger>
          <TabsTrigger value="audio" className="flex items-center gap-2">
            <Headphones className="h-4 w-4" />
            Audio
          </TabsTrigger>
          <TabsTrigger value="journals" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Journals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pdfs" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {resources.pdfs.map((pdf, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-shadow flex flex-col h-full">
                {/* Header */}
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{pdf.title}</CardTitle>
                      <CardDescription>by {pdf.author}</CardDescription>
                    </div>
                    <Badge variant="secondary">{pdf.category}</Badge>
                  </div>
                </CardHeader>

                {/* Body + Footer */}
                <CardContent className="flex flex-col flex-1">
                  {/* Body */}
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>Pages: {pdf.pages}</div>
                    <div>Size: {pdf.size}</div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {pdf.rating}
                    </div>
                    <div>{pdf.downloads} downloads</div>
                  </div>

                  {/* Footer — sticks to bottom */}
                  <div className="mt-auto pt-4 flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handlePreviewPdf(pdf)}>
                      <Eye className="mr-2 h-3 w-3" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadPdf(pdf)}>
                      <Download className="mr-2 h-3 w-3" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="videos" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {resources.videos.map((video, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-shadow flex flex-col h-full">
                {/* Header */}
                <CardHeader>
                  {/* Thumbnail placeholder */}
                  <div className="aspect-video bg-muted rounded-md mb-2 flex items-center justify-center">
                    <Video className="h-8 w-8 text-muted-foreground" />
                  </div>

                  {/* Title + Category */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{video.title}</CardTitle>
                      <CardDescription>by {video.instructor}</CardDescription>
                    </div>
                    <Badge variant="secondary">{video.category}</Badge>
                  </div>
                </CardHeader>

                {/* Body + Footer */}
                <CardContent className="flex flex-col flex-1">
                  {/* Body */}
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {video.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {video.views} views
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {video.rating}
                    </div>
                  </div>

                  {/* Footer — pinned at bottom */}
                  <div className="mt-auto pt-4">
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => handleWatchVideo(video)}>
                      <Video className="mr-2 h-3 w-3" />
                      Watch Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="audio" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {resources.audio.map((audio, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-shadow flex flex-col h-full">
                {/* Header */}
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{audio.title}</CardTitle>
                      <CardDescription>by {audio.speaker}</CardDescription>
                    </div>
                    <Badge variant="secondary">{audio.category}</Badge>
                  </div>
                </CardHeader>

                {/* Body + Footer */}
                <CardContent className="flex flex-col flex-1">
                  {/* Body */}
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {audio.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <Headphones className="h-3 w-3" />
                      {audio.listens} listens
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {audio.rating}
                    </div>
                  </div>

                  {/* Footer — pinned at bottom */}
                  <div className="mt-auto pt-4">
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => handlePlayAudio(audio)}>
                      <Headphones className="mr-2 h-3 w-3" />
                      Listen Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="journals" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {resources.journals.map((journal, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-shadow flex flex-col h-full">
                {/* Header */}
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{journal.title}</CardTitle>
                      <CardDescription>{journal.journal}</CardDescription>
                    </div>
                    <Badge variant="secondary">{journal.category}</Badge>
                  </div>
                </CardHeader>

                {/* Body + Footer */}
                <CardContent className="flex flex-col flex-1">
                  {/* Body */}
                  <div className="text-sm text-muted-foreground line-clamp-3">
                    {journal.content}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mt-3">
                    <div>Published: {journal.date}</div>
                    <div>Pages: {journal.pages}</div>
                    <div>Citations: {journal.citations}</div>
                  </div>

                  {/* Footer — pinned at bottom */}
                  <div className="mt-auto pt-4 flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleReadJournal(journal)}>
                      <BookOpen className="mr-2 h-3 w-3" />
                      Read
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadJournal(journal)}>
                      <Download className="mr-2 h-3 w-3" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
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

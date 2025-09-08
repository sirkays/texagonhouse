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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {
  FileText,
  Video,
  Headphones,
  BookOpen,
  Download,
  Search,
  Star,
  Clock,
  Eye,
  Edit,
  Trash2,
  Share,
  MoreHorizontal,
  Plus,
  Upload,
  File,
  X,
  Play,
  Pause,
  Volume2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  uploadDate: string;
  isPublic: boolean;
}

interface PDFResource extends Resource {
  author: string;
  pages: number;
  size: string;
  downloads: number;
  views: number;
  rating: number;
}

interface VideoResource extends Resource {
  instructor: string;
  duration: string;
  views: number;
  likes: number;
  rating: number;
}

interface AudioResource extends Resource {
  speaker: string;
  duration: string;
  listens: number;
  rating: number;
}

interface JournalResource extends Resource {
  journal: string;
  date: string;
  pages: number;
  citations: number;
}

export function TeacherResourceManager() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("pdfs");
  const [viewingResource, setViewingResource] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(180); // 3 minutes for demo
  const [currentPage, setCurrentPage] = useState(1);
  const resourcesPerPage = 3;

  const [newResource, setNewResource] = useState({
    title: "",
    description: "",
    category: "",
    type: "pdf",
    file: null as File | null,
  });

  const resources = {
    pdfs: [
      {
        id: "1",
        title: "React Complete Guide 2024",
        description:
          "Comprehensive guide covering all React concepts from basics to advanced",
        author: "You",
        pages: 245,
        size: "12.5 MB",
        downloads: 1250,
        views: 3400,
        rating: 4.8,
        category: "Frontend",
        uploadDate: "2024-01-15",
        isPublic: true,
      },
      {
        id: "2",
        title: "Python Data Structures Handbook",
        description:
          "In-depth exploration of Python data structures with practical examples",
        author: "You",
        pages: 180,
        size: "8.2 MB",
        downloads: 890,
        views: 2100,
        rating: 4.6,
        category: "Programming",
        uploadDate: "2024-01-10",
        isPublic: false,
      },
      {
        id: "3",
        title: "Machine Learning Fundamentals",
        description: "Essential concepts and algorithms in machine learning",
        author: "You",
        pages: 320,
        size: "18.7 MB",
        downloads: 2100,
        views: 5600,
        rating: 4.9,
        category: "AI/ML",
        uploadDate: "2024-01-05",
        isPublic: true,
      },
    ] as PDFResource[],
    videos: [
      {
        id: "1",
        title: "Advanced React Patterns Masterclass",
        description:
          "Learn advanced React patterns including render props, HOCs, and compound components",
        instructor: "You",
        duration: "2h 45m",
        views: 15600,
        likes: 1200,
        rating: 4.7,
        category: "Frontend",
        uploadDate: "2024-01-20",
        isPublic: true,
      },
      {
        id: "2",
        title: "Python Web Scraping Complete Course",
        description:
          "Master web scraping with Python using BeautifulSoup and Scrapy",
        instructor: "You",
        duration: "1h 30m",
        views: 8900,
        likes: 650,
        rating: 4.5,
        category: "Python",
        uploadDate: "2024-01-18",
        isPublic: true,
      },
      {
        id: "3",
        title: "Database Design Principles",
        description:
          "Learn how to design efficient and scalable database schemas",
        instructor: "You",
        duration: "3h 15m",
        views: 12300,
        likes: 980,
        rating: 4.8,
        category: "Database",
        uploadDate: "2024-01-12",
        isPublic: false,
      },
    ] as VideoResource[],
    audio: [
      {
        id: "1",
        title: "Tech Career Development Podcast Series",
        description:
          "Expert insights on building a successful career in technology",
        speaker: "You",
        duration: "45m",
        listens: 5600,
        rating: 4.4,
        category: "Career",
        uploadDate: "2024-01-25",
        isPublic: true,
      },
      {
        id: "2",
        title: "JavaScript Deep Dive Audio Course",
        description: "Advanced JavaScript concepts explained in detail",
        speaker: "You",
        duration: "1h 20m",
        listens: 8900,
        rating: 4.6,
        category: "Programming",
        uploadDate: "2024-01-22",
        isPublic: true,
      },
    ] as AudioResource[],
    journals: [
      {
        id: "1",
        title: "Modern JavaScript Development Best Practices",
        description:
          "A comprehensive study of current JavaScript development methodologies",
        journal: "Tech Education Quarterly",
        date: "Dec 2024",
        pages: 15,
        citations: 45,
        category: "Research",
        uploadDate: "2024-01-01",
        isPublic: true,
      },
      {
        id: "2",
        title: "AI in Educational Technology",
        description:
          "Exploring the impact of artificial intelligence on modern education",
        journal: "EdTech Innovation Review",
        date: "Nov 2024",
        pages: 22,
        citations: 78,
        category: "AI/ML",
        uploadDate: "2024-01-01",
        isPublic: false,
      },
    ] as JournalResource[],
  };

  const categories = [
    "All",
    "Frontend",
    "Backend",
    "AI/ML",
    "Database",
    "Programming",
    "Career",
    "Research",
  ];

  // Filter resources based on search and category
  const getFilteredResources = (resourceList: any[]) => {
    return resourceList.filter((resource) => {
      const matchesSearch =
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        resource.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" || resource.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  };

  // Pagination logic for each tab
  const getPaginatedResources = (resourceList: any[]) => {
    const filteredResources = getFilteredResources(resourceList);
    const totalPages = Math.ceil(filteredResources.length / resourcesPerPage);
    const indexOfLastResource = currentPage * resourcesPerPage;
    const indexOfFirstResource = indexOfLastResource - resourcesPerPage;
    return {
      paginatedResources: filteredResources.slice(
        indexOfFirstResource,
        indexOfLastResource
      ),
      totalPages,
      filteredCount: filteredResources.length,
    };
  };

  const handleEdit = (resourceType: string, resource: any) => {
    setEditingResource({...resource, type: resourceType});
    setIsEditDialogOpen(true);
  };

  const handleView = (resourceType: string, resource: any) => {
    setViewingResource({...resource, type: resourceType});
    setIsViewDialogOpen(true);
  };

  const handleDelete = (resourceType: string, id: string) => {
    console.log(`Delete ${resourceType} with id: ${id}`);
    // Implement delete logic here
  };

  const handleShare = (resourceType: string, id: string) => {
    console.log(`Share ${resourceType} with id: ${id}`);
    // Implement share logic here
  };

  const togglePublic = (resourceType: string, id: string) => {
    console.log(`Toggle public status for ${resourceType} with id: ${id}`);
    // Implement toggle logic here
  };

  const handleAddResource = () => {
    if (!newResource.file) {
      alert("Please select a file to upload");
      return;
    }

    // Create object URL for preview
    const fileUrl = URL.createObjectURL(newResource.file);

    const resourceData = {
      id: Date.now().toString(),
      title: newResource.title,
      description: newResource.description,
      category: newResource.category,
      uploadDate: new Date().toISOString().split("T")[0],
      isPublic: false,
      fileUrl: fileUrl,
      originalFile: newResource.file,
    };

    // Add type-specific properties
    if (newResource.type === "pdf") {
      Object.assign(resourceData, {
        author: "You",
        pages: Math.floor(Math.random() * 200) + 50,
        size: formatFileSize(newResource.file.size),
        downloads: 0,
        views: 0,
        rating: 0,
      });
    } else if (newResource.type === "video") {
      Object.assign(resourceData, {
        instructor: "You",
        duration: "Unknown",
        views: 0,
        likes: 0,
        rating: 0,
      });
    } else if (newResource.type === "audio") {
      Object.assign(resourceData, {
        speaker: "You",
        duration: "Unknown",
        listens: 0,
        rating: 0,
      });
    } else if (newResource.type === "journal") {
      Object.assign(resourceData, {
        journal: "Your Journal",
        date: new Date().toLocaleDateString(),
        pages: Math.floor(Math.random() * 20) + 5,
        citations: 0,
      });
    }

    console.log("Adding new resource:", resourceData);
    // Here you would typically upload to your backend

    setIsAddResourceOpen(false);
    setNewResource({
      title: "",
      description: "",
      category: "",
      type: "pdf",
      file: null,
    });
    alert("Resource uploaded successfully!");
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  const handleSaveEdit = () => {
    console.log("Saving edited resource:", editingResource);
    setIsEditDialogOpen(false);
    setEditingResource(null);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4 p-3 xs:p-4 sm:p-6 max-w-full mx-auto">
      <div>
        <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold">
          Resource Manager
        </h1>
        <p className="text-muted-foreground text-xs xs:text-sm sm:text-base">
          Manage and organize all your teaching resources
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col xs:flex-row gap-2 xs:gap-3 sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 xs:left-2.5 top-2 xs:top-2.5 h-3 w-3 xs:h-4 xs:w-4 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-7 xs:pl-8 text-xs xs:text-sm sm:text-base"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full xs:w-40 sm:w-48 text-xs xs:text-sm sm:text-base">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem
                key={category}
                value={category}
                className="text-xs xs:text-sm sm:text-base">
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Dialog open={isAddResourceOpen} onOpenChange={setIsAddResourceOpen}>
          <DialogTrigger asChild>
            <Button className="text-xs xs:text-sm sm:text-base">
              <Plus className="mr-1 xs:mr-2 h-3 w-3 xs:h-4 xs:w-4" />
              Add Resource
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[90vw] sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base xs:text-lg sm:text-xl">
                Add New Resource
              </DialogTitle>
              <DialogDescription className="text-xs xs:text-sm sm:text-base">
                Upload a new resource for your students
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 xs:space-y-4">
              <div className="space-y-2">
                <Label className="text-xs xs:text-sm sm:text-base">
                  Resource Type
                </Label>
                <Select
                  value={newResource.type}
                  onValueChange={(value) =>
                    setNewResource({...newResource, type: value, file: null})
                  }>
                  <SelectTrigger className="text-xs xs:text-sm sm:text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value="pdf"
                      className="text-xs xs:text-sm sm:text-base">
                      PDF Document
                    </SelectItem>
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
                      value="journal"
                      className="text-xs xs:text-sm sm:text-base">
                      Journal
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs xs:text-sm sm:text-base">
                  Upload File
                </Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 xs:p-6 text-center">
                  <input
                    type="file"
                    id="resource-file"
                    className="hidden"
                    accept={
                      newResource.type === "pdf"
                        ? ".pdf"
                        : newResource.type === "video"
                        ? ".mp4,.mov,.avi,.mkv"
                        : newResource.type === "audio"
                        ? ".mp3,.wav,.m4a"
                        : ".pdf,.doc,.docx"
                    }
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setNewResource({
                          ...newResource,
                          file,
                          title: newResource.title || file.name.split(".")[0],
                        });
                      }
                    }}
                  />
                  <label htmlFor="resource-file" className="cursor-pointer">
                    <Upload className="mx-auto h-6 w-6 xs:h-8 xs:w-8 text-muted-foreground mb-2" />
                    <p className="text-xs xs:text-sm sm:text-base font-medium">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
                      {newResource.type === "pdf" && "PDF files only"}
                      {newResource.type === "video" &&
                        "MP4, MOV, AVI, MKV files"}
                      {newResource.type === "audio" && "MP3, WAV, M4A files"}
                      {newResource.type === "journal" && "PDF, DOC, DOCX files"}
                    </p>
                  </label>
                  {newResource.file && (
                    <div className="mt-2 p-2 bg-muted rounded flex items-center gap-2">
                      <File className="h-3 w-3 xs:h-4 xs:w-4" />
                      <span className="text-[0.85rem] xs:text-xs sm:text-sm">
                        {newResource.file.name}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setNewResource({...newResource, file: null})
                        }
                        className="p-1 xs:p-2">
                        <X className="h-2.5 w-2.5 xs:h-3 xs:w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs xs:text-sm sm:text-base">Title</Label>
                <Input
                  value={newResource.title}
                  onChange={(e) =>
                    setNewResource({...newResource, title: e.target.value})
                  }
                  placeholder="Enter resource title"
                  className="text-xs xs:text-sm sm:text-base"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs xs:text-sm sm:text-base">
                  Category
                </Label>
                <Select
                  value={newResource.category}
                  onValueChange={(value) =>
                    setNewResource({...newResource, category: value})
                  }>
                  <SelectTrigger className="text-xs xs:text-sm sm:text-base">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter((c) => c !== "All")
                      .map((category) => (
                        <SelectItem
                          key={category}
                          value={category}
                          className="text-xs xs:text-sm sm:text-base">
                          {category}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs xs:text-sm sm:text-base">
                  Description
                </Label>
                <Textarea
                  value={newResource.description}
                  onChange={(e) =>
                    setNewResource({
                      ...newResource,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe the resource"
                  rows={3}
                  className="text-xs xs:text-sm sm:text-base"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddResourceOpen(false)}
                className="text-xs xs:text-sm sm:text-base">
                Cancel
              </Button>
              <Button
                onClick={handleAddResource}
                disabled={!newResource.file || !newResource.title}
                className="text-xs xs:text-sm sm:text-base">
                Upload Resource
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value);
          setCurrentPage(1);
        }}
        className="w-full">
        <TabsList
          className="
    grid grid-cols-2 xs:grid-cols-4 gap-2
    sm:flex sm:justify-start sm:gap-4
    w-full
  ">
          <TabsTrigger
            value="pdfs"
            className="flex items-center gap-1 xs:gap-2 flex-1 sm:flex-none 
               text-[0.85rem] xs:text-xs sm:text-sm md:text-base">
            <FileText className="h-3 w-3 xs:h-4 xs:w-4 md:h-5 md:w-5" />
            PDFs ({getFilteredResources(resources.pdfs).length})
          </TabsTrigger>

          <TabsTrigger
            value="videos"
            className="flex items-center gap-1 xs:gap-2 flex-1 sm:flex-none 
               text-[0.85rem] xs:text-xs sm:text-sm md:text-base">
            <Video className="h-3 w-3 xs:h-4 xs:w-4 md:h-5 md:w-5" />
            Videos ({getFilteredResources(resources.videos).length})
          </TabsTrigger>

          <TabsTrigger
            value="audio"
            className="flex items-center gap-1 xs:gap-2 flex-1 sm:flex-none 
               text-[0.85rem] xs:text-xs sm:text-sm md:text-base">
            <Headphones className="h-3 w-3 xs:h-4 xs:w-4 md:h-5 md:w-5" />
            Audio ({getFilteredResources(resources.audio).length})
          </TabsTrigger>

          <TabsTrigger
            value="journals"
            className="flex items-center gap-1 xs:gap-2 flex-1 sm:flex-none 
               text-[0.85rem] xs:text-xs sm:text-sm md:text-base">
            <BookOpen className="h-3 w-3 xs:h-4 xs:w-4 md:h-5 md:w-5" />
            Journals ({getFilteredResources(resources.journals).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pdfs" className="space-y-3 xs:space-y-4">
          <div className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
            Showing{" "}
            {getPaginatedResources(resources.pdfs).paginatedResources.length} of{" "}
            {getPaginatedResources(resources.pdfs).filteredCount} PDFs
          </div>
          <div className="grid gap-3 xs:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {getPaginatedResources(resources.pdfs).paginatedResources.map(
              (pdf) => (
                <Card
                  key={pdf.id}
                  className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-sm xs:text-base sm:text-lg line-clamp-2">
                          {pdf.title}
                        </CardTitle>
                        <CardDescription className="text-[0.85rem] xs:text-xs sm:text-sm line-clamp-2">
                          {pdf.description}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1 xs:p-2">
                            <MoreHorizontal className="h-3 w-3 xs:h-4 xs:w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() => handleEdit("pdf", pdf)}
                            className="text-xs xs:text-sm sm:text-base">
                            <Edit className="mr-2 h-3 w-3 xs:h-4 xs:w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleShare("pdf", pdf.id)}
                            className="text-xs xs:text-sm sm:text-base">
                            <Share className="mr-2 h-3 w-3 xs:h-4 xs:w-4" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => togglePublic("pdf", pdf.id)}
                            className="text-xs xs:text-sm sm:text-base">
                            <Eye className="mr-2 h-3 w-3 xs:h-4 xs:w-4" />
                            {pdf.isPublic ? "Make Private" : "Make Public"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete("pdf", pdf.id)}
                            className="text-red-600 text-xs xs:text-sm sm:text-base">
                            <Trash2 className="mr-2 h-3 w-3 xs:h-4 xs:w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="text-[0.85rem] xs:text-xs sm:text-sm">
                        {pdf.category}
                      </Badge>
                      <Badge
                        variant={pdf.isPublic ? "default" : "outline"}
                        className="text-[0.85rem] xs:text-xs sm:text-sm">
                        {pdf.isPublic ? "Public" : "Private"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 xs:space-y-4">
                    <div className="grid grid-cols-2 gap-3 xs:gap-4 text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
                      <div>Pages: {pdf.pages}</div>
                      <div>Size: {pdf.size}</div>
                      <div className="flex items-center gap-1">
                        <Download className="h-2.5 w-2.5 xs:h-3 xs:w-3" />
                        {pdf.downloads}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-2.5 w-2.5 xs:h-3 xs:w-3" />
                        {pdf.views}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="h-2.5 w-2.5 xs:h-3 xs:w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-[0.85rem] xs:text-xs sm:text-sm">
                          {pdf.rating}
                        </span>
                      </div>
                      <span className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs text-muted-foreground">
                        {pdf.uploadDate}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 text-xs xs:text-sm sm:text-base"
                        onClick={() => handleView("pdf", pdf)}>
                        <Eye className="mr-1 xs:mr-2 h-2.5 w-2.5 xs:h-3 xs:w-3" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs xs:text-sm sm:text-base"
                        onClick={() => handleEdit("pdf", pdf)}>
                        <Edit className="mr-1 xs:mr-2 h-2.5 w-2.5 xs:h-3 xs:w-3" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </div>
          {getPaginatedResources(resources.pdfs).filteredCount === 0 ? (
            <div className="text-center py-8 xs:py-12">
              <Search className="mx-auto h-8 w-8 xs:h-12 xs:w-12 text-muted-foreground mb-3 xs:mb-4" />
              <h3 className="text-base xs:text-lg sm:text-xl font-medium mb-2">
                No PDFs found
              </h3>
              <p className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationPrevious
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  className={
                    currentPage === 1 ? "pointer-events-none opacity-50" : ""
                  }
                />
                {Array.from(
                  {length: getPaginatedResources(resources.pdfs).totalPages},
                  (_, index) => index + 1
                ).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      isActive={currentPage === page}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(page);
                      }}>
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                {getPaginatedResources(resources.pdfs).totalPages > 5 && (
                  <PaginationEllipsis />
                )}
                <PaginationNext
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(
                        prev + 1,
                        getPaginatedResources(resources.pdfs).totalPages
                      )
                    )
                  }
                  className={
                    currentPage ===
                    getPaginatedResources(resources.pdfs).totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationContent>
            </Pagination>
          )}
        </TabsContent>

        <TabsContent value="videos" className="space-y-3 xs:space-y-4">
          <div className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
            Showing{" "}
            {getPaginatedResources(resources.videos).paginatedResources.length}{" "}
            of {getPaginatedResources(resources.videos).filteredCount} Videos
          </div>
          <div className="grid gap-3 xs:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {getPaginatedResources(resources.videos).paginatedResources.map(
              (video) => (
                <Card
                  key={video.id}
                  className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="aspect-video bg-muted rounded-md mb-2 xs:mb-3 flex items-center justify-center">
                      <Video className="h-6 w-6 xs:h-8 xs:w-8 text-muted-foreground" />
                    </div>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-sm xs:text-base sm:text-lg line-clamp-2">
                          {video.title}
                        </CardTitle>
                        <CardDescription className="text-[0.85rem] xs:text-xs sm:text-sm line-clamp-2">
                          {video.description}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1 xs:p-2">
                            <MoreHorizontal className="h-3 w-3 xs:h-4 xs:w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() => handleEdit("video", video)}
                            className="text-xs xs:text-sm sm:text-base">
                            <Edit className="mr-2 h-3 w-3 xs:h-4 xs:w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleShare("video", video.id)}
                            className="text-xs xs:text-sm sm:text-base">
                            <Share className="mr-2 h-3 w-3 xs:h-4 xs:w-4" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => togglePublic("video", video.id)}
                            className="text-xs xs:text-sm sm:text-base">
                            <Eye className="mr-2 h-3 w-3 xs:h-4 xs:w-4" />
                            {video.isPublic ? "Make Private" : "Make Public"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete("video", video.id)}
                            className="text-red-600 text-xs xs:text-sm sm:text-base">
                            <Trash2 className="mr-2 h-3 w-3 xs:h-4 xs:w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="text-[0.85rem] xs:text-xs sm:text-sm">
                        {video.category}
                      </Badge>
                      <Badge
                        variant={video.isPublic ? "default" : "outline"}
                        className="text-[0.85rem] xs:text-xs sm:text-sm">
                        {video.isPublic ? "Public" : "Private"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 xs:space-y-4">
                    <div className="grid grid-cols-2 gap-3 xs:gap-4 text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5 xs:h-3 xs:w-3" />
                        {video.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-2.5 w-2.5 xs:h-3 xs:w-3" />
                        {video.views} views
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-2.5 w-2.5 xs:h-3 xs:w-3 fill-yellow-400 text-yellow-400" />
                        {video.rating}
                      </div>
                      <div>{video.likes} likes</div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 text-xs xs:text-sm sm:text-base"
                        onClick={() => handleView("video", video)}>
                        <Video className="mr-1 xs:mr-2 h-2.5 w-2.5 xs:h-3 xs:w-3" />
                        Watch
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs xs:text-sm sm:text-base"
                        onClick={() => handleEdit("video", video)}>
                        <Edit className="mr-1 xs:mr-2 h-2.5 w-2.5 xs:h-3 xs:w-3" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </div>
          {getPaginatedResources(resources.videos).filteredCount === 0 ? (
            <div className="text-center py-8 xs:py-12">
              <Search className="mx-auto h-8 w-8 xs:h-12 xs:w-12 text-muted-foreground mb-3 xs:mb-4" />
              <h3 className="text-base xs:text-lg sm:text-xl font-medium mb-2">
                No Videos found
              </h3>
              <p className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationPrevious
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  className={
                    currentPage === 1 ? "pointer-events-none opacity-50" : ""
                  }
                />
                {Array.from(
                  {length: getPaginatedResources(resources.videos).totalPages},
                  (_, index) => index + 1
                ).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      isActive={currentPage === page}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(page);
                      }}>
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                {getPaginatedResources(resources.videos).totalPages > 5 && (
                  <PaginationEllipsis />
                )}
                <PaginationNext
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(
                        prev + 1,
                        getPaginatedResources(resources.videos).totalPages
                      )
                    )
                  }
                  className={
                    currentPage ===
                    getPaginatedResources(resources.videos).totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationContent>
            </Pagination>
          )}
        </TabsContent>

        <TabsContent value="audio" className="space-y-3 xs:space-y-4">
          <div className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
            Showing{" "}
            {getPaginatedResources(resources.audio).paginatedResources.length}{" "}
            of {getPaginatedResources(resources.audio).filteredCount} Audio
          </div>
          <div className="grid gap-3 xs:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {getPaginatedResources(resources.audio).paginatedResources.map(
              (audio) => (
                <Card
                  key={audio.id}
                  className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-sm xs:text-base sm:text-lg line-clamp-2">
                          {audio.title}
                        </CardTitle>
                        <CardDescription className="text-[0.85rem] xs:text-xs sm:text-sm line-clamp-2">
                          {audio.description}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1 xs:p-2">
                            <MoreHorizontal className="h-3 w-3 xs:h-4 xs:w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() => handleEdit("audio", audio)}
                            className="text-xs xs:text-sm sm:text-base">
                            <Edit className="mr-2 h-3 w-3 xs:h-4 xs:w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleShare("audio", audio.id)}
                            className="text-xs xs:text-sm sm:text-base">
                            <Share className="mr-2 h-3 w-3 xs:h-4 xs:w-4" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => togglePublic("audio", audio.id)}
                            className="text-xs xs:text-sm sm:text-base">
                            <Eye className="mr-2 h-3 w-3 xs:h-4 xs:w-4" />
                            {audio.isPublic ? "Make Private" : "Make Public"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete("audio", audio.id)}
                            className="text-red-600 text-xs xs:text-sm sm:text-base">
                            <Trash2 className="mr-2 h-3 w-3 xs:h-4 xs:w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="text-[0.85rem] xs:text-xs sm:text-sm">
                        {audio.category}
                      </Badge>
                      <Badge
                        variant={audio.isPublic ? "default" : "outline"}
                        className="text-[0.85rem] xs:text-xs sm:text-sm">
                        {audio.isPublic ? "Public" : "Private"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 xs:space-y-4">
                    <div className="grid grid-cols-2 gap-3 xs:gap-4 text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5 xs:h-3 xs:w-3" />
                        {audio.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <Headphones className="h-2.5 w-2.5 xs:h-3 xs:w-3" />
                        {audio.listens} listens
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-2.5 w-2.5 xs:h-3 xs:w-3 fill-yellow-400 text-yellow-400" />
                        {audio.rating}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 text-xs xs:text-sm sm:text-base"
                        onClick={() => handleView("audio", audio)}>
                        <Headphones className="mr-1 xs:mr-2 h-2.5 w-2.5 xs:h-3 xs:w-3" />
                        Listen
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs xs:text-sm sm:text-base"
                        onClick={() => handleEdit("audio", audio)}>
                        <Edit className="mr-1 xs:mr-2 h-2.5 w-2.5 xs:h-3 xs:w-3" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </div>
          {getPaginatedResources(resources.audio).filteredCount === 0 ? (
            <div className="text-center py-8 xs:py-12">
              <Search className="mx-auto h-8 w-8 xs:h-12 xs:w-12 text-muted-foreground mb-3 xs:mb-4" />
              <h3 className="text-base xs:text-lg sm:text-xl font-medium mb-2">
                No Audio found
              </h3>
              <p className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationPrevious
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  className={
                    currentPage === 1 ? "pointer-events-none opacity-50" : ""
                  }
                />
                {Array.from(
                  {length: getPaginatedResources(resources.audio).totalPages},
                  (_, index) => index + 1
                ).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      isActive={currentPage === page}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(page);
                      }}>
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                {getPaginatedResources(resources.audio).totalPages > 5 && (
                  <PaginationEllipsis />
                )}
                <PaginationNext
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(
                        prev + 1,
                        getPaginatedResources(resources.audio).totalPages
                      )
                    )
                  }
                  className={
                    currentPage ===
                    getPaginatedResources(resources.audio).totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationContent>
            </Pagination>
          )}
        </TabsContent>

        <TabsContent value="journals" className="space-y-3 xs:space-y-4">
          <div className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
            Showing{" "}
            {
              getPaginatedResources(resources.journals).paginatedResources
                .length
            }{" "}
            of {getPaginatedResources(resources.journals).filteredCount}{" "}
            Journals
          </div>
          <div className="grid gap-3 xs:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {getPaginatedResources(resources.journals).paginatedResources.map(
              (journal) => (
                <Card
                  key={journal.id}
                  className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-sm xs:text-base sm:text-lg line-clamp-2">
                          {journal.title}
                        </CardTitle>
                        <CardDescription className="text-[0.85rem] xs:text-xs sm:text-sm line-clamp-2">
                          {journal.description}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1 xs:p-2">
                            <MoreHorizontal className="h-3 w-3 xs:h-4 xs:w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() => handleEdit("journal", journal)}
                            className="text-xs xs:text-sm sm:text-base">
                            <Edit className="mr-2 h-3 w-3 xs:h-4 xs:w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleShare("journal", journal.id)}
                            className="text-xs xs:text-sm sm:text-base">
                            <Share className="mr-2 h-3 w-3 xs:h-4 xs:w-4" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => togglePublic("journal", journal.id)}
                            className="text-xs xs:text-sm sm:text-base">
                            <Eye className="mr-2 h-3 w-3 xs:h-4 xs:w-4" />
                            {journal.isPublic ? "Make Private" : "Make Public"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete("journal", journal.id)}
                            className="text-red-600 text-xs xs:text-sm sm:text-base">
                            <Trash2 className="mr-2 h-3 w-3 xs:h-4 xs:w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="text-[0.85rem] xs:text-xs sm:text-sm">
                        {journal.category}
                      </Badge>
                      <Badge
                        variant={journal.isPublic ? "default" : "outline"}
                        className="text-[0.85rem] xs:text-xs sm:text-sm">
                        {journal.isPublic ? "Public" : "Private"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 xs:space-y-4">
                    <div className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
                      <p>
                        <strong>Journal:</strong> {journal.journal}
                      </p>
                      <p>
                        <strong>Published:</strong> {journal.date}
                      </p>
                      <p>
                        <strong>Pages:</strong> {journal.pages}
                      </p>
                      <p>
                        <strong>Citations:</strong> {journal.citations}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 text-xs xs:text-sm sm:text-base"
                        onClick={() => handleView("journal", journal)}>
                        <BookOpen className="mr-1 xs:mr-2 h-2.5 w-2.5 xs:h-3 xs:w-3" />
                        Read
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs xs:text-sm sm:text-base"
                        onClick={() => handleEdit("journal", journal)}>
                        <Edit className="mr-1 xs:mr-2 h-2.5 w-2.5 xs:h-3 xs:w-3" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </div>
          {getPaginatedResources(resources.journals).filteredCount === 0 ? (
            <div className="text-center py-8 xs:py-12">
              <Search className="mx-auto h-8 w-8 xs:h-12 xs:w-12 text-muted-foreground mb-3 xs:mb-4" />
              <h3 className="text-base xs:text-lg sm:text-xl font-medium mb-2">
                No Journals found
              </h3>
              <p className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationPrevious
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  className={
                    currentPage === 1 ? "pointer-events-none opacity-50" : ""
                  }
                />
                {Array.from(
                  {
                    length: getPaginatedResources(resources.journals)
                      .totalPages,
                  },
                  (_, index) => index + 1
                ).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      isActive={currentPage === page}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(page);
                      }}>
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                {getPaginatedResources(resources.journals).totalPages > 5 && (
                  <PaginationEllipsis />
                )}
                <PaginationNext
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(
                        prev + 1,
                        getPaginatedResources(resources.journals).totalPages
                      )
                    )
                  }
                  className={
                    currentPage ===
                    getPaginatedResources(resources.journals).totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationContent>
            </Pagination>
          )}
        </TabsContent>
      </Tabs>

      {/* View Resource Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base xs:text-lg sm:text-xl">
              {viewingResource?.type === "pdf" && (
                <FileText className="h-4 w-4 xs:h-5 xs:w-5" />
              )}
              {viewingResource?.type === "video" && (
                <Video className="h-4 w-4 xs:h-5 xs:w-5" />
              )}
              {viewingResource?.type === "audio" && (
                <Headphones className="h-4 w-4 xs:h-5 xs:w-5" />
              )}
              {viewingResource?.type === "journal" && (
                <BookOpen className="h-4 w-4 xs:h-5 xs:w-5" />
              )}
              {viewingResource?.title}
            </DialogTitle>
            <DialogDescription className="text-xs xs:text-sm sm:text-base">
              {viewingResource?.description}
            </DialogDescription>
          </DialogHeader>

          {viewingResource && (
            <div className="space-y-3 xs:space-y-4">
              {/* PDF Viewer */}
              {viewingResource.type === "pdf" && (
                <div className="space-y-3 xs:space-y-4">
                  <div className="aspect-[4/3] bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <FileText className="h-12 w-12 xs:h-16 xs:w-16 text-muted-foreground mx-auto mb-3 xs:mb-4" />
                      <p className="text-base xs:text-lg sm:text-xl font-medium">
                        PDF Viewer
                      </p>
                      <p className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
                        {viewingResource.pages} pages • {viewingResource.size}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 xs:gap-3">
                    <div className="flex flex-wrap gap-2 xs:gap-4 text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
                      <span>Author: {viewingResource.author}</span>
                      <span>Downloads: {viewingResource.downloads}</span>
                      <span>Views: {viewingResource.views}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 xs:h-4 xs:w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-[0.85rem] xs:text-xs sm:text-sm">
                        {viewingResource.rating}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Video Player */}
              {viewingResource.type === "video" && (
                <div className="space-y-3 xs:space-y-4">
                  <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                    <div className="text-center text-white">
                      <Video className="h-12 w-12 xs:h-16 xs:w-16 mx-auto mb-3 xs:mb-4" />
                      <p className="text-base xs:text-lg sm:text-xl font-medium">
                        Video Player
                      </p>
                      <p className="text-[0.85rem] xs:text-xs sm:text-sm opacity-75">
                        Duration: {viewingResource.duration}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 xs:gap-3">
                    <div className="flex flex-wrap gap-2 xs:gap-4 text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
                      <span>Instructor: {viewingResource.instructor}</span>
                      <span>Views: {viewingResource.views}</span>
                      <span>Likes: {viewingResource.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 xs:h-4 xs:w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-[0.85rem] xs:text-xs sm:text-sm">
                        {viewingResource.rating}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Audio Player */}
              {viewingResource.type === "audio" && (
                <div className="space-y-3 xs:space-y-4">
                  <div className="bg-muted rounded-lg p-4 xs:p-6 sm:p-8">
                    <div className="text-center mb-4 xs:mb-6">
                      <Headphones className="h-12 w-12 xs:h-16 xs:w-16 text-muted-foreground mx-auto mb-3 xs:mb-4" />
                      <p className="text-base xs:text-lg sm:text-xl font-medium">
                        {viewingResource.title}
                      </p>
                      <p className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
                        Duration: {viewingResource.duration}
                      </p>
                    </div>

                    {/* Audio Controls */}
                    <div className="space-y-3 xs:space-y-4">
                      <div className="flex items-center justify-center gap-2 xs:gap-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={togglePlayPause}
                          className="p-1 xs:p-2">
                          {isPlaying ? (
                            <Pause className="h-3 w-3 xs:h-4 xs:w-4" />
                          ) : (
                            <Play className="h-3 w-3 xs:h-4 xs:w-4" />
                          )}
                        </Button>
                        <div className="flex items-center gap-1 xs:gap-2">
                          <Volume2 className="h-3 w-3 xs:h-4 xs:w-4" />
                          <div className="w-16 xs:w-20 h-1.5 xs:h-2 bg-muted-foreground/20 rounded-full">
                            <div className="w-3/4 h-full bg-primary rounded-full" />
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="w-full h-1.5 xs:h-2 bg-muted-foreground/20 rounded-full">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-300"
                            style={{
                              width: `${(currentTime / duration) * 100}%`,
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-[0.6rem] xs:text-[0.65rem] sm:text-xs text-muted-foreground">
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(duration)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 xs:gap-3">
                    <div className="flex flex-wrap gap-2 xs:gap-4 text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
                      <span>Speaker: {viewingResource.speaker}</span>
                      <span>Listens: {viewingResource.listens}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 xs:h-4 xs:w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-[0.85rem] xs:text-xs sm:text-sm">
                        {viewingResource.rating}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Journal Reader */}
              {viewingResource.type === "journal" && (
                <div className="space-y-3 xs:space-y-4">
                  <div className="bg-muted rounded-lg p-4 xs:p-6">
                    <div className="prose max-w-none">
                      <h3 className="text-base xs:text-lg sm:text-xl font-bold mb-3 xs:mb-4">
                        {" "}
                        {viewingResource.title}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xs:gap-4 mb-4 xs:mb-6 text-[0.85rem] xs:text-xs sm:text-sm">
                        <div>
                          <strong>Journal:</strong> {viewingResource.journal}
                        </div>
                        <div>
                          <strong>Published:</strong> {viewingResource.date}
                        </div>
                        <div>
                          <strong>Pages:</strong> {viewingResource.pages}
                        </div>
                        <div>
                          <strong>Citations:</strong>{" "}
                          {viewingResource.citations}
                        </div>
                      </div>
                      <div className="space-y-3 xs:space-y-4 text-[0.85rem] xs:text-xs sm:text-sm leading-relaxed">
                        <p>
                          <strong>Abstract:</strong>
                        </p>
                        <p>{viewingResource.description}</p>
                        <p>
                          <strong>Introduction:</strong>
                        </p>
                        <p>
                          This research paper explores the fundamental concepts
                          and practical applications in the field. The study
                          presents comprehensive analysis and findings that
                          contribute to the current understanding of the subject
                          matter.
                        </p>
                        <p>
                          <strong>Methodology:</strong>
                        </p>
                        <p>
                          The research methodology employed a systematic
                          approach to data collection and analysis, ensuring
                          reliable and valid results that can be replicated in
                          future studies.
                        </p>
                        <p>
                          <strong>Results and Discussion:</strong>
                        </p>
                        <p>
                          The findings reveal significant insights that advance
                          our knowledge in this domain. The implications of
                          these results are discussed in detail, providing
                          valuable perspectives for practitioners and
                          researchers.
                        </p>
                        <p>
                          <strong>Conclusion:</strong>
                        </p>
                        <p>
                          This study contributes meaningful insights to the
                          field and opens avenues for future research. The
                          practical applications of these findings can benefit
                          both academic and industry professionals.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
              className="text-xs xs:text-sm sm:text-base">
              Close
            </Button>
            <Button
              onClick={() => {
                setIsViewDialogOpen(false);
                handleEdit(viewingResource?.type, viewingResource);
              }}
              className="text-xs xs:text-sm sm:text-base">
              <Edit className="mr-1 xs:mr-2 h-3 w-3 xs:h-4 xs:w-4" />
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Resource Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-base xs:text-lg sm:text-xl">
              Edit Resource
            </DialogTitle>
            <DialogDescription className="text-xs xs:text-sm sm:text-base">
              Update the details of your resource
            </DialogDescription>
          </DialogHeader>
          {editingResource && (
            <div className="space-y-3 xs:space-y-4">
              <div className="space-y-2">
                <Label className="text-xs xs:text-sm sm:text-base">Title</Label>
                <Input
                  value={editingResource.title}
                  onChange={(e) =>
                    setEditingResource({
                      ...editingResource,
                      title: e.target.value,
                    })
                  }
                  className="text-xs xs:text-sm sm:text-base"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs xs:text-sm sm:text-base">
                  Category
                </Label>
                <Select
                  value={editingResource.category}
                  onValueChange={(value) =>
                    setEditingResource({...editingResource, category: value})
                  }>
                  <SelectTrigger className="text-xs xs:text-sm sm:text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter((c) => c !== "All")
                      .map((category) => (
                        <SelectItem
                          key={category}
                          value={category}
                          className="text-xs xs:text-sm sm:text-base">
                          {category}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs xs:text-sm sm:text-base">
                  Description
                </Label>
                <Textarea
                  value={editingResource.description}
                  onChange={(e) =>
                    setEditingResource({
                      ...editingResource,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="text-xs xs:text-sm sm:text-base"
                />
              </div>

              {/* Type-specific fields */}
              {editingResource.type === "pdf" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xs:gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs xs:text-sm sm:text-base">
                      Author
                    </Label>
                    <Input
                      value={editingResource.author || ""}
                      onChange={(e) =>
                        setEditingResource({
                          ...editingResource,
                          author: e.target.value,
                        })
                      }
                      className="text-xs xs:text-sm sm:text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs xs:text-sm sm:text-base">
                      Pages
                    </Label>
                    <Input
                      type="number"
                      value={editingResource.pages || ""}
                      onChange={(e) =>
                        setEditingResource({
                          ...editingResource,
                          pages: Number.parseInt(e.target.value),
                        })
                      }
                      className="text-xs xs:text-sm sm:text-base"
                    />
                  </div>
                </div>
              )}

              {editingResource.type === "video" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xs:gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs xs:text-sm sm:text-base">
                      Instructor
                    </Label>
                    <Input
                      value={editingResource.instructor || ""}
                      onChange={(e) =>
                        setEditingResource({
                          ...editingResource,
                          instructor: e.target.value,
                        })
                      }
                      className="text-xs xs:text-sm sm:text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs xs:text-sm sm:text-base">
                      Duration
                    </Label>
                    <Input
                      value={editingResource.duration || ""}
                      onChange={(e) =>
                        setEditingResource({
                          ...editingResource,
                          duration: e.target.value,
                        })
                      }
                      className="text-xs xs:text-sm sm:text-base"
                    />
                  </div>
                </div>
              )}

              {editingResource.type === "audio" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xs:gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs xs:text-sm sm:text-base">
                      Speaker
                    </Label>
                    <Input
                      value={editingResource.speaker || ""}
                      onChange={(e) =>
                        setEditingResource({
                          ...editingResource,
                          speaker: e.target.value,
                        })
                      }
                      className="text-xs xs:text-sm sm:text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs xs:text-sm sm:text-base">
                      Duration
                    </Label>
                    <Input
                      value={editingResource.duration || ""}
                      onChange={(e) =>
                        setEditingResource({
                          ...editingResource,
                          duration: e.target.value,
                        })
                      }
                      className="text-xs xs:text-sm sm:text-base"
                    />
                  </div>
                </div>
              )}

              {editingResource.type === "journal" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xs:gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs xs:text-sm sm:text-base">
                      Journal Name
                    </Label>
                    <Input
                      value={editingResource.journal || ""}
                      onChange={(e) =>
                        setEditingResource({
                          ...editingResource,
                          journal: e.target.value,
                        })
                      }
                      className="text-xs xs:text-sm sm:text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs xs:text-sm sm:text-base">
                      Publication Date
                    </Label>
                    <Input
                      value={editingResource.date || ""}
                      onChange={(e) =>
                        setEditingResource({
                          ...editingResource,
                          date: e.target.value,
                        })
                      }
                      className="text-xs xs:text-sm sm:text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs xs:text-sm sm:text-base">
                      Pages
                    </Label>
                    <Input
                      type="number"
                      value={editingResource.pages || ""}
                      onChange={(e) =>
                        setEditingResource({
                          ...editingResource,
                          pages: Number.parseInt(e.target.value),
                        })
                      }
                      className="text-xs xs:text-sm sm:text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs xs:text-sm sm:text-base">
                      Citations
                    </Label>
                    <Input
                      type="number"
                      value={editingResource.citations || ""}
                      onChange={(e) =>
                        setEditingResource({
                          ...editingResource,
                          citations: Number.parseInt(e.target.value),
                        })
                      }
                      className="text-xs xs:text-sm sm:text-base"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="text-xs xs:text-sm sm:text-base">
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="text-xs xs:text-sm sm:text-base">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

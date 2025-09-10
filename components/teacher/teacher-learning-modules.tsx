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
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {Badge} from "@/components/ui/badge";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {
  Plus,
  Video,
  Headphones,
  FileText,
  BookOpen,
  Edit,
  Trash2,
  Eye,
  Users,
  Clock,
  Star,
  Save,
  Upload,
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

interface Module {
  id: string;
  title: string;
  description: string;
  type: "video" | "audio" | "document" | "tutorial";
  duration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  category: string;
  enrollments: number;
  rating: number;
  isPublished: boolean;
  createdDate: string;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  type: "video" | "audio" | "text" | "quiz";
  duration: string;
  content?: string;
  videoUrl?: string;
  audioUrl?: string;
}

export function TeacherLearningModules() {
  const [activeTab, setActiveTab] = useState("create");
  const [currentModule, setCurrentModule] = useState<Module>({
    id: "",
    title: "",
    description: "",
    type: "video",
    duration: "",
    difficulty: "Beginner",
    category: "",
    enrollments: 0,
    rating: 0,
    isPublished: false,
    createdDate: new Date().toISOString().split("T")[0],
    lessons: [],
  });
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [currentPageManage, setCurrentPageManage] = useState(1);
  const [currentPageAnalytics, setCurrentPageAnalytics] = useState(1);
  const modulesPerPage = 3;

  const existingModules: Module[] = [
    {
      id: "1",
      title: "React Hooks Masterclass",
      description: "Complete guide to React Hooks with practical examples",
      type: "video",
      duration: "4h 30m",
      difficulty: "Intermediate",
      category: "Frontend",
      enrollments: 1250,
      rating: 4.8,
      isPublished: true,
      createdDate: "2024-01-15",
      lessons: [],
    },
    {
      id: "2",
      title: "Python for Data Science",
      description:
        "Learn Python programming for data analysis and visualization",
      type: "video",
      duration: "6h 15m",
      difficulty: "Beginner",
      category: "Programming",
      enrollments: 2560,
      rating: 4.9,
      isPublished: true,
      createdDate: "2024-01-10",
      lessons: [],
    },
    {
      id: "3",
      title: "Advanced JavaScript Concepts",
      description: "Deep dive into advanced JavaScript topics and patterns",
      type: "video",
      duration: "5h 45m",
      difficulty: "Advanced",
      category: "Programming",
      enrollments: 890,
      rating: 4.7,
      isPublished: false,
      createdDate: "2024-01-05",
      lessons: [],
    },
  ];

  // Pagination logic
  const getPaginatedModules = (modules: Module[], currentPage: number) => {
    const totalPages = Math.ceil(modules.length / modulesPerPage);
    const indexOfLastModule = currentPage * modulesPerPage;
    const indexOfFirstModule = indexOfLastModule - modulesPerPage;
    return {
      paginatedModules: modules.slice(indexOfFirstModule, indexOfLastModule),
      totalPages,
      totalCount: modules.length,
    };
  };

  const addLesson = () => {
    const newLesson: Lesson = {
      id: Date.now().toString(),
      title: "",
      type: "video",
      duration: "",
    };
    setCurrentModule((prev) => ({
      ...prev,
      lessons: [...prev.lessons, newLesson],
    }));
    setEditingLesson(newLesson);
  };

  const updateLesson = (lessonId: string, updates: Partial<Lesson>) => {
    setCurrentModule((prev) => ({
      ...prev,
      lessons: prev.lessons.map((lesson) =>
        lesson.id === lessonId ? {...lesson, ...updates} : lesson
      ),
    }));
    if (editingLesson?.id === lessonId) {
      setEditingLesson((prev) => (prev ? {...prev, ...updates} : null));
    }
  };

  const deleteLesson = (lessonId: string) => {
    setCurrentModule((prev) => ({
      ...prev,
      lessons: prev.lessons.filter((lesson) => lesson.id !== lessonId),
    }));
    if (editingLesson?.id === lessonId) {
      setEditingLesson(null);
    }
  };

  const saveModule = () => {
    console.log("Saving module:", currentModule);
    alert("Module saved successfully!");
  };

  const publishModule = () => {
    setCurrentModule((prev) => ({...prev, isPublished: true}));
    alert("Module published successfully!");
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return Video;
      case "audio":
        return Headphones;
      case "document":
        return FileText;
      case "tutorial":
        return BookOpen;
      default:
        return FileText;
    }
  };

  return (
    <div className="space-y-4 p-3 xs:p-4 sm:p-6 max-w-full mx-auto">
      <div>
        <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold">
          Learning Modules
        </h1>
        <p className="text-muted-foreground text-xs xs:text-sm sm:text-base">
          Create and manage comprehensive learning experiences
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value);
          setCurrentPageManage(1);
          setCurrentPageAnalytics(1);
        }}
        className="w-full">
        <TabsList className="bg-[#f797712e] text-slate-700 flex flex-col lg:flex-row w-full gap-2 mb-14">
          <TabsTrigger
            value="create"
            className="bg-transparent w-full sm:w-32 justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3">
            Create Module
          </TabsTrigger>
          <TabsTrigger
            value="manage"
            className="bg-transparent w-full sm:w-32 justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3">
            Manage Modules
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="bg-transparent w-full sm:w-32 justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3">
            Module Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-3 xs:space-y-4">
          <div className="grid gap-3 xs:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {/* Module Configuration */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="text-sm xs:text-base sm:text-lg">
                  Module Configuration
                </CardTitle>
                <CardDescription className="text-[0.85rem] xs:text-xs sm:text-sm">
                  Set up your learning module
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 xs:space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="title"
                    className="text-xs xs:text-sm sm:text-base">
                    Module Title
                  </Label>
                  <Input
                    id="title"
                    value={currentModule.title}
                    onChange={(e) =>
                      setCurrentModule((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Enter module title"
                    className="text-xs xs:text-sm sm:text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="text-xs xs:text-sm sm:text-base">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={currentModule.description}
                    onChange={(e) =>
                      setCurrentModule((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Describe what students will learn"
                    rows={3}
                    className="text-xs xs:text-sm sm:text-base"
                  />
                </div>

                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 xs:gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs xs:text-sm sm:text-base">
                      Module Type
                    </Label>
                    <Select
                      value={currentModule.type}
                      onValueChange={(value: Module["type"]) =>
                        setCurrentModule((prev) => ({...prev, type: value}))
                      }>
                      <SelectTrigger className="text-xs xs:text-sm sm:text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          value="video"
                          className="text-xs xs:text-sm sm:text-base">
                          Video Course
                        </SelectItem>
                        <SelectItem
                          value="audio"
                          className="text-xs xs:text-sm sm:text-base">
                          Audio Course
                        </SelectItem>
                        <SelectItem
                          value="document"
                          className="text-xs xs:text-sm sm:text-base">
                          Document Series
                        </SelectItem>
                        <SelectItem
                          value="tutorial"
                          className="text-xs xs:text-sm sm:text-base">
                          Interactive Tutorial
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs xs:text-sm sm:text-base">
                      Difficulty
                    </Label>
                    <Select
                      value={currentModule.difficulty}
                      onValueChange={(value: Module["difficulty"]) =>
                        setCurrentModule((prev) => ({
                          ...prev,
                          difficulty: value,
                        }))
                      }>
                      <SelectTrigger className="text-xs xs:text-sm sm:text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          value="Beginner"
                          className="text-xs xs:text-sm sm:text-base">
                          Beginner
                        </SelectItem>
                        <SelectItem
                          value="Intermediate"
                          className="text-xs xs:text-sm sm:text-base">
                          Intermediate
                        </SelectItem>
                        <SelectItem
                          value="Advanced"
                          className="text-xs xs:text-sm sm:text-base">
                          Advanced
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs xs:text-sm sm:text-base">
                    Category
                  </Label>
                  <Select
                    value={currentModule.category}
                    onValueChange={(value) =>
                      setCurrentModule((prev) => ({...prev, category: value}))
                    }>
                    <SelectTrigger className="text-xs xs:text-sm sm:text-base">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        value="Frontend"
                        className="text-xs xs:text-sm sm:text-base">
                        Frontend Development
                      </SelectItem>
                      <SelectItem
                        value="Backend"
                        className="text-xs xs:text-sm sm:text-base">
                        Backend Development
                      </SelectItem>
                      <SelectItem
                        value="Database"
                        className="text-xs xs:text-sm sm:text-base">
                        Database
                      </SelectItem>
                      <SelectItem
                        value="Programming"
                        className="text-xs xs:text-sm sm:text-base">
                        Programming
                      </SelectItem>
                      <SelectItem
                        value="AI/ML"
                        className="text-xs xs:text-sm sm:text-base">
                        AI/Machine Learning
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="duration"
                    className="text-xs xs:text-sm sm:text-base">
                    Estimated Duration
                  </Label>
                  <Input
                    id="duration"
                    value={currentModule.duration}
                    onChange={(e) =>
                      setCurrentModule((prev) => ({
                        ...prev,
                        duration: e.target.value,
                      }))
                    }
                    placeholder="e.g., 4h 30m"
                    className="text-xs xs:text-sm sm:text-base"
                  />
                </div>

                <div className="pt-2 xs:pt-3 space-y-2">
                  <div className="flex justify-between text-[0.85rem] xs:text-xs sm:text-sm">
                    <span>Total Lessons:</span>
                    <span>{currentModule.lessons.length}</span>
                  </div>
                </div>

                <div className="pt-2 xs:pt-3 space-y-2">
                  <Button
                    onClick={saveModule}
                    className="w-full text-xs xs:text-sm sm:text-base bg-[#f79771] hover:bg-gray-300 shadow-md">
                    <Save className="mr-1 xs:mr-2 h-3 w-3 xs:h-4 xs:w-4" />
                    Save Module
                  </Button>
                  <Button
                    onClick={publishModule}
                    variant="outline"
                    className="w-full bg-transparent text-xs xs:text-sm sm:text-base  shadow-md">
                    <Upload className="mr-1 xs:mr-2 h-3 w-3 xs:h-4 xs:w-4" />
                    Publish Module
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Lessons List */}
            <Card className="md:col-span-1">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm xs:text-base sm:text-lg">
                      Lessons
                    </CardTitle>
                    <CardDescription className="text-[0.85rem] xs:text-xs sm:text-sm">
                      Manage module lessons
                    </CardDescription>
                  </div>
                  <Button
                    onClick={addLesson}
                    size="sm"
                    className="text-xs xs:text-sm sm:text-base bg-[#f79771] hover:bg-gray-300">
                    <Plus className="h-3 w-3 xs:h-4 xs:w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 xs:space-y-3">
                {currentModule.lessons.length === 0 ? (
                  <div className="text-center py-6 xs:py-8 text-muted-foreground">
                    <BookOpen className="mx-auto h-8 w-8 xs:h-10 xs:w-10 sm:h-12 sm:w-12 mb-2 xs:mb-3 sm:mb-4 opacity-50" />
                    <p className="text-[0.85rem] xs:text-xs sm:text-sm">
                      No lessons added yet
                    </p>
                    <p className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs">
                      Click the + button to add your first lesson
                    </p>
                  </div>
                ) : (
                  currentModule.lessons.map((lesson, index) => {
                    const Icon = getTypeIcon(lesson.type);
                    return (
                      <div
                        key={lesson.id}
                        className={`p-2 px-4 xs:p-3 rounded-lg cursor-pointer transition-colors shadow-md ${
                          editingLesson?.id === lesson.id
                            ? "border-primary bg-primary/5"
                            : "hover:bg-muted/50"
                        }`}
                        onClick={() => setEditingLesson(lesson)}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-1 xs:gap-2 mb-1">
                              <Icon className="h-3 w-3 xs:h-4 xs:w-4" />
                              <span className="text-[0.85rem] xs:text-xs sm:text-sm font-medium">
                                Lesson {index + 1}
                              </span>
                              <Badge
                                variant="outline"
                                className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs">
                                {lesson.type}
                              </Badge>
                            </div>
                            <p className="text-[0.85rem] xs:text-xs sm:text-sm line-clamp-2">
                              {lesson.title || "Untitled lesson"}
                            </p>
                            {lesson.duration && (
                              <p className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs text-muted-foreground mt-0.5 xs:mt-1">
                                {" "}
                                {lesson.duration}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1 xs:p-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteLesson(lesson.id);
                            }}>
                            <Trash2 className="h-2.5 w-2.5 xs:h-3 xs:w-3 text-[#DD2701]" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Lesson Editor */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="text-sm xs:text-base sm:text-lg">
                  Lesson Editor
                </CardTitle>
                <CardDescription className="text-[0.85rem] xs:text-xs sm:text-sm">
                  {editingLesson
                    ? "Edit the selected lesson"
                    : "Select a lesson to edit"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {editingLesson ? (
                  <div className="space-y-3 xs:space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs xs:text-sm sm:text-base">
                        Lesson Type
                      </Label>
                      <Select
                        value={editingLesson.type}
                        onValueChange={(value: Lesson["type"]) =>
                          updateLesson(editingLesson.id, {type: value})
                        }>
                        <SelectTrigger className="text-xs xs:text-sm sm:text-base">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
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
                            value="text"
                            className="text-xs xs:text-sm sm:text-base">
                            Text/Article
                          </SelectItem>
                          <SelectItem
                            value="quiz"
                            className="text-xs xs:text-sm sm:text-base">
                            Quiz
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs xs:text-sm sm:text-base">
                        Lesson Title
                      </Label>
                      <Input
                        value={editingLesson.title}
                        onChange={(e) =>
                          updateLesson(editingLesson.id, {
                            title: e.target.value,
                          })
                        }
                        placeholder="Enter lesson title"
                        className="text-xs xs:text-sm sm:text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs xs:text-sm sm:text-base">
                        Duration
                      </Label>
                      <Input
                        value={editingLesson.duration}
                        onChange={(e) =>
                          updateLesson(editingLesson.id, {
                            duration: e.target.value,
                          })
                        }
                        placeholder="e.g., 15 mins"
                        className="text-xs xs:text-sm sm:text-base"
                      />
                    </div>

                    {editingLesson.type === "video" && (
                      <div className="space-y-2">
                        <Label className="text-xs xs:text-sm sm:text-base">
                          Video URL
                        </Label>
                        <Input
                          value={editingLesson.videoUrl || ""}
                          onChange={(e) =>
                            updateLesson(editingLesson.id, {
                              videoUrl: e.target.value,
                            })
                          }
                          placeholder="Enter video URL or upload"
                          className="text-xs xs:text-sm sm:text-base"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full bg-transparent text-xs xs:text-sm sm:text-base">
                          <Upload className="mr-1 xs:mr-2 h-2.5 w-2.5 xs:h-3 xs:w-3" />
                          Upload Video
                        </Button>
                      </div>
                    )}

                    {editingLesson.type === "audio" && (
                      <div className="space-y-2">
                        <Label className="text-xs xs:text-sm sm:text-base">
                          Audio URL
                        </Label>
                        <Input
                          value={editingLesson.audioUrl || ""}
                          onChange={(e) =>
                            updateLesson(editingLesson.id, {
                              audioUrl: e.target.value,
                            })
                          }
                          placeholder="Enter audio URL or upload"
                          className="text-xs xs:text-sm sm:text-base"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full bg-transparent text-xs xs:text-sm sm:text-base">
                          <Upload className="mr-1 xs:mr-2 h-2.5 w-2.5 xs:h-3 xs:w-3" />
                          Upload Audio
                        </Button>
                      </div>
                    )}

                    {editingLesson.type === "text" && (
                      <div className="space-y-2">
                        <Label className="text-xs xs:text-sm sm:text-base">
                          Content
                        </Label>
                        <Textarea
                          value={editingLesson.content || ""}
                          onChange={(e) =>
                            updateLesson(editingLesson.id, {
                              content: e.target.value,
                            })
                          }
                          placeholder="Write your lesson content here..."
                          rows={4}
                          className="text-xs xs:text-sm sm:text-base"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 xs:py-8 text-muted-foreground">
                    <Edit className="mx-auto h-8 w-8 xs:h-10 xs:w-10 sm:h-12 sm:w-12 mb-2 xs:mb-3 sm:mb-4 opacity-50" />
                    <p className="text-[0.85rem] xs:text-xs sm:text-sm">
                      Select a lesson to edit
                    </p>
                    <p className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs">
                      Choose a lesson from the list to start editing
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="manage" className="space-y-3 xs:space-y-4">
          <div className="flex flex-wrap items-start xs:items-center justify-between gap-2 xs:gap-3">
            <div>
              <h2 className="text-lg xs:text-xl sm:text-2xl font-bold">
                Manage Modules
              </h2>
              <p className="text-muted-foreground text-[0.85rem] xs:text-xs sm:text-sm">
                View and manage all your learning modules
              </p>
            </div>
            <Button
              onClick={() => setActiveTab("create")}
              className="text-xs xs:text-sm sm:text-base bg-[#f79771] hover:bg-gray-300 shadow-md">
              <Plus className="mr-1 xs:mr-2 h-3 w-3 xs:h-4 xs:w-4" />
              Create New Module
            </Button>
          </div>

          <div className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
            Showing{" "}
            {
              getPaginatedModules(existingModules, currentPageManage)
                .paginatedModules.length
            }{" "}
            of{" "}
            {getPaginatedModules(existingModules, currentPageManage).totalCount}{" "}
            Modules
          </div>

          <div className="grid gap-3 xs:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {getPaginatedModules(
              existingModules,
              currentPageManage
            ).paginatedModules.map((module) => {
              const Icon = getTypeIcon(module.type);
              return (
                <Card
                  key={module.id}
                  className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-sm xs:text-base sm:text-lg line-clamp-2">
                          {module.title}
                        </CardTitle>
                        <CardDescription className="text-[0.85rem] xs:text-xs sm:text-sm line-clamp-2">
                          {module.description}
                        </CardDescription>
                      </div>
                      <Icon className="h-4 w-4 xs:h-5 xs:w-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 xs:space-y-4">
                    <div className="flex items-center flex-wrap gap-2">
                      <Badge
                        variant={module.isPublished ? "default" : "secondary"}
                        className={
                          module.isPublished
                            ? "bg-[#EF7B55] hover:bg-[#EF7B553a] hover:bg-gray-300"
                            : "bg-gray-500 text-white hover:bg-gray-600"
                        }>
                        {module.isPublished ? "Published" : "Draft"}
                      </Badge>
                      <Badge variant="outline" className="">
                        {module.difficulty}
                      </Badge>
                      <Badge variant="outline" className="">
                        {module.category}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 xs:gap-4 text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5 xs:h-3 xs:w-3" />
                        {module.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-2.5 w-2.5 xs:h-3 xs:w-3" />
                        {module.enrollments}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-2.5 w-2.5 xs:h-3 xs:w-3 fill-yellow-400 text-yellow-400" />
                        {module.rating}
                      </div>
                      <div>{module.createdDate}</div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 text-xs xs:text-sm sm:text-base bg-[#f79771] hover:bg-gray-300 shadow-md">
                        <Edit className="mr-1 xs:mr-2 h-2.5 w-2.5 xs:h-3 xs:w-3" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs xs:text-sm sm:text-base shadow-md">
                        <Eye className="mr-1 xs:mr-2 h-2.5 w-2.5 xs:h-3 xs:w-3" />
                        Preview
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {getPaginatedModules(existingModules, currentPageManage)
            .totalCount === 0 ? (
            <div className="text-center py-8 xs:py-12">
              <BookOpen className="mx-auto h-8 w-8 xs:h-12 xs:w-12 text-muted-foreground mb-3 xs:mb-4" />
              <h3 className="text-base xs:text-lg sm:text-xl font-medium mb-2">
                No Modules found
              </h3>
              <p className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
                Create a new module to get started
              </p>
            </div>
          ) : (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationPrevious
                  onClick={() =>
                    setCurrentPageManage((prev) => Math.max(prev - 1, 1))
                  }
                  className={
                    currentPageManage === 1
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
                {Array.from(
                  {
                    length: getPaginatedModules(
                      existingModules,
                      currentPageManage
                    ).totalPages,
                  },
                  (_, index) => index + 1
                ).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      isActive={currentPageManage === page}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPageManage(page);
                      }}>
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                {getPaginatedModules(existingModules, currentPageManage)
                  .totalPages > 5 && <PaginationEllipsis />}
                <PaginationNext
                  onClick={() =>
                    setCurrentPageManage((prev) =>
                      Math.min(
                        prev + 1,
                        getPaginatedModules(existingModules, currentPageManage)
                          .totalPages
                      )
                    )
                  }
                  className={
                    currentPageManage ===
                    getPaginatedModules(existingModules, currentPageManage)
                      .totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationContent>
            </Pagination>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-3 xs:space-y-4">
          <div>
            <h2 className="text-lg xs:text-xl sm:text-2xl font-bold">
              Module Analytics
            </h2>
            <p className="text-muted-foreground text-[0.85rem] xs:text-xs sm:text-sm">
              Track performance and engagement of your learning modules
            </p>
          </div>

          <div className="grid gap-3 xs:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-1 xs:pb-2">
                <CardTitle className="text-[0.85rem] xs:text-xs sm:text-sm font-medium">
                  Total Enrollments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg xs:text-xl sm:text-2xl font-bold">
                  4,700
                </div>
                <p className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs text-muted-foreground">
                  +18% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-1 xs:pb-2">
                <CardTitle className="text-[0.85rem] xs:text-xs sm:text-sm font-medium">
                  Completion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg xs:text-xl sm:text-2xl font-bold">
                  78%
                </div>
                <p className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs text-muted-foreground">
                  +5% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-1 xs:pb-2">
                <CardTitle className="text-[0.85rem] xs:text-xs sm:text-sm font-medium">
                  Average Rating
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg xs:text-xl sm:text-2xl font-bold">
                  4.8
                </div>
                <p className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs text-muted-foreground">
                  +0.2 from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-1 xs:pb-2">
                <CardTitle className="text-[0.85rem] xs:text-xs sm:text-sm font-medium">
                  Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg xs:text-xl sm:text-2xl font-bold">
                  $12,450
                </div>
                <p className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs text-muted-foreground">
                  +22% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm xs:text-base sm:text-lg">
                Module Performance
              </CardTitle>
              <CardDescription className="text-[0.85rem] xs:text-xs sm:text-sm">
                Detailed analytics for each module
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground mb-2 xs:mb-3">
                Showing{" "}
                {
                  getPaginatedModules(existingModules, currentPageAnalytics)
                    .paginatedModules.length
                }{" "}
                of{" "}
                {
                  getPaginatedModules(existingModules, currentPageAnalytics)
                    .totalCount
                }{" "}
                Modules
              </div>
              <div className="space-y-2 xs:space-y-3">
                {getPaginatedModules(
                  existingModules,
                  currentPageAnalytics
                ).paginatedModules.map((module) => (
                  <div
                    key={module.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 xs:p-4 border rounded-lg">
                    <div className="space-y-1 flex-1">
                      <h4 className="font-medium text-[0.85rem] xs:text-xs sm:text-sm">
                        {module.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 xs:gap-3 text-[0.6rem] xs:text-[0.65rem] sm:text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-2.5 w-2.5 xs:h-3 xs:w-3" />
                          {module.enrollments} enrolled
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-2.5 w-2.5 xs:h-3 xs:w-3 fill-yellow-400 text-yellow-400" />
                          {module.rating}
                        </div>
                        <div>
                          Completion: {Math.floor(Math.random() * 30) + 70}%
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 sm:mt-0 text-right space-y-2">
                      <div className="text-[0.85rem] xs:text-xs sm:text-sm font-medium text-green-600">
                        ${Math.floor(Math.random() * 5000) + 1000}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs xs:text-sm sm:text-base">
                        <Eye className="mr-1 xs:mr-2 h-2.5 w-2.5 xs:h-3 xs:w-3" />
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              {getPaginatedModules(existingModules, currentPageAnalytics)
                .totalCount === 0 ? (
                <div className="text-center py-8 xs:py-12">
                  <BookOpen className="mx-auto h-8 w-8 xs:h-12 xs:w-12 text-muted-foreground mb-3 xs:mb-4" />
                  <h3 className="text-base xs:text-lg sm:text-xl font-medium mb-2">
                    No Modules found
                  </h3>
                  <p className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
                    Create a new module to view analytics
                  </p>
                </div>
              ) : (
                <Pagination className="mt-4">
                  <PaginationContent>
                    <PaginationPrevious
                      onClick={() =>
                        setCurrentPageAnalytics((prev) => Math.max(prev - 1, 1))
                      }
                      className={
                        currentPageAnalytics === 1
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                    {Array.from(
                      {
                        length: getPaginatedModules(
                          existingModules,
                          currentPageAnalytics
                        ).totalPages,
                      },
                      (_, index) => index + 1
                    ).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          isActive={currentPageAnalytics === page}
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPageAnalytics(page);
                          }}>
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    {getPaginatedModules(existingModules, currentPageAnalytics)
                      .totalPages > 5 && <PaginationEllipsis />}
                    <PaginationNext
                      onClick={() =>
                        setCurrentPageAnalytics((prev) =>
                          Math.min(
                            prev + 1,
                            getPaginatedModules(
                              existingModules,
                              currentPageAnalytics
                            ).totalPages
                          )
                        )
                      }
                      className={
                        currentPageAnalytics ===
                        getPaginatedModules(
                          existingModules,
                          currentPageAnalytics
                        ).totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationContent>
                </Pagination>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

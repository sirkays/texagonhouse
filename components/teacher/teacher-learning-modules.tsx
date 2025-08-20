"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
} from "lucide-react"

interface Module {
  id: string
  title: string
  description: string
  type: "video" | "audio" | "document" | "tutorial"
  duration: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  category: string
  enrollments: number
  rating: number
  isPublished: boolean
  createdDate: string
  lessons: Lesson[]
}

interface Lesson {
  id: string
  title: string
  type: "video" | "audio" | "text" | "quiz"
  duration: string
  content?: string
  videoUrl?: string
  audioUrl?: string
}

export function TeacherLearningModules() {
  const [activeTab, setActiveTab] = useState("create")
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
  })
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)

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
      description: "Learn Python programming for data analysis and visualization",
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
  ]

  const addLesson = () => {
    const newLesson: Lesson = {
      id: Date.now().toString(),
      title: "",
      type: "video",
      duration: "",
    }
    setCurrentModule((prev) => ({
      ...prev,
      lessons: [...prev.lessons, newLesson],
    }))
    setEditingLesson(newLesson)
  }

  const updateLesson = (lessonId: string, updates: Partial<Lesson>) => {
    setCurrentModule((prev) => ({
      ...prev,
      lessons: prev.lessons.map((lesson) => (lesson.id === lessonId ? { ...lesson, ...updates } : lesson)),
    }))
    if (editingLesson?.id === lessonId) {
      setEditingLesson((prev) => (prev ? { ...prev, ...updates } : null))
    }
  }

  const deleteLesson = (lessonId: string) => {
    setCurrentModule((prev) => ({
      ...prev,
      lessons: prev.lessons.filter((lesson) => lesson.id !== lessonId),
    }))
    if (editingLesson?.id === lessonId) {
      setEditingLesson(null)
    }
  }

  const saveModule = () => {
    console.log("Saving module:", currentModule)
    alert("Module saved successfully!")
  }

  const publishModule = () => {
    setCurrentModule((prev) => ({ ...prev, isPublished: true }))
    alert("Module published successfully!")
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return Video
      case "audio":
        return Headphones
      case "document":
        return FileText
      case "tutorial":
        return BookOpen
      default:
        return FileText
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Learning Modules</h1>
        <p className="text-muted-foreground">Create and manage comprehensive learning experiences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="create">Create Module</TabsTrigger>
          <TabsTrigger value="manage">Manage Modules</TabsTrigger>
          <TabsTrigger value="analytics">Module Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Module Configuration */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Module Configuration</CardTitle>
                <CardDescription>Set up your learning module</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Module Title</Label>
                  <Input
                    id="title"
                    value={currentModule.title}
                    onChange={(e) => setCurrentModule((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter module title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={currentModule.description}
                    onChange={(e) => setCurrentModule((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what students will learn"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Module Type</Label>
                    <Select
                      value={currentModule.type}
                      onValueChange={(value: Module["type"]) => setCurrentModule((prev) => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">Video Course</SelectItem>
                        <SelectItem value="audio">Audio Course</SelectItem>
                        <SelectItem value="document">Document Series</SelectItem>
                        <SelectItem value="tutorial">Interactive Tutorial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Difficulty</Label>
                    <Select
                      value={currentModule.difficulty}
                      onValueChange={(value: Module["difficulty"]) =>
                        setCurrentModule((prev) => ({ ...prev, difficulty: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={currentModule.category}
                    onValueChange={(value) => setCurrentModule((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Frontend">Frontend Development</SelectItem>
                      <SelectItem value="Backend">Backend Development</SelectItem>
                      <SelectItem value="Database">Database</SelectItem>
                      <SelectItem value="Programming">Programming</SelectItem>
                      <SelectItem value="AI/ML">AI/Machine Learning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Estimated Duration</Label>
                  <Input
                    id="duration"
                    value={currentModule.duration}
                    onChange={(e) => setCurrentModule((prev) => ({ ...prev, duration: e.target.value }))}
                    placeholder="e.g., 4h 30m"
                  />
                </div>

                <div className="pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Lessons:</span>
                    <span>{currentModule.lessons.length}</span>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <Button onClick={saveModule} className="w-full">
                    <Save className="mr-2 h-4 w-4" />
                    Save Module
                  </Button>
                  <Button onClick={publishModule} variant="outline" className="w-full bg-transparent">
                    <Upload className="mr-2 h-4 w-4" />
                    Publish Module
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Lessons List */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Lessons</CardTitle>
                    <CardDescription>Manage module lessons</CardDescription>
                  </div>
                  <Button onClick={addLesson} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentModule.lessons.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No lessons added yet</p>
                    <p className="text-sm">Click the + button to add your first lesson</p>
                  </div>
                ) : (
                  currentModule.lessons.map((lesson, index) => {
                    const Icon = getTypeIcon(lesson.type)
                    return (
                      <div
                        key={lesson.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          editingLesson?.id === lesson.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                        }`}
                        onClick={() => setEditingLesson(lesson)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Icon className="h-4 w-4" />
                              <span className="text-sm font-medium">Lesson {index + 1}</span>
                              <Badge variant="outline" className="text-xs">
                                {lesson.type}
                              </Badge>
                            </div>
                            <p className="text-sm line-clamp-2">{lesson.title || "Untitled lesson"}</p>
                            {lesson.duration && <p className="text-xs text-muted-foreground mt-1">{lesson.duration}</p>}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteLesson(lesson.id)
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )
                  })
                )}
              </CardContent>
            </Card>

            {/* Lesson Editor */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Lesson Editor</CardTitle>
                <CardDescription>
                  {editingLesson ? "Edit the selected lesson" : "Select a lesson to edit"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {editingLesson ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Lesson Type</Label>
                      <Select
                        value={editingLesson.type}
                        onValueChange={(value: Lesson["type"]) => updateLesson(editingLesson.id, { type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="audio">Audio</SelectItem>
                          <SelectItem value="text">Text/Article</SelectItem>
                          <SelectItem value="quiz">Quiz</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Lesson Title</Label>
                      <Input
                        value={editingLesson.title}
                        onChange={(e) => updateLesson(editingLesson.id, { title: e.target.value })}
                        placeholder="Enter lesson title"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Duration</Label>
                      <Input
                        value={editingLesson.duration}
                        onChange={(e) => updateLesson(editingLesson.id, { duration: e.target.value })}
                        placeholder="e.g., 15 mins"
                      />
                    </div>

                    {editingLesson.type === "video" && (
                      <div className="space-y-2">
                        <Label>Video URL</Label>
                        <Input
                          value={editingLesson.videoUrl || ""}
                          onChange={(e) => updateLesson(editingLesson.id, { videoUrl: e.target.value })}
                          placeholder="Enter video URL or upload"
                        />
                        <Button variant="outline" size="sm" className="w-full bg-transparent">
                          <Upload className="mr-2 h-3 w-3" />
                          Upload Video
                        </Button>
                      </div>
                    )}

                    {editingLesson.type === "audio" && (
                      <div className="space-y-2">
                        <Label>Audio URL</Label>
                        <Input
                          value={editingLesson.audioUrl || ""}
                          onChange={(e) => updateLesson(editingLesson.id, { audioUrl: e.target.value })}
                          placeholder="Enter audio URL or upload"
                        />
                        <Button variant="outline" size="sm" className="w-full bg-transparent">
                          <Upload className="mr-2 h-3 w-3" />
                          Upload Audio
                        </Button>
                      </div>
                    )}

                    {editingLesson.type === "text" && (
                      <div className="space-y-2">
                        <Label>Content</Label>
                        <Textarea
                          value={editingLesson.content || ""}
                          onChange={(e) => updateLesson(editingLesson.id, { content: e.target.value })}
                          placeholder="Write your lesson content here..."
                          rows={6}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Edit className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>Select a lesson to edit</p>
                    <p className="text-sm">Choose a lesson from the list to start editing</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Manage Modules</h2>
              <p className="text-muted-foreground">View and manage all your learning modules</p>
            </div>
            <Button onClick={() => setActiveTab("create")}>
              <Plus className="mr-2 h-4 w-4" />
              Create New Module
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {existingModules.map((module) => {
              const Icon = getTypeIcon(module.type)
              return (
                <Card key={module.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{module.title}</CardTitle>
                        <CardDescription className="line-clamp-2">{module.description}</CardDescription>
                      </div>
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge variant={module.isPublished ? "default" : "secondary"}>
                        {module.isPublished ? "Published" : "Draft"}
                      </Badge>
                      <Badge variant="outline">{module.difficulty}</Badge>
                      <Badge variant="outline">{module.category}</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {module.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {module.enrollments}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {module.rating}
                      </div>
                      <div>{module.createdDate}</div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        <Edit className="mr-2 h-3 w-3" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="mr-2 h-3 w-3" />
                        Preview
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Module Analytics</h2>
            <p className="text-muted-foreground">Track performance and engagement of your learning modules</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4,700</div>
                <p className="text-xs text-muted-foreground">+18% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">78%</div>
                <p className="text-xs text-muted-foreground">+5% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.8</div>
                <p className="text-xs text-muted-foreground">+0.2 from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$12,450</div>
                <p className="text-xs text-muted-foreground">+22% from last month</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Module Performance</CardTitle>
              <CardDescription>Detailed analytics for each module</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {existingModules.map((module, index) => (
                  <div key={module.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium">{module.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {module.enrollments} enrolled
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {module.rating}
                        </div>
                        <div>Completion: {Math.floor(Math.random() * 30) + 70}%</div>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="text-sm font-medium text-green-600">
                        ${Math.floor(Math.random() * 5000) + 1000}
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-3 w-3" />
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

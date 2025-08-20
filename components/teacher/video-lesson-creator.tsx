"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Video, Upload, Play, Settings, Plus, X, BookOpen, Save, Eye } from "lucide-react"

export function VideoLessonCreator() {
  const [lessonData, setLessonData] = useState({
    title: "",
    description: "",
    category: "",
    difficulty: "",
    duration: "",
    tags: [] as string[],
  })

  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [chapters, setChapters] = useState([{ id: 1, title: "Introduction", timestamp: "00:00", description: "" }])
  const [quizQuestions, setQuizQuestions] = useState([
    { id: 1, timestamp: "05:30", question: "", options: ["", "", "", ""], correctAnswer: 0 },
  ])

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setVideoFile(file)
      // Simulate upload progress
      setIsUploading(true)
      let progress = 0
      const interval = setInterval(() => {
        progress += 10
        setUploadProgress(progress)
        if (progress >= 100) {
          clearInterval(interval)
          setIsUploading(false)
        }
      }, 500)
    }
  }

  const addChapter = () => {
    const newChapter = {
      id: chapters.length + 1,
      title: "",
      timestamp: "00:00",
      description: "",
    }
    setChapters([...chapters, newChapter])
  }

  const addQuizQuestion = () => {
    const newQuestion = {
      id: quizQuestions.length + 1,
      timestamp: "00:00",
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
    }
    setQuizQuestions([...quizQuestions, newQuestion])
  }

  const updateChapter = (id: number, field: string, value: string) => {
    setChapters(chapters.map((chapter) => (chapter.id === id ? { ...chapter, [field]: value } : chapter)))
  }

  const updateQuizQuestion = (id: number, field: string, value: any) => {
    setQuizQuestions(quizQuestions.map((question) => (question.id === id ? { ...question, [field]: value } : question)))
  }

  const addTag = (tag: string) => {
    if (tag && !lessonData.tags.includes(tag)) {
      setLessonData({ ...lessonData, tags: [...lessonData.tags, tag] })
    }
  }

  const removeTag = (tagToRemove: string) => {
    setLessonData({
      ...lessonData,
      tags: lessonData.tags.filter((tag) => tag !== tagToRemove),
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Video Lesson</h1>
        <p className="text-muted-foreground">Create engaging video lessons with interactive elements</p>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="video">Video Upload</TabsTrigger>
          <TabsTrigger value="chapters">Chapters</TabsTrigger>
          <TabsTrigger value="interactive">Interactive Elements</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lesson Information</CardTitle>
              <CardDescription>Basic details about your video lesson</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Lesson Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter lesson title"
                    value={lessonData.title}
                    onChange={(e) => setLessonData({ ...lessonData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="30"
                    value={lessonData.duration}
                    onChange={(e) => setLessonData({ ...lessonData, duration: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what students will learn in this lesson"
                  value={lessonData.description}
                  onChange={(e) => setLessonData({ ...lessonData, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={lessonData.category}
                    onValueChange={(value) => setLessonData({ ...lessonData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="programming">Programming</SelectItem>
                      <SelectItem value="mathematics">Mathematics</SelectItem>
                      <SelectItem value="science">Science</SelectItem>
                      <SelectItem value="language">Language Arts</SelectItem>
                      <SelectItem value="history">History</SelectItem>
                      <SelectItem value="art">Art & Design</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select
                    value={lessonData.difficulty}
                    onValueChange={(value) => setLessonData({ ...lessonData, difficulty: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {lessonData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                    </Badge>
                  ))}
                </div>
                <Input
                  placeholder="Add tags (press Enter)"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      addTag(e.currentTarget.value)
                      e.currentTarget.value = ""
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="video" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Video Upload</CardTitle>
              <CardDescription>Upload your lesson video</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!videoFile ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Video className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Upload Video</h3>
                  <p className="text-muted-foreground mb-4">Drag and drop your video file here, or click to browse</p>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                    id="video-upload"
                  />
                  <Button asChild>
                    <label htmlFor="video-upload" className="cursor-pointer">
                      <Upload className="mr-2 h-4 w-4" />
                      Choose Video File
                    </label>
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">Supported formats: MP4, MOV, AVI (Max 500MB)</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <Video className="h-8 w-8 text-blue-500" />
                    <div className="flex-1">
                      <h4 className="font-medium">{videoFile.name}</h4>
                      <p className="text-sm text-muted-foreground">{(videoFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                    {isUploading && (
                      <div className="w-32">
                        <Progress value={uploadProgress} className="h-2" />
                        <p className="text-xs text-center mt-1">{uploadProgress}%</p>
                      </div>
                    )}
                  </div>

                  {!isUploading && (
                    <div className="bg-gray-100 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">Video Preview</h4>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="bg-black rounded aspect-video flex items-center justify-center">
                        <Play className="h-16 w-16 text-white opacity-50" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chapters" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Video Chapters</CardTitle>
                  <CardDescription>Organize your video into chapters for better navigation</CardDescription>
                </div>
                <Button onClick={addChapter}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Chapter
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {chapters.map((chapter, index) => (
                <div key={chapter.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Chapter {index + 1}</Badge>
                    <Input
                      placeholder="Chapter title"
                      value={chapter.title}
                      onChange={(e) => updateChapter(chapter.id, "title", e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="00:00"
                      value={chapter.timestamp}
                      onChange={(e) => updateChapter(chapter.id, "timestamp", e.target.value)}
                      className="w-20"
                    />
                  </div>
                  <Textarea
                    placeholder="Chapter description (optional)"
                    value={chapter.description}
                    onChange={(e) => updateChapter(chapter.id, "description", e.target.value)}
                    rows={2}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interactive" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Interactive Quiz Questions</CardTitle>
                  <CardDescription>Add quiz questions that appear during video playback</CardDescription>
                </div>
                <Button onClick={addQuizQuestion}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Question
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {quizQuestions.map((question, index) => (
                <div key={question.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Question {index + 1}</Badge>
                    <Input
                      placeholder="Timestamp (e.g., 05:30)"
                      value={question.timestamp}
                      onChange={(e) => updateQuizQuestion(question.id, "timestamp", e.target.value)}
                      className="w-32"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Question</Label>
                    <Textarea
                      placeholder="Enter your question"
                      value={question.question}
                      onChange={(e) => updateQuizQuestion(question.id, "question", e.target.value)}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Answer Options</Label>
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          checked={question.correctAnswer === optionIndex}
                          onChange={() => updateQuizQuestion(question.id, "correctAnswer", optionIndex)}
                        />
                        <Input
                          placeholder={`Option ${optionIndex + 1}`}
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...question.options]
                            newOptions[optionIndex] = e.target.value
                            updateQuizQuestion(question.id, "options", newOptions)
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex gap-4">
        <Button variant="outline" className="flex-1 bg-transparent">
          <Eye className="mr-2 h-4 w-4" />
          Preview Lesson
        </Button>
        <Button variant="outline" className="flex-1 bg-transparent">
          <Save className="mr-2 h-4 w-4" />
          Save Draft
        </Button>
        <Button className="flex-1">
          <BookOpen className="mr-2 h-4 w-4" />
          Publish Lesson
        </Button>
      </div>
    </div>
  )
}

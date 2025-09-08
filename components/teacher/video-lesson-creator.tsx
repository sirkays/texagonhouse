"use client";

import type React from "react";

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
import {Progress} from "@/components/ui/progress";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {
  Video,
  Upload,
  Play,
  Settings,
  Plus,
  X,
  BookOpen,
  Save,
  Eye,
} from "lucide-react";

export function VideoLessonCreator() {
  const [lessonData, setLessonData] = useState({
    title: "",
    description: "",
    category: "",
    difficulty: "",
    duration: "",
    tags: [] as string[],
  });

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [chapters, setChapters] = useState([
    {id: 1, title: "Introduction", timestamp: "00:00", description: ""},
  ]);
  const [quizQuestions, setQuizQuestions] = useState([
    {
      id: 1,
      timestamp: "05:30",
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
    },
  ]);

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setIsUploading(true);
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setIsUploading(false);
        }
      }, 500);
    }
  };

  const addChapter = () => {
    const newChapter = {
      id: chapters.length + 1,
      title: "",
      timestamp: "00:00",
      description: "",
    };
    setChapters([...chapters, newChapter]);
  };

  const addQuizQuestion = () => {
    const newQuestion = {
      id: quizQuestions.length + 1,
      timestamp: "00:00",
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
    };
    setQuizQuestions([...quizQuestions, newQuestion]);
  };

  const updateChapter = (id: number, field: string, value: string) => {
    setChapters(
      chapters.map((chapter) =>
        chapter.id === id ? {...chapter, [field]: value} : chapter
      )
    );
  };

  const updateQuizQuestion = (id: number, field: string, value: any) => {
    setQuizQuestions(
      quizQuestions.map((question) =>
        question.id === id ? {...question, [field]: value} : question
      )
    );
  };

  const addTag = (tag: string) => {
    if (tag && !lessonData.tags.includes(tag)) {
      setLessonData({...lessonData, tags: [...lessonData.tags, tag]});
    }
  };

  const removeTag = (tagToRemove: string) => {
    setLessonData({
      ...lessonData,
      tags: lessonData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  return (
    <div className="space-y-4 p-3 xs:p-4 sm:p-6 max-w-full mx-auto">
      <div>
        <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold">
          Create Video Lesson
        </h1>
        <p className="text-muted-foreground text-xs xs:text-sm sm:text-base">
          Create engaging video lessons with interactive elements
        </p>
      </div>

      <Tabs defaultValue="basic" className="space-y-4 xs:space-y-6">
        <TabsList
          className="
    grid grid-cols-2 xs:grid-cols-4 gap-2
    sm:flex sm:justify-start sm:gap-4
    w-full mb-14
  ">
          <TabsTrigger
            value="basic"
            className="flex-1 sm:flex-none text-xs xs:text-sm sm:text-base">
            Basic Info
          </TabsTrigger>
          <TabsTrigger
            value="video"
            className="flex-1 sm:flex-none text-xs xs:text-sm sm:text-base">
            Video Upload
          </TabsTrigger>
          <TabsTrigger
            value="chapters"
            className="flex-1 sm:flex-none text-xs xs:text-sm sm:text-base">
            Chapters
          </TabsTrigger>
          <TabsTrigger
            value="interactive"
            className="flex-1 sm:flex-none text-xs xs:text-sm sm:text-base">
            Interactive Elements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 xs:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base xs:text-lg sm:text-xl">
                Lesson Information
              </CardTitle>
              <CardDescription className="text-xs xs:text-sm sm:text-base">
                Basic details about your video lesson
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 xs:space-y-4">
              <div className="grid gap-3 xs:gap-4 grid-cols-1 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="title"
                    className="text-xs xs:text-sm sm:text-base">
                    Lesson Title
                  </Label>
                  <Input
                    id="title"
                    placeholder="Enter lesson title"
                    value={lessonData.title}
                    onChange={(e) =>
                      setLessonData({...lessonData, title: e.target.value})
                    }
                    className="text-xs xs:text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="duration"
                    className="text-xs xs:text-sm sm:text-base">
                    Duration (minutes)
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="30"
                    value={lessonData.duration}
                    onChange={(e) =>
                      setLessonData({...lessonData, duration: e.target.value})
                    }
                    className="text-xs xs:text-sm sm:text-base"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="text-xs xs:text-sm sm:text-base">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe what students will learn in this lesson"
                  value={lessonData.description}
                  onChange={(e) =>
                    setLessonData({...lessonData, description: e.target.value})
                  }
                  rows={4}
                  className="text-xs xs:text-sm sm:text-base"
                />
              </div>

              <div className="grid gap-3 xs:gap-4 grid-cols-1 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="category"
                    className="text-xs xs:text-sm sm:text-base">
                    Category
                  </Label>
                  <Select
                    value={lessonData.category}
                    onValueChange={(value) =>
                      setLessonData({...lessonData, category: value})
                    }>
                    <SelectTrigger className="text-xs xs:text-sm sm:text-base">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        value="programming"
                        className="text-xs xs:text-sm sm:text-base">
                        Programming
                      </SelectItem>
                      <SelectItem
                        value="mathematics"
                        className="text-xs xs:text-sm sm:text-base">
                        Mathematics
                      </SelectItem>
                      <SelectItem
                        value="science"
                        className="text-xs xs:text-sm sm:text-base">
                        Science
                      </SelectItem>
                      <SelectItem
                        value="language"
                        className="text-xs xs:text-sm sm:text-base">
                        Language Arts
                      </SelectItem>
                      <SelectItem
                        value="history"
                        className="text-xs xs:text-sm sm:text-base">
                        History
                      </SelectItem>
                      <SelectItem
                        value="art"
                        className="text-xs xs:text-sm sm:text-base">
                        Art & Design
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="difficulty"
                    className="text-xs xs:text-sm sm:text-base">
                    Difficulty Level
                  </Label>
                  <Select
                    value={lessonData.difficulty}
                    onValueChange={(value) =>
                      setLessonData({...lessonData, difficulty: value})
                    }>
                    <SelectTrigger className="text-xs xs:text-sm sm:text-base">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        value="beginner"
                        className="text-xs xs:text-sm sm:text-base">
                        Beginner
                      </SelectItem>
                      <SelectItem
                        value="intermediate"
                        className="text-xs xs:text-sm sm:text-base">
                        Intermediate
                      </SelectItem>
                      <SelectItem
                        value="advanced"
                        className="text-xs xs:text-sm sm:text-base">
                        Advanced
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs xs:text-sm sm:text-base">Tags</Label>
                <div className="flex flex-wrap gap-1 xs:gap-2 mb-2">
                  {lessonData.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="flex items-center gap-1 text-[0.85rem] xs:text-xs sm:text-sm">
                      {tag}
                      <X
                        className="h-2.5 w-2.5 xs:h-3 xs:w-3 cursor-pointer"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
                <Input
                  placeholder="Add tags (press Enter)"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      addTag(e.currentTarget.value);
                      e.currentTarget.value = "";
                    }
                  }}
                  className="text-xs xs:text-sm sm:text-base"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="video" className="space-y-4 xs:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base xs:text-lg sm:text-xl">
                Video Upload
              </CardTitle>
              <CardDescription className="text-xs xs:text-sm sm:text-base">
                Upload your lesson video
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 xs:space-y-4">
              {!videoFile ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 xs:p-8 text-center">
                  <Video className="h-10 w-10 xs:h-12 xs:w-12 mx-auto text-gray-400 mb-3 xs:mb-4" />
                  <h3 className="text-base xs:text-lg sm:text-xl font-medium mb-2">
                    Upload Video
                  </h3>
                  <p className="text-muted-foreground text-xs xs:text-sm sm:text-base mb-3 xs:mb-4">
                    Drag and drop your video file here, or click to browse
                  </p>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                    id="video-upload"
                  />
                  <Button asChild>
                    <label
                      htmlFor="video-upload"
                      className="cursor-pointer text-xs xs:text-sm sm:text-base">
                      <Upload className="mr-1 xs:mr-2 h-3 w-3 xs:h-4 xs:w-4" />
                      Choose Video File
                    </label>
                  </Button>
                  <p className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground mt-2">
                    Supported formats: MP4, MOV, AVI (Max 500MB)
                  </p>
                </div>
              ) : (
                <div className="space-y-3 xs:space-y-4">
                  <div className="flex items-center gap-2 xs:gap-4 p-3 xs:p-4 border rounded-lg">
                    <Video className="h-6 w-6 xs:h-8 xs:w-8 text-blue-500" />
                    <div className="flex-1">
                      <h4 className="font-medium text-xs xs:text-sm sm:text-base">
                        {videoFile.name}
                      </h4>
                      <p className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
                        {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    {isUploading && (
                      <div className="w-24 xs:w-32">
                        <Progress
                          value={uploadProgress}
                          className="h-1.5 xs:h-2"
                        />
                        <p className="text-[0.85rem] xs:text-xs sm:text-sm text-center mt-1">
                          {uploadProgress}%
                        </p>
                      </div>
                    )}
                  </div>

                  {!isUploading && (
                    <div className="bg-gray-100 rounded-lg p-3 xs:p-4">
                      <div className="flex items-center justify-between mb-3 xs:mb-4">
                        <h4 className="font-medium text-xs xs:text-sm sm:text-base">
                          Video Preview
                        </h4>
                        <div className="flex gap-1 xs:gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="p-1 xs:p-2">
                            <Play className="h-3 w-3 xs:h-4 xs:w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="p-1 xs:p-2">
                            <Settings className="h-3 w-3 xs:h-4 xs:w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="bg-black rounded aspect-video flex items-center justify-center">
                        <Play className="h-12 w-12 xs:h-16 xs:w-16 text-white opacity-50" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chapters" className="space-y-4 xs:space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 xs:gap-4">
                <div>
                  <CardTitle className="text-base xs:text-lg sm:text-xl">
                    Video Chapters
                  </CardTitle>
                  <CardDescription className="text-xs xs:text-sm sm:text-base">
                    Organize your video into chapters for better navigation
                  </CardDescription>
                </div>
                <Button
                  onClick={addChapter}
                  className="text-xs xs:text-sm sm:text-base">
                  <Plus className="mr-1 xs:mr-2 h-3 w-3 xs:h-4 xs:w-4" />
                  Add Chapter
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 xs:space-y-4">
              {chapters.map((chapter, index) => (
                <div
                  key={chapter.id}
                  className="border rounded-lg p-3 xs:p-4 space-y-2 xs:space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 xs:gap-3">
                    <Badge
                      variant="outline"
                      className="text-[0.85rem] xs:text-xs sm:text-sm">
                      Chapter {index + 1}
                    </Badge>
                    <Input
                      placeholder="Chapter title"
                      value={chapter.title}
                      onChange={(e) =>
                        updateChapter(chapter.id, "title", e.target.value)
                      }
                      className="flex-1 text-xs xs:text-sm sm:text-base"
                    />
                    <Input
                      placeholder="00:00"
                      value={chapter.timestamp}
                      onChange={(e) =>
                        updateChapter(chapter.id, "timestamp", e.target.value)
                      }
                      className="w-20 xs:w-24 text-xs xs:text-sm sm:text-base"
                    />
                  </div>
                  <Textarea
                    placeholder="Chapter description (optional)"
                    value={chapter.description}
                    onChange={(e) =>
                      updateChapter(chapter.id, "description", e.target.value)
                    }
                    rows={2}
                    className="text-xs xs:text-sm sm:text-base"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interactive" className="space-y-4 xs:space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 xs:gap-4">
                <div>
                  <CardTitle className="text-base xs:text-lg sm:text-xl">
                    Interactive Quiz Questions
                  </CardTitle>
                  <CardDescription className="text-xs xs:text-sm sm:text-base">
                    Add quiz questions that appear during video playback
                  </CardDescription>
                </div>
                <Button
                  onClick={addQuizQuestion}
                  className="text-xs xs:text-sm sm:text-base">
                  <Plus className="mr-1 xs:mr-2 h-3 w-3 xs:h-4 xs:w-4" />
                  Add Question
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 xs:space-y-6">
              {quizQuestions.map((question, index) => (
                <div
                  key={question.id}
                  className="border rounded-lg p-3 xs:p-4 space-y-3 xs:space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 xs:gap-3">
                    <Badge
                      variant="outline"
                      className="text-[0.85rem] xs:text-xs sm:text-sm">
                      Question {index + 1}
                    </Badge>
                    <Input
                      placeholder="Timestamp (e.g., 05:30)"
                      value={question.timestamp}
                      onChange={(e) =>
                        updateQuizQuestion(
                          question.id,
                          "timestamp",
                          e.target.value
                        )
                      }
                      className="w-28 xs:w-32 text-xs xs:text-sm sm:text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs xs:text-sm sm:text-base">
                      Question
                    </Label>
                    <Textarea
                      placeholder="Enter your question"
                      value={question.question}
                      onChange={(e) =>
                        updateQuizQuestion(
                          question.id,
                          "question",
                          e.target.value
                        )
                      }
                      rows={2}
                      className="text-xs xs:text-sm sm:text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs xs:text-sm sm:text-base">
                      Answer Options
                    </Label>
                    {question.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          checked={question.correctAnswer === optionIndex}
                          onChange={() =>
                            updateQuizQuestion(
                              question.id,
                              "correctAnswer",
                              optionIndex
                            )
                          }
                          className="h-3 w-3 xs:h-4 xs:w-4"
                        />
                        <Input
                          placeholder={`Option ${optionIndex + 1}`}
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...question.options];
                            newOptions[optionIndex] = e.target.value;
                            updateQuizQuestion(
                              question.id,
                              "options",
                              newOptions
                            );
                          }}
                          className="text-xs xs:text-sm sm:text-base"
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

      <div className="flex flex-col sm:flex-row gap-2 xs:gap-3 xs:gap-4">
        <Button
          variant="outline"
          className="flex-1 bg-transparent text-xs xs:text-sm sm:text-base">
          <Eye className="mr-1 xs:mr-2 h-3 w-3 xs:h-4 xs:w-4" />
          Preview Lesson
        </Button>
        <Button
          variant="outline"
          className="flex-1 bg-transparent text-xs xs:text-sm sm:text-base">
          <Save className="mr-1 xs:mr-2 h-3 w-3 xs:h-4 xs:w-4" />
          Save Draft
        </Button>
        <Button className="flex-1 text-xs xs:text-sm sm:text-base">
          <BookOpen className="mr-1 xs:mr-2 h-3 w-3 xs:h-4 xs:w-4" />
          Publish Lesson
        </Button>
      </div>
    </div>
  );
}

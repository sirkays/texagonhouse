"use client"

import type React from "react"
import { useState, useCallback, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Upload,
  File,
  ImageIcon,
  Video,
  Headphones,
  FileText,
  X,
  Folder,
  Search,
  Plus,
  Edit,
  Eye,
  Trash2,
  Play,
  Pause,
  Volume2,
} from "lucide-react"

interface UploadedFile {
  id: string
  name: string
  type: string
  size: number
  category: string
  uploadDate: Date
  status: "uploading" | "completed" | "failed"
  progress: number
  description?: string
  tags: string[]
  fileUrl?: string
  originalFile?: File
}

interface Category {
  id: string
  name: string
  color: string
  count: number
}

export function MaterialUploader() {
  const [dragActive, setDragActive] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedType, setSelectedType] = useState("All")
  const [editingFile, setEditingFile] = useState<UploadedFile | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryColor, setNewCategoryColor] = useState("bg-blue-500")
  const [viewingMaterial, setViewingMaterial] = useState<UploadedFile | null>(null)
  const [isViewMaterialOpen, setIsViewMaterialOpen] = useState(false)

  const [categories, setCategories] = useState<Category[]>([
    { id: "1", name: "Frontend Development", color: "bg-blue-500", count: 45 },
    { id: "2", name: "Backend Development", color: "bg-green-500", count: 32 },
    { id: "3", name: "Database", color: "bg-purple-500", count: 18 },
    { id: "4", name: "Programming", color: "bg-orange-500", count: 67 },
    { id: "5", name: "AI/Machine Learning", color: "bg-red-500", count: 23 },
    { id: "6", name: "General", color: "bg-gray-500", count: 12 },
  ])

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([
    {
      id: "1",
      name: "React Hooks Tutorial.mp4",
      type: "video",
      size: 245000000,
      category: "Frontend Development",
      uploadDate: new Date("2024-01-15"),
      status: "completed",
      progress: 100,
      description: "Comprehensive guide to React Hooks covering useState, useEffect, and custom hooks",
      tags: ["react", "hooks", "tutorial", "javascript"],
    },
    {
      id: "2",
      name: "Python Cheat Sheet.pdf",
      type: "document",
      size: 2100000,
      category: "Programming",
      uploadDate: new Date("2024-01-10"),
      status: "completed",
      progress: 100,
      description: "Quick reference for Python syntax and common functions",
      tags: ["python", "reference", "cheatsheet", "programming"],
    },
    {
      id: "3",
      name: "JavaScript Advanced Concepts.pdf",
      type: "document",
      size: 5600000,
      category: "Frontend Development",
      uploadDate: new Date("2024-01-08"),
      status: "completed",
      progress: 100,
      description: "Deep dive into closures, prototypes, and async programming",
      tags: ["javascript", "advanced", "closures", "async"],
    },
    {
      id: "4",
      name: "Database Design Lecture.mp3",
      type: "audio",
      size: 45000000,
      category: "Database",
      uploadDate: new Date("2024-01-05"),
      status: "completed",
      progress: 100,
      description: "Audio lecture on database normalization and design principles",
      tags: ["database", "design", "normalization", "sql"],
    },
    {
      id: "5",
      name: "CSS Grid Layout Guide.png",
      type: "image",
      size: 1200000,
      category: "Frontend Development",
      uploadDate: new Date("2024-01-03"),
      status: "completed",
      progress: 100,
      description: "Visual guide to CSS Grid layout properties",
      tags: ["css", "grid", "layout", "design"],
    },
  ])

  const [currentUpload, setCurrentUpload] = useState<{
    title: string
    description: string
    category: string
    tags: string
  }>({
    title: "",
    description: "",
    category: "",
    tags: "",
  })

  const filteredFiles = useMemo(() => {
    return uploadedFiles.filter((file) => {
      const matchesSearch =
        file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesCategory = selectedCategory === "All" || file.category === selectedCategory
      const matchesType = selectedType === "All" || file.type === selectedType

      return matchesSearch && matchesCategory && matchesType
    })
  }, [uploadedFiles, searchQuery, selectedCategory, selectedType])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }, [])

  const handleFiles = (files: FileList) => {
    Array.from(files).forEach((file) => {
      const fileUrl = URL.createObjectURL(file)

      const newFile: UploadedFile = {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        type: getFileType(file.type),
        size: file.size,
        category: currentUpload.category || "General",
        uploadDate: new Date(),
        status: "uploading",
        progress: 0,
        description: currentUpload.description,
        tags: currentUpload.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        fileUrl: fileUrl,
        originalFile: file,
      }

      setUploadedFiles((prev) => [...prev, newFile])
      simulateUpload(newFile.id)
    })
  }

  const simulateUpload = (fileId: string) => {
    const interval = setInterval(() => {
      setUploadedFiles((prev) =>
        prev.map((file) => {
          if (file.id === fileId) {
            const newProgress = Math.min(file.progress + Math.random() * 20, 100)
            return {
              ...file,
              progress: newProgress,
              status: newProgress === 100 ? "completed" : "uploading",
            }
          }
          return file
        }),
      )
    }, 500)

    setTimeout(() => clearInterval(interval), 5000)
  }

  const getFileType = (mimeType: string): string => {
    if (mimeType.startsWith("image/")) return "image"
    if (mimeType.startsWith("video/")) return "video"
    if (mimeType.startsWith("audio/")) return "audio"
    if (mimeType.includes("pdf") || mimeType.includes("document")) return "document"
    return "file"
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case "image":
        return ImageIcon
      case "video":
        return Video
      case "audio":
        return Headphones
      case "document":
        return FileText
      default:
        return File
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId))
  }

  const handleEditFile = (file: UploadedFile) => {
    setEditingFile(file)
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = () => {
    if (editingFile) {
      setUploadedFiles((prev) => prev.map((file) => (file.id === editingFile.id ? editingFile : file)))
      setIsEditDialogOpen(false)
      setEditingFile(null)
    }
  }

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory: Category = {
        id: Date.now().toString(),
        name: newCategoryName.trim(),
        color: newCategoryColor,
        count: 0,
      }
      setCategories((prev) => [...prev, newCategory])
      setNewCategoryName("")
      setIsAddCategoryOpen(false)
    }
  }

  const uniqueCategories = Array.from(new Set(uploadedFiles.map((file) => file.category)))
  const fileTypes = ["All", "document", "video", "audio", "image"]

  const handleViewMaterial = (file: UploadedFile) => {
    setViewingMaterial(file)
    setIsViewMaterialOpen(true)
  }

  return (
    <div className="space-y-4 p-3 xs:p-4 sm:p-6 max-w-full mx-auto">
      <div>
        <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold">Material Uploader</h1>
        <p className="text-muted-foreground text-xs xs:text-sm sm:text-base">Upload and manage your teaching materials</p>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid grid-cols-2 xs:grid-cols-3 w-full">
          <TabsTrigger value="upload" className="text-[0.65rem] xs:text-xs sm:text-sm">Upload Materials</TabsTrigger>
          <TabsTrigger value="library" className="text-[0.65rem] xs:text-xs sm:text-sm">Materials Library</TabsTrigger>
          <TabsTrigger value="organize" className="text-[0.65rem] xs:text-xs sm:text-sm">Organize & Tag</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-3 xs:space-y-4">
          <div className="grid gap-3 xs:gap-4 grid-cols-1 lg:grid-cols-2">
            {/* Upload Area */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm xs:text-base sm:text-lg">Upload Files</CardTitle>
                <CardDescription className="text-[0.65rem] xs:text-xs sm:text-sm">Drag and drop files or click to browse</CardDescription>
              </CardHeader>
              <CardContent className="p-3 xs:p-4 sm:p-6">
                <div
                  className={`border-2 border-dashed rounded-lg p-4 xs:p-6 sm:p-8 text-center transition-colors ${
                    dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="mx-auto h-8 w-8 xs:h-10 xs:w-10 sm:h-12 sm:w-12 text-muted-foreground mb-2 xs:mb-3 sm:mb-4" />
                  <h3 className="text-[0.65rem] xs:text-xs sm:text-sm font-medium mb-1 xs:mb-2">Drop files here</h3>
                  <p className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs text-muted-foreground mb-2 xs:mb-3 sm:mb-4">
                    Support for PDF, images, videos, audio files, and documents
                  </p>
                  <Button size="sm" className="text-[0.65rem] xs:text-xs sm:text-sm" onClick={() => document.getElementById("file-upload")?.click()}>
                    Browse Files
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => e.target.files && handleFiles(e.target.files)}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.mp4,.mov,.avi,.mp3,.wav"
                  />
                </div>

                <div className="mt-3 xs:mt-4 sm:mt-6 space-y-3 xs:space-y-4">
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 xs:gap-4">
                    <div className="space-y-1 xs:space-y-2">
                      <Label className="text-[0.65rem] xs:text-xs sm:text-sm">Category</Label>
                      <Select
                        value={currentUpload.category}
                        onValueChange={(value) => setCurrentUpload((prev) => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger className="text-[0.65rem] xs:text-xs sm:text-sm">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.name} className="text-[0.65rem] xs:text-xs sm:text-sm">
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1 xs:space-y-2">
                      <Label className="text-[0.65rem] xs:text-xs sm:text-sm">Tags</Label>
                      <Input
                        value={currentUpload.tags}
                        onChange={(e) => setCurrentUpload((prev) => ({ ...prev, tags: e.target.value }))}
                        placeholder="react, tutorial, beginner"
                        className="text-[0.65rem] xs:text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 xs:space-y-2">
                    <Label className="text-[0.65rem] xs:text-xs sm:text-sm">Description</Label>
                    <Textarea
                      value={currentUpload.description}
                      onChange={(e) => setCurrentUpload((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe this material..."
                      rows={3}
                      className="text-[0.65rem] xs:text-xs sm:text-sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upload Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm xs:text-base sm:text-lg">Upload Progress</CardTitle>
                <CardDescription className="text-[0.65rem] xs:text-xs sm:text-sm">Track your file uploads</CardDescription>
              </CardHeader>
              <CardContent className="p-3 xs:p-4 sm:p-6">
                {uploadedFiles.filter((f) => f.status === "uploading").length === 0 ? (
                  <div className="text-center py-6 xs:py-8 sm:py-10 text-muted-foreground">
                    <Folder className="mx-auto h-8 w-8 xs:h-10 xs:w-10 sm:h-12 sm:w-12 mb-2 xs:mb-3 sm:mb-4 opacity-50" />
                    <p className="text-[0.65rem] xs:text-xs sm:text-sm">No active uploads</p>
                    <p className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs">Upload files to see progress here</p>
                  </div>
                ) : (
                  <div className="space-y-3 xs:space-y-4">
                    {uploadedFiles
                      .filter((f) => f.status === "uploading")
                      .map((file) => {
                        const Icon = getFileIcon(file.type)
                        return (
                          <div key={file.id} className="flex items-center space-x-2 xs:space-x-3 p-2 xs:p-3 border rounded-lg">
                            <Icon className="h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8 text-muted-foreground" />
                            <div className="flex-1 min-w-0">
                              <p className="text-[0.65rem] xs:text-xs sm:text-sm font-medium truncate">{file.name}</p>
                              <p className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs text-muted-foreground">
                                {formatFileSize(file.size)} • {file.category}
                              </p>
                              <Progress value={file.progress} className="h-1 xs:h-1.5 sm:h-2 mt-1 xs:mt-2" />
                            </div>
                            <div className="flex items-center space-x-1 xs:space-x-2">
                              <div className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs text-muted-foreground">{Math.round(file.progress)}%</div>
                              <Button variant="ghost" size="sm" className="p-1" onClick={() => removeFile(file.id)}>
                                <X className="h-2.5 w-2.5 xs:h-3 xs:w-3" />
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="library" className="space-y-3 xs:space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div>
              <h2 className="text-lg xs:text-xl sm:text-2xl font-bold">Materials Library</h2>
              <p className="text-muted-foreground text-[0.65rem] xs:text-xs sm:text-sm">Browse and manage all your uploaded materials</p>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-3 xs:gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2 top-2 xs:left-2.5 xs:top-2.5 h-3 w-3 xs:h-4 xs:w-4 text-muted-foreground" />
              <Input
                placeholder="Search materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-7 xs:pl-8 text-[0.65rem] xs:text-xs sm:text-sm"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[160px] xs:w-[180px] sm:w-[200px] text-[0.65rem] xs:text-xs sm:text-sm">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All" className="text-[0.65rem] xs:text-xs sm:text-sm">All Categories</SelectItem>
                {uniqueCategories.map((category) => (
                  <SelectItem key={category} value={category} className="text-[0.65rem] xs:text-xs sm:text-sm">
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[120px] xs:w-[140px] sm:w-[160px] text-[0.65rem] xs:text-xs sm:text-sm">
                <SelectValue placeholder="File type" />
              </SelectTrigger>
              <SelectContent>
                {fileTypes.map((type) => (
                  <SelectItem key={type} value={type} className="text-[0.65rem] xs:text-xs sm:text-sm">
                    {type === "All" ? "All Types" : type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Results count */}
          <div className="text-[0.65rem] xs:text-xs sm:text-sm text-muted-foreground">
            Showing {filteredFiles.length} of {uploadedFiles.length} materials
          </div>

          {/* Materials Grid */}
          <div className="grid gap-3 xs:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredFiles.map((file) => {
              const Icon = getFileIcon(file.type)
              return (
                <Card key={file.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2 xs:pb-3">
                    <div className="flex items-center justify-between">
                      <Icon className="h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8 text-muted-foreground" />
                      <Badge variant="outline" className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs">{file.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 xs:space-y-3">
                    <div>
                      <h4 className="font-medium text-[0.65rem] xs:text-xs sm:text-sm line-clamp-2">{file.name}</h4>
                      <p className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs text-muted-foreground mt-0.5 xs:mt-1">
                        {formatFileSize(file.size)} • {file.uploadDate.toLocaleDateString()}
                      </p>
                    </div>

                    {file.description && (
                      <p className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs text-muted-foreground line-clamp-2">{file.description}</p>
                    )}

                    {file.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {file.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {file.tags.length > 3 && (
                          <Badge variant="secondary" className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs">
                            +{file.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex gap-1 xs:gap-2">
                      <Button size="sm" className="flex-1 text-[0.65rem] xs:text-xs sm:text-sm" onClick={() => handleViewMaterial(file)}>
                        <Eye className="mr-1 h-2.5 w-2.5 xs:h-3 xs:w-3" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" className="px-2 xs:px-3 text-[0.65rem] xs:text-xs sm:text-sm" onClick={() => handleEditFile(file)}>
                        <Edit className="mr-1 h-2.5 w-2.5 xs:h-3 xs:w-3" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" className="px-2 xs:px-3 text-[0.65rem] xs:text-xs sm:text-sm" onClick={() => removeFile(file.id)}>
                        <Trash2 className="h-2.5 w-2.5 xs:h-3 xs:w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {filteredFiles.length === 0 && (
            <div className="text-center py-8 xs:py-10 sm:py-12">
              <Search className="mx-auto h-8 w-8 xs:h-10 xs:w-10 sm:h-12 sm:w-12 text-muted-foreground mb-2 xs:mb-3 sm:mb-4" />
              <h3 className="text-[0.65rem] xs:text-xs sm:text-sm font-medium mb-1 xs:mb-2">No materials found</h3>
              <p className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs text-muted-foreground">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="organize" className="space-y-3 xs:space-y-4">
          <div>
            <h2 className="text-lg xs:text-xl sm:text-2xl font-bold">Organize & Tag</h2>
            <p className="text-muted-foreground text-[0.65rem] xs:text-xs sm:text-sm">Organize your materials with categories and tags</p>
          </div>

          <div className="grid gap-3 xs:gap-4 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm xs:text-base sm:text-lg">Categories</CardTitle>
                <CardDescription className="text-[0.65rem] xs:text-xs sm:text-sm">Manage your material categories</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 xs:space-y-4">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-2 xs:p-3 border rounded-lg">
                    <div className="flex items-center gap-2 xs:gap-3">
                      <div className={`w-2 h-2 xs:w-3 xs:h-3 rounded-full ${category.color}`} />
                      <span className="font-medium text-[0.65rem] xs:text-xs sm:text-sm">{category.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs">{category.count}</Badge>
                  </div>
                ))}

                <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full mt-3 xs:mt-4 text-[0.65rem] xs:text-xs sm:text-sm">
                      <Plus className="mr-1 xs:mr-2 h-2.5 w-2.5 xs:h-3 xs:w-3" />
                      Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-full max-w-[95vw] xs:max-w-[90vw] sm:max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-sm xs:text-base sm:text-lg">Add New Category</DialogTitle>
                      <DialogDescription className="text-[0.65rem] xs:text-xs sm:text-sm">Create a new category to organize your materials</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 xs:space-y-4">
                      <div className="space-y-1 xs:space-y-2">
                        <Label className="text-[0.65rem] xs:text-xs sm:text-sm">Category Name</Label>
                        <Input
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder="Enter category name"
                          className="text-[0.65rem] xs:text-xs sm:text-sm"
                        />
                      </div>
                      <div className="space-y-1 xs:space-y-2">
                        <Label className="text-[0.65rem] xs:text-xs sm:text-sm">Color</Label>
                        <div className="flex gap-1 xs:gap-2 flex-wrap">
                          {[
                            "bg-blue-500",
                            "bg-green-500",
                            "bg-purple-500",
                            "bg-orange-500",
                            "bg-red-500",
                            "bg-yellow-500",
                            "bg-pink-500",
                            "bg-indigo-500",
                          ].map((color) => (
                            <button
                              key={color}
                              className={`w-5 h-5 xs:w-6 xs:h-6 rounded-full ${color} ${
                                newCategoryColor === color ? "ring-2 ring-offset-2 ring-primary" : ""
                              }`}
                              onClick={() => setNewCategoryColor(color)}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" className="text-[0.65rem] xs:text-xs sm:text-sm" onClick={() => setIsAddCategoryOpen(false)}>
                        Cancel
                      </Button>
                      <Button className="text-[0.65rem] xs:text-xs sm:text-sm" onClick={handleAddCategory}>Add Category</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm xs:text-base sm:text-lg">Popular Tags</CardTitle>
                <CardDescription className="text-[0.65rem] xs:text-xs sm:text-sm">Most used tags in your materials</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1 xs:gap-2">
                  {Array.from(new Set(uploadedFiles.flatMap((file) => file.tags)))
                    .slice(0, 15)
                    .map((tag, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground text-[0.6rem] xs:text-[0.65rem] sm:text-xs"
                        onClick={() => setSearchQuery(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* View Material Modal */}
      <Dialog open={isViewMaterialOpen} onOpenChange={setIsViewMaterialOpen}>
        <DialogContent className="w-full max-w-[95vw] xs:max-w-[90vw] sm:max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm xs:text-base sm:text-lg">
              {viewingMaterial &&
                (() => {
                  const Icon = getFileIcon(viewingMaterial.type)
                  return <Icon className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5" />
                })()}
              {viewingMaterial?.name}
            </DialogTitle>
            <DialogDescription className="text-[0.65rem] xs:text-xs sm:text-sm">{viewingMaterial?.description}</DialogDescription>
          </DialogHeader>

          {viewingMaterial && (
            <div className="space-y-3 xs:space-y-4">
              {/* PDF Viewer */}
              {viewingMaterial.type === "document" && (
                <div className="space-y-3 xs:space-y-4">
                  <div className="aspect-[4/3] bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
                    <div className="text-center">
                      <FileText className="h-12 w-12 xs:h-14 xs:w-14 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-2 xs:mb-3 sm:mb-4" />
                      <p className="text-[0.65rem] xs:text-xs sm:text-sm font-medium">PDF Document</p>
                      <p className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs text-muted-foreground">
                        {formatFileSize(viewingMaterial.size)} • {viewingMaterial.category}
                      </p>
                      <Button className="mt-2 xs:mt-3 sm:mt-4 text-[0.65rem] xs:text-xs sm:text-sm" onClick={() => window.open("#", "_blank")}>
                        Open in New Tab
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 xs:gap-4 text-[0.65rem] xs:text-xs sm:text-sm">
                    <div>
                      <strong>Category:</strong> {viewingMaterial.category}
                    </div>
                    <div>
                      <strong>Upload Date:</strong> {viewingMaterial.uploadDate.toLocaleDateString()}
                    </div>
                    <div>
                      <strong>File Size:</strong> {formatFileSize(viewingMaterial.size)}
                    </div>
                    <div>
                      <strong>Status:</strong> {viewingMaterial.status}
                    </div>
                  </div>
                </div>
              )}

              {/* Video Player */}
              {viewingMaterial.type === "video" && (
                <div className="space-y-3 xs:space-y-4">
                  <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                    <div className="text-center text-white">
                      <Video className="h-12 w-12 xs:h-14 xs:w-14 sm:h-16 sm:w-16 mx-auto mb-2 xs:mb-3 sm:mb-4" />
                      <p className="text-[0.65rem] xs:text-xs sm:text-sm font-medium">Video Player</p>
                      <p className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs opacity-75">{viewingMaterial.name}</p>
                      <Button className="mt-2 xs:mt-3 sm:mt-4 text-[0.65rem] xs:text-xs sm:text-sm" variant="secondary">
                        <Play className="mr-1 xs:mr-2 h-2.5 w-2.5 xs:h-3 xs:w-3" />
                        Play Video
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 xs:gap-4 text-[0.65rem] xs:text-xs sm:text-sm">
                    <div>
                      <strong>Category:</strong> {viewingMaterial.category}
                    </div>
                    <div>
                      <strong>Upload Date:</strong> {viewingMaterial.uploadDate.toLocaleDateString()}
                    </div>
                    <div>
                      <strong>File Size:</strong> {formatFileSize(viewingMaterial.size)}
                    </div>
                    <div>
                      <strong>Format:</strong> MP4
                    </div>
                  </div>
                </div>
              )}

              {/* Audio Player */}
              {viewingMaterial.type === "audio" && (
                <div className="space-y-3 xs:space-y-4">
                  <div className="bg-muted rounded-lg p-4 xs:p-6 sm:p-8">
                    <div className="text-center mb-4 xs:mb-5 sm:mb-6">
                      <Headphones className="h-12 w-12 xs:h-14 xs:w-14 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-2 xs:mb-3 sm:mb-4" />
                      <p className="text-[0.65rem] xs:text-xs sm:text-sm font-medium">{viewingMaterial.name}</p>
                      <p className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs text-muted-foreground">{viewingMaterial.category}</p>
                    </div>

                    {/* Audio Controls */}
                    <div className="space-y-3 xs:space-y-4">
                      <div className="flex items-center justify-center gap-2 xs:gap-3 sm:gap-4">
                        <Button size="sm" variant="outline" className="p-1 xs:p-2 text-[0.65rem] xs:text-xs sm:text-sm">
                          <Play className="h-2.5 w-2.5 xs:h-3 xs:w-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="p-1 xs:p-2 text-[0.65rem] xs:text-xs sm:text-sm">
                          <Pause className="h-2.5 w-2.5 xs:h-3 xs:w-3" />
                        </Button>
                        <div className="flex items-center gap-1 xs:gap-2">
                          <Volume2 className="h-2.5 w-2.5 xs:h-3 xs:w-3" />
                          <div className="w-16 xs:w-20 sm:w-24 h-1.5 xs:h-2 bg-muted-foreground/20 rounded-full">
                            <div className="w-3/4 h-full bg-primary rounded-full" />
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1 xs:space-y-2">
                        <div className="w-full h-1.5 xs:h-2 bg-muted-foreground/20 rounded-full">
                          <div className="w-1/3 h-full bg-primary rounded-full" />
                        </div>
                        <div className="flex justify-between text-[0.6rem] xs:text-[0.65rem] sm:text-xs text-muted-foreground">
                          <span>1:23</span>
                          <span>3:45</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 xs:gap-4 text-[0.65rem] xs:text-xs sm:text-sm">
                    <div>
                      <strong>Category:</strong> {viewingMaterial.category}
                    </div>
                    <div>
                      <strong>Upload Date:</strong> {viewingMaterial.uploadDate.toLocaleDateString()}
                    </div>
                    <div>
                      <strong>File Size:</strong> {formatFileSize(viewingMaterial.size)}
                    </div>
                    <div>
                      <strong>Format:</strong> MP3
                    </div>
                  </div>
                </div>
              )}

              {/* Image Viewer */}
              {viewingMaterial.type === "image" && (
                <div className="space-y-3 xs:space-y-4">
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border">
                    <div className="text-center">
                      <ImageIcon className="h-12 w-12 xs:h-14 xs:w-14 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-2 xs:mb-3 sm:mb-4" />
                      <p className="text-[0.65rem] xs:text-xs sm:text-sm font-medium">Image Preview</p>
                      <p className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs text-muted-foreground">{viewingMaterial.name}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 xs:gap-4 text-[0.65rem] xs:text-xs sm:text-sm">
                    <div>
                      <strong>Category:</strong> {viewingMaterial.category}
                    </div>
                    <div>
                      <strong>Upload Date:</strong> {viewingMaterial.uploadDate.toLocaleDateString()}
                    </div>
                    <div>
                      <strong>File Size:</strong> {formatFileSize(viewingMaterial.size)}
                    </div>
                    <div>
                      <strong>Format:</strong> PNG/JPG
                    </div>
                  </div>
                </div>
              )}

              {/* Tags */}
              {viewingMaterial.tags.length > 0 && (
                <div className="space-y-1 xs:space-y-2">
                  <Label className="text-[0.65rem] xs:text-xs sm:text-sm">Tags</Label>
                  <div className="flex gap-1 xs:gap-2 flex-wrap">
                    {viewingMaterial.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" className="text-[0.65rem] xs:text-xs sm:text-sm" onClick={() => setIsViewMaterialOpen(false)}>
              Close
            </Button>
            <Button
              className="text-[0.65rem] xs:text-xs sm:text-sm"
              onClick={() => {
                setIsViewMaterialOpen(false)
                if (viewingMaterial) handleEditFile(viewingMaterial)
              }}
            >
              <Edit className="mr-1 xs:mr-2 h-2.5 w-2.5 xs:h-3 xs:w-3" />
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Material Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="w-full max-w-[95vw] xs:max-w-[90vw] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-sm xs:text-base sm:text-lg">Edit Material</DialogTitle>
            <DialogDescription className="text-[0.65rem] xs:text-xs sm:text-sm">Update the details of your material</DialogDescription>
          </DialogHeader>
          {editingFile && (
            <div className="space-y-3 xs:space-y-4">
              <div className="space-y-1 xs:space-y-2">
                <Label className="text-[0.65rem] xs:text-xs sm:text-sm">Name</Label>
                <Input
                  value={editingFile.name}
                  onChange={(e) => setEditingFile({ ...editingFile, name: e.target.value })}
                  className="text-[0.65rem] xs:text-xs sm:text-sm"
                />
              </div>
              <div className="space-y-1 xs:space-y-2">
                <Label className="text-[0.65rem] xs:text-xs sm:text-sm">Category</Label>
                <Select
                  value={editingFile.category}
                  onValueChange={(value) => setEditingFile({ ...editingFile, category: value })}
                >
                  <SelectTrigger className="text-[0.65rem] xs:text-xs sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name} className="text-[0.65rem] xs:text-xs sm:text-sm">
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1 xs:space-y-2">
                <Label className="text-[0.65rem] xs:text-xs sm:text-sm">Description</Label>
                <Textarea
                  value={editingFile.description || ""}
                  onChange={(e) => setEditingFile({ ...editingFile, description: e.target.value })}
                  rows={3}
                  className="text-[0.65rem] xs:text-xs sm:text-sm"
                />
              </div>
              <div className="space-y-1 xs:space-y-2">
                <Label className="text-[0.65rem] xs:text-xs sm:text-sm">Tags</Label>
                <Input
                  value={editingFile.tags.join(", ")}
                  onChange={(e) =>
                    setEditingFile({
                      ...editingFile,
                      tags: e.target.value
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="react, tutorial, beginner"
                  className="text-[0.65rem] xs:text-xs sm:text-sm"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" className="text-[0.65rem] xs:text-xs sm:text-sm" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="text-[0.65rem] xs:text-xs sm:text-sm" onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
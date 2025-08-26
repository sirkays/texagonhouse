"use client";

import type React from "react";

import {useState, useCallback, useMemo} from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
} from "lucide-react";

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  category: string;
  uploadDate: Date;
  status: "uploading" | "completed" | "failed";
  progress: number;
  description?: string;
  tags: string[];
  fileUrl?: string;
  originalFile?: File;
}

interface Category {
  id: string;
  name: string;
  color: string;
  count: number;
}

export function TeacherMaterialUploader() {
  const [dragActive, setDragActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [editingFile, setEditingFile] = useState<UploadedFile | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("bg-blue-500");
  const [viewingMaterial, setViewingMaterial] = useState<UploadedFile | null>(
    null
  );
  const [isViewMaterialOpen, setIsViewMaterialOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const filesPerPage = 4;

  const [categories, setCategories] = useState<Category[]>([
    {id: "1", name: "Frontend Development", color: "bg-blue-500", count: 45},
    {id: "2", name: "Backend Development", color: "bg-green-500", count: 32},
    {id: "3", name: "Database", color: "bg-purple-500", count: 18},
    {id: "4", name: "Programming", color: "bg-orange-500", count: 67},
    {id: "5", name: "AI/Machine Learning", color: "bg-red-500", count: 23},
    {id: "6", name: "General", color: "bg-gray-500", count: 12},
  ]);

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
      description:
        "Comprehensive guide to React Hooks covering useState, useEffect, and custom hooks",
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
      description:
        "Audio lecture on database normalization and design principles",
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
  ]);

  const [currentUpload, setCurrentUpload] = useState<{
    title: string;
    description: string;
    category: string;
    tags: string;
  }>({
    title: "",
    description: "",
    category: "",
    tags: "",
  });

  // Filter files based on search and category
  const filteredFiles = useMemo(() => {
    return uploadedFiles.filter((file) => {
      const matchesSearch =
        file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesCategory =
        selectedCategory === "All" || file.category === selectedCategory;
      const matchesType = selectedType === "All" || file.type === selectedType;

      return matchesSearch && matchesCategory && matchesType;
    });
  }, [uploadedFiles, searchQuery, selectedCategory, selectedType]);

  // Pagination logic
  const totalPages = Math.ceil(filteredFiles.length / filesPerPage);
  const indexOfLastFile = currentPage * filesPerPage;
  const indexOfFirstFile = indexOfLastFile - filesPerPage;
  const currentFiles = filteredFiles.slice(indexOfFirstFile, indexOfLastFile);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleFiles = (files: FileList) => {
    Array.from(files).forEach((file) => {
      const fileUrl = URL.createObjectURL(file);

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
      };

      setUploadedFiles((prev) => [...prev, newFile]);
      simulateUpload(newFile.id);
    });
  };

  const simulateUpload = (fileId: string) => {
    const interval = setInterval(() => {
      setUploadedFiles((prev) =>
        prev.map((file) => {
          if (file.id === fileId) {
            const newProgress = Math.min(
              file.progress + Math.random() * 20,
              100
            );
            return {
              ...file,
              progress: newProgress,
              status: newProgress === 100 ? "completed" : "uploading",
            };
          }
          return file;
        })
      );
    }, 500);

    setTimeout(() => clearInterval(interval), 5000);
  };

  const getFileType = (mimeType: string): string => {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    if (mimeType.startsWith("audio/")) return "audio";
    if (mimeType.includes("pdf") || mimeType.includes("document"))
      return "document";
    return "file";
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "image":
        return ImageIcon;
      case "video":
        return Video;
      case "audio":
        return Headphones;
      case "document":
        return FileText;
      default:
        return File;
    }
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

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const handleEditFile = (file: UploadedFile) => {
    setEditingFile(file);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingFile) {
      setUploadedFiles((prev) =>
        prev.map((file) => (file.id === editingFile.id ? editingFile : file))
      );
      setIsEditDialogOpen(false);
      setEditingFile(null);
    }
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory: Category = {
        id: Date.now().toString(),
        name: newCategoryName.trim(),
        color: newCategoryColor,
        count: 0,
      };
      setCategories((prev) => [...prev, newCategory]);
      setNewCategoryName("");
      setIsAddCategoryOpen(false);
    }
  };

  const uniqueCategories = Array.from(
    new Set(uploadedFiles.map((file) => file.category))
  );
  const fileTypes = ["All", "document", "video", "audio", "image"];

  const handleViewMaterial = (file: UploadedFile) => {
    setViewingMaterial(file);
    setIsViewMaterialOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Material Uploader</h1>
        <p className="text-muted-foreground">
          Upload and manage your teaching materials
        </p>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList
          className="
    flex flex-col sm:flex-row 
    gap-2 sm:gap-4 
    w-full sm:w-auto
  ">
          <TabsTrigger
            value="upload"
            className="flex-1 sm:flex-none text-xs sm:text-sm md:text-base">
            Upload Materials
          </TabsTrigger>
          <TabsTrigger
            value="library"
            className="flex-1 sm:flex-none text-xs sm:text-sm md:text-base">
            Materials Library
          </TabsTrigger>
          <TabsTrigger
            value="organize"
            className="flex-1 sm:flex-none text-xs sm:text-sm md:text-base">
            Organize & Tag
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Upload Area */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Files</CardTitle>
                <CardDescription>
                  Drag and drop files or click to browse
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}>
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Drop files here</h3>
                  <p className="text-muted-foreground mb-4">
                    Support for PDF, images, videos, audio files, and documents
                  </p>
                  <Button
                    onClick={() =>
                      document.getElementById("file-upload")?.click()
                    }>
                    Browse Files
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) =>
                      e.target.files && handleFiles(e.target.files)
                    }
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.mp4,.mov,.avi,.mp3,.wav"
                  />
                </div>

                <div className="mt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select
                        value={currentUpload.category}
                        onValueChange={(value) =>
                          setCurrentUpload((prev) => ({
                            ...prev,
                            category: value,
                          }))
                        }>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Tags</Label>
                      <Input
                        value={currentUpload.tags}
                        onChange={(e) =>
                          setCurrentUpload((prev) => ({
                            ...prev,
                            tags: e.target.value,
                          }))
                        }
                        placeholder="react, tutorial, beginner"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={currentUpload.description}
                      onChange={(e) =>
                        setCurrentUpload((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Describe this material..."
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upload Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Progress</CardTitle>
                <CardDescription>Track your file uploads</CardDescription>
              </CardHeader>
              <CardContent>
                {uploadedFiles.filter((f) => f.status === "uploading")
                  .length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Folder className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No active uploads</p>
                    <p className="text-sm">Upload files to see progress here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {uploadedFiles
                      .filter((f) => f.status === "uploading")
                      .map((file) => {
                        const Icon = getFileIcon(file.type);
                        return (
                          <div
                            key={file.id}
                            className="flex items-center space-x-3 p-3 border rounded-lg">
                            <Icon className="h-8 w-8 text-muted-foreground" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {file.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(file.size)} • {file.category}
                              </p>
                              <Progress
                                value={file.progress}
                                className="h-1 mt-2"
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="text-xs text-muted-foreground">
                                {Math.round(file.progress)}%
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(file.id)}>
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="library" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Materials Library</h2>
              <p className="text-muted-foreground">
                Browse and manage all your uploaded materials
              </p>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className="flex gap-4 flex-wrap">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                {uniqueCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="File type" />
              </SelectTrigger>
              <SelectContent>
                {fileTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type === "All"
                      ? "All Types"
                      : type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Results count */}
          <div className="text-sm text-muted-foreground">
            Showing {currentFiles.length} of {filteredFiles.length} materials
          </div>

          {/* Materials Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {currentFiles.map((file) => {
              const Icon = getFileIcon(file.type);
              return (
                <Card
                  key={file.id}
                  className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Icon className="h-8 w-8 text-muted-foreground" />
                      <Badge variant="outline">{file.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm line-clamp-2">
                        {file.name}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatFileSize(file.size)} •{" "}
                        {file.uploadDate.toLocaleDateString()}
                      </p>
                    </div>

                    {file.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {file.description}
                      </p>
                    )}

                    {file.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {file.tags.slice(0, 3).map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {file.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{file.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleViewMaterial(file)}>
                        <Eye className="mr-1 h-3 w-3" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditFile(file)}>
                        <Edit className="mr-1 h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeFile(file.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredFiles.length === 0 ? (
            <div className="text-center py-12">
              <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No materials found</h3>
              <p className="text-muted-foreground">
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
                {Array.from({length: totalPages}, (_, index) => index + 1).map(
                  (page) => (
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
                  )
                )}
                {totalPages > 5 && <PaginationEllipsis />}
                <PaginationNext
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationContent>
            </Pagination>
          )}
        </TabsContent>

        <TabsContent value="organize" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Organize & Tag</h2>
            <p className="text-muted-foreground">
              Organize your materials with categories and tags
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
                <CardDescription>
                  Manage your material categories
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${category.color}`}
                      />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <Badge variant="secondary">{category.count}</Badge>
                  </div>
                ))}

                <Dialog
                  open={isAddCategoryOpen}
                  onOpenChange={setIsAddCategoryOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full mt-4">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Category</DialogTitle>
                      <DialogDescription>
                        Create a new category to organize your materials
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Category Name</Label>
                        <Input
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder="Enter category name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Color</Label>
                        <div className="flex gap-2">
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
                              className={`w-6 h-6 rounded-full ${color} ${
                                newCategoryColor === color
                                  ? "ring-2 ring-offset-2 ring-primary"
                                  : ""
                              }`}
                              onClick={() => setNewCategoryColor(color)}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsAddCategoryOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddCategory}>Add Category</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Popular Tags</CardTitle>
                <CardDescription>
                  Most used tags in your materials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {Array.from(
                    new Set(uploadedFiles.flatMap((file) => file.tags))
                  )
                    .slice(0, 15)
                    .map((tag, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => setSearchQuery(tag)}>
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
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {viewingMaterial &&
                (() => {
                  const Icon = getFileIcon(viewingMaterial.type);
                  return <Icon className="h-5 w-5" />;
                })()}
              {viewingMaterial?.name}
            </DialogTitle>
            <DialogDescription>
              {viewingMaterial?.description}
            </DialogDescription>
          </DialogHeader>

          {viewingMaterial && (
            <div className="space-y-4">
              {/* PDF Viewer */}
              {viewingMaterial.type === "document" && (
                <div className="space-y-4">
                  <div className="aspect-[4/3] bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
                    <div className="text-center">
                      <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-medium">PDF Document</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(viewingMaterial.size)} •{" "}
                        {viewingMaterial.category}
                      </p>
                      <Button
                        className="mt-4"
                        onClick={() => window.open("#", "_blank")}>
                        Open in New Tab
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Category:</strong> {viewingMaterial.category}
                    </div>
                    <div>
                      <strong>Upload Date:</strong>{" "}
                      {viewingMaterial.uploadDate.toLocaleDateString()}
                    </div>
                    <div>
                      <strong>File Size:</strong>{" "}
                      {formatFileSize(viewingMaterial.size)}
                    </div>
                    <div>
                      <strong>Status:</strong> {viewingMaterial.status}
                    </div>
                  </div>
                </div>
              )}

              {/* Video Player */}
              {viewingMaterial.type === "video" && (
                <div className="space-y-4">
                  <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                    <div className="text-center text-white">
                      <Video className="h-16 w-16 mx-auto mb-4" />
                      <p className="text-lg font-medium">Video Player</p>
                      <p className="text-sm opacity-75">
                        {viewingMaterial.name}
                      </p>
                      <Button className="mt-4" variant="secondary">
                        <Play className="mr-2 h-4 w-4" />
                        Play Video
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Category:</strong> {viewingMaterial.category}
                    </div>
                    <div>
                      <strong>Upload Date:</strong>{" "}
                      {viewingMaterial.uploadDate.toLocaleDateString()}
                    </div>
                    <div>
                      <strong>File Size:</strong>{" "}
                      {formatFileSize(viewingMaterial.size)}
                    </div>
                    <div>
                      <strong>Format:</strong> MP4
                    </div>
                  </div>
                </div>
              )}

              {/* Audio Player */}
              {viewingMaterial.type === "audio" && (
                <div className="space-y-4">
                  <div className="bg-muted rounded-lg p-8">
                    <div className="text-center mb-6">
                      <Headphones className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-medium">
                        {viewingMaterial.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {viewingMaterial.category}
                      </p>
                    </div>

                    {/* Audio Controls */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-center gap-4">
                        <Button size="sm" variant="outline">
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Pause className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-2">
                          <Volume2 className="h-4 w-4" />
                          <div className="w-20 h-2 bg-muted-foreground/20 rounded-full">
                            <div className="w-3/4 h-full bg-primary rounded-full" />
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="w-full h-2 bg-muted-foreground/20 rounded-full">
                          <div className="w-1/3 h-full bg-primary rounded-full" />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>1:23</span>
                          <span>3:45</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Category:</strong> {viewingMaterial.category}
                    </div>
                    <div>
                      <strong>Upload Date:</strong>{" "}
                      {viewingMaterial.uploadDate.toLocaleDateString()}
                    </div>
                    <div>
                      <strong>File Size:</strong>{" "}
                      {formatFileSize(viewingMaterial.size)}
                    </div>
                    <div>
                      <strong>Format:</strong> MP3
                    </div>
                  </div>
                </div>
              )}

              {/* Image Viewer */}
              {viewingMaterial.type === "image" && (
                <div className="space-y-4">
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border">
                    <div className="text-center">
                      <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-medium">Image Preview</p>
                      <p className="text-sm text-muted-foreground">
                        {viewingMaterial.name}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Category:</strong> {viewingMaterial.category}
                    </div>
                    <div>
                      <strong>Upload Date:</strong>{" "}
                      {viewingMaterial.uploadDate.toLocaleDateString()}
                    </div>
                    <div>
                      <strong>File Size:</strong>{" "}
                      {formatFileSize(viewingMaterial.size)}
                    </div>
                    <div>
                      <strong>Format:</strong> PNG/JPG
                    </div>
                  </div>
                </div>
              )}

              {/* Tags */}
              {viewingMaterial.tags.length > 0 && (
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex gap-2 flex-wrap">
                    {viewingMaterial.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewMaterialOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setIsViewMaterialOpen(false);
                if (viewingMaterial) handleEditFile(viewingMaterial);
              }}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Material Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Material</DialogTitle>
            <DialogDescription>
              Update the details of your material
            </DialogDescription>
          </DialogHeader>
          {editingFile && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={editingFile.name}
                  onChange={(e) =>
                    setEditingFile({...editingFile, name: e.target.value})
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={editingFile.category}
                  onValueChange={(value) =>
                    setEditingFile({...editingFile, category: value})
                  }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editingFile.description || ""}
                  onChange={(e) =>
                    setEditingFile({
                      ...editingFile,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Tags</Label>
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
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

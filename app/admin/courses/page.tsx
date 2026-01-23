"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/app/admin/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Users,
  BookOpen,
  Clock,
  Edit,
  Trash2,
  Eye,
  Loader2,
  Settings2,
} from "lucide-react";
import { CourseModal } from "@/components/admin/modals/course-modal";
import { DeleteConfirmationModal } from "@/components/admin/modals/delete-confirmation-modal";
import { ViewDetailsModal } from "@/components/admin/modals/view-details-modal";
import { useToast } from "@/hooks/use-toast";
import { CourseCriteriaModal } from "@/components/admin/modals/course-criteria-modal";
import { Spinner } from "@/components/ui/spinner";

interface Course {
  id: number;
  name: string;
  subject: string;
  teacher: string;
  classroom: string;
  students: number;
  modules: number;
  status: "active" | "inactive";
  progress: number;
  description?: string;
}

interface Options {
  subjects: { id: number; name: string }[];
  classrooms: { id: number; name: string }[];
  teachers: { id: number; name: string; email: string }[];
}

interface Stats {
  active_courses: number;
  total_enrollments: number;
}

export default function CoursesPage() {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);

  const [stats, setStats] = useState<Stats>({
    active_courses: 0,
    total_enrollments: 0,
  });
  const [options, setOptions] = useState<Options>({
    subjects: [],
    classrooms: [],
    teachers: [],
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [criteriaModalOpen, setCriteriaModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenCriteria = (course: Course) => {
    setSelectedCourse(course);
    setCriteriaModalOpen(true);
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/courses/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch course stats.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
      toast({
        title: "Error",
        description: "Failed to fetch course stats.",
        variant: "destructive",
      });
    }
  };

  const fetchOptions = async () => {
    try {
      const res = await fetch("/api/admin/courses/options");
      if (res.ok) {
        const data = await res.json();
        setOptions(data);
      }
    } catch (err) {
      console.error("Error fetching options:", err);
    }
  };

  const fetchCourses = async (
    search = "",
    status = "",
    page = 1,
    page_size = 100
  ) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        status,
        page: page.toString(),
        page_size: page_size.toString(),
      });
      const res = await fetch(`/api/admin/courses?${params}`);
      if (res.ok) {
        const data = await res.json();
        setCourses(data.results || []);
      } else {
        const errData = await res.json();
        toast({
          title: "Error",
          description: errData.detail || "Failed to fetch courses.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
      toast({
        title: "Error",
        description: "Failed to fetch courses.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchOptions();
    fetchCourses(searchQuery);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchCourses(searchQuery);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleAddCourse = () => {
    setSelectedCourse(null);
    setCourseModalOpen(true);
  };

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setCourseModalOpen(true);
  };

  const handleViewCourse = async (course: Course) => {
    try {
      const res = await fetch(`/api/admin/courses/${course.id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedCourse(data);
        setViewModalOpen(true);
      } else {
        const errData = await res.json();
        toast({
          title: "Error",
          description: errData.detail || "Failed to fetch course details.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error fetching course details:", err);
      toast({
        title: "Error",
        description: "Failed to fetch course details.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCourse = (course: Course) => {
    setSelectedCourse(course);
    setDeleteModalOpen(true);
  };

  const handleSaveCourse = async (courseData: any) => {
    setIsSaving(true); // Start loading
    try {
      let res;
      if (selectedCourse?.id) {
        res = await fetch(`/api/admin/courses/${selectedCourse.id}/update`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(courseData),
        });

        if (res.ok) {
          toast({
            title: "Course Updated",
            description: `${courseData.name} has been updated successfully.`,
          });
        }
      } else {
        res = await fetch("/api/admin/courses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(courseData),
        });

        if (res.ok) {
          toast({
            title: "Course Created",
            description: `${courseData.name} has been created successfully.`,
          });
        }
      }

      if (!res.ok) {
        const errData = await res.json();
        toast({
          title: "Error",
          description: errData.detail || "Failed to save course.",
          variant: "destructive",
        });
        // Do NOT close modal on error
        return;
      }

      fetchCourses(searchQuery);
      // Close modal only on success
      setCourseModalOpen(false);
    } catch (err) {
      console.error("Error saving course:", err);
      toast({
        title: "Error",
        description: "Failed to save course.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false); // Stop loading
    }
  };

  const confirmDelete = async () => {
    if (!selectedCourse) return;
    setIsDeleting(true); // Start loading
    try {
      const res = await fetch(
        `/api/admin/courses/${selectedCourse.id}/delete`,
        {
          method: "DELETE",
        }
      );
      if (res.ok) {
        const data = await res.json();
        toast({
          title: "Course Deleted",
          description:
            data.detail ||
            `${selectedCourse.name} has been removed from the system.`,
        });
        fetchCourses(searchQuery);
        // Close modal only on success
        setDeleteModalOpen(false);
      } else {
        const errData = await res.json();
        toast({
          title: res.status === 400 ? "Cannot Delete" : "Error",
          description: errData.detail || "Failed to delete course.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error deleting course:", err);
      toast({
        title: "Error",
        description: "Failed to delete course.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false); // Stop loading
    }
  };

  if (loading && courses.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="sm:flex items-center justify-between space-y-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Courses
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage courses and learning content
            </p>
          </div>
          <Button onClick={handleAddCourse}>
            <Plus className="mr-2 h-4 w-4" />
            Create Course
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="md:col-span-2">
            <CardContent className="pt-6">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats.active_courses}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Enrollments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats.total_enrollments}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {courses.map((course) => (
            <Card
              key={course.id}
              className="hover:shadow-lg transition-shadow flex flex-col h-full"
            >
              <CardHeader className="pb-3">
                {/* Grid layout prevents the badge from being pushed off screen */}
                <div className="grid grid-cols-[1fr_auto] gap-3 items-start">
                  <div className="min-w-0 space-y-1">
                    <CardTitle
                      className="text-lg sm:text-xl truncate leading-tight"
                      title={course.name}
                    >
                      {course.name}
                    </CardTitle>
                    <div className="flex items-center">
                      <Badge
                        variant="secondary"
                        className="truncate max-w-full"
                      >
                        {course.subject}
                      </Badge>
                    </div>
                  </div>
                  <Badge
                    className="shrink-0"
                    variant={
                      course.status === "active" ? "default" : "secondary"
                    }
                  >
                    {course.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col gap-5">
                {/* Teacher Info */}
                <div className="flex items-center gap-3 pb-3 border-b border-border min-w-0">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage
                      src={`/.jpg?height=40&width=40&query=${course.teacher}`}
                    />
                    <AvatarFallback>
                      {course.teacher
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      {course.teacher}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {course.classroom}
                    </p>
                  </div>
                </div>

                {/* Course Stats - Reduced gap on mobile to fit 3 cols */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 text-sm">
                  <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-muted/50 text-center">
                    <Users className="h-4 w-4 text-muted-foreground mb-1" />
                    <span className="font-semibold text-foreground text-sm sm:text-base">
                      {course.students}
                    </span>
                    <span className="text-[10px] sm:text-xs text-muted-foreground">
                      Students
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-muted/50 text-center">
                    <BookOpen className="h-4 w-4 text-muted-foreground mb-1" />
                    <span className="font-semibold text-foreground text-sm sm:text-base">
                      {course.modules}
                    </span>
                    <span className="text-[10px] sm:text-xs text-muted-foreground">
                      Modules
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-muted/50 text-center">
                    <Clock className="h-4 w-4 text-muted-foreground mb-1" />
                    <span className="font-semibold text-foreground text-sm sm:text-base">
                      {course.progress}%
                    </span>
                    <span className="text-[10px] sm:text-xs text-muted-foreground">
                      Progress
                    </span>
                  </div>
                </div>

                {/* Buttons - The Smart Wrapping Logic */}
                <div className="mt-auto pt-2">
                  <div className="flex flex-wrap gap-2">
                    {/* VIEW: Grows to fill space */}
                    <Button
                      className="flex-1 min-w-[70px] bg-transparent"
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewCourse(course)}
                    >
                      <Eye className="mr-1 h-3.5 w-3.5" />
                      View
                    </Button>

                    {/* EDIT: Square button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="px-3"
                      onClick={() => handleEditCourse(course)}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>

                    {/* DELETE: Square button */}
                    {/* <Button
                      variant="outline"
                      size="sm"
                      className="px-3 hover:bg-red-50 hover:text-red-600 border-red-200"
                      onClick={() => handleDeleteCourse(course)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button> */}

                    {/* CRITERIA: Grows to fill space. On tiny screens, this wraps to a new line and becomes full width */}
                    <Button
                      className="flex-1 min-w-[85px] bg-transparent"
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenCriteria(course)}
                    >
                      <Settings2 className="mr-1 h-3.5 w-3.5" />
                      Criteria
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {loading && courses.length > 0 && (
            <div className="col-span-full flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
          {courses.length === 0 && !loading && (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No courses found.
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CourseModal
        open={courseModalOpen}
        onOpenChange={(open) => {
          if (isSaving) return; // Prevent closing while saving
          setCourseModalOpen(open);
        }}
        course={selectedCourse}
        onSave={handleSaveCourse}
        options={options}
        loading={isSaving} // Pass loading state
      />

      <DeleteConfirmationModal
        open={deleteModalOpen}
        onOpenChange={(open) => {
          if (isDeleting) return; // Prevent closing while deleting
          setDeleteModalOpen(open);
        }}
        onConfirm={confirmDelete}
        title="Delete Course"
        description={`Are you sure you want to delete ${selectedCourse?.name}? This action cannot be undone.`}
        loading={isDeleting} // Pass loading state
      />
      <ViewDetailsModal
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        title="Course Details"
        data={selectedCourse}
        type="course"
      />
      <CourseCriteriaModal
        open={criteriaModalOpen}
        onOpenChange={setCriteriaModalOpen}
        courseId={selectedCourse?.id ?? null}
        courseName={selectedCourse?.name}
      />
    </>
  );
}

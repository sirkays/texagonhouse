"use client";

import {useState, useEffect} from "react";
import DashboardLayout from "@/app/admin/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Input} from "@/components/ui/input";
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
} from "lucide-react";
import {CourseModal} from "@/components/admin/modals/course-modal";
import {DeleteConfirmationModal} from "@/components/admin/modals/delete-confirmation-modal";
import {ViewDetailsModal} from "@/components/admin/modals/view-details-modal";
import {useToast} from "@/hooks/use-toast";

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
  subjects: {id: number; name: string}[];
  classrooms: {id: number; name: string}[];
  teachers: {id: number; name: string; email: string}[];
}

interface Stats {
  active_courses: number;
  total_enrollments: number;
}

export default function CoursesPage() {
  const {toast} = useToast();
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
        toast({
          title: "Course Updated",
          description: `${courseData.name} has been updated successfully.`,
        });
      } else {
        res = await fetch("/api/admin/courses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(courseData),
        });
        toast({
          title: "Course Created",
          description: `${courseData.name} has been created successfully.`,
        });
      }
      if (!res.ok) {
        const errData = await res.json();
        toast({
          title: "Error",
          description: errData.detail || "Failed to save course.",
          variant: "destructive",
        });
        return;
      }
      fetchCourses(searchQuery);
    } catch (err) {
      console.error("Error saving course:", err);
      toast({
        title: "Error",
        description: "Failed to save course.",
        variant: "destructive",
      });
    }
    setCourseModalOpen(false);
  };

  const confirmDelete = async () => {
    if (!selectedCourse) return;
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
    }
    setDeleteModalOpen(false);
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
              <div className="relative">
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
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{course.name}</CardTitle>
                    <CardDescription className="mt-1">
                      <Badge variant="secondary">{course.subject}</Badge>
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      course.status === "active" ? "default" : "secondary"
                    }>
                    {course.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Teacher Info */}
                  <div className="flex items-center gap-3 pb-3 border-b border-border">
                    <Avatar className="h-10 w-10">
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
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {course.teacher}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {course.classroom}
                      </p>
                    </div>
                  </div>

                  {/* Course Stats */}
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
                      <Users className="h-4 w-4 text-muted-foreground mb-1" />
                      <span className="font-semibold text-foreground">
                        {course.students}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Students
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
                      <BookOpen className="h-4 w-4 text-muted-foreground mb-1" />
                      <span className="font-semibold text-foreground">
                        {course.modules}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Modules
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
                      <Clock className="h-4 w-4 text-muted-foreground mb-1" />
                      <span className="font-semibold text-foreground">
                        {course.progress}%
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Progress
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-transparent"
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewCourse(course)}>
                      <Eye className="mr-1 h-3 w-3" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditCourse(course)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteCourse(course)}>
                      <Trash2 className="h-3 w-3 text-destructive" />
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

      <CourseModal
        open={courseModalOpen}
        onOpenChange={setCourseModalOpen}
        course={selectedCourse}
        onSave={handleSaveCourse}
        options={options}
      />
      <DeleteConfirmationModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={confirmDelete}
        title="Delete Course"
        description={`Are you sure you want to delete ${selectedCourse?.name}? This action cannot be undone.`}
      />
      <ViewDetailsModal
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        title="Course Details"
        data={selectedCourse}
        type="course"
      />
    </>
  );
}

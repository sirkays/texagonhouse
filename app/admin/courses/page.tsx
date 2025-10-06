"use client";

import {useState} from "react";
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
} from "lucide-react";
import {CourseModal} from "@/components/admin/modals/course-modal";
import {DeleteConfirmationModal} from "@/components/admin/modals/delete-confirmation-modal";
import {ViewDetailsModal} from "@/components/admin/modals/view-details-modal";
import {useToast} from "@/hooks/use-toast";

export default function CoursesPage() {
  const {toast} = useToast();
  const [courses, setCourses] = useState([
    {
      id: 1,
      name: "Advanced Mathematics",
      subject: "Mathematics",
      teacher: "Dr. Robert Smith",
      classroom: "Grade 12A",
      students: 27,
      modules: 12,
      status: "active",
      progress: 65,
    },
    {
      id: 2,
      name: "Quantum Physics",
      subject: "Physics",
      teacher: "Prof. Maria Garcia",
      classroom: "Grade 11A",
      students: 25,
      modules: 10,
      status: "active",
      progress: 45,
    },
    {
      id: 3,
      name: "Organic Chemistry",
      subject: "Chemistry",
      teacher: "Prof. Maria Garcia",
      classroom: "Grade 11B",
      students: 23,
      modules: 8,
      status: "active",
      progress: 72,
    },
    {
      id: 4,
      name: "English Literature",
      subject: "English",
      teacher: "Dr. James Wilson",
      classroom: "Grade 10A",
      students: 32,
      modules: 15,
      status: "active",
      progress: 38,
    },
    {
      id: 5,
      name: "Web Development",
      subject: "Computer Science",
      teacher: "Mr. David Lee",
      classroom: "Grade 12B",
      students: 24,
      modules: 20,
      status: "active",
      progress: 55,
    },
    {
      id: 6,
      name: "World History",
      subject: "History",
      teacher: "Ms. Lisa Anderson",
      classroom: "Grade 10B",
      students: 28,
      modules: 14,
      status: "active",
      progress: 80,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  const filteredCourses = courses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.teacher.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddCourse = () => {
    setSelectedCourse(null);
    setCourseModalOpen(true);
  };

  const handleEditCourse = (course: any) => {
    setSelectedCourse(course);
    setCourseModalOpen(true);
  };

  const handleViewCourse = (course: any) => {
    setSelectedCourse(course);
    setViewModalOpen(true);
  };

  const handleDeleteCourse = (course: any) => {
    setSelectedCourse(course);
    setDeleteModalOpen(true);
  };

  const handleSaveCourse = (course: any) => {
    if (course.id) {
      setCourses(courses.map((c) => (c.id === course.id ? course : c)));
      toast({
        title: "Course Updated",
        description: `${course.name} has been updated successfully.`,
      });
    } else {
      const newCourse = {
        ...course,
        id: Math.max(...courses.map((c) => c.id)) + 1,
        students: 0,
        modules: 0,
        progress: 0,
      };
      setCourses([...courses, newCourse]);
      toast({
        title: "Course Created",
        description: `${course.name} has been created successfully.`,
      });
    }
  };

  const confirmDelete = () => {
    setCourses(courses.filter((c) => c.id !== selectedCourse.id));
    toast({
      title: "Course Deleted",
      description: `${selectedCourse.name} has been removed from the system.`,
      variant: "destructive",
    });
    setDeleteModalOpen(false);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
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
              <div className="text-2xl font-bold text-foreground">156</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Enrollments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">3,421</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {filteredCourses.map((course) => (
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
                          .map((n) => n[0])
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

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Course Progress</span>
                      <span>{course.progress}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{width: `${course.progress}%`}}
                      />
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
        </div>
      </div>

      <CourseModal
        open={courseModalOpen}
        onOpenChange={setCourseModalOpen}
        course={selectedCourse}
        onSave={handleSaveCourse}
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

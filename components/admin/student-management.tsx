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
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {
  Users,
  Search,
  Edit,
  Trash2,
  BookOpen,
  Trophy,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  GraduationCap,
  TrendingUp,
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

// Define Student interface
interface Student {
  id: number;
  name: string;
  email: string;
  school: string;
  grade: string;
  courses: number;
  completedCourses: number;
  averageScore: number;
  status: "Active" | "Suspended" | "Inactive";
  joinDate: string;
  avatar: string;
  lastActive: string;
  subscription: "Premium" | "Basic";
}

export function StudentManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("all");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 5;

  const students: Student[] = [
    {
      id: 1,
      name: "John Adebayo",
      email: "john.adebayo@student.lsmc.edu.ng",
      school: "Lagos State Model College",
      grade: "SS3",
      courses: 8,
      completedCourses: 6,
      averageScore: 85,
      status: "Active",
      joinDate: "2023-09-01",
      avatar: "/placeholder.svg?height=40&width=40",
      lastActive: "2 hours ago",
      subscription: "Premium",
    },
    {
      id: 2,
      name: "Mary Okafor",
      email: "mary.okafor@student.fgc.edu.ng",
      school: "Federal Government College",
      grade: "SS2",
      courses: 7,
      completedCourses: 5,
      averageScore: 92,
      status: "Active",
      joinDate: "2023-09-01",
      avatar: "/placeholder.svg?height=40&width=40",
      lastActive: "1 hour ago",
      subscription: "Premium",
    },
    {
      id: 3,
      name: "David Okoro",
      email: "david.okoro@student.greenfield.edu.ng",
      school: "Greenfield Academy",
      grade: "SS1",
      courses: 6,
      completedCourses: 3,
      averageScore: 78,
      status: "Active",
      joinDate: "2023-09-15",
      avatar: "/placeholder.svg?height=40&width=40",
      lastActive: "5 hours ago",
      subscription: "Basic",
    },
    {
      id: 4,
      name: "Grace Adamu",
      email: "grace.adamu@student.unity.edu.ng",
      school: "Unity High School",
      grade: "SS3",
      courses: 8,
      completedCourses: 7,
      averageScore: 88,
      status: "Suspended",
      joinDate: "2023-08-20",
      avatar: "/placeholder.svg?height=40&width=40",
      lastActive: "2 days ago",
      subscription: "Premium",
    },
    {
      id: 5,
      name: "Samuel Bello",
      email: "samuel.bello@student.brightfuture.edu.ng",
      school: "Bright Future College",
      grade: "SS2",
      courses: 5,
      completedCourses: 2,
      averageScore: 65,
      status: "Inactive",
      joinDate: "2024-01-10",
      avatar: "/placeholder.svg?height=40&width=40",
      lastActive: "1 week ago",
      subscription: "Basic",
    },
  ];

  const schools = [
    "Lagos State Model College",
    "Federal Government College",
    "Greenfield Academy",
    "Unity High School",
    "Bright Future College",
  ];

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.school.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.grade.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSchool =
      selectedSchool === "all" || student.school === selectedSchool;

    return matchesSearch && matchesSchool;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(
    indexOfFirstStudent,
    indexOfLastStudent
  );

  const handleExportStudentData = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Name,Email,School,Grade,Courses,Completed,Average Score,Status,Subscription\n" +
      students
        .map(
          (student) =>
            `${student.name},${student.email},${student.school},${student.grade},${student.courses},${student.completedCourses},${student.averageScore}%,${student.status},${student.subscription}`
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "student_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert("Student data exported successfully!");
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsEditDialogOpen(true);
  };

  const handleDeleteStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedStudent) {
      alert(`Student ${selectedStudent.name} has been deleted successfully!`);
    }
    setIsDeleteDialogOpen(false);
    setSelectedStudent(null);
  };

  const getStatusBadge = (status: "Active" | "Suspended" | "Inactive") => {
    switch (status) {
      case "Active":
        return (
          <Badge className="bg-green-100 text-green-800 flex items-center text-xs sm:text-sm">
            <CheckCircle className="w-2.5 h-2 sm:w-3 sm:h-3 mr-1" />
            Active
          </Badge>
        );
      case "Suspended":
        return (
          <Badge className="bg-red-100 text-red-800 flex items-center text-xs xs:text-sm">
            <XCircle className="w-2.5 h-2 sm:w-3 sm:h-3 mr-1" />
            Suspended
          </Badge>
        );
      case "Inactive":
        return (
          <Badge className="bg-gray-100 text-gray-800 flex items-center text-xs sm:text-sm">
            <Clock className="w-2.5 h-2 sm:w-3 sm:h-3 mr-1" />
            Inactive
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-xs sm:text-sm">
            {status}
          </Badge>
        );
    }
  };

  const getSubscriptionBadge = (subscription: "Premium" | "Basic") => {
    return subscription === "Premium" ? (
      <Badge className="bg-yellow-100 px-2 text-yellow-800 text-xs xs:text-sm">
        Premium
      </Badge>
    ) : (
      <Badge variant="secondary" className="text-xs xs:text-sm">
        Basic
      </Badge>
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressPercentage = (completed: number, total: number) => {
    return Math.round((completed / total) * 100);
  };

  return (
    <div className="space-y-4 xs:p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 xs:gap-4">
        <div>
          <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold">
            Student Management
          </h1>
          <p className="text-muted-foreground text-xs xs:text-sm sm:text-base">
            Monitor and manage all students across the platform
          </p>
        </div>
        <Button
          className="flex items-center gap-2 text-xs sm:text-sm md:text-xs w-full sm:w-auto"
          onClick={handleExportStudentData}>
          <Users className="h-3 w-3 sm:h-4 sm:w-4" />
          Export Student Data
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base xs:text-lg sm:text-xl">
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 xs:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2 xs:left-2.5 xs:top-2.5 h-3 w-3 xs:h-4 xs:w-4 text-muted-foreground" />
              <Input
                placeholder="Search students by name, email, school, or grade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-7 xs:pl-8 text-xs sm:text-sm md:text-xs w-full"
              />
            </div>
            <div className="flex flex-col xs:flex-row gap-3 xs:gap-4">
              <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                <SelectTrigger className="w-full text-xs sm:text-sm md:text-xs">
                  <SelectValue placeholder="Filter by school" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value="all"
                    className="text-xs sm:text-sm md:text-xs">
                    All Schools
                  </SelectItem>
                  {schools.map((school) => (
                    <SelectItem
                      key={school}
                      value={school}
                      className="text-xs sm:text-sm md:text-xs">
                      {school}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-full text-xs sm:text-sm md:text-xs">
                  <SelectValue placeholder="Filter by grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value="all"
                    className="text-xs sm:text-sm md:text-xs">
                    All Grades
                  </SelectItem>
                  <SelectItem
                    value="ss1"
                    className="text-xs sm:text-sm md:text-xs">
                    SS1
                  </SelectItem>
                  <SelectItem
                    value="ss2"
                    className="text-xs sm:text-sm md:text-xs">
                    SS2
                  </SelectItem>
                  <SelectItem
                    value="ss3"
                    className="text-xs sm:text-sm md:text-xs">
                    SS3
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-full text-xs sm:text-sm md:text-xs">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value="all"
                    className="text-xs sm:text-sm md:text-xs">
                    All Status
                  </SelectItem>
                  <SelectItem
                    value="active"
                    className="text-xs sm:text-sm md:text-xs">
                    Active
                  </SelectItem>
                  <SelectItem
                    value="suspended"
                    className="text-xs sm:text-sm md:text-xs">
                    Suspended
                  </SelectItem>
                  <SelectItem
                    value="inactive"
                    className="text-xs sm:text-sm md:text-xs">
                    Inactive
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base xs:text-lg sm:text-xl">
            All Students ({filteredStudents.length})
          </CardTitle>
          <CardDescription className="text-xs xs:text-sm sm:text-base">
            Complete list of all students registered on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm md:text-xs">
                    Student
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm md:text-xs">
                    School & Grade
                  </TableHead>
                  <TableHead className="hidden lg:table-cell text-xs sm:text-sm md:text-xs">
                    Learning Progress
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm md:text-xs">
                    Performance
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm md:text-xs">
                    Subscription
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm md:text-xs">
                    Status
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm md:text-xs">
                    Last Active
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm md:text-xs w-[80px]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentStudents.map((student) => (
                  <TableRow key={student.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                          <AvatarImage
                            src={student.avatar || "/placeholder.svg"}
                          />
                          <AvatarFallback>
                            {student.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-xs sm:text-sm md:text-xs">
                            {student.name}
                          </div>
                          <div className="text-[0.65rem] sm:text-xs md:text-sm text-muted-foreground">
                            {student.email}
                          </div>
                          <div className="flex items-center text-[0.65rem] sm:text-xs md:text-sm text-muted-foreground">
                            <Calendar className="mr-1 h-2.5 w-2.5 sm:h-3 sm:w-3" />
                            Joined {student.joinDate}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-xs sm:text-sm md:text-xs font-medium">
                          <Building2 className="mr-1 h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          {student.school}
                        </div>
                        <div className="flex items-center text-xs sm:text-sm md:text-xs">
                          <GraduationCap className="mr-1 h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          Grade {student.grade}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="space-y-1">
                        <div className="flex items-center text-xs sm:text-sm md:text-xs">
                          <BookOpen className="mr-1 h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          {student.completedCourses}/{student.courses} courses
                        </div>
                        <div className="text-xs sm:text-sm md:text-xs text-muted-foreground">
                          {getProgressPercentage(
                            student.completedCourses,
                            student.courses
                          )}
                          % complete
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm md:text-xs">
                        <Trophy className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        <span
                          className={`font-medium ${getScoreColor(
                            student.averageScore
                          )}`}>
                          {student.averageScore}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getSubscriptionBadge(student.subscription)}
                    </TableCell>
                    <TableCell>{getStatusBadge(student.status)}</TableCell>
                    <TableCell>
                      <div className="text-xs sm:text-sm md:text-xs text-muted-foreground">
                        {student.lastActive}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditStudent(student)}
                          className="p-1 sm:p-2">
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 sm:p-2 text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteStudent(student)}>
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden grid gap-4">
            {currentStudents.map((student) => (
              <Card key={student.id} className="border-none">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={student.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {student.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-sm sm:text-base">
                      {student.name}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      {student.email}
                    </div>
                    <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                      <Calendar className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                      Joined {student.joinDate}
                    </div>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-xs sm:text-sm font-medium">
                    <Building2 className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                    {student.school}
                  </div>
                  <div className="flex items-center text-xs sm:text-sm">
                    <GraduationCap className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                    Grade {student.grade}
                  </div>
                  <div className="flex items-center text-xs sm:text-sm">
                    <BookOpen className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                    {student.completedCourses}/{student.courses} courses
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    {getProgressPercentage(
                      student.completedCourses,
                      student.courses
                    )}
                    % complete
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    <Trophy className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span
                      className={`font-medium ${getScoreColor(
                        student.averageScore
                      )}`}>
                      {student.averageScore}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    {getSubscriptionBadge(student.subscription)}
                    {getStatusBadge(student.status)}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    {student.lastActive}
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditStudent(student)}
                      className="p-2 sm:p-3">
                      <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-2 sm:p-3 text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteStudent(student)}>
                      <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationPrevious
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm md:text-xs font-medium">
              Total Students
            </CardTitle>
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl md:text-2xl font-bold">
              {students.length}
            </div>
            <p className="text-[0.65rem] sm:text-xs md:text-sm text-muted-foreground">
              {students.filter((s) => s.status === "Active").length} active
              students
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm md:text-xs font-medium">
              Avg Performance
            </CardTitle>
            <Trophy className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">
              {Math.round(
                students.reduce(
                  (sum, student) => sum + student.averageScore,
                  0
                ) / students.length
              )}
              %
            </div>
            <p className="text-[0.65rem] sm:text-xs md:text-sm text-muted-foreground">
              Platform average
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm md:text-xs font-medium">
              Course Completion
            </CardTitle>
            <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl md:text-2xl font-bold">
              {Math.round(
                students.reduce(
                  (sum, student) =>
                    sum +
                    getProgressPercentage(
                      student.completedCourses,
                      student.courses
                    ),
                  0
                ) / students.length
              )}
              %
            </div>
            <p className="text-[0.65rem] sm:text-xs md:text-sm text-muted-foreground">
              Average completion rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm md:text-xs font-medium">
              Premium Students
            </CardTitle>
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl md:text-2xl font-bold">
              {students.filter((s) => s.subscription === "Premium").length}
            </div>
            <p className="text-[0.65rem] sm:text-xs md:text-sm text-muted-foreground">
              {Math.round(
                (students.filter((s) => s.subscription === "Premium").length /
                  students.length) *
                  100
              )}
              % of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Edit Student Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[400px] sm:max-w-[500px] md:max-w-[600px] p-4 sm:p-6 h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg md:text-xl">
              Edit Student
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm md:text-xs">
              Update student information
            </DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="flex-1 overflow-y-auto py-3 sm:py-4">
              <div className="grid gap-2 sm:gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs sm:text-sm md:text-xs">
                      Full Name
                    </Label>
                    <Input
                      defaultValue={selectedStudent.name}
                      className="text-xs sm:text-sm md:text-xs h-9 sm:h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs sm:text-sm md:text-xs">
                      Email Address
                    </Label>
                    <Input
                      defaultValue={selectedStudent.email}
                      className="text-xs sm:text-sm md:text-xs h-9 sm:h-10"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs sm:text-sm md:text-xs">
                      School
                    </Label>
                    <Select defaultValue={selectedStudent.school}>
                      <SelectTrigger className="text-xs sm:text-sm md:text-xs h-9 sm:h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {schools.map((school) => (
                          <SelectItem
                            key={school}
                            value={school}
                            className="text-xs sm:text-sm md:text-xs">
                            {school}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs sm:text-sm md:text-xs">
                      Grade
                    </Label>
                    <Select defaultValue={selectedStudent.grade}>
                      <SelectTrigger className="text-xs sm:text-sm md:text-xs h-9 sm:h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          value="SS1"
                          className="text-xs sm:text-sm md:text-xs">
                          SS1
                        </SelectItem>
                        <SelectItem
                          value="SS2"
                          className="text-xs sm:text-sm md:text-xs">
                          SS2
                        </SelectItem>
                        <SelectItem
                          value="SS3"
                          className="text-xs sm:text-sm md:text-xs">
                          SS3
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end p-2 sm:p-4 mt-auto">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="text-xs sm:text-sm md:text-xs h-9 sm:h-10 w-full sm:w-auto">
              Cancel
            </Button>
            <Button
              onClick={() => {
                setIsEditDialogOpen(false);
                alert("Student updated successfully!");
              }}
              className="text-xs sm:text-sm md:text-xs h-9 sm:h-10 w-full sm:w-auto">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[400px] sm:max-w-[500px] md:max-w-[600px] p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg md:text-xl">
              Delete Student
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm md:text-xs">
              Are you sure you want to delete{" "}
              {selectedStudent?.name ?? "this student"}? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end p-2 sm:p-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="text-xs sm:text-sm md:text-xs h-9 sm:h-10 w-full sm:w-auto">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="text-xs sm:text-sm md:text-xs h-9 sm:h-10 w-full sm:w-auto">
              Delete Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

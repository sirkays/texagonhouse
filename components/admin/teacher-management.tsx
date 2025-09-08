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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GraduationCap,
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  BookOpen,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
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

// Define Teacher interface
interface Teacher {
  id: number;
  name: string;
  email: string;
  phone: string;
  school: string;
  subjects: string[];
  students: number;
  courses: number;
  status: "Active" | "Suspended" | "Pending";
  joinDate: string;
  avatar: string;
  performance: number;
}

export function TeacherManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const teachersPerPage = 5;

  const teachers: Teacher[] = [
    {
      id: 1,
      name: "Dr. Sarah Wilson",
      email: "sarah.wilson@lsmc.edu.ng",
      phone: "+234 801 234 5678",
      school: "Lagos State Model College",
      subjects: ["Mathematics", "Physics"],
      students: 234,
      courses: 8,
      status: "Active",
      joinDate: "2023-01-15",
      avatar: "/placeholder.svg?height=40&width=40",
      performance: 95,
    },
    {
      id: 2,
      name: "Prof. Michael Johnson",
      email: "m.johnson@fgc.edu.ng",
      phone: "+234 802 345 6789",
      school: "Federal Government College",
      subjects: ["Chemistry", "Biology"],
      students: 198,
      courses: 6,
      status: "Active",
      joinDate: "2023-02-20",
      avatar: "/placeholder.svg?height=40&width=40",
      performance: 92,
    },
    {
      id: 3,
      name: "Mrs. Adebayo Funmi",
      email: "f.adebayo@greenfield.edu.ng",
      phone: "+234 803 456 7890",
      school: "Greenfield Academy",
      subjects: ["English", "Literature"],
      students: 156,
      courses: 5,
      status: "Active",
      joinDate: "2023-03-10",
      avatar: "/placeholder.svg?height=40&width=40",
      performance: 88,
    },
    {
      id: 4,
      name: "Mr. David Okafor",
      email: "d.okafor@unity.edu.ng",
      phone: "+234 804 567 8901",
      school: "Unity High School",
      subjects: ["Computer Science"],
      students: 145,
      courses: 4,
      status: "Suspended",
      joinDate: "2023-04-05",
      avatar: "/placeholder.svg?height=40&width=40",
      performance: 75,
    },
    {
      id: 5,
      name: "Ms. Grace Okoro",
      email: "g.okoro@brightfuture.edu.ng",
      phone: "+234 805 678 9012",
      school: "Bright Future College",
      subjects: ["Economics", "Government"],
      students: 123,
      courses: 3,
      status: "Pending",
      joinDate: "2024-01-12",
      avatar: "/placeholder.svg?height=40&width=40",
      performance: 82,
    },
  ];

  const schools = [
    "Lagos State Model College",
    "Federal Government College",
    "Greenfield Academy",
    "Unity High School",
    "Bright Future College",
  ];

  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.school.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.subjects.some((subject) =>
        subject.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesSchool =
      selectedSchool === "all" || teacher.school === selectedSchool;

    return matchesSearch && matchesSchool;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredTeachers.length / teachersPerPage);
  const indexOfLastTeacher = currentPage * teachersPerPage;
  const indexOfFirstTeacher = indexOfLastTeacher - teachersPerPage;
  const currentTeachers = filteredTeachers.slice(
    indexOfFirstTeacher,
    indexOfLastTeacher
  );

  const getStatusBadge = (status: "Active" | "Suspended" | "Pending") => {
    switch (status) {
      case "Active":
        return (
          <Badge className="bg-green-100 text-green-800 flex items-center text-xs xs:text-sm">
            <CheckCircle className="w-2.5 h-2.5 xs:w-3 xs:h-3 mr-1" />
            Active
          </Badge>
        );
      case "Suspended":
        return (
          <Badge className="bg-red-100 text-red-800 flex items-center text-xs xs:text-sm">
            <XCircle className="w-2.5 h-2.5 xs:w-3 xs:h-3 mr-1" />
            Suspended
          </Badge>
        );
      case "Pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 flex items-center text-xs xs:text-sm">
            <Clock className="w-2.5 h-2.5 xs:w-3 xs:h-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-xs xs:text-sm">
            {status}
          </Badge>
        );
    }
  };

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return "text-green-600";
    if (performance >= 80) return "text-blue-600";
    if (performance >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsEditDialogOpen(true);
  };

  const handleDeleteTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedTeacher) {
      alert(`Teacher ${selectedTeacher.name} has been deleted successfully!`);
    }
    setIsDeleteDialogOpen(false);
    setSelectedTeacher(null);
  };

  return (
    <div className="space-y-4 p-3 xs:p-4 sm:p-6 max-w-full mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 xs:gap-4">
        <div>
          <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold">
            Teacher Management
          </h1>
          <p className="text-muted-foreground text-xs xs:text-sm sm:text-base">
            Manage all teachers across registered schools
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 text-xs sm:text-sm md:text-base">
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              Add New Teacher
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-[400px] sm:max-w-[500px] md:max-w-[600px] p-4 sm:p-6 h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg md:text-xl">
                Add New Teacher
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm md:text-base">
                Register a new teacher to the platform
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto py-3 px-2 sm:py-4">
              <div className="grid gap-2 sm:gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="teacher-name"
                      className="text-xs sm:text-sm md:text-base">
                      Full Name
                    </Label>
                    <Input
                      id="teacher-name"
                      placeholder="Enter teacher's full name"
                      className="text-xs sm:text-sm md:text-base h-9 sm:h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="teacher-email"
                      className="text-xs sm:text-sm md:text-base">
                      Email Address
                    </Label>
                    <Input
                      id="teacher-email"
                      type="email"
                      placeholder="teacher@school.edu.ng"
                      className="text-xs sm:text-sm md:text-base h-9 sm:h-10"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="teacher-phone"
                      className="text-xs sm:text-sm md:text-base">
                      Phone Number
                    </Label>
                    <Input
                      id="teacher-phone"
                      placeholder="+234 xxx xxx xxxx"
                      className="text-xs sm:text-sm md:text-base h-9 sm:h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="teacher-school"
                      className="text-xs sm:text-sm md:text-base">
                      Assign to School
                    </Label>
                    <Select>
                      <SelectTrigger className="text-xs sm:text-sm md:text-base h-9 sm:h-10">
                        <SelectValue placeholder="Select school" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          value="lsmc"
                          className="text-xs sm:text-sm md:text-base">
                          Lagos State Model College
                        </SelectItem>
                        <SelectItem
                          value="fgc"
                          className="text-xs sm:text-sm md:text-base">
                          Federal Government College
                        </SelectItem>
                        <SelectItem
                          value="greenfield"
                          className="text-xs sm:text-sm md:text-base">
                          Greenfield Academy
                        </SelectItem>
                        <SelectItem
                          value="unity"
                          className="text-xs sm:text-sm md:text-base">
                          Unity High School
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="teacher-subjects"
                    className="text-xs sm:text-sm md:text-base">
                    Teaching Subjects
                  </Label>
                  <Input
                    id="teacher-subjects"
                    placeholder="e.g., Mathematics, Physics (comma separated)"
                    className="text-xs sm:text-sm md:text-base h-9 sm:h-10"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="teacher-qualification"
                      className="text-xs sm:text-sm md:text-base">
                      Qualification
                    </Label>
                    <Select>
                      <SelectTrigger className="text-xs sm:text-sm md:text-base h-9 sm:h-10">
                        <SelectValue placeholder="Select qualification" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          value="bsc"
                          className="text-xs sm:text-sm md:text-base">
                          Bachelor's Degree
                        </SelectItem>
                        <SelectItem
                          value="msc"
                          className="text-xs sm:text-sm md:text-base">
                          Master's Degree
                        </SelectItem>
                        <SelectItem
                          value="phd"
                          className="text-xs sm:text-sm md:text-base">
                          PhD
                        </SelectItem>
                        <SelectItem
                          value="other"
                          className="text-xs sm:text-sm md:text-base">
                          Other
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="teacher-experience"
                      className="text-xs sm:text-sm md:text-base">
                      Years of Experience
                    </Label>
                    <Input
                      id="teacher-experience"
                      type="number"
                      placeholder="0"
                      className="text-xs sm:text-sm md:text-base h-9 sm:h-10"
                    />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end p-2 sm:p-4 mt-auto">
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                className="text-xs sm:text-sm md:text-base h-9 sm:h-10 w-full sm:w-auto">
                Cancel
              </Button>
              <Button
                onClick={() => setIsAddDialogOpen(false)}
                className="text-xs sm:text-sm md:text-base h-9 sm:h-10 w-full sm:w-auto">
                Add Teacher
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
                placeholder="Search teachers by name, email, school, or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-7 xs:pl-8 text-xs xs:text-sm sm:text-base"
              />
            </div>
            <div className="flex flex-col xs:flex-row gap-3 xs:gap-4">
              <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                <SelectTrigger className="w-full text-xs xs:text-sm sm:text-base">
                  <SelectValue placeholder="Filter by school" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value="all"
                    className="text-xs xs:text-sm sm:text-base">
                    All Schools
                  </SelectItem>
                  {schools.map((school) => (
                    <SelectItem
                      key={school}
                      value={school}
                      className="text-xs xs:text-sm sm:text-base">
                      {school}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-full text-xs xs:text-sm sm:text-base">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value="all"
                    className="text-xs xs:text-sm sm:text-base">
                    All Status
                  </SelectItem>
                  <SelectItem
                    value="active"
                    className="text-xs xs:text-sm sm:text-base">
                    Active
                  </SelectItem>
                  <SelectItem
                    value="suspended"
                    className="text-xs xs:text-sm sm:text-base">
                    Suspended
                  </SelectItem>
                  <SelectItem
                    value="pending"
                    className="text-xs xs:text-sm sm:text-base">
                    Pending
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teachers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base xs:text-lg sm:text-xl">
            All Teachers ({filteredTeachers.length})
          </CardTitle>
          <CardDescription className="text-xs xs:text-sm sm:text-base">
            Complete list of all teachers registered on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs xs:text-sm sm:text-base">
                    Teacher
                  </TableHead>
                  <TableHead className="text-xs xs:text-sm sm:text-base">
                    Contact Info
                  </TableHead>
                  <TableHead className="hidden lg:table-cell text-xs xs:text-sm sm:text-base">
                    School & Subjects
                  </TableHead>
                  <TableHead className="text-xs xs:text-sm sm:text-base">
                    Teaching Stats
                  </TableHead>
                  <TableHead className="text-xs xs:text-sm sm:text-base">
                    Performance
                  </TableHead>
                  <TableHead className="text-xs xs:text-sm sm:text-base">
                    Status
                  </TableHead>
                  <TableHead className="text-xs xs:text-sm sm:text-base w-[80px]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentTeachers.map((teacher) => (
                  <TableRow key={teacher.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center space-x-2 xs:space-x-3">
                        <Avatar className="h-8 w-8 xs:h-9 xs:w-9">
                          <AvatarImage
                            src={teacher.avatar || "/placeholder.svg"}
                          />
                          <AvatarFallback>
                            {teacher.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-xs xs:text-sm sm:text-base">
                            {teacher.name}
                          </div>
                          <div className="flex items-center text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
                            <Calendar className="mr-1 h-2.5 w-2.5 xs:h-3 xs:w-3" />
                            Joined {teacher.joinDate}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-xs xs:text-sm">
                          <Mail className="mr-1 h-2.5 w-2.5 xs:h-3 xs:w-3" />
                          {teacher.email}
                        </div>
                        <div className="flex items-center text-xs xs:text-sm">
                          <Phone className="mr-1 h-2.5 w-2.5 xs:h-3 xs:w-3" />
                          {teacher.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="space-y-1">
                        <div className="flex items-center text-xs xs:text-sm font-medium">
                          <Building2 className="mr-1 h-2.5 w-2.5 xs:h-3 xs:w-3" />
                          {teacher.school}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {teacher.subjects.map((subject, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs xs:text-sm">
                              {subject}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-xs xs:text-sm">
                          <Users className="mr-1 h-2.5 w-2.5 xs:h-3 xs:w-3" />
                          {teacher.students} students
                        </div>
                        <div className="flex items-center text-xs xs:text-sm">
                          <BookOpen className="mr-1 h-2.5 w-2.5 xs:h-3 xs:w-3" />
                          {teacher.courses} courses
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div
                        className={`text-xs xs:text-sm font-medium ${getPerformanceColor(
                          teacher.performance
                        )}`}>
                        {teacher.performance}%
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(teacher.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 xs:gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTeacher(teacher)}
                          className="p-1 xs:p-2">
                          <Edit className="h-3 w-3 xs:h-4 xs:w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 xs:p-2 text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteTeacher(teacher)}>
                          <Trash2 className="h-3 w-3 xs:h-4 xs:w-4" />
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
            {currentTeachers.map((teacher) => (
              <Card key={teacher.id} className="p-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={teacher.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {teacher.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-sm xs:text-base">
                      {teacher.name}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="mr-1 h-3 w-3" />
                      Joined {teacher.joinDate}
                    </div>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-xs xs:text-sm">
                    <Mail className="mr-1 h-3 w-3" />
                    {teacher.email}
                  </div>
                  <div className="flex items-center text-xs xs:text-sm">
                    <Phone className="mr-1 h-3 w-3" />
                    {teacher.phone}
                  </div>
                  <div className="flex items-center text-xs xs:text-sm font-medium">
                    <Building2 className="mr-1 h-3 w-3" />
                    {teacher.school}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {teacher.subjects.map((subject, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center text-xs xs:text-sm">
                    <Users className="mr-1 h-3 w-3" />
                    {teacher.students} students
                  </div>
                  <div className="flex items-center text-xs xs:text-sm">
                    <BookOpen className="mr-1 h-3 w-3" />
                    {teacher.courses} courses
                  </div>
                  <div
                    className={`text-xs xs:text-sm font-medium ${getPerformanceColor(
                      teacher.performance
                    )}`}>
                    Performance: {teacher.performance}%
                  </div>
                  <div className="flex items-center gap-1">
                    {getStatusBadge(teacher.status)}
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditTeacher(teacher)}
                      className="p-2">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-2 text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteTeacher(teacher)}>
                      <Trash2 className="h-4 w-4" />
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
      <div className="grid gap-4 grid-cols-1 xs:grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs xs:text-sm font-medium">
              Total Teachers
            </CardTitle>
            <GraduationCap className="h-3 w-3 xs:h-4 xs:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg xs:text-xl sm:text-2xl font-bold">
              {teachers.length}
            </div>
            <p className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
              {teachers.filter((t) => t.status === "Active").length} active
              teachers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs xs:text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-3 w-3 xs:h-4 xs:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg xs:text-xl sm:text-2xl font-bold">
              {teachers
                .reduce((sum, teacher) => sum + teacher.students, 0)
                .toLocaleString()}
            </div>
            <p className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
              Students being taught
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs xs:text-sm font-medium">
              Total Courses
            </CardTitle>
            <BookOpen className="h-3 w-3 xs:h-4 xs:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg xs:text-xl sm:text-2xl font-bold">
              {teachers.reduce((sum, teacher) => sum + teacher.courses, 0)}
            </div>
            <p className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
              Active courses
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs xs:text-sm font-medium">
              Avg Performance
            </CardTitle>
            <CheckCircle className="h-3 w-3 xs:h-4 xs:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg xs:text-xl sm:text-2xl font-bold text-green-600">
              {Math.round(
                teachers.reduce(
                  (sum, teacher) => sum + teacher.performance,
                  0
                ) / teachers.length
              )}
              %
            </div>
            <p className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
              Platform average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Edit Teacher Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[500px] xs:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-base xs:text-lg sm:text-xl">
              Edit Teacher
            </DialogTitle>
            <DialogDescription className="text-xs xs:text-sm sm:text-base">
              Update teacher information
            </DialogDescription>
          </DialogHeader>
          {selectedTeacher && (
            <div className="grid gap-3 xs:gap-4 py-4">
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 xs:gap-4">
                <div className="space-y-2">
                  <Label className="text-xs xs:text-sm sm:text-base">
                    Full Name
                  </Label>
                  <Input
                    defaultValue={selectedTeacher.name}
                    className="text-xs xs:text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs xs:text-sm sm:text-base">
                    Email Address
                  </Label>
                  <Input
                    defaultValue={selectedTeacher.email}
                    className="text-xs xs:text-sm sm:text-base"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 xs:gap-4">
                <div className="space-y-2">
                  <Label className="text-xs xs:text-sm sm:text-base">
                    Phone Number
                  </Label>
                  <Input
                    defaultValue={selectedTeacher.phone}
                    className="text-xs xs:text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs xs:text-sm sm:text-base">
                    School
                  </Label>
                  <Select defaultValue={selectedTeacher.school}>
                    <SelectTrigger className="text-xs xs:text-sm sm:text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {schools.map((school) => (
                        <SelectItem
                          key={school}
                          value={school}
                          className="text-xs xs:text-sm sm:text-base">
                          {school}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs xs:text-sm sm:text-base">
                  Teaching Subjects
                </Label>
                <Input
                  defaultValue={selectedTeacher.subjects.join(", ")}
                  className="text-xs xs:text-sm sm:text-base"
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex flex-col xs:flex-row gap-2 xs:gap-4">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="text-xs xs:text-sm sm:text-base">
              Cancel
            </Button>
            <Button
              onClick={() => {
                setIsEditDialogOpen(false);
                alert("Teacher updated successfully!");
              }}
              className="text-xs xs:text-sm sm:text-base">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[500px] xs:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-base xs:text-lg sm:text-xl">
              Delete Teacher
            </DialogTitle>
            <DialogDescription className="text-xs xs:text-sm sm:text-base">
              Are you sure you want to delete{" "}
              {selectedTeacher?.name ?? "this teacher"}? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col xs:flex-row gap-2 xs:gap-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="text-xs xs:text-sm sm:text-base">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="text-xs xs:text-sm sm:text-base">
              Delete Teacher
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

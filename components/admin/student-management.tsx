"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
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
} from "lucide-react"

export function StudentManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSchool, setSelectedSchool] = useState("all")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)

  const students = [
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
  ]

  const schools = [
    "Lagos State Model College",
    "Federal Government College",
    "Greenfield Academy",
    "Unity High School",
    "Bright Future College",
  ]

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.school.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.grade.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSchool = selectedSchool === "all" || student.school === selectedSchool

    return matchesSearch && matchesSchool
  })

  const handleExportStudentData = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Name,Email,School,Grade,Courses,Completed,Average Score,Status,Subscription\n" +
      students
        .map(
          (student) =>
            `${student.name},${student.email},${student.school},${student.grade},${student.courses},${student.completedCourses},${student.averageScore}%,${student.status},${student.subscription}`,
        )
        .join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "student_data.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    alert("Student data exported successfully!")
  }

  const handleEditStudent = (student) => {
    setSelectedStudent(student)
    setIsEditDialogOpen(true)
  }

  const handleDeleteStudent = (student) => {
    setSelectedStudent(student)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    alert(`Student ${selectedStudent.name} has been deleted successfully!`)
    setIsDeleteDialogOpen(false)
    setSelectedStudent(null)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "Active":
        return (
          <Badge className="bg-green-100 text-green-800 flex items-center text-xs xs:text-sm">
            <CheckCircle className="w-2.5 h-2.5 xs:w-3 xs:h-3 mr-1" />
            Active
          </Badge>
        )
      case "Suspended":
        return (
          <Badge className="bg-red-100 text-red-800 flex items-center text-xs xs:text-sm">
            <XCircle className="w-2.5 h-2.5 xs:w-3 xs:h-3 mr-1" />
            Suspended
          </Badge>
        )
      case "Inactive":
        return (
          <Badge className="bg-gray-100 text-gray-800 flex items-center text-xs xs:text-sm">
            <Clock className="w-2.5 h-2.5 xs:w-3 xs:h-3 mr-1" />
            Inactive
          </Badge>
        )
      default:
        return <Badge variant="secondary" className="text-xs xs:text-sm">{status}</Badge>
    }
  }

  const getSubscriptionBadge = (subscription) => {
    return subscription === "Premium" ? (
      <Badge className="bg-yellow-100 text-yellow-800 text-xs xs:text-sm">Premium</Badge>
    ) : (
      <Badge variant="secondary" className="text-xs xs:text-sm">Basic</Badge>
    )
  }

  const getScoreColor = (score) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-blue-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getProgressPercentage = (completed, total) => {
    return Math.round((completed / total) * 100)
  }

  return (
    <div className="space-y-4 p-3 xs:p-4 sm:p-6 max-w-full mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 xs:gap-4">
        <div>
          <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold">Student Management</h1>
          <p className="text-muted-foreground text-xs xs:text-sm sm:text-base">Monitor and manage all students across the platform</p>
        </div>
        <Button className="flex items-center gap-2 text-xs xs:text-sm sm:text-base" onClick={handleExportStudentData}>
          <Users className="h-3 w-3 xs:h-4 xs:w-4" />
          Export Student Data
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base xs:text-lg sm:text-xl">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 xs:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2 xs:left-2.5 xs:top-2.5 h-3 w-3 xs:h-4 xs:w-4 text-muted-foreground" />
              <Input
                placeholder="Search students by name, email, school, or grade..."
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
                  <SelectItem value="all" className="text-xs xs:text-sm sm:text-base">All Schools</SelectItem>
                  {schools.map((school) => (
                    <SelectItem key={school} value={school} className="text-xs xs:text-sm sm:text-base">
                      {school}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-full text-xs xs:text-sm sm:text-base">
                  <SelectValue placeholder="Filter by grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs xs:text-sm sm:text-base">All Grades</SelectItem>
                  <SelectItem value="ss1" className="text-xs xs:text-sm sm:text-base">SS1</SelectItem>
                  <SelectItem value="ss2" className="text-xs xs:text-sm sm:text-base">SS2</SelectItem>
                  <SelectItem value="ss3" className="text-xs xs:text-sm sm:text-base">SS3</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-full text-xs xs:text-sm sm:text-base">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs xs:text-sm sm:text-base">All Status</SelectItem>
                  <SelectItem value="active" className="text-xs xs:text-sm sm:text-base">Active</SelectItem>
                  <SelectItem value="suspended" className="text-xs xs:text-sm sm:text-base">Suspended</SelectItem>
                  <SelectItem value="inactive" className="text-xs xs:text-sm sm:text-base">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base xs:text-lg sm:text-xl">All Students ({filteredStudents.length})</CardTitle>
          <CardDescription className="text-xs xs:text-sm sm:text-base">Complete list of all students registered on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs xs:text-sm sm:text-base">Student</TableHead>
                  <TableHead className="hidden md:table-cell text-xs xs:text-sm sm:text-base">School & Grade</TableHead>
                  <TableHead className="hidden lg:table-cell text-xs xs:text-sm sm:text-base">Learning Progress</TableHead>
                  <TableHead className="hidden sm:table-cell text-xs xs:text-sm sm:text-base">Performance</TableHead>
                  <TableHead className="hidden sm:table-cell text-xs xs:text-sm sm:text-base">Subscription</TableHead>
                  <TableHead className="hidden sm:table-cell text-xs xs:text-sm sm:text-base">Status</TableHead>
                  <TableHead className="hidden md:table-cell text-xs xs:text-sm sm:text-base">Last Active</TableHead>
                  <TableHead className="text-xs xs:text-sm sm:text-base w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center space-x-2 xs:space-x-3">
                        <Avatar className="h-8 w-8 xs:h-9 xs:w-9">
                          <AvatarImage src={student.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {student.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-xs xs:text-sm sm:text-base">{student.name}</div>
                          <div className="text-[0.65rem] xs:text-xs sm:text-sm text-muted-foreground">{student.email}</div>
                          <div className="flex items-center text-[0.65rem] xs:text-xs sm:text-sm text-muted-foreground">
                            <Calendar className="mr-1 h-2.5 w-2.5 xs:h-3 xs:w-3" />
                            Joined {student.joinDate}
                          </div>
                          <div className="sm:hidden space-y-1 mt-2">
                            <div className="flex items-center text-[0.65rem] xs:text-xs sm:text-sm font-medium">
                              <Building2 className="mr-1 h-2.5 w-2.5 xs:h-3 xs:w-3" />
                              {student.school}
                            </div>
                            <div className="flex items-center text-[0.65rem] xs:text-xs sm:text-sm">
                              <GraduationCap className="mr-1 h-2.5 w-2.5 xs:h-3 xs:w-3" />
                              Grade {student.grade}
                            </div>
                            <div className="flex items-center text-[0.65rem] xs:text-xs sm:text-sm">
                              <BookOpen className="mr-1 h-2.5 w-2.5 xs:h-3 xs:w-3" />
                              {student.completedCourses}/{student.courses} courses
                            </div>
                            <div className="text-[0.65rem] xs:text-xs sm:text-sm text-muted-foreground">
                              {getProgressPercentage(student.completedCourses, student.courses)}% complete
                            </div>
                            <div className="flex items-center gap-1 text-[0.65rem] xs:text-xs sm:text-sm">
                              <Trophy className="h-2.5 w-2.5 xs:h-3 xs:w-3" />
                              <span className={`font-medium ${getScoreColor(student.averageScore)}`}>
                                {student.averageScore}%
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              {getSubscriptionBadge(student.subscription)}
                              {getStatusBadge(student.status)}
                            </div>
                            <div className="text-[0.65rem] xs:text-xs sm:text-sm text-muted-foreground">{student.lastActive}</div>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="space-y-1">
                        <div className="flex items-center text-xs xs:text-sm font-medium">
                          <Building2 className="mr-1 h-2.5 w-2.5 xs:h-3 xs:w-3" />
                          {student.school}
                        </div>
                        <div className="flex items-center text-xs xs:text-sm">
                          <GraduationCap className="mr-1 h-2.5 w-2.5 xs:h-3 xs:w-3" />
                          Grade {student.grade}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="space-y-1">
                        <div className="flex items-center text-xs xs:text-sm">
                          <BookOpen className="mr-1 h-2.5 w-2.5 xs:h-3 xs:w-3" />
                          {student.completedCourses}/{student.courses} courses
                        </div>
                        <div className="text-xs xs:text-sm text-muted-foreground">
                          {getProgressPercentage(student.completedCourses, student.courses)}% complete
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center gap-1 xs:gap-2 text-xs xs:text-sm">
                        <Trophy className="h-2.5 w-2.5 xs:h-3 xs:w-3" />
                        <span className={`font-medium ${getScoreColor(student.averageScore)}`}>
                          {student.averageScore}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{getSubscriptionBadge(student.subscription)}</TableCell>
                    <TableCell className="hidden sm:table-cell">{getStatusBadge(student.status)}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="text-xs xs:text-sm text-muted-foreground">{student.lastActive}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 xs:gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditStudent(student)} className="p-1 xs:p-2">
                          <Edit className="h-3 w-3 xs:h-4 xs:w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 xs:p-2 text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteStudent(student)}
                        >
                          <Trash2 className="h-3 w-3 xs:h-4 xs:w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 xs:grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs xs:text-sm font-medium">Total Students</CardTitle>
            <Users className="h-3 w-3 xs:h-4 xs:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg xs:text-xl sm:text-2xl font-bold">{students.length}</div>
            <p className="text-[0.65rem] xs:text-xs sm:text-sm text-muted-foreground">
              {students.filter((s) => s.status === "Active").length} active students
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs xs:text-sm font-medium">Avg Performance</CardTitle>
            <Trophy className="h-3 w-3 xs:h-4 xs:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg xs:text-xl sm:text-2xl font-bold text-green-600">
              {Math.round(students.reduce((sum, student) => sum + student.averageScore, 0) / students.length)}%
            </div>
            <p className="text-[0.65rem] xs:text-xs sm:text-sm text-muted-foreground">Platform average</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs xs:text-sm font-medium">Course Completion</CardTitle>
            <BookOpen className="h-3 w-3 xs:h-4 xs:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg xs:text-xl sm:text-2xl font-bold">
              {Math.round(
                students.reduce(
                  (sum, student) => sum + getProgressPercentage(student.completedCourses, student.courses),
                  0,
                ) / students.length,
              )}
              %
            </div>
            <p className="text-[0.65rem] xs:text-xs sm:text-sm text-muted-foreground">Average completion rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs xs:text-sm font-medium">Premium Students</CardTitle>
            <TrendingUp className="h-3 w-3 xs:h-4 xs:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg xs:text-xl sm:text-2xl font-bold">{students.filter((s) => s.subscription === "Premium").length}</div>
            <p className="text-[0.65rem] xs:text-xs sm:text-sm text-muted-foreground">
              {Math.round((students.filter((s) => s.subscription === "Premium").length / students.length) * 100)}% of
              total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Edit Student Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[500px] xs:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-base xs:text-lg sm:text-xl">Edit Student</DialogTitle>
            <DialogDescription className="text-xs xs:text-sm sm:text-base">Update student information</DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="grid gap-3 xs:gap-4 py-4">
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 xs:gap-4">
                <div className="space-y-2">
                  <Label className="text-xs xs:text-sm sm:text-base">Full Name</Label>
                  <Input defaultValue={selectedStudent.name} className="text-xs xs:text-sm sm:text-base" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs xs:text-sm sm:text-base">Email Address</Label>
                  <Input defaultValue={selectedStudent.email} className="text-xs xs:text-sm sm:text-base" />
                </div>
              </div>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 xs:gap-4">
                <div className="space-y-2">
                  <Label className="text-xs xs:text-sm sm:text-base">School</Label>
                  <Select defaultValue={selectedStudent.school}>
                    <SelectTrigger className="text-xs xs:text-sm sm:text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {schools.map((school) => (
                        <SelectItem key={school} value={school} className="text-xs xs:text-sm sm:text-base">
                          {school}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs xs:text-sm sm:text-base">Grade</Label>
                  <Select defaultValue={selectedStudent.grade}>
                    <SelectTrigger className="text-xs xs:text-sm sm:text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SS1" className="text-xs xs:text-sm sm:text-base">SS1</SelectItem>
                      <SelectItem value="SS2" className="text-xs xs:text-sm sm:text-base">SS2</SelectItem>
                      <SelectItem value="SS3" className="text-xs xs:text-sm sm:text-base">SS3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex flex-col xs:flex-row gap-2 xs:gap-4">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="text-xs xs:text-sm sm:text-base">
              Cancel
            </Button>
            <Button
              onClick={() => {
                setIsEditDialogOpen(false)
                alert("Student updated successfully!")
              }}
              className="text-xs xs:text-sm sm:text-base"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[500px] xs:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-base xs:text-lg sm:text-xl">Delete Student</DialogTitle>
            <DialogDescription className="text-xs xs:text-sm sm:text-base">
              Are you sure you want to delete {selectedStudent?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col xs:flex-row gap-2 xs:gap-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="text-xs xs:text-sm sm:text-base">
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} className="text-xs xs:text-sm sm:text-base">
              Delete Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
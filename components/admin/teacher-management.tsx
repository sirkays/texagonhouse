"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
} from "lucide-react"

export function TeacherManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const teachers = [
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
  ]

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.school.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.subjects.some((subject) => subject.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        )
      case "Suspended":
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Suspended
          </Badge>
        )
      case "Pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return "text-green-600"
    if (performance >= 80) return "text-blue-600"
    if (performance >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Teacher Management</h1>
          <p className="text-muted-foreground">Manage all teachers across registered schools</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New Teacher
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Teacher</DialogTitle>
              <DialogDescription>Register a new teacher to the platform</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="teacher-name">Full Name</Label>
                  <Input id="teacher-name" placeholder="Enter teacher's full name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teacher-email">Email Address</Label>
                  <Input id="teacher-email" type="email" placeholder="teacher@school.edu.ng" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="teacher-phone">Phone Number</Label>
                  <Input id="teacher-phone" placeholder="+234 xxx xxx xxxx" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teacher-school">Assign to School</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select school" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lsmc">Lagos State Model College</SelectItem>
                      <SelectItem value="fgc">Federal Government College</SelectItem>
                      <SelectItem value="greenfield">Greenfield Academy</SelectItem>
                      <SelectItem value="unity">Unity High School</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="teacher-subjects">Teaching Subjects</Label>
                <Input id="teacher-subjects" placeholder="e.g., Mathematics, Physics (comma separated)" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="teacher-qualification">Qualification</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select qualification" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bsc">Bachelor's Degree</SelectItem>
                      <SelectItem value="msc">Master's Degree</SelectItem>
                      <SelectItem value="phd">PhD</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teacher-experience">Years of Experience</Label>
                  <Input id="teacher-experience" type="number" placeholder="0" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsAddDialogOpen(false)}>Add Teacher</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search teachers by name, email, school, or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by school" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Schools</SelectItem>
                <SelectItem value="lsmc">Lagos State Model College</SelectItem>
                <SelectItem value="fgc">Federal Government College</SelectItem>
                <SelectItem value="greenfield">Greenfield Academy</SelectItem>
                <SelectItem value="unity">Unity High School</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Teachers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Teachers ({filteredTeachers.length})</CardTitle>
          <CardDescription>Complete list of all teachers registered on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead>School & Subjects</TableHead>
                  <TableHead>Teaching Stats</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeachers.map((teacher) => (
                  <TableRow key={teacher.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={teacher.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {teacher.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{teacher.name}</div>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="mr-1 h-3 w-3" />
                            Joined {teacher.joinDate}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Mail className="mr-1 h-3 w-3" />
                          {teacher.email}
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone className="mr-1 h-3 w-3" />
                          {teacher.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm font-medium">
                          <Building2 className="mr-1 h-3 w-3" />
                          {teacher.school}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {teacher.subjects.map((subject, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {subject}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Users className="mr-1 h-3 w-3" />
                          {teacher.students} students
                        </div>
                        <div className="flex items-center text-sm">
                          <BookOpen className="mr-1 h-3 w-3" />
                          {teacher.courses} courses
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`text-sm font-medium ${getPerformanceColor(teacher.performance)}`}>
                        {teacher.performance}%
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(teacher.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
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
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teachers.length}</div>
            <p className="text-xs text-muted-foreground">
              {teachers.filter((t) => t.status === "Active").length} active teachers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teachers.reduce((sum, teacher) => sum + teacher.students, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Students being taught</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teachers.reduce((sum, teacher) => sum + teacher.courses, 0)}</div>
            <p className="text-xs text-muted-foreground">Active courses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.round(teachers.reduce((sum, teacher) => sum + teacher.performance, 0) / teachers.length)}%
            </div>
            <p className="text-xs text-muted-foreground">Platform average</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

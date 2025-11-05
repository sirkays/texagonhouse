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

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.school.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.grade.toLowerCase().includes(searchTerm.toLowerCase()),
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
      case "Inactive":
        return (
          <Badge className="bg-gray-100 text-gray-800">
            <Clock className="w-3 h-3 mr-1" />
            Inactive
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getSubscriptionBadge = (subscription: string) => {
    return subscription === "Premium" ? (
      <Badge className="bg-gold-100 text-gold-800">Premium</Badge>
    ) : (
      <Badge variant="secondary">Basic</Badge>
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-blue-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getProgressPercentage = (completed: number, total: number) => {
    return Math.round((completed / total) * 100)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Student Management</h1>
          <p className="text-muted-foreground">Monitor and manage all students across the platform</p>
        </div>
        <Button className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Export Student Data
        </Button>
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
                placeholder="Search students by name, email, school, or grade..."
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
                <SelectValue placeholder="Filter by grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                <SelectItem value="ss1">SS1</SelectItem>
                <SelectItem value="ss2">SS2</SelectItem>
                <SelectItem value="ss3">SS3</SelectItem>
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
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Students ({filteredStudents.length})</CardTitle>
          <CardDescription>Complete list of all students registered on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>School & Grade</TableHead>
                  <TableHead>Learning Progress</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={student.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {student.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{student.name}</div>
                          <div className="text-sm text-muted-foreground">{student.email}</div>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="mr-1 h-3 w-3" />
                            Joined {student.joinDate}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm font-medium">
                          <Building2 className="mr-1 h-3 w-3" />
                          {student.school}
                        </div>
                        <div className="flex items-center text-sm">
                          <GraduationCap className="mr-1 h-3 w-3" />
                          Grade {student.grade}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <BookOpen className="mr-1 h-3 w-3" />
                          {student.completedCourses}/{student.courses} courses
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {getProgressPercentage(student.completedCourses, student.courses)}% complete
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Trophy className="h-3 w-3" />
                        <span className={`text-sm font-medium ${getScoreColor(student.averageScore)}`}>
                          {student.averageScore}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getSubscriptionBadge(student.subscription)}</TableCell>
                    <TableCell>{getStatusBadge(student.status)}</TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">{student.lastActive}</div>
                    </TableCell>
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
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-xs text-muted-foreground">
              {students.filter((s) => s.status === "Active").length} active students
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.round(students.reduce((sum, student) => sum + student.averageScore, 0) / students.length)}%
            </div>
            <p className="text-xs text-muted-foreground">Platform average</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Course Completion</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                students.reduce(
                  (sum, student) => sum + getProgressPercentage(student.completedCourses, student.courses),
                  0,
                ) / students.length,
              )}
              %
            </div>
            <p className="text-xs text-muted-foreground">Average completion rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Premium Students</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.filter((s) => s.subscription === "Premium").length}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((students.filter((s) => s.subscription === "Premium").length / students.length) * 100)}% of
              total
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

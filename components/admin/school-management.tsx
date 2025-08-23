"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Building2,
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  GraduationCap,
  MapPin,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react"

export function SchoolManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const schools = [
    {
      id: 1,
      name: "Lagos State Model College",
      address: "Victoria Island, Lagos",
      phone: "+234 801 234 5678",
      email: "admin@lsmc.edu.ng",
      students: 1234,
      teachers: 67,
      subscription: "Premium",
      status: "Active",
      joinDate: "2023-01-15",
      revenue: "₦145,000",
    },
    {
      id: 2,
      name: "Federal Government College",
      address: "Ikoyi, Lagos",
      phone: "+234 802 345 6789",
      email: "info@fgc.edu.ng",
      students: 987,
      teachers: 54,
      subscription: "Premium",
      status: "Active",
      joinDate: "2023-02-20",
      revenue: "₦120,000",
    },
    {
      id: 3,
      name: "Greenfield Academy",
      address: "Lekki, Lagos",
      phone: "+234 803 456 7890",
      email: "contact@greenfield.edu.ng",
      students: 756,
      teachers: 43,
      subscription: "Basic",
      status: "Active",
      joinDate: "2023-03-10",
      revenue: "₦89,000",
    },
    {
      id: 4,
      name: "Unity High School",
      address: "Surulere, Lagos",
      phone: "+234 804 567 8901",
      email: "admin@unity.edu.ng",
      students: 654,
      teachers: 38,
      subscription: "Premium",
      status: "Suspended",
      joinDate: "2023-04-05",
      revenue: "₦98,000",
    },
    {
      id: 5,
      name: "Bright Future College",
      address: "Ikeja, Lagos",
      phone: "+234 805 678 9012",
      email: "info@brightfuture.edu.ng",
      students: 543,
      teachers: 32,
      subscription: "Basic",
      status: "Pending",
      joinDate: "2024-01-12",
      revenue: "₦67,000",
    },
  ]

  const filteredSchools = schools.filter(
    (school) =>
      school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusBadge = (status) => {
    switch (status) {
      case "Active":
        return (
          <Badge className="bg-green-100 text-green-800 flex items-center text-xs sm:text-sm">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        )
      case "Suspended":
        return (
          <Badge className="bg-red-100 text-red-800 flex items-center text-xs sm:text-sm">
            <XCircle className="w-3 h-3 mr-1" />
            Suspended
          </Badge>
        )
      case "Pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 flex items-center text-xs sm:text-sm">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      default:
        return <Badge variant="secondary" className="text-xs sm:text-sm">{status}</Badge>
    }
  }

  const getSubscriptionBadge = (subscription) => {
    return subscription === "Premium" ? (
      <Badge className="bg-yellow-100 text-yellow-800 text-xs sm:text-sm">Premium</Badge>
    ) : (
      <Badge variant="secondary" className="text-xs sm:text-sm">Basic</Badge>
    )
  }

  return (
    <div className="space-y-4 p-3 xs:p-4 sm:p-6 max-w-full mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold">School Management</h1>
          <p className="text-muted-foreground text-xs xs:text-sm sm:text-base">Manage all registered schools on the platform</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 text-xs xs:text-sm sm:text-base">
              <Plus className="h-3 w-3 xs:h-4 xs:w-4" />
              Add New School
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-[500px] xs:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-base xs:text-lg sm:text-xl">Add New School</DialogTitle>
              <DialogDescription className="text-xs xs:text-sm sm:text-base">Register a new school on the platform</DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 xs:gap-4 py-4">
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 xs:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="school-name" className="text-xs xs:text-sm sm:text-base">School Name</Label>
                  <Input id="school-name" placeholder="Enter school name" className="text-xs xs:text-sm sm:text-base" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="school-type" className="text-xs xs:text-sm sm:text-base">School Type</Label>
                  <Select>
                    <SelectTrigger className="text-xs xs:text-sm sm:text-base">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public" className="text-xs xs:text-sm sm:text-base">Public School</SelectItem>
                      <SelectItem value="private" className="text-xs xs:text-sm sm:text-base">Private School</SelectItem>
                      <SelectItem value="federal" className="text-xs xs:text-sm sm:text-base">Federal School</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="text-xs xs:text-sm sm:text-base">Address</Label>
                <Textarea id="address" placeholder="Enter complete address" className="text-xs xs:text-sm sm:text-base min-h-[80px]" />
              </div>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 xs:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs xs:text-sm sm:text-base">Phone Number</Label>
                  <Input id="phone" placeholder="+234 xxx xxx xxxx" className="text-xs xs:text-sm sm:text-base" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs xs:text-sm sm:text-base">Email Address</Label>
                  <Input id="email" type="email" placeholder="admin@school.edu.ng" className="text-xs xs:text-sm sm:text-base" />
                </div>
              </div>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 xs:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subscription" className="text-xs xs:text-sm sm:text-base">Subscription Plan</Label>
                  <Select>
                    <SelectTrigger className="text-xs xs:text-sm sm:text-base">
                      <SelectValue placeholder="Select plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic" className="text-xs xs:text-sm sm:text-base">Basic Plan</SelectItem>
                      <SelectItem value="premium" className="text-xs xs:text-sm sm:text-base">Premium Plan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-name" className="text-xs xs:text-sm sm:text-base">Admin Contact Name</Label>
                  <Input id="admin-name" placeholder="Administrator name" className="text-xs xs:text-sm sm:text-base" />
                </div>
              </div>
            </div>
            <DialogFooter className="flex flex-col xs:flex-row gap-2 xs:gap-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="text-xs xs:text-sm sm:text-base">
                Cancel
              </Button>
              <Button onClick={() => setIsAddDialogOpen(false)} className="text-xs xs:text-sm sm:text-base">Add School</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
                placeholder="Search schools by name, address, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-7 xs:pl-8 text-xs xs:text-sm sm:text-base"
              />
            </div>
            <div className="flex flex-col xs:flex-row gap-3 xs:gap-4">
              <Select>
                <SelectTrigger className="w-full text-xs xs:text-sm sm:text-base">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs xs:text-sm sm:text-base">All Status</SelectItem>
                  <SelectItem value="active" className="text-xs xs:text-sm sm:text-base">Active</SelectItem>
                  <SelectItem value="suspended" className="text-xs xs:text-sm sm:text-base">Suspended</SelectItem>
                  <SelectItem value="pending" className="text-xs xs:text-sm sm:text-base">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-full text-xs xs:text-sm sm:text-base">
                  <SelectValue placeholder="Filter by plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs xs:text-sm sm:text-base">All Plans</SelectItem>
                  <SelectItem value="premium" className="text-xs xs:text-sm sm:text-base">Premium</SelectItem>
                  <SelectItem value="basic" className="text-xs xs:text-sm sm:text-base">Basic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schools Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base xs:text-lg sm:text-xl">Registered Schools ({filteredSchools.length})</CardTitle>
          <CardDescription className="text-xs xs:text-sm sm:text-base">Complete list of all schools registered on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs xs:text-sm sm:text-base">School Details</TableHead>
                  <TableHead className="hidden md:table-cell text-xs xs:text-sm sm:text-base">Contact Info</TableHead>
                  <TableHead className="hidden lg:table-cell text-xs xs:text-sm sm:text-base">Users</TableHead>
                  <TableHead className="hidden sm:table-cell text-xs xs:text-sm sm:text-base">Subscription</TableHead>
                  <TableHead className="hidden sm:table-cell text-xs xs:text-sm sm:text-base">Status</TableHead>
                  <TableHead className="hidden md:table-cell text-xs xs:text-sm sm:text-base">Revenue</TableHead>
                  <TableHead className="text-xs xs:text-sm sm:text-base w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSchools.map((school) => (
                  <TableRow key={school.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-xs xs:text-sm sm:text-base">{school.name}</div>
                        <div className="flex items-center text-[0.65rem] xs:text-xs sm:text-sm text-muted-foreground">
                          <MapPin className="mr-1 h-2.5 w-2.5 xs:h-3 xs:w-3" />
                          {school.address}
                        </div>
                        <div className="flex items-center text-[0.65rem] xs:text-xs sm:text-sm text-muted-foreground">
                          <Calendar className="mr-1 h-2.5 w-2.5 xs:h-3 xs:w-3" />
                          Joined {school.joinDate}
                        </div>
                        <div className="sm:hidden space-y-1 mt-2">
                          <div className="flex items-center text-[0.65rem] xs:text-xs sm:text-sm">
                            <Phone className="mr-1 h-2.5 w-2.5 xs:h-3 xs:w-3" />
                            {school.phone}
                          </div>
                          <div className="flex items-center text-[0.65rem] xs:text-xs sm:text-sm">
                            <Mail className="mr-1 h-2.5 w-2.5 xs:h-3 xs:w-3" />
                            {school.email}
                          </div>
                          <div className="flex items-center text-[0.65rem] xs:text-xs sm:text-sm">
                            <Users className="mr-1 h-2.5 w-2.5 xs:h-3 xs:w-3" />
                            {school.students} students
                          </div>
                          <div className="flex items-center text-[0.65rem] xs:text-xs sm:text-sm">
                            <GraduationCap className="mr-1 h-2.5 w-2.5 xs:h-3 xs:w-3" />
                            {school.teachers} teachers
                          </div>
                          <div className="text-[0.65rem] xs:text-xs sm:text-sm font-medium text-green-600">{school.revenue}</div>
                          <div className="flex items-center gap-1">
                            {getSubscriptionBadge(school.subscription)}
                            {getStatusBadge(school.status)}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="space-y-1">
                        <div className="flex items-center text-xs xs:text-sm">
                          <Phone className="mr-1 h-2.5 w-2.5 xs:h-3 xs:w-3" />
                          {school.phone}
                        </div>
                        <div className="flex items-center text-xs xs:text-sm">
                          <Mail className="mr-1 h-2.5 w-2.5 xs:h-3 xs:w-3" />
                          {school.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="space-y-1">
                        <div className="flex items-center text-xs xs:text-sm">
                          <Users className="mr-1 h-2.5 w-2.5 xs:h-3 xs:w-3" />
                          {school.students} students
                        </div>
                        <div className="flex items-center text-xs xs:text-sm">
                          <GraduationCap className="mr-1 h-2.5 w-2.5 xs:h-3 xs:w-3" />
                          {school.teachers} teachers
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{getSubscriptionBadge(school.subscription)}</TableCell>
                    <TableCell className="hidden sm:table-cell">{getStatusBadge(school.status)}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="font-medium text-green-600 text-xs xs:text-sm">{school.revenue}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 xs:gap-2">
                        <Button variant="ghost" size="sm" className="p-1 xs:p-2">
                          <Edit className="h-3 w-3 xs:h-4 xs:w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="p-1 xs:p-2 text-red-600 hover:text-red-700">
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
      <div className="grid gap-4 grid-cols-1 xs:grid-cols-2 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs xs:text-sm font-medium">Total Schools</CardTitle>
            <Building2 className="h-3 w-3 xs:h-4 xs:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg xs:text-xl sm:text-2xl font-bold">{schools.length}</div>
            <p className="text-[0.65rem] xs:text-xs sm:text-sm text-muted-foreground">
              {schools.filter((s) => s.status === "Active").length} active schools
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs xs:text-sm font-medium">Total Students</CardTitle>
            <Users className="h-3 w-3 xs:h-4 xs:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg xs:text-xl sm:text-2xl font-bold">
              {schools.reduce((sum, school) => sum + school.students, 0).toLocaleString()}
            </div>
            <p className="text-[0.65rem] xs:text-xs sm:text-sm text-muted-foreground">Across all registered schools</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs xs:text-sm font-medium">Total Teachers</CardTitle>
            <GraduationCap className="h-3 w-3 xs:h-4 xs:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg xs:text-xl sm:text-2xl font-bold">
              {schools.reduce((sum, school) => sum + school.teachers, 0).toLocaleString()}
            </div>
            <p className="text-[0.65rem] xs:text-xs sm:text-sm text-muted-foreground">Active teaching staff</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
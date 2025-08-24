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
import {Textarea} from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export function SchoolManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const schoolsPerPage = 5;

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
  ];

  const filteredSchools = schools.filter(
    (school) =>
      school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredSchools.length / schoolsPerPage);
  const indexOfLastSchool = currentPage * schoolsPerPage;
  const indexOfFirstSchool = indexOfLastSchool - schoolsPerPage;
  const currentSchools = filteredSchools.slice(
    indexOfFirstSchool,
    indexOfLastSchool
  );

  const getStatusBadge = (status: any) => {
    switch (status) {
      case "Active":
        return (
          <Badge className="bg-green-100 text-green-800 flex items-center text-xs">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case "Suspended":
        return (
          <Badge className="bg-red-100 text-red-800 flex items-center text-xs">
            <XCircle className="w-3 h-3 mr-1" />
            Suspended
          </Badge>
        );
      case "Pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 flex items-center text-xs">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-xs">
            {status}
          </Badge>
        );
    }
  };

  const getSubscriptionBadge = (subscription: any) => {
    return subscription === "Premium" ? (
      <Badge className="bg-yellow-100 text-yellow-800 text-xs">Premium</Badge>
    ) : (
      <Badge variant="secondary" className="text-xs">
        Basic
      </Badge>
    );
  };

  return (
    <div className="space-y-4 p-2 sm:p-4 lg:p-6 max-w-full mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold truncate">
            School Management
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-1">
            Manage all registered schools on the platform
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              <span className="sm:inline">Add New School</span>
            </Button>
          </DialogTrigger>

          <DialogContent className="w-[95vw] max-w-lg max-h-[85vh] p-3 sm:p-6 flex flex-col">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-lg sm:text-xl">
                Add New School
              </DialogTitle>
              <DialogDescription className="text-sm">
                Register a new school on the platform
              </DialogDescription>
            </DialogHeader>

            {/* Scrollable Content */}
            <div className="grid gap-4 py-2 flex-1 p-2 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="school-name" className="text-sm font-medium">
                    School Name
                  </Label>
                  <Input
                    id="school-name"
                    placeholder="Enter school name"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="school-type" className="text-sm font-medium">
                    School Type
                  </Label>
                  <Select>
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public" className="text-sm">
                        Public School
                      </SelectItem>
                      <SelectItem value="private" className="text-sm">
                        Private School
                      </SelectItem>
                      <SelectItem value="federal" className="text-sm">
                        Federal School
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium">
                  Address
                </Label>
                <Textarea
                  id="address"
                  placeholder="Enter complete address"
                  className="text-sm min-h-[80px] resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    placeholder="+234 xxx xxx xxxx"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@school.edu.ng"
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subscription" className="text-sm font-medium">
                    Subscription Plan
                  </Label>
                  <Select>
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Select plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic" className="text-sm">
                        Basic Plan
                      </SelectItem>
                      <SelectItem value="premium" className="text-sm">
                        Premium Plan
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-name" className="text-sm font-medium">
                    Admin Contact Name
                  </Label>
                  <Input
                    id="admin-name"
                    placeholder="Administrator name"
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                className="text-sm w-full sm:w-auto">
                Cancel
              </Button>
              <Button
                onClick={() => setIsAddDialogOpen(false)}
                className="text-sm w-full sm:w-auto">
                Add School
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base sm:text-lg">
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search schools by name, address, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-sm"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-sm">
                  All Status
                </SelectItem>
                <SelectItem value="active" className="text-sm">
                  Active
                </SelectItem>
                <SelectItem value="suspended" className="text-sm">
                  Suspended
                </SelectItem>
                <SelectItem value="pending" className="text-sm">
                  Pending
                </SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Filter by plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-sm">
                  All Plans
                </SelectItem>
                <SelectItem value="premium" className="text-sm">
                  Premium
                </SelectItem>
                <SelectItem value="basic" className="text-sm">
                  Basic
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Schools Table */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base sm:text-lg">
            Registered Schools ({filteredSchools.length})
          </CardTitle>
          <CardDescription className="text-sm">
            Complete list of all schools registered on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="block sm:hidden space-y-4">
            {currentSchools.map((school) => (
              <Card key={school.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm truncate">
                        {school.name}
                      </h3>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <MapPin className="mr-1 h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{school.address}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Phone className="mr-1 h-3 w-3" />
                        <span className="truncate">{school.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="mr-1 h-3 w-3" />
                        <span>{school.students} students</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        <span>Joined {school.joinDate}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Mail className="mr-1 h-3 w-3" />
                        <span className="truncate">{school.email}</span>
                      </div>
                      <div className="flex items-center">
                        <GraduationCap className="mr-1 h-3 w-3" />
                        <span>{school.teachers} teachers</span>
                      </div>
                      <div className="font-medium text-green-600">
                        {school.revenue}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                      {getSubscriptionBadge(school.subscription)}
                      {getStatusBadge(school.status)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 ml-2 mt-3">
                  <Button variant="ghost" size="sm" className="p-1">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 text-red-600">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <div className="hidden sm:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-sm">School Details</TableHead>
                  <TableHead className="hidden md:table-cell text-sm">
                    Contact Info
                  </TableHead>
                  <TableHead className="hidden lg:table-cell text-sm">
                    Users
                  </TableHead>
                  <TableHead className="text-sm">Subscription</TableHead>
                  <TableHead className="text-sm">Status</TableHead>
                  <TableHead className="hidden md:table-cell text-sm">
                    Revenue
                  </TableHead>
                  <TableHead className="text-sm w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentSchools.map((school) => (
                  <TableRow key={school.id} className="hover:bg-muted/50">
                    <TableCell className="min-w-0">
                      <div className="space-y-1">
                        <div className="font-medium text-sm truncate">
                          {school.name}
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <MapPin className="mr-1 h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{school.address}</span>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="mr-1 h-3 w-3 flex-shrink-0" />
                          <span>Joined {school.joinDate}</span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="hidden md:table-cell">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Phone className="mr-1 h-3 w-3" />
                          <span className="truncate">{school.phone}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Mail className="mr-1 h-3 w-3" />
                          <span className="truncate">{school.email}</span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="hidden lg:table-cell">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Users className="mr-1 h-3 w-3" />
                          {school.students} students
                        </div>
                        <div className="flex items-center text-sm">
                          <GraduationCap className="mr-1 h-3 w-3" />
                          {school.teachers} teachers
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      {getSubscriptionBadge(school.subscription)}
                    </TableCell>
                    <TableCell>{getStatusBadge(school.status)}</TableCell>

                    <TableCell className="hidden md:table-cell">
                      <div className="font-medium text-green-600 text-sm">
                        {school.revenue}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="p-2">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2 text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schools.length}</div>
            <p className="text-xs text-muted-foreground">
              {schools.filter((s) => s.status === "Active").length} active
              schools
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {schools
                .reduce((sum, school) => sum + school.students, 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all registered schools
            </p>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Teachers
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {schools
                .reduce((sum, school) => sum + school.teachers, 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Active teaching staff
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

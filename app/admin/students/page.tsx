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
import {Plus, Search, Mail, Download, Eye, Edit, Trash2} from "lucide-react";
import {StudentModal} from "@/components/admin/modals/student-modal";
import {DeleteConfirmationModal} from "@/components/admin/modals/delete-confirmation-modal";
import {useToast} from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function StudentsPage() {
  const {toast} = useToast();
  const [students, setStudents] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterClassroom, setFilterClassroom] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [deletingStudent, setDeletingStudent] = useState<any>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchStudents = async (
    q: string,
    classroom: string,
    status: string
  ) => {
    const params = new URLSearchParams();
    if (q) params.append("q", q);
    if (classroom !== "all") params.append("classroom", classroom);
    if (status !== "all") params.append("status", status);
    const search = params.toString();
    const url = `/api/admin/students${search ? "?" + search : ""}`;
    const res = await fetch(url);
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || "Failed to fetch students");
    }
    return await res.json();
  };

  const fetchClassrooms = async () => {
    try {
      const res = await fetch("/api/admin/classrooms");
      if (!res.ok) {
        throw new Error("Failed to fetch classrooms");
      }
      return await res.json();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load classrooms",
        variant: "destructive",
      });
      return [];
    }
  };

  const loadStudents = async () => {
    try {
      const data = await fetchStudents(
        debouncedSearch,
        filterClassroom,
        filterStatus
      );
      setStudents(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load students",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const fetchedClassrooms = await fetchClassrooms();
      setClassrooms(fetchedClassrooms);
    };
    loadData();
  }, []);

  useEffect(() => {
    loadStudents();
  }, [debouncedSearch, filterClassroom, filterStatus]);

  const handleSaveStudent = async (data: any) => {
    try {
      let res;
      if (editingStudent) {
        // Remove temp id for update
        const {id, ...updateData} = data;
        res = await fetch(`/api/admin/students/${editingStudent.id}`, {
          method: "PUT",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(updateData),
        });
        toast({title: "Success", description: "Student updated successfully"});
      } else {
        // Remove temp id for create
        const {id, ...createData} = data;
        res = await fetch("/api/admin/students", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(createData),
        });
        toast({title: "Success", description: "Student added successfully"});
      }
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to save student");
      }
      loadStudents();
      setEditingStudent(null);
      setIsAddModalOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save student",
        variant: "destructive",
      });
    }
  };

  const handleDeleteStudent = async () => {
    try {
      const res = await fetch(`/api/admin/students/${deletingStudent.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to delete student");
      }
      toast({title: "Success", description: "Student deleted successfully"});
      loadStudents();
      setDeletingStudent(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete student",
        variant: "destructive",
      });
    }
  };

  const handleExport = async () => {
    try {
      const res = await fetch("/api/admin/students/export");
      if (!res.ok) {
        throw new Error("Failed to export students");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `students_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast({title: "Success", description: "Students exported successfully"});
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to export students",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Students
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage student profiles and enrollments
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Student
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search students by name, email, or admission number..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select
                value={filterClassroom}
                onValueChange={setFilterClassroom}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by classroom" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classrooms</SelectItem>
                  {classrooms.map((classroom: any) => (
                    <SelectItem key={classroom.id} value={classroom.name}>
                      {classroom.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Students List */}
        <Card>
          <CardHeader>
            <CardTitle>All Students ({students.length})</CardTitle>
            <CardDescription>
              A list of all students in your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {students.map((student: any) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={student.avatar} />
                      <AvatarFallback>
                        {student.name
                          .split(" ")
                          .map((n: any) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {student.name}
                      </h3>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {student.email}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {student.admissionNo}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {student.classroom}
                      </p>
                      <Badge
                        variant={
                          student.status === "active" ? "default" : "secondary"
                        }
                        className="mt-1">
                        {student.status}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          toast({
                            title: "View Profile",
                            description: `Viewing ${student.name}'s profile`,
                          })
                        }>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingStudent(student)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeletingStudent(student)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {students.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">
                  No students found matching your criteria.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <StudentModal
        open={isAddModalOpen || !!editingStudent}
        onOpenChange={(open) => {
          setIsAddModalOpen(open);
          if (!open) setEditingStudent(null);
        }}
        student={editingStudent}
        classrooms={classrooms}
        onSave={handleSaveStudent}
      />

      <DeleteConfirmationModal
        open={!!deletingStudent}
        onOpenChange={(open) => !open && setDeletingStudent(null)}
        title="Delete Student"
        description={`Are you sure you want to delete ${deletingStudent?.name}? This action cannot be undone.`}
        onConfirm={handleDeleteStudent}
      />
    </>
  );
}

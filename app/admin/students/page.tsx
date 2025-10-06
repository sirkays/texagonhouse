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
  const [students, setStudents] = useState([
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@student.edu",
      classroom: "Grade 10A",
      admissionNo: "STU001",
      status: "active",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@student.edu",
      classroom: "Grade 10A",
      admissionNo: "STU002",
      status: "active",
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike.j@student.edu",
      classroom: "Grade 10B",
      admissionNo: "STU003",
      status: "active",
    },
    {
      id: 4,
      name: "Sarah Williams",
      email: "sarah.w@student.edu",
      classroom: "Grade 11A",
      admissionNo: "STU004",
      status: "active",
    },
    {
      id: 5,
      name: "Tom Brown",
      email: "tom.brown@student.edu",
      classroom: "Grade 11B",
      admissionNo: "STU005",
      status: "active",
    },
    {
      id: 6,
      name: "Emily Davis",
      email: "emily.d@student.edu",
      classroom: "Grade 12A",
      admissionNo: "STU006",
      status: "active",
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterClassroom, setFilterClassroom] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [deletingStudent, setDeletingStudent] = useState<any>(null);

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.admissionNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClassroom =
      filterClassroom === "all" || student.classroom === filterClassroom;
    const matchesStatus =
      filterStatus === "all" || student.status === filterStatus;
    return matchesSearch && matchesClassroom && matchesStatus;
  });

  const handleSaveStudent = (data: any) => {
    if (editingStudent) {
      setStudents(students.map((s) => (s.id === data.id ? data : s)));
      toast({title: "Success", description: "Student updated successfully"});
    } else {
      setStudents([...students, data]);
      toast({title: "Success", description: "Student added successfully"});
    }
    setEditingStudent(null);
  };

  const handleDeleteStudent = () => {
    setStudents(students.filter((s) => s.id !== deletingStudent.id));
    toast({title: "Success", description: "Student deleted successfully"});
    setDeletingStudent(null);
  };

  const handleExport = () => {
    const csv = [
      ["Name", "Email", "Admission No", "Classroom", "Status"],
      ...filteredStudents.map((s) => [
        s.name,
        s.email,
        s.admissionNo,
        s.classroom,
        s.status,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], {type: "text/csv"});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "students.csv";
    a.click();
    toast({title: "Success", description: "Students exported successfully"});
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
                  <SelectItem value="Grade 10A">Grade 10A</SelectItem>
                  <SelectItem value="Grade 10B">Grade 10B</SelectItem>
                  <SelectItem value="Grade 11A">Grade 11A</SelectItem>
                  <SelectItem value="Grade 11B">Grade 11B</SelectItem>
                  <SelectItem value="Grade 12A">Grade 12A</SelectItem>
                  <SelectItem value="Grade 12B">Grade 12B</SelectItem>
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
            <CardTitle>All Students ({filteredStudents.length})</CardTitle>
            <CardDescription>
              A list of all students in your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={`/.jpg?height=48&width=48&query=${student.name}`}
                      />
                      <AvatarFallback>
                        {student.name
                          .split(" ")
                          .map((n) => n[0])
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
                      <Badge variant="secondary" className="mt-1">
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

            {filteredStudents.length === 0 && (
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

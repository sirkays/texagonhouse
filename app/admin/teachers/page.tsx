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
import {Plus, Search, Mail, BookOpen, Edit, Trash2, Eye} from "lucide-react";
import {TeacherModal} from "@/components/admin/modals/teacher-modal";
import {DeleteConfirmationModal} from "@/components/admin/modals/delete-confirmation-modal";
import {ViewDetailsModal} from "@/components/admin/modals/view-details-modal";
import {useToast} from "@/hooks/use-toast";

export default function TeachersPage() {
  const {toast} = useToast();
  const [teachers, setTeachers] = useState([
    {
      id: 1,
      name: "Dr. Robert Smith",
      email: "r.smith@edu.com",
      specialties: ["Mathematics", "Physics"],
      courses: 5,
      experience: 15,
    },
    {
      id: 2,
      name: "Prof. Maria Garcia",
      email: "m.garcia@edu.com",
      specialties: ["Chemistry", "Biology"],
      courses: 4,
      experience: 12,
    },
    {
      id: 3,
      name: "Dr. James Wilson",
      email: "j.wilson@edu.com",
      specialties: ["English", "Literature"],
      courses: 6,
      experience: 10,
    },
    {
      id: 4,
      name: "Ms. Lisa Anderson",
      email: "l.anderson@edu.com",
      specialties: ["History", "Geography"],
      courses: 4,
      experience: 8,
    },
    {
      id: 5,
      name: "Mr. David Lee",
      email: "d.lee@edu.com",
      specialties: ["Computer Science"],
      courses: 3,
      experience: 6,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [teacherModalOpen, setTeacherModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.specialties.some((s) =>
        s.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const handleAddTeacher = () => {
    setSelectedTeacher(null);
    setTeacherModalOpen(true);
  };

  const handleEditTeacher = (teacher: any) => {
    setSelectedTeacher(teacher);
    setTeacherModalOpen(true);
  };

  const handleViewTeacher = (teacher: any) => {
    setSelectedTeacher(teacher);
    setViewModalOpen(true);
  };

  const handleDeleteTeacher = (teacher: any) => {
    setSelectedTeacher(teacher);
    setDeleteModalOpen(true);
  };

  const handleSaveTeacher = (teacher: any) => {
    if (teacher.id) {
      setTeachers(teachers.map((t) => (t.id === teacher.id ? teacher : t)));
      toast({
        title: "Teacher Updated",
        description: `${teacher.name} has been updated successfully.`,
      });
    } else {
      const newTeacher = {
        ...teacher,
        id: Math.max(...teachers.map((t) => t.id)) + 1,
        courses: 0,
      };
      setTeachers([...teachers, newTeacher]);
      toast({
        title: "Teacher Added",
        description: `${teacher.name} has been added successfully.`,
      });
    }
  };

  const confirmDelete = () => {
    setTeachers(teachers.filter((t) => t.id !== selectedTeacher.id));
    toast({
      title: "Teacher Deleted",
      description: `${selectedTeacher.name} has been removed from the system.`,
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
              Teachers
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage teacher profiles and assignments
            </p>
          </div>
          <Button onClick={handleAddTeacher}>
            <Plus className="mr-2 h-4 w-4" />
            Add Teacher
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search teachers..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline">Filter</Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTeachers.map((teacher) => (
            <Card
              key={teacher.id}
              className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex flex-col items-center text-center space-y-3">
                  <Avatar className="h-20 w-20">
                    <AvatarImage
                      src={`/.jpg?height=80&width=80&query=${teacher.name}`}
                    />
                    <AvatarFallback className="text-lg">
                      {teacher.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{teacher.name}</CardTitle>
                    <CardDescription className="flex items-center justify-center gap-1 mt-1">
                      <Mail className="h-3 w-3" />
                      {teacher.email}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Specialties
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {teacher.specialties.map((specialty) => (
                        <Badge key={specialty} variant="secondary">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm pt-3 border-t border-border">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      <span>Courses</span>
                    </div>
                    <span className="font-semibold text-foreground">
                      {teacher.courses}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Experience</span>
                    <span className="font-semibold text-foreground">
                      {teacher.experience} years
                    </span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      className="flex-1 bg-transparent"
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewTeacher(teacher)}>
                      <Eye className="mr-1 h-3 w-3" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditTeacher(teacher)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteTeacher(teacher)}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <TeacherModal
        open={teacherModalOpen}
        onOpenChange={setTeacherModalOpen}
        teacher={selectedTeacher}
        onSave={handleSaveTeacher}
      />
      <DeleteConfirmationModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={confirmDelete}
        title="Delete Teacher"
        description={`Are you sure you want to delete ${selectedTeacher?.name}? This action cannot be undone.`}
      />
      <ViewDetailsModal
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        title="Teacher Details"
        data={selectedTeacher}
        type="teacher"
      />
    </>
  );
}

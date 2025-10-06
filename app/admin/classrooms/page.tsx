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
import {Input} from "@/components/ui/input";
import {
  Plus,
  Users,
  BookOpen,
  MoreVertical,
  Search,
  Download,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {ClassroomModal} from "@/components/admin/modals/classroom-modal";
import {DeleteConfirmationModal} from "@/components/admin/modals/delete-confirmation-modal";
import {ClassroomDetailsModal} from "@/components/admin/modals/classroom-details-modal";
import {ManageStudentsModal} from "@/components/admin/modals/manage-students-modal";
import {useToast} from "@/hooks/use-toast";

export default function ClassroomsPage() {
  const {toast} = useToast();
  const [classrooms, setClassrooms] = useState([
    {
      id: 1,
      name: "Grade 10A",
      code: "G10A-2024",
      students: 32,
      teachers: 5,
      courses: 8,
    },
    {
      id: 2,
      name: "Grade 10B",
      code: "G10B-2024",
      students: 28,
      teachers: 5,
      courses: 8,
    },
    {
      id: 3,
      name: "Grade 11A",
      code: "G11A-2024",
      students: 30,
      teachers: 6,
      courses: 9,
    },
    {
      id: 4,
      name: "Grade 11B",
      code: "G11B-2024",
      students: 25,
      teachers: 6,
      courses: 9,
    },
    {
      id: 5,
      name: "Grade 12A",
      code: "G12A-2024",
      students: 27,
      teachers: 7,
      courses: 10,
    },
    {
      id: 6,
      name: "Grade 12B",
      code: "G12B-2024",
      students: 24,
      teachers: 7,
      courses: 10,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState<any>(null);
  const [deletingClassroom, setDeletingClassroom] = useState<any>(null);
  const [viewingClassroom, setViewingClassroom] = useState<any>(null);
  const [managingClassroom, setManagingClassroom] = useState<any>(null);

  const handleSaveClassroom = (data: any) => {
    if (editingClassroom) {
      setClassrooms(
        classrooms.map((c) => (c.id === data.id ? {...c, ...data} : c))
      );
      toast({title: "Success", description: "Classroom updated successfully"});
    } else {
      setClassrooms([
        ...classrooms,
        {...data, students: 0, teachers: 0, courses: 0},
      ]);
      toast({title: "Success", description: "Classroom created successfully"});
    }
    setEditingClassroom(null);
  };

  const handleDeleteClassroom = () => {
    setClassrooms(classrooms.filter((c) => c.id !== deletingClassroom.id));
    toast({title: "Success", description: "Classroom deleted successfully"});
    setDeletingClassroom(null);
  };

  const handleExport = () => {
    const csv = [
      ["Name", "Code", "Students", "Teachers", "Courses"],
      ...classrooms.map((c) => [
        c.name,
        c.code,
        c.students,
        c.teachers,
        c.courses,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], {type: "text/csv"});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "classrooms.csv";
    a.click();
    toast({title: "Success", description: "Classrooms exported successfully"});
  };

  const filteredClassrooms = classrooms.filter(
    (classroom) =>
      classroom.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      classroom.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Classrooms
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Manage your organization's classrooms
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button
              variant="outline"
              onClick={handleExport}
              className="flex-1 sm:flex-none bg-transparent">
              <Download className="mr-2 h-4 w-4" />
              <span className="hidden xs:inline">Export</span>
            </Button>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="flex-1 sm:flex-none">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden xs:inline">Add</span>
              <span className="xs:hidden">New</span>
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search classrooms..."
                className="pl-9 text-sm sm:text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredClassrooms.map((classroom) => (
            <Card
              key={classroom.id}
              className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0 flex-1">
                    <CardTitle className="text-lg sm:text-xl truncate">
                      {classroom.name}
                    </CardTitle>
                    <CardDescription>
                      <Badge variant="secondary" className="font-mono text-xs">
                        {classroom.code}
                      </Badge>
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="flex-shrink-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setViewingClassroom(classroom)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setEditingClassroom(classroom)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Classroom
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setManagingClassroom(classroom)}>
                        <Users className="mr-2 h-4 w-4" />
                        Manage Students
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeletingClassroom(classroom)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4 flex-shrink-0" />
                      <span>Students</span>
                    </div>
                    <span className="font-semibold text-foreground">
                      {classroom.students}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4 flex-shrink-0" />
                      <span>Teachers</span>
                    </div>
                    <span className="font-semibold text-foreground">
                      {classroom.teachers}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <BookOpen className="h-4 w-4 flex-shrink-0" />
                      <span>Courses</span>
                    </div>
                    <span className="font-semibold text-foreground">
                      {classroom.courses}
                    </span>
                  </div>
                </div>
                <Button
                  className="w-full bg-transparent"
                  variant="outline"
                  size="sm"
                  onClick={() => setViewingClassroom(classroom)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Classroom
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredClassrooms.length === 0 && (
          <Card>
            <CardContent className="py-8 sm:py-12 text-center">
              <p className="text-sm sm:text-base text-muted-foreground">
                No classrooms found matching your search.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modals */}
      <ClassroomModal
        open={isAddModalOpen || !!editingClassroom}
        onOpenChange={(open) => {
          setIsAddModalOpen(open);
          if (!open) setEditingClassroom(null);
        }}
        classroom={editingClassroom}
        onSave={handleSaveClassroom}
      />

      <DeleteConfirmationModal
        open={!!deletingClassroom}
        onOpenChange={(open) => !open && setDeletingClassroom(null)}
        title="Delete Classroom"
        description={`Are you sure you want to delete ${deletingClassroom?.name}? This action cannot be undone.`}
        onConfirm={handleDeleteClassroom}
      />

      <ClassroomDetailsModal
        open={!!viewingClassroom}
        onOpenChange={(open) => !open && setViewingClassroom(null)}
        classroom={viewingClassroom}
      />

      <ManageStudentsModal
        open={!!managingClassroom}
        onOpenChange={(open) => !open && setManagingClassroom(null)}
        classroom={managingClassroom}
      />
    </>
  );
}

//texagon_academy\texagonui\app\admin\students\page.tsx
"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/app/admin/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Plus, Search, Mail, Download, Eye, Edit, Trash2 } from "lucide-react";
import { StudentModal } from "@/components/admin/modals/student-modal";
import { DeleteConfirmationModal } from "@/components/admin/modals/delete-confirmation-modal";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export default function StudentsPage() {
  const { toast } = useToast();

  const [students, setStudents] = useState<any[]>([]);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterClassroom, setFilterClassroom] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [deletingStudent, setDeletingStudent] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);

  /* -------------------- Effects -------------------- */
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchClassrooms();
  }, []);

  useEffect(() => {
    loadStudents();
  }, [debouncedSearch, filterClassroom, filterStatus]);

  /* -------------------- API Helpers -------------------- */
  const fetchStudents = async (
    q: string,
    classroom: string,
    status: string
  ) => {
    const params = new URLSearchParams();
    if (q) params.append("q", q);
    if (classroom !== "all") params.append("classroom", classroom);
    if (status !== "all") params.append("status", status);

    const res = await fetch(
      `/api/admin/students${params.toString() ? "?" + params : ""}`
    );

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || "Failed to fetch students");
    }

    return res.json();
  };

  const fetchClassrooms = async () => {
    try {
      const res = await fetch("/api/admin/classrooms");
      if (!res.ok) throw new Error("Failed to fetch classrooms");
      const data = await res.json();
      setClassrooms(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const loadStudents = async () => {
    setIsLoadingStudents(true);
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
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoadingStudents(false);
    }
  };

  /* -------------------- Handlers -------------------- */
  const handleSaveStudent = async (data: any) => {
    setIsSaving(true); // Start loading
    try {
      let res;
      const { id, ...payload } = data;

      if (editingStudent) {
        res = await fetch(`/api/admin/students/${editingStudent.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/admin/students", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to save student");
      }

      toast({
        title: "Success",
        description: editingStudent
          ? "Student updated successfully"
          : "Student added successfully",
      });

      loadStudents();
      // Close modals only on success
      setEditingStudent(null);
      setIsAddModalOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false); // Stop loading
    }
  };

  const handleDeleteStudent = async () => {
    setIsDeleting(true); // Start loading
    try {
      const res = await fetch(`/api/admin/students/${deletingStudent.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to delete student");
      }

      toast({
        title: "Success",
        description: "Student deleted successfully",
      });

      loadStudents();
      // Close modal only on success
      setDeletingStudent(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false); // Stop loading
    }
  };

  const handleExport = async () => {
    try {
      const res = await fetch("/api/admin/students/export");
      if (!res.ok) throw new Error("Failed to export students");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `students_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Students exported successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  function StudentRowSkeleton() {
    return (
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border p-4 rounded-lg">
        <div className="flex gap-4 items-center">
          <Skeleton className="h-10 w-10 rounded-full" />

          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-32 sm:w-40" />
            <Skeleton className="h-3 w-full max-w-[200px]" />{" "}
            {/* Dynamic width */}
          </div>
        </div>

        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>
    );
  }

  /* -------------------- UI -------------------- */
  return (
    <>
      <div className="space-y-6 px-2 sm:px-0">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Students</h1>
            <p className="text-muted-foreground">
              Manage student profiles and enrollments
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={handleExport}
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button
              className="w-full sm:w-auto"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Student
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative w-full md:flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <Input
                  className="pl-9"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Select
                value={filterClassroom}
                onValueChange={setFilterClassroom}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Classroom" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classrooms</SelectItem>
                  {classrooms.map((c) => (
                    <SelectItem key={c.id} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Status" />
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

        {/* Students */}
        <Card>
          <CardHeader>
            <CardTitle>All Students ({students.length})</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {isLoadingStudents ? (
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <StudentRowSkeleton key={i} />
                ))}
              </div>
            ) : students.length > 0 ? (
              students.map((student) => (
                <div
                  key={student.id}
                  // CHANGED: Using Grid instead of Flex. This handles width constraints much better.
                  className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 p-4 border rounded-lg items-center bg-card text-card-foreground shadow-sm w-full max-w-full"
                >
                  {/* LEFT SIDE: Avatar + Info */}
                  {/* 'min-w-0' is the magic fix here. It allows this column to shrink below the text size. */}
                  <div className="flex items-center gap-3 min-w-0 w-full">
                    <Avatar className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 border">
                      <AvatarImage src={student.avatar} />
                      <AvatarFallback>
                        {student.name
                          ?.split(" ")
                          .map((n: string) => n[0])
                          .join("") || "??"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col min-w-0 w-full">
                      {/* Name: Truncate prevents long names from pushing width */}
                      <p className="font-semibold truncate text-base leading-tight">
                        {student.name}
                      </p>

                      {/* Email: break-all ensures super long emails wrap if needed, or use truncate */}
                      <div className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate block w-full">
                          {student.email}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT SIDE: Actions */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 sm:flex-none" // Buttons grow on mobile to fill width
                      onClick={() =>
                        router.push(`/admin/students/${student.id}`)
                      }
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 sm:flex-none"
                      onClick={() => setEditingStudent(student)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 sm:flex-none hover:bg-red-50 hover:text-red-600 border-red-200"
                      onClick={() => setDeletingStudent(student)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-10">
                No students found.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <StudentModal
        open={isAddModalOpen || !!editingStudent}
        onOpenChange={(open) => {
          if (isSaving) return; // Prevent closing while saving
          setIsAddModalOpen(open);
          if (!open) setEditingStudent(null);
        }}
        student={editingStudent}
        classrooms={classrooms}
        onSave={handleSaveStudent}
        loading={isSaving} // Pass loading state
      />

      <DeleteConfirmationModal
        open={!!deletingStudent}
        onOpenChange={(open) => {
          if (isDeleting) return; // Prevent closing while deleting
          if (!open) setDeletingStudent(null);
        }}
        title="Delete Student"
        description={`Are you sure you want to delete ${deletingStudent?.name}?`}
        onConfirm={handleDeleteStudent}
        loading={isDeleting} // Pass loading state
      />
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/app/admin/layout";
import { Spinner } from "@/components/ui/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { ClassroomModal } from "@/components/admin/modals/classroom-modal";
import { DeleteConfirmationModal } from "@/components/admin/modals/delete-confirmation-modal";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface Classroom {
  id: number;
  name: string;
  code: string;
  class_type?: "public" | "private";
  description?: string;
  students: number;
  teachers: number;
  courses: number;
}

export default function ClassroomsPage() {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const router = useRouter();

  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(
    null
  );
  const [deletingClassroom, setDeletingClassroom] = useState<Classroom | null>(
    null
  );


  useEffect(() => {
    if (status === "unauthenticated") {
      setError("Please sign in to view classrooms.");
      setLoading(false);
      return;
    }

    if (status !== "authenticated") return;

    fetchClassrooms();
  }, [status]);

  const fetchClassrooms = async () => {
    if (!session?.user?.sessionToken) {
      setError("Session token not found.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/admin/classrooms?class_type=public");
      if (!response.ok) {
        throw new Error(await response.text());
      }
      const data = await response.json();
      // Handle both flat array and paginated { results: [] } shapes
      const result: Classroom[] = Array.isArray(data)
        ? data
        : Array.isArray(data.results)
          ? data.results
          : [];
      setClassrooms(result);
    } catch (err: any) {
      console.error("Failed to fetch classrooms:", err);
      setError(err.message || "Failed to load classrooms.");
      toast({
        title: "Error",
        description: err.message || "Failed to load classrooms.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveClassroom = async (data: any) => {
    // Start loading
    setIsSaving(true);
    try {
      let url = "/api/admin/classrooms";
      let method = "POST";
      let body = data;

      if (editingClassroom) {
        url = `/api/admin/classrooms/${editingClassroom.id}`;
        method = "PATCH";
        body = { ...editingClassroom, ...data };
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      await response.json();
      toast({
        title: "Success",
        description: editingClassroom
          ? "Classroom updated successfully"
          : "Classroom created successfully",
      });

      // Close modals only on success
      setEditingClassroom(null);
      setIsAddModalOpen(false);
      fetchClassrooms();
    } catch (err: any) {
      console.error("Failed to save classroom:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to save classroom.",
        variant: "destructive",
      });
    } finally {
      // Stop loading regardless of success/error
      setIsSaving(false);
    }
  };

  const handleDeleteClassroom = async () => {
    if (!deletingClassroom) return;

    // Start loading
    setIsDeleting(true);
    try {
      const url = `/api/admin/classrooms/${deletingClassroom.id}`;
      const response = await fetch(url, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      toast({
        title: "Success",
        description: "Classroom deleted successfully",
      });

      // Close modal only on success
      setDeletingClassroom(null);
      fetchClassrooms();
    } catch (err: any) {
      console.error("Failed to delete classroom:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to delete classroom.",
        variant: "destructive",
      });
    } finally {
      // Stop loading
      setIsDeleting(false);
    }
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

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "classrooms.csv";
    a.click();
    toast({
      title: "Success",
      description: "Classrooms exported successfully",
    });
  };

  const filteredClassrooms = classrooms.filter(
    (classroom) =>
      classroom.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      classroom.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="space-y-1">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Classrooms
          </h1>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-destructive">{error}</p>
            <Button onClick={fetchClassrooms} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              className="flex-1 sm:flex-none bg-transparent"
            >
              <Download className="mr-2 h-4 w-4" />
              <span className="hidden xs:inline">Export</span>
            </Button>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="flex-1 sm:flex-none"
            >
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
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0 flex-1">
                    <CardTitle className="text-lg sm:text-xl truncate">
                      {classroom.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1.5 mt-0.5">
                      <Badge variant="secondary" className="font-mono text-xs">
                        {classroom.code}
                      </Badge>
                      {classroom.class_type === "public" && (
                        <Badge className="text-[10px] bg-blue-100 text-blue-700 hover:bg-blue-100 border-0">
                          🌐 Online
                        </Badge>
                      )}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="flex-shrink-0"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => router.push(`/admin/classrooms/${classroom.id}`)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setEditingClassroom(classroom)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Classroom
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/classrooms/${classroom.id}/students`} className="cursor-pointer">
                          <Users className="mr-2 h-4 w-4" />
                          Manage Students
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeletingClassroom(classroom)}
                      >
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
                  onClick={() => router.push(`/admin/classrooms/${classroom.id}`)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Classroom
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredClassrooms.length === 0 && !loading && (
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
          // Prevent closing if saving is in progress
          if (isSaving) return;
          setIsAddModalOpen(open);
          if (!open) setEditingClassroom(null);
        }}
        classroom={editingClassroom ?? undefined}
        onSave={handleSaveClassroom}
        loading={isSaving} // Pass the loading state
      />

      <DeleteConfirmationModal
        open={!!deletingClassroom}
        onOpenChange={(open) => {
          // Prevent closing if deleting is in progress
          if (isDeleting) return;
          if (!open) setDeletingClassroom(null);
        }}
        title="Delete Classroom"
        description={`Are you sure you want to delete ${deletingClassroom?.name}? This action cannot be undone.`}
        onConfirm={handleDeleteClassroom}
        loading={isDeleting} // Pass the loading state
      />


    </>
  );
}

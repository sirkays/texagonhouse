//texagon_academy\texagonui\app\admin\students\page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
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
import {
  Plus,
  Search,
  Mail,
  Download,
  Eye,
  Edit,
  Trash2,
  BookOpen,
  Users,
  CheckSquare,
  Square,
  Loader2,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

export default function StudentsPage() {
  const { toast } = useToast();
  const router = useRouter();

  // ── student list state ──────────────────────────────────────
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
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [classroomSearch, setClassroomSearch] = useState("");

  // ── assign-course panel state ───────────────────────────────
  const [showAssignPanel, setShowAssignPanel] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<number>>(new Set());
  const [publicCourses, setPublicCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignMode, setAssignMode] = useState<"selected" | "classroom">("selected");
  const [assignClassroomId, setAssignClassroomId] = useState<string>("");

  /* ── debounce ── */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => { fetchClassrooms(); }, []);
  useEffect(() => { loadStudents(); }, [debouncedSearch, filterClassroom, filterStatus]);

  // clear selections when panel closes
  useEffect(() => {
    if (!showAssignPanel) {
      setSelectedStudentIds(new Set());
      setSelectedCourseId("");
      setAssignMode("selected");
      setAssignClassroomId("");
    }
  }, [showAssignPanel]);

  // load public courses when panel opens
  useEffect(() => {
    if (showAssignPanel && publicCourses.length === 0) loadPublicCourses();
  }, [showAssignPanel]);

  /* ── API helpers ── */
  const fetchStudents = async (q: string, classroom: string, status: string) => {
    const params = new URLSearchParams();
    if (q) params.append("q", q);
    if (classroom !== "all") params.append("classroom", classroom);
    if (status !== "all") params.append("status", status);
    const res = await fetch(`/api/admin/students${params.toString() ? "?" + params : ""}`);
    if (!res.ok) { const e = await res.json(); throw new Error(e.detail || "Failed to fetch students"); }
    return res.json();
  };

  const fetchClassrooms = async () => {
    try {
      const res = await fetch("/api/admin/classrooms");
      if (!res.ok) throw new Error("Failed to fetch classrooms");
      setClassrooms(await res.json());
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
  };

  const loadStudents = async () => {
    setIsLoadingStudents(true);
    try { setStudents(await fetchStudents(debouncedSearch, filterClassroom, filterStatus)); }
    catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setIsLoadingStudents(false); }
  };

  const loadPublicCourses = async () => {
    setIsLoadingCourses(true);
    try {
      const res = await fetch("/api/admin/courses?course_type=public");
      if (!res.ok) throw new Error("Failed to load courses");
      const data = await res.json();
      // accept array or paginated {results:[...]}
      const courses = Array.isArray(data) ? data : (data.results ?? []);
      setPublicCourses(courses.filter((c: any) => c.course_type === "public" || !c.course_type));
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsLoadingCourses(false);
    }
  };

  /* ── student CRUD ── */
  const handleSaveStudent = async (data: any) => {
    setIsSaving(true);
    try {
      // Separate the file from the rest of the payload — File objects cannot be JSON-serialized
      const { id, avatarFile, ...jsonFields } = data;

      let body: BodyInit;
      let headers: Record<string, string> | undefined;

      if (avatarFile instanceof File) {
        // Use multipart/form-data so the avatar is transmitted correctly
        const fd = new FormData();
        Object.entries(jsonFields).forEach(([k, v]) => {
          if (v !== null && v !== undefined) fd.append(k, String(v));
        });
        fd.append("avatar", avatarFile);
        body = fd;
        // Let the browser set Content-Type (with boundary) automatically
        headers = undefined;
      } else {
        body = JSON.stringify(jsonFields);
        headers = { "Content-Type": "application/json" };
      }

      const res = editingStudent
        ? await fetch(`/api/admin/students/${editingStudent.id}`, { method: "PUT", headers, body })
        : await fetch("/api/admin/students", { method: "POST", headers, body });

      if (!res.ok) { const e = await res.json(); throw new Error(e.detail || e.error || "Failed to save student"); }
      toast({ title: "Success", description: editingStudent ? "Student updated" : "Student added" });
      loadStudents();
      setEditingStudent(null);
      setIsAddModalOpen(false);
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setIsSaving(false); }
  };

  const handleDeleteStudent = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/students/${deletingStudent.id}`, { method: "DELETE" });
      if (!res.ok) { const e = await res.json(); throw new Error(e.detail || "Failed to delete student"); }
      toast({ title: "Success", description: "Student deleted" });
      loadStudents();
      setDeletingStudent(null);
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setIsDeleting(false); }
  };

  const handleExport = async () => {
    try {
      const res = await fetch("/api/admin/students/export");
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `students_${new Date().toISOString().split("T")[0]}.csv`; a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Success", description: "Students exported" });
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
  };

  /* ── selection helpers ── */
  const toggleStudent = (id: number) => {
    setSelectedStudentIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAllVisible = () => setSelectedStudentIds(new Set(students.map(s => s.id)));
  const clearSelection = () => setSelectedStudentIds(new Set());

  const selectAllInClassroom = (classroomName: string) => {
    const ids = students.filter(s => s.classroom === classroomName).map(s => s.id);
    setSelectedStudentIds(new Set(ids));
  };

  /* ── assign course ── */
  const handleAssignCourse = async () => {
    if (!selectedCourseId) {
      toast({ title: "Select a course", description: "Please choose a public course first.", variant: "destructive" });
      return;
    }
    setIsAssigning(true);
    try {
      let res: Response;
      if (assignMode === "classroom") {
        if (!assignClassroomId) {
          toast({ title: "Select a classroom", description: "Please choose a classroom.", variant: "destructive" });
          setIsAssigning(false);
          return;
        }
        res = await fetch(`/api/admin/courses/${selectedCourseId}/enroll-classroom`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ classroom_id: parseInt(assignClassroomId) }),
        });
      } else {
        if (selectedStudentIds.size === 0) {
          toast({ title: "No students selected", description: "Check at least one student.", variant: "destructive" });
          setIsAssigning(false);
          return;
        }
        res = await fetch(`/api/admin/courses/${selectedCourseId}/bulk-enroll`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ student_ids: Array.from(selectedStudentIds) }),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Assignment failed");

      const enrolled = data.enrolled ?? 0;
      const already = data.already_enrolled ?? 0;
      toast({
        title: "Course Assigned ✓",
        description: `${enrolled} enrolled${already ? `, ${already} already enrolled` : ""}.`,
      });
      setShowAssignPanel(false);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsAssigning(false);
    }
  };

  /* ── skeleton ── */
  function StudentRowSkeleton() {
    return (
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border p-4 rounded-lg">
        <div className="flex gap-4 items-center">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-32 sm:w-40" />
            <Skeleton className="h-3 w-full max-w-[200px]" />
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

  /* ── UI ── */
  return (
    <>
      <div className="space-y-6 px-2 sm:px-0">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Students</h1>
            <p className="text-muted-foreground">Manage student profiles and enrollments</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="w-full sm:w-auto" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />Export
            </Button>
            <Button
              variant={showAssignPanel ? "secondary" : "outline"}
              className="w-full sm:w-auto"
              onClick={() => setShowAssignPanel(v => !v)}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              {showAssignPanel ? "Hide Assign Panel" : "Assign Course"}
              {showAssignPanel ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
            </Button>
            <Button className="w-full sm:w-auto" onClick={() => setIsAddModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />Add Student
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative w-full md:flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <Input className="pl-9" placeholder="Search students..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
              <Select value={filterClassroom} onValueChange={setFilterClassroom} onOpenChange={open => { if (!open) setClassroomSearch(""); }}>
                <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Classroom" /></SelectTrigger>
                <SelectContent>
                  <div className="p-2 sticky top-0 bg-popover z-10 border-b">
                    <Input placeholder="Search..." value={classroomSearch} onChange={e => setClassroomSearch(e.target.value)} onKeyDown={e => e.stopPropagation()} className="h-8 text-sm" />
                  </div>
                  <div className="max-h-[200px] overflow-y-auto mt-1">
                    <SelectItem value="all">All Classrooms</SelectItem>
                    {classrooms.filter(c => c.name.toLowerCase().includes(classroomSearch.toLowerCase())).map(c => (
                      <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                    ))}
                    {classrooms.filter(c => c.name.toLowerCase().includes(classroomSearch.toLowerCase())).length === 0 && (
                      <div className="p-2 text-sm text-muted-foreground text-center">No classrooms found</div>
                    )}
                  </div>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
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

        {/* ── Assign Course Panel ────────────────────────────── */}
        {showAssignPanel && (
          <Card className="border-primary/40 bg-primary/5">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BookOpen className="h-4 w-4 text-primary" />
                    Assign Public Course
                  </CardTitle>
                  <CardDescription className="mt-0.5">
                    Assign a public course to selected students or an entire classroom.
                  </CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowAssignPanel(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mode tabs */}
              <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
                <button
                  className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors ${assignMode === "selected" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  onClick={() => setAssignMode("selected")}
                >
                  <CheckSquare className="inline h-3.5 w-3.5 mr-1.5" />Selected Students
                </button>
                <button
                  className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors ${assignMode === "classroom" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  onClick={() => setAssignMode("classroom")}
                >
                  <Users className="inline h-3.5 w-3.5 mr-1.5" />Entire Classroom
                </button>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                {/* Course picker */}
                <div className="flex-1 space-y-1.5">
                  <label className="text-sm font-medium">Public Course</label>
                  <Select value={selectedCourseId} onValueChange={setSelectedCourseId} disabled={isLoadingCourses}>
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingCourses ? "Loading courses…" : "Select a course"} />
                    </SelectTrigger>
                    <SelectContent>
                      {publicCourses.length === 0 && !isLoadingCourses && (
                        <div className="p-3 text-sm text-muted-foreground text-center">No public courses found</div>
                      )}
                      {publicCourses.map(c => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name} {c.subject ? `— ${c.subject}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Classroom picker (classroom mode) */}
                {assignMode === "classroom" && (
                  <div className="flex-1 space-y-1.5">
                    <label className="text-sm font-medium">Classroom</label>
                    <Select value={assignClassroomId} onValueChange={setAssignClassroomId}>
                      <SelectTrigger><SelectValue placeholder="Select classroom" /></SelectTrigger>
                      <SelectContent>
                        {classrooms.map(c => (
                          <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Button
                  onClick={handleAssignCourse}
                  disabled={isAssigning || !selectedCourseId || (assignMode === "selected" && selectedStudentIds.size === 0) || (assignMode === "classroom" && !assignClassroomId)}
                  className="sm:self-end"
                >
                  {isAssigning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BookOpen className="mr-2 h-4 w-4" />}
                  {isAssigning ? "Assigning…" : "Assign Course"}
                </Button>
              </div>

              {/* Selection status (selected mode) */}
              {assignMode === "selected" && (
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground pt-1">
                  <span className="font-medium text-foreground">{selectedStudentIds.size}</span> student{selectedStudentIds.size !== 1 ? "s" : ""} selected
                  {selectedStudentIds.size > 0 && (
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={clearSelection}>
                      <X className="h-3 w-3 mr-1" />Clear
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={selectAllVisible}>
                    <CheckSquare className="h-3 w-3 mr-1" />Select all visible ({students.length})
                  </Button>
                  {filterClassroom !== "all" && (
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => selectAllInClassroom(filterClassroom)}>
                      <Users className="h-3 w-3 mr-1" />Select all in "{filterClassroom}"
                    </Button>
                  )}
                </div>
              )}

              {assignMode === "classroom" && (
                <p className="text-sm text-muted-foreground">
                  All students currently assigned to the selected classroom will be enrolled. Students already enrolled are automatically skipped.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Students */}
        <Card>
          <CardHeader>
            <CardTitle>All Students ({students.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingStudents ? (
              <div className="space-y-4">{Array.from({ length: 6 }).map((_, i) => <StudentRowSkeleton key={i} />)}</div>
            ) : students.length > 0 ? (
              students.map(student => (
                <div
                  key={student.id}
                  className={`grid grid-cols-1 sm:grid-cols-[auto_1fr_auto] gap-3 p-4 border rounded-lg items-center bg-card text-card-foreground shadow-sm w-full max-w-full transition-colors ${showAssignPanel && assignMode === "selected" && selectedStudentIds.has(student.id) ? "border-primary/60 bg-primary/5" : ""}`}
                >
                  {/* Checkbox (only in assign-selected mode) */}
                  {showAssignPanel && assignMode === "selected" && (
                    <Checkbox
                      id={`select-student-${student.id}`}
                      checked={selectedStudentIds.has(student.id)}
                      onCheckedChange={() => toggleStudent(student.id)}
                      className="h-5 w-5"
                    />
                  )}

                  {/* Avatar + Info */}
                  <div className="flex items-center gap-3 min-w-0 w-full">
                    <Avatar className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 border">
                      <AvatarImage src={student.avatar} />
                      <AvatarFallback>{student.name?.split(" ").map((n: string) => n[0]).join("") || "??"}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0 w-full">
                      <p className="font-semibold truncate text-base leading-tight">{student.name}</p>
                      <div className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate block w-full">{student.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button size="sm" variant="outline" className="flex-1 sm:flex-none" onClick={() => router.push(`/admin/students/${student.id}`)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 sm:flex-none" onClick={() => setEditingStudent(student)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 sm:flex-none hover:bg-red-50 hover:text-red-600 border-red-200" onClick={() => setDeletingStudent(student)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-10">No students found.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <StudentModal
        open={isAddModalOpen || !!editingStudent}
        onOpenChange={open => { if (isSaving) return; setIsAddModalOpen(open); if (!open) setEditingStudent(null); }}
        student={editingStudent}
        classrooms={classrooms}
        onSave={handleSaveStudent}
        loading={isSaving}
      />
      <DeleteConfirmationModal
        open={!!deletingStudent}
        onOpenChange={open => { if (isDeleting) return; if (!open) setDeletingStudent(null); }}
        title="Delete Student"
        description={`Are you sure you want to delete ${deletingStudent?.name}?`}
        onConfirm={handleDeleteStudent}
        loading={isDeleting}
      />
    </>
  );
}

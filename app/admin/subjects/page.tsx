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
import {Plus, Search, BookOpen, Edit, Trash2, Eye} from "lucide-react";
import {SubjectModal} from "@/components/admin/modals/subject-modal";
import {DeleteConfirmationModal} from "@/components/admin/modals/delete-confirmation-modal";
import {ViewDetailsModal} from "@/components/admin/modals/view-details-modal";
import {useToast} from "@/hooks/use-toast";

export default function SubjectsPage() {
  const {toast} = useToast();
  const [subjects, setSubjects] = useState([
    {
      id: 1,
      name: "Mathematics",
      code: "MATH",
      courses: 12,
      teachers: 8,
      students: 245,
    },
    {
      id: 2,
      name: "Physics",
      code: "PHYS",
      courses: 8,
      teachers: 5,
      students: 189,
    },
    {
      id: 3,
      name: "Chemistry",
      code: "CHEM",
      courses: 7,
      teachers: 4,
      students: 167,
    },
    {
      id: 4,
      name: "Biology",
      code: "BIO",
      courses: 6,
      teachers: 4,
      students: 156,
    },
    {
      id: 5,
      name: "English",
      code: "ENG",
      courses: 10,
      teachers: 6,
      students: 298,
    },
    {
      id: 6,
      name: "History",
      code: "HIST",
      courses: 5,
      teachers: 3,
      students: 134,
    },
    {
      id: 7,
      name: "Geography",
      code: "GEO",
      courses: 4,
      teachers: 3,
      students: 112,
    },
    {
      id: 8,
      name: "Computer Science",
      code: "CS",
      courses: 9,
      teachers: 5,
      students: 201,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);

  const filteredSubjects = subjects.filter(
    (subject) =>
      subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddSubject = () => {
    setSelectedSubject(null);
    setSubjectModalOpen(true);
  };

  const handleEditSubject = (subject: any) => {
    setSelectedSubject(subject);
    setSubjectModalOpen(true);
  };

  const handleViewSubject = (subject: any) => {
    setSelectedSubject(subject);
    setViewModalOpen(true);
  };

  const handleDeleteSubject = (subject: any) => {
    setSelectedSubject(subject);
    setDeleteModalOpen(true);
  };

  const handleSaveSubject = (subject: any) => {
    if (subject.id) {
      setSubjects(subjects.map((s) => (s.id === subject.id ? subject : s)));
      toast({
        title: "Subject Updated",
        description: `${subject.name} has been updated successfully.`,
      });
    } else {
      const newSubject = {
        ...subject,
        id: Math.max(...subjects.map((s) => s.id)) + 1,
        courses: 0,
        teachers: 0,
        students: 0,
      };
      setSubjects([...subjects, newSubject]);
      toast({
        title: "Subject Added",
        description: `${subject.name} has been added successfully.`,
      });
    }
  };

  const confirmDelete = () => {
    setSubjects(subjects.filter((s) => s.id !== selectedSubject.id));
    toast({
      title: "Subject Deleted",
      description: `${selectedSubject.name} has been removed from the system.`,
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
              Subjects
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage subjects and their courses
            </p>
          </div>
          <Button onClick={handleAddSubject}>
            <Plus className="mr-2 h-4 w-4" />
            Add Subject
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search subjects..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {filteredSubjects.map((subject) => (
            <Card
              key={subject.id}
              className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="mt-4">
                  <CardTitle className="text-lg">{subject.name}</CardTitle>
                  <CardDescription>
                    <Badge
                      variant="secondary"
                      className="font-mono text-xs mt-2">
                      {subject.code}
                    </Badge>
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Existing code */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Courses</span>
                      <span className="font-semibold text-foreground">
                        {subject.courses}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Teachers</span>
                      <span className="font-semibold text-foreground">
                        {subject.teachers}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Students</span>
                      <span className="font-semibold text-foreground">
                        {subject.students}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-3 border-t border-border">
                    <Button
                      className="flex-1 bg-transparent"
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewSubject(subject)}>
                      <Eye className="mr-1 h-3 w-3" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditSubject(subject)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteSubject(subject)}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <SubjectModal
        open={subjectModalOpen}
        onOpenChange={setSubjectModalOpen}
        subject={selectedSubject}
        onSave={handleSaveSubject}
      />
      <DeleteConfirmationModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={confirmDelete}
        title="Delete Subject"
        description={`Are you sure you want to delete ${selectedSubject?.name}? This action cannot be undone.`}
      />
      <ViewDetailsModal
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        title="Subject Details"
        data={selectedSubject}
        type="subject"
      />
    </>
  );
}

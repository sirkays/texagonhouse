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
  Search,
  Clock,
  FileQuestion,
  Calendar,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import {TestModal} from "@/components/admin/modals/test-modal";
import {DeleteConfirmationModal} from "@/components/admin/modals/delete-confirmation-modal";
import {ViewDetailsModal} from "@/components/admin/modals/view-details-modal";
import {useToast} from "@/hooks/use-toast";

export default function TestsPage() {
  const {toast} = useToast();
  const [tests, setTests] = useState([
    {
      id: 1,
      title: "Calculus Midterm Exam",
      course: "Advanced Mathematics",
      visibility: "published",
      duration: 90,
      totalMarks: 100,
      questions: 25,
      attempts: 27,
      startAt: "2024-03-20T09:00:00",
      endAt: "2024-03-20T12:00:00",
    },
    {
      id: 2,
      title: "Quantum Mechanics Quiz",
      course: "Quantum Physics",
      visibility: "published",
      duration: 45,
      totalMarks: 50,
      questions: 15,
      attempts: 23,
      startAt: "2024-03-21T14:00:00",
      endAt: "2024-03-21T15:00:00",
    },
    {
      id: 3,
      title: "Organic Chemistry Test",
      course: "Organic Chemistry",
      visibility: "draft",
      duration: 60,
      totalMarks: 75,
      questions: 20,
      attempts: 0,
      startAt: null,
      endAt: null,
    },
    {
      id: 4,
      title: "Literature Analysis",
      course: "English Literature",
      visibility: "published",
      duration: 120,
      totalMarks: 100,
      questions: 10,
      attempts: 30,
      startAt: "2024-03-19T10:00:00",
      endAt: "2024-03-19T14:00:00",
    },
    {
      id: 5,
      title: "React Final Assessment",
      course: "Web Development",
      visibility: "closed",
      duration: 180,
      totalMarks: 150,
      questions: 30,
      attempts: 24,
      startAt: "2024-03-15T09:00:00",
      endAt: "2024-03-15T14:00:00",
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<any>(null);

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case "published":
        return "default";
      case "draft":
        return "secondary";
      case "closed":
        return "outline";
      default:
        return "secondary";
    }
  };

  const filteredTests = tests.filter(
    (test) =>
      test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.course.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddTest = () => {
    setSelectedTest(null);
    setTestModalOpen(true);
  };

  const handleEditTest = (test: any) => {
    setSelectedTest(test);
    setTestModalOpen(true);
  };

  const handleViewTest = (test: any) => {
    setSelectedTest(test);
    setViewModalOpen(true);
  };

  const handleDeleteTest = (test: any) => {
    setSelectedTest(test);
    setDeleteModalOpen(true);
  };

  const handleSaveTest = (test: any) => {
    if (test.id) {
      setTests(tests.map((t) => (t.id === test.id ? test : t)));
      toast({
        title: "Test Updated",
        description: `${test.title} has been updated successfully.`,
      });
    } else {
      const newTest = {
        ...test,
        id: Math.max(...tests.map((t) => t.id)) + 1,
        attempts: 0,
      };
      setTests([...tests, newTest]);
      toast({
        title: "Test Created",
        description: `${test.title} has been created successfully.`,
      });
    }
  };

  const confirmDelete = () => {
    setTests(tests.filter((t) => t.id !== selectedTest.id));
    toast({
      title: "Test Deleted",
      description: `${selectedTest.title} has been removed from the system.`,
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
              Tests
            </h1>
            <p className="text-muted-foreground mt-1">
              Create and manage assessments
            </p>
          </div>
          <Button onClick={handleAddTest}>
            <Plus className="mr-2 h-4 w-4" />
            Create Test
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Tests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">87</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Published
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">62</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                In Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">18</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">78%</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search tests..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline">Filter</Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {filteredTests.map((test) => (
            <Card key={test.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant={getVisibilityColor(test.visibility)}
                        className="capitalize">
                        {test.visibility}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{test.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {test.course}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Test Info Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
                      <Clock className="h-4 w-4 text-muted-foreground mb-1" />
                      <span className="font-semibold text-foreground">
                        {test.duration}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        minutes
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
                      <FileQuestion className="h-4 w-4 text-muted-foreground mb-1" />
                      <span className="font-semibold text-foreground">
                        {test.questions}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        questions
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
                      <span className="text-lg font-bold text-foreground">
                        {test.totalMarks}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        marks
                      </span>
                    </div>
                  </div>

                  {test.startAt && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 rounded-lg bg-muted/30">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(test.startAt).toLocaleDateString()} at{" "}
                        {new Date(test.startAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className="text-sm text-muted-foreground">
                      Attempts
                    </span>
                    <Badge variant="secondary">{test.attempts}</Badge>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-transparent"
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewTest(test)}>
                      <Eye className="mr-1 h-3 w-3" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditTest(test)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteTest(test)}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <TestModal
        open={testModalOpen}
        onOpenChange={setTestModalOpen}
        test={selectedTest}
        onSave={handleSaveTest}
      />
      <DeleteConfirmationModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={confirmDelete}
        title="Delete Test"
        description={`Are you sure you want to delete ${selectedTest?.title}? This action cannot be undone.`}
      />
      <ViewDetailsModal
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        title="Test Details"
        data={selectedTest}
        type="test"
      />
    </>
  );
}

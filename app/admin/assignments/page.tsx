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
import {Plus, Search, Calendar, FileText, Users} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AssignmentsPage() {
  const assignments = [
    {
      id: 1,
      title: "Calculus Problem Set 5",
      course: "Advanced Mathematics",
      dueAt: "2024-03-25T23:59:00",
      submissions: 24,
      totalStudents: 27,
      status: "active",
    },
    {
      id: 2,
      title: "Quantum Physics Lab Report",
      course: "Quantum Physics",
      dueAt: "2024-03-28T23:59:00",
      submissions: 18,
      totalStudents: 25,
      status: "active",
    },
    {
      id: 3,
      title: "Organic Chemistry Research",
      course: "Organic Chemistry",
      dueAt: "2024-03-22T23:59:00",
      submissions: 23,
      totalStudents: 23,
      status: "closed",
    },
    {
      id: 4,
      title: "Shakespeare Essay",
      course: "English Literature",
      dueAt: "2024-03-30T23:59:00",
      submissions: 15,
      totalStudents: 32,
      status: "active",
    },
    {
      id: 5,
      title: "React Portfolio Project",
      course: "Web Development",
      dueAt: "2024-04-05T23:59:00",
      submissions: 8,
      totalStudents: 24,
      status: "active",
    },
    {
      id: 6,
      title: "World War II Analysis",
      course: "World History",
      dueAt: "2024-03-20T23:59:00",
      submissions: 28,
      totalStudents: 28,
      status: "closed",
    },
  ];

  const getStatusColor = (status: string) => {
    return status === "active" ? "default" : "secondary";
  };

  const getSubmissionRate = (submissions: number, total: number) => {
    return Math.round((submissions / total) * 100);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Assignments
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage assignments and submissions
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Assignment
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Assignments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">42</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">156</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Graded
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">892</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg Submission Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">87%</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search assignments..." className="pl-9" />
              </div>
              <Button variant="outline">Filter</Button>
            </div>
          </CardContent>
        </Card>

        {/* Assignments Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Assignments</CardTitle>
            <CardDescription>
              Track assignment submissions and deadlines
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Submissions</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((assignment) => {
                  const rate = getSubmissionRate(
                    assignment.submissions,
                    assignment.totalStudents
                  );
                  return (
                    <TableRow key={assignment.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {assignment.title}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {assignment.course}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {new Date(assignment.dueAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {assignment.submissions}/{assignment.totalStudents}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            rate >= 80
                              ? "default"
                              : rate >= 60
                              ? "secondary"
                              : "outline"
                          }>
                          {rate}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusColor(assignment.status)}
                          className="capitalize">
                          {assignment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

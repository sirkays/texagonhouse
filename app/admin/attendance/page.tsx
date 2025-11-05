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
import {Calendar, Plus, Download, Filter, Eye} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {AttendanceDetailsModal} from "@/components/admin/modals/attendance-details-modal";

export default function AttendancePage() {
  const [viewingSession, setViewingSession] = useState<any>(null);

  const sessions = [
    {
      id: 1,
      course: "Mathematics 101",
      classroom: "Grade 10A",
      date: "2024-03-15",
      topic: "Algebra Basics",
      present: 28,
      absent: 4,
      total: 32,
    },
    {
      id: 2,
      course: "Physics 201",
      classroom: "Grade 11A",
      date: "2024-03-15",
      topic: "Newton's Laws",
      present: 25,
      absent: 5,
      total: 30,
    },
    {
      id: 3,
      course: "Chemistry 101",
      classroom: "Grade 10B",
      date: "2024-03-14",
      topic: "Periodic Table",
      present: 26,
      absent: 2,
      total: 28,
    },
    {
      id: 4,
      course: "Biology 301",
      classroom: "Grade 12A",
      date: "2024-03-14",
      topic: "Cell Structure",
      present: 24,
      absent: 3,
      total: 27,
    },
    {
      id: 5,
      course: "English 101",
      classroom: "Grade 10A",
      date: "2024-03-13",
      topic: "Shakespeare",
      present: 30,
      absent: 2,
      total: 32,
    },
  ];

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Attendance
            </h1>
            <p className="text-muted-foreground mt-1">
              Track and manage student attendance
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Session
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Today's Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">12</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average Attendance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">92%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Present Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">1,089</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Absent Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">95</div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Sessions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Attendance Sessions</CardTitle>
                <CardDescription>Recent attendance records</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Classroom</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Present</TableHead>
                  <TableHead>Absent</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => {
                  const rate = Math.round(
                    (session.present / session.total) * 100
                  );
                  return (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">
                        {session.course}
                      </TableCell>
                      <TableCell>{session.classroom}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {session.date}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {session.topic}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{session.present}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{session.absent}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            rate >= 90
                              ? "default"
                              : rate >= 75
                              ? "secondary"
                              : "destructive"
                          }>
                          {rate}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewingSession(session)}>
                          <Eye className="mr-2 h-4 w-4" />
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

      {/* Attendance Details Modal */}
      <AttendanceDetailsModal
        open={!!viewingSession}
        onOpenChange={(open) => !open && setViewingSession(null)}
        session={viewingSession}
      />
    </>
  );
}

"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {Badge} from "@/components/ui/badge";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";

interface ViewDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  data: any;
  type: "teacher" | "student" | "course" | "test" | "subject";
}

export function ViewDetailsModal({
  open,
  onOpenChange,
  title,
  data,
  type,
}: ViewDetailsModalProps) {
  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {type === "teacher" && (
            <>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={`/.jpg?height=80&width=80&query=${data.name}`}
                  />
                  <AvatarFallback className="text-lg">
                    {data.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-2xl font-bold">{data.name}</h3>
                  <p className="text-muted-foreground">{data.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Experience</p>
                  <p className="text-lg font-semibold">
                    {data.experience} years
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Courses Teaching
                  </p>
                  <p className="text-lg font-semibold">{data.courses}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Specialties
                </p>
                <div className="flex flex-wrap gap-2">
                  {data.specialties?.map((specialty: string) => (
                    <Badge key={specialty} variant="secondary">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {type === "student" && (
            <>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={`/.jpg?height=80&width=80&query=${data.name}`}
                  />
                  <AvatarFallback className="text-lg">
                    {data.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-2xl font-bold">{data.name}</h3>
                  <p className="text-muted-foreground">{data.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Classroom</p>
                  <p className="text-lg font-semibold">{data.classroom}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Enrollment Date
                  </p>
                  <p className="text-lg font-semibold">{data.enrollmentDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge
                    variant={
                      data.status === "active" ? "default" : "secondary"
                    }>
                    {data.status}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {/* <div>
                  <p className="text-sm text-muted-foreground">Attendance Rate</p>
                  <p className="text-lg font-semibold">{data.attendance}%</p>
                </div> */}
                <div>
                  <p className="text-sm text-muted-foreground">Average Grade</p>
                  <p className="text-lg font-semibold">{data.grade}%</p>
                </div>
              </div>
            </>
          )}

          {type === "course" && (
            <>
              <div>
                <h3 className="text-2xl font-bold">{data.name}</h3>
                <Badge variant="secondary" className="mt-2">
                  {data.subject}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Teacher</p>
                  <p className="text-lg font-semibold">{data.teacher}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Classroom</p>
                  <p className="text-lg font-semibold">{data.classroom}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Students Enrolled
                  </p>
                  <p className="text-lg font-semibold">{data.students}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Modules</p>
                  <p className="text-lg font-semibold">{data.modules}</p>
                </div>
              </div>
            </>
          )}

          {type === "test" && (
            <>
              <div>
                <h3 className="text-2xl font-bold">{data.title}</h3>
                <p className="text-muted-foreground mt-1">{data.course}</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="text-lg font-semibold">{data.duration} min</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Marks</p>
                  <p className="text-lg font-semibold">{data.totalMarks}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Questions</p>
                  <p className="text-lg font-semibold">{data.questions}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Visibility</p>
                  <Badge variant="secondary" className="capitalize">
                    {data.visibility}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Attempts</p>
                  <p className="text-lg font-semibold">{data.attempts}</p>
                </div>
              </div>
              {data.startAt && (
                <div>
                  <p className="text-sm text-muted-foreground">Schedule</p>
                  <p className="text-lg font-semibold">
                    {new Date(data.startAt).toLocaleString()} -{" "}
                    {new Date(data.endAt).toLocaleString()}
                  </p>
                </div>
              )}
            </>
          )}

          {type === "subject" && (
            <>
              <div>
                <h3 className="text-2xl font-bold">{data.name}</h3>
                <Badge variant="secondary" className="font-mono mt-2">
                  {data.code}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Courses</p>
                  <p className="text-lg font-semibold">{data.courses}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Teachers</p>
                  <p className="text-lg font-semibold">{data.teachers}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Students</p>
                  <p className="text-lg font-semibold">{data.students}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

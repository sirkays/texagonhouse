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
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Plus, Search, Video, Calendar, Clock, Users} from "lucide-react";
import {SessionDetailsModal} from "@/components/admin/modals/session-details-modal";
import {useToast} from "@/hooks/use-toast";

export default function LiveSessionsPage() {
  const {toast} = useToast();
  const [viewingSession, setViewingSession] = useState<any>(null);

  const sessions = [
    {
      id: 1,
      title: "Advanced Calculus Review",
      course: "Advanced Mathematics",
      host: "Dr. Robert Smith",
      scheduledAt: "2024-03-20T14:00:00",
      duration: 90,
      status: "pending",
      participants: 0,
      maxParticipants: 30,
    },
    {
      id: 2,
      title: "Quantum Physics Lab Demo",
      course: "Quantum Physics",
      host: "Prof. Maria Garcia",
      scheduledAt: "2024-03-20T10:00:00",
      duration: 120,
      status: "started",
      participants: 24,
      maxParticipants: 25,
    },
    {
      id: 3,
      title: "Chemistry Experiment Walkthrough",
      course: "Organic Chemistry",
      host: "Prof. Maria Garcia",
      scheduledAt: "2024-03-21T15:00:00",
      duration: 60,
      status: "pending",
      participants: 0,
      maxParticipants: 20,
    },
    {
      id: 4,
      title: "Shakespeare Discussion",
      course: "English Literature",
      host: "Dr. James Wilson",
      scheduledAt: "2024-03-19T16:00:00",
      duration: 90,
      status: "completed",
      participants: 28,
      maxParticipants: 32,
    },
    {
      id: 5,
      title: "React Hooks Deep Dive",
      course: "Web Development",
      host: "Mr. David Lee",
      scheduledAt: "2024-03-22T13:00:00",
      duration: 120,
      status: "pending",
      participants: 0,
      maxParticipants: 24,
    },
    {
      id: 6,
      title: "World War II Analysis",
      course: "World History",
      host: "Ms. Lisa Anderson",
      scheduledAt: "2024-03-18T11:00:00",
      duration: 75,
      status: "completed",
      participants: 26,
      maxParticipants: 28,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "started":
        return "default";
      case "pending":
        return "secondary";
      case "completed":
        return "outline";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === "started") {
      return (
        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
      );
    }
    return null;
  };

  const handleJoinSession = (session: any) => {
    toast({
      title: "Joining Session",
      description: "Connecting to live session...",
    });
    setTimeout(() => {
      window.open("https://meet.example.com/session-" + session.id, "_blank");
    }, 1000);
  };

  const handleViewRecording = (session: any) => {
    toast({
      title: "Loading Recording",
      description: "Opening session recording...",
    });
    setTimeout(() => {
      window.open(
        "https://recordings.example.com/session-" + session.id,
        "_blank"
      );
    }, 1000);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Live Sessions
            </h1>
            <p className="text-muted-foreground mt-1">
              Schedule and manage live teaching sessions
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Schedule Session
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">156</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Live Now
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">3</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Upcoming
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">12</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg Attendance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">89%</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search sessions..." className="pl-9" />
              </div>
              <Button variant="outline">Filter</Button>
            </div>
          </CardContent>
        </Card>

        {/* Sessions List */}
        <div className="grid gap-6 md:grid-cols-2">
          {sessions.map((session) => (
            <Card
              key={session.id}
              className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant={getStatusColor(session.status)}
                        className="capitalize">
                        {getStatusIcon(session.status)}
                        <span className="ml-1">{session.status}</span>
                      </Badge>
                    </div>
                    <CardTitle className="text-lg leading-tight">
                      {session.title}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {session.course}
                    </CardDescription>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Video className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Host Info */}
                  <div className="flex items-center gap-3 pb-3 border-b border-border">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={`/.jpg?height=40&width=40&query=${session.host}`}
                      />
                      <AvatarFallback>
                        {session.host
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {session.host}
                      </p>
                      <p className="text-xs text-muted-foreground">Host</p>
                    </div>
                  </div>

                  {/* Session Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(session.scheduledAt).toLocaleDateString()}
                      </span>
                      <span>at</span>
                      <span>
                        {new Date(session.scheduledAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{session.duration} minutes</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>
                        {session.participants}/{session.maxParticipants}{" "}
                        participants
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {session.status !== "pending" && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Attendance</span>
                        <span>
                          {Math.round(
                            (session.participants / session.maxParticipants) *
                              100
                          )}
                          %
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{
                            width: `${
                              (session.participants / session.maxParticipants) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      variant={
                        session.status === "started" ? "default" : "outline"
                      }
                      disabled={session.status === "completed"}
                      onClick={() => {
                        if (session.status === "started") {
                          handleJoinSession(session);
                        } else if (session.status === "completed") {
                          handleViewRecording(session);
                        } else {
                          setViewingSession(session);
                        }
                      }}>
                      {session.status === "started"
                        ? "Join Session"
                        : session.status === "completed"
                        ? "View Recording"
                        : "View Details"}
                    </Button>
                    {session.status === "completed" && (
                      <Button
                        variant="outline"
                        onClick={() => handleViewRecording(session)}>
                        <Video className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <SessionDetailsModal
        open={!!viewingSession}
        onOpenChange={(open) => !open && setViewingSession(null)}
        session={viewingSession}
      />
    </>
  );
}

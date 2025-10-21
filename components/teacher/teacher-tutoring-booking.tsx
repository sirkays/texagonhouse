"use client";

import * as React from "react";
import { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar as CalendarIcon,
  Clock,
  Star,
  Plus,
  CheckCircle,
  AlertCircle,
  Users,
  BookOpen,
  Shield,
  Zap,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Trash2,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ButtonProps, buttonVariants } from "@/components/ui/button";

/* ---------------- Pagination components (unchanged) ---------------- */
const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
);
Pagination.displayName = "Pagination";

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-1", className)}
    {...props}
  />
));
PaginationContent.displayName = "PaginationContent";

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
));
PaginationItem.displayName = "PaginationItem";

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<ButtonProps, "size"> &
  React.ComponentProps<"a">;

const PaginationLink = ({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) => (
  <a
    aria-current={isActive ? "page" : undefined}
    className={cn(
      buttonVariants({
        variant: isActive ? "outline" : "ghost",
        size,
      }),
      className
    )}
    {...props}
  />
);
PaginationLink.displayName = "PaginationLink";

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    className={cn("gap-1 pl-2.5", className)}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
    <span>Previous</span>
  </PaginationLink>
);
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    className={cn("gap-1 pr-2.5", className)}
    {...props}
  >
    <span>Next</span>
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
);
PaginationNext.displayName = "PaginationNext";

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    aria-hidden
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
);
PaginationEllipsis.displayName = "PaginationEllipsis";

/* ---------------- Component ---------------- */
export function TeacherTutoringBooking() {
  // Create Private Session dialog state
  const [isCreatePrivateDialogOpen, setIsCreatePrivateDialogOpen] =
    useState(false);

  // Delete dialog (now shared by upcoming + private)
  const [isDeleteSessionDialogOpen, setIsDeleteSessionDialogOpen] =
    useState(false);
  const [selectedSession, setSelectedSession] = useState<
    | ({
        id: number | string;
        category: "upcoming" | "private";
      } & any)
    | null
  >(null);

  // Tabs: added "private" tab
  const [activeTab, setActiveTab] = useState<"upcoming" | "private" | "past">(
    "upcoming"
  );

  // Pagination state for each tab
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [pastPage, setPastPage] = useState(1);
  const [privatePage, setPrivatePage] = useState(1);
  const itemsPerPage = 3;

  /* ---------------- Demo data (existing) ---------------- */
  const [upcomingSessions, setUpcomingSessions] = useState([
    {
      id: 1,
      student: "John Adebayo",
      subject: "Mathematics",
      date: "2024-01-20",
      time: "2:00 PM - 3:00 PM",
      type: "One-on-One",
      status: "Confirmed",
      meetingLink: "https://meet.techxagon.com/session-123",
      cost: "₦8,000",
      studentAvatar: "/placeholder.svg?height=40&width=40",
      notes: "Focus on calculus and derivatives",
      duration: 60,
    },
    {
      id: 2,
      student: "Mary Adebayo",
      subject: "English Literature",
      date: "2024-01-22",
      time: "4:00 PM - 5:00 PM",
      type: "Group Session",
      status: "Confirmed",
      meetingLink: "https://meet.techxagon.com/session-124",
      cost: "₦5,000",
      studentAvatar: "/placeholder.svg?height=40&width=40",
      notes: "Shakespeare analysis and essay writing",
      duration: 60,
    },
    {
      id: 3,
      student: "John Adebayo",
      subject: "Physics",
      date: "2024-01-25",
      time: "3:00 PM - 4:00 PM",
      type: "One-on-One",
      status: "Pending",
      meetingLink: null,
      cost: "₦8,000",
      studentAvatar: "/placeholder.svg?height=40&width=40",
      notes: "Mechanics and motion problems",
      duration: 60,
    },
  ]);

  const [pastSessions, setPastSessions] = useState([
    {
      id: 4,
      student: "John Adebayo",
      subject: "Mathematics",
      date: "2024-01-15",
      time: "2:00 PM - 3:00 PM",
      type: "One-on-One",
      status: "Completed",
      rating: 5,
      feedback:
        "Excellent session! John showed great improvement in understanding calculus concepts.",
      cost: "₦8,000",
      studentAvatar: "/placeholder.svg?height=40&width=40",
      hasRecording: true,
      recordingUrl: "https://recordings.techxagon.com/session-4",
      duration: 60,
      actualDuration: 58,
      dateCompleted: "2024-01-15",
    },
    {
      id: 5,
      student: "Mary Adebayo",
      subject: "English Literature",
      date: "2024-01-12",
      time: "4:00 PM - 5:00 PM",
      type: "Group Session",
      status: "Completed",
      rating: 4,
      feedback:
        "Good session on poetry analysis. Mary participated well in discussions.",
      cost: "₦5,000",
      studentAvatar: "/placeholder.svg?height=40&width=40",
      hasRecording: true,
      recordingUrl: "https://recordings.techxagon.com/session-5",
      duration: 60,
      actualDuration: 62,
      dateCompleted: "2024-01-12",
    },
  ]);

  /* ---------------- NEW: Private sessions state ---------------- */
  type PrivateSession = {
    id: string; // timestamp id
    courseId: string;
    courseName: string;
    ratePerHour: string; // e.g. "7000.00"
    durationDays: number;
    availableDays: string[]; // monday..sunday
    notes?: string;
    status: "Active" | "Inactive";
    createdAt: string; // ISO date
  };

  const courseOptions = [
    { id: "1", name: "Mathematics" },
    { id: "2", name: "Physics" },
    { id: "3", name: "English Literature" },
    { id: "4", name: "Chemistry" },
  ];

  const [privateSessions, setPrivateSessions] = useState<PrivateSession[]>([]);

  /* ---------------- Pagination helpers ---------------- */
  const paginate = (items: any[], page: number, perPage: number) => {
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    return items.slice(startIndex, endIndex);
  };
  const totalPages = (items: any[], perPage: number) =>
    Math.ceil(items.length / perPage);

  const paginatedUpcoming = paginate(upcomingSessions, upcomingPage, itemsPerPage);
  const paginatedPast = paginate(pastSessions, pastPage, itemsPerPage);
  const paginatedPrivate = paginate(privateSessions, privatePage, itemsPerPage);

  const handlePageChange = (
    setPage: React.Dispatch<React.SetStateAction<number>>,
    total: number,
    newPage: number
  ) => {
    if (newPage >= 1 && newPage <= total) setPage(newPage);
  };

  /* ---------------- UI helpers ---------------- */
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Confirmed":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Confirmed
          </Badge>
        );
      case "Pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "Completed":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case "Cancelled":
        return (
          <Badge className="bg-red-100 text-red-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Cancelled
          </Badge>
        );
      case "Active":
        return <Badge className="bg-emerald-100 text-emerald-800">Active</Badge>;
      case "Inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  const handleDeleteSession = (session: any, category: "upcoming" | "private") => {
    setSelectedSession({ ...session, category });
    setIsDeleteSessionDialogOpen(true);
  };

  const handleConfirmSession = (sessionId: number) => {
    setUpcomingSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, status: "Confirmed" } : s))
    );
  };

  /* ---------------- Create Private Session form state ---------------- */
  const [privateCourseId, setPrivateCourseId] = useState<string | undefined>();
  const [ratePerHour, setRatePerHour] = useState<string | undefined>();
  const [tutoringDurationDays, setTutoringDurationDays] = useState<number>(24);
  const [privateNotes, setPrivateNotes] = useState("");
  const [availableDays, setAvailableDays] = useState<string[]>([]);

  const toggleDay = (day: string) => {
    setAvailableDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const resetPrivateForm = () => {
    setPrivateCourseId(undefined);
    setRatePerHour(undefined);
    setTutoringDurationDays(24);
    setPrivateNotes("");
    setAvailableDays([]);
  };

  const handleCreatePrivateSession = () => {
    // Basic guard; in real code, show toasts/validation errors
    if (!privateCourseId || !ratePerHour) {
      return;
    }
    const course = courseOptions.find((c) => c.id === privateCourseId)!;
    const newItem: PrivateSession = {
      id: String(Date.now()),
      courseId: privateCourseId,
      courseName: course.name,
      ratePerHour,
      durationDays: tutoringDurationDays,
      availableDays: [...availableDays],
      notes: privateNotes?.trim(),
      status: "Active",
      createdAt: new Date().toISOString(),
    };
    setPrivateSessions((prev) => [newItem, ...prev]);
    setIsCreatePrivateDialogOpen(false);
    resetPrivateForm();
    setActiveTab("private");
    setPrivatePage(1);
  };

  const handleConfirmDelete = () => {
    if (selectedSession) {
      if (selectedSession.category === "upcoming") {
        setUpcomingSessions((prev) => prev.filter((s) => s.id !== selectedSession.id));
      } else if (selectedSession.category === "private") {
        setPrivateSessions((prev) => prev.filter((s) => s.id !== selectedSession.id));
      }
    }
    setIsDeleteSessionDialogOpen(false);
    setSelectedSession(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your tutoring sessions and private offerings
          </p>
        </div>

        {/* Create Private Session */}
        <div className="flex gap-2">
          <Dialog
            open={isCreatePrivateDialogOpen}
            onOpenChange={setIsCreatePrivateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 h-10 bg-transparent border border-[#EF7B55] text-[#EF7B55] hover:bg-[#F79771] hover:text-white">
                <Plus className="h-4 w-4" />
                Create Private Session
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-[700px] max-h-[85vh] p-0 overflow-scroll rounded-none sm:rounded-lg">
              <DialogHeader className="p-4 sm:p-6 sticky top-0 bg-background z-10 border-b">
                <DialogTitle>Create Private Session</DialogTitle>
                <DialogDescription>
                  Configure your private tutoring offering (maps to{" "}
                  <code>PrivateTutoring</code>)
                </DialogDescription>
              </DialogHeader>
              <div className="px-4 sm:px-6 py-4 overflow-y-auto">
                <div className="grid gap-4">
                  {/* Course */}
                  <div className="space-y-2">
                    <Label htmlFor="course">Course</Label>
                    <Select
                      value={privateCourseId}
                      onValueChange={setPrivateCourseId}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courseOptions.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Rate per hour */}
                  <div className="space-y-2">
                    <Label htmlFor="rate">Rate per hour</Label>
                    <Select value={ratePerHour} onValueChange={setRatePerHour}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select rate" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7000.00">₦7,000/hour</SelectItem>
                        <SelectItem value="7500.00">₦7,500/hour</SelectItem>
                        <SelectItem value="8000.00">₦8,000/hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tutoring duration (days) */}
                  <div className="space-y-2">
                    <Label htmlFor="duration-days">Tutoring Duration (days)</Label>
                    <input
                      id="duration-days"
                      type="number"
                      min={1}
                      value={tutoringDurationDays}
                      onChange={(e) =>
                        setTutoringDurationDays(Number(e.target.value || 1))
                      }
                      className="w-full border rounded-md p-2"
                    />
                  </div>

                  {/* Available Days */}
                  <div className="space-y-2">
                    <Label>Available Days</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        "monday",
                        "tuesday",
                        "wednesday",
                        "thursday",
                        "friday",
                        "saturday",
                        "sunday",
                      ].map((d) => (
                        <Button
                          key={d}
                          type="button"
                          variant={availableDays.includes(d) ? "default" : "outline"}
                          className="justify-start"
                          onClick={() => toggleDay(d)}
                        >
                          {availableDays.includes(d) && (
                            <Check className="h-3 w-3 mr-2" />
                          )}
                          {d.charAt(0).toUpperCase() + d.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any specific requirements or preferences..."
                      rows={3}
                      className="w-full"
                      value={privateNotes}
                      onChange={(e) => setPrivateNotes(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter className="p-4 sm:p-6 sticky bottom-0 bg-background z-10 border-t flex flex-col sm:flex-row gap-2 sm:gap-4">
                <Button
                  variant="outline"
                  onClick={() => setIsCreatePrivateDialogOpen(false)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreatePrivateSession}
                  className="w-full sm:w-auto h-10 bg-transparent border border-[#EF7B55] text-[#EF7B55] hover:bg-[#F79771] hover:text-white"
                >
                  Create Private Session
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Delete Dialog (shared) */}
      <Dialog
        open={isDeleteSessionDialogOpen}
        onOpenChange={setIsDeleteSessionDialogOpen}
      >
        <DialogContent className="w-[95vw] max-w-[500px] p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this item? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteSessionDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              className="w-full sm:w-auto h-10 bg-red-600 text-white hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as typeof activeTab)}
        className="space-y-4 xs:space-y-6"
      >
        <TabsList className="bg-[#f797712e] text-slate-700 flex flex-col lg:flex-row w-full gap-2 mb-14">
          <TabsTrigger
            className="bg-transparent w-full sm:w-40 justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3"
            value="upcoming"
          >
            Current Private Session
          </TabsTrigger>

          {/* NEW: Private Sessions tab */}
          <TabsTrigger
            className="bg-transparent w-full sm:w-40 justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3"
            value="private"
          >
            Private Sessions
          </TabsTrigger>

          <TabsTrigger
            className="bg-transparent w-full sm:w-40 justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3"
            value="past"
          >
            Past Sessions
          </TabsTrigger>
        </TabsList>

        {/* UPCOMING */}
        <TabsContent value="upcoming" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">
                Current Private Session ({upcomingSessions.length})
              </CardTitle>
              <CardDescription className="text-sm">
                Your scheduled private tutoring sessions
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-4">
                {paginatedUpcoming.map((session) => (
                  <div
                    key={session.id}
                    className="p-3 sm:p-4 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                      <div className="flex items-start space-x-3 sm:space-x-4 min-w-0">
                        <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                          <AvatarImage
                            src={session.studentAvatar || "/placeholder.svg"}
                          />
                          <AvatarFallback>
                            {session.student
                              .split(" ")
                              .map((n: any) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-2 flex-1 min-w-0">
                          <div>
                            <h4 className="font-semibold text-base sm:text-lg truncate">
                              {session.subject} Tutoring
                            </h4>
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">
                              Student: {session.student}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                              <span>{session.date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                              <span>
                                {session.time} ({session.duration}min)
                              </span>
                            </div>
                          </div>
                          <div className="text-xs sm:text-sm text-muted-foreground break-words">
                            {session.notes}
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            {getStatusBadge(session.status)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-2 flex-shrink-0">
                        <div className="font-medium text-green-600 text-base sm:text-lg">
                          {session.cost}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button
                            size="sm"
                            className="h-8"
                            onClick={() => handleConfirmSession(session.id)}
                            disabled={session.status === "Confirmed"}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            {session.status === "Confirmed"
                              ? "Session Confirmed"
                              : "Confirm Session"}
                          </Button>
                          <Button
                            size="sm"
                            className="h-8 bg-red-600 hover:bg-red-700"
                            onClick={() => handleDeleteSession(session, "upcoming")}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {upcomingSessions.length > itemsPerPage && (
                <Pagination className="mt-4 sm:mt-6">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          handlePageChange(
                            setUpcomingPage,
                            totalPages(upcomingSessions, itemsPerPage),
                            upcomingPage - 1
                          )
                        }
                      />
                    </PaginationItem>
                    {Array.from({
                      length: totalPages(upcomingSessions, itemsPerPage),
                    }).map((_, index) => {
                      const page = index + 1;
                      if (
                        page === 1 ||
                        page === totalPages(upcomingSessions, itemsPerPage) ||
                        (page >= upcomingPage - 1 && page <= upcomingPage + 1)
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              isActive={upcomingPage === page}
                              onClick={() => setUpcomingPage(page)}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      } else if (
                        (page === upcomingPage - 2 && upcomingPage > 3) ||
                        (page === upcomingPage + 2 &&
                          upcomingPage <
                            totalPages(upcomingSessions, itemsPerPage) - 2)
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                      return null;
                    })}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          handlePageChange(
                            setUpcomingPage,
                            totalPages(upcomingSessions, itemsPerPage),
                            upcomingPage + 1
                          )
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* NEW: PRIVATE SESSIONS LIST */}
        <TabsContent value="private" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">
                Private Sessions ({privateSessions.length})
              </CardTitle>
              <CardDescription className="text-sm">
                Your created private tutoring offerings
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3">
              {privateSessions.length === 0 ? (
                <div className="text-sm text-muted-foreground p-4">
                  No private sessions yet. Click <span className="font-medium">Create Private Session</span> to add one.
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {paginatedPrivate.map((p) => (
                      <div
                        key={p.id}
                        className="p-3 sm:p-4 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                          <div className="space-y-2">
                            <h4 className="font-semibold text-base sm:text-lg">
                              {p.courseName} — Private Tutoring
                            </h4>
                            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                              <span className="font-medium">Rate:</span>
                              <span>₦{Number(p.ratePerHour).toLocaleString()}/hour</span>
                              <span className="mx-1">•</span>
                              <span className="font-medium">Duration:</span>
                              <span>{p.durationDays} day(s)</span>
                              <span className="mx-1">•</span>
                              {getStatusBadge(p.status)}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {p.availableDays.length > 0 ? (
                                p.availableDays.map((d) => (
                                  <Badge key={d} variant="outline" className="text-xs capitalize">
                                    {d}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-xs text-muted-foreground">
                                  No days selected
                                </span>
                              )}
                            </div>
                            {p.notes && (
                              <p className="text-xs sm:text-sm text-muted-foreground break-words">
                                {p.notes}
                              </p>
                            )}
                          </div>
                          <div className="text-right space-y-2 flex-shrink-0">
                            <div className="text-xs text-muted-foreground">
                              Created: {new Date(p.createdAt).toLocaleDateString()}
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8"
                                onClick={() =>
                                  setPrivateSessions((prev) =>
                                    prev.map((x) =>
                                      x.id === p.id
                                        ? {
                                            ...x,
                                            status: x.status === "Active" ? "Inactive" : "Active",
                                          }
                                        : x
                                    )
                                  )
                                }
                              >
                                {p.status === "Active" ? "Deactivate" : "Activate"}
                              </Button>
                              <Button
                                size="sm"
                                className="h-8 bg-red-600 hover:bg-red-700"
                                onClick={() => handleDeleteSession(p, "private")}
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {privateSessions.length > itemsPerPage && (
                    <Pagination className="mt-4 sm:mt-6">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() =>
                              handlePageChange(
                                setPrivatePage,
                                totalPages(privateSessions, itemsPerPage),
                                privatePage - 1
                              )
                            }
                          />
                        </PaginationItem>
                        {Array.from({
                          length: totalPages(privateSessions, itemsPerPage),
                        }).map((_, index) => {
                          const page = index + 1;
                          if (
                            page === 1 ||
                            page === totalPages(privateSessions, itemsPerPage) ||
                            (page >= privatePage - 1 && page <= privatePage + 1)
                          ) {
                            return (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  isActive={privatePage === page}
                                  onClick={() => setPrivatePage(page)}
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          } else if (
                            (page === privatePage - 2 && privatePage > 3) ||
                            (page === privatePage + 2 &&
                              privatePage <
                                totalPages(privateSessions, itemsPerPage) - 2)
                          ) {
                            return (
                              <PaginationItem key={page}>
                                <PaginationEllipsis />
                              </PaginationItem>
                            );
                          }
                          return null;
                        })}
                        <PaginationItem>
                          <PaginationNext
                            onClick={() =>
                              handlePageChange(
                                setPrivatePage,
                                totalPages(privateSessions, itemsPerPage),
                                privatePage + 1
                              )
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* PAST */}
        <TabsContent value="past" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">
                Past Sessions ({pastSessions.length})
              </CardTitle>
              <CardDescription className="text-sm">
                History of completed tutoring sessions
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-4">
                {paginatedPast.map((session) => (
                  <div
                    key={session.id}
                    className="p-3 sm:p-4 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                      <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                        <Avatar className="h-10 w-10 sm:h-12 sm:w-12 shrink-0">
                          <AvatarImage
                            src={session.studentAvatar || "/placeholder.svg"}
                          />
                          <AvatarFallback>
                            {session.student
                              .split(" ")
                              .map((n: any) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-2 flex-1 min-w-0">
                          <div>
                            <h4 className="font-semibold text-base sm:text-lg truncate">
                              {session.subject} Tutoring
                            </h4>
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">
                              Student: {session.student}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                              {session.date}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                              {session.time} ({session.actualDuration}min)
                            </div>
                          </div>

                          <div className="flex items-center gap-1 text-xs sm:text-sm">
                            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                            <span> Date completed: {session.dateCompleted ?? session.date}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            {renderStars(session.rating)}
                            <span className="text-xs sm:text-sm text-muted-foreground ml-1">
                              ({session.rating}/5)
                            </span>
                          </div>
                          <div className="text-xs sm:text-sm text-muted-foreground italic break-words">
                            "{session.feedback}"
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-2 flex-shrink-0">
                        <div className="font-medium text-green-600 text-base sm:text-lg">
                          {session.cost}
                        </div>
                        {session.hasRecording && (
                          <a
                            href={session.recordingUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs sm:text-sm underline text-muted-foreground"
                          >
                            View recording
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {pastSessions.length > itemsPerPage && (
                <Pagination className="mt-4 sm:mt-6">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          handlePageChange(
                            setPastPage,
                            totalPages(pastSessions, itemsPerPage),
                            pastPage - 1
                          )
                        }
                      />
                    </PaginationItem>
                    {Array.from({
                      length: totalPages(pastSessions, itemsPerPage),
                    }).map((_, index) => {
                      const page = index + 1;
                      if (
                        page === 1 ||
                        page === totalPages(pastSessions, itemsPerPage) ||
                        (page >= pastPage - 1 && page <= pastPage + 1)
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              isActive={pastPage === page}
                              onClick={() => setPastPage(page)}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      } else if (
                        (page === pastPage - 2 && pastPage > 3) ||
                        (page === pastPage + 2 &&
                          pastPage < totalPages(pastSessions, itemsPerPage) - 2)
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                      return null;
                    })}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          handlePageChange(
                            setPastPage,
                            totalPages(pastSessions, itemsPerPage),
                            pastPage + 1
                          )
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {upcomingSessions.length + pastSessions.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {upcomingSessions.length} current
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Taught</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pastSessions.reduce(
                (sum, session) => sum + (session.actualDuration || 60),
                0
              ) / 60}
              h
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(
                pastSessions.reduce((sum, session) => sum + session.rating, 0) /
                pastSessions.length
              ).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {pastSessions.length} sessions
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

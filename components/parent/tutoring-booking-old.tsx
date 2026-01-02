"use client";

import * as React from "react";
import {useState, useEffect} from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {Textarea} from "@/components/ui/textarea";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {
  CalendarIcon,
  Clock,
  Video,
  Star,
  CheckCircle,
  AlertCircle,
  Users,
  BookOpen,
  Shield,
  Zap,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import {cn} from "@/lib/utils";
import {ButtonProps, buttonVariants} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";

// Pagination Components
const Pagination = ({className, ...props}: React.ComponentProps<"nav">) => (
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
>(({className, ...props}, ref) => (
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
>(({className, ...props}, ref) => (
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
    {...props}>
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
    {...props}>
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
    {...props}>
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
);
PaginationEllipsis.displayName = "PaginationEllipsis";

// TutoringBooking Component
export function TutoringBooking() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [isCardBookingOpen, setIsCardBookingOpen] = useState(false);
  const [bookingTutorId, setBookingTutorId] = useState<number | null>(null);

  // Booking form state
  const [child, setChild] = useState<string>("");
  const [preferredTime, setPreferredTime] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [learningObjectives, setLearningObjectives] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [preferredDays, setPreferredDays] = useState<string[]>([]);

  const resetBookingForm = () => {
    setChild("");
    setPreferredTime("");
    setDuration("");
    setLearningObjectives("");
    setNotes("");
    setPreferredDays([]);
  };

  // Pagination state
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [pastPage, setPastPage] = useState(1);
  const [tutorsPage, setTutorsPage] = useState(1);
  const itemsPerPage = 3;

  // Data states
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [upcomingTotalPages, setUpcomingTotalPages] = useState(1);
  const [pastSessions, setPastSessions] = useState<any[]>([]);
  const [pastTotalPages, setPastTotalPages] = useState(1);
  const [availableTutors, setAvailableTutors] = useState<any[]>([]);
  const [tutorsTotalPages, setTutorsTotalPages] = useState(1);
  const [children, setChildren] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total_tutoring: 0,
    upcoming_count: 0,
    hours_completed: 0,
    average_rating: 0,
    active_tutors: 0,
  });

  // Fetch functions
  const fetchUpcoming = async (page: number) => {
    const res = await fetch(
      `/api/tutor/tutoring/bookings?scope=upcoming&page=${page}&page_size=${itemsPerPage}`
    );
    if (res.ok) {
      const data = await res.json();
      setUpcomingSessions(data.results);
      setUpcomingTotalPages(data.total_pages);
    }
  };

  console.log(upcomingSessions, "upcoming sessions");
  const fetchPast = async (page: number) => {
    const res = await fetch(
      `/api/tutor/tutoring/bookings?scope=past&page=${page}&page_size=${itemsPerPage}`
    );
    if (res.ok) {
      const data = await res.json();
      setPastSessions(data.results);
      setPastTotalPages(data.total_pages);
    }
  };

  const fetchTutors = async (page: number) => {
    const res = await fetch(
      `/api/tutor/tutoring/tutors?page=${page}&page_size=${itemsPerPage}`
    );
    if (res.ok) {
      const data = await res.json();
      setAvailableTutors(data.results);
      setTutorsTotalPages(data.total_pages);
    }
  };

  const fetchChildren = async () => {
    const res = await fetch(`/api/tutor/tutoring/children`);
    if (res.ok) {
      const data = await res.json();
      setChildren(data);
    }
  };

  const fetchStats = async () => {
    const res = await fetch(`/api/tutor/tutoring/stats`);
    if (res.ok) {
      const data = await res.json();
      setStats(data);
    }
  };

  useEffect(() => {
    fetchChildren();
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === "upcoming") {
      fetchUpcoming(upcomingPage);
    }
  }, [activeTab, upcomingPage]);

  useEffect(() => {
    if (activeTab === "past") {
      fetchPast(pastPage);
    }
  }, [activeTab, pastPage]);

  useEffect(() => {
    if (activeTab === "tutors") {
      fetchTutors(tutorsPage);
    }
  }, [activeTab, tutorsPage]);

  const bookingTutor =
    bookingTutorId != null
      ? availableTutors.find((t) => t.id === bookingTutorId) || null
      : null;

  // Pagination navigation handlers
  const handlePageChange = (
    setPage: React.Dispatch<React.SetStateAction<number>>,
    total: number,
    newPage: number
  ) => {
    if (newPage >= 1 && newPage <= total) setPage(newPage);
  };

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
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "Paid":
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case "Pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "Failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({length: 5}, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  // Days for preferred_days
  const dayOptions = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const toggleDay = (day: string, checked: boolean | string) => {
    setPreferredDays((prev) => {
      const set = new Set(prev);
      if (checked) set.add(day);
      else set.delete(day);
      return Array.from(set);
    });
  };

  const handleBookSubmit = async () => {
    const payload = {
      student_id: parseInt(child),
      private_tutoring_id: bookingTutorId,
      duration_hours: parseInt(duration),
      notes: `Learning objectives: ${learningObjectives}\nPreferred days: ${preferredDays.join(
        ", "
      )}\nPreferred time: ${preferredTime}\n${notes}`,
    };
    const res = await fetch("/api/tutor/tutoring/book", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setIsCardBookingOpen(false);
      resetBookingForm();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Private Tutoring</h1>
          <p className="text-muted-foreground">
            Book and manage premium one-on-one tutoring with expert educators
          </p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4 xs:space-y-6">
        <TabsList className="bg-[#f797712e] text-slate-700 flex flex-col lg:flex-row w-full gap-2 mb-14">
          <TabsTrigger
            className="bg-transparent w-full sm:w-40 justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3"
            value="upcoming">
            Current Tutoring
          </TabsTrigger>
          <TabsTrigger
            className="bg-transparent w-full sm:w-40 justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3"
            value="past">
            Past Tutoring
          </TabsTrigger>
          <TabsTrigger
            className="bg-transparent w-full sm:w-40 justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3"
            value="tutors">
            Find Tutors
          </TabsTrigger>
        </TabsList>

        {/* UPCOMING */}
        <TabsContent value="upcoming" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">
                Current Tutoring
              </CardTitle>
              <CardDescription className="text-sm">
                Your scheduled tutoring
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-3 sm:p-4 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col gap-3 sm:gap-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                        <div className="flex items-start space-x-3 sm:space-x-4 min-w-0">
                          <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                            <AvatarImage
                              src={session.tutorAvatar || "/placeholder.svg"}
                            />
                            <AvatarFallback>
                              {session.tutor
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
                                {session.tutor} • {session.child}
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
                              {getPaymentStatusBadge(session.paymentStatus)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right space-y-2 flex-shrink-0">
                          <div className="font-medium text-green-600 text-base sm:text-lg">
                            {session.cost}
                          </div>
                          {getStatusBadge(session.status)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {upcomingTotalPages > 1 && (
                <Pagination className="mt-4 sm:mt-6">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          handlePageChange(
                            setUpcomingPage,
                            upcomingTotalPages,
                            upcomingPage - 1
                          )
                        }
                      />
                    </PaginationItem>
                    {Array.from({
                      length: upcomingTotalPages,
                    }).map((_, index) => {
                      const page = index + 1;
                      if (
                        page === 1 ||
                        page === upcomingTotalPages ||
                        (page >= upcomingPage - 1 && page <= upcomingPage + 1)
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              isActive={upcomingPage === page}
                              onClick={() => setUpcomingPage(page)}>
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      } else if (
                        (page === upcomingPage - 2 && upcomingPage > 3) ||
                        (page === upcomingPage + 2 &&
                          upcomingPage < upcomingTotalPages - 2)
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
                            upcomingTotalPages,
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

        {/* PAST */}
        <TabsContent value="past" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">
                Past Tutoring
              </CardTitle>
              <CardDescription className="text-sm">
                History of completed tutoring with recordings
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-4">
                {pastSessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-3 sm:p-4 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col gap-3 sm:gap-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                        <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                          <Avatar className="h-10 w-10 sm:h-12 sm:w-12 shrink-0">
                            <AvatarImage
                              src={session.tutorAvatar || "/placeholder.svg"}
                            />
                            <AvatarFallback>
                              {session.tutor
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
                                {session.tutor} • {session.child}
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
                            <div className="text-xs sm:text-sm text-muted-foreground italic break-words">
                              "{session.notes}"
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {pastTotalPages > 1 && (
                <Pagination className="mt-4 sm:mt-6">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          handlePageChange(
                            setPastPage,
                            pastTotalPages,
                            pastPage - 1
                          )
                        }
                      />
                    </PaginationItem>
                    {Array.from({
                      length: pastTotalPages,
                    }).map((_, index) => {
                      const page = index + 1;
                      if (
                        page === 1 ||
                        page === pastTotalPages ||
                        (page >= pastPage - 1 && page <= pastPage + 1)
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              isActive={pastPage === page}
                              onClick={() => setPastPage(page)}>
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      } else if (
                        (page === pastPage - 2 && pastPage > 3) ||
                        (page === pastPage + 2 && pastPage < pastTotalPages - 2)
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
                            pastTotalPages,
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

        {/* FIND TUTORS */}
        <TabsContent value="tutors" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">
                Expert Tutors
              </CardTitle>
              <CardDescription className="text-sm">
                Browse and select from our verified expert expert educators
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:border">
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {availableTutors.map((tutor) => (
                  <div
                    key={tutor.id}
                    className="flex flex-col p-3 sm:p-4 rounded-lg space-y-3 sm:space-y-4 hover:shadow-md transition-shadow w-full min-h-[400px]">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10 sm:h-12 sm:w-12 shrink-0">
                        <AvatarImage src={tutor.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {tutor.teacher_name
                            .split(" ")
                            .map((n: any) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-base sm:text-lg truncate">
                            {tutor.teacher_name}
                          </h4>
                          {tutor.verified && (
                            <Shield className="h-4 w-4 text-blue-500" />
                          )}
                          {tutor.premiumTutor && (
                            <Zap className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs sm:text-sm">
                          {renderStars(Math.floor(tutor.rating))}
                          <span className="text-muted-foreground ml-1 truncate">
                            {tutor.rating} ({tutor.totalSessions} sessions)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 text-xs sm:text-sm flex-grow">
                      <div className="space-y-2">
                        <div>
                          <span className="font-medium">Course:</span>{" "}
                          <span className="text-sm">{tutor.course}</span>
                        </div>
                        <div>
                          {/* <span className="font-medium">Title: </span> */}
                          <span className="text-sm">{tutor.title}</span>
                        </div>
                        <div>
                          <span className="font-medium">Modules:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {tutor.modules.map((mod: string, index: number) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="text-xs">
                                {mod}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {/* <div>
                          <span className="font-medium">Experience:</span>
                          <div className="truncate">{tutor.experience}</div>
                        </div> */}
                        <div>
                          <span className="font-medium">Rate:</span>
                          <div className="text-green-600 font-medium">
                            {tutor.rate}
                          </div>
                        </div>
                      </div>

                      {/* <div>
                        <span className="font-medium">Languages:</span>{" "}
                        {tutor.languages.join(", ")}
                      </div> */}
                      <div>
                        <span className="font-medium">Available:</span>
                        <div>{tutor.availability_days.join(", ")}</div>
                      </div>
                      <div className="text-xs text-muted-foreground break-words">
                        <span className="font-medium">Technologies:</span>{" "}
                        {tutor.technologies.join(", ")}
                      </div>
                      <div className="text-xs text-muted-foreground break-words">
                        {tutor.specialization}
                      </div>
                    </div>

                    <div className="mt-auto">
                      <Button
                        className="flex-1 min-w-[100px] sm:min-w-[120px] text-xs sm:text-sm w-full"
                        size="sm"
                        onClick={() => {
                          setBookingTutorId(tutor.id);
                          setIsCardBookingOpen(true);
                        }}>
                        <Video className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        Book Tutoring
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {tutorsTotalPages > 1 && (
                <Pagination className="mt-4 sm:mt-6">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          handlePageChange(
                            setTutorsPage,
                            tutorsTotalPages,
                            tutorsPage - 1
                          )
                        }
                      />
                    </PaginationItem>
                    {Array.from({
                      length: tutorsTotalPages,
                    }).map((_, index) => {
                      const page = index + 1;
                      if (
                        page === 1 ||
                        page === tutorsTotalPages ||
                        (page >= tutorsPage - 1 && page <= tutorsPage + 1)
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              isActive={tutorsPage === page}
                              onClick={() => setTutorsPage(page)}>
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      } else if (
                        (page === tutorsPage - 2 && tutorsPage > 3) ||
                        (page === tutorsPage + 2 &&
                          tutorsPage < tutorsTotalPages - 2)
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
                            setTutorsPage,
                            tutorsTotalPages,
                            tutorsPage + 1
                          )
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </CardContent>
          </Card>

          {/* Central booking dialog for tutor cards */}
          <Dialog
            open={isCardBookingOpen}
            onOpenChange={(open) => {
              setIsCardBookingOpen(open);
              if (!open) {
                setBookingTutorId(null);
                resetBookingForm();
              }
            }}>
            <DialogContent className="w-[95vw] max-w-[700px] max-h-[85vh] p-0 overflow-scroll rounded-none sm:rounded-lg">
              <DialogHeader className="p-4 sm:p-6 sticky top-0 bg-background z-10 border-b">
                <DialogTitle>
                  {bookingTutor
                    ? `Book ${bookingTutor.course} with ${bookingTutor.teacher_name}`
                    : "Book Tutoring"}
                </DialogTitle>
                <DialogDescription>
                  Choose preferences and we’ll confirm availability.
                </DialogDescription>
              </DialogHeader>

              <div className="px-4 sm:px-6 py-4 overflow-y-auto">
                <div className="grid gap-4">
                  {/* Select Child */}
                  <div className="space-y-2">
                    <Label htmlFor="select-child">Select Child</Label>
                    <Select value={child} onValueChange={setChild}>
                      <SelectTrigger className="w-full" id="select-child">
                        <SelectValue placeholder="Choose child" />
                      </SelectTrigger>
                      <SelectContent>
                        {children.map((ch: any) => (
                          <SelectItem key={ch.id} value={ch.id.toString()}>
                            {ch.name} ({ch.classroom})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Preferred Days (multi-select) */}
                  <div className="space-y-2">
                    <Label>Preferred Days</Label>
                    <div className="grid grid-cols-7 gap-2 sm:gap-3">
                      {dayOptions.map((d) => {
                        const checked = preferredDays.includes(d);
                        return (
                          <label
                            key={d}
                            className={cn(
                              "flex items-center justify-center gap-2 rounded-md border px-2 py-2 text-xs sm:text-sm cursor-pointer",
                              checked
                                ? "border-[#EF7B55] bg-[#f797712e]"
                                : "border-muted"
                            )}>
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(val) => toggleDay(d, val)}
                              className="mr-1"
                            />
                            {d}
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Preferred Time & Duration */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* <div className="space-y-2">
                      <Label htmlFor="pref-time">Preferred Time</Label>
                      <Select
                        value={preferredTime}
                        onValueChange={setPreferredTime}
                      >
                        <SelectTrigger id="pref-time" className="w-full">
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="14:00-15:00">
                            2:00 PM - 3:00 PM
                          </SelectItem>
                          <SelectItem value="15:00-16:00">
                            3:00 PM - 4:00 PM
                          </SelectItem>
                          <SelectItem value="16:00-17:00">
                            4:00 PM - 5:00 PM
                          </SelectItem>
                          <SelectItem value="17:00-18:00">
                            5:00 PM - 6:00 PM
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div> */}

                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (hours)</Label>
                      <Select value={duration} onValueChange={setDuration}>
                        <SelectTrigger id="duration" className="w-full">
                          <SelectValue placeholder="Choose duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 hour</SelectItem>
                          <SelectItem value="2">2 hours</SelectItem>
                          <SelectItem value="3">3 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Learning Objectives */}
                  <div className="space-y-2">
                    <Label htmlFor="learning-objectives">
                      Learning Objectives
                    </Label>
                    <Textarea
                      id="learning-objectives"
                      placeholder="e.g., Algebra foundations, differentiation techniques, essay structuring…"
                      rows={3}
                      className="w-full"
                      value={learningObjectives}
                      onChange={(e) => setLearningObjectives(e.target.value)}
                    />
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any other helpful details for the tutor…"
                      rows={3}
                      className="w-full"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="p-4 sm:p-6 sticky bottom-0 bg-background z-10 border-t flex flex-col sm:flex-row gap-2 sm:gap-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCardBookingOpen(false);
                    resetBookingForm();
                  }}
                  className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button
                  onClick={handleBookSubmit}
                  className="w-full sm:w-auto h-10 bg-transparent border border-[#EF7B55] text-[#EF7B55] hover:bg-[#F79771] hover:text-white">
                  <Video className="h-4 w-4 mr-2" />
                  Book Tutoring
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Tutoring
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_tutoring}</div>
            <p className="text-xs text-muted-foreground">
              {stats.upcoming_count} upcoming tutoring
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Hours Completed
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.hours_completed}h</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Rating
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.average_rating.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">From past tutoring</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tutors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active_tutors}</div>
            <p className="text-xs text-muted-foreground">Available now</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import { useState, useEffect } from "react";
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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";
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
import { cn } from "@/lib/utils";
import { ButtonProps, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

// Pagination Components
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

// TutoringBooking Component
export function TutoringBooking() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cancelDialog, setCancelDialog] = useState<{
    open: boolean;
    session: any | null;
  }>({ open: false, session: null });

  const [cancelSubmitting, setCancelSubmitting] = useState(false);

  const openCancelDialog = (session: any) => {
    setCancelDialog({ open: true, session });
  };

  const closeCancelDialog = () => {
    if (cancelSubmitting) return; // prevent closing while submitting
    setCancelDialog({ open: false, session: null });
  };

  // Handle tab from query param (useful for redirects after booking)
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && (tab === "upcoming" || tab === "past" || tab === "tutors")) {
      setActiveTab(tab);
    }
  }, [searchParams]);

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
    confirmed_tutors: 0,
    cancelled_bookings: 0,
    active_tutors: 0,
  });

  // Per-tab loading states
  const [loadingUpcoming, setLoadingUpcoming] = useState(false);
  const [loadingPast, setLoadingPast] = useState(false);
  const [loadingTutors, setLoadingTutors] = useState(false);


  // Fetch functions
  const fetchUpcoming = async (page: number) => {
    setLoadingUpcoming(true);
    try {
      const res = await fetch(
        `/api/tutor/tutoring/bookings?scope=upcoming&page=${page}&page_size=${itemsPerPage}`
      );
      if (res.ok) {
        const data = await res.json();
        setUpcomingSessions(data.results);
        setUpcomingTotalPages(data.total_pages);
      }
    } finally {
      setLoadingUpcoming(false);
    }
  };

  const fetchPast = async (page: number) => {
    setLoadingPast(true);
    try {
      const res = await fetch(
        `/api/tutor/tutoring/bookings?scope=past&page=${page}&page_size=${itemsPerPage}`
      );
      if (res.ok) {
        const data = await res.json();
        setPastSessions(data.results);
        setPastTotalPages(data.total_pages);
      }
    } finally {
      setLoadingPast(false);
    }
  };

  const fetchTutors = async (page: number) => {
    setLoadingTutors(true);
    try {
      const res = await fetch(
        `/api/tutor/tutoring/tutors?page=${page}&page_size=${itemsPerPage}`
      );
      if (res.ok) {
        const data = await res.json();
        setAvailableTutors(data.results);
        setTutorsTotalPages(data.total_pages);
      }
    } finally {
      setLoadingTutors(false);
    }
  };


  const fetchChildren = async () => {
    const res = await fetch(`/api/tutor/tutoring/children`);
    if (res.ok) {
      const data = await res.json();
      setChildren(data);
    }
  };

  const handleCancelBooking = async (bookingId: number | string) => {
    // Adjust endpoint to whatever your backend expects.
    // If you already have a PATCH endpoint similar to teacher side, use that.
    const res = await fetch(`/api/parent/tutoring/bookings/cancel`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: bookingId, status: "cancelled" }),
    });

    // If your endpoint returns JSON:
    if (!res.ok) {
      let msg = "Failed to cancel booking";
      try {
        const data = await res.json();
        msg = data?.detail || data?.error || msg;
      } catch { }
      throw new Error(msg);
    }

    return true;
  };

  const confirmCancelBooking = async () => {
    if (!cancelDialog.session?.id) return;

    try {
      setCancelSubmitting(true);

      await handleCancelBooking(cancelDialog.session.id);

      // Switch to Past tab
      setActiveTab("past");

      // Refetch both lists (so UI shows the cancelled session in past)
      await Promise.all([fetchUpcoming(upcomingPage), fetchPast(pastPage)]);

      closeCancelDialog();
    } catch (e: any) {
      // You can replace this with toast if you have one
      alert(e?.message || "Failed to cancel booking");
    } finally {
      setCancelSubmitting(false);
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
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
      />
    ));
  };

  // Days for preferred_days
  const dayOptions = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const toggleDay = (day: string, checked: boolean | string) => {
    // Logic removed as it's now on the standalone page
  };

  const handleBookSubmit = async () => {
    // Logic removed as it's now on the standalone page
  };

  // ---- Skeleton loader component ----
  const TabLoadingSkeleton = ({ rows = 3 }: { rows?: number }) => (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-start gap-4 p-4 rounded-lg border border-muted">
          <div className="h-12 w-12 rounded-full bg-muted shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded w-2/5" />
            <div className="h-3 bg-muted rounded w-3/5" />
            <div className="h-3 bg-muted rounded w-1/3" />
          </div>
          <div className="space-y-2 shrink-0">
            <div className="h-5 bg-muted rounded w-16" />
            <div className="h-5 bg-muted rounded w-20" />
          </div>
        </div>
      ))}
    </div>
  );

  const TutorCardSkeleton = () => (
    <div className="animate-pulse flex flex-col p-4 rounded-lg border border-muted space-y-4 min-h-[400px]">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-muted shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-2/3" />
          <div className="h-3 bg-muted rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2 flex-1">
        <div className="h-3 bg-muted rounded w-full" />
        <div className="h-3 bg-muted rounded w-4/5" />
        <div className="h-3 bg-muted rounded w-3/5" />
        <div className="flex gap-1 mt-2">
          <div className="h-5 bg-muted rounded w-12" />
          <div className="h-5 bg-muted rounded w-16" />
          <div className="h-5 bg-muted rounded w-10" />
        </div>
      </div>
      <div className="h-9 bg-muted rounded w-full mt-auto" />
    </div>
  );

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
        className="space-y-4 xs:space-y-6"
      >
        <TabsList className="bg-[#f797712e] text-slate-700 flex flex-col lg:flex-row w-full gap-2 mb-14">
          <TabsTrigger
            className="bg-transparent w-full sm:w-40 justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3"
            value="upcoming"
          >
            Current Tutoring
          </TabsTrigger>
          <TabsTrigger
            className="bg-transparent w-full sm:w-40 justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3"
            value="past"
          >
            Past Tutoring
          </TabsTrigger>
          <TabsTrigger
            className="bg-transparent w-full sm:w-40 justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3"
            value="tutors"
          >
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
              {loadingUpcoming ? (
                <TabLoadingSkeleton rows={itemsPerPage} />
              ) : (
                <div className="space-y-4">
                  {upcomingSessions.map((session) => (
                    <div
                      key={session.id}
                      className="p-3 sm:p-4 rounded-lg hover:bg-muted/50 transition-colors"
                    >
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

                            {session.status === "Pending" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push("/invoice/invoices")}
                                className="mt-2 mx-3 w-full sm:w-auto"
                              >
                                Pay Now
                              </Button>
                            )}
                            <Button
                              size="sm"
                              className="mt-2 w-full sm:w-auto bg-red-600 hover:bg-red-700"
                              onClick={() => openCancelDialog(session)}
                              disabled={cancelSubmitting || session.status === "Cancelled" || session.status === "Completed"}
                            >
                              <AlertCircle className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>

                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {!loadingUpcoming && upcomingTotalPages > 1 && (
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
                              onClick={() => setUpcomingPage(page)}
                            >
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
              {loadingPast ? (
                <TabLoadingSkeleton rows={itemsPerPage} />
              ) : (
              <div className="space-y-4">
                {pastSessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-3 sm:p-4 rounded-lg hover:bg-muted/50 transition-colors"
                  >
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
              )}
              {!loadingPast && pastTotalPages > 1 && (
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
                              onClick={() => setPastPage(page)}
                            >
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
              {loadingTutors ? (
                <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: itemsPerPage }).map((_, i) => (
                    <TutorCardSkeleton key={i} />
                  ))}
                </div>
              ) : (
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {availableTutors.map((tutor) => (
                  <div
                    key={tutor.id}
                    className="flex flex-col p-3 sm:p-4 rounded-lg space-y-3 sm:space-y-4 hover:shadow-md transition-shadow w-full min-h-[400px]"
                  >
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
                                className="text-xs"
                              >
                                {mod}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <span className="font-medium">Rate:</span>
                          <div className="text-green-600 font-medium">
                            {tutor.rate}
                          </div>
                        </div>
                        {tutor.hours_per_day != null && (
                          <div>
                            <span className="font-medium">Hours/Day:</span>
                            <div className="text-muted-foreground">
                              {tutor.hours_per_day}h
                            </div>
                          </div>
                        )}
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
                          router.push(`/parent/tutoring/book/${tutor.id}?name=${encodeURIComponent(tutor.teacher_name)}&course=${encodeURIComponent(tutor.course)}`);
                        }}
                      >
                        <Video className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        Book Tutoring
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              )}

              {!loadingTutors && tutorsTotalPages > 1 && (
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
                              onClick={() => setTutorsPage(page)}
                            >
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
            <CardTitle className="text-sm font-medium">Confirmed Tutors</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.confirmed_tutors}</div>
            <p className="text-xs text-muted-foreground">
              Tutors with confirmed bookings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled Bookings</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cancelled_bookings}</div>
            <p className="text-xs text-muted-foreground">
              Cancelled tutoring sessions
            </p>
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
      <div>
        <Dialog open={cancelDialog.open} onOpenChange={(open) => {
          if (!open) closeCancelDialog();
        }}>
          <DialogContent className="w-[95vw] max-w-[500px] p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle>Cancel tutoring booking?</DialogTitle>
              <DialogDescription>
                This action will mark the tutoring as <b>Cancelled</b> and move it to Past Tutoring.
                <div className="mt-2 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium">Tutor:</span>{" "}
                    {cancelDialog.session?.tutor || "—"}
                  </div>
                  <div>
                    <span className="font-medium">Child:</span>{" "}
                    {cancelDialog.session?.child || "—"}
                  </div>
                  <div>
                    <span className="font-medium">Subject:</span>{" "}
                    {cancelDialog.session?.subject || "—"}
                  </div>
                </div>
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <Button
                variant="outline"
                onClick={closeCancelDialog}
                disabled={cancelSubmitting}
                className="w-full sm:w-auto"
              >
                No, go back
              </Button>

              <Button
                onClick={confirmCancelBooking}
                disabled={cancelSubmitting}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
              >
                {cancelSubmitting ? (
                  <>
                    {/* if you have Spinner component, use it here */}
                    <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Yes, Cancel
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}

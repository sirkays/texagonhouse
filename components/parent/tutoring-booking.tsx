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
  GraduationCap,
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
    <div className="space-y-8 max-w-7xl mx-auto p-1 sm:p-2">
      {/* Premium Gradient Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-[#e26d47] p-6 sm:p-8 text-white shadow-xl dark:shadow-none">
        <div className="absolute right-0 top-0 h-64 w-64 -translate-y-12 translate-x-12 rounded-full bg-[#EF7B55]/15 blur-3xl" />
        <div className="absolute left-1/3 bottom-0 h-40 w-40 translate-y-12 rounded-full bg-indigo-500/15 blur-3xl" />
        
        <div className="relative z-10 space-y-2 max-w-2xl">
          <Badge className="bg-[#EF7B55]/20 text-[#ffae91] border border-[#EF7B55]/30 hover:bg-[#EF7B55]/30 px-3 py-1 font-semibold text-xs tracking-wide">
            1-on-1 Personalized Education
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-orange-100 bg-clip-text text-transparent">
            Private Tutoring Portal
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
            Secure exceptional, personalized academic acceleration for your children. Browse verified elite educators, schedule customized learning, and manage active tutoring sessions all in one workspace.
          </p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        {/* Floating Glassmorphic Tabs Bar */}
        <div className="w-full">
          <TabsList className="bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center w-full gap-2 border border-slate-200/60 dark:border-slate-700/50 shadow-sm">
            <TabsTrigger
              className="flex-1 w-full justify-center py-2.5 px-4 rounded-xl text-slate-600 dark:text-slate-300 font-semibold transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#EF7B55] data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-md gap-2 text-xs sm:text-sm"
              value="upcoming"
            >
              <CalendarIcon className="h-4 w-4 shrink-0" />
              Current Tutoring
            </TabsTrigger>
            <TabsTrigger
              className="flex-1 w-full justify-center py-2.5 px-4 rounded-xl text-slate-600 dark:text-slate-300 font-semibold transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#EF7B55] data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-md gap-2 text-xs sm:text-sm"
              value="past"
            >
              <Clock className="h-4 w-4 shrink-0" />
              Past Sessions
            </TabsTrigger>
            <TabsTrigger
              className="flex-1 w-full justify-center py-2.5 px-4 rounded-xl text-slate-600 dark:text-slate-300 font-semibold transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#EF7B55] data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-md gap-2 text-xs sm:text-sm"
              value="tutors"
            >
              <Users className="h-4 w-4 shrink-0" />
              Find Tutors
            </TabsTrigger>
          </TabsList>
        </div>

        {/* UPCOMING TAB */}
        <TabsContent value="upcoming" className="space-y-4 outline-none">
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/60 shadow-xl shadow-slate-100/40 dark:shadow-none rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/20 text-[#EF7B55]">
                  <CalendarIcon className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100">
                    Active & Scheduled Sessions
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Monitor your children's upcoming tutoring meetings and lessons.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loadingUpcoming ? (
                <div className="p-6">
                  <TabLoadingSkeleton rows={itemsPerPage} />
                </div>
              ) : upcomingSessions.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="mx-auto w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-400 mb-4 border border-slate-100 dark:border-slate-800">
                    <BookOpen className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Active Sessions</h3>
                  <p className="text-slate-400 text-sm max-w-sm mx-auto mt-1">
                    Your scheduled tutoring will appear here once booked. Click "Find Tutors" to register with an educator.
                  </p>
                  <Button
                    onClick={() => setActiveTab("tutors")}
                    className="mt-5 bg-gradient-to-r from-[#EF7B55] to-orange-500 text-white font-bold rounded-xl"
                  >
                    Browse Available Tutors
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {upcomingSessions.map((session) => {
                    const isPending = session.status === "Pending";
                    return (
                      <div
                        key={session.id}
                        className="p-5 sm:p-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors relative group"
                      >
                        {/* Status colored indicator bar */}
                        <div className={cn(
                          "absolute left-0 top-0 bottom-0 w-1",
                          session.status === "Confirmed" ? "bg-emerald-500" : "bg-amber-500"
                        )} />

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="flex items-start gap-4 min-w-0 flex-1">
                            <Avatar className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl border-2 border-slate-100 dark:border-slate-800 shrink-0 shadow-sm">
                              <AvatarImage
                                src={session.tutorAvatar || "/placeholder.svg"}
                              />
                              <AvatarFallback className="bg-gradient-to-tr from-[#EF7B55]/10 to-orange-500/10 text-[#EF7B55] font-extrabold text-base rounded-2xl">
                                {session.tutor
                                  .split(" ")
                                  .map((n: any) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="space-y-1.5 min-w-0 flex-1">
                              <div className="flex items-center gap-2.5 flex-wrap">
                                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg group-hover:text-[#EF7B55] transition-colors leading-tight">
                                  {session.subject} Tutoring
                                </h4>
                                <Badge className={cn(
                                  "text-xs px-2.5 py-0.5 rounded-full border shadow-none",
                                  session.paymentStatus === "Paid" 
                                    ? "bg-emerald-50/80 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30" 
                                    : "bg-amber-50/80 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30"
                                )}>
                                  {session.paymentStatus}
                                </Badge>
                              </div>
                              
                              <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">
                                Tutor: <span className="text-slate-700 dark:text-slate-300 font-bold">{session.tutor}</span> &bull; Child: <span className="text-slate-700 dark:text-slate-300 font-bold">{session.child}</span>
                              </p>

                              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400 pt-1.5">
                                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md shrink-0">
                                  <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
                                  <span>{session.date}</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md shrink-0">
                                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                                  <span>
                                    {session.time} ({session.duration} mins)
                                  </span>
                                </div>
                              </div>

                              {session.notes && (
                                <p className="text-xs text-slate-400 dark:text-slate-500 italic max-w-xl break-words pt-1">
                                  &ldquo;{session.notes}&rdquo;
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Action Items Block */}
                          <div className="flex flex-row md:flex-col md:items-end justify-between md:justify-center gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800/80">
                            <div className="text-left md:text-right space-y-1">
                              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wider">Session Cost</span>
                              <div className="font-extrabold text-[#EF7B55] text-xl">
                                {session.cost}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {getStatusBadge(session.status)}

                              {isPending && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => router.push("/invoice/invoices")}
                                  className="h-8 border-orange-200 text-[#EF7B55] hover:bg-orange-50/50 hover:text-orange-600 dark:border-orange-900/30 dark:hover:bg-orange-950/20 font-bold"
                                >
                                  Pay Now
                                </Button>
                              )}
                              
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 font-bold rounded-lg"
                                onClick={() => openCancelDialog(session)}
                                disabled={cancelSubmitting || session.status === "Cancelled" || session.status === "Completed"}
                              >
                                <AlertCircle className="h-3.5 w-3.5 mr-1" />
                                Cancel Session
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {!loadingUpcoming && upcomingTotalPages > 1 && (
                <div className="p-4 border-t border-slate-100 dark:border-slate-800/85">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
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
                                className="rounded-lg"
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
                          className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
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
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* PAST TAB */}
        <TabsContent value="past" className="space-y-4 outline-none">
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/60 shadow-xl shadow-slate-100/40 dark:shadow-none rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-500">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100">
                    Completed Lessons History
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Review history of completed courses and tutoring reports.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loadingPast ? (
                <div className="p-6">
                  <TabLoadingSkeleton rows={itemsPerPage} />
                </div>
              ) : pastSessions.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="mx-auto w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-400 mb-4 border border-slate-100 dark:border-slate-800">
                    <Clock className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Past History</h3>
                  <p className="text-slate-400 text-sm max-w-sm mx-auto mt-1">
                    No completed tutoring session history is recorded under this account.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {pastSessions.map((session) => (
                    <div
                      key={session.id}
                      className="p-5 sm:p-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors relative group"
                    >
                      {/* Left vertical visual marker */}
                      <div className={cn(
                        "absolute left-0 top-0 bottom-0 w-1",
                        session.status === "Cancelled" ? "bg-red-400/80" : "bg-blue-500"
                      )} />

                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-start gap-4 min-w-0 flex-1">
                          <Avatar className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl border border-slate-100 dark:border-slate-800 shrink-0 shadow-sm">
                            <AvatarImage
                              src={session.tutorAvatar || "/placeholder.svg"}
                            />
                            <AvatarFallback className="bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 text-slate-500 dark:text-slate-400 font-extrabold text-base rounded-2xl">
                              {session.tutor
                                .split(" ")
                                .map((n: any) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="space-y-1.5 min-w-0 flex-1">
                            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg group-hover:text-blue-500 transition-colors leading-tight">
                              {session.subject} Tutoring
                            </h4>
                            
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">
                              Tutor: <span className="text-slate-700 dark:text-slate-300 font-bold">{session.tutor}</span> &bull; Child: <span className="text-slate-700 dark:text-slate-300 font-bold">{session.child}</span>
                            </p>

                            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400 pt-1">
                              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md shrink-0">
                                <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
                                <span>{session.date}</span>
                              </div>
                              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md shrink-0">
                                <Clock className="h-3.5 w-3.5 text-slate-400" />
                                <span>
                                  {session.time} ({session.actualDuration ?? session.duration} mins)
                                </span>
                              </div>
                            </div>

                            {session.notes && (
                              <p className="text-xs text-slate-400 dark:text-slate-500 italic max-w-xl break-words pt-1">
                                &ldquo;{session.notes}&rdquo;
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Status indicator box */}
                        <div className="flex flex-row md:flex-col md:items-end justify-between md:justify-center gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800/80">
                          <div className="text-left md:text-right space-y-1">
                            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wider">Session Cost</span>
                            <div className="font-extrabold text-slate-600 dark:text-slate-400 text-base sm:text-lg">
                              {session.cost}
                            </div>
                          </div>
                          
                          {getStatusBadge(session.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {!loadingPast && pastTotalPages > 1 && (
                <div className="p-4 border-t border-slate-100 dark:border-slate-800/85">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
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
                                className="rounded-lg"
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
                          className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
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
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* FIND TUTORS TAB */}
        <TabsContent value="tutors" className="space-y-4 outline-none">
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/60 shadow-xl shadow-slate-100/40 dark:shadow-none rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/20 text-[#EF7B55]">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100">
                    Elite Academic Educators
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Browse, filter, and register your children with our handpicked verified tutors.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 bg-slate-50/30 dark:bg-slate-950/10">
              {loadingTutors ? (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: itemsPerPage }).map((_, i) => (
                    <TutorCardSkeleton key={i} />
                  ))}
                </div>
              ) : availableTutors.length === 0 ? (
                <div className="py-16 text-center bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800 rounded-2xl">
                  <div className="mx-auto w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4 border border-slate-100 dark:border-slate-800">
                    <Users className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Educators Found</h3>
                  <p className="text-slate-400 text-sm max-w-sm mx-auto mt-1">
                    There are no active private tutoring packages configured right now. Please check back later.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {availableTutors.map((tutor) => (
                    <div
                      key={tutor.id}
                      className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl p-5 sm:p-6 w-full min-h-[420px] relative overflow-hidden group"
                    >
                      {/* Decorative gradient overlay */}
                      <div className="absolute right-0 top-0 h-28 w-28 -translate-y-8 translate-x-8 rounded-full bg-orange-500/5 group-hover:bg-orange-500/10 transition-colors duration-300 blur-2xl z-0" />

                      <div className="relative z-10 flex items-center gap-3.5">
                        <Avatar className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl border-2 border-slate-100 dark:border-slate-800 shrink-0 shadow-sm">
                          <AvatarImage src={tutor.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="bg-gradient-to-tr from-[#EF7B55]/10 to-orange-400/10 text-[#EF7B55] font-extrabold text-base rounded-2xl">
                            {tutor.teacher_name
                              .split(" ")
                              .map((n: any) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-base sm:text-lg truncate leading-tight group-hover:text-[#EF7B55] transition-colors">
                              {tutor.teacher_name}
                            </h4>
                            {tutor.verified && (
                              <Shield className="h-4 w-4 text-blue-500 shrink-0 fill-blue-500/15" />
                            )}
                            {tutor.premiumTutor && (
                              <Zap className="h-4 w-4 text-yellow-500 shrink-0 fill-yellow-500/15" />
                            )}
                          </div>
                          <div className="flex items-center gap-1 mt-1 flex-wrap">
                            <div className="flex items-center gap-0.5 shrink-0">
                              {renderStars(Math.floor(tutor.rating))}
                            </div>
                            <span className="text-[#3b3d40] dark:text-slate-400 font-bold text-xs truncate ml-1">
                              {tutor.rating} ({tutor.totalSessions} sessions)
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="relative z-10 space-y-4 text-sm flex-grow pt-4">
                        {/* Course section */}
                        <div className="space-y-1 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50">
                          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wider">Configured Course</span>
                          <span className="text-slate-800 dark:text-slate-200 font-bold text-sm leading-tight block">
                            {tutor.course}
                          </span>
                          {tutor.title && tutor.title !== tutor.course && (
                            <span className="text-xs text-slate-500 dark:text-slate-400 block pt-0.5 line-clamp-1 leading-normal font-medium">
                              {tutor.title}
                            </span>
                          )}
                        </div>

                        {/* Modules Badges */}
                        {tutor.modules && tutor.modules.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wider">Expert Areas</span>
                            <div className="flex flex-wrap gap-1">
                              {tutor.modules.map((mod: string, index: number) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="text-xs bg-slate-100 hover:bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 font-semibold px-2 py-0.5 border border-slate-200/20 rounded-md"
                                >
                                  {mod}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-3">
                          {/* Rate Card */}
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wider">Rate</span>
                            <div className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm sm:text-base bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/30 px-2 py-0.5 rounded-md inline-block">
                              {tutor.rate}
                            </div>
                          </div>
                          
                          {/* Duration Hours */}
                          {tutor.hours_per_day != null && (
                            <div className="space-y-1">
                              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wider">Hours/Day</span>
                              <div className="text-slate-700 dark:text-slate-300 font-bold text-sm sm:text-base pt-0.5">
                                {tutor.hours_per_day}h lesson
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-3">
                          {/* Availability days */}
                          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wider">Preferred Days</span>
                          <div className="flex flex-wrap gap-1">
                            {tutor.availability_days.map((day: string, idx: number) => (
                              <span
                                key={idx}
                                className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 px-2 py-0.5 rounded-md border border-slate-200/10"
                              >
                                {day}
                              </span>
                            ))}
                          </div>
                        </div>

                        {tutor.technologies && tutor.technologies.length > 0 && (
                          <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3 leading-relaxed">
                            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wider mb-0.5">Requirements</span>
                            <span className="line-clamp-2 italic">&ldquo;{tutor.technologies.join(", ")}&rdquo;</span>
                          </div>
                        )}
                        
                        {tutor.specialization && (
                          <div className="text-xs font-semibold text-slate-400 dark:text-slate-550 truncate leading-relaxed">
                            {tutor.specialization}
                          </div>
                        )}
                      </div>

                      {/* Animated Booking Button */}
                      <div className="relative z-10 pt-4 mt-auto">
                        <Button
                          className="w-full h-10 bg-gradient-to-r from-[#EF7B55] to-orange-500 text-white font-extrabold rounded-xl hover:from-orange-600 hover:to-orange-500 shadow-md shadow-orange-500/10 hover:shadow-orange-500/25 transition-all text-xs sm:text-sm gap-1.5"
                          onClick={() => {
                            router.push(`/parent/tutoring/book/${tutor.id}?name=${encodeURIComponent(tutor.teacher_name)}&course=${encodeURIComponent(tutor.course)}`);
                          }}
                        >
                          <GraduationCap className="h-4 w-4 shrink-0" />
                          Book Private Tutoring
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loadingTutors && tutorsTotalPages > 1 && (
                <div className="mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
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
                                className="rounded-lg"
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
                          className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
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
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modern Dashboard Stats Widget */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Stat Card 1 */}
        <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/60 shadow-md dark:shadow-none hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 rounded-2xl overflow-hidden border-t-4 border-t-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Total Tutoring
            </CardTitle>
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-amber-500">
              <BookOpen className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-3xl font-extrabold text-slate-850 dark:text-slate-100">{stats.total_tutoring}</div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {stats.upcoming_count} active scheduled tutoring
            </p>
          </CardContent>
        </Card>

        {/* Stat Card 2 */}
        <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/60 shadow-md dark:shadow-none hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 rounded-2xl overflow-hidden border-t-4 border-t-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Confirmed Tutors</CardTitle>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500">
              <CheckCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-3xl font-extrabold text-slate-850 dark:text-slate-100">{stats.confirmed_tutors}</div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Educators with active contracts
            </p>
          </CardContent>
        </Card>

        {/* Stat Card 3 */}
        <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/60 shadow-md dark:shadow-none hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 rounded-2xl overflow-hidden border-t-4 border-t-rose-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Cancelled Sessions</CardTitle>
            <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/20 text-rose-500">
              <AlertCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-3xl font-extrabold text-slate-850 dark:text-slate-100">{stats.cancelled_bookings}</div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total cancelled lessons
            </p>
          </CardContent>
        </Card>

        {/* Stat Card 4 */}
        <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/60 shadow-md dark:shadow-none hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 rounded-2xl overflow-hidden border-t-4 border-t-indigo-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Active Educators</CardTitle>
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-3xl font-extrabold text-slate-850 dark:text-slate-100">{stats.active_tutors}</div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tutors offering packages</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Premium Confirm Modal Dialog */}
      <div>
        <Dialog open={cancelDialog.open} onOpenChange={(open) => {
          if (!open) closeCancelDialog();
        }}>
          <DialogContent className="w-[95vw] max-w-[500px] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-xl font-extrabold text-slate-850 dark:text-slate-100 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-rose-500" />
                Cancel Tutoring Session?
              </DialogTitle>
              <DialogDescription className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Are you sure you want to cancel this tutoring booking? This action will mark the tutoring as <b>Cancelled</b>, terminate future scheduled hours, and move the record to Past Tutoring.
                
                <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2 text-slate-600 dark:text-slate-300 font-semibold text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400 dark:text-slate-500 uppercase tracking-wider text-xs">Educator:</span>{" "}
                    <span className="font-bold">{cancelDialog.session?.tutor || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 dark:text-slate-500 uppercase tracking-wider text-xs">Student:</span>{" "}
                    <span className="font-bold">{cancelDialog.session?.child || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 dark:text-slate-500 uppercase tracking-wider text-xs">Subject:</span>{" "}
                    <span className="font-bold">{cancelDialog.session?.subject || "—"}</span>
                  </div>
                </div>
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-4">
              <Button
                variant="outline"
                onClick={closeCancelDialog}
                disabled={cancelSubmitting}
                className="w-full sm:w-auto font-bold rounded-xl border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350"
              >
                No, Go Back
              </Button>

              <Button
                onClick={confirmCancelBooking}
                disabled={cancelSubmitting}
                className="w-full sm:w-auto bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-extrabold rounded-xl shadow-md shadow-rose-500/10 hover:shadow-rose-500/25 transition-all"
              >
                {cancelSubmitting ? (
                  <>
                    <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 mr-1.5" />
                    Yes, Cancel Booking
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

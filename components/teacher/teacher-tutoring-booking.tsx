"use client";

import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
import { Spinner } from "@/components/ui/spinner";
import { se } from "date-fns/locale";

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

interface Course {
  id: string;
  name: string;
  subject: string;
  classroom: string;
  description: string;
  isActive: boolean;
}

interface PrivateSession {
  id: string;
  courseId: string;
  courseName: string;
  title: string; // ← add
  ratePerHour: string;
  durationDays: number;
  availableDays: string[];
  notes?: string;
  status: "Active" | "Inactive";
  createdAt: string;
}

interface UpcomingSession {
  id: number | string;
  student: string;
  subject: string;
  date: string;
  time: string;
  type: string;
  status: string;
  meetingLink: string | null;
  cost: string;
  studentAvatar: string;
  notes: string;
  duration: number;
}

interface PastSession {
  id: number | string;
  student: string;
  subject: string;
  date: string;
  time: string;
  type: string;
  status: string;
  rating: number;
  feedback: string;
  cost: string;
  studentAvatar: string;
  hasRecording: boolean;
  recordingUrl: string;
  duration: number;
  actualDuration: number;
  dateCompleted: string;
}

export function TeacherTutoringBooking() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isDeleteSessionDialogOpen, setIsDeleteSessionDialogOpen] =
    useState(false);
  const [selectedSession, setSelectedSession] = useState<
    ({ id: number | string; category: "upcoming" | "private" } & any) | null
  >(null);
  const [activeTab, setActiveTab] = useState<"upcoming" | "private" | "past">(
    "upcoming"
  );
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [pastPage, setPastPage] = useState(1);
  const [privatePage, setPrivatePage] = useState(1);
  const [upcomingTotalPages, setUpcomingTotalPages] = useState(1);
  const [pastTotalPages, setPastTotalPages] = useState(1);
  const [privateTotalPages, setPrivateTotalPages] = useState(1);
  const [courses, setCourses] = useState<Course[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>(
    []
  );
  const [privateTitle, setPrivateTitle] = useState("My Private Tutoring");
  const [pastSessions, setPastSessions] = useState<PastSession[]>([]);
  const [privateSessions, setPrivateSessions] = useState<PrivateSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 3;
  const sessionToken = useMemo(
    () => session?.user?.sessionToken || null,
    [session?.user?.sessionToken]
  );

  const fetchCourses = async () => {
    if (status !== "authenticated" || !session?.user?.sessionToken) {
      console.log(
        "[TeacherTutoringBooking] Session not authenticated for courses, status:",
        status
      );
      setError("Not authenticated");
      setCoursesLoading(false);
      return;
    }

    try {
      console.log(
        "[TeacherTutoringBooking] Fetching courses from /api/teacher/courses"
      );
      const response = await fetch("/api/teacher/courses", {
        method: "GET",
        headers: {
          Authorization: `Api-Key nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c`,
          "Content-Type": "application/json",
          "X-Session-Token": session.user.sessionToken,
        },
      });

      console.log(
        "[TeacherTutoringBooking] Courses fetch response status:",
        response.status
      );
      const text = await response.text();
      console.log("[TeacherTutoringBooking] Courses raw response:", text);

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error(
          "[TeacherTutoringBooking] Courses response is not JSON, content-type:",
          contentType
        );
        throw new Error(
          `Backend returned non-JSON response (status: ${response.status})`
        );
      }

      const data = JSON.parse(text);

      if (!response.ok) {
        console.error("[TeacherTutoringBooking] Courses fetch failed:", data);
        if (response.status === 401 || response.status === 403) {
          setError("Session expired");
          setCourses([]);
          setCoursesLoading(false);
          return;
        }
        throw new Error(
          data.error || `Failed to fetch courses (status: ${response.status})`
        );
      }

      console.log(
        "[TeacherTutoringBooking] Courses fetch response data:",
        data
      );
      setCourses(data);
      setError(null);
      setCoursesLoading(false);
    } catch (err: any) {
      console.error("[TeacherTutoringBooking] Error fetching courses:", err);
      setError(err.message || "Failed to load courses");
      setCourses([]);
      setCoursesLoading(false);
    }
  };

  const fetchSessions = async (
    tab: "upcoming" | "past" | "private",
    page: number,
    setData: (data: any[]) => void,
    setTotalPages: (pages: number) => void
  ) => {
    if (status !== "authenticated" || !session?.user?.sessionToken) {
      console.log(
        "[TeacherTutoringBooking] Session not authenticated, status:",
        status
      );
      setError("Not authenticated");
      setSessionsLoading(false);
      return;
    }

    try {
      console.log(
        `[TeacherTutoringBooking] Fetching sessions from /api/teacher/tutoring-bookings/get?tab=${tab}&page=${page}&limit=${itemsPerPage}`
      );
      const response = await fetch(
        `/api/teacher/tutoring-bookings/get?tab=${tab}&page=${page}&limit=${itemsPerPage}`,
        {
          method: "GET",
          headers: {
            Authorization: `Api-Key nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c`,
            "Content-Type": "application/json",
            "X-Session-Token": session.user.sessionToken,
          },
        }
      );

      console.log(
        "[TeacherTutoringBooking] Sessions fetch response status:",
        response.status
      );
      const text = await response.text();
      console.log("[TeacherTutoringBooking] Sessions raw response:", text);

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error(
          "[TeacherTutoringBooking] Sessions response is not JSON, content-type:",
          contentType
        );
        throw new Error(
          `Backend returned non-JSON response (status: ${response.status})`
        );
      }

      const data = JSON.parse(text);

      if (!response.ok) {
        console.error("[TeacherTutoringBooking] Sessions fetch failed:", data);
        if (response.status === 401 || response.status === 403) {
          setError("Session expired");
          setData([]);
          setSessionsLoading(false);
          return;
        }
        throw new Error(
          data.error || `Failed to fetch sessions (status: ${response.status})`
        );
      }

      console.log(
        "[TeacherTutoringBooking] Sessions fetch response data:",
        data
      );

      let mappedData: any[] = [];
      if (tab === "upcoming") {
        mappedData = data.results.map((item: any) => ({
          id: item.id,
          student: item.student_name || "Unknown",
          subject: item.course_name || "Unknown",
          date: new Date(item.created_at).toISOString().split("T")[0],
          time: item.duration_hours
            ? `${new Date(item.created_at).toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
            })} - ${new Date(
              new Date(item.created_at).getTime() +
              item.duration_hours * 60 * 60 * 1000
            ).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
            : "N/A",
          type: item.private_tutoring ? "One-on-One" : "Group Session",
          status: item.status
            ? item.status.charAt(0).toUpperCase() + item.status.slice(1)
            : "Pending",
          meetingLink: item.meeting_link || null,
          cost: `₦${parseFloat(item.price || 0).toFixed(2)}`,
          studentAvatar:
            item.student_avatar || "/placeholder.svg?height=40&width=40",
          notes: item.notes || "",
          duration: item.duration_hours * 60 || 60,
        }));
      } else if (tab === "past") {
        mappedData = data.results.map((item: any) => ({
          id: item.id,
          student: item.student_name || "Unknown",
          subject: item.course_name || "Unknown",
          date: new Date(item.created_at).toISOString().split("T")[0],
          time: item.duration_hours
            ? `${new Date(item.created_at).toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
            })} - ${new Date(
              new Date(item.created_at).getTime() +
              item.duration_hours * 60 * 60 * 1000
            ).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
            : "N/A",
          type: item.private_tutoring ? "One-on-One" : "Group Session",
          status: item.status
            ? item.status.charAt(0).toUpperCase() + item.status.slice(1)
            : "Completed",
          rating: item.rating || 0,
          feedback: item.feedback || "",
          cost: `₦${parseFloat(item.price || 0).toFixed(2)}`,
          studentAvatar:
            item.student_avatar || "/placeholder.svg?height=40&width=40",
          hasRecording: !!item.recording_url,
          recordingUrl: item.recording_url || "",
          duration: item.duration_hours * 60 || 60,
          actualDuration:
            item.actual_duration || item.duration_hours * 60 || 60,
          dateCompleted: new Date(item.completed_at || item.created_at)
            .toISOString()
            .split("T")[0],
        }));
      } else if (tab === "private") {
        mappedData = data.results.map((item: any) => ({
          id: item.id.toString(),
          courseId: item.course.toString(),
          courseName: item.course_name,
          title: item.title || "My Private Tutoring",
          ratePerHour: parseFloat(item.rate_per_hour || 0).toFixed(2),
          durationDays: item.tutoring_duration_days || 24,
          availableDays: item.available_days?.map((d: any) => d.day) || [],
          notes: item.notes || "",
          status: item.status
            ? item.status.charAt(0).toUpperCase() + item.status.slice(1)
            : "Active",
          createdAt: new Date(item.created_at).toISOString(),
        }));
      }

      setData(mappedData);
      setTotalPages(data.pages || 1);
      setError(null);
      setSessionsLoading(false);
    } catch (err: any) {
      console.error(
        `[TeacherTutoringBooking] Error fetching sessions for tab=${tab}:`,
        err
      );
      setError(err.message || "Failed to load sessions");
      setData([]);
      setSessionsLoading(false);
    }
  };

  useEffect(() => {
    if (status === "loading") return;
    // fetchCourses(); // No longer needed here if we only used it for the modal
    fetchSessions(
      "upcoming",
      upcomingPage,
      setUpcomingSessions,
      setUpcomingTotalPages
    );
    fetchSessions("past", pastPage, setPastSessions, setPastTotalPages);
    fetchSessions(
      "private",
      privatePage,
      setPrivateSessions,
      setPrivateTotalPages
    );
  }, [status, upcomingPage, pastPage, privatePage, sessionToken]);

  const paginate = (items: any[], page: number, perPage: number) => {
    return items; // API handles pagination
  };

  const totalPages = (tab: "upcoming" | "past" | "private") => {
    switch (tab) {
      case "upcoming":
        return upcomingTotalPages;
      case "past":
        return pastTotalPages;
      case "private":
        return privateTotalPages;
      default:
        return 1;
    }
  };

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
      case "Active":
        return (
          <Badge className="bg-emerald-100 text-emerald-800">Active</Badge>
        );
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
        className={`h-3 w-3 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
      />
    ));
  };

  const handleDeleteSession = (
    session: any,
    category: "upcoming" | "private"
  ) => {
    setSelectedSession({ ...session, category });
    setIsDeleteSessionDialogOpen(true);
  };

  const handleConfirmSession = async (sessionId: number | string) => {
    if (!session?.user?.sessionToken) {
      setError("Not authenticated");
      return;
    }

    try {
      const response = await fetch(
        `/api/teacher/tutoring-bookings/patch?tab=upcoming`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Api-Key nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c`,
            "Content-Type": "application/json",
            "X-Session-Token": session.user.sessionToken,
          },
          body: JSON.stringify({
            id: sessionId,
            status: "confirmed",
          }),
        }
      );

      const text = await response.text();
      console.log("[TeacherTutoringBooking] PATCH response:", text);

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error(
          "[TeacherTutoringBooking] PATCH response is not JSON, content-type:",
          contentType
        );
        throw new Error(
          `Backend returned non-JSON response (status: ${response.status})`
        );
      }

      const data = JSON.parse(text);

      if (!response.ok) {
        console.error("[TeacherTutoringBooking] PATCH failed:", data);
        if (response.status === 401 || response.status === 403) {
          setError("Session expired");
          return;
        }
        throw new Error(data.error || "Failed to confirm session");
      }

      setUpcomingSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId ? { ...s, status: "Confirmed" } : s
        )
      );
      setError(null);
    } catch (err: any) {
      console.error("[TeacherTutoringBooking] Error confirming session:", err);
      setError(err.message || "Failed to confirm session");
    }
  };



  const handleConfirmDelete = async () => {
    if (!session?.user?.sessionToken) {
      setError("Not authenticated");
      return;
    }

    if (!selectedSession) return;

    try {
      const response = await fetch(
        `/api/teacher/tutoring-bookings/delete?tab=${selectedSession.category}&id=${selectedSession.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Api-Key nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c`,
            "X-Session-Token": session.user.sessionToken,
          },
        }
      );

      console.log("[TeacherTutoringBooking] DELETE status:", response.status);

      // Handle 204 No Content → success, no body
      if (response.status === 204) {
        // Remove from UI
        if (selectedSession.category === "upcoming") {
          setUpcomingSessions((prev) =>
            prev.filter((s) => s.id !== selectedSession.id)
          );
        } else if (selectedSession.category === "private") {
          setPrivateSessions((prev) =>
            prev.filter((s) => s.id !== selectedSession.id)
          );
        }
        setIsDeleteSessionDialogOpen(false);
        setSelectedSession(null);
        setError(null);
        return;
      }

      // For all other statuses, try to read body
      const text = await response.text();
      console.log("[TeacherTutoringBooking] DELETE response:", text);

      let data: any = {};
      const contentType = response.headers.get("content-type");
      if (text && contentType?.includes("application/json")) {
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error("Invalid JSON response from server");
        }
      }

      if (!response.ok) {
        throw new Error(
          data.error || data.detail || "Failed to delete session"
        );
      }

      // If we get here with 200/201 and JSON, still remove from UI
      if (selectedSession.category === "upcoming") {
        setUpcomingSessions((prev) =>
          prev.filter((s) => s.id !== selectedSession.id)
        );
      } else if (selectedSession.category === "private") {
        setPrivateSessions((prev) =>
          prev.filter((s) => s.id !== selectedSession.id)
        );
      }

      setIsDeleteSessionDialogOpen(false);
      setSelectedSession(null);
      setError(null);
    } catch (err: any) {
      console.error("[TeacherTutoringBooking] Error deleting session:", err);
      setError(err.message || "Failed to delete session");
    }
  };

  const handleTogglePrivateSessionStatus = async (sessionId: string) => {
    if (!session?.user?.sessionToken) {
      setError("Not authenticated");
      return;
    }

    const sessionToToggle = privateSessions.find((s) => s.id === sessionId);
    if (!sessionToToggle) return;

    try {
      const response = await fetch(
        `/api/teacher/tutoring-bookings/patch?tab=private`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Api-Key nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c`,
            "Content-Type": "application/json",
            "X-Session-Token": session.user.sessionToken,
          },
          body: JSON.stringify({
            id: sessionId,
            status: sessionToToggle.status === "Active" ? "Inactive" : "Active", // Use capitalized status
          }),
        }
      );

      const text = await response.text();
      console.log(
        "[TeacherTutoringBooking] PATCH private session response:",
        text
      );

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error(
          "[TeacherTutoringBooking] PATCH private session response is not JSON, content-type:",
          contentType
        );
        throw new Error(
          `Backend returned non-JSON response (status: ${response.status})`
        );
      }

      const data = JSON.parse(text);

      if (!response.ok) {
        console.error(
          "[TeacherTutoringBooking] PATCH private session failed:",
          data
        );
        if (response.status === 401 || response.status === 403) {
          setError("Session expired");
          return;
        }
        throw new Error(data.error || "Failed to toggle session status");
      }

      setPrivateSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? { ...s, status: s.status === "Active" ? "Inactive" : "Active" }
            : s
        )
      );
      setError(null);
    } catch (err: any) {
      console.error(
        "[TeacherTutoringBooking] Error toggling private session status:",
        err
      );
      setError(err.message || "Failed to toggle session status");
    }
  };

  if (status === "loading" || sessionsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-transparent">
        <Spinner size="md" className="text-orange-500" />
      </div>
    );
  }

  if (error === "Not authenticated" || error === "Session expired") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              {error}
            </CardTitle>
            <CardDescription className="text-center">
              Please log in again to continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button
              onClick={() => (window.location.href = "/login")}
              className="flex items-center gap-2"
            >
              Log In Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Error
            </CardTitle>
            <CardDescription className="text-center">{error}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  console.log(upcomingSessions, " upcomingSessions.... ");
  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 text-red-800 p-4 rounded-lg">{error}</div>
      )}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your tutoring sessions and private offerings
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => router.push("/teacher/tutoring/create")}
            className="flex items-center gap-2 h-10 bg-transparent border border-[#EF7B55] text-[#EF7B55] hover:bg-[#F79771] hover:text-white"
          >
            <Plus className="h-4 w-4" />
            Create Private Session
          </Button>
        </div>
      </div>

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
                {upcomingSessions.length === 0 ? (
                  <div className="text-sm text-muted-foreground p-4">
                    No current sessions yet.
                  </div>
                ) : (
                  upcomingSessions.map((session) => (
                    <div
                      key={session.id}
                      className="p-3 sm:p-4 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                        <div className="flex items-start space-x-3 sm:space-x-4 min-w-0">
                          <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                            <AvatarImage src={session.studentAvatar} />
                            <AvatarFallback>
                              {session.student
                                .split(" ")
                                .map((n: string) => n[0])
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
                            {/* <Button
                              size="sm"
                              className="h-8 bg-red-600 hover:bg-red-700"
                              onClick={() =>
                                handleDeleteSession(session, "upcoming")
                              }
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button> */}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
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
                    {Array.from({ length: upcomingTotalPages }).map(
                      (_, index) => {
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
                      }
                    )}
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
                  No private sessions yet. Click{" "}
                  <span className="font-medium">Create Private Session</span> to
                  add one.
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {privateSessions.map((p) => (
                      <div
                        key={p.id}
                        className="p-3 sm:p-4 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                          <div className="space-y-2">
                            <h4 className="font-semibold text-base sm:text-lg">
                              {p.title} —{" "}
                              {courses.find((c) => c.id === p.courseId)?.name ||
                                p.courseName}
                            </h4>
                            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                              <span className="font-medium">Rate:</span>
                              <span>
                                ₦{Number(p.ratePerHour).toLocaleString()}/hour
                              </span>
                              <span className="mx-1">•</span>
                              <span className="font-medium">Duration:</span>
                              <span>{p.durationDays} day(s)</span>
                              <span className="mx-1">•</span>
                              {getStatusBadge(p.status)}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {p.availableDays.length > 0 ? (
                                p.availableDays.map((d) => (
                                  <Badge
                                    key={d}
                                    variant="outline"
                                    className="text-xs capitalize"
                                  >
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
                              Created:{" "}
                              {new Date(p.createdAt).toLocaleDateString()}
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                              {/* <Button
                                size="sm"
                                variant="outline"
                                className="h-8"
                                onClick={() =>
                                  handleTogglePrivateSessionStatus(p.id)
                                }
                              >
                                {p.status === "Active"
                                  ? "Deactivate"
                                  : "Activate"}
                              </Button> */}
                              <Button
                                size="sm"
                                className="h-8 bg-red-600 hover:bg-red-700"
                                onClick={() =>
                                  handleDeleteSession(p, "private")
                                }
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
                  {privateTotalPages > 1 && (
                    <Pagination className="mt-4 sm:mt-6">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() =>
                              handlePageChange(
                                setPrivatePage,
                                privateTotalPages,
                                privatePage - 1
                              )
                            }
                          />
                        </PaginationItem>
                        {Array.from({ length: privateTotalPages }).map(
                          (_, index) => {
                            const page = index + 1;
                            if (
                              page === 1 ||
                              page === privateTotalPages ||
                              (page >= privatePage - 1 &&
                                page <= privatePage + 1)
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
                                privatePage < privateTotalPages - 2)
                            ) {
                              return (
                                <PaginationItem key={page}>
                                  <PaginationEllipsis />
                                </PaginationItem>
                              );
                            }
                            return null;
                          }
                        )}
                        <PaginationItem>
                          <PaginationNext
                            onClick={() =>
                              handlePageChange(
                                setPrivatePage,
                                privateTotalPages,
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
                {pastSessions.length === 0 ? (
                  <div className="text-sm text-muted-foreground p-4">
                    No past sessions yet.
                  </div>
                ) : (
                  pastSessions.map((session) => (
                    <div
                      key={session.id}
                      className="p-3 sm:p-4 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                        <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                          <Avatar className="h-10 w-10 sm:h-12 sm:w-12 shrink-0">
                            <AvatarImage src={session.studentAvatar} />
                            <AvatarFallback>
                              {session.student
                                .split(" ")
                                .map((n: string) => n[0])
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
                              <span>
                                {" "}
                                Date completed: {session.dateCompleted}
                              </span>
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
                  ))
                )}
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
                    {Array.from({ length: pastTotalPages }).map((_, index) => {
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
      </Tabs>

      {/* <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Sessions
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {upcomingSessions.length +
                pastSessions.length +
                privateSessions.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {upcomingSessions.length} current, {privateSessions.length}{" "}
              private
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
            <CardTitle className="text-sm font-medium">
              Average Rating
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(
                pastSessions.reduce((sum, session) => sum + session.rating, 0) /
                  pastSessions.length || 0
              ).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {pastSessions.length} sessions
            </p>
          </CardContent>
        </Card>
      </div> */}
    </div>
  );
}

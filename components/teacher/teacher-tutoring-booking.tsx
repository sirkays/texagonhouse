"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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
  CalendarIcon,
  Clock,
  Plus,
  CheckCircle,
  AlertCircle,
  Bell,
  BookOpen,
  Star,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Edit,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ButtonProps, buttonVariants } from "@/components/ui/button";

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

export function TeacherTutoringBooking() {
  const { data: session, status } = useSession();
  const [isAvailabilityDialogOpen, setIsAvailabilityDialogOpen] = useState(false);
  const [isEditSessionDialogOpen, setIsEditSessionDialogOpen] = useState(false);
  const [isDeleteSessionDialogOpen, setIsDeleteSessionDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [pastSessions, setPastSessions] = useState<any[]>([]);
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [pastPage, setPastPage] = useState(1);
  const [upcomingTotalPages, setUpcomingTotalPages] = useState(1);
  const [pastTotalPages, setPastTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    availableDays: "",
    timeSlots: "",
    subject: "",
    sessionType: "",
    rate: "",
    notes: "",
  });
  const itemsPerPage = 3;

  // Fetch sessions from API
  const fetchSessions = async (
    tab: string,
    page: number,
    setData: (data: any[]) => void,
    setTotalPages: (pages: number) => void
  ) => {
    if (status !== "authenticated" || !session?.user?.sessionToken) {
      console.log(
        "[TeacherTutoringBooking] Session not authenticated, status:",
        status,
        "sessionToken:",
        session?.user?.sessionToken
      );
      setError("Not authenticated");
      return;
    }

    try {
      console.log(
        `[TeacherTutoringBooking] Fetching from /api/teacher/tutoring-bookings/get?tab=${tab}&page=${page}&limit=${itemsPerPage} with token:`,
        session.user.sessionToken
      );
      const response = await fetch(
        `/api/teacher/tutoring-bookings/get?tab=${tab}&page=${page}&limit=${itemsPerPage}`,
        {
          method: "GET",
          headers: {
            Authorization: `Api-Key 1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz`,
            "Content-Type": "application/json",
            "X-Session-Token": session.user.sessionToken,
          },
        }
      );

      console.log("[TeacherTutoringBooking] Fetch response status:", response.status);
      const text = await response.text();
      console.log("[TeacherTutoringBooking] Raw response:", text);

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("[TeacherTutoringBooking] Response is not JSON, content-type:", contentType);
        throw new Error(`Backend returned non-JSON response (status: ${response.status})`);
      }

      const data = JSON.parse(text);

      if (!response.ok) {
        console.error("[TeacherTutoringBooking] Fetch failed with status:", response.status, "data:", data);
        if (response.status === 401 || response.status === 403) {
          setError("Session expired");
          setData([]);
          return;
        }
        throw new Error(data.error || `Failed to fetch sessions (status: ${response.status})`);
      }

      console.log("[TeacherTutoringBooking] Fetch response data:", data);

      // Map API data to frontend format
      const mappedData = data.results.map((item: any) => ({
        id: item.id,
        student: item.student_name,
        subject: item.course_name,
        date: new Date(item.created_at).toISOString().split("T")[0],
        time: item.duration_hours
          ? `${new Date(item.created_at).toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
            })} - ${new Date(
              new Date(item.created_at).getTime() + item.duration_hours * 60 * 60 * 1000
            ).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
          : "N/A",
        type: item.private_tutoring ? "One-on-One" : "Group Session",
        status: item.status.charAt(0).toUpperCase() + item.status.slice(1),
        meetingLink: null,
        cost: `₦${parseFloat(item.price).toFixed(2)}`,
        studentAvatar: "/placeholder.svg?height=40&width=40",
        notes: item.notes || "",
        duration: item.duration_hours * 60,
        reminderSent: false,
        rating: item.rating || 0,
        feedback: item.feedback || "",
        actualDuration: item.duration_hours * 60,
        materials: [],
      }));

      setData(mappedData);
      setTotalPages(data.pages || 1);
      setError(null);
    } catch (err: any) {
      console.error(`[TeacherTutoringBooking] Error fetching sessions for tab=${tab}:`, err);
      setError(err.message || "Failed to load sessions");
      setData([]);
    }
  };

  useEffect(() => {
    if (status === "loading") return;
    fetchSessions("upcoming", upcomingPage, setUpcomingSessions, setUpcomingTotalPages);
    fetchSessions("past", pastPage, setPastSessions, setPastTotalPages);
  }, [upcomingPage, pastPage, status, session]);

  // Pagination helpers
  const paginate = (items: any[], page: number, itemsPerPage: number) => {
    return items; // API handles pagination
  };

  const totalPages = (tab: string) => {
    return tab === "upcoming" ? upcomingTotalPages : pastTotalPages;
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
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ));
  };

  const handleEditSession = (session: any) => {
    setSelectedSession(session);
    setIsEditSessionDialogOpen(true);
  };

  const handleDeleteSession = (session: any) => {
    setSelectedSession(session);
    setIsDeleteSessionDialogOpen(true);
  };

  const handleSaveSession = async () => {
    if (!session?.user?.sessionToken) {
      setError("Not authenticated");
      return;
    }
    if (!selectedSession) return;

    try {
      const response = await fetch(`/api/teacher/tutoring-bookings/patch?tab=upcoming`, {
        method: "PATCH",
        headers: {
          Authorization: `Api-Key 1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz`,
          "Content-Type": "application/json",
          "X-Session-Token": session.user.sessionToken,
        },
        body: JSON.stringify({
          id: selectedSession.id,
          status: selectedSession.status.toLowerCase(),
        }),
      });

      const text = await response.text();
      console.log("[TeacherTutoringBooking] PATCH response:", text);

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("[TeacherTutoringBooking] PATCH response is not JSON, content-type:", contentType);
        throw new Error(`Backend returned non-JSON response (status: ${response.status})`);
      }

      const data = JSON.parse(text);

      if (!response.ok) {
        console.error("[TeacherTutoringBooking] PATCH failed:", data);
        if (response.status === 401 || response.status === 403) {
          setError("Session expired");
          return;
        }
        throw new Error(data.error || "Failed to update session");
      }

      setUpcomingPage(1);
      setIsEditSessionDialogOpen(false);
      setSelectedSession(null);
      setError(null);
    } catch (err: any) {
      console.error("[TeacherTutoringBooking] Error updating session:", err);
      setError(err.message || "Failed to update session");
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
        `/api/teacher/tutoring-bookings/delete?tab=${activeTab}&id=${selectedSession.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Api-Key 1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz`,
            "Content-Type": "application/json",
            "X-Session-Token": session.user.sessionToken,
          },
        }
      );

      const text = await response.text();
      console.log("[TeacherTutoringBooking] DELETE response:", text);

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("[TeacherTutoringBooking] DELETE response is not JSON, content-type:", contentType);
        throw new Error(`Backend returned non-JSON response (status: ${response.status})`);
      }

      const data = JSON.parse(text);

      if (!response.ok) {
        console.error("[TeacherTutoringBooking] DELETE failed:", data);
        if (response.status === 401 || response.status === 403) {
          setError("Session expired");
          return;
        }
        throw new Error(data.error || "Failed to delete session");
      }

      if (activeTab === "upcoming") {
        setUpcomingPage(1);
      } else {
        setPastPage(1);
      }
      setIsDeleteSessionDialogOpen(false);
      setSelectedSession(null);
      setError(null);
    } catch (err: any) {
      console.error("[TeacherTutoringBooking] Error deleting session:", err);
      setError(err.message || "Failed to delete session");
    }
  };

  const handleSaveAvailability = async () => {
    if (!session?.user?.sessionToken) {
      setError("Not authenticated");
      return;
    }

    try {
      const dayMap: { [key: string]: string[] } = {
        "mon-fri": ["monday", "tuesday", "wednesday", "thursday", "friday"],
        "mon-sat": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
        "tue-sat": ["tuesday", "wednesday", "thursday", "friday", "saturday"],
      };
      const availableDays = dayMap[formData.availableDays] || [];

      const subjectToCourseId: { [key: string]: number } = {
        Mathematics: 67,
        Physics: 68,
        "English Literature": 69,
        Chemistry: 70,
      };

      const rate = parseFloat(formData.rate) || 1500.0;

      const response = await fetch(`/api/teacher/tutoring-bookings/post`, {
        method: "POST",
        headers: {
          Authorization: `Api-Key 1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz`,
          "Content-Type": "application/json",
          "X-Session-Token": session.user.sessionToken,
        },
        body: JSON.stringify({
          course: subjectToCourseId[formData.subject] || 67,
          rate_per_hour: rate.toFixed(2),
          tutoring_duration_days: 24,
          notes: formData.notes.slice(0, 225),
          available_days: availableDays.map((day) => ({ day })),
        }),
      });

      const text = await response.text();
      console.log("[TeacherTutoringBooking] POST response:", text);

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("[TeacherTutoringBooking] POST response is not JSON, content-type:", contentType);
        throw new Error(`Backend returned non-JSON response (status: ${response.status})`);
      }

      const data = JSON.parse(text);

      if (!response.ok) {
        console.error("[TeacherTutoringBooking] POST failed:", data);
        if (response.status === 401 || response.status === 403) {
          setError("Session expired");
          return;
        }
        throw new Error(data.error || "Failed to create tutoring offering");
      }

      setIsAvailabilityDialogOpen(false);
      setError(null);
    } catch (err: any) {
      console.error("[TeacherTutoringBooking] Error creating tutoring offering:", err);
      setError(err.message || "Failed to create tutoring offering");
    }
  };

  if (status === "loading") {
    return <div>Loading...</div>;
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

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 text-red-800 p-4 rounded-lg">
          {error}
        </div>
      )}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your tutoring sessions and availability
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog
            open={isAvailabilityDialogOpen}
            onOpenChange={setIsAvailabilityDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 h-10 bg-transparent border border-[#EF7B55] text-[#EF7B55] hover:bg-[#F79771] hover:text-white">
                <Plus className="h-4 w-4" />
                Set Availability
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-[700px] max-h-[85vh] p-0 overflow-scroll rounded-none sm:rounded-lg">
              <DialogHeader className="p-4 sm:p-6 sticky top-0 bg-background z-10 border-b">
                <DialogTitle>Set Availability</DialogTitle>
                <DialogDescription>
                  Configure your teaching availability and preferences
                </DialogDescription>
              </DialogHeader>
              <div className="px-4 sm:px-6 py-4 overflow-y-auto">
                <div className="grid gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="availability-days">Available Days</Label>
                      <Select
                        onValueChange={(value) =>
                          setFormData({ ...formData, availableDays: value })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select days" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mon-fri">Monday - Friday</SelectItem>
                          <SelectItem value="mon-sat">Monday - Saturday</SelectItem>
                          <SelectItem value="tue-sat">Tuesday - Saturday</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="availability-time">Available Time Slots</Label>
                      <Select
                        onValueChange={(value) =>
                          setFormData({ ...formData, timeSlots: value })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select time slots" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2pm-6pm">2:00 PM - 6:00 PM</SelectItem>
                          <SelectItem value="3pm-7pm">3:00 PM - 7:00 PM</SelectItem>
                          <SelectItem value="1pm-5pm">1:00 PM - 5:00 PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subjects">Subjects Taught</Label>
                    <Select
                      onValueChange={(value) =>
                        setFormData({ ...formData, subject: value })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select subjects" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mathematics">Mathematics</SelectItem>
                        <SelectItem value="Physics">Physics</SelectItem>
                        <SelectItem value="English Literature">English Literature</SelectItem>
                        <SelectItem value="Chemistry">Chemistry</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="session-types">Session Types</Label>
                    <Select
                      onValueChange={(value) =>
                        setFormData({ ...formData, sessionType: value })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select session types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="One-on-One">One-on-One</SelectItem>
                        <SelectItem value="Group Session">Group Session</SelectItem>
                        <SelectItem value="Intensive Session">Intensive Session</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rate">Hourly Rate</Label>
                    <Select
                      onValueChange={(value) =>
                        setFormData({ ...formData, rate: value })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select rate" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7000">₦7,000/hour</SelectItem>
                        <SelectItem value="7500">₦7,500/hour</SelectItem>
                        <SelectItem value="8000">₦8,000/hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any specific requirements or preferences..."
                      rows={3}
                      className="w-full"
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
              <DialogFooter className="p-4 sm:p-6 sticky bottom-0 bg-background z-10 border-t flex flex-col sm:flex-row gap-2 sm:gap-4">
                <Button
                  variant="outline"
                  onClick={() => setIsAvailabilityDialogOpen(false)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveAvailability}
                  className="w-full sm:w-auto h-10 bg-transparent border border-[#EF7B55] text-[#EF7B55] hover:bg-[#F79771] hover:text-white"
                >
                  Save Availability
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={isEditSessionDialogOpen} onOpenChange={setIsEditSessionDialogOpen}>
            <DialogContent className="w-[95vw] max-w-[700px] max-h-[85vh] p-0 overflow-scroll rounded-none sm:rounded-lg">
              <DialogHeader className="p-4 sm:p-6 sticky top-0 bg-background z-10 border-b">
                <DialogTitle>Edit Session</DialogTitle>
                <DialogDescription>Update the details of this tutoring session</DialogDescription>
              </DialogHeader>
              <div className="px-4 sm:px-6 py-4 overflow-y-auto">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={selectedSession?.status}
                      onValueChange={(value) =>
                        setSelectedSession((prev: any) => ({ ...prev, status: value }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Confirmed">Confirmed</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter className="p-4 sm:p-6 sticky bottom-0 bg-background z-10 border-t flex flex-col sm:flex-row gap-2 sm:gap-4">
                <Button
                  variant="outline"
                  onClick={() => setIsEditSessionDialogOpen(false)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveSession}
                  className="w-full sm:w-auto h-10 bg-transparent border border-[#EF7B55] text-[#EF7B55] hover:bg-[#F79771] hover:text-white"
                >
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={isDeleteSessionDialogOpen} onOpenChange={setIsDeleteSessionDialogOpen}>
            <DialogContent className="w-[95vw] max-w-[500px] p-4 sm:p-6">
              <DialogHeader>
                <DialogTitle>Delete Session</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this session? This action cannot be undone.
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
                  Delete Session
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 xs:space-y-6">
        <TabsList className="bg-[#f797712e] text-slate-700 flex flex-col lg:flex-row w-full gap-2 mb-14">
          <TabsTrigger
            className="bg-transparent w-full sm:w-40 justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3"
            value="upcoming"
          >
            Upcoming Sessions
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
                Upcoming Sessions ({upcomingSessions.length})
              </CardTitle>
              <CardDescription className="text-sm">Your scheduled tutoring sessions</CardDescription>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-3 sm:p-4 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                      <div className="flex items-start space-x-3 sm:space-x-4 min-w-0">
                        <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                          <AvatarImage src={session.studentAvatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {session.student.split(" ").map((n: string) => n[0]).join("")}
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
                            {session.reminderSent && (
                              <Badge variant="outline" className="text-xs">
                                <Bell className="h-3 w-3 mr-1" />
                                Reminder sent
                              </Badge>
                            )}
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
                            onClick={() => handleEditSession(session)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            className="h-8 bg-red-600 hover:bg-red-700"
                            onClick={() => handleDeleteSession(session)}
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
              {upcomingTotalPages > 1 && (
                <Pagination className="mt-4 sm:mt-6">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          handlePageChange(setUpcomingPage, upcomingTotalPages, upcomingPage - 1)
                        }
                      />
                    </PaginationItem>
                    {Array.from({ length: upcomingTotalPages }).map((_, index) => {
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
                        (page === upcomingPage + 2 && upcomingPage < upcomingTotalPages - 2)
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
                          handlePageChange(setUpcomingPage, upcomingTotalPages, upcomingPage + 1)
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
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
              <CardDescription className="text-sm">History of completed tutoring sessions</CardDescription>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-4">
                {pastSessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-3 sm:p-4 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                      <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                        <Avatar className="h-10 w-10 sm:h-12 sm:w-12 shrink-0">
                          <AvatarImage src={session.studentAvatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {session.student.split(" ").map((n: string) => n[0]).join("")}
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
                          <div className="flex items-center gap-1">
                            {renderStars(session.rating)}
                            <span className="text-xs sm:text-sm text-muted-foreground ml-1">
                              ({session.rating}/5)
                            </span>
                          </div>
                          <div className="text-xs sm:text-sm text-muted-foreground italic break-words">
                            "{session.feedback}"
                          </div>
                          {session.materials && (
                            <div className="flex flex-wrap gap-2">
                              {session.materials.map((material: string, index: number) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  size="sm"
                                  className="text-xs h-7"
                                >
                                  {material}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right space-y-2 flex-shrink-0">
                        <div className="font-medium text-green-600 text-base sm:text-lg">
                          {session.cost}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button
                            size="sm"
                            className="h-8 bg-red-600 hover:bg-red-700"
                            onClick={() => handleDeleteSession(session)}
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
              {pastTotalPages > 1 && (
                <Pagination className="mt-4 sm:mt-6">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          handlePageChange(setPastPage, pastTotalPages, pastPage - 1)
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
                          handlePageChange(setPastPage, pastTotalPages, pastPage + 1)
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

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingSessions.length + pastSessions.length}</div>
            <p className="text-xs text-muted-foreground">{upcomingSessions.length} upcoming</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Taught</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pastSessions.reduce((sum, session) => sum + (session.actualDuration || 60), 0) / 60}h
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
              {(pastSessions.reduce((sum, session) => sum + session.rating, 0) / pastSessions.length || 0).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">From {pastSessions.length} sessions</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
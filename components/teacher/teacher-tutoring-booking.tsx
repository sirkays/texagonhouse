"use client";

import * as React from "react";
import {useState} from "react";
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
  DialogTrigger,
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
  Plus,
  CheckCircle,
  AlertCircle,
  Bell,
  Users,
  BookOpen,
  Shield,
  Zap,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Edit,
  Trash2,
} from "lucide-react";
import {cn} from "@/lib/utils";
import {ButtonProps, buttonVariants} from "@/components/ui/button";

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

export function TeacherTutoringBooking() {
  const [isAvailabilityDialogOpen, setIsAvailabilityDialogOpen] =
    useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isEditSessionDialogOpen, setIsEditSessionDialogOpen] = useState(false);
  const [isDeleteSessionDialogOpen, setIsDeleteSessionDialogOpen] =
    useState(false);
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState("upcoming");

  // Pagination state for each tab
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [pastPage, setPastPage] = useState(1);
  const itemsPerPage = 3;

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
      reminderSent: true,
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
      reminderSent: true,
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
      reminderSent: false,
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
      materials: ["Calculus_Notes.pdf", "Practice_Problems.pdf"],
      duration: 60,
      actualDuration: 58,
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
      materials: ["Poetry_Analysis_Guide.pdf"],
      duration: 60,
      actualDuration: 62,
    },
  ]);

  // Pagination helpers
  const paginate = (items: any[], page: number, itemsPerPage: number) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  };
  const totalPages = (items: any[], itemsPerPage: number) =>
    Math.ceil(items.length / itemsPerPage);

  // Paginated data
  const paginatedUpcoming = paginate(
    upcomingSessions,
    upcomingPage,
    itemsPerPage
  );
  const paginatedPast = paginate(pastSessions, pastPage, itemsPerPage);

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

  const handleEditSession = (session: any) => {
    setSelectedSession(session);
    setIsEditSessionDialogOpen(true);
  };

  const handleDeleteSession = (session: any) => {
    setSelectedSession(session);
    setIsDeleteSessionDialogOpen(true);
  };

  const handleSaveSession = () => {
    // In a real app, this would make an API call to update the session
    if (selectedSession) {
      if (activeTab === "upcoming") {
        setUpcomingSessions((prev) =>
          prev.map((s) => (s.id === selectedSession.id ? selectedSession : s))
        );
      } else {
        setPastSessions((prev) =>
          prev.map((s) => (s.id === selectedSession.id ? selectedSession : s))
        );
      }
    }
    setIsEditSessionDialogOpen(false);
    setSelectedSession(null);
  };

  const handleConfirmDelete = () => {
    // In a real app, this would make an API call to delete the session
    if (selectedSession) {
      if (activeTab === "upcoming") {
        setUpcomingSessions((prev) =>
          prev.filter((s) => s.id !== selectedSession.id)
        );
      } else {
        setPastSessions((prev) =>
          prev.filter((s) => s.id !== selectedSession.id)
        );
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
            Manage your tutoring sessions and availability
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog
            open={isAvailabilityDialogOpen}
            onOpenChange={setIsAvailabilityDialogOpen}>
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
                      <Select>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select days" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mon-fri">
                            Monday - Friday
                          </SelectItem>
                          <SelectItem value="mon-sat">
                            Monday - Saturday
                          </SelectItem>
                          <SelectItem value="tue-sat">
                            Tuesday - Saturday
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="availability-time">
                        Available Time Slots
                      </Label>
                      <Select>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select time slots" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2pm-6pm">
                            2:00 PM - 6:00 PM
                          </SelectItem>
                          <SelectItem value="3pm-7pm">
                            3:00 PM - 7:00 PM
                          </SelectItem>
                          <SelectItem value="1pm-5pm">
                            1:00 PM - 5:00 PM
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subjects">Subjects Taught</Label>
                    <Select>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select subjects" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="math">Mathematics</SelectItem>
                        <SelectItem value="physics">Physics</SelectItem>
                        <SelectItem value="english">
                          English Literature
                        </SelectItem>
                        <SelectItem value="chemistry">Chemistry</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="session-types">Session Types</Label>
                    <Select>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select session types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="one-on-one">One-on-One</SelectItem>
                        <SelectItem value="group">Group Session</SelectItem>
                        <SelectItem value="intensive">
                          Intensive Session
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rate">Hourly Rate</Label>
                    <Select>
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
                    />
                  </div>
                </div>
              </div>
              <DialogFooter className="p-4 sm:p-6 sticky bottom-0 bg-background z-10 border-t flex flex-col sm:flex-row gap-2 sm:gap-4">
                <Button
                  variant="outline"
                  onClick={() => setIsAvailabilityDialogOpen(false)}
                  className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button
                  onClick={() => setIsAvailabilityDialogOpen(false)}
                  className="w-full sm:w-auto h-10 bg-transparent border border-[#EF7B55] text-[#EF7B55] hover:bg-[#F79771] hover:text-white">
                  Save Availability
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog
            open={isProfileDialogOpen}
            onOpenChange={setIsProfileDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 h-10 bg-transparent border border-[#EF7B55] text-[#EF7B55] hover:bg-[#F79771] hover:text-white">
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-[700px] max-h-[85vh] p-0 overflow-scroll rounded-none sm:rounded-lg">
              <DialogHeader className="p-4 sm:p-6 sticky top-0 bg-background z-10 border-b">
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogDescription>
                  Update your professional details and teaching preferences
                </DialogDescription>
              </DialogHeader>
              <div className="px-4 sm:px-6 py-4 overflow-y-auto">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      className="w-full border rounded-md p-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Describe your teaching experience and qualifications..."
                      rows={4}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="languages">Languages</Label>
                    <Select>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select languages" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="yoruba">Yoruba</SelectItem>
                        <SelectItem value="igbo">Igbo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialization">Specialization</Label>
                    <input
                      id="specialization"
                      type="text"
                      placeholder="e.g., Advanced Mathematics, Creative Writing"
                      className="w-full border rounded-md p-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="technologies">Technologies Used</Label>
                    <Select>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select technologies" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="whiteboard">
                          Interactive Whiteboard
                        </SelectItem>
                        <SelectItem value="screensharing">
                          Screen Sharing
                        </SelectItem>
                        <SelectItem value="recording">Recording</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter className="p-4 sm:p-6 sticky bottom-0 bg-background z-10 border-t flex flex-col sm:flex-row gap-2 sm:gap-4">
                <Button
                  variant="outline"
                  onClick={() => setIsProfileDialogOpen(false)}
                  className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button
                  onClick={() => setIsProfileDialogOpen(false)}
                  className="w-full sm:w-auto h-10 bg-transparent border border-[#EF7B55] text-[#EF7B55] hover:bg-[#F79771] hover:text-white">
                  Save Profile
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Session Dialog */}
      <Dialog
        open={isEditSessionDialogOpen}
        onOpenChange={setIsEditSessionDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[700px] max-h-[85vh] p-0 overflow-scroll rounded-none sm:rounded-lg">
          <DialogHeader className="p-4 sm:p-6 sticky top-0 bg-background z-10 border-b">
            <DialogTitle>Edit Session</DialogTitle>
            <DialogDescription>
              Update the details of this tutoring session
            </DialogDescription>
          </DialogHeader>
          <div className="px-4 sm:px-6 py-4 overflow-y-auto">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="student">Student</Label>
                <Select
                  value={selectedSession?.student}
                  onValueChange={(value) =>
                    setSelectedSession((prev: any) => ({
                      ...prev,
                      student: value,
                    }))
                  }>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="John Adebayo">John Adebayo</SelectItem>
                    <SelectItem value="Mary Adebayo">Mary Adebayo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select
                  value={selectedSession?.subject}
                  onValueChange={(value) =>
                    setSelectedSession((prev: any) => ({
                      ...prev,
                      subject: value,
                    }))
                  }>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="English Literature">
                      English Literature
                    </SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="session-date">Date</Label>
                  <Select
                    value={selectedSession?.date}
                    onValueChange={(value) =>
                      setSelectedSession((prev: any) => ({
                        ...prev,
                        date: value,
                      }))
                    }>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024-01-20">
                        January 20, 2024
                      </SelectItem>
                      <SelectItem value="2024-01-22">
                        January 22, 2024
                      </SelectItem>
                      <SelectItem value="2024-01-25">
                        January 25, 2024
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="session-time">Time</Label>
                  <Select
                    value={selectedSession?.time}
                    onValueChange={(value) =>
                      setSelectedSession((prev: any) => ({
                        ...prev,
                        time: value,
                      }))
                    }>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2:00 PM - 3:00 PM">
                        2:00 PM - 3:00 PM
                      </SelectItem>
                      <SelectItem value="3:00 PM - 4:00 PM">
                        3:00 PM - 4:00 PM
                      </SelectItem>
                      <SelectItem value="4:00 PM - 5:00 PM">
                        4:00 PM - 5:00 PM
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="session-type">Session Type</Label>
                <Select
                  value={selectedSession?.type}
                  onValueChange={(value) =>
                    setSelectedSession((prev: any) => ({...prev, type: value}))
                  }>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select session type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="One-on-One">One-on-One</SelectItem>
                    <SelectItem value="Group Session">Group Session</SelectItem>
                    <SelectItem value="Intensive Session">
                      Intensive Session
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost">Cost</Label>
                <input
                  id="cost"
                  type="text"
                  value={selectedSession?.cost || ""}
                  onChange={(e) =>
                    setSelectedSession((prev: any) => ({
                      ...prev,
                      cost: e.target.value,
                    }))
                  }
                  placeholder="Enter cost (e.g., ₦8,000)"
                  className="w-full border rounded-md p-2"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={selectedSession?.notes || ""}
                  onChange={(e) =>
                    setSelectedSession((prev: any) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  placeholder="Session notes and objectives..."
                  rows={3}
                  className="w-full"
                />
              </div>
              {activeTab === "past" && (
                <div className="space-y-2">
                  <Label htmlFor="feedback">Feedback</Label>
                  <Textarea
                    id="feedback"
                    value={selectedSession?.feedback || ""}
                    onChange={(e) =>
                      setSelectedSession((prev: any) => ({
                        ...prev,
                        feedback: e.target.value,
                      }))
                    }
                    placeholder="Session feedback..."
                    rows={3}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="p-4 sm:p-6 sticky bottom-0 bg-background z-10 border-t flex flex-col sm:flex-row gap-2 sm:gap-4">
            <Button
              variant="outline"
              onClick={() => setIsEditSessionDialogOpen(false)}
              className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button
              onClick={handleSaveSession}
              className="w-full sm:w-auto h-10 bg-transparent border border-[#EF7B55] text-[#EF7B55] hover:bg-[#F79771] hover:text-white">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Session Dialog */}
      <Dialog
        open={isDeleteSessionDialogOpen}
        onOpenChange={setIsDeleteSessionDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[500px] p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Delete Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this session? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteSessionDialogOpen(false)}
              className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              className="w-full sm:w-auto h-10 bg-red-600 text-white hover:bg-red-700">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4 xs:space-y-6">
        <TabsList className="bg-[#f797712e] text-slate-700 flex flex-col lg:flex-row w-full gap-2 mb-14">
          <TabsTrigger
            className="bg-transparent w-full sm:w-40 justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3"
            value="upcoming">
            Upcoming Sessions
          </TabsTrigger>
          <TabsTrigger
            className="bg-transparent w-full sm:w-40 justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3"
            value="past">
            Past Sessions
          </TabsTrigger>
        </TabsList>

        {/* UPCOMING */}
        <TabsContent value="upcoming" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">
                Upcoming Sessions ({upcomingSessions.length})
              </CardTitle>
              <CardDescription className="text-sm">
                Your scheduled tutoring sessions
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-4">
                {paginatedUpcoming.map((session) => (
                  <div
                    key={session.id}
                    className="p-3 sm:p-4 rounded-lg hover:bg-muted/50 transition-colors">
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
                            onClick={() => handleEditSession(session)}>
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            className="h-8 bg-red-600 hover:bg-red-700"
                            onClick={() => handleDeleteSession(session)}>
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
                              onClick={() => setUpcomingPage(page)}>
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
                    className="p-3 sm:p-4 rounded-lg hover:bg-muted/50 transition-colors">
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
                              {session.materials.map(
                                (material: string, index: number) => (
                                  <Button
                                    key={index}
                                    variant="outline"
                                    size="sm"
                                    className="text-xs h-7">
                                    {material}
                                  </Button>
                                )
                              )}
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
                            onClick={() => handleDeleteSession(session)}>
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
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
                              onClick={() => setPastPage(page)}>
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

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Sessions
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {upcomingSessions.length + pastSessions.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {upcomingSessions.length} upcoming
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

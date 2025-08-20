"use client";

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
import {
  CalendarIcon,
  Clock,
  Video,
  Star,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export function TutoringBooking() {
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);

  const upcomingSessions = [
    {
      id: 1,
      child: "John Adebayo",
      tutor: "Dr. Sarah Wilson",
      subject: "Mathematics",
      date: "2024-01-20",
      time: "2:00 PM - 3:00 PM",
      type: "One-on-One",
      status: "Confirmed",
      meetingLink: "https://meet.techxagon.com/session-123",
      cost: "₦8,000",
      tutorAvatar: "/placeholder.svg?height=40&width=40",
      notes: "Focus on calculus and derivatives",
    },
    {
      id: 2,
      child: "Mary Adebayo",
      subject: "English Literature",
      tutor: "Prof. Michael Johnson",
      date: "2024-01-22",
      time: "4:00 PM - 5:00 PM",
      type: "Group Session",
      status: "Confirmed",
      meetingLink: "https://meet.techxagon.com/session-124",
      cost: "₦5,000",
      tutorAvatar: "/placeholder.svg?height=40&width=40",
      notes: "Shakespeare analysis and essay writing",
    },
    {
      id: 3,
      child: "John Adebayo",
      tutor: "Mrs. Adebayo Funmi",
      subject: "Physics",
      date: "2024-01-25",
      time: "3:00 PM - 4:00 PM",
      type: "One-on-One",
      status: "Pending",
      meetingLink: null,
      cost: "₦8,000",
      tutorAvatar: "/placeholder.svg?height=40&width=40",
      notes: "Mechanics and motion problems",
    },
  ];

  const pastSessions = [
    {
      id: 4,
      child: "John Adebayo",
      tutor: "Dr. Sarah Wilson",
      subject: "Mathematics",
      date: "2024-01-15",
      time: "2:00 PM - 3:00 PM",
      type: "One-on-One",
      status: "Completed",
      rating: 5,
      feedback:
        "Excellent session! John showed great improvement in understanding calculus concepts.",
      cost: "₦8,000",
      tutorAvatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 5,
      child: "Mary Adebayo",
      tutor: "Prof. Michael Johnson",
      subject: "English Literature",
      date: "2024-01-12",
      time: "4:00 PM - 5:00 PM",
      type: "Group Session",
      status: "Completed",
      rating: 4,
      feedback:
        "Good session on poetry analysis. Mary participated well in discussions.",
      cost: "₦5,000",
      tutorAvatar: "/placeholder.svg?height=40&width=40",
    },
  ];

  const availableTutors = [
    {
      id: 1,
      name: "Dr. Sarah Wilson",
      subjects: ["Mathematics", "Physics"],
      rating: 4.9,
      experience: "10+ years",
      rate: "₦8,000/hour",
      avatar: "/placeholder.svg?height=40&width=40",
      availability: "Mon-Fri: 2PM-6PM",
      specialization: "Advanced Mathematics, Calculus",
    },
    {
      id: 2,
      name: "Prof. Michael Johnson",
      subjects: ["English Literature", "Essay Writing"],
      rating: 4.8,
      experience: "15+ years",
      rate: "₦7,500/hour",
      avatar: "/placeholder.svg?height=40&width=40",
      availability: "Mon-Sat: 3PM-7PM",
      specialization: "Literature Analysis, Creative Writing",
    },
    {
      id: 3,
      name: "Mrs. Adebayo Funmi",
      subjects: ["Physics", "Chemistry"],
      rating: 4.7,
      experience: "8+ years",
      rate: "₦7,000/hour",
      avatar: "/placeholder.svg?height=40&width=40",
      availability: "Tue-Sat: 1PM-5PM",
      specialization: "Science Fundamentals, Lab Work",
    },
  ];

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Private Tutoring Sessions</h1>
          <p className="text-muted-foreground">
            Book and manage one-on-one tutoring for your children
          </p>
        </div>
        <Dialog
          open={isBookingDialogOpen}
          onOpenChange={setIsBookingDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Book New Session
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Book Tutoring Session</DialogTitle>
              <DialogDescription>
                Schedule a private tutoring session for your child
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="select-child">Select Child</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose child" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="john">John Adebayo</SelectItem>
                      <SelectItem value="mary">Mary Adebayo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="select-subject">Subject</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="math">Mathematics</SelectItem>
                      <SelectItem value="physics">Physics</SelectItem>
                      <SelectItem value="chemistry">Chemistry</SelectItem>
                      <SelectItem value="english">
                        English Literature
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="select-tutor">Select Tutor</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose tutor" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTutors.map((tutor) => (
                      <SelectItem key={tutor.id} value={tutor.id.toString()}>
                        {tutor.name} - {tutor.rate} ({tutor.rating}⭐)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="session-date">Preferred Date</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024-01-25">
                        January 25, 2024
                      </SelectItem>
                      <SelectItem value="2024-01-26">
                        January 26, 2024
                      </SelectItem>
                      <SelectItem value="2024-01-27">
                        January 27, 2024
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="session-time">Preferred Time</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2pm">2:00 PM - 3:00 PM</SelectItem>
                      <SelectItem value="3pm">3:00 PM - 4:00 PM</SelectItem>
                      <SelectItem value="4pm">4:00 PM - 5:00 PM</SelectItem>
                      <SelectItem value="5pm">5:00 PM - 6:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="session-type">Session Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose session type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one-on-one">
                      One-on-One (₦8,000/hour)
                    </SelectItem>
                    <SelectItem value="group">
                      Group Session (₦5,000/hour)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="session-notes">Special Notes (Optional)</Label>
                <Textarea
                  id="session-notes"
                  placeholder="Any specific topics or areas to focus on..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsBookingDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsBookingDialogOpen(false)}>
                Book Session
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Upcoming Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Sessions</CardTitle>
          <CardDescription>Your scheduled tutoring sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingSessions.map((session) => (
              <div
                key={session.id}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <Avatar>
                      <AvatarImage
                        src={session.tutorAvatar || "/placeholder.svg"}
                      />
                      <AvatarFallback>
                        {session.tutor
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <div>
                        <h4 className="font-semibold">
                          {session.subject} Tutoring
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {session.tutor} • {session.child}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          {session.date}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {session.time}
                        </div>
                        <Badge variant="outline">{session.type}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {session.notes}
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="font-medium text-green-600">
                      {session.cost}
                    </div>
                    {getStatusBadge(session.status)}
                    {/* <div className="flex items-center gap-2">
                      {session.meetingLink && (
                        <Button size="sm" className="flex items-center gap-1">
                          <Video className="h-3 w-3" />
                          Join
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 bg-transparent">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div> */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Available Tutors */}
      <Card>
        <CardHeader>
          <CardTitle>Available Tutors</CardTitle>
          <CardDescription>
            Browse and select from our qualified tutors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availableTutors.map((tutor) => (
              <div key={tutor.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={tutor.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {tutor.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">{tutor.name}</h4>
                    <div className="flex items-center gap-1">
                      {renderStars(Math.floor(tutor.rating))}
                      <span className="text-sm text-muted-foreground ml-1">
                        {tutor.rating}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Subjects:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {tutor.subjects.map((subject, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Experience:</span>{" "}
                    {tutor.experience}
                  </div>
                  <div>
                    <span className="font-medium">Rate:</span> {tutor.rate}
                  </div>
                  <div>
                    <span className="font-medium">Available:</span>{" "}
                    {tutor.availability}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {tutor.specialization}
                  </div>
                </div>
                <Button className="w-full" size="sm">
                  Book Session
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Past Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Past Sessions</CardTitle>
          <CardDescription>
            History of completed tutoring sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pastSessions.map((session) => (
              <div key={session.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <Avatar>
                      <AvatarImage
                        src={session.tutorAvatar || "/placeholder.svg"}
                      />
                      <AvatarFallback>
                        {session.tutor
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <div>
                        <h4 className="font-semibold">
                          {session.subject} Tutoring
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {session.tutor} • {session.child}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          {session.date}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {session.time}
                        </div>
                        <Badge variant="outline">{session.type}</Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        {renderStars(session.rating)}
                        <span className="text-sm text-muted-foreground ml-1">
                          ({session.rating}/5)
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground italic">
                        "{session.feedback}"
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="font-medium text-green-600">
                      {session.cost}
                    </div>
                    {getStatusBadge(session.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

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
import {Plus, Search, Calendar, DollarSign, Clock} from "lucide-react";
import {BookTutoringModal} from "@/components/admin/modals/book-tutoring-modal";

export default function TutoringPage() {
  const [bookingTutor, setBookingTutor] = useState<any>(null);

  const bookings = [
    {
      id: 1,
      teacher: "Dr. Robert Smith",
      student: "John Doe",
      subject: "Mathematics",
      scheduledAt: "2024-03-20T15:00:00",
      duration: 60,
      price: 50,
      status: "confirmed",
    },
    {
      id: 2,
      teacher: "Prof. Maria Garcia",
      student: "Jane Smith",
      subject: "Physics",
      scheduledAt: "2024-03-21T10:00:00",
      duration: 90,
      price: 75,
      status: "pending",
    },
    {
      id: 3,
      teacher: "Dr. James Wilson",
      student: "Mike Johnson",
      subject: "English",
      scheduledAt: "2024-03-19T14:00:00",
      duration: 60,
      price: 50,
      status: "completed",
    },
    {
      id: 4,
      teacher: "Mr. David Lee",
      student: "Sarah Williams",
      subject: "Computer Science",
      scheduledAt: "2024-03-22T16:00:00",
      duration: 120,
      price: 100,
      status: "confirmed",
    },
    {
      id: 5,
      teacher: "Ms. Lisa Anderson",
      student: "Tom Brown",
      subject: "History",
      scheduledAt: "2024-03-23T11:00:00",
      duration: 60,
      price: 50,
      status: "pending",
    },
  ];

  const tutors = [
    {
      id: 1,
      name: "Dr. Robert Smith",
      specialties: ["Mathematics", "Physics"],
      rate: 50,
      experience: 15,
      bookings: 45,
      rating: 4.9,
    },
    {
      id: 2,
      name: "Prof. Maria Garcia",
      specialties: ["Chemistry", "Biology"],
      rate: 55,
      experience: 12,
      bookings: 38,
      rating: 4.8,
    },
    {
      id: 3,
      name: "Dr. James Wilson",
      specialties: ["English", "Literature"],
      rate: 45,
      experience: 10,
      bookings: 52,
      rating: 4.9,
    },
    {
      id: 4,
      name: "Mr. David Lee",
      specialties: ["Computer Science"],
      rate: 60,
      experience: 6,
      bookings: 29,
      rating: 4.7,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
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

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Private Tutoring
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage one-on-one tutoring sessions
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Booking
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">342</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Tutors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">24</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">67</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">$3,850</div>
            </CardContent>
          </Card>
        </div>

        {/* Two Column Layout */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Bookings */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Bookings</CardTitle>
                  <CardDescription>Latest tutoring sessions</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-start justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <div className="flex items-start gap-3 flex-1">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={`/.jpg?height=40&width=40&query=${booking.teacher}`}
                        />
                        <AvatarFallback>
                          {booking.teacher
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {booking.teacher}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          with {booking.student}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {new Date(booking.scheduledAt).toLocaleDateString()}
                          </span>
                          <Clock className="h-3 w-3 ml-1" />
                          <span>{booking.duration}m</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge
                        variant={getStatusColor(booking.status)}
                        className="capitalize text-xs">
                        {booking.status}
                      </Badge>
                      <span className="text-sm font-semibold text-foreground">
                        ${booking.price}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Available Tutors */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Available Tutors</CardTitle>
                  <CardDescription>Browse tutoring specialists</CardDescription>
                </div>
                <div className="relative w-48">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search..." className="pl-9 h-9" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tutors.map((tutor) => (
                  <div
                    key={tutor.id}
                    className="flex items-start justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <div className="flex items-start gap-3 flex-1">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={`/.jpg?height=40&width=40&query=${tutor.name}`}
                        />
                        <AvatarFallback>
                          {tutor.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {tutor.name}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {tutor.specialties.map((specialty) => (
                            <Badge
                              key={specialty}
                              variant="secondary"
                              className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {tutor.experience} years exp
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-semibold text-foreground">
                          {tutor.rate}/hr
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-1 bg-transparent"
                        onClick={() => setBookingTutor(tutor)}>
                        Book
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Book Tutoring Modal */}
      <BookTutoringModal
        open={!!bookingTutor}
        onOpenChange={(open) => !open && setBookingTutor(null)}
        tutor={bookingTutor}
      />
    </>
  );
}

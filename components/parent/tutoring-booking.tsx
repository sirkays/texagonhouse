"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  CreditCard,
  Bell,
  Calendar,
  Users,
  BookOpen,
  PlayCircle,
  Download,
  MessageSquare,
  Shield,
  Zap,
} from "lucide-react"

export function TutoringBooking() {
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false)
  const [selectedTutor, setSelectedTutor] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState("upcoming")

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
      hasRecording: false,
      canReschedule: true,
      paymentStatus: "Paid",
      sessionType: "Premium",
      duration: 60,
      reminderSent: true,
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
      hasRecording: false,
      canReschedule: true,
      paymentStatus: "Paid",
      sessionType: "Standard",
      duration: 60,
      reminderSent: true,
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
      hasRecording: false,
      canReschedule: true,
      paymentStatus: "Pending",
      sessionType: "Premium",
      duration: 60,
      reminderSent: false,
    },
  ]

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
      feedback: "Excellent session! John showed great improvement in understanding calculus concepts.",
      cost: "₦8,000",
      tutorAvatar: "/placeholder.svg?height=40&width=40",
      hasRecording: true,
      recordingUrl: "https://recordings.techxagon.com/session-4",
      materials: ["Calculus_Notes.pdf", "Practice_Problems.pdf"],
      sessionType: "Premium",
      duration: 60,
      actualDuration: 58,
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
      feedback: "Good session on poetry analysis. Mary participated well in discussions.",
      cost: "₦5,000",
      tutorAvatar: "/placeholder.svg?height=40&width=40",
      hasRecording: true,
      recordingUrl: "https://recordings.techxagon.com/session-5",
      materials: ["Poetry_Analysis_Guide.pdf"],
      sessionType: "Standard",
      duration: 60,
      actualDuration: 62,
    },
  ]

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
      totalSessions: 1247,
      responseTime: "< 2 hours",
      languages: ["English", "Yoruba"],
      verified: true,
      premiumTutor: true,
      sessionTypes: ["One-on-One", "Group", "Intensive"],
      technologies: ["Interactive Whiteboard", "Screen Sharing", "Recording"],
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
      totalSessions: 892,
      responseTime: "< 4 hours",
      languages: ["English"],
      verified: true,
      premiumTutor: false,
      sessionTypes: ["One-on-One", "Group"],
      technologies: ["Screen Sharing", "Recording"],
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
      totalSessions: 634,
      responseTime: "< 6 hours",
      languages: ["English", "Yoruba", "Igbo"],
      verified: true,
      premiumTutor: false,
      sessionTypes: ["One-on-One"],
      technologies: ["Interactive Whiteboard", "Screen Sharing"],
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Confirmed":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Confirmed
          </Badge>
        )
      case "Pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case "Completed":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        )
      case "Cancelled":
        return (
          <Badge className="bg-red-100 text-red-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Cancelled
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "Paid":
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>
      case "Pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "Failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-3 w-3 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Private Tutoring Sessions</h1>
          <p className="text-muted-foreground">Book and manage premium one-on-one tutoring with expert educators</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2 bg-transparent">
            <Calendar className="h-4 w-4" />
            View Calendar
          </Button>
          <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Book New Session
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px]">
              <DialogHeader>
                <DialogTitle>Book Premium Tutoring Session</DialogTitle>
                <DialogDescription>
                  Schedule a personalized tutoring session with our expert educators
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
                        <SelectItem value="john">John Adebayo (SS3)</SelectItem>
                        <SelectItem value="mary">Mary Adebayo (SS1)</SelectItem>
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
                        <SelectItem value="english">English Literature</SelectItem>
                        <SelectItem value="biology">Biology</SelectItem>
                        <SelectItem value="economics">Economics</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="select-tutor">Select Tutor</Label>
                  <Select onValueChange={(value) => setSelectedTutor(Number(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose tutor" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTutors.map((tutor) => (
                        <SelectItem key={tutor.id} value={tutor.id.toString()}>
                          <div className="flex items-center gap-2">
                            {tutor.premiumTutor && <Zap className="h-3 w-3 text-yellow-500" />}
                            {tutor.verified && <Shield className="h-3 w-3 text-blue-500" />}
                            {tutor.name} - {tutor.rate} ({tutor.rating}⭐)
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedTutor && (
                    <div className="p-3 bg-muted rounded-lg text-sm">
                      {(() => {
                        const tutor = availableTutors.find((t) => t.id === selectedTutor)
                        return tutor ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{tutor.name}</span>
                              {tutor.premiumTutor && <Badge className="bg-yellow-100 text-yellow-800">Premium</Badge>}
                              {tutor.verified && <Badge className="bg-blue-100 text-blue-800">Verified</Badge>}
                            </div>
                            <p>
                              Experience: {tutor.experience} • {tutor.totalSessions} sessions completed
                            </p>
                            <p>
                              Response time: {tutor.responseTime} • Languages: {tutor.languages.join(", ")}
                            </p>
                            <p>Technologies: {tutor.technologies.join(", ")}</p>
                          </div>
                        ) : null
                      })()}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="session-date">Preferred Date</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select date" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024-01-25">January 25, 2024</SelectItem>
                        <SelectItem value="2024-01-26">January 26, 2024</SelectItem>
                        <SelectItem value="2024-01-27">January 27, 2024</SelectItem>
                        <SelectItem value="2024-01-28">January 28, 2024</SelectItem>
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
                  <div className="space-y-2">
                    <Label htmlFor="session-duration">Duration</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
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
                      <SelectItem value="one-on-one">One-on-One (₦8,000/hour)</SelectItem>
                      <SelectItem value="group">Group Session (₦5,000/hour)</SelectItem>
                      <SelectItem value="intensive">Intensive Session (₦12,000/hour)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="session-notes">Learning Objectives & Notes</Label>
                  <Textarea
                    id="session-notes"
                    placeholder="Specific topics to focus on, learning goals, areas of difficulty..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment-method">Payment Method</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="card">Credit/Debit Card</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="wallet">Digital Wallet</SelectItem>
                      <SelectItem value="bnpl">Buy Now Pay Later</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Session Features:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• HD video calling with screen sharing</li>
                    <li>• Interactive whiteboard and drawing tools</li>
                    <li>• Session recording for later review</li>
                    <li>• Real-time chat and file sharing</li>
                    <li>• Post-session materials and homework</li>
                    <li>• Progress tracking and feedback</li>
                  </ul>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsBookingDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsBookingDialogOpen(false)}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Book & Pay Session
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">Upcoming Sessions</TabsTrigger>
          <TabsTrigger value="past">Past Sessions</TabsTrigger>
          <TabsTrigger value="tutors">Find Tutors</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Sessions ({upcomingSessions.length})</CardTitle>
              <CardDescription>Your scheduled tutoring sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div key={session.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={session.tutorAvatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {session.tutor
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-2 flex-1">
                          <div>
                            <h4 className="font-semibold text-lg">{session.subject} Tutoring</h4>
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
                              {session.time} ({session.duration}min)
                            </div>
                            <Badge variant="outline">{session.type}</Badge>
                            <Badge
                              className={
                                session.sessionType === "Premium"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                              }
                            >
                              {session.sessionType}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">{session.notes}</div>
                          <div className="flex items-center gap-2">
                            {session.reminderSent && (
                              <Badge variant="outline" className="text-xs">
                                <Bell className="h-3 w-3 mr-1" />
                                Reminder sent
                              </Badge>
                            )}
                            {getPaymentStatusBadge(session.paymentStatus)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="font-medium text-green-600 text-lg">{session.cost}</div>
                        {getStatusBadge(session.status)}
                        <div className="flex items-center gap-2">
                          {session.meetingLink && (
                            <Button size="sm" className="flex items-center gap-1">
                              <Video className="h-3 w-3" />
                              Join Session
                            </Button>
                          )}
                          {session.canReschedule && (
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 bg-transparent"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="past" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Past Sessions ({pastSessions.length})</CardTitle>
              <CardDescription>History of completed tutoring sessions with recordings and materials</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pastSessions.map((session) => (
                  <div key={session.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={session.tutorAvatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {session.tutor
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-2 flex-1">
                          <div>
                            <h4 className="font-semibold text-lg">{session.subject} Tutoring</h4>
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
                              {session.time} ({session.actualDuration}min)
                            </div>
                            <Badge variant="outline">{session.type}</Badge>
                            <Badge
                              className={
                                session.sessionType === "Premium"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                              }
                            >
                              {session.sessionType}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            {renderStars(session.rating)}
                            <span className="text-sm text-muted-foreground ml-1">({session.rating}/5)</span>
                          </div>
                          <div className="text-sm text-muted-foreground italic">"{session.feedback}"</div>
                          {(session.hasRecording || session.materials) && (
                            <div className="flex items-center gap-2 pt-2">
                              {session.hasRecording && (
                                <Button variant="outline" size="sm" className="flex items-center gap-1 bg-transparent">
                                  <PlayCircle className="h-3 w-3" />
                                  Watch Recording
                                </Button>
                              )}
                              {session.materials && session.materials.length > 0 && (
                                <Button variant="outline" size="sm" className="flex items-center gap-1 bg-transparent">
                                  <Download className="h-3 w-3" />
                                  Materials ({session.materials.length})
                                </Button>
                              )}
                              <Button variant="outline" size="sm" className="flex items-center gap-1 bg-transparent">
                                <MessageSquare className="h-3 w-3" />
                                Feedback
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="font-medium text-green-600 text-lg">{session.cost}</div>
                        {getStatusBadge(session.status)}
                        <Button variant="outline" size="sm">
                          Book Again
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tutors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Expert Tutors ({availableTutors.length})</CardTitle>
              <CardDescription>Browse and select from our verified expert educators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {availableTutors.map((tutor) => (
                  <div key={tutor.id} className="p-4 border rounded-lg space-y-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={tutor.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {tutor.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{tutor.name}</h4>
                          {tutor.verified && <Shield className="h-4 w-4 text-blue-500" />}
                          {tutor.premiumTutor && <Zap className="h-4 w-4 text-yellow-500" />}
                        </div>
                        <div className="flex items-center gap-1">
                          {renderStars(Math.floor(tutor.rating))}
                          <span className="text-sm text-muted-foreground ml-1">
                            {tutor.rating} ({tutor.totalSessions} sessions)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-medium">Subjects:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {tutor.subjects.map((subject, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {subject}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="font-medium">Experience:</span>
                          <div>{tutor.experience}</div>
                        </div>
                        <div>
                          <span className="font-medium">Rate:</span>
                          <div className="text-green-600 font-medium">{tutor.rate}</div>
                        </div>
                      </div>

                      <div>
                        <span className="font-medium">Response time:</span> {tutor.responseTime}
                      </div>

                      <div>
                        <span className="font-medium">Languages:</span> {tutor.languages.join(", ")}
                      </div>

                      <div>
                        <span className="font-medium">Available:</span>
                        <div>{tutor.availability}</div>
                      </div>

                      <div>
                        <span className="font-medium">Session Types:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {tutor.sessionTypes.map((type, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium">Technologies:</span> {tutor.technologies.join(", ")}
                      </div>

                      <div className="text-xs text-muted-foreground">{tutor.specialization}</div>
                    </div>

                    <div className="flex gap-2">
                      <Button className="flex-1" size="sm">
                        <Video className="h-3 w-3 mr-1" />
                        Book Session
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-4">
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
            <CardTitle className="text-sm font-medium">Hours Completed</CardTitle>
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
              {(pastSessions.reduce((sum, session) => sum + session.rating, 0) / pastSessions.length).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">From {pastSessions.length} sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tutors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableTutors.length}</div>
            <p className="text-xs text-muted-foreground">Available now</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

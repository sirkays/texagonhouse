"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Video,
  CalendarIcon,
  Clock,
  Users,
  Settings,
  Plus,
  Edit,
  Trash2,
  Play,
  Mic,
  Camera,
  Share,
  MessageSquare,
  UserPlus,
  MicOff,
  VideoOff,
  Send,
  Monitor,
  Square,
  Chrome,
  X,
  Smile,
  Paperclip,
} from "lucide-react"

export function LiveSessionManager() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<any>(null)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isScreenShareOpen, setIsScreenShareOpen] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOn, setIsCameraOn] = useState(true)
  const [isSessionStarted, setIsSessionStarted] = useState(false)
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: "Teacher", message: "Welcome to the session!", time: "10:00 AM", isTeacher: true },
    { id: 2, user: "John Smith", message: "Thank you! Can you hear us clearly?", time: "10:01 AM", isTeacher: false },
    { id: 3, user: "Sarah Johnson", message: "The video quality looks great!", time: "10:02 AM", isTeacher: false },
    { id: 4, user: "Mike Chen", message: "Looking forward to today's lesson", time: "10:03 AM", isTeacher: false },
  ])
  const [newMessage, setNewMessage] = useState("")
  const [participants] = useState([
    { id: 1, name: "John Smith", status: "online" },
    { id: 2, name: "Sarah Johnson", status: "online" },
    { id: 3, name: "Mike Chen", status: "online" },
    { id: 4, name: "Emma Davis", status: "away" },
  ])

  const videoRef = useRef<HTMLVideoElement>(null)
  const screenShareRef = useRef<HTMLVideoElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])

  const [sessions, setSessions] = useState([
    {
      id: 1,
      title: "Advanced React Patterns",
      date: "2024-01-15",
      time: "14:00",
      duration: 60,
      students: 25,
      status: "scheduled",
      description: "Deep dive into advanced React patterns and best practices",
    },
    {
      id: 2,
      title: "Python Data Analysis",
      date: "2024-01-16",
      time: "10:00",
      duration: 90,
      students: 18,
      status: "live",
      description: "Hands-on session with pandas and matplotlib",
    },
    {
      id: 3,
      title: "JavaScript Fundamentals Q&A",
      date: "2024-01-14",
      time: "16:00",
      duration: 45,
      students: 32,
      status: "completed",
      description: "Q&A session covering JavaScript basics",
    },
  ])

  const [newSession, setNewSession] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    duration: 60,
    maxStudents: 30,
    subject: "",
  })

  const handleNewSession = () => {
    const session = {
      id: sessions.length + 1,
      title: newSession.title,
      date: newSession.date,
      time: newSession.time,
      duration: newSession.duration,
      students: 0,
      status: "scheduled",
      description: newSession.description,
    }
    setSessions([...sessions, session])
    setNewSession({
      title: "",
      description: "",
      date: "",
      time: "",
      duration: 60,
      maxStudents: 30,
      subject: "",
    })
    alert("New session created successfully!")
  }

  const handleEditSession = (session: any) => {
    setSelectedSession(session)
    setIsEditDialogOpen(true)
  }

  const handleDeleteSession = (session: any) => {
    setSelectedSession(session)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    setSessions(sessions.filter((s) => s.id !== selectedSession.id))
    setIsDeleteDialogOpen(false)
    setSelectedSession(null)
    alert("Session deleted successfully!")
  }

  const handleJoinSession = (session: any) => {
    alert(`Joining live session: ${session.title}`)
    // In a real app, this would redirect to the live session room
  }

  const handleSaveDraft = () => {
    localStorage.setItem("sessionDraft", JSON.stringify(newSession))
    alert("Session saved as draft!")
  }

  const handleScheduleSession = () => {
    if (!newSession.title || !newSession.date || !newSession.time) {
      alert("Please fill in all required fields")
      return
    }
    handleNewSession()
  }

  const handleMuteMic = () => {
    setIsMuted(!isMuted)
    if (videoStream) {
      videoStream.getAudioTracks().forEach((track) => {
        track.enabled = isMuted
      })
    }
  }

  const handleCameraToggle = () => {
    setIsCameraOn(!isCameraOn)
    if (videoStream) {
      videoStream.getVideoTracks().forEach((track) => {
        track.enabled = !isCameraOn
      })
    }
  }

  const handleStartSession = async () => {
    if (!isSessionStarted) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        })
        setVideoStream(stream)
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
        setIsSessionStarted(true)
        console.log("[v0] Session started with camera access")
      } catch (error) {
        console.error("[v0] Error accessing camera:", error)
        alert("Could not access camera. Please check permissions.")
      }
    } else {
      // Stop session
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop())
        setVideoStream(null)
      }
      if (isScreenSharing) {
        setIsScreenSharing(false)
      }
      setIsSessionStarted(false)
      console.log("[v0] Session ended")
    }
  }

  const handleShareScreen = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        })
        if (screenShareRef.current) {
          screenShareRef.current.srcObject = screenStream
        }
        setIsScreenSharing(true)
        setIsScreenShareOpen(false)

        // Listen for screen share end
        screenStream.getVideoTracks()[0].addEventListener("ended", () => {
          setIsScreenSharing(false)
        })

        console.log("[v0] Screen sharing started")
      } catch (error) {
        console.error("[v0] Error sharing screen:", error)
        alert("Could not share screen. Please check permissions.")
      }
    } else {
      if (screenShareRef.current?.srcObject) {
        const stream = screenShareRef.current.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
      }
      setIsScreenSharing(false)
      console.log("[v0] Screen sharing stopped")
    }
  }

  const handleOpenChat = () => {
    setIsChatOpen(!isChatOpen)
  }

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: chatMessages.length + 1,
        user: "Teacher",
        message: newMessage,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isTeacher: true,
      }
      setChatMessages([...chatMessages, message])
      setNewMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "bg-red-100 text-red-700"
      case "scheduled":
        return "bg-blue-100 text-blue-700"
      case "completed":
        return "bg-green-100 text-green-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "live":
        return <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
      case "scheduled":
        return <Clock className="h-3 w-3" />
      case "completed":
        return <div className="w-2 h-2 bg-green-500 rounded-full" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Live Session Manager</h1>
        <p className="text-muted-foreground">Schedule and manage live teaching sessions</p>
      </div>

      <Tabs defaultValue="sessions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sessions">My Sessions</TabsTrigger>
          <TabsTrigger value="schedule">Schedule Now</TabsTrigger>
          <TabsTrigger value="live">Live Control</TabsTrigger>
        </TabsList>

        {/* ... existing sessions and schedule tabs code ... */}
        <TabsContent value="sessions" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Session Calendar</CardTitle>
                <CardDescription>View your scheduled sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>Your session overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Scheduled</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">3</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Total Students</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">75</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-purple-600" />
                    <span className="font-medium">Hours This Week</span>
                  </div>
                  <span className="text-2xl font-bold text-purple-600">12</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Upcoming Sessions</CardTitle>
                  <CardDescription>Manage your scheduled live sessions</CardDescription>
                </div>
                <Button onClick={handleNewSession}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Session
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div key={session.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{session.title}</h3>
                          <Badge className={getStatusColor(session.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(session.status)}
                              {session.status}
                            </div>
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{session.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" />
                            {session.date}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {session.time} ({session.duration}min)
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {session.students} students
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {session.status === "live" && (
                          <Button
                            size="sm"
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => handleJoinSession(session)}
                          >
                            <Video className="mr-2 h-3 w-3" />
                            Join Live
                          </Button>
                        )}
                        {session.status === "scheduled" && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => handleEditSession(session)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDeleteSession(session)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Schedule New Session</CardTitle>
              <CardDescription>Create a new live teaching session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="session-title">Session Title</Label>
                  <Input
                    id="session-title"
                    placeholder="Enter session title"
                    value={newSession.title}
                    onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Select
                    value={newSession.subject}
                    onValueChange={(value) => setNewSession({ ...newSession, subject: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="programming">Programming</SelectItem>
                      <SelectItem value="mathematics">Mathematics</SelectItem>
                      <SelectItem value="science">Science</SelectItem>
                      <SelectItem value="language">Language Arts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what will be covered in this session"
                  value={newSession.description}
                  onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newSession.date}
                    onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newSession.time}
                    onChange={(e) => setNewSession({ ...newSession, time: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="60"
                    value={newSession.duration}
                    onChange={(e) => setNewSession({ ...newSession, duration: Number.parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-students">Maximum Students</Label>
                <Input
                  id="max-students"
                  type="number"
                  placeholder="30"
                  value={newSession.maxStudents}
                  onChange={(e) => setNewSession({ ...newSession, maxStudents: Number.parseInt(e.target.value) })}
                />
              </div>

              <div className="flex gap-4">
                <Button variant="outline" className="flex-1 bg-transparent" onClick={handleSaveDraft}>
                  Save Draft
                </Button>
                <Button className="flex-1" onClick={handleScheduleSession}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Schedule Session
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="live" className="space-y-6">
          <div className={`grid gap-6 ${isChatOpen ? "md:grid-cols-3" : "md:grid-cols-1"}`}>
            <div className={isChatOpen ? "md:col-span-2" : "md:col-span-1"}>
              <Card>
                <CardHeader>
                  <CardTitle>Live Session Controls</CardTitle>
                  <CardDescription>Control your live session</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center relative overflow-hidden">
                    {isSessionStarted && videoStream ? (
                      <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center text-white">
                        <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">Your video feed will appear here</p>
                        <p className="text-sm opacity-75">Click "Start Session" to begin</p>
                      </div>
                    )}

                    {/* Screen share overlay */}
                    {isScreenSharing && (
                      <div className="absolute inset-0 bg-black">
                        <video ref={screenShareRef} autoPlay className="w-full h-full object-contain" />
                        <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                          Sharing Screen
                        </div>
                      </div>
                    )}

                    {/* Teacher camera preview when screen sharing */}
                    {isScreenSharing && isSessionStarted && videoStream && (
                      <div className="absolute bottom-4 right-4 w-32 h-24 bg-gray-800 rounded border-2 border-white overflow-hidden">
                        <video
                          autoPlay
                          muted
                          className="w-full h-full object-cover"
                          ref={(el) => {
                            if (el && videoStream) el.srcObject = videoStream
                          }}
                        />
                      </div>
                    )}

                    {/* Session status indicator */}
                    {isSessionStarted && (
                      <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        LIVE
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-center gap-4">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleMuteMic}
                      className={isMuted ? "bg-red-100 text-red-700 border-red-300" : ""}
                    >
                      {isMuted ? <MicOff className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
                      {isMuted ? "Unmute" : "Mute"}
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleCameraToggle}
                      className={!isCameraOn ? "bg-red-100 text-red-700 border-red-300" : ""}
                    >
                      {isCameraOn ? <Camera className="mr-2 h-4 w-4" /> : <VideoOff className="mr-2 h-4 w-4" />}
                      Camera
                    </Button>
                    <Button
                      size="lg"
                      className={isSessionStarted ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
                      onClick={handleStartSession}
                    >
                      <Play className="mr-2 h-4 w-4" />
                      {isSessionStarted ? "End Session" : "Start Session"}
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setIsScreenShareOpen(true)}
                      className={isScreenSharing ? "bg-blue-100 text-blue-700 border-blue-300" : ""}
                    >
                      <Share className="mr-2 h-4 w-4" />
                      {isScreenSharing ? "Stop Share" : "Share Screen"}
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleOpenChat}
                      className={isChatOpen ? "bg-blue-100 text-blue-700 border-blue-300" : ""}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Chat
                    </Button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Session Info</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <Badge className={isSessionStarted ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}>
                            {isSessionStarted ? "Live" : "Not Started"}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Duration:</span>
                          <span>00:00:00</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Participants:</span>
                          <span>{participants.filter((p) => p.status === "online").length} / 30</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Quick Actions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button variant="outline" className="w-full justify-start bg-transparent">
                          <UserPlus className="mr-2 h-4 w-4" />
                          Invite Students
                        </Button>
                        <Button variant="outline" className="w-full justify-start bg-transparent">
                          <Settings className="mr-2 h-4 w-4" />
                          Session Settings
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start bg-transparent"
                          onClick={handleOpenChat}
                        >
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Open Chat Panel
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </div>

            {isChatOpen && (
              <div className="md:col-span-1">
                <Card className="h-[600px] flex flex-col">
                  <CardHeader className="flex-shrink-0 border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Live Chat</CardTitle>
                        <CardDescription>
                          {participants.filter((p) => p.status === "online").length} participants online
                        </CardDescription>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setIsChatOpen(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col p-0">
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4">
                        {chatMessages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.isTeacher ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-lg px-3 py-2 ${
                                message.isTeacher ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                              }`}
                            >
                              {!message.isTeacher && (
                                <div className="text-xs font-medium text-blue-600 mb-1">{message.user}</div>
                              )}
                              <div className="text-sm">{message.message}</div>
                              <div className={`text-xs mt-1 ${message.isTeacher ? "text-blue-100" : "text-gray-500"}`}>
                                {message.time}
                              </div>
                            </div>
                          </div>
                        ))}
                        <div ref={chatEndRef} />
                      </div>
                    </ScrollArea>

                    <div className="border-t p-4">
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <Input
                            placeholder="Type your message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="pr-20"
                          />
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <Smile className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <Paperclip className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <Button onClick={handleSendMessage} size="sm">
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isScreenShareOpen} onOpenChange={setIsScreenShareOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Your Screen</DialogTitle>
            <DialogDescription>Choose what you'd like to share with your students</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <Button
              variant="outline"
              className="h-20 justify-start bg-transparent hover:bg-gray-50"
              onClick={handleShareScreen}
            >
              <div className="flex items-center gap-4">
                <Monitor className="h-8 w-8 text-blue-600" />
                <div className="text-left">
                  <div className="font-medium">Entire Screen</div>
                  <div className="text-sm text-muted-foreground">Share everything on your screen</div>
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-20 justify-start bg-transparent hover:bg-gray-50"
              onClick={handleShareScreen}
            >
              <div className="flex items-center gap-4">
                <Square className="h-8 w-8 text-green-600" />
                <div className="text-left">
                  <div className="font-medium">Application Window</div>
                  <div className="text-sm text-muted-foreground">Share a specific application</div>
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-20 justify-start bg-transparent hover:bg-gray-50"
              onClick={handleShareScreen}
            >
              <div className="flex items-center gap-4">
                <Chrome className="h-8 w-8 text-orange-600" />
                <div className="text-left">
                  <div className="font-medium">Browser Tab</div>
                  <div className="text-sm text-muted-foreground">Share a specific browser tab</div>
                </div>
              </div>
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsScreenShareOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ... existing dialogs ... */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Session</DialogTitle>
            <DialogDescription>Update session details</DialogDescription>
          </DialogHeader>
          {selectedSession && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Session Title</Label>
                <Input defaultValue={selectedSession.title} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea defaultValue={selectedSession.description} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" defaultValue={selectedSession.date} />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input type="time" defaultValue={selectedSession.time} />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setIsEditDialogOpen(false)
                alert("Session updated successfully!")
              }}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this session? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

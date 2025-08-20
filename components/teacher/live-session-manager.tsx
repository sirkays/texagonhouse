"use client"

import { useState } from "react"
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
} from "lucide-react"

export function LiveSessionManager() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
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
          <TabsTrigger value="schedule">Schedule New</TabsTrigger>
          <TabsTrigger value="live">Live Controls</TabsTrigger>
        </TabsList>

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
                <Button>
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
                          <Button size="sm" className="bg-red-600 hover:bg-red-700">
                            <Video className="mr-2 h-3 w-3" />
                            Join Live
                          </Button>
                        )}
                        {session.status === "scheduled" && (
                          <>
                            <Button variant="outline" size="sm">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm">
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
                <Button variant="outline" className="flex-1 bg-transparent">
                  Save Draft
                </Button>
                <Button className="flex-1">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Schedule Session
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="live" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Live Session Controls</CardTitle>
              <CardDescription>Control your live session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center">
                <div className="text-center text-white">
                  <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Your video feed will appear here</p>
                  <p className="text-sm opacity-75">Click "Start Session" to begin</p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4">
                <Button variant="outline" size="lg">
                  <Mic className="mr-2 h-4 w-4" />
                  Mute
                </Button>
                <Button variant="outline" size="lg">
                  <Camera className="mr-2 h-4 w-4" />
                  Camera
                </Button>
                <Button size="lg" className="bg-red-600 hover:bg-red-700">
                  <Play className="mr-2 h-4 w-4" />
                  Start Session
                </Button>
                <Button variant="outline" size="lg">
                  <Share className="mr-2 h-4 w-4" />
                  Share Screen
                </Button>
                <Button variant="outline" size="lg">
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
                      <Badge className="bg-gray-100 text-gray-700">Not Started</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span>00:00:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Participants:</span>
                      <span>0 / 30</span>
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
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Open Chat Panel
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

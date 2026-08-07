"use client";

import type React from "react";

import {useState, useRef, useEffect} from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {Badge} from "@/components/ui/badge";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Calendar} from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {ScrollArea} from "@/components/ui/scroll-area";
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
} from "lucide-react";

export function LiveSessionManager() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isScreenShareOpen, setIsScreenShareOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      user: "Teacher",
      message: "Welcome to the session!",
      time: "10:00 AM",
      isTeacher: true,
    },
    {
      id: 2,
      user: "John Smith",
      message: "Thank you! Can you hear us clearly?",
      time: "10:01 AM",
      isTeacher: false,
    },
    {
      id: 3,
      user: "Sarah Johnson",
      message: "The video quality looks great!",
      time: "10:02 AM",
      isTeacher: false,
    },
    {
      id: 4,
      user: "Mike Chen",
      message: "Looking forward to today's lesson",
      time: "10:03 AM",
      isTeacher: false,
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [participants] = useState([
    {id: 1, name: "John Smith", status: "online"},
    {id: 2, name: "Sarah Johnson", status: "online"},
    {id: 3, name: "Mike Chen", status: "online"},
    {id: 4, name: "Emma Davis", status: "away"},
  ]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const screenShareRef = useRef<HTMLVideoElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({behavior: "smooth"});
  }, [chatMessages]);

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
  ]);

  const [newSession, setNewSession] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    duration: 60,
    maxStudents: 30,
    subject: "",
  });

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
    };
    setSessions([...sessions, session]);
    setNewSession({
      title: "",
      description: "",
      date: "",
      time: "",
      duration: 60,
      maxStudents: 30,
      subject: "",
    });
    alert("New session created successfully!");
  };

  const handleEditSession = (session: any) => {
    setSelectedSession(session);
    setIsEditDialogOpen(true);
  };

  const handleDeleteSession = (session: any) => {
    setSelectedSession(session);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    setSessions(sessions.filter((s) => s.id !== selectedSession.id));
    setIsDeleteDialogOpen(false);
    setSelectedSession(null);
    alert("Session deleted successfully!");
  };

  const handleJoinSession = (session: any) => {
    alert(`Joining live session: ${session.title}`);
  };

  const handleToggleRoomAccess = (sessionId: number) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === sessionId) {
          const nextState = s.is_room_open === false ? true : false;
          alert(
            nextState
              ? "Room opened. Participants can join."
              : "Room closed. New participants cannot join."
          );
          return { ...s, is_room_open: nextState };
        }
        return s;
      })
    );
  };

  const handleSaveDraft = () => {
    localStorage.setItem("sessionDraft", JSON.stringify(newSession));
    alert("Session saved as draft!");
  };

  const handleScheduleSession = () => {
    if (!newSession.title || !newSession.date || !newSession.time) {
      alert("Please fill in all required fields");
      return;
    }
    handleNewSession();
  };

  const handleMuteMic = () => {
    setIsMuted(!isMuted);
    if (videoStream) {
      videoStream.getAudioTracks().forEach((track) => {
        track.enabled = isMuted;
      });
    }
  };

  const handleCameraToggle = () => {
    setIsCameraOn(!isCameraOn);
    if (videoStream) {
      videoStream.getVideoTracks().forEach((track) => {
        track.enabled = !isCameraOn;
      });
    }
  };

  const handleStartSession = async () => {
    if (!isSessionStarted) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setVideoStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsSessionStarted(true);
      } catch (error) {
        console.error("[v0] Error accessing camera:", error);
        alert("Could not access camera. Please check permissions.");
      }
    } else {
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop());
        setVideoStream(null);
      }
      if (isScreenSharing) {
        setIsScreenSharing(false);
      }
      setIsSessionStarted(false);
    }
  };

  const handleShareScreen = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
        if (screenShareRef.current) {
          screenShareRef.current.srcObject = screenStream;
        }
        setIsScreenSharing(true);
        setIsScreenShareOpen(false);

        screenStream.getVideoTracks()[0].addEventListener("ended", () => {
          setIsScreenSharing(false);
        });
      } catch (error) {
        console.error("[v0] Error sharing screen:", error);
        alert("Could not share screen. Please check permissions.");
      }
    } else {
      if (screenShareRef.current?.srcObject) {
        const stream = screenShareRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
      setIsScreenSharing(false);
    }
  };

  const handleOpenChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: chatMessages.length + 1,
        user: "Teacher",
        message: newMessage,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isTeacher: true,
      };
      setChatMessages([...chatMessages, message]);
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "bg-rose-500/10 text-rose-500 border border-rose-500/20";
      case "scheduled":
        return "bg-amber-500/10 text-amber-500 border border-amber-500/20";
      case "completed":
        return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
      default:
        return "bg-slate-500/10 text-slate-500 border border-slate-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "live":
        return (
          <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 bg-rose-500 rounded-full animate-pulse" />
        );
      case "scheduled":
        return <Clock className="h-2.5 w-2.5 xs:h-3 xs:w-3 text-amber-500" />;
      case "completed":
        return (
          <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 bg-emerald-500 rounded-full" />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1 sm:p-2">
      {/* Premium Hero Header Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-[#e26d47] p-6 sm:p-8 text-white shadow-xl dark:shadow-none mb-6">
        <div className="absolute right-0 top-0 h-64 w-64 -translate-y-12 translate-x-12 rounded-full bg-[#EF7B55]/15 blur-3xl" />
        <div className="absolute left-1/3 bottom-0 h-40 w-40 translate-y-12 rounded-full bg-indigo-500/15 blur-3xl" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <Badge className="bg-[#EF7B55]/20 text-[#ffae91] border border-[#EF7B55]/30 hover:bg-[#EF7B55]/30 px-3 py-1 font-semibold text-xs tracking-wide">
              Live Classroom Manager
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-orange-100 bg-clip-text text-transparent">
              Live Session Manager
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
              Schedule interactive sessions, manage calendar streams, stream real-time lessons, and coordinate chat discussions with students in one unified dashboard.
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="sessions" className="space-y-6">
        <TabsList className="bg-slate-100/50 dark:bg-slate-950/40 border border-slate-200/40 dark:border-slate-800/50 p-1.5 rounded-2xl backdrop-blur-md flex flex-row overflow-x-auto w-full gap-1.5 mb-8 scrollbar-none whitespace-nowrap justify-start md:justify-center">
          <TabsTrigger
            value="sessions"
            className="bg-transparent w-auto px-4 sm:px-6 shrink-0 justify-center py-2.5 text-slate-600 dark:text-slate-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#EF7B55] data-[state=active]:to-[#e26d47] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all duration-300 font-bold gap-3">
            My Sessions
          </TabsTrigger>
          <TabsTrigger
            value="schedule"
            className="bg-transparent w-auto px-4 sm:px-6 shrink-0 justify-center py-2.5 text-slate-600 dark:text-slate-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#EF7B55] data-[state=active]:to-[#e26d47] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all duration-300 font-bold gap-3">
            Schedule Now
          </TabsTrigger>
          <TabsTrigger
            value="live"
            className="bg-transparent w-auto px-4 sm:px-6 shrink-0 justify-center py-2.5 text-slate-600 dark:text-slate-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#EF7B55] data-[state=active]:to-[#e26d47] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all duration-300 font-bold gap-3">
            Live Control
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="space-y-6">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <Card className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/60 shadow-lg shadow-slate-100/40 dark:shadow-none rounded-2xl overflow-hidden transition-all duration-300">
              <CardHeader className="text-center sm:text-left">
                <CardTitle className="text-base sm:text-lg md:text-xl">
                  Session Calendar
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm md:text-base">
                  View your scheduled sessions
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="w-full overflow-x-auto">
                  <div className="flex justify-center">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md w-full min-w-[300px] sm:max-w-[400px]"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/60 shadow-lg shadow-slate-100/40 dark:shadow-none rounded-2xl overflow-hidden transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-base xs:text-lg sm:text-xl">
                  Quick Stats
                </CardTitle>
                <CardDescription className="text-xs xs:text-sm sm:text-base">
                  Your session overview
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 xs:p-4 rounded-xl border border-[#EF7B55]/15 bg-[#EF7B55]/5 dark:bg-[#EF7B55]/5 backdrop-blur-sm transition-all duration-300 hover:border-[#EF7B55]/30">
                  <div className="flex items-center gap-2 xs:gap-3">
                    <div className="p-2 rounded-lg bg-[#EF7B55]/10">
                      <CalendarIcon className="h-4 w-4 text-[#EF7B55]" />
                    </div>
                    <span className="font-medium text-xs xs:text-sm sm:text-base text-slate-700 dark:text-slate-200">
                      Scheduled
                    </span>
                  </div>
                  <span className="text-lg xs:text-xl sm:text-2xl font-bold text-[#EF7B55]">
                    3
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 xs:p-4 rounded-xl border border-indigo-500/15 bg-indigo-500/5 dark:bg-indigo-500/5 backdrop-blur-sm transition-all duration-300 hover:border-indigo-500/30">
                  <div className="flex items-center gap-2 xs:gap-3">
                    <div className="p-2 rounded-lg bg-indigo-500/10">
                      <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <span className="font-medium text-xs xs:text-sm sm:text-base text-slate-700 dark:text-slate-200">
                      Total Students
                    </span>
                  </div>
                  <span className="text-lg xs:text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    75
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 xs:p-4 rounded-xl border border-purple-500/15 bg-purple-500/5 dark:bg-purple-500/5 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/30">
                  <div className="flex items-center gap-2 xs:gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="font-medium text-xs xs:text-sm sm:text-base text-slate-700 dark:text-slate-200">
                      Hours This Week
                    </span>
                  </div>
                  <span className="text-lg xs:text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
                    12
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/60 shadow-lg shadow-slate-100/40 dark:shadow-none rounded-2xl overflow-hidden transition-all duration-300">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 xs:gap-4">
                <div>
                  <CardTitle className="text-base xs:text-lg sm:text-xl">
                    Upcoming Sessions
                  </CardTitle>
                  <CardDescription className="text-xs xs:text-sm sm:text-base">
                    Manage your scheduled live sessions
                  </CardDescription>
                </div>
                <Button
                  onClick={handleNewSession}
                  className="text-xs xs:text-sm sm:text-base bg-gradient-to-r from-[#EF7B55] to-[#e26d47] hover:opacity-90 text-white rounded-xl shadow-md font-semibold transition-all duration-300">
                  <Plus className="mr-1 xs:mr-2 h-3.5 w-3.5" />
                  New Session
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 xs:space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="relative overflow-hidden rounded-2xl p-5 sm:p-6 border border-slate-200/50 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/40 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-slate-900/60 transition-all duration-300 shadow-sm pl-6"
                >
                  {/* Left glowing marker based on status */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${
                    session.status === "live"
                      ? "from-rose-500 to-red-600"
                      : session.status === "scheduled"
                      ? "from-amber-400 to-[#EF7B55]"
                      : "from-emerald-400 to-emerald-600"
                  }`} />
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm xs:text-base">
                          {session.title}
                        </h3>
                        <Badge
                          className={`${getStatusColor(
                            session.status
                          )} px-2.5 py-0.5 rounded-full text-xs font-semibold`}>
                          <div className="flex items-center gap-1.5">
                            {getStatusIcon(session.status)}
                            <span className="capitalize">{session.status}</span>
                          </div>
                        </Badge>
                        <Badge
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            (session as any).is_room_open === false
                              ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                              : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                          }`}>
                          {(session as any).is_room_open === false ? "Room Closed" : "Room Open"}
                        </Badge>
                      </div>
                      <p className="text-xs xs:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                        {session.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/60 px-2 py-1 rounded-lg">
                          <CalendarIcon className="h-3.5 w-3.5 text-[#EF7B55]" />
                          {session.date}
                        </div>
                        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/60 px-2 py-1 rounded-lg">
                          <Clock className="h-3.5 w-3.5 text-[#EF7B55]" />
                          {session.time} ({session.duration} min)
                        </div>
                        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/60 px-2 py-1 rounded-lg">
                          <Users className="h-3.5 w-3.5 text-indigo-500" />
                          {session.students} students
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 self-end sm:self-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleRoomAccess(session.id)}
                        className="text-xs border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                        {(session as any).is_room_open === false ? "Open Room" : "Close Room"}
                      </Button>
                      {session.status === "live" && (
                        <Button
                          size="sm"
                          className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold px-4 py-2 flex items-center gap-2 shadow-sm text-xs xs:text-sm"
                          onClick={() => handleJoinSession(session)}>
                          <Video className="h-4 w-4" />
                          Join Live
                        </Button>
                      )}
                      {session.status === "scheduled" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditSession(session)}
                            className="p-2 border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                            <Edit className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteSession(session)}
                            className="p-2 border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                            <Trash2 className="h-4 w-4 text-rose-500" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/60 shadow-lg shadow-slate-100/40 dark:shadow-none rounded-2xl overflow-hidden transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-base xs:text-lg sm:text-xl">
                Schedule New Session
              </CardTitle>
              <CardDescription className="text-xs xs:text-sm sm:text-base">
                Create a new live teaching session
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="session-title"
                    className="text-xs xs:text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">
                    Session Title
                  </Label>
                  <Input
                    id="session-title"
                    placeholder="Enter session title"
                    value={newSession.title}
                    onChange={(e) =>
                      setNewSession({...newSession, title: e.target.value})
                    }
                    className="text-xs xs:text-sm sm:text-base border-slate-200 dark:border-slate-800 focus-visible:ring-[#EF7B55] focus-visible:border-[#EF7B55] rounded-xl bg-slate-50/50 dark:bg-slate-950/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="subject"
                    className="text-xs xs:text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">
                    Subject
                  </Label>
                  <Select
                    value={newSession.subject}
                    onValueChange={(value) =>
                      setNewSession({...newSession, subject: value})
                    }>
                    <SelectTrigger className="text-xs xs:text-sm sm:text-base border-slate-200 dark:border-slate-800 focus:ring-[#EF7B55] focus:border-[#EF7B55] rounded-xl bg-slate-50/50 dark:bg-slate-950/20">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                      <SelectItem
                        value="programming"
                        className="text-xs xs:text-sm sm:text-base rounded-lg">
                        Programming
                      </SelectItem>
                      <SelectItem
                        value="mathematics"
                        className="text-xs xs:text-sm sm:text-base rounded-lg">
                        Mathematics
                      </SelectItem>
                      <SelectItem
                        value="science"
                        className="text-xs xs:text-sm sm:text-base rounded-lg">
                        Science
                      </SelectItem>
                      <SelectItem
                        value="language"
                        className="text-xs xs:text-sm sm:text-base rounded-lg">
                        Language Arts
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="text-xs xs:text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe what will be covered in this session"
                  value={newSession.description}
                  onChange={(e) =>
                    setNewSession({...newSession, description: e.target.value})
                  }
                  rows={3}
                  className="text-xs xs:text-sm sm:text-base border-slate-200 dark:border-slate-800 focus-visible:ring-[#EF7B55] focus-visible:border-[#EF7B55] rounded-xl bg-slate-50/50 dark:bg-slate-950/20"
                />
              </div>

              <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label
                    htmlFor="date"
                    className="text-xs xs:text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">
                    Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={newSession.date}
                    onChange={(e) =>
                      setNewSession({...newSession, date: e.target.value})
                    }
                    className="text-xs xs:text-sm sm:text-base border-slate-200 dark:border-slate-800 focus-visible:ring-[#EF7B55] focus-visible:border-[#EF7B55] rounded-xl bg-slate-50/50 dark:bg-slate-950/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="time"
                    className="text-xs xs:text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">
                    Time
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={newSession.time}
                    onChange={(e) =>
                      setNewSession({...newSession, time: e.target.value})
                    }
                    className="text-xs xs:text-sm sm:text-base border-slate-200 dark:border-slate-800 focus-visible:ring-[#EF7B55] focus-visible:border-[#EF7B55] rounded-xl bg-slate-50/50 dark:bg-slate-950/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="duration"
                    className="text-xs xs:text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">
                    Duration (minutes)
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="60"
                    value={newSession.duration}
                    onChange={(e) =>
                      setNewSession({
                        ...newSession,
                        duration: Number.parseInt(e.target.value),
                      })
                    }
                    className="text-xs xs:text-sm sm:text-base border-slate-200 dark:border-slate-800 focus-visible:ring-[#EF7B55] focus-visible:border-[#EF7B55] rounded-xl bg-slate-50/50 dark:bg-slate-950/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="max-students"
                  className="text-xs xs:text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">
                  Maximum Students
                </Label>
                <Input
                  id="max-students"
                  type="number"
                  placeholder="30"
                  value={newSession.maxStudents}
                  onChange={(e) =>
                    setNewSession({
                      ...newSession,
                      maxStudents: Number.parseInt(e.target.value),
                    })
                  }
                  className="text-xs xs:text-sm sm:text-base border-slate-200 dark:border-slate-800 focus-visible:ring-[#EF7B55] focus-visible:border-[#EF7B55] rounded-xl bg-slate-50/50 dark:bg-slate-950/20"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40 border-slate-200 dark:border-slate-800 rounded-xl font-bold py-2.5 text-xs xs:text-sm sm:text-base transition-all duration-300 text-slate-700 dark:text-slate-300"
                  onClick={handleSaveDraft}>
                  Save Draft
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-[#EF7B55] to-[#e26d47] hover:opacity-90 hover:shadow-lg hover:shadow-[#EF7B55]/20 text-white rounded-xl font-bold py-2.5 text-xs xs:text-sm sm:text-base transition-all duration-300"
                  onClick={handleScheduleSession}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Schedule Session
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="live" className="space-y-6">
          <div
            className={`grid gap-6 ${
              isChatOpen ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1"
            }`}>
            <div className={isChatOpen ? "md:col-span-2" : "col-span-1"}>
              <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/60 shadow-lg shadow-slate-100/40 dark:shadow-none rounded-2xl overflow-hidden transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-base xs:text-lg sm:text-xl">
                    Live Session Controls
                  </CardTitle>
                  <CardDescription className="text-xs xs:text-sm sm:text-base">
                    Control your live session
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 xs:space-y-6">
                  <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center relative overflow-hidden">
                    {isSessionStarted && videoStream ? (
                      <video
                        ref={videoRef}
                        autoPlay
                        muted
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center text-white">
                        <Video className="h-12 w-12 xs:h-16 xs:w-16 mx-auto mb-3 xs:mb-4 opacity-50" />
                        <p className="text-base xs:text-lg sm:text-xl">
                          Your video feed will appear here
                        </p>
                        <p className="text-xs xs:text-sm sm:text-base opacity-75">
                          Click "Start Session" to begin
                        </p>
                      </div>
                    )}

                    {isScreenSharing && (
                      <div className="absolute inset-0 bg-black">
                        <video
                          ref={screenShareRef}
                          autoPlay
                          className="w-full h-full object-contain"
                        />
                        <div className="absolute top-3 xs:top-4 right-3 xs:right-4 bg-red-600 text-white px-2 xs:px-3 py-1 rounded-full text-[0.85rem] xs:text-xs sm:text-sm flex items-center gap-1 xs:gap-2">
                          <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 bg-white rounded-full animate-pulse" />
                          Sharing Screen
                        </div>
                      </div>
                    )}

                    {isScreenSharing && isSessionStarted && videoStream && (
                      <div className="absolute bottom-3 xs:bottom-4 right-3 xs:right-4 w-24 xs:w-32 h-18 xs:h-24 bg-gray-800 rounded border-2 border-white overflow-hidden">
                        <video
                          autoPlay
                          muted
                          className="w-full h-full object-cover"
                          ref={(el) => {
                            if (el && videoStream) el.srcObject = videoStream;
                          }}
                        />
                      </div>
                    )}

                    {isSessionStarted && (
                      <div className="absolute top-3 xs:top-4 left-3 xs:left-4 bg-red-600 text-white px-2 xs:px-3 py-1 rounded-full text-[0.85rem] xs:text-xs sm:text-sm flex items-center gap-1 xs:gap-2">
                        <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 bg-white rounded-full animate-pulse" />
                        LIVE
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap justify-center gap-3">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleMuteMic}
                      className={`rounded-xl border border-slate-200 dark:border-slate-800 font-bold transition-all duration-300 text-xs xs:text-sm sm:text-base ${
                        isMuted 
                          ? "bg-red-500/10 text-red-500 border-red-500/30 hover:bg-red-500/20" 
                          : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                      }`}>
                      {isMuted ? (
                        <MicOff className="mr-2 h-4 w-4" />
                      ) : (
                        <Mic className="mr-2 h-4 w-4" />
                      )}
                      {isMuted ? "Unmute" : "Mute"}
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleCameraToggle}
                      className={`rounded-xl border border-slate-200 dark:border-slate-800 font-bold transition-all duration-300 text-xs xs:text-sm sm:text-base ${
                        !isCameraOn
                          ? "bg-red-500/10 text-red-500 border-red-500/30 hover:bg-red-500/20"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                      }`}>
                      {isCameraOn ? (
                        <Camera className="mr-2 h-4 w-4" />
                      ) : (
                        <VideoOff className="mr-2 h-4 w-4" />
                      )}
                      Camera
                    </Button>
                    <Button
                      size="lg"
                      className={`rounded-xl font-bold text-white transition-all duration-300 text-xs xs:text-sm sm:text-base shadow-md ${
                        isSessionStarted
                          ? "bg-rose-600 hover:bg-rose-700 hover:shadow-rose-600/25"
                          : "bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-600/25"
                      }`}
                      onClick={handleStartSession}>
                      <Play className="mr-2 h-4 w-4" />
                      {isSessionStarted ? "End Session" : "Start Session"}
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setIsScreenShareOpen(true)}
                      className={`rounded-xl border border-slate-200 dark:border-slate-800 font-bold transition-all duration-300 text-xs xs:text-sm sm:text-base ${
                        isScreenSharing
                          ? "bg-blue-500/10 text-blue-600 border-blue-500/30 hover:bg-blue-500/20"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                      }`}>
                      <Share className="mr-2 h-4 w-4" />
                      {isScreenSharing ? "Stop Share" : "Share Screen"}
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleOpenChat}
                      className={`rounded-xl border border-slate-200 dark:border-slate-800 font-bold transition-all duration-300 text-xs xs:text-sm sm:text-base ${
                        isChatOpen
                          ? "bg-[#EF7B55]/10 text-[#EF7B55] border-[#EF7B55]/30 hover:bg-[#EF7B55]/20"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                      }`}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Chat
                    </Button>
                  </div>

                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                    <Card className="bg-white/60 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/60 rounded-2xl shadow-md">
                      <CardHeader>
                        <CardTitle className="text-sm xs:text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
                          Session Info
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between items-center text-xs xs:text-sm text-slate-600 dark:text-slate-400">
                          <span>Status:</span>
                          <Badge
                            className={`${
                              isSessionStarted
                                ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                                : "bg-slate-500/10 text-slate-500 border border-slate-500/20"
                            } text-xs px-2.5 py-0.5 rounded-full font-semibold`}>
                            {isSessionStarted ? "Live" : "Not Started"}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center text-xs xs:text-sm text-slate-600 dark:text-slate-400">
                          <span>Duration:</span>
                          <span className="font-medium">00:00:00</span>
                        </div>
                        <div className="flex justify-between items-center text-xs xs:text-sm text-slate-600 dark:text-slate-400">
                          <span>Participants:</span>
                          <span className="font-semibold text-[#EF7B55]">
                            {
                              participants.filter((p) => p.status === "online")
                                .length
                            }{" "}
                            / 30
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/60 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/60 rounded-2xl shadow-md">
                      <CardHeader>
                        <CardTitle className="text-sm xs:text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
                          Quick Actions
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button
                          variant="outline"
                          className="w-full justify-start bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/50 border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-200 text-xs xs:text-sm sm:text-base">
                          <UserPlus className="mr-2 h-4 w-4 text-[#EF7B55]" />
                          Invite Students
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/50 border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-200 text-xs xs:text-sm sm:text-base">
                          <Settings className="mr-2 h-4 w-4 text-[#EF7B55]" />
                          Session Settings
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/50 border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-200 text-xs xs:text-sm sm:text-base"
                          onClick={handleOpenChat}>
                          <MessageSquare className="mr-2 h-4 w-4 text-[#EF7B55]" />
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
                <Card className="h-[400px] xs:h-[500px] sm:h-[600px] flex flex-col bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/60 rounded-2xl shadow-lg backdrop-blur-md overflow-hidden">
                  <CardHeader className="flex-shrink-0 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm xs:text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
                          Live Chat
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                          {
                            participants.filter((p) => p.status === "online")
                              .length
                          }{" "}
                          participants online
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsChatOpen(false)}
                        className="p-1 xs:p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col p-0 bg-transparent">
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4">
                        {chatMessages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.isTeacher
                                ? "justify-end"
                                : "justify-start"
                            }`}>
                            <div
                              className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs xs:text-sm shadow-sm ${
                                message.isTeacher
                                  ? "bg-gradient-to-r from-[#EF7B55] to-[#e26d47] text-white rounded-tr-none"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-200/20"
                              }`}>
                              {!message.isTeacher && (
                                <div className="text-[0.85rem] xs:text-xs sm:text-sm font-bold text-[#EF7B55] mb-1">
                                  {message.user}
                                </div>
                              )}
                              <div className="leading-relaxed">
                                {message.message}
                              </div>
                              <div
                                className={`text-[0.65rem] mt-1.5 text-right font-medium ${
                                  message.isTeacher
                                    ? "text-orange-100"
                                    : "text-slate-500 dark:text-slate-400"
                                }`}>
                                {message.time}
                              </div>
                            </div>
                          </div>
                        ))}
                        <div ref={chatEndRef} />
                      </div>
                    </ScrollArea>

                    <div className="border-t border-slate-100 dark:border-slate-800 p-4 bg-white/40 dark:bg-slate-900/40">
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <Input
                            placeholder="Type your message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="pr-16 xs:pr-20 text-xs xs:text-sm sm:text-base border-slate-200 dark:border-slate-800 focus-visible:ring-[#EF7B55] rounded-xl bg-slate-50/50 dark:bg-slate-950/20"
                          />
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500">
                              <Smile className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500">
                              <Paperclip className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <Button
                          onClick={handleSendMessage}
                          size="sm"
                          className="p-2 rounded-xl bg-gradient-to-r from-[#EF7B55] to-[#e26d47] hover:opacity-90 text-white shadow-sm flex items-center justify-center h-10 w-10">
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
        <DialogContent className="max-w-[90vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base xs:text-lg sm:text-xl">
              Share Your Screen
            </DialogTitle>
            <DialogDescription className="text-xs xs:text-sm sm:text-base">
              Choose what you'd like to share with your students
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <Button
              variant="outline"
              className="h-20 justify-start bg-transparent border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-xs xs:text-sm sm:text-base rounded-xl"
              onClick={handleShareScreen}>
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-lg bg-blue-500/10">
                  <Monitor className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-slate-800 dark:text-slate-200">Entire Screen</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Share everything on your screen
                  </div>
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-20 justify-start bg-transparent border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-xs xs:text-sm sm:text-base rounded-xl"
              onClick={handleShareScreen}>
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-lg bg-green-500/10">
                  <Square className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-slate-800 dark:text-slate-200">Application Window</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Share a specific application
                  </div>
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-20 justify-start bg-transparent border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-xs xs:text-sm sm:text-base rounded-xl"
              onClick={handleShareScreen}>
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-lg bg-orange-500/10">
                  <Chrome className="h-6 w-6 text-orange-600" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-slate-800 dark:text-slate-200">Browser Tab</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Share a specific browser tab
                  </div>
                </div>
              </div>
            </Button>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsScreenShareOpen(false)}
              className="text-xs xs:text-sm sm:text-base border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base xs:text-lg sm:text-xl">
              Edit Session
            </DialogTitle>
            <DialogDescription className="text-xs xs:text-sm sm:text-base">
              Update session details
            </DialogDescription>
          </DialogHeader>
          {selectedSession && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs xs:text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">
                  Session Title
                </Label>
                <Input
                  defaultValue={selectedSession.title}
                  className="text-xs xs:text-sm sm:text-base border-slate-200 dark:border-slate-800 focus-visible:ring-[#EF7B55] focus-visible:border-[#EF7B55] rounded-xl bg-slate-50/50 dark:bg-slate-950/20"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs xs:text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">
                  Description
                </Label>
                <Textarea
                  defaultValue={selectedSession.description}
                  className="text-xs xs:text-sm sm:text-base border-slate-200 dark:border-slate-800 focus-visible:ring-[#EF7B55] focus-visible:border-[#EF7B55] rounded-xl bg-slate-50/50 dark:bg-slate-950/20"
                />
              </div>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs xs:text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">
                    Date
                  </Label>
                  <Input
                    type="date"
                    defaultValue={selectedSession.date}
                    className="text-xs xs:text-sm sm:text-base border-slate-200 dark:border-slate-800 focus-visible:ring-[#EF7B55] focus-visible:border-[#EF7B55] rounded-xl bg-slate-50/50 dark:bg-slate-950/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs xs:text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">
                    Time
                  </Label>
                  <Input
                    type="time"
                    defaultValue={selectedSession.time}
                    className="text-xs xs:text-sm sm:text-base border-slate-200 dark:border-slate-800 focus-visible:ring-[#EF7B55] focus-visible:border-[#EF7B55] rounded-xl bg-slate-50/50 dark:bg-slate-950/20"
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="text-xs xs:text-sm sm:text-base border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">
              Cancel
            </Button>
            <Button
              onClick={() => {
                setIsEditDialogOpen(false);
                alert("Session updated successfully!");
              }}
              className="text-xs xs:text-sm sm:text-base bg-gradient-to-r from-[#EF7B55] to-[#e26d47] hover:opacity-90 text-white rounded-xl font-bold transition-all duration-300">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base xs:text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100">
              Delete Session
            </DialogTitle>
            <DialogDescription className="text-xs xs:text-sm sm:text-base text-slate-500 dark:text-slate-400">
              Are you sure you want to delete this session? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="text-xs xs:text-sm sm:text-base border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="text-xs xs:text-sm sm:text-base rounded-xl font-bold">
              Delete Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

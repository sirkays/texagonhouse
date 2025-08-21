"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  PlayCircle,
  PauseCircle,
  Square,
  Download,
  Share2,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  Clock,
  Calendar,
  User,
} from "lucide-react"

interface SessionRecording {
  id: string
  title: string
  tutor: string
  student: string
  subject: string
  date: string
  duration: number
  size: string
  quality: "HD" | "SD"
  thumbnail: string
  downloadUrl: string
  shareUrl: string
}

export function SessionRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [selectedRecording, setSelectedRecording] = useState<SessionRecording | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const recordingInterval = useRef<NodeJS.Timeout>()

  const recordings: SessionRecording[] = [
    {
      id: "rec_001",
      title: "Mathematics - Calculus Fundamentals",
      tutor: "Dr. Sarah Wilson",
      student: "John Adebayo",
      subject: "Mathematics",
      date: "2024-01-15",
      duration: 3480, // 58 minutes
      size: "245 MB",
      quality: "HD",
      thumbnail: "/placeholder.svg?height=120&width=200&text=Math+Session",
      downloadUrl: "#",
      shareUrl: "#",
    },
    {
      id: "rec_002",
      title: "English Literature - Poetry Analysis",
      tutor: "Prof. Michael Johnson",
      student: "Mary Adebayo",
      subject: "English Literature",
      date: "2024-01-12",
      duration: 3720, // 62 minutes
      size: "198 MB",
      quality: "HD",
      thumbnail: "/placeholder.svg?height=120&width=200&text=English+Session",
      downloadUrl: "#",
      shareUrl: "#",
    },
    {
      id: "rec_003",
      title: "Physics - Mechanics and Motion",
      tutor: "Mrs. Adebayo Funmi",
      student: "John Adebayo",
      subject: "Physics",
      date: "2024-01-10",
      duration: 3600, // 60 minutes
      size: "312 MB",
      quality: "HD",
      thumbnail: "/placeholder.svg?height=120&width=200&text=Physics+Session",
      downloadUrl: "#",
      shareUrl: "#",
    },
  ]

  useEffect(() => {
    if (isRecording && !isPaused) {
      recordingInterval.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } else {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current)
      }
    }

    return () => {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current)
      }
    }
  }, [isRecording, isPaused])

  const startRecording = () => {
    setIsRecording(true)
    setIsPaused(false)
    setRecordingTime(0)
  }

  const pauseRecording = () => {
    setIsPaused(!isPaused)
  }

  const stopRecording = () => {
    setIsRecording(false)
    setIsPaused(false)
    setRecordingTime(0)
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleVolumeToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleDownload = (recording: SessionRecording) => {
    // Simulate download
    const link = document.createElement("a")
    link.href = recording.downloadUrl
    link.download = `${recording.title}.mp4`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleShare = (recording: SessionRecording) => {
    if (navigator.share) {
      navigator.share({
        title: recording.title,
        text: `Watch this tutoring session: ${recording.title}`,
        url: recording.shareUrl,
      })
    } else {
      navigator.clipboard.writeText(recording.shareUrl)
      alert("Share link copied to clipboard!")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Session Recordings</h1>
          <p className="text-muted-foreground">Record, manage, and review your tutoring sessions</p>
        </div>
      </div>

      {/* Recording Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Live Session Recording</CardTitle>
          <CardDescription>Record your current tutoring session for later review</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {!isRecording ? (
                  <Button onClick={startRecording} className="flex items-center gap-2">
                    <PlayCircle className="h-4 w-4" />
                    Start Recording
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={pauseRecording}
                      variant="outline"
                      className="flex items-center gap-2 bg-transparent"
                    >
                      {isPaused ? (
                        <>
                          <PlayCircle className="h-4 w-4" />
                          Resume
                        </>
                      ) : (
                        <>
                          <PauseCircle className="h-4 w-4" />
                          Pause
                        </>
                      )}
                    </Button>
                    <Button onClick={stopRecording} variant="destructive" className="flex items-center gap-2">
                      <Square className="h-4 w-4" />
                      Stop
                    </Button>
                  </div>
                )}
              </div>

              {isRecording && (
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isPaused ? "bg-yellow-500" : "bg-red-500 animate-pulse"}`} />
                  <span className="font-mono text-lg">{formatTime(recordingTime)}</span>
                  <Badge variant={isPaused ? "secondary" : "destructive"}>{isPaused ? "Paused" : "Recording"}</Badge>
                </div>
              )}
            </div>

            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              <Settings className="h-4 w-4" />
              Recording Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recordings Library */}
      <Card>
        <CardHeader>
          <CardTitle>Recorded Sessions ({recordings.length})</CardTitle>
          <CardDescription>Access your previous session recordings and materials</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recordings.map((recording) => (
              <div key={recording.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative">
                  <img
                    src={recording.thumbnail || "/placeholder.svg"}
                    alt={recording.title}
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          className="flex items-center gap-2"
                          onClick={() => setSelectedRecording(recording)}
                        >
                          <PlayCircle className="h-4 w-4" />
                          Watch
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[800px]">
                        <DialogHeader>
                          <DialogTitle>{recording.title}</DialogTitle>
                          <DialogDescription>
                            {recording.tutor} • {recording.student} • {recording.date}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="relative bg-black rounded-lg overflow-hidden">
                            <video
                              ref={videoRef}
                              className="w-full h-64 object-cover"
                              poster={recording.thumbnail}
                              onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                              onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                            >
                              <source src="/placeholder-video.mp4" type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                              <div className="flex items-center gap-4">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={handlePlayPause}
                                  className="text-white hover:bg-white/20"
                                >
                                  {isPlaying ? <PauseCircle className="h-5 w-5" /> : <PlayCircle className="h-5 w-5" />}
                                </Button>
                                <div className="flex-1">
                                  <Progress value={(currentTime / duration) * 100} className="h-1" />
                                </div>
                                <span className="text-white text-sm font-mono">
                                  {formatTime(Math.floor(currentTime))} / {formatTime(Math.floor(duration))}
                                </span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={handleVolumeToggle}
                                  className="text-white hover:bg-white/20"
                                >
                                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                                </Button>
                                <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                                  <Maximize className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <Badge className="absolute top-2 right-2 bg-black/80 text-white">{recording.quality}</Badge>
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                    {formatTime(recording.duration)}
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <h4 className="font-semibold line-clamp-2">{recording.title}</h4>
                    <p className="text-sm text-muted-foreground">{recording.subject}</p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3" />
                      <span>{recording.tutor}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      <span>{recording.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      <span>
                        {formatTime(recording.duration)} • {recording.size}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Button size="sm" variant="outline" onClick={() => handleDownload(recording)} className="flex-1">
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleShare(recording)}>
                      <Share2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recording Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recordings</CardTitle>
            <PlayCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recordings.length}</div>
            <p className="text-xs text-muted-foreground">Available for review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor(recordings.reduce((sum, rec) => sum + rec.duration, 0) / 3600)}h
            </div>
            <p className="text-xs text-muted-foreground">Of recorded content</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">755 MB</div>
            <p className="text-xs text-muted-foreground">Of 5 GB available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">HD Quality</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100%</div>
            <p className="text-xs text-muted-foreground">Of recordings in HD</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

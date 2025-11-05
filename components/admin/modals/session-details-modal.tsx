"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Clock, Users, Video, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SessionDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  session: any
}

export function SessionDetailsModal({ open, onOpenChange, session }: SessionDetailsModalProps) {
  const { toast } = useToast()

  if (!session) return null

  const handleJoinSession = () => {
    toast({ title: "Joining Session", description: "Connecting to live session..." })
    setTimeout(() => {
      window.open("https://meet.example.com/session-" + session.id, "_blank")
    }, 1000)
  }

  const handleViewRecording = () => {
    toast({ title: "Loading Recording", description: "Opening session recording..." })
    setTimeout(() => {
      window.open("https://recordings.example.com/session-" + session.id, "_blank")
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">{session.title}</DialogTitle>
              <DialogDescription className="mt-2">
                <Badge variant={session.status === "started" ? "default" : "secondary"} className="capitalize">
                  {session.status === "started" && (
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse mr-1" />
                  )}
                  {session.status}
                </Badge>
              </DialogDescription>
            </div>
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Video className="h-6 w-6 text-primary" />
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Course Info */}
          <div className="p-4 rounded-lg bg-muted">
            <p className="text-sm text-muted-foreground mb-1">Course</p>
            <p className="font-semibold text-lg">{session.course}</p>
          </div>

          {/* Host Info */}
          <div className="flex items-center gap-4 p-4 rounded-lg border">
            <Avatar className="h-12 w-12">
              <AvatarImage src={`/.jpg?height=48&width=48&query=${session.host}`} />
              <AvatarFallback>
                {session.host
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm text-muted-foreground">Hosted by</p>
              <p className="font-semibold">{session.host}</p>
            </div>
          </div>

          {/* Session Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Date & Time</span>
              </div>
              <p className="font-medium">{new Date(session.scheduledAt).toLocaleDateString()}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(session.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Duration</span>
              </div>
              <p className="font-medium">{session.duration} minutes</p>
            </div>
          </div>

          {/* Participants */}
          <div className="p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">Participants</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{session.participants}</span>
                <span className="text-muted-foreground">/ {session.maxParticipants}</span>
              </div>
              <Badge variant="secondary">
                {Math.round((session.participants / session.maxParticipants) * 100)}% Full
              </Badge>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden mt-3">
              <div
                className="h-full bg-primary"
                style={{ width: `${(session.participants / session.maxParticipants) * 100}%` }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {session.status === "started" && (
              <Button className="flex-1" onClick={handleJoinSession}>
                <Video className="mr-2 h-4 w-4" />
                Join Session
              </Button>
            )}
            {session.status === "completed" && (
              <Button className="flex-1 bg-transparent" variant="outline" onClick={handleViewRecording}>
                <Download className="mr-2 h-4 w-4" />
                View Recording
              </Button>
            )}
            {session.status === "pending" && (
              <Button className="flex-1 bg-transparent" variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Add to Calendar
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

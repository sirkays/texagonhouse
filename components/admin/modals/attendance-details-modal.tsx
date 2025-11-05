"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCircle, XCircle, Calendar, Clock } from "lucide-react"

interface AttendanceDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  session: any
}

export function AttendanceDetailsModal({ open, onOpenChange, session }: AttendanceDetailsModalProps) {
  if (!session) return null

  const attendanceRecords = [
    { id: 1, name: "John Doe", status: "present", time: "09:00 AM" },
    { id: 2, name: "Jane Smith", status: "present", time: "09:02 AM" },
    { id: 3, name: "Mike Johnson", status: "absent", time: null },
    { id: 4, name: "Sarah Williams", status: "present", time: "09:05 AM" },
    { id: 5, name: "Tom Brown", status: "present", time: "09:01 AM" },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{session.course}</DialogTitle>
          <DialogDescription>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1 text-sm">
                <Calendar className="h-4 w-4" />
                <span>{session.date}</span>
              </div>
              <Badge variant="secondary">{session.classroom}</Badge>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border text-center">
              <p className="text-2xl font-bold text-foreground">{session.total}</p>
              <p className="text-sm text-muted-foreground">Total Students</p>
            </div>
            <div className="p-4 rounded-lg border text-center bg-green-500/10">
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">{session.present}</p>
              <p className="text-sm text-muted-foreground">Present</p>
            </div>
            <div className="p-4 rounded-lg border text-center bg-red-500/10">
              <p className="text-2xl font-bold text-red-700 dark:text-red-400">{session.absent}</p>
              <p className="text-sm text-muted-foreground">Absent</p>
            </div>
          </div>

          {/* Topic */}
          <div className="p-4 rounded-lg bg-muted">
            <p className="text-sm text-muted-foreground mb-1">Topic Covered</p>
            <p className="font-medium">{session.topic}</p>
          </div>

          {/* Attendance List */}
          <div>
            <h3 className="font-semibold mb-3">Attendance Records</h3>
            <div className="space-y-2">
              {attendanceRecords.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={`/.jpg?height=40&width=40&query=${record.name}`} />
                      <AvatarFallback>
                        {record.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{record.name}</p>
                      {record.time && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{record.time}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {record.status === "present" ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400">
                          Present
                        </Badge>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-500" />
                        <Badge variant="secondary" className="bg-red-500/10 text-red-700 dark:text-red-400">
                          Absent
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

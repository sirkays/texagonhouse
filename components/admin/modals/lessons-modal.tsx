"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, PlayCircle, FileText, CheckCircle } from "lucide-react"

interface LessonsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  module: any
}

export function LessonsModal({ open, onOpenChange, module }: LessonsModalProps) {
  if (!module) return null

  const lessons = [
    { id: 1, title: "Introduction to the Topic", duration: 30, type: "video", completed: true },
    { id: 2, title: "Core Concepts Explained", duration: 45, type: "video", completed: true },
    { id: 3, title: "Practical Examples", duration: 35, type: "video", completed: false },
    { id: 4, title: "Practice Exercises", duration: 40, type: "document", completed: false },
    { id: 5, title: "Advanced Applications", duration: 50, type: "video", completed: false },
    { id: 6, title: "Quiz and Assessment", duration: 20, type: "quiz", completed: false },
  ]

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <PlayCircle className="h-4 w-4" />
      case "document":
        return <FileText className="h-4 w-4" />
      case "quiz":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{module.name}</DialogTitle>
          <DialogDescription>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">Module {module.order}</Badge>
              <Badge>{module.difficulty}</Badge>
              <span className="text-sm text-muted-foreground">{module.lessons} lessons</span>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-6">
          {lessons.map((lesson, index) => (
            <div
              key={lesson.id}
              className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary font-semibold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{lesson.title}</h4>
                    {lesson.completed && <CheckCircle className="h-4 w-4 text-green-500" />}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      {getTypeIcon(lesson.type)}
                      <span className="capitalize">{lesson.type}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{lesson.duration} min</span>
                    </div>
                  </div>
                </div>
              </div>
              <Button variant={lesson.completed ? "outline" : "default"} size="sm">
                {lesson.completed ? "Review" : "Start"}
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 rounded-lg bg-muted">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold">2 of {lessons.length} completed</span>
          </div>
          <div className="h-2 bg-background rounded-full overflow-hidden mt-2">
            <div className="h-full bg-primary" style={{ width: `${(2 / lessons.length) * 100}%` }} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

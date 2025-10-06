"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Plus, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ManageStudentsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  classroom: any
}

export function ManageStudentsModal({ open, onOpenChange, classroom }: ManageStudentsModalProps) {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")

  const [enrolledStudents, setEnrolledStudents] = useState([
    { id: 1, name: "John Doe", email: "john@email.com" },
    { id: 2, name: "Jane Smith", email: "jane@email.com" },
  ])

  const availableStudents = [
    { id: 3, name: "Mike Johnson", email: "mike@email.com" },
    { id: 4, name: "Sarah Williams", email: "sarah@email.com" },
  ]

  const handleRemoveStudent = (studentId: number) => {
    setEnrolledStudents(enrolledStudents.filter((s) => s.id !== studentId))
    toast({ title: "Success", description: "Student removed from classroom" })
  }

  const handleAddStudent = (student: any) => {
    setEnrolledStudents([...enrolledStudents, student])
    toast({ title: "Success", description: "Student added to classroom" })
  }

  if (!classroom) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Students - {classroom.name}</DialogTitle>
          <DialogDescription>Add or remove students from this classroom</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Enrolled Students */}
          <div>
            <h3 className="font-semibold mb-3">Enrolled Students ({enrolledStudents.length})</h3>
            <div className="space-y-2">
              {enrolledStudents.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={`/.jpg?height=40&width=40&query=${student.name}`} />
                      <AvatarFallback>
                        {student.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveStudent(student.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Available Students */}
          <div>
            <h3 className="font-semibold mb-3">Available Students</h3>
            <div className="space-y-2">
              {availableStudents.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={`/.jpg?height=40&width=40&query=${student.name}`} />
                      <AvatarFallback>
                        {student.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleAddStudent(student)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

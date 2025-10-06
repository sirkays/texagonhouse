"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface StudentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  student?: {
    id: number
    name: string
    email: string
    classroom: string
    admissionNo: string
    status: string
  }
  onSave: (data: any) => void
}

export function StudentModal({ open, onOpenChange, student, onSave }: StudentModalProps) {
  const [formData, setFormData] = useState({
    name: student?.name || "",
    email: student?.email || "",
    classroom: student?.classroom || "",
    admissionNo: student?.admissionNo || "",
    status: student?.status || "active",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ ...formData, id: student?.id || Date.now() })
    onOpenChange(false)
    setFormData({ name: "", email: "", classroom: "", admissionNo: "", status: "active" })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{student ? "Edit Student" : "Add New Student"}</DialogTitle>
            <DialogDescription>
              {student ? "Update student information" : "Add a new student to your organization"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="e.g., John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="student@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="admissionNo">Admission Number</Label>
              <Input
                id="admissionNo"
                placeholder="e.g., STU001"
                value={formData.admissionNo}
                onChange={(e) => setFormData({ ...formData, admissionNo: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="classroom">Classroom</Label>
              <Select
                value={formData.classroom}
                onValueChange={(value) => setFormData({ ...formData, classroom: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select classroom" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Grade 10A">Grade 10A</SelectItem>
                  <SelectItem value="Grade 10B">Grade 10B</SelectItem>
                  <SelectItem value="Grade 11A">Grade 11A</SelectItem>
                  <SelectItem value="Grade 11B">Grade 11B</SelectItem>
                  <SelectItem value="Grade 12A">Grade 12A</SelectItem>
                  <SelectItem value="Grade 12B">Grade 12B</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{student ? "Update" : "Add"} Student</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

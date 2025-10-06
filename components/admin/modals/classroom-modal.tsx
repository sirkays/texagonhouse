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
import { Textarea } from "@/components/ui/textarea"

interface ClassroomModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  classroom?: {
    id: number
    name: string
    code: string
    description?: string
  }
  onSave: (data: any) => void
}

export function ClassroomModal({ open, onOpenChange, classroom, onSave }: ClassroomModalProps) {
  const [formData, setFormData] = useState({
    name: classroom?.name || "",
    code: classroom?.code || "",
    description: classroom?.description || "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ ...formData, id: classroom?.id || Date.now() })
    onOpenChange(false)
    setFormData({ name: "", code: "", description: "" })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{classroom ? "Edit Classroom" : "Add New Classroom"}</DialogTitle>
            <DialogDescription>
              {classroom ? "Update classroom information" : "Create a new classroom for your organization"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Classroom Name</Label>
              <Input
                id="name"
                placeholder="e.g., Grade 10A"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="code">Classroom Code</Label>
              <Input
                id="code"
                placeholder="e.g., G10A-2024"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Enter classroom description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{classroom ? "Update" : "Create"} Classroom</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

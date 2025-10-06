"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DollarSign, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface BookTutoringModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tutor: any
}

export function BookTutoringModal({ open, onOpenChange, tutor }: BookTutoringModalProps) {
  const { toast } = useToast()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [duration, setDuration] = useState("60")
  const [subject, setSubject] = useState("")
  const [notes, setNotes] = useState("")

  const handleBooking = () => {
    toast({
      title: "Booking Confirmed",
      description: `Your tutoring session with ${tutor.name} has been scheduled.`,
    })
    onOpenChange(false)
  }

  if (!tutor) return null

  const totalCost = (Number.parseInt(duration) / 60) * tutor.rate

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book Tutoring Session</DialogTitle>
          <DialogDescription>Schedule a one-on-one session with {tutor.name}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Tutor Info */}
          <div className="flex items-center gap-4 p-4 rounded-lg bg-muted">
            <Avatar className="h-12 w-12">
              <AvatarImage src={`/.jpg?height=48&width=48&query=${tutor.name}`} />
              <AvatarFallback>
                {tutor.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold">{tutor.name}</p>
              <p className="text-sm text-muted-foreground">{tutor.experience} years experience</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-lg font-bold">
                <DollarSign className="h-4 w-4" />
                <span>{tutor.rate}</span>
              </div>
              <p className="text-xs text-muted-foreground">per hour</p>
            </div>
          </div>

          {/* Subject Selection */}
          <div className="space-y-2">
            <Label>Subject</Label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                {tutor.specialties.map((specialty: string) => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <Label>Select Date</Label>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
              disabled={(date) => date < new Date()}
            />
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label>Duration</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Additional Notes (Optional)</Label>
            <Textarea
              placeholder="Any specific topics or questions you'd like to cover..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Cost Summary */}
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Total Cost</span>
              </div>
              <div className="flex items-center gap-1 text-2xl font-bold">
                <DollarSign className="h-5 w-5" />
                <span>{totalCost.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleBooking} disabled={!subject || !date}>
            Confirm Booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

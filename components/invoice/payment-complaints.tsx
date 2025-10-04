"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { MessageSquare, Plus, Clock, CheckCircle, AlertCircle, FileText, Upload, Calendar, User } from "lucide-react"
import { format } from "date-fns"

interface Complaint {
  id: string
  title: string
  description: string
  status: "open" | "in-progress" | "resolved" | "closed"
  priority: "low" | "medium" | "high"
  transactionId?: string
  createdAt: string
  updatedAt: string
  assignedTo?: string
  responses: ComplaintResponse[]
}

interface ComplaintResponse {
  id: string
  message: string
  author: string
  role: "user" | "support" | "admin"
  createdAt: string
}

interface PaymentComplaintsProps {
  className?: string
}

// Mock data - in real app this would come from API
const mockComplaints: Complaint[] = [
  {
    id: "COMP-001",
    title: "Payment not reflected in account",
    description:
      "I made a payment for invoice INV-2024-001 three days ago, but it's still showing as unpaid in my account.",
    status: "in-progress",
    priority: "high",
    transactionId: "TXN-001",
    createdAt: "2024-01-16T10:30:00Z",
    updatedAt: "2024-01-17T14:20:00Z",
    assignedTo: "Sarah Johnson",
    responses: [
      {
        id: "1",
        message: "Thank you for reporting this issue. I'm looking into your payment status now.",
        author: "Sarah Johnson",
        role: "support",
        createdAt: "2024-01-16T11:00:00Z",
      },
      {
        id: "2",
        message:
          "I can confirm the payment was received. The system update was delayed. Your account has been updated.",
        author: "Sarah Johnson",
        role: "support",
        createdAt: "2024-01-17T14:20:00Z",
      },
    ],
  },
  {
    id: "COMP-002",
    title: "Incorrect invoice amount",
    description:
      "The invoice amount seems to be calculated incorrectly. The tax rate applied doesn't match our agreement.",
    status: "open",
    priority: "medium",
    transactionId: "TXN-003",
    createdAt: "2024-01-15T09:15:00Z",
    updatedAt: "2024-01-15T09:15:00Z",
    responses: [],
  },
  {
    id: "COMP-003",
    title: "Unable to download invoice PDF",
    description: "The download button for the PDF invoice is not working. I need the invoice for my records.",
    status: "resolved",
    priority: "low",
    createdAt: "2024-01-12T16:45:00Z",
    updatedAt: "2024-01-13T10:30:00Z",
    assignedTo: "Mike Chen",
    responses: [
      {
        id: "1",
        message: "We've fixed the PDF download issue. Please try again.",
        author: "Mike Chen",
        role: "support",
        createdAt: "2024-01-13T10:30:00Z",
      },
    ],
  },
]

export function PaymentComplaints({ className }: PaymentComplaintsProps) {
  const [complaints, setComplaints] = useState<Complaint[]>(mockComplaints)
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [isNewComplaintOpen, setIsNewComplaintOpen] = useState(false)
  const [newComplaint, setNewComplaint] = useState({
    title: "",
    description: "",
    priority: "medium" as const,
    transactionId: "",
  })

  const getStatusIcon = (status: Complaint["status"]) => {
    switch (status) {
      case "open":
        return <AlertCircle className="h-4 w-4" />
      case "in-progress":
        return <Clock className="h-4 w-4" />
      case "resolved":
        return <CheckCircle className="h-4 w-4" />
      case "closed":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: Complaint["status"]) => {
    switch (status) {
      case "open":
        return "bg-destructive text-destructive-foreground"
      case "in-progress":
        return "bg-warning text-warning-foreground"
      case "resolved":
        return "bg-success text-success-foreground"
      case "closed":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  const getPriorityColor = (priority: Complaint["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-destructive text-destructive-foreground"
      case "medium":
        return "bg-warning text-warning-foreground"
      case "low":
        return "bg-success text-success-foreground"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  const handleSubmitComplaint = () => {
    if (!newComplaint.title || !newComplaint.description) return

    const complaint: Complaint = {
      id: `COMP-${String(complaints.length + 1).padStart(3, "0")}`,
      title: newComplaint.title,
      description: newComplaint.description,
      status: "open",
      priority: newComplaint.priority,
      transactionId: newComplaint.transactionId || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      responses: [],
    }

    setComplaints([complaint, ...complaints])
    setNewComplaint({ title: "", description: "", priority: "medium", transactionId: "" })
    setIsNewComplaintOpen(false)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Payment Support</CardTitle>
            <Dialog open={isNewComplaintOpen} onOpenChange={setIsNewComplaintOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Complaint
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Submit New Complaint</DialogTitle>
                  <DialogDescription>Describe your payment-related issue and we'll help resolve it.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Brief description of the issue"
                      value={newComplaint.title}
                      onChange={(e) => setNewComplaint({ ...newComplaint, title: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Provide detailed information about your issue..."
                      value={newComplaint.description}
                      onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })}
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={newComplaint.priority}
                        onValueChange={(value: "low" | "medium" | "high") =>
                          setNewComplaint({ ...newComplaint, priority: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="transactionId">Transaction ID (Optional)</Label>
                      <Input
                        id="transactionId"
                        placeholder="TXN-001"
                        value={newComplaint.transactionId}
                        onChange={(e) => setNewComplaint({ ...newComplaint, transactionId: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Attachments (Optional)</Label>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Drag and drop files here, or click to browse</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsNewComplaintOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmitComplaint}>Submit Complaint</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Complaints List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Complaints</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            {complaints.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No complaints submitted yet.</p>
                <p className="text-sm">Submit a complaint if you need help with payments.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {complaints.map((complaint) => (
                  <div
                    key={complaint.id}
                    onClick={() => setSelectedComplaint(complaint)}
                    className={`p-4 border-b cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedComplaint?.id === complaint.id ? "bg-accent/50 border-l-4 border-l-primary" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm mb-1">{complaint.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">{complaint.description}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 ml-3">
                        <Badge className={getStatusColor(complaint.status)}>
                          {getStatusIcon(complaint.status)}
                          <span className="ml-1 capitalize">{complaint.status.replace("-", " ")}</span>
                        </Badge>
                        <Badge variant="outline" className={getPriorityColor(complaint.priority)}>
                          {complaint.priority}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(complaint.createdAt), "MMM dd, yyyy")}
                        </span>
                        {complaint.transactionId && (
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {complaint.transactionId}
                          </span>
                        )}
                        {complaint.assignedTo && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {complaint.assignedTo}
                          </span>
                        )}
                      </div>
                      <span>{complaint.responses.length} responses</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Selected Complaint Details */}
      {selectedComplaint && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-base">{selectedComplaint.title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">ID: {selectedComplaint.id}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge className={getStatusColor(selectedComplaint.status)}>
                  {getStatusIcon(selectedComplaint.status)}
                  <span className="ml-1 capitalize">{selectedComplaint.status.replace("-", " ")}</span>
                </Badge>
                <Badge variant="outline" className={getPriorityColor(selectedComplaint.priority)}>
                  {selectedComplaint.priority} priority
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h5 className="font-medium text-sm mb-2">Description</h5>
              <p className="text-sm text-muted-foreground">{selectedComplaint.description}</p>
            </div>

            {selectedComplaint.responses.length > 0 && (
              <>
                <Separator />
                <div>
                  <h5 className="font-medium text-sm mb-3">Responses ({selectedComplaint.responses.length})</h5>
                  <div className="space-y-3">
                    {selectedComplaint.responses.map((response) => (
                      <div key={response.id} className="p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{response.author}</span>
                            <Badge variant="outline" className="text-xs">
                              {response.role}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(response.createdAt), "MMM dd, h:mm a")}
                          </span>
                        </div>
                        <p className="text-sm">{response.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
              <span>Created: {format(new Date(selectedComplaint.createdAt), "MMM dd, yyyy 'at' h:mm a")}</span>
              <span>Updated: {format(new Date(selectedComplaint.updatedAt), "MMM dd, yyyy 'at' h:mm a")}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

"use client"

import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, MessageSquare, Clock, User, AlertTriangle } from "lucide-react"
import Link from "next/link"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

// Mock complaint data - in real app this would come from API
const complaintData = {
  id: "CMP-2024-001",
  title: "Payment failed but amount was charged",
  description:
    "I attempted to make a payment for my subscription renewal, but the payment failed with an error message. However, I can see the amount has been charged to my credit card. Please help resolve this issue.",
  status: "in-progress",
  priority: "high",
  category: "Payment Issue",
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-16T14:22:00Z",
  assignedTo: "Sarah Johnson",
  transactionId: "TXN-2024-001",
  amount: 299.99,
  responses: [
    {
      id: "1",
      author: "Customer",
      message:
        "I attempted to make a payment for my subscription renewal, but the payment failed with an error message. However, I can see the amount has been charged to my credit card. Please help resolve this issue.",
      timestamp: "2024-01-15T10:30:00Z",
      type: "customer",
    },
    {
      id: "2",
      author: "Sarah Johnson",
      message:
        "Thank you for contacting us. I can see the issue you're experiencing. I've located your transaction and can confirm that while the payment initially failed, the charge was processed. I'm working with our payment processor to resolve this discrepancy.",
      timestamp: "2024-01-15T15:45:00Z",
      type: "support",
    },
    {
      id: "3",
      author: "Sarah Johnson",
      message:
        "Update: I've contacted our payment processor and they've confirmed this was a temporary system issue. Your subscription has been activated and the duplicate charge will be refunded within 3-5 business days. I'll monitor this to ensure the refund is processed correctly.",
      timestamp: "2024-01-16T14:22:00Z",
      type: "support",
    },
  ],
}

export default function ComplaintDetailPage() {
  const params = useParams()
  const complaintId = params.id as string

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "destructive"
      case "in-progress":
        return "secondary"
      case "resolved":
        return "default"
      case "closed":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "outline"
      case "medium":
        return "secondary"
      case "high":
        return "destructive"
      case "urgent":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbLink href="/complaints">Support</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{complaintId}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Complaint Details</h1>
            <p className="text-muted-foreground">Ticket {complaintData.id}</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/complaints">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Support
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Complaint Details */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{complaintData.title}</CardTitle>
                    <CardDescription>Created {formatDate(complaintData.createdAt)}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={getStatusColor(complaintData.status)}>
                      {complaintData.status.replace("-", " ")}
                    </Badge>
                    <Badge variant={getPriorityColor(complaintData.priority)}>{complaintData.priority} priority</Badge>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Conversation Thread */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Conversation
                </CardTitle>
                <CardDescription>Communication history for this complaint</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {complaintData.responses.map((response) => (
                  <div
                    key={response.id}
                    className={`p-4 rounded-lg ${
                      response.type === "customer" ? "bg-muted ml-0 mr-8" : "bg-primary/10 ml-8 mr-0"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium">{response.author}</span>
                        <Badge variant="outline" className="text-xs">
                          {response.type}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">{formatDate(response.timestamp)}</span>
                    </div>
                    <p className="text-sm leading-relaxed">{response.message}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Add Response */}
            <Card>
              <CardHeader>
                <CardTitle>Add Response</CardTitle>
                <CardDescription>Reply to this complaint</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea placeholder="Type your response here..." className="min-h-[100px]" />
                <div className="flex gap-2">
                  <Button>Send Response</Button>
                  <Button variant="outline">Save Draft</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Complaint Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Status</div>
                  <Badge variant={getStatusColor(complaintData.status)}>{complaintData.status.replace("-", " ")}</Badge>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Priority</div>
                  <Badge variant={getPriorityColor(complaintData.priority)}>{complaintData.priority} priority</Badge>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Category</div>
                  <div className="text-sm">{complaintData.category}</div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Assigned To</div>
                  <div className="text-sm">{complaintData.assignedTo}</div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Created</div>
                  <div className="text-sm">{formatDate(complaintData.createdAt)}</div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Last Updated</div>
                  <div className="text-sm">{formatDate(complaintData.updatedAt)}</div>
                </div>
              </CardContent>
            </Card>

            {complaintData.transactionId && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Related Transaction</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Transaction ID</div>
                    <div className="text-sm font-mono">{complaintData.transactionId}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Amount</div>
                    <div className="text-sm">${complaintData.amount}</div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-2 bg-transparent" asChild>
                    <Link href={`/transactions/${complaintData.transactionId}`}>View Transaction</Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <Clock className="mr-2 h-4 w-4" />
                  Update Status
                </Button>
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Escalate Issue
                </Button>
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <User className="mr-2 h-4 w-4" />
                  Reassign
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

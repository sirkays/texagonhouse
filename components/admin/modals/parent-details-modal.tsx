"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mail, Phone, Users, CreditCard } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface ParentDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  parent: any
}

export function ParentDetailsModal({ open, onOpenChange, parent }: ParentDetailsModalProps) {
  if (!parent) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={`/.jpg?height=64&width=64&query=${parent.name}`} />
              <AvatarFallback className="text-lg">
                {parent.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-2xl">{parent.name}</DialogTitle>
              <DialogDescription>
                <Badge variant={parent.subscription === "Active" ? "default" : "destructive"}>
                  {parent.subscription}
                </Badge>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Contact Information */}
          <Card>
            <CardContent className="pt-6 space-y-3">
              <h3 className="font-semibold mb-3">Contact Information</h3>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{parent.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{parent.phone}</span>
              </div>
            </CardContent>
          </Card>

          {/* Children */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold">Children ({parent.children.length})</h3>
              </div>
              <div className="space-y-2">
                {parent.children.map((child: string, index: number) => (
                  <div key={index} className="flex items-center gap-3 p-2 rounded-lg border">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`/.jpg?height=32&width=32&query=${child}`} />
                      <AvatarFallback className="text-xs">
                        {child
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{child}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Subscription Details */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold">Subscription Details</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={parent.subscription === "Active" ? "default" : "destructive"}>
                    {parent.subscription}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="font-medium">Standard Plan</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Next Billing</span>
                  <span className="font-medium">April 15, 2024</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}

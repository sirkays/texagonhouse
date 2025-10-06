"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Download, Mail, DollarSign, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface InvoiceDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice: any
}

export function InvoiceDetailsModal({ open, onOpenChange, invoice }: InvoiceDetailsModalProps) {
  const { toast } = useToast()

  if (!invoice) return null

  const handleDownload = () => {
    toast({ title: "Downloading", description: "Invoice PDF is being downloaded..." })
  }

  const handleSendEmail = () => {
    toast({ title: "Email Sent", description: `Invoice sent to ${invoice.parent}` })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl font-mono">{invoice.number}</DialogTitle>
              <DialogDescription className="mt-2">
                <Badge variant={invoice.status === "paid" ? "default" : "secondary"} className="capitalize">
                  {invoice.status}
                </Badge>
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleSendEmail}>
                <Mail className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Customer Info */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">Bill To</p>
            <p className="font-semibold text-lg">{invoice.parent}</p>
          </div>

          <Separator />

          {/* Invoice Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Issue Date</span>
              </div>
              <p className="font-medium">{invoice.issuedAt}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Due Date</span>
              </div>
              <p className="font-medium">{invoice.dueAt}</p>
            </div>
          </div>

          <Separator />

          {/* Line Items */}
          <div>
            <h3 className="font-semibold mb-3">Items</h3>
            <div className="space-y-2">
              <div className="flex justify-between p-3 rounded-lg bg-muted">
                <div>
                  <p className="font-medium">Standard Plan Subscription</p>
                  <p className="text-sm text-muted-foreground">Monthly billing period</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 font-semibold">
                    <DollarSign className="h-4 w-4" />
                    <span>{invoice.amount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Total */}
          <div className="flex justify-between items-center p-4 rounded-lg bg-primary/10">
            <span className="text-lg font-semibold">Total Amount</span>
            <div className="flex items-center gap-1 text-2xl font-bold">
              <DollarSign className="h-6 w-6" />
              <span>{invoice.amount}</span>
            </div>
          </div>

          {/* Payment Info */}
          {invoice.status === "paid" && (
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-sm text-green-700 dark:text-green-400">Payment received on {invoice.issuedAt}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

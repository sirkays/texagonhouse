// components/invoice/invoice-details-modal.tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PaymentStatusBadge } from "@/components/invoice/payment-status-badge";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  Eye,
  Calendar,
  DollarSign,
  Building2,
  Mail,
} from "lucide-react";
import { format } from "date-fns";
import { generateInvoicePDF } from "@/lib/generate-pdf";

interface Invoice {
  id: number;
  number: string;
  amount: string;
  currency: string;
  issued_at: string;
  due_at: string;
  status: "open" | "paid" | "void" | "uncollectible" | "active";
  meta: { generated_for: string; parent_profile_id: number };
}

interface InvoiceDetailsModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
}

export function InvoiceDetailsModal({
  invoice,
  isOpen,
  onClose,
}: InvoiceDetailsModalProps) {
  const [generating, setGenerating] = useState(false);

  if (!invoice || !isOpen) return null;

  const handleDownload  = (invoice: Invoice) => {
      generateInvoicePDF(invoice);
    };
  

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invoice {invoice.number}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <PaymentStatusBadge status={invoice.status} />
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleDownload(invoice)} disabled={generating}>
                <Download className="h-4 w-4 mr-2" />
                {generating ? "…" : "Download"}
              </Button>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Issued
              </div>
              <p className="font-medium">
                {format(new Date(invoice.issued_at), "MMM dd, yyyy")}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Due
              </div>
              <p className="font-medium">
                {format(new Date(invoice.due_at), "MMM dd, yyyy")}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-4 w-4" />
                Profile
              </div>
              <p className="font-medium">{invoice.meta.parent_profile_id}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                Amount
              </div>
              <p className="font-bold">
                {invoice.currency} {Number(invoice.amount).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
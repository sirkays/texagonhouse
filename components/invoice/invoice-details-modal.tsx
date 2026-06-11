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
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  DollarSign,
  Download,
  Copy,
  FileText,
  User,
  Layers,
  Clock,
  CreditCard,
} from "lucide-react";
import { generateInvoicePDF } from "@/lib/generate-pdf";

type InvoiceStatus = "open" | "paid" | "void" | "uncollectible" | "active";
type InvoiceType = "tutor" | "subscription";

export interface Invoice {
  id: number;
  number: string;
  amount: string;
  currency: string;
  issued_at: string | null;
  due_at: string | null;
  status: InvoiceStatus;

  // From your serializer:
  student_name?: string;
  invoice_type?: InvoiceType;
  invoice_type_object_id?: number | string | null;
  invoice_type_object_type?: string | null;

  created_at?: string | null;
  updated_at?: string | null;
  meta?: Record<string, any>;
}

interface InvoiceDetailsModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;

  // Optional: allow paying from inside modal
  onPay?: (invoice_number: string) => void;
}

const safeDate = (iso?: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const safeTime = (iso?: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
};

const money = (currency: string, amount: string) => {
  const n = Number(amount);
  const pretty = Number.isFinite(n) ? n.toLocaleString() : amount;
  return `${currency} ${pretty}`;
};

export function InvoiceDetailsModal({ invoice, isOpen, onClose, onPay }: InvoiceDetailsModalProps) {

  const title = invoice ? `Invoice ${invoice.number}` : "Invoice";
  const [generating, setGenerating] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // hooks must come first (already above)
  if (!isOpen) return null;
  if (!invoice) return null;


  const issued = safeDate(invoice.issued_at);
  const due = safeDate(invoice.due_at);

  const created = safeDate(invoice.created_at);
  const createdTime = safeTime(invoice.created_at);

  const updated = safeDate(invoice.updated_at);
  const updatedTime = safeTime(invoice.updated_at);

  const invType = invoice.invoice_type ?? "subscription";

  // Optional: user-friendly context (NO IDs)
  const invContextLabel = invoice.invoice_type_object_type
    ? String(invoice.invoice_type_object_type)
    : null;


  const canPay = invoice.status === "open" && typeof onPay === "function";

  const copy = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 900);
    } catch {
      // ignore
    }
  };

  const handleDownload = async () => {
    setGenerating(true);
    try {
      generateInvoicePDF(invoice as any);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-white/20 shadow-2xl rounded-2xl">
        {/* Header */}
        <div className="p-6 pb-4">
          <DialogHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <DialogTitle className="text-2xl font-bold tracking-tight">{title}</DialogTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <PaymentStatusBadge status={invoice.status} />
                  <Badge variant="outline" className="capitalize">
                    {invType}
                  </Badge>
                  {invContextLabel && (
                    <Badge variant="secondary" className="gap-1">
                      <Layers className="h-3.5 w-3.5" />
                      {invContextLabel}
                    </Badge>
                  )}

                </div>
              </div>

              <div className="flex items-center gap-2">
                {canPay && (
                  <Button
                    size="sm"
                    onClick={() => onPay?.(invoice.number)}
                    className="gap-2 rounded-full bg-[#EF7B55] hover:bg-[#EF7B55]/90 text-white shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <CreditCard className="h-4 w-4" />
                    Pay now
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  disabled={generating}
                  className="gap-2 rounded-full hover:bg-[#EF7B55]/10 hover:text-[#EF7B55] hover:border-[#EF7B55]/30 transition-all duration-200"
                >
                  <Download className="h-4 w-4" />
                  {generating ? "Generating…" : "Download"}
                </Button>
              </div>
            </div>
          </DialogHeader>
        </div>

        <Separator />

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Amount Card */}
            <div className="animate-fade-in rounded-xl bg-gradient-to-br from-[#EF7B55]/10 to-[#EF7B55]/5 border border-[#EF7B55]/10 p-5 shadow-sm" style={{ animationDelay: "0s", animationFillMode: "both" }}>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <div className="rounded-lg bg-white/60 dark:bg-gray-800/60 p-1.5 text-[#EF7B55]">
                  <DollarSign className="h-4 w-4" />
                </div>
                Amount
              </div>
              <div className="mt-2 text-2xl font-bold tracking-tight">
                {money(invoice.currency, invoice.amount)}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 px-0 h-auto text-xs text-muted-foreground hover:text-[#EF7B55] transition-colors"
                onClick={() => copy("amount", money(invoice.currency, invoice.amount))}
              >
                <Copy className="h-3.5 w-3.5 mr-2" />
                {copiedKey === "amount" ? "Copied!" : "Copy amount"}
              </Button>
            </div>

            {/* Dates Card */}
            <div className="animate-fade-in rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/10 p-5 shadow-sm" style={{ animationDelay: "0.08s", animationFillMode: "both" }}>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <div className="rounded-lg bg-white/60 dark:bg-gray-800/60 p-1.5 text-blue-500">
                  <Calendar className="h-4 w-4" />
                </div>
                Dates
              </div>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Issued</span>
                  <span className="font-medium">{issued || "—"}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Due</span>
                  <span className="font-medium">{due || "—"}</span>
                </div>
              </div>
            </div>

            {/* Reference Card */}
            <div className="animate-fade-in rounded-xl bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-500/10 p-5 shadow-sm" style={{ animationDelay: "0.16s", animationFillMode: "both" }}>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <div className="rounded-lg bg-white/60 dark:bg-gray-800/60 p-1.5 text-violet-500">
                  <FileText className="h-4 w-4" />
                </div>
                Reference
              </div>
              <div className="mt-2 text-sm font-semibold">{invoice.number}</div>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 px-0 h-auto text-xs text-muted-foreground hover:text-violet-500 transition-colors"
                onClick={() => copy("number", invoice.number)}
              >
                <Copy className="h-3.5 w-3.5 mr-2" />
                {copiedKey === "number" ? "Copied!" : "Copy invoice no."}
              </Button>
            </div>
          </div>

          {/* Parties / info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="animate-fade-in rounded-xl bg-gradient-to-br from-emerald-500/8 to-emerald-500/3 border border-emerald-500/10 p-5 shadow-sm" style={{ animationDelay: "0.24s", animationFillMode: "both" }}>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <div className="rounded-lg bg-white/60 dark:bg-gray-800/60 p-1.5 text-emerald-500">
                  <User className="h-4 w-4" />
                </div>
                Billed to
              </div>
              <div className="mt-3 text-sm space-y-1.5">
                <div className="font-semibold text-base">
                  {invoice.student_name || "Student Name"}
                </div>
                <div className="text-muted-foreground">
                  Type: <span className="capitalize font-medium text-foreground">{invType}</span>
                </div>
                {invContextLabel && (
                  <div className="text-muted-foreground">
                    For: <span className="font-medium text-foreground">{invContextLabel}</span>
                  </div>
                )}

              </div>
            </div>

            <div className="animate-fade-in rounded-xl bg-gradient-to-br from-amber-500/8 to-amber-500/3 border border-amber-500/10 p-5 shadow-sm" style={{ animationDelay: "0.32s", animationFillMode: "both" }}>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <div className="rounded-lg bg-white/60 dark:bg-gray-800/60 p-1.5 text-amber-500">
                  <Clock className="h-4 w-4" />
                </div>
                Timeline
              </div>
              <div className="mt-3 text-sm space-y-2">
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">
                    {created ? `${created} ${createdTime}` : "—"}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Updated</span>
                  <span className="font-medium">
                    {updated ? `${updated} ${updatedTime}` : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Meta (optional, but useful for debugging/support)
          {invoice.meta && Object.keys(invoice.meta).length > 0 && (
            <div className="rounded-xl border p-4">
              <div className="text-sm font-semibold mb-2">Extra details</div>
              <pre className="text-xs bg-muted rounded-lg p-3 overflow-x-auto">
                {JSON.stringify(invoice.meta, null, 2)}
              </pre>
            </div>
          )} */}
        </div>
      </DialogContent>
    </Dialog>
  );
}

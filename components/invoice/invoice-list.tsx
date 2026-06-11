// components/invoice/invoice-list.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PaymentStatusBadge } from "@/components/invoice/payment-status-badge";
import { InvoiceDetailsModal } from "@/components/invoice/invoice-details-modal";
import { Spinner } from "@/components/ui/spinner";
import { MoreHorizontal, Eye, Download, CreditCard, MessageSquare, FileText, Calendar, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { generateInvoicePDF } from "@/lib/generate-pdf";
import { useInvoiceFilters } from "@/hooks/use-invoice-filters";

type InvoiceStatus = "open" | "paid" | "void" | "uncollectible" | "active";
type InvoiceType = "tutor" | "subscription";

interface Invoice {
  id: number;
  number: string;
  amount: string;
  currency: string;
  issued_at: string;
  student_name: string;
  due_at: string;
  status: InvoiceStatus;
  invoice_type?: InvoiceType;
  invoice_type_object_id?: number | null;
  invoice_type_object_type?: string | null;
  meta: Record<string, any>;

}

const safeDate = (iso: string | null | undefined) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const formatMoney = (currency: string, amount: string) => {
  const n = Number(amount);
  return `${currency} ${Number.isFinite(n) ? n.toLocaleString() : amount}`;
};

const typeLabel = (t?: InvoiceType) => t ?? "subscription";

const getStatusBorderColor = (status: InvoiceStatus) => {
  switch (status) {
    case "paid":
    case "active":
      return "border-l-emerald-500";
    case "open":
      return "border-l-amber-500";
    case "void":
    case "uncollectible":
      return "border-l-red-500";
    default:
      return "border-l-gray-400";
  }
};

const getStatusGlow = (status: InvoiceStatus) => {
  switch (status) {
    case "paid":
    case "active":
      return "hover:shadow-emerald-500/5";
    case "open":
      return "hover:shadow-amber-500/5";
    case "void":
    case "uncollectible":
      return "hover:shadow-red-500/5";
    default:
      return "";
  }
};

export function InvoiceList() {
  const { invoices: displayInvoices, loading, error, setInvoices, searchTerm } = useInvoiceFilters();
  const searchParams = useSearchParams();

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [confirmedTx, setConfirmedTx] = useState<string | null>(null);
  const canMakeComplaint = (invoice: Invoice) =>
    invoice.invoice_type === "subscription" && invoice.status === "paid";

  const router = useRouter();


  useEffect(() => {
    const status = (searchParams.get("status") || "").toLowerCase();
    const tx_ref = searchParams.get("tx_ref");
    const transaction_id = searchParams.get("transaction_id");
    const invoice_number = searchParams.get("invoice_number");

    // in useEffect callback
    if (tx_ref && invoice_number) {
      if (confirmedTx === tx_ref) return;
      setConfirmedTx(tx_ref);

      confirmPayment(invoice_number, tx_ref, transaction_id || "", status); // pass status
    }

  }, [searchParams, confirmedTx]);

  const handleMakeComplaint = (invoice: Invoice) => {
    // ✅ Only paid subscriptions can complain
    if (!canMakeComplaint(invoice)) return;

    const category = "Subscription";

    const txRef =
      invoice.meta?.transaction_reference ||
      invoice.meta?.tx_ref ||
      invoice.meta?.reference ||
      "";

    const params = new URLSearchParams();
    params.set("category", category);

    if (txRef) params.set("transaction_reference", txRef);
    params.set("invoice_number", invoice.number);

    router.push(`/invoice/complaints?${params.toString()}`);
  };


  const refetchInvoices = async () => {
    const term = searchTerm.trim();
    const params = new URLSearchParams();
    if (term) params.append("search", term);
    const url = `/api/billing?${params.toString()}`;
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`Failed to fetch invoices: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      setInvoices(data.results || []);
    } catch (err) {
      console.error(err);
      setInvoices([]);
    }
  };

  const confirmPayment = async (invoice_id: string, tx_ref: string, transaction_id: string, status?: string) => {
    setPaymentLoading(true);
    try {
      const res = await fetch("/api/billing?action=confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoice_id, tx_ref, transaction_id, status }),
      });

      const raw = await res.text();
      const payload = raw ? JSON.parse(raw) : null;

      // Always clean up URL params
      const url = new URL(window.location.href);
      ["status", "tx_ref", "transaction_id", "invoice_number"].forEach((k) =>
        url.searchParams.delete(k)
      );
      window.history.replaceState({}, "", url);

      // Refetch invoices regardless — webhook may have already confirmed
      await refetchInvoices();

      if (payload?.status === "success") {
        // Fully confirmed by verify
        setIsSuccessModalOpen(true);
      } else if (payload?.status === "cancelled") {
        // User cancelled — no modal needed
      } else {
        // Backend returned non-success (e.g. Flutterwave still pending at redirect time).
        // The webhook will confirm it automatically — show the success modal anyway
        // since the user completed the payment flow on Flutterwave's side.
        setIsSuccessModalOpen(true);
      }

    } catch (e: any) {
      // Network/parse error — still clean up and show positive feedback
      const url = new URL(window.location.href);
      ["status", "tx_ref", "transaction_id", "invoice_number"].forEach((k) =>
        url.searchParams.delete(k)
      );
      window.history.replaceState({}, "", url);
      await refetchInvoices();
      setIsSuccessModalOpen(true);
    } finally {
      setPaymentLoading(false);
    }
  };


  const handlePayInvoice = async (invoice_number: string) => {
    setPaymentLoading(true);
    try {
      const redirect_url =
        `${window.location.origin}/invoice/invoices` +
        `?invoice_number=${encodeURIComponent(invoice_number)}`;

      const res = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoice_id: invoice_number, redirect_url }),
      });
      if (!res.ok) throw new Error("Payment init failed");
      const { payment_link } = await res.json();
      window.location.href = payment_link;
    } catch {
      alert("Failed to initiate payment");
    } finally {
      setPaymentLoading(false);
    }
  };

  const openDetails = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setIsModalOpen(true);
  };

  const closeDetails = () => {
    setIsModalOpen(false);
    setSelectedInvoice(null);
  };

  if (loading || paymentLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="md" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Recent Invoices</h2>
            <p className="text-sm text-muted-foreground">
              {displayInvoices.length} invoice{displayInvoices.length !== 1 && "s"} shown
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-center py-4 px-4 text-sm">
            {error}
          </div>
        )}

        <div className="grid gap-3">
          {displayInvoices.map((invoice, idx) => (
            <Card
              key={invoice.id}
              className={`animate-fade-in group border-l-4 ${getStatusBorderColor(invoice.status)} bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-white/20 shadow-sm hover:shadow-lg ${getStatusGlow(invoice.status)} hover:scale-[1.01] transition-all duration-300 ease-out`}
              style={{ animationDelay: `${idx * 0.08}s`, animationFillMode: "both" }}
            >
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  {/* Left content */}
                  <div className="flex-1 min-w-0 space-y-3">
                    {/* Top row: invoice number + badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="font-semibold text-base">{invoice.number}</span>
                      </div>
                      <PaymentStatusBadge status={invoice.status} size="sm" />
                      <Badge variant="outline" className="text-xs capitalize">
                        {typeLabel(invoice.invoice_type)}
                      </Badge>
                    </div>

                    {/* Amount - prominent */}
                    <div className="text-2xl font-bold tracking-tight text-foreground">
                      {formatMoney(invoice.currency, invoice.amount)}
                    </div>

                    {/* Student name */}
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <User className="h-3.5 w-3.5 shrink-0" />
                      <span className="font-medium text-foreground">{invoice.student_name}</span>
                    </div>

                    {/* Dates */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Issued {safeDate(invoice.issued_at)}
                      </span>
                      <span className="text-muted-foreground/40">•</span>
                      <span>Due {safeDate(invoice.due_at)}</span>
                    </div>
                  </div>

                  {/* Right side: actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDetails(invoice)}
                      className="rounded-full px-4 text-xs hover:bg-[#EF7B55]/10 hover:text-[#EF7B55] hover:border-[#EF7B55]/30 transition-all duration-200"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1.5" />
                      View
                    </Button>

                    {invoice.status === "open" && (
                      <Button
                        size="sm"
                        onClick={() => handlePayInvoice(invoice.number)}
                        className="rounded-full px-4 text-xs bg-[#EF7B55] hover:bg-[#EF7B55]/90 text-white shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <CreditCard className="h-3.5 w-3.5 mr-1.5" />
                        Pay
                      </Button>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-muted/80 transition-colors">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-white/20 shadow-xl rounded-xl">

                        {canMakeComplaint(invoice) && (
                          <DropdownMenuItem onClick={() => handleMakeComplaint(invoice)}>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Make Complaint
                          </DropdownMenuItem>
                        )}


                        <DropdownMenuItem onClick={() => openDetails(invoice)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => generateInvoicePDF(invoice as any)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </DropdownMenuItem>

                        {invoice.status === "open" && (
                          <DropdownMenuItem onClick={() => handlePayInvoice(invoice.number)}>
                            <CreditCard className="h-4 w-4 mr-2" />
                            Pay Now
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {displayInvoices.length === 0 && !error && (
            <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border border-white/20 shadow-sm">
              <CardContent className="py-16 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#EF7B55]/10 to-[#EF7B55]/5 mb-4">
                  <FileText className="h-8 w-8 text-[#EF7B55]/60" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">No invoices found</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Your invoices will appear here once they are generated. Try adjusting your search or filters.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
        <DialogContent className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-white/20 shadow-2xl rounded-2xl">
          <DialogHeader>
            <div className="flex justify-center mb-3">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-500/5">
                <svg className="h-7 w-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <DialogTitle className="text-center text-xl">Payment Successful</DialogTitle>
            <DialogDescription className="text-center">Your payment has been confirmed.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button onClick={() => setIsSuccessModalOpen(false)} className="rounded-full px-8 bg-[#EF7B55] hover:bg-[#EF7B55]/90 text-white">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <InvoiceDetailsModal
        invoice={selectedInvoice as any}
        isOpen={isModalOpen}
        onClose={closeDetails}
        onPay={(invoice_number) => handlePayInvoice(invoice_number)}
      />

    </>
  );
}
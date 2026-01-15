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
import { MoreHorizontal, Eye, Download, CreditCard, MessageSquare } from "lucide-react";
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

      // Read once
      const raw = await res.text();
      const payload = raw ? JSON.parse(raw) : null;

      console.log("confirm response ok?", res.ok, payload);

      if (!res.ok) {
        throw new Error(payload?.detail || payload?.error || "Failed to confirm payment");
      }


      if (payload?.status === "success") {
        // Clear params
        const url = new URL(window.location.href);
        ["status", "tx_ref", "transaction_id", "invoice_number"].forEach((k) =>
          url.searchParams.delete(k)
        );
        window.history.replaceState({}, "", url);

        await refetchInvoices();
        setIsSuccessModalOpen(true);
      } else if (payload?.status === "cancelled") {
        alert("Payment was cancelled.");
      } else {
        alert(payload?.detail || "Payment was not successful.");
      }

    } catch (e: any) {
      alert(e?.message || "Failed to confirm payment");
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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Recent Invoices</h2>
            <p className="text-sm text-muted-foreground">
              {displayInvoices.length} invoice{displayInvoices.length !== 1 && "s"} shown
            </p>
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-center py-4">
            {error}
          </div>
        )}

        <div className="grid gap-3">
          {displayInvoices.map((invoice, idx) => (
            <Card
              key={invoice.id}
              className="hover-lift shadow-sm"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-base">{invoice.number}</CardTitle>
                      <PaymentStatusBadge status={invoice.status} size="sm" />
                      <Badge variant="outline" className="text-xs capitalize">
                        {typeLabel(invoice.invoice_type)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Issued {safeDate(invoice.issued_at)} • Due {safeDate(invoice.due_at)}
                    </p>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">

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
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Type</p>
                    <p className="font-medium capitalize">{typeLabel(invoice.invoice_type)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Amount</p>
                    <p className="font-bold">{formatMoney(invoice.currency, invoice.amount)}</p>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-muted-foreground">Student Name</p>
                  <p className="font-bold">
                    {invoice.student_name}
                  </p>
                </div>

                <div className="mt-4 flex justify-end gap-2 border-t pt-3">
                  <Button variant="outline" size="sm" onClick={() => openDetails(invoice)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>

                  {invoice.status === "open" && (
                    <Button variant="outline" size="sm" onClick={() => handlePayInvoice(invoice.number)}>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {displayInvoices.length === 0 && !error && (
            <Card className="shadow-sm">
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No invoices found.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment Successful</DialogTitle>
            <DialogDescription>Your payment has been confirmed.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setIsSuccessModalOpen(false)}>Close</Button>
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
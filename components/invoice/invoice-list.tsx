// components/invoice/invoice-list.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PaymentStatusBadge } from "@/components/invoice/payment-status-badge";
import { InvoiceDetailsModal } from "@/components/invoice/invoice-details-modal";
import { Spinner } from "@/components/ui/spinner";
import { MoreHorizontal, Eye, Download, CreditCard } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useInvoiceFilters } from "@/hooks/use-invoice-filters";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

export function InvoiceList() {
  const { invoices, searchTerm, setInvoices } = useInvoiceFilters();  // <-- only read
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, []);


  useEffect(() => {
    const status = searchParams.get("status");
    const tx_ref = searchParams.get("tx_ref");
    const transaction_id = searchParams.get("transaction_id");
    const invoice_number = searchParams.get("invoice_number");
    if (status === "completed" && tx_ref && transaction_id && invoice_number) {
      confirmPayment(invoice_number, tx_ref, transaction_id);
    }
  }, [searchParams]);

  const refetchInvoices = async () => {
  try {
    const res = await fetch("/api/billing");
    if (res.ok) {
      const data = await res.json();
    
      setInvoices(data.results || []);
    }
  } catch {
  
  }
};

  const confirmPayment = async (
    invoice_id: string,
    tx_ref: string,
    transaction_id: string
  ) => {
    setPaymentLoading(true);
    try {
      const res = await fetch("/api/billing?action=confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoice_id, tx_ref, transaction_id }),
      });
      if (!res.ok) throw new Error("Failed to confirm payment");

      await refetchInvoices();
      setIsSuccessModalOpen(true);


      const url = new URL(window.location.href);
    url.searchParams.delete("status");
    url.searchParams.delete("tx_ref");
    url.searchParams.delete("transaction_id");
    url.searchParams.delete("invoice_number");
    window.history.replaceState({}, "", url);
    } catch {
      alert("Failed to confirm payment");
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

const downloadPDF = (invoice: Invoice) => {
    generateInvoicePDF(invoice);
  };

 
  const handlePayInvoice = async (invoice_number: string) => {
    setPaymentLoading(true);
    try {
      const redirect_url = `${window.location.origin}/invoice/invoices?invoice_number=${encodeURIComponent(
        invoice_number
      )}`;
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


  if (loading || paymentLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="md" />
      </div>
    );
  }
  if (error) return <p className="text-destructive">{error}</p>;


  const filtered = invoices.filter(
    (i) =>
      !searchTerm ||
      i.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.meta.parent_profile_id.toString().includes(searchTerm)
  );

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Recent Invoices</h2>
            <p className="text-sm text-muted-foreground">
              {filtered.length} invoice{filtered.length !== 1 && "s"} shown
            </p>
          </div>
        </div>

        <div className="grid gap-3">
          {filtered.map((invoice, idx) => (
            <Card
              key={invoice.id}
              className="hover-lift shadow-sm"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">
                        {invoice.number}
                      </CardTitle>
                      <PaymentStatusBadge status={invoice.status} size="sm" />
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openDetails(invoice)}>
                        <Eye className="h-4 w-4 mr-2" />View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => downloadPDF(invoice)}>
                        <Download className="h-4 w-4 mr-2" />Download PDF
                      </DropdownMenuItem>
                      {invoice.status === "open" && (
                        <DropdownMenuItem onClick={() => handlePayInvoice(invoice.number)}>
                          <CreditCard className="h-4 w-4 mr-2" />Pay Now
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Profile</p>
                    <p className="font-medium">
                      ID: {invoice.meta.parent_profile_id}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Amount</p>
                    <p className="font-bold">
                      {invoice.currency} {Number(invoice.amount).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Due</p>
                    <p className="font-medium">
                      {new Date(invoice.due_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Issued</p>
                    <p className="font-medium">
                      {new Date(invoice.issued_at).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric", year: "numeric" }
                      )}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex justify-end gap-2 border-t pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDetails(invoice)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  {invoice.status === "open" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePayInvoice(invoice.number)}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Success dialog */}
      <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment Successful</DialogTitle>
            <DialogDescription>
              Your payment has been confirmed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setIsSuccessModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details modal – receives **full invoice** */}
      <InvoiceDetailsModal
        invoice={selectedInvoice}
        isOpen={isModalOpen}
        onClose={closeDetails}
      />
    </>
  );
}
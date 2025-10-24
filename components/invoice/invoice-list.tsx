// components/invoice/invoice-list.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PaymentStatusBadge } from "@/components/invoice/payment-status-badge";
import { InvoiceDetailsModal } from "@/components/invoice/invoice-details-modal";
import { Spinner } from "@/components/ui/spinner";
import {
  MoreHorizontal,
  Eye,
  Download,
  Calendar,
  DollarSign,
  Building2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await fetch("/api/billing");
        if (!res.ok) throw new Error("Failed to fetch invoices");
        const data = await res.json();
        setInvoices(data.results || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const handleViewInvoice = (id: number) => {
    setSelectedInvoiceId(id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedInvoiceId(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="md" className="text-black" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-destructive">Error: {error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight md:text-xl lg:text-2xl">
              Recent Invoices
            </h2>
            <p className="text-muted-foreground text-sm md:text-base">
              Manage and track your invoice status
            </p>
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 w-fit">
            {invoices.length} Total
          </Badge>
        </div>

        <div className="grid gap-3">
          {invoices.map((invoice, index) => (
            <Card
              key={invoice.id}
              className="hover-lift border-0 shadow-sm bg-gradient-to-br from-card to-card/50 backdrop-blur animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base font-semibold md:text-lg">
                        {invoice.number}
                      </CardTitle>
                      <PaymentStatusBadge status={invoice.status} size="sm" />
                    </div>
                    <p className="text-xs text-muted-foreground md:text-sm">
                      Generated for parent profile
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => handleViewInvoice(invoice.id)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground md:text-sm">
                      <Building2 className="h-4 w-4" />
                      <span>Profile</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm md:text-base">
                        Parent ID: {invoice.meta.parent_profile_id}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground md:text-sm">
                      <DollarSign className="h-4 w-4" />
                      <span>Amount</span>
                    </div>
                    <p className="font-bold text-base md:text-lg">
                      {invoice.currency} {Number(invoice.amount).toLocaleString()}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground md:text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>Due Date</span>
                    </div>
                    <p className="font-medium text-sm md:text-base">
                      {new Date(invoice.due_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground md:text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>Issued</span>
                    </div>
                    <p className="font-medium text-sm md:text-base">
                      {new Date(invoice.issued_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap, sm:flex-row sm:items-center sm:justify-between mt-4 pt-3 border-t">
                  <div className="text-xs text-muted-foreground">
                    Status: <Badge variant="outline">{invoice.status}</Badge>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2 mt-2 sm:mt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover-lift bg-transparent w-full sm:w-auto py-2"
                      onClick={() => handleViewInvoice(invoice.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <InvoiceDetailsModal
        invoiceId={selectedInvoiceId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}
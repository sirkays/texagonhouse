"use client";

import {useState} from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Separator} from "@/components/ui/separator";
import {PaymentStatusBadge} from "@/components/invoice/payment-status-badge";
import {
  Download,
  Eye,
  Calendar,
  DollarSign,
  FileText,
  Clock,
  Building2,
  Mail,
} from "lucide-react";
import {format} from "date-fns";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface InvoiceDetail {
  id: string;
  number: string;
  client: {
    name: string;
    company: string;
    email: string;
  };
  amount: number;
  status: "paid" | "pending" | "overdue" | "failed";
  dueDate: string;
  issueDate: string;
  description: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  notes?: string;
  paymentMethod?: string;
}

interface InvoiceDetailsModalProps {
  invoiceId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

// Mock detailed invoice data
const mockInvoiceDetails: Record<string, InvoiceDetail> = {
  "INV-001": {
    id: "INV-001",
    number: "INV-2024-001",
    client: {
      name: "John Smith",
      company: "Acme Corp",
      email: "john@acme.com",
    },
    amount: 2500.0,
    status: "paid",
    dueDate: "2024-02-15",
    issueDate: "2024-01-15",
    description: "Web Development Services",
    items: [
      {
        id: "1",
        description: "Frontend Development",
        quantity: 40,
        unitPrice: 50.0,
        total: 2000.0,
      },
      {
        id: "2",
        description: "Backend Integration",
        quantity: 10,
        unitPrice: 60.0,
        total: 600.0,
      },
    ],
    subtotal: 2600.0,
    taxRate: 0.08,
    taxAmount: 208.0,
    discount: 308.0,
    paymentMethod: "Bank Transfer",
    notes: "Payment received on time. Excellent client relationship.",
  },
  "INV-002": {
    id: "INV-002",
    number: "INV-2024-002",
    client: {
      name: "Sarah Johnson",
      company: "Tech Solutions Inc",
      email: "sarah@techsolutions.com",
    },
    amount: 1800.0,
    status: "pending",
    dueDate: "2024-02-20",
    issueDate: "2024-01-20",
    description: "UI/UX Design Package",
    items: [
      {
        id: "1",
        description: "UI Design System",
        quantity: 20,
        unitPrice: 75.0,
        total: 1500.0,
      },
      {
        id: "2",
        description: "UX Research",
        quantity: 8,
        unitPrice: 50.0,
        total: 400.0,
      },
    ],
    subtotal: 1900.0,
    taxRate: 0.08,
    taxAmount: 152.0,
    discount: 252.0,
    notes: "Awaiting client approval for final designs.",
  },
  "INV-003": {
    id: "INV-003",
    number: "INV-2024-003",
    client: {
      name: "Michael Brown",
      company: "StartupXYZ",
      email: "mike@startupxyz.com",
    },
    amount: 3200.0,
    status: "overdue",
    dueDate: "2024-01-30",
    issueDate: "2024-01-01",
    description: "Full Stack Development",
    items: [
      {
        id: "1",
        description: "Full Stack Development",
        quantity: 50,
        unitPrice: 70.0,
        total: 3500.0,
      },
    ],
    subtotal: 3500.0,
    taxRate: 0.08,
    taxAmount: 280.0,
    discount: 580.0,
    notes: "Payment overdue. Follow-up required urgently.",
  },
  "INV-004": {
    id: "INV-004",
    number: "INV-2024-004",
    client: {
      name: "Emily Davis",
      company: "Creative Agency",
      email: "emily@creative.com",
    },
    amount: 950.0,
    status: "failed",
    dueDate: "2024-02-10",
    issueDate: "2024-01-10",
    description: "Brand Identity Design",
    items: [
      {
        id: "1",
        description: "Brand Identity Package",
        quantity: 1,
        unitPrice: 1000.0,
        total: 1000.0,
      },
    ],
    subtotal: 1000.0,
    taxRate: 0.08,
    taxAmount: 80.0,
    discount: 130.0,
    notes: "Payment failed due to insufficient funds. Retry scheduled.",
  },
};

export function InvoiceDetailsModal({
  invoiceId,
  isOpen,
  onClose,
}: InvoiceDetailsModalProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  if (!invoiceId || !isOpen) {
    return null;
  }

  const invoice = mockInvoiceDetails[invoiceId];

  if (!invoice) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[90vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl">
              Invoice Not Found
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 text-center">
            <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              The selected invoice details could not be loaded
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const pdfContent = generateInvoicePDFContent(invoice);
      const blob = new Blob([pdfContent], {type: "text/plain"});
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${invoice.number}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log("[v0] Invoice PDF downloaded for", invoice.number);
    } catch (error) {
      console.error("[v0] Error generating PDF:", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handlePreview = () => {
    console.log("[v0] Previewing invoice", invoice.number);
    // In a real app, this would open a print preview or new tab
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] sm:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <DialogTitle className="text-lg md:text-xl">
              Invoice Details
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreview}
                className="py-2">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="py-2">
                <Download className="h-4 w-4 mr-2" />
                {isGeneratingPDF ? "Generating..." : "Download PDF"}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Invoice Header */}
          <div className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold md:text-xl">
                  {invoice.number}
                </h3>
                <p className="text-xs text-muted-foreground md:text-sm">
                  {invoice.description}
                </p>
              </div>
              <PaymentStatusBadge status={invoice.status} size="sm" />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground md:text-sm">
                    Date Issued:
                  </span>
                </div>
                <p className="font-medium text-sm md:text-base">
                  {format(new Date(invoice.issueDate), "MMM dd, yyyy")}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground md:text-sm">
                    Due Date:
                  </span>
                </div>
                <p className="font-medium text-sm md:text-base">
                  {format(new Date(invoice.dueDate), "MMM dd, yyyy")}
                </p>
              </div>
            </div>

            {/* Client Information */}
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground md:text-sm">
                  Bill To:
                </span>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-base md:text-lg">
                  {invoice.client.name}
                </p>
                <p className="text-xs text-muted-foreground md:text-sm">
                  {invoice.client.company}
                </p>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground md:text-sm">
                    {invoice.client.email}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Invoice Items */}
          <div className="space-y-3">
            <h4 className="font-semibold text-base md:text-lg">Items</h4>
            <div className="space-y-2">
              {invoice.items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm md:text-base">
                      {item.description}
                    </p>
                    <p className="text-xs text-muted-foreground md:text-sm">
                      {item.quantity} × ${item.unitPrice.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-base md:text-lg">
                      $
                      {item.total.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Payment Summary */}
          <div className="space-y-3">
            <h4 className="font-semibold text-base md:text-lg">
              Payment Summary
            </h4>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-xs md:text-sm">
                  Subtotal:
                </span>
                <span className="font-medium text-sm md:text-base">
                  ${invoice.subtotal.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground text-xs md:text-sm">
                  Tax ({(invoice.taxRate * 100).toFixed(0)}%):
                </span>
                <span className="font-medium text-sm md:text-base">
                  ${invoice.taxAmount.toFixed(2)}
                </span>
              </div>

              {invoice.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="text-xs md:text-sm">Discount:</span>
                  <span className="font-medium text-sm md:text-base">
                    -${invoice.discount.toFixed(2)}
                  </span>
                </div>
              )}

              <Separator />

              <div className="flex justify-between text-base font-bold md:text-lg">
                <span>Total Amount:</span>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 md:h-5 md:w-5" />
                  <span>
                    {invoice.amount.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Additional Information */}
          <div className="space-y-3">
            {invoice.paymentMethod && (
              <div>
                <p className="text-muted-foreground mb-1 text-xs md:text-sm">
                  Payment Method:
                </p>
                <Badge variant="outline" className="font-medium text-sm">
                  {invoice.paymentMethod}
                </Badge>
              </div>
            )}

            {invoice.notes && (
              <div className="text-sm">
                <p className="text-muted-foreground mb-1 text-xs md:text-sm">
                  Notes:
                </p>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm md:text-base">{invoice.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function generateInvoicePDFContent(invoice: InvoiceDetail): string {
  return `
INVOICE: ${invoice.number}
${invoice.description}
Status: ${invoice.status.toUpperCase()}

Date Issued: ${format(new Date(invoice.issueDate), "MMM dd, yyyy")}
Due Date: ${format(new Date(invoice.dueDate), "MMM dd, yyyy")}

BILL TO:
${invoice.client.name}
${invoice.client.company}
${invoice.client.email}

ITEMS:
${invoice.items
  .map(
    (item) => `- ${item.description}
  ${item.quantity} × $${item.unitPrice.toFixed(2)} = $${item.total.toFixed(2)}`
  )
  .join("\n")}

PAYMENT SUMMARY:
Subtotal: $${invoice.subtotal.toFixed(2)}
Tax (${(invoice.taxRate * 100).toFixed(0)}%): $${invoice.taxAmount.toFixed(2)}
${invoice.discount > 0 ? `Discount: -$${invoice.discount.toFixed(2)}\n` : ""}
TOTAL: $${invoice.amount.toFixed(2)}

${invoice.paymentMethod ? `Payment Method: ${invoice.paymentMethod}\n` : ""}
${invoice.notes ? `Notes: ${invoice.notes}\n` : ""}
  `.trim();
}

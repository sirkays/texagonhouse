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
} from "lucide-react";
import {format} from "date-fns";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface TransactionDetail {
  id: string;
  invoiceNumber: string;
  dateIssued: string;
  dueDate: string;
  recipient: string;
  status: "paid" | "pending" | "overdue" | "failed";
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  totalAmount: number;
  lastUpdated: string;
  paymentMethod?: string;
  notes?: string;
}

interface TransactionDetailsModalProps {
  transactionId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

// Mock data - in real app this would come from API
const mockTransactionDetails: Record<string, TransactionDetail> = {
  "TXN-001": {
    id: "TXN-001",
    invoiceNumber: "INV-2024-001",
    dateIssued: "2024-01-15",
    dueDate: "2024-02-15",
    recipient: "Acme Corporation",
    status: "paid",
    items: [
      {
        id: "1",
        description: "Web Development Services",
        quantity: 40,
        unitPrice: 50.0,
        total: 2000.0,
      },
      {
        id: "2",
        description: "UI/UX Design",
        quantity: 10,
        unitPrice: 75.0,
        total: 750.0,
      },
    ],
    subtotal: 2750.0,
    taxRate: 0.08,
    taxAmount: 220.0,
    discount: 470.0,
    totalAmount: 2500.0,
    lastUpdated: "2024-01-16T10:30:00Z",
    paymentMethod: "Bank Transfer",
    notes: "Payment received on time. Thank you for your business.",
  },
  "TXN-002": {
    id: "TXN-002",
    invoiceNumber: "INV-2024-002",
    dateIssued: "2024-01-14",
    dueDate: "2024-02-14",
    recipient: "Tech Solutions Ltd",
    status: "pending",
    items: [
      {
        id: "1",
        description: "Software Consulting",
        quantity: 20,
        unitPrice: 60.0,
        total: 1200.0,
      },
    ],
    subtotal: 1200.0,
    taxRate: 0.08,
    taxAmount: 96.0,
    discount: 95.5,
    totalAmount: 1200.5,
    lastUpdated: "2024-01-14T14:20:00Z",
    notes: "Awaiting payment confirmation.",
  },
  "TXN-003": {
    id: "TXN-003",
    invoiceNumber: "INV-2024-003",
    dateIssued: "2024-01-12",
    dueDate: "2024-01-27",
    recipient: "Digital Services Inc",
    status: "overdue",
    items: [
      {
        id: "1",
        description: "Mobile App Development",
        quantity: 15,
        unitPrice: 80.0,
        total: 1200.0,
      },
    ],
    subtotal: 1200.0,
    taxRate: 0.08,
    taxAmount: 96.0,
    discount: 446.0,
    totalAmount: 850.0,
    lastUpdated: "2024-01-28T09:15:00Z",
    notes: "Payment overdue. Follow-up required.",
  },
  "TXN-004": {
    id: "TXN-004",
    invoiceNumber: "INV-2024-004",
    dateIssued: "2024-01-10",
    dueDate: "2024-02-10",
    recipient: "Global Enterprises",
    status: "paid",
    items: [
      {
        id: "1",
        description: "Enterprise Consulting",
        quantity: 50,
        unitPrice: 65.0,
        total: 3250.0,
      },
    ],
    subtotal: 3250.0,
    taxRate: 0.08,
    taxAmount: 260.0,
    discount: 309.25,
    totalAmount: 3200.75,
    lastUpdated: "2024-01-11T16:45:00Z",
    paymentMethod: "Credit Card",
    notes: "Large enterprise client. Excellent payment history.",
  },
  "TXN-005": {
    id: "TXN-005",
    invoiceNumber: "INV-2024-005",
    dateIssued: "2024-01-08",
    dueDate: "2024-02-08",
    recipient: "StartUp Co",
    status: "failed",
    items: [
      {
        id: "1",
        description: "Startup Consulting Package",
        quantity: 10,
        unitPrice: 70.0,
        total: 700.0,
      },
    ],
    subtotal: 700.0,
    taxRate: 0.08,
    taxAmount: 56.0,
    discount: 80.75,
    totalAmount: 675.25,
    lastUpdated: "2024-01-09T11:20:00Z",
    notes: "Payment failed due to insufficient funds. Retry scheduled.",
  },
  "TXN-006": {
    id: "TXN-006",
    invoiceNumber: "INV-2024-006",
    dateIssued: "2024-01-05",
    dueDate: "2024-02-05",
    recipient: "Enterprise Solutions",
    status: "paid",
    items: [
      {
        id: "1",
        description: "Full Stack Development",
        quantity: 60,
        unitPrice: 70.0,
        total: 4200.0,
      },
    ],
    subtotal: 4200.0,
    taxRate: 0.08,
    taxAmount: 336.0,
    discount: 436.0,
    totalAmount: 4100.0,
    lastUpdated: "2024-01-06T13:30:00Z",
    paymentMethod: "Wire Transfer",
    notes: "Premium client with priority support included.",
  },
};

export function TransactionDetailsModal({
  transactionId,
  isOpen,
  onClose,
}: TransactionDetailsModalProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  if (!transactionId || !isOpen) {
    return null;
  }

  const transaction = mockTransactionDetails[transactionId];

  if (!transaction) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[90vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl">
              Transaction Not Found
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 text-center">
            <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              The selected transaction details could not be loaded
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      // Simulate PDF generation delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // In a real app, this would generate and download a PDF
      // For now, we'll create a simple text-based "PDF" content
      const pdfContent = generatePDFContent(transaction);
      const blob = new Blob([pdfContent], {type: "text/plain"});
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${transaction.invoiceNumber}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log("[v0] PDF downloaded for", transaction.invoiceNumber);
    } catch (error) {
      console.error("[v0] Error generating PDF:", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handlePreview = () => {
    // In a real app, this would open a preview modal or new tab
    console.log("[v0] Previewing", transaction.invoiceNumber);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] sm:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <DialogTitle className="text-lg md:text-xl">
              Transaction Details
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
          {/* Transaction Header */}
          <div className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold md:text-xl">
                  {transaction.invoiceNumber}
                </h3>
                <p className="text-xs text-muted-foreground md:text-sm">
                  Transaction ID: {transaction.id}
                </p>
              </div>
              <PaymentStatusBadge status={transaction.status} size="sm" />
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
                  {format(new Date(transaction.dateIssued), "MMM dd, yyyy")}
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
                  {format(new Date(transaction.dueDate), "MMM dd, yyyy")}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground md:text-sm mb-1">
                Bill To:
              </p>
              <p className="font-medium text-base md:text-lg">
                {transaction.recipient}
              </p>
            </div>
          </div>

          <Separator />

          {/* Transaction Items */}
          <div className="space-y-3">
            <h4 className="font-semibold text-base md:text-lg">Items</h4>
            <div className="space-y-2">
              {transaction.items.map((item) => (
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
                  ${transaction.subtotal.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground text-xs md:text-sm">
                  Tax ({(transaction.taxRate * 100).toFixed(0)}%):
                </span>
                <span className="font-medium text-sm md:text-base">
                  ${transaction.taxAmount.toFixed(2)}
                </span>
              </div>

              {transaction.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="text-xs md:text-sm">Discount:</span>
                  <span className="font-medium text-sm md:text-base">
                    -${transaction.discount.toFixed(2)}
                  </span>
                </div>
              )}

              <Separator />

              <div className="flex justify-between text-base font-bold md:text-lg">
                <span>Total Amount:</span>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 md:h-5 md:w-5" />
                  <span>
                    {transaction.totalAmount.toLocaleString("en-US", {
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
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm">
              <div>
                <p className="text-muted-foreground mb-1 text-xs md:text-sm">
                  Last Updated:
                </p>
                <p className="font-medium text-sm md:text-base">
                  {format(
                    new Date(transaction.lastUpdated),
                    "MMM dd, yyyy 'at' h:mm a"
                  )}
                </p>
              </div>

              {transaction.paymentMethod && (
                <div>
                  <p className="text-muted-foreground mb-1 text-xs md:text-sm">
                    Payment Method:
                  </p>
                  <Badge variant="outline" className="font-medium text-sm">
                    {transaction.paymentMethod}
                  </Badge>
                </div>
              )}
            </div>

            {transaction.notes && (
              <div className="text-sm">
                <p className="text-muted-foreground mb-1 text-xs md:text-sm">
                  Notes:
                </p>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm md:text-base">{transaction.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function generatePDFContent(transaction: TransactionDetail): string {
  return `
INVOICE: ${transaction.invoiceNumber}
Transaction ID: ${transaction.id}
Status: ${transaction.status.toUpperCase()}

Date Issued: ${format(new Date(transaction.dateIssued), "MMM dd, yyyy")}
Due Date: ${format(new Date(transaction.dueDate), "MMM dd, yyyy")}

Bill To: ${transaction.recipient}

ITEMS:
${transaction.items
  .map(
    (item) =>
      `- ${item.description}\n  ${item.quantity} × $${item.unitPrice.toFixed(
        2
      )} = $${item.total.toFixed(2)}`
  )
  .join("\n")}

PAYMENT SUMMARY:
Subtotal: $${transaction.subtotal.toFixed(2)}
Tax (${(transaction.taxRate * 100).toFixed(
    0
  )}%): $${transaction.taxAmount.toFixed(2)}
${
  transaction.discount > 0
    ? `Discount: -$${transaction.discount.toFixed(2)}\n`
    : ""
}
TOTAL: $${transaction.totalAmount.toFixed(2)}

${
  transaction.paymentMethod
    ? `Payment Method: ${transaction.paymentMethod}\n`
    : ""
}
${transaction.notes ? `Notes: ${transaction.notes}\n` : ""}

Last Updated: ${format(
    new Date(transaction.lastUpdated),
    "MMM dd, yyyy 'at' h:mm a"
  )}
  `.trim();
}

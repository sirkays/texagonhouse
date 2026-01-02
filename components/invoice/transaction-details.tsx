"use client";

import {useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Separator} from "@/components/ui/separator";
import {PaymentStatusBadge} from "@/components/invoice/payment-status-badge";
import {TransactionDetailsModal} from "@/components/invoice/transaction-details-modal";
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

interface TransactionDetailsProps {
  transactionId: string | null;
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
};

export function TransactionDetails({transactionId}: TransactionDetailsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!transactionId) {
    return (
      <Card className="h-fit">
        <CardContent className="p-8 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Select a Transaction</h3>
          <p className="text-muted-foreground text-sm">
            Choose a transaction from the history to view detailed information
          </p>
        </CardContent>
      </Card>
    );
  }

  const transaction = mockTransactionDetails[transactionId];

  if (!transaction) {
    return (
      <Card className="h-fit">
        <CardContent className="p-8 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Transaction Not Found</h3>
          <p className="text-muted-foreground text-sm">
            The selected transaction details could not be loaded
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleDownloadPDF = () => {
    // In a real app, this would generate and download a PDF
  };

  const handlePreview = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Card className="h-fit">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Transaction Details</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePreview}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Invoice Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">
                  {transaction.invoiceNumber}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Transaction ID: {transaction.id}
                </p>
              </div>
              <PaymentStatusBadge status={transaction.status} />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Date Issued:</span>
                </div>
                <p className="font-medium">
                  {format(new Date(transaction.dateIssued), "MMM dd, yyyy")}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Due Date:</span>
                </div>
                <p className="font-medium">
                  {format(new Date(transaction.dueDate), "MMM dd, yyyy")}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Bill To:</p>
              <p className="font-medium">{transaction.recipient}</p>
            </div>
          </div>

          <Separator />

          {/* Invoice Items */}
          <div className="space-y-4">
            <h4 className="font-medium">Items</h4>
            <div className="space-y-3">
              {transaction.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} × ${item.unitPrice.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
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
            <h4 className="font-medium">Payment Summary</h4>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>${transaction.subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Tax ({(transaction.taxRate * 100).toFixed(0)}%):
                </span>
                <span>${transaction.taxAmount.toFixed(2)}</span>
              </div>

              {transaction.discount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Discount:</span>
                  <span>-${transaction.discount.toFixed(2)}</span>
                </div>
              )}

              <Separator />

              <div className="flex justify-between text-lg font-semibold">
                <span>Total Amount:</span>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
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
          <div className="space-y-4">
            <div className="text-sm">
              <p className="text-muted-foreground mb-1">Last Updated:</p>
              <p className="font-medium">
                {format(
                  new Date(transaction.lastUpdated),
                  "MMM dd, yyyy 'at' h:mm a"
                )}
              </p>
            </div>

            {transaction.paymentMethod && (
              <div className="text-sm">
                <p className="text-muted-foreground mb-1">Payment Method:</p>
                <Badge variant="outline">{transaction.paymentMethod}</Badge>
              </div>
            )}

            {transaction.notes && (
              <div className="text-sm">
                <p className="text-muted-foreground mb-2">Notes:</p>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm">{transaction.notes}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <TransactionDetailsModal
        transactionId={transactionId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}

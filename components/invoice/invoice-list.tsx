"use client";

import {useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {PaymentStatusBadge} from "@/components/invoice/payment-status-badge";
import {InvoiceDetailsModal} from "@/components/invoice/invoice-details-modal";
import {
  MoreHorizontal,
  Eye,
  Edit,
  Send,
  Download,
  Calendar,
  DollarSign,
  User,
  Building2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Invoice {
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
  items: number;
}

const mockInvoices: Invoice[] = [
  {
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
    items: 3,
  },
  {
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
    items: 2,
  },
  {
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
    items: 5,
  },
  {
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
    items: 1,
  },
];

export function InvoiceList() {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewInvoice = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedInvoiceId(null);
  };

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
          <Badge
            variant="outline"
            className="bg-primary/10 text-primary border-primary/20 w-fit">
            {mockInvoices.length} Total
          </Badge>
        </div>

        <div className="grid gap-3">
          {mockInvoices.map((invoice, index) => (
            <Card
              key={invoice.id}
              className="hover-lift border-0 shadow-sm bg-gradient-to-br from-card to-card/50 backdrop-blur animate-slide-up"
              style={{animationDelay: `${index * 0.1}s`}}>
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
                      {invoice.description}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onClick={() => handleViewInvoice(invoice.id)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Invoice
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Send className="h-4 w-4 mr-2" />
                        Send Reminder
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
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
                      <span>Client</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm md:text-base">
                        {invoice.client.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {invoice.client.company}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground md:text-sm">
                      <DollarSign className="h-4 w-4" />
                      <span>Amount</span>
                    </div>
                    <p className="font-bold text-base md:text-lg">
                      $
                      {invoice.amount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground md:text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>Due Date</span>
                    </div>
                    <p className="font-medium text-sm md:text-base">
                      {new Date(invoice.dueDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground md:text-sm">
                      <User className="h-4 w-4" />
                      <span>Items</span>
                    </div>
                    <p className="font-medium text-sm md:text-base">
                      {invoice.items} items
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mt-4 pt-3 border-t">
                  <div className="text-xs text-muted-foreground">
                    Issued:{" "}
                    {new Date(invoice.issueDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover-lift bg-transparent w-full sm:w-auto py-2"
                      onClick={() => handleViewInvoice(invoice.id)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    {invoice.status === "pending" && (
                      <Button
                        size="sm"
                        className="hover-lift bg-[#f79771] hover:bg-gray-300 w-full sm:w-auto py-2">
                        <Send className="h-4 w-4 mr-2" />
                        Send
                      </Button>
                    )}
                    {invoice.status === "overdue" && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="hover-lift w-full sm:w-auto py-2">
                        <Send className="h-4 w-4 mr-2" />
                        Remind
                      </Button>
                    )}
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

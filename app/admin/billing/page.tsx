"use client";

import {useState} from "react";
import DashboardLayout from "@/app/admin/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Input} from "@/components/ui/input";
import {Search, DollarSign, CreditCard, Download, Eye} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {InvoiceDetailsModal} from "@/components/admin/modals/invoice-details-modal";

export default function BillingPage() {
  const [viewingInvoice, setViewingInvoice] = useState<any>(null);

  const subscriptionPlans = [
    {
      id: 1,
      name: "Basic Plan",
      price: 99,
      billingPeriod: "30",
      studentLimit: 50,
      activeSubscriptions: 12,
    },
    {
      id: 2,
      name: "Standard Plan",
      price: 199,
      billingPeriod: "30",
      studentLimit: 150,
      activeSubscriptions: 28,
    },
    {
      id: 3,
      name: "Premium Plan",
      price: 399,
      billingPeriod: "30",
      studentLimit: 500,
      activeSubscriptions: 8,
    },
    {
      id: 4,
      name: "Enterprise Plan",
      price: 799,
      billingPeriod: "30",
      studentLimit: 0,
      activeSubscriptions: 3,
    },
  ];

  const recentInvoices = [
    {
      id: 1,
      number: "INV-2024-001",
      parent: "Mr. John Doe",
      amount: 199,
      status: "paid",
      issuedAt: "2024-03-15",
      dueAt: "2024-03-20",
    },
    {
      id: 2,
      number: "INV-2024-002",
      parent: "Mrs. Sarah Smith",
      amount: 199,
      status: "paid",
      issuedAt: "2024-03-14",
      dueAt: "2024-03-19",
    },
    {
      id: 3,
      number: "INV-2024-003",
      parent: "Mr. Robert Johnson",
      amount: 99,
      status: "open",
      issuedAt: "2024-03-16",
      dueAt: "2024-03-21",
    },
    {
      id: 4,
      number: "INV-2024-004",
      parent: "Mrs. Lisa Williams",
      amount: 399,
      status: "paid",
      issuedAt: "2024-03-13",
      dueAt: "2024-03-18",
    },
    {
      id: 5,
      number: "INV-2024-005",
      parent: "Mr. James Brown",
      amount: 199,
      status: "active",
      issuedAt: "2024-03-17",
      dueAt: "2024-03-22",
    },
  ];

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Billing & Subscriptions
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage subscription plans and invoices
            </p>
          </div>
        </div>

        {/* Revenue Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Monthly Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">$45,231</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-accent">+12.5%</span> from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Subscriptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">51</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-accent">+3</span> new this month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">8</div>
              <p className="text-xs text-muted-foreground mt-1">$1,592 total</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Collection Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">96%</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-accent">+2%</span> improvement
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Plans */}
        {/* <Card>
          <CardHeader>
            <CardTitle>Subscription Plans</CardTitle>
            <CardDescription>Available plans and pricing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {subscriptionPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="p-4 rounded-lg border border-border hover:shadow-md transition-shadow">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {plan.name}
                      </h3>
                      <div className="flex items-baseline gap-1 mt-2">
                        <span className="text-3xl font-bold text-foreground">
                          ${plan.price}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          /month
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Student Limit
                        </span>
                        <span className="font-medium text-foreground">
                          {plan.studentLimit === 0
                            ? "Unlimited"
                            : plan.studentLimit}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Active</span>
                        <Badge variant="secondary">
                          {plan.activeSubscriptions}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      className="w-full bg-transparent"
                      variant="outline"
                      size="sm">
                      Manage Plan
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card> */}

        {/* Recent Invoices */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Invoices</CardTitle>
                <CardDescription>Latest billing transactions</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search invoices..." className="pl-9" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice Number</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Issued Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono text-sm">
                          {invoice.number}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {invoice.parent}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-muted-foreground" />
                        <span className="font-semibold">{invoice.amount}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {invoice.issuedAt}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {invoice.dueAt}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          invoice.status === "paid" ? "default" : "secondary"
                        }
                        className="capitalize">
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewingInvoice(invoice)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Details Modal */}
      <InvoiceDetailsModal
        open={!!viewingInvoice}
        onOpenChange={(open) => !open && setViewingInvoice(null)}
        invoice={viewingInvoice}
      />
    </>
  );
}

"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Separator} from "@/components/ui/separator";
import {
  Download,
  TrendingUp,
  DollarSign,
  FileText,
  BarChart3,
} from "lucide-react";
import {format} from "date-fns";

interface ReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mock reports data
const mockReportsData = {
  summary: {
    totalRevenue: 45750.0,
    totalInvoices: 24,
    paidInvoices: 18,
    pendingInvoices: 4,
    overdueInvoices: 2,
    averageInvoiceValue: 1906.25,
    monthlyGrowth: 12.5,
  },
  monthlyBreakdown: [
    {month: "January", revenue: 15250.0, invoices: 8, paidRate: 87.5},
    {month: "February", revenue: 18750.0, invoices: 10, paidRate: 90.0},
    {month: "March", revenue: 11750.0, invoices: 6, paidRate: 83.3},
  ],
  topClients: [
    {name: "Acme Corp", revenue: 8500.0, invoices: 4},
    {name: "Tech Solutions Inc", revenue: 6750.0, invoices: 3},
    {name: "StartupXYZ", revenue: 5200.0, invoices: 2},
  ],
  paymentStatus: {
    paid: {count: 18, percentage: 75.0, amount: 34125.0},
    pending: {count: 4, percentage: 16.7, amount: 7625.0},
    overdue: {count: 2, percentage: 8.3, amount: 4000.0},
  },
};

export function ReportsModal({isOpen, onClose}: ReportsModalProps) {
  const handleDownloadReport = () => {
    const reportContent = generateReportContent();
    const blob = new Blob([reportContent], {type: "text/plain"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `financial-report-${format(new Date(), "yyyy-MM-dd")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">Financial Reports</DialogTitle>
            <Button variant="outline" size="sm" onClick={handleDownloadReport}>
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${mockReportsData.summary.totalRevenue.toLocaleString()}
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />+
                  {mockReportsData.summary.monthlyGrowth}% from last month
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Invoices
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mockReportsData.summary.totalInvoices}
                </div>
                <div className="text-xs text-muted-foreground">
                  {mockReportsData.summary.paidInvoices} paid,{" "}
                  {mockReportsData.summary.pendingInvoices} pending
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Invoice
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  $
                  {mockReportsData.summary.averageInvoiceValue.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  Per invoice value
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Payment Rate
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mockReportsData.paymentStatus.paid.percentage}%
                </div>
                <div className="text-xs text-muted-foreground">
                  Invoices paid on time
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Monthly Breakdown */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Monthly Breakdown</h3>
            <div className="grid gap-4">
              {mockReportsData.monthlyBreakdown.map((month) => (
                <Card key={month.month}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{month.month}</h4>
                        <p className="text-sm text-muted-foreground">
                          {month.invoices} invoices
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          ${month.revenue.toLocaleString()}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {month.paidRate}% paid
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          {/* Top Clients */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Top Clients</h3>
            <div className="space-y-3">
              {mockReportsData.topClients.map((client, index) => (
                <div
                  key={client.name}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">
                        #{index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{client.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {client.invoices} invoices
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      ${client.revenue.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Payment Status Breakdown */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Payment Status Breakdown
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-green-200 bg-green-50/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Paid</p>
                      <p className="text-2xl font-bold text-green-600">
                        {mockReportsData.paymentStatus.paid.count}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        $
                        {mockReportsData.paymentStatus.paid.amount.toLocaleString()}
                      </p>
                      <Badge
                        variant="outline"
                        className="text-green-600 border-green-600">
                        {mockReportsData.paymentStatus.paid.percentage}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-yellow-200 bg-yellow-50/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {mockReportsData.paymentStatus.pending.count}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        $
                        {mockReportsData.paymentStatus.pending.amount.toLocaleString()}
                      </p>
                      <Badge
                        variant="outline"
                        className="text-yellow-600 border-yellow-600">
                        {mockReportsData.paymentStatus.pending.percentage}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-red-50/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Overdue</p>
                      <p className="text-2xl font-bold text-red-600">
                        {mockReportsData.paymentStatus.overdue.count}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        $
                        {mockReportsData.paymentStatus.overdue.amount.toLocaleString()}
                      </p>
                      <Badge
                        variant="outline"
                        className="text-red-600 border-red-600">
                        {mockReportsData.paymentStatus.overdue.percentage}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function generateReportContent(): string {
  const data = mockReportsData;
  return `
FINANCIAL REPORT
Generated: ${format(new Date(), "MMM dd, yyyy 'at' h:mm a")}

SUMMARY:
Total Revenue: $${data.summary.totalRevenue.toLocaleString()}
Total Invoices: ${data.summary.totalInvoices}
Paid Invoices: ${data.summary.paidInvoices}
Pending Invoices: ${data.summary.pendingInvoices}
Overdue Invoices: ${data.summary.overdueInvoices}
Average Invoice Value: $${data.summary.averageInvoiceValue.toLocaleString()}
Monthly Growth: ${data.summary.monthlyGrowth}%

MONTHLY BREAKDOWN:
${data.monthlyBreakdown
  .map(
    (month) =>
      `${month.month}: $${month.revenue.toLocaleString()} (${
        month.invoices
      } invoices, ${month.paidRate}% paid)`
  )
  .join("\n")}

TOP CLIENTS:
${data.topClients
  .map(
    (client, index) =>
      `${index + 1}. ${client.name}: $${client.revenue.toLocaleString()} (${
        client.invoices
      } invoices)`
  )
  .join("\n")}

PAYMENT STATUS:
Paid: ${
    data.paymentStatus.paid.count
  } invoices ($${data.paymentStatus.paid.amount.toLocaleString()}) - ${
    data.paymentStatus.paid.percentage
  }%
Pending: ${
    data.paymentStatus.pending.count
  } invoices ($${data.paymentStatus.pending.amount.toLocaleString()}) - ${
    data.paymentStatus.pending.percentage
  }%
Overdue: ${
    data.paymentStatus.overdue.count
  } invoices ($${data.paymentStatus.overdue.amount.toLocaleString()}) - ${
    data.paymentStatus.overdue.percentage
  }%
  `.trim();
}

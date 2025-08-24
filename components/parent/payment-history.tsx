"use client";

import {useState} from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Badge} from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CreditCard,
  Search,
  Download,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Receipt,
  RefreshCw,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

export function PaymentHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const payments = [
    {
      id: "PAY-2024-001",
      date: "2024-01-15",
      description: "Monthly Subscription - Premium Plan",
      amount: "₦25,000",
      method: "Bank Transfer",
      status: "Completed",
      children: ["John Adebayo", "Mary Adebayo"],
      invoiceUrl: "#",
      nextBilling: "2024-02-15",
    },
    {
      id: "PAY-2023-012",
      date: "2023-12-15",
      description: "Monthly Subscription - Premium Plan",
      amount: "₦25,000",
      method: "Card Payment",
      status: "Completed",
      children: ["John Adebayo", "Mary Adebayo"],
      invoiceUrl: "#",
      nextBilling: "2024-01-15",
    },
    {
      id: "PAY-2023-011",
      date: "2023-12-10",
      description: "Private Tutoring Session - Mathematics",
      amount: "₦8,000",
      method: "Card Payment",
      status: "Completed",
      children: ["John Adebayo"],
      invoiceUrl: "#",
      nextBilling: null,
    },
    {
      id: "PAY-2023-010",
      date: "2023-11-15",
      description: "Monthly Subscription - Premium Plan",
      amount: "₦25,000",
      method: "Bank Transfer",
      status: "Failed",
      children: ["John Adebayo", "Mary Adebayo"],
      invoiceUrl: "#",
      nextBilling: "2023-12-15",
    },
    {
      id: "PAY-2023-009",
      date: "2023-11-05",
      description: "E-commerce Purchase - Educational Materials",
      amount: "₦15,500",
      method: "BNPL - Credit Direct",
      status: "Pending",
      children: ["Mary Adebayo"],
      invoiceUrl: "#",
      nextBilling: null,
    },
    {
      id: "PAY-2023-008",
      date: "2023-10-15",
      description: "Monthly Subscription - Premium Plan",
      amount: "₦25,000",
      method: "Card Payment",
      status: "Completed",
      children: ["John Adebayo", "Mary Adebayo"],
      invoiceUrl: "#",
      nextBilling: "2023-11-15",
    },
  ];

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.method.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPeriod =
      selectedPeriod === "all" ||
      (selectedPeriod === "month" &&
        new Date(payment.date).getMonth() === new Date().getMonth()) ||
      (selectedPeriod === "quarter" &&
        new Date(payment.date) >=
          new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)) ||
      (selectedPeriod === "year" &&
        new Date(payment.date).getFullYear() === new Date().getFullYear());

    return matchesSearch && matchesPeriod;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return (
          <Badge className="bg-green-100 text-green-800 text-xs sm:text-sm">
            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            Completed
          </Badge>
        );
      case "Failed":
        return (
          <Badge className="bg-red-100 text-red-800 text-xs sm:text-sm">
            <XCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            Failed
          </Badge>
        );
      case "Pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 text-xs sm:text-sm">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            Pending
          </Badge>
        );
      case "Refunded":
        return (
          <Badge className="bg-blue-100 text-blue-800 text-xs sm:text-sm">
            <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            Refunded
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-xs sm:text-sm">
            {status}
          </Badge>
        );
    }
  };

  const getTotalAmount = () => {
    return filteredPayments
      .filter((p) => p.status === "Completed")
      .reduce((sum, payment) => {
        const amount = Number.parseInt(payment.amount.replace(/[₦,]/g, ""));
        return sum + amount;
      }, 0)
      .toLocaleString();
  };

  const getPaymentStats = () => {
    const completed = filteredPayments.filter(
      (p) => p.status === "Completed"
    ).length;
    const failed = filteredPayments.filter((p) => p.status === "Failed").length;
    const pending = filteredPayments.filter(
      (p) => p.status === "Pending"
    ).length;

    return {completed, failed, pending, total: filteredPayments.length};
  };

  const stats = getPaymentStats();

  const handleExportHistory = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Payment ID,Date,Description,Amount,Method,Status,Children,Next Billing\n" +
      filteredPayments
        .map(
          (payment) =>
            `${payment.id},${payment.date},"${payment.description}",${
              payment.amount
            },${payment.method},${payment.status},"${payment.children.join(
              "; "
            )}",${payment.nextBilling || "N/A"}`
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "payment_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert("Payment history exported successfully!");
  };

  const handleDownloadAllReceipts = () => {
    const completedPayments = payments.filter((p) => p.status === "Completed");
    alert(
      `Downloading ${completedPayments.length} receipts. This may take a moment...`
    );

    completedPayments.forEach((payment, index) => {
      setTimeout(() => {
        const link = document.createElement("a");
        link.setAttribute("href", "#");
        link.setAttribute("download", `receipt_${payment.id}.pdf`);
        if (index === completedPayments.length - 1) {
          alert("All receipts downloaded successfully!");
        }
      }, index * 500);
    });
  };

  const handleDownloadReceipt = (payment: any) => {
    const link = document.createElement("a");
    link.setAttribute("href", "#");
    link.setAttribute("download", `receipt_${payment.id}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert(`Receipt for ${payment.id} downloaded successfully!`);
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Pagination navigation handler
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Generate page numbers with ellipsis
  const renderPageNumbers = () => {
    const pages: React.ReactNode[] = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(
      1,
      currentPage - Math.floor(maxVisiblePages / 2)
    );
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (startPage > 1) {
      pages.push(<PaginationEllipsis key="start-ellipsis" />);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            isActive={i === currentPage}
            onClick={() => handlePageChange(i)}>
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (endPage < totalPages) {
      pages.push(<PaginationEllipsis key="end-ellipsis" />);
    }

    return pages;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
            Payment History
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            View and manage all your payment transactions
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2 bg-transparent w-full sm:w-auto"
            onClick={handleExportHistory}>
            <Download className="h-3 w-3 sm:h-4 sm:w-4" />
            Export History
          </Button>
          <Button
            className="flex items-center gap-2 w-full sm:w-auto"
            onClick={handleDownloadAllReceipts}>
            <Receipt className="h-3 w-3 sm:h-4 sm:w-4" />
            Download Receipt
          </Button>
        </div>
      </div>

      {/* Payment Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Total Spent
            </CardTitle>
            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-green-600">
              ₦{getTotalAmount()}
            </div>
            <p className="text-xs text-muted-foreground">Completed payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Successful
            </CardTitle>
            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-green-600">
              {stats.completed}
            </div>
            <p className="text-xs text-muted-foreground">
              Completed transactions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Failed
            </CardTitle>
            <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-red-600">
              {stats.failed}
            </div>
            <p className="text-xs text-muted-foreground">Failed transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Pending
            </CardTitle>
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-yellow-600">
              {stats.pending}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg md:text-xl">
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {/* Search Input */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-2.5 top-2.5 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              <Input
                placeholder="Search by description, payment ID, or method..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 text-xs sm:text-sm"
              />
            </div>

            {/* Period Filter */}
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-full sm:w-[180px] text-xs sm:text-sm">
                <SelectValue placeholder="Filter by period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">Last 3 Months</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payment History Table */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg md:text-xl">
            Transaction History ({filteredPayments.length})
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Complete record of all your payments and transactions
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction Details</TableHead>
                  <TableHead>Amount & Method</TableHead>
                  <TableHead>Children</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Next Billing</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPayments.map((payment) => (
                  <TableRow key={payment.id} className="hover:bg-muted/50">
                    {/* Transaction Details */}
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-xs sm:text-sm">
                          {payment.description}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ID: {payment.id}
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="mr-1 h-3 w-3" />
                          {payment.date}
                        </div>
                      </div>
                    </TableCell>

                    {/* Amount & Method */}
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-green-600 text-xs sm:text-sm">
                          {payment.amount}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {payment.method}
                        </div>
                      </div>
                    </TableCell>

                    {/* Children */}
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {payment.children.map((child, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-[10px] sm:text-xs">
                            {child}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>

                    {/* Next Billing */}
                    <TableCell>
                      {payment.nextBilling ? (
                        <div className="flex items-center text-muted-foreground text-xs sm:text-sm">
                          <Calendar className="mr-1 h-3 w-3" />
                          {payment.nextBilling}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs sm:text-sm">
                          One-time
                        </span>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadReceipt(payment)}>
                          <Receipt className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadReceipt(payment)}>
                          <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        {payment.status === "Failed" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700">
                            <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card Layout */}
          <div className="md:hidden space-y-4">
            {paginatedPayments.map((payment) => (
              <div
                key={payment.id}
                className="p-2 sm:p-4 rounded-lg space-y-3 shadow-sm">
                {/* Title + Status */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="font-medium text-xs sm:text-sm truncate">
                    {payment.description}
                  </div>
                  {getStatusBadge(payment.status)}
                </div>

                {/* ID & Date */}
                <div className="text-xs text-muted-foreground truncate">
                  ID: {payment.id} • {payment.date}
                </div>

                {/* Amount & Method */}
                <div className="flex flex-col sm:flex-row justify-between text-xs sm:text-sm gap-2">
                  <span className="font-medium text-green-600">
                    {payment.amount}
                  </span>
                  <span className="text-muted-foreground">
                    {payment.method}
                  </span>
                </div>

                {/* Children */}
                {payment.children.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {payment.children.map((child, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-[10px] sm:text-xs">
                        {child}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Next Billing */}
                <div className="text-xs sm:text-sm text-muted-foreground">
                  {payment.nextBilling ? (
                    <div className="flex items-center">
                      <Calendar className="mr-1 h-3 w-3" />
                      {payment.nextBilling}
                    </div>
                  ) : (
                    "One-time"
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownloadReceipt(payment)}>
                    <Receipt className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownloadReceipt(payment)}>
                    <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  {payment.status === "Failed" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700">
                      <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={
                      currentPage === 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>
                {renderPageNumbers()}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg md:text-xl">
            Payment Methods
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Manage your saved payment methods
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Responsive Layout */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            {/* Visa Card */}
            <div className="p-3 sm:p-4 border rounded-lg shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="font-medium text-xs sm:text-sm">
                    •••• •••• •••• 1234
                  </span>
                </div>
                <Badge className="text-[10px] sm:text-xs">Primary</Badge>
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                <div>Visa ending in 1234</div>
                <div>Expires 12/26</div>
              </div>
            </div>

            {/* Bank Transfer */}
            <div className="p-3 sm:p-4 border rounded-lg shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="font-medium text-xs sm:text-sm">
                    Bank Transfer
                  </span>
                </div>
                <Badge variant="secondary" className="text-[10px] sm:text-xs">
                  Active
                </Badge>
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                <div>First Bank Nigeria</div>
                <div>Account: •••••••••1234</div>
              </div>
            </div>
          </div>

          {/* Add Payment Method Button */}
          <div className="mt-4">
            <Button
              variant="outline"
              className="w-full flex justify-center text-xs sm:text-sm">
              <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              Add Payment Method
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Payments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg md:text-xl">
            Upcoming Payments
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Scheduled payments and renewals
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {/* Payment Item */}
            <div className="flex flex-col gap-3 p-3 border rounded-lg">
              {/* Left side */}
              <div className="space-y-1">
                <h4 className="font-medium text-xs sm:text-sm">
                  Monthly Subscription Renewal
                </h4>
                <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                  <Calendar className="mr-1 h-3 w-3" />
                  Due: February 15, 2024
                </div>
                <div className="text-xs text-muted-foreground">
                  Premium Plan for John & Mary
                </div>
              </div>

              {/* Right side */}
              <div className="flex flex-col gap-2">
                <div className="font-medium text-green-600 text-xs sm:text-sm">
                  ₦25,000
                </div>
                <Badge className="bg-blue-100 text-blue-800 text-[10px] sm:text-xs">
                  Auto-pay enabled
                </Badge>
              </div>
            </div>

            {/* Payment Item */}
            <div className="flex flex-col gap-3 p-3 border rounded-lg">
              {/* Left side */}
              <div className="space-y-1">
                <h4 className="font-medium text-xs sm:text-sm">
                  BNPL Installment
                </h4>
                <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                  <Calendar className="mr-1 h-3 w-3" />
                  Due: January 25, 2024
                </div>
                <div className="text-xs text-muted-foreground">
                  Educational Materials - 2/3 installments
                </div>
              </div>

              {/* Right side */}
              <div className="flex flex-col gap-2">
                <div className="font-medium text-orange-600 text-xs sm:text-sm">
                  ₦5,167
                </div>
                <Badge className="bg-yellow-100 text-yellow-800 text-[10px] sm:text-xs">
                  Manual payment
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

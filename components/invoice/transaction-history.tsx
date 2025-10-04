"use client";

import {useState, useMemo} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {PaymentStatusBadge} from "@/components/invoice/payment-status-badge";
import {Search, Filter, Calendar, ArrowUpDown} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Calendar as CalendarComponent} from "@/components/ui/calendar";
import {format} from "date-fns";

interface Transaction {
  id: string;
  date: string;
  amount: number;
  recipient: string;
  status: "paid" | "pending" | "overdue" | "failed";
  type: string;
  invoiceNumber: string;
}

interface TransactionHistoryProps {
  onSelectTransaction: (id: string) => void;
  selectedTransaction: string | null;
}

// Mock data - in real app this would come from API
const mockTransactions: Transaction[] = [
  {
    id: "TXN-001",
    date: "2024-01-15",
    amount: 2500.0,
    recipient: "Acme Corporation",
    status: "paid",
    type: "Invoice",
    invoiceNumber: "INV-2024-001",
  },
  {
    id: "TXN-002",
    date: "2024-01-14",
    amount: 1200.5,
    recipient: "Tech Solutions Ltd",
    status: "pending",
    type: "Invoice",
    invoiceNumber: "INV-2024-002",
  },
  {
    id: "TXN-003",
    date: "2024-01-12",
    amount: 850.0,
    recipient: "Digital Services Inc",
    status: "overdue",
    type: "Invoice",
    invoiceNumber: "INV-2024-003",
  },
  {
    id: "TXN-004",
    date: "2024-01-10",
    amount: 3200.75,
    recipient: "Global Enterprises",
    status: "paid",
    type: "Invoice",
    invoiceNumber: "INV-2024-004",
  },
  {
    id: "TXN-005",
    date: "2024-01-08",
    amount: 675.25,
    recipient: "StartUp Co",
    status: "failed",
    type: "Invoice",
    invoiceNumber: "INV-2024-005",
  },
  {
    id: "TXN-006",
    date: "2024-01-05",
    amount: 4100.0,
    recipient: "Enterprise Solutions",
    status: "paid",
    type: "Invoice",
    invoiceNumber: "INV-2024-006",
  },
];

export function TransactionHistory({
  onSelectTransaction,
  selectedTransaction,
}: TransactionHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<{from?: Date; to?: Date}>({});
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const filteredAndSortedTransactions = useMemo(() => {
    const filtered = mockTransactions.filter((transaction) => {
      const matchesSearch =
        transaction.recipient
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        transaction.invoiceNumber
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        transaction.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || transaction.status === statusFilter;

      const matchesDateRange =
        (!dateRange.from || new Date(transaction.date) >= dateRange.from) &&
        (!dateRange.to || new Date(transaction.date) <= dateRange.to);

      return matchesSearch && matchesStatus && matchesDateRange;
    });

    // Sort transactions
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "date") {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === "amount") {
        comparison = a.amount - b.amount;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [searchTerm, statusFilter, dateRange, sortBy, sortOrder]);

  const toggleSort = (field: "date" | "amount") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  return (
    <Card className="h-fit">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Transaction History</CardTitle>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Date Range
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="range"
                  selected={dateRange}
                  onSelect={(range) => setDateRange(range || {})}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleSort("date")}
              className="flex items-center gap-2">
              Date
              <ArrowUpDown className="h-3 w-3" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleSort("amount")}
              className="flex items-center gap-2">
              Amount
              <ArrowUpDown className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="max-h-[600px] overflow-y-auto">
          {filteredAndSortedTransactions.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              No transactions found matching your criteria.
            </div>
          ) : (
            <div className="space-y-1">
              {filteredAndSortedTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  onClick={() => onSelectTransaction(transaction.id)}
                  className={`p-4 border-b cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedTransaction === transaction.id
                      ? "bg-accent/50 border-l-4 border-l-primary"
                      : ""
                  }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {transaction.recipient}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {transaction.invoiceNumber}
                      </Badge>
                    </div>
                    <PaymentStatusBadge status={transaction.status} />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {format(new Date(transaction.date), "MMM dd, yyyy")}
                    </span>
                    <span className="font-semibold">
                      $
                      {transaction.amount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>

                  <div className="mt-1">
                    <span className="text-xs text-muted-foreground">
                      ID: {transaction.id}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

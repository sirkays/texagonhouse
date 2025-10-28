// components/invoice/transaction-history.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PaymentStatusBadge } from "@/components/invoice/payment-status-badge";
import { Spinner } from "@/components/ui/spinner";
import { Search, Filter, ArrowUpDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

interface Transaction {
  id: string | number;
  type: "subscription" | "store";
  reference: string;
  amount: string;
  currency: string;
  status: "success" | "failed" | "pending";
  date: string;
  customer: string;
  invoice_number?: string;
  order_id?: string;
}

interface TransactionHistoryProps {
  onSelectTransaction: (id: string) => void;
  selectedTransaction: string | null;
}

export function TransactionHistory({
  onSelectTransaction,
  selectedTransaction,
}: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search input vs. committed query
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  // DEFAULT: subscription; types restricted to "order" | "subscription"
  const [paymentType, setPaymentType] = useState<"order" | "subscription">("subscription");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Fetch transactions (runs when committed query or filters change)
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (searchQuery) params.append("search", searchQuery);
        if (statusFilter && statusFilter !== "all") params.append("status", statusFilter);

        // Always append selected payment type (map "order" -> "store")
        const apiType = paymentType === "order" ? "store" : "subscription";
        params.append("type", apiType);

        if (dateRange.from) params.append("from_date", format(dateRange.from, "yyyy-MM-dd"));
        if (dateRange.to) params.append("to_date", format(dateRange.to, "yyyy-MM-dd"));

        const res = await fetch(`/api/transactions?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to load transactions");

        const data = await res.json();
        setTransactions(data.results || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [searchQuery, statusFilter, paymentType, dateRange]);

  const handleSearch = () => {
    setSearchQuery(searchTerm.trim());
  };

  const filteredAndSortedTransactions = useMemo(() => {
    const term = searchQuery.toLowerCase();

    const filtered = transactions.filter((tx) => {
      const matchesSearch =
        !term ||
        tx.reference.toLowerCase().includes(term) ||
        (tx.invoice_number?.toLowerCase().includes(term) ?? false) ||
        (tx.order_id?.toLowerCase().includes(term) ?? false) ||
        tx.customer.toLowerCase().includes(term);

      const matchesStatus = statusFilter === "all" || tx.status === statusFilter;

      // Restrict by chosen payment type only
      const matchesType =
        paymentType === "order" ? tx.type === "store" : tx.type === "subscription";

      const matchesDateRange =
        (!dateRange.from || new Date(tx.date) >= dateRange.from) &&
        (!dateRange.to || new Date(tx.date) <= dateRange.to);

      return matchesSearch && matchesStatus && matchesType && matchesDateRange;
    });

    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "date") {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === "amount") {
        comparison = parseFloat(a.amount) - parseFloat(b.amount);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [transactions, searchQuery, statusFilter, paymentType, dateRange, sortBy, sortOrder]);

  const toggleSort = (field: "date" | "amount") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Spinner size="md" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-destructive mb-4">Error: {error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-fit">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Transaction History</CardTitle>

        <div className="space-y-4">
          {/* Search input + button */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ref, invoice, order..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                className="pl-10"
                aria-label="Search transactions"
              />
            </div>
            <Button type="button" onClick={handleSearch} className="shrink-0" disabled={loading}>
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Status filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            {/* Payment type (no "All Types"; default = Subscription) */}
            <Select value={paymentType} onValueChange={(v) => setPaymentType(v as any)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="order">Order</SelectItem>
                <SelectItem value="subscription">Subscription</SelectItem>
              </SelectContent>
            </Select>

            {/* Amount sort */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleSort("amount")}
              className="flex items-center gap-2"
            >
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
              {filteredAndSortedTransactions.map((tx) => {
                const displayId = tx.type === "subscription" ? tx.invoice_number : tx.order_id;
                const statusMap: Record<string, "paid" | "pending" | "overdue" | "failed"> = {
                  success: "paid",
                  failed: "failed",
                  pending: "pending",
                };

                return (
                  <div
                    key={tx.id}
                    onClick={() => onSelectTransaction(tx.id.toString())}
                    className={`p-4 border-b cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedTransaction === tx.id.toString()
                        ? "bg-accent/50 border-l-4 border-l-primary"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{tx.customer}</span>
                        {displayId && (
                          <Badge variant="outline" className="text-xs">
                            {displayId}
                          </Badge>
                        )}
                      </div>
                      <PaymentStatusBadge status={statusMap[tx.status] || "pending"} />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {format(new Date(tx.date), "MMM dd, yyyy")}
                      </span>
                      <span className="font-semibold">
                        {tx.currency} {Number(tx.amount).toLocaleString()}
                      </span>
                    </div>

                    <div className="mt-1">
                      <span className="text-xs text-muted-foreground">Ref: {tx.reference}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

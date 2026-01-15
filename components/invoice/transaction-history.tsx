// components/invoice/transaction-history.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PaymentStatusBadge } from "@/components/invoice/payment-status-badge";
import { Spinner } from "@/components/ui/spinner";
import { Search, Filter, ArrowUpDown, MessageSquare } from "lucide-react";
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
  status?: string | null; // ✅ allow ANY status
  date: string;
  customer: string;
  invoice_number?: string;
  order_id?: string;
}

interface TransactionHistoryProps {
  onSelectTransaction: (id: string) => void;
  selectedTransaction: string | null;
}

type BadgeStatus = "paid" | "pending" | "overdue" | "failed";

/**
 * Normalize ANY backend/provider status into the 4 UI statuses
 * that PaymentStatusBadge supports.
 */
const normalizeTxStatus = (raw?: string | null): BadgeStatus => {
  const s = (raw || "").trim().toLowerCase();

  // ✅ Paid-like
  if (["success", "successful", "paid", "completed", "settled"].includes(s)) return "paid";

  // ✅ Failed-like
  if (
    [
      "failed",
      "failure",
      "error",
      "cancelled",
      "canceled",
      "declined",
      "reversed",
      "abandoned",
    ].includes(s)
  ) {
    return "failed";
  }

  // ✅ Pending-like
  if (
    ["pending", "processing", "inprogress", "in_progress", "queued", "awaiting", "created"].includes(
      s
    )
  ) {
    return "pending";
  }

  // ✅ Overdue-like
  if (["overdue", "expired", "past_due", "past-due", "timeout"].includes(s)) return "overdue";

  // ✅ Unknown => safest default
  return "pending";
};

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

  const router = useRouter();

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  // Default to Subscription; no "All Types"
  const [paymentType, setPaymentType] = useState<"order" | "subscription">("subscription");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (searchQuery) params.append("search", searchQuery);

        // ✅ pass raw status filter straight to API (backend already supports ?status=...)
        if (statusFilter && statusFilter !== "all") params.append("status", statusFilter);

        // map UI paymentType to API type ("order" => "store")
        const apiType = paymentType === "order" ? "store" : "subscription";
        params.append("type", apiType);

        if (dateRange.from) params.append("from_date", format(dateRange.from, "yyyy-MM-dd"));
        if (dateRange.to) params.append("to_date", format(dateRange.to, "yyyy-MM-dd"));

        const res = await fetch(`/api/transactions?${params.toString()}`, { cache: "no-store" });
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

  const handleMakeComplaint = (tx: Transaction) => {
    const category = tx.type === "subscription" ? "Subscription" : "Order";

    const params = new URLSearchParams();
    params.set("category", category);

    // complaints page expects transaction_reference
    params.set("transaction_reference", tx.reference);

    if (tx.invoice_number) params.set("invoice_number", tx.invoice_number);
    if (tx.order_id) params.set("order_id", tx.order_id);

    router.push(`/invoice/complaints?${params.toString()}`);
  };

  const handleSearch = () => setSearchQuery(searchTerm.trim());

  // ✅ Build dropdown statuses from what the API returns (any status)
  const availableStatuses = useMemo(() => {
    const s = new Set<string>();
    for (const t of transactions) {
      const st = (t.status || "").trim().toLowerCase();
      if (st) s.add(st);
    }
    return Array.from(s).sort();
  }, [transactions]);

  const filteredAndSortedTransactions = useMemo(() => {
    const term = searchQuery.toLowerCase();

    const filtered = transactions.filter((tx) => {
      const matchesSearch =
        !term ||
        tx.reference.toLowerCase().includes(term) ||
        (tx.invoice_number?.toLowerCase().includes(term) ?? false) ||
        (tx.order_id?.toLowerCase().includes(term) ?? false) ||
        tx.customer.toLowerCase().includes(term);

      const txStatus = (tx.status || "").trim().toLowerCase();
      const matchesStatus = statusFilter === "all" || txStatus === statusFilter;

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
    if (sortBy === field) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  return (
    <Card className="h-fit">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Transaction History</CardTitle>

        <div className="space-y-4">
          {/* Search input + button (always visible) */}
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
            {/* Status filter (auto-populated from backend results) */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[170px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>

                {/* Keep friendly common statuses first */}
                {["success", "failed", "pending", "cancelled", "inprogress", "created"]
                  .filter((x) => availableStatuses.includes(x))
                  .map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}

                {/* Then show any other statuses returned */}
                {availableStatuses
                  .filter(
                    (s) =>
                      !["success", "failed", "pending", "cancelled", "inprogress", "created"].includes(
                        s
                      )
                  )
                  .map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            {/* Payment type (default = Subscription) */}
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
        <div className="relative">
          {/* Loader ONLY in data area */}
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white">
              <Spinner size="md" />
            </div>
          )}

          <div
            className={`max-h-[600px] overflow-y-auto ${
              loading ? "pointer-events-none opacity-50" : ""
            }`}
          >
            {error ? (
              <div className="p-6 text-center">
                <p className="text-destructive mb-4">Error: {error}</p>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            ) : filteredAndSortedTransactions.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                No transactions found matching your criteria.
              </div>
            ) : (
              <div className="space-y-1">
                {filteredAndSortedTransactions.map((tx) => {
                  const displayId = tx.type === "subscription" ? tx.invoice_number : tx.order_id;
                  const badgeStatus = normalizeTxStatus(tx.status);

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

                        <div className="flex items-center gap-2">
                          {/* ✅ works for ANY tx.status */}
                          <PaymentStatusBadge status={badgeStatus} />

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation(); // don't trigger row select
                              handleMakeComplaint(tx);
                            }}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Make Complaint
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {format(new Date(tx.date), "MMM dd, yyyy")}
                        </span>
                        <span className="font-semibold">
                          {tx.currency} {Number(tx.amount).toLocaleString()}
                        </span>
                      </div>

                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Ref: {tx.reference}</span>
                        {/* show raw provider status (useful for support) */}
                        {tx.status ? (
                          <span className="text-[11px] text-muted-foreground">
                            Status: {String(tx.status)}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

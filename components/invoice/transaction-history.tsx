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
import { Search, Filter, ArrowUpDown, MessageSquare, TrendingUp, DollarSign, CheckCircle2, XCircle, FileX2 } from "lucide-react";
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

  // ✅ Stat computations from filteredAndSortedTransactions
  const stats = useMemo(() => {
    const total = filteredAndSortedTransactions.length;
    let volume = 0;
    let successful = 0;
    let failed = 0;

    for (const tx of filteredAndSortedTransactions) {
      volume += parseFloat(tx.amount) || 0;
      const normalized = normalizeTxStatus(tx.status);
      if (normalized === "paid") successful++;
      if (normalized === "failed") failed++;
    }

    return { total, volume, successful, failed };
  }, [filteredAndSortedTransactions]);

  // Skeleton row component
  const SkeletonRow = () => (
    <tr className="border-b border-slate-100">
      <td className="px-4 py-3.5"><div className="h-4 w-20 bg-slate-200 rounded animate-pulse" /></td>
      <td className="px-4 py-3.5"><div className="h-4 w-28 bg-slate-200 rounded animate-pulse" /></td>
      <td className="px-4 py-3.5"><div className="h-4 w-24 bg-slate-200 rounded animate-pulse" /></td>
      <td className="px-4 py-3.5"><div className="h-4 w-20 bg-slate-200 rounded animate-pulse" /></td>
      <td className="px-4 py-3.5"><div className="h-4 w-20 bg-slate-200 rounded animate-pulse ml-auto" /></td>
      <td className="px-4 py-3.5"><div className="h-6 w-16 bg-slate-200 rounded-full animate-pulse" /></td>
      <td className="px-4 py-3.5"><div className="h-8 w-24 bg-slate-200 rounded animate-pulse" /></td>
    </tr>
  );

  return (
    <Card className="h-fit bg-white/80 backdrop-blur-sm shadow-xl border-0 rounded-2xl overflow-hidden">
      <CardHeader className="pb-4 space-y-5">
        <CardTitle className="text-lg font-semibold text-slate-800">Transaction History</CardTitle>

        {/* ─── Stat Cards ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Total Transactions */}
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-xl border border-blue-500/10 p-3.5 flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800">{stats.total}</p>
              <p className="text-xs text-slate-500">Total Transactions</p>
            </div>
          </div>

          {/* Total Volume */}
          <div className="bg-gradient-to-br from-[#EF7B55]/10 to-[#EF7B55]/5 rounded-xl border border-[#EF7B55]/10 p-3.5 flex items-center gap-3">
            <div className="rounded-lg bg-[#EF7B55]/10 p-2">
              <DollarSign className="h-4 w-4 text-[#EF7B55]" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800 truncate">
                ₦{stats.volume.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-slate-500">Total Volume</p>
            </div>
          </div>

          {/* Successful */}
          <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-xl border border-emerald-500/10 p-3.5 flex items-center gap-3">
            <div className="rounded-lg bg-emerald-500/10 p-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800">{stats.successful}</p>
              <p className="text-xs text-slate-500">Successful</p>
            </div>
          </div>

          {/* Failed */}
          <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 rounded-xl border border-red-500/10 p-3.5 flex items-center gap-3">
            <div className="rounded-lg bg-red-500/10 p-2">
              <XCircle className="h-4 w-4 text-red-500" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800">{stats.failed}</p>
              <p className="text-xs text-slate-500">Failed</p>
            </div>
          </div>
        </div>

        {/* ─── Filter Bar ─── */}
        <div className="space-y-3">
          {/* Search input */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by ref, invoice, order..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                className="pl-10 rounded-full border-slate-200 bg-slate-50/80 focus:bg-white focus:border-[#EF7B55]/40 focus:ring-[#EF7B55]/20 transition-colors"
                aria-label="Search transactions"
              />
            </div>
            <Button
              type="button"
              onClick={handleSearch}
              className="shrink-0 rounded-full bg-[#EF7B55] hover:bg-[#e06a3f] text-white shadow-sm"
              disabled={loading}
            >
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Payment type segmented toggle */}
            <div className="inline-flex rounded-lg bg-slate-100 p-0.5">
              <button
                type="button"
                onClick={() => setPaymentType("subscription")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                  paymentType === "subscription"
                    ? "bg-[#EF7B55] text-white shadow-sm"
                    : "bg-transparent text-slate-600 hover:text-slate-800"
                }`}
              >
                Subscription
              </button>
              <button
                type="button"
                onClick={() => setPaymentType("order")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                  paymentType === "order"
                    ? "bg-[#EF7B55] text-white shadow-sm"
                    : "bg-transparent text-slate-600 hover:text-slate-800"
                }`}
              >
                Order
              </button>
            </div>

            {/* Status filter dropdown */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[170px] rounded-lg border-slate-200 bg-slate-50/80">
                <Filter className="h-4 w-4 mr-2 text-slate-400" />
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

            {/* Sort buttons */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleSort("date")}
              className={`flex items-center gap-1.5 rounded-lg transition-all ${
                sortBy === "date"
                  ? "border-[#EF7B55]/30 bg-[#EF7B55]/5 text-[#EF7B55]"
                  : "border-slate-200 text-slate-600"
              }`}
            >
              Date
              <ArrowUpDown className="h-3 w-3" />
              {sortBy === "date" && (
                <span className="text-[10px] uppercase font-semibold">{sortOrder}</span>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleSort("amount")}
              className={`flex items-center gap-1.5 rounded-lg transition-all ${
                sortBy === "amount"
                  ? "border-[#EF7B55]/30 bg-[#EF7B55]/5 text-[#EF7B55]"
                  : "border-slate-200 text-slate-600"
              }`}
            >
              Amount
              <ArrowUpDown className="h-3 w-3" />
              {sortBy === "amount" && (
                <span className="text-[10px] uppercase font-semibold">{sortOrder}</span>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="relative">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              {/* Table Header */}
              <thead>
                <tr className="border-y border-slate-100 bg-slate-50/60">
                  <th className="px-4 py-3 text-left font-medium text-slate-500 text-xs uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500 text-xs uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500 text-xs uppercase tracking-wider">Reference</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500 text-xs uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-500 text-xs uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500 text-xs uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500 text-xs uppercase tracking-wider">Action</th>
                </tr>
              </thead>

              <tbody>
                {/* Loading state: skeleton rows */}
                {loading && (
                  <>
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                  </>
                )}

                {/* Error state */}
                {!loading && error && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="rounded-full bg-red-50 p-3">
                          <XCircle className="h-6 w-6 text-red-400" />
                        </div>
                        <p className="text-destructive font-medium">Error: {error}</p>
                        <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="rounded-lg">
                          Retry
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Empty state */}
                {!loading && !error && filteredAndSortedTransactions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="rounded-full bg-slate-100 p-4">
                          <FileX2 className="h-7 w-7 text-slate-400" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-700">No transactions found</p>
                          <p className="text-sm text-slate-400 mt-1">
                            Try adjusting your search or filter criteria
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Data rows */}
                {!loading &&
                  !error &&
                  filteredAndSortedTransactions.map((tx) => {
                    const displayId = tx.type === "subscription" ? tx.invoice_number : tx.order_id;
                    const badgeStatus = normalizeTxStatus(tx.status);

                    return (
                      <tr
                        key={tx.id}
                        onClick={() => onSelectTransaction(tx.id.toString())}
                        className={`border-b border-slate-100 hover:bg-orange-50/30 transition-colors cursor-pointer ${
                          selectedTransaction === tx.id.toString()
                            ? "bg-[#EF7B55]/5 border-l-4 border-l-[#EF7B55]"
                            : ""
                        }`}
                      >
                        {/* Date */}
                        <td className="px-4 py-3.5 whitespace-nowrap text-slate-600">
                          {format(new Date(tx.date), "MMM dd, yyyy")}
                        </td>

                        {/* Customer */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-800">{tx.customer}</span>
                            {displayId && (
                              <Badge variant="outline" className="text-[10px] font-normal text-slate-400 border-slate-200">
                                {displayId}
                              </Badge>
                            )}
                          </div>
                        </td>

                        {/* Reference */}
                        <td className="px-4 py-3.5">
                          <span className="text-slate-500 font-mono text-xs">{tx.reference}</span>
                        </td>

                        {/* Type */}
                        <td className="px-4 py-3.5">
                          <Badge
                            variant="outline"
                            className={`text-[11px] rounded-md font-medium ${
                              tx.type === "subscription"
                                ? "bg-blue-50 text-blue-600 border-blue-200"
                                : "bg-purple-50 text-purple-600 border-purple-200"
                            }`}
                          >
                            {tx.type === "subscription" ? "Subscription" : "Order"}
                          </Badge>
                        </td>

                        {/* Amount */}
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <span className="font-semibold text-slate-800">
                            {tx.currency} {Number(tx.amount).toLocaleString()}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5">
                          {/* ✅ works for ANY tx.status */}
                          <PaymentStatusBadge status={badgeStatus} size="sm" />
                        </td>

                        {/* Action */}
                        <td className="px-4 py-3.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Report a payment issue"
                            onClick={(e) => {
                              e.stopPropagation(); // don't trigger row select
                              handleMakeComplaint(tx);
                            }}
                            className="text-slate-500 hover:text-[#EF7B55] hover:bg-[#EF7B55]/5 rounded-lg transition-colors"
                          >
                            <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                            Report Issue
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// texagon_academy\texagonui\app\admin\billing\page.tsx
"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  DollarSign,
  CreditCard,
  Download,
  Eye,
  Loader2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InvoiceDetailsModal } from "@/components/admin/modals/invoice-details-modal";
import { PlanManageModal } from "@/components/admin/modals/plan-manage-modal";
import { Textarea } from "@/components/ui/textarea"; // (only if you want it here; modal already uses it)
import { ComplaintDetailsModal } from "@/components/admin/modals/complaint-details-modal";

interface BillingStats {
  monthly_revenue_amount: string;
  monthly_revenue_currency: string;
  active_subscriptions: number;
  pending_invoices_count: number;
  pending_invoices_total: string;
  collection_rate: {
    amount_pct: number;
    count_pct: number;
  };
}

interface Plan {
  id: number;
  name: string;
  price: string;
  billing_period: string;
  student_limit: number;
  active_subscriptions: number;
}

interface Invoice {
  id: number;
  number: string;
  parent: string;
  amount: string;
  currency: string;
  status: string;
  issuedAt: string;
  dueAt: string;
}

interface Pagination {
  page: number;
  page_size: number;
  total: number;
}

interface BillingData {
  stats: BillingStats;
  plans: Plan[];
  recent_invoices: Invoice[];
  pagination: Pagination;
}

interface ComplaintListItem {
  id: string;
  code: string;
  title: string;
  status: string;
  priority: string;
  created_at: string | null;
  responses_count: number;
  transaction_id: string | null;
}

interface ComplaintsPagination {
  page: number;
  page_size: number;
  total: number;
}

interface ComplaintsResponse {
  results: ComplaintListItem[];
  pagination: ComplaintsPagination;
}

export default function BillingPage() {
  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewingInvoice, setViewingInvoice] = useState<any>(null);
  const [searchInput, setSearchInput] = useState(""); // what user types
  const [searchQuery, setSearchQuery] = useState(""); // applied search (on button click)
  const [currentPage, setCurrentPage] = useState(1);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [complaintsData, setComplaintsData] =
    useState<ComplaintsResponse | null>(null);
  const [complaintsLoading, setComplaintsLoading] = useState(false);

  const [complaintsSearchInput, setComplaintsSearchInput] = useState("");
  const [complaintsSearchQuery, setComplaintsSearchQuery] = useState("");
  const [complaintsPage, setComplaintsPage] = useState(1);

  const [viewingComplaint, setViewingComplaint] =
    useState<ComplaintListItem | null>(null);
  const [complaintModalOpen, setComplaintModalOpen] = useState(false);

  const { toast } = useToast();

  const fetchBillingData = async (page: number = 1, search: string = "") => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        invoices_page: page.toString(),
        invoices_page_size: "10",
      });

      if (search) {
        queryParams.append("invoices_search", search);
      }

      const response = await fetch(
        `/api/admin/billing/dashboard?${queryParams.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch billing data");
      }

      const data = await response.json();
      setBillingData(data);
    } catch (error) {
      console.error("Error fetching billing data:", error);
      toast({
        title: "Error",
        description: "Failed to load billing data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // fetch only when page changes OR applied query changes
    fetchBillingData(currentPage, searchQuery);
  }, [currentPage, searchQuery]);

  useEffect(() => {
    fetchComplaints(complaintsPage, complaintsSearchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complaintsPage, complaintsSearchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchInput.trim();
    setCurrentPage(1);
    setSearchQuery(q); // triggers fetch via useEffect
  };

  const formatCurrency = (amount: string, currency: string) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency,
    }).format(parseFloat(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  const fetchComplaints = async (page: number = 1, search: string = "") => {
    try {
      setComplaintsLoading(true);

      const params = new URLSearchParams({
        page: page.toString(),
        page_size: "10",
      });

      if (search) params.append("search", search);

      const res = await fetch(`/api/admin/complaints?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch complaints");

      const data: ComplaintsResponse = await res.json();
      setComplaintsData(data);
    } catch (e) {
      console.error(e);
      toast({
        title: "Error",
        description: "Failed to load complaints",
        variant: "destructive",
      });
    } finally {
      setComplaintsLoading(false);
    }
  };

  const handleComplaintsSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = complaintsSearchInput.trim();
    setComplaintsPage(1);
    setComplaintsSearchQuery(q);
    fetchComplaints(1, q);
  };

  const formatComplaintDate = (dateString?: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading && !billingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!billingData) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load billing data</p>
        <Button onClick={() => fetchBillingData()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  const { stats, plans, recent_invoices, pagination } = billingData;

  return (
    <div className="space-y-6 px-1 sm:px-0">
      {" "}
      {/* Reduced padding for tiny screens */}
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Billing & Subscriptions
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage subscription plans and invoices
        </p>
      </div>
      {/* Revenue Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* text-xl on mobile prevents overflow of long currency strings */}
            <div className="text-xl sm:text-2xl font-bold text-foreground break-all">
              {formatCurrency(
                stats.monthly_revenue_amount,
                stats.monthly_revenue_currency
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Current month revenue
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
            <div className="text-xl sm:text-2xl font-bold text-foreground">
              {stats.active_subscriptions}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total active plans
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
            <div className="text-xl sm:text-2xl font-bold text-foreground">
              {stats.pending_invoices_count}
            </div>
            <p className="text-xs text-muted-foreground mt-1 break-all">
              {formatCurrency(
                stats.pending_invoices_total,
                stats.monthly_revenue_currency
              )}{" "}
              total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Collection Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-foreground">
              {Math.round(stats.collection_rate.amount_pct * 100)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Success rate</p>
          </CardContent>
        </Card>
      </div>
      {/* Subscription Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Plans</CardTitle>
          <CardDescription>Available plans and pricing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="p-4 rounded-lg border border-border hover:shadow-md transition-shadow flex flex-col h-full"
              >
                <div className="space-y-3 flex-1">
                  <div>
                    <h3
                      className="font-semibold text-foreground truncate"
                      title={plan.name}
                    >
                      {plan.name}
                    </h3>
                    <div className="flex flex-wrap items-baseline gap-1 mt-2">
                      <span className="text-2xl sm:text-3xl font-bold text-foreground">
                        {formatCurrency(
                          plan.price,
                          stats.monthly_revenue_currency
                        )}
                      </span>
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        /{plan.billing_period} days
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Student Limit
                      </span>
                      <span className="font-medium text-foreground">
                        {plan.student_limit === 0
                          ? "Unlimited"
                          : plan.student_limit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Active</span>
                      <Badge variant="secondary">
                        {plan.active_subscriptions}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button
                  className="w-full bg-transparent mt-4"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedPlan(plan);
                    setPlanModalOpen(true);
                  }}
                >
                  Manage Plan
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      {/* Recent Invoices */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Recent Invoices</CardTitle>
              <CardDescription>Latest billing transactions</CardDescription>
            </div>
            {/* FIX: Stack input and button on mobile to prevent overflow */}
            <form
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row gap-2 w-full md:w-[420px]"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search invoices..."
                  className="pl-9 w-full"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                variant="outline"
                className="w-full sm:w-auto shrink-0"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>
          </div>
        </CardHeader>
        <CardContent>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <div className="overflow-x-auto">
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
                  {recent_invoices.map((invoice) => (
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
                          <span className="font-semibold">
                            {formatCurrency(invoice.amount, invoice.currency)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(invoice.issuedAt)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(invoice.dueAt)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            invoice.status === "paid" ? "default" : "secondary"
                          }
                          className="capitalize"
                        >
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewingInvoice(invoice)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {recent_invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="p-4 rounded-lg border border-border"
              >
                {/* FIX: Stack Header on mobile to avoid badge overlap */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-mono text-sm break-all">
                        {invoice.number}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-medium truncate">
                      {invoice.parent}
                    </p>
                  </div>
                  <Badge
                    variant={
                      invoice.status === "paid" ? "default" : "secondary"
                    }
                    className="capitalize self-start sm:self-auto shrink-0"
                  >
                    {invoice.status}
                  </Badge>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="font-semibold break-all">
                      {formatCurrency(invoice.amount, invoice.currency)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Issued: {formatDate(invoice.issuedAt)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Due: {formatDate(invoice.dueAt)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewingInvoice(invoice)}
                  className="mt-4 w-full"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Button>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.total > pagination.page_size && (
            <div className="flex flex-col gap-4 mt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-muted-foreground text-center sm:text-left">
                Showing {(pagination.page - 1) * pagination.page_size + 1} to{" "}
                {Math.min(
                  pagination.page * pagination.page_size,
                  pagination.total
                )}{" "}
                of {pagination.total} invoices
              </div>
              <div className="flex gap-2 justify-center sm:justify-end w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-none"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-none"
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={
                    pagination.page >=
                    Math.ceil(pagination.total / pagination.page_size)
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Complaints */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Complaints</CardTitle>
              <CardDescription>Manage customer support</CardDescription>
            </div>

            {/* FIX: Stack Search Form */}
            <form
              onSubmit={handleComplaintsSearch}
              className="flex flex-col sm:flex-row gap-2 w-full md:w-[420px]"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search complaints..."
                  className="pl-9 w-full"
                  value={complaintsSearchInput}
                  onChange={(e) => setComplaintsSearchInput(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                variant="outline"
                className="w-full sm:w-auto shrink-0"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>
          </div>
        </CardHeader>

        <CardContent>
          {loading && !complaintsData ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Responses</TableHead>
                        <TableHead>Transaction</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {(complaintsData?.results || []).map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-mono text-sm">
                            {c.code}
                          </TableCell>
                          <TableCell className="font-medium">
                            {c.title}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="capitalize">
                              {c.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {c.priority}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatComplaintDate(c.created_at)}
                          </TableCell>
                          <TableCell>{c.responses_count}</TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {c.transaction_id || "-"}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setViewingComplaint(c);
                                setComplaintModalOpen(true);
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}

                      {(complaintsData?.results || []).length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={8}
                            className="text-center text-muted-foreground py-8"
                          >
                            No complaints found
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {(complaintsData?.results || []).map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-lg border border-border"
                  >
                    {/* FIX: Stack header for narrow screens */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-mono text-sm">{c.code}</div>
                        <div className="mt-1 text-sm font-medium truncate">
                          {c.title}
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className="capitalize self-start sm:self-auto shrink-0"
                      >
                        {c.status}
                      </Badge>
                    </div>

                    <div className="mt-3 text-sm text-muted-foreground space-y-1">
                      <div>
                        Priority:{" "}
                        <span className="capitalize">{c.priority}</span>
                      </div>
                      <div>Created: {formatComplaintDate(c.created_at)}</div>
                      <div>Responses: {c.responses_count}</div>
                      {c.transaction_id ? (
                        <div className="font-mono text-xs break-all">
                          Txn: {c.transaction_id}
                        </div>
                      ) : null}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-3 w-full"
                      onClick={() => {
                        setViewingComplaint(c);
                        setComplaintModalOpen(true);
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  </div>
                ))}

                {(complaintsData?.results || []).length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No complaints found
                  </div>
                ) : null}
              </div>

              {/* Pagination */}
              {complaintsData?.pagination &&
                complaintsData.pagination.total >
                  complaintsData.pagination.page_size && (
                  <div className="flex flex-col gap-4 mt-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm text-muted-foreground text-center sm:text-left">
                      Showing{" "}
                      {(complaintsData.pagination.page - 1) *
                        complaintsData.pagination.page_size +
                        1}{" "}
                      to{" "}
                      {Math.min(
                        complaintsData.pagination.page *
                          complaintsData.pagination.page_size,
                        complaintsData.pagination.total
                      )}{" "}
                      of {complaintsData.pagination.total} complaints
                    </div>

                    <div className="flex gap-2 justify-center sm:justify-end w-full sm:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 sm:flex-none"
                        onClick={() =>
                          setComplaintsPage((p) => Math.max(p - 1, 1))
                        }
                        disabled={complaintsData.pagination.page === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 sm:flex-none"
                        onClick={() => setComplaintsPage((p) => p + 1)}
                        disabled={
                          complaintsData.pagination.page >=
                          Math.ceil(
                            complaintsData.pagination.total /
                              complaintsData.pagination.page_size
                          )
                        }
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
            </>
          )}
        </CardContent>
      </Card>
      {/* Invoice Details Modal */}
      <InvoiceDetailsModal
        open={!!viewingInvoice}
        onOpenChange={(open) => !open && setViewingInvoice(null)}
        invoice={viewingInvoice}
      />
      <PlanManageModal
        open={planModalOpen}
        onOpenChange={(v) => {
          setPlanModalOpen(v);
          if (!v) setSelectedPlan(null);
        }}
        plan={selectedPlan}
        onUpdated={() => fetchBillingData(currentPage, searchQuery)}
      />
      {/* Complaint Details Modal */}
      <ComplaintDetailsModal
        open={complaintModalOpen}
        onOpenChange={(v) => {
          setComplaintModalOpen(v);
          if (!v) setViewingComplaint(null);
        }}
        complaint={viewingComplaint}
        onChanged={() => fetchComplaints(complaintsPage, complaintsSearchQuery)}
      />
    </div>
  );
}

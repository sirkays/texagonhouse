// "use client";

// import {useState, useEffect} from "react";
// import {useToast} from "@/hooks/use-toast";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {Button} from "@/components/ui/button";
// import {Badge} from "@/components/ui/badge";
// import {Input} from "@/components/ui/input";
// import {
//   Search,
//   DollarSign,
//   CreditCard,
//   Download,
//   Eye,
//   Loader2,
// } from "lucide-react";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {InvoiceDetailsModal} from "@/components/admin/modals/invoice-details-modal";

// interface BillingStats {
//   monthly_revenue_amount: string;
//   monthly_revenue_currency: string;
//   active_subscriptions: number;
//   pending_invoices_count: number;
//   pending_invoices_total: string;
//   collection_rate: {
//     amount_pct: number;
//     count_pct: number;
//   };
// }

// interface Plan {
//   id: number;
//   name: string;
//   price: string;
//   billing_period: string;
//   student_limit: number;
//   active_subscriptions: number;
// }

// interface Invoice {
//   id: number;
//   number: string;
//   parent: string;
//   amount: string;
//   currency: string;
//   status: string;
//   issuedAt: string;
//   dueAt: string;
// }

// interface Pagination {
//   page: number;
//   page_size: number;
//   total: number;
// }

// interface BillingData {
//   stats: BillingStats;
//   plans: Plan[];
//   recent_invoices: Invoice[];
//   pagination: Pagination;
// }

// export default function BillingPage() {
//   const [billingData, setBillingData] = useState<BillingData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [viewingInvoice, setViewingInvoice] = useState<any>(null);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const {toast} = useToast();

//   const fetchBillingData = async (page: number = 1, search: string = "") => {
//     try {
//       setLoading(true);
//       const queryParams = new URLSearchParams({
//         invoices_page: page.toString(),
//         invoices_page_size: "10",
//       });

//       if (search) {
//         queryParams.append("invoices_search", search);
//       }

//       const response = await fetch(
//         `/api/admin/billing/dashboard?${queryParams.toString()}`
//       );

//       if (!response.ok) {
//         throw new Error("Failed to fetch billing data");
//       }

//       const data = await response.json();
//       setBillingData(data);
//     } catch (error) {
//       console.error("Error fetching billing data:", error);
//       toast({
//         title: "Error",
//         description: "Failed to load billing data",
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchBillingData(currentPage, searchQuery);
//   }, [currentPage, searchQuery]);

//   const handleSearch = (e: React.FormEvent) => {
//     e.preventDefault();
//     setCurrentPage(1);
//     fetchBillingData(1, searchQuery);
//   };

//   const formatCurrency = (amount: string, currency: string) => {
//     return new Intl.NumberFormat("en-NG", {
//       style: "currency",
//       currency: currency,
//     }).format(parseFloat(amount));
//   };

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//     });
//   };

//   if (loading && !billingData) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <Loader2 className="h-8 w-8 animate-spin" />
//       </div>
//     );
//   }

//   if (!billingData) {
//     return (
//       <div className="text-center py-12">
//         <p className="text-muted-foreground">Failed to load billing data</p>
//         <Button onClick={() => fetchBillingData()} className="mt-4">
//           Retry
//         </Button>
//       </div>
//     );
//   }

//   const {stats, plans, recent_invoices, pagination} = billingData;

//   return (
//     <>
//       <div className="space-y-6">
//         {/* Header */}
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-bold tracking-tight text-foreground">
//               Billing & Subscriptions
//             </h1>
//             <p className="text-muted-foreground mt-1">
//               Manage subscription plans and invoices
//             </p>
//           </div>
//         </div>

//         {/* Revenue Stats */}
//         <div className="grid gap-4 md:grid-cols-4">
//           <Card>
//             <CardHeader className="pb-2">
//               <CardTitle className="text-sm font-medium text-muted-foreground">
//                 Monthly Revenue
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold text-foreground">
//                 {formatCurrency(
//                   stats.monthly_revenue_amount,
//                   stats.monthly_revenue_currency
//                 )}
//               </div>
//               <p className="text-xs text-muted-foreground mt-1">
//                 Current month revenue
//               </p>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardHeader className="pb-2">
//               <CardTitle className="text-sm font-medium text-muted-foreground">
//                 Active Subscriptions
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold text-foreground">
//                 {stats.active_subscriptions}
//               </div>
//               <p className="text-xs text-muted-foreground mt-1">
//                 Total active plans
//               </p>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardHeader className="pb-2">
//               <CardTitle className="text-sm font-medium text-muted-foreground">
//                 Pending Invoices
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold text-foreground">
//                 {stats.pending_invoices_count}
//               </div>
//               <p className="text-xs text-muted-foreground mt-1">
//                 {formatCurrency(
//                   stats.pending_invoices_total,
//                   stats.monthly_revenue_currency
//                 )}{" "}
//                 total
//               </p>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardHeader className="pb-2">
//               <CardTitle className="text-sm font-medium text-muted-foreground">
//                 Collection Rate
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold text-foreground">
//                 {Math.round(stats.collection_rate.amount_pct * 100)}%
//               </div>
//               <p className="text-xs text-muted-foreground mt-1">Success rate</p>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Subscription Plans */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Subscription Plans</CardTitle>
//             <CardDescription>Available plans and pricing</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//               {plans.map((plan) => (
//                 <div
//                   key={plan.id}
//                   className="p-4 rounded-lg border border-border hover:shadow-md transition-shadow">
//                   <div className="space-y-3">
//                     <div>
//                       <h3 className="font-semibold text-foreground">
//                         {plan.name}
//                       </h3>
//                       <div className="flex items-baseline gap-1 mt-2">
//                         <span className="text-3xl font-bold text-foreground">
//                           {formatCurrency(
//                             plan.price,
//                             stats.monthly_revenue_currency
//                           )}
//                         </span>
//                         <span className="text-sm text-muted-foreground">
//                           /{plan.billing_period} days
//                         </span>
//                       </div>
//                     </div>
//                     <div className="space-y-2 text-sm">
//                       <div className="flex justify-between">
//                         <span className="text-muted-foreground">
//                           Student Limit
//                         </span>
//                         <span className="font-medium text-foreground">
//                           {plan.student_limit === 0
//                             ? "Unlimited"
//                             : plan.student_limit}
//                         </span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-muted-foreground">Active</span>
//                         <Badge variant="secondary">
//                           {plan.active_subscriptions}
//                         </Badge>
//                       </div>
//                     </div>
//                     <Button
//                       className="w-full bg-transparent"
//                       variant="outline"
//                       size="sm">
//                       Manage Plan
//                     </Button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>

//         {/* Recent Invoices */}
//         <Card>
//           <CardHeader>
//             <div className="flex items-center justify-between">
//               <div>
//                 <CardTitle>Recent Invoices</CardTitle>
//                 <CardDescription>
//                   Latest billing transactions - Page {pagination.page} of{" "}
//                   {Math.ceil(pagination.total / pagination.page_size)}
//                 </CardDescription>
//               </div>
//               <form onSubmit={handleSearch} className="relative w-64">
//                 <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
//                 <Input
//                   placeholder="Search invoices..."
//                   className="pl-9"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                 />
//               </form>
//             </div>
//           </CardHeader>
//           <CardContent>
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Invoice Number</TableHead>
//                   <TableHead>Parent</TableHead>
//                   <TableHead>Amount</TableHead>
//                   <TableHead>Issued Date</TableHead>
//                   <TableHead>Due Date</TableHead>
//                   <TableHead>Status</TableHead>
//                   <TableHead></TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {recent_invoices.map((invoice) => (
//                   <TableRow key={invoice.id}>
//                     <TableCell>
//                       <div className="flex items-center gap-2">
//                         <CreditCard className="h-4 w-4 text-muted-foreground" />
//                         <span className="font-mono text-sm">
//                           {invoice.number}
//                         </span>
//                       </div>
//                     </TableCell>
//                     <TableCell className="font-medium">
//                       {invoice.parent}
//                     </TableCell>
//                     <TableCell>
//                       <div className="flex items-center gap-1">
//                         <DollarSign className="h-3 w-3 text-muted-foreground" />
//                         <span className="font-semibold">
//                           {formatCurrency(invoice.amount, invoice.currency)}
//                         </span>
//                       </div>
//                     </TableCell>
//                     <TableCell className="text-muted-foreground">
//                       {formatDate(invoice.issuedAt)}
//                     </TableCell>
//                     <TableCell className="text-muted-foreground">
//                       {formatDate(invoice.dueAt)}
//                     </TableCell>
//                     <TableCell>
//                       <Badge
//                         variant={
//                           invoice.status === "paid" ? "default" : "secondary"
//                         }
//                         className="capitalize">
//                         {invoice.status}
//                       </Badge>
//                     </TableCell>
//                     <TableCell>
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         onClick={() => setViewingInvoice(invoice)}>
//                         <Eye className="mr-2 h-4 w-4" />
//                         View
//                       </Button>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>

//             {/* Pagination */}
//             {pagination.total > pagination.page_size && (
//               <div className="flex items-center justify-between mt-4">
//                 <div className="text-sm text-muted-foreground">
//                   Showing {(pagination.page - 1) * pagination.page_size + 1} to{" "}
//                   {Math.min(
//                     pagination.page * pagination.page_size,
//                     pagination.total
//                   )}{" "}
//                   of {pagination.total} invoices
//                 </div>
//                 <div className="flex gap-2">
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     onClick={() =>
//                       setCurrentPage((prev) => Math.max(prev - 1, 1))
//                     }
//                     disabled={pagination.page === 1}>
//                     Previous
//                   </Button>
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     onClick={() => setCurrentPage((prev) => prev + 1)}
//                     disabled={
//                       pagination.page >=
//                       Math.ceil(pagination.total / pagination.page_size)
//                     }>
//                     Next
//                   </Button>
//                 </div>
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>

//       {/* Invoice Details Modal */}
//       <InvoiceDetailsModal
//         open={!!viewingInvoice}
//         onOpenChange={(open) => !open && setViewingInvoice(null)}
//         invoice={viewingInvoice}
//       />
//     </>
//   );
// }

"use client";

import {useState, useEffect} from "react";
import {useToast} from "@/hooks/use-toast";
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
import {InvoiceDetailsModal} from "@/components/admin/modals/invoice-details-modal";

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

export default function BillingPage() {
  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewingInvoice, setViewingInvoice] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const {toast} = useToast();

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
    fetchBillingData(currentPage, searchQuery);
  }, [currentPage, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBillingData(1, searchQuery);
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

  const {stats, plans, recent_invoices, pagination} = billingData;

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
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Monthly Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
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
              <div className="text-2xl font-bold text-foreground">
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
              <div className="text-2xl font-bold text-foreground">
                {stats.pending_invoices_count}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
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
              <div className="text-2xl font-bold text-foreground">
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
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
              {plans.map((plan) => (
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
                          {formatCurrency(
                            plan.price,
                            stats.monthly_revenue_currency
                          )}
                        </span>
                        <span className="text-sm text-muted-foreground">
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
        </Card>

        {/* Recent Invoices */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Recent Invoices</CardTitle>
                <CardDescription>
                  Latest billing transactions - Page {pagination.page} of{" "}
                  {Math.ceil(pagination.total / pagination.page_size)}
                </CardDescription>
              </div>
              <form onSubmit={handleSearch} className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search invoices..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
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
                              invoice.status === "paid"
                                ? "default"
                                : "secondary"
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
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {recent_invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="p-4 rounded-lg border border-border">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono text-sm">
                          {invoice.number}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-medium">
                        {invoice.parent}
                      </p>
                    </div>
                    <Badge
                      variant={
                        invoice.status === "paid" ? "default" : "secondary"
                      }
                      className="capitalize">
                      {invoice.status}
                    </Badge>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-muted-foreground" />
                      <span className="font-semibold">
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
                    className="mt-4 w-full">
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Button>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.total > pagination.page_size && (
              <div className="flex flex-col gap-2 mt-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {(pagination.page - 1) * pagination.page_size + 1} to{" "}
                  {Math.min(
                    pagination.page * pagination.page_size,
                    pagination.total
                  )}{" "}
                  of {pagination.total} invoices
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={pagination.page === 1}>
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    disabled={
                      pagination.page >=
                      Math.ceil(pagination.total / pagination.page_size)
                    }>
                    Next
                  </Button>
                </div>
              </div>
            )}
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

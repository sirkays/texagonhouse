// texagon_academy\texagonui\components\store\order-management.tsx
"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useEffect, useState, useRef } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  Search,
  MessageSquare,
  Star,
  Calendar,
  Loader2,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface OrderItem {
  name: string;
  price: number;
  type: string;
  downloadUrl?: string;
  tracking?: string;
  trackingUrl?: string;
}

interface Order {
  id: string;
  date: string;
  status: string;
  total: number;
  items: OrderItem[];
  paymentMethod: string;
  nextPayment?: string;
  remainingPayments?: number;
  estimatedDelivery?: string;
  agreementId?: string;
}

type Installment = {
  id: string;
  index: number;
  due_at: string;
  amount_due: string;
  amount_paid: string;
  status: string;
};

type BnplAgreementDetail = {
  id: string;
  order_id: string;
  provider: string;
  status: string;
  total_amount: string;
  amount_paid: string;
  amount_outstanding: string;
  installments: Installment[];
};

export function OrderManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [bnplOpen, setBnplOpen] = useState(false);
  const [bnplLoading, setBnplLoading] = useState(false);
  const [bnplDetail, setBnplDetail] = useState<BnplAgreementDetail | null>(null);
  const [bnplError, setBnplError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasConfirmedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      try {
        const res = await fetch("/api/store/orders");
        if (!res.ok) {
          console.error("Failed to fetch orders");
          return;
        }
        const { results } = await res.json();

        const detailedOrders = await Promise.all(
          (results || []).map(async (order: any) => {
            const detailRes = await fetch(`/api/store/orders/${order.id}`);
            let detail;
            if (detailRes.ok) {
              detail = await detailRes.json();
            } else {
              console.error(`Failed to fetch order details for ${order.id}`);
              detail = {
                id: order.id,
                status: order.status,
                grand_total: order.grand_total,
                items: order.items,
                shipments: [],
              };
            }

            const hasShipments = (detail.shipments || []).length > 0;
            const itemType = hasShipments ? "physical" : "physical";

            const items = (detail.items || []).map((item: any) => ({
              name: item.title,
              price: parseFloat(item.price),
              type: itemType,
              downloadUrl: !hasShipments ? "#" : undefined,
              tracking: hasShipments
                ? detail.shipments[0]?.tracking_number
                : undefined,
              trackingUrl: hasShipments
                ? detail.shipments[0]?.tracking_url
                : undefined,
            }));

            let estimatedDelivery: string | undefined;
            if (hasShipments) {
              const shipment = detail.shipments[0];
              if (shipment?.delivered_at) {
                estimatedDelivery = shipment.delivered_at.split("T")[0];
              } else if (shipment?.shipped_at) {
                const shippedDate = new Date(shipment.shipped_at);
                shippedDate.setDate(shippedDate.getDate() + 7);
                estimatedDelivery = shippedDate.toISOString().split("T")[0];
              }
            }

            return {
              id: detail.id,
              date: order.created_at.split("T")[0],
              status: detail.status,
              total: parseFloat(detail.grand_total),
              items,

              // ✅ payment method + bnpl metadata
              paymentMethod: order.is_bnpl ? "BNPL" : "Credit Card",
              nextPayment: order.next_payment ? order.next_payment.split("T")[0] : undefined,
              remainingPayments: typeof order.remaining_payments === "number" ? order.remaining_payments : undefined,
              agreementId: order.agreement_id || undefined,

              estimatedDelivery,
            };

          })
        );

        if (!cancelled) setOrders(detailedOrders);
      } catch (error) {
        console.error("Error loading orders:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);


  useEffect(() => {
    const isBnplReturn = searchParams.get("bnpl_return") === "1";
    if (!isBnplReturn) return;

    const status = (searchParams.get("status") || "").toLowerCase();
    const tx_ref = searchParams.get("tx_ref") || "";
    const transaction_id = searchParams.get("transaction_id") || "";

    if (!tx_ref || !transaction_id) return;
    if (!["successful", "completed"].includes(status)) return;
    if (hasConfirmedRef.current) return;

    const invoice_id = localStorage.getItem(`bnpl_invoice_id:${tx_ref}`);
    if (!invoice_id) {
      console.error("Missing invoice_id for tx_ref:", tx_ref);
      return;
    }

    hasConfirmedRef.current = true;

    (async () => {
      const res = await fetch("/api/billing?action=confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "completed",
          tx_ref,
          transaction_id,
          invoice_id,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        hasConfirmedRef.current = false;
        console.error("Confirm failed:", data);
        return;
      }

      // cleanup
      localStorage.removeItem(`bnpl_invoice_id:${tx_ref}`);
      localStorage.removeItem(`bnpl_installment_id:${tx_ref}`);

      // ✅ stay on same page, clean URL
      router.replace("/store?tab=orders");
    })();
  }, [searchParams, router]);

  
  const startBnpl = async (_orderId: string) => {
    alert("Start BNPL (your existing logic stays here)");
  };

  const viewSchedule = async (agreementId: string | undefined) => {
    if (!agreementId) return;

    setBnplOpen(true);
    setBnplLoading(true);
    setBnplError(null);

    try {
      // IMPORTANT:
      // This assumes you create a Next route like: /api/store/bnpl/agreements/[id]
      // If you don't have it yet, see section 3 below.

      const res = await fetch(`/api/store/bnpl/agreements/${agreementId}`);
      if (!res.ok) throw new Error("Failed to load BNPL schedule");

      const data = await res.json();
      setBnplDetail(data);
    } catch (e: any) {
      setBnplError(e?.message || "Failed to load BNPL schedule");
    } finally {
      setBnplLoading(false);
    }
  };


  const updateMethod = () => {
    alert("Update payment method not implemented");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-700";
      case "shipped":
        return "bg-blue-100 text-blue-700";
      case "processing":
        return "bg-yellow-100 text-yellow-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "shipped":
        return <Truck className="h-4 w-4" />;
      case "processing":
        return <Clock className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };


  const isSettled = (inst: Installment) => {
  const status = (inst.status || "").toLowerCase();
  const paid = parseFloat(inst.amount_paid || "0");
  const due = parseFloat(inst.amount_due || "0");

  // Backend supports statuses like captured/refunded
  if (["captured", "refunded"].includes(status)) return true;

  // Safety net if status wasn't updated but amounts are
  return due > 0 && paid >= due;
};

const getInstallmentBadge = (inst: Installment) => {
  const status = (inst.status || "").toLowerCase();
  const due = new Date(inst.due_at);
  const now = new Date();
  const unpaid = ["pending", "authorized", "failed"].includes(status);

  if (isSettled(inst)) {
    return { label: "Paid", className: "bg-green-100 text-green-700" };
  }

  if (unpaid && due <= now) {
    // if you want to distinguish failed vs due
    if (status === "failed") {
      return { label: "Payment failed", className: "bg-red-100 text-red-700" };
    }
    return { label: "Due now", className: "bg-yellow-100 text-yellow-700" };
  }

  return { label: "Upcoming", className: "bg-gray-100 text-gray-700" };
};


  const isInstallmentPayableNow = (inst: Installment) => {
    const due = new Date(inst.due_at);
    const now = new Date();
    const status = (inst.status || "").toLowerCase();
    const unpaid = ["pending", "authorized", "failed"].includes(status);
    return unpaid && due <= now;
  };

  const getNextDueInstallment = (detail: BnplAgreementDetail | null) => {
    if (!detail?.installments?.length) return null;
    const unpaid = detail.installments.filter((i) =>
      ["pending", "authorized", "failed"].includes((i.status || "").toLowerCase())
    );
    if (!unpaid.length) return null;
    unpaid.sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime());
    return unpaid[0];
  };

  const getNextPayableInstallment = (detail: BnplAgreementDetail | null) => {
    if (!detail?.installments?.length) return null;

    const candidates = detail.installments.filter((i) => {
      if (isSettled(i)) return false;          // ⛔ already paid
      const status = (i.status || "").toLowerCase();
      const unpaid = ["pending", "authorized", "failed"].includes(status);
      if (!unpaid) return false;               // ⛔ not chargeable
      return new Date(i.due_at) <= new Date(); // ✅ due now
    });

    candidates.sort(
      (a, b) =>
        new Date(a.due_at).getTime() -
        new Date(b.due_at).getTime()
    );

    return candidates[0] || null;
  };

  const payable = getNextPayableInstallment(bnplDetail);

  const makePayment = async (agreementId?: string) => {
    if (!agreementId) return;

    // ✅ ensure we have a non-null detail object
    let detail: BnplAgreementDetail | null = bnplDetail;

    if (!detail) {
      setBnplLoading(true);
      try {
        const r = await fetch(`/api/store/bnpl/agreements/${agreementId}`);
        if (!r.ok) throw new Error("Failed to load BNPL schedule");
        detail = await r.json();
        setBnplDetail(detail);
      } catch (e: any) {
        setBnplError(e?.message || "Failed to load BNPL schedule");
        return;
      } finally {
        setBnplLoading(false);
      }
    }

    // ✅ TS now knows `detail` might still be null, so hard-guard it
    if (!detail) return;

    // ... now safe:
    const orderId = detail.order_id;
    if (!orderId) {
      alert("BNPL schedule is missing order_id.");
      return;
    }
      // pick the next payable installment (due now + not settled)
    const next = (detail.installments || [])
      .filter((i: any) => !["captured", "refunded"].includes(String(i.status || "").toLowerCase()))
      .filter((i: any) => new Date(i.due_at) <= new Date())
      .sort((a: any, b: any) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime())[0];

    if (!next) {
      alert("No installment is due for payment yet.");
      return;
    }

        // ✅ Create payment link (your backend expects these keys)
    const redirect_url =
      `${window.location.origin}/store?tab=orders&bnpl_return=1`; // SAME page

    const res = await fetch("/api/billing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        redirect_url,
        is_store_payment: true,
        is_bnpl: true,
        order_id: detail.order_id,
        amount: String(next.amount_due),
        payment_title: `BNPL Installment #${next.index}`,

        // optional: helps backend pick correct installment later
        installment_id: next.id,
        agreement_id: agreementId,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.detail || data?.error || "Payment init failed");

    // ✅ These come from _serialize_payment
    const link = data?.payment_link;
    const invoiceId = data?.invoice_id;
    const reference = data?.reference; // THIS is what provider returns as tx_ref

    if (!link || !invoiceId || !reference) {
      throw new Error("Missing payment_link / invoice_id / reference from backend");
    }

    // ✅ store invoice_id by tx_ref(reference)
    localStorage.setItem(`bnpl_invoice_id:${reference}`, String(invoiceId));

    // (optional) store installment mapping too
    localStorage.setItem(`bnpl_installment_id:${reference}`, String(next.id));

    window.location.href = link;

  };

  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading orders…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold">Order Management</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Track your orders and manage your purchases
        </p>
      </header>

      {/* Search */}
      <div className="relative max-w-full sm:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search orders..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all-orders" className="space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <TabsList className="flex w-full sm:w-auto justify-start sm:justify-center gap-2 overflow-x-auto whitespace-nowrap no-scrollbar bg-muted/50 p-2 rounded-2xl">
            <TabsTrigger
              value="all-orders"
              className="px-4 py-2 rounded-xl text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white transition-all"
            >
              All Orders
            </TabsTrigger>
            <TabsTrigger
              value="bnpl"
              className="px-4 py-2 rounded-xl text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white transition-all"
            >
              BNPL Orders
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all-orders">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((order) => (
              <Card
                key={order.id}
                className="flex flex-col shadow-sm hover:shadow-md transition-all rounded-2xl"
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-2 flex-wrap">
                    <span>Order {order.id}</span>
                    <Badge className={getStatusColor(order.status)}>
                      <div className="flex items-center gap-1 capitalize">
                        {getStatusIcon(order.status)}
                        {order.status}
                      </div>
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Placed on {order.date} • Total: ₦{order.total}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className="p-3 bg-gray-50 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                      >
                        <div>
                          <h4 className="font-medium text-sm sm:text-base">
                            {item.name}
                          </h4>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                item.type === "digital" ? "secondary" : "outline"
                              }
                            >
                              {item.type}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              ₦{item.price}
                            </span>
                          </div>
                          {item.tracking && (
                            <p className="text-xs text-muted-foreground">
                              Tracking: {item.tracking}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 border-t pt-3">
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      <MessageSquare className="mr-2 h-3 w-3" />
                      Contact Support
                    </Button>

                    {order.status === "delivered" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto"
                      >
                        <Star className="mr-2 h-3 w-3" />
                        Leave Review
                      </Button>
                    )}

                    {order.paymentMethod === "Credit Card" &&
                      order.status === "processing" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto"
                          onClick={() => startBnpl(order.id)}
                        >
                          Set up BNPL
                        </Button>
                      )}
                  </div>

                  {order.estimatedDelivery && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        Estimated delivery: {order.estimatedDelivery}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="bnpl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders
              .filter((order) => order.paymentMethod === "BNPL")
              .map((order) => (
                <Card
                  key={order.id}
                  className="shadow-sm hover:shadow-md transition-all rounded-2xl"
                >
                  <CardHeader>
                    <CardTitle>BNPL Order {order.id}</CardTitle>
                    <CardDescription>Manage your payment schedule</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Next Payment</p>
                        <p className="font-medium">{order.nextPayment}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Remaining</p>
                        <p className="font-medium">{order.remainingPayments}</p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={() => viewSchedule(order.agreementId)}
                      >
                        View Schedule
                      </Button>


                      <Button
                        className="w-full sm:w-auto"
                        onClick={() => makePayment(order.agreementId)}
                        disabled={!bnplDetail || !getNextPayableInstallment(bnplDetail)}
                      >
                        Make Payment
                      </Button>

                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={bnplOpen} onOpenChange={setBnplOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>BNPL Schedule</DialogTitle>
            <DialogDescription>
              {bnplDetail
                ? `Provider: ${bnplDetail.provider} • Status: ${bnplDetail.status}`
                : "Loading schedule..."}
            </DialogDescription>
          </DialogHeader>

          {bnplLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading…</span>
            </div>
          )}

          {bnplError && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg">
              {bnplError}
            </div>
          )}

          {!bnplLoading && bnplDetail && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Total</p>
                  <p className="font-medium">₦{bnplDetail.total_amount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Outstanding</p>
                  <p className="font-medium">₦{bnplDetail.amount_outstanding}</p>
                </div>
              </div>

              <div className="space-y-2">
                {bnplDetail.installments.map((inst) => {
                  const dueDate = inst.due_at ? inst.due_at.split("T")[0] : "—";
                  const payable = isInstallmentPayableNow(inst);

                  return (
                    <div
                      key={inst.id}
                      className="p-3 rounded-lg border flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          Installment #{inst.index} • ₦{inst.amount_due}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Due: {dueDate} • Status: {inst.status}
                        </p>
                      </div>

                      {(() => {
                        const b = getInstallmentBadge(inst);
                        return <Badge className={b.className}>{b.label}</Badge>;
                      })()}

                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}

// texagon_academy/texagonui/components/store/order-management.tsx
"use client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useEffect, useRef, useState } from "react";
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

// -----------------------------
// SHIPMENT TRACKING (simple)
// -----------------------------
type TrackingEvent = {
  id: string;
  code: string;      // ✅ was event_code
  desc?: string;     // ✅ was description
  occurred_at: string;
  city?: string;
  state?: string;
  country?: string;
};


type Shipment = {
  id: string;
  status: string;
  tracking_number?: string;
  tracking_url?: string;
  shipped_at?: string;
  delivered_at?: string;
  events?: TrackingEvent[];
};


function safeParseNum(v: any, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export function OrderManagement() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [bnplOpen, setBnplOpen] = useState(false);
  const [bnplError, setBnplError] = useState<string | null>(null);
  const [activeAgreementId, setActiveAgreementId] = useState<string | null>(null);

  // ✅ Cache BNPL details per agreement (so Make Payment works without View Schedule)
  const [bnplDetailsByAgreement, setBnplDetailsByAgreement] = useState<
    Record<string, BnplAgreementDetail>
  >({});
  const [bnplLoadingByAgreement, setBnplLoadingByAgreement] = useState<
    Record<string, boolean>
  >({});

  const router = useRouter();
  const searchParams = useSearchParams();
  const hasConfirmedRef = useRef(false);

  const ordersTabParam = (searchParams.get("ordersTab") || "").toLowerCase();
  const defaultOrdersTab = ordersTabParam === "bnpl" ? "bnpl" : "all-orders";

  const [trackOpen, setTrackOpen] = useState(false);
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState<string | null>(null);
  const [trackOrderId, setTrackOrderId] = useState<string | null>(null);
  const [trackShipments, setTrackShipments] = useState<Shipment[]>([]);

  const loadOrders = async () => {
    setLoading(true);
    setBnplError(null);

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
            tracking: hasShipments ? detail.shipments[0]?.tracking_number : undefined,
            trackingUrl: hasShipments ? detail.shipments[0]?.tracking_url : undefined,
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

            paymentMethod: order.is_bnpl ? "BNPL" : "Credit Card",
            nextPayment: order.next_payment ? order.next_payment.split("T")[0] : undefined,
            remainingPayments:
              typeof order.remaining_payments === "number"
                ? order.remaining_payments
                : undefined,
            agreementId: order.agreement_id || undefined,

            estimatedDelivery,
          };
        })
      );

      setOrders(detailedOrders);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };


  const openTracking = async (order_id: string) => {
    setTrackOrderId(order_id);
    setTrackOpen(true);
    setTrackLoading(true);
    setTrackError(null);
    setTrackShipments([]);

    try {
      const res = await fetch(`/api/store/orders/${order_id}/shipments`, {
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));
      
      console.log(data, " tracking data...")
      if (!res.ok) {
        throw new Error(data?.detail || data?.error || "Failed to load shipments");
      }

      setTrackShipments(Array.isArray(data?.results) ? data.results : []);
    } catch (e: any) {
      setTrackError(e?.message || "Failed to load shipments");
    } finally {
      setTrackLoading(false);
    }
  };

  // -----------------------------
  // LOAD ORDERS
  // -----------------------------
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (cancelled) return;
      await loadOrders();
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  // -----------------------------
  // BNPL RETURN HANDLER (CONFIRM)
  // redirect_url is: /store?tab=orders&bnpl_return=1&status=...&tx_ref=...&transaction_id=...
  // Provider doesn't return invoice_id, so we map tx_ref -> invoice_id in localStorage.
  // -----------------------------
  useEffect(() => {
    const isBnplReturn = searchParams.get("bnpl_return") === "1";
    if (!isBnplReturn) return;

    const status = (searchParams.get("status") || "").toLowerCase();
    const tx_ref = searchParams.get("tx_ref") || "";
    const transaction_id = searchParams.get("transaction_id") || "";

    // 🚫 User cancelled payment on provider page
    if (status === "cancelled") {
      toast({
        title: "Payment cancelled",
        description: "You cancelled the BNPL payment. No charges were made.",
        variant: "default",
      });

      // Clean URL but stay on Orders tab
      router.replace("/store?tab=orders&ordersTab=bnpl");

      return;
    }

    // ❌ Explicit failure from provider
    if (status === "failed") {
      toast({
        title: "Payment failed",
        description: "The BNPL payment did not complete successfully.",
        variant: "destructive",
      });

      router.replace("/store?tab=orders&ordersTab=bnpl");

      return;
    }

    // ✅ Only continue confirmation for successful payments
    if (!["successful", "completed"].includes(status)) return;


    if (hasConfirmedRef.current) return;

    const invoice_id = localStorage.getItem(`bnpl_invoice_id:${tx_ref}`);
    if (!invoice_id) {
      console.error("Missing invoice_id for tx_ref:", tx_ref);
      return;
    }

    hasConfirmedRef.current = true;

    (async () => {
      try {
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

        // Optional: refresh bnpl schedule cache for the active agreement (if any)
        // (You can also reload orders list if you want.)
        toast({
          title: "Payment successful 🎉",
          description: "Your BNPL installment has been recorded successfully.",
        });
        await loadOrders();
        router.replace("/store?tab=orders&ordersTab=bnpl");


      } catch (e) {
        hasConfirmedRef.current = false;
        console.error("Confirm error:", e);
      }
    })();
  }, [searchParams, router]);


  // -----------------------------
  // UI HELPERS
  // -----------------------------
  const getStatusColor = (status: string) => {
    switch ((status || "").toLowerCase()) {
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
    switch ((status || "").toLowerCase()) {
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

  // BNPL installment settled detection (no DB field needed)
  const isSettled = (inst: Installment) => {
    const status = (inst.status || "").toLowerCase();
    const paid = safeParseNum(inst.amount_paid, 0);
    const due = safeParseNum(inst.amount_due, 0);

    if (["captured", "refunded"].includes(status)) return true;
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
      if (status === "failed") {
        return { label: "Payment failed", className: "bg-red-100 text-red-700" };
      }
      return { label: "Due now", className: "bg-yellow-100 text-yellow-700" };
    }

    return { label: "Upcoming", className: "bg-gray-100 text-gray-700" };
  };

  const isInstallmentPayableNow = (inst: Installment) => {
    if (isSettled(inst)) return false;
    const due = new Date(inst.due_at);
    const now = new Date();
    const status = (inst.status || "").toLowerCase();
    const unpaid = ["pending", "authorized", "failed"].includes(status);
    return unpaid && due <= now;
  };

  const getNextPayableInstallment = (detail: BnplAgreementDetail | null) => {
    if (!detail?.installments?.length) return null;

    const candidates = detail.installments.filter((i) => {
      if (isSettled(i)) return false;
      const status = (i.status || "").toLowerCase();
      const unpaid = ["pending", "authorized", "failed"].includes(status);
      if (!unpaid) return false;
      return new Date(i.due_at) <= new Date();
    });

    candidates.sort(
      (a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime()
    );

    return candidates[0] || null;
  };

  // -----------------------------
  // BNPL CACHE HELPERS
  // -----------------------------
  const getCachedDetail = (agreementId?: string) =>
    agreementId ? bnplDetailsByAgreement[agreementId] : undefined;

  const isAgreementLoading = (agreementId?: string) =>
    agreementId ? !!bnplLoadingByAgreement[agreementId] : false;

  const setAgreementLoading = (agreementId: string, v: boolean) => {
    setBnplLoadingByAgreement((prev) => ({ ...prev, [agreementId]: v }));
  };

  const setAgreementDetail = (agreementId: string, detail: BnplAgreementDetail) => {
    setBnplDetailsByAgreement((prev) => ({ ...prev, [agreementId]: detail }));
  };

  const fetchAgreementDetail = async (agreementId: string) => {
    const cached = bnplDetailsByAgreement[agreementId];
    if (cached) return cached;

    setAgreementLoading(agreementId, true);
    try {
      const r = await fetch(`/api/store/bnpl/agreements/${agreementId}`);
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        throw new Error(data?.detail || data?.error || "Failed to load BNPL schedule");
      }
      setAgreementDetail(agreementId, data as BnplAgreementDetail);
      return data as BnplAgreementDetail;
    } finally {
      setAgreementLoading(agreementId, false);
    }
  };

  // -----------------------------
  // ACTIONS
  // -----------------------------
  const startBnpl = async (_orderId: string) => {
    alert("Start BNPL (your existing logic stays here)");
  };

  const viewSchedule = async (agreementId: string | undefined) => {
    if (!agreementId) return;

    setBnplError(null);
    setActiveAgreementId(agreementId);
    setBnplOpen(true);

    try {
      await fetchAgreementDetail(agreementId);
    } catch (e: any) {
      setBnplError(e?.message || "Failed to load BNPL schedule");
    }
  };

  // ✅ Make Payment works even if user never clicked "View Schedule"
  const makePayment = async (agreementId?: string) => {
    if (!agreementId) return;

    setBnplError(null);

    let detail: BnplAgreementDetail;
    try {
      detail = await fetchAgreementDetail(agreementId);
      toast({
        title: "BNPL schedule loaded",
        description: "Preparing your next installment for payment.",
      });

    } catch (e: any) {
      setBnplError(e?.message || "Failed to load BNPL schedule");
      return;
    }

    const next = getNextPayableInstallment(detail);
    if (!next) {
      alert("No installment is due for payment yet.");
      return;
    }

    try {
      // ✅ stay on same page (Orders tab) so we can confirm using invoice_id from localStorage
      const redirect_url = `${window.location.origin}/store?tab=orders&ordersTab=bnpl&bnpl_return=1`;

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

          // optional: helps backend later if you decide to use them
          installment_id: next.id,
          agreement_id: agreementId,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({
          title: "Payment failed",
          description:
            data?.detail ||
            data?.error ||
            "Unable to start BNPL payment. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // From _serialize_payment
      const link = data?.payment_link;
      const invoiceId = data?.invoice_id;
      const reference = data?.reference; // tx_ref

      if (!link || !invoiceId || !reference) {
        throw new Error("Missing payment_link / invoice_id / reference from backend");
      }

      // ✅ map tx_ref -> invoice_id (provider returns tx_ref, not invoice_id)
      localStorage.setItem(`bnpl_invoice_id:${reference}`, String(invoiceId));
      localStorage.setItem(`bnpl_installment_id:${reference}`, String(next.id));

      window.location.href = link;
    } catch (e: any) {
      const msg = e?.message || "Failed to load BNPL schedule";

      setBnplError(msg);

      toast({
        title: "Unable to load schedule",
        description: msg,
        variant: "destructive",
      });

    }
  };

  // -----------------------------
  // FILTER
  // -----------------------------
  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Dialog detail (from cache)
  const dialogDetail =
    activeAgreementId ? bnplDetailsByAgreement[activeAgreementId] : undefined;
  const dialogLoading = isAgreementLoading(activeAgreementId || undefined);

  const [ordersTab, setOrdersTab] = useState<string>(defaultOrdersTab);

  useEffect(() => {
    if (ordersTabParam === "bnpl") {
      setOrdersTab("bnpl");
    }
  }, [ordersTabParam]);


  // -----------------------------
  // RENDER
  // -----------------------------
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
      <Tabs
        value={ordersTab}
        onValueChange={setOrdersTab}
        className="space-y-6"
      >

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
                              variant={item.type === "digital" ? "secondary" : "outline"}
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
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto"
                      onClick={() => openTracking(order.id)}
                    >
                      <Truck className="mr-2 h-3 w-3" />
                      Track
                    </Button>

                    {order.status === "delivered" && (
                      <Button variant="outline" size="sm" className="w-full sm:w-auto">
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
              .map((order) => {
                const detail = getCachedDetail(order.agreementId);
                const loadingThis = isAgreementLoading(order.agreementId);
                const nextPayable = detail ? getNextPayableInstallment(detail) : null;

                return (
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
                          <p className="font-medium">{order.nextPayment || "—"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Remaining</p>
                          <p className="font-medium">
                            {typeof order.remainingPayments === "number"
                              ? order.remainingPayments
                              : "—"}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          variant="outline"
                          className="w-full sm:w-auto"
                          onClick={() => viewSchedule(order.agreementId)}
                          disabled={!order.agreementId || loadingThis}
                        >
                          {loadingThis ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            "View Schedule"
                          )}
                        </Button>

                        <Button
                          className="w-full sm:w-auto"
                          onClick={() => makePayment(order.agreementId)}
                          disabled={!order.agreementId || loadingThis || (detail ? !nextPayable : false)}
                          title={
                            !order.agreementId
                              ? "Missing agreement id"
                              : loadingThis
                                ? "Loading schedule..."
                                : detail && !nextPayable
                                  ? "No installment is due yet"
                                  : ""
                          }
                        >
                          {loadingThis ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            "Make Payment"
                          )}
                        </Button>
                      </div>

                      {/* Optional small hint if we haven't loaded schedule yet */}
                      {!detail && order.agreementId && (
                        <p className="text-xs text-muted-foreground">
                          Tip: “Make Payment” will auto-load the schedule.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </TabsContent>
      </Tabs>

      {/* BNPL Schedule Dialog */}
      <Dialog
        open={bnplOpen}
        onOpenChange={(open) => {
          setBnplOpen(open);
          if (!open) setActiveAgreementId(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>BNPL Schedule</DialogTitle>
            <DialogDescription>
              {dialogDetail
                ? `Provider: ${dialogDetail.provider} • Status: ${dialogDetail.status}`
                : dialogLoading
                  ? "Loading schedule..."
                  : "Schedule not loaded"}
            </DialogDescription>
          </DialogHeader>

          {dialogLoading && (
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

          {!dialogLoading && dialogDetail && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Total</p>
                  <p className="font-medium">₦{dialogDetail.total_amount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Outstanding</p>
                  <p className="font-medium">₦{dialogDetail.amount_outstanding}</p>
                </div>
              </div>

              <div className="space-y-2">
                {dialogDetail.installments.map((inst) => {
                  const dueDate = inst.due_at ? inst.due_at.split("T")[0] : "—";
                  const badge = getInstallmentBadge(inst);
                  const payableNow = isInstallmentPayableNow(inst);

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
                          {payableNow ? " • Payable now" : ""}
                        </p>
                      </div>

                      <Badge className={badge.className}>{badge.label}</Badge>
                    </div>
                  );
                })}
              </div>

              {/* Optional: allow pay from dialog too */}
              <div className="pt-2 flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setBnplOpen(false)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => makePayment(activeAgreementId || undefined)}
                  disabled={!getNextPayableInstallment(dialogDetail)}
                >
                  Make Payment
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Shipment Tracking Dialog */}
      <Dialog
        open={trackOpen}
        onOpenChange={(open) => {
          setTrackOpen(open);
          if (!open) {
            setTrackOrderId(null);
            setTrackShipments([]);
            setTrackError(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Order Tracking</DialogTitle>
            <DialogDescription>
              {trackOrderId ? `Order: ${trackOrderId}` : "Tracking"}
            </DialogDescription>
          </DialogHeader>

          {trackLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading shipment…</span>
            </div>
          )}

          {trackError && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg">
              {trackError}
            </div>
          )}

          {!trackLoading && !trackError && trackShipments.length === 0 && (
            <div className="text-sm text-muted-foreground">
              No shipments yet for this order.
            </div>
          )}

          {!trackLoading && !trackError && trackShipments.length > 0 && (
            <div className="space-y-4">
              {trackShipments.map((s) => (
                <div key={s.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Shipment {String(s.id).slice(0, 8)}…</div>
                    <Badge className="capitalize">
                      {String(s.status || "").replaceAll("_", " ")}
                    </Badge>
                  </div>

                  <div className="text-sm">
                    Tracking:{" "}
                    <span className="font-semibold">
                      {s.tracking_number || "—"}
                    </span>
                  </div>

                  {s.tracking_url ? (
                    <a
                      className="text-sm underline text-primary"
                      href={s.tracking_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open carrier tracking
                    </a>
                  ) : null}

                  {Array.isArray(s.events) && s.events.length > 0 ? (
                    <div className="space-y-2 pt-2">
                      {s.events.map((ev) => (
                        <div key={ev.id} className="text-sm flex justify-between gap-3">
                          <span className="text-muted-foreground">
                            {String(ev.code || "").replaceAll("_", " ")}
                            {ev.desc ? ` — ${ev.desc}` : ""}

                          </span>
                          <span className="text-muted-foreground whitespace-nowrap">
                            {ev.occurred_at ? new Date(ev.occurred_at).toLocaleString() : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground pt-2">
                      No tracking events yet.
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <Button variant="outline" onClick={() => setTrackOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}

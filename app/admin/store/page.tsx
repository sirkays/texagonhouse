//texagon_academy\texagonui\app\admin\store\page.tsx
"use client";

import {useEffect, useMemo, useState} from "react";
import {useRouter} from "next/navigation";
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
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {useToast} from "@/hooks/use-toast";
import {Eye, PackagePlus, Plus, Search, Truck} from "lucide-react";

// Modals (below)
import {CreateShipmentModal} from "@/components/admin/modals/create-shipment-modal";
import {SetTrackingModal} from "@/components/admin/modals/set-tracking-modal";
import {AddTrackingEventModal} from "@/components/admin/modals/add-tracking-event-modal";
import {OrderDetailsModal} from "@/components/admin/modals/order-details-modal";
import {ShipmentDetailsModal} from "@/components/admin/modals/shipment-details-modal";

/**
 * NOTE:
 * - Products CRUD: NOT implemented now (just placeholder tab).
 * - Orders: We'll load PAID orders and allow Shipment creation.
 * - Shipments: We'll show shipments created (simple list).
 */

type OrderStatus = "pending" | "paid" | "fulfilled" | "cancelled";

type OrderItem = {
  id: string;
  title: string;
  sku?: string;
  quantity: number;
};

type Address = {
  full_name?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  phone?: string;
};

type Customer = {
  id?: string | null;
  full_name?: string;
  email?: string;
  phone?: string;
};

type Order = {
  id: string;
  orderNumber: string;
  customer: string; // keep for display
  customerObj?: Customer; // ✅ add
  shipping_address?: Address | null; // ✅ add
  billing_address?: Address | null; // ✅ add
  itemsCount: number;
  total: number;
  status: OrderStatus;
  date: string;
  items?: OrderItem[];
  shipmentsCount?: number;
  hasShipment?: boolean;
};

type ShipmentStatus =
  | "pending"
  | "ready"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "exception"
  | "returned"
  | "cancelled";

type Shipment = {
  id: string;
  order_id: string;
  status: ShipmentStatus;
  carrier_code: string;
  tracking_number?: string;
  tracking_url?: string;
  label_url?: string;
  shipped_at?: string;
  delivered_at?: string;
};

export default function StorePage() {
  const router = useRouter();
  const {toast} = useToast();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsShipment, setDetailsShipment] = useState<Shipment | null>(null);

  const [activeTab, setActiveTab] = useState<
    "products" | "orders" | "shipments"
  >("orders");
  const [creatingShipment, setCreatingShipment] = useState(false);
  const [settingTracking, setSettingTracking] = useState(false);
  const [addingEvent, setAddingEvent] = useState(false);

  // Placeholder products list (keep your UI if you want, but CRUD not now)
  const [searchQuery, setSearchQuery] = useState("");
  const [products] = useState<any[]>([]);

  // Paid orders + shipments
  const [orders, setOrders] = useState<any[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingShipments, setLoadingShipments] = useState(false);

  // Modals state
  const [createShipmentOpen, setCreateShipmentOpen] = useState(false);
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [eventOpen, setEventOpen] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(
    null
  );

  const [viewingOrder, setViewingOrder] = useState<any>(null);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        String(p.title || "")
          .toLowerCase()
          .includes(q) ||
        String(p.category || "")
          .toLowerCase()
          .includes(q) ||
        String(p.sku || "")
          .toLowerCase()
          .includes(q)
    );
  }, [products, searchQuery]);

  async function loadPaidOrders() {
    setLoadingOrders(true);
    try {
      const res = await fetch("/api/store/orders?status=paid", {
        cache: "no-store",
      });
      const raw = await res.text();

      if (!res.ok) throw new Error(raw || "Failed to load orders");

      let json: any;
      try {
        json = JSON.parse(raw);
      } catch {
        throw new Error("Orders API returned invalid JSON");
      }

      const results = Array.isArray(json?.results) ? json.results : [];

      // ✅ Map backend fields -> UI fields
      const mapped = results.map((o: any, idx: number) => {
        const itemsArr = Array.isArray(o.items) ? o.items : [];
        const totalNum = Number(o.grand_total ?? 0);

        const customerFullName =
          (o.customer?.full_name || "").trim() ||
          (o.customer?.email || "").trim() ||
          "—";
        return {
          id: String(o.id || ""),
          orderNumber: `ORD-${String(o.created_at || "").slice(0, 10)}-${
            idx + 1
          }`,
          customer: customerFullName,
          customerObj: o.customer || null,
          shipping_address: o.shipping_address || null,
          billing_address: o.billing_address || null,
          itemsCount: itemsArr.reduce(
            (sum: number, it: any) => sum + Number(it.qty || 0),
            0
          ),
          total: Number.isFinite(totalNum) ? totalNum : 0,
          status: String(o.status || ""),
          date: String(o.created_at || "").slice(0, 10),
          items: itemsArr.map((it: any) => ({
            id: String(it.id || ""),
            title: String(it.title || ""),
            sku: String(it.sku || ""),
            quantity: Number(it.qty || 0),
          })),

          // ✅ FIX: map snake_case -> camelCase
          shipmentsCount: Number(o.shipments_count ?? 0),
          hasShipment: Boolean(o.has_shipment),
        };
      });

      setOrders(mapped);
    } catch (e: any) {
      setOrders([]);
      toast({
        title: "Orders",
        description: e?.message || "Failed to load paid orders",
        variant: "destructive",
      });
    } finally {
      setLoadingOrders(false);
    }
  }

  async function loadShipments() {
    setLoadingShipments(true);

    try {
      const res = await fetch("/api/store/shipments", {cache: "no-store"});

      // If you haven't implemented the list endpoint yet, keep UI empty quietly
      if (res.status === 404) {
        setShipments([]);
        return;
      }

      const raw = await res.text();
      if (!res.ok) throw new Error(raw || "Failed to load shipments");

      let parsed: any;
      try {
        parsed = JSON.parse(raw);
      } catch {
        throw new Error("Shipments API returned invalid JSON");
      }

      // Support both shapes: [] OR { results: [] }
      const arr = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.results)
        ? parsed.results
        : [];

      // Normalize + coerce fields safely
      const normalized: Shipment[] = arr.map((x: any) => ({
        id: String(x?.id ?? ""),
        order_id: String(x?.order_id ?? ""),
        status: String(x?.status ?? "pending") as ShipmentStatus,
        carrier_code: String(x?.carrier_code ?? ""),
        tracking_number: x?.tracking_number ?? null,
        tracking_url: x?.tracking_url ?? null,
        label_url: x?.label_url ?? null,
        shipped_at: x?.shipped_at ?? null,
        delivered_at: x?.delivered_at ?? null,
      }));

      // Filter out invalid ids (prevents "undefined" hitting backend)
      const cleaned = normalized.filter(
        (s) => !!s.id && s.id !== "undefined" && s.id !== "null"
      );

      setShipments(cleaned);
    } catch (e) {
      // keep quiet; shipments list might not exist yet or may fail
      setShipments([]);
      // optional: uncomment if you want to show errors
      // toast({ title: "Shipments", description: (e as any)?.message || "Failed to load shipments", variant: "destructive" });
    } finally {
      setLoadingShipments(false);
    }
  }

  useEffect(() => {
    if (activeTab === "orders") loadPaidOrders();
    if (activeTab === "shipments") loadShipments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const getOrderStatusVariant = (status: OrderStatus) => {
    switch (status) {
      case "paid":
        return "secondary";
      case "fulfilled":
        return "default";
      case "pending":
        return "outline";
      default:
        return "destructive";
    }
  };

  const getShipmentStatusVariant = (status: ShipmentStatus) => {
    switch (status) {
      case "delivered":
        return "default";
      case "in_transit":
      case "out_for_delivery":
        return "secondary";
      case "exception":
      case "returned":
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  async function handleCreateShipment(payload: {
    orderId: string;
    carrier_code: string;
    method_id?: string;
    to: any;
    items: {order_item_id: string; quantity: number}[];
  }) {
    setCreatingShipment(true);
    try {
      const res = await fetch(
        `/api/store/orders/${payload.orderId}/shipments/create`,
        {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            carrier_code: payload.carrier_code,
            method_id: payload.method_id,
            to: payload.to,
            items: payload.items,
          }),
        }
      );

      const raw = await res.text();
      if (!res.ok) throw new Error(raw || "Failed to create shipment");

      const shipment = JSON.parse(raw) as Shipment;
      toast({title: "Shipment", description: "Shipment created successfully"});

      setCreateShipmentOpen(false);
      setSelectedOrder(null);

      // refresh
      if (activeTab === "orders") loadPaidOrders();
      setShipments((prev) => [shipment, ...prev]);
    } catch (e: any) {
      toast({
        title: "Shipment",
        description: e?.message || "Failed to create shipment",
        variant: "destructive",
      });
    } finally {
      setCreatingShipment(false);
    }
  }

  async function handleSetTracking(payload: {
    shipmentId: string;
    tracking_number: string;
    tracking_url?: string;
    label_url?: string;
    label_cost?: string | number;
    currency?: string;
  }) {
    setSettingTracking(true);
    try {
      const res = await fetch(
        `/api/store/shipments/${payload.shipmentId}/set-tracking`,
        {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            tracking_number: payload.tracking_number,
            tracking_url: payload.tracking_url,
            label_url: payload.label_url,
            label_cost: payload.label_cost,
            currency: payload.currency,
          }),
        }
      );

      const raw = await res.text();
      if (!res.ok) throw new Error(raw || "Failed to set tracking");

      const updated = JSON.parse(raw) as Shipment;
      toast({title: "Tracking", description: "Tracking updated"});

      setTrackingOpen(false);
      setSelectedShipment(updated);

      setShipments((prev) =>
        prev.map((s) => (s.id === updated.id ? updated : s))
      );
    } catch (e: any) {
      toast({
        title: "Tracking",
        description: e?.message || "Failed to set tracking",
        variant: "destructive",
      });
    } finally {
      setSettingTracking(false);
    }
  }

  async function handleAddEvent(payload: {
    shipmentId: string;
    event_code: string;
    description?: string;
    occurred_at?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
    carrier_status?: string;
  }) {
    setAddingEvent(true);
    try {
      const res = await fetch(
        `/api/store/shipments/${payload.shipmentId}/events`,
        {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            event_code: payload.event_code,
            description: payload.description,
            occurred_at: payload.occurred_at,
            city: payload.city,
            state: payload.state,
            country: payload.country,
            postal_code: payload.postal_code,
            carrier_status: payload.carrier_status,
          }),
        }
      );

      const raw = await res.text();
      if (!res.ok) throw new Error(raw || "Failed to add event");

      toast({title: "Event", description: "Tracking event added"});
      setEventOpen(false);

      // If your backend advances shipment status from events, you may want to refresh shipment list
      if (activeTab === "shipments") loadShipments();
    } catch (e: any) {
      toast({
        title: "Event",
        description: e?.message || "Failed to add tracking event",
        variant: "destructive",
      });
    } finally {
      setAddingEvent(false);
    }
  }

return (
  <div className="space-y-6 px-1 sm:px-0">
    {/* Header */}
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Store
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage Orders, Shipments & Tracking
        </p>
      </div>

      {/* Quick Actions - Full width on mobile */}
      <Button
        variant="outline"
        className="w-full sm:w-auto bg-transparent border-dashed"
        onClick={() => router.push("/admin/store/checkout")}
      >
        <Truck className="mr-2 h-4 w-4" />
        Go to Checkout
      </Button>
    </div>

    {/* Tabs - Height auto allows wrapping on very small screens */}
    <Tabs
      className="space-y-4"
      value={activeTab}
      onValueChange={(v: any) => setActiveTab(v)}
    >
      <TabsList className="w-full h-auto flex flex-wrap p-1 sm:grid sm:grid-cols-3 sm:w-[520px]">
        <TabsTrigger value="products" className="flex-1 w-full">Products</TabsTrigger>
        <TabsTrigger value="orders" className="flex-1 w-full">Paid Orders</TabsTrigger>
        <TabsTrigger value="shipments" className="flex-1 w-full">Shipments</TabsTrigger>
      </TabsList>

      {/* PRODUCTS TAB */}
      <TabsContent value="products" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
            <CardDescription>
              Inventory management (Coming Soon)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-9 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="p-8 text-center border border-dashed rounded-lg text-muted-foreground text-sm bg-muted/20">
              Products CRUD intentionally not implemented.
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* PAID ORDERS TAB */}
      <TabsContent value="orders" className="space-y-4">
        <Card>
          <CardHeader className="px-4 py-4 sm:px-6 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle>Paid Orders</CardTitle>
                <CardDescription>Ready for shipment</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={loadPaidOrders}
                disabled={loadingOrders}
                className="w-full sm:w-auto"
              >
                Refresh List
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6 space-y-4">
            {loadingOrders ? (
              <div className="text-center py-8 text-muted-foreground animate-pulse">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                No paid orders found.
              </div>
            ) : (
              <div className="space-y-4">
                {(Array.isArray(orders) ? orders : []).map((o) => {
                  const alreadyHasShipment = Boolean(
                    o?.hasShipment || (o?.shipmentsCount ?? 0) > 0
                  );

                  return (
                    <div
                      key={o.id}
                      className="flex flex-col gap-4 p-4 rounded-lg border border-border bg-card hover:bg-muted/10 transition-colors"
                    >
                      {/* Top Row: Order ID & Status */}
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="flex flex-col">
                          <span className="font-semibold text-base break-all">
                            {o.orderNumber}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {o.date}
                          </span>
                        </div>
                        <Badge
                          variant={getOrderStatusVariant(o.status)}
                          className="capitalize shrink-0"
                        >
                          {o.status}
                        </Badge>
                      </div>

                      {/* Middle: Details */}
                      <div className="text-sm space-y-1 text-muted-foreground">
                        <div className="font-medium text-foreground truncate">
                          {o.customer}
                        </div>
                        <div className="flex gap-2">
                          <span>{o.itemsCount} items</span>
                          <span>•</span>
                          <span className="font-semibold text-foreground">
                            ₦{Number(o.total).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Bottom: Actions (Grid on mobile for touch targets) */}
                      <div className="grid grid-cols-2 sm:flex sm:justify-end gap-2 pt-2 border-t mt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto"
                          onClick={() => setViewingOrder(o)}
                        >
                          <Eye className="mr-2 h-3.5 w-3.5" />
                          View
                        </Button>

                        <Button
                          size="sm"
                          className={`w-full sm:w-auto ${alreadyHasShipment ? "opacity-50" : ""}`}
                          disabled={alreadyHasShipment}
                          onClick={() => {
                            setSelectedOrder(o);
                            setCreateShipmentOpen(true);
                          }}
                        >
                          <PackagePlus className="mr-2 h-3.5 w-3.5" />
                          {alreadyHasShipment ? "Shipped" : "Ship"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* SHIPMENTS TAB */}
      <TabsContent value="shipments" className="space-y-4">
        <Card>
          <CardHeader className="px-4 py-4 sm:px-6 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle>Shipments</CardTitle>
                <CardDescription>Tracking & Management</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={loadShipments}
                disabled={loadingShipments}
                className="w-full sm:w-auto"
              >
                Refresh List
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
            {loadingShipments ? (
              <div className="text-center py-8 text-muted-foreground animate-pulse">Loading shipments...</div>
            ) : shipments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                No shipments found.
              </div>
            ) : (
              <div className="space-y-4">
                {shipments.map((s) => (
                  <div
                    key={s.id}
                    className="flex flex-col gap-4 p-4 rounded-lg border border-border bg-card"
                  >
                    {/* Header: ID + Status */}
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="text-sm font-semibold break-all text-foreground">
                          #{String(s.id).slice(0, 8)}...
                        </div>
                        <Badge
                          variant={getShipmentStatusVariant(s.status)}
                          className="capitalize shrink-0"
                        >
                          {s.status.replaceAll("_", " ")}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground flex flex-wrap gap-x-2 gap-y-1">
                        <span>Order: {String(s.order_id).slice(0, 8)}...</span>
                        <span className="hidden xs:inline">•</span>
                        <span className="font-medium text-foreground">{s.carrier_code}</span>
                      </div>
                    </div>

                    {/* Tracking Info */}
                    <div className="bg-muted/30 p-2 rounded text-sm border flex flex-col gap-1">
                      <span className="text-xs uppercase text-muted-foreground font-semibold">Tracking Number</span>
                      <span className="font-mono break-all select-all">
                        {s.tracking_number || "—"}
                      </span>
                    </div>

                    {/* Actions: Stacked on mobile for easy access */}
                    <div className="flex flex-col sm:flex-row sm:justify-end gap-2 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 sm:flex-none"
                        onClick={() => {
                          setDetailsShipment(s);
                          setDetailsOpen(true);
                        }}
                      >
                        <Eye className="mr-2 h-3.5 w-3.5" />
                        View
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 sm:flex-none"
                        onClick={() => {
                          setSelectedShipment(s);
                          setTrackingOpen(true);
                        }}
                      >
                        <Plus className="mr-2 h-3.5 w-3.5" />
                        Tracking
                      </Button>

                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1 sm:flex-none"
                        onClick={() => {
                          setSelectedShipment(s);
                          setEventOpen(true);
                        }}
                      >
                        <Truck className="mr-2 h-3.5 w-3.5" />
                        Update
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fallback Quick Action if needed */}
        {selectedShipment && shipments.length === 0 && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Selected Shipment</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" className="w-full" onClick={() => setTrackingOpen(true)}>
                Set Tracking
              </Button>
              <Button variant="secondary" className="w-full" onClick={() => setEventOpen(true)}>
                Add Event
              </Button>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>

    {/* MODALS */}
    <CreateShipmentModal
      open={createShipmentOpen}
      onOpenChange={(v) => {
        setCreateShipmentOpen(v);
        if (!v) setSelectedOrder(null);
      }}
      order={selectedOrder}
      onSubmit={handleCreateShipment}
      submitting={creatingShipment}
    />

    <SetTrackingModal
      open={trackingOpen}
      onOpenChange={setTrackingOpen}
      shipment={selectedShipment}
      onSubmit={handleSetTracking}
      submitting={settingTracking}
    />

    <AddTrackingEventModal
      open={eventOpen}
      onOpenChange={setEventOpen}
      shipment={selectedShipment}
      onSubmit={handleAddEvent}
      submitting={addingEvent}
    />

    <OrderDetailsModal
      open={!!viewingOrder}
      onOpenChange={(open) => !open && setViewingOrder(null)}
      order={viewingOrder}
    />

    <ShipmentDetailsModal
      open={detailsOpen}
      onOpenChange={setDetailsOpen}
      shipment={detailsShipment}
      onClickSetTracking={() => {
        if (!detailsShipment) return;
        setSelectedShipment(detailsShipment);
        setTrackingOpen(true);
      }}
      onClickAddEvent={() => {
        if (!detailsShipment) return;
        setSelectedShipment(detailsShipment);
        setEventOpen(true);
      }}
    />
  </div>
);
}

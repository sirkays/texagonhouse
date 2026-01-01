//texagon_academy\texagonui\app\admin\store\page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
import { useToast } from "@/hooks/use-toast";
import { Eye, PackagePlus, Plus, Search, Truck } from "lucide-react";

// Modals (below)
import { CreateShipmentModal } from "@/components/admin/modals/create-shipment-modal";
import { SetTrackingModal } from "@/components/admin/modals/set-tracking-modal";
import { AddTrackingEventModal } from "@/components/admin/modals/add-tracking-event-modal";
import { OrderDetailsModal } from "@/components/admin/modals/order-details-modal";

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
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"products" | "orders" | "shipments">(
    "orders"
  );

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
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);

  const [viewingOrder, setViewingOrder] = useState<any>(null);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        String(p.title || "").toLowerCase().includes(q) ||
        String(p.category || "").toLowerCase().includes(q) ||
        String(p.sku || "").toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  async function loadPaidOrders() {
    setLoadingOrders(true);
    try {
      const res = await fetch("/api/store/orders?status=paid", { cache: "no-store" });
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
          orderNumber: `ORD-${String(o.created_at || "").slice(0, 10)}-${idx + 1}`,
          customer: customerFullName,
          customerObj: o.customer || null, // ✅
          shipping_address: o.shipping_address || null, // ✅
          billing_address: o.billing_address || null, // ✅
          itemsCount: itemsArr.reduce((sum: number, it: any) => sum + Number(it.qty || 0), 0),
          total: Number.isFinite(totalNum) ? totalNum : 0,
          status: String(o.status || ""),
          date: String(o.created_at || "").slice(0, 10),
          items: itemsArr.map((it: any) => ({
            id: String(it.id || ""),        // ✅ now should exist
            title: String(it.title || ""),
            sku: String(it.sku || ""),
            quantity: Number(it.qty || 0),
          })),
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
      // OPTIONAL:
      // If you have a list endpoint for shipments, hook it here.
      // If not, you can omit this tab until you add a GET list endpoint.
      const res = await fetch("/api/store/shipments", { cache: "no-store" });
      if (res.status === 404) {
        setShipments([]);
        return;
      }
      const raw = await res.text();
      if (!res.ok) throw new Error(raw || "Failed to load shipments");
      setShipments(JSON.parse(raw) as Shipment[]);
    } catch {
      // keep quiet; shipments list might not exist yet
      setShipments([]);
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
    items: { order_item_id: string; quantity: number }[];
  }) {
    try {
      const res = await fetch(`/api/store/orders/${payload.orderId}/shipments/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carrier_code: payload.carrier_code,
          method_id: payload.method_id,
          to: payload.to,
          items: payload.items,
        }),
      });

      const raw = await res.text();
      if (!res.ok) throw new Error(raw || "Failed to create shipment");

      const shipment = JSON.parse(raw) as Shipment;
      toast({ title: "Shipment", description: "Shipment created successfully" });

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
    try {
      const res = await fetch(`/api/store/shipments/${payload.shipmentId}/set-tracking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tracking_number: payload.tracking_number,
          tracking_url: payload.tracking_url,
          label_url: payload.label_url,
          label_cost: payload.label_cost,
          currency: payload.currency,
        }),
      });

      const raw = await res.text();
      if (!res.ok) throw new Error(raw || "Failed to set tracking");

      const updated = JSON.parse(raw) as Shipment;
      toast({ title: "Tracking", description: "Tracking updated" });

      setTrackingOpen(false);
      setSelectedShipment(updated);

      setShipments((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    } catch (e: any) {
      toast({
        title: "Tracking",
        description: e?.message || "Failed to set tracking",
        variant: "destructive",
      });
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
    try {
      const res = await fetch(`/api/store/shipments/${payload.shipmentId}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      });

      const raw = await res.text();
      if (!res.ok) throw new Error(raw || "Failed to add event");

      toast({ title: "Event", description: "Tracking event added" });
      setEventOpen(false);

      // If your backend advances shipment status from events, you may want to refresh shipment list
      if (activeTab === "shipments") loadShipments();
    } catch (e: any) {
      toast({
        title: "Event",
        description: e?.message || "Failed to add tracking event",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Store
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Products (soon), Paid Orders → Shipments, Tracking Events
          </p>
        </div>

        {/* quick actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="bg-transparent"
            onClick={() => router.push("/admin/store/checkout")}
          >
            <Truck className="mr-2 h-4 w-4" />
            Checkout
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
        <TabsList className="grid grid-cols-3 w-full sm:w-[520px]">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Paid Orders</TabsTrigger>
          <TabsTrigger value="shipments">Shipments</TabsTrigger>
        </TabsList>

        {/* PRODUCTS (placeholder only) */}
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
              <CardDescription>
                CRUD will be added here later (tab only for now).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="text-sm text-muted-foreground">
                Products UI/CRUD intentionally not implemented now.
              </div>

              {/* If you still want your product grid here, keep it,
                  but remove local dummy state and replace with API later. */}
              {filteredProducts.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No products loaded.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* PAID ORDERS */}
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Paid Orders</CardTitle>
              <CardDescription>
                Create shipment + items for any paid order (staff-only).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="bg-transparent"
                  onClick={loadPaidOrders}
                  disabled={loadingOrders}
                >
                  Refresh
                </Button>
              </div>

              {loadingOrders ? (
                <div className="text-sm text-muted-foreground">Loading…</div>
              ) : orders.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No paid orders found.
                </div>
              ) : (
                <div className="space-y-3">
                  {(Array.isArray(orders) ? orders : []).map((o) => (
                    <div
                      key={o.id}
                      className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 rounded-lg border border-border"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="font-semibold">{o.orderNumber}</div>
                          <Badge variant={getOrderStatusVariant(o.status)} className="capitalize">
                            {o.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {o.customer} • {o.itemsCount} items • {o.date}
                        </div>
                        <div className="text-sm font-semibold">
                          ₦{Number(o.total).toFixed(2)}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="bg-transparent"
                          onClick={() => setViewingOrder(o)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>

                        <Button
                          onClick={() => {
                            setSelectedOrder(o);
                            setCreateShipmentOpen(true);
                          }}
                        >
                          <PackagePlus className="mr-2 h-4 w-4" />
                          Create Shipment
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SHIPMENTS */}
        <TabsContent value="shipments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Shipments</CardTitle>
              <CardDescription>
                Set tracking, and add tracking events (staff-only).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="bg-transparent"
                  onClick={loadShipments}
                  disabled={loadingShipments}
                >
                  Refresh
                </Button>
              </div>

              {loadingShipments ? (
                <div className="text-sm text-muted-foreground">Loading…</div>
              ) : shipments.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No shipments loaded yet.
                  <br />
                  If you don’t have a list endpoint, you can still manage shipments
                  from “Paid Orders” right after creation.
                </div>
              ) : (
                <div className="space-y-3">
                  {shipments.map((s) => (
                    <div
                      key={s.id}
                      className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 rounded-lg border border-border"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="font-semibold">Shipment #{String(s.id).slice(0, 8)}…</div>
                          <Badge variant={getShipmentStatusVariant(s.status)} className="capitalize">
                            {s.status.replaceAll("_", " ")}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Order: {String(s.order_id).slice(0, 8)}… • Carrier: {s.carrier_code}
                        </div>
                        <div className="text-sm">
                          Tracking:{" "}
                          <span className="font-medium">
                            {s.tracking_number || "—"}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="bg-transparent"
                          onClick={() => {
                            setSelectedShipment(s);
                            setTrackingOpen(true);
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Set Tracking
                        </Button>

                        <Button
                          variant="secondary"
                          onClick={() => {
                            setSelectedShipment(s);
                            setEventOpen(true);
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Event
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick manage after shipment create if shipments list is empty */}
          {selectedShipment && (
            <Card>
              <CardHeader>
                <CardTitle>Selected Shipment</CardTitle>
                <CardDescription>
                  Manage the shipment you recently created.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  className="bg-transparent"
                  onClick={() => setTrackingOpen(true)}
                >
                  Set Tracking
                </Button>
                <Button variant="secondary" onClick={() => setEventOpen(true)}>
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
      />

      <SetTrackingModal
        open={trackingOpen}
        onOpenChange={setTrackingOpen}
        shipment={selectedShipment}
        onSubmit={handleSetTracking}
      />

      <AddTrackingEventModal
        open={eventOpen}
        onOpenChange={setEventOpen}
        shipment={selectedShipment}
        onSubmit={handleAddEvent}
      />

      <OrderDetailsModal
          open={!!viewingOrder}
          onOpenChange={(open) => !open && setViewingOrder(null)}
          order={viewingOrder}
        />

    </div>
  );
}

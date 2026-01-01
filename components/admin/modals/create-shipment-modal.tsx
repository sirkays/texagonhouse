//texagon_academy\texagonui\components\admin\modals\create-shipment-modal.tsx
"use client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMemo, useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type OrderItem = {
  id: string;
  title: string;
  sku?: string;
  quantity: number;
};

type Order = {
  id: string;
  orderNumber: string;
  customer: string;
  itemsCount: number;
  total: number;
  status: string;
  date: string;
  items?: OrderItem[];
};

type CarrierOpt = { id: string; code: string; name: string };
type MethodOpt = { id: string; carrier_id: string; carrier_code: string; name: string; service_code?: string };


export function CreateShipmentModal({
  open,
  onOpenChange,
  order,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  order: Order | null;
  onSubmit: (payload: {
    orderId: string;
    carrier_code: string;
    method_id?: string;
    to: any;
    items: { order_item_id: string; quantity: number }[];
  }) => Promise<void> | void;
}) {
  
  const [carrier, setCarrier] = useState("other");
  const [methodId, setMethodId] = useState("");
  const [toName, setToName] = useState("");
  const [toLine1, setToLine1] = useState("");
  const [toCity, setToCity] = useState("");
  const [toState, setToState] = useState("");
  const [toPostal, setToPostal] = useState("");
  const [toCountry, setToCountry] = useState("US");
  const [toPhone, setToPhone] = useState("");
  const [toEmail, setToEmail] = useState("");

  const [carriers, setCarriers] = useState<CarrierOpt[]>([]);
  const [methods, setMethods] = useState<MethodOpt[]>([]);
  const [loadingOpts, setLoadingOpts] = useState(false);

  const [optsError, setOptsError] = useState<string | null>(null);

  const carrierDisabled = loadingOpts || carriers.length === 0;


  const filteredMethods = useMemo(() => {
    if (!carrier) return [];
    return methods.filter((m) => m.carrier_code === carrier);
  }, [methods, carrier]);

  const canSubmit = !!order?.id && !!carrier && !!toCountry;
  
  const methodDisabled =
    loadingOpts || !carrier || carrier === "other" || filteredMethods.length === 0;

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    (async () => {
      setLoadingOpts(true);
      setOptsError(null);

      try {
        const res = await fetch("/api/store/shipping/options", { cache: "no-store" });
        const raw = await res.text();

        if (!res.ok) throw new Error(raw || "Failed to load shipping options");

        const json = JSON.parse(raw);

        if (cancelled) return;

        const c = Array.isArray(json?.carriers) ? json.carriers : [];
        const m = Array.isArray(json?.methods) ? json.methods : [];

        setCarriers(c);
        setMethods(m);
      } catch (e: any) {
        if (cancelled) return;
        setCarriers([]);
        setMethods([]);
        setOptsError(e?.message || "Failed to load shipping options");
      } finally {
        if (cancelled) return;
        setLoadingOpts(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open]);


  useEffect(() => {
    if (!open) return;
    if (loadingOpts) return;

    // If carrier is default and we have carriers, pick first carrier
    if ((carrier === "other" || !carrier) && carriers.length > 0) {
      setCarrier(carriers[0].code);
      setMethodId("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, loadingOpts, carriers]);

  useEffect(() => {
    if (!open) return;
    if (loadingOpts) return;

    // If method not chosen and there are methods for selected carrier, pick first
    if (!methodId && filteredMethods.length > 0) {
      setMethodId(filteredMethods[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, loadingOpts, carrier, filteredMethods]);


  useEffect(() => {
    if (!open || !order) return;
    const ship = (order as any).shipping_address;
    const cust = (order as any).customerObj;

    setToName(ship?.full_name || cust?.full_name || "");
    setToLine1(ship?.line1 || "");
    setToCity(ship?.city || "");
    setToState(ship?.state || "");
    setToPostal(ship?.postal_code || "");
    setToCountry(ship?.country || "US");
    setToPhone(ship?.phone || cust?.phone || "");
    setToEmail(cust?.email || "");
  }, [open, order]);

  // simple per-item quantities
  const [qtyMap, setQtyMap] = useState<Record<string, number>>({});

  const items = useMemo(() => order?.items ?? [], [order]);

  function getQty(itemId: string, fallback: number) {
    const v = qtyMap[itemId];
    return Number.isFinite(v) && v > 0 ? v : fallback;
  }


    
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Shipment</DialogTitle>
          <DialogDescription>
            Create a parcel for a paid order and attach order items.
          </DialogDescription>
        </DialogHeader>

        {!order ? (
          <div className="text-sm text-muted-foreground">No order selected.</div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="font-semibold">{order.orderNumber}</div>
                <div className="text-sm text-muted-foreground">{order.customer}</div>
              </div>
              <Badge className="capitalize">{order.status}</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Carrier</label>
              <Select
                value={carrier}
                onValueChange={(v) => {
                  setCarrier(v);
                  setMethodId("");
                }}
                disabled={loadingOpts}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      loadingOpts
                        ? "Loading carriers…"
                        : optsError
                        ? "Failed to load carriers"
                        : carriers.length
                        ? "Select carrier"
                        : "No carriers available"
                    }
                  />
                </SelectTrigger>

                <SelectContent>
                  {loadingOpts ? (
                    <SelectItem value="__loading__" disabled>
                      Loading carriers…
                    </SelectItem>
                  ) : optsError ? (
                    <SelectItem value="__error__" disabled>
                      Failed to load carriers
                    </SelectItem>
                  ) : carriers.length === 0 ? (
                    <SelectItem value="__empty__" disabled>
                      No carriers available
                    </SelectItem>
                  ) : (
                    carriers.map((c) => (
                      <SelectItem key={c.id} value={c.code}>
                        {c.name} ({c.code})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>

              </div>

              <div className="space-y-2">
                <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Shipping Method</label>
                <Select value={methodId} onValueChange={setMethodId} disabled={methodDisabled}>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        loadingOpts
                          ? "Loading methods…"
                          : !carrier || carrier === "other"
                          ? "Select carrier first"
                          : filteredMethods.length
                          ? "Select method"
                          : "No methods for carrier"
                      }
                    />
                  </SelectTrigger>

                  <SelectContent>
                    {loadingOpts ? (
                      <SelectItem value="__loading__" disabled>
                        Loading methods…
                      </SelectItem>
                    ) : !carrier || carrier === "other" ? (
                      <SelectItem value="__pick_carrier__" disabled>
                        Select a carrier first
                      </SelectItem>
                    ) : filteredMethods.length === 0 ? (
                      <SelectItem value="__empty__" disabled>
                        No methods available for this carrier
                      </SelectItem>
                    ) : (
                      filteredMethods.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name}
                          {m.service_code ? ` (${m.service_code})` : ""}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>

                </div>

              </div>
            </div>

            <div className="rounded-lg border border-border p-3 space-y-3">
              <div className="font-semibold text-sm">Ship To</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input value={toName} onChange={(e) => setToName(e.target.value)} placeholder="Full name" />
                <Input value={toEmail} onChange={(e) => setToEmail(e.target.value)} placeholder="Email (optional)" />
                <Input value={toLine1} onChange={(e) => setToLine1(e.target.value)} placeholder="Address line 1" />
                <Input value={toPhone} onChange={(e) => setToPhone(e.target.value)} placeholder="Phone (optional)" />
                <Input value={toCity} onChange={(e) => setToCity(e.target.value)} placeholder="City" />
                <Input value={toState} onChange={(e) => setToState(e.target.value)} placeholder="State" />
                <Input value={toPostal} onChange={(e) => setToPostal(e.target.value)} placeholder="Postal code" />
                <Input value={toCountry} onChange={(e) => setToCountry(e.target.value)} placeholder="Country (e.g. US)" />
              </div>
            </div>

            <div className="rounded-lg border border-border p-3 space-y-3">
              <div className="font-semibold text-sm">Attach Items</div>
              {items.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No items available on this order payload.
                  <br />
                  Ensure your paid-orders endpoint includes `items: `.
                </div>
              ) : (
                <div className="space-y-2">
                  {items.map((it) => (
                    <div
                      key={it.id}
                      className="flex items-center justify-between gap-3 rounded-md border border-border p-2"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{it.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {it.sku ? `SKU: ${it.sku} • ` : ""}Ordered: {it.quantity}
                        </div>
                      </div>
                      <div className="w-24">
                        <Input
                          type="number"
                          min={1}
                          max={it.quantity}
                          value={getQty(it.id, it.quantity)}
                          onChange={(e) =>
                            setQtyMap((m) => ({
                              ...m,
                              [it.id]: Math.max(1, Number(e.target.value || 1)),
                            }))
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" className="bg-transparent" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                disabled={!canSubmit}
                onClick={() =>
                  onSubmit({
                    orderId: order.id,
                    carrier_code: carrier,
                    method_id: methodId || undefined,
                    to: {
                      name: toName,
                      line1: toLine1,
                      city: toCity,
                      state: toState,
                      postal_code: toPostal,
                      country: toCountry,
                      phone: toPhone,
                      email: toEmail,
                    },
                    items: (items || []).map((it) => ({
                      order_item_id: it.id,
                      quantity: getQty(it.id, it.quantity),
                    })),
                  })
                }
              >
                Create Shipment
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

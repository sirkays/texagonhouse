// texagonui/components/admin/modals/create-shipment-modal.tsx
"use client";

import {useEffect, useMemo, useState} from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Badge} from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {Loader2} from "lucide-react";

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
  full_name?: string;
  email?: string;
  phone?: string;
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
  // optional data your page already includes:
  shipping_address?: Address | null;
  customerObj?: Customer | null;
};

type CarrierOpt = {id: string; code: string; name: string};
type MethodOpt = {
  id: string;
  carrier_id: string;
  carrier_code: string;
  name: string;
  service_code?: string;
};

export function CreateShipmentModal({
  open,
  onOpenChange,
  order,
  onSubmit,
  submitting = false,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  order: Order | null;
  submitting?: boolean;
  onSubmit: (payload: {
    orderId: string;
    carrier_code: string;
    method_id?: string;
    to: {
      name?: string;
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      postal_code?: string;
      country?: string;
      phone?: string;
      email?: string;
    };
    items: {order_item_id: string; quantity: number}[];
  }) => Promise<void> | void;
}) {
  // Shipping option inputs
  const [carrier, setCarrier] = useState<string>("other");
  const [methodId, setMethodId] = useState<string>("");

  // Ship-to inputs
  const [toName, setToName] = useState("");
  const [toLine1, setToLine1] = useState("");
  const [toLine2, setToLine2] = useState("");
  const [toCity, setToCity] = useState("");
  const [toState, setToState] = useState("");
  const [toPostal, setToPostal] = useState("");
  const [toCountry, setToCountry] = useState("US");
  const [toPhone, setToPhone] = useState("");
  const [toEmail, setToEmail] = useState("");

  // Options from backend
  const [carriers, setCarriers] = useState<CarrierOpt[]>([]);
  const [methods, setMethods] = useState<MethodOpt[]>([]);
  const [loadingOpts, setLoadingOpts] = useState(false);
  const [optsError, setOptsError] = useState<string | null>(null);

  // per-item qty
  const [qtyMap, setQtyMap] = useState<Record<string, number>>({});

  const items = useMemo(() => order?.items ?? [], [order]);

  const filteredMethods = useMemo(() => {
    if (!carrier) return [];
    return methods.filter((m) => m.carrier_code === carrier);
  }, [methods, carrier]);

  const methodDisabled =
    loadingOpts ||
    submitting ||
    !carrier ||
    carrier === "other" ||
    filteredMethods.length === 0;

  const canSubmit =
    !!order?.id &&
    !!carrier &&
    !!toCountry.trim() &&
    items.length > 0 &&
    !submitting;

  function getQty(itemId: string, fallback: number) {
    const v = qtyMap[itemId];
    return Number.isFinite(v) && v > 0 ? v : fallback;
  }

  // Load shipping options when modal opens
  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    (async () => {
      setLoadingOpts(true);
      setOptsError(null);

      try {
        const res = await fetch("/api/store/shipping/options", {
          cache: "no-store",
        });
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

  // Default carrier/method when options load
  useEffect(() => {
    if (!open) return;
    if (loadingOpts) return;

    if ((carrier === "other" || !carrier) && carriers.length > 0) {
      setCarrier(carriers[0].code);
      setMethodId("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, loadingOpts, carriers]);

  useEffect(() => {
    if (!open) return;
    if (loadingOpts) return;

    if (!methodId && filteredMethods.length > 0) {
      setMethodId(filteredMethods[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, loadingOpts, carrier, filteredMethods]);

  // Prefill ship-to from order payload when opened
  useEffect(() => {
    if (!open || !order) return;

    const ship = (order as any).shipping_address as Address | null | undefined;
    const cust = (order as any).customerObj as Customer | null | undefined;

    setToName(ship?.full_name || cust?.full_name || "");
    setToLine1(ship?.line1 || "");
    setToLine2(ship?.line2 || "");
    setToCity(ship?.city || "");
    setToState(ship?.state || "");
    setToPostal(ship?.postal_code || "");
    setToCountry(ship?.country || "US");
    setToPhone(ship?.phone || cust?.phone || "");
    setToEmail(cust?.email || "");

    // Reset qty map defaults
    const next: Record<string, number> = {};
    for (const it of items) next[it.id] = it.quantity;
    setQtyMap(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, order]);

  // Reset state when closing
  useEffect(() => {
    if (open) return;
    setCarrier("other");
    setMethodId("");
    setQtyMap({});
    setOptsError(null);
    setLoadingOpts(false);
  }, [open]);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (submitting) return;
        onOpenChange(v);
      }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
        <DialogHeader className="text-left">
          <DialogTitle>Create Shipment</DialogTitle>
          <DialogDescription>
            Create a parcel for a paid order and attach order items.
          </DialogDescription>
        </DialogHeader>

        {!order ? (
          <div className="text-sm text-muted-foreground">
            No order selected.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Header summary */}
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="font-semibold">{order.orderNumber}</div>
                <div className="text-sm text-muted-foreground">
                  {order.customer}
                </div>
              </div>
              <Badge className="capitalize">{order.status}</Badge>
            </div>
            {/* Carrier + method */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Carrier</label>
                <Select
                  value={carrier}
                  onValueChange={(v) => {
                    setCarrier(v);
                    setMethodId("");
                  }}
                  disabled={loadingOpts || submitting}>
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

                {optsError && (
                  <div className="text-xs text-destructive">{optsError}</div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">
                  Shipping Method
                </label>
                <Select
                  value={methodId}
                  onValueChange={setMethodId}
                  disabled={methodDisabled}>
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
            {/* Ship-to address */}
            <div className="rounded-lg border border-border p-3 space-y-3">
              <div className="font-semibold text-sm">Ship To</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  disabled={submitting}
                  value={toName}
                  onChange={(e) => setToName(e.target.value)}
                  placeholder="Full name"
                />
                <Input
                  disabled={submitting}
                  value={toEmail}
                  onChange={(e) => setToEmail(e.target.value)}
                  placeholder="Email (optional)"
                />
                <Input
                  disabled={submitting}
                  value={toLine1}
                  onChange={(e) => setToLine1(e.target.value)}
                  placeholder="Address line 1"
                />
                <Input
                  disabled={submitting}
                  value={toLine2}
                  onChange={(e) => setToLine2(e.target.value)}
                  placeholder="Address line 2 (optional)"
                />
                <Input
                  disabled={submitting}
                  value={toPhone}
                  onChange={(e) => setToPhone(e.target.value)}
                  placeholder="Phone (optional)"
                />
                <Input
                  disabled={submitting}
                  value={toCity}
                  onChange={(e) => setToCity(e.target.value)}
                  placeholder="City"
                />
                <Input
                  disabled={submitting}
                  value={toState}
                  onChange={(e) => setToState(e.target.value)}
                  placeholder="State"
                />
                <Input
                  disabled={submitting}
                  value={toPostal}
                  onChange={(e) => setToPostal(e.target.value)}
                  placeholder="Postal code"
                />
                <Input
                  disabled={submitting}
                  value={toCountry}
                  onChange={(e) => setToCountry(e.target.value)}
                  placeholder="Country (e.g. US)"
                />
              </div>
            </div>
            {/* Attach items */}

            <div className="rounded-lg border border-border p-3 space-y-3">
              <div className="font-semibold text-sm">Attach Items</div>

              {items.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No items available on this order payload.
                  <br />
                  Ensure your paid-orders endpoint includes <code>items</code>.
                </div>
              ) : (
                <div className="space-y-2">
                  {items.map((it) => (
                    <div
                      key={it.id}
                      className="flex items-center justify-between gap-3 rounded-md border border-border p-2">
                      <div className="min-w-0">
                        <div className="text-sm font-medium">
                          {it.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {it.sku ? `SKU: ${it.sku} • ` : ""}Ordered:{" "}
                          {it.quantity}
                        </div>
                      </div>

                      <div className="w-24">
                        <Input
                          disabled={submitting}
                          type="number"
                          min={1}
                          max={it.quantity}
                          value={getQty(it.id, it.quantity)}
                          onChange={(e) => {
                            const n = Math.max(1, Number(e.target.value || 1));
                            setQtyMap((m) => ({
                              ...m,
                              [it.id]: Math.min(n, it.quantity),
                            }));
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                className="bg-transparent"
                disabled={submitting}
                onClick={() => onOpenChange(false)}>
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
                      name: toName || undefined,
                      line1: toLine1 || undefined,
                      line2: toLine2 || undefined,
                      city: toCity || undefined,
                      state: toState || undefined,
                      postal_code: toPostal || undefined,
                      country: toCountry || undefined,
                      phone: toPhone || undefined,
                      email: toEmail || undefined,
                    },
                    items: items.map((it) => ({
                      order_item_id: it.id,
                      quantity: getQty(it.id, it.quantity),
                    })),
                  })
                }>
                {submitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating…
                  </span>
                ) : (
                  "Create Shipment"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

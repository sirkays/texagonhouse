// texagonui/components/admin/modals/shipment-details-modal.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, ExternalLink } from "lucide-react";

type ShipmentStatus =
  | "pending"
  | "ready"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "exception"
  | "returned"
  | "cancelled";

export type Shipment = {
  id: string;
  order_id: string;
  status: ShipmentStatus;
  carrier_code: string;
  tracking_number?: string | null;
  tracking_url?: string | null;
  label_url?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
};

type TrackingEvent = {
  id: string;
  event_code: string;
  description?: string | null;
  occurred_at: string;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postal_code?: string | null;
  carrier_status?: string | null;
};

function fmt(dt?: string | null) {
  if (!dt) return "—";
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return dt;
  return d.toLocaleString();
}

function statusVariant(status: ShipmentStatus) {
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
}

function codeLabel(code: string) {
  return code.replaceAll("_", " ");
}

export function ShipmentDetailsModal({
  open,
  onOpenChange,
  shipment,
  onClickSetTracking,
  onClickAddEvent,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  shipment: Shipment | null;
  onClickSetTracking?: () => void;
  onClickAddEvent?: () => void;
}) {
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shipmentId =
    shipment && typeof shipment.id === "string" && shipment.id && shipment.id !== "undefined"
      ? shipment.id
      : null;


  const title = useMemo(() => {
    if (!shipmentId) return "Shipment Details";
    return `Shipment #${String(shipmentId).slice(0, 8)}…`;
  }, [shipmentId]);

  async function loadEvents() {
    if (!shipmentId) {
      setEvents([]);
      setError("Invalid shipment id (missing).");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/store/shipments/${encodeURIComponent(shipmentId)}/events`, {
        cache: "no-store",
      });
      const raw = await res.text();
      if (!res.ok) throw new Error(raw || "Failed to load events");

      const json = JSON.parse(raw);
      const arr = Array.isArray(json)
        ? json
        : Array.isArray(json?.results)
          ? json.results
          : [];
      setEvents(arr as TrackingEvent[]);
    } catch (e: any) {
      setEvents([]);
      setError(e?.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
  if (open) console.log("DETAILS SHIPMENT", shipment);
}, [open, shipment]);


  useEffect(() => {
    if (!open) return;
    if (!shipmentId) {
      setEvents([]);
      setError("Invalid shipment id (missing).");
      return;
    }
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, shipmentId]);


  // reset when closing
  useEffect(() => {
    if (open) return;
    setEvents([]);
    setError(null);
    setLoading(false);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            View tracking information and the shipment event timeline.
          </DialogDescription>
        </DialogHeader>

        {!shipment ? (
          <div className="text-sm text-muted-foreground">No shipment selected.</div>
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <div className="rounded-lg border border-border p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm text-muted-foreground">
                  Order: <span className="font-medium">{String(shipment.order_id).slice(0, 8)}…</span>
                </div>
                <Badge variant={statusVariant(shipment.status)} className="capitalize">
                  {codeLabel(shipment.status)}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div>
                  Carrier: <span className="font-medium">{shipment.carrier_code || "—"}</span>
                </div>
                <div>
                  Tracking:{" "}
                  <span className="font-medium">
                    {shipment.tracking_number || "—"}
                  </span>
                </div>

                <div>
                  Shipped at: <span className="font-medium">{fmt(shipment.shipped_at)}</span>
                </div>
                <div>
                  Delivered at: <span className="font-medium">{fmt(shipment.delivered_at)}</span>
                </div>
              </div>

              {/* Links */}
              <div className="flex flex-wrap gap-2 pt-2">
                {shipment.tracking_url ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-transparent"
                    onClick={() => window.open(String(shipment.tracking_url), "_blank")}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Tracking URL
                  </Button>
                ) : null}

                {shipment.label_url ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-transparent"
                    onClick={() => window.open(String(shipment.label_url), "_blank")}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Label URL
                  </Button>
                ) : null}

                <div className="flex-1" />

                <Button
                  size="sm"
                  variant="outline"
                  className="bg-transparent"
                  onClick={loadEvents}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Refreshing…
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Refresh Events
                    </span>
                  )}
                </Button>
              </div>

              {/* Quick actions */}
              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  size="sm"
                  onClick={onClickSetTracking}
                  disabled={!onClickSetTracking}
                >
                  Set Tracking
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={onClickAddEvent}
                  disabled={!onClickAddEvent}
                >
                  Add Event
                </Button>
              </div>
            </div>

            {/* Events timeline */}
            <div className="rounded-lg border border-border p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-sm">Tracking Events</div>
                <div className="text-xs text-muted-foreground">
                  {events.length ? `${events.length} event(s)` : "No events"}
                </div>
              </div>

              {error ? (
                <div className="text-sm text-destructive whitespace-pre-wrap">{error}</div>
              ) : loading ? (
                <div className="text-sm text-muted-foreground inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading events…
                </div>
              ) : events.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No tracking events yet. Add an event to start the timeline.
                </div>
              ) : (
                <div className="space-y-2">
                  {events.map((e) => {
                    const loc = [e.city, e.state, e.country].filter(Boolean).join(", ");
                    return (
                      <div
                        key={e.id}
                        className="rounded-md border border-border p-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-sm font-medium capitalize">
                              {codeLabel(e.event_code)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {fmt(e.occurred_at)}
                              {loc ? ` • ${loc}` : ""}
                              {e.postal_code ? ` • ${e.postal_code}` : ""}
                            </div>
                          </div>

                          {e.carrier_status ? (
                            <Badge variant="outline" className="text-xs">
                              {e.carrier_status}
                            </Badge>
                          ) : null}
                        </div>

                        {e.description ? (
                          <div className="text-sm mt-2 whitespace-pre-wrap">
                            {e.description}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Close */}
            <div className="flex justify-end">
              <Button variant="outline" className="bg-transparent" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

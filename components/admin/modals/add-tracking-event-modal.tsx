// texagonui/components/admin/modals/add-tracking-event-modal.tsx
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
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

type Shipment = {
  id: string;
};

function toLocalInputValue(d: Date) {
  // "YYYY-MM-DDTHH:mm" format for <input type="datetime-local" />
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export function AddTrackingEventModal({
  open,
  onOpenChange,
  shipment,
  onSubmit,
  submitting = false,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  shipment: Shipment | null;
  submitting?: boolean;
  onSubmit: (payload: {
    shipmentId: string;
    event_code: string;
    description?: string;
    occurred_at?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
    carrier_status?: string;
  }) => Promise<void> | void;
}) {
  const [eventCode, setEventCode] = useState("in_transit");
  const [description, setDescription] = useState("");
  const [occurredAt, setOccurredAt] = useState(""); // ISO8601 optional
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("NG");
  const [postalCode, setPostalCode] = useState("");
  const [carrierStatus, setCarrierStatus] = useState("");

  const canSubmit = useMemo(() => {
    return !!shipment?.id && !!eventCode.trim() && !submitting;
  }, [shipment?.id, eventCode, submitting]);

  // Reset fields when opening or shipment changes
  useEffect(() => {
    if (!open) return;
    setEventCode("in_transit");
    setDescription("");
    // default occurred_at: now (local), but let user clear it
    setOccurredAt(toLocalInputValue(new Date()));
    setCity("");
    setState("");
    setCountry("US");
    setPostalCode("");
    setCarrierStatus("");
  }, [open, shipment?.id]);

  // Convert datetime-local to ISO string if provided
  function occurredAtToIso(val: string) {
    if (!val) return undefined;
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return undefined;
    return d.toISOString();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (submitting) return;
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Tracking Event</DialogTitle>
          <DialogDescription>
            Creates a TrackingEvent and may advance shipment status automatically.
          </DialogDescription>
        </DialogHeader>

        {!shipment ? (
          <div className="text-sm text-muted-foreground">No shipment selected.</div>
        ) : (
          <div className="space-y-3">
            <Input
              disabled={submitting}
              value={eventCode}
              onChange={(e) => setEventCode(e.target.value)}
              placeholder="event_code (in_transit/out_for_delivery/delivered/exception/returned...)"
            />

            <Input
              disabled={submitting}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
            />

            <Input
              disabled={submitting}
              type="datetime-local"
              value={occurredAt}
              onChange={(e) => setOccurredAt(e.target.value)}
              placeholder="occurred_at (optional)"
            />

            <div className="grid grid-cols-2 gap-2">
              <Input
                disabled={submitting}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City (optional)"
              />
              <Input
                disabled={submitting}
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="State (optional)"
              />
              <Input
                disabled={submitting}
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="Postal (optional)"
              />
              <Input
                disabled={submitting}
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Country (NG)"
              />
            </div>

            <Input
              disabled={submitting}
              value={carrierStatus}
              onChange={(e) => setCarrierStatus(e.target.value)}
              placeholder="carrier_status (optional)"
            />

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                className="bg-transparent"
                disabled={submitting}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>

              <Button
                disabled={!canSubmit}
                onClick={() =>
                  onSubmit({
                    shipmentId: shipment.id,
                    event_code: eventCode.trim(),
                    description: description || undefined,
                    occurred_at: occurredAtToIso(occurredAt),
                    city: city || undefined,
                    state: state || undefined,
                    country: country || undefined,
                    postal_code: postalCode || undefined,
                    carrier_status: carrierStatus || undefined,
                  })
                }
              >
                {submitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Adding…
                  </span>
                ) : (
                  "Add Event"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

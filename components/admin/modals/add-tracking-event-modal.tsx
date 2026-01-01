"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Shipment = { id: string };

export function AddTrackingEventModal({
  open,
  onOpenChange,
  shipment,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  shipment: Shipment | null;
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
  const [occurredAt, setOccurredAt] = useState(""); // ISO8601 string optional
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("US");
  const [postalCode, setPostalCode] = useState("");
  const [carrierStatus, setCarrierStatus] = useState("");

  const canSubmit = !!shipment?.id && !!eventCode.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              value={eventCode}
              onChange={(e) => setEventCode(e.target.value)}
              placeholder="event_code (in_transit/out_for_delivery/delivered/exception/returned...)"
            />
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
            />
            <Input
              value={occurredAt}
              onChange={(e) => setOccurredAt(e.target.value)}
              placeholder="occurred_at ISO8601 (optional)"
            />
            <div className="grid grid-cols-2 gap-2">
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City (optional)" />
              <Input value={state} onChange={(e) => setState(e.target.value)} placeholder="State (optional)" />
              <Input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="Postal (optional)" />
              <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country (US)" />
            </div>
            <Input
              value={carrierStatus}
              onChange={(e) => setCarrierStatus(e.target.value)}
              placeholder="carrier_status (optional)"
            />

            <div className="flex justify-end gap-2">
              <Button variant="outline" className="bg-transparent" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                disabled={!canSubmit}
                onClick={() =>
                  onSubmit({
                    shipmentId: shipment.id,
                    event_code: eventCode.trim(),
                    description: description || undefined,
                    occurred_at: occurredAt || undefined,
                    city: city || undefined,
                    state: state || undefined,
                    country: country || undefined,
                    postal_code: postalCode || undefined,
                    carrier_status: carrierStatus || undefined,
                  })
                }
              >
                Add Event
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

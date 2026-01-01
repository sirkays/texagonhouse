"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Shipment = {
  id: string;
  tracking_number?: string;
  tracking_url?: string;
  label_url?: string;
};

export function SetTrackingModal({
  open,
  onOpenChange,
  shipment,
  onSubmit,
  submitting=false,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  shipment: Shipment | null;
  onSubmit: (payload: {
    shipmentId: string;
    tracking_number: string;
    tracking_url?: string;
    label_url?: string;
    label_cost?: string | number;
    currency?: string;
  }) => Promise<void> | void;
  submitting: boolean;
}) {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [labelUrl, setLabelUrl] = useState("");
  const [labelCost, setLabelCost] = useState("");
  const [currency, setCurrency] = useState("USD");

  useEffect(() => {
    setTrackingNumber(shipment?.tracking_number || "");
    setTrackingUrl(shipment?.tracking_url || "");
    setLabelUrl(shipment?.label_url || "");
  }, [shipment]);
  const canSubmit = !!shipment?.id && !!trackingNumber.trim() && !submitting;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Set Tracking</DialogTitle>
          <DialogDescription>
            Attach tracking number / label to shipment (moves to in_transit).
          </DialogDescription>
        </DialogHeader>

        {!shipment ? (
          <div className="text-sm text-muted-foreground">No shipment selected.</div>
        ) : (
          <div className="space-y-3">
            <Input disabled={submitting}
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Tracking number"
            />
            <Input disabled={submitting}
              value={trackingUrl}
              onChange={(e) => setTrackingUrl(e.target.value)}
              placeholder="Tracking URL (optional)"
            />
            <Input disabled={submitting}
              value={labelUrl}
              onChange={(e) => setLabelUrl(e.target.value)}
              placeholder="Label URL (optional)"
            />
            <div className="grid grid-cols-2 gap-2">
              <Input disabled={submitting}
                value={labelCost}
                onChange={(e) => setLabelCost(e.target.value)}
                placeholder="Label cost (optional)"
              />
              <Input disabled={submitting} value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="Currency (USD)" />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" className="bg-transparent" 
              disabled={submitting}
              onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                disabled={!canSubmit}
                onClick={() =>
                  onSubmit({
                    shipmentId: shipment.id,
                    tracking_number: trackingNumber.trim(),
                    tracking_url: trackingUrl || undefined,
                    label_url: labelUrl || undefined,
                    label_cost: labelCost || undefined,
                    currency: currency || undefined,
                  })
                }
              >
                {submitting ? "Saving..." : "Save Tracking"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

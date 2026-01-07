// texagon_academy\texagonui\components\admin\modals\order-details-modal.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {Badge} from "@/components/ui/badge";
import {Separator} from "@/components/ui/separator";
import {Package, User, CreditCard, MapPin} from "lucide-react";

interface OrderDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: any;
}

export function OrderDetailsModal({
  open,
  onOpenChange,
  order,
}: OrderDetailsModalProps) {
  if (!order) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "fulfilled":
        return "default";
      case "paid":
        return "secondary";
      case "pending":
        return "outline";
      default:
        return "secondary";
    }
  };

  const email = order?.customerObj?.email || "—";
  const phone =
    order?.shipping_address?.phone || order?.customerObj?.phone || "—";
  const ship = order?.shipping_address;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-left">
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription>
            Complete information about order {order.orderNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{order.orderNumber}</h3>
              <p className="text-sm text-muted-foreground">
                Placed on {order.date}
              </p>
            </div>
            <Badge
              variant={getStatusColor(order.status)}
              className="capitalize">
              {order.status}
            </Badge>
          </div>

          <Separator />

          {/* Customer Information */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <User className="h-4 w-4" />
              Customer Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Name</p>
                <p className="font-medium">
                  {order?.customerObj?.full_name || order.customer || "—"}
                </p>
              </div>

              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">
                  {order?.customerObj?.email || order?.customer?.email || "—"}
                </p>
              </div>

              <div>
                <p className="text-muted-foreground">Phone</p>
                <p className="font-medium">
                  {order?.shipping_address?.phone ||
                    order?.customerObj?.phone ||
                    order?.customer?.phone ||
                    "—"}
                </p>
              </div>

              <div>
                <p className="text-muted-foreground">Order Date</p>
                <p className="font-medium">{order.date}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Shipping Address */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Shipping Address
            </h4>

            <div className="text-sm">
              {!ship ? (
                <p className="text-muted-foreground">—</p>
              ) : (
                <>
                  {ship.full_name ? (
                    <p className="font-medium">{ship.full_name}</p>
                  ) : null}
                  <p className="text-muted-foreground">{ship.line1}</p>
                  {ship.line2 ? (
                    <p className="text-muted-foreground">{ship.line2}</p>
                  ) : null}
                  <p className="text-muted-foreground">
                    {[ship.city, ship.state, ship.postal_code]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  <p className="text-muted-foreground">{ship.country}</p>
                </>
              )}
            </div>
          </div>

          <Separator />

          {/* Order Items */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Package className="h-4 w-4" />
              Order Items (
              {Array.isArray(order?.items) ? order.items.length : 0})
            </h4>

            <div className="space-y-2">
              {(Array.isArray(order?.items) ? order.items : []).map(
                (it: any, idx: number) => (
                  <div
                    key={it.id || idx}
                    className="flex items-center justify-between border rounded-md p-2">
                    <div className="min-w-0">
                      <div className="font-medium">{it.title}</div>
                      {it.sku ? (
                        <div className="text-xs text-muted-foreground">
                          SKU: {it.sku}
                        </div>
                      ) : null}
                    </div>
                    <div className="text-sm font-semibold">
                      x{Number(it.quantity || it.qty || 0)}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          <Separator />

          {/* Payment Summary */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payment Summary
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">
                  ₦{(order.total * 0.9).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">
                  ₦{(order.total * 0.05).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-medium">
                  ₦{(order.total * 0.05).toFixed(2)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-base">
                <span className="font-semibold">Total</span>
                <span className="font-bold">₦{order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Trash2,
  Package,
  Loader2,
  Minus,
  Plus,
  Tag,
  ShoppingBag,
  ArrowRight,
  Truck,
  Shield,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/providers/CartProvider";
import { useState, useTransition } from "react";

export function ShoppingCart() {
  const router = useRouter();
  const { toast } = useToast();
  const {
    cartItems,
    cartSummary,
    refreshCart,
    updateQuantity,
    removeFromCart,
    getTotalItems,
    isCartMutating,
  } = useCart();

  const [coupon, setCoupon] = useState("");
  const [applying, setApplying] = useState(false);
  const [isCheckoutPending, startCheckoutTransition] = useTransition();

  // --- Calculations ---
  const subtotal = Number(cartSummary?.subtotal || 0);
  const discount = Number(cartSummary?.discount_total || 0);
  const discountedSubtotal = Number(cartSummary?.grand_total || 0);

  const shipping = Number(cartSummary?.shipping_total || 0);
  const tax = Number(cartSummary?.tax_total || 0);
  const total = Number(cartSummary?.payable_total || 0);

  // --- Handlers ---
  const handleQuantityChange = (id: string, delta: number) => {
    const item = cartItems.find((i) => i.id === id);
    if (!item) return;
    const newQty = item.quantity + delta;
    if (newQty < 1) return;
    updateQuantity(id, newQty);
  };

  const formatCurrency = (amount: any) =>
    amount.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const handleRemove = (id: string) => {
    removeFromCart(id);
    toast({ title: "Removed", description: "Item removed from cart" });
  };

  const handleApplyCoupon = async () => {
    setApplying(true);
    try {
      const res = await fetch("/api/store/cart/apply-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: coupon }),
      });
      if (res.ok) {
        toast({ title: "Success", description: "Coupon applied!" });
        setCoupon("");
        await refreshCart();
      } else {
        toast({ variant: "destructive", title: "Invalid coupon" });
      }
    } catch {
      toast({ variant: "destructive", title: "Failed to apply coupon" });
    } finally {
      setApplying(false);
    }
  };

  /* ─── Empty State ─── */
  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400/20 to-amber-400/10 blur-2xl" />
          <div className="relative h-24 w-24 rounded-2xl bg-muted/50 flex items-center justify-center">
            <Package className="h-12 w-12 text-muted-foreground" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Your cart is empty</h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            Discover premium gadgets and accessories in our store.
          </p>
        </div>
        <Button
          onClick={() => router.push("/store?tab=catalog")}
          className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500
            text-white font-medium px-6 border-0
            shadow-md shadow-orange-500/15 hover:shadow-lg hover:shadow-orange-500/25
            transition-all duration-200"
        >
          <ShoppingBag className="mr-2 h-4 w-4" />
          Browse Store
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-2">
      {/* ─── LEFT: Cart items ─── */}
      <div className="lg:col-span-2 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-foreground">Shopping Cart</h1>
          <Badge
            variant="secondary"
            className="text-sm px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 border-0 font-semibold"
          >
            {getTotalItems()} {getTotalItems() === 1 ? "item" : "items"}
          </Badge>
        </div>

        {/* Items */}
        <div className="space-y-3">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="group flex gap-4 p-4 rounded-2xl border border-border/50 bg-card
                hover:border-orange-200/50 hover:shadow-md hover:shadow-orange-500/5
                transition-all duration-300"
            >
              {/* Image */}
              <div className="flex-shrink-0">
                <div className="relative overflow-hidden rounded-xl bg-muted/30">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.title}
                    className="w-24 h-24 sm:w-28 sm:h-28 object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.src = "/placeholder.svg?height=96&width=96";
                    }}
                  />
                </div>
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-foreground truncate">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    ₦{formatCurrency(parseFloat(item.price || "0"))} each
                  </p>
                </div>

                {/* Quantity controls */}
                <div className="flex items-center gap-1 mt-3">
                  <button
                    className="h-8 w-8 rounded-lg border border-border bg-card
                      flex items-center justify-center
                      hover:bg-muted hover:border-orange-200
                      disabled:opacity-40 disabled:cursor-not-allowed
                      transition-colors duration-200"
                    onClick={() => handleQuantityChange(item.id, -1)}
                    disabled={item.quantity <= 1 || isCartMutating}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>

                  <span className="w-10 text-center font-semibold text-sm">
                    {item.quantity}
                  </span>

                  <button
                    className="h-8 w-8 rounded-lg border border-border bg-card
                      flex items-center justify-center
                      hover:bg-muted hover:border-orange-200
                      disabled:opacity-40 disabled:cursor-not-allowed
                      transition-colors duration-200"
                    onClick={() => handleQuantityChange(item.id, +1)}
                    disabled={isCartMutating}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Price & Remove */}
              <div className="flex flex-col items-end justify-between">
                <p className="font-bold text-lg text-foreground">
                  ₦{formatCurrency(parseFloat(item.price || "0") * item.quantity)}
                </p>

                <button
                  className="h-8 w-8 rounded-lg flex items-center justify-center
                    text-muted-foreground hover:text-red-500 hover:bg-red-500/10
                    disabled:opacity-40 disabled:cursor-not-allowed
                    transition-colors duration-200"
                  onClick={() => handleRemove(item.id)}
                  disabled={isCartMutating}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── RIGHT: Summary sidebar ─── */}
      <div className="space-y-4">
        {/* Coupon */}
        <div className="rounded-2xl border border-border/50 bg-card p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Tag className="h-4 w-4 text-orange-500" />
            Promo Code
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Enter code"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              className="flex-1 h-10 rounded-xl border-border bg-muted/30
                focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
              disabled={applying || isCartMutating}
            />
            <Button
              onClick={handleApplyCoupon}
              disabled={!coupon.trim() || applying || isCartMutating}
              className="h-10 rounded-xl px-4 bg-foreground text-background
                hover:bg-foreground/90 transition-colors border-0"
            >
              {applying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Apply"
              )}
            </Button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="rounded-2xl border border-border/50 bg-card p-5 space-y-4">
          <h3 className="text-lg font-bold text-foreground">Order Summary</h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">₦{formatCurrency(subtotal)}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>
                  Discount {cartSummary?.coupon ? `(${cartSummary.coupon})` : ""}
                </span>
                <span className="font-medium">-₦{formatCurrency(discount)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5" />
                Shipping
              </span>
              <span className="font-medium">₦{formatCurrency(shipping)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax (8%)</span>
              <span className="font-medium">₦{formatCurrency(tax)}</span>
            </div>
          </div>

          <Separator className="my-1" />

          <div className="flex justify-between items-baseline">
            <span className="text-base font-bold text-foreground">Total</span>
            <span className="text-xl font-bold text-foreground">
              ₦{formatCurrency(total)}
            </span>
          </div>

          {/* Checkout Button */}
          <Button
            size="lg"
            className="w-full h-12 rounded-xl text-base font-semibold
              bg-gradient-to-r from-orange-500 to-amber-500
              text-white border-0 shadow-md shadow-orange-500/15
              hover:shadow-lg hover:shadow-orange-500/25
              active:scale-[0.98] transition-all duration-200"
            disabled={isCartMutating || applying || isCheckoutPending}
            onClick={() => {
              startCheckoutTransition(() => {
                router.push("/store/checkout");
              });
            }}
          >
            {isCheckoutPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Redirecting…
              </>
            ) : isCartMutating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Updating cart…
              </>
            ) : (
              <>
                Proceed to Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-4 pt-2 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Secure Checkout
            </span>
            <span className="flex items-center gap-1">
              <Truck className="h-3 w-3" />
              Fast Delivery
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

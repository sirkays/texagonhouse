"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, Package, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/providers/CartProvider";
import { useState, useTransition } from "react";



export function ShoppingCart() {
  const router = useRouter();
  const { toast } = useToast();
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    getTotalItems,
    isCartMutating, // ✅ NEW
  } = useCart();

  const [coupon, setCoupon] = useState("");
  const [applying, setApplying] = useState(false);
  const [isCheckoutPending, startCheckoutTransition] = useTransition();

  // --- Calculations ---
  const subtotal = cartItems.reduce(
    (sum, item) => sum + parseFloat(item.price || "0") * item.quantity,
    0
  );
  const shipping = cartItems.some((i) => i.type === "physical") ? 9.99 : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

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
      } else {
        toast({ variant: "destructive", title: "Invalid coupon" });
      }
    } catch {
      toast({ variant: "destructive", title: "Failed to apply coupon" });
    } finally {
      setApplying(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
        <Package className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-semibold">Your cart is empty</h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        <Badge variant="secondary" className="text-lg px-3 py-1">
          {getTotalItems()} {getTotalItems() === 1 ? "item" : "items"}
        </Badge>
      </div>

      {/* Cart Items */}
      <div className="space-y-4">
        {cartItems.map((item) => (
          <div
            key={item.id}
            className="flex gap-4 p-4 border rounded-lg bg-card hover:shadow-sm transition-shadow"
          >
            {/* Image */}
            <div className="flex-shrink-0">
              <img
                src={item.image || "/placeholder.svg"}
                alt={item.title}
                className="w-24 h-24 object-cover rounded-md bg-gray-100"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.src = "/placeholder.svg?height=96&width=96";
                }}
              />
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0 space-y-2">
              <h3 className="font-medium text-lg truncate">{item.title}</h3>

              <p className="text-sm text-muted-foreground">
                ₦{formatCurrency(parseFloat(item.price || "0"))} each
              </p>

              {/* Quantity */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleQuantityChange(item.id, -1)}
                  disabled={item.quantity <= 1 || isCartMutating}
                >
                  -
                </Button>

                <span className="w-10 text-center font-medium">
                  {item.quantity}
                </span>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleQuantityChange(item.id, +1)}
                  disabled={isCartMutating}
                >
                  +
                </Button>
              </div>
            </div>

            {/* Price & Remove */}
            <div className="flex flex-col items-end justify-between">
              <p className="font-semibold text-lg">
                ₦{formatCurrency(parseFloat(item.price || "0") * item.quantity)}
              </p>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                onClick={() => handleRemove(item.id)}
                disabled={isCartMutating}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

          </div>
        ))}
      </div>

      <Separator />

      {/* Coupon */}
      <div className="flex gap-2">
        <Input
          placeholder="Enter coupon code"
          value={coupon}
          onChange={(e) => setCoupon(e.target.value)}
          className="flex-1"
          disabled={applying || isCartMutating}
        />
        <Button
          onClick={handleApplyCoupon}
          disabled={!coupon.trim() || applying || isCartMutating}
          className="min-w-24"
        >
          {applying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Applying
            </>
          ) : (
            "Apply"
          )}
        </Button>
      </div>

      {/* Order Summary */}
      <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
        <div className="flex justify-between text-lg">
          <span>Subtotal</span>
          <span className="font-medium">₦{formatCurrency(subtotal)}</span>
        </div>

        <div className="flex justify-between">
          <span>Shipping</span>
          <span>₦{formatCurrency(shipping)}</span>
        </div>

        <div className="flex justify-between">
          <span>Tax (8%)</span>
          <span>₦{formatCurrency(tax)}</span>
        </div>

        <Separator className="my-3" />

        <div className="flex justify-between text-xl font-bold">
          <span>Total</span>
          <span>₦{formatCurrency(total)}</span>
        </div>
      </div>


      {/* ✅ Checkout Button with Loading */}
      <Button
        size="lg"
        className="w-full text-lg h-12"
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
          "Proceed to Checkout"
        )}
      </Button>

    </div>
  );
}

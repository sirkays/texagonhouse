// app/store/checkout/page.tsx
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trash2, ShoppingBag, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/providers/CartProvider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CheckoutPage() {
  const router = useRouter();
  const { toast } = useToast();

  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    buyNowProduct,
    setBuyNowProduct,
    isCartMutating, // ✅ from CartProvider
  } = useCart();

  const displayItems = buyNowProduct ? [buyNowProduct] : cartItems;

  // ✅ Contact info (phone only) + address + dummy card fields
  const [formData, setFormData] = useState({
    phoneNumber: "",
    address: "",
    city: "",
    state: "",
    area: "",
    zipCode: "",
    country: "US",
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });

  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedBillingAddress, setSelectedBillingAddress] = useState<
    string | null
  >(null);
  const [selectedShippingAddress, setSelectedShippingAddress] = useState<
    string | null
  >(null);

  // ✅ Place Order loading
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // ✅ Disable cart editing while mutating or placing order
  const uiLocked = isCartMutating || isPlacingOrder;

  useEffect(() => {
    const fetchAddresses = async () => {
      const res = await fetch("/api/store/addresses");
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.results || []);
      } else if (res.status === 401) {
        router.push("/login");
      }
    };
    fetchAddresses();
  }, [router]);

  // ✅ Example options (replace with your real list)
  const STATES = useMemo(() => ["Lagos", "Abuja (FCT)", "Rivers", "Kano"], []);

  const AREAS_BY_STATE = useMemo(
    () => ({
      Lagos: ["Ikeja", "Lekki", "Yaba", "Surulere"],
      "Abuja (FCT)": ["Garki", "Wuse", "Maitama", "Gwarinpa"],
      Rivers: ["Port Harcourt", "Obio-Akpor"],
      Kano: ["Nassarawa", "Fagge"],
    }),
    []
  );

  const areasForSelectedState = (AREAS_BY_STATE as any)[formData.state] ?? [];

  // Totals
  const subtotal = displayItems.reduce(
    (sum: number, item: any) => sum + Number(item.price) * Number(item.quantity),
    0
  );
  const shipping = displayItems.some((item: any) => item.type === "physical")
    ? 9.99
    : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleRemoveItem = (id: any) => {
    if (uiLocked) return;

    if (buyNowProduct && String(buyNowProduct.id) === String(id)) {
      setBuyNowProduct(null);
    } else {
      removeFromCart(String(id) as any);
    }
    toast({ title: "Item Removed", description: "Item removed from cart" });
  };

  const handleQuantityChange = (id: any, newQuantity: number) => {
    if (uiLocked) return;
    if (newQuantity < 1) return;

    if (buyNowProduct && String(buyNowProduct.id) === String(id)) {
      setBuyNowProduct({ ...buyNowProduct, quantity: newQuantity });
    } else {
      updateQuantity(String(id) as any, newQuantity);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ prevent double submit / submitting while cart mutation is running
    if (isPlacingOrder || isCartMutating) return;

    setIsPlacingOrder(true);
    try {
      let billingId = selectedBillingAddress;
      let shippingId = selectedShippingAddress;

      // Create billing address if not selected
      if (!billingId) {
        const res = await fetch("/api/store/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            full_name: "Customer",
            line1: formData.address,
            city: formData.city,
            state: formData.state,
            postal_code: formData.zipCode,
            country: formData.country,

            // optional fields
            phone_number: formData.phoneNumber,
            area: formData.area,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          billingId = String(data.id);
        } else {
          toast({ variant: "destructive", title: "Error creating address" });
          return;
        }
      }

      if (!shippingId) shippingId = billingId;

      const body = {
        billing_address_id: billingId,
        shipping_address_id: shippingId,
      };

      const res = await fetch("/api/store/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast({
          title: "Order Placed Successfully!",
          description: `Your order of $${total.toFixed(2)} has been confirmed.`,
        });
        setBuyNowProduct(null);
        setTimeout(() => router.push("/store"), 2000);
      } else {
        toast({ variant: "destructive", title: "Failed to create order" });
      }
    } catch {
      toast({ variant: "destructive", title: "Something went wrong" });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto py-5">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Checkout
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Complete your purchase
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {/* Contact info */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                We'll use this to contact you about delivery
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="e.g. 08012345678"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, phoneNumber: e.target.value })
                    }
                    required
                    disabled={uiLocked}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping information */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
              <CardDescription>
                Where should we deliver your order?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Select
                  value={selectedShippingAddress || ""}
                  onValueChange={(val) =>
                    setSelectedShippingAddress(val === "new" ? null : val)
                  }
                  disabled={uiLocked}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select shipping address" />
                  </SelectTrigger>
                  <SelectContent>
                    {addresses.map((addr) => (
                      <SelectItem key={addr.id} value={String(addr.id)}>
                        {addr.full_name} - {addr.line1}, {addr.city}
                      </SelectItem>
                    ))}
                    <SelectItem value="new">Create new address</SelectItem>
                  </SelectContent>
                </Select>

                {!selectedShippingAddress && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="address">Street Address</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        required
                        disabled={uiLocked}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) =>
                            setFormData({ ...formData, city: e.target.value })
                          }
                          required
                          disabled={uiLocked}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>State</Label>
                        <Select
                          value={formData.state}
                          onValueChange={(val) =>
                            setFormData({
                              ...formData,
                              state: val,
                              area: "",
                            })
                          }
                          disabled={uiLocked}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            {STATES.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Area</Label>
                        <Select
                          value={formData.area}
                          onValueChange={(val) =>
                            setFormData({ ...formData, area: val })
                          }
                          disabled={uiLocked || !formData.state}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                formData.state
                                  ? "Select area"
                                  : "Select state first"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {areasForSelectedState.map((a: string) => (
                              <SelectItem key={a} value={a}>
                                {a}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="zipCode">Zip / Postal Code</Label>
                        <Input
                          id="zipCode"
                          value={formData.zipCode}
                          onChange={(e) =>
                            setFormData({ ...formData, zipCode: e.target.value })
                          }
                          required
                          disabled={uiLocked}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {displayItems.map((item: any) => {
                  const key = item.cartItemId || item.id;
                  const id = item.cartItemId || item.id;

                  return (
                    <div key={key} className="flex gap-3 p-3 border rounded-lg">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-2">
                          {item.name}
                        </h4>

                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6 bg-transparent"
                              disabled={uiLocked}
                              onClick={() =>
                                handleQuantityChange(id, item.quantity - 1)
                              }
                            >
                              -
                            </Button>

                            <span className="text-sm w-8 text-center">
                              {item.quantity}
                            </span>

                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6 bg-transparent"
                              disabled={uiLocked}
                              onClick={() =>
                                handleQuantityChange(id, item.quantity + 1)
                              }
                            >
                              +
                            </Button>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 ml-auto"
                            disabled={uiLocked}
                            onClick={() => handleRemoveItem(id)}
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>

                        <p className="text-sm font-semibold mt-1">
                          ${(Number(item.price) * Number(item.quantity)).toFixed(
                            2
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? (
                      <Badge variant="secondary" className="text-xs">
                        FREE
                      </Badge>
                    ) : (
                      `$${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (8%)</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* ✅ Loading on button when placing order OR cart is updating */}
              <Button
                className="w-full"
                size="lg"
                onClick={handleSubmit}
                disabled={uiLocked}
              >
                {uiLocked ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isPlacingOrder ? "Placing Order..." : "Updating Cart..."}
                  </>
                ) : (
                  <>Place Order - ${total.toFixed(2)}</>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                By placing your order, you agree to our terms and conditions
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

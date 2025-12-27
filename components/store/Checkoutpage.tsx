// components/store/checkoutpage.tsx
"use client";

import type React from "react";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Separator} from "@/components/ui/separator";
import {Badge} from "@/components/ui/badge";
import {ArrowLeft, CreditCard, Trash2, ShoppingBag} from "lucide-react";
import {useToast} from "@/hooks/use-toast";
import {useCart} from "@/providers/CartProvider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CheckoutPage() {
  const router = useRouter();
  const {toast} = useToast();
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    buyNowProduct,
    setBuyNowProduct,
  } = useCart();
  const displayItems = buyNowProduct ? [buyNowProduct] : cartItems;

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "US",
    phone: "",
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

  useEffect(() => {
    const fetchAddresses = async () => {
      const res = await fetch("/api/store/addresses");
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.results);
      } else if (res.status === 401) {
        router.push("/login");
      }
    };
    fetchAddresses();
  }, [router]);

  const subtotal = displayItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = displayItems.some((item) => item.type === "physical")
    ? 9.99
    : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleRemoveItem = (id: number) => {
    if (buyNowProduct && buyNowProduct.id === id) {
      setBuyNowProduct(null);
    } else {
      removeFromCart(id);
    }
    toast({title: "Item Removed", description: "Item removed from cart"});
  };

  const handleQuantityChange = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    if (buyNowProduct && buyNowProduct.id === id) {
      setBuyNowProduct({...buyNowProduct, quantity: newQuantity});
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let billingId = selectedBillingAddress;
    let shippingId = selectedShippingAddress;
    if (!billingId) {
      const res = await fetch("/api/store/addresses", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          full_name: `${formData.firstName} ${formData.lastName}`,
          line1: formData.line1,
          line2: formData.line2,
          city: formData.city,
          state: formData.state,
          postal_code: formData.postal_code,
          country: formData.country,
          phone: formData.phone,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        billingId = data.id;
      } else {
        toast({variant: "destructive", title: "Error creating address"});
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
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const data = await res.json();
      toast({
        title: "Order Placed Successfully!",
        description: `Your order of $${total.toFixed(2)} has been confirmed.`,
      });
      setBuyNowProduct(null);
      setTimeout(() => router.push("/store"), 2000);
    } else {
      toast({variant: "destructive", title: "Failed to create order"});
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                We'll use this to send order confirmations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({...formData, email: e.target.value})
                    }
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

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
                  onValueChange={setSelectedShippingAddress}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select shipping address" />
                  </SelectTrigger>
                  <SelectContent>
                    {addresses.map((addr) => (
                      <SelectItem key={addr.id} value={addr.id}>
                        {addr.full_name} - {addr.line1}, {addr.city}
                      </SelectItem>
                    ))}
                    <SelectItem value="">Create new address</SelectItem>
                  </SelectContent>
                </Select>
                {selectedShippingAddress === "" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({...formData, firstName: e.target.value})
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({...formData, lastName: e.target.value})
                        }
                        required
                      />
                    </div>
                  </div>
                )}
                {selectedShippingAddress === "" && (
                  <div className="space-y-2">
                    <Label htmlFor="line1">Street Address</Label>
                    <Input
                      id="line1"
                      value={formData.line1}
                      onChange={(e) =>
                        setFormData({...formData, line1: e.target.value})
                      }
                      required
                    />
                  </div>
                )}
                {selectedShippingAddress === "" && (
                  <div className="space-y-2">
                    <Label htmlFor="line2">Apt/Suite (optional)</Label>
                    <Input
                      id="line2"
                      value={formData.line2}
                      onChange={(e) =>
                        setFormData({...formData, line2: e.target.value})
                      }
                    />
                  </div>
                )}
                {selectedShippingAddress === "" && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({...formData, city: e.target.value})
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) =>
                          setFormData({...formData, state: e.target.value})
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postal_code">ZIP Code</Label>
                      <Input
                        id="postal_code"
                        value={formData.postal_code}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            postal_code: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                )}
                {selectedShippingAddress === "" && (
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select
                      value={formData.country}
                      onValueChange={(value) =>
                        setFormData({...formData, country: value})
                      }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="CA">Canada</SelectItem>
                        <SelectItem value="UK">United Kingdom</SelectItem>
                        <SelectItem value="AU">Australia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {selectedShippingAddress === "" && (
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone (optional)</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({...formData, phone: e.target.value})
                      }
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>


        </div>

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
                {displayItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 p-3 border rounded-lg">
                    <img
                      src={item.image || "/placeholder.svg"}
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
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity - 1)
                            }>
                            -
                          </Button>
                          <span className="text-sm w-8 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 bg-transparent"
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity + 1)
                            }>
                            +
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 ml-auto"
                          onClick={() => handleRemoveItem(item.id)}>
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                      <p className="text-sm font-semibold mt-1">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
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

              <Button className="w-full" size="lg" onClick={handleSubmit}>
                Place Order - ${total.toFixed(2)}
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

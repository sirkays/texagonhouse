"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Input} from "@/components/ui/input";
import {Separator} from "@/components/ui/separator";
import {
  Plus,
  Minus,
  Trash2,
  Tag,
  CreditCard,
  Calendar,
  Shield,
  Truck,
  Gift,
  ShoppingCartIcon,
} from "lucide-react";
import {useCart} from "@/providers/CartProvider";

export function ShoppingCartComponent() {
  const router = useRouter();
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    setCartItems,
    setBuyNowProduct,
  } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discount: number;
  } | null>(null);

  const applyPromoCode = () => {
    // Simulate promo code validation
    const validCodes = {
      STUDENT20: 20,
      NEWUSER15: 15,
      SAVE10: 10,
    };

    if (validCodes[promoCode as keyof typeof validCodes]) {
      setAppliedPromo({
        code: promoCode,
        discount: validCodes[promoCode as keyof typeof validCodes],
      });
      setPromoCode("");
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const savings = cartItems.reduce(
    (sum, item) =>
      sum + ((item.originalPrice ?? item.price) - item.price) * item.quantity,
    0
  );
  const promoDiscount = appliedPromo
    ? (subtotal * appliedPromo.discount) / 100
    : 0;
  const shipping = cartItems.some((item) => item.type === "physical")
    ? 9.99
    : 0;
  const tax = (subtotal - promoDiscount) * 0.08; // 8% tax
  const total = subtotal - promoDiscount + shipping + tax;

  const bnplOptions = [
    {
      provider: "Klarna",
      logo: "/placeholder.svg?height=24&width=60",
      installments: 4,
      amount: total / 4,
      description: "4 interest-free payments",
    },
    {
      provider: "Afterpay",
      logo: "/placeholder.svg?height=24&width=60",
      installments: 4,
      amount: total / 4,
      description: "Pay in 4 fortnightly payments",
    },
    {
      provider: "Sezzle",
      logo: "/placeholder.svg?height=24&width=60",
      installments: 4,
      amount: total / 4,
      description: "Split into 4 payments",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        <p className="text-muted-foreground">
          Review your items and proceed to checkout
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCartIcon className="h-5 w-5" />
                Cart Items ({cartItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded"
                  />
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold line-clamp-2">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.instructor && `by ${item.instructor}`}
                      {item.author && `by ${item.author}`}
                      {item.brand && `by ${item.brand}`}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          item.type === "digital" ? "secondary" : "outline"
                        }>
                        {item.type === "digital" ? "Digital" : "Physical"}
                      </Badge>
                      {item.bnplAvailable && (
                        <Badge
                          variant="outline"
                          className="text-green-600 border-green-600">
                          BNPL Available
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-center sm:text-right space-y-2">
                    <div className="space-y-1">
                      <p className="font-semibold">${item.price}</p>
                      {(item.originalPrice ?? 0) > item.price && (
                        <p className="text-sm text-muted-foreground line-through">
                          ${item.originalPrice}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 sm:h-8 sm:w-8 bg-transparent"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 sm:h-8 sm:w-8 bg-transparent"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => removeFromCart(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Promo Code */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Promo Code
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                />
                <Button onClick={applyPromoCode}>Apply</Button>
              </div>
              {appliedPromo && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm text-green-700">
                    Promo code "{appliedPromo.code}" applied! You saved{" "}
                    {appliedPromo.discount}%
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>You Save</span>
                    <span>-${savings.toFixed(2)}</span>
                  </div>
                )}
                {appliedPromo && (
                  <div className="flex justify-between text-green-600">
                    <span>Promo Discount ({appliedPromo.discount}%)</span>
                    <span>-${promoDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
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
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => {
                    setBuyNowProduct(null);
                    router.push("/store/checkout");
                  }}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Proceed to Checkout
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Or choose a Buy Now, Pay Later option below
                </p>
              </div>
            </CardContent>
          </Card>

          {/* BNPL Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Buy Now, Pay Later
              </CardTitle>
              <CardDescription>
                Split your payment into installments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {bnplOptions.map((option) => (
                <div key={option.provider} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <img
                      src={option.logo || "/placeholder.svg"}
                      alt={option.provider}
                      className="h-6"
                    />
                    <Badge variant="outline">{option.description}</Badge>
                  </div>
                  <div className="text-sm space-y-1">
                    <p className="font-medium">
                      {option.installments} payments of $
                      {option.amount.toFixed(2)}
                    </p>
                    <p className="text-muted-foreground">
                      0% interest, no fees
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-2 bg-transparent"
                    size="sm">
                    Pay with {option.provider}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Security & Shipping */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span>Secure 256-bit SSL encryption</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-blue-600" />
                  <span>Shipping $9.99 for physical items</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-purple-600" />
                  <span>30-day money-back guarantee</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export {ShoppingCartComponent as ShoppingCart};

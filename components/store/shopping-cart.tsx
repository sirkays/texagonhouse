"use client";

import {useState, useEffect} from "react";
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

interface BnplPlan {
  id: string;
  provider: string;
  name: string;
  num_installments: number;
  interval_days: number;
  currency: string;
  min_amount: string;
  max_amount: string | null;
}

interface BnplPlansResponse {
  results: BnplPlan[];
}

interface BnplOption {
  id: string;
  provider: string;
  installments: number;
  amount: number;
  description: string;
}

interface BnplStartResponse {
  agreement_id: string;
  status: string;
}

export default function ShoppingCart() {
  const router = useRouter();
  const {cartItems, updateQuantity, removeFromCart, setBuyNowProduct, clearCart} =
    useCart();

  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discount: number;
  } | null>(null);

  const [plans, setPlans] = useState<BnplPlan[]>([]);

  const applyPromoCode = () => {
    const validCodes: Record<string, number> = {
      STUDENT20: 20,
      NEWUSER15: 15,
      SAVE10: 10,
    };
    const discount = validCodes[promoCode];
    if (discount) {
      setAppliedPromo({code: promoCode, discount});
      setPromoCode("");
    }
  };

  const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const savings = cartItems.reduce(
    (s, i) => s + ((i.originalPrice ?? i.price) - i.price) * i.quantity,
    0
  );
  const promoDiscount = appliedPromo
    ? (subtotal * appliedPromo.discount) / 100
    : 0;
  const shipping = cartItems.some((i) => i.type === "physical") ? 9.99 : 0;
  const tax = (subtotal - promoDiscount) * 0.08;
  const total = subtotal - promoDiscount + shipping + tax;

  useEffect(() => {
    async function fetchPlans() {
      try {
        const res = await fetch("/api/store/bnpl/plans");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data: BnplPlansResponse = await res.json();
        setPlans(data.results);
      } catch (err) {
        console.error("Failed to fetch BNPL plans:", err);
      }
    }
    fetchPlans();
  }, []);

  const bnplOptions: BnplOption[] = plans
    .filter((plan) => {
      const min = parseFloat(plan.min_amount);
      const max = plan.max_amount ? parseFloat(plan.max_amount) : Infinity;
      return total >= min && total <= max;
    })
    .map((plan) => ({
      id: plan.id,
      provider: plan.provider,
      installments: plan.num_installments,
      amount: total / plan.num_installments,
      description:
        plan.name ||
        `Pay in ${plan.num_installments} payments every ${plan.interval_days} days`,
    }));

  const handleBnplStart = async (planId: string, provider: string) => {
    try {
      // Create order
      const orderRes = await fetch("/api/store/orders", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          items: cartItems.map(item => ({
            title: item.name,
            qty: item.quantity,
            price: item.price.toString(),
          })),
          promo: appliedPromo,
          subtotal: subtotal.toString(),
          savings: savings.toString(),
          promoDiscount: promoDiscount.toString(),
          shipping: shipping.toString(),
          tax: tax.toString(),
          total: total.toString(),
        }),
      });

      if (!orderRes.ok) {
        throw new Error(`Failed to create order: ${orderRes.status}`);
      }

      const orderData = await orderRes.json();
      const orderId = orderData.id;

      // Start BNPL
      const bnplBody = {plan_id: planId};
      const bnplRes = await fetch(`/api/store/bnpl/${orderId}/start`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(bnplBody),
      });

      if (!bnplRes.ok) {
        throw new Error(`Failed to start BNPL: ${bnplRes.status}`);
      }

      const bnplData: BnplStartResponse = await bnplRes.json();
      const agreementId = bnplData.agreement_id;

      // Fetch agreement details
      const agreementRes = await fetch(
        `/api/store/bnpl/agreements/${agreementId}`
      );

      if (!agreementRes.ok) {
        throw new Error(`Failed to fetch agreement: ${agreementRes.status}`);
      }

      const agreementData = await agreementRes.json();
      console.log("BNPL Agreement:", agreementData);

      clearCart();

      // Redirect or handle success (assuming a view page exists)
      router.push(`/store/bnpl/${agreementId}`);
    } catch (err) {
      console.error("Error setting up BNPL:", err);
      alert(
        "An error occurred while setting up BNPL with " +
          provider +
          ". Please try again."
      );
    }
  };

  return (
    <div className="space-y-6 mt-4 mb-8 px-4 sm:px-6 lg:px-8">
      {/* HEADER */}
      <div className="text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold">Shopping Cart</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Review your items and proceed to checkout
        </p>
      </div>

      {/* MAIN GRID */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* ==== CART ITEMS ==== */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <ShoppingCartIcon className="h-5 w-5" />
                Cart Items ({cartItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-6">
                  Your cart is empty.
                </p>
              )}
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row gap-4 p-3 sm:p-4 border rounded-lg">
                  {/* IMAGE */}
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    className="w-24 h-24 sm:w-20 sm:h-20 object-cover rounded-md mx-auto sm:mx-0"
                  />

                  {/* DETAILS */}
                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <h3 className="font-semibold text-sm sm:text-base line-clamp-2">
                      {item.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {item.instructor && `by ${item.instructor}`}
                      {item.author && `by ${item.author}`}
                      {item.brand && `by ${item.brand}`}
                    </p>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2">
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

                  {/* PRICE + ACTIONS */}
                  <div className="text-center sm:text-right space-y-2 sm:space-y-3">
                    <div>
                      <p className="font-semibold text-base sm:text-lg">
                        ${item.price.toFixed(2)}
                      </p>
                      {(item.originalPrice ?? 0) > item.price && (
                        <p className="text-xs sm:text-sm text-muted-foreground line-through">
                          ${item.originalPrice?.toFixed(2)}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-center sm:justify-end items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 sm:h-8 sm:w-8"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 sm:h-8 sm:w-8"
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

          {/* ==== PROMO CODE ==== */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Tag className="h-5 w-5" />
                Promo Code
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  placeholder="Enter promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                />
                <Button onClick={applyPromoCode}>Apply</Button>
              </div>
              {appliedPromo && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-center sm:text-left">
                  Promo code "{appliedPromo.code}" applied! You saved{" "}
                  {appliedPromo.discount}%
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ==== ORDER SUMMARY ==== */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm sm:text-base">
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
                <div className="flex justify-between font-semibold text-base sm:text-lg">
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

          {/* ==== BNPL ==== */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Calendar className="h-5 w-5" />
                Buy Now, Pay Later
              </CardTitle>
              <CardDescription>
                Split your payment into installments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {bnplOptions.length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-4">
                  No BNPL plans available for this amount.
                </p>
              )}
              {bnplOptions.map((opt) => (
                <div key={opt.id} className="border rounded-lg p-3">
                  <div className="flex flex-wrap items-center justify-between mb-2 gap-2">
                    <div className="bg-gray-200 w-14 h-6 rounded" />{" "}
                    <Badge variant="outline">{opt.description}</Badge>
                  </div>
                  <div className="text-sm space-y-1">
                    <p className="font-medium">
                      {opt.installments} payments of $
                      {opt.amount.toFixed(2)}
                    </p>
                    <p className="text-muted-foreground">
                      0% interest, no fees
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-2"
                    size="sm"
                    onClick={() => handleBnplStart(opt.id, opt.provider)}>
                    Pay with {opt.provider}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* ==== SECURITY ==== */}
          <Card>
            <CardContent className="pt-6 text-sm space-y-3">
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
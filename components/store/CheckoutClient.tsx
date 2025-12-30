// app/store/checkout/CheckoutClient.tsx
"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

const LS_BNPL_PID = "bnpl_last_product_id";
const LS_BNPL_QTY = "bnpl_last_qty";

function safeNum(v: any, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function uniq(arr: (string | undefined | null)[]) {
  const s = new Set<string>();
  for (const a of arr) {
    const v = (a || "").trim();
    if (v) s.add(v);
  }
  return Array.from(s);
}

export default function CheckoutPage() {
  const router = useRouter();
  const { toast } = useToast();

  const {
    cartItems,
    cartSummary,
    updateQuantity,
    removeFromCart,
    buyNowProduct,
    setBuyNowProduct,
    isCartMutating,
  } = useCart();

  const hasConfirmedRef = useRef(false);
  const displayItems = buyNowProduct ? [buyNowProduct] : cartItems;

  const [formData, setFormData] = useState({
    phoneNumber: "",
    address: "",
    city: "",
    state: "",
    area: "",
    zipCode: "",
    country: "US",
  });

  const [bnplBreakdown, setBnplBreakdown] = useState<any>(null);
  const [bnplLoading, setBnplLoading] = useState(false);

  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedBillingAddress, setSelectedBillingAddress] = useState<string | null>(null);
  const [selectedShippingAddress, setSelectedShippingAddress] = useState<string | null>(null);

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const uiLocked = isCartMutating || isPlacingOrder;

  const searchParams = useSearchParams();

  // ✅ URL controls BNPL mode
  const payParam = (searchParams.get("pay") || "").toLowerCase();
  const urlWantsBnpl = payParam === "bnpl";

  // Optional: allow explicit product_id + qty in URL
  const urlProductId = (searchParams.get("product_id") || "").trim();
  const urlQty = safeNum(searchParams.get("qty") || "1", 1);

  // Helper
  const formatNGN = (amount: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));

  // ✅ Find a BNPL item if cart is loaded
  const bnplItem = useMemo(() => {
    // Prefer explicit BNPL-enabled
    const explicit = (displayItems || []).find((i: any) => i.bnplAvailable || i.bnpl_enabled);
    if (explicit) return explicit;

    // If forced BNPL via URL, fallback to first item (so UI doesn't flip),
    // but this might not be BNPL-enabled; we still use URL/localStorage for product_id.
    if (urlWantsBnpl) return (displayItems || [])[0];

    return null;
  }, [displayItems, urlWantsBnpl]);

  // ✅ BNPL mode is controlled by URL OR having a BNPL item
  const isBnplCheckout = urlWantsBnpl || !!((displayItems || []).find((i: any) => i.bnplAvailable || i.bnpl_enabled));

  // ✅ When BNPL is on, hide cart items + totals UI
  const showCartItemsUI = !isBnplCheckout;

  // ✅ Confirm payment callback
  useEffect(() => {
    const status = searchParams.get("status");
    const tx_ref = searchParams.get("tx_ref");
    const transaction_id = searchParams.get("transaction_id");

    if (status === "completed" && tx_ref && transaction_id) {
      const invoice_id = localStorage.getItem("checkout_invoice_id");
      confirmPayment(tx_ref, transaction_id, invoice_id || undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // ✅ Addresses
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

  // Dummy options
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
  const subtotal = Number(cartSummary?.subtotal || 0);
  const discount = Number(cartSummary?.discount_total || 0);
  const shipping = Number(cartSummary?.shipping_total || 0);
  const tax = Number(cartSummary?.tax_total || 0);
  const total = Number(cartSummary?.payable_total || 0);

  // ✅ Resolve BNPL product_id + qty from URL/localStorage/cart
  const resolveBnplPayload = () => {
    // 1) URL
    if (urlProductId) return { product_id: urlProductId, quantity: Math.max(1, urlQty) };

    // 2) localStorage
    const lsPid = (typeof window !== "undefined" && localStorage.getItem(LS_BNPL_PID)) || "";
    const lsQty = safeNum(
      (typeof window !== "undefined" && localStorage.getItem(LS_BNPL_QTY)) || "1",
      1
    );
    if (lsPid) return { product_id: lsPid, quantity: Math.max(1, lsQty) };

    // 3) from bnplItem (ONLY if it looks like product id)
    if (bnplItem) {
      // Your cart shape is inconsistent on reload, so try several candidates.
      // We DO NOT want cartItemId here.
      const candidates = uniq([
        bnplItem.product_id,
        bnplItem.id,
      ]);

      // choose first candidate
      if (candidates[0]) {
        return {
          product_id: candidates[0],
          quantity: Math.max(1, safeNum(bnplItem.quantity || 1, 1)),
          _candidates: candidates,
        } as any;
      }
    }

    return null;
  };

  // ✅ Persist BNPL selection once we have a stable product_id
  useEffect(() => {
    if (!isBnplCheckout) return;
    const payload: any = resolveBnplPayload();
    if (!payload?.product_id) return;

    try {
      localStorage.setItem(LS_BNPL_PID, String(payload.product_id));
      localStorage.setItem(LS_BNPL_QTY, String(payload.quantity || 1));
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBnplCheckout, bnplItem?.id, bnplItem?.quantity, urlProductId, urlQty]);

  // ✅ Fetch BNPL breakdown (with retry if wrong id was sent)
  const fetchCheckoutBnpl = async () => {
    const payload: any = resolveBnplPayload();
    if (!payload?.product_id) {
      setBnplBreakdown(null);
      return;
    }

    const quantity = Math.max(1, safeNum(payload.quantity || 1, 1));

    // candidate ids (if available)
    const candidates = uniq([
      payload.product_id,
      ...(payload._candidates || []),
      // also try: if bnplItem has cartItemId separate, try item.id and product?.id already included above
    ]);

    setBnplLoading(true);

    try {
      let lastErr: any = null;

      for (let attempt = 0; attempt < Math.min(2, candidates.length); attempt++) {
        const pid = candidates[attempt];
        const res = await fetch("/api/store/bnpl/breakdown", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product_id: pid,
            quantity,
          }),
        });

        const data = await res.json().catch(() => ({}));

        if (res.ok) {
          setBnplBreakdown(data);

          // persist the working product_id (prevents future 404s)
          try {
            localStorage.setItem(LS_BNPL_PID, String(pid));
            localStorage.setItem(LS_BNPL_QTY, String(quantity));
          } catch {}

          return;
        }

        lastErr = { status: res.status, data };
        // if 404, try the next candidate once
        if (res.status !== 404) break;
      }

      setBnplBreakdown(
        lastErr?.data || { eligible: false, reason: "Unable to fetch BNPL breakdown." }
      );
    } finally {
      setBnplLoading(false);
    }
  };

  // ✅ Auto-fetch breakdown whenever BNPL mode is active
  useEffect(() => {
    if (isBnplCheckout) fetchCheckoutBnpl();
    else setBnplBreakdown(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBnplCheckout, bnplItem?.id, bnplItem?.quantity, urlProductId, urlQty]);

  const validateCheckout = () => {
    if (!formData.phoneNumber?.trim()) {
      return { ok: false, message: "Phone number is required." };
    }

    const usingSavedShipping = !!selectedShippingAddress;
    if (!usingSavedShipping) {
      if (!formData.address?.trim()) return { ok: false, message: "Street address is required." };
      if (!formData.city?.trim()) return { ok: false, message: "City is required." };
      if (!formData.state?.trim()) return { ok: false, message: "State is required." };
      if (!formData.area?.trim()) return { ok: false, message: "Area is required." };
      if (!formData.zipCode?.trim()) return { ok: false, message: "Postal code is required." };
    }

    // ✅ Only normal checkout needs cart items
    if (!isBnplCheckout && !displayItems?.length) {
      return { ok: false, message: "Your cart is empty." };
    }

    // ✅ BNPL can proceed without cart items (uses URL/localStorage)
    if (isBnplCheckout) {
      const payload = resolveBnplPayload?.();
      if (!payload?.product_id) {
        return { ok: false, message: "No BNPL product selected. Please go back and select an item." };
      }

      if (bnplLoading) return { ok: false, message: "Loading BNPL breakdown…" };
      if (!bnplBreakdown) return { ok: false, message: "BNPL breakdown unavailable." };

      if (!bnplBreakdown?.eligible) {
        return { ok: false, message: bnplBreakdown?.reason || "This request is not eligible for BNPL." };
      }

      const payNow = safeNum(bnplBreakdown?.breakdown?.downpayment_now, 0);
      if (!payNow || payNow <= 0) return { ok: false, message: "Invalid BNPL downpayment amount." };
    }

    return { ok: true as const };
  };


  const canRequestOrPlace = useMemo(() => validateCheckout().ok, [
    formData,
    selectedShippingAddress,
    displayItems.length,
    isBnplCheckout,
    bnplLoading,
    bnplBreakdown,
  ]);

  const handleRemoveItem = (id: any) => {
    if (uiLocked || isBnplCheckout) return;

    if (buyNowProduct && String(buyNowProduct.id) === String(id)) {
      setBuyNowProduct(null);
    } else {
      removeFromCart(String(id) as any);
    }
    toast({ title: "Item Removed", description: "Item removed from cart" });
  };

  const handleQuantityChange = (id: any, newQuantity: number) => {
    if (uiLocked || isBnplCheckout) return;
    if (newQuantity < 1) return;

    if (buyNowProduct && String(buyNowProduct.id) === String(id)) {
      setBuyNowProduct({ ...buyNowProduct, quantity: newQuantity });
    } else {
      updateQuantity(String(id) as any, newQuantity);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPlacingOrder || isCartMutating) return;

    const v = validateCheckout();
    if (!v.ok) {
      toast({ variant: "destructive", title: "Incomplete checkout", description: v.message });
      return;
    }

    console.log(" worth it....")

    setIsPlacingOrder(true);

    try {
      let billingId = selectedBillingAddress;
      let shippingId = selectedShippingAddress;

      if (!billingId && !shippingId) {
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
            phone_number: formData.phoneNumber,
            area: formData.area,
          }),
        });

        const addrData = await res.json().catch(() => ({}));
        if (!res.ok) {
          toast({
            variant: "destructive",
            title: "Error creating address",
            description: addrData?.detail || addrData?.error || "Could not create address",
          });
          return;
        }
        billingId = String(addrData.id);
      }

      console.log(billingId, " d,lc,dlv,fvl,;flv,;fl")

      if (!billingId) billingId = shippingId;
      if (!shippingId) shippingId = billingId;

      const createOrderPayload: any = {
        billing_address_id: billingId,
        shipping_address_id: shippingId,
        phone_number: formData.phoneNumber,
      };

      if (isBnplCheckout) {
        const bnplPayload: any = resolveBnplPayload?.();

        createOrderPayload.is_bnpl = true;
        createOrderPayload.bnpl_plan_id = bnplBreakdown?.plan?.id || null;

        // ✅ PASS PRODUCT ID + QTY TO BACKEND
        createOrderPayload.product_id =
          bnplPayload?.product_id || bnplBreakdown?.product_details?.product_id || null;

        createOrderPayload.quantity = Math.max(1, safeNum(bnplPayload?.quantity || 1, 1));
      }

      const orderRes = await fetch("/api/store/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createOrderPayload),
      });

      const orderData = await orderRes.json().catch(() => ({}));
      if (!orderRes.ok) {
        toast({
          variant: "destructive",
          title: "Failed to create order",
          description: orderData?.detail || orderData?.error || "Order creation failed",
        });
        return;
      }

      const orderId = orderData?.id || orderData?.order_id;
      if (!orderId) {
        toast({
          variant: "destructive",
          title: "Order created but missing order_id",
          description: "Backend did not return order id",
        });
        return;
      }

      const redirect_url = `${window.location.origin}/store/checkout`;

      const totalToPayFromCart = Number(cartSummary?.payable_total || 0);
      const normalAmountToPay =
        orderData?.total_amount ?? orderData?.amount ?? (buyNowProduct ? total : totalToPayFromCart);

      const bnplPayNow = safeNum(bnplBreakdown?.breakdown?.downpayment_now, 0);
      const amountToPay = isBnplCheckout ? bnplPayNow : safeNum(normalAmountToPay, 0);

      const bnplPayload: any = isBnplCheckout ? resolveBnplPayload?.() : null;

      const itemList = isBnplCheckout
        ? String(
            bnplPayload?.product_id || bnplBreakdown?.product_details?.product_id || ""
          )
        : displayItems.map((i: any) => i.id).join(",");

      const paymentPayload: any = {
        redirect_url,
        is_store_payment: true,
        amount: amountToPay.toFixed(2),
        order_id: orderId,
        item_list: itemList,
        payment_title: isBnplCheckout ? "BNPL - First Payment" : "Store Checkout",
      };

      if (isBnplCheckout) {
        paymentPayload.is_bnpl = true;
        paymentPayload.bnpl_plan_id = bnplBreakdown?.plan?.id || null;
      }


      const payRes = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentPayload),
      });

      const payData = await payRes.json().catch(() => ({}));
      if (!payRes.ok) {
        toast({
          variant: "destructive",
          title: "Payment initialization failed",
          description: payData?.detail || payData?.error || "Unable to create payment link",
        });
        return;
      }

      const link = payData?.payment_link;
      const invoiceId = payData?.invoice_id;

      if (invoiceId) localStorage.setItem("checkout_invoice_id", String(invoiceId));

      if (!link) {
        toast({
          variant: "destructive",
          title: "Payment link missing",
          description: "Backend did not return payment_link",
        });
        return;
      }

      window.location.href = link;
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: err?.message || "Could not start checkout",
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const confirmPayment = async (tx_ref: string, transaction_id: string, invoice_id?: string) => {
    if (hasConfirmedRef.current) return;
    hasConfirmedRef.current = true;

    setIsPlacingOrder(true);
    try {
      const payload: any = { status: "completed", tx_ref, transaction_id };
      if (invoice_id) payload.invoice_id = invoice_id;

      const res = await fetch("/api/billing?action=confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        hasConfirmedRef.current = false;
        toast({
          variant: "destructive",
          title: "Payment confirmation failed",
          description: data?.detail || data?.error || "Could not confirm payment",
        });
        return;
      }

      toast({ title: "Payment Confirmed!", description: "Your request has been submitted successfully." });

      localStorage.removeItem("checkout_invoice_id");
      setBuyNowProduct(null);

      router.replace("/store/checkout?pay=bnpl");
      setTimeout(() => router.push("/store"), 1200);
    } catch (err: any) {
      hasConfirmedRef.current = false;
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: err?.message || "Could not confirm payment",
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const bnplPayNowText = useMemo(() => {
    const payNow = safeNum(bnplBreakdown?.breakdown?.downpayment_now, 0);
    return formatNGN(payNow);
  }, [bnplBreakdown]);

  return (
    <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto py-5">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Checkout</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">Complete your purchase</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>We'll use this to contact you about delivery</CardDescription>
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
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    required
                    disabled={uiLocked}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
              <CardDescription>Where should we deliver your order?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Select
                  value={selectedShippingAddress || ""}
                  onValueChange={(val) => setSelectedShippingAddress(val === "new" ? null : val)}
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
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          required
                          disabled={uiLocked}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>State</Label>
                        <Select
                          value={formData.state}
                          onValueChange={(val) => setFormData({ ...formData, state: val, area: "" })}
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
                          onValueChange={(val) => setFormData({ ...formData, area: val })}
                          disabled={uiLocked || !formData.state}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={formData.state ? "Select area" : "Select state first"} />
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
                          onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
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

        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                {isBnplCheckout ? "BNPL Request" : "Order Summary"}
              </CardTitle>
              {isBnplCheckout && (
                <CardDescription>
                  Cart items are hidden for BNPL — review the payment schedule below.
                </CardDescription>
              )}
            </CardHeader>

            <CardContent className="space-y-4">
              {/* ✅ CART UI (hidden during BNPL) */}
              {showCartItemsUI && (
                <>
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
                            <h4 className="font-medium text-sm line-clamp-2">{item.name}</h4>

                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-6 w-6 bg-transparent"
                                  disabled={uiLocked}
                                  onClick={() => handleQuantityChange(id, item.quantity - 1)}
                                >
                                  -
                                </Button>

                                <span className="text-sm w-8 text-center">{item.quantity}</span>

                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-6 w-6 bg-transparent"
                                  disabled={uiLocked}
                                  onClick={() => handleQuantityChange(id, item.quantity + 1)}
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
                              {formatNGN(Number(item.price) * Number(item.quantity))}
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
                      <span className="font-medium">{formatNGN(subtotal)}</span>
                    </div>

                    {!buyNowProduct && discount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Discount {cartSummary?.coupon ? `(${cartSummary.coupon})` : ""}
                        </span>
                        <span className="font-medium">- {formatNGN(discount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="font-medium">
                        {shipping === 0 ? (
                          <Badge variant="secondary" className="text-xs">
                            FREE
                          </Badge>
                        ) : (
                          formatNGN(shipping)
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax (8%)</span>
                      <span className="font-medium">{formatNGN(tax)}</span>
                    </div>

                    <Separator />

                    <div className="flex justify-between text-base font-bold">
                      <span>Total</span>
                      <span>{formatNGN(total)}</span>
                    </div>
                  </div>
                </>
              )}

              {/* ✅ BNPL Breakdown */}
              {isBnplCheckout && (
                <div className="p-3 rounded-lg border space-y-3">
                  <div className="text-sm font-semibold">Buy Now, Pay Later</div>

                  {bnplLoading ? (
                    <div className="text-sm text-muted-foreground">Loading BNPL breakdown…</div>
                  ) : !bnplBreakdown ? (
                    <div className="text-sm text-muted-foreground">BNPL breakdown unavailable.</div>
                  ) : (
                    <>
                      {/* ✅ Product details header */}
                      {bnplBreakdown?.product_details && (
                        <div className="flex gap-3 items-center p-2 rounded-md border bg-muted/30">
                          <img
                            src={bnplBreakdown.product_details.image_url || "/placeholder.svg"}
                            alt={bnplBreakdown.product_details.title || "Product"}
                            className="w-12 h-12 rounded object-cover flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="text-sm font-semibold line-clamp-1">
                              {bnplBreakdown.product_details.title}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatNGN(safeNum(bnplBreakdown.product_details.price, 0))}
                            </div>
                          </div>
                        </div>
                      )}

                      {!bnplBreakdown.eligible && (
                        <div className="text-sm">
                          <div className="font-semibold">BNPL not eligible</div>
                          <div className="text-muted-foreground">{bnplBreakdown.reason}</div>
                        </div>
                      )}

                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Plan</span>
                        <span className="font-medium">
                          {bnplBreakdown.plan?.name} ({bnplBreakdown.plan?.num_installments}x)
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Pay today</span>
                        <span className="font-semibold">
                          {formatNGN(safeNum(bnplBreakdown.breakdown?.downpayment_now, 0))}
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total (BNPL)</span>
                        <span className="font-semibold">
                          {formatNGN(safeNum(bnplBreakdown.breakdown?.total_amount, 0))}
                        </span>
                      </div>

                      <Separator />

                      <div className="space-y-2 max-h-48 overflow-auto pr-1">
                        {(bnplBreakdown.breakdown?.installments || []).map((inst: any) => (
                          <div key={inst.index} className="flex justify-between text-xs p-2 border rounded-md">
                            <span className="text-muted-foreground">
                              #{inst.index} • {new Date(inst.due_at).toLocaleDateString()}
                              {inst.capture_immediately ? " (today)" : ""}
                            </span>
                            <span className="font-semibold">{formatNGN(safeNum(inst.amount_due, 0))}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}


              {/* ✅ Button: BNPL = Request Item, Non-BNPL = Place Order */}
              <Button
                className="w-full"
                size="lg"
                onClick={handleSubmit as any}
                disabled={uiLocked || !canRequestOrPlace || (isBnplCheckout && (bnplLoading || !bnplBreakdown?.eligible))}
              >
                {uiLocked ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isPlacingOrder ? "Processing..." : "Updating..."}
                  </>
                ) : isBnplCheckout ? (
                  <>Pay {bnplPayNowText} now</>
                ) : (
                  <>Place Order - {formatNGN(total)}</>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                By continuing, you agree to our terms and conditions
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

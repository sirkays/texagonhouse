
// app/store/checkout/CheckoutClient.tsx
"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react"; // ✅ ADD
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
import {ArrowLeft, Trash2, ShoppingBag, Loader2} from "lucide-react";
import {useToast} from "@/hooks/use-toast";
import {useCart} from "@/providers/CartProvider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LS_BNPL_PID = "bnpl_last_product_id";
const LS_BNPL_QTY = "bnpl_last_qty";

const LS_BUYNOW_PID = "buynow_last_product_id";
const LS_BUYNOW_QTY = "buynow_last_qty";

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
  const {toast} = useToast();

  // ✅ AUTH STATE (NextAuth)
  const { data: session, status } = useSession();
  const sessionToken =
    status === "authenticated" &&
    session?.user &&
    "sessionToken" in (session.user as any)
      ? ((session.user as any).sessionToken as string | undefined)
      : undefined;

  const isAuthed = Boolean(sessionToken);

  const requireAuth = () => {
    toast({
      variant: "destructive",
      title: "Login required",
      description: "Please log in to place an order or make payment.",
    });
    router.push("/login"); // ✅ change to your real login route
  };

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

  const [formData, setFormData] = useState({
    phoneNumber: "",
    address: "",
    city: "",
    state: "",
    area: "",
    zipCode: "",
    country: "US",
  });

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [bnplBreakdown, setBnplBreakdown] = useState<any>(null);
  const [bnplLoading, setBnplLoading] = useState(false);

  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedBillingAddress, setSelectedBillingAddress] = useState<
    string | null
  >(null);
  const [selectedShippingAddress, setSelectedShippingAddress] = useState<
    string | null
  >(null);

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const uiLocked = isCartMutating || isPlacingOrder;

  const searchParams = useSearchParams();
  const TAX_RATE = 0.08;
  const FLAT_SHIPPING = 1000.99; // change to your real shipping

  // ✅ URL controls BNPL mode
  const payParam = (searchParams.get("pay") || "").toLowerCase();
  const urlWantsBnpl = payParam === "bnpl";

  // Optional: allow explicit product_id + qty in URL
  const urlProductId = (searchParams.get("product_id") || "").trim();
  const urlQty = safeNum(searchParams.get("qty") || "1", 1);

  const modeParam = (searchParams.get("mode") || "").toLowerCase();
  const isBuyNowCheckout = modeParam === "buynow";

  const resolveBuyNowPayload = () => {
    if (urlProductId)
      return { product_id: urlProductId, quantity: Math.max(1, urlQty) };

    const lsPid =
      (typeof window !== "undefined" &&
        localStorage.getItem(LS_BUYNOW_PID)) ||
      "";
    const lsQty = safeNum(
      (typeof window !== "undefined" &&
        localStorage.getItem(LS_BUYNOW_QTY)) ||
        "1",
      1
    );

    if (lsPid) return {product_id: lsPid, quantity: Math.max(1, lsQty)};

    // fallback: buyNowProduct in context
    if (buyNowProduct?.product_id) {
      return {
        product_id: buyNowProduct.product_id,
        quantity: Math.max(1, safeNum(buyNowProduct.quantity || 1, 1)),
      };
    }

    return null;
  };

  // Helper
  const formatNGN = (amount: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));

  const LS_BUYNOW_SNAPSHOT = "buynow_snapshot";
  const [buyNowSnapshot, setBuyNowSnapshot] = useState<any>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_BUYNOW_SNAPSHOT);
      setBuyNowSnapshot(raw ? JSON.parse(raw) : null);
    } catch {
      setBuyNowSnapshot(null);
    }
  }, []);

  // ✅ BNPL mode is controlled by URL OR having a BNPL item
  const isBnplCheckout = urlWantsBnpl;

  // ✅ When BNPL is on, hide cart items + totals UI
  const showCartItemsUI = !isBnplCheckout;

  const displayItems = useMemo(() => {
    if (isBuyNowCheckout) {
      const p = resolveBuyNowPayload();
      const qty = Math.max(1, safeNum(p?.quantity || 1, 1));

      if (buyNowProduct) {
        return [{...buyNowProduct, quantity: qty}];
      }

      if (buyNowSnapshot?.product_id) {
        return [
          {
            id: buyNowSnapshot.product_id,
            product_id: buyNowSnapshot.product_id,
            title: buyNowSnapshot.title,
            price: String(buyNowSnapshot.price ?? "0"),
            quantity: qty,
            line_total: String(Number(buyNowSnapshot.price || 0) * qty),
            image: buyNowSnapshot.image || "",
            bnpl_enabled: !!buyNowSnapshot.bnpl_enabled,
          },
        ];
      }

      return [];
    }

    return buyNowProduct ? [buyNowProduct] : cartItems;
  }, [isBuyNowCheckout, buyNowProduct, cartItems, buyNowSnapshot]);

  // ✅ Find a BNPL item if cart is loaded
  const bnplItem = useMemo(() => {
    if (!isBnplCheckout) return null;
    return (displayItems || [])[0] || null;
  }, [displayItems, isBnplCheckout]);

  // ✅ Addresses
  useEffect(() => {
    // If not authenticated, we can either redirect immediately,
    // or allow page to show and only block "Place Order / Pay".
    // Here we keep your original behavior + redirect on 401.
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

  const buyNowTotals = useMemo(() => {
    if (!isBuyNowCheckout) return null;

    const item = (displayItems || [])[0];
    const qty = Math.max(1, safeNum(item?.quantity || urlQty || 1, 1));

    // Your items use `price` as string. Snapshot uses `price` too.
    const unitPrice = safeNum(item?.price ?? 0, 0);

    const subtotal = unitPrice * qty;
    const tax = subtotal * TAX_RATE;

    const shipping = FLAT_SHIPPING;
    const total = subtotal + tax + shipping;

    return {subtotal, tax, shipping, total};
  }, [isBuyNowCheckout, displayItems, urlQty]);

  const areasForSelectedState = (AREAS_BY_STATE as any)[formData.state] ?? [];

  // Totals
  const cartSubtotal = Number(cartSummary?.subtotal || 0);
  const discount = Number(cartSummary?.discount_total || 0);
  const cartShipping = Number(cartSummary?.shipping_total || 0);
  const cartTax = Number(cartSummary?.tax_total || 0);
  const cartTotal = Number(cartSummary?.payable_total || 0);

  // ✅ what UI should show
  const subtotal = isBuyNowCheckout ? buyNowTotals?.subtotal || 0 : cartSubtotal;
  const shipping = isBuyNowCheckout ? buyNowTotals?.shipping || 0 : cartShipping;
  const tax = isBuyNowCheckout ? buyNowTotals?.tax || 0 : cartTax;
  const total = isBuyNowCheckout ? buyNowTotals?.total || 0 : cartTotal;

  // ✅ Resolve BNPL product_id + qty from URL/localStorage/cart
  const resolveBnplPayload = () => {
    // 1) URL
    if (urlProductId)
      return {product_id: urlProductId, quantity: Math.max(1, urlQty)};

    // 2) localStorage
    const lsPid =
      (typeof window !== "undefined" && localStorage.getItem(LS_BNPL_PID)) ||
      "";
    const lsQty = safeNum(
      (typeof window !== "undefined" && localStorage.getItem(LS_BNPL_QTY)) ||
        "1",
      1
    );
    if (lsPid) return {product_id: lsPid, quantity: Math.max(1, lsQty)};

    // 3) from bnplItem (ONLY if it looks like product id)
    if (bnplItem) {
      const candidates = uniq([bnplItem.product_id, bnplItem.id]);
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
    const candidates = uniq([payload.product_id, ...(payload._candidates || [])]);

    setBnplLoading(true);

    try {
      let lastErr: any = null;

      for (let attempt = 0; attempt < Math.min(2, candidates.length); attempt++) {
        const pid = candidates[attempt];
        const res = await fetch("/api/store/bnpl/breakdown", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_id: pid, quantity }),
        });

        const data = await res.json().catch(() => ({}));

        if (res.ok) {
          setBnplBreakdown(data);

          try {
            localStorage.setItem(LS_BNPL_PID, String(pid));
            localStorage.setItem(LS_BNPL_QTY, String(quantity));
          } catch {}

          return;
        }

        lastErr = { status: res.status, data };
        if (res.status !== 404) break;
      }

      setBnplBreakdown(
        lastErr?.data || {
          eligible: false,
          reason: "Unable to fetch BNPL breakdown.",
        }
      );
    } finally {
      setBnplLoading(false);
    }
  };

  useEffect(() => {
    const status = searchParams.get("status");
    if (status === "cancelled") {
      toast({
        variant: "destructive",
        title: "Payment cancelled",
        description: "No charges were made.",
      });

      const clean = new URL(window.location.href);
      clean.searchParams.delete("status");
      clean.searchParams.delete("tx_ref");
      clean.searchParams.delete("transaction_id");
      router.replace(`${clean.pathname}?${clean.searchParams.toString()}`);
    }
    // ...
  }, [searchParams, router, toast]);

  // ✅ Auto-fetch breakdown whenever BNPL mode is active
  useEffect(() => {
    if (isBnplCheckout) fetchCheckoutBnpl();
    else setBnplBreakdown(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBnplCheckout, bnplItem?.id, bnplItem?.quantity, urlProductId, urlQty]);

  const validateCheckout = () => {
    if (!formData.phoneNumber?.trim()) {
      return {ok: false, message: "Phone number is required."};
    }

    const usingSavedShipping = !!selectedShippingAddress;
    if (!usingSavedShipping) {
      if (!formData.address?.trim())
        return {ok: false, message: "Street address is required."};
      if (!formData.city?.trim())
        return {ok: false, message: "City is required."};
      if (!formData.state?.trim())
        return {ok: false, message: "State is required."};
      if (!formData.area?.trim())
        return {ok: false, message: "Area is required."};
      if (!formData.zipCode?.trim())
        return {ok: false, message: "Postal code is required."};
    }

    // ✅ Only normal checkout needs cart items
    if (!isBnplCheckout && !isBuyNowCheckout && !displayItems?.length) {
      return {ok: false, message: "Your cart is empty."};
    }

    if (isBuyNowCheckout) {
      const p = resolveBuyNowPayload();
      if (!p?.product_id) {
        return {ok: false, message: "No Buy Now product selected."};
      }
    }

    // ✅ BNPL can proceed without cart items (uses URL/localStorage)
    if (isBnplCheckout) {
      const payload = resolveBnplPayload?.();
      if (!payload?.product_id) {
        return {
          ok: false,
          message:
            "No BNPL product selected. Please go back and select an item.",
        };
      }

      if (bnplLoading) return {ok: false, message: "Loading BNPL breakdown…"};
      if (!bnplBreakdown)
        return {ok: false, message: "BNPL breakdown unavailable."};

      if (!bnplBreakdown?.eligible) {
        return {
          ok: false,
          message:
            bnplBreakdown?.reason || "This request is not eligible for BNPL.",
        };
      }

      const payNow = safeNum(bnplBreakdown?.breakdown?.downpayment_now, 0);
      if (!payNow || payNow <= 0)
        return {ok: false, message: "Invalid BNPL downpayment amount."};
    }

    return { ok: true as const };
  };

  const canRequestOrPlace = useMemo(
    () => validateCheckout().ok,
    [
      formData,
      selectedShippingAddress,
      displayItems,
      isBnplCheckout,
      bnplLoading,
      bnplBreakdown,
    ]
  );

  const handleRemoveItem = (id: any) => {
    if (uiLocked || isBnplCheckout) return;

    if (buyNowProduct && String(buyNowProduct.id) === String(id)) {
      setBuyNowProduct(null);
    } else {
      removeFromCart(String(id) as any);
    }
    toast({title: "Item Removed", description: "Item removed from cart"});
  };

  const handleQuantityChange = (id: any, newQuantity: number) => {
    if (uiLocked || isBnplCheckout) return;
    if (newQuantity < 1) return;

    if (buyNowProduct && String(buyNowProduct.id) === String(id)) {
      setBuyNowProduct({...buyNowProduct, quantity: newQuantity});
    } else {
      updateQuantity(String(id) as any, newQuantity);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ BLOCK PLACE ORDER / PAY WHEN NOT AUTHENTICATED
    if (!isAuthed) {
      requireAuth();
      return;
    }

    if (isPlacingOrder || isCartMutating) return;

    const v = validateCheckout();
    if (!v.ok) {
      toast({
        variant: "destructive",
        title: "Incomplete checkout",
        description: v.message,
      });
      return;
    }

    setIsPlacingOrder(true);

    try {
      let billingId = selectedBillingAddress;
      let shippingId = selectedShippingAddress;

      if (!billingId && !shippingId) {
        const res = await fetch("/api/store/addresses", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
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
            description:
              addrData?.detail || addrData?.error || "Could not create address",
          });
          return;
        }
        billingId = String(addrData.id);
      }

      if (!billingId) billingId = shippingId;
      if (!shippingId) shippingId = billingId;

      const createOrderPayload: any = {
        billing_address_id: billingId,
        shipping_address_id: shippingId,
        phone_number: formData.phoneNumber,
      };

      // ✅ Make modes exclusive (BNPL wins if both appear)
      if (isBnplCheckout) {
        const bnplPayload: any = resolveBnplPayload?.();

        if (
          !bnplPayload?.product_id &&
          !bnplBreakdown?.product_details?.product_id
        ) {
          toast({
            variant: "destructive",
            title: "BNPL item missing",
            description:
              "No BNPL product selected. Please go back and try again.",
          });
          return;
        }

        createOrderPayload.is_bnpl = true;
        createOrderPayload.bnpl_plan_id = bnplBreakdown?.plan?.id || null;

        createOrderPayload.product_id =
          bnplPayload?.product_id ||
          bnplBreakdown?.product_details?.product_id ||
          null;

        createOrderPayload.quantity = Math.max(
          1,
          safeNum(bnplPayload?.quantity || 1, 1)
        );
      } else if (isBuyNowCheckout) {
        const p = resolveBuyNowPayload();

        if (!p?.product_id) {
          toast({
            variant: "destructive",
            title: "Buy now item missing",
            description: "No product selected. Please go back and try again.",
          });
          return;
        }

        createOrderPayload.product_id = p.product_id;
        createOrderPayload.quantity = Math.max(1, safeNum(p.quantity || 1, 1));
      }

      const orderRes = await fetch("/api/store/checkout/create-order", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(createOrderPayload),
      });

      const orderData = await orderRes.json().catch(() => ({}));
      if (!orderRes.ok) {
        toast({
          variant: "destructive",
          title: "Failed to create order",
          description:
            orderData?.detail || orderData?.error || "Order creation failed",
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

      const currentUrl = new URL(window.location.href);
      const redirect_url = `${window.location.origin}/store/checkout?${currentUrl.searchParams.toString()}`;

      const normalAmountToPay = safeNum(
        orderData?.grand_total ??
          orderData?.payable_total ??
          orderData?.amount ??
          orderData?.total_amount,
        0
      );

      const bnplPayNow = safeNum(bnplBreakdown?.breakdown?.downpayment_now, 0);
      const amountToPay = isBnplCheckout ? bnplPayNow : normalAmountToPay;

      if (!amountToPay || amountToPay <= 0) {
        toast({
          variant: "destructive",
          title: "Invalid amount",
          description:
            "Payment amount is invalid. Please refresh and try again.",
        });
        return;
      }

      const bnplPayload: any = isBnplCheckout ? resolveBnplPayload?.() : null;

      const itemList = isBnplCheckout
        ? String(
            bnplPayload?.product_id ||
              bnplBreakdown?.product_details?.product_id ||
              ""
          )
        : isBuyNowCheckout
        ? String(resolveBuyNowPayload()?.product_id || "")
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
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(paymentPayload),
      });

      const payData = await payRes.json().catch(() => ({}));
      if (!payRes.ok) {
        toast({
          variant: "destructive",
          title: "Payment initialization failed",
          description:
            payData?.detail ||
            payData?.error ||
            "Unable to create payment link",
        });
        return;
      }

      const link = payData?.payment_link;
      const invoiceId = payData?.invoice_id;

      if (invoiceId)
        localStorage.setItem("checkout_invoice_id", String(invoiceId));

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

const confirmPayment = async (
  tx_ref: string,
  transaction_id: string,
  invoice_id?: string
) => {
  if (hasConfirmedRef.current) return;
  hasConfirmedRef.current = true;

  setIsPlacingOrder(true);
  try {
    const payload: any = { tx_ref, transaction_id };
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

    toast({
      title: "Payment Confirmed!",
      description: "Your request has been submitted successfully.",
    });

    localStorage.removeItem("checkout_invoice_id");
    setBuyNowProduct(null);

    const clean = new URL(window.location.href);
    clean.searchParams.delete("status");
    clean.searchParams.delete("tx_ref");
    clean.searchParams.delete("transaction_id");
    router.replace(`${clean.pathname}?${clean.searchParams.toString()}`);

    setTimeout(() => router.push("/store?tab=orders"), 1200);
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


// ✅ Confirm payment callback (Flutterwave redirect)
useEffect(() => {
  const statusRaw = (searchParams.get("status") || "").toLowerCase();
  const tx_ref = searchParams.get("tx_ref") || "";
  const transaction_id = searchParams.get("transaction_id") || "";

  // Flutterwave can send: successful / cancelled / failed (etc.)
  const isCancelled =
    statusRaw === "cancelled" || statusRaw === "canceled";

  // If cancelled -> show toast and clean URL (you already do this)
  if (isCancelled) return;

  // If we have a transaction_id (best) or tx_ref, attempt server confirmation.
  // IMPORTANT: we do not rely on statusRaw === "completed" anymore.
  if ((transaction_id || tx_ref) && !hasConfirmedRef.current) {
    const invoice_id = localStorage.getItem("checkout_invoice_id") || undefined;
    confirmPayment(tx_ref, transaction_id, invoice_id);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [searchParams]);

  const bnplPayNowText = useMemo(() => {
    const payNow = safeNum(bnplBreakdown?.breakdown?.downpayment_now, 0);
    return formatNGN(payNow);
  }, [bnplBreakdown]);

  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "UTC",
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(new Date(iso));
  if (!mounted) {
    return (
      <div className="max-w-7xl mx-auto py-5 space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-md border" />
          <div className="space-y-2">
            <div className="h-6 w-40 rounded bg-muted" />
            <div className="h-4 w-56 rounded bg-muted" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-56 rounded-lg border" />
            <div className="h-80 rounded-lg border" />
          </div>
          <div className="h-[520px] rounded-lg border" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto py-5">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/store?tab=cart")}>
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

      {/* ✅ OPTIONAL: Show a login prompt block if not authenticated */}
      {!isAuthed && (
        <Card>
          <CardHeader>
            <CardTitle>Login required</CardTitle>
            <CardDescription>
              Please log in to place an order or make payment.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button onClick={() => router.push("/login")}>Log in</Button>
            <Button variant="outline" onClick={() => router.push("/store")}>
              Continue shopping
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
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
                      setFormData({...formData, phoneNumber: e.target.value})
                    }
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
                          setFormData({...formData, address: e.target.value})
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
                            setFormData({...formData, city: e.target.value})
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
                            setFormData({...formData, state: val, area: ""})
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
                            setFormData({...formData, area: val})
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
                            setFormData({...formData, zipCode: e.target.value})
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

        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                {isBnplCheckout ? "BNPL Request" : "Order Summary"}
              </CardTitle>
              {isBnplCheckout && (
                <CardDescription>
                  Cart items are hidden for BNPL — review the payment schedule
                  below.
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
                        <div
                          key={key}
                          className="flex gap-3 p-3 border rounded-lg"
                        >
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-16 h-16 rounded object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm line-clamp-2">
                              {item.title}
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
                              {formatNGN(
                                Number(item.price) * Number(item.quantity)
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
                      <span className="font-medium">{formatNGN(subtotal)}</span>
                    </div>

                    {!buyNowProduct && discount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Discount{" "}
                          {cartSummary?.coupon ? `(${cartSummary.coupon})` : ""}
                        </span>
                        <span className="font-medium">
                          - {formatNGN(discount)}
                        </span>
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
                    <div className="text-sm text-muted-foreground">
                      Loading BNPL breakdown…
                    </div>
                  ) : !bnplBreakdown ? (
                    <div className="text-sm text-muted-foreground">
                      BNPL breakdown unavailable.
                    </div>
                  ) : (
                    <>
                      {/* ✅ Product details header */}
                      {bnplBreakdown?.product_details && (
                        <div className="flex gap-3 items-center p-2 rounded-md border bg-muted/30">
                          <img
                            src={
                              bnplBreakdown.product_details.image_url ||
                              "/placeholder.svg"
                            }
                            alt={bnplBreakdown.product_details.title || "Product"}
                            className="w-12 h-12 rounded object-cover flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="text-sm font-semibold line-clamp-1">
                              {bnplBreakdown.product_details.title}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatNGN(
                                safeNum(bnplBreakdown.product_details.price, 0)
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {!bnplBreakdown.eligible && (
                        <div className="text-sm">
                          <div className="font-semibold">BNPL not eligible</div>
                          <div className="text-muted-foreground">
                            {bnplBreakdown.reason}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Plan</span>
                        <span className="font-medium">
                          {bnplBreakdown.plan?.name} (
                          {bnplBreakdown.plan?.num_installments}x)
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Pay today</span>
                        <span className="font-semibold">
                          {formatNGN(
                            safeNum(bnplBreakdown.breakdown?.downpayment_now, 0)
                          )}
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total (BNPL)</span>
                        <span className="font-semibold">
                          {formatNGN(
                            safeNum(bnplBreakdown.breakdown?.total_amount, 0)
                          )}
                        </span>
                      </div>

                      <Separator />

                      <div className="space-y-2 max-h-48 overflow-auto pr-1">
                        {(bnplBreakdown.breakdown?.installments || []).map(
                          (inst: any) => (
                            <div
                              key={inst.index}
                              className="flex justify-between text-xs p-2 border rounded-md"
                            >
                              <span className="text-muted-foreground">
                                #{inst.index} • {formatDate(inst.due_at)}
                                {inst.capture_immediately ? " (today)" : ""}
                              </span>
                              <span className="font-semibold">
                                {formatNGN(safeNum(inst.amount_due, 0))}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ✅ Hide Place Order / Pay when not authenticated */}
              {isAuthed ? (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleSubmit as any}
                  disabled={
                    uiLocked ||
                    !canRequestOrPlace ||
                    (isBnplCheckout &&
                      (bnplLoading || !bnplBreakdown?.eligible))
                  }
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
              ) : (
                <Button className="w-full" size="lg" onClick={requireAuth}>
                  Log in to place order
                </Button>
              )}

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

// texagon_academy/texagonui/components/store/product-detail.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Star, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/providers/CartProvider";
import { useRouter } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { useSession } from "next-auth/react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

type CartItem = any;

type ProductImage = {
  id?: string;
  url: string;
  alt_text?: string;
  sort_order?: number;
};

type ProductReview = {
  id?: string;
  rating: number;
  title?: string;
  body?: string;
  user_name?: string;
  created_at?: string;
};

type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  type?: string;
  category?: string;
  rating?: number;
  ratingCount?: number;
  image?: string;
  images?: ProductImage[];
  reviews?: ProductReview[];
  bnplAvailable?: boolean;
  bnpl_enabled?: boolean;
  pay_in_4_amount?: number | string;
  stock?: number; // ✅ add
};

export function ProductDetail({ product }: { product: Product }) {
  const { addToCart, setBuyNowProduct } = useCart();
  const router = useRouter();

  // ✅ AUTH STATE (NextAuth)
  const { data: session, status } = useSession();
  const sessionToken =
    status === "authenticated" &&
    session?.user &&
    "sessionToken" in (session.user as any)
      ? ((session.user as any).sessionToken as string | undefined)
      : undefined;

  const isAuthed = Boolean(sessionToken);

  // ✅ OUT OF STOCK (disable actions)
  const outOfStock = Number(product?.stock ?? 0) <= 0;
  const [bnplOpen, setBnplOpen] = useState(false);
  const [bnplLoading, setBnplLoading] = useState(false);
  const [bnplData, setBnplData] = useState<any>(null);

  const LS_BUYNOW_SNAPSHOT = "buynow_snapshot";

  const gallery = useMemo<ProductImage[]>(() => {
    const imgs = Array.isArray(product?.images) ? product.images : [];
    if (imgs.length > 0) return imgs;

    if (product?.image) {
      return [{ url: product.image, alt_text: product.name }];
    }
    return [{ url: "/placeholder.svg", alt_text: product?.name || "Product" }];
  }, [product]);

  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    setActiveImg(0);
  }, [product?.id]);

  const formatPrice = (amount: number | string) => {
    const n = typeof amount === "string" ? Number(amount) : amount;
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  };

  // ✅ Map Product -> CartItem (matches your CartProvider expectations)
  const toCartItem = (p: Product, quantity = 1): CartItem => {
    const unit = Number(p.price ?? 0);

    return {
      id: p.id, // ✅ important (your UI uses item.id sometimes)
      product_id: p.id, // ✅ backend uses this
      title: p.name, // ✅ UI uses title
      price: String(unit), // ✅ IMPORTANT: checkout totals use item.price
      quantity,
      line_total: String(unit * quantity),
      image: p.image,
      bnpl_enabled: Boolean(p.bnplAvailable ?? p.bnpl_enabled),
    } as CartItem;
  };

  // ✅ Where to send unauthenticated users
  const requireAuth = () => {
    toast.error("Please log in to continue.");
    router.push("/login");
  };

  const handleAddToCart = () => {
    if (outOfStock) return toast.error("Out of stock");
    if (!isAuthed) return requireAuth();
    addToCart(toCartItem(product, 1));
    toast.success("Added to cart");
  };

  const handleBuyNow = () => {
    if (outOfStock) return toast.error("Out of stock");
    if (!isAuthed) return requireAuth();

    // optional for UI (so summary can show immediately)
    setBuyNowProduct(toCartItem(product, 1));

    const pid = product.id;
    const qty = 1;

    // persist fallback for refresh
    try {
      localStorage.setItem("buynow_last_product_id", String(pid));
      localStorage.setItem("buynow_last_qty", String(qty));
    } catch {}

    try {
      localStorage.setItem("buynow_last_product_id", String(pid));
      localStorage.setItem("buynow_last_qty", String(qty));

      // ✅ snapshot for rendering summary on refresh
      localStorage.setItem(
        LS_BUYNOW_SNAPSHOT,
        JSON.stringify({
          product_id: pid,
          title: product.name,
          price: product.price,
          image: product.image,
          bnpl_enabled: Boolean(product.bnplAvailable ?? product.bnpl_enabled),
        })
      );
    } catch {}

    router.push(
      `/store/checkout?mode=buynow&product_id=${encodeURIComponent(
        pid
      )}&qty=${qty}`
    );
  };

  const fetchBnpl = async () => {
    if (outOfStock) return toast.error("Out of stock");
    if (!isAuthed) return requireAuth();

    try {
      setBnplLoading(true);
      const res = await fetch("/api/store/bnpl/breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: product.id,
          quantity: 1,
        }),
      });

      const data = await res.json();
      setBnplData(data);
      setBnplOpen(true);
    } catch (e: any) {
      toast.error(e?.message || "Could not load BNPL breakdown");
    } finally {
      setBnplLoading(false);
    }
  };

  const payInText = useMemo(() => {
    if (!product?.pay_in_4_amount) return null;
    return `Pay in 4 from ${formatPrice(product.pay_in_4_amount)}`;
  }, [product, formatPrice]);

  const rating = Number(product?.rating ?? 0);
  const ratingCount = Number(product?.ratingCount ?? 0);
  const reviews = Array.isArray(product?.reviews) ? product.reviews : [];

  return (
    <>
      <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto p-4 md:p-0">
        {/* ✅ Image gallery */}
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-xl shadow-md">
            <img
              src={gallery[activeImg]?.url || "/placeholder.svg"}
              alt={gallery[activeImg]?.alt_text || product.name}
              className={`w-full h-[400px] md:h-[500px] object-cover transition-transform duration-300 ${
                outOfStock ? "blur-[2px] opacity-75" : "hover:scale-105"
              }`}
            />

            {/* ✅ OUT OF STOCK overlay */}
            {outOfStock && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="rounded-md bg-black/70 px-4 py-2 text-sm font-semibold text-white">
                  Out of stock
                </span>
              </div>
            )}
          </div>

          {gallery.length > 1 && (
            <div className="flex gap-2 overflow-auto pr-1">
              {gallery.map((img, idx) => (
                <button
                  key={img.id || img.url || idx}
                  onClick={() => setActiveImg(idx)}
                  type="button"
                  className={`border rounded-md overflow-hidden w-16 h-16 shrink-0 ${
                    idx === activeImg ? "ring-2 ring-primary" : ""
                  }`}
                  aria-label={`View image ${idx + 1}`}
                >
                  <img
                    src={img.url}
                    alt={img.alt_text || product.name}
                    className={`w-full h-full object-cover ${
                      outOfStock ? "opacity-75" : ""
                    }`}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ✅ Product info */}
        <div className="space-y-6">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            {product.name}
          </h1>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                className={
                  i < Math.floor(rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }
              />
            ))}
            <span>({ratingCount} reviews)</span>
          </div>

          <p className="text-3xl font-bold text-primary">
            {formatPrice(product.price)}
          </p>

          {/* ✅ Stock text */}
          <div
            className={`text-sm font-medium ${
              outOfStock ? "text-red-600" : "text-muted-foreground"
            }`}
          >
            {outOfStock
              ? "Out of stock"
              : `${Number(product.stock ?? 0)} in stock`}
          </div>

          {product.description && (
            <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              <p className="text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* ✅ Actions */}
          {isAuthed ? (
            <>
              <div className="flex gap-4 flex-wrap">
                <Button
                  onClick={handleAddToCart}
                  size="lg"
                  disabled={outOfStock}
                  className={outOfStock ? "opacity-60 cursor-not-allowed" : ""}
                  title={outOfStock ? "Out of stock" : undefined}
                >
                  Add to Cart
                </Button>

                <Button
                  onClick={handleBuyNow}
                  variant="outline"
                  size="lg"
                  disabled={outOfStock}
                  className={outOfStock ? "opacity-60 cursor-not-allowed" : ""}
                  title={outOfStock ? "Out of stock" : undefined}
                >
                  Buy Now
                </Button>

                {Boolean(product.bnplAvailable) && (
                  <Button
                    onClick={fetchBnpl}
                    variant="secondary"
                    size="lg"
                    disabled={bnplLoading || outOfStock}
                    className={`gap-2 ${
                      outOfStock ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                    title={outOfStock ? "Out of stock" : undefined}
                  >
                    <Wallet className="h-4 w-4" />
                    {bnplLoading ? "Loading BNPL..." : "Pay with BNPL"}
                  </Button>
                )}
              </div>

              {Boolean(product.bnplAvailable) && (
                <div className="text-sm text-muted-foreground">
                  <Badge variant="secondary" className="mr-2">
                    BNPL
                  </Badge>
                  {payInText || "Buy now, pay later available"}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                Log in to add items to cart, buy now, or use BNPL.
              </div>
              <Button onClick={() => router.push("/login")} size="lg">
                Log in to continue
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Reviews */}
      <div className="max-w-6xl mx-auto mt-10 p-4 md:p-0">
        <h2 className="text-xl font-bold mb-4">Reviews</h2>

        {reviews.length === 0 ? (
          <div className="text-muted-foreground text-sm">No reviews yet.</div>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div
                key={r.id || `${r.user_name}-${r.created_at}`}
                className="border rounded-lg p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold">{r.title || "Review"}</div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={
                          i < Math.floor(Number(r.rating ?? 0))
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }
                      />
                    ))}
                  </div>
                </div>

                <div className="text-sm text-muted-foreground mt-1">
                  {r.user_name || "Anonymous"}
                  {r.created_at
                    ? ` • ${new Date(r.created_at).toLocaleDateString()}`
                    : ""}
                </div>

                {r.body && (
                  <p className="mt-2 text-sm leading-relaxed">{r.body}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ✅ BNPL Modal */}
      <Dialog open={bnplOpen} onOpenChange={setBnplOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>BNPL Breakdown</DialogTitle>
            <DialogDescription>
              See your installment schedule before checkout.
            </DialogDescription>
          </DialogHeader>

          {!bnplData ? null : (
            <div className="space-y-3">
              {!bnplData.eligible && (
                <div className="p-3 rounded-md border text-sm">
                  <div className="font-semibold">Not eligible</div>
                  <div className="text-muted-foreground">{bnplData.reason}</div>
                </div>
              )}

              <div className="p-3 rounded-md border space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="font-medium">
                    {bnplData.plan?.name} ({bnplData.plan?.num_installments}x)
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Downpayment now</span>
                  <span className="font-semibold">
                    {formatPrice(bnplData.breakdown?.downpayment_now)}
                  </span>
                </div>

                <Separator />

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-bold">
                    {formatPrice(bnplData.breakdown?.total_amount)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-semibold">Installments</div>
                <div className="space-y-2 max-h-52 overflow-auto pr-1">
                  {(bnplData.breakdown?.installments || []).map((inst: any) => (
                    <div
                      key={inst.index}
                      className="flex items-center justify-between text-sm p-2 rounded-md border"
                    >
                      <span className="text-muted-foreground">
                        #{inst.index} •{" "}
                        {new Date(inst.due_at).toLocaleDateString()}
                        {inst.capture_immediately ? " (today)" : ""}
                      </span>
                      <span className="font-semibold">
                        {formatPrice(inst.amount_due)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                className="w-full"
                onClick={() => {
                  if (outOfStock) return toast.error("Out of stock");
                  if (!isAuthed) return requireAuth();

                  setBnplOpen(false);

                  const pid = product.id;
                  const qty = 1;

                  try {
                    localStorage.setItem("bnpl_last_product_id", String(pid));
                    localStorage.setItem("bnpl_last_qty", String(qty));
                  } catch {}

                  // ✅ use query params as source of truth
                  setBuyNowProduct(null);

                  router.push(
                    `/store/checkout?pay=bnpl&product_id=${encodeURIComponent(
                      pid
                    )}&qty=${qty}`
                  );
                }}
                disabled={!bnplData.eligible || outOfStock}
              >
                Continue with BNPL
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => router.push("/store?tab=cart")}
          className="rounded-full shadow-lg"
          size="lg"
        >
          Cart
        </Button>
      </div>
    </>
  );
}

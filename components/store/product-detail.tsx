"use client";

import { Button } from "@/components/ui/button";
import { Star, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/providers/CartProvider";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export function ProductDetail({ product }: { product: any }) {
  const { addToCart, setBuyNowProduct } = useCart();
  const router = useRouter();

  const [bnplOpen, setBnplOpen] = useState(false);
  const [bnplLoading, setBnplLoading] = useState(false);
  const [bnplData, setBnplData] = useState<any>(null);

  const handleAddToCart = () => {
    addToCart(product);
    toast.success("Added to cart");
  };

  const handleBuyNow = () => {
    setBuyNowProduct({ ...product, quantity: 1 });
    router.push("/store/checkout");
  };

  const formatPrice = (amount: number | string) => {
    const n = typeof amount === "string" ? Number(amount) : amount;
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  };

  const fetchBnpl = async () => {
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
  }, [product]);

  return (
    <>
      <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto p-4 md:p-0">
        <div className="relative overflow-hidden rounded-xl shadow-md">
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-[400px] md:h-[500px] object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>

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
                  i < Math.floor(product.rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }
              />
            ))}
            <span>({product.reviews} reviews)</span>
          </div>

          <p className="text-3xl font-bold text-primary">
            {formatPrice(product.price)}
          </p>

          <p className="text-base text-muted-foreground leading-relaxed">
            {product.description}
          </p>

          <div className="flex gap-4 flex-wrap">
            <Button onClick={handleAddToCart} size="lg">
              Add to Cart
            </Button>
            <Button onClick={handleBuyNow} variant="outline" size="lg">
              Buy Now
            </Button>

            {/* ✅ BNPL Button */}
            {product.bnplAvailable && (
              <Button
                onClick={fetchBnpl}
                variant="secondary"
                size="lg"
                disabled={bnplLoading}
                className="gap-2"
              >
                <Wallet className="h-4 w-4" />
                {bnplLoading ? "Loading BNPL..." : "Pay with BNPL"}
              </Button>
            )}
          </div>

          {product.bnplAvailable && (
            <div className="text-sm text-muted-foreground">
              <Badge variant="secondary" className="mr-2">BNPL</Badge>
              {payInText || "Buy now, pay later available"}
            </div>
          )}
        </div>
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
                        #{inst.index} • {new Date(inst.due_at).toLocaleDateString()}
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
                  setBnplOpen(false);
                  setBuyNowProduct({ ...product, quantity: 1, payMethod: "bnpl" });
                  router.push("/store/checkout?pay=bnpl");
                }}
                disabled={!bnplData.eligible}
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

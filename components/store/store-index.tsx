// texagon_academy\texagonui\components\store\store-index.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductCatalog } from "@/components/store/product-catalog";
import { ShoppingCart } from "@/components/store/shopping-cart";
import { OrderManagement } from "@/components/store/order-management";
import { useCart } from "@/providers/CartProvider";
import { Loader2 } from "lucide-react";

function TabLoader() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
      <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Loading…</p>
    </div>
  );
}

export function StorePageIndex() {
  const searchParams = useSearchParams();
  const initialTab = useMemo(
    () => searchParams.get("tab") || "catalog",
    [searchParams]
  );

  const { getTotalItems } = useCart();

  // ✅ Controlled tab (so we can detect tab changes)
  const [tab, setTab] = useState(initialTab);

  // ✅ Per-tab "page load" loading (catalog/cart/orders)
  const [loadingTab, setLoadingTab] = useState<string | null>(initialTab);

  // When URL ?tab changes (or first mount), sync state and trigger loader
  useEffect(() => {
    setTab(initialTab);
    setLoadingTab(initialTab);

    const t = window.setTimeout(() => setLoadingTab(null), 350);
    return () => window.clearTimeout(t);
  }, [initialTab]);

  // When user clicks a different tab, show loader briefly
  const handleTabChange = (next: string) => {
    setTab(next);
    setLoadingTab(next);

    // small UX delay so spinner is visible even when content is fast
    window.setTimeout(() => setLoadingTab(null), 350);
  };

  const isLoadingThisTab = (value: string) =>
    loadingTab !== null && loadingTab === value;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Tabs value={tab} onValueChange={handleTabChange} className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="catalog">Store</TabsTrigger>
            <TabsTrigger value="cart">Cart ({getTotalItems()})</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="catalog">
            {isLoadingThisTab("catalog") ? <TabLoader /> : <ProductCatalog />}
          </TabsContent>

          <TabsContent value="cart">
            {isLoadingThisTab("cart") ? <TabLoader /> : <ShoppingCart />}
          </TabsContent>

          <TabsContent value="orders">
            {isLoadingThisTab("orders") ? <TabLoader /> : <OrderManagement />}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

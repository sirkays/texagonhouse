// texagon_academy\texagonui\components\store\store-index.tsx
"use client";

import { useEffect, useMemo, useState, lazy, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/providers/CartProvider";
import {
  Loader2,
  ShoppingBag,
  Store,
  ShoppingCart as CartIcon,
  Package,
  Sparkles,
} from "lucide-react";

const LazyProductCatalog = lazy(() =>
  import("@/components/store/product-catalog").then((module) => ({
    default: module.ProductCatalog,
  }))
);
const LazyShoppingCart = lazy(() =>
  import("@/components/store/shopping-cart").then((module) => ({
    default: module.ShoppingCart,
  }))
);
const LazyOrderManagement = lazy(() =>
  import("@/components/store/order-management").then((module) => ({
    default: module.OrderManagement,
  }))
);

/* ─── Skeleton loader ─── */
function TabLoader() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400 to-amber-500 blur-xl opacity-30 animate-pulse" />
        <Loader2 className="relative h-10 w-10 animate-spin text-orange-500" />
      </div>
      <p className="text-sm font-medium text-muted-foreground tracking-wide">
        Loading…
      </p>
    </div>
  );
}

/* ─── Tab definitions ─── */
const TABS = [
  { value: "catalog", label: "Store", icon: Store },
  { value: "cart", label: "Cart", icon: CartIcon },
  { value: "orders", label: "Orders", icon: Package },
] as const;

export function StorePageIndex() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const initialTab = useMemo(
    () => searchParams.get("tab") || "catalog",
    [searchParams]
  );

  const { getTotalItems } = useCart();
  const [tab, setTab] = useState(initialTab);

  useEffect(() => {
    if (initialTab !== tab) {
      setTab(initialTab);
    }
  }, [initialTab, tab]);

  const handleTabChange = (next: string) => {
    setTab(next);
    router.replace(`${pathname}?tab=${next}`, { scroll: false });
  };

  const totalItems = getTotalItems();

  return (
    <div className="min-h-screen bg-background">
      {/* ─── Hero / Header ─── */}
      <div className="relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/8 via-amber-500/5 to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-orange-400/10 to-transparent rounded-full blur-3xl pointer-events-none translate-x-1/3 -translate-y-1/3" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
          {/* Title area */}
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center h-11 w-11 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg shadow-orange-500/20">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Texagon Store
              </h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Premium gadgets & accessories
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Tab navigation ─── */}
      <div className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1" aria-label="Store sections">
            {TABS.map((t) => {
              const isActive = tab === t.value;
              const Icon = t.icon;

              return (
                <button
                  key={t.value}
                  onClick={() => handleTabChange(t.value)}
                  className={`
                    relative group flex items-center gap-2 px-4 py-3 text-sm font-medium
                    transition-colors duration-200 border-b-2
                    ${
                      isActive
                        ? "border-orange-500 text-orange-600"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                    }
                  `}
                >
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      isActive
                        ? "text-orange-500"
                        : "text-muted-foreground group-hover:text-foreground"
                    }`}
                  />
                  <span>{t.label}</span>

                  {/* Cart badge */}
                  {t.value === "cart" && totalItems > 0 && (
                    <span
                      className={`
                        inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold
                        ${
                          isActive
                            ? "bg-orange-500 text-white"
                            : "bg-orange-500/15 text-orange-600"
                        }
                        transition-all duration-300
                      `}
                    >
                      {totalItems}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ─── Tab content ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {tab === "catalog" && (
          <Suspense fallback={<TabLoader />}>
            <LazyProductCatalog />
          </Suspense>
        )}
        {tab === "cart" && (
          <Suspense fallback={<TabLoader />}>
            <LazyShoppingCart />
          </Suspense>
        )}
        {tab === "orders" && (
          <Suspense fallback={<TabLoader />}>
            <LazyOrderManagement />
          </Suspense>
        )}
      </div>
    </div>
  );
}

// components/store/store-index.tsx
"use client";

import {useSearchParams} from "next/navigation";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {ProductCatalog} from "@/components/store/product-catalog";
import {ShoppingCart} from "@/components/store/shopping-cart";
import {OrderManagement} from "@/components/store/order-management";
import {useCart} from "@/providers/CartProvider";

export function StorePageIndex() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "catalog";

  const {getTotalItems} = useCart();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue={initialTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="catalog">Store</TabsTrigger>
            <TabsTrigger value="cart">Cart ({getTotalItems()})</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="catalog">
            <ProductCatalog />
          </TabsContent>

          <TabsContent value="cart">
            <ShoppingCart />
          </TabsContent>

          <TabsContent value="orders">
            <OrderManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

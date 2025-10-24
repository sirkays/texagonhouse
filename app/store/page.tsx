"use client";

import {useState} from "react";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {ProductCatalogAPI} from "@/components/store/product-catalog-api";
import {ShoppingCartAPI} from "@/components/store/shopping-cart-api";
import {OrderManagementAPI} from "@/components/store/order-management-api";
import {useCart} from "@/lib/hooks/use-cart";

export default function StorePage() {
  const [activeTab, setActiveTab] = useState("catalog");
  const {cart} = useCart();

  const cartItemCount = cart?.items?.length || 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Educational Store</h1>
          <p className="text-muted-foreground mt-2">
            Discover courses, books, and tools to accelerate your learning
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="catalog">Store</TabsTrigger>
            <TabsTrigger value="cart">Cart ({cartItemCount})</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="catalog" className="space-y-6">
            <ProductCatalogAPI />
          </TabsContent>

          <TabsContent value="cart" className="space-y-6">
            <ShoppingCartAPI />
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <OrderManagementAPI />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductCatalog } from "@/components/store/product-catalog"
import { ShoppingCart } from "@/components/store/shopping-cart"
import { OrderManagement } from "@/components/store/order-management"

export default function StorePage() {
  const [activeTab, setActiveTab] = useState("catalog")

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="catalog">Store</TabsTrigger>
            <TabsTrigger value="cart">Cart</TabsTrigger>
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
  )
}

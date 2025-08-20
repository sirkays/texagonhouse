"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SubscriptionPlans } from "@/components/subscription/subscription-plans"
import { BillingManagement } from "@/components/subscription/billing-management"

export default function SubscriptionPage() {
  const [activeTab, setActiveTab] = useState("plans")

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
            <TabsTrigger value="billing">Billing Management</TabsTrigger>
          </TabsList>

          <TabsContent value="plans">
            <SubscriptionPlans />
          </TabsContent>

          <TabsContent value="billing">
            <BillingManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

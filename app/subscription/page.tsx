"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SubscriptionPlans } from "@/components/subscription/subscription-plans"
import { BillingManagement } from "@/components/subscription/billing-management"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

const API_BASE = "/api/billing"

export default function SubscriptionPage() {
  const [activeTab, setActiveTab] = useState("plans")
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState(null)

  useEffect(() => {
    const confirmPayment = async () => {
      const status = searchParams.get("status")
      const txRef = searchParams.get("tx_ref")
      const transactionId = searchParams.get("transaction_id")
      const invoiceId = localStorage.getItem("pendingInvoiceId") // Retrieve stored invoice_id

      if (status && txRef && transactionId && invoiceId) {
        if (status === "successful") {
          try {
            const response = await fetch(`${API_BASE}?action=confirm`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                invoice_id: invoiceId,
                tx_ref: txRef,
                transaction_id: transactionId,
              }),
            })
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`)
            }
            const data = await response.json()
            if (data.status === "success") {
              console.log("[SubscriptionPage] Payment confirmed successfully")
              localStorage.removeItem("pendingInvoiceId") // Clear stored invoice_id
              // Redirect to confirmation page with success status
              router.push("/subscription/confirmation?status=success")
            } else {
              setError("Payment confirmation failed")
              console.error("[SubscriptionPage] Payment confirmation failed:", data)
              router.push("/subscription/confirmation?status=error")
            }
          } catch (error) {
            setError("Failed to confirm payment")
            console.error("[SubscriptionPage] Failed to confirm payment:", error)
            router.push("/subscription/confirmation?status=error")
          }
        } else {
          setError("Payment was not successful")
          console.error("[SubscriptionPage] Payment status:", status)
          router.push("/subscription/confirmation?status=error")
        }
      }
    }

    confirmPayment()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
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
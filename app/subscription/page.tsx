"use client";

import {useState, useEffect} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {Suspense} from "react";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {SubscriptionPlans} from "@/components/subscription/subscription-plans";
import {BillingManagement} from "@/components/subscription/billing-management";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {CheckCircle, AlertTriangle, X} from "lucide-react";
import {Spinner} from "@/components/ui/spinner";

// Force dynamic rendering to avoid SSG prerendering issues
export const dynamic = "force-dynamic";

const API_BASE = "/api/billing";

function SubscriptionContent() {
  const [activeTab, setActiveTab] = useState("plans");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState(null);
  const [confirmationStatus, setConfirmationStatus] = useState(null); // null, "success", or "error"
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [isConfirming, setIsConfirming] = useState(false); // Track POST confirmation loading

  useEffect(() => {
    const confirmPayment = async () => {
      const status = searchParams.get("status");
      const txRef = searchParams.get("tx_ref");
      const transactionId = searchParams.get("transaction_id");
      const invoiceId = searchParams.get("invoice_id");

      if (status && txRef && transactionId && invoiceId) {
        setIsConfirming(true);
        try {
          const response = await fetch(`${API_BASE}?action=confirm`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              invoice_id: invoiceId,
              tx_ref: txRef,
              transaction_id: transactionId,
            }),
          });

          const data = await response.json().catch(() => ({}));

          if (data.status === "cancelled") {
            setConfirmationStatus("error");
            setConfirmationMessage("Payment was cancelled.");
          } else {
            // Treat all non-cancelled outcomes as success from the user's perspective.
            // If Flutterwave's verify API hasn't settled yet (pending race condition),
            // the webhook will confirm the payment automatically within seconds.
            setConfirmationStatus("success");
            setConfirmationMessage(
              "Your payment has been received and is being confirmed. Thank you!"
            );
          }
        } catch (error) {
          // Network error — webhook will still confirm; show positive feedback
          setConfirmationStatus("success");
          setConfirmationMessage(
            "Your payment has been received and is being confirmed. Thank you!"
          );
          console.error("[SubscriptionPage] confirmPayment network error:", error);
        } finally {
          setIsConfirming(false);
          router.replace("/subscription");
        }
      }
    };

    confirmPayment();
  }, [searchParams, router]);


  const closeConfirmationModal = () => {
    setConfirmationStatus(null);
    setConfirmationMessage("");
  };

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
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-8">
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

        {isConfirming && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Spinner size="lg" />
          </div>
        )}

        {confirmationStatus && !isConfirming && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader className="flex justify-between items-center">
                <CardTitle>Payment Confirmation</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeConfirmationModal}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert
                  variant={
                    confirmationStatus === "success" ? "success" : "destructive"
                  }>
                  {confirmationStatus === "success" ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                  <AlertTitle>
                    {confirmationStatus === "success"
                      ? "Payment Successful"
                      : "Payment Failed"}
                  </AlertTitle>
                  <AlertDescription>{confirmationMessage}</AlertDescription>
                </Alert>
                <Button className="w-full" onClick={closeConfirmationModal}>
                  Close
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SubscriptionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          Loading...
        </div>
      }>
      <SubscriptionContent />
    </Suspense>
  );
}

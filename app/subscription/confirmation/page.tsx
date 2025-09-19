"use client"

import { useSearchParams } from "next/navigation"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertTriangle } from "lucide-react"

export default function ConfirmationPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const status = searchParams.get("status")

  const handleBackToBilling = () => {
    router.push("/subscription")
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Payment Confirmation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "success" ? (
            <Alert variant="success">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Payment Successful</AlertTitle>
              <AlertDescription>
                Your payment has been successfully processed. Thank you for your subscription!
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Payment Failed</AlertTitle>
              <AlertDescription>
                There was an issue processing your payment. Please try again or contact support.
              </AlertDescription>
            </Alert>
          )}
          <Button className="w-full" onClick={handleBackToBilling}>
            Back to Billing
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
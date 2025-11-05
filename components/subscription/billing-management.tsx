"use client"

import React from "react" // Added to fix JSX parsing
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import {
  CreditCard,
  Download,
  Calendar,
  Settings,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  AlertTriangle,
} from "lucide-react"

const API_BASE = "/api/billing"

export function BillingManagement() {
  const [currentPlan] = useState({
    name: "Premium",
    price: 19.99,
    billingCycle: "monthly",
    nextBilling: "2024-02-15",
    status: "active",
  })

  const [paymentMethods] = useState([
    {
      id: 1,
      type: "card",
      brand: "Visa",
      last4: "4242",
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true,
    },
    {
      id: 2,
      type: "card",
      brand: "Mastercard",
      last4: "8888",
      expiryMonth: 8,
      expiryYear: 2026,
      isDefault: false,
    },
  ])

  const [billingHistory, setBillingHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [payLoading, setPayLoading] = useState({}) // Track loading state for each invoice

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    setLoading(true)
    try {
      const response = await fetch(API_BASE)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setBillingHistory(data.results.map(invoice => ({
        id: invoice.number,
        date: invoice.issued_at.split('T')[0],
        amount: parseFloat(invoice.amount),
        status: invoice.status,
        description: "Subscription Invoice",
        downloadUrl: "#",
      })))
    } catch (error) {
      console.error("[BillingManagement] Failed to fetch invoices:", error)
      setError("Failed to fetch invoices")
    }
    setLoading(false)
  }

  const handlePayInvoice = async (invoiceId) => {
    setPayLoading(prev => ({ ...prev, [invoiceId]: true }))
    try {
      const response = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoice_id: invoiceId,
          redirect_url: `https://texagon.epichouse.online/subscription?invoice_id=${encodeURIComponent(invoiceId)}`,
        }),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      if (data.payment_link) {
        window.location.href = data.payment_link
      } else {
        console.error("[BillingManagement] No payment link received:", data)
        setError("Failed to create payment link")
      }
    } catch (error) {
      console.error("[BillingManagement] Failed to create payment:", error)
      setError("Failed to create payment")
    } finally {
      setPayLoading(prev => ({ ...prev, [invoiceId]: false }))
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
      case "open":
        return "bg-yellow-100 text-yellow-700"
      case "paid":
        return "bg-green-100 text-green-700"
      case "void":
      case "uncollectible":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
      case "open":
        return <Clock className="h-4 w-4" />
      case "paid":
        return <CheckCircle className="h-4 w-4" />
      case "void":
      case "uncollectible":
        return <AlertCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing & Subscription</h1>
        <p className="text-muted-foreground">Manage your subscription and billing information</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Current Subscription</CardTitle>
          <CardDescription>Your active plan and billing information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Plan</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{currentPlan.name}</span>
                  <Badge className={getStatusColor(currentPlan.status)}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(currentPlan.status)}
                      {currentPlan.status}
                    </div>
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Price</span>
                <span className="font-semibold">
                  ₦{currentPlan.price}/{currentPlan.billingCycle}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Next Billing</span>
                <span className="font-semibold">{currentPlan.nextBilling}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Button className="w-full">
                <Settings className="mr-2 h-4 w-4" />
                Change Plan
              </Button>
              <Button variant="outline" className="w-full bg-transparent">
                <Calendar className="mr-2 h-4 w-4" />
                Pause Subscription
              </Button>
              <Button variant="destructive" className="w-full">
                Cancel Subscription
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="payment-methods" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="billing-history">Billing History</TabsTrigger>
          <TabsTrigger value="usage">Usage & Limits</TabsTrigger>
        </TabsList>

        <TabsContent value="payment-methods" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Manage your payment methods</CardDescription>
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Payment Method
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {method.brand} •••• {method.last4}
                        </span>
                        {method.isDefault && <Badge variant="secondary">Default</Badge>}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Expires {method.expiryMonth}/{method.expiryYear}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add New Payment Method</CardTitle>
              <CardDescription>Add a credit or debit card</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="card-number">Card Number</Label>
                  <Input id="card-number" placeholder="1234 5678 9012 3456" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="card-name">Cardholder Name</Label>
                  <Input id="card-name" placeholder="John Doe" />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="expiry-month">Expiry Month</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i + 1} value={String(i + 1).padStart(2, "0")}>
                          {String(i + 1).padStart(2, "0")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiry-year">Expiry Year</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => (
                        <SelectItem key={2024 + i} value={String(2024 + i)}>
                          {2024 + i}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input id="cvv" placeholder="123" />
                </div>
              </div>
              <Button className="w-full">Add Payment Method</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing-history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>View and download your invoices</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Spinner size="md" />
                </div>
              ) : (
                <div className="space-y-4">
                  {billingHistory.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{invoice.description}</span>
                          <Badge className={getStatusColor(invoice.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(invoice.status)}
                              {invoice.status}
                            </div>
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{invoice.date}</span>
                          <span>Invoice #{invoice.id}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold">₦{invoice.amount}</span>
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-3 w-3" />
                          Download
                        </Button>
                        {["active", "open"].includes(invoice.status) && (
                          <Button
                            size="sm"
                            onClick={() => handlePayInvoice(invoice.id)}
                            disabled={payLoading[invoice.id]}
                          >
                            {payLoading[invoice.id] ? (
                              <Spinner size="sm" className="mr-2" />
                            ) : (
                              "Pay Now"
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Current Usage</CardTitle>
                <CardDescription>Your usage for this billing period</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Courses Accessed</span>
                    <span>45 / 500</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: "9%" }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Storage Used</span>
                    <span>12.5 GB / 50 GB</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: "25%" }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Mentorship Hours</span>
                    <span>1.5 / 2 hours</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: "75%" }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Plan Limits</CardTitle>
                <CardDescription>What's included in your Premium plan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Course Access</span>
                  <span className="text-sm font-medium">500+ courses</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Storage</span>
                  <span className="text-sm font-medium">50 GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Video Quality</span>
                  <span className="text-sm font-medium">HD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Offline Downloads</span>
                  <span className="text-sm font-medium">✅ Included</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Mentorship</span>
                  <span className="text-sm font-medium">2 hours/month</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Support</span>
                  <span className="text-sm font-medium">Priority</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
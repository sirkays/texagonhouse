"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreditCard, Wallet, Building2, Clock, CheckCircle, Zap, Shield } from "lucide-react"

interface PaymentMethod {
  id: string
  type: "card" | "bank" | "wallet" | "bnpl"
  name: string
  details: string
  icon: React.ReactNode
  isDefault: boolean
  isAvailable: boolean
}

interface TutoringPackage {
  id: string
  name: string
  sessions: number
  duration: number
  price: number
  originalPrice?: number
  features: string[]
  popular?: boolean
  savings?: string
}

export function PaymentIntegration() {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const paymentMethods: PaymentMethod[] = [
    {
      id: "card",
      type: "card",
      name: "Credit/Debit Card",
      details: "Visa, Mastercard, Verve",
      icon: <CreditCard className="h-5 w-5" />,
      isDefault: true,
      isAvailable: true,
    },
    {
      id: "bank",
      type: "bank",
      name: "Bank Transfer",
      details: "Direct bank transfer",
      icon: <Building2 className="h-5 w-5" />,
      isDefault: false,
      isAvailable: true,
    },
    {
      id: "wallet",
      type: "wallet",
      name: "Digital Wallet",
      details: "Paystack, Flutterwave",
      icon: <Wallet className="h-5 w-5" />,
      isDefault: false,
      isAvailable: true,
    },
    {
      id: "bnpl",
      type: "bnpl",
      name: "Buy Now Pay Later",
      details: "Split into 3-6 installments",
      icon: <Clock className="h-5 w-5" />,
      isDefault: false,
      isAvailable: true,
    },
  ]

  const tutoringPackages: TutoringPackage[] = [
    {
      id: "single",
      name: "Single Session",
      sessions: 1,
      duration: 60,
      price: 8000,
      features: [
        "1-hour one-on-one session",
        "HD video calling",
        "Session recording",
        "Digital materials",
        "Progress report",
      ],
    },
    {
      id: "basic",
      name: "Basic Package",
      sessions: 4,
      duration: 60,
      price: 28000,
      originalPrice: 32000,
      savings: "Save ₦4,000",
      features: [
        "4 one-on-one sessions",
        "HD video calling",
        "Session recordings",
        "Digital materials",
        "Progress tracking",
        "Email support",
      ],
    },
    {
      id: "premium",
      name: "Premium Package",
      sessions: 8,
      duration: 60,
      price: 52000,
      originalPrice: 64000,
      savings: "Save ₦12,000",
      popular: true,
      features: [
        "8 one-on-one sessions",
        "HD video calling",
        "Session recordings",
        "Digital materials",
        "Progress tracking",
        "Priority support",
        "Flexible scheduling",
        "Homework assistance",
      ],
    },
    {
      id: "intensive",
      name: "Intensive Package",
      sessions: 12,
      duration: 90,
      price: 96000,
      originalPrice: 144000,
      savings: "Save ₦48,000",
      features: [
        "12 intensive sessions (90min each)",
        "HD video calling",
        "Session recordings",
        "Digital materials",
        "Progress tracking",
        "24/7 support",
        "Flexible scheduling",
        "Homework assistance",
        "Exam preparation",
        "Performance analytics",
      ],
    },
  ]

  const handlePayment = async () => {
    if (!selectedPackage || !selectedPaymentMethod) return

    setIsProcessing(true)

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      alert("Payment successful! Your tutoring sessions have been booked.")
    }, 3000)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Tutoring Packages & Payment</h1>
          <p className="text-muted-foreground">Choose your tutoring package and secure payment method</p>
        </div>
      </div>

      <Tabs defaultValue="packages" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="packages">Tutoring Packages</TabsTrigger>
          <TabsTrigger value="payment">Payment Methods</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="packages" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {tutoringPackages.map((pkg) => (
              <Card
                key={pkg.id}
                className={`relative cursor-pointer transition-all hover:shadow-lg ${
                  selectedPackage === pkg.id ? "ring-2 ring-primary" : ""
                } ${pkg.popular ? "border-primary" : ""}`}
                onClick={() => setSelectedPackage(pkg.id)}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      <Zap className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center">
                  <CardTitle className="text-xl">{pkg.name}</CardTitle>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-primary">{formatPrice(pkg.price)}</div>
                    {pkg.originalPrice && (
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground line-through">
                          {formatPrice(pkg.originalPrice)}
                        </div>
                        <Badge variant="secondary" className="text-green-600">
                          {pkg.savings}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardDescription>
                    {pkg.sessions} session{pkg.sessions > 1 ? "s" : ""} • {pkg.duration} min each
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-4">
                    <Button
                      className={`w-full ${selectedPackage === pkg.id ? "bg-primary" : ""}`}
                      variant={selectedPackage === pkg.id ? "default" : "outline"}
                    >
                      {selectedPackage === pkg.id ? "Selected" : "Select Package"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedPackage && (
            <Card>
              <CardHeader>
                <CardTitle>Package Summary</CardTitle>
                <CardDescription>Review your selected tutoring package</CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
                  const pkg = tutoringPackages.find((p) => p.id === selectedPackage)
                  if (!pkg) return null

                  return (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold">{pkg.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {pkg.sessions} sessions • {pkg.duration} minutes each
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">{formatPrice(pkg.price)}</div>
                          {pkg.originalPrice && (
                            <div className="text-sm text-muted-foreground line-through">
                              {formatPrice(pkg.originalPrice)}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span>Price per session:</span>
                        <span className="font-medium">{formatPrice(Math.floor(pkg.price / pkg.sessions))}</span>
                      </div>

                      {pkg.savings && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>You save:</span>
                          <span className="font-medium">{pkg.savings}</span>
                        </div>
                      )}

                      <Button
                        className="w-full"
                        onClick={() => {
                          const tabsList = document.querySelector('[role="tablist"]')
                          const paymentTab = tabsList?.querySelector('[value="payment"]') as HTMLElement
                          paymentTab?.click()
                        }}
                      >
                        Proceed to Payment
                      </Button>
                    </div>
                  )
                })()}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Payment Method</CardTitle>
              <CardDescription>Choose your preferred payment method for secure transactions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${
                    selectedPaymentMethod === method.id ? "ring-2 ring-primary bg-muted/30" : ""
                  } ${!method.isAvailable ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={() => method.isAvailable && setSelectedPaymentMethod(method.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">{method.icon}</div>
                      <div>
                        <h4 className="font-medium">{method.name}</h4>
                        <p className="text-sm text-muted-foreground">{method.details}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {method.isDefault && <Badge variant="secondary">Default</Badge>}
                      {!method.isAvailable && <Badge variant="destructive">Unavailable</Badge>}
                      {selectedPaymentMethod === method.id && <CheckCircle className="h-5 w-5 text-primary" />}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {selectedPaymentMethod === "card" && (
            <Card>
              <CardHeader>
                <CardTitle>Card Details</CardTitle>
                <CardDescription>Enter your card information securely</CardDescription>
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
                        <SelectValue placeholder="MM" />
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
                        <SelectValue placeholder="YYYY" />
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
                    <Input id="cvv" placeholder="123" maxLength={4} />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Your payment information is encrypted and secure</span>
                </div>
              </CardContent>
            </Card>
          )}

          {selectedPaymentMethod === "bnpl" && (
            <Card>
              <CardHeader>
                <CardTitle>Buy Now Pay Later</CardTitle>
                <CardDescription>Split your payment into manageable installments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Payment Plan Options:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>3 installments:</span>
                      <span className="font-medium">₦2,667 every 2 weeks</span>
                    </div>
                    <div className="flex justify-between">
                      <span>6 installments:</span>
                      <span className="font-medium">₦1,333 every week</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="installment-plan">Select Installment Plan</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose payment plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 installments - ₦2,667 every 2 weeks</SelectItem>
                      <SelectItem value="6">6 installments - ₦1,333 every week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {selectedPackage && selectedPaymentMethod && (
            <Card>
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
                <CardDescription>Review your order before completing payment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(() => {
                  const pkg = tutoringPackages.find((p) => p.id === selectedPackage)
                  const method = paymentMethods.find((m) => m.id === selectedPaymentMethod)
                  if (!pkg || !method) return null

                  return (
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Package:</span>
                        <span className="font-medium">{pkg.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sessions:</span>
                        <span className="font-medium">{pkg.sessions} sessions</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Payment Method:</span>
                        <span className="font-medium">{method.name}</span>
                      </div>
                      <div className="border-t pt-4">
                        <div className="flex justify-between text-lg font-bold">
                          <span>Total:</span>
                          <span className="text-primary">{formatPrice(pkg.price)}</span>
                        </div>
                      </div>

                      <Button className="w-full" onClick={handlePayment} disabled={isProcessing}>
                        {isProcessing ? (
                          <>
                            <Clock className="h-4 w-4 mr-2 animate-spin" />
                            Processing Payment...
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-4 w-4 mr-2" />
                            Complete Payment
                          </>
                        )}
                      </Button>

                      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                        <Shield className="h-3 w-3" />
                        <span>256-bit SSL encryption • PCI DSS compliant</span>
                      </div>
                    </div>
                  )
                })()}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>View your tutoring payment transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    id: "PAY-001",
                    date: "2024-01-15",
                    package: "Premium Package",
                    amount: 52000,
                    method: "Credit Card",
                    status: "Completed",
                  },
                  {
                    id: "PAY-002",
                    date: "2024-01-10",
                    package: "Single Session",
                    amount: 8000,
                    method: "Bank Transfer",
                    status: "Completed",
                  },
                  {
                    id: "PAY-003",
                    date: "2024-01-05",
                    package: "Basic Package",
                    amount: 28000,
                    method: "BNPL",
                    status: "Pending",
                  },
                ].map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium">{payment.package}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{payment.date}</span>
                        <span>ID: {payment.id}</span>
                        <span>{payment.method}</span>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="font-medium text-green-600">{formatPrice(payment.amount)}</div>
                      <Badge
                        className={
                          payment.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {payment.status === "Completed" ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <Clock className="w-3 h-3 mr-1" />
                        )}
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

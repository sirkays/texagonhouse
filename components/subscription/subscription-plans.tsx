"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import {
  Check,
  Star,
  Crown,
  Zap,
  BookOpen,
  Shield,
  Download,
  WifiOff,
  Play,
  FileText,
  Users,
  Award,
} from "lucide-react"

export function SubscriptionPlans() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [offlineEnabled, setOfflineEnabled] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [isDownloading, setIsDownloading] = useState(false)

  const plans = [
    {
      id: "basic",
      name: "Basic",
      description: "Perfect for individual learners",
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      monthly: 9.99,
      yearly: 99.99,
      popular: false,
      features: [
        "Access to all semester lessons",
        "Basic progress tracking",
        "Mobile app access",
        "Community forum access",
        "Email support",
        "Certificate of completion",
        "Basic analytics",
        "Standard video quality",
        "Download up to 10 lessons offline",
        "Basic quiz attempts",
        "Term completion certificates",
      ],
      limits: {
        courses: "All Semesters",
        storage: "5GB Offline",
        support: "Email",
        analytics: "Basic",
        offlineDownloads: "10 lessons",
        quizAttempts: "3 per quiz",
      },
    },
    {
      id: "premium",
      name: "Premium",
      description: "Best for serious learners",
      icon: Star,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      monthly: 19.99,
      yearly: 199.99,
      popular: true,
      features: [
        "Unlimited access to all content",
        "Advanced progress tracking",
        "Unlimited offline downloads",
        "Priority community support",
        "Live tutoring sessions (2 hours/month)",
        "Verified certificates",
        "Advanced analytics",
        "HD video quality with DRM protection",
        "Interactive coding labs",
        "Personalized learning paths",
        "Online exam access",
        "Gamification & leaderboards",
        "Weekly quiz competitions",
        "Private tutoring booking",
        "E-commerce store access",
      ],
      limits: {
        courses: "Unlimited",
        storage: "50GB Offline",
        support: "Priority",
        analytics: "Advanced",
        offlineDownloads: "Unlimited",
        quizAttempts: "Unlimited",
      },
    },
    {
      id: "enterprise",
      name: "School Enterprise",
      description: "For schools and organizations",
      icon: Crown,
      color: "text-gold-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      monthly: 49.99,
      yearly: 499.99,
      popular: false,
      features: [
        "Multi-school management",
        "Custom learning paths",
        "White-label platform",
        "Dedicated account manager",
        "24/7 phone support",
        "Custom certificates",
        "Enterprise analytics & reporting",
        "4K video quality",
        "Advanced coding environments",
        "Team collaboration tools",
        "Unlimited mentorship",
        "Custom integrations",
        "SSO integration",
        "School admin dashboard",
        "Teacher content management",
        "Parent-child account linking",
        "Bulk student management",
        "Advanced reporting & exports",
        "NDPR compliance tools",
      ],
      limits: {
        courses: "Unlimited",
        storage: "Unlimited",
        support: "24/7 Phone",
        analytics: "Enterprise",
        offlineDownloads: "Unlimited",
        quizAttempts: "Unlimited",
      },
    },
  ]

  const handleOfflineDownload = async (lessonId: string) => {
    setIsDownloading(true)
    setDownloadProgress(0)

    // Simulate download progress
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsDownloading(false)
          setOfflineEnabled(true)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const getDiscountPercentage = (monthly: number, yearly: number) => {
    return Math.round(((monthly * 12 - yearly) / (monthly * 12)) * 100)
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">TECHXAGON Learning Plans</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Access all semester lessons, quizzes, and exams with our comprehensive subscription plans.
        </p>

        <div className="flex items-center justify-center gap-4 pb-8">
          <span className={billingCycle === "monthly" ? "font-semibold" : "text-muted-foreground"}>Monthly</span>
          <Switch
            checked={billingCycle === "yearly"}
            onCheckedChange={(checked) => setBillingCycle(checked ? "yearly" : "monthly")}
          />
          <span className={billingCycle === "yearly" ? "font-semibold" : "text-muted-foreground"}>
            Yearly
            <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">
              Save up to 17%
            </Badge>
          </span>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3 max-w-7xl mx-auto">
        {plans.map((plan) => {
          const IconComponent = plan.icon
          const price = billingCycle === "monthly" ? plan.monthly : plan.yearly
          const discount = getDiscountPercentage(plan.monthly, plan.yearly)

          return (
            <Card
              key={plan.id}
              className={`relative transition-all duration-200 hover:shadow-lg ${
                plan.popular ? "ring-2 ring-purple-500 scale-105" : ""
              } ${selectedPlan === plan.id ? "ring-2 ring-blue-500" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-600 text-white px-4 py-1">Most Popular</Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className={`w-16 h-16 mx-auto rounded-full ${plan.bgColor} flex items-center justify-center mb-4`}>
                  <IconComponent className={`h-8 w-8 ${plan.color}`} />
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-base">{plan.description}</CardDescription>
                <div className="space-y-2">
                  <div className="text-4xl font-bold">
                    ₦{price}
                    <span className="text-lg font-normal text-muted-foreground">
                      /{billingCycle === "monthly" ? "month" : "year"}
                    </span>
                  </div>
                  {billingCycle === "yearly" && (
                    <div className="text-sm text-green-600 font-medium">Save {discount}% annually</div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Content Access:</span>
                    <span className="font-medium">{plan.limits.courses}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Offline Storage:</span>
                    <span className="font-medium">{plan.limits.storage}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Quiz Attempts:</span>
                    <span className="font-medium">{plan.limits.quizAttempts}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Support:</span>
                    <span className="font-medium">{plan.limits.support}</span>
                  </div>
                </div>

                {(plan.id === "premium" || plan.id === "enterprise") && (
                  <div className="border-t pt-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full bg-transparent">
                          <Download className="h-4 w-4 mr-2" />
                          Try Offline Mode
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Offline Content Download</DialogTitle>
                          <DialogDescription>
                            Download lessons for offline learning with automatic sync when online.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span>Mathematics - Algebra Basics</span>
                            <Button
                              size="sm"
                              onClick={() => handleOfflineDownload("math-algebra")}
                              disabled={isDownloading}
                            >
                              {isDownloading ? "Downloading..." : "Download"}
                            </Button>
                          </div>
                          {isDownloading && (
                            <div className="space-y-2">
                              <Progress value={downloadProgress} />
                              <p className="text-sm text-muted-foreground">Downloading... {downloadProgress}%</p>
                            </div>
                          )}
                          {offlineEnabled && (
                            <div className="flex items-center gap-2 text-green-600">
                              <WifiOff className="h-4 w-4" />
                              <span className="text-sm">Content available offline</span>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}

                <Button
                  className={`w-full ${
                    plan.popular
                      ? "bg-purple-600 hover:bg-purple-700"
                      : selectedPlan === plan.id
                        ? "bg-blue-600 hover:bg-blue-700"
                        : ""
                  }`}
                  variant={plan.popular ? "default" : selectedPlan === plan.id ? "default" : "outline"}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {selectedPlan === plan.id ? "Selected" : "Choose Plan"}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="max-w-4xl mx-auto">
        <Tabs defaultValue="features" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="content">Content Access</TabsTrigger>
            <TabsTrigger value="security">Security & DRM</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent value="features">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Feature Comparison</CardTitle>
                <CardDescription>Compare all TECHXAGON platform features across subscription plans</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Feature</th>
                        <th className="text-center py-3 px-4">Basic</th>
                        <th className="text-center py-3 px-4">Premium</th>
                        <th className="text-center py-3 px-4">Enterprise</th>
                      </tr>
                    </thead>
                    <tbody className="space-y-2">
                      {[
                        { feature: "Semester Lessons", basic: "All", premium: "All", enterprise: "All" },
                        { feature: "Video Quality", basic: "Standard", premium: "HD + DRM", enterprise: "4K + DRM" },
                        {
                          feature: "Offline Downloads",
                          basic: "10 lessons",
                          premium: "Unlimited",
                          enterprise: "Unlimited",
                        },
                        { feature: "Online Exams", basic: "❌", premium: "✅", enterprise: "✅" },
                        { feature: "Live Tutoring", basic: "❌", premium: "2hrs/month", enterprise: "Unlimited" },
                        { feature: "Gamification", basic: "❌", premium: "✅", enterprise: "✅" },
                        { feature: "E-commerce Access", basic: "❌", premium: "✅", enterprise: "✅" },
                        { feature: "School Management", basic: "❌", premium: "❌", enterprise: "✅" },
                        { feature: "Parent Dashboard", basic: "❌", premium: "✅", enterprise: "✅" },
                        { feature: "Advanced Reports", basic: "❌", premium: "❌", enterprise: "✅" },
                      ].map((row, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-3 px-4 font-medium">{row.feature}</td>
                          <td className="py-3 px-4 text-center">{row.basic}</td>
                          <td className="py-3 px-4 text-center">{row.premium}</td>
                          <td className="py-3 px-4 text-center">{row.enterprise}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>Content Access & Protection</CardTitle>
                <CardDescription>Secure content delivery with DRM protection</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Play className="h-5 w-5 text-blue-600" />
                      <h4 className="font-semibold">Video Content</h4>
                    </div>
                    <ul className="space-y-1 text-sm text-muted-foreground ml-7">
                      <li>• Adaptive streaming quality</li>
                      <li>• DRM-protected content</li>
                      <li>• Watermarked videos</li>
                      <li>• Screen capture prevention</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-green-600" />
                      <h4 className="font-semibold">Documents & Notes</h4>
                    </div>
                    <ul className="space-y-1 text-sm text-muted-foreground ml-7">
                      <li>• PDF viewer with pagination</li>
                      <li>• Annotation support</li>
                      <li>• Download restrictions</li>
                      <li>• Watermarked documents</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security & Compliance</CardTitle>
                <CardDescription>NDPR compliant with enterprise-grade security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-green-600" />
                      <span className="font-semibold">Data Protection</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      End-to-end encryption for all user data and exam content with NDPR compliance.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold">Access Control</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Role-based permissions with secure parent-child account linking.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faq">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    q: "Can I access content offline?",
                    a: "Yes, Premium and Enterprise plans allow unlimited offline downloads with automatic sync when online.",
                  },
                  {
                    q: "Are online exams secure?",
                    a: "Yes, we use browser lockdown technology and randomized questions to ensure exam integrity.",
                  },
                  {
                    q: "How does parent-child linking work?",
                    a: "Parents receive secure codes to create and manage their children's accounts without separate passwords.",
                  },
                  {
                    q: "What subjects are covered?",
                    a: "All semester subjects for your grade level, including videos, notes, quizzes, and exams.",
                  },
                  {
                    q: "Is there a free trial?",
                    a: "Yes, all plans come with a 14-day free trial with full access to features.",
                  },
                ].map((faq, index) => (
                  <div key={index} className="space-y-2">
                    <h4 className="font-semibold">{faq.q}</h4>
                    <p className="text-muted-foreground">{faq.a}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>30-day money-back guarantee</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            <span>NDPR compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span>Instant activation</span>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, Star, Crown, Zap, BookOpen, Shield, Headphones } from "lucide-react"

export function SubscriptionPlans() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

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
        "Access to 50+ courses",
        "Basic progress tracking",
        "Mobile app access",
        "Community forum access",
        "Email support",
        "Certificate of completion",
        "Basic analytics",
        "Standard video quality",
      ],
      limits: {
        courses: "50+",
        storage: "5GB",
        support: "Email",
        analytics: "Basic",
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
        "Access to 500+ courses",
        "Advanced progress tracking",
        "Offline content download",
        "Priority community support",
        "Live Q&A sessions",
        "Verified certificates",
        "Advanced analytics",
        "HD video quality",
        "Interactive coding labs",
        "Personalized learning paths",
        "1-on-1 mentorship (2 hours/month)",
      ],
      limits: {
        courses: "500+",
        storage: "50GB",
        support: "Priority",
        analytics: "Advanced",
      },
    },
    {
      id: "enterprise",
      name: "Enterprise",
      description: "For schools and organizations",
      icon: Crown,
      color: "text-gold-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      monthly: 49.99,
      yearly: 499.99,
      popular: false,
      features: [
        "Unlimited course access",
        "Custom learning paths",
        "White-label platform",
        "Dedicated account manager",
        "24/7 phone support",
        "Custom certificates",
        "Enterprise analytics",
        "4K video quality",
        "Advanced coding environments",
        "Team collaboration tools",
        "Unlimited mentorship",
        "Custom integrations",
        "SSO integration",
        "Advanced reporting",
      ],
      limits: {
        courses: "Unlimited",
        storage: "Unlimited",
        support: "24/7 Phone",
        analytics: "Enterprise",
      },
    },
  ]

  const getDiscountPercentage = (monthly: number, yearly: number) => {
    return Math.round(((monthly * 12 - yearly) / (monthly * 12)) * 100)
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Choose Your Learning Plan</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Unlock your potential with our comprehensive learning platform. Choose the plan that fits your goals.
        </p>

        <div className="flex items-center justify-center gap-4">
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
                    ${price}
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
                    <span className="text-muted-foreground">Courses:</span>
                    <span className="font-medium">{plan.limits.courses}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Storage:</span>
                    <span className="font-medium">{plan.limits.storage}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Support:</span>
                    <span className="font-medium">{plan.limits.support}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Analytics:</span>
                    <span className="font-medium">{plan.limits.analytics}</span>
                  </div>
                </div>

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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="features">Feature Comparison</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
          </TabsList>

          <TabsContent value="features">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Feature Comparison</CardTitle>
                <CardDescription>Compare all features across our subscription plans</CardDescription>
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
                        { feature: "Course Access", basic: "50+", premium: "500+", enterprise: "Unlimited" },
                        { feature: "Video Quality", basic: "Standard", premium: "HD", enterprise: "4K" },
                        { feature: "Offline Download", basic: "❌", premium: "✅", enterprise: "✅" },
                        { feature: "Live Sessions", basic: "❌", premium: "✅", enterprise: "✅" },
                        { feature: "Mentorship", basic: "❌", premium: "2hrs/month", enterprise: "Unlimited" },
                        { feature: "Custom Certificates", basic: "❌", premium: "❌", enterprise: "✅" },
                        { feature: "Analytics", basic: "Basic", premium: "Advanced", enterprise: "Enterprise" },
                        { feature: "Support", basic: "Email", premium: "Priority", enterprise: "24/7 Phone" },
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

          <TabsContent value="faq">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    q: "Can I change my plan anytime?",
                    a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.",
                  },
                  {
                    q: "Is there a free trial?",
                    a: "Yes, all plans come with a 14-day free trial. No credit card required to start.",
                  },
                  {
                    q: "What payment methods do you accept?",
                    a: "We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.",
                  },
                  {
                    q: "Can I cancel anytime?",
                    a: "Yes, you can cancel your subscription at any time. You'll retain access until the end of your billing period.",
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

          <TabsContent value="testimonials">
            <div className="grid gap-6 md:grid-cols-2">
              {[
                {
                  name: "Sarah Johnson",
                  role: "Software Developer",
                  plan: "Premium",
                  content:
                    "The Premium plan has been incredible for my career growth. The mentorship sessions are invaluable.",
                },
                {
                  name: "Tech High School",
                  role: "Educational Institution",
                  plan: "Enterprise",
                  content:
                    "The Enterprise plan transformed our computer science curriculum. Students love the interactive labs.",
                },
              ].map((testimonial, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {testimonial.role} • {testimonial.plan} Plan
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
            <Headphones className="h-4 w-4" />
            <span>24/7 customer support</span>
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

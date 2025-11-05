import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"

export function PricingSection() {
  const plans = [
    {
      name: "Starter",
      price: "$9",
      description: "Perfect for small teams getting started",
      features: ["Up to 5 team members", "10 projects", "Basic reporting", "Email support", "Mobile apps"],
      cta: "Start Free Trial",
      popular: false,
    },
    {
      name: "Professional",
      price: "$29",
      description: "For growing teams that need more power",
      features: [
        "Up to 25 team members",
        "Unlimited projects",
        "Advanced reporting",
        "Priority support",
        "Custom integrations",
        "Advanced automation",
      ],
      cta: "Start Free Trial",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "$99",
      description: "For large organizations with custom needs",
      features: [
        "Unlimited team members",
        "Unlimited projects",
        "Custom reporting",
        "24/7 dedicated support",
        "SSO & advanced security",
        "Custom workflows",
        "API access",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ]

  return (
    <section id="pricing" className="py-20 sm:py-32 bg-secondary/30">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            Choose the perfect plan for your team. All plans include a 14-day free trial.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3 lg:gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative flex flex-col border-border bg-card ${
                plan.popular ? "ring-2 ring-primary shadow-xl" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center rounded-full bg-primary px-4 py-1 text-sm font-medium text-primary-foreground">
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader className="pb-8">
                <CardTitle className="text-2xl text-foreground">{plan.name}</CardTitle>
                <CardDescription className="text-base text-muted-foreground">{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant={plan.popular ? "default" : "outline"} size="lg">
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

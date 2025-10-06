import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Users, Zap } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description:
        "Built for speed with real-time updates and instant synchronization across all devices. Never miss a beat with our optimized performance.",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description:
        "Work together seamlessly with built-in chat, file sharing, and collaborative editing. Keep everyone on the same page, always.",
    },
    {
      icon: CheckCircle2,
      title: "Smart Automation",
      description:
        "Automate repetitive tasks and workflows with intelligent rules. Focus on what matters while TaskFlow handles the rest.",
    },
  ]

  return (
    <section id="features" className="py-20 sm:py-32">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Everything you need to succeed
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            Powerful features designed to help your team work smarter, not harder.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="border-border bg-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl text-foreground">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed text-muted-foreground">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

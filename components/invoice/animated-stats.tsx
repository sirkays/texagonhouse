"use client";

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import {
  CountUpAnimation,
  AnimatedContainer,
} from "@/components/invoice/gsap-animations";

const quickStats = [
  {
    title: "Total Revenue",
    value: 12345.67,
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
    description: "vs last month",
    prefix: "$",
  },
  {
    title: "Pending Payments",
    value: 23,
    change: "-8.2%",
    trend: "down",
    icon: Clock,
    description: "awaiting processing",
  },
  {
    title: "Failed Transactions",
    value: 5,
    change: "+2.1%",
    trend: "up",
    icon: AlertTriangle,
    description: "requires attention",
  },
  {
    title: "Success Rate",
    value: 94.2,
    change: "+1.8%",
    trend: "up",
    icon: CheckCircle,
    description: "payment success",
    suffix: "%",
  },
];

export function AnimatedStats() {
  return (
    <AnimatedContainer
      animation="staggerChildren"
      className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {quickStats.map((stat, index) => (
        <Card
          key={stat.title}
          className="hover-lift border-0 shadow-sm bg-gradient-to-br from-card to-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <stat.icon className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              <CountUpAnimation
                value={stat.value}
                duration={2 + index * 0.2}
                prefix={stat.prefix || ""}
                suffix={stat.suffix || ""}
              />
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <div
                className={`flex items-center px-2 py-1 rounded-full ${
                  stat.trend === "up"
                    ? "bg-success/10 text-success"
                    : "bg-destructive/10 text-destructive"
                }`}>
                {stat.trend === "up" ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {stat.change}
              </div>
              <span className="text-muted-foreground">{stat.description}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </AnimatedContainer>
  );
}

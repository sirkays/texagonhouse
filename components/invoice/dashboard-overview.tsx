"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Progress} from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

const recentTransactions = [
  {
    id: "TXN-2024-001",
    description: "Monthly subscription - Pro Plan",
    amount: 299.99,
    status: "completed",
    date: "2024-01-15",
    type: "subscription",
  },
  {
    id: "TXN-2024-002",
    description: "One-time purchase - Premium Features",
    amount: 149.99,
    status: "pending",
    date: "2024-01-14",
    type: "purchase",
  },
  {
    id: "TXN-2024-003",
    description: "Refund - Cancelled order",
    amount: -89.99,
    status: "completed",
    date: "2024-01-13",
    type: "refund",
  },
  {
    id: "TXN-2024-004",
    description: "Annual license renewal",
    amount: 1299.99,
    status: "failed",
    date: "2024-01-12",
    type: "license",
  },
];

const quickStats = [
  {
    title: "Pending Payments",
    value: "23",
    change: "-8.2%",
    trend: "down",
    icon: Clock,
    description: "awaiting processing",
  },
  {
    title: "Failed Transactions",
    value: "5",
    change: "+2.1%",
    trend: "up",
    icon: AlertTriangle,
    description: "requires attention",
  },
  {
    title: "Success Rate",
    value: "94.2%",
    change: "+1.8%",
    trend: "up",
    icon: CheckCircle,
    description: "payment success",
  },
];

export function DashboardOverview() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h2 className="text-lg sm:text-xl font-semibold tracking-tight mb-2">
          Performance Overview
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base">
          Key metrics and recent activity summary
        </p>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat, index) => (
          <Card
            key={stat.title}
            className="hover-lift border-0 shadow-sm bg-gradient-to-br from-card to-card/50 backdrop-blur animate-scale-in"
            style={{animationDelay: `${index * 0.1}s`}}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
                <stat.icon className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold mb-2">
                {stat.value}
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
                <span className="text-muted-foreground">
                  {stat.description}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-card to-card/50 backdrop-blur">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg font-semibold">
              Recent Transactions
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Latest payment activity in your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {recentTransactions.map((transaction, index) => (
              <div
                key={transaction.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-2 sm:p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors animate-slide-in-left gap-2 sm:gap-3"
                style={{animationDelay: `${index * 0.1}s`}}>
                <div className="flex-1 space-y-1">
                  <p className="text-xs sm:text-sm font-medium leading-none">
                    {transaction.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {transaction.id} • {transaction.date}
                  </p>
                </div>
                <div className="flex items-center justify-between sm:justify-end space-x-3">
                  <span
                    className={`text-sm font-semibold ${
                      transaction.amount < 0
                        ? "text-destructive"
                        : "text-foreground"
                    }`}>
                    ${Math.abs(transaction.amount).toFixed(2)}
                  </span>
                  <Badge
                    variant={
                      transaction.status === "completed"
                        ? "default"
                        : transaction.status === "pending"
                        ? "secondary"
                        : "destructive"
                    }
                    className="text-xs font-medium">
                    {transaction.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-card to-card/50 backdrop-blur">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg font-semibold">
              System Health
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Overall payment system performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-medium">Success Rate</span>
                <span className="font-semibold text-success">94.2%</span>
              </div>
              <Progress value={94.2} className="h-2" />
            </div>

            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-medium">Processing Speed</span>
                <span className="font-semibold text-accent">87.5%</span>
              </div>
              <Progress value={87.5} className="h-2" />
            </div>

            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-medium">Customer Satisfaction</span>
                <span className="font-semibold text-primary">96.8%</span>
              </div>
              <Progress value={96.8} className="h-2" />
            </div>

            <div className="pt-3 sm:pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                  System Status
                </span>
                <Badge className="bg-success/10 text-success border-success/20 hover:bg-success/20 text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Operational
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

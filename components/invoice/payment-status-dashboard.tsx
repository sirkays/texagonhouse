"use client";

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Progress} from "@/components/ui/progress";
import {PaymentStatusBadge} from "@/components/invoice/payment-status-badge";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface PaymentStats {
  totalTransactions: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  failedAmount: number;
  paidCount: number;
  pendingCount: number;
  overdueCount: number;
  failedCount: number;
  paymentRate: number;
  averagePaymentTime: number;
}

interface PaymentStatusDashboardProps {
  className?: string;
}

// Mock data - in real app this would come from API
const mockPaymentStats: PaymentStats = {
  totalTransactions: 6,
  totalAmount: 12525.5,
  paidAmount: 9800.75,
  pendingAmount: 1200.5,
  overdueAmount: 850.0,
  failedAmount: 675.25,
  paidCount: 3,
  pendingCount: 1,
  overdueCount: 1,
  failedCount: 1,
  paymentRate: 78.2,
  averagePaymentTime: 12.5,
};

export function PaymentStatusDashboard({
  className,
}: PaymentStatusDashboardProps) {
  const stats = mockPaymentStats;

  const statusBreakdown = [
    {
      status: "paid" as const,
      count: stats.paidCount,
      amount: stats.paidAmount,
      percentage: (stats.paidAmount / stats.totalAmount) * 100,
      icon: CheckCircle,
      trend: "up" as const,
    },
    {
      status: "pending" as const,
      count: stats.pendingCount,
      amount: stats.pendingAmount,
      percentage: (stats.pendingAmount / stats.totalAmount) * 100,
      icon: Clock,
      trend: "neutral" as const,
    },
    {
      status: "overdue" as const,
      count: stats.overdueCount,
      amount: stats.overdueAmount,
      percentage: (stats.overdueAmount / stats.totalAmount) * 100,
      icon: AlertTriangle,
      trend: "down" as const,
    },
    {
      status: "failed" as const,
      count: stats.failedCount,
      amount: stats.failedAmount,
      percentage: (stats.failedAmount / stats.totalAmount) * 100,
      icon: XCircle,
      trend: "down" as const,
    },
  ];

  return (
    <div className={`space-y-3 ${className}`}>
      <div>
        <h2 className="text-base font-bold tracking-tight md:text-lg lg:text-xl mb-1">
          Payment Status & Analytics
        </h2>
        <p className="text-muted-foreground text-xs md:text-sm">
          Real-time payment status and performance metrics
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-card to-card/50 backdrop-blur hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground md:text-sm">
              Total Payment
            </CardTitle>
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <DollarSign className="h-3 w-3 md:h-4 md:w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold mb-2 md:text-xl">
              $
              {stats.totalAmount.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <div className="flex items-center text-xs">
              <div className="flex items-center px-2 py-1 rounded-full bg-success/10 text-success">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>+12.5%</span>
              </div>
              <span className="ml-2 text-muted-foreground">
                from last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-card to-card/50 backdrop-blur hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground md:text-sm">
              Payment Rate
            </CardTitle>
            <div className="p-1.5 bg-accent/10 rounded-lg">
              <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold mb-2 md:text-xl">
              {stats.paymentRate.toFixed(1)}%
            </div>
            <Progress value={stats.paymentRate} className="mb-2 h-2 md:h-3" />
            <div className="text-xs text-muted-foreground md:text-sm">
              Avg. payment time: {stats.averagePaymentTime} days
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm bg-gradient-to-br from-card to-card/50 backdrop-blur">
        <CardHeader className="pb-2 p-0">
          <CardTitle className="text-base font-semibold md:text-lg">
            Payment Status Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-2">
            {statusBreakdown.map((item, index) => {
              const Icon = item.icon;
              const TrendIcon =
                item.trend === "up"
                  ? TrendingUp
                  : item.trend === "down"
                  ? TrendingDown
                  : Clock;

              return (
                <div
                  key={item.status}
                  className="flex flex-col gap-2 p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors animate-slide-in-left"
                  style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-background rounded-lg shadow-sm">
                      <Icon className="h-3 w-3 md:h-4 md:w-4" />
                    </div>
                    <PaymentStatusBadge status={item.status} size="sm" />
                    <div className="text-xs md:text-sm">
                      <span className="font-semibold">{item.count}</span>
                      <span className="text-muted-foreground ml-1">
                        transactions
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="text-right">
                      <div className="font-semibold text-sm md:text-base">
                        $
                        {item.amount.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                      <div className="text-xs text-muted-foreground md:text-sm">
                        {item.percentage.toFixed(1)}% of total
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 md:w-20">
                        <Progress
                          value={item.percentage}
                          className="h-2 md:h-3"
                        />
                      </div>
                      <TrendIcon
                        className={`h-3 w-3 md:h-4 md:w-4 ${
                          item.trend === "up"
                            ? "text-success"
                            : item.trend === "down"
                            ? "text-destructive"
                            : "text-muted-foreground"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

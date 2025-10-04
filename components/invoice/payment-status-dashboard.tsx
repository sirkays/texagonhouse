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
    <div className={`space-y-4 sm:space-y-6 ${className}`}>
      <div>
        <h2 className="text-lg sm:text-xl font-semibold tracking-tight mb-2">
          Payment Analytics
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base">
          Real-time payment status and performance metrics
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-card to-card/50 backdrop-blur hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              Total Payment
            </CardTitle>
            <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold mb-2">
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
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              Payment Rate
            </CardTitle>
            <div className="p-1.5 sm:p-2 bg-accent/10 rounded-lg">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold mb-3">
              {stats.paymentRate.toFixed(1)}%
            </div>
            <Progress value={stats.paymentRate} className="mb-2" />
            <div className="text-xs text-muted-foreground">
              Avg. payment time: {stats.averagePaymentTime} days
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm bg-gradient-to-br from-card to-card/50 backdrop-blur">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg font-semibold">
            Payment Status Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
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
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors animate-slide-in-left gap-3 sm:gap-4"
                  style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1.5 sm:p-2 bg-background rounded-lg shadow-sm">
                        <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                      </div>
                      <PaymentStatusBadge status={item.status} />
                    </div>
                    <div className="text-xs sm:text-sm">
                      <span className="font-semibold">{item.count}</span>
                      <span className="text-muted-foreground ml-1">
                        transactions
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                    <div className="text-right">
                      <div className="font-semibold text-sm sm:text-base">
                        $
                        {item.amount.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.percentage.toFixed(1)}% of total
                      </div>
                    </div>
                    <div className="w-16 sm:w-20">
                      <Progress value={item.percentage} className="h-2" />
                    </div>
                    <TrendIcon
                      className={`h-3 w-3 sm:h-4 sm:w-4 ${
                        item.trend === "up"
                          ? "text-success"
                          : item.trend === "down"
                          ? "text-destructive"
                          : "text-muted-foreground"
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-gradient-to-br from-card to-card/50 backdrop-blur">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg font-semibold">
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 border rounded-lg cursor-pointer hover:bg-muted/30 transition-all hover-lift bg-muted/10">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="p-1.5 sm:p-2 bg-warning/10 rounded-lg">
                  <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-warning" />
                </div>
                <span className="font-semibold text-xs sm:text-sm">
                  Follow Up Overdue
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.overdueCount} transactions need attention
              </p>
            </div>

            <div className="p-3 sm:p-4 border rounded-lg cursor-pointer hover:bg-muted/30 transition-all hover-lift bg-muted/10">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="p-1.5 sm:p-2 bg-destructive/10 rounded-lg">
                  <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
                </div>
                <span className="font-semibold text-xs sm:text-sm">
                  Retry Failed Payments
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.failedCount} failed transactions to retry
              </p>
            </div>

            <div className="p-3 sm:p-4 border rounded-lg cursor-pointer hover:bg-muted/30 transition-all hover-lift bg-muted/10">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="p-1.5 sm:p-2 bg-success/10 rounded-lg">
                  <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-success" />
                </div>
                <span className="font-semibold text-xs sm:text-sm">
                  Generate Report
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Export payment analytics
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

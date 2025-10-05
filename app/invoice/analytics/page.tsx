"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {SidebarTrigger} from "@/components/ui/sidebar";
import {Separator} from "@/components/ui/separator";
import {Progress} from "@/components/ui/progress";
import {Badge} from "@/components/ui/badge";
import {TrendingUp, BarChart3, PieChart, Activity, Target} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const analyticsData = {
  revenue: {
    current: 45678.9,
    previous: 42341.2,
    growth: 7.9,
  },
  transactions: {
    total: 1247,
    successful: 1183,
    failed: 64,
    successRate: 94.9,
  },
  topCategories: [
    {name: "Subscriptions", amount: 18456.78, percentage: 40.4},
    {name: "One-time Purchases", amount: 13245.67, percentage: 29.0},
    {name: "Licenses", amount: 8976.45, percentage: 19.6},
    {name: "Refunds", amount: -2345.67, percentage: -5.1},
    {name: "Other", amount: 7345.67, percentage: 16.1},
  ],
  monthlyTrends: [
    {month: "Jan", revenue: 38456, transactions: 1089},
    {month: "Feb", revenue: 42341, transactions: 1156},
    {month: "Mar", revenue: 45678, transactions: 1247},
  ],
};

export default function AnalyticsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Financial Analytics
          </h1>
          <p className="text-muted-foreground">
            Detailed insights into your payment performance
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${analyticsData.revenue.current.toLocaleString()}
              </div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <div className="flex items-center text-success">
                  <TrendingUp className="h-3 w-3 mr-1" />+
                  {analyticsData.revenue.growth}%
                </div>
                <span>vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Success Rate
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyticsData.transactions.successRate}%
              </div>
              <div className="text-xs text-muted-foreground">
                {analyticsData.transactions.successful} of{" "}
                {analyticsData.transactions.total} transactions
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Failed Payments
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyticsData.transactions.failed}
              </div>
              <div className="text-xs text-muted-foreground">
                {(
                  (analyticsData.transactions.failed /
                    analyticsData.transactions.total) *
                  100
                ).toFixed(1)}
                % failure rate
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                +{analyticsData.revenue.growth}%
              </div>
              <div className="text-xs text-muted-foreground">
                Month over month growth
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Breakdown */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Revenue by Category
              </CardTitle>
              <CardDescription>Breakdown of revenue sources</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {analyticsData.topCategories.map((category, index) => (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{category.name}</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={
                          category.amount < 0
                            ? "text-destructive"
                            : "text-foreground"
                        }>
                        ${Math.abs(category.amount).toLocaleString()}
                      </span>
                      <Badge
                        variant={
                          category.percentage > 0 ? "default" : "destructive"
                        }
                        className="text-xs">
                        {category.percentage > 0 ? "+" : ""}
                        {category.percentage}%
                      </Badge>
                    </div>
                  </div>
                  <Progress
                    value={Math.abs(category.percentage)}
                    className="h-2"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Monthly Trends
              </CardTitle>
              <CardDescription>
                Revenue and transaction trends over time
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {analyticsData.monthlyTrends.map((month, index) => (
                <div
                  key={month.month}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <div className="font-medium">{month.month} 2024</div>
                    <div className="text-sm text-muted-foreground">
                      {month.transactions} transactions
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">
                      ${month.revenue.toLocaleString()}
                    </div>
                    {index > 0 && (
                      <div className="text-xs text-success flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />+
                        {(
                          ((month.revenue -
                            analyticsData.monthlyTrends[index - 1].revenue) /
                            analyticsData.monthlyTrends[index - 1].revenue) *
                          100
                        ).toFixed(1)}
                        %
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>
              Key performance indicators for your payment system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Payment Success Rate</span>
                  <span className="font-medium">
                    {analyticsData.transactions.successRate}%
                  </span>
                </div>
                <Progress
                  value={analyticsData.transactions.successRate}
                  className="h-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Customer Retention</span>
                  <span className="font-medium">87.3%</span>
                </div>
                <Progress value={87.3} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Average Processing Time</span>
                  <span className="font-medium">2.4s</span>
                </div>
                <Progress value={76} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

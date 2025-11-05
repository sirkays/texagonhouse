"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Progress} from "@/components/ui/progress";
import {
  TrendingUp,
  Users,
  Building2,
  BookOpen,
  TestTube,
  Download,
  Calendar,
  Target,
  CheckCircle,
} from "lucide-react";

export function SystemAnalytics() {
  const platformMetrics = [
    {
      title: "Total Platform Users",
      value: "16,679",
      change: "+1,323 this month",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Active Schools",
      value: "47",
      change: "+3 this month",
      icon: Building2,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Course Completions",
      value: "8,456",
      change: "+567 this week",
      icon: BookOpen,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Tests Taken",
      value: "12,345",
      change: "+890 this week",
      icon: TestTube,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  const engagementData = [
    {
      metric: "Daily Active Users",
      value: "3,247",
      percentage: 85,
      trend: "+12%",
    },
    {
      metric: "Weekly Active Users",
      value: "8,934",
      percentage: 78,
      trend: "+8%",
    },
    {
      metric: "Monthly Active Users",
      value: "15,678",
      percentage: 94,
      trend: "+15%",
    },
    {
      metric: "Session Duration (avg)",
      value: "45 min",
      percentage: 67,
      trend: "+5%",
    },
  ];

  const contentMetrics = [
    {type: "Video Lessons", count: 2456, hours: "1,234 hrs", engagement: 92},
    {type: "CBT Tests", count: 567, attempts: "45,678", passRate: 78},
    {type: "Learning Modules", count: 189, completions: "12,345", rating: 4.7},
    {type: "Resource Materials", count: 1234, downloads: "67,890", usage: 85},
  ];

  const revenueBreakdown = [
    {
      source: "School Subscriptions",
      amount: "₦1,890,000",
      percentage: 77,
      color: "bg-blue-500",
    },
    {
      source: "Private Tutoring",
      amount: "₦340,000",
      percentage: 14,
      color: "bg-green-500",
    },
    {
      source: "E-commerce Sales",
      amount: "₦220,000",
      percentage: 9,
      color: "bg-purple-500",
    },
  ];

  const topPerformingContent = [
    {
      title: "Advanced React Development",
      type: "Video Course",
      views: 12456,
      completions: 8934,
      rating: 4.9,
      revenue: "₦234,000",
    },
    {
      title: "Python for Data Science",
      type: "Learning Module",
      views: 9876,
      completions: 7234,
      rating: 4.8,
      revenue: "₦189,000",
    },
    {
      title: "JavaScript Fundamentals Test",
      type: "CBT Test",
      attempts: 15678,
      passRate: 85,
      rating: 4.6,
      revenue: "₦156,000",
    },
  ];

  const systemHealth = [
    {
      metric: "Server Uptime",
      value: "99.9%",
      status: "excellent",
      color: "text-green-600",
    },
    {
      metric: "Response Time",
      value: "245ms",
      status: "good",
      color: "text-blue-600",
    },
    {
      metric: "Error Rate",
      value: "0.02%",
      status: "excellent",
      color: "text-green-600",
    },
    {
      metric: "Storage Usage",
      value: "67%",
      status: "normal",
      color: "text-yellow-600",
    },
  ];

  return (
    <div className="space-y-4 p-3 xs:p-4 sm:p-6 max-w-full mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 xs:gap-4">
        <div>
          <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold">
            System Analytics
          </h1>
          <p className="text-muted-foreground text-xs xs:text-sm sm:text-base">
            Comprehensive platform performance and usage analytics
          </p>
        </div>
        <div className="flex flex-col xs:flex-row gap-2 xs:gap-3">
          <Button
            variant="outline"
            className="flex items-center gap-2 bg-transparent text-xs xs:text-sm sm:text-base">
            <Download className="h-3 w-3 xs:h-4 xs:w-4" />
            Export Report
          </Button>
          <Button className="flex items-center gap-2 text-xs xs:text-sm sm:text-base">
            <Calendar className="h-3 w-3 xs:h-4 xs:w-4" />
            Schedule Report
          </Button>
        </div>
      </div>

      {/* Platform Overview Metrics */}
      <div className="grid gap-4 grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
        {platformMetrics.map((metric, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs xs:text-sm font-medium">
                {metric.title}
              </CardTitle>
              <div className={`p-1.5 xs:p-2 rounded-full ${metric.bgColor}`}>
                <metric.icon
                  className={`h-3 w-3 xs:h-4 xs:w-4 ${metric.color}`}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-lg xs:text-xl sm:text-2xl font-bold">
                {metric.value}
              </div>
              <p className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
                <span className="text-green-600">{metric.change}</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xs:gap-6 grid-cols-1 md:grid-cols-2">
        {/* User Engagement */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base xs:text-lg sm:text-xl">
              User Engagement Metrics
            </CardTitle>
            <CardDescription className="text-xs xs:text-sm sm:text-base">
              Platform usage and activity levels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 xs:space-y-4">
            {engagementData.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs xs:text-sm font-medium">
                    {item.metric}
                  </span>
                  <div className="flex items-center gap-1 xs:gap-2">
                    <span className="text-xs xs:text-sm sm:text-base font-bold">
                      {item.value}
                    </span>
                    <Badge
                      variant="secondary"
                      className="text-green-600 text-[0.85rem] xs:text-xs sm:text-sm">
                      {item.trend}
                    </Badge>
                  </div>
                </div>
                <Progress value={item.percentage} className="h-1.5 xs:h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Revenue Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base xs:text-lg sm:text-xl">
              Revenue Breakdown
            </CardTitle>
            <CardDescription className="text-xs xs:text-sm sm:text-base">
              Income sources and distribution
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 xs:space-y-4">
            {revenueBreakdown.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs xs:text-sm font-medium">
                    {item.source}
                  </span>
                  <span className="text-xs xs:text-sm sm:text-base font-bold text-green-600">
                    {item.amount}
                  </span>
                </div>
                <div className="flex items-center gap-1 xs:gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-1.5 xs:h-2">
                    <div
                      className={`h-1.5 xs:h-2 rounded-full ${item.color}`}
                      style={{width: `${item.percentage}%`}}></div>
                  </div>
                  <span className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Content Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base xs:text-lg sm:text-xl">
            Content Performance Metrics
          </CardTitle>
          <CardDescription className="text-xs xs:text-sm sm:text-base">
            Usage statistics for different content types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
            {contentMetrics.map((content, index) => (
              <div
                key={index}
                className="p-3 xs:p-4 border rounded-lg space-y-2 xs:space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-xs xs:text-sm sm:text-base">
                    {content.type}
                  </h4>
                  <Badge
                    variant="outline"
                    className="text-[0.85rem] xs:text-xs sm:text-sm">
                    {content.count}
                  </Badge>
                </div>
                <div className="space-y-1 text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
                  <div>
                    {content.hours ||
                      content.attempts ||
                      content.completions ||
                      content.downloads}
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="h-2.5 w-2.5 xs:h-3 xs:w-3" />
                    {content.engagement ||
                      content.passRate ||
                      content.rating ||
                      content.usage}
                    {content.passRate
                      ? "% pass rate"
                      : content.rating
                      ? "/5 rating"
                      : "% engagement"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base xs:text-lg sm:text-xl">
            Top Performing Content
          </CardTitle>
          <CardDescription className="text-xs xs:text-sm sm:text-base">
            Most successful courses and materials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 xs:space-y-4">
            {topPerformingContent.map((content, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 xs:p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="space-y-1 mb-2 sm:mb-0">
                  <h4 className="font-medium text-xs xs:text-sm sm:text-base">
                    {content.title}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 xs:gap-3 text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
                    <Badge variant="outline">{content.type}</Badge>
                    <div className="flex items-center gap-1">
                      <Users className="h-2.5 w-2.5 xs:h-3 xs:w-3" />
                      {content.views || content.attempts}{" "}
                      {content.views ? "views" : "attempts"}
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-2.5 w-2.5 xs:h-3 xs:w-3" />
                      {content.completions || content.passRate}
                      {content.completions ? " completions" : "% pass rate"}
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-2.5 w-2.5 xs:h-3 xs:w-3" />
                      {content.rating}/5 rating
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-green-600 text-xs xs:text-sm sm:text-base">
                    {content.revenue}
                  </div>
                  <div className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
                    Revenue generated
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xs:gap-6 grid-cols-1 md:grid-cols-2">
        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base xs:text-lg sm:text-xl">
              System Health
            </CardTitle>
            <CardDescription className="text-xs xs:text-sm sm:text-base">
              Platform performance indicators
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 xs:space-y-4">
            {systemHealth.map((health, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-xs xs:text-sm font-medium">
                  {health.metric}
                </span>
                <div className="flex items-center gap-1 xs:gap-2">
                  <span
                    className={`text-xs xs:text-sm sm:text-base font-bold ${health.color}`}>
                    {health.value}
                  </span>
                  <Badge
                    variant={
                      health.status === "excellent" ? "default" : "secondary"
                    }
                    className={`${
                      health.status === "excellent"
                        ? "bg-green-100 text-green-800"
                        : ""
                    } text-[0.85rem] xs:text-xs sm:text-sm`}>
                    {health.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base xs:text-lg sm:text-xl">
              Recent Activity Summary
            </CardTitle>
            <CardDescription className="text-xs xs:text-sm sm:text-base">
              Last 24 hours platform activity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 xs:space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs xs:text-sm">New User Registrations</span>
              <span className="text-base xs:text-lg sm:text-xl font-bold text-blue-600">
                234
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs xs:text-sm">Lessons Completed</span>
              <span className="text-base xs:text-lg sm:text-xl font-bold text-green-600">
                1,456
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs xs:text-sm">Tests Taken</span>
              <span className="text-base xs:text-lg sm:text-xl font-bold text-purple-600">
                567
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs xs:text-sm">Revenue Generated</span>
              <span className="text-base xs:text-lg sm:text-xl font-bold text-orange-600">
                ₦89,000
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs xs:text-sm">Support Tickets</span>
              <span className="text-base xs:text-lg sm:text-xl font-bold text-red-600">
                12
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

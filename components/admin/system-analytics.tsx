"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Users, Building2, BookOpen, TestTube, Download, Calendar, Target, CheckCircle } from "lucide-react"

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
  ]

  const engagementData = [
    { metric: "Daily Active Users", value: "3,247", percentage: 85, trend: "+12%" },
    { metric: "Weekly Active Users", value: "8,934", percentage: 78, trend: "+8%" },
    { metric: "Monthly Active Users", value: "15,678", percentage: 94, trend: "+15%" },
    { metric: "Session Duration (avg)", value: "45 min", percentage: 67, trend: "+5%" },
  ]

  const contentMetrics = [
    { type: "Video Lessons", count: 2456, hours: "1,234 hrs", engagement: 92 },
    { type: "CBT Tests", count: 567, attempts: "45,678", passRate: 78 },
    { type: "Learning Modules", count: 189, completions: "12,345", rating: 4.7 },
    { type: "Resource Materials", count: 1234, downloads: "67,890", usage: 85 },
  ]

  const revenueBreakdown = [
    { source: "School Subscriptions", amount: "₦1,890,000", percentage: 77, color: "bg-blue-500" },
    { source: "Private Tutoring", amount: "₦340,000", percentage: 14, color: "bg-green-500" },
    { source: "E-commerce Sales", amount: "₦220,000", percentage: 9, color: "bg-purple-500" },
  ]

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
  ]

  const systemHealth = [
    { metric: "Server Uptime", value: "99.9%", status: "excellent", color: "text-green-600" },
    { metric: "Response Time", value: "245ms", status: "good", color: "text-blue-600" },
    { metric: "Error Rate", value: "0.02%", status: "excellent", color: "text-green-600" },
    { metric: "Storage Usage", value: "67%", status: "normal", color: "text-yellow-600" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">System Analytics</h1>
          <p className="text-muted-foreground">Comprehensive platform performance and usage analytics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
          <Button className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Schedule Report
          </Button>
        </div>
      </div>

      {/* Platform Overview Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {platformMetrics.map((metric, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <div className={`p-2 rounded-full ${metric.bgColor}`}>
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{metric.change}</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* User Engagement */}
        <Card>
          <CardHeader>
            <CardTitle>User Engagement Metrics</CardTitle>
            <CardDescription>Platform usage and activity levels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {engagementData.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{item.metric}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{item.value}</span>
                    <Badge variant="secondary" className="text-green-600">
                      {item.trend}
                    </Badge>
                  </div>
                </div>
                <Progress value={item.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Revenue Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
            <CardDescription>Income sources and distribution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {revenueBreakdown.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{item.source}</span>
                  <span className="text-sm font-bold text-green-600">{item.amount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${item.percentage}%` }}></div>
                  </div>
                  <span className="text-xs text-muted-foreground">{item.percentage}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Content Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Content Performance Metrics</CardTitle>
          <CardDescription>Usage statistics for different content types</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {contentMetrics.map((content, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{content.type}</h4>
                  <Badge variant="outline">{content.count}</Badge>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div>{content.hours || content.attempts || content.completions || content.downloads}</div>
                  <div className="flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    {content.engagement || content.passRate || content.rating || content.usage}
                    {content.passRate ? "% pass rate" : content.rating ? "/5 rating" : "% engagement"}
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
          <CardTitle>Top Performing Content</CardTitle>
          <CardDescription>Most successful courses and materials</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPerformingContent.map((content, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="space-y-1">
                  <h4 className="font-medium">{content.title}</h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <Badge variant="outline">{content.type}</Badge>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {content.views || content.attempts} {content.views ? "views" : "attempts"}
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      {content.completions || content.passRate}
                      {content.completions ? " completions" : "% pass rate"}
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {content.rating}/5 rating
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-green-600">{content.revenue}</div>
                  <div className="text-xs text-muted-foreground">Revenue generated</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Health */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Platform performance indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {systemHealth.map((health, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm font-medium">{health.metric}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${health.color}`}>{health.value}</span>
                  <Badge
                    variant={health.status === "excellent" ? "default" : "secondary"}
                    className={health.status === "excellent" ? "bg-green-100 text-green-800" : ""}
                  >
                    {health.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity Summary</CardTitle>
            <CardDescription>Last 24 hours platform activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">New User Registrations</span>
              <span className="text-lg font-bold text-blue-600">234</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Lessons Completed</span>
              <span className="text-lg font-bold text-green-600">1,456</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Tests Taken</span>
              <span className="text-lg font-bold text-purple-600">567</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Revenue Generated</span>
              <span className="text-lg font-bold text-orange-600">₦89,000</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Support Tickets</span>
              <span className="text-lg font-bold text-red-600">12</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

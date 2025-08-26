"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import {
  Download,
  CalendarIcon,
  Filter,
  TrendingUp,
  Users,
  BookOpen,
  TestTube,
  DollarSign,
  Clock,
  Target,
  AlertCircle,
  CheckCircle,
  BarChart3,
  PieChart,
  LineChart,
} from "lucide-react"
import { format } from "date-fns"
import { useState } from "react"

export function AdvancedReporting() {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(2024, 0, 1),
    to: new Date(),
  })
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    "user-engagement",
    "course-performance",
    "revenue-analysis",
  ])

  const reportTemplates = [
    {
      id: "executive-summary",
      name: "Executive Summary",
      description: "High-level overview for leadership",
      metrics: ["Platform Growth", "Revenue", "User Engagement", "Key Performance Indicators"],
      frequency: "Monthly",
      lastGenerated: "2024-01-15",
      status: "active",
    },
    {
      id: "academic-performance",
      name: "Academic Performance Report",
      description: "Student and course performance analytics",
      metrics: ["Test Scores", "Course Completion", "Learning Progress", "Achievement Rates"],
      frequency: "Weekly",
      lastGenerated: "2024-01-14",
      status: "active",
    },
    {
      id: "financial-analysis",
      name: "Financial Analysis",
      description: "Revenue, subscriptions, and financial metrics",
      metrics: ["Revenue Breakdown", "Subscription Analytics", "Payment Success", "Churn Analysis"],
      frequency: "Monthly",
      lastGenerated: "2024-01-10",
      status: "active",
    },
    {
      id: "user-engagement",
      name: "User Engagement Report",
      description: "Platform usage and engagement patterns",
      metrics: ["Daily Active Users", "Session Duration", "Feature Usage", "Retention Rates"],
      frequency: "Daily",
      lastGenerated: "2024-01-16",
      status: "active",
    },
  ]

  const customMetrics = [
    { id: "user-engagement", label: "User Engagement", category: "Users", icon: Users },
    { id: "course-performance", label: "Course Performance", category: "Learning", icon: BookOpen },
    { id: "test-analytics", label: "Test Analytics", category: "Assessment", icon: TestTube },
    { id: "revenue-analysis", label: "Revenue Analysis", category: "Financial", icon: DollarSign },
    { id: "system-performance", label: "System Performance", category: "Technical", icon: TrendingUp },
    { id: "content-usage", label: "Content Usage", category: "Learning", icon: Target },
  ]

  const scheduledReports = [
    {
      id: 1,
      name: "Weekly Performance Summary",
      schedule: "Every Monday at 9:00 AM",
      recipients: ["admin@techxagon.com", "analytics@techxagon.com"],
      format: "PDF + Excel",
      nextRun: "2024-01-22 09:00",
      status: "active",
    },
    {
      id: 2,
      name: "Monthly Executive Dashboard",
      schedule: "1st of every month at 8:00 AM",
      recipients: ["ceo@techxagon.com", "management@techxagon.com"],
      format: "PDF",
      nextRun: "2024-02-01 08:00",
      status: "active",
    },
    {
      id: 3,
      name: "Daily Operations Report",
      schedule: "Every day at 7:00 AM",
      recipients: ["operations@techxagon.com"],
      format: "Excel",
      nextRun: "2024-01-17 07:00",
      status: "paused",
    },
  ]

  const realtimeMetrics = [
    { label: "Active Users", value: "2,847", change: "+12%", trend: "up", color: "text-green-600" },
    { label: "Current Sessions", value: "1,234", change: "+8%", trend: "up", color: "text-blue-600" },
    { label: "Tests in Progress", value: "156", change: "-3%", trend: "down", color: "text-orange-600" },
    { label: "Revenue Today", value: "₦89,000", change: "+15%", trend: "up", color: "text-green-600" },
  ]

  const exportFormats = [
    { id: "pdf", label: "PDF Report", description: "Formatted document with charts" },
    { id: "excel", label: "Excel Spreadsheet", description: "Raw data with pivot tables" },
    { id: "csv", label: "CSV Data", description: "Comma-separated values" },
    { id: "json", label: "JSON Data", description: "Structured data format" },
  ]

  const handleMetricToggle = (metricId: string) => {
    setSelectedMetrics((prev) => (prev.includes(metricId) ? prev.filter((id) => id !== metricId) : [...prev, metricId]))
  }

  const generateCustomReport = () => {
    console.log("[v0] Generating custom report with metrics:", selectedMetrics)
    console.log("[v0] Date range:", dateRange)
    // Simulate report generation
    alert("Custom report generation started. You will receive an email when ready.")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Advanced Reporting</h1>
          <p className="text-muted-foreground">Generate comprehensive reports and analytics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2 bg-transparent">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <Button className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Quick Export
          </Button>
        </div>
      </div>

      {/* Real-time Metrics Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Real-time Metrics
          </CardTitle>
          <CardDescription>Live platform performance indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {realtimeMetrics.map((metric, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{metric.label}</span>
                  <Badge variant={metric.trend === "up" ? "default" : "secondary"} className="text-xs">
                    {metric.change}
                  </Badge>
                </div>
                <div className={`text-2xl font-bold ${metric.color}`}>{metric.value}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates">Report Templates</TabsTrigger>
          <TabsTrigger value="custom">Custom Reports</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
          <TabsTrigger value="analytics">Advanced Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pre-built Report Templates</CardTitle>
              <CardDescription>Ready-to-use reports for common analytics needs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {reportTemplates.map((template) => (
                  <Card key={template.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <Badge variant={template.status === "active" ? "default" : "secondary"}>
                          {template.status}
                        </Badge>
                      </div>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Included Metrics:</Label>
                        <div className="flex flex-wrap gap-1">
                          {template.metrics.map((metric, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {metric}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Frequency: {template.frequency}</span>
                        <span>Last: {template.lastGenerated}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1">
                          <Download className="h-3 w-3 mr-1" />
                          Generate
                        </Button>
                        <Button size="sm" variant="outline" className="bg-transparent">
                          Configure
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Report Builder</CardTitle>
              <CardDescription>Create personalized reports with specific metrics and date ranges</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date Range Selection */}
              <div className="space-y-2">
                <Label>Date Range</Label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-start text-left font-normal bg-transparent">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from ? format(dateRange.from, "PPP") : "Start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateRange.from}
                        onSelect={(date) => date && setDateRange((prev) => ({ ...prev, from: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-start text-left font-normal bg-transparent">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.to ? format(dateRange.to, "PPP") : "End date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateRange.to}
                        onSelect={(date) => date && setDateRange((prev) => ({ ...prev, to: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Metrics Selection */}
              <div className="space-y-3">
                <Label>Select Metrics to Include</Label>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {customMetrics.map((metric) => (
                    <div key={metric.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                      <Checkbox
                        id={metric.id}
                        checked={selectedMetrics.includes(metric.id)}
                        onCheckedChange={() => handleMetricToggle(metric.id)}
                      />
                      <div className="flex items-center gap-2 flex-1">
                        <metric.icon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <Label htmlFor={metric.id} className="text-sm font-medium cursor-pointer">
                            {metric.label}
                          </Label>
                          <p className="text-xs text-muted-foreground">{metric.category}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Export Format Selection */}
              <div className="space-y-3">
                <Label>Export Format</Label>
                <div className="grid gap-2 md:grid-cols-2">
                  {exportFormats.map((format) => (
                    <div key={format.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                      <Checkbox id={format.id} />
                      <div className="flex-1">
                        <Label htmlFor={format.id} className="text-sm font-medium cursor-pointer">
                          {format.label}
                        </Label>
                        <p className="text-xs text-muted-foreground">{format.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={generateCustomReport} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Generate Custom Report
                </Button>
                <Button variant="outline" className="bg-transparent">
                  Save as Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Scheduled Reports</CardTitle>
                  <CardDescription>Automated report generation and delivery</CardDescription>
                </div>
                <Button>
                  <Clock className="h-4 w-4 mr-2" />
                  New Schedule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scheduledReports.map((report) => (
                  <div key={report.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{report.name}</h4>
                      <Badge variant={report.status === "active" ? "default" : "secondary"}>{report.status}</Badge>
                    </div>
                    <div className="grid gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {report.schedule}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3" />
                        {report.recipients.length} recipients
                      </div>
                      <div className="flex items-center gap-2">
                        <Download className="h-3 w-3" />
                        Format: {report.format}
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="h-3 w-3" />
                        Next run: {report.nextRun}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="bg-transparent">
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" className="bg-transparent">
                        {report.status === "active" ? "Pause" : "Resume"}
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 bg-transparent">
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Predictive Analytics
                </CardTitle>
                <CardDescription>AI-powered insights and forecasting</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">User Growth Prediction</span>
                    <Badge className="bg-green-100 text-green-800">+23% next month</Badge>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Revenue Forecast</span>
                    <Badge className="bg-blue-100 text-blue-800">₦2.8M projected</Badge>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Churn Risk Analysis</span>
                    <Badge className="bg-yellow-100 text-yellow-800">Medium risk</Badge>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
                <Button className="w-full">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Detailed Forecasts
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Comparative Analysis
                </CardTitle>
                <CardDescription>Benchmark against industry standards</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">User Engagement vs Industry</span>
                    <Badge className="bg-green-100 text-green-800">Above average</Badge>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Course Completion Rate</span>
                    <Badge className="bg-blue-100 text-blue-800">Industry leading</Badge>
                  </div>
                  <Progress value={88} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Customer Satisfaction</span>
                    <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                  </div>
                  <Progress value={95} className="h-2" />
                </div>
                <Button className="w-full bg-transparent" variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Detailed Benchmarks
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Alert System */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Automated Alerts & Notifications
              </CardTitle>
              <CardDescription>Set up alerts for important metrics and thresholds</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 border rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <div>
                      <p className="font-medium">Low User Engagement Alert</p>
                      <p className="text-sm text-muted-foreground">Trigger when DAU drops below 2,500</p>
                    </div>
                  </div>
                  <Badge variant="outline">Active</Badge>
                </div>
                <div className="p-3 border rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="font-medium">Revenue Milestone Alert</p>
                      <p className="text-sm text-muted-foreground">Notify when monthly revenue exceeds ₦3M</p>
                    </div>
                  </div>
                  <Badge variant="outline">Active</Badge>
                </div>
                <div className="p-3 border rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <div>
                      <p className="font-medium">System Performance Alert</p>
                      <p className="text-sm text-muted-foreground">Alert when response time exceeds 500ms</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Paused</Badge>
                </div>
                <Button className="w-full bg-transparent" variant="outline">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Configure New Alert
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

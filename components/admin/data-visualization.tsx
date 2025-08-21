"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { BarChart, Bar, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Area, AreaChart } from "recharts"
import { TrendingUp, Users, BookOpen, DollarSign, Download, RefreshCw } from "lucide-react"
import { useState } from "react"

export function DataVisualization() {
  const [timeRange, setTimeRange] = useState("30d")
  const [chartType, setChartType] = useState("line")

  // Sample data for different visualizations
  const userGrowthData = [
    { month: "Jan", users: 1200, active: 980, new: 220 },
    { month: "Feb", users: 1450, active: 1180, new: 250 },
    { month: "Mar", users: 1680, active: 1350, new: 230 },
    { month: "Apr", users: 1920, active: 1540, new: 240 },
    { month: "May", users: 2180, active: 1750, new: 260 },
    { month: "Jun", users: 2450, active: 1960, new: 270 },
  ]

  const revenueData = [
    { month: "Jan", subscriptions: 890000, tutoring: 120000, ecommerce: 45000 },
    { month: "Feb", subscriptions: 1200000, tutoring: 150000, ecommerce: 67000 },
    { month: "Mar", subscriptions: 1450000, tutoring: 180000, ecommerce: 89000 },
    { month: "Apr", subscriptions: 1680000, tutoring: 210000, ecommerce: 112000 },
    { month: "May", subscriptions: 1890000, tutoring: 240000, ecommerce: 134000 },
    { month: "Jun", subscriptions: 2100000, tutoring: 270000, ecommerce: 156000 },
  ]

  const coursePerformanceData = [
    { name: "React Development", completions: 1234, rating: 4.8, revenue: 234000 },
    { name: "Python Basics", completions: 987, rating: 4.6, revenue: 189000 },
    { name: "JavaScript Advanced", completions: 756, rating: 4.9, revenue: 156000 },
    { name: "Data Science", completions: 654, rating: 4.7, revenue: 145000 },
    { name: "Web Design", completions: 543, rating: 4.5, revenue: 123000 },
  ]

  const engagementData = [
    { day: "Mon", sessions: 2400, duration: 45 },
    { day: "Tue", sessions: 2600, duration: 48 },
    { day: "Wed", sessions: 2800, duration: 52 },
    { day: "Thu", sessions: 2900, duration: 49 },
    { day: "Fri", sessions: 3100, duration: 46 },
    { day: "Sat", sessions: 2200, duration: 38 },
    { day: "Sun", sessions: 1800, duration: 35 },
  ]

  const deviceUsageData = [
    { name: "Desktop", value: 45, color: "#8884d8" },
    { name: "Mobile", value: 35, color: "#82ca9d" },
    { name: "Tablet", value: 20, color: "#ffc658" },
  ]

  const schoolPerformanceData = [
    { school: "Lagos State Model", students: 1234, completion: 85, satisfaction: 4.8 },
    { school: "Federal Govt College", students: 987, completion: 82, satisfaction: 4.6 },
    { school: "Greenfield Academy", students: 756, completion: 78, satisfaction: 4.7 },
    { school: "Unity High School", students: 654, completion: 75, satisfaction: 4.5 },
    { school: "Excellence Institute", students: 543, completion: 88, satisfaction: 4.9 },
  ]

  const chartConfig = {
    users: { label: "Total Users", color: "#8884d8" },
    active: { label: "Active Users", color: "#82ca9d" },
    new: { label: "New Users", color: "#ffc658" },
    subscriptions: { label: "Subscriptions", color: "#8884d8" },
    tutoring: { label: "Tutoring", color: "#82ca9d" },
    ecommerce: { label: "E-commerce", color: "#ffc658" },
    sessions: { label: "Sessions", color: "#8884d8" },
    duration: { label: "Duration (min)", color: "#82ca9d" },
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Data Visualization</h1>
          <p className="text-muted-foreground">Interactive charts and analytics dashboards</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Analytics</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
          <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">16,679</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+12.5%</span> from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Course Completions</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8,456</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+8.2%</span> from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₦2.45M</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+18.7%</span> from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Session Duration</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">45 min</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+5.3%</span> from last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Growth Trend</CardTitle>
                <CardDescription>Monthly user acquisition and retention</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <AreaChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="users"
                      stackId="1"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="active"
                      stackId="2"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device Usage Distribution</CardTitle>
                <CardDescription>Platform access by device type</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <PieChart>
                    <Pie
                      data={deviceUsageData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {deviceUsageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Daily User Engagement</CardTitle>
                <CardDescription>Sessions and average duration by day</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <BarChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar yAxisId="left" dataKey="sessions" fill="#8884d8" />
                    <Line yAxisId="right" type="monotone" dataKey="duration" stroke="#82ca9d" strokeWidth={2} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>School Performance Comparison</CardTitle>
                <CardDescription>Student count vs completion rates</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <BarChart data={schoolPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="school" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="students" fill="#8884d8" />
                    <Bar dataKey="completion" fill="#82ca9d" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown by Source</CardTitle>
              <CardDescription>Monthly revenue from different income streams</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px]">
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Area type="monotone" dataKey="subscriptions" stackId="1" stroke="#8884d8" fill="#8884d8" />
                  <Area type="monotone" dataKey="tutoring" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                  <Area type="monotone" dataKey="ecommerce" stackId="1" stroke="#ffc658" fill="#ffc658" />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Courses</CardTitle>
              <CardDescription>Course completions, ratings, and revenue generation</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px]">
                <BarChart data={coursePerformanceData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="completions" fill="#8884d8" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

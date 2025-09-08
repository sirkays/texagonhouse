"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Progress} from "@/components/ui/progress";
import {Badge} from "@/components/ui/badge";
import {
  Users,
  Building2,
  GraduationCap,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  Clock,
  DollarSign,
} from "lucide-react";

export function AdminOverview() {
  const systemStats = [
    {
      title: "Total Schools",
      value: "47",
      change: "+3 this month",
      icon: Building2,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Active Teachers",
      value: "1,247",
      change: "+89 this month",
      icon: GraduationCap,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Total Students",
      value: "15,432",
      change: "+1,234 this month",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Monthly Revenue",
      value: "₦2,450,000",
      change: "+18% from last month",
      icon: DollarSign,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  const recentActivity = [
    {
      type: "school",
      title: "New School Registration",
      description: "Lagos State Model College joined the platform",
      time: "2 hours ago",
      status: "success",
      icon: Building2,
    },
    {
      type: "subscription",
      title: "Subscription Renewal",
      description: "Federal Government College renewed premium plan",
      time: "4 hours ago",
      status: "success",
      icon: CreditCard,
    },
    {
      type: "alert",
      title: "Payment Issue",
      description: "Unity High School payment failed - requires attention",
      time: "6 hours ago",
      status: "warning",
      icon: AlertTriangle,
    },
    {
      type: "user",
      title: "Bulk Teacher Registration",
      description: "45 new teachers added to Greenfield Academy",
      time: "1 day ago",
      status: "info",
      icon: Users,
    },
  ];

  const topPerformingSchools = [
    {
      name: "Lagos State Model College",
      students: 1234,
      teachers: 67,
      subscriptionStatus: "Premium",
      revenue: "₦145,000",
      performance: 95,
    },
    {
      name: "Federal Government College",
      students: 987,
      teachers: 54,
      subscriptionStatus: "Premium",
      revenue: "₦120,000",
      performance: 92,
    },
    {
      name: "Greenfield Academy",
      students: 756,
      teachers: 43,
      subscriptionStatus: "Basic",
      revenue: "₦89,000",
      performance: 88,
    },
    {
      name: "Unity High School",
      students: 654,
      teachers: 38,
      subscriptionStatus: "Premium",
      revenue: "₦98,000",
      performance: 85,
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      case "info":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const getSubscriptionBadge = (status) => {
    return status === "Premium" ? (
      <Badge className="bg-yellow-100 text-yellow-800 text-[0.85rem] xs:text-xs sm:text-sm">
        Premium
      </Badge>
    ) : (
      <Badge
        variant="secondary"
        className="text-[0.85rem] xs:text-xs sm:text-sm">
        Basic
      </Badge>
    );
  };

  return (
    <div className="space-y-4 p-3 xs:p-4 sm:p-6 max-w-full mx-auto">
      <div>
        <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold">
          System Administration
        </h1>
        <p className="text-muted-foreground text-xs xs:text-sm sm:text-base">
          Welcome to TECHXAGON Admin Portal. Monitor and manage the entire
          platform.
        </p>
      </div>

      {/* System Stats */}
      <div className="grid gap-4 grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
        {systemStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs xs:text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`p-1.5 xs:p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-3 w-3 xs:h-4 xs:w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-lg xs:text-xl sm:text-2xl font-bold">
                {stat.value}
              </div>
              <p className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
                <span className="text-green-600">{stat.change}</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xs:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base xs:text-lg sm:text-xl">
              Quick Actions
            </CardTitle>
            <CardDescription className="text-xs xs:text-sm sm:text-base">
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 xs:space-y-3">
            <Button className="w-full justify-start text-xs xs:text-sm sm:text-base">
              <Building2 className="mr-1 xs:mr-2 h-3 w-3 xs:h-4 xs:w-4" />
              Add New School
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start bg-transparent text-xs xs:text-sm sm:text-base">
              <Users className="mr-1 xs:mr-2 h-3 w-3 xs:h-4 xs:w-4" />
              Bulk User Import
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start bg-transparent text-xs xs:text-sm sm:text-base">
              <CreditCard className="mr-1 xs:mr-2 h-3 w-3 xs:h-4 xs:w-4" />
              Manage Subscriptions
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start bg-transparent text-xs xs:text-sm sm:text-base">
              <TrendingUp className="mr-1 xs:mr-2 h-3 w-3 xs:h-4 xs:w-4" />
              Generate Reports
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base xs:text-lg sm:text-xl">
              Recent Activity
            </CardTitle>
            <CardDescription className="text-xs xs:text-sm sm:text-base">
              Latest system events and updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 xs:space-y-4">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-start space-x-2 xs:space-x-3">
                <div className={`p-1.5 xs:p-2 rounded-full bg-muted`}>
                  <activity.icon
                    className={`h-2.5 w-2.5 xs:h-3 xs:w-3 ${getStatusColor(
                      activity.status
                    )}`}
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-xs xs:text-sm font-medium">
                    {activity.title}
                  </p>
                  <p className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
                    {activity.description}
                  </p>
                  <p className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground flex items-center">
                    <Clock className="mr-1 h-2.5 w-2.5 xs:h-3 xs:w-3" />
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base xs:text-lg sm:text-xl">
              System Health
            </CardTitle>
            <CardDescription className="text-xs xs:text-sm sm:text-base">
              Platform performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 xs:space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs xs:text-sm">
                <span>Server Uptime</span>
                <span className="text-green-600">99.9%</span>
              </div>
              <Progress value={99.9} className="h-1.5 xs:h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs xs:text-sm">
                <span>Active Sessions</span>
                <span>2,847</span>
              </div>
              <Progress value={75} className="h-1.5 xs:h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs xs:text-sm">
                <span>Storage Usage</span>
                <span>67%</span>
              </div>
              <Progress value={67} className="h-1.5 xs:h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs xs:text-sm">
                <span>Payment Success Rate</span>
                <span className="text-green-600">94.2%</span>
              </div>
              <Progress value={94.2} className="h-1.5 xs:h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Schools */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base xs:text-lg sm:text-xl">
            Top Performing Schools
          </CardTitle>
          <CardDescription className="text-xs xs:text-sm sm:text-base">
            Schools with highest engagement and revenue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 xs:space-y-4">
            {topPerformingSchools.map((school, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 xs:p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="space-y-1 mb-2 sm:mb-0">
                  <h4 className="font-medium text-xs xs:text-sm sm:text-base">
                    {school.name}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 xs:gap-3 text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-2.5 w-2.5 xs:h-3 xs:w-3" />
                      {school.students} students
                    </div>
                    <div className="flex items-center gap-1">
                      <GraduationCap className="h-2.5 w-2.5 xs:h-3 xs:w-3" />
                      {school.teachers} teachers
                    </div>
                    {getSubscriptionBadge(school.subscriptionStatus)}
                    <div className="font-medium text-green-600">
                      {school.revenue}
                    </div>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <div className="text-xs xs:text-sm font-medium">
                    {school.performance}% Performance
                  </div>
                  <Progress
                    value={school.performance}
                    className="w-16 xs:w-20 h-1.5 xs:h-2"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Platform Statistics */}
      <div className="grid gap-4 xs:gap-6 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base xs:text-lg sm:text-xl">
              Monthly Growth
            </CardTitle>
            <CardDescription className="text-xs xs:text-sm sm:text-base">
              Platform expansion metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 xs:space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs xs:text-sm">New Schools</span>
              <div className="flex items-center gap-1 xs:gap-2">
                <span className="text-lg xs:text-xl sm:text-2xl font-bold">
                  3
                </span>
                <Badge
                  variant="secondary"
                  className="text-green-600 text-[0.85rem] xs:text-xs sm:text-sm">
                  +50%
                </Badge>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs xs:text-sm">New Teachers</span>
              <div className="flex items-center gap-1 xs:gap-2">
                <span className="text-lg xs:text-xl sm:text-2xl font-bold">
                  89
                </span>
                <Badge
                  variant="secondary"
                  className="text-green-600 text-[0.85rem] xs:text-xs sm:text-sm">
                  +23%
                </Badge>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs xs:text-sm">New Students</span>
              <div className="flex items-center gap-1 xs:gap-2">
                <span className="text-lg xs:text-xl sm:text-2xl font-bold">
                  1,234
                </span>
                <Badge
                  variant="secondary"
                  className="text-green-600 text-[0.85rem] xs:text-xs sm:text-sm">
                  +18%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base xs:text-lg sm:text-xl">
              Revenue Breakdown
            </CardTitle>
            <CardDescription className="text-xs xs:text-sm sm:text-base">
              Income sources this month
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 xs:space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs xs:text-sm">Subscriptions</span>
              <div className="flex items-center gap-1 xs:gap-2">
                <span className="text-base xs:text-lg sm:text-xl font-semibold">
                  ₦1,890,000
                </span>
                <span className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
                  77%
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs xs:text-sm">Private Tutoring</span>
              <div className="flex items-center gap-1 xs:gap-2">
                <span className="text-base xs:text-lg sm:text-xl font-semibold">
                  ₦340,000
                </span>
                <span className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
                  14%
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs xs:text-sm">E-commerce</span>
              <div className="flex items-center gap-1 xs:gap-2">
                <span className="text-base xs:text-lg sm:text-xl font-semibold">
                  ₦220,000
                </span>
                <span className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
                  9%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

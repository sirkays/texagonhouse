"use client";

import DashboardLayout from "@/app/admin/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Users, GraduationCap, BookOpen, DollarSign} from "lucide-react";

export default function DashboardPage() {
  const stats = [
    {
      title: "Total Students",
      value: "1,234",
      change: "+12%",
      icon: GraduationCap,
      color: "text-blue-600",
    },
    {
      title: "Total Teachers",
      value: "89",
      change: "+5%",
      icon: Users,
      color: "text-green-600",
    },
    {
      title: "Active Courses",
      value: "45",
      change: "+8%",
      icon: BookOpen,
      color: "text-purple-600",
    },
    {
      title: "Revenue",
      value: "$52,340",
      change: "+23%",
      icon: DollarSign,
      color: "text-yellow-600",
    },
  ];

  const recentActivity = [
    {
      id: 1,
      action: "New student enrolled",
      user: "John Doe",
      time: "2 minutes ago",
    },
    {
      id: 2,
      action: "Assignment submitted",
      user: "Jane Smith",
      time: "15 minutes ago",
    },
    {id: 3, action: "Test completed", user: "Mike Johnson", time: "1 hour ago"},
    {
      id: 4,
      action: "New course created",
      user: "Sarah Williams",
      time: "2 hours ago",
    },
    {id: 5, action: "Payment received", user: "Tom Brown", time: "3 hours ago"},
  ];

  return (
    <>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Welcome back! Here's what's happening today.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon
                  className={`h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 ${stat.color}`}
                />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-foreground">
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-green-600 font-medium">
                    {stat.change}
                  </span>{" "}
                  from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">
              Recent Activity
            </CardTitle>
            <CardDescription className="text-sm">
              Latest updates from your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 p-3 rounded-lg border border-border">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm sm:text-base text-foreground truncate">
                      {activity.action}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">
                      {activity.user}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

"use client";

import {useEffect, useState} from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Users, GraduationCap, BookOpen, DollarSign} from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Fetch data from our Next.js API route
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch("/api/admin/overview", {
          method: "GET",
          headers: {"Content-Type": "application/json"},
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to load dashboard data");
        }

        const data = await res.json();
        setStats(data.stats);
        setRecentActivity(data.recentActivity || []);
      } catch (err: any) {
        console.error("[DashboardPage] Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh] text-muted-foreground">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] text-red-600">
        <p className="font-semibold">Error loading dashboard</p>
        <p className="text-sm text-muted-foreground mt-1">{error}</p>
      </div>
    );
  }

  // 🔹 Define cards dynamically from the fetched data
  const statCards = [
    {
      title: "Total Students",
      value: stats?.students?.value ?? "—",
      change: stats?.students?.changePct ? `${stats.students.changePct}%` : "",
      icon: GraduationCap,
      color: "text-blue-600",
    },
    {
      title: "Total Teachers",
      value: stats?.teachers?.value ?? "—",
      change: stats?.teachers?.changePct ? `${stats.teachers.changePct}%` : "",
      icon: Users,
      color: "text-green-600",
    },
    {
      title: "Active Courses",
      value: stats?.activeCourses?.value ?? "—",
      change: stats?.activeCourses?.changePct
        ? `${stats.activeCourses.changePct}%`
        : "",
      icon: BookOpen,
      color: "text-purple-600",
    },
    {
      title: "Revenue",
      value: stats?.revenue
        ? `${stats.revenue.currency} ${Number(
            stats.revenue.value
          ).toLocaleString()}`
        : "—",
      change: stats?.revenue?.changePct ? `${stats.revenue.changePct}%` : "",
      icon: DollarSign,
      color: "text-yellow-600",
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Welcome back! Here’s your organization’s 30-day overview.
        </p>
      </div>

      {/* ===== Stats Section ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((stat) => (
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
              {stat.change && (
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-green-600 font-medium">
                    {stat.change}
                  </span>{" "}
                  from last month
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ===== Recent Activity ===== */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Recent Activity</CardTitle>
          <CardDescription className="text-sm">
            Latest updates from your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
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
                    {new Date(activity.time).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No recent activity found.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

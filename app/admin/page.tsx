"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, GraduationCap, BookOpen, DollarSign } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

interface Stat {
  value: number;
  changePct: number | null;
}

interface RevenueStat {
  value: number;
  currency: string;
  changePct: number | null;
}

interface ActivityMeta {
  amount: string;
  currency: string;
}

interface Activity {
  id: number;
  action: string;
  user: string;
  time: string;
  meta?: ActivityMeta;
}

interface ApiResponse {
  stats: {
    students: Stat;
    teachers: Stat;
    activeCourses: Stat;
    revenue: RevenueStat;
  };
  recentActivity: Activity[];
}

function formatRelativeTime(isoString: string): string {
  const now = new Date();
  const past = new Date(isoString);
  const diffMs = now.getTime() - past.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;

  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH} hour${diffH > 1 ? "s" : ""} ago`;

  const diffD = Math.floor(diffH / 24);
  return `${diffD} day${diffD > 1 ? "s" : ""} ago`;
}

export default function DashboardPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/overview");
        if (!res.ok) {
          throw new Error("Failed to fetch data");
        }
        const result: ApiResponse = await res.json();
        setData(result);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const getChange = useMemo(
    () =>
      (changePct: number | null | undefined): string => {
        if (changePct === null || changePct === undefined) return "—";
        return `+${changePct}%`;
      },
    []
  );

  const stats = useMemo(() => {
    if (!data) return [];
    return [
      {
        title: "Total Students",
        value: data.stats.students.value.toLocaleString(),
        change: getChange(data.stats.students.changePct),
        icon: GraduationCap,
        color: "text-blue-600",
      },
      {
        title: "Total Teachers",
        value: data.stats.teachers.value.toLocaleString(),
        change: getChange(data.stats.teachers.changePct),
        icon: Users,
        color: "text-green-600",
      },
      {
        title: "Active Courses",
        value: data.stats.activeCourses.value.toLocaleString(),
        change: getChange(data.stats.activeCourses.changePct),
        icon: BookOpen,
        color: "text-purple-600",
      },
      {
        title: "Revenue",
        value: `${data.stats.revenue.currency
          } ${data.stats.revenue.value.toLocaleString()}`,
        change: getChange(data.stats.revenue.changePct),
        icon: DollarSign,
        color: "text-yellow-600",
      },
    ];
  }, [data, getChange]);

  const recentActivity = useMemo(() => {
    if (!data) return [];
    return data.recentActivity.map((activity: Activity) => ({
      id: activity.id,
      action: activity.action,
      user: activity.user,
      time: formatRelativeTime(activity.time),
      ...(activity.meta && { meta: activity.meta }),
    }));
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="md" className="text-black" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-600">
        Error: {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        No data available
      </div>
    );
  }

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
                  <span
                    className={`font-medium ${stat.change === "—"
                      ? "text-muted-foreground"
                      : "text-green-600"
                      }`}>
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
                      {activity.meta && (
                        <span className="text-xs text-muted-foreground ml-2">
                          ({activity.meta.amount} {activity.meta.currency})
                        </span>
                      )}
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

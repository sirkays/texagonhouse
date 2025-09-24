"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users,
  BookOpen,
  Trophy,
  Calendar,
  Clock,
  TrendingUp,
  AlertCircle,
  Baby,
  CreditCard,
  Target,
} from "lucide-react";

interface Child {
  id: number;
  name: string;
  grade: string;
  school: string;
  avatar: string;
  coursesEnrolled: number;
  coursesCompleted: number;
  averageScore: number;
  weeklyHours: number;
  lastActive: string;
  upcomingTest: string;
  currentStreak: number;
  totalRewards: number;
}

interface FamilyStat {
  title: string;
  value: string;
  change: string;
  icon: string;
  color: string;
  bgColor: string;
}

interface Activity {
  type: string;
  child: string;
  title: string;
  description: string;
  time: string;
  icon: string;
  color: string;
}

interface Event {
  child: string;
  event: string;
  date: string;
  type: string;
  importance: string;
}

interface DashboardData {
  children: Child[];
  familyStats: FamilyStat[];
  recentActivity: Activity[];
  upcomingEvents: Event[];
}

// Map string icon names to Lucide React components
const iconMap: { [key: string]: React.ComponentType<any> } = {
  Baby,
  Clock,
  Trophy,
  CreditCard,
  Target,
  AlertCircle,
  BookOpen,
  Calendar,
  TrendingUp,
  Users,
};

export function ParentOverview() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const response = await fetch("/api/parent/overview", {
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.detail || "Failed to fetch dashboard data");
        }

        setData(result);
        setError(null);
      } catch (err: any) {
        setError(err.message || "An error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const getImportanceBadge = (importance: string) => {
    switch (importance) {
      case "high":
        return <Badge className="bg-red-100 text-red-800">High Priority</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case "low":
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return <Badge variant="secondary">{importance}</Badge>;
    }
  };

  const getProgressPercentage = (completed: number, total: number) => {
    return Math.round((completed / total) * 100);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600">Error: {error}</div>;
  }

  if (!data) {
    return <div>No data available</div>;
  }

  const { children, familyStats, recentActivity, upcomingEvents } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Parent Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor your children's learning progress and manage their educational
          journey
        </p>
      </div>

      {/* Family Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {familyStats.map((stat, index) => {
          const IconComponent = iconMap[stat.icon];
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  {IconComponent ? (
                    <IconComponent className={`h-4 w-4 ${stat.color}`} />
                  ) : (
                    <Users className={`h-4 w-4 ${stat.color}`} />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Children Overview */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Children's Progress Overview</CardTitle>
          <CardDescription>
            Quick summary of each child's learning journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {children.map((child) => (
              <div
                key={child.id}
                className="p-4 border rounded-lg space-y-4 bg-card shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Avatar + Info */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={child.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {child.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{child.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {child.grade} • {child.school}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Last active: {child.lastActive}
                    </p>
                  </div>
                </div>

                {/* Progress Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3 shrink-0" />
                      <span className="truncate">
                        Courses: {child.coursesCompleted}/
                        {child.coursesEnrolled}
                      </span>
                    </div>
                    <Progress
                      value={getProgressPercentage(
                        child.coursesCompleted,
                        child.coursesEnrolled
                      )}
                      className="h-2"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <Target className="h-3 w-3 shrink-0" />
                      <span
                        className={`font-medium truncate ${getScoreColor(
                          child.averageScore
                        )}`}
                      >
                        Avg: {child.averageScore}%
                      </span>
                    </div>
                    <Progress value={child.averageScore} className="h-2" />
                  </div>
                </div>

                {/* Extra Stats */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 shrink-0" />
                    <span>{child.weeklyHours}h this week</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Trophy className="h-3 w-3 text-orange-500 shrink-0" />
                    <span>{child.totalRewards} rewards</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-500 shrink-0" />
                    <span>{child.currentStreak} day streak</span>
                  </div>
                </div>

                {/* Upcoming */}
                <div className="p-2 bg-muted rounded text-xs">
                  <div className="flex items-center gap-1 text-blue-600">
                    <Calendar className="h-3 w-3 shrink-0" />
                    <span className="font-medium">Upcoming:</span>
                  </div>
                  <p className="mt-1 truncate">{child.upcomingTest}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates from your children's learning
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity, index) => {
              const IconComponent = iconMap[activity.icon];
              return (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-start gap-3"
                >
                  {/* Icon */}
                  <div className="p-2 bg-muted rounded-full self-start sm:self-center shrink-0">
                    {IconComponent ? (
                      <IconComponent className={`h-4 w-4 ${activity.color}`} />
                    ) : (
                      <Users className={`h-4 w-4 ${activity.color}`} />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <Badge variant="outline" className="text-xs">
                        {activity.child}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground break-words">
                      {activity.description}
                    </p>

                    <p className="text-xs text-muted-foreground flex items-center">
                      <Clock className="mr-1 h-3 w-3 shrink-0" />
                      <span className="truncate">{activity.time}</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>
              Important dates and deadlines to remember
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingEvents.map((event, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border rounded-lg"
              >
                {/* Left section */}
                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-medium text-sm">{event.event}</h4>
                    <Badge variant="outline" className="text-xs">
                      {event.child}
                    </Badge>
                  </div>

                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="mr-1 h-3 w-3 shrink-0" />
                    <span className="truncate">{event.date}</span>
                  </div>

                  <Badge variant="secondary" className="text-xs">
                    {event.type}
                  </Badge>
                </div>

                {/* Right section */}
                <div className="sm:self-center">
                  {getImportanceBadge(event.importance)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
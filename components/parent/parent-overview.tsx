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
  Zap,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";


interface Child {
  id: number;
  name: string;
  grade: string;
  school: string;
  avatar: string | null;

  coursesEnrolled: number;
  coursesCompleted: number;
  averageScore: number;

  lastActive: string;
  upcomingTest: string;

  currentStreak: number;

  // Replaces weeklyHours
  badgesEarned: number;
  achievementsUnlocked: number;
  pointsBalance: number;

  // keep for backward compatibility
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
        return <Badge className="bg-rose-50 text-rose-700 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30 font-bold px-2.5 py-0.5 rounded-full shadow-none text-xs">High Priority</Badge>;
      case "medium":
        return <Badge className="bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30 font-bold px-2.5 py-0.5 rounded-full shadow-none text-xs">Medium Priority</Badge>;
      case "low":
        return <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30 font-bold px-2.5 py-0.5 rounded-full shadow-none text-xs">Low Priority</Badge>;
      default:
        return <Badge variant="secondary" className="font-bold text-xs">{importance}</Badge>;
    }
  };

  const getProgressPercentage = (completed: number, total: number) => {
    return Math.round((completed / total) * 100);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-500";
    if (score >= 80) return "text-indigo-500";
    if (score >= 70) return "text-amber-500";
    return "text-rose-500";
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-white z-50">
        <Spinner className="w-10 h-10 xs:w-12 xs:h-12 text-[#EF7B55] self-center" />
      </div>
    );
  }

  if (error) {
    return <div className="text-rose-600 font-bold text-center p-4">Error: {error}</div>;
  }

  if (!data) {
    return <div className="text-slate-500 text-center p-4">No data available</div>;
  }

  const { children, familyStats, recentActivity, upcomingEvents } = data;

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-1 sm:p-2">
      {/* Premium Gradient Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-[#e26d47] p-6 sm:p-8 text-white shadow-xl dark:shadow-none">
        <div className="absolute right-0 top-0 h-64 w-64 -translate-y-12 translate-x-12 rounded-full bg-[#EF7B55]/15 blur-3xl" />
        <div className="absolute left-1/3 bottom-0 h-40 w-40 translate-y-12 rounded-full bg-indigo-500/15 blur-3xl" />
        
        <div className="relative z-10 space-y-2 max-w-2xl">
          <Badge className="bg-[#EF7B55]/20 text-[#ffae91] border border-[#EF7B55]/30 hover:bg-[#EF7B55]/30 px-3 py-1 font-semibold text-xs tracking-wide">
            Parental Oversight Portal
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-orange-100 bg-clip-text text-transparent">
            Parent Dashboard Overview
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
            Monitor your children's active learning journeys, track milestone completions, and coordinate live personalized tutoring to accelerate their academic path.
          </p>
        </div>
      </div>

      {/* Family Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {familyStats.map((stat, index) => {
          const IconComponent = iconMap[stat.icon];
          return (
            <Card key={index} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/60 shadow-md hover:-translate-y-1 hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-bold text-slate-600 dark:text-slate-400 group-hover:text-[#EF7B55] transition-colors">
                  {stat.title}
                </CardTitle>
                <div className={cn(
                  "p-2 rounded-xl transition-colors shrink-0 shadow-sm",
                  stat.bgColor || "bg-orange-50 dark:bg-orange-950/20 text-[#EF7B55]"
                )}>
                  {IconComponent ? (
                    <IconComponent className={cn("h-4 w-4", stat.color || "text-[#EF7B55]")} />
                  ) : (
                    <Users className={cn("h-4 w-4", stat.color || "text-[#EF7B55]")} />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-1 pb-4">
                <div className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">{stat.value}</div>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">{stat.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Children Overview */}
      <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/60 shadow-xl shadow-slate-100/40 dark:shadow-none rounded-2xl overflow-hidden w-full">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/20 text-[#EF7B55]">
              <Baby className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100">
                Children's Progress Overview
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Quick summary and key metrics of each child's learning journey.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5 sm:p-6">
          <div className="grid gap-6 md:grid-cols-2">
            {children.map((child) => (
              <div
                key={child.id}
                className="p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white/60 dark:bg-slate-950/40 backdrop-blur-sm shadow-sm hover:shadow-md hover:border-orange-200/50 dark:hover:border-slate-700/60 transition-all duration-300 space-y-5 relative overflow-hidden group"
              >
                {/* Visual marker */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#EF7B55] to-orange-500" />
                
                {/* Avatar + Info */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <Avatar className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl border-2 border-slate-100 dark:border-slate-800 shrink-0 shadow-sm">
                    <AvatarImage src={child.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-gradient-to-tr from-[#EF7B55]/10 to-orange-500/10 text-[#EF7B55] font-extrabold text-base rounded-2xl">
                      {child.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base sm:text-lg group-hover:text-[#EF7B55] transition-colors leading-tight">
                      {child.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                      {child.grade} &bull; {child.school}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1">
                      <Clock className="h-3 w-3 shrink-0" />
                      <span>Last active: {child.lastActive}</span>
                    </div>
                  </div>
                </div>

                {/* Progress Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm pt-2">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                        <span>Courses Completed</span>
                      </div>
                      <span className="text-slate-700 dark:text-slate-300">
                        {child.coursesCompleted}/{child.coursesEnrolled}
                      </span>
                    </div>
                    <Progress
                      value={getProgressPercentage(
                        child.coursesCompleted,
                        child.coursesEnrolled
                      )}
                      className="h-2 bg-slate-100 dark:bg-slate-800 [&>div]:bg-gradient-to-r [&>div]:from-indigo-500 [&>div]:to-indigo-600 rounded-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <Target className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>Average Score</span>
                      </div>
                      <span className={cn("font-extrabold", getScoreColor(child.averageScore))}>
                        {child.averageScore}%
                      </span>
                    </div>
                    <Progress 
                      value={child.averageScore} 
                      className="h-2 bg-slate-100 dark:bg-slate-800 [&>div]:bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:to-emerald-600 rounded-full" 
                    />
                  </div>
                </div>

                {/* Extra Stats */}
                <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-950/20 text-[#EF7B55] px-2.5 py-1 rounded-lg text-xs font-bold shrink-0">
                    <Trophy className="h-3.5 w-3.5" />
                    <span>
                      {child.badgesEarned} Badges &bull; {child.achievementsUnlocked} Achievements
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 px-2.5 py-1 rounded-lg text-xs font-bold shrink-0">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>{child.currentStreak} Day Streak</span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 px-2.5 py-1 rounded-lg text-xs font-bold shrink-0">
                    <Zap className="h-3.5 w-3.5" />
                    <span>{child.pointsBalance} Points</span>
                  </div>
                </div>

                {/* Upcoming */}
                <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/60 rounded-xl text-xs">
                  <div className="flex items-center gap-1.5 text-[#EF7B55] font-bold">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    <span>Upcoming Evaluation:</span>
                  </div>
                  <p className="mt-1 text-slate-600 dark:text-slate-350 font-medium truncate">{child.upcomingTest}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/60 shadow-xl shadow-slate-100/40 dark:shadow-none rounded-2xl overflow-hidden w-full">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  Recent Activity
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Latest updates from your children's active learning.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5 sm:p-6 space-y-4">
            {recentActivity.map((activity, index) => {
              const IconComponent = iconMap[activity.icon];
              return (
                <div
                  key={index}
                  className="flex items-start gap-4 p-3 rounded-xl border border-slate-100/70 dark:border-slate-800/50 bg-white/40 dark:bg-slate-950/20 hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-all duration-300"
                >
                  {/* Icon */}
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0 mt-0.5">
                    {IconComponent ? (
                      <IconComponent className={cn("h-4 w-4", activity.color || "text-[#EF7B55]")} />
                    ) : (
                      <Users className={cn("h-4 w-4", activity.color || "text-[#EF7B55]")} />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{activity.title}</p>
                      <Badge className="bg-indigo-50 hover:bg-indigo-50 text-indigo-700 border border-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30 text-[10px] px-2 font-bold whitespace-nowrap">
                        {activity.child}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed break-words font-medium">
                      {activity.description}
                    </p>

                    <p className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center font-bold">
                      <Clock className="mr-1 h-3.5 w-3.5 text-slate-400" />
                      <span>{activity.time}</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/60 shadow-xl shadow-slate-100/40 dark:shadow-none rounded-2xl overflow-hidden w-full">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/20 text-[#EF7B55]">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  Upcoming Events
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Important dates, evaluations, and milestones.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5 sm:p-6 space-y-4">
            {upcomingEvents.map((event, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl border border-slate-100/70 dark:border-slate-800/50 bg-white/40 dark:bg-slate-950/20 hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-all duration-300"
              >
                {/* Left section */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-100 truncate">{event.event}</h4>
                    <Badge className="bg-[#EF7B55]/10 hover:bg-[#EF7B55]/10 text-[#EF7B55] border border-orange-100 dark:bg-orange-950/20 dark:text-[#ffae91] dark:border-orange-900/30 text-[10px] px-2 font-bold whitespace-nowrap">
                      {event.child}
                    </Badge>
                  </div>

                  <div className="flex items-center text-xs text-slate-400 dark:text-slate-500 font-semibold gap-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>{event.date}</span>
                  </div>

                  <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-350 border-none font-bold text-[10px] uppercase tracking-wide">
                    {event.type}
                  </Badge>
                </div>

                {/* Right section */}
                <div className="shrink-0 self-start sm:self-center">
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

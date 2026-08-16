"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  BookOpen,
  TestTube,
  Upload,
  Star,
  Eye,
  Download,
  Play,
  Clock,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { Spinner } from "@/components/ui/spinner";
import { useOnboarding } from "@/components/teacher/teacher-onboarding";
import { cn } from "@/lib/utils";
import { useBrand } from "@/hooks/use-brand";

interface Stat {
  title: string;
  value: string | number;
  change: string;
}

interface RecentActivity {
  type: string;
  title: string;
  action: string;
  time: string;
}

interface Performance {
  course_completion_rate: number;
  test_pass_rate: number;
}

interface TopCourse {
  title: string;
  students: number;
  rating?: number;
  revenue?: string;
  progress: number;
}

interface RecentMaterial {
  title: string;
  type: string;
  size: string;
  views?: number;
  downloads?: number;
}

interface TeacherOverviewData {
  stats: Stat[];
  recent_activity: RecentActivity[];
  performance: Performance;
  top_courses: TopCourse[];
  recent_materials: RecentMaterial[];
}

export function TeacherOverview() {
  const brand = useBrand();
  const { data: session, status } = useSession();
  const [data, setData] = useState<TeacherOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { startTour, setReady } = useOnboarding();

  const sessionToken = useMemo(
    () => session?.user?.sessionToken || null,
    [session?.user?.sessionToken],
  );

  useEffect(() => {
    const fetchData = async () => {
      if (status !== "authenticated" || !sessionToken) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/teacher/overview", { method: "GET" });

        if (!res.ok) {
          console.error(
            "[TeacherOverview] Fetch failed with status:",
            res.status,
          );
          const errorData = await res.json().catch(() => ({}));
          const errorMessage =
            errorData.error || errorData.detail || "Failed to fetch data";

          if (res.status === 401 || res.status === 403) {
            setError("Session expired");
            setData(null);
            setLoading(false);
            return;
          }
          setError(errorMessage);
          setData(null);
          throw new Error(errorMessage);
        }

        const json = await res.json();
        setData(json);
        setError(null);
      } catch (e) {
        console.error("[TeacherOverview] Fetch error:", e);
        setError("Session expired");
        setData(null);
      }
      setLoading(false);
    };

    fetchData();
  }, [sessionToken, status]);

  useEffect(() => {
    if (!loading) {
      setReady(true);
    }
  }, [loading, setReady]);

  const getIconByType = (type: string) => {
    switch (type) {
      case "test":
        return TestTube;
      case "upload":
        return Upload;
      case "course":
        return BookOpen;
      default:
        return Clock;
    }
  };

  const getStatIcon = (title: string) => {
    if (title.includes("Students")) return Users;
    if (title.includes("Courses")) return BookOpen;
    if (title.includes("Tests")) return TestTube;
    return Upload;
  };

  const getStatColor = (title: string) => {
    if (title.includes("Students")) return "text-blue-600";
    if (title.includes("Courses")) return "text-green-600";
    if (title.includes("Tests")) return "text-purple-600";
    return "text-orange-600";
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-transparent">
        <Spinner size="md" className="text-orange-500" />
      </div>
    );
  }

  if (
    error === "Session expired" ||
    error === "Not authenticated" ||
    (status === "authenticated" && error === "Session expired")
  ) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Session Expired
            </CardTitle>
            <CardDescription className="text-center">
              Your session has expired or you are not authenticated. Please log
              in again to continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button
              onClick={() => (window.location.href = "/login")}
              className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Log In Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Error
            </CardTitle>
            <CardDescription className="text-center">{error}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-1 sm:p-2">
      {/* Premium Gradient Hero Header */}
      <div className={`relative overflow-hidden rounded-2xl ${brand.isNiMet ? "bg-gradient-to-r from-[#071a47] via-[#092552] to-[#006B3E]" : "bg-gradient-to-r from-slate-900 via-slate-800 to-[#e26d47]"} p-6 sm:p-8 text-white shadow-xl dark:shadow-none`}>
        <div className={`absolute right-0 top-0 h-64 w-64 -translate-y-12 translate-x-12 rounded-full ${brand.isNiMet ? "bg-[#FFC931]/15" : "bg-[#EF7B55]/15"} blur-3xl`} />
        <div className="absolute left-1/3 bottom-0 h-40 w-40 translate-y-12 rounded-full bg-indigo-500/15 blur-3xl" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <Badge className={`${brand.isNiMet ? "bg-[#FFC931]/20 text-[#FFC931] border-[#FFC931]/30 hover:bg-[#FFC931]/30" : "bg-[#EF7B55]/20 text-[#ffae91] border-[#EF7B55]/30 hover:bg-[#EF7B55]/30"} border px-3 py-1 font-semibold text-xs tracking-wide`}>
              {brand.isNiMet ? "NiMet Educator Portal" : "Academy Educator Portal"}
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-orange-100 bg-clip-text text-transparent">
              Teacher Dashboard Overview
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
              Welcome back! Monitor student registration, manage computer-based tests, publish video learning modules, and coordinate interactive live sessions in your premium digital classroom.
            </p>
          </div>
          
          <button
            onClick={startTour}
            title="Replay the dashboard tour"
            className="backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-xl shadow-md shrink-0 flex items-center gap-2 self-start sm:self-center px-4 py-2.5 transition-all duration-300 text-xs sm:text-sm"
          >
            <Sparkles className={`h-4 w-4 ${brand.isNiMet ? "text-[#FFC931]" : "text-[#ffae91]"} animate-pulse`} />
            <span>Take the Tour</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div id="tour-stats" className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {data.stats.map((stat, index) => {
          const Icon = getStatIcon(stat.title);
          return (
            <Card key={index} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/60 shadow-md hover:-translate-y-1 hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-bold text-slate-600 dark:text-slate-400 group-hover:text-[#EF7B55] transition-colors">
                  {stat.title}
                </CardTitle>
                <div className={cn(
                  "p-2 rounded-xl transition-colors shrink-0 shadow-sm bg-orange-50 dark:bg-orange-950/20 text-[#EF7B55]"
                )}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="space-y-1 pb-4">
                <div className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">{stat.value}</div>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">
                  <span className="text-emerald-500 font-bold">{stat.change}</span> from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card id="tour-quick-actions" className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/60 shadow-xl shadow-slate-100/40 dark:shadow-none rounded-2xl overflow-hidden w-full">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <CardTitle className="text-lg font-bold text-slate-850 dark:text-slate-100">Quick Actions</CardTitle>
            <CardDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold">Common tasks to get you started</CardDescription>
          </CardHeader>
          <CardContent className="p-5 sm:p-6 space-y-4">
            <Link href="/teacher/create-cbt" className="block w-full">
              <Button className="w-full justify-start bg-slate-50 hover:bg-[#F797712a] border border-slate-150 dark:border-slate-800 dark:bg-slate-950/20 dark:hover:bg-slate-900/20 text-slate-800 dark:text-slate-200 font-bold rounded-xl h-11 transition-all">
                <TestTube className="mr-2.5 h-4.5 w-4.5 text-[#EF7B55]" />
                Create CBT Test
              </Button>
            </Link>
            <Link href="/teacher/learning-module" className="block w-full">
              <Button className="w-full justify-start bg-slate-50 hover:bg-[#F797712a] border border-slate-150 dark:border-slate-800 dark:bg-slate-950/20 dark:hover:bg-slate-900/20 text-slate-800 dark:text-slate-200 font-bold rounded-xl h-11 transition-all">
                <BookOpen className="mr-2.5 h-4.5 w-4.5 text-[#EF7B55]" />
                Create Learning Module
              </Button>
            </Link>
            <Link href="/teacher/student-analytics" className="block w-full">
              <Button className="w-full justify-start bg-slate-50 hover:bg-[#F797712a] border border-slate-150 dark:border-slate-800 dark:bg-slate-950/20 dark:hover:bg-slate-900/20 text-slate-800 dark:text-slate-200 font-bold rounded-xl h-11 transition-all">
                <Users className="mr-2.5 h-4.5 w-4.5 text-[#EF7B55]" />
                View Student Analysis
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/60 shadow-xl shadow-slate-100/40 dark:shadow-none rounded-2xl overflow-hidden w-full">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <CardTitle className="text-lg font-bold text-slate-850 dark:text-slate-100">Recent Activity</CardTitle>
            <CardDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold">Latest updates from your courses</CardDescription>
          </CardHeader>
          <CardContent className="p-5 sm:p-6 space-y-4">
            {data.recent_activity.slice(0, 3).map((activity, index) => {
              const Icon = getIconByType(activity.type);
              return (
                <div key={index} className="flex items-start gap-4 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60 bg-white/40 dark:bg-slate-950/20 hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-all duration-300">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0 mt-0.5">
                    <Icon className="h-4 w-4 text-[#EF7B55]" />
                  </div>
                  <div className="flex-1 space-y-1 min-w-0">
                    <p className="text-sm font-bold text-slate-850 dark:text-slate-150 truncate">{activity.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{activity.action}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center font-bold">
                      <Clock className="mr-1 h-3.5 w-3.5 text-slate-450" />
                      <span>{activity.time}</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Performance Overview */}
        <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/60 shadow-xl shadow-slate-100/40 dark:shadow-none rounded-2xl overflow-hidden w-full">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <CardTitle className="text-lg font-bold text-slate-850 dark:text-slate-100">Performance Metrics</CardTitle>
            <CardDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold">Evaluation stats for this term</CardDescription>
          </CardHeader>
          <CardContent className="p-5 sm:p-6 space-y-5">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-600 dark:text-slate-400">
                <span className="uppercase tracking-wider">Test Pass Rate</span>
                <span className="text-emerald-500 text-sm font-extrabold">{data.performance.test_pass_rate}%</span>
              </div>
              <Progress
                value={data.performance.test_pass_rate}
                className="h-2.5 bg-slate-100 dark:bg-slate-800 [&>div]:bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:to-emerald-600 rounded-full"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-600 dark:text-slate-400">
                <span className="uppercase tracking-wider">Course Completion Rate</span>
                <span className="text-indigo-500 text-sm font-extrabold">{data.performance.course_completion_rate}%</span>
              </div>
              <Progress
                value={data.performance.course_completion_rate}
                className="h-2.5 bg-slate-100 dark:bg-slate-800 [&>div]:bg-gradient-to-r [&>div]:from-indigo-500 [&>div]:to-indigo-600 rounded-full"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Courses */}
      <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/60 shadow-xl shadow-slate-100/40 dark:shadow-none rounded-2xl overflow-hidden w-full">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/20 text-[#EF7B55]">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100">Top Performing Courses</CardTitle>
              <CardDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Your most successful learning cohorts this month</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {data.top_courses.slice(0, 3).map((course, index) => (
              <div
                key={index}
                className="p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white/60 dark:bg-slate-950/40 backdrop-blur-sm shadow-sm hover:shadow-md hover:border-orange-200/50 dark:hover:border-slate-700/60 transition-all duration-300 space-y-4 relative overflow-hidden group"
              >
                {/* Visual marker */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#EF7B55] to-orange-500" />
                
                <h4 className="font-bold text-slate-805 dark:text-slate-100 leading-snug group-hover:text-[#EF7B55] transition-colors truncate">{course.title}</h4>
                
                <div className="space-y-2 pt-1.5">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-450">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-slate-455" />
                      <span>{course.students} Students</span>
                    </div>
                    {course.revenue && (
                      <span className="text-emerald-500 font-extrabold">{course.revenue}</span>
                    )}
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                      <span>Completion Rate</span>
                      <span>{course.progress}%</span>
                    </div>
                    <Progress
                      value={course.progress}
                      className="h-2 bg-slate-100 dark:bg-slate-850 [&>div]:bg-gradient-to-r [&>div]:from-[#EF7B55] [&>div]:to-orange-500 rounded-full"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Materials */}
      <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/60 shadow-xl shadow-slate-100/40 dark:shadow-none rounded-2xl overflow-hidden w-full">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100">Recently Uploaded Materials</CardTitle>
              <CardDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Your latest uploaded resource content and files</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5 sm:p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.recent_materials.slice(0, 3).map((material, index) => {
              const Icon =
                material.type.includes("Video") ||
                material.type.includes("Audio")
                  ? Play
                  : Download;
              return (
                <div key={index} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white/40 dark:bg-slate-950/20 hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-all duration-300 flex items-start gap-4">
                  <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0">
                    <Icon className="h-4.5 w-4.5 text-[#EF7B55]" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <h5 className="font-bold text-sm text-slate-855 dark:text-slate-150 truncate leading-snug">{material.title}</h5>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                      {material.type} &bull; {material.size}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
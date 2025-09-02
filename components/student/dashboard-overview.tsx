"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Clock,
  Trophy,
  TrendingUp,
  Play,
  Code,
  TestTube,
  Calendar,
  Star,
  Medal,
  Zap,
  LogIn,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

export function DashboardOverview() {
  const { data: session, status } = useSession();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Helper function to capitalize first letters of each word
  const capitalizeName = (name) => {
    if (!name) return "User";
    return name
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const handleLogout = async () => {
    console.log("[DashboardOverview] Initiating logout, sessionToken:", session?.user?.sessionToken);
    try {
      const response = await fetch("/api/auth/logout-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      console.log("[DashboardOverview] Logout API response status:", response.status);
      const data = await response.json();
      console.log("[DashboardOverview] Logout API response:", data);
      if (!response.ok) {
        console.error("[DashboardOverview] Logout failed:", data);
        throw new Error(data.error || "Logout failed");
      }
      console.log("[DashboardOverview] Logout successful, redirecting to /login");
      document.cookie = "next-auth.session-token=; Max-Age=0; path=/; secure";
      document.cookie = "next-auth.csrf-token=; Max-Age=0; path=/; secure";
      window.location.href = "/login";
    } catch (error) {
      console.error("[DashboardOverview] Logout error:", error);
      document.cookie = "next-auth.session-token=; Max-Age=0; path=/; secure";
      document.cookie = "next-auth.csrf-token=; Max-Age=0; path=/; secure";
      window.location.href = "/login";
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      console.log("[DashboardOverview] Initiating fetch for /api/student/dashboard-overview");
      if (status !== "authenticated" || !session?.user?.sessionToken) {
        console.log("[DashboardOverview] Session not authenticated, status:", status, "sessionToken:", session?.user?.sessionToken);
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      try {
        console.log("[DashboardOverview] Fetching from /api/student/dashboard-overview with token:", session.user.sessionToken);
        const res = await fetch("/api/student/dashboard-overview", {
          headers: {
            Authorization: `Api-Key GenYD7kB.PNsqar8GzuhbHjhDT7DesVvbUPeMD7Vl`,
            "Content-Type": "application/json",
            "X-Session-Token": session.user.sessionToken,
          },
        });
        console.log("[DashboardOverview] Fetch response status:", res.status);
        if (!res.ok) {
          console.error("[DashboardOverview] Fetch failed with status:", res.status);
          if (res.status === 401 || res.status === 403) {
            setError("Session expired");
            setData(null); // Prevent fallback data on session expiry
            setLoading(false);
            return;
          }
          setError("Failed to fetch data");
          setData(null); // Use null for other errors to trigger error state
          throw new Error("Fetch failed");
        }
        const json = await res.json();
        console.log("[DashboardOverview] Fetch response data:", json);
        setData(json);
        setError(null); // Clear error on success
      } catch (e) {
        console.error("[DashboardOverview] Fetch error:", e);
        setError("Session expired"); // Assume session expiry for any error when authenticated
        setData(null);
      }
      setLoading(false);
    };
    fetchData();
  }, [session, status]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="md" className="text-orange-500" />
      </div>
    );
  }

  if (error === "Session expired" || error === "Not authenticated" || (status === "authenticated" && error === "Session expired")) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Session Expired</CardTitle>
            <CardDescription className="text-center">
              Your session has expired or you are not authenticated. Please log in again to continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={handleLogout} className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Log In Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-6">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Error</CardTitle>
            <CardDescription className="text-center">{error}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => window.location.reload()} className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const recentCourses = data?.recent_courses ?? [
    {
      title: "No Courses",
      progress: 0,
      duration: "N/A",
      nextLesson: "N/A",
    },
  ];

  const upcomingTests = data?.upcoming_tests?.map((test) => ({
    title: test.title,
    date: new Date(test.date).toLocaleString(),
    duration: test.duration,
    testId: test.testId,
  })) ?? [
    {
      title: "No Upcoming Tests",
      date: "N/A",
      duration: "N/A",
      testId: null,
    },
  ];

  const handleTestClick = (testId) => {
    if (testId) {
      console.log("[DashboardOverview] Navigating to test:", testId);
      router.push(`/student/cbt?testId=${testId}`);
    } else {
      console.log("[DashboardOverview] No testId provided, navigation skipped");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {capitalizeName(data?.user?.display_name)}!</h1>
        <p className="text-muted-foreground">Continue your learning journey</p>
        {error && <p className="text-yellow-600 text-sm">{error}</p>}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Courses Enrolled
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.stats?.courses_enrolled ?? 0}</div>
            <p className="text-xs text-muted-foreground">+{data?.stats?.courses_enrolled ?? 0} from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Learned</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.stats?.hours_learned ?? 0}</div>
            <p className="text-xs text-muted-foreground">+{data?.stats?.hours_learned ?? 0} this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificates</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.stats?.certificates ?? 0}</div>
            <p className="text-xs text-muted-foreground">{data?.stats?.certificates ?? 0} in progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Streak</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.stats?.streak_days ?? 0} days</div>
            <p className="text-xs text-muted-foreground">Keep it up!</p>
          </CardContent>
        </Card>
      </div>

      {/* Gamification Overview Section */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-600" />
              <CardTitle className="text-yellow-800">Points & Level</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-yellow-700">{data?.gamification?.xp ?? 0} XP</div>
              <Badge className="bg-yellow-100 text-yellow-700">
                {data?.gamification?.level_name ?? "N/A"}
              </Badge>
              <Progress value={data?.gamification?.progress_to_next_pct ?? 0} className="h-2" />
              <p className="text-sm text-yellow-600">
                {data?.gamification?.xp_to_next ?? 0} XP to next level
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-blue-800">Achievements</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-blue-700">{data?.gamification?.achievements?.unlocked ?? 0} / {data?.gamification?.achievements?.total ?? 0}</div>
              <p className="text-sm text-blue-600">Recent: {data?.gamification?.achievements?.recent ?? "None"}</p>
              <div className="flex gap-1">
                {Array.from({ length: data?.gamification?.achievements?.unlocked ?? 0 }, (_, i) => (
                  <Medal key={i} className="h-4 w-4 text-yellow-500" />
                ))}
                {Array.from({ length: (data?.gamification?.achievements?.total ?? 0) - (data?.gamification?.achievements?.unlocked ?? 0) }, (_, i) => (
                  <Medal key={i + (data?.gamification?.achievements?.unlocked ?? 0)} className="h-4 w-4 text-gray-300" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <CardTitle className="text-green-800">Leaderboard</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-green-700">#{data?.gamification?.leaderboard?.org_rank ?? "N/A"}</div>
              <p className="text-sm text-green-600">in your school</p>
              <div className="flex items-center gap-1 text-sm text-green-600">
                <Zap className="h-3 w-3" />
                <span>Global rank: N/A</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Continue Learning */}
        <Card>
          <CardHeader>
            <CardTitle>Continue Learning</CardTitle>
            <CardDescription>Pick up where you left off</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentCourses.map((course, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{course.title}</h4>
                  <Badge variant="secondary">{course.duration}</Badge>
                </div>
                <Progress value={course.progress} className="h-2" />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{course.progress}% complete</span>
                  <Button
                    className="border border-slate-300 mt-2 rounded-lg"
                    variant="ghost"
                    size="sm"
                  >
                    <Play className="mr-2 h-3 w-3" />
                    Continue
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Next: {course.nextLesson}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Tests */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Tests</CardTitle>
            <CardDescription>
              Don't miss your scheduled assessments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingTests.map((test, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                onClick={() => handleTestClick(test.testId)}
              >
                <div className="space-y-1">
                  <h4 className="font-medium">{test.title}</h4>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-1 h-3 w-3" />
                    {test.date}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" />
                    {test.duration}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent parent div's onClick from firing
                    handleTestClick(test.testId);
                  }}
                >
                  <TestTube className="mr-2 h-3 w-3" />
                  Start
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Jump into your favorite learning activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button className="h-20 flex-col gap-2 bg-transparent" variant="outline">
              <Code className="h-6 w-6" />
              <span>Practice Coding</span>
            </Button>
            <Button className="h-20 flex-col gap-2 bg-transparent" variant="outline">
              <TestTube className="h-6 w-6" />
              <span>Take a Quiz</span>
            </Button>
            <Button className="h-20 flex-col gap-2 bg-transparent" variant="outline">
              <BookOpen className="h-6 w-6" />
              <span>Browse Resources</span>
            </Button>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}
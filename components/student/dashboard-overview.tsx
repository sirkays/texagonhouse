"use client";

import {useState, useEffect, useMemo} from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Progress} from "@/components/ui/progress";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {
  BookOpen,
  Clock,
  Trophy,
  TrendingUp,
  Play,
  TestTube,
  Calendar,
  Star,
  Medal,
  Zap,
  LogIn,
  Video,
} from "lucide-react";
import {signOut, useSession} from "next-auth/react";
import {useRouter} from "next/navigation";
import {Spinner} from "@/components/ui/spinner";
import {useStudentTheme} from "@/components/student/useStudentTheme";

interface LiveSession {
  id: string;
  title: string;
  scheduled_at: string;
  join_url?: string;
}

interface Test {
  title: string;
  date: string;
  duration: string;
  testId: string;
}

export function DashboardOverview() {
  const {data: session, status} = useSession();
  const {theme} = useStudentTheme();
  const isAero = theme === "aero-premium";
  const [data, setData] = useState(null);
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveSessionsLoading, setLiveSessionsLoading] = useState(true);
  const [testsLoading, setTestsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liveSessionsError, setLiveSessionsError] = useState<string | null>(
    null,
  );
  const [testsError, setTestsError] = useState<string | null>(null);
  const router = useRouter();
  const sessionToken = useMemo(
    () => session?.user?.sessionToken || null,
    [session?.user?.sessionToken],
  );

  // Helper function to capitalize first letters of each word
  const capitalizeName = (name: any) => {
    if (!name) return "User";
    return name
      .split(" ")
      .map(
        (word: any) =>
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
      )
      .join(" ");
  };
  async function fetchWithTimeout(
    url: string,
    options: any = {},
    timeout = 40000,
  ) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timer);
      return response;
    } catch (err) {
      clearTimeout(timer);
      throw err;
    }
  }

  function getOrCreateDeviceId(userId?: string | number) {
    if (typeof window === "undefined") return "";

    const STORAGE_KEY = `cbt:${userId}:cbtDeviceId`;

    // ✅ Fallback: anonymous / pre-login device ID
    let deviceId = localStorage.getItem(STORAGE_KEY);

    if (!deviceId) {
      deviceId = `cbt-${userId}-${crypto.randomUUID()}`;
      localStorage.setItem(STORAGE_KEY, deviceId);
    }

    return deviceId;
  }
  
  const handleLogout = async () => {
    try {
      // 1. Call your custom backend logout
      const response = await fetch("/api/auth/logout-route", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
      });

      if (!response.ok) {
        console.error("[AdminLayout] Backend logout failed");
      }

      await signOut({redirect: false});

      window.location.href = "/login";
    } catch (error) {
      console.error("[AdminLayout] Logout error:", error);

      // Fallback: Ensure the user is still visually logged out if an error occurs
      await signOut({redirect: false});
      window.location.href = "/login";
    }
  };

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      if (status !== "authenticated" || !session?.user?.sessionToken) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      try {
        const res = await fetchWithTimeout(
          "/api/student/dashboard-overview",
          {
            headers: {
              "Content-Type": "application/json",
              "X-Session-Token": sessionToken,
            },
          },
          40000,
        );
        if (!res.ok) {
          console.error(
            "[DashboardOverview] Fetch failed with status:",
            res.status,
          );
          if (res.status === 401 || res.status === 403) {
            setError("Session expired");
            setData(null);
            setLoading(false);
            return;
          }
          setError("Failed to fetch data");
          setData(null);
          throw new Error("Fetch failed");
        }
        const json = await res.json();
        setData(json);
        setError(null);
      } catch (e) {
        console.error("[DashboardOverview] Fetch error:", e);
        setError("Session expired");
        setData(null);
      }
      setLoading(false);
    };

    // Fetch live sessions
    const fetchLiveSessions = async () => {
      if (status !== "authenticated" || !session?.user?.sessionToken) {
        setLiveSessionsError("Not authenticated");
        setLiveSessionsLoading(false);
        return;
      }

      try {
        const res = await fetchWithTimeout(
          "/api/teacher/live-session/",
          {
            headers: {
              "Content-Type": "application/json",
              "X-Session-Token": sessionToken,
            },
          },
          40000,
        );
        if (!res.ok) {
          console.error(
            "[DashboardOverview] Live sessions fetch failed with status:",
            res.status,
          );
          const errorData = await res.json().catch(() => ({}));
          const errorMessage =
            errorData.error || "Failed to fetch live sessions";
          if (res.status === 401 || res.status === 403) {
            setLiveSessionsError("Session expired");
            setLiveSessions([]);
            setLiveSessionsLoading(false);
            return;
          }
          throw new Error(errorMessage);
        }
        const json = await res.json();
        console.log(json);
        const currentDate = new Date();
        const sessions: LiveSession[] = (json.live_sessions || [])
          .filter(
            (session: any) => new Date(session.scheduled_at) > currentDate,
          )
          .map((session: any) => ({
            id: session.id,
            title: session.title,
            scheduled_at: session.scheduled_at,
            join_url: session.join_url,
          }));
        setLiveSessions(sessions);
        setLiveSessionsError(null);
      } catch (e) {
        console.error("[DashboardOverview] Live sessions fetch error:", e);
        setLiveSessionsError("Failed to fetch live sessions");
        setLiveSessions([]);
      }
      setLiveSessionsLoading(false);
    };

    // Fetch upcoming tests
    const fetchTests = async () => {
      if (status !== "authenticated" || !session?.user?.sessionToken) {
        setTestsError("Not authenticated");
        setTestsLoading(false);
        return;
      }
      const deviceId = getOrCreateDeviceId(session?.user?.id?.toString());
      try {
        const res = await fetchWithTimeout(
          `/api/student/cbt`,
          {
            headers: {
              "Content-Type": "application/json",
              "X-Session-Token": sessionToken,
              ...(deviceId ? {"X-Device-Id": deviceId} : {}),
            },
          },
          400000,
        );
        if (!res.ok) {
          console.error(
            "[DashboardOverview] Tests fetch failed with status:",
            res.status,
          );
          const errorData = await res.json().catch(() => ({}));
          const errorMessage = errorData.error || "Failed to fetch tests";
          if (res.status === 401 || res.status === 403) {
            setTestsError("Session expired");
            setTests([]);
            setTestsLoading(false);
            return;
          }
          throw new Error(errorMessage);
        }
        const json = await res.json();
        const currentDate = new Date();
        const tests: Test[] = (json.tests || []).map((test: any) => ({
          title: test.title,
          date: test.startsAt
            ? new Date(test.startsAt).toLocaleString()
            : "Available Now",
          duration: test.duration,
          testId: test.id,
        }));
        setTests(tests);
        setTestsError(null);
      } catch (e) {
        console.error("[DashboardOverview] Tests fetch error:", e);
        setTestsError("Failed to fetch tests");
        setTests([]);
      }
      setTestsLoading(false);
    };

    fetchData();
    fetchLiveSessions();
    fetchTests();
  }, [sessionToken, status]);

  if (loading || liveSessionsLoading || testsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-transparent">
        <Spinner size="md" className="text-orange-500" />
      </div>
    );
  }

  if (
    error === "Session expired" ||
    error === "Not authenticated" ||
    liveSessionsError === "Session expired" ||
    liveSessionsError === "Not authenticated" ||
    testsError === "Session expired" ||
    testsError === "Not authenticated" ||
    (status === "authenticated" &&
      (error === "Session expired" ||
        liveSessionsError === "Session expired" ||
        testsError === "Session expired"))
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
            <Button onClick={handleLogout} className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Log In Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (
    (error && !data) ||
    (liveSessionsError && !liveSessions.length) ||
    (testsError && !tests.length)
  ) {
    return (
      <div className="p-6">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Error
            </CardTitle>
            <CardDescription className="text-center">
              {error || liveSessionsError || testsError}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2">
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

  const handleTestClick = (testId: string) => {
    if (testId) {
      router.push(`/student/cbt?testId=${testId}`);
    } else {
      console.log("[DashboardOverview] No testId provided, navigation skipped");
    }
  };

  const handleSessionClick = (joinUrl: string) => {
    if (joinUrl) {
      window.location.href = joinUrl;
    } else {
      router.push("/main/home");
    }
  };

  return (
    // <div className="space-y-6">
    //   <div>
    //     <h1 className="text-3xl font-bold">
    //       Welcome back, {capitalizeName(data?.user?.display_name)}!
    //     </h1>
    //     <p className="text-muted-foreground">Continue your learning journey</p>
    //     {error && <p className="text-yellow-600 text-sm">{error}</p>}
    //     {liveSessionsError && (
    //       <p className="text-yellow-600 text-sm">{liveSessionsError}</p>
    //     )}
    //     {testsError && <p className="text-yellow-600 text-sm">{testsError}</p>}
    //   </div>

    //   {/* Stats Cards */}
    //   <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    //     <Card className="bg-transparent border-none shadow-md">
    //       <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    //         <CardTitle className="text-sm font-medium">
    //           Courses Enrolled
    //         </CardTitle>
    //         <BookOpen className="h-4 w-4 text-muted-foreground" />
    //       </CardHeader>
    //       <CardContent>
    //         <div className="text-2xl font-bold">
    //           {data?.stats?.courses_enrolled ?? 0}
    //         </div>
    //         <p className="text-xs text-muted-foreground">
    //           +{data?.stats?.courses_enrolled ?? 0} from last month
    //         </p>
    //       </CardContent>
    //     </Card>
    //     <Card className="bg-transparent border-none shadow-md">
    //       <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    //         <CardTitle className="text-sm font-medium">Badges Earned</CardTitle>
    //         <Clock className="h-4 w-4 text-muted-foreground" />
    //       </CardHeader>
    //       <CardContent>
    //         <div className="text-2xl font-bold">
    //           {data?.stats?.badges_earned ?? 0}
    //         </div>
    //         <p className="text-xs text-muted-foreground">
    //           +{data?.stats?.badges_earned ?? 0} this week
    //         </p>
    //       </CardContent>
    //     </Card>
    //     <Card className="bg-transparent border-none shadow-md">
    //       <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    //         <CardTitle className="text-sm font-medium">Certificates</CardTitle>
    //         <Trophy className="h-4 w-4 text-muted-foreground" />
    //       </CardHeader>
    //       <CardContent>
    //         <div className="text-2xl font-bold">
    //           {data?.stats?.certificates ?? 0}
    //         </div>
    //         <p className="text-xs text-muted-foreground">
    //           {data?.stats?.certificates ?? 0} in progress
    //         </p>
    //       </CardContent>
    //     </Card>
    //     <Card className="bg-transparent border-none shadow-md">
    //       <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    //         <CardTitle className="text-sm font-medium">Streak</CardTitle>
    //         <TrendingUp className="h-4 w-4 text-muted-foreground" />
    //       </CardHeader>
    //       <CardContent>
    //         <div className="text-2xl font-bold">
    //           {data?.stats?.streak_days ?? 0} days
    //         </div>
    //         <p className="text-xs text-muted-foreground">Keep it up!</p>
    //       </CardContent>
    //     </Card>
    //   </div>

    //   {/* Gamification Overview Section */}
    //   <div className="grid gap-6 md:grid-cols-3">
    //     <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
    //       <CardHeader>
    //         <div className="flex items-center gap-2">
    //           <Star className="h-5 w-5 text-yellow-600" />
    //           <CardTitle className="text-yellow-800">Points & Level</CardTitle>
    //         </div>
    //       </CardHeader>
    //       <CardContent>
    //         <div className="space-y-2">
    //           <div className="text-2xl font-bold text-yellow-700">
    //             {data?.gamification?.xp ?? 0} XP
    //           </div>
    //           <Badge className="bg-yellow-100 text-yellow-700">
    //             {data?.gamification?.level_name ?? "N/A"}
    //           </Badge>
    //           <Progress
    //             value={data?.gamification?.progress_to_next_pct ?? 0}
    //             className="h-2"
    //           />
    //           <p className="text-sm text-yellow-600">
    //             {data?.gamification?.xp_to_next ?? 0} XP to next level
    //           </p>
    //         </div>
    //       </CardContent>
    //     </Card>

    //     <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
    //       <CardHeader>
    //         <div className="flex items-center gap-2">
    //           <Trophy className="h-5 w-5 text-blue-600" />
    //           <CardTitle className="text-blue-800">Achievements</CardTitle>
    //         </div>
    //       </CardHeader>
    //       <CardContent>
    //         <div className="space-y-2">
    //           <div className="text-2xl font-bold text-blue-700">
    //             {data?.gamification?.achievements?.unlocked ?? 0} /{" "}
    //             {data?.gamification?.achievements?.total ?? 0}
    //           </div>
    //           <p className="text-sm text-blue-600">
    //             Recent: {data?.gamification?.achievements?.recent ?? "None"}
    //           </p>
    //           <div className="flex gap-1">
    //             {Array.from(
    //               {length: data?.gamification?.achievements?.unlocked ?? 0},
    //               (_, i) => (
    //                 <Medal key={i} className="h-4 w-4 text-yellow-500" />
    //               )
    //             )}
    //             {Array.from(
    //               {
    //                 length:
    //                   (data?.gamification?.achievements?.total ?? 0) -
    //                   (data?.gamification?.achievements?.unlocked ?? 0),
    //               },
    //               (_, i) => (
    //                 <Medal
    //                   key={
    //                     i + (data?.gamification?.achievements?.unlocked ?? 0)
    //                   }
    //                   className="h-4 w-4 text-gray-300"
    //                 />
    //               )
    //             )}
    //           </div>
    //         </div>
    //       </CardContent>
    //     </Card>

    //     <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
    //       <CardHeader>
    //         <div className="flex items-center gap-2">
    //           <TrendingUp className="h-5 w-5 text-green-600" />
    //           <CardTitle className="text-green-800">Leaderboard</CardTitle>
    //         </div>
    //       </CardHeader>
    //       <CardContent>
    //         <div className="space-y-2">
    //           <div className="text-2xl font-bold text-green-700">
    //             #{data?.gamification?.leaderboard?.org_rank ?? "N/A"}
    //           </div>
    //           <p className="text-sm text-green-600">in your school</p>
    //           <div className="flex items-center gap-1 text-sm text-green-600">
    //             <Zap className="h-3 w-3" />
    //             <span>
    //               Global rank: #
    //               {data?.gamification?.leaderboard?.global_rank ?? "N/A"}
    //             </span>
    //           </div>
    //         </div>
    //       </CardContent>
    //     </Card>
    //   </div>

    //   <div className="grid gap-6 md:grid-cols-2">
    //     {/* Continue Learning */}
    //     <Card className="bg-transparent border-none shadow-md">
    //       <CardHeader>
    //         <CardTitle>Continue Learning</CardTitle>
    //         <CardDescription>Pick up where you left off</CardDescription>
    //       </CardHeader>
    //       <CardContent className="space-y-4">
    //         {recentCourses.map((course, index) => (
    //           <div key={index} className="space-y-2">
    //             <div className="flex items-center justify-between">
    //               <h4 className="font-medium">{course.title}</h4>
    //               <Badge
    //                 className="bg-blue-100 text-blue-800"
    //                 variant="secondary">
    //                 {course.duration}
    //               </Badge>
    //             </div>
    //             <Progress value={course.progress} className="h-2" />
    //             <div className="flex items-center justify-between text-sm text-muted-foreground">
    //               <span>{course.progress}% complete</span>
    //               <Button
    //                 className="bg-transparent shadow-md"
    //                 variant="ghost"
    //                 size="sm">
    //                 <Play className="mr-2 h-3 w-3" />
    //                 Continue
    //               </Button>
    //             </div>
    //             <p className="text-sm text-muted-foreground">
    //               Next: {course.nextLesson}
    //             </p>
    //           </div>
    //         ))}
    //       </CardContent>
    //     </Card>

    //     {/* Upcoming Tests */}
    //     <Card className="bg-transparent border-none shadow-md">
    //       <CardHeader>
    //         <CardTitle>Upcoming Tests</CardTitle>
    //         <CardDescription>
    //           Don't miss your scheduled assessments
    //         </CardDescription>
    //       </CardHeader>
    //       <CardContent className="space-y-4">
    //         {tests.length > 0 ? (
    //           tests.map((test, index) => (
    //             <div
    //               key={index}
    //               className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
    //               onClick={() => handleTestClick(test.testId)}>
    //               <div className="space-y-1">
    //                 <h4 className="font-medium">{test.title}</h4>
    //                 <div className="flex items-center text-sm text-muted-foreground">
    //                   <Calendar className="mr-1 h-3 w-3" />
    //                   {test.date}
    //                 </div>
    //                 <div className="flex items-center text-sm text-muted-foreground">
    //                   <Clock className="mr-1 h-3 w-3" />
    //                   {test.duration}
    //                 </div>
    //               </div>
    //               <Button
    //                 className="bg-transparent  shadow-md"
    //                 size="sm"
    //                 variant={"ghost"}
    //                 onClick={(e) => {
    //                   e.stopPropagation();
    //                   handleTestClick(test.testId);
    //                 }}>
    //                 <TestTube className="mr-2 h-3 w-3" />
    //                 Start
    //               </Button>
    //             </div>
    //           ))
    //         ) : (
    //           <div className="text-sm text-muted-foreground">
    //             No upcoming tests
    //           </div>
    //         )}
    //       </CardContent>
    //     </Card>

    //     {/* Upcoming Live Sessions */}
    //     <Card className="bg-transparent border-none shadow-md">
    //       <CardHeader>
    //         <CardTitle>Upcoming Live Sessions</CardTitle>
    //         <CardDescription>Join your scheduled live sessions</CardDescription>
    //       </CardHeader>
    //       <CardContent className="space-y-4">
    //         {liveSessions.length > 0 ? (
    //           liveSessions.map((session, index) => (
    //             <div
    //               key={index}
    //               className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
    //               onClick={() => handleSessionClick(session.join_url)}>
    //               <div className="space-y-1">
    //                 <h4 className="font-medium">{session.title}</h4>
    //                 <div className="flex items-center text-sm text-muted-foreground">
    //                   <Calendar className="mr-1 h-3 w-3" />
    //                   {new Date(session.scheduled_at).toLocaleString()}
    //                 </div>
    //               </div>
    //               <Button
    //                 className="bg-transparent shadow-md"
    //                 size="sm"
    //                 variant={"ghost"}
    //                 onClick={(e) => {
    //                   e.stopPropagation();
    //                   handleSessionClick(session.join_url);
    //                 }}>
    //                 <Video className="mr-2 h-3 w-3" />
    //                 Join
    //               </Button>
    //             </div>
    //           ))
    //         ) : (
    //           <div className="text-sm text-muted-foreground">
    //             No upcoming live sessions
    //           </div>
    //         )}
    //       </CardContent>
    //     </Card>
    //   </div>
    // </div>

    <div className="space-y-6 px-3 sm:px-4 md:px-6">
      {/* Header */}
      {isAero ? (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-[#e26d47] p-6 sm:p-8 text-white shadow-xl">
          <div className="absolute right-0 top-0 h-64 w-64 -translate-y-12 translate-x-12 rounded-full bg-[#EF7B55]/15 blur-3xl" />
          <div className="absolute left-1/3 bottom-0 h-40 w-40 translate-y-12 rounded-full bg-indigo-500/15 blur-3xl" />
          
          <div className="relative z-10 space-y-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-orange-100 bg-clip-text text-transparent">
              Welcome back, {capitalizeName(data?.user?.display_name)}!
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-slate-200 font-semibold">
              Continue your learning journey
            </p>
          </div>
          
          {error && <p className="text-yellow-400 text-xs mt-2 relative z-10">{error}</p>}
          {liveSessionsError && (
            <p className="text-yellow-400 text-xs mt-2 relative z-10">{liveSessionsError}</p>
          )}
          {testsError && <p className="text-yellow-400 text-xs mt-2 relative z-10">{testsError}</p>}
        </div>
      ) : (
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight">
            Welcome back, {capitalizeName(data?.user?.display_name)}!
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Continue your learning journey
          </p>

          {error && <p className="text-yellow-600 text-xs">{error}</p>}
          {liveSessionsError && (
            <p className="text-yellow-600 text-xs">{liveSessionsError}</p>
          )}
          {testsError && <p className="text-yellow-600 text-xs">{testsError}</p>}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className={isAero 
          ? "bg-white/60 backdrop-blur-md border border-slate-200/40 shadow-sm rounded-2xl hover:translate-y-[-2px] hover:shadow-md transition-all duration-350" 
          : "bg-transparent border-none shadow-md"
        }>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs sm:text-sm font-semibold text-slate-700">
              Courses Enrolled
            </CardTitle>
            <BookOpen className={`h-4 w-4 ${isAero ? "text-[#EF7B55]" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-slate-850">
              {data?.stats?.courses_enrolled ?? 0}
            </div>
            <p className="text-[11px] sm:text-xs text-muted-foreground font-medium">
              +{data?.stats?.courses_enrolled ?? 0} from last month
            </p>
          </CardContent>
        </Card>

        <Card className={isAero 
          ? "bg-white/60 backdrop-blur-md border border-slate-200/40 shadow-sm rounded-2xl hover:translate-y-[-2px] hover:shadow-md transition-all duration-350" 
          : "bg-transparent border-none shadow-md"
        }>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs sm:text-sm font-semibold text-slate-700">
              Badges Earned
            </CardTitle>
            <Clock className={`h-4 w-4 ${isAero ? "text-[#EF7B55]" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-slate-850">
              {data?.stats?.badges_earned ?? 0}
            </div>
            <p className="text-[11px] sm:text-xs text-muted-foreground font-medium">
              +{data?.stats?.badges_earned ?? 0} this week
            </p>
          </CardContent>
        </Card>

        <Card className={isAero 
          ? "bg-white/60 backdrop-blur-md border border-slate-200/40 shadow-sm rounded-2xl hover:translate-y-[-2px] hover:shadow-md transition-all duration-350" 
          : "bg-transparent border-none shadow-md"
        }>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs sm:text-sm font-semibold text-slate-700">
              Certificates
            </CardTitle>
            <Trophy className={`h-4 w-4 ${isAero ? "text-[#EF7B55]" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-slate-850">
              {data?.stats?.certificates ?? 0}
            </div>
            <p className="text-[11px] sm:text-xs text-muted-foreground font-medium">
              {data?.stats?.certificates ?? 0} in progress
            </p>
          </CardContent>
        </Card>

        <Card className={isAero 
          ? "bg-white/60 backdrop-blur-md border border-slate-200/40 shadow-sm rounded-2xl hover:translate-y-[-2px] hover:shadow-md transition-all duration-350" 
          : "bg-transparent border-none shadow-md"
        }>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs sm:text-sm font-semibold text-slate-700">
              Streak
            </CardTitle>
            <TrendingUp className={`h-4 w-4 ${isAero ? "text-[#EF7B55]" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-slate-850">
              {data?.stats?.streak_days ?? 0} days
            </div>
            <p className="text-[11px] sm:text-xs text-muted-foreground font-medium">
              Keep it up!
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gamification Overview */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
        <Card className={isAero
          ? "bg-white/60 backdrop-blur-md border border-slate-200/40 shadow-sm rounded-2xl hover:translate-y-[-2px] hover:shadow-md transition-all duration-350"
          : "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200"
        }>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Star className={`h-5 w-5 ${isAero ? "text-amber-500" : "text-yellow-600"}`} />
              <CardTitle className={isAero ? "text-sm sm:text-base font-bold text-slate-800" : "text-sm sm:text-base text-yellow-800"}>
                Points & Level
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className={`text-xl sm:text-2xl font-bold ${isAero ? "text-slate-800" : "text-yellow-700"}`}>
              {data?.gamification?.xp ?? 0} XP
            </div>
            <Badge className={isAero 
              ? "bg-[#EF7B55]/10 text-[#EF7B55] hover:bg-[#EF7B55]/20 font-bold w-fit" 
              : "bg-yellow-100 text-yellow-700 w-fit"
            }>
              {data?.gamification?.level_name ?? "N/A"}
            </Badge>
            <Progress
              value={data?.gamification?.progress_to_next_pct ?? 0}
              className="h-2"
            />
            <p className={`text-xs sm:text-sm font-semibold ${isAero ? "text-slate-500" : "text-yellow-600"}`}>
              {data?.gamification?.xp_to_next ?? 0} XP to next level
            </p>
          </CardContent>
        </Card>

        <Card className={isAero
          ? "bg-white/60 backdrop-blur-md border border-slate-200/40 shadow-sm rounded-2xl hover:translate-y-[-2px] hover:shadow-md transition-all duration-350"
          : "bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200"
        }>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy className={`h-5 w-5 ${isAero ? "text-[#EF7B55]" : "text-blue-600"}`} />
              <CardTitle className={isAero ? "text-sm sm:text-base font-bold text-slate-800" : "text-sm sm:text-base text-blue-800"}>
                Achievements
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className={`text-xl sm:text-2xl font-bold ${isAero ? "text-slate-800" : "text-blue-700"}`}>
              {data?.gamification?.achievements?.unlocked ?? 0} /{" "}
              {data?.gamification?.achievements?.total ?? 0}
            </div>
            <p className={`text-xs sm:text-sm font-semibold ${isAero ? "text-slate-500" : "text-blue-600"}`}>
              Recent: {data?.gamification?.achievements?.recent ?? "None"}
            </p>
            <div className="flex gap-1 flex-wrap">
              {Array.from(
                {length: data?.gamification?.achievements?.unlocked ?? 0},
                (_, i) => (
                  <Medal key={i} className="h-4 w-4 text-yellow-500" />
                ),
              )}
              {Array.from(
                {
                  length:
                    (data?.gamification?.achievements?.total ?? 0) -
                    (data?.gamification?.achievements?.unlocked ?? 0),
                },
                (_, i) => (
                  <Medal
                    key={i + (data?.gamification?.achievements?.unlocked ?? 0)}
                    className="h-4 w-4 text-gray-300"
                  />
                ),
              )}
            </div>
          </CardContent>
        </Card>

        <Card className={isAero
          ? "bg-white/60 backdrop-blur-md border border-slate-200/40 shadow-sm rounded-2xl hover:translate-y-[-2px] hover:shadow-md transition-all duration-350"
          : "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
        }>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className={`h-5 w-5 ${isAero ? "text-emerald-500" : "text-green-600"}`} />
              <CardTitle className={isAero ? "text-sm sm:text-base font-bold text-slate-800" : "text-sm sm:text-base text-green-800"}>
                Leaderboard
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className={`text-xl sm:text-2xl font-bold ${isAero ? "text-slate-800" : "text-green-700"}`}>
              #{data?.gamification?.leaderboard?.org_rank ?? "N/A"}
            </div>
            <div className={`flex items-center gap-1 text-xs sm:text-sm font-semibold ${isAero ? "text-slate-500" : "text-green-600"}`}>
              <Zap className="h-3 w-3" />
              <span>
                Global rank #
                {data?.gamification?.leaderboard?.global_rank ?? "N/A"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Learning / Tests / Live Sessions */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Continue Learning */}
        <Card className={isAero
          ? "bg-white/60 backdrop-blur-md border border-slate-200/40 shadow-sm rounded-2xl hover:shadow-md transition-all duration-300"
          : "bg-transparent border-none shadow-md"
        }>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg font-bold text-slate-800">
              Continue Learning
            </CardTitle>
            <CardDescription className="text-slate-500 font-semibold">Pick up where you left off</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentCourses.map((course: any, index: any) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 text-sm sm:text-base">
                    {course.title}
                  </h4>
                  <Badge className={isAero
                    ? "bg-[#EF7B55]/10 text-[#EF7B55] hover:bg-[#EF7B55]/20 font-bold"
                    : "bg-blue-100 text-blue-800"
                  }>
                    {course.duration}
                  </Badge>
                </div>
                <Progress value={course.progress} className="h-2" />
                <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground font-semibold">
                  <span>{course.progress}% complete</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 font-semibold">
                  Next: {course.nextLesson}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Tests */}
        <Card className={isAero
          ? "bg-white/60 backdrop-blur-md border border-slate-200/40 shadow-sm rounded-2xl hover:shadow-md transition-all duration-300"
          : "bg-transparent border-none shadow-md"
        }>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-base sm:text-lg font-bold text-slate-800">
                Upcoming Tests
              </CardTitle>
              <CardDescription className="text-slate-500 font-semibold">
                Don't miss your scheduled assessments
              </CardDescription>
            </div>

            <Button
              className={isAero
                ? "border-[#EF7B55] text-[#EF7B55] hover:bg-[#EF7B55] hover:text-white rounded-xl shadow-sm font-bold bg-white/60 transition-all duration-300 mb-1"
                : "bg-transparent mb-1"
              }
              size="sm"
              variant={isAero ? "outline" : "outline"}
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/student/cbt`);
              }}>
              <TestTube className="mr-2 h-3 w-3" />
              View Test
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {tests.length > 0 ? (
              tests.map((test, index) => (
                <div
                  key={index}
                  className={isAero
                    ? "p-4 border border-slate-250/20 bg-white/40 hover:bg-white/70 rounded-xl hover:translate-y-[-1px] transition-all duration-300 cursor-pointer shadow-sm"
                    : "p-3 border rounded-lg"
                  }
                  onClick={() => handleTestClick(test.testId)}>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-800 text-sm sm:text-base">
                      {test.title}
                    </h4>
                    <div className="flex items-center text-xs sm:text-sm text-slate-500 font-semibold">
                      <Calendar className="mr-1 h-3 w-3 text-[#EF7B55]" />
                      {test.date}
                    </div>
                    <div className="flex items-center text-xs sm:text-sm text-slate-500 font-semibold">
                      <Clock className="mr-1 h-3 w-3 text-[#EF7B55]" />
                      {test.duration}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs sm:text-sm text-muted-foreground font-semibold">
                No upcoming tests
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Live Sessions */}
        <Card className={isAero
          ? "bg-white/60 backdrop-blur-md border border-slate-200/40 shadow-sm rounded-2xl hover:shadow-md transition-all duration-300"
          : "bg-transparent border-none shadow-md"
        }>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg font-bold text-slate-800">
              Upcoming Live Sessions
            </CardTitle>
            <CardDescription className="text-slate-500 font-semibold">Join your scheduled live sessions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {liveSessions.length > 0 ? (
              liveSessions.map((session, index) => (
                <div
                  key={index}
                  className={isAero
                    ? "flex items-center justify-between p-4 border border-slate-250/20 bg-white/40 hover:bg-white/70 rounded-xl hover:translate-y-[-1px] transition-all duration-300 cursor-pointer shadow-sm"
                    : "flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  }
                  onClick={() => handleSessionClick(session.join_url)}>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-800 text-sm sm:text-base">
                      {session.title}
                    </h4>
                    <div className="flex items-center text-xs sm:text-sm text-slate-500 font-semibold">
                      <Calendar className="mr-1 h-3 w-3 text-[#EF7B55]" />
                      {new Date(session.scheduled_at).toLocaleString()}
                    </div>
                  </div>
                  <Button
                    className={isAero
                      ? "border-[#EF7B55] text-[#EF7B55] hover:bg-[#EF7B55] hover:text-white rounded-xl shadow-sm font-bold bg-white/60 transition-all duration-300"
                      : "bg-transparent shadow-md"
                    }
                    size="sm"
                    variant={isAero ? "outline" : "ghost"}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSessionClick(session.join_url);
                    }}>
                    <Video className="mr-2 h-3 w-3" />
                    Join
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-xs sm:text-sm text-muted-foreground font-semibold">
                No upcoming live sessions
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

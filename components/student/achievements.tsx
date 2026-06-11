"use client";

import {useState, useEffect, useMemo} from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Progress} from "@/components/ui/progress";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {
  Trophy,
  Star,
  Target,
  Zap,
  Award,
  Medal,
  Crown,
  Gem,
  LogIn,
} from "lucide-react";
import {signOut, useSession} from "next-auth/react";
import {Button} from "@/components/ui/button";
import {Spinner} from "@/components/ui/spinner";
import {useStudentTheme} from "@/components/student/useStudentTheme";

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate: string | null;
  points: number;
  category: string;
  progress?: number;
  total?: number;
}

interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  earned: boolean;
  progress?: number;
  total?: number;
}

interface Stats {
  total_points: number;
  achievements_unlocked: number;
  achievements_total: number;
  badges_earned: number;
  badges_total: number;
  streak_current: number;
  streak_best: number;
}

interface AchievementsData {
  stats: Stats;
  achievements: Achievement[];
  badges: Badge[];
}

const iconMap: {[key: string]: React.ComponentType<{className?: string}>} = {
  star: Star,
  trophy: Trophy,
  target: Target,
  zap: Zap,
  award: Award,
  medal: Medal,
  crown: Crown,
  gem: Gem,
};

export function Achievements() {
  const {data: session, status} = useSession();
  const {theme} = useStudentTheme();
  const isAero = theme === "aero-premium";
  const [achievementsData, setAchievementsData] = useState<AchievementsData>({
    stats: {
      total_points: 0,
      achievements_unlocked: 0,
      achievements_total: 0,
      badges_earned: 0,
      badges_total: 0,
      streak_current: 0,
      streak_best: 0,
    },
    achievements: [],
    badges: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sessionToken = useMemo(
    () => session?.user?.sessionToken || null,
    [session?.user?.sessionToken]
  );

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
  
  useEffect(() => {
    const fetchAchievements = async () => {
      if (status !== "authenticated" || !sessionToken) {
        setError("Not authenticated");
        setAchievementsData({
          stats: {
            total_points: 0,
            achievements_unlocked: 0,
            achievements_total: 0,
            badges_earned: 0,
            badges_total: 0,
            streak_current: 0,
            streak_best: 0,
          },
          achievements: [],
          badges: [],
        });
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/student/achievements", {
          headers: {
            "Content-Type": "application/json",
            "X-Session-Token": sessionToken,
          },
        });
        if (!response.ok) {
          console.error(
            "[Achievements] Fetch failed with status:",
            response.status
          );
          const errorData = await response.json();
          if (response.status === 401 || response.status === 403) {
            setError("Session expired");
            setAchievementsData({
              stats: {
                total_points: 0,
                achievements_unlocked: 0,
                achievements_total: 0,
                badges_earned: 0,
                badges_total: 0,
                streak_current: 0,
                streak_best: 0,
              },
              achievements: [],
              badges: [],
            });
            setLoading(false);
            return;
          }
          setError(
            errorData.detail ||
              errorData.error ||
              "Failed to fetch achievements"
          );
          setAchievementsData({
            stats: {
              total_points: 0,
              achievements_unlocked: 0,
              achievements_total: 0,
              badges_earned: 0,
              badges_total: 0,
              streak_current: 0,
              streak_best: 0,
            },
            achievements: [],
            badges: [],
          });
          throw new Error("Fetch failed");
        }
        const data = await response.json();
        setAchievementsData(data);
        setError(null);
      } catch (e) {
        console.error("[Achievements] Fetch error:", e);
        setError("Failed to fetch achievements");
        setAchievementsData({
          stats: {
            total_points: 0,
            achievements_unlocked: 0,
            achievements_total: 0,
            badges_earned: 0,
            badges_total: 0,
            streak_current: 0,
            streak_best: 0,
          },
          achievements: [],
          badges: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [sessionToken, status]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
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
            <Button onClick={handleLogout} className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Log In Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !achievementsData) {
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
              <Trophy className="h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const earnedAchievements = achievementsData.achievements.filter(
    (a) => a.earned
  );
  const inProgressAchievements = achievementsData.achievements.filter(
    (a) => !a.earned
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Achievements & Badges</h1>
        <p className="text-muted-foreground">
          Track your learning milestones and unlock rewards
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 grid-cols-1 xs:grid-cols-2 md:grid-cols-4">
        {[
          { title: "Total Learning Points", value: achievementsData.stats.total_points.toLocaleString(), desc: "Accumulated through course completion", icon: Star, color: "text-yellow-600" },
          { title: "Achievements Unlocked", value: achievementsData.stats.achievements_unlocked, desc: `of ${achievementsData.stats.achievements_total} milestones achieved`, icon: Trophy, color: "text-blue-600" },
          { title: "Badges Earned", value: achievementsData.stats.badges_earned, desc: `of ${achievementsData.stats.badges_total} credentials earned`, icon: Medal, color: "text-purple-600" },
          { title: "Learning Streak", value: `${achievementsData.stats.streak_current} days`, desc: `Current streak • Best: ${achievementsData.stats.streak_best} days`, icon: Zap, color: "text-orange-600" }
        ].map((item, idx) => (
          <Card key={idx} className={isAero
            ? "bg-white/60 backdrop-blur-md border border-slate-200/40 shadow-sm rounded-2xl hover:translate-y-[-2px] hover:shadow-md transition-all duration-300"
            : ""
          }>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold text-slate-650 dark:text-slate-350">
                {item.title}
              </CardTitle>
              <item.icon className={`h-5 w-5 ${item.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-black ${isAero ? "text-slate-800 dark:text-white" : ""}`}>
                {item.value}
              </div>
              <p className="text-xs text-slate-450 dark:text-slate-500 font-semibold mt-1">
                {item.desc}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="achievements" className="space-y-4">
        <TabsList className={isAero
          ? "flex flex-col md:flex-row items-stretch md:items-center gap-2 bg-white/20 p-1.5 border border-slate-200/50 rounded-2xl w-full mb-8"
          : "bg-[#f797712e] text-slate-700 flex flex-col md:flex-row items-stretch md:items-center w-full gap-2 mb-8 p-1.5 rounded-2xl border border-slate-100"
        }>
          <TabsTrigger
            value="achievements"
            className={isAero
              ? "flex-1 text-center data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white font-bold rounded-xl px-4 py-2 text-sm transition-all duration-300"
              : "flex-1 text-center bg-transparent justify-center py-2 data-[state=active]:bg-[#EF7B55]/70 data-[state=active]:text-white gap-3 rounded-xl"
            }>
            Achievements
          </TabsTrigger>
          <TabsTrigger
            value="badges"
            className={isAero
              ? "flex-1 text-center data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white font-bold rounded-xl px-4 py-2 text-sm transition-all duration-300"
              : "flex-1 text-center bg-transparent justify-center py-2 data-[state=active]:bg-[#EF7B55]/70 data-[state=active]:text-white gap-3 rounded-xl"
            }>
            Badges
          </TabsTrigger>
          <TabsTrigger
            value="progress"
            className={isAero
              ? "flex-1 text-center data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white font-bold rounded-xl px-4 py-2 text-sm transition-all duration-300"
              : "flex-1 text-center bg-transparent justify-center py-2 data-[state=active]:bg-[#EF7B55]/70 data-[state=active]:text-white gap-3 rounded-xl"
            }>
            In Progress
          </TabsTrigger>
        </TabsList>

        <TabsContent value="achievements" className="space-y-6">
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
            {earnedAchievements.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="pt-8 pb-8 text-center">
                  <p className="text-base font-medium text-muted-foreground">
                    No achievements unlocked yet.
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Complete courses, quizzes, and learning activities to earn
                    your first milestone.
                  </p>
                </CardContent>
              </Card>
            ) : (
              earnedAchievements.map((achievement) => {
                const IconComponent = iconMap[achievement.icon] || Star;
                return (
                  <Card
                    key={achievement.id}
                    className={isAero
                      ? "bg-white/60 backdrop-blur-md rounded-2xl border border-[#EF7B55]/10 shadow-sm hover:shadow-md hover:translate-y-[-2px] transition-all duration-300"
                      : "border-[#EF7B55]/10 bg-gradient-to-b from-[#EF7B55]/5 to-white hover:shadow-md transition-shadow"
                    }>
                    <CardHeader className="pb-3">
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#EF7B55]/70">
                            <IconComponent className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-base font-semibold leading-tight">
                              {achievement.title}
                            </CardTitle>
                            <CardDescription className="mt-1 text-sm">
                              {achievement.description}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="border-[#EF7B55]/20 bg-[#EF7B55]/5 px-3 py-1 text-xs font-medium text-slate-700">
                          +{achievement.points} points
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          Earned{" "}
                          {achievement.earnedDate
                            ? `on ${achievement.earnedDate}`
                            : "—"}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {achievement.category}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="badges" className="space-y-6">
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
            {achievementsData.badges.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="pt-8 pb-8 text-center">
                  <p className="text-base font-medium text-muted-foreground">
                    No badges earned yet.
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Complete courses, master skills, and reach milestones to
                    unlock your first badge.
                  </p>
                </CardContent>
              </Card>
            ) : (
              achievementsData.badges.map((badge) => {
                const IconComponent = iconMap[badge.icon] || Medal;
                return (
                  <Card
                    key={badge.id}
                    className={isAero
                      ? `group relative border backdrop-blur-md rounded-2xl transition-all duration-300 hover:shadow-lg hover:translate-y-[-2px] ${
                          badge.earned
                            ? "border-[#EF7B55] bg-[#EF7B55]/10 shadow-sm shadow-orange-50/20"
                            : "border-slate-200/50 bg-white/60"
                        }`
                      : `border transition-all duration-200 hover:shadow-md ${
                          badge.earned
                            ? "border-[#EF7B55] bg-[#EF7B55]/10"
                            : "border-border"
                        }`
                    }>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                              badge.color
                            } ${
                              badge.earned
                                ? "opacity-100 bg-[#EF7B55]"
                                : "opacity-50"
                            }`}>
                            <IconComponent className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-base font-semibold leading-tight">
                              {badge.name}
                            </CardTitle>
                            <CardDescription className="mt-1 text-sm">
                              {badge.description}
                            </CardDescription>
                          </div>
                        </div>
                        {badge.earned && (
                          <Badge className="bg-[#EF7B55] text-white px-3 py-1 text-xs font-medium">
                            Earned
                          </Badge>
                        )}
                      </div>
                    </CardHeader>

                    {!badge.earned &&
                      badge.progress !== undefined &&
                      badge.total && (
                        <CardContent className="pt-0">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>Progress</span>
                              <span className="font-medium">
                                {badge.progress.toLocaleString()} /{" "}
                                {badge.total.toLocaleString()}
                              </span>
                            </div>
                            <Progress
                              value={(badge.progress / badge.total) * 100}
                              className="h-2"
                            />
                          </div>
                        </CardContent>
                      )}

                    {badge.earned && (
                      <CardContent className="pt-0 text-xs text-muted-foreground">
                        <span>Unlocked • Skill credential earned</span>
                      </CardContent>
                    )}
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
            {inProgressAchievements.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="pt-8 pb-8 text-center">
                  <p className="text-base font-medium text-muted-foreground">
                    No achievements in progress yet.
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Start a new challenge or continue learning to track your
                    progress here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              inProgressAchievements.map((achievement) => {
                const IconComponent = iconMap[achievement.icon] || Star;
                const progressPercent =
                  achievement.progress !== undefined && achievement.total
                    ? (achievement.progress / achievement.total) * 100
                    : 0;

                return (
                  <Card
                    key={achievement.id}
                    className={isAero
                      ? "bg-white/60 backdrop-blur-md border border-slate-200/50 rounded-2xl shadow-sm hover:shadow-lg hover:translate-y-[-2px] transition-all duration-300"
                      : "transition-all duration-200 hover:shadow-md"
                    }>
                    <CardHeader className="pb-3">
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100">
                            <IconComponent className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <CardTitle className="text-base font-semibold leading-tight">
                              {achievement.title}
                            </CardTitle>
                            <CardDescription className="mt-1 text-sm">
                              {achievement.description}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          +{achievement.points} pts
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">Progress</span>
                          <span className="font-medium">
                            {achievement.progress || 0} /{" "}
                            {achievement.total || 0}
                          </span>
                        </div>

                        <Progress value={progressPercent} className="h-2" />

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            {achievement.category}
                          </Badge>
                          <span>{Math.round(progressPercent)}% complete</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

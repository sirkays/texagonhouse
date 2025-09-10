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
import {useSession} from "next-auth/react";
import {Button} from "@/components/ui/button";
import {Spinner} from "@/components/ui/spinner";

// Remove local module augmentation; move it to a global .d.ts file for proper type extension

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
  const [achievementsData, setAchievementsData] =
    useState<AchievementsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sessionToken = useMemo(
    () => session?.user?.sessionToken || null,
    [session?.user?.sessionToken]
  );

  const handleLogout = async () => {
    console.log(
      "[Achievements] Initiating logout, sessionToken:",
      session?.user?.sessionToken
    );
    try {
      const response = await fetch("/api/auth/logout-route", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
      });
      console.log(
        "[Achievements] Logout API response status:",
        response.status
      );
      const data = await response.json();
      console.log("[Achievements] Logout API response:", data);
      if (!response.ok) {
        console.error("[Achievements] Logout failed:", data);
        throw new Error(data.error || "Logout failed");
      }
      console.log("[Achievements] Logout successful, redirecting to /login");
      document.cookie = "next-auth.session-token=; Max-Age=0; path=/; secure";
      document.cookie = "next-auth.csrf-token=; Max-Age=0; path=/; secure";
      window.location.href = "/login";
    } catch (error) {
      console.error("[Achievements] Logout error:", error);
      document.cookie = "next-auth.session-token=; Max-Age=0; path=/; secure";
      document.cookie = "next-auth.csrf-token=; Max-Age=0; path=/; secure";
      window.location.href = "/login";
    }
  };

  // Fallback data for UI stability
  const fallbackData: AchievementsData = {
    stats: {
      total_points: 7500,
      achievements_unlocked: 3,
      achievements_total: 6,
      badges_earned: 2,
      badges_total: 4,
      streak_current: 15,
      streak_best: 23,
    },
    achievements: [
      {
        id: 1,
        title: "First Steps",
        description: "Complete your first lesson",
        icon: "star",
        earned: true,
        earnedDate: "2024-01-15",
        points: 50,
        category: "Getting Started",
      },
      {
        id: 2,
        title: "Code Warrior",
        description: "Complete 10 coding exercises",
        icon: "trophy",
        earned: true,
        earnedDate: "2024-01-20",
        points: 200,
        category: "Coding",
      },
      {
        id: 3,
        title: "Quiz Master",
        description: "Score 90% or higher on 5 quizzes",
        icon: "target",
        earned: false,
        progress: 3,
        total: 5,
        points: 300,
        category: "Assessment",
      },
      {
        id: 4,
        title: "Streak Champion",
        description: "Maintain a 30-day learning streak",
        icon: "zap",
        earned: false,
        progress: 15,
        total: 30,
        points: 500,
        category: "Consistency",
      },
      {
        id: 5,
        title: "Course Conqueror",
        description: "Complete 3 full courses",
        icon: "award",
        earned: false,
        progress: 1,
        total: 3,
        points: 750,
        category: "Completion",
      },
      {
        id: 6,
        title: "Peer Helper",
        description: "Help 10 fellow students",
        icon: "medal",
        earned: true,
        earnedDate: "2024-01-25",
        points: 400,
        category: "Community",
      },
    ],
    badges: [
      {
        id: 1,
        name: "Bronze Learner",
        description: "Earned 1,000 points",
        icon: "medal",
        color: "bg-amber-600",
        earned: true,
      },
      {
        id: 2,
        name: "Silver Scholar",
        description: "Earned 5,000 points",
        icon: "trophy",
        color: "bg-gray-400",
        earned: true,
      },
      {
        id: 3,
        name: "Gold Graduate",
        description: "Earned 10,000 points",
        icon: "crown",
        color: "bg-yellow-500",
        earned: false,
        progress: 7500,
        total: 10000,
      },
      {
        id: 4,
        name: "Diamond Elite",
        description: "Earned 25,000 points",
        icon: "gem",
        color: "bg-blue-500",
        earned: false,
        progress: 7500,
        total: 25000,
      },
    ],
  };

  useEffect(() => {
    const fetchAchievements = async () => {
      if (status !== "authenticated" || !sessionToken) {
        console.log(
          "[Achievements] Session not authenticated, status:",
          status
        );
        setError("Not authenticated");
        setAchievementsData(fallbackData);
        setLoading(false);
        return;
      }

      try {
        console.log(
          "[Achievements] Fetching from /api/student/achievements with token:",
          sessionToken
        );
        const response = await fetch("/api/student/achievements", {
          headers: {
            "Content-Type": "application/json",
            "X-Session-Token": sessionToken,
          },
        });
        console.log("[Achievements] Fetch response status:", response.status);
        if (!response.ok) {
          console.error(
            "[Achievements] Fetch failed with status:",
            response.status
          );
          if (response.status === 401 || response.status === 403) {
            setError("Session expired");
            setAchievementsData(fallbackData);
            setLoading(false);
            return;
          }
          setError("Failed to fetch achievements");
          setAchievementsData(fallbackData);
          throw new Error("Fetch failed");
        }
        const data = await response.json();
        console.log("[Achievements] Fetch response data:", data);
        setAchievementsData(data);
        setError(null);
      } catch (e) {
        console.error("[Achievements] Fetch error:", e);
        setError("Session expired");
        setAchievementsData(fallbackData);
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

  const data = achievementsData || fallbackData;
  const earnedAchievements = data.achievements.filter((a) => a.earned);
  const inProgressAchievements = data.achievements.filter((a) => !a.earned);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Achievements & Badges</h1>
        <p className="text-muted-foreground">
          Track your learning milestones and unlock rewards
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {data.stats.total_points.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">+250 this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Trophy className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {data.stats.achievements_unlocked}
            </div>
            <p className="text-xs text-muted-foreground">
              of {data.stats.achievements_total} unlocked
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Badges</CardTitle>
            <Medal className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {data.stats.badges_earned}
            </div>
            <p className="text-xs text-muted-foreground">
              of {data.stats.badges_total} earned
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Streak
            </CardTitle>
            <Zap className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {data.stats.streak_current} days
            </div>
            <p className="text-xs text-muted-foreground">
              Personal best: {data.stats.streak_best} days
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="achievements" className="space-y-4">
        <TabsList className="bg-[#f797712e] text-slate-700 flex flex-col lg:flex-row w-full gap-2 mb-14">
          <TabsTrigger
            value="achievements"
            className="bg-transparent w-full sm:w-32 justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3">
            Achievements
          </TabsTrigger>
          <TabsTrigger
            value="badges"
            className="bg-transparent w-full sm:w-32 justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3">
            Badges
          </TabsTrigger>
          <TabsTrigger
            value="progress"
            className="bg-transparent w-full sm:w-32 justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3">
            In Progress
          </TabsTrigger>
        </TabsList>

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {earnedAchievements.map((achievement) => {
              const IconComponent = iconMap[achievement.icon] || Star;
              return (
                <Card
                  key={achievement.id}
                  className="border-green-200 bg-green-50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-full">
                          <IconComponent className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {achievement.title}
                          </CardTitle>
                          <CardDescription>
                            {achievement.description}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-700">
                        +{achievement.points} pts
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Earned on {achievement.earnedDate || "N/A"}</span>
                      <Badge variant="outline">{achievement.category}</Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="badges" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {data.badges.map((badge) => {
              const IconComponent = iconMap[badge.icon] || Medal;
              return (
                <Card
                  key={badge.id}
                  className={
                    badge.earned ? "border-yellow-200 bg-yellow-50" : ""
                  }>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-3 rounded-full ${badge.color} ${
                            badge.earned ? "opacity-100" : "opacity-50"
                          }`}>
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {badge.name}
                          </CardTitle>
                          <CardDescription>{badge.description}</CardDescription>
                        </div>
                      </div>
                      {badge.earned && (
                        <Badge className="bg-yellow-100 text-yellow-700">
                          Earned
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  {!badge.earned && badge.progress && badge.total && (
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>
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
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {inProgressAchievements.map((achievement) => {
              const IconComponent = iconMap[achievement.icon] || Star;
              const progressPercent =
                achievement.progress && achievement.total
                  ? (achievement.progress / achievement.total) * 100
                  : 0;

              return (
                <Card key={achievement.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-full">
                          <IconComponent className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {achievement.title}
                          </CardTitle>
                          <CardDescription>
                            {achievement.description}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline">+{achievement.points} pts</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>
                          {achievement.progress || 0} / {achievement.total || 0}
                        </span>
                      </div>
                      <Progress value={progressPercent} className="h-2" />
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <Badge variant="outline">{achievement.category}</Badge>
                        <span>{Math.round(progressPercent)}% complete</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

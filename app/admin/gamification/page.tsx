import DashboardLayout from "@/app/admin/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Award, Trophy, Star, Zap} from "lucide-react";

export default function GamificationPage() {
  const badges = [
    {
      id: 1,
      name: "Perfect Attendance",
      icon: "🎯",
      awarded: 45,
      criteria: "100% attendance for a month",
    },
    {
      id: 2,
      name: "Top Scorer",
      icon: "🏆",
      awarded: 23,
      criteria: "Score 95%+ on 5 tests",
    },
    {
      id: 3,
      name: "Quick Learner",
      icon: "⚡",
      awarded: 67,
      criteria: "Complete 10 modules in a week",
    },
    {
      id: 4,
      name: "Helping Hand",
      icon: "🤝",
      awarded: 34,
      criteria: "Help 5 classmates",
    },
  ];

  const leaderboard = [
    {rank: 1, student: "Sarah Williams", points: 2450, badges: 12, streak: 45},
    {rank: 2, student: "John Doe", points: 2380, badges: 11, streak: 38},
    {rank: 3, student: "Mike Johnson", points: 2210, badges: 10, streak: 42},
    {rank: 4, student: "Emily Davis", points: 2150, badges: 9, streak: 35},
    {rank: 5, student: "Tom Brown", points: 2090, badges: 9, streak: 28},
  ];

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Gamification
          </h1>
          <p className="text-muted-foreground mt-1">
            Badges, points, and student achievements
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Points Awarded
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">124,567</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Badges Earned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">892</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Streaks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">234</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg Engagement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">87%</div>
            </CardContent>
          </Card>
        </div>

        {/* Two Column Layout */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Badges */}
          <Card>
            <CardHeader>
              <CardTitle>Achievement Badges</CardTitle>
              <CardDescription>Available badges and awards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center text-3xl">
                      {badge.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">
                        {badge.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {badge.criteria}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Awarded {badge.awarded} times
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle>Top Students</CardTitle>
              <CardDescription>Current leaderboard rankings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.rank}
                    className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${
                        entry.rank === 1
                          ? "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400"
                          : entry.rank === 2
                          ? "bg-gray-400/20 text-gray-700 dark:text-gray-400"
                          : entry.rank === 3
                          ? "bg-orange-500/20 text-orange-700 dark:text-orange-400"
                          : "bg-muted text-muted-foreground"
                      }`}>
                      {entry.rank === 1
                        ? "🥇"
                        : entry.rank === 2
                        ? "🥈"
                        : entry.rank === 3
                        ? "🥉"
                        : entry.rank}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">
                        {entry.student}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          <span>{entry.points} pts</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Trophy className="h-3 w-3" />
                          <span>{entry.badges} badges</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          <span>{entry.streak} day streak</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

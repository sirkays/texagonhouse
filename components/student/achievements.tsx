"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Star, Target, Zap, Award, Medal, Crown, Gem } from "lucide-react"

export function Achievements() {
  const achievements = [
    {
      id: 1,
      title: "First Steps",
      description: "Complete your first lesson",
      icon: Star,
      earned: true,
      earnedDate: "2024-01-15",
      points: 50,
      category: "Getting Started",
    },
    {
      id: 2,
      title: "Code Warrior",
      description: "Complete 10 coding exercises",
      icon: Trophy,
      earned: true,
      earnedDate: "2024-01-20",
      points: 200,
      category: "Coding",
    },
    {
      id: 3,
      title: "Quiz Master",
      description: "Score 90% or higher on 5 quizzes",
      icon: Target,
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
      icon: Zap,
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
      icon: Award,
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
      icon: Medal,
      earned: true,
      earnedDate: "2024-01-25",
      points: 400,
      category: "Community",
    },
  ]

  const badges = [
    {
      id: 1,
      name: "Bronze Learner",
      description: "Earned 1,000 points",
      icon: Medal,
      color: "bg-amber-600",
      earned: true,
    },
    {
      id: 2,
      name: "Silver Scholar",
      description: "Earned 5,000 points",
      icon: Trophy,
      color: "bg-gray-400",
      earned: true,
    },
    {
      id: 3,
      name: "Gold Graduate",
      description: "Earned 10,000 points",
      icon: Crown,
      color: "bg-yellow-500",
      earned: false,
      progress: 7500,
      total: 10000,
    },
    {
      id: 4,
      name: "Diamond Elite",
      description: "Earned 25,000 points",
      icon: Gem,
      color: "bg-blue-500",
      earned: false,
      progress: 7500,
      total: 25000,
    },
  ]

  const earnedAchievements = achievements.filter((a) => a.earned)
  const inProgressAchievements = achievements.filter((a) => !a.earned)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Achievements & Badges</h1>
        <p className="text-muted-foreground">Track your learning milestones and unlock rewards</p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">7,500</div>
            <p className="text-xs text-muted-foreground">+250 this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Trophy className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{earnedAchievements.length}</div>
            <p className="text-xs text-muted-foreground">of {achievements.length} unlocked</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Badges</CardTitle>
            <Medal className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{badges.filter((b) => b.earned).length}</div>
            <p className="text-xs text-muted-foreground">of {badges.length} earned</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Zap className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">15 days</div>
            <p className="text-xs text-muted-foreground">Personal best: 23 days</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="achievements" className="space-y-4">
        <TabsList>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="progress">In Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {earnedAchievements.map((achievement) => {
              const IconComponent = achievement.icon
              return (
                <Card key={achievement.id} className="border-green-200 bg-green-50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-full">
                          <IconComponent className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{achievement.title}</CardTitle>
                          <CardDescription>{achievement.description}</CardDescription>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        +{achievement.points} pts
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Earned on {achievement.earnedDate}</span>
                      <Badge variant="outline">{achievement.category}</Badge>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="badges" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {badges.map((badge) => {
              const IconComponent = badge.icon
              return (
                <Card key={badge.id} className={badge.earned ? "border-yellow-200 bg-yellow-50" : ""}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-3 rounded-full ${badge.color} ${badge.earned ? "opacity-100" : "opacity-50"}`}
                        >
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{badge.name}</CardTitle>
                          <CardDescription>{badge.description}</CardDescription>
                        </div>
                      </div>
                      {badge.earned && <Badge className="bg-yellow-100 text-yellow-700">Earned</Badge>}
                    </div>
                  </CardHeader>
                  {!badge.earned && badge.progress && (
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>
                            {badge.progress?.toLocaleString()} / {badge.total?.toLocaleString()}
                          </span>
                        </div>
                        <Progress value={(badge.progress / badge.total!) * 100} className="h-2" />
                      </div>
                    </CardContent>
                  )}
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {inProgressAchievements.map((achievement) => {
              const IconComponent = achievement.icon
              const progressPercent =
                achievement.progress && achievement.total ? (achievement.progress / achievement.total) * 100 : 0

              return (
                <Card key={achievement.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-full">
                          <IconComponent className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{achievement.title}</CardTitle>
                          <CardDescription>{achievement.description}</CardDescription>
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
                          {achievement.progress} / {achievement.total}
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
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, TrendingUp, Clock, BookOpen, Code, TestTube, Users } from "lucide-react"

export function PointSystem() {
  const currentPoints = 7500
  const currentLevel = "Silver Scholar"
  const nextLevel = "Gold Graduate"
  const pointsToNextLevel = 2500
  const totalPointsForNextLevel = 10000

  const pointHistory = [
    { activity: "Completed React Advanced Course", points: 500, time: "2 hours ago", category: "Course" },
    { activity: "Perfect Score on JavaScript Quiz", points: 150, time: "1 day ago", category: "Quiz" },
    { activity: "15-Day Learning Streak Bonus", points: 200, time: "2 days ago", category: "Streak" },
    { activity: "Helped peer with coding problem", points: 100, time: "3 days ago", category: "Social" },
    { activity: "Completed Python Basics", points: 300, time: "1 week ago", category: "Course" },
  ]

  const pointSources = [
    { source: "Course Completion", basePoints: "200-500", multiplier: "1x-3x", icon: BookOpen },
    { source: "Quiz/Test Performance", basePoints: "50-200", multiplier: "1x-2x", icon: TestTube },
    { source: "Daily Learning Streak", basePoints: "10-50", multiplier: "1x-5x", icon: TrendingUp },
    { source: "Coding Practice", basePoints: "20-100", multiplier: "1x-2x", icon: Code },
    { source: "Peer Assistance", basePoints: "50-150", multiplier: "1x", icon: Users },
    { source: "Achievement Unlocks", basePoints: "100-1000", multiplier: "1x", icon: Star },
  ]

  const levelBenefits = [
    {
      level: "Bronze Learner",
      points: "0-1,000",
      benefits: ["Basic course access", "Standard support", "Basic certificates"],
      current: false,
    },
    {
      level: "Silver Scholar",
      points: "1,000-5,000",
      benefits: ["Premium course access", "Priority support", "Enhanced certificates", "Streak bonuses"],
      current: true,
    },
    {
      level: "Gold Graduate",
      points: "5,000-10,000",
      benefits: ["All course access", "1-on-1 mentoring", "Gold certificates", "Early access to new content"],
      current: false,
    },
    {
      level: "Platinum Master",
      points: "10,000-25,000",
      benefits: ["Exclusive masterclasses", "Career guidance", "Platinum certificates", "Teaching opportunities"],
      current: false,
    },
    {
      level: "Diamond Elite",
      points: "25,000+",
      benefits: ["VIP status", "Personal learning advisor", "Diamond certificates", "Beta testing access"],
      current: false,
    },
  ]

  const weeklyStats = {
    pointsEarned: 850,
    activitiesCompleted: 12,
    averageDaily: 121,
    bestDay: 280,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Point System & Levels</h1>
        <p className="text-muted-foreground">Track your learning progress and unlock new benefits</p>
      </div>

      {/* Current Status */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-600" />
              <CardTitle className="text-yellow-800">Total Points</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-700">{currentPoints.toLocaleString()}</div>
            <Badge className="bg-yellow-100 text-yellow-700 mt-2">{currentLevel}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{weeklyStats.pointsEarned}</div>
            <p className="text-sm text-muted-foreground">{weeklyStats.activitiesCompleted} activities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Daily Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyStats.averageDaily}</div>
            <p className="text-sm text-muted-foreground">points per day</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Best Day</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{weeklyStats.bestDay}</div>
            <p className="text-sm text-muted-foreground">this week</p>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Level Progress</CardTitle>
          <CardDescription>
            {pointsToNextLevel.toLocaleString()} more points to reach {nextLevel}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{currentLevel}</span>
              <span>{nextLevel}</span>
            </div>
            <Progress value={(currentPoints / totalPointsForNextLevel) * 100} className="h-3" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{currentPoints.toLocaleString()} points</span>
              <span>{totalPointsForNextLevel.toLocaleString()} points</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="history" className="space-y-4">
        <TabsList>
          <TabsTrigger value="history">Point History</TabsTrigger>
          <TabsTrigger value="sources">Point Sources</TabsTrigger>
          <TabsTrigger value="levels">Level Benefits</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Point Activity</CardTitle>
              <CardDescription>Your latest point-earning activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pointHistory.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{item.activity}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {item.time}
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-green-600 font-bold">
                      <Star className="h-4 w-4" />+{item.points}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>How to Earn Points</CardTitle>
              <CardDescription>Different activities and their point values</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {pointSources.map((source, index) => {
                  const IconComponent = source.icon
                  return (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <IconComponent className="h-4 w-4 text-blue-600" />
                        </div>
                        <h4 className="font-medium">{source.source}</h4>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>Base Points: {source.basePoints}</p>
                        <p>Multiplier: {source.multiplier}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="levels" className="space-y-4">
          <div className="grid gap-4">
            {levelBenefits.map((level, index) => (
              <Card key={index} className={level.current ? "border-yellow-200 bg-yellow-50" : ""}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className={level.current ? "text-yellow-800" : ""}>{level.level}</CardTitle>
                      <CardDescription>{level.points} points</CardDescription>
                    </div>
                    {level.current && <Badge className="bg-yellow-100 text-yellow-700">Current Level</Badge>}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    {level.benefits.map((benefit, benefitIndex) => (
                      <div key={benefitIndex} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                        {benefit}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

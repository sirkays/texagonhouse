"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Flame, Target, Gift, Clock, Zap } from "lucide-react"

export function StreakSystem() {
  const currentStreak = 15
  const longestStreak = 23
  const streakGoal = 30
  const todayCompleted = true

  const streakCalendar = [
    { date: "Mon", completed: true, day: 21 },
    { date: "Tue", completed: true, day: 22 },
    { date: "Wed", completed: true, day: 23 },
    { date: "Thu", completed: true, day: 24 },
    { date: "Fri", completed: true, day: 25 },
    { date: "Sat", completed: true, day: 26 },
    { date: "Sun", completed: false, day: 27, isToday: true },
  ]

  const streakMilestones = [
    { days: 7, reward: "Bronze Streak Badge", achieved: true },
    { days: 14, reward: "Silver Streak Badge", achieved: true },
    { days: 21, reward: "Gold Streak Badge", achieved: false, progress: 15 },
    { days: 30, reward: "Platinum Streak Badge + 500 points", achieved: false, progress: 15 },
    { days: 60, reward: "Diamond Streak Badge + 1000 points", achieved: false, progress: 15 },
    { days: 100, reward: "Legend Status + Special Certificate", achieved: false, progress: 15 },
  ]

  const streakActivities = [
    { activity: "Complete a lesson", points: 50, completed: true },
    { activity: "Take a quiz", points: 30, completed: true },
    { activity: "Practice coding", points: 40, completed: false },
    { activity: "Read study material", points: 20, completed: false },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Learning Streak</h1>
        <p className="text-muted-foreground">Maintain your daily learning habit and unlock rewards</p>
      </div>

      {/* Current Streak Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-orange-800">Current Streak</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-700">{currentStreak}</div>
            <p className="text-sm text-orange-600">days in a row</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-sm">Longest Streak</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{longestStreak}</div>
            <p className="text-sm text-muted-foreground">personal best</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-sm">Next Milestone</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{streakGoal - currentStreak}</div>
            <p className="text-sm text-muted-foreground">days to go</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600" />
              <CardTitle className="text-sm">Today's Status</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Badge className={todayCompleted ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
              {todayCompleted ? "Complete" : "In Progress"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Calendar */}
      <Card>
        <CardHeader>
          <CardTitle>This Week's Progress</CardTitle>
          <CardDescription>Your daily learning activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {streakCalendar.map((day, index) => (
              <div key={index} className="text-center">
                <div className="text-sm text-muted-foreground mb-2">{day.date}</div>
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium ${
                    day.completed
                      ? "bg-green-500 text-white"
                      : day.isToday
                        ? "bg-orange-100 border-2 border-orange-500 text-orange-700"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {day.isToday ? <Zap className="h-4 w-4" /> : day.completed ? "✓" : day.day}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Today's Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Activities</CardTitle>
            <CardDescription>Complete activities to maintain your streak</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {streakActivities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${activity.completed ? "bg-green-500" : "bg-gray-300"}`} />
                  <span className={activity.completed ? "line-through text-muted-foreground" : ""}>
                    {activity.activity}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">+{activity.points} pts</Badge>
                  {!activity.completed && (
                    <Button size="sm" variant="outline">
                      Start
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Streak Milestones */}
        <Card>
          <CardHeader>
            <CardTitle>Streak Milestones</CardTitle>
            <CardDescription>Unlock rewards as you build your streak</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {streakMilestones.map((milestone, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${milestone.achieved ? "bg-green-500" : "bg-gray-300"}`} />
                    <span className="font-medium">{milestone.days} days</span>
                  </div>
                  <Badge variant={milestone.achieved ? "default" : "outline"}>
                    {milestone.achieved ? "Achieved" : "Locked"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground ml-5">{milestone.reward}</p>
                {!milestone.achieved && milestone.progress && (
                  <div className="ml-5">
                    <Progress value={(milestone.progress / milestone.days) * 100} className="h-1" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {milestone.progress} / {milestone.days} days
                    </p>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Streak Protection */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">Streak Protection</CardTitle>
          <CardDescription className="text-blue-600">
            Don't lose your streak! Use streak freezes when you can't learn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Available Streak Freezes: 2</p>
              <p className="text-sm text-muted-foreground">Earn more by completing weekly challenges</p>
            </div>
            <Button variant="outline">Use Freeze</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

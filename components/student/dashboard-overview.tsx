"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Clock, Trophy, TrendingUp, Play, Code, TestTube, Calendar, Star, Medal, Zap } from "lucide-react"

export function DashboardOverview() {
  const recentCourses = [
    {
      title: "Advanced React Development",
      progress: 75,
      duration: "12 hours",
      nextLesson: "State Management with Redux",
    },
    {
      title: "Python for Data Science",
      progress: 45,
      duration: "18 hours",
      nextLesson: "Pandas DataFrames",
    },
    {
      title: "JavaScript Algorithms",
      progress: 90,
      duration: "8 hours",
      nextLesson: "Dynamic Programming",
    },
  ]

  const upcomingTests = [
    {
      title: "React Fundamentals Quiz",
      date: "Tomorrow, 2:00 PM",
      duration: "30 mins",
    },
    {
      title: "Python Basics Assessment",
      date: "Dec 28, 10:00 AM",
      duration: "45 mins",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, John!</h1>
        <p className="text-muted-foreground">Continue your learning journey</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses Enrolled</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Learned</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47.5</div>
            <p className="text-xs text-muted-foreground">+12.3 this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificates</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">2 in progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Streak</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15 days</div>
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
              <div className="text-2xl font-bold text-yellow-700">7,500 XP</div>
              <Badge className="bg-yellow-100 text-yellow-700">Silver Scholar</Badge>
              <Progress value={75} className="h-2" />
              <p className="text-sm text-yellow-600">2,500 XP to Gold Graduate</p>
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
              <div className="text-2xl font-bold text-blue-700">3 / 6</div>
              <p className="text-sm text-blue-600">Recent: Code Warrior</p>
              <div className="flex gap-1">
                <Medal className="h-4 w-4 text-yellow-500" />
                <Medal className="h-4 w-4 text-yellow-500" />
                <Medal className="h-4 w-4 text-yellow-500" />
                <Medal className="h-4 w-4 text-gray-300" />
                <Medal className="h-4 w-4 text-gray-300" />
                <Medal className="h-4 w-4 text-gray-300" />
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
              <div className="text-2xl font-bold text-green-700">#1</div>
              <p className="text-sm text-green-600">in your school</p>
              <div className="flex items-center gap-1 text-sm text-green-600">
                <Zap className="h-3 w-3" />
                <span>Global rank: #4</span>
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
                  <Button variant="ghost" size="sm">
                    <Play className="mr-2 h-3 w-3" />
                    Continue
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">Next: {course.nextLesson}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Tests */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Tests</CardTitle>
            <CardDescription>Don't miss your scheduled assessments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingTests.map((test, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
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
                <Button size="sm">
                  <TestTube className="mr-2 h-3 w-3" />
                  Start
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
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
      </Card>
    </div>
  )
}

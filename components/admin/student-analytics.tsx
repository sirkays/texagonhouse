"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Users,
  TrendingUp,
  Clock,
  Star,
  Award,
  Eye,
  BarChart3,
  BookOpen,
  Target,
  Calendar,
  CheckCircle,
} from "lucide-react"

interface CourseDetail {
  id: string
  name: string
  students: number
  avgProgress: number
  avgScore: number
  completionRate: number
  rating: number
  totalLessons: number
  completedLessons: number
  enrollmentTrend: number[]
  weeklyActivity: { day: string; active: number; hours: string }[]
  topPerformers: { name: string; score: number; progress: number }[]
  strugglingStudents: { name: string; score: number; progress: number; lastActive: string }[]
}

interface TestDetail {
  id: string
  name: string
  attempts: number
  avgScore: number
  passRate: number
  difficulty: string
  questions: number
  timeLimit: string
  scoreDistribution: { range: string; count: number }[]
  commonMistakes: { question: string; incorrectRate: number }[]
  performanceByTime: { hour: string; avgScore: number; attempts: number }[]
}

export function StudentAnalytics() {
  const [selectedCourse, setSelectedCourse] = useState<CourseDetail | null>(null)
  const [selectedTest, setSelectedTest] = useState<TestDetail | null>(null)
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false)
  const [isTestModalOpen, setIsTestModalOpen] = useState(false)

  const overallStats = [
    {
      title: "Total Students",
      value: "1,247",
      change: "+12%",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Active This Month",
      value: "892",
      change: "+8%",
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      title: "Avg. Study Time",
      value: "4.2h",
      change: "+15min",
      icon: Clock,
      color: "text-purple-600",
    },
    {
      title: "Course Completions",
      value: "156",
      change: "+23",
      icon: Award,
      color: "text-orange-600",
    },
  ]

  const coursePerformance = [
    {
      id: "1",
      name: "React Complete Guide",
      students: 456,
      avgProgress: 78,
      avgScore: 85,
      completionRate: 72,
      rating: 4.8,
      totalLessons: 45,
      completedLessons: 35,
      enrollmentTrend: [20, 35, 45, 52, 48, 56, 62],
      weeklyActivity: [
        { day: "Monday", active: 89, hours: "2.3h" },
        { day: "Tuesday", active: 76, hours: "1.8h" },
        { day: "Wednesday", active: 94, hours: "2.7h" },
        { day: "Thursday", active: 82, hours: "2.1h" },
        { day: "Friday", active: 67, hours: "1.6h" },
        { day: "Saturday", active: 34, hours: "0.9h" },
        { day: "Sunday", active: 45, hours: "1.2h" },
      ],
      topPerformers: [
        { name: "Alice Johnson", score: 94, progress: 95 },
        { name: "Bob Smith", score: 91, progress: 88 },
        { name: "Carol Davis", score: 89, progress: 92 },
      ],
      strugglingStudents: [
        { name: "David Wilson", score: 45, progress: 23, lastActive: "3 days ago" },
        { name: "Emma Brown", score: 52, progress: 31, lastActive: "1 week ago" },
        { name: "Frank Miller", score: 48, progress: 28, lastActive: "2 days ago" },
      ],
    },
    {
      id: "2",
      name: "Python for Data Science",
      students: 324,
      avgProgress: 65,
      avgScore: 79,
      completionRate: 68,
      rating: 4.9,
      totalLessons: 38,
      completedLessons: 25,
      enrollmentTrend: [15, 28, 32, 38, 42, 45, 48],
      weeklyActivity: [
        { day: "Monday", active: 67, hours: "2.1h" },
        { day: "Tuesday", active: 54, hours: "1.6h" },
        { day: "Wednesday", active: 72, hours: "2.4h" },
        { day: "Thursday", active: 61, hours: "1.9h" },
        { day: "Friday", active: 48, hours: "1.4h" },
        { day: "Saturday", active: 23, hours: "0.7h" },
        { day: "Sunday", active: 31, hours: "1.0h" },
      ],
      topPerformers: [
        { name: "Grace Lee", score: 96, progress: 89 },
        { name: "Henry Chen", score: 93, progress: 85 },
        { name: "Ivy Wang", score: 90, progress: 91 },
      ],
      strugglingStudents: [
        { name: "Jack Taylor", score: 42, progress: 19, lastActive: "5 days ago" },
        { name: "Kate Anderson", score: 49, progress: 25, lastActive: "4 days ago" },
        { name: "Liam Garcia", score: 46, progress: 22, lastActive: "1 week ago" },
      ],
    },
    {
      id: "3",
      name: "JavaScript Mastery",
      students: 278,
      avgProgress: 82,
      avgScore: 88,
      completionRate: 75,
      rating: 4.7,
      totalLessons: 52,
      completedLessons: 43,
      enrollmentTrend: [12, 22, 28, 35, 41, 44, 47],
      weeklyActivity: [
        { day: "Monday", active: 58, hours: "2.0h" },
        { day: "Tuesday", active: 49, hours: "1.5h" },
        { day: "Wednesday", active: 64, hours: "2.2h" },
        { day: "Thursday", active: 55, hours: "1.8h" },
        { day: "Friday", active: 42, hours: "1.3h" },
        { day: "Saturday", active: 19, hours: "0.6h" },
        { day: "Sunday", active: 27, hours: "0.9h" },
      ],
      topPerformers: [
        { name: "Maya Patel", score: 97, progress: 94 },
        { name: "Noah Kim", score: 94, progress: 90 },
        { name: "Olivia Rodriguez", score: 92, progress: 87 },
      ],
      strugglingStudents: [
        { name: "Paul Martinez", score: 51, progress: 34, lastActive: "2 days ago" },
        { name: "Quinn Thompson", score: 47, progress: 29, lastActive: "6 days ago" },
        { name: "Ruby Clark", score: 53, progress: 37, lastActive: "3 days ago" },
      ],
    },
    {
      id: "4",
      name: "Advanced CSS Techniques",
      students: 189,
      avgProgress: 71,
      avgScore: 82,
      completionRate: 69,
      rating: 4.6,
      totalLessons: 28,
      completedLessons: 20,
      enrollmentTrend: [8, 15, 19, 23, 26, 28, 31],
      weeklyActivity: [
        { day: "Monday", active: 39, hours: "1.8h" },
        { day: "Tuesday", active: 33, hours: "1.4h" },
        { day: "Wednesday", active: 42, hours: "2.0h" },
        { day: "Thursday", active: 37, hours: "1.6h" },
        { day: "Friday", active: 28, hours: "1.1h" },
        { day: "Saturday", active: 14, hours: "0.5h" },
        { day: "Sunday", active: 18, hours: "0.7h" },
      ],
      topPerformers: [
        { name: "Sam Wilson", score: 95, progress: 86 },
        { name: "Tara Singh", score: 92, progress: 83 },
        { name: "Uma Sharma", score: 90, progress: 89 },
      ],
      strugglingStudents: [
        { name: "Victor Lopez", score: 44, progress: 26, lastActive: "4 days ago" },
        { name: "Wendy Chang", score: 48, progress: 31, lastActive: "1 week ago" },
        { name: "Xavier Jones", score: 46, progress: 28, lastActive: "5 days ago" },
      ],
    },
  ]

  const topStudents = [
    {
      name: "Alice Johnson",
      coursesCompleted: 8,
      avgScore: 94,
      studyTime: "45h",
      lastActive: "2 hours ago",
    },
    {
      name: "Bob Smith",
      coursesCompleted: 6,
      avgScore: 91,
      studyTime: "38h",
      lastActive: "1 day ago",
    },
    {
      name: "Carol Davis",
      coursesCompleted: 7,
      avgScore: 89,
      studyTime: "42h",
      lastActive: "3 hours ago",
    },
    {
      name: "David Wilson",
      coursesCompleted: 5,
      avgScore: 87,
      studyTime: "35h",
      lastActive: "5 hours ago",
    },
  ]

  const testAnalytics = [
    {
      id: "1",
      name: "React Fundamentals",
      attempts: 234,
      avgScore: 78,
      passRate: 85,
      difficulty: "Medium",
      questions: 25,
      timeLimit: "45 minutes",
      scoreDistribution: [
        { range: "90-100", count: 45 },
        { range: "80-89", count: 67 },
        { range: "70-79", count: 78 },
        { range: "60-69", count: 32 },
        { range: "Below 60", count: 12 },
      ],
      commonMistakes: [
        { question: "useState Hook Implementation", incorrectRate: 34 },
        { question: "Component Lifecycle Methods", incorrectRate: 28 },
        { question: "Props vs State Concepts", incorrectRate: 22 },
      ],
      performanceByTime: [
        { hour: "9 AM", avgScore: 82, attempts: 23 },
        { hour: "12 PM", avgScore: 79, attempts: 45 },
        { hour: "3 PM", avgScore: 76, attempts: 67 },
        { hour: "6 PM", avgScore: 81, attempts: 89 },
        { hour: "9 PM", avgScore: 74, attempts: 34 },
      ],
    },
    {
      id: "2",
      name: "JavaScript Advanced",
      attempts: 189,
      avgScore: 72,
      passRate: 79,
      difficulty: "Hard",
      questions: 30,
      timeLimit: "60 minutes",
      scoreDistribution: [
        { range: "90-100", count: 28 },
        { range: "80-89", count: 45 },
        { range: "70-79", count: 56 },
        { range: "60-69", count: 38 },
        { range: "Below 60", count: 22 },
      ],
      commonMistakes: [
        { question: "Closures and Scope", incorrectRate: 42 },
        { question: "Async/Await Patterns", incorrectRate: 38 },
        { question: "Prototype Inheritance", incorrectRate: 35 },
      ],
      performanceByTime: [
        { hour: "9 AM", avgScore: 75, attempts: 18 },
        { hour: "12 PM", avgScore: 71, attempts: 34 },
        { hour: "3 PM", avgScore: 69, attempts: 52 },
        { hour: "6 PM", avgScore: 74, attempts: 67 },
        { hour: "9 PM", avgScore: 68, attempts: 28 },
      ],
    },
    {
      id: "3",
      name: "Python Basics",
      attempts: 345,
      avgScore: 84,
      passRate: 92,
      difficulty: "Easy",
      questions: 20,
      timeLimit: "30 minutes",
      scoreDistribution: [
        { range: "90-100", count: 156 },
        { range: "80-89", count: 98 },
        { range: "70-79", count: 67 },
        { range: "60-69", count: 18 },
        { range: "Below 60", count: 6 },
      ],
      commonMistakes: [
        { question: "List Comprehensions", incorrectRate: 18 },
        { question: "Dictionary Methods", incorrectRate: 15 },
        { question: "String Formatting", incorrectRate: 12 },
      ],
      performanceByTime: [
        { hour: "9 AM", avgScore: 86, attempts: 34 },
        { hour: "12 PM", avgScore: 83, attempts: 67 },
        { hour: "3 PM", avgScore: 82, attempts: 89 },
        { hour: "6 PM", avgScore: 85, attempts: 123 },
        { hour: "9 PM", avgScore: 81, attempts: 45 },
      ],
    },
    {
      id: "4",
      name: "CSS Flexbox & Grid",
      attempts: 156,
      avgScore: 81,
      passRate: 88,
      difficulty: "Medium",
      questions: 22,
      timeLimit: "40 minutes",
      scoreDistribution: [
        { range: "90-100", count: 42 },
        { range: "80-89", count: 58 },
        { range: "70-79", count: 38 },
        { range: "60-69", count: 14 },
        { range: "Below 60", count: 4 },
      ],
      commonMistakes: [
        { question: "Grid Template Areas", incorrectRate: 31 },
        { question: "Flexbox Alignment", incorrectRate: 26 },
        { question: "Responsive Grid Layouts", incorrectRate: 23 },
      ],
      performanceByTime: [
        { hour: "9 AM", avgScore: 83, attempts: 15 },
        { hour: "12 PM", avgScore: 80, attempts: 28 },
        { hour: "3 PM", avgScore: 79, attempts: 42 },
        { hour: "6 PM", avgScore: 82, attempts: 56 },
        { hour: "9 PM", avgScore: 78, attempts: 23 },
      ],
    },
  ]

  const handleViewCourseDetails = (course: any) => {
    setSelectedCourse(course)
    setIsCourseModalOpen(true)
  }

  const handleViewTestDetails = (test: any) => {
    setSelectedTest(test)
    setIsTestModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Student Analytics</h1>
        <p className="text-muted-foreground">Monitor student progress and performance across all courses</p>
      </div>

      {/* Overall Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {overallStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{stat.change}</span> from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="courses" className="w-full">
        <TabsList>
          <TabsTrigger value="courses">Course Performance</TabsTrigger>
          <TabsTrigger value="students">Top Students</TabsTrigger>
          <TabsTrigger value="tests">Test Analytics</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Performance Overview</CardTitle>
              <CardDescription>Detailed analytics for each course</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {coursePerformance.map((course, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-medium">{course.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {course.students} students
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {course.rating}
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleViewCourseDetails(course)}>
                        <Eye className="mr-2 h-3 w-3" />
                        View Details
                      </Button>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Avg Progress</span>
                          <span>{course.avgProgress}%</span>
                        </div>
                        <Progress value={course.avgProgress} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Avg Score</span>
                          <span>{course.avgScore}%</span>
                        </div>
                        <Progress value={course.avgScore} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Completion Rate</span>
                          <span>{course.completionRate}%</span>
                        </div>
                        <Progress value={course.completionRate} className="h-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Students</CardTitle>
              <CardDescription>Students with highest engagement and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topStudents.map((student, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="font-medium text-primary">#{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-medium">{student.name}</h4>
                        <p className="text-sm text-muted-foreground">Last active: {student.lastActive}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="font-medium">{student.coursesCompleted}</div>
                          <div className="text-muted-foreground">Courses</div>
                        </div>
                        <div>
                          <div className="font-medium">{student.avgScore}%</div>
                          <div className="text-muted-foreground">Avg Score</div>
                        </div>
                        <div>
                          <div className="font-medium">{student.studyTime}</div>
                          <div className="text-muted-foreground">Study Time</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Performance Analytics</CardTitle>
              <CardDescription>Detailed breakdown of test results and difficulty analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testAnalytics.map((test, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-medium">{test.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant={
                              test.difficulty === "Easy"
                                ? "default"
                                : test.difficulty === "Medium"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {test.difficulty}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{test.attempts} attempts</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleViewTestDetails(test)}>
                        <BarChart3 className="mr-2 h-3 w-3" />
                        View Details
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Average Score</span>
                          <span>{test.avgScore}%</span>
                        </div>
                        <Progress value={test.avgScore} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Pass Rate</span>
                          <span>{test.passRate}%</span>
                        </div>
                        <Progress value={test.passRate} className="h-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Activity</CardTitle>
                <CardDescription>Student engagement over the past week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { day: "Monday", active: 234, hours: "2.3h" },
                    { day: "Tuesday", active: 189, hours: "1.8h" },
                    { day: "Wednesday", active: 267, hours: "2.7h" },
                    { day: "Thursday", active: 198, hours: "2.1h" },
                    { day: "Friday", active: 156, hours: "1.6h" },
                    { day: "Saturday", active: 89, hours: "0.9h" },
                    { day: "Sunday", active: 123, hours: "1.2h" },
                  ].map((day, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <span className="text-sm font-medium">{day.day}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{day.active} active students</span>
                        <span>{day.hours} avg study time</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Popular Content</CardTitle>
                <CardDescription>Most accessed materials this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { title: "React Hooks Tutorial", views: 1234, type: "Video" },
                    { title: "Python Cheat Sheet", downloads: 890, type: "PDF" },
                    { title: "JavaScript Fundamentals", views: 756, type: "Course" },
                    { title: "CSS Grid Guide", views: 645, type: "Tutorial" },
                    { title: "Database Design Principles", views: 523, type: "Video" },
                  ].map((content, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h5 className="font-medium text-sm">{content.title}</h5>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {content.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {content.views ? `${content.views} views` : `${content.downloads} downloads`}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">#{index + 1}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Learning Patterns</CardTitle>
              <CardDescription>Insights into how students learn best</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">68%</div>
                  <p className="text-sm text-muted-foreground">Prefer video content</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">4.2h</div>
                  <p className="text-sm text-muted-foreground">Average session length</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">Evening</div>
                  <p className="text-sm text-muted-foreground">Peak learning time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Course Details Modal */}
      <Dialog open={isCourseModalOpen} onOpenChange={setIsCourseModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {selectedCourse?.name} - Detailed Analytics
            </DialogTitle>
            <DialogDescription>Comprehensive performance analysis and student insights</DialogDescription>
          </DialogHeader>

          {selectedCourse && (
            <div className="space-y-6">
              {/* Course Overview */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-500" />
                      <div>
                        <div className="text-2xl font-bold">{selectedCourse.students}</div>
                        <div className="text-xs text-muted-foreground">Total Students</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-green-500" />
                      <div>
                        <div className="text-2xl font-bold">{selectedCourse.avgProgress}%</div>
                        <div className="text-xs text-muted-foreground">Avg Progress</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <div>
                        <div className="text-2xl font-bold">{selectedCourse.avgScore}%</div>
                        <div className="text-xs text-muted-foreground">Avg Score</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-purple-500" />
                      <div>
                        <div className="text-2xl font-bold">{selectedCourse.completionRate}%</div>
                        <div className="text-xs text-muted-foreground">Completion Rate</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Weekly Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Activity Pattern</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedCourse.weeklyActivity.map((day, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{day.day}</span>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <Users className="h-3 w-3" />
                            <span>{day.active} active</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            <span>{day.hours} avg time</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Performers and Struggling Students */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-600">Top Performers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedCourse.topPerformers.map((student, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-green-700">#{index + 1}</span>
                            </div>
                            <span className="font-medium">{student.name}</span>
                          </div>
                          <div className="text-right text-sm">
                            <div className="font-medium text-green-600">{student.score}% score</div>
                            <div className="text-muted-foreground">{student.progress}% progress</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-600">Students Needing Help</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedCourse.strugglingStudents.map((student, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded">
                          <div>
                            <div className="font-medium">{student.name}</div>
                            <div className="text-xs text-muted-foreground">Last active: {student.lastActive}</div>
                          </div>
                          <div className="text-right text-sm">
                            <div className="font-medium text-red-600">{student.score}% score</div>
                            <div className="text-muted-foreground">{student.progress}% progress</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Test Details Modal */}
      <Dialog open={isTestModalOpen} onOpenChange={setIsTestModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {selectedTest?.name} - Test Analytics
            </DialogTitle>
            <DialogDescription>Detailed analysis of test performance and student responses</DialogDescription>
          </DialogHeader>

          {selectedTest && (
            <div className="space-y-6">
              {/* Test Overview */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-500" />
                      <div>
                        <div className="text-2xl font-bold">{selectedTest.attempts}</div>
                        <div className="text-xs text-muted-foreground">Total Attempts</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-green-500" />
                      <div>
                        <div className="text-2xl font-bold">{selectedTest.avgScore}%</div>
                        <div className="text-xs text-muted-foreground">Average Score</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-purple-500" />
                      <div>
                        <div className="text-2xl font-bold">{selectedTest.passRate}%</div>
                        <div className="text-xs text-muted-foreground">Pass Rate</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <div>
                        <div className="text-2xl font-bold">{selectedTest.questions}</div>
                        <div className="text-xs text-muted-foreground">Questions</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Test Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Test Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          selectedTest.difficulty === "Easy"
                            ? "default"
                            : selectedTest.difficulty === "Medium"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {selectedTest.difficulty}
                      </Badge>
                      <span className="text-sm">Difficulty Level</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">{selectedTest.timeLimit}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      <span className="text-sm">{selectedTest.questions} Questions</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Score Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Score Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedTest.scoreDistribution.map((range, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{range.range}%</span>
                        <div className="flex items-center gap-3 flex-1 ml-4">
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${(range.count / selectedTest.attempts) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-12 text-right">{range.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Common Mistakes and Performance by Time */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-600">Common Mistakes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedTest.commonMistakes.map((mistake, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{mistake.question}</span>
                            <span className="text-red-600">{mistake.incorrectRate}%</span>
                          </div>
                          <Progress value={mistake.incorrectRate} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Performance by Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedTest.performanceByTime.map((time, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            <span className="text-sm font-medium">{time.hour}</span>
                          </div>
                          <div className="text-right text-sm">
                            <div className="font-medium">{time.avgScore}% avg</div>
                            <div className="text-muted-foreground">{time.attempts} attempts</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

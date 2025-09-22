"use client";

import {useState} from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Progress} from "@/components/ui/progress";
import {Badge} from "@/components/ui/badge";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {
  Clock,
  TrendingUp,
  Target,
  CheckCircle,
  BarChart3,
  Download,
} from "lucide-react";

export function ChildrenProgress() {
  const [selectedChild, setSelectedChild] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  const children = [
    {
      id: 1,
      name: "John Adebayo",
      grade: "SS3",
      school: "Lagos State Model College",
      avatar: "/placeholder.svg?height=40&width=40",
      subjects: [
        {
          name: "Mathematics",
          progress: 85,
          grade: "A",
          lastScore: 92,
          trend: "up",
        },
        {
          name: "Physics",
          progress: 78,
          grade: "B+",
          lastScore: 85,
          trend: "up",
        },
        {
          name: "Chemistry",
          progress: 82,
          grade: "A-",
          lastScore: 88,
          trend: "stable",
        },
        {
          name: "English",
          progress: 90,
          grade: "A+",
          lastScore: 95,
          trend: "up",
        },
        {
          name: "Computer Science",
          progress: 95,
          grade: "A+",
          lastScore: 98,
          trend: "up",
        },
      ],
      weeklyStats: {
        hoursStudied: 12,
        testsCompleted: 3,
        averageScore: 85,
        streak: 15,
      },
      monthlyStats: {
        hoursStudied: 48,
        testsCompleted: 12,
        averageScore: 87,
        coursesCompleted: 2,
      },
    },
    {
      id: 2,
      name: "Mary Adebayo",
      grade: "SS1",
      school: "Lagos State Model College",
      avatar: "/placeholder.svg?height=40&width=40",
      subjects: [
        {
          name: "Mathematics",
          progress: 92,
          grade: "A+",
          lastScore: 96,
          trend: "up",
        },
        {name: "English", progress: 88, grade: "A", lastScore: 91, trend: "up"},
        {
          name: "Biology",
          progress: 85,
          grade: "A-",
          lastScore: 89,
          trend: "stable",
        },
        {
          name: "Chemistry",
          progress: 80,
          grade: "B+",
          lastScore: 83,
          trend: "down",
        },
        {
          name: "Geography",
          progress: 87,
          grade: "A",
          lastScore: 90,
          trend: "up",
        },
      ],
      weeklyStats: {
        hoursStudied: 10,
        testsCompleted: 2,
        averageScore: 92,
        streak: 22,
      },
      monthlyStats: {
        hoursStudied: 42,
        testsCompleted: 10,
        averageScore: 90,
        coursesCompleted: 3,
      },
    },
  ];

  const getSelectedChildData = () => {
    if (selectedChild === "all") return children;
    return children.filter((child) => child.id.toString() === selectedChild);
  };

  const getTrendIcon = (trend: any) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-3 w-3 text-green-600" />;
      case "down":
        return <TrendingUp className="h-3 w-3 text-red-600 rotate-180" />;
      default:
        return <TrendingUp className="h-3 w-3 text-gray-400" />;
    }
  };

  const getGradeColor = (grade: any) => {
    if (grade.startsWith("A")) return "text-green-600";
    if (grade.startsWith("B")) return "text-blue-600";
    if (grade.startsWith("C")) return "text-yellow-600";
    return "text-red-600";
  };

  const getOverallStats = () => {
    const childrenData = getSelectedChildData();
    const totalHours = childrenData.reduce(
      (sum, child) => sum + child.weeklyStats.hoursStudied,
      0
    );
    const totalTests = childrenData.reduce(
      (sum, child) => sum + child.weeklyStats.testsCompleted,
      0
    );
    const avgScore = Math.round(
      childrenData.reduce(
        (sum, child) => sum + child.weeklyStats.averageScore,
        0
      ) / childrenData.length
    );
    const avgStreak = Math.round(
      childrenData.reduce((sum, child) => sum + child.weeklyStats.streak, 0) /
        childrenData.length
    );

    return {totalHours, totalTests, avgScore, avgStreak};
  };

  const overallStats = getOverallStats();

  return (
    <div className="container mx-auto sm:p-6">
      {/* Header */}
      <div className="space-y-4 mb-6">
        <div className="flex flex-col items-start gap-2">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
            Children's Progress
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Detailed learning analytics and performance tracking
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">
            Filter & View Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-xs sm:text-sm font-medium">
                Select Child
              </label>
              <Select value={selectedChild} onValueChange={setSelectedChild}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose child" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Children</SelectItem>
                  {children.map((child) => (
                    <SelectItem key={child.id} value={child.id.toString()}>
                      {child.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-xs sm:text-sm font-medium">
                Time Period
              </label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">
       
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Tests Completed
            </CardTitle>
            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl font-bold">
              {overallStats.totalTests}
            </div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Average Score
            </CardTitle>
            <Target className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl font-bold text-green-600">
              {overallStats.avgScore}%
            </div>
            <p className="text-xs text-muted-foreground">Across all subjects</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Learning Streak
            </CardTitle>
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl font-bold text-orange-600">
              {overallStats.avgStreak}
            </div>
            <p className="text-xs text-muted-foreground">Days average</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="subjects" className="space-y-4">
        <TabsList className="flex flex-col sm:flex-row gap-2">
          <TabsTrigger className="flex-1 text-xs sm:text-sm" value="subjects">
            Courses Performance
          </TabsTrigger>
          <TabsTrigger className="flex-1 text-xs sm:text-sm" value="timeline">
            Progress Timeline
          </TabsTrigger>
          
        </TabsList>

        {/* Subjects */}
        <TabsContent
          value="subjects"
          className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {getSelectedChildData().map((child) => (
            <Card key={child.id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                    <AvatarImage src={child.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs">
                      {child.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <CardTitle className="text-sm sm:text-base truncate">
                      {child.name}
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm truncate">
                      {child.grade} • {child.school}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {child.subjects.map((subject, index) => (
                    <div
                      key={index}
                      className="flex flex-col gap-3 p-3 border rounded-lg">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h4 className="font-medium text-sm sm:text-base">
                          {subject.name}
                        </h4>
                        <div className="flex items-center gap-2">
                          <Badge className={getGradeColor(subject.grade)}>
                            {subject.grade}
                          </Badge>
                          {getTrendIcon(subject.trend)}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex-1">
                          <div className="flex justify-between text-xs sm:text-sm mb-1">
                            <span>Progress</span>
                            <span>{subject.progress}%</span>
                          </div>
                          <Progress value={subject.progress} className="h-2" />
                        </div>
                        <div className="text-left sm:text-right">
                          <div className="text-xs sm:text-sm font-medium">
                            Last Score
                          </div>
                          <div
                            className={`text-sm sm:text-base font-bold ${getGradeColor(
                              subject.grade
                            )}`}>
                            {subject.lastScore}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Timeline */}
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">
                Learning Timeline
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Progress over time for selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {getSelectedChildData().map((child) => (
                  <div key={child.id} className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2 text-sm sm:text-base">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={child.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="text-xs">
                          {child.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      {child.name}
                    </h3>
                    <div className="grid gap-3 grid-cols-2 sm:grid-cols-2 md:grid-cols-4">
                     
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                          <span className="text-xs sm:text-sm font-medium">
                            Tests
                          </span>
                        </div>
                        <div className="text-base sm:text-lg font-bold">
                          {child.weeklyStats.testsCompleted}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Completed
                        </div>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Target className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
                          <span className="text-xs sm:text-sm font-medium">
                            Avg Score
                          </span>
                        </div>
                        <div className="text-base sm:text-lg font-bold">
                          {child.weeklyStats.averageScore}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          This period
                        </div>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
                          <span className="text-xs sm:text-sm font-medium">
                            Streak
                          </span>
                        </div>
                        <div className="text-base sm:text-lg font-bold">
                          {child.weeklyStats.streak}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Days
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
      </Tabs>
    </div>
  );
}

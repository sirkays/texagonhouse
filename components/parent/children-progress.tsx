"use client";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  Target,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { Spinner } from "../ui/spinner";
// Types based on API docs and logs
interface Subject {
  name: string;
  progress: number;
  grade: string;
  lastScore: number;
  trend: "up" | "down" | "stable";
  isPrivate?: boolean;
  tag?: string | null;
}

interface Stats {
  testsCompleted: number;
  averageScore: number;
  streak: number;
  coursesCompleted?: number;
}
interface Child {
  id: number;
  name: string;
  grade: string;
  school: string;
  avatar?: string | null;
  email?: string;
  status?: string;
  subscription?: string;
  lastActive?: string;
  joinDate?: string;
  totalCourses?: number;
  completedCourses?: number;
  relationship?: string;
  admissionNo?: string;
  subjects?: Subject[];
  weeklyStats?: Stats;
  monthlyStats?: Stats;
  quarterlyStats?: Stats;
  semesterStats?: Stats;
  yearlyStats?: Stats;
}
interface TimePeriod {
  value: string;
  label: string;
  description?: string;
}

// DEFAULTS BEFORE API LOADS
const DEFAULT_TIME_PERIODS: TimePeriod[] = [
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "quarter", label: "This Quarter" },
  { value: "semester", label: "This Semester" },
  { value: "year", label: "This Year" },
];


// Utility for fetch with retry
const fetchWithRetry = async (
  url: string,
  options: RequestInit,
  retries = 3,
  timeout = 30000
): Promise<Response> => {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(id);
      return response;
    } catch (err: any) {
      if (i === retries - 1) throw err;
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
    }
  }
  throw new Error("Max retries reached");
};
export default function ChildrenProgress() {
  const [children, setChildren] = useState<Child[]>([]);
  const [timePeriods, setTimePeriods] = useState<TimePeriod[]>([]);
  const [selectedChild, setSelectedChild] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [progressData, setProgressData] = useState<Child[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isProgressLoading, setIsProgressLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchStaticData = async () => {
      setIsInitialLoading(true);
      try {
        await Promise.all([fetchChildrenList(), fetchTimePeriods()]);
      } catch (err: any) {
        setError("Failed to load initial data. Please try again.");
      } finally {
        setIsInitialLoading(false);
      }
    };
    fetchStaticData();
  }, []);

  useEffect(() => {
    if (!isInitialLoading) {
      fetchProgressData();
    }
  }, [isInitialLoading, selectedChild, selectedPeriod]);

  const fetchChildrenList = async () => {
    try {
      const res = await fetchWithRetry("/api/parent/children-list", {
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.detail || "Failed to fetch children list");
      setChildren(data.children || []);
    } catch (err: any) {
      console.error("[ChildrenProgress] Error fetching children:", err);
      setError(err.message || "Failed to load children list");
    }
  };
  const fetchTimePeriods = async () => {
    try {
      const res = await fetchWithRetry("/api/parent/time-periods", {
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.detail || "Failed to fetch time periods");
      setTimePeriods(data.timePeriods || []);
    } catch (err: any) {
      console.error("[ChildrenProgress] Error fetching time periods:", err);
      setError(err.message || "Failed to load time periods");
    }
  };
  const fetchProgressData = async () => {
    setIsProgressLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        child_id: selectedChild,
        time_period: selectedPeriod,
      }).toString();
      const res = await fetchWithRetry(
        `/api/parent/children-progress?${params}`,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.detail || "Failed to fetch progress data");
      setProgressData(data.children || []);
    } catch (err: any) {
      console.error("[ChildrenProgress] Error fetching progress:", err);
      setError(err.message || "Failed to load progress data");
    } finally {
      setIsProgressLoading(false);
    }
  };
const refreshAll = async () => {
  setError(null);
  setIsInitialLoading(true);

  try {
    await Promise.all([fetchChildrenList(), fetchTimePeriods()]);
  } finally {
    setIsInitialLoading(false);
  }
};

  const getSelectedChildData = (): Child[] => {
    return selectedChild === "all"
      ? progressData
      : progressData.filter((child) => child.id.toString() === selectedChild);
  };

  const getStatsKey = (period: string): keyof Child => {
    switch (period) {
      case "week":
        return "weeklyStats";
      case "month":
        return "monthlyStats";
      case "quarter":
        return "quarterlyStats";
      case "semester":
        return "semesterStats";
      case "year":
        return "yearlyStats";
      default:
        return "weeklyStats";
    }
  };

  const getTrendIcon = (trend: string = "stable") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-3 w-3 text-green-600" />;
      case "down":
        return <TrendingUp className="h-3 w-3 text-red-600 rotate-180" />;
      default:
        return <TrendingUp className="h-3 w-3 text-gray-400" />;
    }
  };
  const getGradeColor = (grade: string = "") => {
    if (grade.startsWith("A")) return "text-green-600 bg-transparent";
    if (grade.startsWith("B")) return "text-blue-600 bg-transparent";
    if (grade.startsWith("C")) return "text-yellow-600 bg-transparent";
    return "text-red-600";
  };
  const getOverallStats = () => {
    const childrenData = getSelectedChildData();
    const statsKey = getStatsKey(selectedPeriod);
    const totalTests = childrenData.reduce((sum, child) => {
      const stats = child[statsKey] as Stats | undefined;
      return sum + (stats?.testsCompleted || 0);
    }, 0);
    const avgScore = Math.round(
      childrenData.reduce((sum, child) => {
        const stats = child[statsKey] as Stats | undefined;
        return sum + (stats?.averageScore || 0);
      }, 0) / Math.max(childrenData.length, 1)
    );
    const avgStreak = Math.round(
      childrenData.reduce((sum, child) => {
        const stats = child[statsKey] as Stats | undefined;
        return sum + (stats?.streak || 0);
      }, 0) / Math.max(childrenData.length, 1)
    );
    return { totalTests, avgScore, avgStreak };
  };
  const overallStats = getOverallStats();
  const selectedData = getSelectedChildData();
  if (isInitialLoading) {
    return (
      <div className="inset-0 flex justify-center items-center bg-white z-50 h-[100vh]">
        <Spinner
          className="w-10 h-10 xs:w-12 xs:h-12 text-[#EF7B55] self-center"
          size="sm"
        />
      </div>
    );
  }
  return (
    <div className="container mx-auto sm:p-6">
      <div className="space-y-4 mb-6">
        <div className="flex flex-col items-start gap-2">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
            Children&apos;s Progress
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Detailed learning analytics and performance tracking
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refreshAll}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>
      {error && (
        <div className="text-center py-4 mb-6">
          <p className="text-red-600 mb-2">{error}</p>
          {error.includes("Unauthorized") && (
            <p className="text-sm text-red-600 mb-4">Please log in again.</p>
          )}
          <Button variant="outline" onClick={refreshAll}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      )}
      {children.length === 0 && !error && (
        <Card className="text-center py-8">
          <CardContent>
            <p className="text-muted-foreground">
              No children linked to your account yet.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Contact support to get started.
            </p>
          </CardContent>
        </Card>
      )}
      {children.length > 0 && (
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
                <Select
                  value={selectedPeriod}
                  onValueChange={setSelectedPeriod}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose period" />
                  </SelectTrigger>
                  <SelectContent>
                  {(timePeriods.length ? timePeriods : DEFAULT_TIME_PERIODS).map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}

                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {isProgressLoading && (
        <p className="text-center py-4">Updating progress...</p>
      )}
      {!isProgressLoading && !error && progressData.length > 0 && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 mb-6">
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
              <p className="text-xs text-muted-foreground">
                This {selectedPeriod}
              </p>
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
              <p className="text-xs text-muted-foreground">
                Across all tests
              </p>
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
      )}
      <Tabs defaultValue="subjects" className="space-y-4">
        <TabsList className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
          <TabsTrigger
            className="bg-transparent w-full sm:w-40 justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3"
            value="subjects"
          >
            Tests Performance
          </TabsTrigger>
          <TabsTrigger
            className="bg-transparent w-full sm:w-40 justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3"
            value="timeline"
          >
            Progress Timeline
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value="subjects"
          className="grid gap-4 grid-cols-1 md:grid-cols-2"
        >
          {!isProgressLoading &&
            !error &&
            progressData.length > 0 &&
            selectedData.map((child) => (
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
                    {(child.subjects || []).length > 0 ? (
                      child.subjects!.map((subject, index) => (
                        <div
                          key={index}
                          className="flex flex-col gap-3 p-3 border rounded-lg"
                        >
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex flex-col gap-1">
                              <h4 className="font-medium text-sm sm:text-base">
                                {subject.name}
                              </h4>

                              {subject.isPrivate && (
                                <div className="flex flex-col gap-1">
                                  <Badge className="bg-red-600 text-white text-xs w-fit">
                                    Private
                                  </Badge>
                                  <span className="text-[11px] text-red-600">
                                    Not included in average score
                                  </span>
                                </div>
                              )}
                            </div>


                            <div className="flex items-center gap-2">
                              <Badge className={getGradeColor(subject.grade)}>
                                {subject.grade}
                              </Badge>
                              {getTrendIcon(subject.trend)}
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <div className="text-left sm:text-right">
                              <div className="text-xs sm:text-sm font-medium">
                                Score
                              </div>
                              <div
                                className={`text-sm sm:text-base font-bold ${getGradeColor(
                                  subject.grade
                                )}`}
                              >
                                {subject.lastScore}%
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground">
                        No tests available
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          {!isProgressLoading && !error && selectedData.length === 0 && (
            <p className="text-center col-span-full py-8 text-muted-foreground">
              No progress data for selected filters.
            </p>
          )}
        </TabsContent>
        <TabsContent value="timeline" className="space-y-4">
          {!isProgressLoading && !error && progressData.length > 0 ? (
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
                  {selectedData.map((child) => {
                    const statsKey = getStatsKey(selectedPeriod);
                    const stats = (child[statsKey] as Stats | undefined) || {
                      testsCompleted: 0,
                      averageScore: 0,
                      streak: 0,
                    };
                    return (
                      <div key={child.id} className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2 text-sm sm:text-base">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={child.avatar || "/placeholder.svg"}
                            />
                            <AvatarFallback className="text-xs">
                              {child.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          {child.name}
                        </h3>
                        <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
                          <div className="p-3 bg-muted rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                              <span className="text-xs sm:text-sm font-medium">
                                Tests
                              </span>
                            </div>
                            <div className="text-base sm:text-lg font-bold">
                              {stats.testsCompleted}
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
                              {stats.averageScore}%
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
                              {stats.streak}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Days
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ) : (
            !error && (
              <p className="text-center py-8 text-muted-foreground">
                Select filters to view timeline.
              </p>
            )
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
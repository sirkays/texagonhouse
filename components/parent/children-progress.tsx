"use client";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  Zap,
  BookOpen,
  Calendar,
  Clock,
  Filter,
} from "lucide-react";
import { Spinner } from "../ui/spinner";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
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
  const [childSearch, setChildSearch] = useState("");
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
    <div className="space-y-8 max-w-7xl mx-auto p-1 sm:p-2">
      {/* Premium Gradient Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-[#e26d47] p-6 sm:p-8 text-white shadow-xl dark:shadow-none">
        <div className="absolute right-0 top-0 h-64 w-64 -translate-y-12 translate-x-12 rounded-full bg-[#EF7B55]/15 blur-3xl" />
        <div className="absolute left-1/3 bottom-0 h-40 w-40 translate-y-12 rounded-full bg-indigo-500/15 blur-3xl" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <Badge className="bg-[#EF7B55]/20 text-[#ffae91] border border-[#EF7B55]/30 hover:bg-[#EF7B55]/30 px-3 py-1 font-semibold text-xs tracking-wide">
              Detailed Learning Analytics
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-orange-100 bg-clip-text text-transparent">
              Children's Progress & Performance
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
              Track course performance, evaluation trends, and active learning milestones for all your registered children.
            </p>
          </div>
          
          <Button 
            onClick={refreshAll}
            className="backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-xl shadow-md shrink-0 flex items-center gap-2 self-start sm:self-center"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Analytics
          </Button>
        </div>
      </div>

      {error && (
        <div className="text-center py-4 mb-6 backdrop-blur-md bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-450 p-4 rounded-xl shadow-sm">
          <p className="font-bold mb-2">{error}</p>
          {error.includes("Unauthorized") && (
            <p className="text-xs text-rose-500 mb-4 font-semibold">Please log in again.</p>
          )}
          <Button variant="outline" onClick={refreshAll} className="rounded-xl font-bold border-rose-250 text-rose-600 hover:bg-rose-50">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      )}

      {children.length === 0 && !error && (
        <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/60 shadow-xl rounded-2xl overflow-hidden py-12 text-center">
          <CardContent className="space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-850 flex items-center justify-center text-slate-400">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-350">No Children Linked</h3>
            <p className="text-slate-400 text-sm max-w-sm mx-auto">
              No children profiles are linked to this parent account yet. Please contact support or your school administrator to link student accounts.
            </p>
          </CardContent>
        </Card>
      )}

      {children.length > 0 && (
        <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/60 shadow-xl shadow-slate-100/40 dark:shadow-none rounded-2xl overflow-hidden w-full">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-3 sm:pb-4">
            <div className="flex items-center gap-2.5 text-slate-800 dark:text-slate-100">
              <Filter className="h-4.5 w-4.5 text-[#EF7B55]" />
              <CardTitle className="text-base sm:text-lg font-bold">
                Filter & View Options
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-5">
              <div className="flex-1 space-y-2">
                <label className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400">
                  Select Child
                </label>
             
                <Select 
                  value={selectedChild} 
                  onValueChange={setSelectedChild}
                  onOpenChange={(open) => {
                    if (!open) setChildSearch(""); // Clear search on close
                  }}
                >
                  <SelectTrigger className="w-full bg-white/50 dark:bg-slate-950/20 border-slate-200/80 dark:border-slate-800 focus:border-[#EF7B55] focus:ring-2 focus:ring-[#EF7B55]/10 rounded-xl h-10 transition-all font-semibold">
                    <SelectValue placeholder="Choose child" />
                  </SelectTrigger>
                  
                  <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl shadow-xl">
                    {/* Sticky Search Header */}
                    <div className="p-2 sticky top-0 bg-white dark:bg-slate-900 z-10 border-b border-slate-100 dark:border-slate-850">
                      <Input
                        placeholder="Search children..."
                        value={childSearch}
                        onChange={(e) => setChildSearch(e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                        className="h-8 text-sm bg-slate-50 dark:bg-slate-950/50 rounded-lg border-slate-200 dark:border-slate-800"
                      />
                    </div>

                    {/* Scrollable List */}
                    <div className="max-h-[200px] overflow-y-auto mt-1">
                      {/* Always keep 'All Children' visible at the top */}
                      <SelectItem value="all" className="font-semibold rounded-lg m-1 hover:bg-slate-50 dark:hover:bg-slate-850 focus:bg-slate-50 dark:focus:bg-slate-850">All Children</SelectItem>
                      
                      {children
                        .filter((child) =>
                          child.name.toLowerCase().includes(childSearch.toLowerCase())
                        )
                        .map((child) => (
                          <SelectItem key={child.id} value={child.id.toString()} className="font-semibold rounded-lg m-1 hover:bg-slate-50 dark:hover:bg-slate-850 focus:bg-slate-50 dark:focus:bg-slate-850">
                            {child.name}
                          </SelectItem>
                        ))}

                      {/* Empty State */}
                      {children.filter((child) =>
                        child.name.toLowerCase().includes(childSearch.toLowerCase())
                      ).length === 0 && (
                        <div className="p-2 text-sm text-slate-400 dark:text-slate-500 text-center font-semibold">
                          No children found
                        </div>
                      )}
                    </div>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 space-y-2">
                <label className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400">
                  Time Period
                </label>
                <Select
                  value={selectedPeriod}
                  onValueChange={setSelectedPeriod}
                >
                  <SelectTrigger className="w-full bg-white/50 dark:bg-slate-950/20 border-slate-200/80 dark:border-slate-800 focus:border-[#EF7B55] focus:ring-2 focus:ring-[#EF7B55]/10 rounded-xl h-10 transition-all font-semibold">
                    <SelectValue placeholder="Choose period" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl shadow-xl">
                    <div className="p-1">
                      {(timePeriods.length ? timePeriods : DEFAULT_TIME_PERIODS).map((period) => (
                        <SelectItem key={period.value} value={period.value} className="font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-850 focus:bg-slate-50 dark:focus:bg-slate-850">
                          {period.label}
                        </SelectItem>
                      ))}
                    </div>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isProgressLoading && (
        <div className="flex justify-center items-center py-12 gap-3 text-[#EF7B55]">
          <Spinner className="w-6 h-6 text-[#EF7B55]" />
          <span className="font-bold text-sm">Updating analytics...</span>
        </div>
      )}

      {!isProgressLoading && !error && progressData.length > 0 && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/60 shadow-md hover:-translate-y-1 hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-bold text-slate-600 dark:text-slate-400 group-hover:text-[#EF7B55] transition-colors">
                Tests Completed
              </CardTitle>
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 shrink-0 shadow-sm">
                <CheckCircle className="h-4.5 w-4.5" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1 pb-4">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                {overallStats.totalTests}
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wide">
                This {selectedPeriod}
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/60 shadow-md hover:-translate-y-1 hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-bold text-slate-600 dark:text-slate-400 group-hover:text-emerald-500 transition-colors">
                Average Score
              </CardTitle>
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 shrink-0 shadow-sm">
                <Target className="h-4.5 w-4.5" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1 pb-4">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-500 tracking-tight">
                {overallStats.avgScore}%
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wide">
                Across all tests
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/60 shadow-md hover:-translate-y-1 hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-bold text-slate-600 dark:text-slate-400 group-hover:text-orange-500 transition-colors">
                Learning Streak
              </CardTitle>
              <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/20 text-[#EF7B55] shrink-0 shadow-sm">
                <TrendingUp className="h-4.5 w-4.5" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1 pb-4">
              <div className="text-2xl sm:text-3xl font-extrabold text-orange-500 tracking-tight">
                {overallStats.avgStreak} Days
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wide">
                Days average
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="subjects" className="space-y-6">
        {/* Floating Glassmorphic Tabs Bar */}
        <div className="flex justify-center md:justify-start">
          <TabsList className="bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-xl flex w-full max-w-md gap-1 border border-slate-200/60 dark:border-slate-700/50 shadow-sm">
            <TabsTrigger
              className="w-full justify-center py-2 px-3 rounded-lg text-slate-600 dark:text-slate-300 font-medium transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#EF7B55] data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-md gap-2 text-xs sm:text-sm"
              value="subjects"
            >
              <Target className="h-4 w-4 shrink-0" />
              Tests Performance
            </TabsTrigger>
            <TabsTrigger
              className="w-full justify-center py-2 px-3 rounded-lg text-slate-600 dark:text-slate-300 font-medium transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#EF7B55] data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-md gap-2 text-xs sm:text-sm"
              value="timeline"
            >
              <TrendingUp className="h-4 w-4 shrink-0" />
              Progress Timeline
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="subjects"
          className="grid gap-6 grid-cols-1 md:grid-cols-2 outline-none"
        >
          {!isProgressLoading &&
            !error &&
            progressData.length > 0 &&
            selectedData.map((child) => (
              <Card key={child.id} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/60 shadow-xl shadow-slate-100/40 dark:shadow-none rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl border border-slate-100 dark:border-slate-800 shrink-0 shadow-sm">
                      <AvatarImage src={child.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-gradient-to-tr from-[#EF7B55]/10 to-orange-500/10 text-[#EF7B55] font-extrabold text-xs sm:text-sm rounded-xl">
                        {child.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 truncate">
                        {child.name}
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold truncate">
                        {child.grade} &bull; {child.school}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-5 sm:p-6">
                  <div className="space-y-4">
                    {(child.subjects || []).length > 0 ? (
                      child.subjects!.map((subject, index) => (
                        <div
                          key={index}
                          className="flex flex-col gap-3 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60 bg-white/40 dark:bg-slate-950/20 hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-all duration-300 relative group overflow-hidden"
                        >
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex flex-col gap-1 min-w-0">
                              <h4 className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-100 group-hover:text-[#EF7B55] transition-colors truncate">
                                {subject.name}
                              </h4>

                              {subject.isPrivate && (
                                <div className="flex flex-col gap-0.5 mt-0.5">
                                  <Badge className="bg-rose-50 text-rose-700 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30 text-[10px] w-fit font-bold rounded px-1.5 py-0">
                                    Private
                                  </Badge>
                                  <span className="text-[10px] text-rose-450 dark:text-rose-500 font-semibold">
                                    Not included in average score
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <Badge className={cn("text-xs font-extrabold rounded-full px-2.5 py-0.5 border shadow-none",
                                subject.grade.startsWith("A") ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30" :
                                subject.grade.startsWith("B") ? "bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30" :
                                subject.grade.startsWith("C") ? "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30" :
                                "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30"
                              )}>
                                {subject.grade}
                              </Badge>
                              <div className="p-1 rounded bg-slate-100 dark:bg-slate-800 shrink-0">
                                {getTrendIcon(subject.trend)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                              <span>Evaluation Score</span>
                              <span className={cn("font-extrabold text-sm",
                                subject.lastScore >= 90 ? "text-emerald-500" :
                                subject.lastScore >= 80 ? "text-indigo-500" :
                                subject.lastScore >= 70 ? "text-amber-500" :
                                "text-rose-500"
                              )}>
                                {subject.lastScore}%
                              </span>
                            </div>
                            <Progress
                              value={subject.lastScore}
                              className={cn(
                                "h-2 bg-slate-100 dark:bg-slate-800 rounded-full",
                                subject.lastScore >= 90 ? "[&>div]:bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:to-emerald-600" :
                                subject.lastScore >= 80 ? "[&>div]:bg-gradient-to-r [&>div]:from-indigo-500 [&>div]:to-indigo-600" :
                                subject.lastScore >= 70 ? "[&>div]:bg-gradient-to-r [&>div]:from-amber-500 [&>div]:to-amber-600" :
                                "[&>div]:bg-gradient-to-r [&>div]:from-rose-500 [&>div]:to-rose-600"
                              )}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center">
                        <div className="mx-auto w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-850 flex items-center justify-center text-slate-400 mb-3 border border-slate-100 dark:border-slate-800">
                          <BookOpen className="h-6 w-6" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Tests Recorded</h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                          Subject evaluation reports will populate here once published.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          {!isProgressLoading && !error && selectedData.length === 0 && (
            <div className="py-16 text-center col-span-full bg-white/40 dark:bg-slate-900/40 border border-dashed rounded-2xl">
              <div className="mx-auto w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-400 mb-3">
                <BookOpen className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No matching progress data</h4>
              <p className="text-xs text-slate-400 mt-1">Try adapting your search query or selected filters.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="timeline" className="space-y-6 outline-none">
          {!isProgressLoading && !error && progressData.length > 0 ? (
            <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/60 shadow-xl shadow-slate-100/40 dark:shadow-none rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/20 text-[#EF7B55]">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100">
                      Learning Timeline
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      Comparison of learning metrics and progress history over the selected period.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5 sm:p-6">
                <div className="space-y-8">
                  {selectedData.map((child) => {
                    const statsKey = getStatsKey(selectedPeriod);
                    const stats = (child[statsKey] as Stats | undefined) || {
                      testsCompleted: 0,
                      averageScore: 0,
                      streak: 0,
                    };
                    return (
                      <div key={child.id} className="space-y-4 border-b border-slate-100 dark:border-slate-800/80 last:border-b-0 pb-6 last:pb-0">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 rounded-lg border border-slate-100 dark:border-slate-800 shrink-0">
                            <AvatarImage
                              src={child.avatar || "/placeholder.svg"}
                            />
                            <AvatarFallback className="bg-gradient-to-tr from-[#EF7B55]/10 to-orange-500/10 text-[#EF7B55] font-extrabold text-xs rounded-lg">
                              {child.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <h3 className="font-bold text-sm sm:text-base text-slate-850 dark:text-slate-200">
                            {child.name}
                          </h3>
                        </div>
                        
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                          <div className="p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/60 rounded-xl space-y-1">
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold text-xs">
                              <CheckCircle className="h-4 w-4 text-indigo-500" />
                              <span>Tests Completed</span>
                            </div>
                            <div className="text-xl font-extrabold text-slate-800 dark:text-slate-100 pt-1">
                              {stats.testsCompleted}
                            </div>
                            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">
                              In {selectedPeriod}
                            </div>
                          </div>
                          
                          <div className="p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/60 rounded-xl space-y-1">
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold text-xs">
                              <Target className="h-4 w-4 text-emerald-500" />
                              <span>Average Score</span>
                            </div>
                            <div className="text-xl font-extrabold text-emerald-500 pt-1">
                              {stats.averageScore}%
                            </div>
                            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">
                              Overall progress
                            </div>
                          </div>
                          
                          <div className="p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/60 rounded-xl space-y-1">
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold text-xs">
                              <TrendingUp className="h-4 w-4 text-orange-500" />
                              <span>Current Streak</span>
                            </div>
                            <div className="text-xl font-extrabold text-orange-500 pt-1">
                              {stats.streak} Days
                            </div>
                            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">
                              Consistent study
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
              <div className="py-16 text-center bg-white/40 dark:bg-slate-900/40 border border-dashed rounded-2xl">
                <div className="mx-auto w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-400 mb-3">
                  <Clock className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Select filters to view timeline</h4>
                <p className="text-xs text-slate-400 mt-1">Please ensure you have children records and a period selected.</p>
              </div>
            )
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
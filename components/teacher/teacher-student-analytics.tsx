"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
  ArrowRight,
  Activity,
  Trophy,
  Zap,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { Spinner } from "../ui/spinner";

// Map icon names to Lucide icon components
const iconMap: Record<string, React.ElementType> = {
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
};

const statGradients = [
  "from-violet-500 to-purple-600",
  "from-orange-400 to-rose-500",
  "from-emerald-400 to-teal-600",
  "from-sky-400 to-blue-600",
];

const statBgGlass = [
  "bg-violet-500/10 border-violet-500/20",
  "bg-orange-400/10 border-orange-400/20",
  "bg-emerald-400/10 border-emerald-400/20",
  "bg-sky-400/10 border-sky-400/20",
];

const statIconBg = [
  "bg-violet-500/20 text-violet-500",
  "bg-orange-400/20 text-orange-400",
  "bg-emerald-400/20 text-emerald-500",
  "bg-sky-400/20 text-sky-500",
];

export interface CourseDetail {
  id: string;
  name: string;
  students: number;
  avgProgress: number;
  avgScore: number;
  completionRate: number;
  passRate?: number;
  rating?: number;
  totalLessons?: number;
  completedLessons?: number;
  enrollmentTrend?: number[];
  weeklyActivity?: { day: string; active: number }[];
  topPerformers?: { name: string; score: number; progress: number }[];
  strugglingStudents?: {
    name: string;
    score: number;
    progress: number;
    lastActive: string;
  }[];
}

export interface TestDetail {
  id: string;
  name: string;
  attempts: number;
  avgScore: number;
  passRate: number;
  difficulty: string;
  questions: number;
  timeLimit: string;
  scoreDistribution: { range: string; count: number }[];
  commonMistakes?: { question: string; incorrectRate: number }[];
  performanceByTime?: { hour: string; avgScore: number; attempts: number }[];
}

interface AnalyticsData {
  overallStats: {
    title: string;
    value: string;
    change?: string;
    icon: string;
    color: string;
  }[];
  coursePerformance: CourseDetail[];
  topStudents: {
    name: string;
    coursesCompleted: number;
    avgScore: number;
    lastActive: string;
  }[];
  testAnalytics: TestDetail[];
  popularContent: {
    title: string;
    views?: number;
    downloads?: number;
    type: string;
  }[];
}

function ScoreRing({ value, size = 56 }: { value: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (value / 100) * circ;
  const color =
    value >= 75 ? "#10b981" : value >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={4}
        className="text-muted/30"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%", transition: "stroke-dashoffset 0.6s ease" }}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize={size / 4.5}
        fontWeight="700"
        fill={color}
      >
        {value}%
      </text>
    </svg>
  );
}

function getDifficultyStyle(difficulty: string) {
  if (difficulty === "Easy")
    return "bg-emerald-500/15 text-emerald-600 border-emerald-500/30";
  if (difficulty === "Medium")
    return "bg-amber-500/15 text-amber-600 border-amber-500/30";
  return "bg-rose-500/15 text-rose-600 border-rose-500/30";
}

export function TeacherStudentAnalytics() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPageCourses, setCurrentPageCourses] = useState(1);
  const [currentPageStudents, setCurrentPageStudents] = useState(1);
  const [currentPageTests, setCurrentPageTests] = useState(1);

  const itemsPerPage = 4;

  const sessionToken = useMemo(
    () => session?.user?.sessionToken || null,
    [session?.user?.sessionToken],
  );

  useEffect(() => {
    async function fetchAnalytics() {
      if (status !== "authenticated" || !sessionToken) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/teacher/analytics", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            sessionToken,
          },
        });

        if (!response.ok) {
          throw new Error(
            response.status === 401
              ? "Authentication failed"
              : response.status === 403
                ? "Forbidden"
                : response.status === 404
                  ? "Teacher profile not found"
                  : "Failed to fetch analytics data",
          );
        }

        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [sessionToken, status]);

  const getPaginatedItems = <T,>(
    items: T[] | undefined,
    currentPage: number,
  ) => {
    const safeItems = Array.isArray(items) ? items : [];
    const totalPages = Math.max(1, Math.ceil(safeItems.length / itemsPerPage));
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return {
      paginatedItems: safeItems.slice(indexOfFirstItem, indexOfLastItem),
      totalPages,
      totalCount: safeItems.length,
    };
  };

  const handleViewCourseDetails = (course: CourseDetail) => {
    // Store in sessionStorage so the detail page can read it
    sessionStorage.setItem(
      `analytics_course_${course.id}`,
      JSON.stringify(course),
    );
    router.push(`/teacher/student-analytics/course/${course.id}`);
  };

  const handleViewTestDetails = (test: TestDetail) => {
    sessionStorage.setItem(
      `analytics_test_${test.id}`,
      JSON.stringify(test),
    );
    router.push(`/teacher/student-analytics/test/${test.id}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="md" className="text-orange-500" />
          <p className="text-sm text-muted-foreground animate-pulse">
            Loading analytics…
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto">
            <Activity className="h-7 w-7 text-rose-500" />
          </div>
          <p className="text-sm text-rose-600 font-medium">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    );
  }

  const coursesPage = getPaginatedItems(data.coursePerformance, currentPageCourses);
  const studentsPage = getPaginatedItems(data.topStudents, currentPageStudents);
  const testsPage = getPaginatedItems(data.testAnalytics, currentPageTests);

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-full mx-auto">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">
            Student Analytics
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Monitor student progress and performance across all courses
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground border border-border/60 rounded-xl px-3 py-2 bg-muted/30 w-fit">
          <Zap className="h-3.5 w-3.5 text-orange-400" />
          Live data
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {Array.isArray(data.overallStats) &&
          data.overallStats
            .filter((stat) => stat.title !== "Course Completions" && stat.title !== "Course Completion")
            .map((stat, index) => {
            const IconComponent = iconMap[stat.icon] || Users;
            const changeText = (stat.change || "").trim();
            const gradient = statGradients[index % statGradients.length];
            const glass = statBgGlass[index % statBgGlass.length];
            const iconStyle = statIconBg[index % statIconBg.length];

            return (
              <div
                key={index}
                className={`relative overflow-hidden rounded-2xl border p-5 ${glass} backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
              >
                {/* decorative blob */}
                <div
                  className={`absolute -right-4 -top-4 h-20 w-20 rounded-full bg-gradient-to-br ${gradient} opacity-10 blur-xl`}
                />
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">
                      {stat.title}
                    </p>
                    <div className="text-2xl sm:text-3xl font-bold">
                      {stat.value}
                    </div>
                    {changeText ? (
                      <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {changeText} from last month
                      </p>
                    ) : null}
                  </div>
                  <div className={`p-2.5 rounded-xl ${iconStyle}`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* ── Tabs ── */}
      <Tabs
        defaultValue="courses"
        className="w-full"
        onValueChange={() => {
          setCurrentPageCourses(1);
          setCurrentPageStudents(1);
          setCurrentPageTests(1);
        }}
      >
        <TabsList className="flex flex-row overflow-x-auto gap-1 h-auto p-1.5 rounded-2xl bg-muted/50 border border-border/50 w-full scrollbar-none whitespace-nowrap mb-4 justify-start sm:justify-start">
          {[
            { value: "courses", label: "Course Performance", icon: BookOpen },
            { value: "students", label: "Top Students", icon: Trophy },
            { value: "tests", label: "Test Analytics", icon: BarChart3 },
          ].map(({ value, label, icon: Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="flex-none shrink-0 flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-medium transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-rose-500 data-[state=active]:text-white data-[state=active]:shadow-md"
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── COURSES ── */}
        <TabsContent value="courses" className="space-y-4 mt-0">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Course Performance</h2>
            <span className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full border border-border/50">
              {coursesPage.totalCount} course{coursesPage.totalCount !== 1 ? "s" : ""}
            </span>
          </div>

          {coursesPage.totalCount === 0 ? (
            <EmptyState icon={BookOpen} title="No Courses Found" description="No courses available to display analytics" />
          ) : (
            <>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {coursesPage.paginatedItems.map((course, index) => (
                  <div
                    key={course.id || index}
                    className="group relative rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm p-5 hover:border-orange-400/40 hover:shadow-lg transition-all duration-300"
                  >
                    {/* top row */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">{course.name}</h4>
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          {course.students} student{course.students !== 1 ? "s" : ""}
                        </div>
                      </div>
                      <ScoreRing value={course.avgScore} size={52} />
                    </div>

                    {/* progress bars */}
                    <div className="space-y-3 mb-4">
                      <MetricBar label="Pass Rate" value={course.passRate ?? 0} color="bg-emerald-500" />
                    </div>

                    {/* CTA */}
                    <button
                      onClick={() => handleViewCourseDetails(course)}
                      className="w-full flex items-center justify-center gap-2 rounded-xl border border-orange-400/40 bg-orange-500/5 hover:bg-orange-500/15 text-orange-600 text-xs font-medium py-2 transition-all duration-200 group-hover:border-orange-400/70"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View Full Details
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                ))}
              </div>
              <PaginationRow
                currentPage={currentPageCourses}
                totalPages={coursesPage.totalPages}
                onPageChange={setCurrentPageCourses}
              />
            </>
          )}
        </TabsContent>

        {/* ── TOP STUDENTS ── */}
        <TabsContent value="students" className="space-y-4 mt-0">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Top Performing Students</h2>
            <span className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full border border-border/50">
              {studentsPage.totalCount} student{studentsPage.totalCount !== 1 ? "s" : ""}
            </span>
          </div>

          {studentsPage.totalCount === 0 ? (
            <EmptyState icon={Users} title="No Students Found" description="No student data available to display" />
          ) : (
            <>
              <div className="grid gap-3">
                {studentsPage.paginatedItems.map((student, index) => {
                  const rank = index + 1 + (currentPageStudents - 1) * itemsPerPage;
                  const rankColors = ["text-amber-500", "text-slate-400", "text-amber-700"];
                  const rankBg = ["bg-amber-500/10", "bg-slate-400/10", "bg-amber-700/10"];
                  const isTopThree = rank <= 3;

                  return (
                    <div
                      key={`${student.name}-${index}`}
                      className="flex items-center gap-4 p-4 rounded-2xl border border-border/60 bg-card/50 hover:border-orange-400/30 transition-all duration-200"
                    >
                      {/* rank badge */}
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                          isTopThree
                            ? `${rankBg[rank - 1]} ${rankColors[rank - 1]}`
                            : "bg-muted/50 text-muted-foreground"
                        }`}
                      >
                        {isTopThree ? <Trophy className="h-4 w-4" /> : `#${rank}`}
                      </div>

                      {/* name & activity */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">{student.name}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Last active: {student.lastActive}
                        </p>
                      </div>

                      {/* stats */}
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="text-center">
                          <div className="text-base font-bold">{student.coursesCompleted}</div>
                          <div className="text-[10px] text-muted-foreground">Courses</div>
                        </div>
                        <div className="text-center">
                          <div
                            className={`text-base font-bold ${
                              student.avgScore >= 75
                                ? "text-emerald-600"
                                : student.avgScore >= 50
                                  ? "text-amber-600"
                                  : "text-rose-600"
                            }`}
                          >
                            {student.avgScore}%
                          </div>
                          <div className="text-[10px] text-muted-foreground">Avg Score</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <PaginationRow
                currentPage={currentPageStudents}
                totalPages={studentsPage.totalPages}
                onPageChange={setCurrentPageStudents}
              />
            </>
          )}
        </TabsContent>

        {/* ── TESTS ── */}
        <TabsContent value="tests" className="space-y-4 mt-0">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Test Performance Analytics</h2>
            <span className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full border border-border/50">
              {testsPage.totalCount} test{testsPage.totalCount !== 1 ? "s" : ""}
            </span>
          </div>

          {testsPage.totalCount === 0 ? (
            <EmptyState icon={BarChart3} title="No Tests Found" description="No test data available to display" />
          ) : (
            <>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {testsPage.paginatedItems.map((test, index) => (
                  <div
                    key={test.id || index}
                    className="group relative rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm p-5 hover:border-sky-400/40 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">{test.name}</h4>
                        <div className="flex items-center flex-wrap gap-2 mt-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${getDifficultyStyle(test.difficulty)}`}
                          >
                            {test.difficulty}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {test.attempts} attempts
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {test.timeLimit}
                          </span>
                        </div>
                      </div>
                      <ScoreRing value={test.avgScore} size={52} />
                    </div>

                    <div className="space-y-3 mb-4">
                      <MetricBar label="Avg Score" value={test.avgScore} color="bg-sky-500" />
                      <MetricBar label="Pass Rate" value={test.passRate} color="bg-emerald-500" />
                    </div>

                    <button
                      onClick={() => handleViewTestDetails(test)}
                      className="w-full flex items-center justify-center gap-2 rounded-xl border border-sky-400/40 bg-sky-500/5 hover:bg-sky-500/15 text-sky-600 text-xs font-medium py-2 transition-all duration-200 group-hover:border-sky-400/70"
                    >
                      <BarChart3 className="h-3.5 w-3.5" />
                      View Full Details
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                ))}
              </div>
              <PaginationRow
                currentPage={currentPageTests}
                totalPages={testsPage.totalPages}
                onPageChange={setCurrentPageTests}
              />
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ── Shared sub-components ── */

function MetricBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value.toFixed(1)}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted/50 overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-700`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center py-16 rounded-2xl border border-dashed border-border/60">
      <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
        <Icon className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function PaginationRow({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <Pagination className="mt-4">
      <PaginationContent className="flex-wrap justify-center gap-1">
        <PaginationPrevious
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          className={currentPage === 1 ? "pointer-events-none opacity-40" : "cursor-pointer"}
        />
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              href="#"
              isActive={currentPage === page}
              onClick={(e) => {
                e.preventDefault();
                onPageChange(page);
              }}
              className={currentPage === page ? "bg-orange-500 text-white border-orange-500 hover:bg-orange-600" : ""}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        {totalPages > 5 && <PaginationEllipsis />}
        <PaginationNext
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          className={currentPage === totalPages ? "pointer-events-none opacity-40" : "cursor-pointer"}
        />
      </PaginationContent>
    </Pagination>
  );
}
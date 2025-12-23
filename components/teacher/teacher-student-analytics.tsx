"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

/**
 * Backend patch now returns coursePerformance items with modal-required fields:
 * topPerformers, strugglingStudents, etc.
 * Still, we keep everything defensive to avoid UI crashes.
 */
interface CourseDetail {
  id: string;
  name: string;
  students: number;
  avgProgress: number;
  avgScore: number;
  completionRate: number;

  // NEW: course pass rate (backend patch)
  passRate?: number;

  // fields used by modal (backend patch now provides)
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

interface TestDetail {
  id: string;
  name: string;
  attempts: number;
  avgScore: number;
  passRate: number;
  difficulty: string;
  questions: number;
  timeLimit: string;
  scoreDistribution: { range: string; count: number }[];

  // optional (you currently commented these out)
  commonMistakes?: { question: string; incorrectRate: number }[];
  performanceByTime?: { hour: string; avgScore: number; attempts: number }[];
}

interface AnalyticsData {
  overallStats: {
    title: string;
    value: string;
    change?: string; // PATCH: change may be empty or missing
    icon: string;
    color: string;
  }[];
  coursePerformance: CourseDetail[];
  topStudents: {
    name: string;
    coursesCompleted: number; // PATCH: backend now returns this
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

export function TeacherStudentAnalytics() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCourse, setSelectedCourse] = useState<CourseDetail | null>(null);
  const [selectedTest, setSelectedTest] = useState<TestDetail | null>(null);

  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

  const [currentPageCourses, setCurrentPageCourses] = useState(1);
  const [currentPageStudents, setCurrentPageStudents] = useState(1);
  const [currentPageTests, setCurrentPageTests] = useState(1);
  const [currentPageContent, setCurrentPageContent] = useState(1);

  const itemsPerPage = 3;

  const sessionToken = useMemo(
    () => session?.user?.sessionToken || null,
    [session?.user?.sessionToken]
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
            sessionToken, // matches your current route.ts expectation
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
              : "Failed to fetch analytics data"
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

  // Pagination logic (safe)
  const getPaginatedItems = <T,>(items: T[] | undefined, currentPage: number) => {
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
    setSelectedCourse(course);
    setIsCourseModalOpen(true);
  };

  const handleViewTestDetails = (test: TestDetail) => {
    setSelectedTest(test);
    setIsTestModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="md" className="text-orange-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-sm xs:text-base sm:text-lg text-red-600">
          Error: {error}
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-sm xs:text-base sm:text-lg text-muted-foreground">
          No data available
        </p>
      </div>
    );
  }

  const coursesPage = getPaginatedItems(data.coursePerformance, currentPageCourses);
  const studentsPage = getPaginatedItems(data.topStudents, currentPageStudents);
  const testsPage = getPaginatedItems(data.testAnalytics, currentPageTests);
  const contentPage = getPaginatedItems(data.popularContent, currentPageContent);

  return (
    <div className="space-y-4 p-3 xs:p-4 sm:p-6 max-w-full mx-auto">
      <div>
        <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold">
          Student Analytics
        </h1>
        <p className="text-muted-foreground text-xs xs:text-sm sm:text-base">
          Monitor student progress and performance across all courses
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid gap-3 xs:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {Array.isArray(data.overallStats) &&
          data.overallStats.map((stat, index) => {
            const IconComponent = iconMap[stat.icon] || Users;
            const changeText = (stat.change || "").trim();

            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 xs:pb-2">
                  <CardTitle className="text-[0.85rem] xs:text-xs sm:text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <IconComponent className={`h-3 w-3 xs:h-4 xs:w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-lg xs:text-xl sm:text-2xl font-bold">
                    {stat.value}
                  </div>

                  {/* PATCH: only show "from last month" if backend provides a change */}
                  {changeText ? (
                    <p className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs text-muted-foreground">
                      <span className="text-green-600">{changeText}</span> from last month
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
      </div>

      <Tabs
        defaultValue="courses"
        className="w-full"
        onValueChange={() => {
          setCurrentPageCourses(1);
          setCurrentPageStudents(1);
          setCurrentPageTests(1);
          setCurrentPageContent(1);
        }}
      >
        <TabsList className="bg-[rgba(247,151,113,0.18)] text-slate-700 flex flex-col lg:flex-row w-full gap-2 mb-14">
          <TabsTrigger
            value="courses"
            className="bg-transparent w-full sm:w-auto justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3"
          >
            Course Performance
          </TabsTrigger>
          <TabsTrigger
            value="students"
            className="bg-transparent w-full sm:w-auto justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3"
          >
            Top Students
          </TabsTrigger>
          <TabsTrigger
            value="tests"
            className="bg-transparent w-full sm:w-auto justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3"
          >
            Test Analytics
          </TabsTrigger>
        </TabsList>

        {/* -------------------- COURSES -------------------- */}
        <TabsContent value="courses" className="space-y-3 xs:space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm xs:text-base sm:text-lg">
                Course Performance Overview
              </CardTitle>
              <CardDescription className="text-[0.85rem] xs:text-xs sm:text-sm">
                Detailed analytics for each course
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground mb-2 xs:mb-3">
                Showing {coursesPage.paginatedItems.length} of {coursesPage.totalCount} Courses
              </div>

              <div className="space-y-3 xs:space-y-4">
                {coursesPage.paginatedItems.map((course, index) => (
                  <div
                    key={course.id || index}
                    className="p-2 xs:p-3 sm:p-4 border rounded-lg"
                  >
                    <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between mb-2 xs:mb-3 sm:mb-4">
                      <div>
                        <h4 className="font-medium text-[0.85rem] xs:text-xs sm:text-sm">
                          {course.name}
                        </h4>
                        <div className="flex items-center flex-wrap gap-2 xs:gap-3 text-[0.6rem] xs:text-[0.65rem] sm:text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="h-2.5 w-2.5 xs:h-3 xs:w-3" />
                            {course.students} students
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 xs:mt-0 text-[0.85rem] xs:text-xs sm:text-sm shadow-md hover:bg-gray-200"
                        onClick={() => handleViewCourseDetails(course)}
                      >
                        <Eye className="mr-1 xs:mr-2 h-2.5 w-2.5 xs:h-3 xs:w-3" />
                        View Details
                      </Button>
                    </div>

                    {/* PATCH: show Pass Rate + keep Completion Rate */}
                    <div className="grid grid-cols-1 xs:grid-cols-3 gap-3 xs:gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-[0.85rem] xs:text-xs sm:text-sm">
                          <span>Avg Score</span>
                          <span>{course.avgScore}%</span>
                        </div>
                        <Progress value={course.avgScore} className="h-1.5 xs:h-2" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-[0.85rem] xs:text-xs sm:text-sm">
                          <span>Pass Rate</span>
                          <span>{(course.passRate ?? 0).toFixed(2)}%</span>
                        </div>
                        <Progress value={course.passRate ?? 0} className="h-1.5 xs:h-2" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-[0.85rem] xs:text-xs sm:text-sm">
                          <span>Completion Rate</span>
                          <span>{course.completionRate}%</span>
                        </div>
                        <Progress value={course.completionRate} className="h-1.5 xs:h-2" />
                      </div>
                    </div>

                  </div>
                ))}
              </div>

              {coursesPage.totalCount === 0 ? (
                <div className="text-center py-8 xs:py-12">
                  <BookOpen className="mx-auto h-8 w-8 xs:h-12 xs:w-12 text-muted-foreground mb-3 xs:mb-4" />
                  <h3 className="text-base xs:text-lg sm:text-xl font-medium mb-2">
                    No Courses Found
                  </h3>
                  <p className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
                    No courses available to display analytics
                  </p>
                </div>
              ) : (
                <Pagination className="mt-4">
                  <PaginationContent>
                    <PaginationPrevious
                      onClick={() => setCurrentPageCourses((prev) => Math.max(prev - 1, 1))}
                      className={currentPageCourses === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                    {Array.from({ length: coursesPage.totalPages }, (_, index) => index + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          isActive={currentPageCourses === page}
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPageCourses(page);
                          }}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    {coursesPage.totalPages > 5 && <PaginationEllipsis />}
                    <PaginationNext
                      onClick={() =>
                        setCurrentPageCourses((prev) => Math.min(prev + 1, coursesPage.totalPages))
                      }
                      className={currentPageCourses === coursesPage.totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationContent>
                </Pagination>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* -------------------- TOP STUDENTS -------------------- */}
        <TabsContent value="students" className="space-y-3 xs:space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm xs:text-base sm:text-lg">
                Top Performing Students
              </CardTitle>
              <CardDescription className="text-[0.85rem] xs:text-xs sm:text-sm">
                Students with highest engagement and performance
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground mb-2 xs:mb-3">
                Showing {studentsPage.paginatedItems.length} of {studentsPage.totalCount} Students
              </div>

              <div className="space-y-3 xs:space-y-4">
                {studentsPage.paginatedItems.map((student, index) => (
                  <div
                    key={`${student.name}-${index}`}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 sm:p-4 border rounded-lg gap-3"
                  >
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="font-medium text-primary text-xs sm:text-sm">
                          #{index + 1 + (currentPageStudents - 1) * itemsPerPage}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-xs sm:text-sm">
                          {student.name}
                        </h4>
                        <p className="text-[0.65rem] sm:text-xs text-muted-foreground">
                          Last active: {student.lastActive}
                        </p>
                      </div>
                    </div>

                    <div className="w-full sm:w-auto">
                      <div className="grid grid-cols-2 sm:gap-4 gap-2 text-center text-xs sm:text-sm">
                        <div>
                          <div className="font-medium">{student.coursesCompleted}</div>
                          <div className="text-muted-foreground">Courses</div>
                        </div>
                        <div>
                          <div className="font-medium">{student.avgScore}%</div>
                          <div className="text-muted-foreground">Avg Score</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {studentsPage.totalCount === 0 ? (
                <div className="text-center py-8 xs:py-12">
                  <Users className="mx-auto h-8 w-8 xs:h-12 xs:w-12 text-muted-foreground mb-3 xs:mb-4" />
                  <h3 className="text-base xs:text-lg sm:text-xl font-medium mb-2">
                    No Students Found
                  </h3>
                  <p className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
                    No student data available to display
                  </p>
                </div>
              ) : (
                <Pagination className="mt-4">
                  <PaginationContent>
                    <PaginationPrevious
                      onClick={() => setCurrentPageStudents((prev) => Math.max(prev - 1, 1))}
                      className={currentPageStudents === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                    {Array.from({ length: studentsPage.totalPages }, (_, index) => index + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          isActive={currentPageStudents === page}
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPageStudents(page);
                          }}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    {studentsPage.totalPages > 5 && <PaginationEllipsis />}
                    <PaginationNext
                      onClick={() =>
                        setCurrentPageStudents((prev) => Math.min(prev + 1, studentsPage.totalPages))
                      }
                      className={currentPageStudents === studentsPage.totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationContent>
                </Pagination>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* -------------------- TESTS -------------------- */}
        <TabsContent value="tests" className="space-y-3 xs:space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm xs:text-base sm:text-lg">
                Test Performance Analytics
              </CardTitle>
              <CardDescription className="text-[0.85rem] xs:text-xs sm:text-sm">
                Detailed breakdown of test results and difficulty analysis
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground mb-2 xs:mb-3">
                Showing {testsPage.paginatedItems.length} of {testsPage.totalCount} Tests
              </div>

              <div className="space-y-3 xs:space-y-4">
                {testsPage.paginatedItems.map((test, index) => (
                  <div key={test.id || index} className="p-2 xs:p-3 sm:p-4 border rounded-lg">
                    <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between mb-2 xs:mb-3 sm:mb-4">
                      <div>
                        <h4 className="font-medium text-[0.85rem] xs:text-xs sm:text-sm">
                          {test.name}
                        </h4>
                        <div className="flex items-center flex-wrap gap-1 xs:gap-2 mt-0.5 xs:mt-1">
                          <Badge
                            variant={
                              test.difficulty === "Easy"
                                ? "default"
                                : test.difficulty === "Medium"
                                ? "secondary"
                                : "destructive"
                            }
                            className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs"
                          >
                            {test.difficulty}
                          </Badge>
                          <span className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs text-muted-foreground">
                            {test.attempts} attempts
                          </span>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 xs:mt-0 text-[0.85rem] xs:text-xs sm:text-sm shadow-md hover:bg-gray-200"
                        onClick={() => handleViewTestDetails(test)}
                      >
                        <BarChart3 className="mr-1 xs:mr-2 h-2.5 w-2.5 xs:h-3 xs:w-3" />
                        View Details
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 xs:gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-[0.85rem] xs:text-xs sm:text-sm">
                          <span>Average Score</span>
                          <span>{test.avgScore}%</span>
                        </div>
                        <Progress value={test.avgScore} className="h-1.5 xs:h-2" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-[0.85rem] xs:text-xs sm:text-sm">
                          <span>Pass Rate</span>
                          <span>{test.passRate}%</span>
                        </div>
                        <Progress value={test.passRate} className="h-1.5 xs:h-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {testsPage.totalCount === 0 ? (
                <div className="text-center py-8 xs:py-12">
                  <BarChart3 className="mx-auto h-8 w-8 xs:h-12 xs:w-12 text-muted-foreground mb-3 xs:mb-4" />
                  <h3 className="text-base xs:text-lg sm:text-xl font-medium mb-2">
                    No Tests Found
                  </h3>
                  <p className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
                    No test data available to display
                  </p>
                </div>
              ) : (
                <Pagination className="mt-4">
                  <PaginationContent>
                    <PaginationPrevious
                      onClick={() => setCurrentPageTests((prev) => Math.max(prev - 1, 1))}
                      className={currentPageTests === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                    {Array.from({ length: testsPage.totalPages }, (_, index) => index + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          isActive={currentPageTests === page}
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPageTests(page);
                          }}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    {testsPage.totalPages > 5 && <PaginationEllipsis />}
                    <PaginationNext
                      onClick={() =>
                        setCurrentPageTests((prev) => Math.min(prev + 1, testsPage.totalPages))
                      }
                      className={currentPageTests === testsPage.totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationContent>
                </Pagination>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* -------------------- COURSE DETAILS MODAL -------------------- */}
      <Dialog open={isCourseModalOpen} onOpenChange={setIsCourseModalOpen}>
        <DialogContent className="w-full max-w-[95vw] xs:max-w-[90vw] sm:max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm xs:text-base sm:text-lg">
              <BookOpen className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5" />
              {selectedCourse?.name} - Detailed Analytics
            </DialogTitle>
            <DialogDescription className="text-[0.85rem] xs:text-xs sm:text-sm">
              Comprehensive performance analysis and student insights
            </DialogDescription>
          </DialogHeader>

          {selectedCourse && (
            <div className="space-y-3 xs:space-y-4">
              <div className="grid gap-3 xs:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardContent className="p-3 xs:p-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-3 w-3 xs:h-4 xs:w-4 text-blue-500" />
                      <div>
                        <div className="text-lg xs:text-xl sm:text-2xl font-bold">
                          {selectedCourse.students}
                        </div>
                        <div className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs text-muted-foreground">
                          Total Students
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3 xs:p-4">
                    <div className="flex items-center gap-2">
                      <Star className="h-3 w-3 xs:h-4 xs:w-4 text-yellow-500" />
                      <div>
                        <div className="text-lg xs:text-xl sm:text-2xl font-bold">
                          {selectedCourse.avgScore}%
                        </div>
                        <div className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs text-muted-foreground">
                          Avg Score
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3 xs:p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 xs:h-4 xs:w-4 text-purple-500" />
                      <div>
                        <div className="text-lg xs:text-xl sm:text-2xl font-bold">
                          {selectedCourse.completionRate}%
                        </div>
                        <div className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs text-muted-foreground">
                          Completion Rate
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* PATCH: MODAL LISTS ARE DEFENSIVE */}
              <div className="grid gap-3 xs:gap-4 grid-cols-1 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm xs:text-base sm:text-lg text-green-600">
                      Top Performers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(selectedCourse.topPerformers ?? []).length === 0 ? (
                      <p className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
                        No top performer data available.
                      </p>
                    ) : (
                      <div className="space-y-2 xs:space-y-3">
                        {(selectedCourse.topPerformers ?? []).map((student, index) => (
                          <div
                            key={`${student.name}-${index}`}
                            className="flex items-center justify-between p-2 xs:p-3 bg-green-50 rounded"
                          >
                            <div className="flex items-center gap-2 xs:gap-3">
                              <div className="w-6 h-6 xs:w-8 xs:h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs font-medium text-green-700">
                                  #{index + 1}
                                </span>
                              </div>
                              <span className="font-medium text-[0.85rem] xs:text-xs sm:text-sm">
                                {student.name}
                              </span>
                            </div>
                            <div className="text-right text-[0.85rem] xs:text-xs sm:text-sm">
                              <div className="font-medium text-green-600">
                                {student.score}% score
                              </div>
                              <div className="text-muted-foreground">
                                {student.progress}% progress
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm xs:text-base sm:text-lg text-red-600">
                      Students Needing Help
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(selectedCourse.strugglingStudents ?? []).length === 0 ? (
                      <p className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
                        No struggling student data available.
                      </p>
                    ) : (
                      <div className="space-y-2 xs:space-y-3">
                        {(selectedCourse.strugglingStudents ?? []).map((student, index) => (
                          <div
                            key={`${student.name}-${index}`}
                            className="flex items-center justify-between p-2 xs:p-3 bg-red-50 rounded"
                          >
                            <div>
                              <div className="font-medium text-[0.85rem] xs:text-xs sm:text-sm">
                                {student.name}
                              </div>
                              <div className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs text-muted-foreground">
                                Last active: {student.lastActive}
                              </div>
                            </div>
                            <div className="text-right text-[0.85rem] xs:text-xs sm:text-sm">
                              <div className="font-medium text-red-600">
                                {student.score}% score
                              </div>
                              <div className="text-muted-foreground">
                                {student.progress}% progress
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* -------------------- TEST DETAILS MODAL -------------------- */}
      <Dialog open={isTestModalOpen} onOpenChange={setIsTestModalOpen}>
        <DialogContent className="w-full max-w-[95vw] xs:max-w-[90vw] sm:max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm xs:text-base sm:text-lg">
              <BarChart3 className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5" />
              {selectedTest?.name} - Test Analytics
            </DialogTitle>
            <DialogDescription className="text-[0.85rem] xs:text-xs sm:text-sm">
              Detailed analysis of test performance and student responses
            </DialogDescription>
          </DialogHeader>

          {selectedTest && (
            <div className="space-y-3 xs:space-y-4">
              <div className="grid gap-3 xs:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardContent className="p-3 xs:p-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-3 w-3 xs:h-4 xs:w-4 text-blue-500" />
                      <div>
                        <div className="text-lg xs:text-xl sm:text-2xl font-bold">
                          {selectedTest.attempts}
                        </div>
                        <div className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs text-muted-foreground">
                          Total Attempts
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3 xs:p-4">
                    <div className="flex items-center gap-2">
                      <Target className="h-3 w-3 xs:h-4 xs:w-4 text-green-500" />
                      <div>
                        <div className="text-lg xs:text-xl sm:text-2xl font-bold">
                          {selectedTest.avgScore}%
                        </div>
                        <div className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs text-muted-foreground">
                          Average Score
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3 xs:p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 xs:h-4 xs:w-4 text-purple-500" />
                      <div>
                        <div className="text-lg xs:text-xl sm:text-2xl font-bold">
                          {selectedTest.passRate}%
                        </div>
                        <div className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs text-muted-foreground">
                          Pass Rate
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3 xs:p-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 xs:h-4 xs:w-4 text-orange-500" />
                      <div>
                        <div className="text-lg xs:text-xl sm:text-2xl font-bold">
                          {selectedTest.questions}
                        </div>
                        <div className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs text-muted-foreground">
                          Questions
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm xs:text-base sm:text-lg">
                    Test Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 xs:gap-4 grid-cols-1 xs:grid-cols-3">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          selectedTest.difficulty === "Easy"
                            ? "default"
                            : selectedTest.difficulty === "Medium"
                            ? "secondary"
                            : "destructive"
                        }
                        className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs"
                      >
                        {selectedTest.difficulty}
                      </Badge>
                      <span className="text-[0.85rem] xs:text-xs sm:text-sm">
                        Difficulty Level
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 xs:h-4 xs:w-4" />
                      <span className="text-[0.85rem] xs:text-xs sm:text-sm">
                        {selectedTest.timeLimit}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-3 w-3 xs:h-4 xs:w-4" />
                      <span className="text-[0.85rem] xs:text-xs sm:text-sm">
                        {selectedTest.questions} Questions
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm xs:text-base sm:text-lg">
                    Score Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(selectedTest.scoreDistribution ?? []).length === 0 ? (
                    <p className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
                      No distribution data available.
                    </p>
                  ) : (
                    <div className="space-y-2 xs:space-y-3">
                      {(selectedTest.scoreDistribution ?? []).map((range, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-[0.85rem] xs:text-xs sm:text-sm font-medium">
                            {range.range}%
                          </span>
                          <div className="flex items-center gap-2 xs:gap-3 flex-1 ml-2 xs:ml-4">
                            <div className="flex-1 bg-muted rounded-full h-1.5 xs:h-2">
                              <div
                                className="bg-primary h-1.5 xs:h-2 rounded-full"
                                style={{
                                  width: `${selectedTest.attempts ? (range.count / selectedTest.attempts) * 100 : 0}%`,
                                }}
                              />
                            </div>
                            <span className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs text-muted-foreground w-10 xs:w-12 text-right">
                              {range.count}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

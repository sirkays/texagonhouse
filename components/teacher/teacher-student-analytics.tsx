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
import {Badge} from "@/components/ui/badge";
import {Progress} from "@/components/ui/progress";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
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

interface CourseDetail {
  id: string;
  name: string;
  students: number;
  avgProgress: number;
  avgScore: number;
  completionRate: number;
  rating: number;
  totalLessons: number;
  completedLessons: number;
  enrollmentTrend: number[];
  weeklyActivity: {day: string; active: number}[]; // removed hours
  topPerformers: {name: string; score: number; progress: number}[];
  strugglingStudents: {
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
  scoreDistribution: {range: string; count: number}[];
  commonMistakes: {question: string; incorrectRate: number}[];
  performanceByTime: {hour: string; avgScore: number; attempts: number}[];
}

export function TeacherStudentAnalytics() {
  const [selectedCourse, setSelectedCourse] = useState<CourseDetail | null>(
    null
  );
  const [selectedTest, setSelectedTest] = useState<TestDetail | null>(null);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [currentPageCourses, setCurrentPageCourses] = useState(1);
  const [currentPageStudents, setCurrentPageStudents] = useState(1);
  const [currentPageTests, setCurrentPageTests] = useState(1);
  const [currentPageContent, setCurrentPageContent] = useState(1);
  const itemsPerPage = 3;

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
      title: "Course Completions",
      value: "156",
      change: "+23",
      icon: Award,
      color: "text-orange-600",
    },
  ];

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
        {day: "Monday", active: 89},
        {day: "Tuesday", active: 76},
        {day: "Wednesday", active: 94},
        {day: "Thursday", active: 82},
        {day: "Friday", active: 67},
        {day: "Saturday", active: 34},
        {day: "Sunday", active: 45},
      ],
      topPerformers: [
        {name: "Alice Johnson", score: 94, progress: 95},
        {name: "Bob Smith", score: 91, progress: 88},
        {name: "Carol Davis", score: 89, progress: 92},
      ],
      strugglingStudents: [
        {
          name: "David Wilson",
          score: 45,
          progress: 23,
          lastActive: "3 days ago",
        },
        {name: "Emma Brown", score: 52, progress: 31, lastActive: "1 week ago"},
        {
          name: "Frank Miller",
          score: 48,
          progress: 28,
          lastActive: "2 days ago",
        },
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
        {day: "Monday", active: 67},
        {day: "Tuesday", active: 54},
        {day: "Wednesday", active: 72},
        {day: "Thursday", active: 61},
        {day: "Friday", active: 48},
        {day: "Saturday", active: 23},
        {day: "Sunday", active: 31},
      ],
      topPerformers: [
        {name: "Grace Lee", score: 96, progress: 89},
        {name: "Henry Chen", score: 93, progress: 85},
        {name: "Ivy Wang", score: 90, progress: 91},
      ],
      strugglingStudents: [
        {
          name: "Jack Taylor",
          score: 42,
          progress: 19,
          lastActive: "5 days ago",
        },
        {
          name: "Kate Anderson",
          score: 49,
          progress: 25,
          lastActive: "4 days ago",
        },
        {
          name: "Liam Garcia",
          score: 46,
          progress: 22,
          lastActive: "1 week ago",
        },
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
        {day: "Monday", active: 58},
        {day: "Tuesday", active: 49},
        {day: "Wednesday", active: 64},
        {day: "Thursday", active: 55},
        {day: "Friday", active: 42},
        {day: "Saturday", active: 19},
        {day: "Sunday", active: 27},
      ],
      topPerformers: [
        {name: "Maya Patel", score: 97, progress: 94},
        {name: "Noah Kim", score: 94, progress: 90},
        {name: "Olivia Rodriguez", score: 92, progress: 87},
      ],
      strugglingStudents: [
        {
          name: "Paul Martinez",
          score: 51,
          progress: 34,
          lastActive: "2 days ago",
        },
        {
          name: "Quinn Thompson",
          score: 47,
          progress: 29,
          lastActive: "6 days ago",
        },
        {name: "Ruby Clark", score: 53, progress: 37, lastActive: "3 days ago"},
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
        {day: "Monday", active: 39},
        {day: "Tuesday", active: 33},
        {day: "Wednesday", active: 42},
        {day: "Thursday", active: 37},
        {day: "Friday", active: 28},
        {day: "Saturday", active: 14},
        {day: "Sunday", active: 18},
      ],
      topPerformers: [
        {name: "Sam Wilson", score: 95, progress: 86},
        {name: "Tara Singh", score: 92, progress: 83},
        {name: "Uma Sharma", score: 90, progress: 89},
      ],
      strugglingStudents: [
        {
          name: "Victor Lopez",
          score: 44,
          progress: 26,
          lastActive: "4 days ago",
        },
        {
          name: "Wendy Chang",
          score: 48,
          progress: 31,
          lastActive: "1 week ago",
        },
        {
          name: "Xavier Jones",
          score: 46,
          progress: 28,
          lastActive: "5 days ago",
        },
      ],
    },
  ];

  const topStudents = [
    {
      name: "Alice Johnson",
      coursesCompleted: 8,
      avgScore: 94,
      lastActive: "2 hours ago",
    },
    {
      name: "Bob Smith",
      coursesCompleted: 6,
      avgScore: 91,
      lastActive: "1 day ago",
    },
    {
      name: "Carol Davis",
      coursesCompleted: 7,
      avgScore: 89,
      lastActive: "3 hours ago",
    },
    {
      name: "David Wilson",
      coursesCompleted: 5,
      avgScore: 87,
      lastActive: "5 hours ago",
    },
  ];

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
        {range: "90-100", count: 45},
        {range: "80-89", count: 67},
        {range: "70-79", count: 78},
        {range: "60-69", count: 32},
        {range: "Below 60", count: 12},
      ],
      commonMistakes: [
        {question: "useState Hook Implementation", incorrectRate: 34},
        {question: "Component Lifecycle Methods", incorrectRate: 28},
        {question: "Props vs State Concepts", incorrectRate: 22},
      ],
      performanceByTime: [
        {hour: "9 AM", avgScore: 82, attempts: 23},
        {hour: "12 PM", avgScore: 79, attempts: 45},
        {hour: "3 PM", avgScore: 76, attempts: 67},
        {hour: "6 PM", avgScore: 81, attempts: 89},
        {hour: "9 PM", avgScore: 74, attempts: 34},
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
        {range: "90-100", count: 28},
        {range: "80-89", count: 45},
        {range: "70-79", count: 56},
        {range: "60-69", count: 38},
        {range: "Below 60", count: 22},
      ],
      commonMistakes: [
        {question: "Closures and Scope", incorrectRate: 42},
        {question: "Async/Await Patterns", incorrectRate: 38},
        {question: "Prototype Inheritance", incorrectRate: 35},
      ],
      performanceByTime: [
        {hour: "9 AM", avgScore: 75, attempts: 18},
        {hour: "12 PM", avgScore: 71, attempts: 34},
        {hour: "3 PM", avgScore: 69, attempts: 52},
        {hour: "6 PM", avgScore: 74, attempts: 67},
        {hour: "9 PM", avgScore: 68, attempts: 28},
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
        {range: "90-100", count: 156},
        {range: "80-89", count: 98},
        {range: "70-79", count: 67},
        {range: "60-69", count: 18},
        {range: "Below 60", count: 6},
      ],
      commonMistakes: [
        {question: "List Comprehensions", incorrectRate: 18},
        {question: "Dictionary Methods", incorrectRate: 15},
        {question: "String Formatting", incorrectRate: 12},
      ],
      performanceByTime: [
        {hour: "9 AM", avgScore: 86, attempts: 34},
        {hour: "12 PM", avgScore: 83, attempts: 67},
        {hour: "3 PM", avgScore: 82, attempts: 89},
        {hour: "6 PM", avgScore: 85, attempts: 123},
        {hour: "9 PM", avgScore: 81, attempts: 45},
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
        {range: "90-100", count: 42},
        {range: "80-89", count: 58},
        {range: "70-79", count: 38},
        {range: "60-69", count: 14},
        {range: "Below 60", count: 4},
      ],
      commonMistakes: [
        {question: "Grid Template Areas", incorrectRate: 31},
        {question: "Flexbox Alignment", incorrectRate: 26},
        {question: "Responsive Grid Layouts", incorrectRate: 23},
      ],
      performanceByTime: [
        {hour: "9 AM", avgScore: 83, attempts: 15},
        {hour: "12 PM", avgScore: 80, attempts: 28},
        {hour: "3 PM", avgScore: 79, attempts: 42},
        {hour: "6 PM", avgScore: 82, attempts: 56},
        {hour: "9 PM", avgScore: 78, attempts: 23},
      ],
    },
  ];

  const popularContent = [
    {title: "React Hooks Tutorial", views: 1234, type: "Video"},
    {title: "Python Cheat Sheet", downloads: 890, type: "PDF"},
    {title: "JavaScript Fundamentals", views: 756, type: "Course"},
    {title: "CSS Grid Guide", views: 645, type: "Tutorial"},
    {title: "Database Design Principles", views: 523, type: "Video"},
  ];

  // Pagination logic
  const getPaginatedItems = <T,>(items: T[], currentPage: number) => {
    const totalPages = Math.ceil(items.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return {
      paginatedItems: items.slice(indexOfFirstItem, indexOfLastItem),
      totalPages,
      totalCount: items.length,
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
        {overallStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 xs:pb-2">
              <CardTitle className="text-[0.85rem] xs:text-xs sm:text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-3 w-3 xs:h-4 xs:w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-lg xs:text-xl sm:text-2xl font-bold">
                {stat.value}
              </div>
              <p className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs text-muted-foreground">
                <span className="text-green-600">{stat.change}</span> from last
                month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs
        defaultValue="courses"
        className="w-full"
        onValueChange={() => {
          setCurrentPageCourses(1);
          setCurrentPageStudents(1);
          setCurrentPageTests(1);
          setCurrentPageContent(1);
        }}>
        <TabsList className="bg-[rgba(247,151,113,0.18)] text-slate-700 flex flex-col lg:flex-row w-full gap-2 mb-14">
          <TabsTrigger
            value="courses"
            className="bg-transparent w-full sm:w-auto justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3">
            Course Performance
          </TabsTrigger>
          <TabsTrigger
            value="students"
            className="bg-transparent w-full sm:w-auto justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3">
            Top Students
          </TabsTrigger>
          <TabsTrigger
            value="tests"
            className="bg-transparent w-full sm:w-auto justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3">
            Test Analytics
          </TabsTrigger>
          <TabsTrigger
            value="engagement"
            className="bg-transparent w-full sm:w-auto justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3">
            Engagement
          </TabsTrigger>
        </TabsList>

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
                Showing{" "}
                {
                  getPaginatedItems(coursePerformance, currentPageCourses)
                    .paginatedItems.length
                }{" "}
                of{" "}
                {
                  getPaginatedItems(coursePerformance, currentPageCourses)
                    .totalCount
                }{" "}
                Courses
              </div>
              <div className="space-y-3 xs:space-y-4">
                {getPaginatedItems(
                  coursePerformance,
                  currentPageCourses
                ).paginatedItems.map((course, index) => (
                  <div
                    key={index}
                    className="p-2 xs:p-3 sm:p-4 border rounded-lg">
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
                          <div className="flex items-center gap-1">
                            <Star className="h-2.5 w-2.5 xs:h-3 xs:w-3 fill-yellow-400 text-yellow-400" />
                            {course.rating}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 xs:mt-0 text-[0.85rem] xs:text-xs sm:text-sm shadow-md hover:bg-gray-200"
                        onClick={() => handleViewCourseDetails(course)}>
                        <Eye className="mr-1 xs:mr-2 h-2.5 w-2.5 xs:h-3 xs:w-3" />
                        View Details
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 xs:grid-cols-3 gap-3 xs:gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-[0.85rem] xs:text-xs sm:text-sm">
                          <span>Avg Progress</span>
                          <span>{course.avgProgress}%</span>
                        </div>
                        <Progress
                          value={course.avgProgress}
                          className="h-1.5 xs:h-2"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-[0.85rem] xs:text-xs sm:text-sm">
                          <span>Avg Score</span>
                          <span>{course.avgScore}%</span>
                        </div>
                        <Progress
                          value={course.avgScore}
                          className="h-1.5 xs:h-2"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-[0.85rem] xs:text-xs sm:text-sm">
                          <span>Completion Rate</span>
                          <span>{course.completionRate}%</span>
                        </div>
                        <Progress
                          value={course.completionRate}
                          className="h-1.5 xs:h-2"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {getPaginatedItems(coursePerformance, currentPageCourses)
                .totalCount === 0 ? (
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
                      onClick={() =>
                        setCurrentPageCourses((prev) => Math.max(prev - 1, 1))
                      }
                      className={
                        currentPageCourses === 1
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                    {Array.from(
                      {
                        length: getPaginatedItems(
                          coursePerformance,
                          currentPageCourses
                        ).totalPages,
                      },
                      (_, index) => index + 1
                    ).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          isActive={currentPageCourses === page}
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPageCourses(page);
                          }}>
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    {getPaginatedItems(coursePerformance, currentPageCourses)
                      .totalPages > 5 && <PaginationEllipsis />}
                    <PaginationNext
                      onClick={() =>
                        setCurrentPageCourses((prev) =>
                          Math.min(
                            prev + 1,
                            getPaginatedItems(
                              coursePerformance,
                              currentPageCourses
                            ).totalPages
                          )
                        )
                      }
                      className={
                        currentPageCourses ===
                        getPaginatedItems(coursePerformance, currentPageCourses)
                          .totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationContent>
                </Pagination>
              )}
            </CardContent>
          </Card>
        </TabsContent>

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
                Showing{" "}
                {
                  getPaginatedItems(topStudents, currentPageStudents)
                    .paginatedItems.length
                }{" "}
                of{" "}
                {getPaginatedItems(topStudents, currentPageStudents).totalCount}{" "}
                Students
              </div>
              <div className="space-y-3 xs:space-y-4">
                {getPaginatedItems(
                  topStudents,
                  currentPageStudents
                ).paginatedItems.map((student, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 sm:p-4 border rounded-lg gap-3">
                    {/* Left: Avatar + Info */}
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="font-medium text-primary text-xs sm:text-sm">
                          #
                          {index + 1 + (currentPageStudents - 1) * itemsPerPage}
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

                    {/* Right: Stats */}
                    <div className="w-full sm:w-auto">
                      <div className="grid grid-cols-2 sm:gap-4 gap-2 text-center text-xs sm:text-sm">
                        <div>
                          <div className="font-medium">
                            {student.coursesCompleted}
                          </div>
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
              {getPaginatedItems(topStudents, currentPageStudents)
                .totalCount === 0 ? (
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
                      onClick={() =>
                        setCurrentPageStudents((prev) => Math.max(prev - 1, 1))
                      }
                      className={
                        currentPageStudents === 1
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                    {Array.from(
                      {
                        length: getPaginatedItems(
                          topStudents,
                          currentPageStudents
                        ).totalPages,
                      },
                      (_, index) => index + 1
                    ).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          isActive={currentPageStudents === page}
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPageStudents(page);
                          }}>
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    {getPaginatedItems(topStudents, currentPageStudents)
                      .totalPages > 5 && <PaginationEllipsis />}
                    <PaginationNext
                      onClick={() =>
                        setCurrentPageStudents((prev) =>
                          Math.min(
                            prev + 1,
                            getPaginatedItems(topStudents, currentPageStudents)
                              .totalPages
                          )
                        )
                      }
                      className={
                        currentPageStudents ===
                        getPaginatedItems(topStudents, currentPageStudents)
                          .totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationContent>
                </Pagination>
              )}
            </CardContent>
          </Card>
        </TabsContent>

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
                Showing{" "}
                {
                  getPaginatedItems(testAnalytics, currentPageTests)
                    .paginatedItems.length
                }{" "}
                of{" "}
                {getPaginatedItems(testAnalytics, currentPageTests).totalCount}{" "}
                Tests
              </div>
              <div className="space-y-3 xs:space-y-4">
                {getPaginatedItems(
                  testAnalytics,
                  currentPageTests
                ).paginatedItems.map((test, index) => (
                  <div
                    key={index}
                    className="p-2 xs:p-3 sm:p-4 border rounded-lg">
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
                            className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs">
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
                        onClick={() => handleViewTestDetails(test)}>
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
                        <Progress
                          value={test.avgScore}
                          className="h-1.5 xs:h-2"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-[0.85rem] xs:text-xs sm:text-sm">
                          <span>Pass Rate</span>
                          <span>{test.passRate}%</span>
                        </div>
                        <Progress
                          value={test.passRate}
                          className="h-1.5 xs:h-2"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {getPaginatedItems(testAnalytics, currentPageTests).totalCount ===
              0 ? (
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
                      onClick={() =>
                        setCurrentPageTests((prev) => Math.max(prev - 1, 1))
                      }
                      className={
                        currentPageTests === 1
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                    {Array.from(
                      {
                        length: getPaginatedItems(
                          testAnalytics,
                          currentPageTests
                        ).totalPages,
                      },
                      (_, index) => index + 1
                    ).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          isActive={currentPageTests === page}
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPageTests(page);
                          }}>
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    {getPaginatedItems(testAnalytics, currentPageTests)
                      .totalPages > 5 && <PaginationEllipsis />}
                    <PaginationNext
                      onClick={() =>
                        setCurrentPageTests((prev) =>
                          Math.min(
                            prev + 1,
                            getPaginatedItems(testAnalytics, currentPageTests)
                              .totalPages
                          )
                        )
                      }
                      className={
                        currentPageTests ===
                        getPaginatedItems(testAnalytics, currentPageTests)
                          .totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationContent>
                </Pagination>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-3 xs:space-y-4">
          <div className="grid gap-3 xs:gap-4 grid-cols-1 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm xs:text-base sm:text-lg">
                  Weekly Activity
                </CardTitle>
                <CardDescription className="text-[0.85rem] xs:text-xs sm:text-sm">
                  Student engagement over the past week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 xs:space-y-3">
                  {[
                    {day: "Monday", active: 234},
                    {day: "Tuesday", active: 189},
                    {day: "Wednesday", active: 267},
                    {day: "Thursday", active: 198},
                    {day: "Friday", active: 156},
                    {day: "Saturday", active: 89},
                    {day: "Sunday", active: 123},
                  ].map((day, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between">
                      <div className="flex items-center gap-2 xs:gap-3">
                        <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 bg-primary rounded-full" />
                        <span className="text-[0.85rem] xs:text-xs sm:text-sm font-medium">
                          {day.day}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 xs:gap-3 sm:gap-4 text-[0.6rem] xs:text-[0.65rem] sm:text-xs text-muted-foreground">
                        <span>{day.active} active students</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm xs:text-base sm:text-lg">
                  Popular Content
                </CardTitle>
                <CardDescription className="text-[0.85rem] xs:text-xs sm:text-sm">
                  Most accessed materials this month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground mb-2 xs:mb-3">
                  Showing{" "}
                  {
                    getPaginatedItems(popularContent, currentPageContent)
                      .paginatedItems.length
                  }{" "}
                  of{" "}
                  {
                    getPaginatedItems(popularContent, currentPageContent)
                      .totalCount
                  }{" "}
                  Content Items
                </div>
                <div className="space-y-2 xs:space-y-3">
                  {getPaginatedItems(
                    popularContent,
                    currentPageContent
                  ).paginatedItems.map((content, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 xs:p-3 border rounded-lg">
                      <div>
                        <h5 className="font-medium text-[0.85rem] xs:text-xs sm:text-sm">
                          {content.title}
                        </h5>
                        <div className="flex items-center gap-1 xs:gap-2 mt-0.5 xs:mt-1">
                          <Badge
                            variant="outline"
                            className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs">
                            {content.type}
                          </Badge>
                          <span className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs text-muted-foreground">
                            {content.views
                              ? `${content.views} views`
                              : `${content.downloads} downloads`}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[0.85rem] xs:text-xs sm:text-sm font-medium">
                          #{index + 1 + (currentPageContent - 1) * itemsPerPage}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {getPaginatedItems(popularContent, currentPageContent)
                  .totalCount === 0 ? (
                  <div className="text-center py-8 xs:py-12">
                    <BookOpen className="mx-auto h-8 w-8 xs:h-12 xs:w-12 text-muted-foreground mb-3 xs:mb-4" />
                    <h3 className="text-base xs:text-lg sm:text-xl font-medium mb-2">
                      No Content Found
                    </h3>
                    <p className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
                      No content data available to display
                    </p>
                  </div>
                ) : (
                  <Pagination className="mt-4">
                    <PaginationContent>
                      <PaginationPrevious
                        onClick={() =>
                          setCurrentPageContent((prev) => Math.max(prev - 1, 1))
                        }
                        className={
                          currentPageContent === 1
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                      {Array.from(
                        {
                          length: getPaginatedItems(
                            popularContent,
                            currentPageContent
                          ).totalPages,
                        },
                        (_, index) => index + 1
                      ).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            isActive={currentPageContent === page}
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPageContent(page);
                            }}>
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      {getPaginatedItems(popularContent, currentPageContent)
                        .totalPages > 5 && <PaginationEllipsis />}
                      <PaginationNext
                        onClick={() =>
                          setCurrentPageContent((prev) =>
                            Math.min(
                              prev + 1,
                              getPaginatedItems(
                                popularContent,
                                currentPageContent
                              ).totalPages
                            )
                          )
                        }
                        className={
                          currentPageContent ===
                          getPaginatedItems(popularContent, currentPageContent)
                            .totalPages
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationContent>
                  </Pagination>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm xs:text-base sm:text-lg">
                Learning Patterns
              </CardTitle>
              <CardDescription className="text-[0.85rem] xs:text-xs sm:text-sm">
                Insights into how students learn best
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 xs:gap-4 grid-cols-1">
                <div className="text-center">
                  <div className="text-lg xs:text-xl sm:text-2xl font-bold text-blue-600">
                    68%
                  </div>
                  <p className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
                    Prefer video content
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Course Details Modal */}
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
              {/* Course Overview */}
              <div className="grid gap-3 xs:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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
                      <Target className="h-3 w-3 xs:h-4 xs:w-4 text-green-500" />
                      <div>
                        <div className="text-lg xs:text-xl sm:text-2xl font-bold">
                          {selectedCourse.avgProgress}%
                        </div>
                        <div className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs text-muted-foreground">
                          Avg Progress
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

              {/* Weekly Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm xs:text-base sm:text-lg">
                    Weekly Activity Pattern
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 xs:space-y-3">
                    {selectedCourse.weeklyActivity.map((day, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 xs:p-3 border rounded">
                        <div className="flex items-center gap-2 xs:gap-3">
                          <Calendar className="h-3 w-3 xs:h-4 xs:w-4 text-muted-foreground" />
                          <span className="font-medium text-[0.85rem] xs:text-xs sm:text-sm">
                            {day.day}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 xs:gap-4 sm:gap-6 text-[0.6rem] xs:text-[0.65rem] sm:text-xs">
                          <div className="flex items-center gap-1 xs:gap-2">
                            <Users className="h-2.5 w-2.5 xs:h-3 xs:w-3" />
                            <span>{day.active} active</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Performers and Struggling Students */}
              <div className="grid gap-3 xs:gap-4 grid-cols-1 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm xs:text-base sm:text-lg text-green-600">
                      Top Performers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 xs:space-y-3">
                      {selectedCourse.topPerformers.map((student, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 xs:p-3 bg-green-50 rounded">
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
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm xs:text-base sm:text-lg text-red-600">
                      Students Needing Help
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 xs:space-y-3">
                      {selectedCourse.strugglingStudents.map(
                        (student, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 xs:p-3 bg-red-50 rounded">
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
                        )
                      )}
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
              {/* Test Overview */}
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

              {/* Test Details */}
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
                        className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs">
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

              {/* Score Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm xs:text-base sm:text-lg">
                    Score Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 xs:space-y-3">
                    {selectedTest.scoreDistribution.map((range, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between">
                        <span className="text-[0.85rem] xs:text-xs sm:text-sm font-medium">
                          {range.range}%
                        </span>
                        <div className="flex items-center gap-2 xs:gap-3 flex-1 ml-2 xs:ml-4">
                          <div className="flex-1 bg-muted rounded-full h-1.5 xs:h-2">
                            <div
                              className="bg-primary h-1.5 xs:h-2 rounded-full"
                              style={{
                                width: `${
                                  (range.count / selectedTest.attempts) * 100
                                }%`,
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
                </CardContent>
              </Card>

              {/* Common Mistakes and Performance by Time */}
              <div className="grid gap-3 xs:gap-4 grid-cols-1 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm xs:text-base sm:text-lg text-red-600">
                      Common Mistakes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 xs:space-y-3">
                      {selectedTest.commonMistakes.map((mistake, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-[0.85rem] xs:text-xs sm:text-sm">
                            <span className="font-medium">
                              {mistake.question}
                            </span>
                            <span className="text-red-600">
                              {mistake.incorrectRate}%
                            </span>
                          </div>
                          <Progress
                            value={mistake.incorrectRate}
                            className="h-1.5 xs:h-2"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm xs:text-base sm:text-lg">
                      Performance by Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 xs:space-y-3">
                      {selectedTest.performanceByTime.map((time, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-1 xs:p-2 border rounded">
                          <div className="flex items-center gap-1 xs:gap-2">
                            <Clock className="h-2.5 w-2.5 xs:h-3 xs:w-3" />
                            <span className="text-[0.85rem] xs:text-xs sm:text-sm font-medium">
                              {time.hour}
                            </span>
                          </div>
                          <div className="text-right text-[0.85rem] xs:text-xs sm:text-sm">
                            <div className="font-medium">
                              {time.avgScore}% avg
                            </div>
                            <div className="text-muted-foreground">
                              {time.attempts} attempts
                            </div>
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
  );
}

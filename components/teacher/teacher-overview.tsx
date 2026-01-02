"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Progress} from "@/components/ui/progress";
import {
  Users,
  BookOpen,
  TestTube,
  Upload,
  Star,
  Eye,
  Download,
  Play,
  Clock,
} from "lucide-react";
import Link from "next/link";
import {useEffect, useState, useMemo} from "react";
import {useSession} from "next-auth/react";
import {Spinner} from "@/components/ui/spinner";

// ... (keep all the interfaces the same: Stat, RecentActivity, TopCourse, RecentMaterial, TeacherOverviewData)

export function TeacherOverview() {
  const {data: session, status} = useSession();
  const [data, setData] = useState<TeacherOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sessionToken = useMemo(
    () => session?.user?.sessionToken || null,
    [session?.user?.sessionToken]
  );

  useEffect(() => {
    const fetchData = async () => {
      if (status !== "authenticated" || !sessionToken) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/teacher/overview", {
          headers: {
            Authorization: `Api-Key nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c`,
            "Content-Type": "application/json",
            "X-Session-Token": sessionToken,
          },
        });

        if (!res.ok) {
          console.error(
            "[TeacherOverview] Fetch failed with status:",
            res.status
          );
          const errorData = await res.json().catch(() => ({}));
          const errorMessage =
            errorData.error || errorData.detail || "Failed to fetch data";

          if (res.status === 401 || res.status === 403) {
            setError("Session expired");
            setData(null);
            setLoading(false);
            return;
          }
          setError(errorMessage);
          setData(null);
          throw new Error(errorMessage);
        }

        const json = await res.json();
        setData(json);
        setError(null);
      } catch (e) {
        console.error("[TeacherOverview] Fetch error:", e);
        setError("Session expired");
        setData(null);
      }
      setLoading(false);
    };

    fetchData();
  }, [sessionToken, status]);

  const getIconByType = (type: string) => {
    switch (type) {
      case "test":
        return TestTube;
      case "upload":
        return Upload;
      case "course":
        return BookOpen;
      default:
        return Clock;
    }
  };

  const getStatIcon = (title: string) => {
    if (title.includes("Students")) return Users;
    if (title.includes("Courses")) return BookOpen;
    if (title.includes("Tests")) return TestTube;
    return Upload;
  };

  const getStatColor = (title: string) => {
    if (title.includes("Students")) return "text-blue-600";
    if (title.includes("Courses")) return "text-green-600";
    if (title.includes("Tests")) return "text-purple-600";
    return "text-orange-600";
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-transparent">
        <Spinner size="md" className="text-orange-500" />
      </div>
    );
  }

  if (
    error === "Session expired" ||
    error === "Not authenticated" ||
    (status === "authenticated" && error === "Session expired")
  ) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Session Expired
            </CardTitle>
            <CardDescription className="text-center">
              Your session has expired or you are not authenticated. Please log
              in again to continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button
              onClick={() => (window.location.href = "/login")}
              className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Log In Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Error
            </CardTitle>
            <CardDescription className="text-center">{error}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your courses.
        </p>
        {error && <p className="text-yellow-600 text-sm">{error}</p>}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {data.stats.map((stat, index) => {
          const Icon = getStatIcon(stat.title);
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${getStatColor(stat.title)}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">{stat.change}</span> from
                  last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to get you started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 flex flex-col gap-3">
            <Link
              href={"/teacher/create-cbt"}
              className="w-full justify-start text-slate-800 hover:text-slate-600 hover:bg-[#F797713a] border bg-white rounded-lg border-[#f797713d] hover:border-none">
              <Button className="w-full justify-start bg-transparent hover:bg-[#F797713a] text-slate-800">
                <TestTube className="mr-2 h-4 w-4" />
                Create CBT Test
              </Button>
            </Link>
            <Link
              href={"/teacher/learning-module"}
              className="w-full justify-start text-slate-800 hover:text-slate-600 hover:bg-[#F797713a] rounded-lg border bg-white border-[#f797713d] hover:border-none">
              <Button className="w-full bg-transparent hover:bg-[#F797713a] justify-start text-slate-800">
                <BookOpen className="mr-2 h-4 w-4" />
                Create Learning Module
              </Button>
            </Link>
            <Link
              href={"/teacher/learning-module"}
              className="w-full justify-start text-slate-800 hover:text-slate-600 hover:bg-[#F797713a] rounded-lg border bg-white border-[#f797713d] hover:border-none">
              <Button className="w-full justify-start bg-transparent hover:bg-[#F797713a] text-slate-800">
                <Users className="mr-2 h-4 w-4" />
                View Student Analysis
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from your courses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.recent_activity.slice(0, 3).map((activity, index) => {
              const Icon = getIconByType(activity.type);
              return (
                <div key={index} className="flex items-start space-x-3">
                  <div className="p-2 bg-muted rounded-full">
                    <Icon className="h-3 w-3" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.action}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Performance Overview */}
        <Card>
          <CardHeader>
            <CardTitle>This Month</CardTitle>
            <CardDescription>Your teaching performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Course Completion Rate</span>
                <span>{data.performance.course_completion_rate}%</span>
              </div>
              <Progress
                value={data.performance.course_completion_rate}
                className="h-2"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Student Satisfaction</span>
                <span>{data.performance.student_satisfaction}/5</span>
              </div>
              <Progress
                value={(data.performance.student_satisfaction / 5) * 100}
                className="h-2"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Test Pass Rate</span>
                <span>{data.performance.test_pass_rate}%</span>
              </div>
              <Progress
                value={data.performance.test_pass_rate}
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Courses */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Courses</CardTitle>
          <CardDescription>
            Your most successful courses this month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.top_courses.slice(0, 3).map((course, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border rounded-lg">
                <div className="space-y-1 flex-1">
                  <h4 className="font-medium text-base">{course.title}</h4>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{course.students} students</span>
                    </div>
                    {/* <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{course.rating}</span>
                    </div> */}
                    {course.revenue && (
                      <div className="font-medium text-green-600">
                        {course.revenue}
                      </div>
                    )}
                  </div>
                </div>
                <div className="sm:text-right space-y-2">
                  <div className="text-sm font-medium">
                    {course.progress}% Complete
                  </div>
                  <Progress
                    value={course.progress}
                    className="w-full sm:w-24 h-2"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Materials */}
      <Card>
        <CardHeader>
          <CardTitle>Recently Uploaded Materials</CardTitle>
          <CardDescription>Your latest content uploads</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.recent_materials.slice(0, 3).map((material, index) => {
              const Icon =
                material.type.includes("Video") ||
                material.type.includes("Audio")
                  ? Play
                  : Download;
              return (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-muted rounded">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-sm">{material.title}</h5>
                      <p className="text-xs text-muted-foreground">
                        {material.type} • {material.size}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Eye className="h-3 w-3" />
                    {material.views || material.downloads || 0}{" "}
                    {material.views ? "views" : "downloads"}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

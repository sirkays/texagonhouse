"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  BookOpen,
  TestTube,
  Upload,
  Star,
  Eye,
  Download,
  Play,
} from "lucide-react";
import Link from "next/link";

export function TeacherOverview() {
  const stats = [
    {
      title: "Total Students",
      value: "1,247",
      change: "+12%",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Active Courses",
      value: "24",
      change: "+3",
      icon: BookOpen,
      color: "text-green-600",
    },
    {
      title: "CBT Tests Created",
      value: "156",
      change: "+8",
      icon: TestTube,
      color: "text-purple-600",
    },
    {
      title: "Materials Uploaded",
      value: "342",
      change: "+15",
      icon: Upload,
      color: "text-orange-600",
    },
  ];

  const recentActivity = [
    {
      type: "test",
      title: "JavaScript Fundamentals Test",
      action: "completed by 45 students",
      time: "2 hours ago",
      icon: TestTube,
    },
    {
      type: "upload",
      title: "React Hooks Tutorial Video",
      action: "uploaded successfully",
      time: "4 hours ago",
      icon: Upload,
    },
    {
      type: "course",
      title: "Advanced Python Course",
      action: "new enrollment: 12 students",
      time: "6 hours ago",
      icon: BookOpen,
    },
  ];

  const topCourses = [
    {
      title: "React Complete Guide",
      students: 456,
      rating: 4.8,
      revenue: "$2,340",
      progress: 85,
    },
    {
      title: "Python for Data Science",
      students: 324,
      rating: 4.9,
      revenue: "$1,890",
      progress: 92,
    },
    {
      title: "JavaScript Mastery",
      students: 278,
      rating: 4.7,
      revenue: "$1,560",
      progress: 78,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your courses.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{stat.change}</span> from last
                month
              </p>
            </CardContent>
          </Card>
        ))}
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
              className="w-full justify-start text-slate-800 hover:text-slate-600 hover:bg-[#F797713a] border bg-white rounded-lg border-[#f797713d] hover:border-none"
            >
              <Button
                
                className="w-full justify-start bg-transparent hover:bg-[#F797713a]  text-slate-800"
              >
                <TestTube className="mr-2 h-4 w-4" />
                Create CBT Test
              </Button>
            </Link>
            {/* <Button
              variant="outline"
              className="w-full justify-start text-slate-800 hover:text-slate-600 hover:bg-[#F797713a] border border-[#f797713d] hover:border-none">
              <Upload className="mr-2 h-4 w-4" />
              Upload Learning Material
            </Button> */}
            <Link
              href={"/teacher/learning-module"}
              className="w-full justify-start text-slate-800 hover:text-slate-600 hover:bg-[#F797713a] rounded-lg border bg-white border-[#f797713d] hover:border-none"
            >
              <Button
                
                className="w-full bg-transparent hover:bg-[#F797713a] justify-start text-slate-800"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Create Learning Module
              </Button>
            </Link>
            <Link
              href={"/teacher/learning-module"}
              className="w-full justify-start text-slate-800 hover:text-slate-600 hover:bg-[#F797713a] rounded-lg border bg-white border-[#f797713d] hover:border-none"
            >
              <Button
                
                className="w-full justify-start bg-transparent hover:bg-[#F797713a] text-slate-800"
              >
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
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="p-2 bg-muted rounded-full">
                  <activity.icon className="h-3 w-3" />
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
            ))}
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
                <span>78%</span>
              </div>
              <Progress value={78} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Student Satisfaction</span>
                <span>4.8/5</span>
              </div>
              <Progress value={96} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Test Pass Rate</span>
                <span>85%</span>
              </div>
              <Progress value={85} className="h-2" />
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
            {topCourses.map((course, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border rounded-lg"
              >
                {/* Course Details */}
                <div className="space-y-1 flex-1">
                  <h4 className="font-medium text-base">{course.title}</h4>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{course.students} students</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{course.rating}</span>
                    </div>
                    <div className="font-medium text-green-600">
                      {course.revenue}
                    </div>
                  </div>
                </div>

                {/* Progress Section */}
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
            {[
              {
                title: "React Hooks Deep Dive",
                type: "Video",
                size: "245 MB",
                views: 1234,
                icon: Play,
              },
              {
                title: "Python Cheat Sheet",
                type: "PDF",
                size: "2.1 MB",
                downloads: 456,
                icon: Download,
              },
              {
                title: "JavaScript Podcast Series",
                type: "Audio",
                size: "89 MB",
                views: 789,
                icon: Play,
              },
            ].map((material, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-muted rounded">
                    <material.icon className="h-4 w-4" />
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
                  {material.views || material.downloads}{" "}
                  {material.views ? "views" : "downloads"}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

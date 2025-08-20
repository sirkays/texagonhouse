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
import {Badge} from "@/components/ui/badge";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {
  Users,
  BookOpen,
  Trophy,
  Calendar,
  Clock,
  TrendingUp,
  AlertCircle,
  Baby,
  CreditCard,
  Target,
} from "lucide-react";

export function ParentOverview() {
  const children = [
    {
      id: 1,
      name: "John Adebayo",
      grade: "SS3",
      school: "Lagos State Model College",
      avatar: "/placeholder.svg?height=40&width=40",
      coursesEnrolled: 8,
      coursesCompleted: 6,
      averageScore: 85,
      weeklyHours: 12,
      lastActive: "2 hours ago",
      upcomingTest: "Mathematics Quiz - Tomorrow 2:00 PM",
      currentStreak: 15,
      totalRewards: 3,
    },
    {
      id: 2,
      name: "Mary Adebayo",
      grade: "SS1",
      school: "Lagos State Model College",
      avatar: "/placeholder.svg?height=40&width=40",
      coursesEnrolled: 6,
      coursesCompleted: 4,
      averageScore: 92,
      weeklyHours: 10,
      lastActive: "1 hour ago",
      upcomingTest: "English Literature Test - Friday 10:00 AM",
      currentStreak: 22,
      totalRewards: 5,
    },
  ];

  const familyStats = [
    {
      title: "Total Children",
      value: children.length.toString(),
      change: "All active",
      icon: Baby,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Combined Study Hours",
      value: children
        .reduce((sum, child) => sum + child.weeklyHours, 0)
        .toString(),
      change: "This week",
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    // {
    //   title: "Average Performance",
    //   value: Math.round(children.reduce((sum, child) => sum + child.averageScore, 0) / children.length) + "%",
    //   change: "+5% this month",
    //   icon: TrendingUp,
    //   color: "text-green-600",
    //   bgColor: "bg-green-100",
    // },
    {
      title: "Total Rewards Earned",
      value: children
        .reduce((sum, child) => sum + child.totalRewards, 0)
        .toString(),
      change: "Across all children",
      icon: Trophy,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  const recentActivity = [
    {
      type: "achievement",
      child: "John Adebayo",
      title: "Completed Advanced React Course",
      description: "Scored 95% on final assessment",
      time: "2 hours ago",
      icon: Trophy,
      color: "text-green-600",
    },
    {
      type: "test",
      child: "Mary Adebayo",
      title: "Took Mathematics Quiz",
      description: "Scored 88% - Above class average",
      time: "1 day ago",
      icon: Target,
      color: "text-blue-600",
    },
    {
      type: "payment",
      child: "Both Children",
      title: "Monthly Subscription Renewed",
      description: "Premium plan - ₦25,000 paid successfully",
      time: "3 days ago",
      icon: CreditCard,
      color: "text-purple-600",
    },
    {
      type: "alert",
      child: "John Adebayo",
      title: "Upcoming Test Reminder",
      description: "Mathematics Quiz scheduled for tomorrow",
      time: "5 hours ago",
      icon: AlertCircle,
      color: "text-yellow-600",
    },
  ];

  const upcomingEvents = [
    {
      child: "John Adebayo",
      event: "Mathematics Quiz",
      date: "Tomorrow, 2:00 PM",
      type: "Test",
      importance: "high",
    },
    {
      child: "Mary Adebayo",
      event: "English Literature Test",
      date: "Friday, 10:00 AM",
      type: "Test",
      importance: "medium",
    },
    {
      child: "John Adebayo",
      event: "Private Tutoring Session",
      date: "Saturday, 3:00 PM",
      type: "Tutoring",
      importance: "low",
    },
    {
      child: "Mary Adebayo",
      event: "Science Project Submission",
      date: "Next Monday",
      type: "Assignment",
      importance: "high",
    },
  ];

  const getImportanceBadge = (importance: string) => {
    switch (importance) {
      case "high":
        return <Badge className="bg-red-100 text-red-800">High Priority</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case "low":
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return <Badge variant="secondary">{importance}</Badge>;
    }
  };

  const getProgressPercentage = (completed: number, total: number) => {
    return Math.round((completed / total) * 100);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Parent Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor your children's learning progress and manage their educational
          journey
        </p>
      </div>

      {/* Family Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {familyStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Children Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Children's Progress Overview</CardTitle>
          <CardDescription>
            Quick summary of each child's learning journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {children.map((child) => (
              <div key={child.id} className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={child.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {child.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold">{child.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {child.grade} • {child.school}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Last active: {child.lastActive}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      <span>
                        Courses: {child.coursesCompleted}/
                        {child.coursesEnrolled}
                      </span>
                    </div>
                    <Progress
                      value={getProgressPercentage(
                        child.coursesCompleted,
                        child.coursesEnrolled
                      )}
                      className="h-2"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      <span
                        className={`font-medium ${getScoreColor(
                          child.averageScore
                        )}`}>
                        Avg: {child.averageScore}%
                      </span>
                    </div>
                    <Progress value={child.averageScore} className="h-2" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{child.weeklyHours}h this week</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Trophy className="h-3 w-3 text-orange-500" />
                    <span>{child.totalRewards} rewards</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span>{child.currentStreak} day streak</span>
                  </div>
                </div>

                <div className="p-2 bg-muted rounded text-xs">
                  <div className="flex items-center gap-1 text-blue-600">
                    <Calendar className="h-3 w-3" />
                    <span className="font-medium">Upcoming:</span>
                  </div>
                  <p className="mt-1">{child.upcomingTest}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates from your children's learning
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="p-2 bg-muted rounded-full">
                  <activity.icon className={`h-3 w-3 ${activity.color}`} />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <Badge variant="outline" className="text-xs">
                      {activity.child}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center">
                    <Clock className="mr-1 h-3 w-3" />
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>
              Important dates and deadlines to remember
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingEvents.map((event, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">{event.event}</h4>
                    <Badge variant="outline" className="text-xs">
                      {event.child}
                    </Badge>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="mr-1 h-3 w-3" />
                    {event.date}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {event.type}
                  </Badge>
                </div>
                <div>{getImportanceBadge(event.importance)}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button
              className="h-20 flex-col gap-2 bg-transparent"
              variant="outline">
              <Calendar className="h-6 w-6" />
              <span>Book Tutoring</span>
            </Button>
            <Button
              className="h-20 flex-col gap-2 bg-transparent"
              variant="outline">
              <CreditCard className="h-6 w-6" />
              <span>View Payments</span>
            </Button>
            <Button
              className="h-20 flex-col gap-2 bg-transparent"
              variant="outline">
              <Trophy className="h-6 w-6" />
              <span>Check Rewards</span>
            </Button>
            <Button
              className="h-20 flex-col gap-2 bg-transparent"
              variant="outline">
              <Users className="h-6 w-6" />
              <span>Manage Children</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

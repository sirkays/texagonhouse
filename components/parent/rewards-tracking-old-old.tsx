"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Star, Zap } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

export function RewardsTracking() {
  // State for pagination
  const [leaderboardPage, setLeaderboardPage] = React.useState(1);
  const itemsPerPageLeaderboard = 5;

  const children = [
    {
      id: 1,
      name: "John Adebayo",
      avatar: "/placeholder.svg?height=40&width=40",
      totalPoints: 2450,
      currentStreak: 15,
      badges: [
        { name: "Math Wizard", icon: "🧮", earned: true, date: "2024-01-10" },
        { name: "Code Master", icon: "💻", earned: true, date: "2024-01-05" },
        { name: "Perfect Attendance", icon: "📅", earned: true, date: "2023-12-20" },
        { name: "Quiz Champion", icon: "🏆", earned: false },
      ],
      recentAchievements: [
        { title: "Completed Advanced React Course", points: 200, date: "2024-01-15", type: "Course Completion" },
        { title: "15-Day Learning Streak", points: 150, date: "2024-01-14", type: "Streak Milestone" },
        { title: "Perfect Score on Math Quiz", points: 100, date: "2024-01-12", type: "Quiz Achievement" },
      ],
    },
    {
      id: 2,
      name: "Mary Adebayo",
      avatar: "/placeholder.svg?height=40&width=40",
      totalPoints: 3200,
      currentStreak: 22,
      badges: [
        { name: "Literature Expert", icon: "📚", earned: true, date: "2024-01-08" },
        { name: "Science Star", icon: "🔬", earned: true, date: "2023-12-15" },
        { name: "Top Performer", icon: "⭐", earned: true, date: "2023-12-01" },
        { name: "Collaboration King", icon: "🤝", earned: false },
      ],
      recentAchievements: [
        { title: "22-Day Learning Streak", points: 220, date: "2024-01-16", type: "Streak Milestone" },
        { title: "Excellent Essay on Shakespeare", points: 180, date: "2024-01-13", type: "Assignment Excellence" },
        { title: "Helped 5 Classmates", points: 120, date: "2024-01-10", type: "Peer Support" },
      ],
    },
  ];

  const leaderboard = [
    { rank: 1, name: "Sarah Okonkwo", school: "Federal Government College", points: 3850 },
    { rank: 2, name: "David Adamu", school: "Lagos State Model College", points: 3650 },
    { rank: 3, name: "Mary Adebayo", school: "Lagos State Model College", points: 3200, isChild: true },
    { rank: 4, name: "Grace Okoro", school: "Greenfield Academy", points: 3100 },
    { rank: 5, name: "Michael Bello", school: "Unity High School", points: 2980 },
    { rank: 6, name: "Fatima Hassan", school: "Federal Government College", points: 2850 },
    { rank: 7, name: "Emmanuel Okafor", school: "Greenfield Academy", points: 2750 },
    { rank: 8, name: "John Adebayo", school: "Lagos State Model College", points: 2450, isChild: true },
    { rank: 9, name: "Blessing Uche", school: "Unity High School", points: 2380 },
    { rank: 10, name: "Ibrahim Musa", school: "Federal Government College", points: 2250 },
  ];

  // Pagination calculations
  const totalLeaderboardPages = Math.ceil(leaderboard.length / itemsPerPageLeaderboard);
  const paginatedLeaderboard = leaderboard.slice(
    (leaderboardPage - 1) * itemsPerPageLeaderboard,
    leaderboardPage * itemsPerPageLeaderboard
  );

  // Pagination navigation handlers
  const handleLeaderboardPageChange = (page: number) => {
    if (page >= 1 && page <= totalLeaderboardPages) {
      setLeaderboardPage(page);
    }
  };

  // Generate page numbers with ellipsis
  const renderLeaderboardPageNumbers = (): React.ReactNode[] => {
    const pages: React.ReactNode[] = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(1, leaderboardPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalLeaderboardPages, startPage + maxVisiblePages - 1);

    if (startPage > 1) pages.push(<PaginationEllipsis key="start-ellipsis" />);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink isActive={i === leaderboardPage} onClick={() => handleLeaderboardPageChange(i)}>
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (endPage < totalLeaderboardPages) pages.push(<PaginationEllipsis key="end-ellipsis" />);

    return pages;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Rewards & Achievements</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Track your children's progress and celebrate their achievements
        </p>
      </div>

      {/* Children Overview */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
        {children.map((child) => (
          <Card key={child.id} className="hover:shadow-md transition-shadow w-full max-w-full overflow-hidden">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center space-x-3 sm:space-x-4 overflow-hidden">
                <Avatar className="h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0">
                  <AvatarImage src={child.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-sm sm:text-base">
                    {child.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base sm:text-lg md:text-xl truncate">{child.name}</CardTitle>
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground mt-1">
                    <Trophy className="h-3 w-3 sm:h-4 sm:w-4" />
                    {child.totalPoints.toLocaleString()} points
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 p-4 sm:p-6">
              {/* Current Streak */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500" />
                  <span className="font-medium">Current Streak</span>
                </div>
                <div className="font-bold text-orange-600">{child.currentStreak} days</div>
              </div>

              {/* Badges */}
              <div className="space-y-2">
                <h4 className="font-semibold text-xs sm:text-sm">Badges & Achievements</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                  {child.badges.map((badge, index) => (
                    <div
                      key={index}
                      className={`p-2 border rounded-lg text-center ${
                        badge.earned ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="text-base sm:text-lg mb-1">{badge.icon}</div>
                      <div className="text-xs font-medium truncate">{badge.name}</div>
                      {badge.earned && (
                        <div className="text-xs text-green-600 mt-1">Earned {badge.date}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Achievements */}
              <div className="space-y-2">
                <h4 className="font-semibold text-xs sm:text-sm">Recent Achievements</h4>
                <div className="space-y-2 max-h-40 scrollbar-thin">
                  {child.recentAchievements.slice(0, 3).map((achievement, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded text-xs sm:text-sm">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{achievement.title}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {achievement.type} • {achievement.date}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-green-600 font-medium flex-shrink-0">
                        <Star className="h-3 w-3" />+{achievement.points}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Platform Leaderboard */}
      <Card className="w-full">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg md:text-xl">Platform Leaderboard</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Top performers across all schools this term</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-2 sm:space-y-3">
            {paginatedLeaderboard.map((student) => (
              <div
                key={student.rank}
                className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 p-3 rounded-lg overflow-hidden ${
                  student.isChild ? "bg-blue-50 border border-blue-200" : "bg-muted"
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div
                    className={`flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm ${
                      student.rank <= 3
                        ? student.rank === 1
                          ? "bg-yellow-500 text-white"
                          : student.rank === 2
                          ? "bg-gray-400 text-white"
                          : "bg-orange-500 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {student.rank}
                  </div>
                  <div className="min-w-0">
                    <div className={`font-medium truncate text-xs sm:text-sm ${student.isChild ? "text-blue-700" : ""}`}>
                      {student.name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{student.school}</div>
                  </div>
                  {student.isChild && (
                    <Badge className="bg-blue-100 text-blue-800 text-[10px] sm:text-xs whitespace-nowrap">Your Child</Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 font-medium text-xs sm:text-sm flex-shrink-0">
                  <Trophy className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600 flex-shrink-0" />
                  <span className="truncate">{student.points.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Leaderboard Pagination */}
          {totalLeaderboardPages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handleLeaderboardPageChange(leaderboardPage - 1)}
                    className={leaderboardPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {renderLeaderboardPageNumbers()}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => handleLeaderboardPageChange(leaderboardPage + 1)}
                    className={leaderboardPage === totalLeaderboardPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
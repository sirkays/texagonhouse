"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Progress} from "@/components/ui/progress";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {
  Trophy,
  Star,
  Gift,
  Target,
  Calendar,
  CheckCircle,
  Award,
  Zap,
} from "lucide-react";
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
  const [rewardsPage, setRewardsPage] = React.useState(1);
  const itemsPerPageLeaderboard = 5;
  const itemsPerPageRewards = 2;

  const children = [
    {
      id: 1,
      name: "John Adebayo",
      avatar: "/placeholder.svg?height=40&width=40",
      totalPoints: 2450,
      currentStreak: 15,
      level: "Gold Scholar",
      nextLevel: "Platinum Master",
      pointsToNextLevel: 550,
      badges: [
        {name: "Math Wizard", icon: "🧮", earned: true, date: "2024-01-10"},
        {name: "Code Master", icon: "💻", earned: true, date: "2024-01-05"},
        {
          name: "Perfect Attendance",
          icon: "📅",
          earned: true,
          date: "2023-12-20",
        },
        {name: "Quiz Champion", icon: "🏆", earned: false, progress: 80},
      ],
      recentAchievements: [
        {
          title: "Completed Advanced React Course",
          points: 200,
          date: "2024-01-15",
          type: "Course Completion",
        },
        {
          title: "15-Day Learning Streak",
          points: 150,
          date: "2024-01-14",
          type: "Streak Milestone",
        },
        {
          title: "Perfect Score on Math Quiz",
          points: 100,
          date: "2024-01-12",
          type: "Quiz Achievement",
        },
      ],
    },
    {
      id: 2,
      name: "Mary Adebayo",
      avatar: "/placeholder.svg?height=40&width=40",
      totalPoints: 3200,
      currentStreak: 22,
      level: "Platinum Master",
      nextLevel: "Diamond Elite",
      pointsToNextLevel: 800,
      badges: [
        {
          name: "Literature Expert",
          icon: "📚",
          earned: true,
          date: "2024-01-08",
        },
        {name: "Science Star", icon: "🔬", earned: true, date: "2023-12-15"},
        {name: "Top Performer", icon: "⭐", earned: true, date: "2023-12-01"},
        {name: "Collaboration King", icon: "🤝", earned: false, progress: 60},
      ],
      recentAchievements: [
        {
          title: "22-Day Learning Streak",
          points: 220,
          date: "2024-01-16",
          type: "Streak Milestone",
        },
        {
          title: "Excellent Essay on Shakespeare",
          points: 180,
          date: "2024-01-13",
          type: "Assignment Excellence",
        },
        {
          title: "Helped 5 Classmates",
          points: 120,
          date: "2024-01-10",
          type: "Peer Support",
        },
      ],
    },
  ];

  const upcomingRewards = [
    {
      title: "Dubai Educational Trip",
      description: "3-day educational tour to Dubai for top 10 performers",
      requirement: "Top 10 in term rankings",
      deadline: "End of Term 2",
      status: "In Progress",
      eligibleChildren: ["John Adebayo", "Mary Adebayo"],
      currentRanking: {john: 8, mary: 3},
    },
    {
      title: "MacBook Air",
      description: "Latest MacBook Air for the highest scorer",
      requirement: "Highest overall score in platform",
      deadline: "End of Academic Year",
      status: "Available",
      eligibleChildren: ["Mary Adebayo"],
      currentRanking: {mary: 2},
    },
    {
      title: "Scholarship Award",
      description: "₦500,000 scholarship for university education",
      requirement: "Maintain 90%+ average for full year",
      deadline: "End of Academic Year",
      status: "On Track",
      eligibleChildren: ["John Adebayo", "Mary Adebayo"],
      currentAverage: {john: 85, mary: 92},
    },
  ];

  const leaderboard = [
    {
      rank: 1,
      name: "Sarah Okonkwo",
      school: "Federal Government College",
      points: 3850,
    },
    {
      rank: 2,
      name: "David Adamu",
      school: "Lagos State Model College",
      points: 3650,
    },
    {
      rank: 3,
      name: "Mary Adebayo",
      school: "Lagos State Model College",
      points: 3200,
      isChild: true,
    },
    {rank: 4, name: "Grace Okoro", school: "Greenfield Academy", points: 3100},
    {rank: 5, name: "Michael Bello", school: "Unity High School", points: 2980},
    {
      rank: 6,
      name: "Fatima Hassan",
      school: "Federal Government College",
      points: 2850,
    },
    {
      rank: 7,
      name: "Emmanuel Okafor",
      school: "Greenfield Academy",
      points: 2750,
    },
    {
      rank: 8,
      name: "John Adebayo",
      school: "Lagos State Model College",
      points: 2450,
      isChild: true,
    },
    {rank: 9, name: "Blessing Uche", school: "Unity High School", points: 2380},
    {
      rank: 10,
      name: "Ibrahim Musa",
      school: "Federal Government College",
      points: 2250,
    },
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Diamond Elite":
        return "text-cyan-600";
      case "Platinum Master":
        return "text-purple-600";
      case "Gold Scholar":
        return "text-yellow-600";
      case "Silver Student":
        return "text-gray-600";
      default:
        return "text-blue-600";
    }
  };

  const getLevelProgress = (current: number, needed: number) => {
    const total = current + needed;
    return Math.round((current / total) * 100);
  };

  const getRewardStatusBadge = (status: string) => {
    switch (status) {
      case "Available":
        return (
          <Badge className="bg-green-100 text-green-800 text-xs sm:text-sm">
            Available
          </Badge>
        );
      case "In Progress":
        return (
          <Badge className="bg-blue-100 text-blue-800 text-xs sm:text-sm">
            In Progress
          </Badge>
        );
      case "On Track":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 text-xs sm:text-sm">
            On Track
          </Badge>
        );
      case "Achieved":
        return (
          <Badge className="bg-purple-100 text-purple-800 text-xs sm:text-sm">
            Achieved
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-xs sm:text-sm">
            {status}
          </Badge>
        );
    }
  };

  // Pagination calculations
  const totalLeaderboardPages = Math.ceil(
    leaderboard.length / itemsPerPageLeaderboard
  );
  const totalRewardsPages = Math.ceil(
    upcomingRewards.length / itemsPerPageRewards
  );

  const paginatedLeaderboard = leaderboard.slice(
    (leaderboardPage - 1) * itemsPerPageLeaderboard,
    leaderboardPage * itemsPerPageLeaderboard
  );

  const paginatedRewards = upcomingRewards.slice(
    (rewardsPage - 1) * itemsPerPageRewards,
    rewardsPage * itemsPerPageRewards
  );

  // Pagination navigation handlers
  const handleLeaderboardPageChange = (page: number) => {
    if (page >= 1 && page <= totalLeaderboardPages) {
      setLeaderboardPage(page);
    }
  };

  const handleRewardsPageChange = (page: number) => {
    if (page >= 1 && page <= totalRewardsPages) {
      setRewardsPage(page);
    }
  };

  // Generate page numbers with ellipsis
  const renderLeaderboardPageNumbers = (): React.ReactNode[] => {
    const pages: React.ReactNode[] = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(
      1,
      leaderboardPage - Math.floor(maxVisiblePages / 2)
    );
    const endPage = Math.min(
      totalLeaderboardPages,
      startPage + maxVisiblePages - 1
    );

    if (startPage > 1) {
      pages.push(<PaginationEllipsis key="start-ellipsis" />);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            isActive={i === leaderboardPage}
            onClick={() => handleLeaderboardPageChange(i)}>
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (endPage < totalLeaderboardPages) {
      pages.push(<PaginationEllipsis key="end-ellipsis" />);
    }

    return pages;
  };

  const renderRewardsPageNumbers = (): React.ReactNode[] => {
    const pages: React.ReactNode[] = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(
      1,
      rewardsPage - Math.floor(maxVisiblePages / 2)
    );
    const endPage = Math.min(
      totalRewardsPages,
      startPage + maxVisiblePages - 1
    );

    if (startPage > 1) {
      pages.push(<PaginationEllipsis key="start-ellipsis" />);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            isActive={i === rewardsPage}
            onClick={() => handleRewardsPageChange(i)}>
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (endPage < totalRewardsPages) {
      pages.push(<PaginationEllipsis key="end-ellipsis" />);
    }

    return pages;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
          Rewards & Achievements
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Track your children's progress and celebrate their achievements
        </p>
      </div>

      {/* Children Overview */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
        {children.map((child) => (
          <Card
            key={child.id}
            className="hover:shadow-md transition-shadow w-full max-w-full overflow-hidden">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center space-x-3 sm:space-x-4 overflow-hidden">
                <Avatar className="h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0">
                  <AvatarImage src={child.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-sm sm:text-base">
                    {child.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base sm:text-lg md:text-xl truncate">
                    {child.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge
                      className={`${getLevelColor(
                        child.level
                      )} text-xs sm:text-sm`}>
                      {child.level}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                      <Trophy className="h-3 w-3 sm:h-4 sm:w-4" />
                      {child.totalPoints.toLocaleString()} points
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 p-4 sm:p-6">
              {/* Level Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span>Progress to {child.nextLevel}</span>
                  <span>{child.pointsToNextLevel} pts needed</span>
                </div>
                <Progress
                  value={getLevelProgress(
                    child.totalPoints,
                    child.pointsToNextLevel
                  )}
                  className="h-2"
                />
              </div>

              {/* Current Streak */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500" />
                  <span className="font-medium">Current Streak</span>
                </div>
                <div className="font-bold text-orange-600">
                  {child.currentStreak} days
                </div>
              </div>

              {/* Badges */}
              <div className="space-y-2">
                <h4 className="font-semibold text-xs sm:text-sm">
                  Badges & Achievements
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                  {child.badges.map((badge, index) => (
                    <div
                      key={index}
                      className={`p-2 border rounded-lg text-center ${
                        badge.earned
                          ? "bg-green-50 border-green-200"
                          : "bg-gray-50 border-gray-200"
                      }`}>
                      <div className="text-base sm:text-lg mb-1">
                        {badge.icon}
                      </div>
                      <div className="text-xs font-medium truncate">
                        {badge.name}
                      </div>
                      {badge.earned ? (
                        <div className="text-xs text-green-600 mt-1">
                          Earned {badge.date}
                        </div>
                      ) : (
                        <div className="mt-1">
                          <Progress value={badge.progress} className="h-1" />
                          <div className="text-xs text-muted-foreground mt-1">
                            {badge.progress}%
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Achievements */}
              <div className="space-y-2">
                <h4 className="font-semibold text-xs sm:text-sm">
                  Recent Achievements
                </h4>
                <div className="space-y-2 max-h-40 scrollbar-thin">
                  {child.recentAchievements
                    .slice(0, 3)
                    .map((achievement, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-muted rounded text-xs sm:text-sm">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {achievement.title}
                          </div>
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
          <CardTitle className="text-base sm:text-lg md:text-xl">
            Platform Leaderboard
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Top performers across all schools this term
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-2 sm:space-y-3">
            {paginatedLeaderboard.map((student) => (
              <div
                key={student.rank}
                className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 p-3 rounded-lg overflow-hidden ${
                  student.isChild
                    ? "bg-blue-50 border border-blue-200"
                    : "bg-muted"
                }`}>
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
                    }`}>
                    {student.rank}
                  </div>
                  <div className="min-w-0">
                    <div
                      className={`font-medium truncate text-xs sm:text-sm ${
                        student.isChild ? "text-blue-700" : ""
                      }`}>
                      {student.name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {student.school}
                    </div>
                  </div>
                  {student.isChild && (
                    <Badge className="bg-blue-100 text-blue-800 text-[10px] sm:text-xs whitespace-nowrap">
                      Your Child
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 font-medium text-xs sm:text-sm flex-shrink-0">
                  <Trophy className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600 flex-shrink-0" />
                  <span className="truncate">
                    {student.points.toLocaleString()}
                  </span>
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
                    onClick={() =>
                      handleLeaderboardPageChange(leaderboardPage - 1)
                    }
                    className={
                      leaderboardPage === 1
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
                {renderLeaderboardPageNumbers()}
                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      handleLeaderboardPageChange(leaderboardPage + 1)
                    }
                    className={
                      leaderboardPage === totalLeaderboardPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Rewards */}
      <Card className="w-full">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg md:text-xl">
            Upcoming Rewards
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Major prizes and incentives your children can earn
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            {paginatedRewards.map((reward, index) => (
              <div
                key={index}
                className="p-3 sm:p-4 border rounded-lg space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
                  <div className="space-y-1 flex-1 min-w-0">
                    <h4 className="font-semibold flex items-center gap-2 text-xs sm:text-sm md:text-base">
                      <Gift className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600 flex-shrink-0" />
                      <span className="truncate">{reward.title}</span>
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {reward.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Target className="h-3 w-3" />
                        <span>{reward.requirement}</span>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Calendar className="h-3 w-3" />
                        <span>{reward.deadline}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {getRewardStatusBadge(reward.status)}
                  </div>
                </div>
                <div className="space-y-2">
                  <h5 className="text-xs sm:text-sm font-medium">
                    Eligible Children:
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {reward.eligibleChildren.map((childName, childIndex) => (
                      <div
                        key={childIndex}
                        className="flex items-center gap-2 p-2 bg-muted rounded text-xs sm:text-sm min-w-[100px]">
                        <span className="truncate">{childName}</span>
                        {reward.currentRanking && (
                          <Badge
                            variant="outline"
                            className="text-[10px] sm:text-xs whitespace-nowrap">
                            {childName === "John Adebayo"
                              ? `Rank #${reward.currentRanking.john}`
                              : `Rank #${reward.currentRanking.mary}`}
                          </Badge>
                        )}
                        {reward.currentAverage && (
                          <Badge
                            variant="outline"
                            className="text-[10px] sm:text-xs whitespace-nowrap">
                            {childName === "John Adebayo"
                              ? `${reward.currentAverage.john}% avg`
                              : `${reward.currentAverage.mary}% avg`}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Rewards Pagination */}
          {totalRewardsPages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handleRewardsPageChange(rewardsPage - 1)}
                    className={
                      rewardsPage === 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>
                {renderRewardsPageNumbers()}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => handleRewardsPageChange(rewardsPage + 1)}
                    className={
                      rewardsPage === totalRewardsPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </CardContent>
      </Card>

      {/* Reward History */}
      <Card className="w-full">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg md:text-xl">
            Reward History
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Previously earned rewards and achievements
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 p-3 border rounded-lg">
              <div className="flex items-start sm:items-center gap-2 sm:gap-3 min-w-0">
                <div className="p-2 bg-green-100 rounded-full flex-shrink-0">
                  <Award className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-medium text-xs sm:text-sm md:text-base truncate">
                    Term 1 Excellence Award
                  </h4>
                  <p className="text-xs text-muted-foreground truncate">
                    Mary Adebayo • December 2023
                  </p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800 flex items-center gap-1 flex-shrink-0 text-[10px] sm:text-xs whitespace-nowrap">
                <CheckCircle className="h-3 w-3" />
                Received
              </Badge>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 p-3 border rounded-lg">
              <div className="flex items-start sm:items-center gap-2 sm:gap-3 min-w-0">
                <div className="p-2 bg-blue-100 rounded-full flex-shrink-0">
                  <Trophy className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-medium text-xs sm:text-sm md:text-base truncate">
                    Mathematics Competition Winner
                  </h4>
                  <p className="text-xs text-muted-foreground truncate">
                    John Adebayo • November 2023
                  </p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800 flex items-center gap-1 flex-shrink-0 text-[10px] sm:text-xs whitespace-nowrap">
                <CheckCircle className="h-3 w-3" />
                Received
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

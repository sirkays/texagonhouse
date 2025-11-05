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
import { Trophy, Star, Zap, Loader2 } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Spinner } from "@/components/ui/spinner";

interface BadgeType {
  name: string;
  icon: string;
  earned: boolean;
  date?: string;
}

interface Achievement {
  title: string;
  points: number;
  date: string;
  type: string;
}

interface Child {
  id: number;
  name: string;
  avatar: string;
  totalPoints: number;
  currentStreak: number;
  badges: BadgeType[];
  recentAchievements: Achievement[];
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  school: string;
  points: number;
  isChild?: boolean;
}

const badgeIconMap: Record<string, React.ReactNode> = {
  medal: <span className="text-base">🥇</span>,
  trophy: <span className="text-base">🏆</span>,
  crown: <span className="text-base">👑</span>,
  gem: <span className="text-base">💎</span>,
  silver: <span className="text-base">🥈</span>,
};

export function RewardsTracking() {
  const [leaderboardPage, setLeaderboardPage] = React.useState(1);
  const itemsPerPageLeaderboard = 5;
  const [data, setData] = React.useState<{
    children: Child[];
    leaderboard: LeaderboardEntry[];
  } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/parent/rewards");
        if (!res.ok) throw new Error("Failed to load data");
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError("Failed to load rewards data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  console.log("RewardsTracking data:", data);

  const children = data?.children ?? [];
  const leaderboard = data?.leaderboard ?? [];

  const totalLeaderboardPages = Math.ceil(
    leaderboard.length / itemsPerPageLeaderboard
  );
  const paginatedLeaderboard = leaderboard.slice(
    (leaderboardPage - 1) * itemsPerPageLeaderboard,
    leaderboardPage * itemsPerPageLeaderboard
  );

  const handleLeaderboardPageChange = (page: number) => {
    if (page >= 1 && page <= totalLeaderboardPages) setLeaderboardPage(page);
  };

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
    if (startPage > 1) pages.push(<PaginationEllipsis key="start-ellipsis" />);
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            isActive={i === leaderboardPage}
            onClick={() => handleLeaderboardPageChange(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    if (endPage < totalLeaderboardPages)
      pages.push(<PaginationEllipsis key="end-ellipsis" />);
    return pages;
  };

  if (loading) {
    return (
      <div className="inset-0 flex justify-center items-center bg-white z-50 h-[100vh]">
        <Spinner
          className="w-10 h-10 xs:w-12 xs:h-12 text-[#EF7B55] self-center"
          size="sm"
        />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600 text-center p-4">{error}</div>;
  }

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

      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
        {children.map((child) => (
          <Card
            key={child.id}
            className="hover:shadow-md transition-shadow w-full max-w-full overflow-hidden"
          >
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
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground mt-1">
                    <Trophy className="h-3 w-3 sm:h-4 sm:w-4" />
                    {child.totalPoints.toLocaleString()} points
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500" />
                  <span className="font-medium">Current Streak</span>
                </div>
                <div className="font-bold text-orange-600">
                  {child.currentStreak} days
                </div>
              </div>

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
                      }`}
                    >
                      <div className="text-base sm:text-lg mb-1">
                        {badgeIconMap[badge.icon] || (
                          <span className="text-base">🏅</span>
                        )}
                      </div>
                      <div className="text-xs font-medium truncate">
                        {badge.name}
                      </div>
                      {badge.earned && (
                        <div className="text-xs text-green-600 mt-1">
                          Earned {badge.date}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

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
                        className="flex items-center justify-between p-2 bg-muted rounded text-xs sm:text-sm"
                      >
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
                    <div
                      className={`font-medium truncate text-xs sm:text-sm ${
                        student.isChild ? "text-blue-700" : ""
                      }`}
                    >
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
    </div>
  );
}

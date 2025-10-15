"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  Medal,
  Crown,
  Star,
  TrendingUp,
  Users,
  School,
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
import { Spinner } from "@/components/ui/spinner";

interface Leader {
  rank: number;
  name: string;
  school?: string;
  points: number;
  avatar: string | null; // Updated to allow null
  streak: number;
  badges?: number;
  isCurrentUser: boolean;
}

interface LeaderboardData {
  stats: {
    global_rank: number | null;
    school_rank: number | null;
    total_points: number;
    weekly_points: number;
    competitors: number;
  };
  global: Leader[];
  school: Leader[];
  weekly: Leader[];
}

export function Leaderboard() {
  const [currentPage, setCurrentPage] = useState({
    global: 1,
    school: 1,
    weekly: 1,
  });
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData>({
    stats: {
      global_rank: null,
      school_rank: null,
      total_points: 0,
      weekly_points: 0,
      competitors: 0,
    },
    global: [],
    school: [],
    weekly: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const itemsPerPage = 3;

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          "/api/student/leaderboard?top_global=10&top_school=10&top_weekly=10"
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch leaderboard");
        }
        const data = await response.json();
        setLeaderboardData(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Trophy className="h-5 w-5 text-amber-600" />;
      default:
        return (
          <span className="text-lg font-bold text-muted-foreground">
            #{rank}
          </span>
        );
    }
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <Badge className="bg-yellow-100 text-yellow-700">🥇 Champion</Badge>
        );
      case 2:
        return (
          <Badge className="bg-gray-100 text-gray-700">🥈 Runner-up</Badge>
        );
      case 3:
        return (
          <Badge className="bg-amber-100 text-amber-700">🥉 Third Place</Badge>
        );
      default:
        return null;
    }
  };

  const getPaginatedItems = (items: Leader[], page: number) => {
    const startIndex = (page - 1) * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  };

  const getTotalPages = (items: Leader[]) => {
    return Math.ceil(items.length / itemsPerPage);
  };

  const renderPagination = (tab: keyof typeof currentPage) => {
    const items =
      tab === "global"
        ? leaderboardData.global
        : tab === "school"
        ? leaderboardData.school
        : leaderboardData.weekly;
    const totalPages = getTotalPages(items);
    const current = currentPage[tab];

    if (totalPages <= 1) return null;

    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              className={current === 1 ? "pointer-events-none opacity-50" : ""}
              onClick={() =>
                setCurrentPage((prev) => ({
                  ...prev,
                  [tab]: Math.max(1, prev[tab] - 1),
                }))
              }
              aria-disabled={current === 1}
            />
          </PaginationItem>

          {current > 2 && (
            <PaginationItem>
              <PaginationLink
                onClick={() =>
                  setCurrentPage((prev) => ({ ...prev, [tab]: 1 }))
                }
                aria-label="Go to first page"
              >
                1
              </PaginationLink>
            </PaginationItem>
          )}

          {current > 3 && (
            <PaginationItem>
              <PaginationEllipsis aria-label="More pages" />
            </PaginationItem>
          )}

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((page) => Math.abs(page - current) <= 1)
            .map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  isActive={page === current}
                  onClick={() =>
                    setCurrentPage((prev) => ({ ...prev, [tab]: page }))
                  }
                  aria-label={`Go to page ${page}`}
                  aria-current={page === current ? "page" : undefined}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

          {current < totalPages - 2 && (
            <PaginationItem>
              <PaginationEllipsis aria-label="More pages" />
            </PaginationItem>
          )}

          {current < totalPages - 1 && (
            <PaginationItem>
              <PaginationLink
                onClick={() =>
                  setCurrentPage((prev) => ({ ...prev, [tab]: totalPages }))
                }
                aria-label={`Go to last page ${totalPages}`}
              >
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          )}

          <PaginationItem>
            <PaginationNext
              className={
                current === totalPages ? "pointer-events-none opacity-50" : ""
              }
              onClick={() =>
                setCurrentPage((prev) => ({
                  ...prev,
                  [tab]: Math.min(totalPages, prev[tab] + 1),
                }))
              }
              aria-disabled={current === totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  // Handle avatar image errors
  const handleAvatarError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    const target = e.currentTarget;
    target.src = "/placeholder-avatar.png"; // Create this file in public folder
    target.onerror = null; // Prevent infinite error loops
  };

  
    const normalizeAvatarUrl = (avatar: string | null) => {
      if (!avatar) return "/placeholder-avatar.png";
      if (avatar.startsWith("http")) return avatar;
      return `https://texagonbackend.epichouse.online${avatar}`;
    };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="md" className="text-orange-500" />
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Leaderboard</h1>
        <p className="text-muted-foreground">
          See how you rank against other learners
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Global Rank</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leaderboardData.stats.global_rank
                ? `#${leaderboardData.stats.global_rank}`
                : "Unranked"}
            </div>
            <p className="text-xs text-muted-foreground">
              {leaderboardData.stats.global_rank
                ? "Your global position"
                : "Complete challenges to rank"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">School Rank</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leaderboardData.stats.school_rank
                ? `#${leaderboardData.stats.school_rank}`
                : "Unranked"}
            </div>
            <p className="text-xs text-muted-foreground">
              {leaderboardData.stats.school_rank
                ? "Top in your school"
                : "Complete challenges to rank"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leaderboardData.stats.total_points.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +{leaderboardData.stats.weekly_points} this week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Competitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leaderboardData.stats.competitors.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Active learners</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="global" className="space-y-4">
        <TabsList className="bg-[#f797712e] text-slate-700 flex flex-col lg:flex-row w-full gap-2 mb-14">
          <TabsTrigger
            value="global"
            className="bg-transparent w-full justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3"
          >
            Global
          </TabsTrigger>
          <TabsTrigger
            value="school"
            className="bg-transparent w-full justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3"
          >
            My School
          </TabsTrigger>
          <TabsTrigger
            value="weekly"
            className="bg-transparent w-full justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3"
          >
            This Week
          </TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Global Leaderboard</CardTitle>
              <CardDescription>
                Top performers across all schools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getPaginatedItems(
                  leaderboardData.global,
                  currentPage.global
                ).map((leader) => (
                  <div
                    key={leader.rank}
                    className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg border ${
                      leader.isCurrentUser
                        ? "bg-blue-50 border-blue-200"
                        : "bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8">
                        {getRankIcon(leader.rank)}
                      </div>
                      <Avatar>
                        <AvatarImage
                          src={normalizeAvatarUrl(leader.avatar)}
                          onError={handleAvatarError}
                        />

                        <AvatarFallback>
                          {leader.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-medium">{leader.name}</h4>
                          {leader.isCurrentUser && (
                            <Badge variant="secondary">You</Badge>
                          )}
                          {getRankBadge(leader.rank)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {leader.school}
                        </p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="font-bold text-lg">
                        {leader.points.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {leader.streak} day streak • {leader.badges} badges
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {renderPagination("global")}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="school" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>School Leaderboard</CardTitle>
              <CardDescription>Top performers in your school</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getPaginatedItems(
                  leaderboardData.school,
                  currentPage.school
                ).map((leader) => (
                  <div
                    key={leader.rank}
                    className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-lg border ${
                      leader.isCurrentUser
                        ? "bg-blue-50 border-blue-200"
                        : "bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3 sm:gap-4 flex-1">
                      <div className="flex items-center justify-center w-8 shrink-0">
                        {getRankIcon(leader.rank)}
                      </div>
                      <Avatar className="h-10 w-10">
                       <AvatarImage
                          src={normalizeAvatarUrl(leader.avatar)}
                          onError={handleAvatarError}
                        />
                        <AvatarFallback>
                          {leader.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-medium truncate">
                            {leader.name}
                          </h4>
                          {leader.isCurrentUser && (
                            <Badge variant="secondary" className="text-xs">
                              You
                            </Badge>
                          )}
                          {getRankBadge(leader.rank)}
                        </div>
                      </div>
                    </div>
                    <div className="sm:text-right text-sm flex sm:block justify-between w-full sm:w-auto">
                      <div className="font-bold text-base sm:text-lg">
                        {leader.points.toLocaleString()}
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        {leader.streak} day streak • {leader.badges} badges
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {renderPagination("school")}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Leaderboard</CardTitle>
              <CardDescription>Top performers this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getPaginatedItems(
                  leaderboardData.weekly,
                  currentPage.weekly
                ).map((leader) => (
                  <div
                    key={leader.rank}
                    className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-lg border ${
                      leader.isCurrentUser
                        ? "bg-blue-50 border-blue-200"
                        : "bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3 sm:gap-4 flex-1">
                      <div className="flex items-center justify-center w-8 shrink-0">
                        {getRankIcon(leader.rank)}
                      </div>
                      <Avatar className="h-10 w-10">
                       <AvatarImage
                          src={normalizeAvatarUrl(leader.avatar)}
                          onError={handleAvatarError}
                        />
                        <AvatarFallback>
                          {leader.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-medium truncate">
                            {leader.name}
                          </h4>
                          {leader.isCurrentUser && (
                            <Badge variant="secondary" className="text-xs">
                              You
                            </Badge>
                          )}
                          {getRankBadge(leader.rank)}
                        </div>
                      </div>
                    </div>
                    <div className="sm:text-right text-sm flex sm:block justify-between w-full sm:w-auto">
                      <div className="font-bold text-base sm:text-lg">
                        {leader.points.toLocaleString()}
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        points this week
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {renderPagination("weekly")}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

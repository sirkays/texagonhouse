

"use client";

import {useState, useEffect} from "react";
import {useStudentTheme} from "@/components/student/useStudentTheme";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
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
import {Spinner} from "@/components/ui/spinner";

interface Leader {
  rank: number;
  name: string;
  school?: string;
  points: number;
  avatar: string | null;
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
  const {theme} = useStudentTheme();
  const isAero = theme === "aero-premium";
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

  // ---- Helpers to prevent rank #1 when points = 0 ----
  const hasPoints = (points: number) => points > 0;

  const getRankIcon = (rank: number | null) => {
    if (!rank) {
      return (
        <span className="text-sm text-muted-foreground px-3">Unranked</span>
      );
    }

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

  const getRankBadge = (rank: number | null) => {
    if (!rank) return null;

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
                onClick={() => setCurrentPage((prev) => ({...prev, [tab]: 1}))}
                aria-label="Go to first page">
                1
              </PaginationLink>
            </PaginationItem>
          )}

          {current > 3 && (
            <PaginationItem>
              <PaginationEllipsis aria-label="More pages" />
            </PaginationItem>
          )}

          {Array.from({length: totalPages}, (_, i) => i + 1)
            .filter((page) => Math.abs(page - current) <= 1)
            .map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  isActive={page === current}
                  onClick={() =>
                    setCurrentPage((prev) => ({...prev, [tab]: page}))
                  }
                  aria-label={`Go to page ${page}`}
                  aria-current={page === current ? "page" : undefined}>
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
                  setCurrentPage((prev) => ({...prev, [tab]: totalPages}))
                }
                aria-label={`Go to last page ${totalPages}`}>
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
    target.src = "/placeholder-avatar.png";
    target.onerror = null;
  };

  const normalizeAvatarUrl = (avatar: string | null) => {
    if (!avatar) return "/placeholder-avatar.png";
    if (avatar.startsWith("http")) return avatar;
    const base = process.env.NEXT_PUBLIC_DJANGO_BASE_URL ?? "";
    return `${base}${avatar}`;
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

  // stats rank should be unranked if total points is 0
  const showGlobalRank =
    leaderboardData.stats.total_points > 0 && leaderboardData.stats.global_rank
      ? `#${leaderboardData.stats.global_rank}`
      : "Unranked";

  const showSchoolRank =
    leaderboardData.stats.total_points > 0 && leaderboardData.stats.school_rank
      ? `#${leaderboardData.stats.school_rank}`
      : "Unranked";

  const leaderboardStats = [
    {
      title: "Global Rank",
      value: showGlobalRank,
      icon: TrendingUp,
      description: () =>
        leaderboardData.stats.total_points > 0 &&
        leaderboardData.stats.global_rank
          ? "Your global position"
          : "Complete challenges to rank",
    },
    {
      title: "School Rank",
      value: showSchoolRank,
      icon: School,
      description: () =>
        leaderboardData.stats.total_points > 0 &&
        leaderboardData.stats.school_rank
          ? "Top in your school"
          : "Complete challenges to rank",
    },
    {
      title: "Total Points",
      value: leaderboardData.stats.total_points.toLocaleString(),
      icon: Star,
      description: () => `+${leaderboardData.stats.weekly_points} this week`,
    },
    {
      title: "Competitors",
      value: leaderboardData.stats.competitors.toLocaleString(),
      icon: Users,
      description: () => "Active learners",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Leaderboard</h1>
        <p className="text-muted-foreground">
          See how you rank against other learners
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 xs:grid-cols-2 md:grid-cols-4">
        {leaderboardStats.map((stat, index) => (
          <Card key={index} className={isAero 
            ? "bg-white/60 backdrop-blur-md border border-slate-200/40 shadow-sm rounded-2xl hover:translate-y-[-2px] hover:shadow-md transition-all duration-300"
            : ""
          }>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {typeof stat.description === "function"
                  ? stat.description()
                  : stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="global" className="space-y-4">
        <TabsList className={isAero
          ? "flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white/20 p-1.5 border border-slate-200/50 rounded-2xl w-full mb-8"
          : "bg-[#f797712e] text-slate-700 flex flex-col sm:flex-row items-stretch sm:items-center w-full gap-2 mb-8 p-1.5 rounded-2xl border border-slate-100"
        }>
          <TabsTrigger
            value="global"
            className={isAero
              ? "flex-1 text-center data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white font-bold rounded-xl px-4 py-2.5 text-sm transition-all duration-300"
              : "flex-1 text-center bg-transparent justify-center py-2.5 data-[state=active]:bg-[#EF7B55]/70 data-[state=active]:text-white gap-3 rounded-xl"
            }>
            Global
          </TabsTrigger>
          <TabsTrigger
            value="school"
            className={isAero
              ? "flex-1 text-center data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white font-bold rounded-xl px-4 py-2.5 text-sm transition-all duration-300"
              : "flex-1 text-center bg-transparent justify-center py-2.5 data-[state=active]:bg-[#EF7B55]/70 data-[state=active]:text-white gap-3 rounded-xl"
            }>
            My School
          </TabsTrigger>
          <TabsTrigger
            value="weekly"
            className={isAero
              ? "flex-1 text-center data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white font-bold rounded-xl px-4 py-2.5 text-sm transition-all duration-300"
              : "flex-1 text-center bg-transparent justify-center py-2.5 data-[state=active]:bg-[#EF7B55]/70 data-[state=active]:text-white gap-3 rounded-xl"
            }>
            This Week
          </TabsTrigger>
        </TabsList>

        {/* ---------------- Global Tab ---------------- */}
        <TabsContent value="global" className="space-y-4">
          <Card className={isAero
            ? "border border-slate-200/40 bg-white/50 backdrop-blur-md rounded-3xl shadow-lg"
            : "border border-slate-200 bg-white"
          }>
            <CardHeader className="space-y-1 px-4 sm:px-6">
              <CardTitle className="text-lg sm:text-xl font-semibold text-slate-900">
                Global Leaderboard
              </CardTitle>
              <CardDescription className="text-sm text-slate-500">
                Top performers across all schools
              </CardDescription>
            </CardHeader>

            <CardContent className="px-4 sm:px-6">
              <div className="space-y-3">
                {getPaginatedItems(
                  leaderboardData.global,
                  currentPage.global
                ).map((leader) => {
                  const effectiveRank = hasPoints(leader.points)
                    ? leader.rank
                    : null;

                  const highlightCurrentUser =
                    leader.isCurrentUser && hasPoints(leader.points);

                  return (
                    <div
                      key={`${leader.rank}-${leader.name}`}
                      className={isAero
                        ? `flex flex-col gap-3 rounded-2xl border p-4 transition ${
                            highlightCurrentUser
                              ? "border-[#EF7B55] bg-orange-500/5 shadow-md shadow-orange-50/20"
                              : "border-slate-200/30 bg-white/40 hover:bg-white/60"
                          } sm:flex-row sm:items-center sm:justify-between`
                        : `flex flex-col gap-3 rounded-md border p-4 transition ${
                            highlightCurrentUser
                              ? "border-[#EF7B55] bg-[#FFF4F1]/30"
                              : "border-slate-200 bg-white"
                          } sm:flex-row sm:items-center sm:justify-between`
                      }>
                      {/* Left section */}
                      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                        {/* Rank + Avatar */}
                        <div className="flex flex-shrink-0 items-center gap-3 sm:gap-4">
                          <div className="flex w-8 justify-center text-slate-400">
                            {getRankIcon(effectiveRank)}
                          </div>

                          <Avatar className="h-10 w-10 shrink-0">
                            <AvatarImage
                              src={normalizeAvatarUrl(leader.avatar)}
                              onError={handleAvatarError}
                            />
                            <AvatarFallback className="bg-slate-100 text-slate-700 font-semibold">
                              {leader.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                        </div>

                        {/* User Info */}
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <h4 className="truncate font-medium text-slate-900 leading-snug">
                              {leader.name}
                            </h4>

                            {leader.isCurrentUser && (
                              <Badge className="rounded-md bg-[#EF7B55]/60 hover:bg-[#EF7B55]/80 px-2 py-0.5 text-xs font-medium text-white">
                                You
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {getRankBadge(effectiveRank)}
                          </div>

                          <p className="truncate text-sm text-slate-500">
                            {leader.school}
                          </p>
                        </div>
                      </div>

                      {/* Right section */}
                      <div className="flex flex-col items-end justify-center text-right">
                        <span className="text-lg font-semibold text-slate-900">
                          {leader.points.toLocaleString()}
                        </span>

                        <span className="text-xs sm:text-sm text-slate-500">
                          {leader.streak} day streak • {leader.badges ?? 0}{" "}
                          badges
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {renderPagination("global")}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------- School Tab ---------------- */}
        <TabsContent value="school" className="space-y-4">
          <Card className={isAero
            ? "border border-slate-200/40 bg-white/50 backdrop-blur-md rounded-3xl shadow-lg"
            : "border border-slate-200 bg-white"
          }>
            <CardHeader className="space-y-1 px-4 sm:px-6">
              <CardTitle className="text-lg sm:text-xl font-semibold text-slate-900">
                School Leaderboard
              </CardTitle>
              <CardDescription className="text-sm text-slate-500">
                Top performers in your school
              </CardDescription>
            </CardHeader>

            <CardContent className="px-4 sm:px-6">
              <div className="space-y-3">
                {getPaginatedItems(
                  leaderboardData.school,
                  currentPage.school
                ).map((leader) => {
                  const effectiveRank = hasPoints(leader.points)
                    ? leader.rank
                    : null;
                  const highlightCurrentUser =
                    leader.isCurrentUser && hasPoints(leader.points);

                  return (
                    <div
                      key={`${leader.rank}-${leader.name}`}
                      className={isAero
                        ? `flex flex-col gap-3 rounded-2xl border p-4 transition ${
                            highlightCurrentUser
                              ? "border-[#EF7B55] bg-orange-500/5 shadow-md shadow-orange-50/20"
                              : "border-slate-200/30 bg-white/40 hover:bg-white/60"
                          } sm:flex-row sm:items-center sm:justify-between`
                        : `flex flex-col gap-3 rounded-md border p-4 transition ${
                            highlightCurrentUser
                              ? "border-[#EF7B55] bg-[#FFF4F1]/30"
                              : "border-slate-200 bg-white"
                          } sm:flex-row sm:items-center sm:justify-between`
                      }>
                      {/* Left section */}
                      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                        {/* Rank + Avatar */}
                        <div className="flex flex-shrink-0 items-center gap-3 sm:gap-4">
                          <div className="flex w-8 justify-center text-slate-400">
                            {getRankIcon(effectiveRank)}
                          </div>

                          <Avatar className="h-10 w-10 shrink-0">
                            <AvatarImage
                              src={normalizeAvatarUrl(leader.avatar)}
                              onError={handleAvatarError}
                            />
                            <AvatarFallback className="bg-slate-100 text-slate-700 font-semibold">
                              {leader.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                        </div>

                        {/* User Info */}
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <h4 className="truncate font-medium text-slate-900 leading-snug">
                              {leader.name}
                            </h4>

                            {leader.isCurrentUser && (
                              <Badge className="rounded-md bg-[#EF7B55]/60 hover:bg-[#EF7B55]/80 px-2 py-0.5 text-xs font-medium text-white">
                                You
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {getRankBadge(effectiveRank)}
                          </div>
                        </div>
                      </div>

                      {/* Right section */}
                      <div className="flex flex-col items-end justify-center text-right">
                        <span className="text-lg font-semibold text-slate-900">
                          {leader.points.toLocaleString()}
                        </span>

                        <span className="text-xs sm:text-sm text-slate-500">
                          {leader.streak} day streak • {leader.badges ?? 0}{" "}
                          badges
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {renderPagination("school")}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------- Weekly Tab ---------------- */}
        <TabsContent value="weekly" className="space-y-4">
          <Card className={isAero
            ? "border border-slate-200/40 bg-white/50 backdrop-blur-md rounded-3xl shadow-lg"
            : "border border-slate-200 bg-white"
          }>
            <CardHeader className="space-y-1 px-4 sm:px-6">
              <CardTitle className="text-lg sm:text-xl font-semibold text-slate-900">
                Weekly Leaderboard
              </CardTitle>
              <CardDescription className="text-sm text-slate-500">
                Top performers this week
              </CardDescription>
            </CardHeader>

            <CardContent className="px-4 sm:px-6">
              <div className="space-y-3">
                {getPaginatedItems(
                  leaderboardData.weekly,
                  currentPage.weekly
                ).map((leader) => {
                  const effectiveRank = hasPoints(leader.points)
                    ? leader.rank
                    : null;
                  const highlightCurrentUser =
                    leader.isCurrentUser && hasPoints(leader.points);

                  return (
                    <div
                      key={`${leader.rank}-${leader.name}`}
                      className={isAero
                        ? `flex flex-col gap-3 rounded-2xl border p-4 transition ${
                            highlightCurrentUser
                              ? "border-[#EF7B55] bg-orange-500/5 shadow-md shadow-orange-50/20"
                              : "border-slate-200/30 bg-white/40 hover:bg-white/60"
                          } sm:flex-row sm:items-center sm:justify-between`
                        : `flex flex-col gap-3 rounded-md border p-4 transition ${
                            highlightCurrentUser
                              ? "border-[#EF7B55] bg-[#FFF4F1]/30"
                              : "border-slate-200 bg-white"
                          } sm:flex-row sm:items-center sm:justify-between`
                      }>
                      {/* Left section */}
                      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                        {/* Rank + Avatar */}
                        <div className="flex flex-shrink-0 items-center gap-3 sm:gap-4">
                          <div className="flex w-8 justify-center text-slate-400">
                            {getRankIcon(effectiveRank)}
                          </div>

                          <Avatar className="h-10 w-10 shrink-0">
                            <AvatarImage
                              src={normalizeAvatarUrl(leader.avatar)}
                              onError={handleAvatarError}
                            />
                            <AvatarFallback className="bg-slate-100 text-slate-700 font-semibold">
                              {leader.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                        </div>

                        {/* User Info */}
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <h4 className="truncate font-medium text-slate-900 leading-snug">
                              {leader.name}
                            </h4>

                            {leader.isCurrentUser && (
                              <Badge className="rounded-md bg-[#EF7B55]/60 hover:bg-[#EF7B55]/80 px-2 py-0.5 text-xs font-medium text-white">
                                You
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {getRankBadge(effectiveRank)}
                          </div>
                        </div>
                      </div>

                      {/* Right section */}
                      <div className="flex flex-col items-end justify-center text-right">
                        <span className="text-lg font-semibold text-slate-900">
                          {leader.points.toLocaleString()}
                        </span>

                        <span className="text-xs sm:text-sm text-slate-500 font-semibold">
                          points this week
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {renderPagination("weekly")}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

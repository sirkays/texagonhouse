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
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Trophy, Star, Zap, Loader2} from "lucide-react";
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
import {cn} from "@/lib/utils";

interface BadgeDTO {
  id: number;
  name: string;
  icon: string; // Badge.icon_name
  color: string; // Badge.color (Tailwind class)
  pointsThreshold: number; // Badge.points
  earned: boolean;
  earnedAt?: string | null;
  reason?: string;
}

interface AchievementDTO {
  code: string; // AchievementDefinition.code
  title: string;
  description?: string;
  icon: string; // AchievementDefinition.icon
  category: string; // AchievementDefinition.category
  points: number; // AchievementDefinition.points
  acquiredAt: string; // AchievementAcquired.acquired_at
  valueAtUnlock?: number; // AchievementAcquired.value_at_unlock
}

interface RecentPointDTO {
  reason: string;
  points: number;
  date: string;
  balanceAfter: number;
}

interface ChildDTO {
  id: number;
  name: string;
  avatar: string;
  totalPoints: number;
  currentStreak: number;
  badges: BadgeDTO[];
  achievements: AchievementDTO[];
  recentPoints: RecentPointDTO[];
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  school: string;
  points: number;
  isChild?: boolean;
}

type RewardsResponse = {
  children: ChildDTO[];
  leaderboard: LeaderboardEntry[];
};

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
  const [data, setData] = React.useState<RewardsResponse | null>(null);

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
            onClick={() => handleLeaderboardPageChange(i)}>
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
    <div className="space-y-8 max-w-7xl mx-auto p-1 sm:p-2">
      {/* Premium Gradient Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-[#e26d47] p-6 sm:p-8 text-white shadow-xl dark:shadow-none">
        <div className="absolute right-0 top-0 h-64 w-64 -translate-y-12 translate-x-12 rounded-full bg-[#EF7B55]/15 blur-3xl" />
        <div className="absolute left-1/3 bottom-0 h-40 w-40 translate-y-12 rounded-full bg-indigo-500/15 blur-3xl" />
        
        <div className="relative z-10 space-y-2 max-w-2xl">
          <Badge className="bg-[#EF7B55]/20 text-[#ffae91] border border-[#EF7B55]/30 hover:bg-[#EF7B55]/30 px-3 py-1 font-semibold text-xs tracking-wide">
            Gamification & Achievements
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-orange-100 bg-clip-text text-transparent">
            Rewards & Achievements
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
            Celebrate your children's hard work. Track unlocked badges, earned academic stars, active learning streaks, and their placement on the platform leaderboard.
          </p>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        {children.map((child) => (
          <Card
            key={child.id}
            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/60 shadow-xl shadow-slate-100/40 dark:shadow-none rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 group"
          >
            <CardHeader className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800/80 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#EF7B55] to-orange-500" />
              
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl border-2 border-slate-100 dark:border-slate-800 shrink-0 shadow-sm">
                  <AvatarImage src={child.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="bg-gradient-to-tr from-[#EF7B55]/10 to-orange-500/10 text-[#EF7B55] font-extrabold text-base rounded-2xl">
                    {child.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base sm:text-lg md:text-xl font-bold text-slate-850 dark:text-slate-100 truncate group-hover:text-[#EF7B55] transition-colors leading-tight">
                    {child.name}
                  </CardTitle>
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#EF7B55] mt-1 bg-orange-50 dark:bg-orange-950/20 px-2.5 py-0.5 rounded-lg w-fit">
                    <Trophy className="h-3.5 w-3.5" />
                    <span>{child.totalPoints.toLocaleString()} Points</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-5 p-5 sm:p-6">
              {/* Streak details */}
              <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-orange-50 to-orange-50/30 dark:from-orange-950/20 dark:to-orange-950/5 border border-orange-100 dark:border-orange-900/30 rounded-xl text-xs sm:text-sm shadow-sm">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold">
                  <Zap className="h-4 w-4 text-orange-500 animate-pulse" />
                  <span>Current Learning Streak</span>
                </div>
                <div className="font-extrabold text-orange-600 dark:text-orange-400 text-sm sm:text-base flex items-center gap-1">
                  <span>{child.currentStreak} Days</span>
                  <span>🔥</span>
                </div>
              </div>

              {/* Badges Grid */}
              <div className="space-y-2.5">
                <h4 className="font-bold text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Badges & Achievements
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {child.badges.map((badge, index) => (
                    <div
                      key={index}
                      className={cn(
                        "p-3 rounded-xl text-center border transition-all duration-300 space-y-1 group/badge relative overflow-hidden",
                        badge.earned
                          ? "bg-emerald-50/50 border-emerald-100 dark:bg-emerald-950/10 dark:border-emerald-900/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                          : "bg-slate-50/50 border-slate-100 dark:bg-slate-900/30 dark:border-slate-800 opacity-60 hover:opacity-80"
                      )}
                    >
                      <div className="text-xl sm:text-2xl filter drop-shadow-sm mb-1 transform group-hover/badge:scale-110 transition-transform">
                        {badgeIconMap[badge.icon] || <span className="text-base">🏅</span>}
                      </div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {badge.name}
                      </div>
                      {badge.earned && badge.earnedAt ? (
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                          Earned {badge.earnedAt}
                        </div>
                      ) : (
                        <div className="text-[9px] text-slate-450 dark:text-slate-500 font-semibold mt-1">
                          {badge.pointsThreshold} pts
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Unlocked Achievements list */}
              <div className="space-y-2.5">
                <h4 className="font-bold text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Unlocked Achievements
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
                  {(child.achievements ?? []).slice(0, 3).map((a) => (
                    <div
                      key={a.code}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800/60 bg-white/40 dark:bg-slate-950/20 hover:bg-slate-50/30 dark:hover:bg-slate-900/20 transition-all text-xs sm:text-sm gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-850 dark:text-slate-200 truncate">{a.title}</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-550 font-bold truncate uppercase mt-0.5">
                          {a.category} &bull; {a.acquiredAt}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30 font-bold text-xs px-2 py-0.5 rounded-full flex-shrink-0">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-450" />
                        <span>+{a.points}</span>
                      </div>
                    </div>
                  ))}
                  {(!child.achievements || child.achievements.length === 0) && (
                    <div className="text-xs text-slate-450 dark:text-slate-500 p-4 border border-dashed rounded-xl text-center font-semibold">
                      No achievements unlocked yet. Keep studying!
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Points List */}
              <div className="space-y-2.5">
                <h4 className="font-bold text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Recent Points Activity
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
                  {(child.recentPoints ?? []).slice(0, 3).map((p, idx) => (
                    <div
                      key={`${p.date}-${idx}`}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800/60 bg-white/40 dark:bg-slate-950/20 hover:bg-slate-50/30 dark:hover:bg-slate-900/20 transition-all text-xs sm:text-sm gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-850 dark:text-slate-200 truncate">{p.reason}</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-550 font-bold truncate mt-0.5">
                          {p.date} &bull; Balance: {p.balanceAfter.toLocaleString()}
                        </div>
                      </div>
                      <div className={cn(
                        "flex items-center gap-1 font-bold text-xs px-2 py-0.5 rounded-full flex-shrink-0 border",
                        p.points > 0 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30" 
                          : "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30"
                      )}>
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-450" />
                        <span>{p.points > 0 ? "+" : ""}{p.points}</span>
                      </div>
                    </div>
                  ))}
                  {(!child.recentPoints || child.recentPoints.length === 0) && (
                    <div className="text-xs text-slate-450 dark:text-slate-500 p-4 border border-dashed rounded-xl text-center font-semibold">
                      No recent point activity recorded.
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/60 shadow-xl shadow-slate-100/40 dark:shadow-none rounded-2xl overflow-hidden w-full">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/20 text-[#EF7B55]">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100">
                Platform Leaderboard
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Top performers across all schools this term.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5 sm:p-6">
          <div className="space-y-3">
            {paginatedLeaderboard.map((student) => (
              <div
                key={student.rank}
                className={cn(
                  "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border transition-all duration-300 relative overflow-hidden",
                  student.isChild
                    ? "bg-indigo-50/50 border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-900/30"
                    : "bg-white/40 border-slate-100 dark:bg-slate-950/10 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-900/20"
                )}
              >
                {student.isChild && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />
                )}
                
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className={cn(
                      "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-sm shadow-sm",
                      student.rank === 1 ? "bg-yellow-400 text-yellow-950 font-black" :
                      student.rank === 2 ? "bg-slate-300 text-slate-800" :
                      student.rank === 3 ? "bg-orange-400 text-orange-950 font-black" :
                      "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    )}
                  >
                    {student.rank}
                  </div>
                  <div className="min-w-0">
                    <div
                      className={cn(
                        "font-bold text-sm sm:text-base text-slate-850 dark:text-slate-200 truncate",
                        student.isChild ? "text-indigo-700 dark:text-indigo-400 font-extrabold" : ""
                      )}
                    >
                      {student.name}
                    </div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 font-semibold truncate mt-0.5">
                      {student.school}
                    </div>
                  </div>
                  
                  {student.isChild && (
                    <Badge className="bg-indigo-100 hover:bg-indigo-100 text-indigo-800 border-none text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ml-2">
                      Your Child
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-[#EF7B55] bg-orange-50 dark:bg-orange-950/20 px-2.5 py-1 rounded-lg w-fit flex-shrink-0">
                  <Trophy className="h-4 w-4" />
                  <span>{student.points.toLocaleString()} Points</span>
                </div>
              </div>
            ))}
          </div>

          {totalLeaderboardPages > 1 && (
            <Pagination className="mt-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handleLeaderboardPageChange(leaderboardPage - 1)}
                    className={cn(
                      "hover:bg-slate-105 dark:hover:bg-slate-800 rounded-lg font-bold border-slate-200 dark:border-slate-800",
                      leaderboardPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"
                    )}
                  />
                </PaginationItem>
                {renderLeaderboardPageNumbers()}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => handleLeaderboardPageChange(leaderboardPage + 1)}
                    className={cn(
                      "hover:bg-slate-105 dark:hover:bg-slate-800 rounded-lg font-bold border-slate-200 dark:border-slate-800",
                      leaderboardPage === totalLeaderboardPages ? "pointer-events-none opacity-50" : "cursor-pointer"
                    )}
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

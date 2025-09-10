"use client";

import {useState} from "react";
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
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export function Leaderboard() {
  const [currentPage, setCurrentPage] = useState({
    global: 1,
    school: 1,
    weekly: 1,
  });

  const itemsPerPage = 3;

  const globalLeaders = [
    {
      rank: 1,
      name: "Sarah Chen",
      school: "Tech High School",
      points: 15420,
      avatar: "/placeholder.svg?height=40&width=40",
      streak: 45,
      badges: 12,
    },
    {
      rank: 2,
      name: "Alex Rodriguez",
      school: "Innovation Academy",
      points: 14890,
      avatar: "/placeholder.svg?height=40&width=40",
      streak: 38,
      badges: 11,
    },
    {
      rank: 3,
      name: "Emma Thompson",
      school: "Future Leaders School",
      points: 14250,
      avatar: "/placeholder.svg?height=40&width=40",
      streak: 42,
      badges: 10,
    },
    {
      rank: 4,
      name: "John Doe",
      school: "Your School",
      points: 7500,
      avatar: "/placeholder.svg?height=40&width=40",
      streak: 15,
      badges: 3,
      isCurrentUser: true,
    },
    {
      rank: 5,
      name: "Maria Garcia",
      school: "Excellence Institute",
      points: 13100,
      avatar: "/placeholder.svg?height=40&width=40",
      streak: 28,
      badges: 9,
    },
  ];

  const schoolLeaders = [
    {
      rank: 1,
      name: "John Doe",
      points: 7500,
      avatar: "/placeholder.svg?height=40&width=40",
      streak: 15,
      badges: 3,
      isCurrentUser: true,
    },
    {
      rank: 2,
      name: "Lisa Wang",
      points: 6800,
      avatar: "/placeholder.svg?height=40&width=40",
      streak: 22,
      badges: 5,
    },
    {
      rank: 3,
      name: "Mike Johnson",
      points: 6200,
      avatar: "/placeholder.svg?height=40&width=40",
      streak: 18,
      badges: 4,
    },
    {
      rank: 4,
      name: "Anna Smith",
      points: 5900,
      avatar: "/placeholder.svg?height=40&width=40",
      streak: 12,
      badges: 3,
    },
    {
      rank: 5,
      name: "David Lee",
      points: 5400,
      avatar: "/placeholder.svg?height=40&width=40",
      streak: 25,
      badges: 6,
    },
  ];

  const weeklyLeaders = [
    {
      rank: 1,
      name: "John Doe",
      points: 450,
      avatar: "/placeholder.svg?height=40&width=40",
      streak: 7,
      isCurrentUser: true,
    },
    {
      rank: 2,
      name: "Lisa Wang",
      points: 380,
      avatar: "/placeholder.svg?height=40&width=40",
      streak: 6,
    },
    {
      rank: 3,
      name: "Mike Johnson",
      points: 320,
      avatar: "/placeholder.svg?height=40&width=40",
      streak: 5,
    },
  ];

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

  const getPaginatedItems = (items: any[], page: number) => {
    const startIndex = (page - 1) * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  };

  const getTotalPages = (items: any[]) => {
    return Math.ceil(items.length / itemsPerPage);
  };

  const renderPagination = (tab: keyof typeof currentPage) => {
    const items =
      tab === "global"
        ? globalLeaders
        : tab === "school"
        ? schoolLeaders
        : weeklyLeaders;
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
            <div className="text-2xl font-bold">#4</div>
            <p className="text-xs text-muted-foreground">↑2 from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">School Rank</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#1</div>
            <p className="text-xs text-muted-foreground">Top of your school!</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7,500</div>
            <p className="text-xs text-muted-foreground">+450 this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Competitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,847</div>
            <p className="text-xs text-muted-foreground">Active learners</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="global" className="space-y-4 ">
        <TabsList className="bg-[#f797712e] text-slate-700 flex flex-col lg:flex-row w-full gap-2 mb-14">
          <TabsTrigger
            value="global"
            className="bg-transparent w-full sm:w-32 justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3">
            Global
          </TabsTrigger>
          <TabsTrigger
            value="school"
            className="bg-transparent w-full sm:w-32 justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3">
            My School
          </TabsTrigger>
          <TabsTrigger
            value="weekly"
            className="bg-transparent w-full sm:w-32 justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3">
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
                {getPaginatedItems(globalLeaders, currentPage.global).map(
                  (leader) => (
                    <div
                      key={leader.rank}
                      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg border ${
                        leader.isCurrentUser
                          ? "bg-blue-50 border-blue-200"
                          : "bg-white"
                      }`}>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8">
                          {getRankIcon(leader.rank)}
                        </div>
                        <Avatar>
                          <AvatarImage
                            src={leader.avatar || "/placeholder.svg"}
                          />
                          <AvatarFallback>
                            {leader.name
                              .split(" ")
                              .map((n: any) => n[0])
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
                  )
                )}
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
                {getPaginatedItems(schoolLeaders, currentPage.school).map(
                  (leader) => (
                    <div
                      key={leader.rank}
                      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-lg border ${
                        leader.isCurrentUser
                          ? "bg-blue-50 border-blue-200"
                          : "bg-white"
                      }`}>
                      <div className="flex items-center gap-3 sm:gap-4 flex-1">
                        <div className="flex items-center justify-center w-8 shrink-0">
                          {getRankIcon(leader.rank)}
                        </div>
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={leader.avatar || "/placeholder.svg"}
                          />
                          <AvatarFallback>
                            {leader.name
                              .split(" ")
                              .map((n: any) => n[0])
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
                  )
                )}
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
                {getPaginatedItems(weeklyLeaders, currentPage.weekly).map(
                  (leader) => (
                    <div
                      key={leader.rank}
                      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-lg border ${
                        leader.isCurrentUser
                          ? "bg-blue-50 border-blue-200"
                          : "bg-white"
                      }`}>
                      <div className="flex items-center gap-3 sm:gap-4 flex-1">
                        <div className="flex items-center justify-center w-8 shrink-0">
                          {getRankIcon(leader.rank)}
                        </div>
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={leader.avatar || "/placeholder.svg"}
                          />
                          <AvatarFallback>
                            {leader.name
                              .split(" ")
                              .map((n: any) => n[0])
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
                  )
                )}
              </div>
              {renderPagination("weekly")}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

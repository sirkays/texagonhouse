"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Medal, Crown, Star, TrendingUp, Users, School } from "lucide-react"

export function Leaderboard() {
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
  ]

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
  ]

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
  ]

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Trophy className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>
    }
  }

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <Badge className="bg-yellow-100 text-yellow-700">🥇 Champion</Badge>
      case 2:
        return <Badge className="bg-gray-100 text-gray-700">🥈 Runner-up</Badge>
      case 3:
        return <Badge className="bg-amber-100 text-amber-700">🥉 Third Place</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Leaderboard</h1>
        <p className="text-muted-foreground">See how you rank against other learners</p>
      </div>

      {/* Current User Stats */}
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

      <Tabs defaultValue="global" className="space-y-4">
        <TabsList>
          <TabsTrigger value="global">Global</TabsTrigger>
          <TabsTrigger value="school">My School</TabsTrigger>
          <TabsTrigger value="weekly">This Week</TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Global Leaderboard</CardTitle>
              <CardDescription>Top performers across all schools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {globalLeaders.map((leader) => (
                  <div
                    key={leader.rank}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      leader.isCurrentUser ? "bg-blue-50 border-blue-200" : "bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8">{getRankIcon(leader.rank)}</div>
                      <Avatar>
                        <AvatarImage src={leader.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {leader.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{leader.name}</h4>
                          {leader.isCurrentUser && <Badge variant="secondary">You</Badge>}
                          {getRankBadge(leader.rank)}
                        </div>
                        <p className="text-sm text-muted-foreground">{leader.school}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{leader.points.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">
                        {leader.streak} day streak • {leader.badges} badges
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
                {schoolLeaders.map((leader) => (
                  <div
                    key={leader.rank}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      leader.isCurrentUser ? "bg-blue-50 border-blue-200" : "bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8">{getRankIcon(leader.rank)}</div>
                      <Avatar>
                        <AvatarImage src={leader.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {leader.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{leader.name}</h4>
                          {leader.isCurrentUser && <Badge variant="secondary">You</Badge>}
                          {getRankBadge(leader.rank)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{leader.points.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">
                        {leader.streak} day streak • {leader.badges} badges
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
                {weeklyLeaders.map((leader) => (
                  <div
                    key={leader.rank}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      leader.isCurrentUser ? "bg-blue-50 border-blue-200" : "bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8">{getRankIcon(leader.rank)}</div>
                      <Avatar>
                        <AvatarImage src={leader.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {leader.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{leader.name}</h4>
                          {leader.isCurrentUser && <Badge variant="secondary">You</Badge>}
                          {getRankBadge(leader.rank)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{leader.points}</div>
                      <div className="text-sm text-muted-foreground">points this week</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

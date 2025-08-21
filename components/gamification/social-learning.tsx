"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, MessageCircle, Heart, Share2, Trophy, Star } from "lucide-react"

export function SocialLearning() {
  const studyGroups = [
    {
      id: 1,
      name: "React Masters",
      members: 24,
      activity: "High",
      subject: "Web Development",
      recentPost: "Discussion on React Hooks best practices",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      name: "Python Pythons",
      members: 18,
      activity: "Medium",
      subject: "Programming",
      recentPost: "Sharing data science project solutions",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  const achievements = [
    {
      id: 1,
      user: "Sarah Chen",
      achievement: "Completed Advanced JavaScript Course",
      points: 500,
      time: "2 hours ago",
      likes: 12,
      comments: 3,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      user: "Mike Johnson",
      achievement: "30-Day Learning Streak",
      points: 300,
      time: "4 hours ago",
      likes: 8,
      comments: 1,
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  const challenges = [
    {
      id: 1,
      title: "Code Challenge: Build a Calculator",
      participants: 156,
      timeLeft: "3 days",
      difficulty: "Intermediate",
      prize: "500 points + Badge",
      status: "Active",
    },
    {
      id: 2,
      title: "Math Quiz Marathon",
      participants: 89,
      timeLeft: "1 week",
      difficulty: "Beginner",
      prize: "300 points",
      status: "Upcoming",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Social Learning Hub</h1>
        <p className="text-muted-foreground">Connect, compete, and learn together with peers</p>
      </div>

      <Tabs defaultValue="feed" className="space-y-4">
        <TabsList>
          <TabsTrigger value="feed">Activity Feed</TabsTrigger>
          <TabsTrigger value="groups">Study Groups</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="space-y-4">
          <div className="grid gap-4">
            {achievements.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Avatar>
                      <AvatarImage src={item.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {item.user
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.user}</span>
                        <Badge className="bg-yellow-100 text-yellow-700">
                          <Trophy className="h-3 w-3 mr-1" />+{item.points} pts
                        </Badge>
                      </div>
                      <p className="text-sm">{item.achievement}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{item.time}</span>
                        <Button variant="ghost" size="sm" className="h-auto p-0">
                          <Heart className="h-4 w-4 mr-1" />
                          {item.likes}
                        </Button>
                        <Button variant="ghost" size="sm" className="h-auto p-0">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          {item.comments}
                        </Button>
                        <Button variant="ghost" size="sm" className="h-auto p-0">
                          <Share2 className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {studyGroups.map((group) => (
              <Card key={group.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={group.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{group.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{group.name}</CardTitle>
                        <CardDescription>{group.subject}</CardDescription>
                      </div>
                    </div>
                    <Badge variant={group.activity === "High" ? "default" : "secondary"}>{group.activity}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {group.members} members
                    </div>
                    <p className="text-sm">{group.recentPost}</p>
                    <Button className="w-full">Join Group</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-4">
          <div className="grid gap-4">
            {challenges.map((challenge) => (
              <Card key={challenge.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{challenge.title}</CardTitle>
                    <Badge variant={challenge.status === "Active" ? "default" : "secondary"}>{challenge.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4" />
                        {challenge.participants} participants
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Star className="h-4 w-4" />
                        {challenge.difficulty}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Trophy className="h-4 w-4" />
                        {challenge.prize}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Time left: {challenge.timeLeft}</p>
                      <Button className="w-full">
                        {challenge.status === "Active" ? "Join Challenge" : "Get Notified"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

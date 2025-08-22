"use client";

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

export function RewardsTracking() {
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
        return <Badge className="bg-green-100 text-green-800">Available</Badge>;
      case "In Progress":
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case "On Track":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">On Track</Badge>
        );
      case "Achieved":
        return (
          <Badge className="bg-purple-100 text-purple-800">Achieved</Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Rewards & Achievements</h1>
        <p className="text-muted-foreground">
          Track your children's progress and celebrate their achievements
        </p>
      </div>

      {/* Children Overview */}
      <div className="grid gap-6 lg:grid-cols-2">
        {children.map((child) => (
          <Card
            key={child.id}
            className="hover:shadow-md transition-shadow w-full max-w-full overflow-hidden">
            <CardHeader>
              <div className="flex items-center space-x-4 overflow-hidden">
                <Avatar className="h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0">
                  <AvatarImage src={child.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-base sm:text-lg">
                    {child.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg sm:text-xl truncate">
                    {child.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge className={getLevelColor(child.level)}>
                      {child.level}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                      <Trophy className="h-3 w-3" />
                      {child.totalPoints} points
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
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
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg text-sm sm:text-base">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-orange-500" />
                  <span className="font-medium">Current Streak</span>
                </div>
                <div className="text-base sm:text-lg font-bold text-orange-600">
                  {child.currentStreak} days
                </div>
              </div>

              {/* Badges */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Badges & Achievements</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {child.badges.map((badge, index) => (
                    <div
                      key={index}
                      className={`p-2 border rounded-lg text-center ${
                        badge.earned
                          ? "bg-green-50 border-green-200"
                          : "bg-gray-50 border-gray-200"
                      }`}>
                      <div className="text-lg mb-1">{badge.icon}</div>
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
                <h4 className="font-semibold text-sm">Recent Achievements</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-hide">
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
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">
            Platform Leaderboard
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Top performers across all schools this term
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {leaderboard.map((student) => (
              <div
                key={student.rank}
                className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-lg overflow-hidden ${
                  student.isChild
                    ? "bg-blue-50 border border-blue-200"
                    : "bg-muted"
                }`}>
                {/* Left side: Rank + Name */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm ${
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
                      className={`font-medium truncate ${
                        student.isChild ? "text-blue-700" : ""
                      }`}>
                      {student.name}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground truncate">
                      {student.school}
                    </div>
                  </div>

                  {student.isChild && (
                    <Badge className="bg-blue-100 text-blue-800 text-[10px] sm:text-xs whitespace-nowrap">
                      Your Child
                    </Badge>
                  )}
                </div>

                {/* Right side: Points */}
                <div className="flex items-center gap-1 font-medium text-sm sm:text-base flex-shrink-0">
                  <Trophy className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                  <span className="truncate">
                    {student.points.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Rewards */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg md:text-xl">
            Upcoming Rewards
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm md:text-base">
            Major prizes and incentives your children can earn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingRewards.map((reward, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg space-y-3 bg-background">
                {/* Top Row: Title + Badge */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="space-y-1 flex-1 min-w-0">
                    <h4 className="font-semibold flex items-center gap-2 text-sm sm:text-base">
                      <Gift className="h-4 w-4 text-purple-600 flex-shrink-0" />
                      <span className="truncate">{reward.title}</span>
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {reward.description}
                    </p>

                    {/* Requirement + Deadline */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
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

                  {/* Status Badge (floats right on large, stacks on small) */}
                  <div className="flex-shrink-0">
                    {getRewardStatusBadge(reward.status)}
                  </div>
                </div>

                {/* Eligible Children */}
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

                        {/* Ranking Badge */}
                        {reward.currentRanking && (
                          <Badge
                            variant="outline"
                            className="text-[10px] sm:text-xs whitespace-nowrap">
                            {childName === "John Adebayo"
                              ? `Rank #${reward.currentRanking.john}`
                              : `Rank #${reward.currentRanking.mary}`}
                          </Badge>
                        )}

                        {/* Average Badge */}
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
        </CardContent>
      </Card>

      {/* Reward History */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg md:text-xl">
            Reward History
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm md:text-base">
            Previously earned rewards and achievements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Example History Item */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border rounded-lg bg-background">
              {/* Left: Icon + Info */}
              <div className="flex items-start sm:items-center gap-3 min-w-0">
                <div className="p-2 bg-green-100 rounded-full flex-shrink-0">
                  <Award className="h-4 w-4 text-green-600" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-medium text-sm sm:text-base truncate">
                    Term 1 Excellence Award
                  </h4>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">
                    Mary Adebayo • December 2023
                  </p>
                </div>
              </div>

              {/* Right: Badge */}
              <Badge className="bg-green-100 text-green-800 flex items-center gap-1 flex-shrink-0 text-xs sm:text-sm whitespace-nowrap">
                <CheckCircle className="w-3 h-3" />
                Received
              </Badge>
            </div>

            {/* Example History Item */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border rounded-lg bg-background">
              <div className="flex items-start sm:items-center gap-3 min-w-0">
                <div className="p-2 bg-blue-100 rounded-full flex-shrink-0">
                  <Trophy className="h-4 w-4 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-medium text-sm sm:text-base truncate">
                    Mathematics Competition Winner
                  </h4>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">
                    John Adebayo • November 2023
                  </p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800 flex items-center gap-1 flex-shrink-0 text-xs sm:text-sm whitespace-nowrap">
                <CheckCircle className="w-3 h-3" />
                Received
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Progress} from "@/components/ui/progress";
import {Badge} from "@/components/ui/badge";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {
  Play,
  Video,
  Headphones,
  BookOpen,
  FileText,
  Clock,
  Users,
  Star,
  CheckCircle,
} from "lucide-react";

export function LearningModules() {
  const modules = {
    videos: [
      {
        title: "React Hooks Masterclass",
        instructor: "Sarah Wilson",
        duration: "4h 30m",
        lessons: 24,
        progress: 65,
        rating: 4.8,
        students: 12500,
        level: "Intermediate",
        completed: false,
      },
      {
        title: "Python for Beginners",
        instructor: "John Martinez",
        duration: "6h 15m",
        lessons: 32,
        progress: 100,
        rating: 4.9,
        students: 25600,
        level: "Beginner",
        completed: true,
      },
      {
        title: "Advanced JavaScript Concepts",
        instructor: "Emily Chen",
        duration: "5h 45m",
        lessons: 28,
        progress: 30,
        rating: 4.7,
        students: 8900,
        level: "Advanced",
        completed: false,
      },
    ],
    audio: [
      {
        title: "Tech Career Podcast Series",
        host: "Industry Experts",
        episodes: 15,
        duration: "12h total",
        progress: 40,
        rating: 4.6,
        listeners: 5600,
        category: "Career Development",
      },
      {
        title: "JavaScript Deep Dive Audio Course",
        host: "Dev Academy",
        episodes: 20,
        duration: "8h 30m",
        progress: 75,
        rating: 4.8,
        listeners: 3400,
        category: "Programming",
      },
    ],
    tutorials: [
      {
        title: "Build a Full-Stack E-commerce App",
        type: "Project Tutorial",
        steps: 12,
        duration: "8h",
        difficulty: "Advanced",
        technologies: ["React", "Node.js", "MongoDB"],
        sessionCategory: "Private",
        isActive: true,
      },
      {
        title: "Create a REST API with Express",
        type: "Step-by-step Guide",
        steps: 8,
        duration: "3h",
        difficulty: "Intermediate",
        technologies: ["Node.js", "Express", "PostgreSQL"],
        sessionCategory: "General",
        isActive: false,
      },
    ],
    journals: [
      {
        title: "Weekly Web Development Digest",
        type: "Industry Newsletter",
        issues: 52,
        readTime: "5 min each",
        subscribed: true,
        category: "News & Updates",
      },
      {
        title: "Research Papers in AI",
        type: "Academic Journal",
        papers: 25,
        readTime: "20 min avg",
        subscribed: false,
        category: "Research",
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Learning Modules</h1>
        <p className="text-muted-foreground">
          Structured learning paths with videos, audio, tutorials, and journals
        </p>
      </div>

      <Tabs defaultValue="videos" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="videos" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Video
          </TabsTrigger>
          <TabsTrigger value="audio" className="flex items-center gap-2">
            <Headphones className="h-4 w-4" />
            Audio
          </TabsTrigger>
          <TabsTrigger value="tutorials" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Live Session
          </TabsTrigger>
          <TabsTrigger value="journals" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Journals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="videos" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {modules.videos.map((course, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-shadow flex flex-col h-full">
                {/* Header */}
                <CardHeader className="p-0">
                  <div className="aspect-video bg-muted rounded-md mb-3 flex items-center justify-center relative">
                    <Video className="h-8 w-8 text-muted-foreground" />

                    {course.completed && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                    )}

                    <div className="absolute bottom-2 right-2">
                      <Badge variant="secondary" className="text-xs">
                        {course.progress > 0 ? "In Progress" : "Available"}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2 px-6">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={
                          course.level === "Beginner"
                            ? "default"
                            : course.level === "Intermediate"
                            ? "secondary"
                            : "destructive"
                        }>
                        {course.level}
                      </Badge>

                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {course.rating}
                      </div>
                    </div>

                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <CardDescription>by {course.instructor}</CardDescription>
                  </div>
                </CardHeader>

                {/* Body + Footer */}
                <CardContent className="flex flex-col flex-1 space-y-4">
                  {/* Body */}
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {course.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <Play className="h-3 w-3" />
                      {course.lessons} lessons
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {course.students.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      {Math.floor(course.lessons * 0.3)} quizzes
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>

                  {/* Footer — pinned button */}
                  <div className="mt-auto">
                    <Button className="w-full">
                      {course.completed ? (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Review Course
                        </>
                      ) : course.progress > 0 ? (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Continue Learning
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Start Course
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="audio" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {modules.audio.map((course, index) => (
              <Card
                key={index}
                className="flex flex-col min-h-[250px] max-h-[300px] hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                      <Headphones className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <CardDescription>by {course.host}</CardDescription>
                      <Badge variant="outline">{course.category}</Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex flex-col justify-between flex-1 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>{course.episodes} episodes</div>
                    <div>{course.duration}</div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {course.rating}
                    </div>
                    <div>{course.listeners} listeners</div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>

                  <Button className="w-full mt-auto">
                    <Headphones className="mr-2 h-4 w-4" />
                    {course.progress > 0
                      ? "Continue Listening"
                      : "Start Listening"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tutorials" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {modules.tutorials.map((tutorial, index) => (
              <Card
                key={index}
                className="flex flex-col min-h-[250px] max-h-[300px] hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline">{tutorial.type}</Badge>
                      <Badge
                        variant={
                          tutorial.difficulty === "Beginner"
                            ? "default"
                            : tutorial.difficulty === "Intermediate"
                            ? "secondary"
                            : "destructive"
                        }>
                        {tutorial.difficulty}
                      </Badge>

                      <Badge variant="outline">
                        {/* {tutorial.sessionCategory} */}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{tutorial.title}</CardTitle>
                  </div>
                </CardHeader>

                <CardContent className="flex flex-col justify-between flex-1 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>{tutorial.steps} steps</div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {tutorial.duration}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm font-medium">Technologies:</span>
                    <div className="flex gap-2 flex-wrap">
                      {tutorial.technologies.map((tech, techIndex) => (
                        <Badge
                          key={techIndex}
                          variant="secondary"
                          className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full mt-auto">
                    {tutorial.isActive ? (
                      "Join Session"
                    ) : (
                      <div>01-12-2025 / 10:00 AM</div>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="journals" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {modules.journals.map((journal, index) => (
              <Card
                key={index}
                className="flex flex-col min-h-[250px] max-h-[300px] hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{journal.type}</Badge>
                      {journal.subscribed && (
                        <Badge variant="default">Subscribed</Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{journal.title}</CardTitle>
                    <CardDescription>{journal.category}</CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="flex flex-col justify-between flex-1 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>
                      {journal.issues || journal.papers}{" "}
                      {journal.issues ? "issues" : "papers"}
                    </div>
                    <div>{journal.readTime}</div>
                  </div>

                  <Button
                    className="w-full mt-auto"
                    variant={journal.subscribed ? "secondary" : "default"}>
                    <FileText className="mr-2 h-4 w-4" />
                    {journal.subscribed ? "Read Latest" : "Subscribe"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Learning Path Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Learning Paths</CardTitle>
          <CardDescription>
            Curated sequences of modules for structured learning
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Full-Stack Web Developer",
                modules: 8,
                duration: "12 weeks",
                level: "Beginner to Advanced",
                technologies: ["HTML/CSS", "JavaScript", "React", "Node.js"],
              },
              {
                title: "Data Science with Python",
                modules: 6,
                duration: "10 weeks",
                level: "Intermediate",
                technologies: ["Python", "Pandas", "NumPy", "Matplotlib"],
              },
              {
                title: "Mobile App Development",
                modules: 7,
                duration: "14 weeks",
                level: "Intermediate",
                technologies: ["React Native", "Flutter", "Firebase"],
              },
            ].map((path, index) => (
              <Card
                key={index}
                className="border-dashed flex flex-col min-h-[250px] max-h-[300px] hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-base">{path.title}</CardTitle>
                  <CardDescription>{path.level}</CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col flex-1 justify-between space-y-3">
                  <div className="text-sm text-muted-foreground">
                    {path.modules} modules • {path.duration}
                  </div>

                  <div className="flex gap-1 flex-wrap">
                    {path.technologies.map((tech, techIndex) => (
                      <Badge
                        key={techIndex}
                        variant="outline"
                        className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>

                  <Button size="sm" className="w-full mt-auto">
                    Start Learning Path
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

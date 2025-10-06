import DashboardLayout from "@/app/admin/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Input} from "@/components/ui/input";
import {
  Plus,
  Search,
  Video,
  FileText,
  Headphones,
  LinkIcon,
  Play,
} from "lucide-react";

export default function LessonsPage() {
  const lessons = [
    {
      id: 1,
      name: "Introduction to Limits",
      module: "Introduction to Calculus",
      order: 1,
      contentType: "video",
      duration: 1800,
      active: true,
    },
    {
      id: 2,
      name: "Calculating Derivatives",
      module: "Derivatives and Applications",
      order: 1,
      contentType: "video",
      duration: 2400,
      active: true,
    },
    {
      id: 3,
      name: "Quantum States Reading",
      module: "Quantum Mechanics Basics",
      order: 2,
      contentType: "pdf",
      duration: 1200,
      active: true,
    },
    {
      id: 4,
      name: "Wave Functions Explained",
      module: "Wave-Particle Duality",
      order: 1,
      contentType: "video",
      duration: 2100,
      active: true,
    },
    {
      id: 5,
      name: "Organic Chemistry Podcast",
      module: "Organic Compounds",
      order: 3,
      contentType: "audio",
      duration: 1500,
      active: true,
    },
    {
      id: 6,
      name: "React Hooks Tutorial",
      module: "React Fundamentals",
      order: 5,
      contentType: "video",
      duration: 3000,
      active: true,
    },
    {
      id: 7,
      name: "External Resources",
      module: "React Fundamentals",
      order: 6,
      contentType: "link",
      duration: 0,
      active: true,
    },
    {
      id: 8,
      name: "Study Guide PDF",
      module: "Introduction to Calculus",
      order: 8,
      contentType: "pdf",
      duration: 900,
      active: true,
    },
  ];

  const getContentIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-5 w-5" />;
      case "audio":
        return <Headphones className="h-5 w-5" />;
      case "pdf":
      case "doc":
        return <FileText className="h-5 w-5" />;
      case "link":
        return <LinkIcon className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getContentColor = (type: string) => {
    switch (type) {
      case "video":
        return "bg-primary/10 text-primary";
      case "audio":
        return "bg-accent/10 text-accent";
      case "pdf":
      case "doc":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
      case "link":
        return "bg-green-500/10 text-green-600 dark:text-green-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Lessons
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage individual lesson content
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Lesson
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search lessons..." className="pl-9" />
              </div>
              <Button variant="outline">Filter</Button>
            </div>
          </CardContent>
        </Card>

        {/* Lessons List */}
        <Card>
          <CardHeader>
            <CardTitle>All Lessons</CardTitle>
            <CardDescription>Browse and manage lesson content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className={`h-12 w-12 rounded-lg flex items-center justify-center ${getContentColor(
                        lesson.contentType
                      )}`}>
                      {getContentIcon(lesson.contentType)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">
                          {lesson.name}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          #{lesson.order}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {lesson.module}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <Badge variant="secondary" className="capitalize">
                        {lesson.contentType}
                      </Badge>
                      {lesson.duration > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDuration(lesson.duration)}
                        </p>
                      )}
                    </div>
                    <Button variant="outline" size="sm">
                      <Play className="mr-2 h-3 w-3" />
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

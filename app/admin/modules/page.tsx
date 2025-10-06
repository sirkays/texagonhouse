"use client";

import {useState} from "react";
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
import {Plus, Search, BookOpen, Clock} from "lucide-react";
import {LessonsModal} from "@/components/admin/modals/lessons-modal";

export default function ModulesPage() {
  const [viewingModule, setViewingModule] = useState<any>(null);

  const modules = [
    {
      id: 1,
      name: "Introduction to Calculus",
      course: "Advanced Mathematics",
      order: 1,
      difficulty: "BEGINNER",
      lessons: 8,
      duration: 240,
      category: "Core Concepts",
      active: true,
    },
    {
      id: 2,
      name: "Derivatives and Applications",
      course: "Advanced Mathematics",
      order: 2,
      difficulty: "INTERMEDIATE",
      lessons: 12,
      duration: 360,
      category: "Advanced Topics",
      active: true,
    },
    {
      id: 3,
      name: "Quantum Mechanics Basics",
      course: "Quantum Physics",
      order: 1,
      difficulty: "INTERMEDIATE",
      lessons: 10,
      duration: 300,
      category: "Fundamentals",
      active: true,
    },
    {
      id: 4,
      name: "Wave-Particle Duality",
      course: "Quantum Physics",
      order: 2,
      difficulty: "ADVANCED",
      lessons: 6,
      duration: 180,
      category: "Advanced Topics",
      active: true,
    },
    {
      id: 5,
      name: "Organic Compounds",
      course: "Organic Chemistry",
      order: 1,
      difficulty: "BEGINNER",
      lessons: 9,
      duration: 270,
      category: "Core Concepts",
      active: true,
    },
    {
      id: 6,
      name: "React Fundamentals",
      course: "Web Development",
      order: 3,
      difficulty: "INTERMEDIATE",
      lessons: 15,
      duration: 450,
      category: "Frontend",
      active: true,
    },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "BEGINNER":
        return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "INTERMEDIATE":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
      case "ADVANCED":
        return "bg-red-500/10 text-red-700 dark:text-red-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Modules
            </h1>
            <p className="text-muted-foreground mt-1">
              Organize course content into modules
            </p>
          </div>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search modules..." className="pl-9" />
              </div>
              <Button variant="outline">Search</Button>
            </div>
          </CardContent>
        </Card>

        {/* Modules Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <Card key={module.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="outline" className="text-xs">
                    Module {module.order}
                  </Badge>
                  <Badge className={getDifficultyColor(module.difficulty)}>
                    {module.difficulty}
                  </Badge>
                </div>
                <CardTitle className="text-lg leading-tight">
                  {module.name}
                </CardTitle>
                <CardDescription className="mt-2">
                  <span className="text-xs">{module.course}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {module.lessons} Lessons
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {module.category}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {module.duration} minutes
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Estimated duration
                      </p>
                    </div>
                  </div>
                  <Button
                    className="w-full mt-4 bg-transparent"
                    variant="outline"
                    onClick={() => setViewingModule(module)}>
                    View Lessons
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Lessons Modal */}
      <LessonsModal
        open={!!viewingModule}
        onOpenChange={(open) => !open && setViewingModule(null)}
        module={viewingModule}
      />
    </>
  );
}

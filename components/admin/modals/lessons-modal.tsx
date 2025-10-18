import {useState, useEffect} from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {
  Clock,
  PlayCircle,
  FileText,
  CheckCircle,
  Loader2,
  AlertCircle,
  BookOpen,
} from "lucide-react";

interface Lesson {
  id: number;
  title: string;
  duration: number;
  type: string;
  completed: boolean;
  order: number;
}

interface Module {
  id: number;
  name: string;
  order: number;
  difficulty: string;
  lessons: number;
}

interface LessonsApiResponse {
  module: Module;
  lessons: Lesson[];
}

interface LessonsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moduleId?: number;
  moduleName?: string;
}

export function LessonsModal({
  open,
  onOpenChange,
  moduleId,
  moduleName,
}: LessonsModalProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && moduleId) {
      fetchLessons(moduleId);
    } else {
      // Reset state when modal closes
      setLessons([]);
      setModule(null);
      setError(null);
    }
  }, [open, moduleId]);

  const fetchLessons = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/modules/lessons/${id}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `Failed to fetch lessons: ${response.status}`
        );
      }
      const data: LessonsApiResponse = await response.json();
      setModule(data.module);
      setLessons(data.lessons);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch lessons");
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <PlayCircle className="h-4 w-4 text-red-500" />;
      case "document":
        return <FileText className="h-4 w-4 text-blue-500" />;
      case "quiz":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "video":
        return "text-red-600 bg-red-50 border-red-200";
      case "document":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "quiz":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.ceil(seconds / 60);
    return minutes > 0 ? `${minutes} min` : "Not set";
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800";
      case "intermediate":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800";
      case "advanced":
        return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            {module?.name || moduleName || "Loading..."}
          </DialogTitle>
          <DialogDescription>
            {module && (
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="outline">Module {module.order}</Badge>
                <Badge className={getDifficultyColor(module.difficulty)}>
                  {module.difficulty}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {module.lessons} {module.lessons === 1 ? "lesson" : "lessons"}
                </span>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading lessons...</p>
              </div>
            </div>
          ) : error ? (
            <Alert variant="destructive" className="my-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : lessons.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No lessons found
              </h3>
              <p className="text-muted-foreground">
                This module doesn't have any lessons yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3 mt-2">
              {lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors group">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary font-semibold text-sm flex-shrink-0">
                      {lesson.order}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-foreground truncate">
                          {lesson.title}
                        </h4>
                        {lesson.completed && (
                          <Badge variant="default" className="text-xs">
                            Completed
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          {getTypeIcon(lesson.type)}
                          <Badge
                            variant="outline"
                            className={`text-xs capitalize ${getTypeColor(
                              lesson.type
                            )}`}>
                            {lesson.type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatDuration(lesson.duration)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

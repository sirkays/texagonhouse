import { Module } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Star, Video, Headphones, FileText, BookOpen } from "lucide-react";

interface PreviewModalProps {
  module: Module | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PreviewModal({ module, isOpen, onClose }: PreviewModalProps) {
  if (!module) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4 xs:h-5 xs:w-5" />;
      case "audio":
        return <Headphones className="h-4 w-4 xs:h-5 xs:w-5" />;
      case "document":
      case "pdf":
        return <FileText className="h-4 w-4 xs:h-5 xs:w-5" />;
      case "tutorial":
        return <BookOpen className="h-4 w-4 xs:h-5 xs:w-5" />;
      default:
        return <FileText className="h-4 w-4 xs:h-5 xs:w-5" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* Important: contain overflow and build our own sticky header/footer */}
      <DialogContent className="max-w-[90vw] sm:max-w-2xl max-h-[90vh] p-0 overflow-hidden">
        <div className="flex h-full max-h-[90vh] flex-col">
          {/* Sticky header */}
          <div className="sticky top-0 z-10 border-b bg-background px-6 py-4">
            <DialogHeader className="p-0">
              <DialogTitle className="text-lg xs:text-xl sm:text-2xl">
                {module.title} Preview
              </DialogTitle>
              <DialogDescription className="text-[0.85rem] xs:text-xs sm:text-sm">
                Preview the details and lessons of this module
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Main body – only this area can scroll its children */}
          <div className="flex-1 min-h-0 overflow-hidden px-6 py-4 space-y-6">
            {/* Module details (static) */}
            <div className="space-y-2">
              <h3 className="text-sm xs:text-base sm:text-lg font-semibold">Module Details</h3>
              <p className="text-[0.85rem] xs:text-xs sm:text-sm break-words">
                {module.description}
              </p>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-[0.85rem] xs:text-xs sm:text-sm">
                  {module.type.charAt(0).toUpperCase() + module.type.slice(1)}
                </Badge>
                <Badge variant="outline" className="text-[0.85rem] xs:text-xs sm:text-sm">
                  {module.difficulty}
                </Badge>
                <Badge variant="outline" className="text-[0.85rem] xs:text-xs sm:text-sm">
                  {module.category || "Uncategorized"}
                </Badge>
                <Badge variant="outline" className="text-[0.85rem] xs:text-xs sm:text-sm">
                  {module.course.name}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 xs:h-4 xs:w-4" />
                  {module.duration}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3 xs:h-4 xs:w-4" />
                  {module.enrollments} enrolled
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 xs:h-4 xs:w-4 fill-yellow-400 text-yellow-400" />
                  {module.rating}
                </div>
                <div>{module.createdDate}</div>
              </div>
            </div>

            {/* Lessons (scrolls independently) */}
            <div className="space-y-3 min-h-0">
              <h3 className="text-sm xs:text-base sm:text-lg font-semibold">Lessons</h3>

              {module.lessons.length === 0 ? (
                <p className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
                  No lessons available
                </p>
              ) : (
                <div
                  className="
                    space-y-2 overflow-y-auto pr-2
                    h-[36vh] xs:h-[42vh] sm:h-[50vh]
                    overscroll-contain
                  "
                >
                  {module.lessons.map((lesson, index) => (
                    <div key={lesson.id} className="p-2 xs:p-3 rounded-lg border bg-muted/50">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(lesson.type)}
                        <span className="text-[0.85rem] xs:text-xs sm:text-sm font-medium">
                          Lesson {index + 1}: {lesson.title || "Untitled"}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs capitalize"
                        >
                          {lesson.type}
                        </Badge>
                      </div>

                      <p className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs text-muted-foreground mt-1">
                        Duration: {lesson.duration || "N/A"}
                      </p>

                      {lesson.type === "video" && lesson.videoUrl && (
                        <p className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs text-muted-foreground break-all">
                          Video: {lesson.videoUrl}
                        </p>
                      )}
                      {lesson.type === "audio" && lesson.audioUrl && (
                        <p className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs text-muted-foreground break-all">
                          Audio: {lesson.audioUrl}
                        </p>
                      )}
                      {lesson.type === "text" && lesson.content && (
                        <p className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs text-muted-foreground line-clamp-2">
                          Content: {lesson.content}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sticky footer with the Close button always visible */}
          <div className="sticky bottom-0 z-10 border-t bg-background px-6 py-3">
            <DialogFooter className="p-0">
              <Button variant="outline" onClick={onClose} className="text-xs xs:text-sm sm:text-base">
                Close
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useMemo, useState } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import {
  Clock,
  Users,
  Star,
  Video,
  Headphones,
  FileText,
  BookOpen,
  Eye,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils";

type MediaUrlResponse = {
  url: string;
  expires_in?: number;
};

interface PreviewModalProps {
  module: Module | null;
  isOpen: boolean;
  onClose: () => void;

  // ✅ add this from TeacherLearningModules session
  sessionToken: string | null;

  // optional: if you want to push user to login on expiry
  onSessionExpired?: () => void;
}

export function PreviewModal({
  module,
  isOpen,
  onClose,
  sessionToken,
  onSessionExpired,
}: PreviewModalProps) {
  const [loadingLessonIds, setLoadingLessonIds] = useState<Set<number>>(new Set());

  const [player, setPlayer] = useState<{
    open: boolean;
    type: "video" | "audio";
    title: string;
    url: string;
  }>({ open: false, type: "video", title: "", url: "" });

  const withLessonLoading = (id: number, on: boolean) => {
    setLoadingLessonIds((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const isTempLessonId = (id: any) => {
    if (typeof id === "string" && id.startsWith("temp-")) return true;
    // if it's not a number-like id, it won't work with the endpoint
    if (typeof id === "string" && Number.isNaN(Number(id))) return true;
    return false;
  };

  const getNumericLessonId = (id: any): number | null => {
    if (typeof id === "number") return id;
    if (typeof id === "string" && !Number.isNaN(Number(id))) return Number(id);
    return null;
  };

  async function fetchLessonMediaUrl(lessonId: number): Promise<string> {
    if (!sessionToken) throw new Error("NO_SESSION");

    const res = await fetch(`/api/student/lesson-media-url/${lessonId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Session-Token": sessionToken,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      let j: any = {};
      try {
        j = await res.json();
      } catch {}
      if (res.status === 401 || res.status === 403) throw new Error("SESSION_EXPIRED");
      throw new Error(j?.detail || j?.error || "Failed to get media url");
    }

    const data = (await res.json()) as MediaUrlResponse;
    if (!data?.url) throw new Error("Media URL missing");
    return data.url;
  }

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

  const getLessonAction = (type: string) => {
    if (type === "video") return { label: "Play", icon: <Play className="h-4 w-4" /> };
    if (type === "audio") return { label: "Play", icon: <Play className="h-4 w-4" /> };
    if (type === "pdf" || type === "document") return { label: "Preview", icon: <Eye className="h-4 w-4" /> };
    return null;
  };

  const handlePreviewLesson = async (lesson: any) => {
    const rawId = lesson?.id;
    if (isTempLessonId(rawId)) {
      // temp lesson exists only on client, no backend id yet
      alert("This lesson is not uploaded/saved yet, so it can’t be previewed.");
      return;
    }

    const lessonId = getNumericLessonId(rawId);
    if (!lessonId) {
      alert("Invalid lesson id. This lesson cannot be previewed.");
      return;
    }

    if (!sessionToken) {
      alert("Session required. Please log in again.");
      return;
    }

    try {
      withLessonLoading(lessonId, true);
      const signedUrl = await fetchLessonMediaUrl(lessonId);

      const t = (lesson?.type || "").toLowerCase();

      if (t === "pdf" || t === "document") {
        window.open(signedUrl, "_blank");
        return;
      }

      if (t === "video" || t === "audio") {
        setPlayer({
          open: true,
          type: t === "audio" ? "audio" : "video",
          title: lesson?.title || "Lesson",
          url: signedUrl,
        });
        return;
      }

      alert("Preview is only available for video, audio, and PDF/document lessons.");
    } catch (e: any) {
      if (e?.message === "SESSION_EXPIRED") {
        onSessionExpired?.();
        alert("Session expired. Please log in again.");
        return;
      }
      if (e?.message === "NO_SESSION") {
        alert("Session required. Please log in again.");
        return;
      }
      alert(e?.message || "Unable to preview lesson.");
    } finally {
      withLessonLoading(lessonId, false);
    }
  };

  const rating = useMemo(() => module?.rating ?? 0, [module?.rating]);

  if (!module) return null;

  return (
    <>
      {/* Main Preview Modal */}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[90vw] sm:max-w-2xl max-h-[90vh] p-0 overflow-hidden">
          <div className="flex h-full max-h-[90vh] flex-col">
            {/* Sticky Header */}
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

            {/* Main Scrollable Area */}
            <div className="flex-1 min-h-0 overflow-hidden px-6 py-4 space-y-6">
              {/* Module Details */}
              <div className="space-y-2">
                <h3 className="text-sm xs:text-base sm:text-lg font-semibold">
                  Module Details
                </h3>
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
                    {rating}
                  </div>
                  <div>{module.createdDate}</div>
                </div>
              </div>

              {/* Lessons */}
              <div className="space-y-3 min-h-0">
                <h3 className="text-sm xs:text-base sm:text-lg font-semibold">
                  Lessons
                </h3>

                {module.lessons.length === 0 ? (
                  <p className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
                    No lessons available
                  </p>
                ) : (
                  <ScrollArea className="h-[36vh] xs:h-[42vh] sm:h-[50vh] pr-2">
                    <div className="space-y-2">
                      {module.lessons.map((lesson: any, index: number) => {
                        const lessonId = getNumericLessonId(lesson?.id);
                        const isLoading = lessonId ? loadingLessonIds.has(lessonId) : false;
                        const action = getLessonAction((lesson?.type || "").toLowerCase());
                        const canPreview =
                          !!action && !isTempLessonId(lesson?.id);

                        return (
                          <div
                            key={lesson.id}
                            className="p-2 xs:p-3 rounded-lg border bg-muted/50"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-2 min-w-0">
                                {getTypeIcon(lesson.type)}
                                <span className="text-[0.85rem] xs:text-xs sm:text-sm font-medium truncate">
                                  Lesson {index + 1}: {lesson.title || "Untitled"}
                                </span>
                                <Badge
                                  variant="outline"
                                  className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs capitalize"
                                >
                                  {lesson.type}
                                </Badge>
                              </div>

                              {/* ✅ New Preview/Play button */}
                              {action ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className={cn(
                                    "shrink-0 gap-2",
                                    !canPreview && "opacity-60 cursor-not-allowed"
                                  )}
                                  disabled={!canPreview || isLoading}
                                  onClick={() => handlePreviewLesson(lesson)}
                                  title={
                                    !canPreview
                                      ? "Save/upload this lesson first to preview"
                                      : `${action.label} lesson`
                                  }
                                >
                                  {isLoading ? (
                                    <>
                                      <Spinner size="sm" />
                                      Loading...
                                    </>
                                  ) : (
                                    <>
                                      {action.icon}
                                      {action.label}
                                    </>
                                  )}
                                </Button>
                              ) : null}
                            </div>

                            <p className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs text-muted-foreground mt-1">
                              Duration: {lesson.duration || "N/A"}
                            </p>

                            {/* Keep these lines if you still want to show raw stored fields */}
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
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </div>

            {/* Sticky Footer */}
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

      {/* ✅ Video/Audio Player Modal */}
      <Dialog
        open={player.open}
        onOpenChange={(open) => setPlayer((p) => ({ ...p, open }))}
      >
        <DialogContent className="max-w-[92vw] sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">{player.title}</DialogTitle>
            <DialogDescription>
              {player.type === "video" ? "Video preview" : "Audio preview"}
            </DialogDescription>
          </DialogHeader>

          <div className="w-full">
            {player.type === "video" ? (
              <video
                src={player.url}
                controls
                playsInline
                className="w-full rounded-lg bg-black"
              />
            ) : (
              <audio src={player.url} controls className="w-full" />
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPlayer((p) => ({ ...p, open: false }))}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

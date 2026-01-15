"use client";

import {useState, useEffect} from "react";
import {Button} from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {Textarea} from "@/components/ui/textarea";
import {Input} from "@/components/ui/input";
import {Tag, ArrowLeft, Type} from "lucide-react";
import {useRouter} from "next/navigation";
import {useSession} from "next-auth/react";

interface Lesson {
  id: number;
  title: string;
}

export default function CreateNotePage() {
  const router = useRouter();
  const {data: session} = useSession();

  const [lessonId, setLessonId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  // ✅ Fetch lessons on mount
  useEffect(() => {
    const fetchLessons = async () => {
      if (!session?.user?.sessionToken) return;
      try {
        const res = await fetch("/api/student/materials", {
          headers: {"X-Session-Token": session.user.sessionToken},
        });
        if (res.ok) {
          const data = await res.json();
          const lessonList = data.saved.videos.map((v: any) => ({
            id: parseInt(v.id),
            title: v.title,
          }));
          setLessons(lessonList);
        }
      } catch (err) {
        console.error("Failed to load lessons", err);
      }
    };
    fetchLessons();
  }, [session?.user?.sessionToken]);

  // ✅ Save new note
  const handleSave = async () => {
    if (!lessonId || !content.trim() || !title.trim()) {
      setError("Please fill in all fields (title, lesson, and content).");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/student/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Token": session?.user?.sessionToken || "",
        },
        body: JSON.stringify({
          title: title.trim(),
          lesson: parseInt(lessonId),
          content: content.trim(),
          is_private: true, // ✅ always private
          student: session?.user?.id,
        }),
      });

      if (!res.ok) throw new Error("Failed to save note");
      router.push("/student/materials");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            className="hover:bg-[#f57c50]/30"
            size="icon"
            onClick={() => router.push("/student/materials")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Create New Note</h1>
        </div>

        {/* Form */}
        <div className="space-y-6 bg-card p-3 rounded-xl shadow-sm">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Type className="h-4 w-4" />
              Title
            </label>
            <Input
              placeholder="Enter a title for your note..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Lesson */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Lesson
            </label>
            <Select value={lessonId} onValueChange={setLessonId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a lesson..." />
              </SelectTrigger>
              <SelectContent>
                {lessons.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No lessons available
                  </SelectItem>
                ) : (
                  lessons.map((lesson) => (
                    <SelectItem key={lesson.id} value={lesson.id.toString()}>
                      Lesson {lesson.id}: {lesson.title}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Content</label>
            <Textarea
              placeholder="Start writing your note..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[300px] resize-none"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          {/* Save button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              className="mt-3 w-full sm:w-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#f57c50] hover:bg-[#f57c50]/20 hover:text-accent-foreground transition-colors"
              disabled={
                loading || !lessonId || !content.trim() || !title.trim()
              }>
              {loading ? "Saving..." : "Save Note"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

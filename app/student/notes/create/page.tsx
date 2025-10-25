"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tag, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface Lesson {
  id: number;
  title: string;
}

export default function CreateNotePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [lessonId, setLessonId] = useState("");
  const [content, setContent] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  // Fetch lessons on mount
  useState(() => {
    const fetchLessons = async () => {
      if (!session?.user?.sessionToken) return;
      try {
        const res = await fetch("/api/student/materials", {
          headers: { "X-Session-Token": session.user.sessionToken },
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
        console.error("Failed to load lessons");
      }
    };
    fetchLessons();
  });

  const handleSave = async () => {
    if (!lessonId || !content.trim()) {
      setError("Please select a lesson and write a note.");
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
          lesson: parseInt(lessonId),
          content: content.trim(),
          is_private: isPrivate,
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
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/student/materials")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Create New Note</h1>
        </div>

        <div className="space-y-6 bg-card p-6 rounded-xl shadow-sm">
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
                  <SelectItem value="none" disabled>No lessons available</SelectItem>
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

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_private"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="is_private" className="text-sm font-medium">
              Private note
            </label>
          </div>

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

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={loading || !lessonId || !content.trim()}>
              {loading ? "Saving..." : "Save Note"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
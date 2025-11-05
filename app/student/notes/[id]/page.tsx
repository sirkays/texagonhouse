"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tag, ArrowLeft, Loader2, Type } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";

interface Lesson {
  id: number;
  title: string;
}

interface Note {
  id: number;
  lesson: number;
  title?: string;
  content: string;
  is_private?: boolean;
}

export default function EditNotePage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const noteId = params.id as string;

  const [lessonId, setLessonId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [note, setNote] = useState<Note | null>(null);

  // Fetch note + lessons
  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.sessionToken || !noteId) return;

      try {
        // Fetch materials (for lessons)
        const materialsRes = await fetch("/api/student/materials", {
          headers: { "X-Session-Token": session.user.sessionToken },
        });
        if (materialsRes.ok) {
          const materialsData = await materialsRes.json();
          const lessonList = (materialsData.saved?.videos ?? []).map((v: any) => ({
            id: parseInt(v.id),
            title: v.title,
          }));
          setLessons(lessonList);
        }

        // Fetch note
        const noteRes = await fetch(`/api/student/notes?id=${noteId}`, {
          headers: { "X-Session-Token": session.user.sessionToken },
        });
        if (noteRes.ok) {
          const noteData: Note = await noteRes.json();
          console.log(noteData, " smvdkmvlfvmfk")
          setNote(noteData);
          setLessonId(noteData.lesson?.toString() ?? "");
          setTitle(noteData.title ?? "");
          setContent(noteData.content ?? "");
        } else {
          setError("Note not found");
        }
      } catch {
        setError("Failed to load note");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session?.user?.sessionToken, noteId]);

  const handleSave = async () => {
    if (!lessonId || !title.trim() || !content.trim()) {
      setError("Please fill in all fields (title, lesson, and content).");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/student/notes", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Token": session?.user?.sessionToken || "",
        },
        body: JSON.stringify({
          id: parseInt(noteId, 10),
          lesson: parseInt(lessonId, 10),
          title: title.trim(),
          content: content.trim(),
          is_private: true, // 🔒 always private
          student: session?.user?.id,
        }),
      });

      if (!res.ok) throw new Error("Failed to update note");
      router.push("/student/materials");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error && !note) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => router.push("/student/materials")}>
            Back to Materials
          </Button>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold">Edit Note</h1>
        </div>

        <div className="space-y-6 bg-card p-6 rounded-xl shadow-sm">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Type className="h-4 w-4" />
              Title
            </label>
            <Input
              placeholder="Update the note title..."
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
              placeholder="Update your note..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[300px] resize-none"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/student/materials")}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !lessonId || !title.trim() || !content.trim()}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

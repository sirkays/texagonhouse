"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bookmark, Plus, Edit, Trash2, Search } from "lucide-react";
import { useSession } from "next-auth/react";

interface Bookmark {
  id: number;
  student: number;
  lessonId: number; // Use lessonId consistently
  lessonTitle?: string; // Optional, derived client-side
  note: string;
  position_seconds: number;
  created_at: string;
  updated_at: string;
}

interface Lesson {
  id: number;
  name: string;
  module: number;
  order: number;
  content_type: string;
  file: string;
  url: string;
  duration_seconds: number;
  meta: object;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface BookmarkManagerProps {
  isOpen: boolean;
  onClose: () => void;
  refreshData: () => void;
}

export function BookmarkManager({
  isOpen,
  onClose,
  refreshData,
}: BookmarkManagerProps) {
  const { data: session } = useSession();
  const sessionToken = session?.user?.sessionToken;
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeTab, setActiveTab] = useState("bookmarks"); // Add state for active tab
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newBookmark, setNewBookmark] = useState({
    lesson: "",
    note: "",
    position_seconds: "",
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch bookmarks
  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!sessionToken) return;
      try {
        const response = await fetch("/api/student/bookmarks", {
          headers: {
            "Content-Type": "application/json",
            "X-Session-Token": sessionToken,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `Failed to fetch bookmarks: ${JSON.stringify(errorData)}`
          );
        }
        const data = await response.json();
        // Normalize lesson to lessonId
        const normalizedBookmarks = data.map((bookmark) => ({
          ...bookmark,
          lessonId: bookmark.lessonId ?? bookmark.lesson ?? 0,
          lesson: undefined,
          lessonTitle:
            bookmark.lessonTitle ||
            lessons.find((l) => l.id === (bookmark.lessonId ?? bookmark.lesson))
              ?.name ||
            `Lesson ${bookmark.lessonId ?? bookmark.lesson}`,
        }));
        setBookmarks(normalizedBookmarks);
      } catch (err) {
        console.error("[BookmarkManager] Fetch bookmarks error:", err);
        setError(`Failed to load bookmarks: ${err.message}`);
      }
    };
    fetchBookmarks();
  }, [sessionToken, lessons]);

  // Fetch lessons
  useEffect(() => {
    const fetchLessons = async () => {
      if (!sessionToken) return;
      try {
        const response = await fetch("/api/student/lessons", {
          headers: {
            "Content-Type": "application/json",
            "X-Session-Token": sessionToken,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `Failed to fetch lessons: ${JSON.stringify(errorData)}`
          );
        }
        const data = await response.json();
        setLessons(data.results || data);
      } catch (err) {
        console.error("[BookmarkManager] Fetch lessons error:", err);
        setError(`Failed to load lessons: ${err.message}`);
      }
    };
    fetchLessons();
  }, [sessionToken]);

  const filteredBookmarks = bookmarks.filter((bookmark) =>
    bookmark.note.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddBookmark = async () => {
    if (!newBookmark.lesson || !newBookmark.note) {
      setError("Lesson and note are required");
      return;
    }
    try {
      const response = await fetch("/api/student/bookmarks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Token": sessionToken || "",
        },
        body: JSON.stringify({
          lesson: parseInt(newBookmark.lesson),
          note: newBookmark.note,
          position_seconds: parseInt(newBookmark.position_seconds) || 0,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to create bookmark: ${JSON.stringify(errorData)}`
        );
      }
      const savedBookmark = await response.json();
      // Normalize lesson to lessonId
      const normalizedBookmark = {
        ...savedBookmark,
        lessonId: savedBookmark.lesson,
        lesson: undefined,
        lessonTitle:
          lessons.find((l) => l.id === savedBookmark.lesson)?.name ||
          `Lesson ${savedBookmark.lesson}`,
      };
      setBookmarks([...bookmarks, normalizedBookmark]);
      setNewBookmark({ lesson: "", note: "", position_seconds: "" });
      setActiveTab("bookmarks"); // Switch to bookmarks tab after adding
      refreshData();
      setError(null);
    } catch (err) {
      console.error("[BookmarkManager] Add error:", err);
      setError(`Failed to create bookmark: ${err.message}`);
    }
  };

  const handleEditBookmark = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark);
    setNewBookmark({
      lesson: (bookmark.lessonId || 0).toString(),
      note: bookmark.note,
      position_seconds: bookmark.position_seconds.toString(),
    });
    setActiveTab("add"); // Switch to add/edit tab
  };

  const handleUpdateBookmark = async () => {
    if (!editingBookmark || !newBookmark.lesson || !newBookmark.note) {
      setError("Lesson and note are required");
      return;
    }
    try {
      const response = await fetch(`/api/student/bookmarks`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Token": sessionToken || "",
        },
        body: JSON.stringify({
          id: editingBookmark.id, // Include ID for route.ts
          lesson: parseInt(newBookmark.lesson),
          note: newBookmark.note,
          position_seconds: parseInt(newBookmark.position_seconds) || 0,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to update bookmark: ${JSON.stringify(errorData)}`);
      }
      const updatedBookmark = await response.json();
      // Normalize lesson to lessonId
      const normalizedBookmark = {
        ...updatedBookmark,
        lessonId: updatedBookmark.lesson,
        lesson: undefined,
        lessonTitle:
          lessons.find((l) => l.id === updatedBookmark.lesson)?.name ||
          `Lesson ${updatedBookmark.lesson}`,
      };
      setBookmarks(
        bookmarks.map((b) => (b.id === normalizedBookmark.id ? normalizedBookmark : b))
      );
      setEditingBookmark(null);
      setNewBookmark({ lesson: "", note: "", position_seconds: "" });
      setActiveTab("bookmarks"); // Switch back to bookmarks tab
      refreshData();
      setError(null);
    } catch (err) {
      console.error("[BookmarkManager] Update error:", err);
      setError(`Failed to update bookmark: ${err.message}`);
    }
  };

  const handleDeleteBookmark = async (id: number) => {
    try {
      const response = await fetch(`/api/student/bookmarks`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Token": sessionToken || "",
        },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to delete bookmark: ${JSON.stringify(errorData)}`);
      }
      setBookmarks(bookmarks.filter((b) => b.id !== id));
      refreshData();
      setError(null);
    } catch (err) {
      console.error("[BookmarkManager] Delete error:", err);
      setError(`Failed to delete bookmark: ${err.message}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="
          w-[95%] sm:w-[90%] md:w-[85%] lg:w-[80%] xl:w-[70%]
          max-w-6xl h-[80vh] sm:h-[85vh] flex flex-col
          mx-auto rounded-xl p-4 sm:p-6
          overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden
        "
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bookmark className="h-5 w-5" />
            Bookmark Manager
          </DialogTitle>
        </DialogHeader>

        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="flex flex-wrap gap-2">
            <TabsTrigger value="bookmarks" className="w-full">My Bookmarks</TabsTrigger>
            <TabsTrigger value="add" className="w-full">Add Bookmark</TabsTrigger>
          </TabsList>

          <TabsContent value="bookmarks" className="flex-1 space-y-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bookmarks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-auto">
              {filteredBookmarks.map((bookmark) => (
                <Card
                  key={bookmark.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-lg line-clamp-2">
                          {bookmark.lessonTitle || `Lesson ${bookmark.lessonId}`}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {bookmark.note}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-xs text-muted-foreground">
                      Position: {bookmark.position_seconds}s
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Added {new Date(bookmark.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditBookmark(bookmark)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteBookmark(bookmark.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="add" className="space-y-4">
            <div className="max-w-2xl mx-auto space-y-4">
              <h3 className="text-lg font-semibold">
                {editingBookmark ? "Edit Bookmark" : "Add New Bookmark"}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Lesson *</label>
                  <Select
                    value={newBookmark.lesson}
                    onValueChange={(value) =>
                      setNewBookmark({ ...newBookmark, lesson: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a lesson" />
                    </SelectTrigger>
                    <SelectContent>
                      {lessons.map((lesson) => (
                        <SelectItem key={lesson.id} value={lesson.id.toString()}>
                          {lesson.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Note *</label>
                  <Textarea
                    placeholder="Bookmark note"
                    value={newBookmark.note}
                    onChange={(e) =>
                      setNewBookmark({ ...newBookmark, note: e.target.value })
                    }
                    className={newBookmark.note ? "" : "border-red-500"}
                  />
                  {!newBookmark.note && (
                    <p className="text-red-500 text-xs mt-1">Note is required</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">Position (seconds)</label>
                  <Input
                    type="number"
                    placeholder="Position in seconds"
                    value={newBookmark.position_seconds}
                    onChange={(e) =>
                      setNewBookmark({ ...newBookmark, position_seconds: e.target.value })
                    }
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={editingBookmark ? handleUpdateBookmark : handleAddBookmark}
                    disabled={!newBookmark.lesson || !newBookmark.note}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {editingBookmark ? "Update Bookmark" : "Add Bookmark"}
                  </Button>
                  {editingBookmark && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingBookmark(null);
                        setNewBookmark({ lesson: "", note: "", position_seconds: "" });
                        setActiveTab("bookmarks"); // Switch back to bookmarks tab
                        setError(null);
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
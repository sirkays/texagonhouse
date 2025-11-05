"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Video,
  Headphones,
  Search,
  Filter,
  Clock,
  Play,
  Edit,
  Bookmark,
  LogIn,
  Download,
} from "lucide-react";
import { VideoModal } from "./video-modal";
import { NoteEditor } from "./note-editor";
import { BookmarkManager } from "./bookmark-manager";
import { AudioPlayer } from "./audio-player";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

interface Note {
  id: number;
  title: string;
  student: number;
  lesson: number;
  content: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

interface SavedItem {
  videos: {
    id: string;
    title: string;
    instructor: string;
    duration: string;
    progress: number;
    thumbnail: string | null;
    videoUrl: string;
  }[];
  pdfs: {
    id: string;
    title: string;
    author: string;
    pages: number | null;
    size: string | null;
    downloadUrl: string;
  }[];
  audio: {
    id: string;
    title: string;
    speaker: string;
    duration: string;
    beprogress: number;
    audioUrl: string;
  }[];
}

interface Bookmark {
  id: number;
  student: number;
  lessonId: number;
  lessonTitle: string;
  note: string;
  position_seconds: number;
  created_at: string;
  updated_at: string;
}

interface Lesson {
  id: number;
  title: string;
}

export function MyMaterials() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  // const [noteEditorOpen, setNoteEditorOpen] = useState(false);
  // const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [bookmarkManagerOpen, setBookmarkManagerOpen] = useState(false);
  const [audioPlayerOpen, setAudioPlayerOpen] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState<any>(null);
  const [data, setData] = useState<{
    saved: SavedItem;
    notes: Note[];
    bookmarks: Bookmark[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentPageNotes, setCurrentPageNotes] = useState(1);
  const [currentPageVideos, setCurrentPageVideos] = useState(1);
  const [currentPagePdfs, setCurrentPagePdfs] = useState(1);
  const [currentPageAudio, setCurrentPageAudio] = useState(1);
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
  const sessionToken = useMemo(
    () => session?.user?.sessionToken || null,
    [session?.user?.sessionToken]
  );

  const defaultThumbnail =
    "/placeholder.svg?height=120&width=200&text=Video+Thumbnail";

  const fallbackData = {
    saved: {
      videos: [
        {
          id: "1",
          title: "Advanced React Patterns",
          instructor: "Sarah Johnson",
          duration: "2h 45m",
          progress: 65,
          thumbnail: defaultThumbnail,
          videoUrl: "/sample-video.mp4",
        },
        {
          id: "2",
          title: "Python Web Development",
          instructor: "Mike Chen",
          duration: "3h 20m",
          progress: 30,
          thumbnail: defaultThumbnail,
          videoUrl: "/sample-video.mp4",
        },
      ],
      pdfs: [
        {
          id: "1",
          title: "JavaScript ES6 Guide",
          author: "John Doe",
          pages: 150,
          size: "5.2 MB",
          downloadUrl: "/sample.pdf",
        },
        {
          id: "2",
          title: "React Best Practices",
          author: "Jane Smith",
          pages: 89,
          size: "3.1 MB",
          downloadUrl: "/sample.pdf",
        },
      ],
      audio: [
        {
          id: "1",
          title: "Tech Podcast: Future of AI",
          speaker: "Tech Leaders",
          duration: "45m",
          progress: 80,
          audioUrl: "/sample-audio.mp3",
        },
        {
          id: "2",
          title: "JavaScript Deep Dive",
          speaker: "Dev Community",
          duration: "1h 20m",
          progress: 45,
          audioUrl: "/sample-audio.mp3",
        },
      ],
    },
    notes: [

    ],
    bookmarks: [],
  };

  const handleLogout = async () => {
    console.log("[MyMaterials] Initiating logout, sessionToken:", sessionToken);
    try {
      const response = await fetch("/api/auth/logout-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      console.log("[MyMaterials] Logout API response status:", response.status);
      const data = await response.json();
      console.log("[MyMaterials] Logout API response:", data);
      if (!response.ok) {
        console.error("[MyMaterials] Logout failed:", data);
        throw new Error(data.error || "Logout failed");
      }
      console.log("[MyMaterials] Logout successful, redirecting to /login");
      document.cookie = "next-auth.session-token=; Max-Age=0; path=/; secure";
      document.cookie = "next-auth.csrf-token=; Max-Age=0; path=/; secure";
      window.location.href = "/login";
    } catch (error) {
      console.error("[MyMaterials] Logout error:", error);
      document.cookie = "next-auth.session-token=; Max-Age=0; path=/; secure";
      document.cookie = "next-auth.csrf-token=; Max-Age=0; path=/; secure";
      window.location.href = "/login";
    }
  };

  const fetchData = async () => {
    console.log("[MyMaterials] Initiating fetch for /api/student/materials");
    if (status !== "authenticated" || !sessionToken) {
      console.log(
        "[MyMaterials] Session not authenticated, status:",
        status,
        "sessionToken:",
        session?.user?.sessionToken
      );
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    try {
      console.log(
        "[MyMaterials] Fetching from /api/student/materials with token:",
        session.user.sessionToken
      );
      const res = await fetch("/api/student/materials", {
        headers: {
          "Content-Type": "application/json",
          "X-Session-Token": sessionToken,
        },
      });
      console.log("[MyMaterials] Fetch response status:", res.status);
      if (!res.ok) {
        const errorData = await res.json();
        console.error(
          "[MyMaterials] Fetch failed with status:",
          res.status,
          "details:",
          errorData
        );
        if (res.status === 401 || res.status === 403) {
          setError("Session expired");
          setData(null);
          setLoading(false);
          return;
        }
        setError(
          res.status === 404
            ? "Materials endpoint not found"
            : `Failed to fetch materials: ${JSON.stringify(errorData)}`
        );
        setData(fallbackData);
        throw new Error("Fetch failed");
      }
      const json = await res.json();
      console.log("[MyMaterials] Fetch response data:", json);

      const bookmarksWithTitles = json.bookmarks.map((bookmark) => {
        if (!bookmark.lessonId) {
          console.warn("[MyMaterials] Bookmark missing lessonId:", bookmark);
          return {
            ...bookmark,
            lessonTitle: "Unknown Lesson",
          };
        }
        return {
          ...bookmark,
          lessonTitle:
            json.saved.videos.find((v) => v.id === bookmark.lessonId.toString())
              ?.title || `Lesson ${bookmark.lessonId}`,
        };
      });

      setData({ ...json, bookmarks: bookmarksWithTitles });
      setError(null);
    } catch (e) {
      console.error("[MyMaterials] Fetch error:", e);
      setError(`Session expired: ${e.message}`);
      setData(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [sessionToken, status]);

  // Extract lessons from videos
  useEffect(() => {
    if (data?.saved?.videos) {
      const lessonList: Lesson[] = data.saved.videos.map((v) => ({
        id: parseInt(v.id),
        title: v.title,
      }));
      setLessons(lessonList);
    }
  }, [data]);

  const handleSaveNote = async (note: Note) => {
    if (!note.lesson) {
      setError("Please select a lesson for the note.");
      return;
    }
    if (!note.content?.trim()) {
      setError("Note content cannot be empty.");
      return;
    }

    const normalizedNote: Note = {
      ...note,
      content: note.content.trim(),
      created_at: note.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log("[MyMaterials] Saving note:", normalizedNote);

    try {
      let response;
      if (selectedNote) {
        response = await fetch("/api/student/notes", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "X-Session-Token": sessionToken || "",
          },
          body: JSON.stringify({
            id: normalizedNote.id,
            title: normalizedNote.title,
            lesson: normalizedNote.lesson,
            content: normalizedNote.content,
            is_private: normalizedNote.is_private,
            student: session?.user?.id,
          }),
        });
      } else {
        response = await fetch("/api/student/notes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Session-Token": sessionToken || "",
          },
          body: JSON.stringify({
            title: normalizedNote.title,
            lesson: normalizedNote.lesson,
            content: normalizedNote.content,
            is_private: normalizedNote.is_private,
            student: session?.user?.id,
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed: ${JSON.stringify(errorData)}`);
      }

      const savedNote = await response.json();
      setData((prev) => ({
        ...prev!,
        notes: selectedNote
          ? prev!.notes.map((n) => (n.id === savedNote.id ? savedNote : n))
          : [...prev!.notes, savedNote],
      }));

      setNoteEditorOpen(false);
      setSelectedNote(null);
      setError(null);
    } catch (err: any) {
      console.error("[MyMaterials] Save error:", err);
      setError(err.message);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    setDeletingIds((prev) => new Set([...prev, noteId]));
    console.log(
      "[MyMaterials] Sending DELETE to /api/student/notes for note ID:",
      noteId
    );
    try {
      const response = await fetch(`/api/student/notes`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Token": sessionToken || "",
        },
        body: JSON.stringify({ id: noteId }),
      });
      console.log("[MyMaterials] DELETE response status:", response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error("[MyMaterials] Delete note error details:", errorData);
        throw new Error(`Failed to delete note: ${JSON.stringify(errorData)}`);
      }
      setData((prev) => ({
        ...prev!,
        notes: prev!.notes.filter((n) => n.id !== noteId),
      }));
      setError(null);
    } catch (err: any) {
      console.error("[MyMaterials] Note delete error:", err);
      setError(err.message);
    } finally {
      setDeletingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(noteId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="md" className="text-orange-500" />
      </div>
    );
  }

  if (
    error === "Session expired" ||
    error === "Not authenticated" ||
    (status === "authenticated" && error === "Session expired")
  ) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Session Expired
            </CardTitle>
            <CardDescription className="text-center">
              Your session has expired or you are not authenticated. Please log
              in again to continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={handleLogout} className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Log In Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-6">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Error
            </CardTitle>
            <CardDescription className="text-center">{error}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2"
            >
              <LogIn className="h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const savedItems = data?.saved ?? fallbackData.saved;
  const notes = data?.notes ?? fallbackData.notes;
  const bookmarks = data?.bookmarks ?? fallbackData.bookmarks;

  const handleWatchVideo = (video: any) => {
    setSelectedVideo(video);
    setVideoModalOpen(true);
  };

  const handlePreviewPdf = (pdf: any) => {
    if (!pdf.downloadUrl) {
      console.error(
        "[MyMaterials] No downloadUrl provided for PDF:",
        pdf.title
      );
      return;
    }
    console.log("[MyMaterials] Opening PDF in new tab:", pdf.downloadUrl);
    window.open(pdf.downloadUrl, "_blank");
  };

  const handlePlayAudio = (audio: {
    id: string;
    title: string;
    speaker: string;
    duration: string;
    progress: number;
    audioUrl: string;
  }) => {
    setSelectedAudio(audio);
    setAudioPlayerOpen(true);
  };

  // const handleOpenNote = (note?: Note) => {
  //   setSelectedNote(note || null);
  //   setNoteEditorOpen(true);
  // };

  const itemsPerPage = 6;

  // Notes pagination
  const totalPagesNotes = Math.ceil(notes.length / itemsPerPage);
  const currentNotes = notes.slice((currentPageNotes - 1) * itemsPerPage, currentPageNotes * itemsPerPage);

  // Videos pagination
  const totalPagesVideos = Math.ceil(savedItems.videos.length / itemsPerPage);
  const currentVideos = savedItems.videos.slice((currentPageVideos - 1) * itemsPerPage, currentPageVideos * itemsPerPage);

  // PDFs pagination
  const totalPagesPdfs = Math.ceil(savedItems.pdfs.length / itemsPerPage);
  const currentPdfs = savedItems.pdfs.slice((currentPagePdfs - 1) * itemsPerPage, currentPagePdfs * itemsPerPage);

  // Audio pagination
  const totalPagesAudio = Math.ceil(savedItems.audio.length / itemsPerPage);
  const currentAudio = savedItems.audio.slice((currentPageAudio - 1) * itemsPerPage, currentPageAudio * itemsPerPage);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Materials</h1>
        <p className="text-muted-foreground">
          Access your saved learning materials and notes
        </p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search your materials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 border focus:outline-none focus:ring-0 focus:ring-offset-0 focus:border-gray-300 focus:shadow-none"
          />
        </div>
        <Button
          className="h-10 bg-transparent border border-[#EF7B55] text-[#EF7B55] hover:bg-[#F79771] hover:text-white"
          variant="outline"
        >
          <Filter className="mr-2 h-4 w-4" />
          Search
        </Button>
      </div>

      <Tabs defaultValue="saved" className="w-full">
        <TabsList className="bg-[#f797712e] text-slate-700 flex flex-col lg:flex-row w-full gap-2 mb-14">
          <TabsTrigger
            value="saved"
            className="bg-transparent w-full justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3"
          >
            Saved Items
          </TabsTrigger>
          <TabsTrigger
            value="notes"
            className="bg-transparent w-full justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3"
          >
            My Notes
          </TabsTrigger>
          {/* <TabsTrigger
            value="bookmarks"
            className="bg-transparent w-full justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3"
          >
            Bookmarks
          </TabsTrigger> */}
        </TabsList>

        <TabsContent value="saved" className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Video className="h-5 w-5" />
              Saved Videos
            </h3>
            {savedItems.videos.length === 0 ? (
              <div className="text-center py-12">
                <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No saved videos yet</h3>
                <p className="text-muted-foreground">Start saving videos from your lessons</p>
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {currentVideos.map((video) => (
                    <Card
                      key={video.id}
                      className="hover:shadow-lg transition-shadow flex flex-col h-full"
                    >
                      <CardHeader className="p-0">
                        <div className="relative">
                          <div className="w-full h-32 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                            {video.thumbnail &&
                            video.thumbnail !== defaultThumbnail ? (
                              <>
                                <img
                                  src={
                                    video.thumbnail.startsWith("http")
                                      ? video.thumbnail
                                      : `https://texagonbackend.epichouse.online${video.thumbnail}`
                                  }
                                  alt={video.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    console.warn(
                                      "[MyMaterials] Image load error for:",
                                      video.thumbnail,
                                      "using default thumbnail"
                                    );
                                    e.currentTarget.src = defaultThumbnail;
                                  }}
                                />
                              </>
                            ) : (
                              <Video className="h-8 w-8 text-muted-foreground" />
                            )}
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-md rounded-bl-none rounded-br-none">
                            <Button
                              size="sm"
                              className="rounded-full bg-transparent h-10 w-10 text-white hover:bg-[#f7977192] hover:text-white"
                              onClick={() => handleWatchVideo(video)}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-1 px-4">
                          <CardTitle className="text-lg">{video.title}</CardTitle>
                          <CardDescription>by {video.instructor}</CardDescription>
                        </div>
                      </CardHeader>
                      <CardContent className="flex flex-col flex-1 px-4">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {video.duration}
                          </div>
                        </div>
                        <div className="mt-auto pt-4">
                          <Button
                            size="sm"
                            className="w-full h-10 bg-[#f79771] text-white hover:bg-gray-300 shadow-md"
                            onClick={() => handleWatchVideo(video)}
                          >
                            <Play className="mr-2 h-3 w-3" />
                            Continue Watching
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {totalPagesVideos > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-4">
                    <Button
                      disabled={currentPageVideos === 1}
                      onClick={() => setCurrentPageVideos((prev) => prev - 1)}
                    >
                      Previous
                    </Button>
                    <span>Page {currentPageVideos} of {totalPagesVideos}</span>
                    <Button
                      disabled={currentPageVideos === totalPagesVideos}
                      onClick={() => setCurrentPageVideos((prev) => prev + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Saved PDFs
            </h3>
            {savedItems.pdfs.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No saved PDFs yet</h3>
                <p className="text-muted-foreground">Start saving PDFs from your lessons</p>
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {currentPdfs.map((pdf) => (
                    <Card
                      key={pdf.id}
                      className="hover:shadow-lg transition-shadow flex flex-col h-full"
                    >
                      <CardHeader>
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{pdf.title}</CardTitle>
                          <CardDescription>by {pdf.author}</CardDescription>
                        </div>
                      </CardHeader>
                      <CardContent className="flex flex-col flex-1">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            {pdf.pages} pages • {pdf.size}
                          </div>
                        </div>
                        <div className="mt-auto pt-4">
                          <Button
                            size="sm"
                            className="w-full h-10 bg-[#f79771] text-white hover:bg-gray-300 shadow-md"
                            onClick={() => handlePreviewPdf(pdf)}
                          >
                            <Download className="mr-2 h-3 w-3" />
                            Preview
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {totalPagesPdfs > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-4">
                    <Button
                      disabled={currentPagePdfs === 1}
                      onClick={() => setCurrentPagePdfs((prev) => prev - 1)}
                    >
                      Previous
                    </Button>
                    <span>Page {currentPagePdfs} of {totalPagesPdfs}</span>
                    <Button
                      disabled={currentPagePdfs === totalPagesPdfs}
                      onClick={() => setCurrentPagePdfs((prev) => prev + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Headphones className="h-5 w-5" />
              Saved Audio
            </h3>
            {savedItems.audio.length === 0 ? (
              <div className="text-center py-12">
                <Headphones className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No saved audio yet</h3>
                <p className="text-muted-foreground">Start saving audio from your lessons</p>
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {currentAudio.map((audio) => (
                    <Card
                      key={audio.id}
                      className="hover:shadow-lg transition-shadow flex flex-col h-full"
                    >
                      <CardHeader>
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{audio.title}</CardTitle>
                          <CardDescription>by {audio.speaker}</CardDescription>
                        </div>
                      </CardHeader>
                      <CardContent className="flex flex-col flex-1">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {audio.duration}
                          </div>
                        </div>
                        <div className="mt-auto pt-4">
                          <Button
                            size="sm"
                            className="w-full h-10 bg-[#f79771] text-white hover:bg-gray-300 shadow-md"
                            onClick={() => handlePlayAudio(audio)}
                          >
                            <Play className="mr-2 h-3 w-3" />
                            Continue Listening
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {totalPagesAudio > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-4">
                    <Button
                      disabled={currentPageAudio === 1}
                      onClick={() => setCurrentPageAudio((prev) => prev - 1)}
                    >
                      Previous
                    </Button>
                    <span>Page {currentPageAudio} of {totalPagesAudio}</span>
                    <Button
                      disabled={currentPageAudio === totalPagesAudio}
                      onClick={() => setCurrentPageAudio((prev) => prev + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">My Notes</h3>
            <Button
              className="h-10 bg-transparent border border-[#EF7B55] text-[#EF7B55] hover:bg-[#F79771] hover:text-white"
              onClick={() => router.push("/student/notes/create")}
            >
              <Edit className="mr-2 h-4 w-4" />
              Create New Note
            </Button>
          </div>
          {notes.length === 0 ? (
            <div className="text-center py-12">
              <Edit className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No notes yet</h3>
              <p className="text-muted-foreground">Start creating notes for your lessons</p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {currentNotes.map((note) => (
                  <Card key={note.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="space-y-1">
                        <CardTitle className="text-lg">
                          {note.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {note.content}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-xs text-muted-foreground">
                        Updated {new Date(note.updated_at).toLocaleDateString()}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 w-full h-10 bg-[#f79771] text-white hover:bg-gray-300 shadow-md"
                          onClick={() => router.push(`/student/notes/${note.id}`)}
                        >
                          <Edit className="mr-2 h-3 w-3" />
                          Open
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteNote(note.id)}
                          className="flex-1 w-full h-10 shadow-md"
                          disabled={deletingIds.has(note.id)}
                        >
                          {deletingIds.has(note.id) ? "Deleting..." : "Delete"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {totalPagesNotes > 1 && (
                <div className="flex justify-center items-center gap-4 mt-4">
                  <Button
                    disabled={currentPageNotes === 1}
                    onClick={() => setCurrentPageNotes((prev) => prev - 1)}
                  >
                    Previous
                  </Button>
                  <span>Page {currentPageNotes} of {totalPagesNotes}</span>
                  <Button
                    disabled={currentPageNotes === totalPagesNotes}
                    onClick={() => setCurrentPageNotes((prev) => prev + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="bookmarks" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">My Bookmarks</h3>
            <Button
              className="h-10 bg-transparent border border-[#EF7B55] text-[#EF7B55] hover:bg-[#F79771] hover:text-white"
              onClick={() => setBookmarkManagerOpen(true)}
            >
              <Bookmark className="mr-2 h-4 w-4" />
              Manage Bookmarks
            </Button>
          </div>
          {bookmarks.length === 0 ? (
            <div className="text-center py-12">
              <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No bookmarks yet</h3>
              <p className="text-muted-foreground mb-4">
                Start bookmarking your favorite learning resources
              </p>
              <Button onClick={() => setBookmarkManagerOpen(true)}>
                <Bookmark className="mr-2 h-4 w-4" />
                Add Your First Bookmark
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {bookmarks.map((bookmark) => (
                <Card
                  key={bookmark.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="space-y-1">
                      <CardTitle className="text-lg">
                        {bookmark.lessonTitle}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {bookmark.note}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      Position: {bookmark.position_seconds}s
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Updated{" "}
                      {new Date(bookmark.updated_at).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <VideoModal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        title={selectedVideo?.title || ""}
        videoUrl={selectedVideo?.videoUrl}
      />
      <AudioPlayer
        isOpen={audioPlayerOpen}
        onClose={() => setAudioPlayerOpen(false)}
        title={selectedAudio?.title || ""}
        audioUrl={selectedAudio?.audioUrl}
        duration={selectedAudio?.duration}
      />
      {/* <NoteEditor
        isOpen={noteEditorOpen}
        onClose={() => {
          setNoteEditorOpen(false);
          setSelectedNote(null);
        }}
        note={selectedNote || undefined}
        onSave={handleSaveNote}
        lessons={lessons}
      /> */}
      <BookmarkManager
        isOpen={bookmarkManagerOpen}
        onClose={() => setBookmarkManagerOpen(false)}
        refreshData={fetchData}
      />
    </div>
  );
}
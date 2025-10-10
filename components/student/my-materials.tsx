"use client";

import {useState, useEffect, useMemo} from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Badge} from "@/components/ui/badge";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
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
  Eye,
  ExternalLink,
  Download,
} from "lucide-react";
import {VideoModal} from "./video-modal";
import {NoteEditor} from "./note-editor";
import {BookmarkManager} from "./bookmark-manager";
import {AudioPlayer} from "./audio-player";
import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation";
import {Spinner} from "@/components/ui/spinner";

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
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
    progress: number;
    audioUrl: string;
  }[];
}

interface Bookmark {
  id: string;
  lessonId: number;
  lessonTitle: string;
  positionSeconds: number;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export function MyMaterials() {
  const {data: session, status} = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [noteEditorOpen, setNoteEditorOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
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
  const sessionToken = useMemo(
    () => session?.user?.sessionToken || null,
    [session?.user?.sessionToken]
  );

  // Fallback data for UI stability
  const fallbackData = {
    saved: {
      videos: [
        {
          id: "1",
          title: "Advanced React Patterns",
          instructor: "Sarah Johnson",
          duration: "2h 45m",
          progress: 65,
          thumbnail: "https://source.unsplash.com/random/300x200?sig=1",
          videoUrl: "/sample-video.mp4",
        },
        {
          id: "2",
          title: "Python Web Development",
          instructor: "Mike Chen",
          duration: "3h 20m",
          progress: 30,
          thumbnail: "https://source.unsplash.com/random/300x200?sig=1",
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
      {
        id: "1",
        title: "React Hooks Notes",
        content: "useState and useEffect are the most commonly used hooks...",
        tags: ["react", "hooks", "frontend"],
        createdAt: "2024-01-15T00:00:00Z",
        updatedAt: "2024-01-15T00:00:00Z",
      },
      {
        id: "2",
        title: "Python Data Structures",
        content:
          "Lists, dictionaries, and sets are fundamental data structures...",
        tags: ["python", "data-structures", "programming"],
        createdAt: "2024-01-10T00:00:00Z",
        updatedAt: "2024-01-12T00:00:00Z",
      },
    ],
    bookmarks: [],
  };

  const handleLogout = async () => {
    console.log("[MyMaterials] Initiating logout, sessionToken:", sessionToken);
    try {
      const response = await fetch("/api/auth/logout-route", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
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

  useEffect(() => {
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
          console.error("[MyMaterials] Fetch failed with status:", res.status);
          if (res.status === 401 || res.status === 403) {
            setError("Session expired");
            setData(null); // Prevent fallback data on session expiry
            setLoading(false);
            return;
          }
          setError(
            res.status === 404
              ? "Materials endpoint not found"
              : "Failed to fetch materials"
          );
          setData(fallbackData); // Use fallback data for other errors
          throw new Error("Fetch failed");
        }
        const json = await res.json();
        console.log("[MyMaterials] Fetch response data:", json);
        setData(json);
        setError(null); // Clear error on success
      } catch (e) {
        console.error("[MyMaterials] Fetch error:", e);
        setError("Session expired"); // Assume session expiry for any error when authenticated
        setData(null); // Prevent fallback data
      }
      setLoading(false);
    };
    fetchData();
  }, [sessionToken, status]);

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
              className="flex items-center gap-2">
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

  const handleOpenNote = (note?: Note) => {
    setSelectedNote(note || null);
    setNoteEditorOpen(true);
  };

  const handleSaveNote = (note: Note) => {
    const normalizedNote: Note = {
      ...note,
      createdAt:
        note.createdAt instanceof Date
          ? note.createdAt.toISOString()
          : note.createdAt,
      updatedAt:
        note.updatedAt instanceof Date
          ? note.updatedAt.toISOString()
          : note.updatedAt,
    };

    if (selectedNote) {
      setData({
        ...data!,
        notes: notes.map((n) =>
          n.id === normalizedNote.id ? normalizedNote : n
        ),
      });
    } else {
      setData({
        ...data!,
        notes: [...notes, normalizedNote],
      });
    }
  };

  const handleDeleteNote = (noteId: string) => {
    setData({
      ...data!,
      notes: notes.filter((n) => n.id !== noteId),
    });
  };

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
          variant="outline">
          <Filter className="mr-2 h-4 w-4 " />
          Search
        </Button>
      </div>

      <Tabs defaultValue="saved" className="w-full">
        <TabsList className="bg-[#f797712e] text-slate-700 flex flex-col lg:flex-row w-full gap-2 mb-14">
          <TabsTrigger
            value="saved"
            className="bg-transparent w-full sm:w-32 justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3">
            Saved Items
          </TabsTrigger>
          <TabsTrigger
            value="downloads"
            className="bg-transparent w-full sm:w-32 justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3">
            Downloads
          </TabsTrigger>
          <TabsTrigger
            value="notes"
            className="bg-transparent w-full sm:w-32 justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3">
            My Notes
          </TabsTrigger>
          <TabsTrigger
            value="bookmarks"
            className="bg-transparent w-full sm:w-32 justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3">
            Bookmarks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="saved" className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Video className="h-5 w-5" />
              Saved Videos
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {savedItems.videos.map((video) => (
                <Card
                  key={video.id}
                  className="hover:shadow-lg transition-shadow flex flex-col h-full">
                  <CardHeader className="p-0">
                    <div className="relative">
                      <img
                        src={video.thumbnail || ""}
                        alt={video.title}
                        onError={(e) => {
                          console.error(
                            "[MyMaterials] Image load error for:",
                            video.thumbnail
                          );
                          e.currentTarget.src = "";
                        }}
                        className="w-full h-32 object-cover rounded-md"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-md rounded-bl-none rounded-br-none">
                        <Button
                          size="sm"
                          className="rounded-full bg-transparent h-10 w-10 text-white hover:bg-[#f7977192] hover:text-white"
                          onClick={() => handleWatchVideo(video)}>
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
                    {/* <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{video.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${video.progress}%` }}
                        />
                      </div>
                    </div> */}
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
                        onClick={() => handleWatchVideo(video)}>
                        <Play className="mr-2 h-3 w-3" />
                        Continue Watching
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Headphones className="h-5 w-5" />
              Saved Audio
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {savedItems.audio.map((audio) => (
                <Card
                  key={audio.id}
                  className="hover:shadow-lg transition-shadow flex flex-col h-full">
                  <CardHeader>
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{audio.title}</CardTitle>
                      <CardDescription>by {audio.speaker}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1">
                    {/* <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{audio.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${audio.progress}%` }}
                        />
                      </div>
                    </div> */}
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
                        onClick={() => handlePlayAudio(audio)}>
                        <Play className="mr-2 h-3 w-3" />
                        Continue Listening
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="downloads" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {savedItems.pdfs.map((pdf) => (
              <Card
                key={pdf.id}
                className="hover:shadow-lg transition-shadow flex flex-col h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{pdf.title}</CardTitle>
                      <CardDescription>by {pdf.author}</CardDescription>
                    </div>
                    <FileText className="h-8 w-8 text-[#EF7B55]" />
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col flex-1">
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>Pages: {pdf.pages ?? "N/A"}</div>
                    <div>Size: {pdf.size ?? "N/A"}</div>
                  </div>
                  <div className="mt-auto pt-4 flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 h-10 w-full bg-[#f79771] text-white hover:bg-gray-300 shadow-md"
                      onClick={() => handlePreviewPdf(pdf)}>
                      <Eye className="mr-2 h-3 w-3" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 w-full h-10 shadow-md"
                      onClick={() => {
                        if (!pdf.downloadUrl) {
                          console.error(
                            "[MyMaterials] No downloadUrl for download:",
                            pdf.title
                          );
                          return;
                        }
                        const link = document.createElement("a");
                        link.href = pdf.downloadUrl;
                        link.download = pdf.title || "document.pdf";
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}>
                      <Download className="mr-2 h-3 w-3" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">My Notes</h3>
            <Button
              className="h-10 bg-transparent border border-[#EF7B55] text-[#EF7B55] hover:bg-[#F79771] hover:text-white"
              onClick={() => handleOpenNote()}>
              <Edit className="mr-2 h-4 w-4" />
              Create New Note
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <Card key={note.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{note.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {note.content}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-1">
                    {note.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Updated {new Date(note.updatedAt).toLocaleDateString()}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 w-full h-10 bg-[#f79771] text-white hover:bg-gray-300 shadow-md"
                      onClick={() => handleOpenNote(note)}>
                      <Edit className="mr-2 h-3 w-3" />
                      Open
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteNote(note.id)}
                      className="flex-1 w-full h-10 shadow-md">
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="bookmarks" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">My Bookmarks</h3>
            <Button
              className="h-10 bg-transparent border border-[#EF7B55] text-[#EF7B55] hover:bg-[#F79771] hover:text-white"
              onClick={() => setBookmarkManagerOpen(true)}>
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
                  className="hover:shadow-lg transition-shadow">
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
                      Position: {bookmark.positionSeconds}s
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Updated{" "}
                      {new Date(bookmark.updatedAt).toLocaleDateString()}
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
      <NoteEditor
        isOpen={noteEditorOpen}
        onClose={() => setNoteEditorOpen(false)}
        note={selectedNote ? selectedNote : undefined}
        onSave={handleSaveNote}
      />
      <BookmarkManager
        isOpen={bookmarkManagerOpen}
        onClose={() => setBookmarkManagerOpen(false)}
      />
    </div>
  );
}

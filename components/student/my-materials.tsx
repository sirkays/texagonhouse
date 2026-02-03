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
  Download,
  Trash,
} from "lucide-react";
import {VideoModal} from "./video-modal";
import {NoteEditor} from "./note-editor";
import {BookmarkManager} from "./bookmark-manager";
import {AudioPlayer} from "./audio-player";
import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation";
import {Spinner} from "@/components/ui/spinner";

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
    blur?: boolean; // ✅ add
    lesson_id?: number;
  }[];
  pdfs: {
    id: string;
    title: string;
    author: string;
    pages: number | null;
    size: string | null;
    downloadUrl: string;
    blur?: boolean; // ✅ add
    lesson_id?: number;
  }[];
  audio: {
    id: string;
    title: string;
    speaker: string;
    duration: string;
    progress: number; // ✅ FIX (was beprogress)
    audioUrl: string;
    blur?: boolean; // ✅ add
    lesson_id?: number;
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

type LessonMediaResp = {
  url: string; // the signed/playable url
  blur?: boolean;
  expires_in?: number; // optional
};

export function MyMaterials() {
  const {data: session, status} = useSession();
  const router = useRouter();
  const [openingKey, setOpeningKey] = useState<string | null>(null);

  const isOpening = (key: string) => openingKey === key;
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
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
  const [pageLoading, setPageLoading] = useState(true); // only first load
  const [dataLoading, setDataLoading] = useState(false); // search / refetch

  const [error, setError] = useState<string | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentPageNotes, setCurrentPageNotes] = useState(1);
  const [currentPageVideos, setCurrentPageVideos] = useState(1);
  const [currentPagePdfs, setCurrentPagePdfs] = useState(1);
  const [currentPageAudio, setCurrentPageAudio] = useState(1);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const sessionToken = useMemo(
    () => session?.user?.sessionToken || null,
    [session?.user?.sessionToken],
  );

  const isLockedVideo = (v: any) => !!v?.blur || !v?.videoUrl;
  const isLockedPdf = (p: any) => !!p?.blur || !p?.downloadUrl;
  const isLockedAudio = (a: any) => !!a?.blur || !a?.audioUrl;

  const LockedOverlay = ({label}: {label: string}) => (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
      <div className="flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-xs font-medium shadow-sm">
        <span className="text-[#EF7B55]">●</span>
        <span>{label}</span>
      </div>
    </div>
  );

  const defaultThumbnail =
    "/placeholder.svg?height=120&width=200&text=Video+Thumbnail";

  const emptyData = {
    saved: {videos: [], pdfs: [], audio: []},
    notes: [],
    bookmarks: [],
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout-route", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
      });
      const data = await response.json();
      if (!response.ok) {
        console.error("[MyMaterials] Logout failed:", data);
        throw new Error(data.error || "Logout failed");
      }
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

  const fetchData = async (qOverride?: string, opts?: {initial?: boolean}) => {
    const q = (qOverride ?? appliedQuery ?? "").trim();
    const initial = !!opts?.initial;

    if (initial) setPageLoading(true);
    else setDataLoading(true);

    if (status !== "authenticated" || !sessionToken) {
      setError("Not authenticated");
      setData(null);
      setPageLoading(false);
      setDataLoading(false);
      return;
    }

    try {
      const url = q
        ? `/api/student/materials?q=${encodeURIComponent(q)}`
        : "/api/student/materials";

      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          "X-Session-Token": sessionToken,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (res.status === 401 || res.status === 403) {
          setError("Session expired");
          setData(null);
          return;
        }

        setError(
          res.status === 404
            ? "Materials endpoint not found"
            : `Failed to fetch materials: ${JSON.stringify(errorData)}`,
        );

        setData({
          saved: {videos: [], pdfs: [], audio: []},
          notes: [],
          bookmarks: [],
        });
        return;
      }

      const json = await res.json();

      setData({
        saved: {
          videos: json?.saved?.videos ?? [],
          pdfs: json?.saved?.pdfs ?? [],
          audio: json?.saved?.audio ?? [],
        },
        notes: json?.notes ?? [],
        bookmarks: json?.bookmarks ?? [],
      });

      setError(null);
    } catch (e: any) {
      setError(e?.message || "Failed to fetch materials");
      setData({
        saved: {videos: [], pdfs: [], audio: []},
        notes: [],
        bookmarks: [],
      });
    } finally {
      setPageLoading(false);
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery === "" && appliedQuery !== "") {
      setAppliedQuery("");
      fetchData("");
    }
  }, [searchQuery]);
  useEffect(() => {
    if (status === "authenticated" && sessionToken) {
      fetchData("", {initial: true});
    }
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

  async function fetchLessonMediaUrl(params: {
    lesson_id: string | number;
    kind: "video" | "pdf" | "audio";
  }) {
    if (!sessionToken) throw new Error("Missing session token");

    const qs = new URLSearchParams({
      lesson_id: String(params.lesson_id),
      kind: params.kind,
    });

    const res = await fetch(
      `/api/student/lesson-media-url/${params.lesson_id}/`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Session-Token": sessionToken,
        },
      },
    );

    const payload = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(
        payload?.detail || payload?.error || "Failed to get media url",
      );
    }

    return payload as LessonMediaResp;
  }

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

    try {
      let response;

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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed: ${JSON.stringify(errorData)}`);
      }

      const savedNote = await response.json();

      setData((prev) => {
        if (!prev) return prev;

        const exists = prev.notes.some((n) => n.id === savedNote.id);

        return {
          ...prev,
          notes: exists
            ? prev.notes.map((n) => (n.id === savedNote.id ? savedNote : n))
            : [savedNote, ...prev.notes], // or [...prev.notes, savedNote]
        };
      });

      setError(null);
    } catch (err: any) {
      console.error("[MyMaterials] Save error:", err);
      setError(err.message);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    setDeletingIds((prev) => new Set([...prev, `note-${noteId}`]));
    console.log(
      "[MyMaterials] Sending DELETE to /api/student/notes for note ID:",
      noteId,
    );
    try {
      const response = await fetch(`/api/student/notes`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Token": sessionToken || "",
        },
        body: JSON.stringify({id: noteId}),
      });
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
        newSet.delete(`note-${noteId}`);
        return newSet;
      });
    }
  };

  const handleDeleteSavedItem = async (
    type: "videos" | "pdfs" | "audio",
    item: any,
  ) => {
    // item MUST carry lesson_id (recommended) or material_id
    const lessonId = item.lesson_id ?? item.lessonId ?? item.lesson ?? null;
    const materialId = item.material_id ?? item.materialId ?? item.id ?? null;

    if (!lessonId && !materialId) {
      setError("Cannot delete: missing lesson_id/material_id on this item.");
      return;
    }

    const key = `${type}-${item.id}`;
    setDeletingIds((prev) => new Set([...prev, key]));

    try {
      const response = await fetch(`/api/student/materials`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Token": sessionToken || "",
        },
        body: JSON.stringify({
          lesson_id: lessonId, // ✅ preferred
          material_id: materialId, // ✅ fallback
          type,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.error || "Failed to delete material");
      }

      // ✅ update UI locally
      setData((prev) => {
        if (!prev) return prev;

        const newSaved = {...prev.saved};

        if (type === "videos") {
          newSaved.videos = newSaved.videos.filter((x) => x.id !== item.id);
        } else if (type === "pdfs") {
          newSaved.pdfs = newSaved.pdfs.filter((x) => x.id !== item.id);
        } else {
          newSaved.audio = newSaved.audio.filter((x) => x.id !== item.id);
        }

        return {...prev, saved: newSaved};
      });

      setError(null);
    } catch (err: any) {
      console.error("[MyMaterials] Material delete error:", err);
      setError(err.message || "Failed to delete material");
    } finally {
      setDeletingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    }
  };

  if (pageLoading) {
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
            <Button
              onClick={handleLogout}
              className="mt-3 w-full sm:w-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium hover:bg-[#f57c50]/20 hover:text-accent-foreground transition-colors">
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
              className="mt-3 w-full sm:w-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium hover:bg-[#f57c50]/20 hover:text-accent-foreground transition-colors">
              <LogIn className="h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const savedItems = data?.saved ?? emptyData.saved;
  const notes = data?.notes ?? emptyData.notes;
  const bookmarks = data?.bookmarks ?? emptyData.bookmarks;

  const handleWatchVideo = async (video: any) => {
    if (isLockedVideo(video)) return;

    try {
      setOpeningKey(`video-play-${video.id}`);
      const lessonId =
        video.lesson_id ?? video.lessonId ?? video.lesson ?? video.id;
      const {url} = await fetchLessonMediaUrl({
        lesson_id: lessonId,
        kind: "video",
      });

      setSelectedVideo({...video, videoUrl: url});
      setVideoModalOpen(true);
    } catch (e: any) {
      setError(e?.message || "Failed to load video");
    } finally {
      setOpeningKey(null);
    }
  };
  const handlePreviewPdf = async (pdf: any) => {
    if (isLockedPdf(pdf)) return;

    try {
      setOpeningKey(`pdf-preview-${pdf.id}`);
      const lessonId = pdf.lesson_id ?? pdf.lessonId ?? pdf.lesson ?? pdf.id;
      const {url} = await fetchLessonMediaUrl({
        lesson_id: lessonId,
        kind: "pdf",
      });

      window.open(url, "_blank");
    } catch (e: any) {
      setError(e?.message || "Failed to load PDF");
    } finally {
      setOpeningKey(null);
    }
  };

  const handlePlayAudio = async (audio: any) => {
    if (isLockedAudio(audio)) return;

    try {
      setOpeningKey(`audio-play-${audio.id}`);
      const lessonId =
        audio.lesson_id ?? audio.lessonId ?? audio.lesson ?? audio.id;
      const {url} = await fetchLessonMediaUrl({
        lesson_id: lessonId,
        kind: "audio",
      });

      setSelectedAudio({...audio, audioUrl: url});
      setAudioPlayerOpen(true);
    } catch (e: any) {
      setError(e?.message || "Failed to load audio");
    } finally {
      setOpeningKey(null);
    }
  };

  // const handleOpenNote = (note?: Note) => {
  //   setSelectedNote(note || null);
  //   setNoteEditorOpen(true);
  // };

  const itemsPerPage = 6;

  // Notes pagination
  const totalPagesNotes = Math.ceil(notes.length / itemsPerPage);
  const currentNotes = notes.slice(
    (currentPageNotes - 1) * itemsPerPage,
    currentPageNotes * itemsPerPage,
  );

  // Videos pagination
  const totalPagesVideos = Math.ceil(savedItems.videos.length / itemsPerPage);
  const currentVideos = savedItems.videos.slice(
    (currentPageVideos - 1) * itemsPerPage,
    currentPageVideos * itemsPerPage,
  );

  // PDFs pagination
  const totalPagesPdfs = Math.ceil(savedItems.pdfs.length / itemsPerPage);
  const currentPdfs = savedItems.pdfs.slice(
    (currentPagePdfs - 1) * itemsPerPage,
    currentPagePdfs * itemsPerPage,
  );

  // Audio pagination
  const totalPagesAudio = Math.ceil(savedItems.audio.length / itemsPerPage);
  const currentAudio = savedItems.audio.slice(
    (currentPageAudio - 1) * itemsPerPage,
    currentPageAudio * itemsPerPage,
  );

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

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
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setAppliedQuery(searchQuery);
                fetchData(searchQuery);
              }
            }}
            className="pl-8 border focus:outline-none focus:ring-0 focus:ring-offset-0 focus:border-gray-300 focus:shadow-none"
          />
        </div>
        <Button
          className="h-10 bg-transparent border border-[#EF7B55] text-[#EF7B55] hover:bg-[#F79771] hover:text-white"
          variant="outline"
          onClick={() => {
            setAppliedQuery(searchQuery);
            fetchData(searchQuery);
          }}>
          <Filter className="mr-2 h-4 w-4" />
          Search
        </Button>
      </div>

      <Tabs defaultValue="saved" className="w-full">
        <TabsList className="bg-[#f797712e] text-slate-700 flex flex-row w-full gap-2 mb-14">
          <TabsTrigger
            value="saved"
            className="bg-transparent justify-center py-2 data-[state=active]:bg-[#EF7B55]/70 data-[state=active]:text-white gap-3">
            Saved Items
          </TabsTrigger>
          <TabsTrigger
            value="notes"
            className="bg-transparent justify-center py-2 data-[state=active]:bg-[#EF7B55]/70 data-[state=active]:text-white gap-3">
            My Notes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="saved" className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Video className="h-5 w-5" />
              Saved Videos
            </h3>

            {dataLoading ? (
              // ✅ Only the data area loads (search bar stays visible)
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({length: 6}).map((_, i) => (
                  <Card
                    key={`video-skel-${i}`}
                    className="hover:shadow-lg transition-shadow flex flex-col h-full overflow-hidden">
                    <CardHeader className="p-0">
                      <div className="relative">
                        <div className="w-full h-32 bg-muted animate-pulse rounded-md rounded-bl-none rounded-br-none" />
                      </div>
                      <div className="space-y-2 px-4 py-3">
                        <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                        <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                      </div>
                    </CardHeader>

                    <CardContent className="flex flex-col flex-1 px-4 pb-4">
                      <div className="mt-auto pt-2 flex gap-2">
                        <div className="h-10 flex-1 bg-muted animate-pulse rounded-md" />
                        <div className="h-10 flex-1 bg-muted animate-pulse rounded-md" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : savedItems.videos.length === 0 ? (
              <div className="text-center py-12">
                <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No saved videos yet
                </h3>
                <p className="text-muted-foreground">
                  Start saving videos from your lessons
                </p>
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {currentVideos.map((video) => {
                    const locked = isLockedVideo(video);

                    return (
                      <Card
                        key={video.id}
                        className={`hover:shadow-xl transition-shadow flex flex-col sm:flex-row h-full bg-white rounded-lg overflow-hidden shadow-sm max-w-md relative ${
                          locked ? "cursor-not-allowed" : ""
                        }`}>
                        {/* BLUR WRAPPER */}
                        <div
                          className={`flex flex-col sm:flex-row w-full ${locked ? "blur-md" : ""}`}>
                          <div className="relative w-full sm:w-40 flex-shrink-0 aspect-video bg-muted rounded-tr-none rounded-br-none overflow-hidden flex items-center justify-center">
                            {video.thumbnail &&
                            video.thumbnail !== defaultThumbnail ? (
                              <img
                                src={
                                  video.thumbnail.startsWith("http")
                                    ? video.thumbnail
                                    : `process.env.BASE_URL${video.thumbnail}`
                                }
                                alt={video.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Video className="h-8 w-8 text-muted-foreground" />
                            )}
                          </div>

                          <CardContent className="flex flex-col flex-1 p-3 sm:p-2.5">
                            <div className="space-y-0.5">
                              <CardTitle className="text-base font-semibold line-clamp-2">
                                {video.title}
                              </CardTitle>
                              <CardDescription className="text-xs text-muted-foreground">
                                by {video.instructor || "Unknown"}
                              </CardDescription>
                            </div>

                            <div className="flex gap-3">
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={
                                  locked || isOpening(`video-play-${video.id}`)
                                }
                                className="mt-3 w-full sm:w-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium"
                                onClick={() => handleWatchVideo(video)}>
                                {isOpening(`video-play-${video.id}`) ? (
                                  <>
                                    <Spinner
                                      size="sm"
                                      className="text-orange-500"
                                    />
                                    Loading...
                                  </>
                                ) : (
                                  <>
                                    <Play className="h-3.5 w-3.5 flex-shrink-0" />
                                    Play
                                  </>
                                )}
                              </Button>

                              {/* Delete stays allowed even when locked (recommended) */}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleDeleteSavedItem("videos", video)
                                }
                                className="mt-3 w-full sm:w-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium"
                                disabled={deletingIds.has(
                                  `videos-${video.id}`,
                                )}>
                                {deletingIds.has(`videos-${video.id}`) ? (
                                  "Deleting..."
                                ) : (
                                  <>
                                    <Trash className="mr-2 h-3 w-3" />
                                    Delete
                                  </>
                                )}
                              </Button>
                            </div>
                          </CardContent>
                        </div>

                        {/* OVERLAY */}
                        {locked && (
                          <LockedOverlay label="Locked video — subscribe to unlock" />
                        )}
                      </Card>
                    );
                  })}
                </div>

                {totalPagesVideos > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-4">
                    <Button
                      disabled={currentPageVideos === 1}
                      onClick={() => setCurrentPageVideos((prev) => prev - 1)}>
                      Previous
                    </Button>
                    <span>
                      Page {currentPageVideos} of {totalPagesVideos}
                    </span>
                    <Button
                      disabled={currentPageVideos === totalPagesVideos}
                      onClick={() => setCurrentPageVideos((prev) => prev + 1)}>
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

            {dataLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({length: 6}).map((_, i) => (
                  <Card
                    key={`pdf-skel-${i}`}
                    className="hover:shadow-lg transition-shadow flex flex-col h-full">
                    <CardHeader>
                      <div className="space-y-2">
                        <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                        <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                      </div>
                    </CardHeader>

                    <CardContent className="flex flex-col flex-1">
                      <div className="h-3 w-2/3 bg-muted animate-pulse rounded" />
                      <div className="mt-auto pt-4 flex gap-2">
                        <div className="h-10 flex-1 bg-muted animate-pulse rounded-md" />
                        <div className="h-10 flex-1 bg-muted animate-pulse rounded-md" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : savedItems.pdfs.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No saved PDFs yet
                </h3>
                <p className="text-muted-foreground">
                  Start saving PDFs from your lessons
                </p>
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {currentPdfs.map((pdf) => {
                    const locked = isLockedPdf(pdf);

                    return (
                      <Card
                        key={pdf.id}
                        className={`hover:shadow-xl transition-shadow flex flex-col sm:flex-row h-full bg-white rounded-lg overflow-hidden shadow-sm max-w-md relative ${
                          locked ? "cursor-not-allowed" : ""
                        }`}>
                        <div
                          className={`flex flex-col sm:flex-row w-full ${locked ? "blur-md" : ""}`}>
                          <div className="relative w-full sm:w-40 flex-shrink-0 aspect-video bg-muted rounded-tr-none rounded-br-none overflow-hidden flex items-center justify-center">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                          </div>

                          <CardContent className="flex flex-col flex-1 p-3 sm:p-2.5">
                            <div className="space-y-0.5">
                              <CardTitle className="text-base font-semibold line-clamp-2">
                                {pdf.title}
                              </CardTitle>
                              <CardDescription className="text-xs text-muted-foreground">
                                by {pdf.author || "Unknown"}
                              </CardDescription>
                            </div>

                            <div className="mt-2 text-sm text-muted-foreground">
                              {pdf.pages ?? "—"} pages • {pdf.size ?? "—"}
                            </div>

                            <div className="mt-3 flex flex-col sm:flex-row items-center justify-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={
                                  locked || isOpening(`pdf-preview-${pdf.id}`)
                                }
                                className="mt-3 w-full sm:w-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium"
                                onClick={() => handlePreviewPdf(pdf)}>
                                {isOpening(`pdf-preview-${pdf.id}`) ? (
                                  <>
                                    <Spinner
                                      size="sm"
                                      className="text-orange-500"
                                    />
                                    Loading...
                                  </>
                                ) : (
                                  <>
                                    <Play className="h-3.5 w-3.5 flex-shrink-0" />
                                    Preview
                                  </>
                                )}
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleDeleteSavedItem("pdfs", pdf)
                                }
                                className="w-full sm:w-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium"
                                disabled={deletingIds.has(`pdfs-${pdf.id}`)}>
                                {deletingIds.has(`pdfs-${pdf.id}`) ? (
                                  "Deleting..."
                                ) : (
                                  <>
                                    <Trash className="mr-2 h-3 w-3" />
                                    Delete
                                  </>
                                )}
                              </Button>
                            </div>
                          </CardContent>
                        </div>

                        {locked && (
                          <LockedOverlay label="Locked PDF — subscribe to unlock" />
                        )}
                      </Card>
                    );
                  })}
                </div>

                {totalPagesPdfs > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-4">
                    <Button
                      disabled={currentPagePdfs === 1}
                      onClick={() => setCurrentPagePdfs((prev) => prev - 1)}>
                      Previous
                    </Button>
                    <span>
                      Page {currentPagePdfs} of {totalPagesPdfs}
                    </span>
                    <Button
                      disabled={currentPagePdfs === totalPagesPdfs}
                      onClick={() => setCurrentPagePdfs((prev) => prev + 1)}>
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

            {dataLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({length: 6}).map((_, i) => (
                  <Card
                    key={`audio-skel-${i}`}
                    className="hover:shadow-lg transition-shadow flex flex-col h-full">
                    <CardHeader>
                      <div className="space-y-2">
                        <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                        <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                      </div>
                    </CardHeader>

                    <CardContent className="flex flex-col flex-1">
                      <div className="mt-auto pt-4 flex gap-2">
                        <div className="h-10 flex-1 bg-muted animate-pulse rounded-md" />
                        <div className="h-10 flex-1 bg-muted animate-pulse rounded-md" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : savedItems.audio.length === 0 ? (
              <div className="text-center py-12">
                <Headphones className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No saved audio yet
                </h3>
                <p className="text-muted-foreground">
                  Start saving audio from your lessons
                </p>
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {currentAudio.map((audio) => {
                    const locked = isLockedAudio(audio);

                    return (
                      <Card
                        key={audio.id}
                        className={`hover:shadow-xl transition-shadow flex flex-col sm:flex-row h-full bg-white rounded-lg overflow-hidden shadow-sm max-w-md relative ${
                          locked ? "cursor-not-allowed" : ""
                        }`}>
                        <div
                          className={`flex flex-col sm:flex-row w-full ${locked ? "blur-md" : ""}`}>
                          <div className="relative w-full sm:w-40 flex-shrink-0 aspect-video bg-muted rounded-tr-none rounded-br-none overflow-hidden flex items-center justify-center">
                            <Headphones className="h-8 w-8 text-muted-foreground" />
                          </div>

                          <CardContent className="flex flex-col flex-1 p-3 sm:p-2.5">
                            <div className="space-y-0.5">
                              <CardTitle className="text-base font-semibold line-clamp-2">
                                {audio.title}
                              </CardTitle>
                              <CardDescription className="text-xs text-muted-foreground">
                                by {audio.speaker || "Unknown"}
                              </CardDescription>
                            </div>

                            <div className="mt-auto pt-4 flex items-center justify-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={
                                  locked || isOpening(`audio-play-${audio.id}`)
                                }
                                className="mt-3 w-full sm:w-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium"
                                onClick={() => handlePlayAudio(audio)}>
                                {isOpening(`audio-play-${audio.id}`) ? (
                                  <>
                                    <Spinner
                                      size="sm"
                                      className="text-orange-500"
                                    />
                                    Loading...
                                  </>
                                ) : (
                                  <>
                                    <Play className="h-3.5 w-3.5 flex-shrink-0" />
                                    Play
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleDeleteSavedItem("audio", audio)
                                }
                                className="mt-3 w-full sm:w-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium"
                                disabled={deletingIds.has(`audio-${audio.id}`)}>
                                {deletingIds.has(`audio-${audio.id}`) ? (
                                  "Deleting..."
                                ) : (
                                  <>
                                    <Trash className="mr-2 h-3 w-3" />
                                    Delete
                                  </>
                                )}
                              </Button>
                            </div>
                          </CardContent>
                        </div>

                        {locked && (
                          <LockedOverlay label="Locked audio — subscribe to unlock" />
                        )}
                      </Card>
                    );
                  })}
                </div>

                {totalPagesAudio > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-4">
                    <Button
                      disabled={currentPageAudio === 1}
                      onClick={() => setCurrentPageAudio((prev) => prev - 1)}>
                      Previous
                    </Button>
                    <span>
                      Page {currentPageAudio} of {totalPagesAudio}
                    </span>
                    <Button
                      disabled={currentPageAudio === totalPagesAudio}
                      onClick={() => setCurrentPageAudio((prev) => prev + 1)}>
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
              onClick={() => router.push("/student/notes/create")}>
              <Edit className="mr-2 h-4 w-4" />
              Create New Note
            </Button>
          </div>
          {notes.length === 0 ? (
            <div className="text-center py-12">
              <Edit className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No notes yet</h3>
              <p className="text-muted-foreground">
                Start creating notes for your lessons
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {currentNotes.map((note) => (
                  <Card
                    key={note.id}
                    className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{note.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {note.content}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-xs text-muted-foreground">
                        Updated {new Date(note.updated_at).toLocaleDateString()}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-3 w-full sm:w-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium hover:bg-[#f57c50]/20 hover:text-accent-foreground transition-colors"
                          onClick={() =>
                            router.push(`/student/notes/${note.id}`)
                          }>
                          <Edit className="mr-2 h-3 w-3" />
                          Open
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteNote(note.id)}
                          className="mt-3 w-full sm:w-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium hover:bg-[#f57c50]/20 hover:text-accent-foreground transition-colors"
                          disabled={deletingIds.has(`note-${note.id}`)}>
                          {deletingIds.has(`note-${note.id}`)
                            ? "Deleting..."
                            : "Delete"}
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
                    onClick={() => setCurrentPageNotes((prev) => prev - 1)}>
                    Previous
                  </Button>
                  <span>
                    Page {currentPageNotes} of {totalPagesNotes}
                  </span>
                  <Button
                    disabled={currentPageNotes === totalPagesNotes}
                    onClick={() => setCurrentPageNotes((prev) => prev + 1)}>
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
      <BookmarkManager
        isOpen={bookmarkManagerOpen}
        onClose={() => setBookmarkManagerOpen(false)}
        refreshData={fetchData}
      />
    </div>
  );
}

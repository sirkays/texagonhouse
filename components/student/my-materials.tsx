// components/my-materials.tsx
"use client";

import {useState, useEffect} from "react";
import {useSession} from "next-auth/react";
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
  Download,
  Search,
  Filter,
  Clock,
  Play,
  Edit,
  Bookmark,
} from "lucide-react";
import {VideoModal} from "./video-modal";
import {NoteEditor} from "./note-editor";
import {BookmarkManager} from "./bookmark-manager";

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface MediaItem {
  id: string;
  title: string;
  url: string;
  type: "video" | "audio" | "pdf";
  metadata: {
    instructor?: string;
    duration?: string;
    progress?: number;
    thumbnail?: string;
    author?: string;
    pages?: number;
    size?: string;
    speaker?: string;
  };
}

export function MyMaterials() {
  const {data: session, status} = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<MediaItem | null>(null);
  const [noteEditorOpen, setNoteEditorOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [bookmarkManagerOpen, setBookmarkManagerOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]); // Now fetched from API
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (status === "loading" || !session) return;
      try {
        setIsLoading(true);
        const lessonsUrl = "https://texagonbackend.esm.name.ng/api/lessons/";
        const materialsUrl =
          "https://texagonbackend.esm.name.ng/api/materials/";
        const notesUrl = "https://texagonbackend.esm.name.ng/api/notes/"; // Added notes URL

        const [lessonsResponse, materialsResponse, notesResponse] =
          await Promise.all([
            fetch(`/api/media?url=${encodeURIComponent(lessonsUrl)}`, {
              headers: {"Content-Type": "application/json"},
            }),
            fetch(`/api/media?url=${encodeURIComponent(materialsUrl)}`, {
              headers: {"Content-Type": "application/json"},
            }),
            fetch(`/api/notes`, {
              // Fetch notes
              headers: {"Content-Type": "application/json"},
            }),
          ]);

        if (!lessonsResponse.ok) {
          throw new Error(`Lessons fetch failed: ${lessonsResponse.status}`);
        }
        if (!materialsResponse.ok) {
          throw new Error(
            `Materials fetch failed: ${materialsResponse.status}`
          );
        }
        if (!notesResponse.ok) {
          throw new Error(`Notes fetch failed: ${notesResponse.status}`);
        }

        const lessonsData = await lessonsResponse.json();
        const materialsData = await materialsResponse.json();
        const notesData = await notesResponse.json();

        // Transform media items (unchanged)
        const data = [...lessonsData, ...materialsData].filter((item: any) => {
          if (!item.file_url) return false;
          const lowerUrl = item.file_url.toLowerCase();
          return (
            lowerUrl.endsWith(".mp4") ||
            lowerUrl.endsWith(".mp3") ||
            lowerUrl.endsWith(".pdf") ||
            lowerUrl.endsWith(".wav") ||
            lowerUrl.endsWith(".ogg") ||
            lowerUrl.endsWith(".doc") ||
            lowerUrl.endsWith(".docx") ||
            lowerUrl.endsWith(".txt")
          );
        });

        const transformedItems = data.map((item: any) => {
          let type: "video" | "audio" | "pdf" = "pdf";
          const lowerUrl = item.file_url.toLowerCase();
          if (lowerUrl.endsWith(".mp4")) type = "video";
          else if (
            lowerUrl.endsWith(".mp3") ||
            lowerUrl.endsWith(".wav") ||
            lowerUrl.endsWith(".ogg")
          )
            type = "audio";

          return {
            id: item.id,
            title: item.title || item.file_url.split("/").pop(),
            url: `/api/media?url=${encodeURIComponent(item.file_url)}`,
            type,
            metadata: {
              instructor: item.instructor,
              duration: item.duration,
              progress: item.progress,
              thumbnail: item.thumbnail,
              author: item.author,
              pages: item.pages,
              size: item.size,
              speaker: item.speaker,
            },
          };
        });

        // Transform notes
        const transformedNotes = notesData.map((item: any) => ({
          id: item.id,
          title: item.title,
          content: item.content,
          tags: item.tags || [],
          createdAt: new Date(item.created_at),
          updatedAt: new Date(item.updated_at),
        }));

        setMediaItems(transformedItems);
        setNotes(transformedNotes); // Set fetched notes
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [session, status]);

  const handleWatchVideo = (video: MediaItem) => {
    setSelectedVideo(video);
    setVideoModalOpen(true);
  };

  const handleDownload = (item: MediaItem) => {
    const link = document.createElement("a");
    link.href = item.url;
    link.download = item.title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePlayAudio = (audio: MediaItem) => {
    const audioPlayer = new Audio(audio.url);
    audioPlayer.play().catch((err) => console.error("Audio play error:", err));
  };

  const handleOpenNote = (note?: Note) => {
    setSelectedNote(note || null);
    setNoteEditorOpen(true);
  };

  const handleSaveNote = (note: Note) => {
    if (selectedNote) {
      setNotes(notes.map((n) => (n.id === note.id ? note : n)));
    } else {
      setNotes([...notes, note]);
    }
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(notes.filter((n) => n.id !== noteId));
  };

  const NoItemsMessage = ({
    icon,
    title,
    message,
  }: {
    icon: React.ReactNode;
    title: string;
    message: string;
  }) => (
    <div className="text-center py-12">
      {icon}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4">{message}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Materials</h1>
        <p className="text-muted-foreground">
          Access your saved learning materials, pages, and bookmarks
        </p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search your materials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      {isLoading ? (
        <div>Loading materials...</div>
      ) : (
        <Tabs defaultValue="saved" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            {" "}
            {/* Still 4 columns */}
            <TabsTrigger value="saved">Saved Items</TabsTrigger>
            <TabsTrigger value="downloads">Downloads</TabsTrigger>
            <TabsTrigger value="pages">My Pages</TabsTrigger>{" "}
            {/* Renamed to Pages */}
            <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
          </TabsList>

          <TabsContent value="saved" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Video className="h-5 w-5" />
                Saved Videos
              </h3>
              {mediaItems.filter((item) => item.type === "video").length ===
              0 ? (
                <NoItemsMessage
                  icon={
                    <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  }
                  title="No videos found"
                  message="There are no video materials available at the moment."
                />
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {mediaItems
                    .filter((item) => item.type === "video")
                    .filter((item) =>
                      item.title
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())
                    ) // Added search
                    .map((video) => (
                      <Card
                        key={video.id}
                        className="hover:shadow-lg transition-shadow flex flex-col h-full">
                        <CardHeader>
                          <div className="relative">
                            <img
                              src={
                                video.metadata.thumbnail || "/placeholder.svg"
                              }
                              alt={video.title}
                              className="w-full h-32 object-cover rounded-md"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-md">
                              <Button
                                size="sm"
                                className="rounded-full"
                                onClick={() => handleWatchVideo(video)}>
                                <Play className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <CardTitle className="text-lg">
                              {video.title}
                            </CardTitle>
                            <CardDescription>
                              by {video.metadata.instructor}
                            </CardDescription>
                          </div>
                        </CardHeader>
                        <CardContent className="flex flex-col flex-1">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{video.metadata.progress || 0}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{
                                  width: `${video.metadata.progress || 0}%`,
                                }}
                              />
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {video.metadata.duration || "N/A"}
                            </div>
                          </div>
                          <div className="mt-auto pt-4">
                            <Button
                              size="sm"
                              className="w-full h-10"
                              onClick={() => handleWatchVideo(video)}>
                              <Play className="mr-2 h-3 w-3" />
                              Continue Watching
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Headphones className="h-5 w-5" />
                Saved Audio
              </h3>
              {mediaItems.filter((item) => item.type === "audio").length ===
              0 ? (
                <NoItemsMessage
                  icon={
                    <Headphones className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  }
                  title="No audio found"
                  message="There are no audio materials available at the moment."
                />
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {mediaItems
                    .filter((item) => item.type === "audio")
                    .filter((item) =>
                      item.title
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())
                    ) // Added search
                    .map((audio) => (
                      <Card
                        key={audio.id}
                        className="hover:shadow-lg transition-shadow flex flex-col h-full">
                        <CardHeader>
                          <div className="space-y-1">
                            <CardTitle className="text-lg">
                              {audio.title}
                            </CardTitle>
                            <CardDescription>
                              by {audio.metadata.speaker}
                            </CardDescription>
                          </div>
                        </CardHeader>
                        <CardContent className="flex flex-col flex-1">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{audio.metadata.progress || 0}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{
                                  width: `${audio.metadata.progress || 0}%`,
                                }}
                              />
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {audio.metadata.duration || "N/A"}
                            </div>
                          </div>
                          <div className="mt-auto pt-4">
                            <Button
                              size="sm"
                              className="w-full h-10"
                              onClick={() => handlePlayAudio(audio)}>
                              <Play className="mr-2 h-3 w-3" />
                              Continue Listening
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="downloads" className="space-y-4">
            {mediaItems.filter((item) => item.type === "pdf").length === 0 ? (
              <NoItemsMessage
                icon={
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                }
                title="No downloads found"
                message="There are no downloadable materials like PDFs available at the moment."
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {mediaItems
                  .filter((item) => item.type === "pdf")
                  .filter((item) =>
                    item.title.toLowerCase().includes(searchQuery.toLowerCase())
                  ) // Added search
                  .map((pdf) => (
                    <Card
                      key={pdf.id}
                      className="hover:shadow-lg transition-shadow flex flex-col h-full">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg">
                              {pdf.title}
                            </CardTitle>
                            <CardDescription>
                              by {pdf.metadata.author}
                            </CardDescription>
                          </div>
                          <FileText className="h-8 w-8 text-muted-foreground" />
                        </div>
                      </CardHeader>
                      <CardContent className="flex flex-col flex-1">
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div>Pages: {pdf.metadata.pages || "N/A"}</div>
                          <div>Size: {pdf.metadata.size || "N/A"}</div>
                        </div>
                        <div className="mt-auto pt-4">
                          <Button
                            size="sm"
                            className="w-full h-10"
                            onClick={() => handleDownload(pdf)}>
                            <Download className="mr-2 h-3 w-3" />
                            Download
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pages" className="space-y-4">
            {" "}
            {/* Renamed to Pages */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">My Pages</h3>
              <Button onClick={() => handleOpenNote()}>
                <Edit className="mr-2 h-4 w-4" />
                Create New Page
              </Button>
            </div>
            {notes.length === 0 ? (
              <NoItemsMessage
                icon={
                  <Edit className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                }
                title="No pages yet"
                message="Start creating your pages."
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {notes
                  .filter((note) =>
                    note.title.toLowerCase().includes(searchQuery.toLowerCase())
                  ) // Added search
                  .map((note) => (
                    <Card
                      key={note.id}
                      className="hover:shadow-lg transition-shadow">
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
                        <div className="flex flex-wrap gap-1">
                          {note.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Updated {note.updatedAt.toLocaleDateString()}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => handleOpenNote(note)}>
                            <Edit className="mr-2 h-3 w-3" />
                            Open
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteNote(note.id)}>
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="bookmarks" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">My Bookmarks</h3>
              <Button onClick={() => setBookmarkManagerOpen(true)}>
                <Bookmark className="mr-2 h-4 w-4" />
                Manage Bookmarks
              </Button>
            </div>
            <NoItemsMessage
              icon={
                <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              }
              title="No bookmarks yet"
              message="Start bookmarking your favorite learning resources"
            />
            <div className="text-center">
              <Button onClick={() => setBookmarkManagerOpen(true)}>
                <Bookmark className="mr-2 h-4 w-4" />
                Add Your First Bookmark
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      )}

      <VideoModal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        title={selectedVideo?.title || ""}
        videoUrl={selectedVideo?.url}
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

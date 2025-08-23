"use client";

import {useState} from "react";
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

export function MyMaterials() {
  const [searchQuery, setSearchQuery] = useState("");
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [noteEditorOpen, setNoteEditorOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [bookmarkManagerOpen, setBookmarkManagerOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      title: "React Hooks Notes",
      content: "useState and useEffect are the most commonly used hooks...",
      tags: ["react", "hooks", "frontend"],
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-01-15"),
    },
    {
      id: "2",
      title: "Python Data Structures",
      content:
        "Lists, dictionaries, and sets are fundamental data structures...",
      tags: ["python", "data-structures", "programming"],
      createdAt: new Date("2024-01-10"),
      updatedAt: new Date("2024-01-12"),
    },
  ]);

  const savedItems = {
    videos: [
      {
        id: "1",
        title: "Advanced React Patterns ;a;iuobas,jnbs,n sgvlkjnb;skin;",
        instructor: "Sarah Johnson",
        duration: "2h 45m",
        progress: 65,
        thumbnail: "/placeholder.svg?height=120&width=200&text=Video+Thumbnail",
        videoUrl: "/sample-video.mp4",
      },
      {
        id: "2",
        title: "Python Web Development",
        instructor: "Mike Chen",
        duration: "3h 20m",
        progress: 30,
        thumbnail: "/placeholder.svg?height=120&width=200&text=Video+Thumbnail",
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
        title: "Tech Podcast: Future of AI fojnb;okin';in;oinb;o",
        speaker: "Tech Leaders",
        duration: "45m",
        progress: 80,
      },
      {
        id: "2",
        title: "JavaScript Deep Dive",
        speaker: "Dev Community",
        duration: "1h 20m",
        progress: 45,
      },
    ],
  };

  const handleWatchVideo = (video: any) => {
    setSelectedVideo(video);
    setVideoModalOpen(true);
  };

  const handleDownload = (item: any) => {
    const link = document.createElement("a");
    link.href = item.downloadUrl || "#";
    link.download = item.title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenNote = (note?: Note) => {
    setSelectedNote(note || null);
    setNoteEditorOpen(true);
  };

  const handleSaveNote = (note: Note) => {
    if (selectedNote) {
      // Update existing note
      setNotes(notes.map((n) => (n.id === note.id ? note : n)));
    } else {
      // Add new note
      setNotes([...notes, note]);
    }
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(notes.filter((n) => n.id !== noteId));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Materials</h1>
        <p className="text-muted-foreground">
          Access your saved learning materials and notes
        </p>
      </div>

      {/* Search and Filter */}
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

      <Tabs defaultValue="saved" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="saved">Saved Items</TabsTrigger>
          <TabsTrigger value="downloads">Downloads</TabsTrigger>
          <TabsTrigger value="notes">My Notes</TabsTrigger>
          <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
        </TabsList>

        <TabsContent value="saved" className="space-y-6">
          {/* Videos */}
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
                  {/* Header */}
                  <CardHeader>
                    <div className="relative">
                      <img
                        src={video.thumbnail || "/placeholder.svg"}
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
                      <CardTitle className="text-lg">{video.title}</CardTitle>
                      <CardDescription>by {video.instructor}</CardDescription>
                    </div>
                  </CardHeader>

                  {/* Body + Footer */}
                  <CardContent className="flex flex-col flex-1">
                    {/* Body */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{video.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{width: `${video.progress}%`}}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {video.duration}
                      </div>
                    </div>

                    {/* Footer — stays bottom */}
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
          </div>

          {/* Audio */}
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
                  {/* Header */}
                  <CardHeader>
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{audio.title}</CardTitle>
                      <CardDescription>by {audio.speaker}</CardDescription>
                    </div>
                  </CardHeader>

                  {/* Body + Footer */}
                  <CardContent className="flex flex-col flex-1">
                    {/* Body */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{audio.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{width: `${audio.progress}%`}}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {audio.duration}
                      </div>
                    </div>

                    {/* Footer — sticks to bottom */}
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
          </div>
        </TabsContent>

        <TabsContent value="downloads" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {savedItems.pdfs.map((pdf) => (
              <Card
                key={pdf.id}
                className="hover:shadow-lg transition-shadow flex flex-col h-full">
                {/* Header */}
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{pdf.title}</CardTitle>
                      <CardDescription>by {pdf.author}</CardDescription>
                    </div>
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardHeader>

                {/* Body + Footer */}
                <CardContent className="flex flex-col flex-1">
                  {/* Body */}
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>Pages: {pdf.pages}</div>
                    <div>Size: {pdf.size}</div>
                  </div>

                  {/* Footer — sticks to bottom */}
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
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">My Notes</h3>
            <Button onClick={() => handleOpenNote()}>
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
        </TabsContent>

        <TabsContent value="bookmarks" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">My Bookmarks</h3>
            <Button onClick={() => setBookmarkManagerOpen(true)}>
              <Bookmark className="mr-2 h-4 w-4" />
              Manage Bookmarks
            </Button>
          </div>

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
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <VideoModal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        title={selectedVideo?.title || ""}
        videoUrl={selectedVideo?.videoUrl}
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

"use client";

import {useState} from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Badge} from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {Bookmark, Plus, Edit, Trash2, ExternalLink, Search} from "lucide-react";

interface BookmarkItem {
  id: string;
  title: string;
  url: string;
  description: string;
  category: string;
  tags: string[];
  createdAt: Date;
}

interface BookmarkManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BookmarkManager({isOpen, onClose}: BookmarkManagerProps) {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([
    {
      id: "1",
      title: "React Documentation",
      url: "https://react.dev",
      description: "Official React documentation with guides and API reference",
      category: "Documentation",
      tags: ["react", "frontend", "javascript"],
      createdAt: new Date("2024-01-15"),
    },
    {
      id: "2",
      title: "TypeScript Handbook",
      url: "https://www.typescriptlang.org/docs/",
      description: "Complete guide to TypeScript language features",
      category: "Documentation",
      tags: ["typescript", "javascript", "types"],
      createdAt: new Date("2024-01-10"),
    },
    {
      id: "3",
      title: "CSS Grid Garden",
      url: "https://cssgridgarden.com/",
      description: "Interactive game to learn CSS Grid",
      category: "Learning",
      tags: ["css", "grid", "game", "interactive"],
      createdAt: new Date("2024-01-05"),
    },
  ]);

  const [isAddingBookmark, setIsAddingBookmark] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<BookmarkItem | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [newBookmark, setNewBookmark] = useState({
    title: "",
    url: "",
    description: "",
    category: "",
    tags: [] as string[],
  });

  const categories = [
    "All",
    "Documentation",
    "Learning",
    "Tools",
    "Articles",
    "Videos",
  ];
  const allTags = Array.from(new Set(bookmarks.flatMap((b) => b.tags)));

  const filteredBookmarks = bookmarks.filter((bookmark) => {
    const matchesSearch =
      bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesCategory =
      selectedCategory === "all" ||
      bookmark.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const handleAddBookmark = () => {
    if (!newBookmark.title || !newBookmark.url) return;

    const bookmark: BookmarkItem = {
      id: Date.now().toString(),
      title: newBookmark.title,
      url: newBookmark.url,
      description: newBookmark.description,
      category: newBookmark.category || "Uncategorized",
      tags: newBookmark.tags,
      createdAt: new Date(),
    };

    setBookmarks([...bookmarks, bookmark]);
    setNewBookmark({
      title: "",
      url: "",
      description: "",
      category: "",
      tags: [],
    });
    setIsAddingBookmark(false);
  };

  const handleEditBookmark = (bookmark: BookmarkItem) => {
    setEditingBookmark(bookmark);
    setNewBookmark({
      title: bookmark.title,
      url: bookmark.url,
      description: bookmark.description,
      category: bookmark.category,
      tags: bookmark.tags,
    });
  };

  const handleUpdateBookmark = () => {
    if (!editingBookmark || !newBookmark.title || !newBookmark.url) return;

    const updatedBookmarks = bookmarks.map((b) =>
      b.id === editingBookmark.id
        ? {
            ...b,
            title: newBookmark.title,
            url: newBookmark.url,
            description: newBookmark.description,
            category: newBookmark.category || "Uncategorized",
            tags: newBookmark.tags,
          }
        : b
    );

    setBookmarks(updatedBookmarks);
    setEditingBookmark(null);
    setNewBookmark({
      title: "",
      url: "",
      description: "",
      category: "",
      tags: [],
    });
  };

  const handleDeleteBookmark = (id: string) => {
    setBookmarks(bookmarks.filter((b) => b.id !== id));
  };

  const openBookmark = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="
      w-[95%] sm:w-[90%] md:w-[85%] lg:w-[80%] xl:w-[70%]
      max-w-6xl h-[80vh] sm:h-[85vh] flex flex-col
      mx-auto rounded-xl p-4 sm:p-6
      overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden
    ">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bookmark className="h-5 w-5" />
            Bookmark Manager
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="bookmarks" className="flex-1 flex flex-col">
          <TabsList className="flex flex-wrap gap-2">
            <TabsTrigger value="bookmarks">My Bookmarks</TabsTrigger>
            <TabsTrigger value="add">Add Bookmark</TabsTrigger>
          </TabsList>

          {/* Bookmarks Tab */}
          <TabsContent value="bookmarks" className="flex-1 space-y-4">
            {/* Search + Filter */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search bookmarks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.slice(1).map((category) => (
                    <SelectItem key={category} value={category.toLowerCase()}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bookmarks Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-auto">
              {filteredBookmarks.map((bookmark) => (
                <Card
                  key={bookmark.id}
                  className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-lg line-clamp-2">
                          {bookmark.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {bookmark.description}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">{bookmark.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-1">
                      {bookmark.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Added {bookmark.createdAt.toLocaleDateString()}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => openBookmark(bookmark.url)}>
                        <ExternalLink className="h-3 w-3 mr-2" />
                        Visit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditBookmark(bookmark)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteBookmark(bookmark.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Add Bookmark Tab */}
          <TabsContent value="add" className="space-y-4">
            <div className="max-w-2xl mx-auto space-y-4">
              <h3 className="text-lg font-semibold">
                {editingBookmark ? "Edit Bookmark" : "Add New Bookmark"}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title *</label>
                  <Input
                    placeholder="Bookmark title"
                    value={newBookmark.title}
                    onChange={(e) =>
                      setNewBookmark({...newBookmark, title: e.target.value})
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">URL *</label>
                  <Input
                    placeholder="https://example.com"
                    value={newBookmark.url}
                    onChange={(e) =>
                      setNewBookmark({...newBookmark, url: e.target.value})
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    placeholder="Brief description of the bookmark"
                    value={newBookmark.description}
                    onChange={(e) =>
                      setNewBookmark({
                        ...newBookmark,
                        description: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select
                    value={newBookmark.category}
                    onValueChange={(value) =>
                      setNewBookmark({...newBookmark, category: value})
                    }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.slice(1).map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={
                      editingBookmark ? handleUpdateBookmark : handleAddBookmark
                    }
                    disabled={!newBookmark.title || !newBookmark.url}>
                    <Plus className="h-4 w-4 mr-2" />
                    {editingBookmark ? "Update Bookmark" : "Add Bookmark"}
                  </Button>
                  {editingBookmark && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingBookmark(null);
                        setNewBookmark({
                          title: "",
                          url: "",
                          description: "",
                          category: "",
                          tags: [],
                        });
                      }}>
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

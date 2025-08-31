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
import { Badge } from "@/components/ui/badge";
import { Save, Plus, X, Tag } from "lucide-react";

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string; // Changed from Date to string to match MyMaterials
  updatedAt: string; // Changed from Date to string to match MyMaterials
}

interface NoteEditorProps {
  isOpen: boolean;
  onClose: () => void;
  note?: Note;
  onSave: (note: Note) => void;
}

export function NoteEditor({ isOpen, onClose, note, onSave }: NoteEditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setTags(note.tags);
    } else {
      setTitle("");
      setContent("");
      setTags([]);
    }
    setHasUnsavedChanges(false);
  }, [note, isOpen]);

  // Auto-save functionality
  useEffect(() => {
    if (!isOpen || (!title && !content)) return;

    const autoSaveTimer = setTimeout(() => {
      if (hasUnsavedChanges) {
        handleSave(false);
      }
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(autoSaveTimer);
  }, [title, content, tags, hasUnsavedChanges, isOpen]);

  const handleSave = (closeAfterSave = true) => {
    if (!title.trim()) return;

    const savedNote: Note = {
      id: note?.id || Date.now().toString(),
      title: title.trim(),
      content: content.trim(),
      tags,
      createdAt: note?.createdAt || new Date().toISOString(), // Convert Date to ISO string
      updatedAt: new Date().toISOString(), // Convert Date to ISO string
    };

    onSave(savedNote);
    setHasUnsavedChanges(false);

    if (closeAfterSave) {
      onClose();
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
      setHasUnsavedChanges(true);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
    setHasUnsavedChanges(true);
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    setHasUnsavedChanges(true);
  };

  const handleContentChange = (value: string) => {
    setContent(value);
    setHasUnsavedChanges(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="
      w-[95%] sm:w-[90%] md:w-[80%] lg:w-[70%] xl:w-[60%] 
      max-w-4xl h-[80vh] flex flex-col 
      mx-auto rounded-xl p-4 sm:p-6
    "
      >
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{note ? "Edit Note" : "Create New Note"}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-scroll overflow-y-auto scrollbar-hide">
          {/* Title */}
          <Input
            placeholder="Note title..."
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="text-lg font-semibold"
          />

          {/* Tags */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <span className="text-sm font-medium">Tags</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {tag}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => removeTag(tag)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addTag()}
                className="flex-1"
              />
              <Button variant="outline" size="sm" onClick={addTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col">
            <label className="text-sm font-medium mb-2">Content</label>
            <Textarea
              placeholder="Start writing your note..."
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              className="flex-1 resize-none min-h-[300px]"
            />
          </div>

          <div className="flex items-center w-full gap-2">
            {hasUnsavedChanges && (
              <span className="text-sm text-orange-500">Unsaved changes</span>
            )}
            <Button onClick={() => handleSave(true)} disabled={!title.trim()}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>

          {/* Metadata */}
          {note && (
            <div className="text-xs text-muted-foreground border-t pt-2">
              <div>Created: {new Date(note.createdAt).toLocaleDateString()}</div>
              <div>Last updated: {new Date(note.updatedAt).toLocaleDateString()}</div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Plus, X, Tag } from "lucide-react";

interface Lesson {
  id: number;
  title: string;
}

interface Note {
  id?: number;
  student?: number;
  lesson: number;
  content: string;
  is_private: boolean;
  created_at?: string;
  updated_at?: string;
}

interface NoteEditorProps {
  isOpen: boolean;
  onClose: () => void;
  note?: Note;
  onSave: (note: Note) => void;
  lessons: Lesson[];
}

export function NoteEditor({ isOpen, onClose, note, onSave, lessons }: NoteEditorProps) {
  const [lessonId, setLessonId] = useState<string>("");
  const [content, setContent] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync with incoming note
  useEffect(() => {
    if (note && isOpen) {
      setLessonId(note.lesson?.toString() || "");
      setContent(note.content || "");
      setIsPrivate(note.is_private ?? true);
    } else if (isOpen) {
      setLessonId("");
      setContent("");
      setIsPrivate(true);
    }
    setHasUnsavedChanges(false);
    setError(null);
  }, [note, isOpen]);

  // Auto-save
  useEffect(() => {
    if (!isOpen || !hasUnsavedChanges) return;

    const timer = setTimeout(() => {
      if (validate()) {
        handleSave(false);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [content, lessonId, isPrivate, hasUnsavedChanges, isOpen]);

  const validate = (): boolean => {
    if (!lessonId) {
      setError("Please select a lesson.");
      return false;
    }
    if (!content.trim()) {
      setError("Note content cannot be empty.");
      return false;
    }
    setError(null);
    return true;
  };

  const handleSave = (closeAfterSave = true) => {
    if (!validate()) return;

    const savedNote: Note = {
      ...(note?.id ? { id: note.id } : {}),
      lesson: parseInt(lessonId),
      content: content.trim(),
      is_private: isPrivate,
      created_at: note?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    onSave(savedNote);
    setHasUnsavedChanges(false);

    if (closeAfterSave) {
      onClose();
    }
  };

  const handleContentChange = (value: string) => {
    setContent(value);
    setHasUnsavedChanges(true);
  };

  const handleLessonChange = (value: string) => {
    setLessonId(value);
    setHasUnsavedChanges(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95%] sm:w-[90%] md:w-[80%] lg:w-[70%] xl:w-[60%] max-w-4xl h-[80vh] flex flex-col mx-auto rounded-xl p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{note ? "Edit Note" : "Create New Note"}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto">
          {/* Lesson Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Lesson
            </label>
            <Select value={lessonId} onValueChange={handleLessonChange}>
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

          {/* Privacy Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_private"
              checked={isPrivate}
              onChange={(e) => {
                setIsPrivate(e.target.checked);
                setHasUnsavedChanges(true);
              }}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="is_private" className="text-sm font-medium">
              Private note
            </label>
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

          {/* Error Message */}
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {/* Save Button + Unsaved Indicator */}
          <div className="flex items-center w-full gap-2">
            {hasUnsavedChanges && (
              <span className="text-sm text-orange-500">Unsaved changes</span>
            )}
            <Button
              onClick={() => handleSave(true)}
              disabled={!lessonId || !content.trim()}
              className="ml-auto"
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>

          {/* Metadata */}
          {note && (
            <div className="text-xs text-muted-foreground border-t pt-2">
              <div>Created: {new Date(note.created_at!).toLocaleDateString()}</div>
              <div>Last updated: {new Date(note.updated_at!).toLocaleDateString()}</div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
"use client";

import type React from "react";
import {useState, useEffect} from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {Spinner} from "@/components/ui/spinner";

interface SubjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject?: any;
  onSave: (subject: any) => void;
  loading?: boolean; // Added loading prop
}

export function SubjectModal({
  open,
  onOpenChange,
  subject,
  onSave,
  loading = false, // Default to false
}: SubjectModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
  });

  // Sync state with props when modal opens or subject changes
  useEffect(() => {
    if (open) {
      setFormData({
        name: subject?.name || "",
        code: subject?.code || "",
        description: subject?.description || "",
      });
    }
  }, [open, subject]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...subject,
      ...formData,
    });
    // REMOVED: onOpenChange(false) - Parent handles closing on success
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !loading && onOpenChange(val)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {subject ? "Edit Subject" : "Add New Subject"}
          </DialogTitle>
          <DialogDescription>
            {subject
              ? "Update subject information"
              : "Add a new subject to the system"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Subject Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({...formData, name: e.target.value})
                }
                required
                disabled={loading} // Disable input
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Subject Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    code: e.target.value.toUpperCase(),
                  })
                }
                placeholder="e.g., MATH, PHYS"
                required
                disabled={loading} // Disable input
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({...formData, description: e.target.value})
                }
                rows={3}
                disabled={loading} // Disable input
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading} // Disable cancel
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  {subject ? "Updating..." : "Adding..."}
                </>
              ) : (
                <>{subject ? "Update" : "Add"} Subject</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
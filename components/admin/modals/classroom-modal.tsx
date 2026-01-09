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

interface ClassroomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classroom?: {
    id: number;
    name: string;
    code: string;
    description?: string;
  };
  onSave: (data: any) => void;
  loading?: boolean; // Added loading prop
}

export function ClassroomModal({
  open,
  onOpenChange,
  classroom,
  onSave,
  loading = false, // Default to false
}: ClassroomModalProps) {
  const [formData, setFormData] = useState({
    name: classroom?.name || "",
    code: classroom?.code || "",
    description: classroom?.description || "",
  });

  // Reset form when modal opens or classroom changes
  useEffect(() => {
    if (open) {
      setFormData({
        name: classroom?.name || "",
        code: classroom?.code || "",
        description: classroom?.description || "",
      });
    }
  }, [open, classroom]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({...formData, id: classroom?.id || Date.now()});
    
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {classroom ? "Edit Classroom" : "Add New Classroom"}
            </DialogTitle>
            <DialogDescription>
              {classroom
                ? "Update classroom information"
                : "Create a new classroom for your organization"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Classroom Name</Label>
              <Input
                id="name"
                placeholder="e.g., Grade 10A"
                value={formData.name}
                onChange={(e) =>
                  setFormData({...formData, name: e.target.value})
                }
                required
                disabled={loading} // Disable input
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="code">Classroom Code</Label>
              <Input
                id="code"
                placeholder="e.g., G10A-2024"
                value={formData.code}
                onChange={(e) =>
                  setFormData({...formData, code: e.target.value})
                }
                required
                disabled={loading} // Disable input
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Enter classroom description..."
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
                  {classroom ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{classroom ? "Update" : "Create"} Classroom</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
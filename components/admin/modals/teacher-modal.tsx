"use client";

import type React from "react";

import {useState} from "react";
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

interface TeacherModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher?: any;
  onSave: (teacher: any) => void;
}

export function TeacherModal({
  open,
  onOpenChange,
  teacher,
  onSave,
}: TeacherModalProps) {
  const [formData, setFormData] = useState({
    name: teacher?.name || "",
    email: teacher?.email || "",
    specialties: teacher?.specialties?.join(", ") || "",
    experience: teacher?.experience || "",
    phone: teacher?.phone || "",
    bio: teacher?.bio || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...teacher,
      ...formData,
      specialties: formData.specialties.split(",").map((s: any) => s.trim()),
      experience: Number.parseInt(formData.experience),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {teacher ? "Edit Teacher" : "Add New Teacher"}
          </DialogTitle>
          <DialogDescription>
            {teacher
              ? "Update teacher information"
              : "Add a new teacher to the system"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({...formData, name: e.target.value})
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({...formData, email: e.target.value})
                  }
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({...formData, phone: e.target.value})
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience *</Label>
                <Input
                  id="experience"
                  type="number"
                  value={formData.experience}
                  onChange={(e) =>
                    setFormData({...formData, experience: e.target.value})
                  }
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialties">
                Specialties (comma-separated) *
              </Label>
              <Input
                id="specialties"
                value={formData.specialties}
                onChange={(e) =>
                  setFormData({...formData, specialties: e.target.value})
                }
                placeholder="e.g., Mathematics, Physics"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) =>
                  setFormData({...formData, bio: e.target.value})
                }
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{teacher ? "Update" : "Add"} Teacher</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

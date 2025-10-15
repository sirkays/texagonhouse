"use client";

import type React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Teacher {
  name: string;
  email: string;
  specialties: string[];
  experience: number | string;
  phone?: string;
  bio?: string;
  // ...any other fields you may have
}

interface TeacherModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher?: Partial<Teacher>;
  onSave: (teacher: Teacher) => void;
}

// Customize these options for your app:
const SPECIALTY_OPTIONS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "History",
  "Geography",
  "Computer Science",
];

export function TeacherModal({
  open,
  onOpenChange,
  teacher,
  onSave,
}: TeacherModalProps) {
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    specialties: string[];
    experience: string; // keep as string in form, parse on submit
    phone: string;
    bio: string;
  }>({
    name: teacher?.name || "",
    email: teacher?.email || "",
    specialties: teacher?.specialties || [],
    experience:
      (typeof teacher?.experience === "number"
        ? String(teacher.experience)
        : teacher?.experience) || "",
    phone: teacher?.phone || "",
    bio: teacher?.bio || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...(teacher as Teacher),
      ...formData,
      specialties: formData.specialties, // already an array
      experience: Number.parseInt(formData.experience),
    });
    onOpenChange(false);
  };

  const handleSpecialtiesChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selected = Array.from(
      e.target.selectedOptions,
      (opt) => opt.value
    );
    setFormData((prev) => ({ ...prev, specialties: selected }));
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
                    setFormData({ ...formData, name: e.target.value })
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
                    setFormData({ ...formData, email: e.target.value })
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
                    setFormData({ ...formData, phone: e.target.value })
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
                    setFormData({
                      ...formData,
                      experience: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>

            {/* MULTI-SELECT SPECIALTIES */}
            <div className="space-y-2">
              <Label htmlFor="specialties">
                Specialties (choose one or more) *
              </Label>
              <select
                id="specialties"
                multiple
                required
                value={formData.specialties}
                onChange={handleSpecialtiesChange}
                className="w-full min-h-[8rem] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {SPECIALTY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Hold Ctrl/Cmd to select multiple, or drag across options.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {teacher ? "Update" : "Add"} Teacher
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

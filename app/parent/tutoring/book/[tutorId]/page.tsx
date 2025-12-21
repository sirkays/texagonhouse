"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Spinner
} from "@/components/ui/spinner";
import {
  ChevronLeft,
  Video,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function BookTutorPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tutorId = params.tutorId as string;
  const tutorName = searchParams.get("name") || "Tutor";
  const courseName = searchParams.get("course") || "Tutoring";

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [children, setChildren] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [childId, setChildId] = useState<string>("");
  const [duration, setDuration] = useState<string>("1");
  const [preferredDays, setPreferredDays] = useState<string[]>([]);
  const [learningObjectives, setLearningObjectives] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [preferredTime, setPreferredTime] = useState<string>("");

  const dayOptions = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      const res = await fetch(`/api/tutor/tutoring/children`);
      if (res.ok) {
        const data = await res.json();
        setChildren(data);
      } else {
        setError("Failed to load children list");
      }
    } catch (err) {
      setError("An error occurred while loading children");
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day: string) => {
    setPreferredDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const validate = () => {
    if (!childId) return "Please select a child";
    if (preferredDays.length === 0) return "Please select at least one preferred day";
    if (!duration || parseInt(duration) < 1) return "Please enter a valid duration";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      alert(validationError);
      return;
    }

    setIsSubmitting(true);
    const payload = {
      student_id: parseInt(childId),
      private_tutoring_id: parseInt(tutorId),
      duration_hours: parseInt(duration),
      notes: `Learning objectives: ${learningObjectives}\nPreferred days: ${preferredDays.join(
        ", "
      )}\nPreferred time: ${preferredTime}\n${notes}`,
    };

    try {
      const res = await fetch("/api/tutor/tutoring/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/parent/tutoring?tab=upcoming");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to book tutoring");
      }
    } catch (err) {
      alert("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Spinner size="md" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-6">
      <nav className="mb-6">
        <Button
          variant="ghost"
          className="text-muted-foreground hover:text-[#EF7B55] hover:bg-[#F797711a]"
          onClick={() => router.back()}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Tutors
        </Button>
      </nav>

      <Card className="shadow-lg border-muted/50">
        <CardHeader className="border-b bg-slate-50/50 pb-6 pt-6 px-6 sm:px-10">
          <CardTitle className="text-xl font-bold text-slate-900 mb-1">
            Book {courseName} with {tutorName}
          </CardTitle>
          <CardDescription className="text-sm text-slate-500">
            Choose your preferences below. We'll confirm the session after submission.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 pt-8 px-6 sm:px-10">
            {error && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {/* Select Child - Mandatory */}
            <div className="space-y-2">
              <Label htmlFor="child" className="text-sm font-semibold text-slate-800">
                Select Child <span className="text-[#EF7B55]">*</span>
              </Label>
              <Select value={childId} onValueChange={setChildId}>
                <SelectTrigger id="child" className="h-11 text-sm border-slate-200 rounded-lg">
                  <SelectValue placeholder="Choose a child" />
                </SelectTrigger>
                <SelectContent>
                  {children.map((ch: any) => (
                    <SelectItem key={ch.id} value={ch.id.toString()} className="text-sm py-2">
                      {ch.name} <span className="text-muted-foreground ml-2 text-xs">({ch.classroom})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Preferred Days - Mandatory */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-800">
                Preferred Days <span className="text-[#EF7B55]">*</span>
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {dayOptions.map((day) => {
                  const isChecked = preferredDays.includes(day);
                  return (
                    <label
                      key={day}
                      className={cn(
                        "flex items-center justify-center rounded-lg border py-2 px-4 cursor-pointer transition-all duration-200 font-semibold text-xs",
                        isChecked
                          ? "border-[#EF7B55] bg-[#F797711a] text-[#EF7B55]"
                          : "border-slate-100 bg-white text-slate-400 hover:border-slate-200 hover:bg-slate-50"
                      )}
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => toggleDay(day)}
                        className="sr-only"
                      />
                      {day}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Duration & Preferred Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-sm font-semibold text-slate-800">
                  Duration (hours) <span className="text-[#EF7B55]">*</span>
                </Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  max="10"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="h-11 text-sm border-slate-200 rounded-lg px-4"
                  placeholder="e.g. 1"
                />
              </div>
              {/* <div className="space-y-2">
                <Label htmlFor="time" className="text-sm font-semibold text-slate-800">
                  Preferred Time <span className="text-slate-400 text-xs font-normal ml-2">(Optional)</span>
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="h-11 text-sm border-slate-200 rounded-lg px-4"
                />
              </div> */}
            </div>

            <div className="grid grid-cols-1 gap-6">
              {/* Optional Fields */}
              <div className="space-y-2">
                <Label htmlFor="objectives" className="text-sm font-semibold text-slate-800">
                  Learning Objectives <span className="text-slate-400 text-xs font-normal ml-2">(Optional)</span>
                </Label>
                <Textarea
                  id="objectives"
                  placeholder="e.g., Algebra foundations, differentiation techniques, essay structuring…"
                  value={learningObjectives}
                  onChange={(e) => setLearningObjectives(e.target.value)}
                  rows={4}
                  className="text-sm p-3 border-slate-200 rounded-lg focus:border-[#EF7B55] focus:ring-[#EF7B55] resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-semibold text-slate-800">
                  Notes <span className="text-slate-400 text-xs font-normal ml-2">(Optional)</span>
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Any other helpful details for the tutor…"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="text-sm p-3 border-slate-200 rounded-lg focus:border-[#EF7B55] focus:ring-[#EF7B55] resize-none"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row sm:justify-end border-t bg-slate-50/50 space-y-3 sm:space-y-0 sm:space-x-4 p-6 sm:p-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 h-10 text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 h-10 bg-transparent border-2 border-[#EF7B55] text-[#EF7B55] hover:bg-[#EF7B55] hover:text-white font-bold transition-all duration-300 text-sm"
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Video className="mr-2 h-4 w-4" />
                  Confirm Booking
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div >
  );
}

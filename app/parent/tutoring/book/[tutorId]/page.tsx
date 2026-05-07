"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import {
  ChevronLeft,
  Video,
  AlertCircle,
  Clock,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function pad(n: number) {
  return String(n).padStart(2, "0");
}

function to24(hour: number, minute: number, period: "AM" | "PM"): string {
  if (hour === 0) return "";
  let h = hour;
  if (period === "AM" && hour === 12) h = 0;
  if (period === "PM" && hour !== 12) h = hour + 12;
  return `${pad(h)}:${pad(minute)}`;
}

function from24(val: string): { hour: number; minute: number; period: "AM" | "PM" } {
  if (!val) return { hour: 0, minute: 0, period: "AM" };
  const [hStr, mStr] = val.split(":");
  const h24 = parseInt(hStr);
  const m = parseInt(mStr);
  const period: "AM" | "PM" = h24 < 12 ? "AM" : "PM";
  const hour = h24 % 12 === 0 ? 12 : h24 % 12;
  return { hour, minute: m, period };
}

function formatDisplay(h: number, m: number, period: "AM" | "PM") {
  if (h === 0) return "—";
  return `${pad(h)}:${pad(m)} ${period}`;
}

function minutesBetween(start: string, end: string): number | null {
  if (!start || !end) return null;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const diff = eh * 60 + em - (sh * 60 + sm);
  return diff > 0 ? diff : null;
}

// ─── Scrollable drum-roll column ─────────────────────────────────────────────
const ITEM_H = 40;

function ScrollColumn<T extends string | number>({
  items,
  value,
  onChange,
  label,
  fmt,
}: {
  items: T[];
  value: T;
  onChange: (v: T) => void;
  label?: string;
  fmt?: (v: T) => string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const nudge = (dir: -1 | 1) => {
    const idx = items.indexOf(value);
    const next = Math.max(0, Math.min(items.length - 1, idx + dir));
    onChange(items[next]);
  };

  useEffect(() => {
    const idx = items.indexOf(value);
    ref.current?.scrollTo({ top: idx * ITEM_H, behavior: "smooth" });
  }, [value, items]);

  return (
    <div className="flex flex-col items-center gap-0.5 select-none">
      {label && (
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
          {label}
        </span>
      )}

      <button
        type="button"
        onClick={() => nudge(-1)}
        className="p-1 rounded-full hover:bg-orange-50 text-slate-300 hover:text-[#EF7B55] transition-colors"
      >
        <ChevronUp className="h-4 w-4" />
      </button>

      {/* Window showing 3 items */}
      <div ref={ref} className="overflow-hidden relative" style={{ height: ITEM_H * 3 }}>
        {/* Selection highlight */}
        <div
          className="absolute inset-x-0 rounded-xl bg-orange-50 border border-[#EF7B55]/30 pointer-events-none"
          style={{ top: ITEM_H, height: ITEM_H }}
        />
        {items.map((item) => {
          const active = item === value;
          const dist = Math.abs(items.indexOf(item) - items.indexOf(value));
          return (
            <div
              key={String(item)}
              onClick={() => onChange(item)}
              style={{ height: ITEM_H }}
              className={cn(
                "flex items-center justify-center w-14 cursor-pointer font-mono rounded-lg transition-all duration-150",
                active
                  ? "text-[#EF7B55] font-bold text-lg"
                  : dist === 1
                  ? "text-slate-500 text-sm opacity-50"
                  : "text-slate-300 text-xs opacity-20"
              )}
            >
              {fmt ? fmt(item) : String(item)}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => nudge(1)}
        className="p-1 rounded-full hover:bg-orange-50 text-slate-300 hover:text-[#EF7B55] transition-colors"
      >
        <ChevronDown className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── Time Picker ─────────────────────────────────────────────────────────────
const HOURS: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MINUTES: number[] = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
const PERIODS: ("AM" | "PM")[] = ["AM", "PM"];

function TimePicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const init = from24(value);
  const [hour, setHour] = useState(init.hour || 12);
  const [minute, setMinute] = useState(init.minute);
  const [period, setPeriod] = useState<"AM" | "PM">(init.period);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Push to parent whenever internal state changes (but only when panel is open)
  useEffect(() => {
    if (open) onChange(to24(hour, minute, period));
  }, [hour, minute, period, open]);

  // Sync when parent clears value externally
  useEffect(() => {
    if (!value) {
      setHour(12);
      setMinute(0);
      setPeriod("AM");
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const displayVal = value
    ? (() => { const p = from24(value); return formatDisplay(p.hour, p.minute, p.period); })()
    : null;

  return (
    <div ref={wrapRef} className="relative">
      <Label className="text-sm font-semibold text-slate-700 mb-2 block">
        {label}{" "}
        <span className="text-slate-400 text-xs font-normal">(Optional)</span>
      </Label>

      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "w-full flex items-center gap-3 px-4 h-12 rounded-xl border-2 text-sm font-medium transition-all duration-200",
          open
            ? "border-[#EF7B55] bg-orange-50 text-[#EF7B55] ring-4 ring-orange-100"
            : value
            ? "border-[#EF7B55]/40 bg-white text-slate-800 hover:border-[#EF7B55]/60"
            : "border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:bg-slate-50"
        )}
      >
        <Clock className="h-4 w-4 shrink-0 text-[#EF7B55]" />
        <span className={cn("flex-1 text-left font-semibold", !value && "font-normal text-slate-400")}>
          {displayVal ?? "Pick a time"}
        </span>
        {value && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            className="text-slate-300 hover:text-slate-600 text-xl leading-none cursor-pointer"
          >
            ×
          </span>
        )}
      </button>

      {/* Dropdown drum picker */}
      {open && (
        <div className="absolute z-50 top-[calc(100%+8px)] left-0 bg-white rounded-2xl shadow-2xl border border-slate-100 p-5 w-[260px]">
          {/* Columns */}
          <div className="flex items-start justify-center gap-1">
            <ScrollColumn items={HOURS} value={hour} onChange={setHour} label="Hour" fmt={pad} />

            <div className="flex items-center self-center text-slate-300 font-black text-2xl pt-6">
              :
            </div>

            <ScrollColumn items={MINUTES} value={minute} onChange={setMinute} label="Min" fmt={pad} />

            {/* AM / PM toggle */}
            <div className="flex flex-col gap-2 self-center pt-6 ml-2">
              {PERIODS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "w-12 py-2 rounded-xl text-xs font-bold transition-all duration-150",
                    period === p
                      ? "bg-[#EF7B55] text-white shadow-md shadow-orange-200"
                      : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Confirm CTA */}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-4 w-full py-2.5 rounded-xl bg-[#EF7B55] text-white text-sm font-bold hover:bg-[#e06840] active:scale-[0.98] transition-all"
          >
            Set {label}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Duration pills ───────────────────────────────────────────────────────────
const QUICK_DURATIONS = [1, 2, 3, 4, 5, 6];

// ─── Main Page ────────────────────────────────────────────────────────────────
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
  const [childId, setChildId] = useState("");
  const [duration, setDuration] = useState(2);
  const [preferredDays, setPreferredDays] = useState<string[]>([]);
  const [learningObjectives, setLearningObjectives] = useState("");
  const [notes, setNotes] = useState("");
  const [sessionStartTime, setSessionStartTime] = useState("");
  const [sessionEndTime, setSessionEndTime] = useState("");

  const DAY_OPTIONS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  useEffect(() => { fetchChildren(); }, []);

  const fetchChildren = async () => {
    try {
      const res = await fetch("/api/tutor/tutoring/children");
      if (res.ok) setChildren(await res.json());
      else setError("Failed to load children list");
    } catch {
      setError("An error occurred while loading children");
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day: string) =>
    setPreferredDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );

  const validate = () => {
    if (!childId) return "Please select a child";
    if (!preferredDays.length) return "Please select at least one preferred day";
    if (duration < 1) return "Please enter a valid duration";
    if ((sessionStartTime && !sessionEndTime) || (!sessionStartTime && sessionEndTime))
      return "Provide both Start Time and End Time, or leave both empty";
    if (sessionStartTime && sessionEndTime && sessionStartTime >= sessionEndTime)
      return "End Time must be after Start Time";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { alert(err); return; }
    setIsSubmitting(true);

    const payload: Record<string, any> = {
      student_id: parseInt(childId),
      private_tutoring_id: parseInt(tutorId),
      duration_hours: duration,
      notes: `Learning objectives: ${learningObjectives}\nPreferred days: ${preferredDays.join(", ")}\n${notes}`,
    };
    if (sessionStartTime) payload.session_start_time = sessionStartTime;
    if (sessionEndTime)   payload.session_end_time   = sessionEndTime;

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
    } catch {
      alert("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const rangeMinutes = minutesBetween(sessionStartTime, sessionEndTime);
  const rangeLabel = rangeMinutes
    ? `${Math.floor(rangeMinutes / 60)}h${rangeMinutes % 60 ? ` ${rangeMinutes % 60}m` : ""}`.trim()
    : null;

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Spinner size="md" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-6">
      {/* Back nav */}
      <nav className="mb-6">
        <Button
          variant="ghost"
          className="text-muted-foreground hover:text-[#EF7B55] hover:bg-orange-50"
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
            Choose your preferences below. We&apos;ll confirm the session after submission.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-8 pt-8 px-6 sm:px-10">
            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {/* ── Select Child ── */}
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
                      {ch.name}{" "}
                      <span className="text-muted-foreground ml-2 text-xs">({ch.classroom})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* ── Preferred Days ── */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-800">
                Preferred Days <span className="text-[#EF7B55]">*</span>
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {DAY_OPTIONS.map((day) => {
                  const checked = preferredDays.includes(day);
                  return (
                    <label
                      key={day}
                      className={cn(
                        "flex items-center justify-center rounded-lg border py-2 px-4 cursor-pointer transition-all duration-200 font-semibold text-xs",
                        checked
                          ? "border-[#EF7B55] bg-orange-50 text-[#EF7B55]"
                          : "border-slate-100 bg-white text-slate-400 hover:border-slate-200 hover:bg-slate-50"
                      )}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggleDay(day)}
                        className="sr-only"
                      />
                      {day}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* ── Duration pills ── */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-slate-800">
                Duration (hours) <span className="text-[#EF7B55]">*</span>
              </Label>
              <div className="flex flex-wrap gap-2 items-center">
                {QUICK_DURATIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuration(d)}
                    className={cn(
                      "px-5 py-2 rounded-full text-sm font-bold border-2 transition-all duration-200",
                      duration === d
                        ? "border-[#EF7B55] bg-[#EF7B55] text-white shadow-sm shadow-orange-200"
                        : "border-slate-200 text-slate-500 hover:border-[#EF7B55]/40 hover:text-[#EF7B55]"
                    )}
                  >
                    {d}h
                  </button>
                ))}
                {/* Custom input */}
                <div className="flex items-center gap-2 border-2 border-slate-200 rounded-full px-4 py-1.5 hover:border-slate-300 transition-colors">
                  <span className="text-xs text-slate-400 font-medium">Custom:</span>
                  <input
                    type="number"
                    min={1}
                    max={24}
                    value={QUICK_DURATIONS.includes(duration) ? "" : duration}
                    placeholder="hrs"
                    onChange={(e) => {
                      const v = parseInt(e.target.value);
                      if (!isNaN(v) && v > 0) setDuration(v);
                    }}
                    className="w-12 text-sm text-center outline-none bg-transparent text-slate-700 font-semibold placeholder:text-slate-300"
                  />
                </div>
              </div>
            </div>

            {/* ── Session Time Range ── */}
            <div className="space-y-4">
              {/* Header row */}
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-slate-800">
                  Session Time Range{" "}
                  <span className="text-slate-400 text-xs font-normal">(Optional)</span>
                </Label>
                {rangeLabel && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-orange-50 text-[#EF7B55] border border-[#EF7B55]/20">
                    <Clock className="h-3 w-3" />
                    {rangeLabel} window
                  </span>
                )}
              </div>

              {/* Two pickers side by side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TimePicker label="Start Time" value={sessionStartTime} onChange={setSessionStartTime} />
                <TimePicker label="End Time"   value={sessionEndTime}   onChange={setSessionEndTime}   />
              </div>

              {/* Live preview banner — appears as soon as either is set */}
              {(sessionStartTime || sessionEndTime) && (
                <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-orange-50 to-white border border-[#EF7B55]/20 px-5 py-3.5">
                  <Clock className="h-4 w-4 text-[#EF7B55] shrink-0" />
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-bold text-slate-800">
                      {sessionStartTime
                        ? formatDisplay(from24(sessionStartTime).hour, from24(sessionStartTime).minute, from24(sessionStartTime).period)
                        : <span className="text-slate-300 font-normal italic">not set</span>}
                    </span>
                    <span className="text-[#EF7B55] font-black text-base">→</span>
                    <span className="font-bold text-slate-800">
                      {sessionEndTime
                        ? formatDisplay(from24(sessionEndTime).hour, from24(sessionEndTime).minute, from24(sessionEndTime).period)
                        : <span className="text-slate-300 font-normal italic">not set</span>}
                    </span>
                    {rangeLabel && (
                      <span className="text-xs text-slate-400 ml-1">· {rangeLabel} total</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ── Optional text fields ── */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="objectives" className="text-sm font-semibold text-slate-800">
                  Learning Objectives{" "}
                  <span className="text-slate-400 text-xs font-normal ml-1">(Optional)</span>
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
                  Notes{" "}
                  <span className="text-slate-400 text-xs font-normal ml-1">(Optional)</span>
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
                  Processing…
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
    </div>
  );
}

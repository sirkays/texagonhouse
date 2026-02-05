
"use client";

import * as React from "react";
import {useState, useEffect} from "react";
import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {Textarea} from "@/components/ui/textarea";
import {Spinner} from "@/components/ui/spinner";
import {Check, ChevronsUpDown, ChevronLeft} from "lucide-react";
import {cn} from "@/lib/utils";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";

interface Course {
  id: string;
  name: string;
  subject: string;
}

export default function CreatePrivateTutoringPage() {
  const {data: session, status} = useSession();
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State (matching original modal names/defaults)
  const [privateCourseId, setPrivateCourseId] = useState<string>("");
  const [privateTitle, setPrivateTitle] = useState("My Private Tutoring");
  const [ratePerHour, setRatePerHour] = useState<string>("");
  const [tutoringDurationDays, setTutoringDurationDays] = useState<number>(24);
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [privateNotes, setPrivateNotes] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchCourses();
    }
  }, [status]);

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/teacher/courses?course_type=private", {
        headers: {
          "Content-Type": "application/json",
          "X-Session-Token": session?.user?.sessionToken || "",
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      }
    } catch (err) {
      console.error("Failed to fetch courses", err);
    } finally {
      setCoursesLoading(false);
    }
  };

  const toggleDay = (day: string) => {
    setAvailableDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleCreatePrivateSession = async () => {
    setError(null);

    // Validation (matching requested logic + original modal error format)
    if (
      !privateCourseId ||
      !ratePerHour ||
      availableDays.length === 0 ||
      !privateTitle.trim() ||
      tutoringDurationDays < 1 ||
      !privateNotes.trim()
    ) {
      setError(
        "Please fill in all required fields: course, title, rate, duration, available days, and notes"
      );
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/teacher/tutoring-bookings/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Token": session?.user?.sessionToken || "",
        },
        body: JSON.stringify({
          course: privateCourseId,
          title: privateTitle,
          rate_per_hour: parseFloat(ratePerHour).toFixed(2),
          tutoring_duration_days: tutoringDurationDays,
          notes: privateNotes?.trim().slice(0, 225),
          available_days: availableDays.map((day) => ({day})),
        }),
      });

      if (response.ok) {
        router.push("/teacher/tutoring?tab=private");
      } else {
        const data = await response.json();
        setError(data.error || "Failed to create private session");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading" || coursesLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-transparent">
        <Spinner size="md" className="text-orange-500" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="text-muted-foreground hover:text-[#EF7B55]">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      </div>

      <Card className="w-full max-w-[700px] mx-auto overflow-hidden rounded-lg border shadow-sm">
        <CardHeader className="p-4 sm:p-6 bg-background border-b">
          <CardTitle className="text-xl font-bold">
            Create Private Session
          </CardTitle>
          <CardDescription className="text-sm">
            Configure your private tutoring offering
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-4">
          {error && (
            <div className="bg-red-100 text-red-800 p-4 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="course">
                Course <span className="text-[#EF7B55]">*</span>
              </Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between">
                    {privateCourseId
                      ? courses.find((c) => c.id.toString() === privateCourseId)
                          ?.name +
                        " (" +
                        courses.find((c) => c.id.toString() === privateCourseId)
                          ?.subject +
                        ")"
                      : "Select course..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search course..." />
                    <CommandEmpty>No course found.</CommandEmpty>
                    <CommandGroup>
                      {courses.map((c) => (
                        <CommandItem
                          key={c.id}
                          value={`${c.name} ${c.subject}`}
                          onSelect={() => {
                            setPrivateCourseId(c.id.toString());
                            setOpen(false);
                          }}>
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              privateCourseId === c.id.toString()
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {c.name} ({c.subject})
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-[#EF7B55]">*</span>
              </Label>
              <input
                id="title"
                type="text"
                value={privateTitle}
                onChange={(e) => setPrivateTitle(e.target.value)}
                placeholder="My Private Tutoring"
                className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate">
                Rate per hour <span className="text-[#EF7B55]">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  ₦
                </span>
                <input
                  id="rate"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={ratePerHour || ""}
                  onChange={(e) => {
                    let val = e.target.value.replace(/[^0-9.]/g, "");
                    const parts = val.split(".");
                    if (parts.length > 2) {
                      val = parts[0] + "." + parts.slice(1).join("");
                    }
                    if (parts[1] && parts[1].length > 2) {
                      val = parts[0] + "." + parts[1].substring(0, 2);
                    }
                    setRatePerHour(val);
                  }}
                  onBlur={(e) => {
                    const val = e.target.value;
                    if (val) {
                      setRatePerHour(parseFloat(val).toFixed(2));
                    }
                  }}
                  placeholder="7500"
                  className="w-full pl-8 pr-12 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  /hour
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration-days">
                Tutoring Duration (days){" "}
                <span className="text-[#EF7B55]">*</span>
              </Label>
              <input
                id="duration-days"
                type="number"
                min={1}
                value={tutoringDurationDays}
                onChange={(e) =>
                  setTutoringDurationDays(Number(e.target.value || 1))
                }
                className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="space-y-2">
              <Label>
                Available Days <span className="text-[#EF7B55]">*</span>
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {[
                  "monday",
                  "tuesday",
                  "wednesday",
                  "thursday",
                  "friday",
                  "saturday",
                  "sunday",
                ].map((d) => (
                  <Button
                    key={d}
                    type="button"
                    variant={availableDays.includes(d) ? "default" : "outline"}
                    className={cn(
                      "justify-start transition-colors",
                      availableDays.includes(d) &&
                        "bg-[#EF7B55] hover:bg-[#F79771]"
                    )}
                    onClick={() => toggleDay(d)}>
                    {availableDays.includes(d) && (
                      <Check className="h-3 w-3 mr-2" />
                    )}
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">
                Notes <span className="text-[#EF7B55]">*</span>
              </Label>
              <Textarea
                id="notes"
                placeholder="Any specific requirements or preferences..."
                rows={3}
                className="w-full resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={privateNotes}
                onChange={(e) => setPrivateNotes(e.target.value)}
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-4 sm:p-6 border-t bg-muted/10 flex flex-col sm:flex-row sm:justify-end gap-2 sm:gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="w-full sm:w-auto px-6"
            disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleCreatePrivateSession}
            className="w-full sm:w-auto h-10 bg-transparent border border-[#EF7B55]/70 text-[#EF7B55]/70 hover:bg-[#F79771]/20 px-6"
            disabled={submitting}>
            {submitting ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Creating...
              </>
            ) : (
              "Create Private Session"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

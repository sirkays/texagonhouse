"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Search,
  UserPlus,
  UserMinus,
  RefreshCw,
  Users,
  ArrowRight,
  CheckCheck,
  Loader2,
  X,
  ClipboardList,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Student {
  id: number;
  name: string;
  email: string;
  admission_no: string;
  current_classroom: { id: number; name: string } | null;
}

interface ClassroomInfo {
  id: number;
  name: string;
  code: string;
}

interface StudentsData {
  classroom: ClassroomInfo;
  enrolled: Student[];
  available: Student[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initials(name: string) {
  if (!name) return "";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
}

function avatarColor(name: string) {
  if (!name) return "bg-gray-500";
  const colors = [
    "bg-blue-500",
    "bg-purple-500",
    "bg-green-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-indigo-500",
    "bg-teal-500",
    "bg-pink-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function StudentRow({
  student,
  checked,
  onToggle,
  badge,
}: {
  student: Student;
  checked: boolean;
  onToggle: (id: number) => void;
  badge?: string;
}) {
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
        checked
          ? "bg-primary/8 border border-primary/20"
          : "hover:bg-muted/60 border border-transparent"
      }`}
      onClick={() => onToggle(student.id)}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={() => onToggle(student.id)}
        onClick={(e) => e.stopPropagation()}
        className="shrink-0"
        id={`student-${student.id}`}
      />
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className={`text-xs font-semibold text-white ${avatarColor(student.name || student.email)}`}>
          {initials(student.name || student.email)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground truncate leading-tight">
          {student.name || <span className="text-muted-foreground italic">No name</span>}
        </p>
        <p className="text-xs text-muted-foreground truncate">{student.email}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {student.admission_no && (
          <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            {student.admission_no}
          </span>
        )}
        {badge && (
          <Badge variant="secondary" className="text-[10px] px-1.5 bg-primary/20 text-primary hover:bg-primary/30">
            {badge}
          </Badge>
        )}
        {student.current_classroom && (
          <Badge
            variant="outline"
            className="text-[10px] px-1.5 max-w-[120px] truncate border-amber-200 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300"
            title={student.current_classroom.name}
          >
            {student.current_classroom.name}
          </Badge>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ManageStudentsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const classroomId = params.id as string;

  const [data, setData] = useState<StudentsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeTab, setActiveTab] = useState("browse");

  const [onlyUnassigned, setOnlyUnassigned] = useState(false);

  // Multi-select sets
  const [selectedEnrolled, setSelectedEnrolled] = useState<Set<number>>(new Set());
  const [selectedAvailable, setSelectedAvailable] = useState<Set<number>>(new Set());

  // Bulk import state
  const [bulkInput, setBulkInput] = useState("");

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Fetch data
  const fetchStudents = useCallback(
    async (searchTerm = "") => {
      if (!classroomId) return;
      setLoading(true);
      try {
        const qs = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : "";
        const res = await fetch(`/api/admin/classrooms/${classroomId}/students${qs}`);
        if (!res.ok) throw new Error(await res.text());
        const json: StudentsData = await res.json();
        setData(json);
        setSelectedEnrolled(new Set());
        setSelectedAvailable(new Set());
      } catch (err: any) {
        toast({
          title: "Error",
          description: err.message || "Failed to load students.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [classroomId, toast]
  );

  useEffect(() => {
    if (classroomId) {
      fetchStudents(debouncedSearch);
    }
  }, [debouncedSearch, classroomId, fetchStudents]);

  // Selection helpers
  const toggleEnrolled = (id: number) => {
    setSelectedEnrolled((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAvailable = (id: number) => {
    setSelectedAvailable((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Filter available students based on the "onlyUnassigned" toggle
  const filteredAvailable = useMemo(() => {
    if (!data) return [];
    if (onlyUnassigned) {
      return data.available.filter(s => !s.current_classroom);
    }
    return data.available;
  }, [data, onlyUnassigned]);

  const selectAllEnrolled = () => {
    if (!data) return;
    const allIds = new Set(data.enrolled.map((s) => s.id));
    setSelectedEnrolled(
      selectedEnrolled.size === allIds.size ? new Set() : allIds
    );
  };

  const selectAllAvailable = () => {
    if (!filteredAvailable) return;
    const allIds = new Set(filteredAvailable.map((s) => s.id));
    setSelectedAvailable(
      selectedAvailable.size === allIds.size ? new Set() : allIds
    );
  };

  // Bulk save
  const hasChanges = selectedEnrolled.size > 0 || selectedAvailable.size > 0;

  const handleApply = async () => {
    if (!classroomId || !hasChanges) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/classrooms/${classroomId}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          add: Array.from(selectedAvailable),
          remove: Array.from(selectedEnrolled),
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const result = await res.json();
      toast({
        title: "Classroom updated",
        description: `${result.added ?? 0} student(s) added, ${result.removed ?? 0} removed.`,
      });
      fetchStudents(debouncedSearch);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update students.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Counts
  const enrolledCount = data?.enrolled.length ?? 0;
  const availableCount = filteredAvailable.length;

  // Bulk name matching
  const parsedNames = useMemo(() => {
    return bulkInput
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split(/\t|,|\s+/).map((p) => p.trim()).filter(Boolean);
        if (parts.length >= 2) {
          return { first: parts[0].toLowerCase(), last: parts[parts.length - 1].toLowerCase(), raw: line };
        }
        return { first: parts[0]?.toLowerCase() ?? "", last: "", raw: line };
      });
  }, [bulkInput]);

  const bulkResults = useMemo(() => {
    if (!data || parsedNames.length === 0) return [];
    const all = [...data.available, ...data.enrolled];
    return parsedNames.map((entry) => {
      const match = all.find((s) => {
        const name = (s.name || "").toLowerCase();
        const nameParts = name.split(" ");
        const firstMatch = nameParts.some((p) => p.startsWith(entry.first));
        const lastMatch = entry.last ? nameParts.some((p) => p.startsWith(entry.last)) : true;
        return firstMatch && lastMatch;
      });
      return { raw: entry.raw, student: match ?? null, inEnrolled: match ? data.enrolled.some((e) => e.id === match.id) : false };
    });
  }, [parsedNames, data]);

  const bulkMatched = bulkResults.filter((r) => r.student && !r.inEnrolled);
  const bulkAlreadyEnrolled = bulkResults.filter((r) => r.student && r.inEnrolled);
  const bulkUnmatched = bulkResults.filter((r) => !r.student);

  const selectAllBulkMatches = () => {
    const ids = new Set<number>(bulkMatched.map((r) => r.student!.id));
    setSelectedAvailable((prev) => new Set([...prev, ...ids]));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.24))] sm:h-[calc(100vh-theme(spacing.20))] w-full rounded-md border shadow-sm overflow-hidden bg-background">
      {/* Header */}
      <div className="px-6 py-5 border-b shrink-0 bg-background flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/admin/classrooms")}
              className="shrink-0 rounded-full h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-xl font-semibold tracking-tight text-foreground truncate flex items-center gap-2">
                Manage Students 
                {data?.classroom && (
                  <span className="text-muted-foreground font-normal hidden sm:inline">
                    — {data.classroom.name}
                  </span>
                )}
              </h1>
              {data?.classroom && (
                <p className="text-xs text-muted-foreground mt-0.5 sm:hidden truncate">
                  {data.classroom.name}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 h-8"
            onClick={() => fetchStudents(debouncedSearch)}
            disabled={loading}
          >
            <RefreshCw className={`h-3.5 w-3.5 sm:mr-2 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:flex">
            <TabsTrigger value="browse" className="gap-1.5">
              <Users className="h-4 w-4" />
              Browse
            </TabsTrigger>
            <TabsTrigger value="bulk" className="gap-1.5">
              <ClipboardList className="h-4 w-4" />
              Bulk Import
              {parsedNames.length > 0 && (
                <Badge className="ml-1 text-[10px] px-1.5 h-4">{parsedNames.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Filters for Browse Tab */}
        {activeTab === "browse" && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-1">
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, email or admission no…"
                className="pl-9 pr-9 h-9 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setSearch("")}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            
            <div className="flex items-center space-x-2 bg-muted/50 px-3 py-1.5 rounded-full">
              <Switch
                id="only-unassigned"
                checked={onlyUnassigned}
                onCheckedChange={setOnlyUnassigned}
              />
              <Label htmlFor="only-unassigned" className="text-sm font-medium cursor-pointer">
                Hide students in other classes
              </Label>
            </div>
          </div>
        )}
      </div>

      {/* Body */}
      {loading && !data ? (
        <div className="flex-1 flex items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Tabs value={activeTab} className="flex-1 min-h-0 flex flex-col bg-background">
          {/* BULK IMPORT TAB */}
          <TabsContent value="bulk" className="flex-1 min-h-0 flex flex-col m-0 data-[state=inactive]:hidden">
            <div className="flex-1 min-h-0 flex flex-col gap-0 max-w-5xl mx-auto w-full">
              {/* Paste area */}
              <div className="px-6 pt-6 pb-4 border-b">
                <p className="text-sm text-muted-foreground mb-3">
                  Paste names from Excel (one per line, tab-separated <strong>firstname</strong> then <strong>lastname</strong>):
                </p>
                <Textarea
                  placeholder={"Christopher\tMoneke\nDiva\tMichael\nJohn\tDoe"}
                  className="font-mono text-sm resize-none h-32"
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                />
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-3">
                  <span className="text-sm text-muted-foreground">
                    {parsedNames.length} name{parsedNames.length !== 1 ? "s" : ""} parsed ·{" "}
                    <span className="text-green-600 font-medium">{bulkMatched.length} matched</span>
                    {bulkUnmatched.length > 0 && (
                      <> · <span className="text-destructive font-medium">{bulkUnmatched.length} not found</span></>
                    )}
                    {bulkAlreadyEnrolled.length > 0 && (
                      <> · <span className="text-muted-foreground">{bulkAlreadyEnrolled.length} already enrolled</span></>
                    )}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-sm shrink-0"
                    disabled={bulkMatched.length === 0}
                    onClick={selectAllBulkMatches}
                  >
                    <CheckCheck className="h-4 w-4 mr-2" />
                    Select all matched
                  </Button>
                </div>
              </div>
              {/* Results */}
              <ScrollArea className="flex-1">
                <div className="p-6 space-y-2">
                  {parsedNames.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                      <ClipboardList className="h-12 w-12 mb-4 opacity-20" />
                      <p className="text-base">Paste names above to find students</p>
                    </div>
                  )}
                  {bulkResults.map((r, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-4 px-4 py-3 rounded-lg border text-sm ${
                        r.inEnrolled
                          ? "border-amber-200 bg-amber-50 dark:bg-amber-950/20"
                          : r.student
                          ? selectedAvailable.has(r.student.id)
                            ? "border-primary/20 bg-primary/8 cursor-pointer"
                            : "border-transparent hover:bg-muted/60 cursor-pointer"
                          : "border-destructive/20 bg-destructive/5"
                      }`}
                      onClick={() => {
                        if (r.student && !r.inEnrolled) toggleAvailable(r.student.id);
                      }}
                    >
                      {r.student && !r.inEnrolled ? (
                        <Checkbox
                          checked={selectedAvailable.has(r.student.id)}
                          onCheckedChange={() => toggleAvailable(r.student!.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="shrink-0"
                        />
                      ) : (
                        <div className="w-4 h-4 shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-xs text-muted-foreground truncate">{r.raw}</p>
                        {r.student ? (
                          <p className="text-sm font-medium truncate mt-0.5">
                            {r.student.name}
                            <span className="ml-2 text-xs text-muted-foreground">{r.student.email}</span>
                          </p>
                        ) : (
                          <p className="text-sm text-destructive mt-0.5">No match found</p>
                        )}
                      </div>
                      <div className="shrink-0 flex items-center gap-2">
                        {r.inEnrolled && <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">Enrolled</Badge>}
                        {r.student && !r.inEnrolled && selectedAvailable.has(r.student.id) && (
                          <Badge className="text-xs bg-green-600 text-white">Add</Badge>
                        )}
                        {!r.student && (
                          <AlertTriangle className="h-5 w-5 text-destructive/60" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          {/* BROWSE TAB */}
          <TabsContent value="browse" className="flex-1 min-h-0 m-0 data-[state=inactive]:hidden">
            <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x h-full">
              {/* Enrolled students (left panel) */}
              <div className="flex flex-col min-h-0">
                <div className="flex items-center justify-between px-6 py-3 bg-red-50/50 dark:bg-red-950/10 border-b shrink-0">
                  <div className="flex items-center gap-2">
                    <UserMinus className="h-4 w-4 text-red-600 dark:text-red-400" />
                    <span className="text-sm font-semibold text-red-700 dark:text-red-300">
                      Enrolled
                    </span>
                    <Badge variant="secondary" className="text-xs ml-1">
                      {enrolledCount}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    {selectedEnrolled.size > 0 && (
                      <Badge className="text-[10px] bg-red-600 text-white">
                        {selectedEnrolled.size} to remove
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs px-2"
                      onClick={selectAllEnrolled}
                      disabled={enrolledCount === 0}
                    >
                      <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
                      {selectedEnrolled.size === enrolledCount && enrolledCount > 0
                        ? "Deselect all"
                        : "Select all"}
                    </Button>
                  </div>
                </div>

                <ScrollArea className="flex-1">
                  <div className="p-3 space-y-1">
                    {enrolledCount === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
                        <Users className="h-10 w-10 mb-3 opacity-30" />
                        <p className="text-base">No enrolled students</p>
                        {search && (
                          <p className="text-sm mt-1">Try clearing the search</p>
                        )}
                      </div>
                    ) : (
                      data?.enrolled.map((student) => (
                        <StudentRow
                          key={student.id}
                          student={student}
                          checked={selectedEnrolled.has(student.id)}
                          onToggle={toggleEnrolled}
                          badge={selectedEnrolled.has(student.id) ? "Remove" : undefined}
                        />
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Available students (right panel) */}
              <div className="flex flex-col min-h-0">
                <div className="flex items-center justify-between px-6 py-3 bg-green-50/50 dark:bg-green-950/10 border-b shrink-0">
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                      Available
                    </span>
                    <Badge variant="secondary" className="text-xs ml-1">
                      {availableCount}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    {selectedAvailable.size > 0 && (
                      <Badge className="text-[10px] bg-green-600 text-white">
                        {selectedAvailable.size} to add
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs px-2"
                      onClick={selectAllAvailable}
                      disabled={availableCount === 0}
                    >
                      <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
                      {selectedAvailable.size === availableCount && availableCount > 0
                        ? "Deselect all"
                        : "Select all"}
                    </Button>
                  </div>
                </div>

                <ScrollArea className="flex-1">
                  <div className="p-3 space-y-1">
                    {availableCount === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
                        <Users className="h-10 w-10 mb-3 opacity-30" />
                        <p className="text-base">No available students</p>
                        {search && (
                          <p className="text-sm mt-1">Try clearing the search</p>
                        )}
                      </div>
                    ) : (
                      filteredAvailable.map((student) => (
                        <StudentRow
                          key={student.id}
                          student={student}
                          checked={selectedAvailable.has(student.id)}
                          onToggle={toggleAvailable}
                          badge={selectedAvailable.has(student.id) ? "Add" : undefined}
                        />
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Footer */}
      <div className="px-6 py-4 bg-muted/20 shrink-0 border-t flex-none">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
          <div className="text-sm text-muted-foreground self-start sm:self-auto">
            {hasChanges ? (
              <span className="flex items-center gap-2 text-foreground font-medium">
                <ArrowRight className="h-4 w-4 text-primary" />
                {selectedAvailable.size > 0 && (
                  <span className="text-green-600">+{selectedAvailable.size} add</span>
                )}
                {selectedAvailable.size > 0 && selectedEnrolled.size > 0 && (
                  <span className="text-muted-foreground mx-1">·</span>
                )}
                {selectedEnrolled.size > 0 && (
                  <span className="text-red-600">−{selectedEnrolled.size} remove</span>
                )}
              </span>
            ) : (
              <span>Select students above to add or remove them.</span>
            )}
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedEnrolled(new Set());
                setSelectedAvailable(new Set());
              }}
              disabled={!hasChanges || saving}
              className="bg-transparent flex-1 sm:flex-none"
            >
              Clear
            </Button>
            <Button
              onClick={handleApply}
              disabled={!hasChanges || saving}
              className="flex-1 sm:flex-none min-w-[140px]"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <CheckCheck className="mr-2 h-4 w-4" />
                  Apply Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

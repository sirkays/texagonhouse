// texagon_academy\texagonui\app\teacher\live-sessions\page.tsx
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Video,
  Wifi,
  Plus,
  X,
  Maximize2,
  Loader2,
  Radio,
  BookOpen,
  UserPlus,
  UserMinus,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  Search,
  Check,
  Trash2,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

/* -------------------- Types -------------------- */
interface Course {
  id: number;
  name: string;
  subject: string | null;
  classroom: string | null;
}

interface AllowedCourse {
  id: number;
  name: string;
  subject: string | null;
  teacher_id: number | null;
}

interface AllowedUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

interface Student {
  id: number;
  admission_no: string;
  full_name: string;
}

interface RoomChanges {
  courses_added: number[];
  courses_removed: number[];
  users_added: number[];
  users_removed: number[];
  invalid_course_ids: number[];
  invalid_user_ids: number[];
}

interface StartRoomResponse {
  detail: string;
  room_id: string;
  status: string;
  changes: RoomChanges;
  allowed_courses_sent: AllowedCourse[];
  allowed_users_sent: AllowedUser[];
  external_response?: unknown;
}

interface AllowedRoomResponse {
  room_id: string;
  name: string;
  status: string;
  allowed_courses: AllowedCourse[];
  allowed_users: AllowedUser[];
}

interface RoomsApiResult {
  count: number;
  results: Array<{
    id: number;
    name: string;
    room_id: string;
    room_url: string;
    status: string;
    creator_name?: string;
    allowed_courses_count?: number;
    allowed_users_count?: number;
    created_at?: string;
    updated_at?: string;
  }>;
}

/* -------------------- MultiSelect (fixed outside-click + scrollbar handling) -------------------- */
function MultiSelect({
  title,
  icon: Icon,
  items,
  selected,
  onToggle,
  loading = false,
  placeholder = "Select…",
  emptyMsg = "No items found.",
  accentColor = "orange",
}: {
  title: string;
  icon: React.ElementType;
  items: { id: number; label: string }[];
  selected: Set<number>;
  onToggle: (id: number) => void;
  loading?: boolean;
  placeholder?: string;
  emptyMsg?: string;
  accentColor?: "orange" | "red";
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  // Improved outside-click handler:
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!ref.current) return;

      // If the click target is inside our component, do nothing.
      if (ref.current.contains(e.target as Node)) return;

      // Heuristic: ignore clicks likely on the browser scrollbar area.
      try {
        const docEl = document.documentElement;
        const scrollbarWidth = window.innerWidth - docEl.clientWidth;
        if (scrollbarWidth > 0) {
          const scrollbarZoneStart = docEl.clientWidth;
          if ((e as MouseEvent).clientX >= scrollbarZoneStart - 2) return;
        }
      } catch {
        // ignore
      }

      setOpen(false);
    }

    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const filtered = items.filter((i) =>
    i.label.toLowerCase().includes(query.toLowerCase())
  );

  const pillCls =
    accentColor === "orange"
      ? "bg-[#EF7B55]/10 text-[#c95c36] border-[#EF7B55]/30"
      : "bg-red-50 text-red-600 border-red-200";

  const iconCls = accentColor === "orange" ? "text-[#EF7B55]" : "text-red-400";

  return (
    <div ref={ref} className="relative">
      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
        <Icon size={11} className={iconCls} />
        {title}
      </label>

      {selected.size > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {[...selected].map((id) => {
            const item = items.find((i) => i.id === id);
            return item ? (
              <span
                key={id}
                className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${pillCls}`}
              >
                {item.label}
                <button
                  type="button"
                  onClick={() => onToggle(id)}
                  className="hover:opacity-70"
                >
                  <X size={10} />
                </button>
              </span>
            ) : null;
          })}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl border bg-slate-50 text-slate-600 transition ${
          open
            ? "border-[#EF7B55] ring-2 ring-[#EF7B55]/20"
            : "border-slate-200 hover:border-[#EF7B55]"
        }`}
      >
        <span className="text-slate-400">
          {selected.size > 0 ? `${selected.size} selected` : placeholder}
        </span>
        <ChevronDown
          size={12}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          onMouseDown={(e) => e.stopPropagation()}
          className="absolute z-50 mt-1 w-full bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden"
        >
          <div className="p-2 border-b border-slate-100">
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
              <Search size={12} className="text-slate-400 shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Search…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 text-xs bg-transparent outline-none text-slate-700 placeholder-slate-400"
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-slate-400 text-xs">
                <Loader2 size={13} className="animate-spin" /> Loading…
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-5">{emptyMsg}</p>
            ) : (
              filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onToggle(item.id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-slate-700 hover:bg-[#EF7B55]/5 transition text-left"
                >
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition ${
                      selected.has(item.id)
                        ? "bg-[#EF7B55] border-[#EF7B55]"
                        : "border-slate-300"
                    }`}
                  >
                    {selected.has(item.id) && <Check size={9} className="text-white" />}
                  </div>
                  <span className="truncate">{item.label}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------- AllowedPanel & SummaryTile -------------------- */
function AllowedPanel({
  courses,
  users,
  loading,
  onRefresh,
}: {
  courses: AllowedCourse[];
  users: AllowedUser[];
  loading: boolean;
  onRefresh: () => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={13} className="text-[#EF7B55]" />
          <span className="text-xs font-semibold text-slate-600">
            Currently Allowed
          </span>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-[#EF7B55] transition disabled:opacity-50"
        >
          <RefreshCw size={10} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-5 text-slate-400 text-xs">
          <Loader2 size={13} className="animate-spin" /> Fetching allowed list…
        </div>
      ) : (
        <div className="p-3 grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2">
              Courses ({courses.length})
            </p>
            {courses.length === 0 ? (
              <p className="text-xs text-slate-400 italic">All courses allowed</p>
            ) : (
              <div className="flex flex-col gap-1">
                {courses.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-1.5 text-xs text-slate-700"
                  >
                    <BookOpen size={10} className="text-[#EF7B55] shrink-0" />
                    <span className="truncate">
                      {c.name}
                      {c.subject && (
                        <span className="text-slate-400"> · {c.subject}</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2">
              Users ({users.length})
            </p>
            {users.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Course-based access</p>
            ) : (
              <div className="flex flex-col gap-1">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center gap-1.5 text-xs text-slate-700"
                  >
                    <div className="w-4 h-4 rounded-full bg-[#EF7B55]/15 flex items-center justify-center shrink-0">
                      <span className="text-[8px] font-bold text-[#EF7B55]">
                        {u.first_name?.[0] ?? "?"}
                      </span>
                    </div>
                    <span className="truncate">
                      {u.first_name} {u.last_name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryTile({
  label,
  ids,
  names,
  color,
}: {
  label: string;
  ids: number[];
  names?: { id: number; name: string }[];
  color: "green" | "orange" | "red";
}) {
  const cls = {
    green: "bg-emerald-50 border-emerald-100 text-emerald-700",
    orange: "bg-orange-50 border-orange-100 text-orange-700",
    red: "bg-red-50 border-red-100 text-red-600",
  }[color];
  const resolved = ids.map((id) => names?.find((n) => n.id === id)?.name ?? `#${id}`);
  return (
    <div className={`p-2.5 rounded-lg border text-xs ${cls}`}>
      <p className="font-semibold mb-0.5">{label}</p>
      <p className="leading-relaxed">{resolved.join(", ")}</p>
    </div>
  );
}

/* -------------------- Main page component -------------------- */
export default function LiveSessionsPage() {
  // API data
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [studentsByCourse, setStudentsByCourse] = useState<Record<number, Student[]>>({});
  const [studentsLoadingMap, setStudentsLoadingMap] = useState<Record<number, boolean>>({});

  // Rooms list from /api/konnect/rooms
  const [rooms, setRooms] = useState<RoomsApiResult | null>(null);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [roomsError, setRoomsError] = useState<string | null>(null);

  // Current room allowed state (from get_room_allowed)
  const [allowedCourses, setAllowedCourses] = useState<AllowedCourse[]>([]);
  const [allowedUsers, setAllowedUsers] = useState<AllowedUser[]>([]);
  const [allowedLoading, setAllowedLoading] = useState(false);

  // Selection sets for changes
  const [addCourseIds, setAddCourseIds] = useState<Set<number>>(new Set());
  const [removeCourseIds, setRemoveCourseIds] = useState<Set<number>>(new Set());
  const [addUserIds, setAddUserIds] = useState<Set<number>>(new Set());
  const [removeUserIds, setRemoveUserIds] = useState<Set<number>>(new Set());

  // Form
  const [roomName, setRoomName] = useState("");
  const [welcomeMsg, setWelcomeMsg] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Room state
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomStatus, setRoomStatus] = useState<string | null>(null);
  const [changes, setChanges] = useState<RoomChanges | null>(null);

  // UI
  const [startLoading, setStartLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [joinLink, setJoinLink] = useState<string | null>(null);

  const roomNameRequired = roomName.trim().length > 0;
  const courseRequired = addCourseIds.size > 0; // "course_name required" => at least 1 course selected
  const canStart = roomNameRequired && courseRequired && !startLoading;

  /* ---------- Fetch teacher's courses on mount ---------- */
  useEffect(() => {
    fetch("/api/teacher/assessments/courses")
      .then((r) => r.json())
      .then((d) => setCourses(d.courses ?? []))
      .catch(() => {})
      .finally(() => setCoursesLoading(false));
  }, []);

  /* ---------- Fetch rooms list on mount ---------- */
  useEffect(() => {
    const controller = new AbortController();
    setRoomsLoading(true);
    setRoomsError(null);

    fetch("/api/konnect/rooms", { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d: RoomsApiResult) => setRooms(d))
      .catch((err) => {
        if (err.name !== "AbortError") setRoomsError("Failed to fetch rooms.");
      })
      .finally(() => setRoomsLoading(false));

    return () => controller.abort();
  }, []);

  /* ---------- Fetch students when a course is selected ---------- */
  useEffect(() => {
    addCourseIds.forEach(async (cid) => {
      if (studentsByCourse[cid] !== undefined || studentsLoadingMap[cid]) return;
      setStudentsLoadingMap((p) => ({ ...p, [cid]: true }));
      try {
        const res = await fetch(
          `/api/teacher/fetch-course-students?course_id=${cid}&limit=200`
        );
        const data = await res.json();
        setStudentsByCourse((p) => ({ ...p, [cid]: data.results ?? [] }));
      } catch {
        setStudentsByCourse((p) => ({ ...p, [cid]: [] }));
      } finally {
        setStudentsLoadingMap((p) => ({ ...p, [cid]: false }));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addCourseIds]);

  /* ---------- Fetch allowed list for a room ---------- */
  const fetchAllowed = useCallback(async (rid: string) => {
    setAllowedLoading(true);
    try {
      const res = await fetch(
        `/api/konnect/get-allowed-room?room_id=${encodeURIComponent(rid)}`
      );
      if (res.ok) {
        const data: AllowedRoomResponse = await res.json();
        setAllowedCourses(data.allowed_courses ?? []);
        setAllowedUsers(data.allowed_users ?? []);
        if (data.name) setRoomName(data.name);
        if (data.status) setRoomStatus(data.status);
      }
    } catch {
      // non-fatal
    } finally {
      setAllowedLoading(false);
    }
  }, []);

  useEffect(() => {
    if (roomId) fetchAllowed(roomId);
  }, [roomId, fetchAllowed]);

  /* ---------- Helpers ---------- */
  const allStudents = Object.entries(studentsByCourse)
    .filter(([cid]) => addCourseIds.has(Number(cid)))
    .flatMap(([, list]) => list)
    .filter((s, idx, arr) => arr.findIndex((x) => x.id === s.id) === idx);

  const isStudentsLoading = [...addCourseIds].some((cid) => studentsLoadingMap[cid]);

  function toggle(set: Set<number>, id: number): Set<number> {
    const next = new Set(set);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  }

  /* ---------- Start room (NOW validates required fields) ---------- */
  const handleStartRoom = useCallback(async () => {
    setError(null);
    setSuccessMsg(null);
    setChanges(null);

    // Required: room_name + at least 1 course selected
    if (!roomName.trim()) {
      setError("Room Name is required.");
      return;
    }
    if (addCourseIds.size === 0) {
      setError("Please select at least one course to allow.");
      return;
    }

    setStartLoading(true);

    const payload: Record<string, unknown> = {
      name: roomName.trim(),
      add_course_ids: [...addCourseIds],
    };

    if (welcomeMsg.trim()) payload.message = welcomeMsg.trim();
    if (removeCourseIds.size) payload.remove_course_ids = [...removeCourseIds];
    if (addUserIds.size) payload.add_user_ids = [...addUserIds];
    if (removeUserIds.size) payload.remove_user_ids = [...removeUserIds];

    try {
      const res = await fetch("/api/konnect/start-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data: StartRoomResponse & { detail?: string } = await res.json();

      if (!res.ok) {
        setError(data.detail ?? "Failed to start room.");
        return;
      }

      setRoomId(data.room_id);
      setRoomStatus(data.status);
      setChanges(data.changes);
      setSuccessMsg(data.detail);

      if (data.allowed_courses_sent) setAllowedCourses(data.allowed_courses_sent);
      if (data.allowed_users_sent) setAllowedUsers(data.allowed_users_sent);

      setAddCourseIds(new Set());
      setRemoveCourseIds(new Set());
      setAddUserIds(new Set());
      setRemoveUserIds(new Set());
    } catch {
      setError("Network error — could not start room.");
    } finally {
      setStartLoading(false);
    }
  }, [roomName, welcomeMsg, addCourseIds, removeCourseIds, addUserIds, removeUserIds]);

  /* ---------- Join room ---------- */
  const handleJoinRoom = useCallback(async () => {
    if (!roomId) return;
    setJoinLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/konnect/join-room?room_id=${encodeURIComponent(roomId)}`
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail ?? "Failed to join room.");
        return;
      }
      if (data.link) setJoinLink(data.link);
      else setError("No join link returned.");
    } catch {
      setError("Network error — could not join room.");
    } finally {
      setJoinLoading(false);
    }
  }, [roomId]);

  /* ---------- Full-page iframe ---------- */
  if (joinLink) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: "#000",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            height: 40,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              color: "#EF7B55",
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: "0.05em",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Radio size={13} />
            LIVE SESSION
          </span>
          <button
            onClick={() => setJoinLink(null)}
            style={{
              background: "#EF7B55",
              border: "none",
              color: "#fff",
              borderRadius: 6,
              padding: "4px 12px",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <X size={12} />
            Exit Session
          </button>
        </div>
        <iframe
          src={joinLink}
          allow="camera; microphone; display-capture; fullscreen; autoplay; clipboard-write"
          allowFullScreen
          style={{
            flex: 1,
            width: "100%",
            border: "none",
            display: "block",
            minWidth: 0,
            minHeight: 0,
          }}
          title="Live Session"
        />
      </div>
    );
  }

  /* ---------- Item lists for selects ---------- */
  const courseItems = courses.map((c) => ({
    id: c.id,
    label: [c.name, c.subject, c.classroom].filter(Boolean).join(" · "),
  }));

  const removableCourseItems = allowedCourses.map((c) => ({
    id: c.id,
    label: [c.name, c.subject].filter(Boolean).join(" · "),
  }));

  const studentItems = allStudents.map((s) => ({
    id: s.id,
    label: s.full_name || s.admission_no,
  }));

  const removableUserItems = allowedUsers.map((u) => ({
    id: u.id,
    label: `${u.first_name} ${u.last_name}`.trim() || u.email,
  }));

  const statusBadgeCls = (s: string | null) =>
    s === "open"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-slate-100 text-slate-600 border-slate-200";

  /* ---------- Render ---------- */
  return (
    <div className="min-h-full">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#EF7B55]/10 border border-[#EF7B55]/20 flex items-center justify-center">
            <Video size={18} className="text-[#EF7B55]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              Live Sessions
            </h1>
            <p className="text-xs text-slate-500">
              Start or manage your virtual classroom
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl space-y-5">
        {/* Rooms quick list */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wifi size={15} className="text-[#EF7B55]" />
              <p className="text-sm font-semibold text-slate-700">Rooms</p>
            </div>
            <div className="text-xs text-slate-500">
              {roomsLoading ? "Loading…" : rooms ? `${rooms.count} total` : ""}
            </div>
          </div>

          {roomsLoading ? (
            <div className="text-xs text-slate-400">Fetching rooms…</div>
          ) : roomsError ? (
            <div className="text-xs text-red-500">{roomsError}</div>
          ) : rooms && rooms.results.length > 0 ? (
            <div className="space-y-2">
              {rooms.results.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between gap-3 p-2 bg-slate-50 rounded-md"
                >
                  <div>
                    <div className="text-sm font-medium text-slate-800">
                      {r.name}
                    </div>
                    <div className="text-xs text-slate-400">
                      {r.creator_name} ·{" "}
                      {new Date(r.created_at || "").toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                        r.status === "open"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {r.status === "open" ? "OPEN" : r.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setRoomId(r.room_id);
                        setRoomStatus(r.status);
                      }}
                      className="text-xs text-slate-500 hover:text-slate-700"
                    >
                      Manage
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic">No rooms found.</div>
          )}
        </div>

        {/* Banners */}
        {error && (
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
            <span>{error}</span>
            <button
              className="ml-auto text-red-400 hover:text-red-600"
              onClick={() => setError(null)}
            >
              <X size={14} />
            </button>
          </div>
        )}
        {successMsg && !error && (
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Room Setup Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-visible">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Wifi size={15} className="text-[#EF7B55]" />
            <span className="text-sm font-semibold text-slate-700">Room Setup</span>
            {roomId && (
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusBadgeCls(
                  roomStatus
                )}`}
              >
                {roomStatus === "open" ? "● LIVE" : roomStatus}
              </span>
            )}
          </div>

          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                Room Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Introduction to Algebra"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50 placeholder-slate-400 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#EF7B55]/30 transition ${
                  roomNameRequired
                    ? "border-slate-200 focus:border-[#EF7B55]"
                    : "border-red-200 focus:border-red-400"
                }`}
              />
              {!roomNameRequired && (
                <p className="mt-1 text-[11px] text-red-500">Room Name is required.</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                Welcome Message
              </label>
              <input
                type="text"
                placeholder="Welcome to today's session!"
                value={welcomeMsg}
                onChange={(e) => setWelcomeMsg(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 placeholder-slate-400 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#EF7B55]/30 focus:border-[#EF7B55] transition"
              />
            </div>

            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced((v) => !v)}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#EF7B55] hover:text-[#c95c36] transition"
              >
                <ChevronDown
                  size={13}
                  className={`transition-transform ${showAdvanced ? "rotate-180" : ""}`}
                />
                Advanced — Courses &amp; Student Access
              </button>

              {showAdvanced && (
                <div className="mt-4 space-y-4">
                  {roomId && (
                    <AllowedPanel
                      courses={allowedCourses}
                      users={allowedUsers}
                      loading={allowedLoading}
                      onRefresh={() => fetchAllowed(roomId)}
                    />
                  )}

                  <div className="border-t border-slate-100 pt-4 space-y-4">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                      Make Changes
                    </p>

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-500">
                        Select at least <span className="font-semibold">one course</span>{" "}
                        <span className="text-red-500">*</span>
                      </p>
                      {!courseRequired && (
                        <span className="text-[11px] text-red-500 font-medium">
                          Required
                        </span>
                      )}
                    </div>

                    <MultiSelect
                      title="Add Courses"
                      icon={BookOpen}
                      items={courseItems}
                      selected={addCourseIds}
                      onToggle={(id) => {
                        setAddCourseIds((p) => toggle(p, id));
                        setRemoveCourseIds((p) => {
                          const n = new Set(p);
                          n.delete(id);
                          return n;
                        });
                      }}
                      loading={coursesLoading}
                      placeholder="Choose courses to allow…"
                      emptyMsg="No active courses found."
                      accentColor="orange"
                    />

                    {removableCourseItems.length > 0 && (
                      <MultiSelect
                        title="Remove Courses"
                        icon={Trash2}
                        items={removableCourseItems}
                        selected={removeCourseIds}
                        onToggle={(id) => {
                          setRemoveCourseIds((p) => toggle(p, id));
                          setAddCourseIds((p) => {
                            const n = new Set(p);
                            n.delete(id);
                            return n;
                          });
                        }}
                        placeholder="Choose courses to revoke…"
                        emptyMsg="No allowed courses to remove."
                        accentColor="red"
                      />
                    )}

                    {addCourseIds.size > 0 && (
                      <MultiSelect
                        title="Add Specific Students"
                        icon={UserPlus}
                        items={studentItems}
                        selected={addUserIds}
                        onToggle={(id) => {
                          setAddUserIds((p) => toggle(p, id));
                          setRemoveUserIds((p) => {
                            const n = new Set(p);
                            n.delete(id);
                            return n;
                          });
                        }}
                        loading={isStudentsLoading}
                        placeholder="Choose students to explicitly allow…"
                        emptyMsg="No enrolled students found."
                        accentColor="orange"
                      />
                    )}

                    {removableUserItems.length > 0 && (
                      <MultiSelect
                        title="Remove Specific Users"
                        icon={UserMinus}
                        items={removableUserItems}
                        selected={removeUserIds}
                        onToggle={(id) => {
                          setRemoveUserIds((p) => toggle(p, id));
                          setAddUserIds((p) => {
                            const n = new Set(p);
                            n.delete(id);
                            return n;
                          });
                        }}
                        placeholder="Choose users to remove…"
                        emptyMsg="No explicitly allowed users."
                        accentColor="red"
                      />
                    )}

                    {addCourseIds.size === 0 && removableCourseItems.length === 0 && (
                      <p className="text-xs text-slate-400 italic">
                        Select courses above to also manage student access.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              disabled={!canStart}
              onClick={handleStartRoom}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#EF7B55] text-white text-sm font-semibold hover:bg-[#d96a44] active:bg-[#c75e39] disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {startLoading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Plus size={15} />
              )}
              {startLoading ? "Starting…" : roomId ? "Update & Restart Room" : "Start Room"}
            </button>
            {!canStart && (
              <p className="text-center text-[11px] text-slate-400">
                Please provide <span className="font-semibold">Room Name</span> and select{" "}
                <span className="font-semibold">at least one course</span>.
              </p>
            )}
          </div>
        </div>

        {/* Active Room Card */}
        {roomId && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <Radio size={15} className="text-emerald-500" />
              <span className="text-sm font-semibold text-slate-700">Active Room</span>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-0.5">
                    Room ID
                  </p>
                  <p className="text-sm font-mono font-semibold text-slate-800">
                    {roomId}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusBadgeCls(
                    roomStatus
                  )}`}
                >
                  {roomStatus === "open" ? "OPEN" : roomStatus}
                </span>
              </div>

              {changes && (
                <div className="grid grid-cols-2 gap-2">
                  {changes.courses_added.length > 0 && (
                    <SummaryTile
                      label="Courses Added"
                      ids={changes.courses_added}
                      names={courses.map((c) => ({ id: c.id, name: c.name }))}
                      color="green"
                    />
                  )}
                  {changes.courses_removed.length > 0 && (
                    <SummaryTile
                      label="Courses Removed"
                      ids={changes.courses_removed}
                      names={courses.map((c) => ({ id: c.id, name: c.name }))}
                      color="orange"
                    />
                  )}
                  {changes.users_added.length > 0 && (
                    <SummaryTile
                      label="Students Added"
                      ids={changes.users_added}
                      names={allStudents.map((s) => ({
                        id: s.id,
                        name: s.full_name || s.admission_no,
                      }))}
                      color="green"
                    />
                  )}
                  {changes.users_removed.length > 0 && (
                    <SummaryTile
                      label="Students Removed"
                      ids={changes.users_removed}
                      names={[
                        ...allStudents.map((s) => ({
                          id: s.id,
                          name: s.full_name || s.admission_no,
                        })),
                        ...allowedUsers.map((u) => ({
                          id: u.id,
                          name: `${u.first_name} ${u.last_name}`.trim(),
                        })),
                      ]}
                      color="orange"
                    />
                  )}
                  {changes.invalid_course_ids.length > 0 && (
                    <SummaryTile
                      label="Invalid Courses"
                      ids={changes.invalid_course_ids}
                      color="red"
                    />
                  )}
                  {changes.invalid_user_ids.length > 0 && (
                    <SummaryTile
                      label="Invalid Users"
                      ids={changes.invalid_user_ids}
                      color="red"
                    />
                  )}
                </div>
              )}

              <button
                type="button"
                disabled={joinLoading || roomStatus !== "open"}
                onClick={handleJoinRoom}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 active:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                {joinLoading ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Maximize2 size={15} />
                )}
                {joinLoading ? "Joining…" : "Join Session (Full Screen)"}
              </button>

              {roomStatus !== "open" && (
                <p className="text-center text-xs text-slate-400">
                  Room must be open to join.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
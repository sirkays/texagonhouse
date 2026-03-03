"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Radio, Video, Clock, X } from "lucide-react";

interface Room {
  id: number;
  name: string;
  room_id: string;
  status: string;
  creator_name: string;
  allowed_courses_count: number;
  allowed_users_count: number;
  created_at: string;
}

export default function StudentLiveSessions() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);
  const [waitingRoom, setWaitingRoom] = useState<string | null>(null);
  const [joinLink, setJoinLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch rooms
  const fetchRooms = useCallback(async () => {
    try {
      const res = await fetch("/api/konnect/list-student-rooms");
      const data = await res.json();
      setRooms(data.results ?? []);
    } catch {
      setError("Failed to load rooms");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Join room
  const attemptJoin = useCallback(async (roomId: string) => {
    setJoining(roomId);
    setError(null);

    try {
      const res = await fetch(`/api/konnect/join-room?room_id=${roomId}`);
      const data = await res.json();

      if (data.status === "waiting") {
        setWaitingRoom(roomId);
        return false;
      }

      if (data.link) {
        setJoinLink(data.link);
        return true;
      }

      setError(data.detail ?? "Unable to join meeting");
      return false;
    } catch {
      setError("Network error");
      return false;
    } finally {
      setJoining(null);
    }
  }, []);

  // Auto retry while waiting
  useEffect(() => {
    if (!waitingRoom) return;

    const interval = setInterval(async () => {
      const success = await attemptJoin(waitingRoom);
      if (success) setWaitingRoom(null);
    }, 5000);

    return () => clearInterval(interval);
  }, [waitingRoom, attemptJoin]);

  // Fullscreen meeting view
  if (joinLink) {
    return (
      <div className="fixed inset-0 bg-black z-[9999] flex flex-col">
        <div className="h-10 bg-black/90 flex items-center justify-between px-4">
          <span className="text-orange-400 font-semibold flex items-center gap-2 text-sm">
            <Radio size={14} />
            LIVE SESSION
          </span>
          <button
            onClick={() => setJoinLink(null)}
            className="bg-orange-500 text-white px-3 py-1 rounded-md text-xs flex items-center gap-1"
          >
            <X size={12} /> Exit
          </button>
        </div>

        <iframe
          src={joinLink}
          allow="camera; microphone; fullscreen; display-capture"
          allowFullScreen
          className="flex-1 w-full border-none"
        />
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-slate-500">
        <Loader2 className="animate-spin mr-2" /> Loading sessions...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-6">
      <div className="flex items-center gap-3">
        <Video className="text-orange-500" />
        <h1 className="text-xl font-bold">Available Live Classes</h1>
      </div>

      {rooms.length === 0 && (
        <p className="text-slate-500 text-sm">No live classes available.</p>
      )}

      <div className="grid gap-4">
        {rooms.map((room) => {
          const isWaiting = waitingRoom === room.room_id;

          return (
            <div
              key={room.id}
              className="border rounded-xl p-4 flex items-center justify-between bg-white shadow-sm"
            >
              <div>
                <h3 className="font-semibold text-slate-800">{room.name}</h3>
                <p className="text-xs text-slate-500">
                  Host: {room.creator_name}
                </p>

                <div className="mt-2 flex items-center gap-2 text-xs">
                  {room.status === "open" ? (
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                      LIVE
                    </span>
                  ) : (
                    <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Clock size={12} /> Not started
                    </span>
                  )}

                  {isWaiting && (
                    <span className="text-orange-500 font-medium">
                      Waiting for teacher...
                    </span>
                  )}
                </div>
              </div>

              <button
                disabled={joining === room.room_id}
                onClick={() => attemptJoin(room.room_id)}
                className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
              >
                {joining === room.room_id ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <Video size={14} />
                )}
                Join
              </button>
            </div>
          );
        })}
      </div>

      {error && (
        <p className="text-red-500 text-sm text-center mt-4">{error}</p>
      )}
    </div>
  );
}
"use client";

import { useSession } from "next-auth/react";
import {
  CallingState,
  PaginatedGridLayout,
  SpeakerLayout,
  ParticipantsAudio,
  useCallStateHooks,
  useCall,
  ParticipantView,
  type StreamVideoParticipant,
} from "@stream-io/video-react-sdk";
import { useState, useEffect, useCallback, useMemo, useRef, memo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "../ui/button";
import { toast } from "sonner";
import {
  Users,
  MessageCircle,
  Send,
  WifiOff,
  RefreshCw,
  Hand,
  ChevronLeft,
  ChevronRight,
  Disc,
} from "lucide-react";

import { useLowCostCallSettings } from "@/hooks/useLowCostCallSettings";
import { useMeetingVisibility } from "@/hooks/useMeetingVisibility";
import { useMediaPreferences } from "@/hooks/useMediaPreferences";
import { useMeetingPermissions } from "@/hooks/useMeetingPermissions";

import { MeetingControlBar } from "./MeetingControlBar";
import { EndMeetingDialog } from "./EndMeetingDialog";
import { ParticipantActionsMenu, BlockedParticipantsSection } from "./ParticipantActionsMenu";
import { MeetingDiagnostics } from './MeetingDiagnostics';

// ── Types ──

interface FloatingReaction {
  id: string;
  emoji: string;
  x: number;
  senderName?: string;
}

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: Date;
}

interface RaisedHandState {
  raised: boolean;
  userName: string;
}

const ALLOWED_EMOJIS = ["👍", "👏", "❤️", "🎉", "✋", "🔥"];
const REACTION_THROTTLE_MS = 2000;

// ── Memoized FloatingReactions overlay with Sender Identity ──
const FloatingReactionsOverlay = memo(function FloatingReactionsOverlay({
  reactions,
}: {
  reactions: FloatingReaction[];
}) {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {reactions.map((r) => (
        <div
          key={r.id}
          className="absolute bottom-32 flex flex-col items-center gap-0.5"
          style={{
            left: `${r.x}%`,
            animation: "floatUp 2.5s ease-out forwards",
          }}
        >
          <span className="text-4xl sm:text-5xl drop-shadow-md">{r.emoji}</span>
          {r.senderName && (
            <span className="bg-black/75 backdrop-blur-sm border border-white/10 text-white text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full truncate max-w-[120px] shadow-lg">
              {r.senderName}
            </span>
          )}
        </div>
      ))}
    </div>
  );
});

// ── ReconnectionBanner ──
const ReconnectionBanner = memo(function ReconnectionBanner({
  isReconnecting,
  isOffline,
  isMigrating,
}: {
  isReconnecting: boolean;
  isOffline: boolean;
  isMigrating: boolean;
}) {
  if (!isReconnecting && !isOffline && !isMigrating) return null;

  let message = "Reconnecting…";
  let bgClass = "bg-amber-500/90";
  if (isOffline) {
    message = "You are offline — waiting for connection…";
    bgClass = "bg-red-500/90";
  } else if (isMigrating) {
    message = "Switching servers…";
  }

  return (
    <div
      className={`fixed top-[60px] left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl ${bgClass} text-white text-sm font-semibold flex items-center gap-2 shadow-lg backdrop-blur-sm animate-pulse`}
    >
      {isOffline ? <WifiOff size={16} /> : <RefreshCw size={16} className="animate-spin" />}
      <span>{message}</span>
    </div>
  );
});

// ── Custom Participants List with Raised Hands & Moderation Actions ──

const AVATAR_COLORS = [
  "from-teal-600 to-teal-700",
  "from-green-700 to-green-800",
  "from-orange-700 to-orange-800",
  "from-indigo-700 to-indigo-800",
  "from-rose-700 to-rose-800",
  "from-amber-600 to-amber-700",
];

const ParticipantRow = memo(function ParticipantRow({
  participant,
  index,
  isHandRaised,
}: {
  participant: StreamVideoParticipant;
  index: number;
  isHandRaised: boolean;
}) {
  const isSpeaking = participant.isSpeaking;
  const isCamOff = !participant.videoStream;
  const name = participant.name || participant.userId || "Guest";
  const initial = name.charAt(0).toUpperCase();
  const colorClass = AVATAR_COLORS[index % AVATAR_COLORS.length];

  return (
    <div
      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
        isHandRaised
          ? "bg-amber-500/15 border border-amber-500/40"
          : isSpeaking
          ? "bg-emerald-500/10 border border-emerald-500/30"
          : "hover:bg-white/5 border border-transparent"
      }`}
    >
      {/* Avatar with speaking / hand raise ring */}
      <div className="relative shrink-0">
        <div
          className={`w-9 h-9 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center text-white text-sm font-bold shadow-sm ${
            isHandRaised
              ? "ring-2 ring-amber-400 ring-offset-1 ring-offset-[#1a1b1e]"
              : isSpeaking
              ? "ring-2 ring-emerald-400 ring-offset-1 ring-offset-[#1a1b1e]"
              : ""
          }`}
        >
          {initial}
        </div>

        {/* Hand Raised badge */}
        {isHandRaised && (
          <div className="absolute -top-1 -right-1 bg-amber-500 text-black rounded-full w-4 h-4 flex items-center justify-center text-[10px] shadow-md animate-bounce">
            ✋
          </div>
        )}

        {/* Speaking waveform overlay */}
        {isSpeaking && !isHandRaised && (
          <div className="absolute -bottom-0.5 -right-0.5 flex items-end gap-[2px] bg-emerald-500 rounded-full p-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-[2px] rounded-full bg-white"
                style={{
                  height: `${4 + i * 2}px`,
                  animation: `speakBar${i} 0.5s ease-in-out infinite alternate`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Name + indicators */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate leading-none ${
          isHandRaised ? "text-amber-300 font-bold" : isSpeaking ? "text-emerald-300" : "text-white"
        }`}>
          {name}
        </p>
        {isHandRaised ? (
          <p className="text-[10px] text-amber-400 mt-0.5 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />
            Hand Raised
          </p>
        ) : isSpeaking ? (
          <p className="text-[10px] text-emerald-400 mt-0.5 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            Speaking
          </p>
        ) : participant.isLocalParticipant ? (
          <p className="text-[10px] text-zinc-500 mt-0.5">You</p>
        ) : null}
      </div>

      {/* Mic / Cam status icons */}
      <div className="flex items-center gap-1.5 shrink-0">
        <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
          isSpeaking ? "bg-emerald-500/20" : "bg-white/5"
        }`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className={`w-3.5 h-3.5 ${isSpeaking ? "text-emerald-400" : "text-zinc-500"}`}>
            {participant.audioStream ? (
              <><path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" /></>
            ) : (
              <><path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8M3 3l18 18" /></>
            )}
          </svg>
        </div>

        <div className={`w-6 h-6 rounded-md flex items-center justify-center bg-white/5`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className={`w-3.5 h-3.5 ${!isCamOff ? "text-zinc-400" : "text-zinc-600"}`}>
            {!isCamOff ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            ) : (
              <><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /><path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" /></>
            )}
          </svg>
        </div>

        {/* Moderation Kebab Menu for Host */}
        <ParticipantActionsMenu participant={participant} />
      </div>
    </div>
  );
});

const ParticipantsList = memo(function ParticipantsList({
  raisedHandsMap,
}: {
  raisedHandsMap: Map<string, RaisedHandState>;
}) {
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();

  // Deduplicate participants by userId (prevents ghost/duplicate rows during page reloads)
  const uniqueParticipants = useMemo(() => {
    const seen = new Set<string>();
    const list: StreamVideoParticipant[] = [];
    for (const p of participants) {
      if (!seen.has(p.userId)) {
        seen.add(p.userId);
        list.push(p);
      }
    }
    return list;
  }, [participants]);

  // Sort: Raised hands FIRST, then speaking, then local user, then alphabetical
  const sorted = useMemo(() => {
    return [...uniqueParticipants].sort((a, b) => {
      const aHand = raisedHandsMap.get(a.userId)?.raised;
      const bHand = raisedHandsMap.get(b.userId)?.raised;
      if (aHand && !bHand) return -1;
      if (!aHand && bHand) return 1;
      if (a.isSpeaking && !b.isSpeaking) return -1;
      if (!a.isSpeaking && b.isSpeaking) return 1;
      if (a.isLocalParticipant && !b.isLocalParticipant) return -1;
      if (!a.isLocalParticipant && b.isLocalParticipant) return 1;
      return (a.name || "").localeCompare(b.name || "");
    });
  }, [uniqueParticipants, raisedHandsMap]);

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-zinc-600 gap-2">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
        <p className="text-xs">No participants</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {sorted.map((p, i) => (
        <ParticipantRow
          key={p.sessionId}
          participant={p}
          index={i}
          isHandRaised={!!raisedHandsMap.get(p.userId)?.raised}
        />
      ))}
      <BlockedParticipantsSection />
    </div>
  );
});

// ── Deduplicated Grid Layout (replaces PaginatedGridLayout to filter ghost sessions) ──
// Audio is handled by <ParticipantsAudio /> rendered at the section level.
// Video layout uses Stream's PaginatedGridLayout for correct pagination + audio.

// ── Main Component ──

const MeetingRoom = () => {
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEndMeetingDialogOpen, setIsEndMeetingDialogOpen] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [raisedHandsMap, setRaisedHandsMap] = useState<Map<string, RaisedHandState>>(new Map());
  const [isAudioBlocked, setIsAudioBlocked] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState<{name: string; userId: string} | null>(null);
  const activeSpeakerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const screenShareContainerRef = useRef<HTMLDivElement>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const micPendingRef = useRef(false);
  const camPendingRef = useRef(false);

  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const {
    useCallCallingState,
    useParticipants,
    useScreenShareState,
    useHasOngoingScreenShare,
    useMicrophoneState,
    useCameraState,
    useLocalParticipant,
    useIsCallRecordingInProgress,
  } = useCallStateHooks();
  const call = useCall();
  const callingState = useCallCallingState();
  const allParticipantsRaw = useParticipants();
  const isRecording = useIsCallRecordingInProgress();

  // Deduplicated participant count (filters ghost/stale sessions)
  const uniqueParticipantCount = useMemo(() => {
    const seen = new Set<string>();
    for (const p of allParticipantsRaw) {
      seen.add(p.userId);
    }
    return seen.size;
  }, [allParticipantsRaw]);
  const localParticipant = useLocalParticipant();

  const { isMute: isMicMuted, isEnabled: isMicEnabled } = useMicrophoneState();
  const { isMute: isCamMuted, isEnabled: isCamEnabled } = useCameraState();
  const isMicOff = isMicMuted || isMicEnabled === false;
  const isCamOff = isCamMuted || isCamEnabled === false;
  const { status: screenShareStatus } = useScreenShareState();
  const isScreenSharing = screenShareStatus === "enabled";
  const someoneSharing = useHasOngoingScreenShare();

  const { isHost } = useMeetingPermissions();

  // ── Refs for stability ──
  const callRef = useRef(call);
  callRef.current = call;
  const lastReactionTimeRef = useRef(0);
  const reactionTimeoutRefs = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const handRevisionMap = useRef<Map<string, number>>(new Map());

  const meetingId = useMemo(() => {
    const parts = pathname?.split("/") || [];
    return parts[parts.length - 1] || "unknown";
  }, [pathname]);

  // ── Integrate hooks ──
  useLowCostCallSettings(call);
  const { isReconnecting, isOffline, isMigrating } = useMeetingVisibility();
  const { persistCurrentState, applyToCall } = useMediaPreferences(meetingId);

  useEffect(() => {
    if (callingState === CallingState.JOINED && call) {
      applyToCall(call);
    }
  }, [callingState, call, applyToCall]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // Register grid viewport with Stream for DynaScale optimization
  useEffect(() => {
    if (!call || !gridContainerRef.current) return;
    call.setViewport(gridContainerRef.current);
  }, [call, gridContainerRef.current]);

  // Detect autoplay-blocked state
  useEffect(() => {
    if (!call) return;
    const handleAudioBlocked = () => setIsAudioBlocked(true);
    // Stream SDK fires 'call.audio_playback_failed' or similar - handle broadly
    const checkAutoplay = async () => {
      try {
        // Try to create a silent audio context to detect block
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (ctx.state === 'suspended') {
          setIsAudioBlocked(true);
        }
        ctx.close();
      } catch {
        // ignore
      }
    };
    checkAutoplay();
  }, [call]);

  const toggleFullscreen = useCallback(() => {
    const el = screenShareContainerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  // ── Mobile 4-tile grid / Desktop group size ──
  const groupSize = useMemo(() => {
    if (windowWidth < 640) {
      return 4; // 2x2 layout on normal phones
    } else if (windowWidth < 1024) {
      return 4; // Tablet: 4 tiles
    } else {
      return 6; // Desktop: max 6 tiles
    }
  }, [windowWidth]);

  const getDashboardPath = useCallback(() => {
    if (!session?.user) return "/";
    const role = session.user.role?.toLowerCase() ?? "";
    if (role.includes("teacher") || role.includes("instructor") || role === "tutor") return "/teacher";
    if (role.includes("student") || role === "learner" || role === "pupil" || role === "parent") return "/student";
    if (role.includes("admin")) return "/admin/dashboard";
    return "/dashboard";
  }, [session?.user]);

  // ── Toggle Screen Share ──
  const handleScreenShare = useCallback(async () => {
    if (!callRef.current) return;
    try {
      await callRef.current.screenShare.toggle();
    } catch (err) {
      console.error("Error toggling screen share:", err);
      toast.error("Screen sharing error");
    }
  }, []);

  // ── Send Emoji Reaction with Sender Identity ──
  const handleSendReaction = useCallback(async (emoji: string) => {
    if (!callRef.current) return;
    if (!ALLOWED_EMOJIS.includes(emoji)) return;

    const now = Date.now();
    if (now - lastReactionTimeRef.current < REACTION_THROTTLE_MS) return;
    lastReactionTimeRef.current = now;

    try {
      await callRef.current.sendReaction({
        type: "reaction",
        emoji_code: emoji,
        custom: { emoji },
      });
    } catch (err) {
      console.error("Error sending reaction:", err);
    }
  }, []);

  // ── Raise Hand / Lower Hand (Stream native reaction + network-visible custom event) ──
  const handleToggleRaiseHand = useCallback(async () => {
    if (!callRef.current) return;
    const nextState = !isHandRaised;
    const userId = localParticipant?.userId || String(session?.user?.id || 'unknown');
    const userName = session?.user?.name || localParticipant?.name || 'Participant';
    const rev = Date.now();

    // Optimistic local update
    setIsHandRaised(nextState);
    setRaisedHandsMap((prev) => {
      const updated = new Map(prev);
      if (nextState) {
        updated.set(userId, { raised: true, userName });
      } else {
        updated.delete(userId);
      }
      return updated;
    });

    try {
      // Single authoritative protocol: one custom event for both raise and lower
      await callRef.current.sendCustomEvent({
        type: 'hand_raise_state',
        userId,
        raised: nextState,
        userName,
        rev,
      } as any);

      if (nextState) {
        toast.info('Your hand is raised ✋');
      } else {
        toast.info('Your hand is lowered');
      }
    } catch (err) {
      // Rollback optimistic state on failure
      console.error('Error toggling raise hand:', err);
      setIsHandRaised(!nextState);
      setRaisedHandsMap((prev) => {
        const updated = new Map(prev);
        if (!nextState) {
          updated.set(userId, { raised: true, userName });
        } else {
          updated.delete(userId);
        }
        return updated;
      });
      toast.error('Could not update hand state. Please try again.');
    }
  }, [isHandRaised, session?.user?.name, session?.user?.id, localParticipant?.name, localParticipant?.userId]);

  // ── Send chat message ──
  const handleSendChat = useCallback(() => {
    if (!chatInput.trim()) return;
    const userName = session?.user?.name || localParticipant?.name || "Guest";
    const textToSend = chatInput.trim();
    setChatInput("");

    if (callRef.current) {
      try {
        callRef.current.sendCustomEvent({
          type: "chat_message",
          sender: userName,
          text: textToSend,
        } as any);
      } catch (err) {
        console.error("Failed to send chat:", err);
      }
    }
  }, [chatInput, session?.user?.name, localParticipant?.name]);

  // ── Leave Call cleanly ──
  const handleLeaveCallOnly = useCallback(async () => {
    if (callRef.current) {
      try {
        await callRef.current.camera.disable();
        await callRef.current.microphone.disable();
        if (screenShareStatus === 'enabled') {
          await callRef.current.screenShare.disable();
        }
        await callRef.current.leave();
      } catch (err) {
        console.error("Error during leave cleanup:", err);
      }
    }
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (key.startsWith("techxagon_setup_") || key.startsWith("techxagon_chat_") || key.startsWith("techxagon_guest_") || key.startsWith("techxagon_media_"))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => sessionStorage.removeItem(k));
    } catch {
      // non-fatal
    }
    router.push(getDashboardPath());
  }, [router, getDashboardPath, screenShareStatus]);

  const handleToggleMic = useCallback(async () => {
    if (!callRef.current || micPendingRef.current) return;
    micPendingRef.current = true;
    const targetState = isMicOff; // we want to toggle: if currently off, turn on
    try {
      await callRef.current.microphone.toggle();
      // Only persist after confirmed state change
      persistCurrentState(!isMicOff, !isCamOff);
    } catch (err) {
      console.error('Mic toggle failed:', err);
      toast.error('Could not toggle microphone. Please try again.');
    } finally {
      micPendingRef.current = false;
    }
  }, [isMicOff, isCamOff, persistCurrentState]);

  const handleToggleCam = useCallback(async () => {
    if (!callRef.current || camPendingRef.current) return;
    camPendingRef.current = true;
    try {
      await callRef.current.camera.toggle();
      // Only persist after confirmed state change
      persistCurrentState(!isMicOff, !isCamOff);
    } catch (err) {
      console.error('Camera toggle failed:', err);
      toast.error('Could not toggle camera. Please try again.');
    } finally {
      camPendingRef.current = false;
    }
  }, [isMicOff, isCamOff, persistCurrentState]);

  // ── Listen for custom events (chat & hand raises) ──
  useEffect(() => {
    if (!call) return;
    const handler = (event: any) => {
      const eventType = event.custom?.type;
      const senderUserId = event.user?.id || event.user_id || event.custom?.userId || 'unknown';

      if (eventType === "chat_message") {
        const incoming: ChatMessage = {
          id: crypto.randomUUID(),
          sender: event.custom.sender || event.user?.name || "Unknown",
          text: event.custom.text || "",
          timestamp: new Date(),
        };
        setChatMessages((prev) => [...prev, incoming]);
      } else if (eventType === "hand_raise_state") {
        const isRaised = !!event.custom?.raised;
        const senderName = event.custom?.userName || event.user?.name || "Participant";
        const incomingRev = Number(event.custom?.rev || 0);
        const userId = event.custom?.userId || senderUserId;

        // Stale-event rejection: ignore if we've seen a newer revision for this user
        const lastRev = handRevisionMap.current.get(userId) || 0;
        if (incomingRev <= lastRev && incomingRev !== 0) return;
        handRevisionMap.current.set(userId, incomingRev);

        setRaisedHandsMap((prev) => {
          const updated = new Map(prev);
          if (isRaised) {
            updated.set(userId, { raised: true, userName: senderName });
          } else {
            updated.delete(userId);
          }
          return updated;
        });
      }
    };
    call.on("custom", handler);
    return () => {
      call.off("custom", handler);
    };
  }, [call]);

  // ── Listen for call.ended event ──
  useEffect(() => {
    if (!call) return;
    const handleCallEnded = () => {
      toast.info("The host ended the meeting.");
      router.push(getDashboardPath());
    };
    call.on("call.ended", handleCallEnded);
    return () => {
      call.off("call.ended", handleCallEnded);
    };
  }, [call, router, getDashboardPath]);

  // Clear raised-hand state when a participant leaves
  useEffect(() => {
    if (!call) return;
    const handleParticipantLeft = (event: any) => {
      const leftUserId = event.participant?.userId || event.user?.id;
      if (!leftUserId) return;
      setRaisedHandsMap((prev) => {
        if (!prev.has(leftUserId)) return prev;
        const updated = new Map(prev);
        updated.delete(leftUserId);
        return updated;
      });
      handRevisionMap.current.delete(leftUserId);
    };
    // @ts-ignore
    call.on('call.session_participant_left', handleParticipantLeft);
    return () => {
      // @ts-ignore
      call.off('call.session_participant_left', handleParticipantLeft);
    };
  }, [call]);

  // Periodic cleanup: remove raised hands for users no longer in the call
  useEffect(() => {
    if (!call) return;
    const cleanupInterval = setInterval(() => {
      const currentParticipantIds = new Set(
        (call.state?.participants || []).map((p: any) => p.userId)
      );
      setRaisedHandsMap((prev) => {
        let changed = false;
        const updated = new Map(prev);
        for (const [userId] of updated) {
          if (!currentParticipantIds.has(userId)) {
            updated.delete(userId);
            changed = true;
          }
        }
        return changed ? updated : prev;
      });
    }, 10_000); // Every 10 seconds
    return () => clearInterval(cleanupInterval);
  }, [call]);

  // ── Restore chat messages from sessionStorage ──
  useEffect(() => {
    if (!call?.id) return;
    try {
      const stored = sessionStorage.getItem(`techxagon_chat_${call.id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setChatMessages(parsed.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          })));
        }
      }
    } catch {
      // non-fatal
    }
  }, [call?.id]);

  useEffect(() => {
    if (!call?.id || chatMessages.length === 0) return;
    try {
      sessionStorage.setItem(`techxagon_chat_${call.id}`, JSON.stringify(chatMessages));
    } catch {
      // non-fatal
    }
  }, [chatMessages, call?.id]);

  // ── Listen for incoming reactions with Sender Identity ──
  useEffect(() => {
    if (!call) return;
    const handler = (event: any) => {
      const emoji = event.reaction?.emoji_code || event.reaction?.custom?.emoji;
      const reactionType = event.reaction?.type;

      // Note: raised-hand state is managed exclusively via hand_raise_state custom events.
      // Reactions are for visual emoji overlays only.

      if (emoji && ALLOWED_EMOJIS.includes(emoji)) {
        const id = crypto.randomUUID();
        const x = 20 + Math.random() * 60;
        const senderName = event.reaction?.user?.name || event.user?.name || undefined;

        setFloatingReactions((prev) => [...prev, { id, emoji, x, senderName }]);
        const timeout = setTimeout(() => {
          setFloatingReactions((prev) => prev.filter((r) => r.id !== id));
          reactionTimeoutRefs.current.delete(id);
        }, 2500);
        reactionTimeoutRefs.current.set(id, timeout);
      }
    };
    call.on("call.reaction_new", handler);
    return () => {
      call.off("call.reaction_new", handler);
    };
  }, [call]);

  useEffect(() => {
    return () => {
      reactionTimeoutRefs.current.forEach((timeout) => clearTimeout(timeout));
      reactionTimeoutRefs.current.clear();
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (callRef.current) {
        callRef.current.leave().catch(() => {});
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // ── Layout Element ──
  const callLayoutElement = useMemo(() => {
    if (someoneSharing) {
      return (
        <div
          ref={screenShareContainerRef}
          className="w-full h-full relative group/screenshare"
        >
          <SpeakerLayout participantsBarPosition="bottom" />

          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit fullscreen" : "View fullscreen"}
            className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white text-xs font-medium backdrop-blur-sm border border-white/10 opacity-0 group-hover/screenshare:opacity-100 transition-all duration-200 shadow-lg"
          >
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </button>
        </div>
      );
    }

    return (
      <div ref={gridContainerRef} className="w-full h-full overflow-hidden custom-paginated-grid relative">
        {/* ParticipantsAudio renders audio for ALL remote participants, regardless of which page is visible.
            muteAudio on ParticipantView tiles prevents duplicate audio playback. */}
        <ParticipantsAudio participants={allParticipantsRaw} />
        <PaginatedGridLayout groupSize={groupSize} />
      </div>
    );
  }, [someoneSharing, groupSize, isFullscreen, toggleFullscreen, allParticipantsRaw]);

  // Active speaker tracking with auto-clear
  const { useDominantSpeaker: _useDominantSpeaker } = useCallStateHooks();
  const dominantSpeaker = _useDominantSpeaker?.();

  useEffect(() => {
    if (dominantSpeaker && dominantSpeaker.isSpeaking && !dominantSpeaker.isLocalParticipant) {
      setActiveSpeaker({
        name: dominantSpeaker.name || dominantSpeaker.userId,
        userId: dominantSpeaker.userId,
      });
      // Clear any existing timeout
      if (activeSpeakerTimeoutRef.current) {
        clearTimeout(activeSpeakerTimeoutRef.current);
      }
      // Auto-hide after 3 seconds of no speech
      activeSpeakerTimeoutRef.current = setTimeout(() => {
        setActiveSpeaker(null);
      }, 3000);
    } else if (!dominantSpeaker?.isSpeaking) {
      // Speaker stopped — start 3-second fade timeout
      if (activeSpeakerTimeoutRef.current) {
        clearTimeout(activeSpeakerTimeoutRef.current);
      }
      activeSpeakerTimeoutRef.current = setTimeout(() => {
        setActiveSpeaker(null);
      }, 3000);
    }
    return () => {
      if (activeSpeakerTimeoutRef.current) {
        clearTimeout(activeSpeakerTimeoutRef.current);
      }
    };
  }, [dominantSpeaker, dominantSpeaker?.isSpeaking, dominantSpeaker?.userId]);

  if (status === "loading") {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#0f1117] gap-5 text-white">
        <RefreshCw size={32} className="animate-spin text-[#EF7B55]" />
        <p className="text-sm font-medium">Loading session...</p>
      </div>
    );
  }

  if (callingState !== CallingState.JOINED) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#0f1117] gap-6 text-white">
        <RefreshCw size={40} className="animate-spin text-[#EF7B55]" />
        <div className="text-center">
          <p className="text-xl font-semibold">Connecting to meeting<span className="animate-pulse">...</span></p>
          <p className="text-zinc-500 text-sm mt-2">Setting up your video session</p>
        </div>
      </div>
    );
  }

  return (
    <section className="relative h-screen w-full overflow-hidden bg-[#202124] text-white flex flex-col">
      {/* Header Bar */}
      <header className="relative z-20 w-full px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between backdrop-blur-xl bg-slate-950/70 border-b border-white/10 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <h1 className="text-sm sm:text-base font-bold text-white tracking-wide truncate max-w-[160px] sm:max-w-[300px]">
            Techxagon Live Session
          </h1>
          {isRecording && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/50 text-red-400 font-extrabold text-xs animate-pulse shrink-0 shadow-lg shadow-red-500/30" title="This meeting is being recorded">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-md shadow-red-500/80" />
              <Disc size={14} className="animate-spin text-red-400" />
              <span>RECORDING IN PROGRESS</span>
            </div>
          )}
        </div>

        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-400 shrink-0">
          <span>End-to-End Encrypted Session</span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <Button
            onClick={() =>
              navigator.clipboard
                .writeText(window.location.href)
                .then(() => toast.success("Invite link copied to clipboard!"))
            }
            className="bg-white/10 hover:bg-white/20 text-white border border-white/15 rounded-xl px-2.5 sm:px-3.5 py-2 text-xs sm:text-sm font-medium transition flex items-center gap-1.5 sm:gap-2 cursor-pointer"
          >
            <Send size={14} className="sm:hidden" />
            <span className="hidden sm:inline">Invite</span>
          </Button>

          <button
            onClick={() => setShowParticipants((prev) => !prev)}
            className={`flex items-center gap-1 sm:gap-2 px-2.5 sm:px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-medium transition cursor-pointer ${
              showParticipants
                ? "bg-[#EF7B55] border-[#EF7B55] text-white"
                : "bg-white/10 hover:bg-white/20 border-white/15 text-white"
            }`}
          >
            <Users size={16} />
            <span className="hidden sm:inline">People</span>
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-black/40">
              {uniqueParticipantCount}
            </span>
          </button>
        </div>
      </header>

      <ReconnectionBanner
        isReconnecting={isReconnecting}
        isOffline={isOffline}
        isMigrating={isMigrating}
      />

      {/* Active Speaker Indicator — clears 3s after speaker stops */}
      {activeSpeaker && (
        <div className="fixed top-[60px] left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-600/90 text-white text-xs font-semibold shadow-lg backdrop-blur-sm pointer-events-none transition-opacity duration-500">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span>Speaking: {activeSpeaker.name}</span>
        </div>
      )}

      {/* Raised Hands Floating Badges — visible on the main stage */}
      {Array.from(raisedHandsMap.values()).some(s => s.raised) && (
        <div className="fixed top-[100px] right-3 z-30 flex flex-col gap-1.5 pointer-events-none">
          {Array.from(raisedHandsMap.entries())
            .filter(([, state]) => state.raised)
            .slice(0, 5)
            .map(([userId, state]) => (
              <div
                key={userId}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-amber-500/90 text-black text-[11px] font-bold shadow-lg backdrop-blur-sm animate-bounce"
              >
                <span>✋</span>
                <span className="max-w-[120px] truncate">{state.userName}</span>
              </div>
            ))}
          {Array.from(raisedHandsMap.values()).filter(s => s.raised).length > 5 && (
            <div className="text-[10px] text-amber-400 font-semibold text-center">
              +{Array.from(raisedHandsMap.values()).filter(s => s.raised).length - 5} more
            </div>
          )}
        </div>
      )}

      {/* Main Stage */}
      <div className="flex-1 min-h-0 w-full flex items-stretch justify-center px-1 sm:px-2 pt-1 pb-24 sm:pb-28">
        <div className="w-full h-full overflow-hidden">
          {callLayoutElement}
        </div>
      </div>

      <FloatingReactionsOverlay reactions={floatingReactions} />

      {/* Slide-over Participants Drawer */}
      <div
        className={`fixed top-[57px] right-0 bottom-0 w-[min(320px,90vw)] sm:w-80 bg-[#1a1b1e] border-l border-white/8 backdrop-blur-2xl transition-transform duration-300 ease-in-out z-50 shadow-2xl flex flex-col ${
          showParticipants ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex-none px-4 py-3.5 border-b border-white/8 flex items-center justify-between bg-[#202124]/80">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#EF7B55]/15 flex items-center justify-center">
              <Users className="w-4 h-4 text-[#EF7B55]" />
            </div>
            <div>
              <h2 className="font-semibold text-white text-sm leading-none">Participants</h2>
              <p className="text-zinc-500 text-[11px] mt-0.5">{uniqueParticipantCount} in call</p>
            </div>
          </div>
          <button
            onClick={() => setShowParticipants(false)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition cursor-pointer text-sm"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto participants-scroll px-2 py-2">
          <ParticipantsList raisedHandsMap={raisedHandsMap} />
        </div>
      </div>

      {/* Chat Drawer */}
      <div
        className={`fixed top-[57px] right-0 bottom-0 w-[min(360px,90vw)] sm:w-[380px] bg-[#1a1b1e] border-l border-white/8 backdrop-blur-2xl transition-transform duration-300 ease-in-out z-50 shadow-2xl flex flex-col ${
          showChat ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex-none p-4 border-b border-white/10 flex items-center justify-between bg-[#202124]">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-[#EF7B55]" />
            <h2 className="font-bold text-white text-sm">Meeting Chat</h2>
          </div>
          <button
            onClick={() => setShowChat(false)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto participants-scroll p-3 space-y-3">
          {chatMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-2">
              <MessageCircle className="w-8 h-8 opacity-30" />
              <p className="text-xs">No messages yet. Say hello! 👋</p>
            </div>
          ) : (
            chatMessages.map((msg) => (
              <div key={msg.id} className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#EF7B55]">{msg.sender}</span>
                  <span className="text-[10px] text-zinc-600">
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="text-sm text-zinc-200 bg-white/5 rounded-xl px-3 py-2">
                  {msg.text}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="flex-none p-3 border-t border-white/10">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
              placeholder="Type a message..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-[#EF7B55]/50 focus:ring-1 focus:ring-[#EF7B55]/20 transition"
            />
            <button
              onClick={handleSendChat}
              disabled={!chatInput.trim()}
              className="p-2.5 rounded-xl bg-[#EF7B55] hover:bg-[#e0663f] text-white transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Autoplay-blocked banner — shown above control dock, never blocks controls */}
      {isAudioBlocked && (
        <div
          className="fixed bottom-[88px] left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-zinc-900/95 border border-amber-500/40 text-white text-sm font-medium shadow-xl backdrop-blur-sm"
        >
          <span className="text-amber-400 text-base">🔇</span>
          <span>Tap to hear the meeting</span>
          <button
            onClick={async () => {
              try {
                await call?.resumeAudio?.();
                const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                await ctx.resume();
                ctx.close();
              } catch {}
              setIsAudioBlocked(false);
            }}
            className="ml-2 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition cursor-pointer"
          >
            Enable Audio
          </button>
          <button
            onClick={() => setIsAudioBlocked(false)}
            className="w-5 h-5 rounded flex items-center justify-center text-zinc-400 hover:text-white transition cursor-pointer text-xs"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      )}

      {/* Control Dock */}
      <MeetingControlBar
        isMicOff={isMicOff}
        isCamOff={isCamOff}
        isScreenSharing={isScreenSharing}
        isHandRaised={isHandRaised}
        onToggleMic={handleToggleMic}
        onToggleCam={handleToggleCam}
        onScreenShare={handleScreenShare}
        onToggleRaiseHand={handleToggleRaiseHand}
        onLeaveClick={() => setIsEndMeetingDialogOpen(true)}
        participantCount={uniqueParticipantCount}
        showParticipants={showParticipants}
        setShowParticipants={setShowParticipants}
        showChat={showChat}
        setShowChat={setShowChat}
        onSendReaction={handleSendReaction}
        onOpenEndMeetingDialog={() => setIsEndMeetingDialogOpen(true)}
        allowedEmojis={ALLOWED_EMOJIS}
      />

      {/* Leave / End Meeting Dialog */}
      <EndMeetingDialog
        isOpen={isEndMeetingDialogOpen}
        onOpenChange={setIsEndMeetingDialogOpen}
        onLeaveOnly={handleLeaveCallOnly}
        meetingDbId={call?.id}
      />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes floatUp {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          50% {
            opacity: 0.8;
            transform: translateY(-200px) scale(1.2);
          }
          100% {
            opacity: 0;
            transform: translateY(-400px) scale(0.8);
          }
        }
      `}} />

      <MeetingDiagnostics />
    </section>
  );
};

export default MeetingRoom;

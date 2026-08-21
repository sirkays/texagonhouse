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
  Search,
  Lock,
  Unlock,
  MicOff,
  VideoOff,
  Monitor,
} from "lucide-react";

import { useLowCostCallSettings } from "@/hooks/useLowCostCallSettings";
import { useMeetingVisibility } from "@/hooks/useMeetingVisibility";
import { useMediaPreferences } from "@/hooks/useMediaPreferences";
import { useMeetingPermissions } from "@/hooks/useMeetingPermissions";

import { MeetingControlBar } from "./MeetingControlBar";
import { EndMeetingDialog } from "./EndMeetingDialog";
import { ParticipantActionsMenu, BlockedParticipantsSection } from "./ParticipantActionsMenu";
import { MeetingDiagnostics } from './MeetingDiagnostics';
import { useBrand } from "@/hooks/use-brand";
import { ChatPopOverlay, ChatPopMessage, playChatChime } from "./ChatPopOverlay";

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
  senderId?: string;
  isLocal?: boolean;
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
  const call = useCall();
  const isSpeaking = participant.isSpeaking;
  const isCamOff = !participant.videoStream;
  const isSharing = !!participant.screenShareStream;
  const name = participant.name || participant.userId || "Guest";
  const initial = name.charAt(0).toUpperCase();
  const colorClass = AVATAR_COLORS[index % AVATAR_COLORS.length];

  const isCallHost =
    participant.role?.toLowerCase() === "host" ||
    participant.role?.toLowerCase() === "admin" ||
    call?.state?.createdBy?.id === participant.userId;

  return (
    <div
      className={`relative flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-2xl transition-all duration-200 group ${
        isHandRaised
          ? "bg-amber-500/15 border border-amber-500/40"
          : isSpeaking
          ? "bg-emerald-500/10 border border-emerald-500/30"
          : "hover:bg-white/[0.06] border border-white/[0.04] bg-white/[0.02]"
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {/* Avatar with speaking / hand raise ring */}
        <div className="relative shrink-0">
          <div
            className={`w-9 h-9 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center text-white text-xs font-bold shadow-md ring-1 ring-white/10 ${
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
            <div className="absolute -bottom-0.5 -right-0.5 flex items-end gap-[2px] bg-emerald-500 rounded-full p-1 shadow-md">
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

        {/* Name + Badges */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p
              className={`text-xs sm:text-sm font-semibold truncate leading-none ${
                isHandRaised ? "text-amber-300" : isSpeaking ? "text-emerald-300" : "text-white"
              }`}
            >
              {name}
            </p>
            {participant.isLocalParticipant && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-white/10 text-zinc-300 border border-white/10">
                You
              </span>
            )}
            {isCallHost && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Host
              </span>
            )}
            {isSharing && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-sky-500/15 text-sky-400 border border-sky-500/30">
                Presenting
              </span>
            )}
          </div>

          {isHandRaised ? (
            <p className="text-[10px] text-amber-400 mt-1 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />
              Hand Raised
            </p>
          ) : isSpeaking ? (
            <p className="text-[10px] text-emerald-400 mt-1 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
              Speaking
            </p>
          ) : null}
        </div>
      </div>

      {/* Status Icons + Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Mic status */}
        <div
          className={`w-6 h-6 rounded-lg flex items-center justify-center ${
            participant.audioStream ? "bg-emerald-500/15 text-emerald-400" : "bg-white/5 text-zinc-500"
          }`}
          title={participant.audioStream ? "Microphone active" : "Microphone muted"}
        >
          {participant.audioStream ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" />
            </svg>
          ) : (
            <MicOff size={13} />
          )}
        </div>

        {/* Video status */}
        <div
          className={`w-6 h-6 rounded-lg flex items-center justify-center ${
            !isCamOff ? "bg-white/10 text-zinc-300" : "bg-white/5 text-zinc-600"
          }`}
          title={!isCamOff ? "Camera active" : "Camera off"}
        >
          {!isCamOff ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          ) : (
            <VideoOff size={13} />
          )}
        </div>

        {/* Moderation Kebab Menu for Host */}
        <ParticipantActionsMenu participant={participant} />
      </div>
    </div>
  );
});

const ParticipantsList = memo(function ParticipantsList({
  raisedHandsMap,
  isHost,
  isAudioLocked,
  isVideoLocked,
  onToggleAudioLock,
  onToggleVideoLock,
  onMuteAll,
}: {
  raisedHandsMap: Map<string, RaisedHandState>;
  isHost: boolean;
  isAudioLocked: boolean;
  isVideoLocked: boolean;
  onToggleAudioLock: () => void;
  onToggleVideoLock: () => void;
  onMuteAll: () => void;
}) {
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();
  const [searchQuery, setSearchQuery] = useState("");

  // Deduplicate participants by userId
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

  // Filter by search query
  const filteredParticipants = useMemo(() => {
    if (!searchQuery.trim()) return uniqueParticipants;
    const q = searchQuery.toLowerCase().trim();
    return uniqueParticipants.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.userId && p.userId.toLowerCase().includes(q))
    );
  }, [uniqueParticipants, searchQuery]);

  // Sort: Raised hands FIRST, then speaking, then local user, then alphabetical
  const sorted = useMemo(() => {
    return [...filteredParticipants].sort((a, b) => {
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
  }, [filteredParticipants, raisedHandsMap]);

  return (
    <div className="flex flex-col gap-2">
      {/* Host Controls Panel */}
      {isHost && (
        <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2 mb-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Host Controls
            </span>
            <button
              onClick={onMuteAll}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-zinc-200 transition cursor-pointer flex items-center gap-1.5"
            >
              <MicOff size={12} />
              Mute All
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <button
              onClick={onToggleAudioLock}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                isAudioLocked
                  ? "bg-red-500/20 border-red-500/40 text-red-300 hover:bg-red-500/30"
                  : "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10"
              }`}
            >
              {isAudioLocked ? <Lock size={12} /> : <Unlock size={12} />}
              <span>{isAudioLocked ? "Audio Locked" : "Lock Audio"}</span>
            </button>
            <button
              onClick={onToggleVideoLock}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                isVideoLocked
                  ? "bg-red-500/20 border-red-500/40 text-red-300 hover:bg-red-500/30"
                  : "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10"
              }`}
            >
              {isVideoLocked ? <Lock size={12} /> : <Unlock size={12} />}
              <span>{isVideoLocked ? "Video Locked" : "Lock Video"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Search Filter */}
      {uniqueParticipants.length > 3 && (
        <div className="relative mb-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search participants..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-500 outline-none focus:border-[#EF7B55]/50 focus:ring-1 focus:ring-[#EF7B55]/20 transition"
          />
        </div>
      )}

      {/* In Call Header */}
      <div className="px-1 py-0.5 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-zinc-400">
        <span>In Call ({sorted.length})</span>
        {isAudioLocked && (
          <span className="text-[10px] text-red-400 font-bold lowercase bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
            mic locked
          </span>
        )}
      </div>

      {/* Participants List */}
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-28 text-zinc-500 gap-1.5">
          <Users className="w-6 h-6 opacity-40" />
          <p className="text-xs">No matching participants</p>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {sorted.map((p, i) => (
            <ParticipantRow
              key={p.sessionId}
              participant={p}
              index={i}
              isHandRaised={!!raisedHandsMap.get(p.userId)?.raised}
            />
          ))}
        </div>
      )}

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
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [chatPops, setChatPops] = useState<ChatPopMessage[]>([]);
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const chatMessagesRef = useRef<ChatMessage[]>([]);
  chatMessagesRef.current = chatMessages;
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

  const showChatRef = useRef(showChat);
  showChatRef.current = showChat;

  const screenShareContainerRef = useRef<HTMLDivElement>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const micPendingRef = useRef(false);
  const camPendingRef = useRef(false);

  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const brand = useBrand();
  const {
    useCallCallingState,
    useParticipants,
    useScreenShareState,
    useHasOngoingScreenShare,
    useMicrophoneState,
    useCameraState,
    useLocalParticipant,
    useIsCallRecordingInProgress,
    useCallCustomData,
  } = useCallStateHooks();
  const call = useCall();
  const custom = useCallCustomData();
  const callingState = useCallCallingState();
  const allParticipantsRaw = useParticipants();
  const isRecording = useIsCallRecordingInProgress();

  const meetingTitle = useMemo(() => {
    const rawTitle =
      (custom?.title as string) ||
      (custom?.description as string) ||
      (custom?.name as string) ||
      (call?.state?.custom?.title as string) ||
      (call?.state?.custom?.description as string) ||
      (call?.state?.custom?.name as string);

    if (rawTitle && rawTitle.trim() && rawTitle.trim().toLowerCase() !== "meeting") {
      return rawTitle.trim();
    }
    return `${brand.name} Live Session`;
  }, [custom, call?.state?.custom, brand.name]);

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

  const [isAudioLocked, setIsAudioLocked] = useState(false);
  const [isVideoLocked, setIsVideoLocked] = useState(false);
  const isAudioLockedRef = useRef(isAudioLocked);
  isAudioLockedRef.current = isAudioLocked;
  const isVideoLockedRef = useRef(isVideoLocked);
  isVideoLockedRef.current = isVideoLocked;

  // Synchronize lock state from call custom data
  useEffect(() => {
    if (!call) return;
    const customData = call.state.custom || {};
    if (customData.is_audio_locked !== undefined) {
      setIsAudioLocked(!!customData.is_audio_locked);
    }
    if (customData.is_video_locked !== undefined) {
      setIsVideoLocked(!!customData.is_video_locked);
    }
  }, [call, call?.state?.custom]);

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
    } catch (err: any) {
      // Ignore user cancellation / permission dismissal (NotAllowedError, AbortError, Permission denied)
      const errName = err?.name || "";
      const errMsg = (err?.message || "").toLowerCase();
      const isUserCancel =
        errName === "NotAllowedError" ||
        errName === "AbortError" ||
        errMsg.includes("permission denied") ||
        errMsg.includes("cancelled") ||
        errMsg.includes("canceled") ||
        errMsg.includes("abort") ||
        errMsg.includes("not allowed");

      if (isUserCancel) {
        // User simply canceled the screen picker dialog — do not show an error toast
        return;
      }

      console.error("Error toggling screen share:", err);
      toast.error(err?.message || "Could not start screen sharing");
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

  // ── Auto-clear unread chat counter and active chat pops when chat drawer opens ──
  useEffect(() => {
    if (showChat) {
      setUnreadChatCount(0);
      setChatPops([]);
    }
  }, [showChat]);

  const handleDismissChatPop = useCallback((id: string) => {
    setChatPops((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const handleOpenChatFromPop = useCallback(() => {
    setShowChat(true);
    setShowParticipants(false);
    setUnreadChatCount(0);
    setChatPops([]);
  }, []);

  const triggerChatPop = useCallback((msg: ChatMessage) => {
    const popItem: ChatPopMessage = {
      id: msg.id || crypto.randomUUID(),
      sender: msg.sender,
      text: msg.text,
      timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(),
      senderId: msg.senderId,
      isLocal: msg.isLocal,
    };

    setChatPops((prev) => {
      if (prev.some((p) => p.id === popItem.id)) return prev;
      return [...prev.slice(-2), popItem];
    });

    playChatChime();
  }, []);

  // ── Send chat message ──
  const handleSendChat = useCallback(() => {
    if (!chatInput.trim()) return;
    const userName = session?.user?.name || localParticipant?.name || "Guest";
    const userId = localParticipant?.userId || String(session?.user?.id || "unknown");
    const textToSend = chatInput.trim();
    const msgId = crypto.randomUUID();
    setChatInput("");

    const newMsg: ChatMessage = {
      id: msgId,
      sender: userName,
      text: textToSend,
      timestamp: new Date(),
      senderId: userId,
      isLocal: true,
    };

    // Add locally for the sender immediately
    setChatMessages((prev) => {
      if (prev.some((m) => m.id === msgId)) return prev;
      return [...prev, newMsg];
    });

    if (callRef.current) {
      try {
        callRef.current.sendCustomEvent({
          type: "chat_message",
          id: msgId,
          sender: userName,
          senderId: userId,
          text: textToSend,
          timestamp: Date.now(),
        } as any);

        // If host, save to room custom chat history buffer
        if (isHost) {
          const rawHistory = Array.isArray(callRef.current.state?.custom?.chat_history)
            ? callRef.current.state.custom.chat_history
            : [];
          const updatedHistory = [
            ...rawHistory.slice(-99),
            {
              id: msgId,
              sender: userName,
              senderId: userId,
              text: textToSend,
              timestamp: Date.now(),
            },
          ];
          callRef.current.update({
            custom: {
              ...(callRef.current.state?.custom || {}),
              chat_history: updatedHistory,
            },
          }).catch(() => {});
        }
      } catch (err) {
        console.error("Failed to send chat:", err);
      }
    }
  }, [chatInput, session?.user?.name, session?.user?.id, localParticipant?.name, localParticipant?.userId, isHost]);

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

  // ── Host Room Controls: Audio Lock, Video Lock, Mute All ──
  const handleToggleAudioLock = useCallback(async () => {
    if (!callRef.current || !isHost) return;
    const nextState = !isAudioLocked;
    setIsAudioLocked(nextState);
    try {
      await callRef.current.update({
        custom: {
          ...(callRef.current.state.custom || {}),
          is_audio_locked: nextState,
        },
      });

      await callRef.current.sendCustomEvent({
        type: "room_policy_state",
        is_audio_locked: nextState,
        is_video_locked: isVideoLocked,
      } as any);

      if (nextState) {
        await callRef.current.muteAllUsers("audio");
        const participants = callRef.current.state.participants;
        const remote = participants.filter((p: any) => !p.isLocalParticipant);
        for (const p of remote) {
          try {
            await (callRef.current as any).updateUserPermissions({
              user_id: p.userId,
              revoke_permissions: ["send-audio"],
            });
          } catch {}
        }
        toast.success("Disabled all audio — new participants will join with audio disabled");
      } else {
        const participants = callRef.current.state.participants;
        const remote = participants.filter((p: any) => !p.isLocalParticipant);
        for (const p of remote) {
          try {
            await (callRef.current as any).updateUserPermissions({
              user_id: p.userId,
              grant_permissions: ["send-audio"],
            });
          } catch {}
        }
        toast.success("Enabled all audio — participants can now unmute");
      }
    } catch (err: any) {
      console.error("Audio lock error:", err);
      toast.error("Failed to toggle audio lock");
    }
  }, [isHost, isAudioLocked, isVideoLocked]);

  const handleToggleVideoLock = useCallback(async () => {
    if (!callRef.current || !isHost) return;
    const nextState = !isVideoLocked;
    setIsVideoLocked(nextState);
    try {
      await callRef.current.update({
        custom: {
          ...(callRef.current.state.custom || {}),
          is_video_locked: nextState,
        },
      });

      await callRef.current.sendCustomEvent({
        type: "room_policy_state",
        is_audio_locked: isAudioLocked,
        is_video_locked: nextState,
      } as any);

      if (nextState) {
        await callRef.current.muteAllUsers("video");
        const participants = callRef.current.state.participants;
        const remote = participants.filter((p: any) => !p.isLocalParticipant);
        for (const p of remote) {
          try {
            await (callRef.current as any).updateUserPermissions({
              user_id: p.userId,
              revoke_permissions: ["send-video"],
            });
          } catch {}
        }
        toast.success("Disabled all video — new participants will join with camera disabled");
      } else {
        const participants = callRef.current.state.participants;
        const remote = participants.filter((p: any) => !p.isLocalParticipant);
        for (const p of remote) {
          try {
            await (callRef.current as any).updateUserPermissions({
              user_id: p.userId,
              grant_permissions: ["send-video"],
            });
          } catch {}
        }
        toast.success("Enabled all video — participants can now turn on cameras");
      }
    } catch (err: any) {
      console.error("Video lock error:", err);
      toast.error("Failed to toggle video lock");
    }
  }, [isHost, isAudioLocked, isVideoLocked]);

  const handleMuteAll = useCallback(async () => {
    if (!callRef.current || !isHost) return;
    try {
      await callRef.current.muteAllUsers("audio");
      toast.success("Muted all participants");
    } catch (err: any) {
      toast.error("Failed to mute all");
    }
  }, [isHost]);

  // Host automatically applies active locks to any newcomer joining
  useEffect(() => {
    if (!call || !isHost) return;

    const handleParticipantJoined = async (event: any) => {
      const joinedUser = event.participant?.user || event.user;
      const userId = joinedUser?.id || event.participant?.userId;
      if (!userId || userId === localParticipant?.userId) return;

      if (isAudioLockedRef.current) {
        try {
          await (call as any).updateUserPermissions({
            user_id: userId,
            revoke_permissions: ["send-audio"],
          });
          await call.muteUser(userId, "audio");
        } catch (err) {
          console.error("Auto audio lock error on join:", err);
        }
      }

      if (isVideoLockedRef.current) {
        try {
          await (call as any).updateUserPermissions({
            user_id: userId,
            revoke_permissions: ["send-video"],
          });
          await call.muteUser(userId, "video");
        } catch (err) {
          console.error("Auto video lock error on join:", err);
        }
      }
    };

    call.on("call.participant_joined", handleParticipantJoined);
    return () => {
      call.off("call.participant_joined", handleParticipantJoined);
    };
  }, [call, isHost, localParticipant?.userId]);

  const handleToggleMic = useCallback(async () => {
    if (!callRef.current || micPendingRef.current) return;
    if (isAudioLocked && !isHost) {
      toast.error("Microphones are locked by the host");
      return;
    }
    micPendingRef.current = true;
    try {
      await callRef.current.microphone.toggle();
      persistCurrentState(!isMicOff, !isCamOff);
    } catch (err) {
      console.error("Mic toggle failed:", err);
      toast.error("Could not toggle microphone. Please try again.");
    } finally {
      micPendingRef.current = false;
    }
  }, [isMicOff, isCamOff, persistCurrentState, isAudioLocked, isHost]);

  const handleToggleCam = useCallback(async () => {
    if (!callRef.current || camPendingRef.current) return;
    if (isVideoLocked && !isHost) {
      toast.error("Cameras are locked by the host");
      return;
    }
    camPendingRef.current = true;
    try {
      await callRef.current.camera.toggle();
      persistCurrentState(!isMicOff, !isCamOff);
    } catch (err) {
      console.error("Camera toggle failed:", err);
      toast.error("Could not toggle camera. Please try again.");
    } finally {
      camPendingRef.current = false;
    }
  }, [isMicOff, isCamOff, persistCurrentState, isVideoLocked, isHost]);

  // ── Listen for custom events (chat, hand raises, room policy, chat sync) ──
  useEffect(() => {
    if (!call) return;
    const handler = (event: any) => {
      const eventType = event.custom?.type;
      const senderUserId = event.user?.id || event.user_id || event.custom?.userId || event.custom?.senderId || "unknown";

      if (eventType === "chat_message" || eventType === "chat-message") {
        const msgId = event.custom?.id || event.custom?.data?.id || crypto.randomUUID();
        const sender = event.custom?.sender || event.custom?.data?.senderName || event.user?.name || "Participant";
        const text = event.custom?.text || event.custom?.data?.text || "";
        const incomingSenderId = event.custom?.senderId || event.custom?.data?.senderId || senderUserId;
        const currentUserId = localParticipant?.userId || String(session?.user?.id || "");
        const isLocal = incomingSenderId === currentUserId;

        const incoming: ChatMessage = {
          id: msgId,
          sender,
          text,
          timestamp: new Date(event.custom?.timestamp || event.custom?.data?.timestamp || Date.now()),
          senderId: incomingSenderId,
          isLocal,
        };

        setChatMessages((prev) => {
          if (prev.some((m) => m.id === msgId)) return prev;
          return [...prev, incoming];
        });

        // Host buffers incoming messages to call custom state for new participants
        if (isHost && callRef.current) {
          const rawHistory = Array.isArray(callRef.current.state?.custom?.chat_history)
            ? callRef.current.state.custom.chat_history
            : [];
          if (!rawHistory.some((m: any) => m.id === msgId)) {
            const updatedHistory = [
              ...rawHistory.slice(-99),
              {
                id: msgId,
                sender,
                senderId: incomingSenderId,
                text,
                timestamp: incoming.timestamp.getTime(),
              },
            ];
            callRef.current.update({
              custom: {
                ...(callRef.current.state?.custom || {}),
                chat_history: updatedHistory,
              },
            }).catch(() => {});
          }
        }

        if (!showChatRef.current) {
          setUnreadChatCount((prev) => prev + 1);
        }

        triggerChatPop(incoming);
      } else if (eventType === "request_chat_history") {
        // A newly joined participant is requesting chat history
        const requestedBy = event.custom?.requestedBy;
        const myId = localParticipant?.userId || String(session?.user?.id || "");
        if (requestedBy && requestedBy !== myId && chatMessagesRef.current.length > 0) {
          callRef.current?.sendCustomEvent({
            type: "chat_history_sync",
            targetUserId: requestedBy,
            messages: chatMessagesRef.current.map((m) => ({
              id: m.id,
              sender: m.sender,
              text: m.text,
              timestamp: m.timestamp instanceof Date ? m.timestamp.getTime() : m.timestamp,
              senderId: m.senderId,
            })),
          } as any).catch(() => {});
        }
      } else if (eventType === "chat_history_sync") {
        // Received synced chat history from connected peers/host
        const targetUserId = event.custom?.targetUserId;
        const myId = localParticipant?.userId || String(session?.user?.id || "");
        if (!targetUserId || targetUserId === myId || targetUserId === "all") {
          const incomingList = event.custom?.messages;
          if (Array.isArray(incomingList) && incomingList.length > 0) {
            setChatMessages((prev) => {
              const map = new Map<string, ChatMessage>();
              prev.forEach((m) => map.set(m.id, m));
              incomingList.forEach((m: any) => {
                if (m?.id && !map.has(m.id)) {
                  map.set(m.id, {
                    id: m.id,
                    sender: m.sender || "Participant",
                    text: m.text || "",
                    timestamp: new Date(m.timestamp || Date.now()),
                    senderId: m.senderId,
                    isLocal: m.senderId === myId,
                  });
                }
              });
              return Array.from(map.values()).sort(
                (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
              );
            });
          }
        }
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
      } else if (eventType === "room_policy_state") {
        const audioLocked = !!event.custom?.is_audio_locked;
        const videoLocked = !!event.custom?.is_video_locked;
        setIsAudioLocked(audioLocked);
        setIsVideoLocked(videoLocked);

        if (!isHost) {
          if (audioLocked) {
            callRef.current?.microphone?.disable?.().catch(() => {});
            toast.info("Microphones have been locked by the host");
          }
          if (videoLocked) {
            callRef.current?.camera?.disable?.().catch(() => {});
            toast.info("Cameras have been locked by the host");
          }
        }
      }
    };
    call.on("custom", handler);
    return () => {
      call.off("custom", handler);
    };
  }, [call, localParticipant?.userId, session?.user?.id, triggerChatPop, isHost]);

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

  // ── Initial Chat History Sync from Room Custom Data & Peer Request ──
  useEffect(() => {
    if (!call) return;

    const myId = localParticipant?.userId || String(session?.user?.id || "guest");

    // 1. Restore from room-level custom chat history buffer
    const roomHistory = call.state?.custom?.chat_history;
    if (Array.isArray(roomHistory) && roomHistory.length > 0) {
      setChatMessages((prev) => {
        const map = new Map<string, ChatMessage>();
        prev.forEach((m) => map.set(m.id, m));
        roomHistory.forEach((m: any) => {
          if (m?.id && !map.has(m.id)) {
            map.set(m.id, {
              id: m.id,
              sender: m.sender || "Participant",
              text: m.text || "",
              timestamp: new Date(m.timestamp || Date.now()),
              senderId: m.senderId,
              isLocal: m.senderId === myId,
            });
          }
        });
        return Array.from(map.values()).sort(
          (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
        );
      });
    }

    // 2. Restore from sessionStorage as local cache
    try {
      const stored = sessionStorage.getItem(`techxagon_chat_${call.id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setChatMessages((prev) => {
            const map = new Map<string, ChatMessage>();
            prev.forEach((m) => map.set(m.id, m));
            parsed.forEach((m: any) => {
              if (m?.id && !map.has(m.id)) {
                map.set(m.id, {
                  ...m,
                  timestamp: new Date(m.timestamp),
                });
              }
            });
            return Array.from(map.values()).sort(
              (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
            );
          });
        }
      }
    } catch {
      // non-fatal
    }

    // 3. Request history from connected peers who are already in the call
    const timer = setTimeout(() => {
      call.sendCustomEvent({
        type: "request_chat_history",
        requestedBy: myId,
      } as any).catch(() => {});
    }, 600);

    return () => clearTimeout(timer);
  }, [call, call?.id, call?.state?.custom?.chat_history, localParticipant?.userId, session?.user?.id]);

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
      const screenShareParticipant = allParticipantsRaw.find((p) => p.screenShareStream);
      const activeCameraParticipant =
        (screenShareParticipant && !screenShareParticipant.isLocalParticipant ? screenShareParticipant : dominantSpeaker) || null;

      return (
        <div
          ref={screenShareContainerRef}
          className="w-full h-full relative group/screenshare flex flex-col items-center justify-center bg-[#121316] rounded-2xl overflow-hidden border border-white/10"
        >
          {/* Audio for all participants rendered globally */}
          <ParticipantsAudio participants={allParticipantsRaw} />

          {/* Main Presentation Screen */}
          {screenShareParticipant ? (
            <div className="w-full h-full relative flex items-center justify-center p-1 sm:p-2">
              <div className="w-full h-full relative rounded-xl overflow-hidden bg-black flex items-center justify-center">
                <ParticipantView
                  participant={screenShareParticipant}
                  trackType="screenShareTrack"
                  className="w-full h-full object-contain"
                  muteAudio
                />
              </div>

              {/* Presenter Status Badge */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-black/75 backdrop-blur-md border border-white/15 text-white text-xs font-semibold shadow-xl">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>
                  {screenShareParticipant.isLocalParticipant
                    ? "You are presenting"
                    : `${screenShareParticipant.name || "Participant"} is presenting`}
                </span>
                {screenShareParticipant.isLocalParticipant && (
                  <button
                    onClick={async () => {
                      if (callRef.current) {
                        try {
                          await callRef.current.screenShare.disable();
                        } catch {}
                      }
                    }}
                    className="ml-2 px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold transition cursor-pointer shadow-sm"
                  >
                    Stop Presenting
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-zinc-500 gap-2">
              <Monitor size={36} className="text-zinc-600 animate-pulse" />
              <p className="text-sm font-medium">Connecting presentation...</p>
            </div>
          )}

          {/* Floating PIP Tile for Active Speaker/Presenter Camera (Google Meet style) */}
          {activeCameraParticipant && activeCameraParticipant.videoStream && (
            <div className="absolute bottom-4 right-4 z-20 w-36 sm:w-48 h-24 sm:h-32 rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 bg-zinc-900 pointer-events-auto transition-all hover:scale-105">
              <ParticipantView
                participant={activeCameraParticipant}
                className="w-full h-full object-cover"
                muteAudio
              />
              <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-[10px] font-semibold text-white truncate max-w-[80%]">
                {activeCameraParticipant.name || "Speaker"}
              </div>
            </div>
          )}

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit fullscreen" : "View fullscreen"}
            className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/70 hover:bg-black/90 text-white text-xs font-medium backdrop-blur-md border border-white/15 opacity-0 group-hover/screenshare:opacity-100 transition-all duration-200 shadow-xl cursor-pointer"
          >
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </button>
        </div>
      );
    }

    return (
      <div ref={gridContainerRef} className="w-full h-full overflow-hidden custom-paginated-grid relative">
        <ParticipantsAudio participants={allParticipantsRaw} />
        <PaginatedGridLayout groupSize={groupSize} />
      </div>
    );
  }, [someoneSharing, groupSize, isFullscreen, toggleFullscreen, allParticipantsRaw, dominantSpeaker]);

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
          <h1
            className="text-sm sm:text-base font-bold text-white tracking-wide truncate max-w-[160px] sm:max-w-[300px]"
            title={meetingTitle}
          >
            {meetingTitle}
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
            onClick={() => {
              setShowChat((prev) => !prev);
              if (showParticipants) setShowParticipants(false);
            }}
            className={`relative flex items-center gap-1 sm:gap-2 px-2.5 sm:px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-medium transition cursor-pointer ${
              showChat
                ? "bg-[#EF7B55] border-[#EF7B55] text-white"
                : "bg-white/10 hover:bg-white/20 border-white/15 text-white"
            }`}
          >
            <MessageCircle size={16} />
            <span className="hidden sm:inline">Chat</span>
            {unreadChatCount > 0 && !showChat && (
              <span className="px-1.5 py-0.5 text-[10px] font-extrabold rounded-full bg-red-500 text-white animate-pulse">
                {unreadChatCount > 99 ? "99+" : unreadChatCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setShowParticipants((prev) => !prev);
              if (showChat) setShowChat(false);
            }}
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
        className={`fixed top-[57px] right-0 bottom-0 w-[min(360px,94vw)] sm:w-96 bg-[#1a1b1e] border-l border-white/10 backdrop-blur-2xl transition-transform duration-300 ease-in-out z-50 shadow-2xl flex flex-col ${
          showParticipants ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex-none px-4 py-3.5 border-b border-white/10 flex items-center justify-between bg-[#202124]/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EF7B55]/15 flex items-center justify-center">
              <Users className="w-4 h-4 text-[#EF7B55]" />
            </div>
            <div>
              <h2 className="font-bold text-white text-sm leading-none">Participants</h2>
              <p className="text-zinc-400 text-[11px] mt-0.5">{uniqueParticipantCount} in call</p>
            </div>
          </div>
          <button
            onClick={() => setShowParticipants(false)}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer text-sm"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto participants-scroll px-3 py-3">
          <ParticipantsList
            raisedHandsMap={raisedHandsMap}
            isHost={isHost}
            isAudioLocked={isAudioLocked}
            isVideoLocked={isVideoLocked}
            onToggleAudioLock={handleToggleAudioLock}
            onToggleVideoLock={handleToggleVideoLock}
            onMuteAll={handleMuteAll}
          />
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

      {/* Floating Chat Pop Notification Overlay */}
      <ChatPopOverlay
        pops={chatPops}
        onDismiss={handleDismissChatPop}
        onOpenChat={handleOpenChatFromPop}
      />

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
        unreadChatCount={unreadChatCount}
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

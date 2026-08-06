"use client";

import {useSession} from "next-auth/react";
import {
  CallingState,
  CallParticipantsList,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
  useCall,
} from "@stream-io/video-react-sdk";
import {useState, useEffect, useCallback, useMemo, useRef, memo} from "react";
import {useRouter, usePathname} from "next/navigation";
import {Button} from "../ui/button";
import {toast} from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Users,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  PhoneOff,
  Smile,
  MessageCircle,
  Send,
  WifiOff,
  RefreshCw,
} from "lucide-react";
import {Spinner} from "../ui/spinner";
import {useLowCostCallSettings} from "@/hooks/useLowCostCallSettings";
import {useMeetingVisibility} from "@/hooks/useMeetingVisibility";
import {useMediaPreferences} from "@/hooks/useMediaPreferences";

// ── Types ──

interface FloatingReaction {
  id: string;
  emoji: string;
  x: number;
}

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: Date;
}

const ALLOWED_EMOJIS = ["👍", "👏", "❤️", "🎉", "✋", "🔥"];
const REACTION_THROTTLE_MS = 2000;

// ── Memoized FloatingReactions overlay ──
// Extracted to prevent reaction state changes from re-rendering the video grid.
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
          className="absolute bottom-32 text-4xl sm:text-5xl"
          style={{
            left: `${r.x}%`,
            animation: "floatUp 2.5s ease-out forwards",
          }}
        >
          {r.emoji}
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

  const router = useRouter();
  const pathname = usePathname();
  const {data: session, status} = useSession();

  const {
    useCallCallingState,
    useParticipantCount,
    useScreenShareState,
    useHasOngoingScreenShare,
    useMicrophoneState,
    useCameraState,
    useLocalParticipant,
    useHasPermissions,
  } = useCallStateHooks();
  const call = useCall();
  const callingState = useCallCallingState();
  const participantCount = useParticipantCount?.() || 0;
  const localParticipant = useLocalParticipant();

  const {isMute: isMicMuted, isEnabled: isMicEnabled} = useMicrophoneState();
  const {isMute: isCamMuted, isEnabled: isCamEnabled} = useCameraState();
  const isMicOff = isMicMuted || isMicEnabled === false;
  const isCamOff = isCamMuted || isCamEnabled === false;
  const {status: screenShareStatus} = useScreenShareState();
  const isScreenSharing = screenShareStatus === "enabled";
  const someoneSharing = useHasOngoingScreenShare();

  const hasMicPermission = useHasPermissions("send-audio");
  const hasCamPermission = useHasPermissions("send-video");
  const hasScreenSharePermission = useHasPermissions("screenshare");

  const isHost = session?.user?.role === "teacher" || session?.user?.role === "admin";

  // ── Refs for stability ──
  const callRef = useRef(call);
  callRef.current = call;
  const lastReactionTimeRef = useRef(0);
  const reactionTimeoutRefs = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Extract meeting ID from pathname for media preferences
  const meetingId = useMemo(() => {
    const parts = pathname?.split("/") || [];
    return parts[parts.length - 1] || "unknown";
  }, [pathname]);

  // ── Integrate custom hooks ──
  useLowCostCallSettings(call);
  const {isReconnecting, isOffline, isMigrating} = useMeetingVisibility();
  const {persistCurrentState} = useMediaPreferences(meetingId);

  // ── Window resize listener (registered once) ──
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ── Group size via useMemo (max 6 tiles/page for cost) ──
  const groupSize = useMemo(() => {
    if (windowWidth < 640) {
      // Mobile: 3-4 tiles
      return participantCount > 50 ? 4 : 3;
    } else if (windowWidth < 1024) {
      // Tablet: 4-6 tiles
      return participantCount > 50 ? 6 : 4;
    } else {
      // Desktop: max 6 tiles
      return 6;
    }
  }, [windowWidth, participantCount]);

  // ── Helper to determine dashboard path based on role ──
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

  // ── Send Reaction with throttling & validation ──
  const handleSendReaction = useCallback(async (emoji: string) => {
    if (!callRef.current) return;

    // Validate emoji
    if (!ALLOWED_EMOJIS.includes(emoji)) return;

    // Throttle: max 1 reaction per 2 seconds
    const now = Date.now();
    if (now - lastReactionTimeRef.current < REACTION_THROTTLE_MS) return;
    lastReactionTimeRef.current = now;

    try {
      await callRef.current.sendReaction({
        type: "reaction",
        emoji_code: emoji,
        custom: { emoji },
      });
      // Do NOT add a local floating reaction here.
      // The SDK echoes the reaction back via call.reaction_new,
      // so the listener below will handle rendering for ALL participants including sender.
    } catch (err) {
      console.error("Error sending reaction:", err);
    }
  }, []);

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
  const handleLeaveCall = useCallback(async () => {
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
    // Targeted cleanup — only remove techxagon keys, not all session storage
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
  }, [router, getDashboardPath]);

  // ── Persist mic/cam state when user toggles ──
  const handleToggleMic = useCallback(() => {
    if (!callRef.current) return;
    callRef.current.microphone.toggle();
    // Persist after toggle (use current opposite state since toggle hasn't completed)
    persistCurrentState(!isMicOff, !isCamOff);
  }, [isMicOff, isCamOff, persistCurrentState]);

  const handleToggleCam = useCallback(() => {
    if (!callRef.current) return;
    callRef.current.camera.toggle();
    persistCurrentState(!isMicOff, !isCamOff);
  }, [isMicOff, isCamOff, persistCurrentState]);

  // ── Listen for incoming custom chat events ──
  useEffect(() => {
    if (!call) return;
    const handler = (event: any) => {
      if (event.custom?.type === "chat_message") {
        const incoming: ChatMessage = {
          id: crypto.randomUUID(),
          sender: event.custom.sender || "Unknown",
          text: event.custom.text || "",
          timestamp: new Date(),
        };
        setChatMessages((prev) => [...prev, incoming]);
      }
    };
    call.on("custom", handler);
    return () => {
      call.off("custom", handler);
    };
  }, [call]);

  // ── Restore chat messages from sessionStorage on mount ──
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

  // ── Save chat messages to sessionStorage on change ──
  useEffect(() => {
    if (!call?.id || chatMessages.length === 0) return;
    try {
      sessionStorage.setItem(`techxagon_chat_${call.id}`, JSON.stringify(chatMessages));
    } catch {
      // non-fatal
    }
  }, [chatMessages, call?.id]);

  // ── Listen for incoming reactions — single source of truth for ALL reactions ──
  useEffect(() => {
    if (!call) return;
    const handler = (event: any) => {
      const emoji = event.reaction?.emoji_code || event.reaction?.custom?.emoji;
      if (emoji && ALLOWED_EMOJIS.includes(emoji)) {
        const id = crypto.randomUUID();
        const x = 20 + Math.random() * 60;
        setFloatingReactions((prev) => [...prev, {id, emoji, x}]);
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

  // ── Clean up reaction timeouts on unmount ──
  useEffect(() => {
    return () => {
      reactionTimeoutRefs.current.forEach((timeout) => clearTimeout(timeout));
      reactionTimeoutRefs.current.clear();
    };
  }, []);

  // ── Prevent ghost participants on reload/close ──
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (callRef.current) {
        callRef.current.leave().catch(() => {});
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // ── Layout: useMemo-computed JSX element (NOT a component) ──
  const callLayoutElement = useMemo(() => {
    // Screen sharing active: SpeakerLayout with screen share on top, participants below
    if (someoneSharing) {
      return (
        <div className="w-full h-full">
          <SpeakerLayout
            participantsBarPosition="bottom"
          />
        </div>
      );
    }

    // Normal mode: Grid only
    return (
      <div className="w-full h-full overflow-hidden custom-paginated-grid">
        <PaginatedGridLayout
          groupSize={groupSize}
          excludeLocalParticipant={participantCount > 50}
        />
      </div>
    );
  }, [someoneSharing, groupSize, participantCount]);

  // ── Loading / auth checks ──
  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0f1117]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (callingState !== CallingState.JOINED) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0f1117]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <section className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-slate-950 via-zinc-950 to-slate-950 text-white flex flex-col">
      {/* Top Header Bar */}
      <header className="relative z-20 w-full px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between backdrop-blur-xl bg-slate-950/70 border-b border-white/10 gap-2">
        {/* Left: Brand & Live Indicator */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider shrink-0">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500 animate-ping" />
            <span>LIVE</span>
          </div>
          <div className="hidden sm:block h-4 w-px bg-white/15 shrink-0" />
          <h1 className="hidden sm:block text-sm sm:text-base font-bold text-white tracking-wide truncate max-w-[200px] sm:max-w-[350px]">
            Techxagon Meeting Room
          </h1>
        </div>

        {/* Center: Security Badge (Desktop) */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-400 shrink-0">
          <span className="text-emerald-400 font-bold">✓</span>
          <span>End-to-End Encrypted Session</span>
        </div>

        {/* Right: Invite & Participants Controls */}
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
              {participantCount}
            </span>
          </button>
        </div>
      </header>

      {/* Reconnection Banner */}
      <ReconnectionBanner
        isReconnecting={isReconnecting}
        isOffline={isOffline}
        isMigrating={isMigrating}
      />

      {/* Main Video Stage */}
      <div className="flex-1 min-h-0 w-full flex items-stretch justify-center p-2 sm:p-3 pb-28">
        <div className="w-full max-w-[1440px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-zinc-950/60 backdrop-blur-md">
          {callLayoutElement}
        </div>
      </div>

      {/* ── Floating Reactions Overlay ── */}
      <FloatingReactionsOverlay reactions={floatingReactions} />

      {/* Inline CSS for float animation */}
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

      {/* Slide-over Participants Drawer */}
      <div
        className={`fixed top-[57px] right-0 bottom-24 w-[min(320px,90vw)] sm:w-80 bg-zinc-950/96 border-l border-white/10 backdrop-blur-2xl transition-transform duration-300 ease-in-out z-30 shadow-2xl flex flex-col ${
          showParticipants ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex-none p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#EF7B55]" />
            <h2 className="font-bold text-white text-sm">Participants ({participantCount})</h2>
          </div>
          <button
            onClick={() => setShowParticipants(false)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto p-2">
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>
      </div>

      {/* ── Chat Drawer ── */}
      <div
        className={`fixed top-[57px] right-0 bottom-24 w-[min(360px,90vw)] sm:w-[380px] bg-zinc-950/96 border-l border-white/10 backdrop-blur-2xl transition-transform duration-300 ease-in-out z-30 shadow-2xl flex flex-col ${
          showChat ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Chat Header */}
        <div className="flex-none p-4 border-b border-white/10 flex items-center justify-between">
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

        {/* Chat Messages */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3">
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

        {/* Chat Input */}
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

      {/* ─── Floating Bottom Control Dock ─── */}
      <div className="fixed bottom-4 left-0 right-0 z-40 flex items-end justify-center px-3">
        <div className="flex items-center gap-1.5 sm:gap-2 backdrop-blur-2xl bg-zinc-950/95 border border-white/12 shadow-2xl rounded-2xl px-3 sm:px-4 py-2.5 max-w-[calc(100vw-24px)] overflow-x-auto">

          {/* ── Microphone ── */}
          {(hasMicPermission || isHost) && (
            <button
              onClick={handleToggleMic}
              title={isMicOff ? "Unmute" : "Mute"}
              className={`flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-2xl transition-all duration-300 cursor-pointer shrink-0 min-w-[64px] hover:-translate-y-1 hover:shadow-lg ${
                isMicOff
                  ? "bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 hover:shadow-red-500/20"
                  : "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 hover:shadow-emerald-500/20"
              }`}
            >
              {isMicOff ? <MicOff size={20} strokeWidth={2.5} /> : <Mic size={20} strokeWidth={2.5} />}
              <span className="text-[10px] font-bold tracking-wide">
                {isMicOff ? "Muted" : "Mic"}
              </span>
            </button>
          )}

          {/* ── Camera ── */}
          {(hasCamPermission || isHost) && (
            <button
              onClick={handleToggleCam}
              title={isCamOff ? "Start Camera" : "Stop Camera"}
              className={`flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-2xl transition-all duration-300 cursor-pointer shrink-0 min-w-[64px] hover:-translate-y-1 hover:shadow-lg ${
                isCamOff
                  ? "bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 hover:shadow-red-500/20"
                  : "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 hover:shadow-emerald-500/20"
              }`}
            >
              {isCamOff ? <VideoOff size={20} strokeWidth={2.5} /> : <Video size={20} strokeWidth={2.5} />}
              <span className="text-[10px] font-bold tracking-wide">
                {isCamOff ? "Stopped" : "Cam"}
              </span>
            </button>
          )}

          {/* ── Screen Share (desktop only) ── */}
          {(hasScreenSharePermission || isHost) && (
            <button
              onClick={handleScreenShare}
              title={isScreenSharing ? "Stop Sharing" : "Share Screen"}
              className={`hidden sm:flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-2xl transition-all duration-300 cursor-pointer shrink-0 min-w-[64px] hover:-translate-y-1 hover:shadow-lg ${
                isScreenSharing
                  ? "bg-sky-500 hover:bg-sky-400 text-white shadow-sky-500/40 border border-sky-400"
                  : "bg-white/5 hover:bg-white/15 text-zinc-300 border border-white/10 hover:shadow-white/10"
              }`}
            >
              <Monitor size={20} strokeWidth={2.5} />
              <span className="text-[10px] font-bold tracking-wide">
                {isScreenSharing ? "Sharing" : "Share"}
              </span>
            </button>
          )}

          {/* ── Reactions ── */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 text-zinc-300 hover:text-white transition-all duration-300 cursor-pointer shrink-0 min-w-[64px] hover:-translate-y-1 hover:shadow-lg hover:shadow-white/10"
              title="Send Reaction"
            >
              <Smile size={20} strokeWidth={2.5} />
              <span className="text-[10px] font-bold tracking-wide">React</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="border border-white/15 bg-zinc-900/98 backdrop-blur-xl text-white rounded-2xl p-2 shadow-2xl flex flex-wrap gap-1 max-w-[200px]">
              {ALLOWED_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleSendReaction(emoji)}
                  className="p-2 text-lg hover:bg-white/15 rounded-xl transition cursor-pointer hover:scale-125"
                >
                  {emoji}
                </button>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* ── Chat ── */}
          <button
            onClick={() => { setShowChat((prev) => !prev); if (showParticipants) setShowParticipants(false); }}
            title="Chat"
            className={`flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-2xl transition-all duration-300 cursor-pointer shrink-0 min-w-[64px] hover:-translate-y-1 hover:shadow-lg ${
              showChat
                ? "bg-[#EF7B55] hover:bg-[#e0663f] border border-[#EF7B55] text-white shadow-[#EF7B55]/30"
                : "bg-white/5 hover:bg-white/15 border border-white/10 text-zinc-300 hover:text-white hover:shadow-white/10"
            }`}
          >
            <MessageCircle size={20} strokeWidth={2.5} />
            <span className="text-[10px] font-bold tracking-wide">Chat</span>
          </button>

          {/* ── Host Tools (Mute All & Stop Video) ── */}
          {isHost && (
            <>
              <div className="h-8 w-px bg-white/10 mx-1 shrink-0" />
              <button
                onClick={() => {
                  callRef.current?.muteAllUsers('audio').then(() => {
                    toast.success("Muted all participants");
                  });
                }}
                title="Mute All Guests"
                className="flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-2xl transition-all duration-300 cursor-pointer shrink-0 min-w-[64px] bg-amber-500/20 border border-amber-500/40 text-amber-400 hover:bg-amber-500/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-500/20"
              >
                <MicOff size={20} strokeWidth={2.5} />
                <span className="text-[10px] font-bold tracking-wide">Mute All</span>
              </button>
              <button
                onClick={() => {
                  callRef.current?.muteAllUsers('video').then(() => {
                    toast.success("Stopped video for all participants");
                  });
                }}
                title="Stop Video for All Guests"
                className="flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-2xl transition-all duration-300 cursor-pointer shrink-0 min-w-[64px] bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-red-500/20"
              >
                <VideoOff size={20} strokeWidth={2.5} />
                <span className="text-[10px] font-bold tracking-wide">Stop All</span>
              </button>
            </>
          )}

          {/* Divider */}
          <div className="h-8 w-px bg-white/10 mx-0.5 shrink-0" />

          {/* ── Leave ── */}
          <button
            onClick={handleLeaveCall}
            title="Leave Meeting"
            className="flex flex-col items-center gap-1 bg-gradient-to-b from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white px-3 py-2 rounded-xl font-bold shadow-lg shadow-red-600/30 hover:scale-105 transition-all cursor-pointer shrink-0 min-w-[52px]"
          >
            <PhoneOff size={18} />
            <span className="text-[9px] font-semibold leading-none">Leave</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default MeetingRoom;

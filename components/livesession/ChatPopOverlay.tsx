"use client";

import { useEffect, useRef, memo } from "react";
import { MessageCircle, X } from "lucide-react";

export interface ChatPopMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: Date;
  senderId?: string;
  isLocal?: boolean;
}

interface ChatPopOverlayProps {
  pops: ChatPopMessage[];
  onDismiss: (id: string) => void;
  onOpenChat: () => void;
}

const AVATAR_GRADIENTS = [
  "from-[#EF7B55] to-[#f9926b]",
  "from-indigo-600 to-indigo-700",
  "from-teal-600 to-teal-700",
  "from-emerald-600 to-emerald-700",
  "from-amber-600 to-amber-700",
  "from-purple-600 to-purple-700",
  "from-rose-600 to-rose-700",
];

function getAvatarGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

/**
 * Single Chat Pop Card with auto-dismiss, hover pause, and click to open
 */
const ChatPopCard = memo(function ChatPopCard({
  pop,
  onDismiss,
  onOpenChat,
}: {
  pop: ChatPopMessage;
  onDismiss: (id: string) => void;
  onOpenChat: () => void;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remainingTimeRef = useRef(6000);
  const startTimeRef = useRef(Date.now());

  const startDismissTimer = (duration: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    startTimeRef.current = Date.now();
    remainingTimeRef.current = duration;
    timerRef.current = setTimeout(() => {
      onDismiss(pop.id);
    }, duration);
  };

  useEffect(() => {
    startDismissTimer(6000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pop.id, onDismiss]);

  const handleMouseEnter = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      const elapsed = Date.now() - startTimeRef.current;
      remainingTimeRef.current = Math.max(1000, remainingTimeRef.current - elapsed);
    }
  };

  const handleMouseLeave = () => {
    startDismissTimer(remainingTimeRef.current);
  };

  const initial = (pop.sender || "U").charAt(0).toUpperCase();
  const gradient = getAvatarGradient(pop.sender || "User");

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => {
        onOpenChat();
        onDismiss(pop.id);
      }}
      className="group relative w-full rounded-2xl bg-[#181a20]/95 hover:bg-[#1f222a]/95 backdrop-blur-2xl border border-white/15 hover:border-[#EF7B55]/50 shadow-2xl p-3.5 sm:p-4 text-white transition-all duration-300 transform hover:scale-[1.02] cursor-pointer pointer-events-auto animate-in fade-in slide-in-from-bottom-4 duration-300"
      style={{
        boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.7), 0 0 15px 1px rgba(239, 123, 85, 0.15)",
      }}
      role="button"
      tabIndex={0}
      aria-label={`New message from ${pop.sender}: ${pop.text}`}
    >
      {/* Top row: Avatar + Sender Name + Badge + Close Button */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`w-7 h-7 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-md ring-1 ring-white/20`}
          >
            {initial}
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-bold text-xs sm:text-sm text-white truncate max-w-[130px] sm:max-w-[170px]">
              {pop.sender}
            </span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#EF7B55]/15 text-[#EF7B55] text-[10px] font-bold shrink-0">
              <MessageCircle size={10} />
              Chat
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[10px] text-zinc-500 font-medium">
            {pop.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDismiss(pop.id);
            }}
            className="w-5 h-5 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/15 transition cursor-pointer ml-1"
            title="Dismiss"
          >
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Message content */}
      <div className="pl-9 pr-1">
        <p className="text-xs sm:text-sm text-zinc-200 leading-snug line-clamp-3 break-words font-normal">
          {pop.text}
        </p>
        <div className="mt-1.5 flex items-center gap-1 text-[10px] text-zinc-500 group-hover:text-[#EF7B55] transition-colors font-medium">
          <span>Click to reply</span>
          <span className="text-xs leading-none">💬</span>
        </div>
      </div>
    </div>
  );
});

export const ChatPopOverlay = memo(function ChatPopOverlay({
  pops,
  onDismiss,
  onOpenChat,
}: ChatPopOverlayProps) {
  if (!pops || pops.length === 0) return null;

  return (
    <div
      className="fixed bottom-24 sm:bottom-28 left-3 sm:left-6 z-50 flex flex-col-reverse gap-2.5 max-w-[min(380px,calc(100vw-24px))] pointer-events-none"
      aria-live="polite"
    >
      {pops.slice(-3).map((pop) => (
        <ChatPopCard
          key={pop.id}
          pop={pop}
          onDismiss={onDismiss}
          onOpenChat={onOpenChat}
        />
      ))}
    </div>
  );
});

/**
 * Synthesizes a soft, pleasant notification chime for incoming meeting chat messages
 */
export function playChatChime() {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === "suspended") {
      ctx.resume();
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    const now = ctx.currentTime;
    // Two-tone soft glide (D5 -> A5)
    osc.frequency.setValueAtTime(587.33, now);
    osc.frequency.exponentialRampToValueAtTime(880.0, now + 0.07);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);

    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 300);
  } catch {
    // Non-fatal if audio context is blocked
  }
}

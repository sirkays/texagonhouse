"use client";

import { useCall, useCallStateHooks } from "@stream-io/video-react-sdk";
import { Mic, MicOff, Video, VideoOff, Monitor, Hand, PhoneOff } from "lucide-react";
import { useMeetingPermissions } from "@/hooks/useMeetingPermissions";
import { MoreMeetingMenu } from "./MoreMeetingMenu";

interface MeetingControlBarProps {
  isMicOff: boolean;
  isCamOff: boolean;
  isScreenSharing: boolean;
  isHandRaised: boolean;
  onToggleMic: () => void;
  onToggleCam: () => void;
  onScreenShare: () => void;
  onToggleRaiseHand: () => void;
  onLeaveClick: () => void;
  participantCount: number;
  showParticipants: boolean;
  setShowParticipants: (value: boolean | ((prev: boolean) => boolean)) => void;
  showChat: boolean;
  setShowChat: (value: boolean | ((prev: boolean) => boolean)) => void;
  onSendReaction: (emoji: string) => void;
  onOpenEndMeetingDialog: () => void;
  allowedEmojis: string[];
}

export function MeetingControlBar({
  isMicOff,
  isCamOff,
  isScreenSharing,
  isHandRaised,
  onToggleMic,
  onToggleCam,
  onScreenShare,
  onToggleRaiseHand,
  onLeaveClick,
  participantCount,
  showParticipants,
  setShowParticipants,
  showChat,
  setShowChat,
  onSendReaction,
  onOpenEndMeetingDialog,
  allowedEmojis,
}: MeetingControlBarProps) {
  const { useHasPermissions } = useCallStateHooks();
  const { canScreenShare } = useMeetingPermissions();

  const hasMicPermission = useHasPermissions("send-audio");
  const hasCamPermission = useHasPermissions("send-video");

  return (
    <div className="fixed bottom-4 left-0 right-0 z-40 flex items-end justify-center px-3">
      <div className="flex items-center gap-1.5 sm:gap-2 backdrop-blur-2xl bg-zinc-950/95 border border-white/12 shadow-2xl rounded-2xl px-3 sm:px-4 py-2.5 max-w-[calc(100vw-24px)] overflow-x-auto">

        {/* ── Microphone ── */}
        {hasMicPermission && (
          <button
            onClick={onToggleMic}
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
        {hasCamPermission && (
          <button
            onClick={onToggleCam}
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

        {/* ── Screen Share (feature detected + desktop only) ── */}
        {canScreenShare && (
          <button
            onClick={onScreenShare}
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

        {/* ── Raise Hand ── */}
        <button
          onClick={onToggleRaiseHand}
          title={isHandRaised ? "Lower Hand" : "Raise Hand"}
          className={`flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-2xl transition-all duration-300 cursor-pointer shrink-0 min-w-[64px] hover:-translate-y-1 hover:shadow-lg ${
            isHandRaised
              ? "bg-amber-500 hover:bg-amber-400 border border-amber-400 text-black shadow-amber-500/40 font-bold"
              : "bg-white/5 hover:bg-white/15 border border-white/10 text-zinc-300 hover:text-white hover:shadow-white/10"
          }`}
        >
          <Hand size={20} strokeWidth={2.5} className={isHandRaised ? "animate-bounce" : ""} />
          <span className="text-[10px] font-bold tracking-wide">
            {isHandRaised ? "Hand Up" : "Hand"}
          </span>
        </button>

        {/* ── More (...) Menu ── */}
        <MoreMeetingMenu
          participantCount={participantCount}
          showParticipants={showParticipants}
          setShowParticipants={setShowParticipants}
          showChat={showChat}
          setShowChat={setShowChat}
          onSendReaction={onSendReaction}
          onOpenEndMeetingDialog={onOpenEndMeetingDialog}
          allowedEmojis={allowedEmojis}
        />

        {/* Divider */}
        <div className="h-8 w-px bg-white/10 mx-0.5 shrink-0" />

        {/* ── Leave ── */}
        <button
          onClick={onLeaveClick}
          title="Leave Meeting"
          className="flex flex-col items-center gap-1 bg-gradient-to-b from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white px-3.5 py-2 rounded-xl font-bold shadow-lg shadow-red-600/30 hover:scale-105 transition-all cursor-pointer shrink-0 min-w-[56px]"
        >
          <PhoneOff size={18} />
          <span className="text-[9px] font-semibold leading-none">Leave</span>
        </button>
      </div>
    </div>
  );
}

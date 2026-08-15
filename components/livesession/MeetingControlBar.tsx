"use client";

import { useCall, useCallStateHooks } from "@stream-io/video-react-sdk";
import { Mic, MicOff, Video, VideoOff, Monitor, Hand, PhoneOff, Disc } from "lucide-react";
import { useMeetingPermissions } from "@/hooks/useMeetingPermissions";
import { MoreMeetingMenu } from "./MoreMeetingMenu";
import { toast } from "sonner";
import { useState } from "react";

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
  const call = useCall();
  const { useHasPermissions, useIsCallRecordingInProgress } = useCallStateHooks();
  const { canScreenShare, canRecord, canMuteUsers } = useMeetingPermissions();

  const isRecording = useIsCallRecordingInProgress();
  const [isTogglingRecord, setIsTogglingRecord] = useState(false);
  const [isMutingAll, setIsMutingAll] = useState(false);

  const hasMicPermission = useHasPermissions("send-audio");
  const hasCamPermission = useHasPermissions("send-video");

  const handleToggleRecord = async () => {
    if (!call) return;
    setIsTogglingRecord(true);
    try {
      if (isRecording) {
        await call.stopRecording();
        toast.info("Recording stopped");
      } else {
        await call.startRecording();
        toast.success("Recording started");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to toggle recording");
    } finally {
      setIsTogglingRecord(false);
    }
  };

  const handleMuteAll = async () => {
    if (!call) return;
    setIsMutingAll(true);
    try {
      await call.muteAllUsers('audio');
      toast.success('All participants muted');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to mute all');
    } finally {
      setIsMutingAll(false);
    }
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 flex items-end justify-center px-2 pb-[env(safe-area-inset-bottom,0px)]"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)' }}
    >
      <div className="flex items-center gap-1 sm:gap-2 bg-[#1a1c21] border-t border-white/8 shadow-2xl w-full sm:w-auto sm:rounded-2xl sm:mb-2 px-2 sm:px-4 py-2 sm:py-2.5 overflow-x-auto max-w-full" style={{ minHeight: '56px' }}>

        {/* ── Active Recording Badge ── */}
        {isRecording && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 font-bold text-[11px] animate-pulse shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-lg shadow-red-500/50" />
            <span>REC</span>
          </div>
        )}

        {/* ── Microphone ── */}
        {hasMicPermission && (
          <button
            onClick={onToggleMic}
            title={isMicOff ? "Unmute" : "Mute"}
            className={`flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-2xl transition-all duration-300 cursor-pointer shrink-0 min-w-[64px] ${
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
            className={`flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-2xl transition-all duration-300 cursor-pointer shrink-0 min-w-[64px] ${
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
            className={`hidden sm:flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-2xl transition-all duration-300 cursor-pointer shrink-0 min-w-[64px] ${
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

        {/* ── Record Button (Host/Authorized) ── */}
        {canRecord && (
          <button
            onClick={handleToggleRecord}
            disabled={isTogglingRecord}
            title={isRecording ? "Stop Recording" : "Record Meeting"}
            className={`flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-2xl transition-all duration-300 cursor-pointer shrink-0 min-w-[64px] disabled:opacity-50 ${
              isRecording
                ? "bg-red-600 hover:bg-red-500 border border-red-400 text-white shadow-red-600/40 font-bold"
                : "bg-white/5 hover:bg-white/15 border border-white/10 text-zinc-300 hover:text-white hover:shadow-white/10"
            }`}
          >
            <Disc size={20} strokeWidth={2.5} className={isRecording ? "animate-spin" : ""} />
            <span className="text-[10px] font-bold tracking-wide">
              {isRecording ? "Stop Rec" : "Record"}
            </span>
          </button>
        )}

        {/* ── Mute All (Host only) ── */}
        {canMuteUsers && (
          <button
            onClick={handleMuteAll}
            disabled={isMutingAll}
            title="Mute all participants"
            className="hidden sm:flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-2xl transition-all duration-300 cursor-pointer shrink-0 min-w-[64px] bg-white/5 hover:bg-amber-500/20 border border-white/10 hover:border-amber-500/30 text-zinc-300 hover:text-amber-400 disabled:opacity-50"
          >
            <MicOff size={20} strokeWidth={2.5} />
            <span className="text-[10px] font-bold tracking-wide">
              {isMutingAll ? 'Muting…' : 'Mute All'}
            </span>
          </button>
        )}

        {/* ── Raise Hand ── */}
        <button
          onClick={onToggleRaiseHand}
          title={isHandRaised ? "Lower Hand" : "Raise Hand"}
          className={`flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-2xl transition-all duration-300 cursor-pointer shrink-0 min-w-[64px] ${
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
          className="flex flex-col items-center gap-1 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white px-3 py-2 sm:px-3.5 rounded-xl font-bold shadow-md transition-all cursor-pointer shrink-0 min-w-[44px] sm:min-w-[56px]"
        >
          <PhoneOff size={18} />
          <span className="text-[9px] font-semibold leading-none hidden sm:block">Leave</span>
        </button>
      </div>
    </div>
  );
}

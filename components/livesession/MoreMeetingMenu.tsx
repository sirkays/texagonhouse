"use client";

import { useState } from "react";
import { useCall, useCallStateHooks } from "@stream-io/video-react-sdk";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  MoreHorizontal,
  Users,
  MessageCircle,
  Smile,
  MicOff,
  VideoOff,
  PhoneOff,
  Disc,
  Mic,
  Video,
} from "lucide-react";
import { useMeetingPermissions } from "@/hooks/useMeetingPermissions";

interface MoreMeetingMenuProps {
  participantCount: number;
  showParticipants: boolean;
  setShowParticipants: (value: boolean | ((prev: boolean) => boolean)) => void;
  showChat: boolean;
  setShowChat: (value: boolean | ((prev: boolean) => boolean)) => void;
  onSendReaction: (emoji: string) => void;
  onOpenEndMeetingDialog: () => void;
  allowedEmojis: string[];
}

export function MoreMeetingMenu({
  participantCount,
  showParticipants,
  setShowParticipants,
  showChat,
  setShowChat,
  onSendReaction,
  onOpenEndMeetingDialog,
  allowedEmojis,
}: MoreMeetingMenuProps) {
  const [isAudioLocked, setIsAudioLocked] = useState(false);
  const [isVideoLocked, setIsVideoLocked] = useState(false);
  const call = useCall();
  const { useIsCallRecordingInProgress } = useCallStateHooks();
  const isRecording = useIsCallRecordingInProgress();
  const { isHost, canMuteUsers, canEndCall, canRecord } = useMeetingPermissions();

  const handleToggleAllAudio = async () => {
    if (!call) return;
    try {
      if (!isAudioLocked) {
        await call.muteAllUsers('audio');
        setIsAudioLocked(true);
        toast.success('Disabled audio for all participants');
      } else {
        const participants = call.state.participants;
        const remote = participants.filter((p: any) => !p.isLocalParticipant);
        for (const p of remote) {
          try {
            await (call as any).updateUserPermissions({
              user_id: p.userId,
              grant_permissions: ['send-audio'],
            });
          } catch {}
        }
        setIsAudioLocked(false);
        toast.success('Enabled audio for all participants');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to toggle audio for participants.');
    }
  };

  const handleToggleAllVideo = async () => {
    if (!call) return;
    try {
      if (!isVideoLocked) {
        await call.muteAllUsers('video');
        setIsVideoLocked(true);
        toast.success('Disabled video for all participants');
      } else {
        const participants = call.state.participants;
        const remote = participants.filter((p: any) => !p.isLocalParticipant);
        for (const p of remote) {
          try {
            await (call as any).updateUserPermissions({
              user_id: p.userId,
              grant_permissions: ['send-video'],
            });
          } catch {}
        }
        setIsVideoLocked(false);
        toast.success('Enabled video for all participants');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to toggle video for participants.');
    }
  };

  // handleEnableAllAudio and handleEnableAllVideo are now merged into the toggle handlers above

  const handleToggleRecording = async () => {
    if (!call) return;
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
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 text-zinc-300 hover:text-white transition-all duration-300 cursor-pointer shrink-0 min-w-[64px] hover:-translate-y-1 hover:shadow-lg hover:shadow-white/10"
        title="More Actions"
      >
        <MoreHorizontal size={20} strokeWidth={2.5} />
        <span className="text-[10px] font-bold tracking-wide">More</span>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="border border-white/15 bg-zinc-900/98 backdrop-blur-xl text-white rounded-2xl p-2 shadow-2xl min-w-[200px] z-50">
        {/* People / Participants toggle */}
        <DropdownMenuItem
          onClick={() => {
            setShowParticipants((prev) => !prev);
            if (showChat) setShowChat(false);
          }}
          className="flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl hover:bg-white/10 cursor-pointer text-zinc-200"
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#EF7B55]" />
            <span>People ({participantCount})</span>
          </div>
          {showParticipants && <span className="text-[10px] text-[#EF7B55]">Active</span>}
        </DropdownMenuItem>

        {/* Chat toggle */}
        <DropdownMenuItem
          onClick={() => {
            setShowChat((prev) => !prev);
            if (showParticipants) setShowParticipants(false);
          }}
          className="flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl hover:bg-white/10 cursor-pointer text-zinc-200"
        >
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-sky-400" />
            <span>Chat</span>
          </div>
          {showChat && <span className="text-[10px] text-sky-400">Active</span>}
        </DropdownMenuItem>

        {/* Reactions Palette inline */}
        <DropdownMenuSeparator className="bg-white/10 my-1" />
        <div className="px-3 py-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 mb-1.5">
            <Smile className="w-3.5 h-3.5 text-amber-400" />
            Reactions
          </span>
          <div className="flex flex-wrap gap-1">
            {allowedEmojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => onSendReaction(emoji)}
                className="p-1.5 text-base hover:bg-white/15 rounded-lg transition cursor-pointer hover:scale-125"
                title={`Send ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Host Actions */}
        {isHost && (
          <>
            <DropdownMenuSeparator className="bg-white/10 my-1" />
            <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Host Tools
            </span>
            {canRecord && (
              <DropdownMenuItem
                onClick={handleToggleRecording}
                className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl hover:bg-white/10 cursor-pointer text-rose-400"
              >
                <Disc className={`w-4 h-4 ${isRecording ? "animate-spin text-red-500" : ""}`} />
                <span>{isRecording ? "Stop Recording" : "Start Recording"}</span>
              </DropdownMenuItem>
            )}

            {canMuteUsers && (
              <>
                <DropdownMenuItem
                  onClick={handleToggleAllAudio}
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl hover:bg-white/10 cursor-pointer ${
                    isAudioLocked ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {isAudioLocked ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  <span>{isAudioLocked ? 'Enable All Audio' : 'Disable All Audio'}</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={handleToggleAllVideo}
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl hover:bg-white/10 cursor-pointer ${
                    isVideoLocked ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {isVideoLocked ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                  <span>{isVideoLocked ? 'Enable All Video' : 'Disable All Video'}</span>
                </DropdownMenuItem>
              </>
            )}
          </>
        )}

        {/* Host End Meeting for Everyone */}
        {isHost && canEndCall && (
          <>
            <DropdownMenuSeparator className="bg-white/10 my-1" />
            <DropdownMenuItem
              onClick={onOpenEndMeetingDialog}
              className="flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl hover:bg-red-600/30 cursor-pointer text-red-400"
            >
              <PhoneOff className="w-4 h-4 text-red-500" />
              <span>End Meeting for Everyone</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

"use client";

import { useState, useEffect } from "react";
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
  unreadChatCount?: number;
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
  unreadChatCount = 0,
}: MoreMeetingMenuProps) {
  const call = useCall();
  const [isAudioLocked, setIsAudioLocked] = useState(false);
  const [isVideoLocked, setIsVideoLocked] = useState(false);

  useEffect(() => {
    if (!call) return;
    const custom = call.state.custom || {};
    if (custom.is_audio_locked !== undefined) setIsAudioLocked(!!custom.is_audio_locked);
    if (custom.is_video_locked !== undefined) setIsVideoLocked(!!custom.is_video_locked);
  }, [call, call?.state?.custom]);

  const { useIsCallRecordingInProgress } = useCallStateHooks();
  const isRecording = useIsCallRecordingInProgress();
  const { isHost, canMuteUsers, canEndCall, canRecord } = useMeetingPermissions();

  // Mute All Audio — temporary, participants can unmute themselves
  const handleMuteAllAudio = async () => {
    if (!call) return;
    try {
      await call.muteAllUsers('audio');
      toast.success('Muted all participants (they can unmute)');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to mute all participants.');
    }
  };

  // Mute All Video — temporary, participants can re-enable
  const handleMuteAllVideo = async () => {
    if (!call) return;
    try {
      await call.muteAllUsers('video');
      toast.success('Stopped all video (participants can re-enable)');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to stop all video.');
    }
  };

  // Disable/Enable All Audio — permission lock toggle
  const handleToggleAudioLock = async () => {
    if (!call) return;
    try {
      const nextState = !isAudioLocked;
      setIsAudioLocked(nextState);

      await call.update({
        custom: {
          ...(call.state.custom || {}),
          is_audio_locked: nextState,
        },
      });

      await call.sendCustomEvent({
        type: 'room_policy_state',
        is_audio_locked: nextState,
        is_video_locked: isVideoLocked,
      } as any);

      if (nextState) {
        await call.muteAllUsers('audio');
        const participants = call.state.participants;
        const remote = participants.filter((p: any) => !p.isLocalParticipant);
        for (const p of remote) {
          try {
            await (call as any).updateUserPermissions({
              user_id: p.userId,
              revoke_permissions: ['send-audio'],
            });
          } catch {}
        }
        toast.success('Disabled all audio — new participants will join with audio disabled');
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
        toast.success('Enabled all audio — participants can now unmute');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to toggle audio lock.');
    }
  };

  // Disable/Enable All Video — permission lock toggle
  const handleToggleVideoLock = async () => {
    if (!call) return;
    try {
      const nextState = !isVideoLocked;
      setIsVideoLocked(nextState);

      await call.update({
        custom: {
          ...(call.state.custom || {}),
          is_video_locked: nextState,
        },
      });

      await call.sendCustomEvent({
        type: 'room_policy_state',
        is_audio_locked: isAudioLocked,
        is_video_locked: nextState,
      } as any);

      if (nextState) {
        await call.muteAllUsers('video');
        const participants = call.state.participants;
        const remote = participants.filter((p: any) => !p.isLocalParticipant);
        for (const p of remote) {
          try {
            await (call as any).updateUserPermissions({
              user_id: p.userId,
              revoke_permissions: ['send-video'],
            });
          } catch {}
        }
        toast.success('Disabled all video — new participants will join with camera disabled');
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
        toast.success('Enabled all video — participants can now enable camera');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to toggle video lock.');
    }
  };

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
        className="relative flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 text-zinc-300 hover:text-white transition-all duration-300 cursor-pointer shrink-0 min-w-[64px] hover:-translate-y-1 hover:shadow-lg hover:shadow-white/10"
        title="More Actions"
      >
        <div className="relative">
          <MoreHorizontal size={20} strokeWidth={2.5} />
          {unreadChatCount > 0 && !showChat && (
            <span className="absolute -top-1.5 -right-2 w-2.5 h-2.5 rounded-full bg-[#EF7B55] border-2 border-[#1a1c21] animate-pulse" />
          )}
        </div>
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
          {unreadChatCount > 0 && !showChat ? (
            <span className="w-5 h-5 flex items-center justify-center text-[10px] font-extrabold rounded-full bg-[#EF7B55] text-white animate-pulse shrink-0">
              {unreadChatCount > 99 ? "99+" : unreadChatCount}
            </span>
          ) : showChat ? (
            <span className="text-[10px] text-sky-400 font-bold">Active</span>
          ) : null}
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
                  onClick={handleMuteAllAudio}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl hover:bg-white/10 cursor-pointer text-amber-400"
                >
                  <MicOff className="w-4 h-4" />
                  <span>Mute All Audio</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={handleMuteAllVideo}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl hover:bg-white/10 cursor-pointer text-amber-400"
                >
                  <VideoOff className="w-4 h-4" />
                  <span>Mute All Video</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-white/10 my-0.5" />

                <DropdownMenuItem
                  onClick={handleToggleAudioLock}
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl hover:bg-white/10 cursor-pointer ${
                    isAudioLocked ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {isAudioLocked ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  <span>{isAudioLocked ? 'Enable All Audio' : 'Disable All Audio'}</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={handleToggleVideoLock}
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

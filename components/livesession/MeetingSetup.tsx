"use client";

import { useSession } from "next-auth/react";
import {
  CallingState,
  DeviceSettings,
  useCall,
  useCallStateHooks,
  VideoPreview,
} from "@stream-io/video-react-sdk";
import Alert from "./Alert";
import { useEffect, useState, useMemo } from "react";
import { Button } from "../ui/button";
import { usePathname } from "next/navigation";
import { useMediaPreferences } from "@/hooks/useMediaPreferences";
import { useMeetingPermissions } from "@/hooks/useMeetingPermissions";
import { toast } from "sonner";
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  Settings2,
  ShieldCheck,
  ArrowRight,
  User,
} from "lucide-react";
import { useBrand } from "@/hooks/use-brand";

const MeetingSetup = ({
  setIsSetupComplete,
}: {
  setIsSetupComplete: (value: boolean) => void;
}) => {
  const brand = useBrand();
  const { data: session, status } = useSession();
  const [isMicCamToggled, setIsMicCamToggled] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoDisabled, setIsVideoDisabled] = useState(true);

  const call = useCall();
  if (!call) {
    throw new Error("useStreamCall must be used within a StreamCall component.");
  }

  const pathname = usePathname();
  const meetingId = useMemo(() => {
    const parts = pathname?.split("/") || [];
    return parts[parts.length - 1] || "unknown";
  }, [pathname]);
  const { persistCurrentState } = useMediaPreferences(meetingId);

  const { isHost, canMuteUsers } = useMeetingPermissions();
  const [roomMicPolicy, setRoomMicPolicy] = useState<'open' | 'locked'>('open');
  const [roomCamPolicy, setRoomCamPolicy] = useState<'open' | 'locked'>('open');
  const [isApplyingPolicy, setIsApplyingPolicy] = useState(false);

  const applyRoomPolicy = async () => {
    if (!call || !canMuteUsers) return;
    setIsApplyingPolicy(true);
    try {
      // Get participants from call state directly
      const participants = call.state.participants;
      const remoteParticipants = participants.filter((p: any) => !p.isLocalParticipant);
      const userId = String(session?.user?.id || '');

      if (roomMicPolicy === 'locked') {
        await call.muteAllUsers('audio');
      } else {
        // Unlock: grant send-audio back to all remote participants
        for (const p of remoteParticipants) {
          try {
            await (call as any).updateUserPermissions({
              user_id: p.userId,
              grant_permissions: ['send-audio'],
            });
          } catch {
            // individual grant may fail — continue
          }
        }
      }

      if (roomCamPolicy === 'locked') {
        await call.muteAllUsers('video');
      } else {
        // Unlock: grant send-video back to all remote participants
        for (const p of remoteParticipants) {
          try {
            await (call as any).updateUserPermissions({
              user_id: p.userId,
              grant_permissions: ['send-video'],
            });
          } catch {
            // individual grant may fail — continue
          }
        }
      }

      // Update call custom state to persist lock for newcomers
      await call.update({
        custom: {
          ...(call.state.custom || {}),
          is_audio_locked: roomMicPolicy === 'locked',
          is_video_locked: roomCamPolicy === 'locked',
        },
      });

      // Broadcast custom policy event
      await call.sendCustomEvent({
        type: 'room_policy_state',
        is_audio_locked: roomMicPolicy === 'locked',
        is_video_locked: roomCamPolicy === 'locked',
      } as any);

      toast.success(roomMicPolicy === 'locked' || roomCamPolicy === 'locked'
        ? 'Room policy applied — participants locked.'
        : 'Participants unlocked — they can now enable mic/camera.'
      );
    } catch (err: any) {
      toast.error(err?.message || 'Could not apply room policy.');
    } finally {
      setIsApplyingPolicy(false);
    }
  };

  const { useCallEndedAt, useCallStartsAt } = useCallStateHooks();
  const callStartsAt = useCallStartsAt();
  const callEndedAt = useCallEndedAt();
  const callTimeNotArrived =
    callStartsAt && new Date(callStartsAt) > new Date();
  const callHasEnded = !!callEndedAt;

  const isAudioLockedInRoom = !isHost && !!call?.state?.custom?.is_audio_locked;
  const isVideoLockedInRoom = !isHost && !!call?.state?.custom?.is_video_locked;

  useEffect(() => {
    if (isAudioLockedInRoom) {
      call.microphone.disable();
      setIsMuted(true);
    }
    if (isVideoLockedInRoom) {
      call.camera.disable();
      setIsVideoDisabled(true);
    }
  }, [isAudioLockedInRoom, isVideoLockedInRoom, call.camera, call.microphone]);

  useEffect(() => {
    if (isMicCamToggled || isAudioLockedInRoom || isVideoLockedInRoom) {
      if (isAudioLockedInRoom || isMicCamToggled) {
        call.microphone.disable();
        setIsMuted(true);
      }
      if (isVideoLockedInRoom || isMicCamToggled) {
        call.camera.disable();
        setIsVideoDisabled(true);
      }
    } else {
      call.camera.enable();
      call.microphone.enable();
      setIsMuted(false);
      setIsVideoDisabled(false);
    }
  }, [isMicCamToggled, isAudioLockedInRoom, isVideoLockedInRoom, call.camera, call.microphone]);

  const toggleMic = () => {
    if (isAudioLockedInRoom) {
      toast.error("Microphones are locked by the host");
      return;
    }
    if (isMuted) {
      call.microphone.enable();
      setIsMuted(false);
    } else {
      call.microphone.disable();
      setIsMuted(true);
    }
  };

  const toggleVideo = () => {
    if (isVideoLockedInRoom) {
      toast.error("Cameras are locked by the host");
      return;
    }
    if (isVideoDisabled) {
      call.camera.enable();
      setIsVideoDisabled(false);
    } else {
      call.camera.disable();
      setIsVideoDisabled(true);
    }
  };

  if (status !== "authenticated" || !session?.user) return null;

  if (callTimeNotArrived)
    return (
      <Alert
        title={`Your Meeting has not started yet. Scheduled for ${callStartsAt.toLocaleString()}`}
      />
    );

  if (callHasEnded)
    return (
      <Alert
        className="flex items-center justify-center"
        title="The call has been ended by the host"
        iconUrl="/no-calls.svg"
      />
    );

  const userName = session.user?.name ?? "You";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="h-screen w-full bg-[#0f1117] text-white flex flex-col items-center justify-center overflow-hidden">
      {/* Subtle background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#EF7B55]/8 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-indigo-600/8 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">

        {/* ─── LEFT: Video Preview ─── */}
        <div className="w-full lg:w-[58%] flex flex-col gap-4">
          {/* Preview area */}
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-zinc-900 shadow-2xl border border-white/8">
            {/* The SDK VideoPreview */}
            <VideoPreview className="absolute inset-0 w-full h-full object-cover" />

            {/* Offline avatar fallback (shown when cam is off via stream SDK) */}
            {isVideoDisabled && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 gap-3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#EF7B55] to-[#f9926b] flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {userInitial}
                </div>
                <span className="text-zinc-400 text-sm">{userName}</span>
              </div>
            )}

            {/* Status pills — top-left */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              {isMuted && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/80 text-white text-[10px] font-bold backdrop-blur-sm border border-white/10">
                  <MicOff className="w-3 h-3" /> Muted
                </span>
              )}
              {isVideoDisabled && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/80 text-white text-[10px] font-bold backdrop-blur-sm border border-white/10">
                  <VideoOff className="w-3 h-3" /> Camera Off
                </span>
              )}
            </div>

            {/* Controls bar — bottom */}
            <div className="absolute bottom-0 inset-x-0 px-4 py-3 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent">
              {/* Mic + Cam toggles */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMic}
                  type="button"
                  title={isMuted ? "Unmute" : "Mute"}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    isMuted
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-white/15 hover:bg-white/25 text-white"
                  }`}
                >
                  {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{isMuted ? "Unmute" : "Mute"}</span>
                </button>

                <button
                  onClick={toggleVideo}
                  type="button"
                  title={isVideoDisabled ? "Enable Camera" : "Disable Camera"}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    isVideoDisabled
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-white/15 hover:bg-white/25 text-white"
                  }`}
                >
                  {isVideoDisabled ? <VideoOff className="w-3.5 h-3.5" /> : <VideoIcon className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{isVideoDisabled ? "Start Video" : "Stop Video"}</span>
                </button>
              </div>

              {/* Device settings */}
              <div className="flex items-center gap-2 text-zinc-300">
                <Settings2 className="w-3.5 h-3.5 shrink-0" />
                <DeviceSettings />
              </div>
            </div>
          </div>

          {/* Caption under video */}
          <p className="text-center text-xs text-zinc-500">
            Your camera and microphone preview. No one else can see this yet.
          </p>
        </div>

        {/* ─── RIGHT: Join Panel ─── */}
        <div className="w-full lg:w-[38%] flex flex-col gap-5">
          {/* Brand badge */}
          <div className="flex flex-col gap-1">
            <span className="inline-flex items-center gap-1.5 text-[#EF7B55] text-xs font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EF7B55] animate-pulse" />
              {brand.name} Live
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              Ready to join?
            </h1>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Check your camera and mic, then enter the session when you&apos;re ready.
            </p>
          </div>

          {/* User info card */}
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/8">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#EF7B55] to-[#f9926b] flex items-center justify-center text-white font-bold text-base shrink-0">
              {userInitial}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{userName}</p>
              <p className="text-xs text-zinc-500 truncate">{session.user?.email ?? ""}</p>
            </div>
            <User className="w-4 h-4 text-zinc-600 ml-auto shrink-0" />
          </div>

          {/* Host Room Controls — only shown to hosts */}
          {isHost && canMuteUsers && (
            <div className="p-3.5 rounded-xl bg-amber-500/8 border border-amber-500/20 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <p className="text-xs font-semibold text-amber-300">Host Room Policy</p>
              </div>
              <p className="text-[11px] text-zinc-400 -mt-1">Set default mic and camera state for all participants when the session starts.</p>

              {/* Mic policy */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-zinc-300">
                  {roomMicPolicy === 'locked' ? <MicOff className="w-3.5 h-3.5 text-red-400" /> : <Mic className="w-3.5 h-3.5 text-emerald-400" />}
                  <span>Participant Microphones</span>
                </div>
                <button
                  type="button"
                  onClick={() => setRoomMicPolicy(p => p === 'open' ? 'locked' : 'open')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    roomMicPolicy === 'locked'
                      ? 'bg-red-500/20 border border-red-500/40 text-red-400'
                      : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                  }`}
                >
                  {roomMicPolicy === 'locked' ? 'Locked Off' : 'Open'}
                </button>
              </div>

              {/* Camera policy */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-zinc-300">
                  {roomCamPolicy === 'locked' ? <VideoOff className="w-3.5 h-3.5 text-red-400" /> : <VideoIcon className="w-3.5 h-3.5 text-emerald-400" />}
                  <span>Participant Cameras</span>
                </div>
                <button
                  type="button"
                  onClick={() => setRoomCamPolicy(p => p === 'open' ? 'locked' : 'open')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    roomCamPolicy === 'locked'
                      ? 'bg-red-500/20 border border-red-500/40 text-red-400'
                      : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                  }`}
                >
                  {roomCamPolicy === 'locked' ? 'Locked Off' : 'Open'}
                </button>
              </div>

              <button
                type="button"
                onClick={applyRoomPolicy}
                disabled={isApplyingPolicy}
                className={`w-full py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  roomMicPolicy === 'locked' || roomCamPolicy === 'locked'
                    ? 'bg-amber-500 hover:bg-amber-400 text-black'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-black'
                } disabled:opacity-50`}
              >
                {isApplyingPolicy
                  ? 'Applying…'
                  : roomMicPolicy === 'locked' || roomCamPolicy === 'locked'
                    ? 'Lock Participants'
                    : 'Unlock Participants'
                }
              </button>
            </div>
          )}

          {/* Toggle option */}
          <label className="flex items-start gap-3 cursor-pointer group p-3.5 rounded-xl bg-white/5 border border-white/8 hover:border-[#EF7B55]/30 transition-all">
            <div className="relative mt-0.5 shrink-0">
              <input
                type="checkbox"
                checked={isMicCamToggled}
                onChange={(e) => setIsMicCamToggled(e.target.checked)}
                className="peer w-4 h-4 appearance-none rounded border border-zinc-600 bg-zinc-800 checked:bg-[#EF7B55] checked:border-[#EF7B55] transition cursor-pointer"
              />
              {/* checkmark */}
              <svg className="absolute inset-0 w-4 h-4 pointer-events-none opacity-0 peer-checked:opacity-100 text-white" viewBox="0 0 16 16" fill="none">
                <path d="M3.5 8l3 3 5.5-5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-200 group-hover:text-white transition">Mic &amp; camera are off</p>
              <p className="text-xs text-zinc-500 mt-0.5">Uncheck to turn them on before joining</p>
            </div>
          </label>

          {/* Join button */}
          <Button
            className="w-full bg-gradient-to-r from-[#EF7B55] to-[#f9926b] hover:from-[#e0663f] hover:to-[#EF7B55] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#EF7B55]/20 hover:shadow-[#EF7B55]/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 text-base cursor-pointer"
            onClick={async () => {
              // Persist media preferences before joining
              persistCurrentState(!isMuted, !isVideoDisabled);
              try {
                const callingState = call.state?.callingState;
                if (callingState !== CallingState.JOINED && callingState !== CallingState.JOINING) {
                  await call.join();
                }
                await call.updateCallMembers({
                  update_members: [{ user_id: String(session.user?.id) }],
                }).catch(() => {});
              } catch (joinErr) {
                console.warn("[MeetingSetup] Non-fatal join notice:", joinErr);
              }
              setIsSetupComplete(true);
            }}
          >
            <span>Join Session</span>
            <ArrowRight className="w-5 h-5" />
          </Button>

          {/* Security note */}
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>End-to-end encrypted &bull; HD Quality &bull; {brand.name} Live</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingSetup;

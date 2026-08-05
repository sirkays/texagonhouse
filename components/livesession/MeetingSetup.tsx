"use client";

import { useSession } from "next-auth/react";
import {
  DeviceSettings,
  useCall,
  useCallStateHooks,
  VideoPreview,
} from "@stream-io/video-react-sdk";
import Alert from "./Alert";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
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

const MeetingSetup = ({
  setIsSetupComplete,
}: {
  setIsSetupComplete: (value: boolean) => void;
}) => {
  const { data: session, status } = useSession();
  const [isMicCamToggled, setIsMicCamToggled] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoDisabled, setIsVideoDisabled] = useState(false);

  const call = useCall();
  if (!call) {
    throw new Error("useStreamCall must be used within a StreamCall component.");
  }

  const { useCallEndedAt, useCallStartsAt } = useCallStateHooks();
  const callStartsAt = useCallStartsAt();
  const callEndedAt = useCallEndedAt();
  const callTimeNotArrived =
    callStartsAt && new Date(callStartsAt) > new Date();
  const callHasEnded = !!callEndedAt;

  useEffect(() => {
    if (isMicCamToggled) {
      call.camera.disable();
      call.microphone.disable();
      setIsMuted(true);
      setIsVideoDisabled(true);
    } else {
      call.camera.enable();
      call.microphone.enable();
      setIsMuted(false);
      setIsVideoDisabled(false);
    }
  }, [isMicCamToggled, call.camera, call.microphone]);

  const toggleMic = () => {
    if (isMuted) {
      call.microphone.enable();
      setIsMuted(false);
    } else {
      call.microphone.disable();
      setIsMuted(true);
    }
  };

  const toggleVideo = () => {
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
              Techxagon Live
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
              <p className="text-sm font-medium text-zinc-200 group-hover:text-white transition">Join with mic &amp; camera off</p>
              <p className="text-xs text-zinc-500 mt-0.5">You can turn them on after joining</p>
            </div>
          </label>

          {/* Join button */}
          <Button
            className="w-full bg-gradient-to-r from-[#EF7B55] to-[#f9926b] hover:from-[#e0663f] hover:to-[#EF7B55] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#EF7B55]/20 hover:shadow-[#EF7B55]/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 text-base cursor-pointer"
            onClick={async () => {
              await call.join();
              try {
                await call.updateCallMembers({
                  update_members: [{ user_id: String(session.user?.id) }],
                });
              } catch {
                // non-fatal
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
            <span>End-to-end encrypted &bull; HD Quality &bull; Techxagon Live</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingSetup;

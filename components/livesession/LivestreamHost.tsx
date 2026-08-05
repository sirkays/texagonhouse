"use client";

import { useCall, useCallStateHooks, VideoPreview, ParticipantView } from "@stream-io/video-react-sdk";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Mic, MicOff, Video, VideoOff, Monitor, MessageCircle, Users, Radio, X } from "lucide-react";
import { toast } from "sonner";
import LivestreamChat from "./LivestreamChat";

export default function LivestreamHost() {
  const call = useCall();
  const router = useRouter();
  const { data: session } = useSession();
  const { 
    useCallCallingState, 
    useParticipantCount, 
    useMicrophoneState, 
    useCameraState, 
    useScreenShareState, 
    useIsCallLive, 
    useLocalParticipant 
  } = useCallStateHooks();

  const isLive = useIsCallLive();
  const { isMuted: isMicMuted, isEnabled: isMicEnabled } = useMicrophoneState();
  const { isMuted: isCamMuted, isEnabled: isCamEnabled } = useCameraState();
  const isMicOff = isMicMuted || isMicEnabled === false;
  const isCamOff = isCamMuted || isCamEnabled === false;
  const participantCount = useParticipantCount();
  const localParticipant = useLocalParticipant();
  const [showChat, setShowChat] = useState(true);
  const [hasEnded, setHasEnded] = useState(false);

  // Auto-join the call when the component mounts (required before goLive)
  useEffect(() => {
    if (!call) return;
    call.join().catch((err: any) => {
      console.error("[LivestreamHost] Failed to join call:", err);
      toast.error("Failed to connect to the session");
    });

    return () => {
      call.leave().catch(console.error);
    };
  }, [call]);

  const getDashboardPath = () => {
    if (!session?.user) return "/";
    const role = session.user.role?.toLowerCase() ?? "";
    if (role.includes("teacher") || role.includes("instructor") || role === "tutor") return "/teacher";
    if (role.includes("student") || role === "learner" || role === "pupil" || role === "parent") return "/student";
    if (role.includes("admin")) return "/admin/dashboard";
    return "/dashboard";
  };

  const handleGoLive = async () => {
    try {
      await call?.goLive({ start_hls: true });
      toast.success("You are now live!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to go live");
    }
  };

  const handleStopBroadcast = async () => {
    try {
      await call?.stopLive();
      setHasEnded(true);
      toast.success("Broadcast ended");
    } catch (err) {
      console.error(err);
      toast.error("Failed to stop broadcast");
    }
  };

  const handleLeave = async () => {
    if (call) {
      await call.camera.disable();
      await call.microphone.disable();
      await call.leave();
    }
    router.push(getDashboardPath());
  };

  const toggleMic = async () => {
    if (isMicOff) {
      await call?.microphone.enable();
    } else {
      await call?.microphone.disable();
    }
  };

  const toggleCam = async () => {
    if (isCamOff) {
      await call?.camera.enable();
    } else {
      await call?.camera.disable();
    }
  };

  if (hasEnded) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="bg-zinc-900/80 border border-white/10 backdrop-blur-xl p-8 rounded-2xl max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-400">
            <Radio className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white">Broadcast Ended</h2>
          <p className="text-zinc-400">Thank you for hosting the session.</p>
          <button 
            onClick={handleLeave}
            className="w-full py-3 bg-white text-zinc-950 font-medium rounded-xl hover:bg-zinc-200 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!isLive) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-6xl grid md:grid-cols-[1fr,350px] gap-6">
          <div className="rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 aspect-video relative flex items-center justify-center">
            <VideoPreview className="w-full h-full object-cover" />
          </div>
          <div className="bg-zinc-900/80 border border-white/10 backdrop-blur-xl p-6 rounded-2xl flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Backstage</h2>
              <p className="text-sm text-zinc-400">Prepare Your Broadcast</p>
            </div>
            
            <div className="flex items-center gap-2 bg-zinc-950/50 p-3 rounded-lg border border-white/5">
              <Users className="w-4 h-4 text-zinc-400" />
              <span className="text-sm text-zinc-300 font-medium">{Math.max(0, participantCount - 1)} viewers waiting</span>
            </div>

            <div className="flex gap-4">
              <button
                onClick={toggleMic}
                className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                  isMicOff 
                    ? "bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30" 
                    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20"
                }`}
              >
                {isMicOff ? <MicOff className="w-5 h-5 mb-1" /> : <Mic className="w-5 h-5 mb-1" />}
                <span className="text-xs font-medium">{isMicOff ? "Mic Off" : "Mic On"}</span>
              </button>
              <button
                onClick={toggleCam}
                className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                  isCamOff 
                    ? "bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30" 
                    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20"
                }`}
              >
                {isCamOff ? <VideoOff className="w-5 h-5 mb-1" /> : <Video className="w-5 h-5 mb-1" />}
                <span className="text-xs font-medium">{isCamOff ? "Cam Off" : "Cam On"}</span>
              </button>
            </div>

            <div className="mt-auto">
              <button
                onClick={handleGoLive}
                className="w-full py-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-xl shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 transition-all animate-pulse"
              >
                <Radio className="w-5 h-5" />
                Go Live 🔴
              </button>
              <p className="text-xs text-center text-zinc-500 mt-4">Students will see your broadcast once you go live</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-zinc-950 flex flex-col md:flex-row overflow-hidden">
      <div className="flex-1 relative flex flex-col">
        <div className="flex-1 relative bg-black">
          {localParticipant ? (
            <ParticipantView participant={localParticipant} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-500">
              Initializing camera...
            </div>
          )}
          
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <div className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2 animate-pulse border border-red-400">
              <div className="w-2 h-2 bg-white rounded-full" />
              LIVE
            </div>
            <div className="bg-zinc-900/80 backdrop-blur text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-1.5">
              <Users className="w-3 h-3" />
              {Math.max(0, participantCount - 1)}
            </div>
          </div>

          <div className="absolute top-4 right-4 md:hidden">
            <button
              onClick={() => setShowChat(!showChat)}
              className="p-2 bg-zinc-900/80 backdrop-blur rounded-full border border-white/10 text-white"
            >
              <MessageCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="h-20 bg-zinc-950 border-t border-white/10 flex items-center justify-center px-4 gap-2 md:gap-4 flex-shrink-0">
          <button
            onClick={toggleMic}
            className={`p-3 rounded-full border transition-all ${
              isMicOff 
                ? "bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30" 
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20"
            }`}
          >
            {isMicOff ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          
          <button
            onClick={toggleCam}
            className={`p-3 rounded-full border transition-all ${
              isCamOff 
                ? "bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30" 
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20"
            }`}
          >
            {isCamOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>

          <div className="w-px h-8 bg-white/10 mx-2" />

          <button
            onClick={() => setShowChat(!showChat)}
            className={`p-3 rounded-full border transition-all hidden md:flex ${
              showChat 
                ? "bg-indigo-500/20 border-indigo-500/30 text-indigo-400" 
                : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            <MessageCircle className="w-5 h-5" />
          </button>

          <div className="w-px h-8 bg-white/10 mx-2 hidden md:block" />

          <button
            onClick={handleStopBroadcast}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-medium rounded-full shadow-lg transition-all"
          >
            End Broadcast
          </button>
        </div>
      </div>

      {showChat && (
        <div className="w-full md:w-[350px] h-[50vh] md:h-full border-t md:border-t-0 md:border-l border-white/10 flex-shrink-0 z-10">
          <LivestreamChat isHost={true} />
        </div>
      )}
    </div>
  );
}

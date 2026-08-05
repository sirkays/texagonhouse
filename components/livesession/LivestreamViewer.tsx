"use client";

import { useCall, useCallStateHooks, SpeakerLayout } from "@stream-io/video-react-sdk";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { MessageCircle, Users, Radio } from "lucide-react";
import { toast } from "sonner";
import LivestreamChat from "./LivestreamChat";

export default function LivestreamViewer() {
  const call = useCall();
  const router = useRouter();
  const { data: session } = useSession();
  
  const { useIsCallLive, useParticipantCount } = useCallStateHooks();
  const isLive = useIsCallLive();
  const participantCount = useParticipantCount();
  
  const [showChat, setShowChat] = useState(true);
  const [hasEnded, setHasEnded] = useState(false);
  const [wasLive, setWasLive] = useState(false);

  // Auto-join the call when the component mounts
  useEffect(() => {
    if (!call) return;
    call.join().catch((err: any) => {
      console.error("[LivestreamViewer] Failed to join call:", err);
    });

    return () => {
      call.leave().catch(console.error);
    };
  }, [call]);

  useEffect(() => {
    if (isLive) {
      setWasLive(true);
    } else if (wasLive && !isLive) {
      setHasEnded(true);
    }
  }, [isLive, wasLive]);

  const getDashboardPath = () => {
    if (!session?.user) return "/";
    const role = session.user.role?.toLowerCase() ?? "";
    if (role.includes("teacher") || role.includes("instructor") || role === "tutor") return "/teacher";
    if (role.includes("student") || role === "learner" || role === "pupil" || role === "parent") return "/student";
    if (role.includes("admin")) return "/admin/dashboard";
    return "/dashboard";
  };

  const handleLeave = async () => {
    if (call) {
      await call.leave();
    }
    router.push(getDashboardPath());
  };

  const handleReaction = async (emoji: string) => {
    if (!call) return;
    try {
      await call.sendReaction({ type: "reaction", emoji: { unicode: emoji } });
    } catch (err) {
      console.error(err);
    }
  };

  if (hasEnded) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="bg-zinc-900/80 border border-white/10 backdrop-blur-xl p-8 rounded-2xl max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-400">
            <Radio className="w-8 h-8 opacity-50" />
          </div>
          <h2 className="text-2xl font-bold text-white">Class has ended</h2>
          <p className="text-zinc-400">Your teacher has stopped the broadcast.</p>
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
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md w-full">
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping" />
            <div className="relative w-16 h-16 bg-zinc-900 border border-white/10 rounded-full flex items-center justify-center text-indigo-400 shadow-xl shadow-indigo-500/10">
              <Radio className="w-8 h-8" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Class is starting soon...</h2>
            <p className="text-zinc-400">Your teacher is preparing the broadcast</p>
          </div>
          <div className="inline-flex items-center gap-2 bg-zinc-900/80 border border-white/10 px-4 py-2 rounded-full backdrop-blur-xl">
            <Users className="w-4 h-4 text-zinc-500" />
            <span className="text-sm font-medium text-zinc-300">
              {Math.max(0, participantCount - 1)} others are waiting
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-zinc-950 flex flex-col md:flex-row overflow-hidden">
      <div className="flex-1 relative flex flex-col">
        <div className="flex-1 relative bg-black">
          <SpeakerLayout participantsBarPosition="bottom" />
          
          <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
            <div className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2 animate-pulse border border-red-400 shadow-lg">
              <div className="w-2 h-2 bg-white rounded-full" />
              LIVE
            </div>
            <div className="bg-zinc-900/80 backdrop-blur text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-1.5 shadow-lg">
              <Users className="w-3 h-3" />
              {participantCount}
            </div>
          </div>

          <div className="absolute top-4 right-4 md:hidden z-10">
            <button
              onClick={() => setShowChat(!showChat)}
              className="p-2 bg-zinc-900/90 backdrop-blur rounded-full border border-white/10 text-white shadow-lg"
            >
              <MessageCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="h-16 md:h-20 bg-zinc-950 border-t border-white/10 flex items-center justify-between px-4 md:px-8 flex-shrink-0">
          <div className="flex items-center gap-2 md:gap-3 bg-zinc-900/50 p-2 rounded-full border border-white/5">
            {["👍", "👏", "❤️", "🎉", "✋", "🔥"].map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-lg md:text-xl hover:bg-zinc-800 rounded-full transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
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
            
            <div className="w-px h-8 bg-white/10 hidden md:block" />
            
            <button
              onClick={handleLeave}
              className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-medium rounded-full border border-red-500/20 transition-all"
            >
              Leave
            </button>
          </div>
        </div>
      </div>

      {showChat && (
        <div className="w-full md:w-[350px] h-[40vh] md:h-full border-t md:border-t-0 md:border-l border-white/10 flex-shrink-0 z-20">
          <LivestreamChat isHost={false} />
        </div>
      )}
    </div>
  );
}

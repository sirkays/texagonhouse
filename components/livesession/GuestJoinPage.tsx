"use client";

import { useState, useEffect, useRef } from "react";
import { StreamVideo, StreamVideoClient, StreamCall, StreamTheme } from "@stream-io/video-react-sdk";
import { guestTokenProvider } from "@/actions/stream.actions";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Spinner } from "../ui/spinner";
import MeetingSetup from "./MeetingSetup";
import MeetingRoom from "./MeetingRoom";
import LivestreamViewer from "./LivestreamViewer";
import { User, Mail, ArrowRight, Globe, ShieldCheck } from "lucide-react";

const API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY!;

interface GuestJoinPageProps {
  meetingId: string;
  meetingTitle?: string;
  callType?: string;
}

const GuestJoinPage = ({ meetingId, meetingTitle, callType = "default" }: GuestJoinPageProps) => {
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<any>(null);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [error, setError] = useState("");

  // Helper to connect a guest with specified credentials
  const connectGuestSession = async (idToUse: string, nameToUse: string, emailToUse: string, autoJoin: boolean = false) => {
    setIsJoining(true);
    setError("");

    try {
      // Create a tokenProvider callback for automatic token refresh
      // instead of a static token that expires after 1 hour
      const guestTokenProviderCallback = async () => {
        const res = await fetch('/api/meeting/guest-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ guestId: idToUse, meetingId }),
        });
        if (!res.ok) {
          // Fallback to server action if API route fails
          return guestTokenProvider(idToUse);
        }
        const data = await res.json();
        return data.token;
      };

      // Get initial token
      const initialToken = await guestTokenProviderCallback();

      const client = new StreamVideoClient({
        apiKey: API_KEY,
        user: {
          id: idToUse,
          name: nameToUse.trim(),
          image: undefined,
          custom: {
            email: emailToUse || undefined,
            isGuest: true,
          },
        },
        token: initialToken,
        tokenProvider: guestTokenProviderCallback,
      });

      setVideoClient(client);

      const streamCall = client.call("default", meetingId);
      await streamCall.getOrCreate();
      
      if (autoJoin) {
        try {
          await streamCall.join();
        } catch (err) {
          console.error("Auto-join failed:", err);
        }
      }
      
      setCall(streamCall);

      // Save to sessionStorage so reload remembers the guest
      try {
        sessionStorage.setItem(
          `techxagon_guest_${meetingId}`,
          JSON.stringify({ guestId: idToUse, guestName: nameToUse, guestEmail: emailToUse })
        );
      } catch {
        // non-fatal
      }
    } catch (err: any) {
      console.error("[GuestJoinPage] Error connecting guest:", err);
      setError("Failed to connect to the meeting. Please try again.");
      sessionStorage.removeItem(`techxagon_guest_${meetingId}`);
    } finally {
      setIsJoining(false);
    }
  };

  // Restore guest session on page reload if previously joined
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(`techxagon_guest_${meetingId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.guestId && parsed.guestName) {
          setGuestName(parsed.guestName);
          setGuestEmail(parsed.guestEmail || "");
          setIsSetupComplete(true);
          connectGuestSession(parsed.guestId, parsed.guestName, parsed.guestEmail || "", true);
        }
      }
    } catch {
      // non-fatal
    }
  }, [meetingId]);

  const handleJoinAsGuest = async () => {
    if (!guestName.trim()) {
      setError("Please enter your name");
      return;
    }
    const guestId = `guest-${crypto.randomUUID().slice(0, 8)}`;
    await connectGuestSession(guestId, guestName.trim(), guestEmail.trim());
  };

  // Once the client and call are ready, render the meeting UI
  if (videoClient && call) {
    return (
      <StreamVideo client={videoClient}>
        <StreamCall call={call}>
          <StreamTheme>
            {!isSetupComplete ? (
              <GuestMeetingSetup
                guestName={guestName}
                call={call}
                setIsSetupComplete={setIsSetupComplete}
              />
            ) : (
              <MeetingRoom />
            )}
          </StreamTheme>
        </StreamCall>
      </StreamVideo>
    );
  }

  // Guest join form
  return (
    <div className="min-h-screen w-full bg-[#0f1117] text-white flex flex-col items-center justify-center overflow-hidden relative">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#EF7B55]/8 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-indigo-600/8 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto px-4 sm:px-6">
        {/* Public badge */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Globe className="w-3.5 h-3.5" />
            <span>Public Meeting</span>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-1.5 text-[#EF7B55] text-xs font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EF7B55] animate-pulse" />
              Techxagon Live
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              Join as Guest
            </h1>
            {meetingTitle && (
              <p className="text-sm text-zinc-400">{meetingTitle}</p>
            )}
            <p className="text-sm text-zinc-500">
              Enter your details to join this meeting
            </p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                Your Name <span className="text-red-400">*</span>
              </label>
              <Input
                type="text"
                placeholder="Enter your full name"
                value={guestName}
                onChange={(e) => { setGuestName(e.target.value); setError(""); }}
                className="w-full rounded-xl border border-white/15 bg-white/5 p-3.5 text-sm text-white placeholder:text-zinc-600 focus:bg-white/8 focus:border-[#EF7B55]/50 focus:ring-2 focus:ring-[#EF7B55]/20 transition-all outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                Email <span className="text-zinc-600">(optional)</span>
              </label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-white/5 p-3.5 text-sm text-white placeholder:text-zinc-600 focus:bg-white/8 focus:border-[#EF7B55]/50 focus:ring-2 focus:ring-[#EF7B55]/20 transition-all outline-none"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-400 text-center bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          {/* Join button */}
          <Button
            className="w-full bg-gradient-to-r from-[#EF7B55] to-[#f9926b] hover:from-[#e0663f] hover:to-[#EF7B55] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#EF7B55]/20 hover:shadow-[#EF7B55]/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 text-base cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={handleJoinAsGuest}
            disabled={isJoining || !guestName.trim()}
          >
            {isJoining ? (
              <>
                <Spinner size="sm" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <span>Join Meeting</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </Button>

          {/* Footer */}
          <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>End-to-end encrypted • HD Quality • Techxagon Live</span>
          </div>
        </div>

        {/* Sign in link */}
        <p className="text-center text-xs text-zinc-500 mt-4">
          Have an account?{" "}
          <a href="/login" className="text-[#EF7B55] hover:underline font-medium">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
};

/**
 * Simplified MeetingSetup for guests (no auth session, just name & preview)
 */
const GuestMeetingSetup = ({
  guestName,
  call,
  setIsSetupComplete,
}: {
  guestName: string;
  call: any;
  setIsSetupComplete: (value: boolean) => void;
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoDisabled, setIsVideoDisabled] = useState(false);

  const userInitial = guestName.charAt(0).toUpperCase();

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

  return (
    <div className="h-screen w-full bg-[#0f1117] text-white flex flex-col items-center justify-center overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#EF7B55]/8 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-indigo-600/8 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg mx-auto px-4 sm:px-6 flex flex-col items-center gap-6">
        {/* Video preview placeholder */}
        <div className="w-full aspect-video rounded-2xl overflow-hidden bg-zinc-900 shadow-2xl border border-white/8 flex flex-col items-center justify-center relative">
          {isVideoDisabled ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#EF7B55] to-[#f9926b] flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {userInitial}
              </div>
              <span className="text-zinc-400 text-sm">{guestName}</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-zinc-500">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#EF7B55] to-[#f9926b] flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {userInitial}
              </div>
              <span className="text-sm">Camera preview will appear in the meeting</span>
            </div>
          )}

          {/* Control bar overlay */}
          <div className="absolute bottom-0 inset-x-0 px-4 py-3 flex items-center justify-center gap-2 bg-gradient-to-t from-black/80 to-transparent">
            <button
              onClick={toggleMic}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                isMuted
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-white/15 hover:bg-white/25 text-white"
              }`}
            >
              {isMuted ? "🔇 Unmute" : "🎤 Mute"}
            </button>
            <button
              onClick={toggleVideo}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                isVideoDisabled
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-white/15 hover:bg-white/25 text-white"
              }`}
            >
              {isVideoDisabled ? "📷 Start Video" : "📹 Stop Video"}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="text-center space-y-2">
          <h1 className="text-xl font-extrabold text-white">Ready to join, {guestName}?</h1>
          <p className="text-sm text-zinc-400">Check your settings, then enter the session.</p>
        </div>

        {/* Guest badge */}
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/8 w-full">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#EF7B55] to-[#f9926b] flex items-center justify-center text-white font-bold text-base shrink-0">
            {userInitial}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{guestName}</p>
            <p className="text-xs text-zinc-500">Guest participant</p>
          </div>
          <div className="ml-auto px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase">
            Guest
          </div>
        </div>

        {/* Join button */}
        <Button
          className="w-full bg-gradient-to-r from-[#EF7B55] to-[#f9926b] hover:from-[#e0663f] hover:to-[#EF7B55] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#EF7B55]/20 hover:shadow-[#EF7B55]/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 text-base cursor-pointer"
          onClick={async () => {
            try {
              await call.join();
            } catch (joinErr) {
              console.warn("[GuestMeetingSetup] Non-fatal join notice:", joinErr);
            }
            setIsSetupComplete(true);
          }}
        >
          <span>Join Session</span>
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default GuestJoinPage;

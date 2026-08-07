"use client";

import Alert from "@/components/livesession/Alert";
import MeetingRoom from "@/components/livesession/MeetingRoom";
import MeetingSetup from "@/components/livesession/MeetingSetup";
import LivestreamHost from "@/components/livesession/LivestreamHost";
import LivestreamViewer from "@/components/livesession/LivestreamViewer";
import GuestJoinPage from "@/components/livesession/GuestJoinPage";
import { useSession } from "next-auth/react";
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  StreamTheme,
} from "@stream-io/video-react-sdk";
import { useParams } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { tokenProvider } from "@/actions/stream.actions";

// Memoize at module level — tokenProvider is a stable server action reference
const stableTokenProvider = tokenProvider;

const API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY!;

interface MeetingInfo {
  is_public: boolean;
  title?: string;
  call_type?: string;
}

/**
 * Public meeting page — accessible without authentication.
 * Located at /meeting/[id] (outside /main to bypass auth layout).
 */
const PublicMeetingPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: session, status } = useSession();
  const [meetingInfo, setMeetingInfo] = useState<MeetingInfo | null>(null);
  const [isCheckingPublic, setIsCheckingPublic] = useState(true);
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  // For authenticated users: create a local StreamVideoClient
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<any>(null);
  const [isCallLoading, setIsCallLoading] = useState(true);
  const clientRef = useRef<StreamVideoClient | null>(null);
  const hasJoinedRef = useRef(false);
  const clientCreatedForUserRef = useRef<string | null>(null);

  // Step 1: Check if meeting is public
  useEffect(() => {
    if (!id) return;
    const checkMeetingAccess = async () => {
      try {
        const res = await fetch(`/api/meeting/${id}/info`);
        if (res.ok) {
          const data = await res.json();
          setMeetingInfo(data);
        } else {
          setMeetingInfo({ is_public: false });
        }
      } catch {
        setMeetingInfo({ is_public: false });
      } finally {
        setIsCheckingPublic(false);
      }
    };
    checkMeetingAccess();
  }, [id]);

  // Step 2: For authenticated users, create StreamVideoClient and fetch the call
  // STABILIZED: Only create client ONCE per user session. Removed meetingInfo?.call_type
  // from deps to prevent client recreation when meeting info arrives.
  useEffect(() => {
    if (status !== "authenticated" || !session?.user || !id || isCheckingPublic) return;

    const userId = String(session.user.id);

    // Guard: don't recreate client for the same user
    if (clientRef.current && clientCreatedForUserRef.current === userId) {
      return;
    }

    const client = new StreamVideoClient({
      apiKey: API_KEY,
      user: {
        id: userId,
        name: session.user.name || session.user.email?.split("@")[0] || "User",
        image: session.user.image || undefined,
      },
      tokenProvider: stableTokenProvider,
    });

    clientRef.current = client;
    clientCreatedForUserRef.current = userId;
    setVideoClient(client);

    const fetchCall = async () => {
      setIsCallLoading(true);
      // Always try "default" first — public meetings are forced to "default".
      // Fall back to "livestream" for legacy private broadcast sessions.
      for (const callType of ["default", "livestream"] as const) {
        try {
          const c = client.call(callType, id);
          await c.getOrCreate();
          // Only accept if the call has real custom data (not an empty auto-created shell)
          const custom = c.state.custom || {};
          if (Object.keys(custom).length > 0 || callType === "default") {
            // Guard: prevent duplicate call.join()
            if (!hasJoinedRef.current) {
              try {
                const savedSetup = sessionStorage.getItem(`techxagon_setup_${id}`);
                if (savedSetup === "true") {
                  hasJoinedRef.current = true;
                  await c.join();
                }
              } catch (err) {
                hasJoinedRef.current = false;
                console.error("Auto-join error:", err);
              }
            }
            setCall(c);
            setIsCallLoading(false);
            return;
          }
        } catch {
          continue;
        }
      }
      setIsCallLoading(false);
    };

    fetchCall();

    return () => {
      client.disconnectUser();
      setVideoClient(null);
      clientRef.current = null;
      clientCreatedForUserRef.current = null;
      hasJoinedRef.current = false;
    };
  }, [status, session?.user?.id, id, isCheckingPublic]);

  // Restore setup complete state for authenticated user on reload
  useEffect(() => {
    if (!id) return;
    try {
      const saved = sessionStorage.getItem(`techxagon_setup_${id}`);
      if (saved === "true") {
        setIsSetupComplete(true);
      }
    } catch {
      // non-fatal
    }
  }, [id]);

  const handleSetIsSetupComplete = (complete: boolean) => {
    setIsSetupComplete(complete);
    if (id && complete) {
      try {
        sessionStorage.setItem(`techxagon_setup_${id}`, "true");
      } catch {
        // non-fatal
      }
    }
  };

  if (!id) return null;

  // 1. Still checking meeting public status or auth session loading
  if (isCheckingPublic || status === "loading") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0f1117] gap-5">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#EF7B55] to-[#f9926b] flex items-center justify-center shadow-lg shadow-[#EF7B55]/20 animate-pulse">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#0f1117] animate-ping" />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#0f1117]" />
        </div>
        <div className="text-center">
          <p className="text-white text-lg font-semibold">Verifying meeting access<span className="animate-pulse">...</span></p>
          <p className="text-zinc-500 text-sm mt-1">Please wait while we check your permissions</p>
        </div>
      </div>
    );
  }

  // ── UNAUTHENTICATED USER ──
  if (status === "unauthenticated") {
    // Public meeting → Guest join page
    if (meetingInfo?.is_public) {
      return (
        <GuestJoinPage
          meetingId={id}
          meetingTitle={meetingInfo.title}
          callType={meetingInfo.call_type}
        />
      );
    }

    // Private meeting + not authenticated → redirect to login
    if (typeof window !== "undefined") {
      window.location.href = `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
    }
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0f1117] gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#EF7B55] to-[#f9926b] flex items-center justify-center shadow-lg shadow-[#EF7B55]/20 animate-pulse">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-white text-lg font-semibold">Redirecting to sign in<span className="animate-pulse">...</span></p>
          <p className="text-zinc-500 text-sm mt-1">You need to log in to join this meeting</p>
        </div>
      </div>
    );
  }

  // ── AUTHENTICATED USER ──
  if (!videoClient || isCallLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0f1117] gap-5">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#EF7B55] to-[#f9926b] flex items-center justify-center shadow-lg shadow-[#EF7B55]/20">
            <svg className="w-8 h-8 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#0f1117] animate-ping" />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#0f1117]" />
        </div>
        <div className="text-center">
          <p className="text-white text-lg font-semibold">Connecting to meeting<span className="animate-pulse">...</span></p>
          <p className="text-zinc-500 text-sm mt-1">Setting up your video session</p>
        </div>
      </div>
    );
  }

  if (!call) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f1117]">
        <p className="text-center text-2xl font-bold text-white">
          Call Not Found
        </p>
      </div>
    );
  }

  const user = session?.user as {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  };

  const notAllowed =
    call.type === "invited" &&
    (!user || !call.state.members.find((m: any) => m.user.id === user.id));

  if (notAllowed)
    return <Alert title="You are not allowed to join this meeting" />;

  const isLivestream = call.type === "livestream";
  const isHost = isLivestream && call.state.createdBy?.id === String(user.id);

  return (
    <StreamVideo client={videoClient}>
      <main className="h-screen w-full">
        <StreamCall call={call}>
          <StreamTheme>
            {!isSetupComplete ? (
              <MeetingSetup setIsSetupComplete={handleSetIsSetupComplete} />
            ) : (
              <MeetingRoom />
            )}
          </StreamTheme>
        </StreamCall>
      </main>
    </StreamVideo>
  );
};

export default PublicMeetingPage;

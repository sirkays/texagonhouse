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
  CallingState,
} from "@stream-io/video-react-sdk";
import { useParams } from "next/navigation";
import { useState, useEffect, useRef, useMemo } from "react";
import { tokenProvider } from "@/actions/stream.actions";

// Memoize at module level — tokenProvider is a stable server action reference
const stableTokenProvider = tokenProvider;

const API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY!;
// Global module-level lock for in-flight call joins
const activeJoiningCallIds = new Set<string>();

interface MeetingInfo {
  is_public: boolean;
  is_room_open?: boolean;
  title?: string;
  call_type?: string;
  host_id?: string;
  ended_at?: string | null;
  status?: string;
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
  const [isCallEnded, setIsCallEnded] = useState(false);
  const clientRef = useRef<StreamVideoClient | null>(null);
  const callRef = useRef<any>(null);
  const hasJoinedRef = useRef(false);
  const clientCreatedForUserRef = useRef<string | null>(null);

  // Host check helper
  const isHostUser = useMemo(() => {
    if (!session?.user) return false;
    const userId = String(session.user.id);
    const userRole = (session.user as any)?.role?.toLowerCase() || "";
    if (meetingInfo?.host_id && String(meetingInfo.host_id) === userId) return true;
    if (userRole.includes("teacher") || userRole.includes("instructor") || userRole === "tutor" || userRole.includes("admin")) {
      return true;
    }
    return false;
  }, [session?.user, meetingInfo?.host_id]);

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
          setMeetingInfo({ is_public: false, is_room_open: true });
        }
      } catch {
        setMeetingInfo({ is_public: false, is_room_open: true });
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

    // Room Closed Enforcement: If room is closed and user is NOT host, do not create client or join call
    if (meetingInfo?.is_room_open === false && !isHostUser) {
      setIsCallLoading(false);
      return;
    }

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
      
      // Determine call type from server-validated meeting info
      const resolvedCallType = (meetingInfo?.call_type === 'livestream' ? 'livestream' : 'default') as 'default' | 'livestream';

      let lastErr: unknown;
      for (let attempt = 0; attempt < 3; attempt++) {
        if (attempt > 0) {
          await new Promise((r) => setTimeout(r, 500 * Math.pow(2, attempt - 1)));
        }
        try {
          const c = client.call(resolvedCallType, id);
          // get() — NEVER getOrCreate(). Only the creation flow may create.
          await c.get();

          if (c.state.endedAt) {
            setIsCallEnded(true);
            setIsCallLoading(false);
            return;
          }

          callRef.current = c;

          // Guard: prevent duplicate call.join()
          if (!hasJoinedRef.current && !activeJoiningCallIds.has(id)) {
            try {
              const savedSetup = sessionStorage.getItem(`techxagon_setup_${id}`);
              if (savedSetup === 'true') {
                const callingState = c.state?.callingState;
                if (callingState !== CallingState.JOINED && callingState !== CallingState.JOINING) {
                  hasJoinedRef.current = true;
                  activeJoiningCallIds.add(id);
                  await c.join();
                }
              }
            } catch (joinErr) {
              hasJoinedRef.current = false;
              console.error('Auto-join error:', joinErr);
            } finally {
              activeJoiningCallIds.delete(id);
            }
          }
          setCall(c);
          setIsCallLoading(false);
          return;
        } catch (err: unknown) {
          lastErr = err;
          // Do not retry on permission/not-found errors
          const errMsg = String(err);
          if (errMsg.includes('403') || errMsg.includes('404') || errMsg.includes('not found')) {
            break;
          }
          // Transient error — retry
        }
      }

      console.error('[Meeting] Failed to fetch call after retries:', lastErr);
      setIsCallLoading(false);
    };

    fetchCall();

    return () => {
      if (callRef.current) {
        callRef.current.leave().catch(() => {});
      }
      client.disconnectUser();
      setVideoClient(null);
      clientRef.current = null;
      callRef.current = null;
      clientCreatedForUserRef.current = null;
      hasJoinedRef.current = false;
      activeJoiningCallIds.delete(id);
    };
  }, [status, session?.user?.id, id, isCheckingPublic, meetingInfo?.is_room_open, isHostUser]);

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
  // ── MEETING ENDED CHECK ──
  // If the meeting info says ended OR the call state showed ended
  if (isCallEnded || meetingInfo?.ended_at) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0f1117] gap-5 text-white p-6">
        <div className="bg-[#1a1d26] border border-white/10 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-zinc-700/50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">The call has been ended by the host</h2>
          <a
            href="/"
            className="mt-4 inline-block w-full px-6 py-3 bg-[#2a2d36] hover:bg-[#3a3d46] text-white font-semibold text-sm rounded-xl transition-all border border-white/10"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  // ── ROOM CLOSED FOR NON-HOST USER ──
  if (meetingInfo?.is_room_open === false && !isHostUser) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0f1117] gap-5 text-white p-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <div className="text-center max-w-sm">
          <h2 className="text-xl font-bold text-white">Room Access Closed</h2>
          <p className="text-zinc-400 text-sm mt-2 leading-relaxed">
            Room access has been closed by the host. New participants cannot join at this time.
          </p>
        </div>
        <a
          href="/dashboard"
          className="mt-2 px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white font-semibold text-sm rounded-xl transition-all"
        >
          Return to Dashboard
        </a>
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
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0f1117] gap-5 text-white p-6">
        <div className="bg-[#1a1d26] border border-white/10 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-2">Meeting Not Found</h2>
          <p className="text-zinc-400 text-sm mt-1">This meeting does not exist or the link is invalid. Check with your host.</p>
          <a href="/" className="mt-5 inline-block w-full px-6 py-3 bg-[#2a2d36] hover:bg-[#3a3d46] text-white font-semibold text-sm rounded-xl transition-all border border-white/10">Back to Home</a>
        </div>
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

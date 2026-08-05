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
import { useState, useEffect, useRef } from "react";
import { Spinner } from "@/components/ui/spinner";
import { tokenProvider } from "@/actions/stream.actions";

const API_KEY = "cx85x7gj2dxr";

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
  useEffect(() => {
    if (status !== "authenticated" || !session?.user || !id || isCheckingPublic) return;

    const userId = String(session.user.id);
    const client = new StreamVideoClient({
      apiKey: API_KEY,
      user: {
        id: userId,
        name: session.user.name || session.user.email?.split("@")[0] || "User",
        image: session.user.image || undefined,
      },
      tokenProvider,
    });

    clientRef.current = client;
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
            try {
              const savedSetup = sessionStorage.getItem(`techxagon_setup_${id}`);
              if (savedSetup === "true") {
                await c.join();
              }
            } catch (err) {
              console.error("Auto-join error:", err);
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
    };
  }, [status, session, id, isCheckingPublic, meetingInfo?.call_type]);

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
      <div className="flex min-h-screen items-center justify-center bg-[#0f1117]">
        <Spinner size="lg" className="text-[#EF7B55]" />
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
      <div className="flex min-h-screen items-center justify-center bg-[#0f1117]">
        <Spinner size="lg" className="text-[#EF7B55]" />
      </div>
    );
  }

  // ── AUTHENTICATED USER ──
  if (!videoClient || isCallLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f1117]">
        <Spinner size="lg" className="text-[#EF7B55]" />
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

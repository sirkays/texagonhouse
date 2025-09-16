"use client";

import Alert from "@/components/livesession/Alert";
import Loading from "@/components/livesession/Loading";
import MeetingRoom from "@/components/livesession/MeetingRoom";
import MeetingSetup from "@/components/livesession/MeetingSetup";
import { useGetCallById } from "@/hooks/useGetCallById";
import { useSession } from "next-auth/react";
import { StreamCall, StreamTheme } from "@stream-io/video-react-sdk";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";

const MeetingPage = () => {
  const { id } = useParams<{ id: string }>();
  if (!id) return null;
  const { data: session, status } = useSession();
  const { call, isCallLoading } = useGetCallById(id);
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  if (status !== "authenticated" || isCallLoading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Spinner size="lg" className="text-indigo-500" />
      </div>
    );

  if (!call)
    return (
      <p className="text-center text-3xl font-bold text-white">
        Call Not Found
      </p>
    );

  const user = session?.user as {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };

  const notAllowed =
    call.type === "invited" &&
    (!user || !call.state.members.find((m) => m.user.id === user.id));

  if (notAllowed)
    return <Alert title="You are not allowed to join this meeting" />;

  return (
    <main className="h-screen w-full">
      <StreamCall call={call}>
        <StreamTheme>
          {!isSetupComplete ? (
            <MeetingSetup setIsSetupComplete={setIsSetupComplete} />
          ) : (
            <MeetingRoom />
          )}
        </StreamTheme>
      </StreamCall>
    </main>
  );
};

export default MeetingPage;

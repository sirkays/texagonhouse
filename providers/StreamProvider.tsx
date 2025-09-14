"use client";

import {useSession} from "next-auth/react";
import {StreamVideo, StreamVideoClient} from "@stream-io/video-react-sdk";
import {ReactNode, useEffect, useState, useMemo} from "react";
import {tokenProvider} from "@/actions/stream.actions";
import Loading from "@/components/livesession/Loading";
import { Spinner } from "@/components/ui/spinner";

const API_KEY = "cx85x7gj2dxr";

const StreamProvider = ({children}: {children: ReactNode}) => {
  const [videoClient, setVideoClient] = useState<StreamVideoClient>();
  const {data: session, status} = useSession();
  const sessionToken = useMemo(
    () => session?.user?.sessionToken || null,
    [session?.user?.sessionToken]
  );

  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return;
    if (!API_KEY) throw new Error("Stream API key is missing");

    console.log(session.user, "user");
    console.log(session.user, "user");

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

    setVideoClient(client);
    return () => {
      client.disconnectUser();
      setVideoClient(undefined);
    };
  }, [sessionToken, status]);

  if (!videoClient) return  <div className="flex min-h-screen items-center justify-center bg-background">
          <Spinner size="md" className="text-black" />
        </div>

  return <StreamVideo client={videoClient}>{children}</StreamVideo>;
};

export default StreamProvider;

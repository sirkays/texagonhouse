"use client";

import {useSession} from "next-auth/react";
import {StreamVideo, StreamVideoClient} from "@stream-io/video-react-sdk";
import {ReactNode, useEffect, useState} from "react";
import {tokenProvider} from "@/actions/stream.actions";
import Loading from "@/components/livesession/Loading";

const API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY;

const StreamProvider = ({children}: {children: ReactNode}) => {
  const [videoClient, setVideoClient] = useState<StreamVideoClient>();
  const {data: session, status} = useSession();

  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return;
    if (!API_KEY) throw new Error("Stream API key is missing");

    const client = new StreamVideoClient({
      apiKey: API_KEY,
      user: {
        id: session.user.id,
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
  }, [session, status]);

  if (!videoClient) return <Loading />;

  return <StreamVideo client={videoClient}>{children}</StreamVideo>;
};

export default StreamProvider;

"use client";

import {Call, useStreamVideoClient} from "@stream-io/video-react-sdk";
import {useEffect, useState} from "react";

export const useGetCallById = (id: string | string[]) => {
  const [call, setCall] = useState<Call>();
  const [isCallLoading, setIsCallLoading] = useState(true);
  const client = useStreamVideoClient();

  useEffect(() => {
    if (!client) return;

    const callId = Array.isArray(id) ? id[0] : id;
    if (!callId) {
      setIsCallLoading(false);
      return;
    }

    try {
      const activeCall = client.call("default", callId);
      setCall(activeCall);
    } catch (error: any) {
      console.error("[useGetCallById] Error initializing call:", error);
    } finally {
      setIsCallLoading(false);
    }
  }, [client, id]);

  return {call, isCallLoading};
};

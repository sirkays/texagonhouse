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

    const loadCall = async () => {
      try {
        // Try "default" (SFU) first
        const defaultCall = client.call("default", callId);
        await defaultCall.getOrCreate();
        setCall(defaultCall);
      } catch {
        try {
          // Fallback to "livestream" type
          const livestreamCall = client.call("livestream", callId);
          await livestreamCall.getOrCreate();
          setCall(livestreamCall);
        } catch (error: any) {
          console.error("[useGetCallById] Error initializing call:", error);
        }
      } finally {
        setIsCallLoading(false);
      }
    };

    loadCall();
  }, [client, id]);

  return {call, isCallLoading};
};

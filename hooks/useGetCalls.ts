"use client";

import {useSession} from "next-auth/react";
import {Call, useStreamVideoClient} from "@stream-io/video-react-sdk";
import {useEffect, useState} from "react";

export const useGetCalls = () => {
  const {data: session, status} = useSession();
  const client = useStreamVideoClient();
  const [calls, setCalls] = useState<Call[]>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadCalls = async () => {
      if (status !== "authenticated" || !session?.user?.id || !client) return;

      setIsLoading(true);

      try {
        const {calls} = await client.queryCalls({
          sort: [{field: "starts_at", direction: -1}], // Sort by start time (latest first)
          filter_conditions: {
            starts_at: {$exists: true}, // Calls must have a start time
            $or: [
              {created_by_user_id: String(session.user.id)}, // User is the creator
              {members: {$in: [String(session.user.id)]}}, // OR user is a member of the call
            ],
          },
        });

        setCalls(calls);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCalls();
  }, [client, session?.user?.id, status]);

  const now = new Date();

  // endedCalls: Calls that have either started before the current time or have an endedAt timestamp
  const endedCalls = calls?.filter(({state: {startsAt, endedAt}}: Call) => {
    return (startsAt && new Date(startsAt) < now) || !!endedAt;
  });

  // upcomingCalls: Calls that start in the future
  const upcomingCalls = calls?.filter(({state: {startsAt}}: Call) => {
    return startsAt && new Date(startsAt) > now;
  });

  // Return all types of calls
  return {endedCalls, upcomingCalls, callRecordings: calls, isLoading};
};

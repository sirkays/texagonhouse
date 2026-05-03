// lib/cbt/useSubmissionQueue.ts
import { useEffect, useState, useCallback, useRef } from "react";
import { listSubmissions, type QueuedSubmission } from "./db";
import { runSync, gcConfirmed } from "./sync";

export function useSubmissionQueue(
  sessionToken: string | null,
  deviceId: string
) {
  const [queue, setQueue] = useState<QueuedSubmission[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const channelRef = useRef<BroadcastChannel | null>(null);

  const refresh = useCallback(async () => {
    const all = await listSubmissions();
    setQueue(all);
  }, []);

  const triggerSync = useCallback(async () => {
    if (!sessionToken) return;
    setIsSyncing(true);
    try {
      await runSync({
        sessionToken,
        deviceId,
        onConfirmed: () => {
          channelRef.current?.postMessage({ type: "queue-changed" });
        },
        onPermanentFailure: () => {
          channelRef.current?.postMessage({ type: "queue-changed" });
        },
      });
      await gcConfirmed();
    } finally {
      setIsSyncing(false);
      await refresh();
    }
  }, [sessionToken, deviceId, refresh]);

  useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) return;
    const ch = new BroadcastChannel("cbt-queue");
    channelRef.current = ch;
    ch.onmessage = (e) => {
      if (e.data?.type === "queue-changed") refresh();
    };
    return () => {
      ch.close();
      channelRef.current = null;
    };
  }, [refresh]);

  useEffect(() => {
    refresh();
    const onOnline = () => triggerSync();
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [refresh, triggerSync]);

  useEffect(() => {
    if (!sessionToken) return;
    const interval = setInterval(() => {
      if (navigator.onLine) triggerSync();
    }, 15_000);
    return () => clearInterval(interval);
  }, [sessionToken, triggerSync]);

  return { queue, isSyncing, triggerSync, refresh };
}
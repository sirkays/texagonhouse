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

    setQueue((prev) => {
      const isSame =
        prev.length === all.length &&
        prev.every((p, i) => {
          const next = all[i];

          return (
            p.clientSubmissionId === next.clientSubmissionId &&
            p.state === next.state &&
            p.attempts === next.attempts &&
            p.updatedAt === next.updatedAt
          );
        });

      return isSame ? prev : all;
    });
  }, []);

  const triggerSync = useCallback(async () => {
    if (!sessionToken) return;

    // Do not set isSyncing, and do not attempt sync, when offline.
    // This avoids a rapid true -> false flicker every 15 seconds offline.
    if (typeof navigator !== "undefined" && !navigator.onLine) return;

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
      // triggerSync already guards against offline internally, but keeping
      // this check here avoids scheduling an async no-op when offline.
      if (navigator.onLine) triggerSync();
    }, 15_000);

    return () => clearInterval(interval);
  }, [sessionToken, triggerSync]);

  return { queue, isSyncing, triggerSync, refresh };
}

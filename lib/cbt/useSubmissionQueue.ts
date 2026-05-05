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
    // This avoids a rapid true -> false flicker every poll cycle offline.
    if (typeof navigator !== "undefined" && !navigator.onLine) return;

    // Check if there's actually work to do before flipping isSyncing.
    // This prevents the "Syncing" badge and banner from flashing
    // every poll cycle when the queue is empty.
    const queued = await listSubmissions("queued");
    if (queued.length === 0) {
      // Still run GC for confirmed items, but silently.
      await gcConfirmed().catch(() => {});
      return;
    }

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
      // Reset syncing state before refreshing to prevent a brief flash
      // where isSyncing is false but the queue state hasn't updated yet.
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

    // Poll every 60 seconds instead of 15. The queue only has items when
    // a test was submitted offline, so aggressive polling is unnecessary
    // and was causing visible UI flickering (the "Syncing" badge/banner).
    const interval = setInterval(() => {
      if (navigator.onLine) triggerSync();
    }, 60_000);

    return () => clearInterval(interval);
  }, [sessionToken, triggerSync]);

  return { queue, isSyncing, triggerSync, refresh };
}


import { useEffect, useState, useCallback, useRef } from "react";
import { listCompletedTests, type CompletedTestRecord } from "./db";

export function useCompletedTests() {
  const [completed, setCompleted] = useState<Record<string, CompletedTestRecord>>({});
  const channelRef = useRef<BroadcastChannel | null>(null);

  const refresh = useCallback(async () => {
    const all = await listCompletedTests();
    const map: Record<string, CompletedTestRecord> = {};
    for (const r of all) map[r.testId] = r;
    setCompleted(map);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Listen for cross-tab queue changes — those imply registry changes too
  useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) return;
    const ch = new BroadcastChannel("cbt-queue");
    channelRef.current = ch;
    ch.onmessage = (e) => {
      if (e.data?.type === "queue-changed" || e.data?.type === "completed-changed") {
        refresh();
      }
    };
    return () => {
      ch.close();
      channelRef.current = null;
    };
  }, [refresh]);

  return { completed, refreshCompleted: refresh };
}
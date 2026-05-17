// lib/cbt/migrate.ts
import { enqueueSubmission, saveInProgress } from "./db";

const MIGRATION_FLAG = "cbt:migrated-to-idb-v1";

/**
 * One-time migration from legacy localStorage CBT state to IndexedDB.
 * Safe to run on every boot; only does work the first time per browser.
 */
export async function migrateLegacyCBTState(userId: string) {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(MIGRATION_FLAG) === "1") return;

  const scope = `cbt:${userId}`;

  // Old pending submissions
  try {
    const raw = localStorage.getItem(`${scope}:pendingCBTSubmissions`);
    if (raw) {
      const obj = JSON.parse(raw);
      for (const [testId, payload] of Object.entries<any>(obj)) {
        const csid = (payload?.client_submission_id as string) || crypto.randomUUID();
        await enqueueSubmission({
          clientSubmissionId: csid,
          testId,
          userId,
          payload: { ...payload, client_submission_id: csid },
        });
      }
      localStorage.removeItem(`${scope}:pendingCBTSubmissions`);
    }
  } catch (e) {
    console.warn("[cbt] failed to migrate legacy pending submissions", e);
  }

  // Old in-progress snapshots
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(`${scope}:cbtInProgress:`)) keys.push(k);
    }
    for (const k of keys) {
      try {
        const raw = localStorage.getItem(k);
        if (!raw) continue;
        const snap = JSON.parse(raw);
        await saveInProgress({
          testId: String(snap.testId),
          userId,
          clientSubmissionId: snap.clientSubmissionId || crypto.randomUUID(),
          mode: snap.mode || "offline",
          questions: snap.questions || [],
          answers: snap.answers || {},
          startedAt: snap.started_at || new Date().toISOString(),
          initialTimeSeconds: Number(snap.initialTime ?? 0),
          timeLeftSeconds: Number(snap.timeLeft ?? 0),
          suspiciousActivity: Number(snap.suspiciousActivity ?? 0),
          lastSavedAt: new Date().toISOString(),
          onlineAttemptId: snap.onlineAttemptId ?? null,
          onlineExpiresAtMs: snap.onlineExpiresAtMs ?? null,
          clockSkewMs: snap.clockSkewMs ?? 0,
        });
        localStorage.removeItem(k);
      } catch {
        /* skip individual bad keys */
      }
    }
  } catch (e) {
    console.warn("[cbt] failed to migrate legacy in-progress", e);
  }

  localStorage.setItem(MIGRATION_FLAG, "1");
}
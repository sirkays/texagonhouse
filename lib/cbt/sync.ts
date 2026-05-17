// lib/cbt/sync.ts
import {
  listSubmissions,
  transitionSubmission,
  deleteSubmission,
  updateCompletedSyncStatus,
  type QueuedSubmission,
} from "./db";

interface SyncDeps {
  sessionToken: string;
  deviceId: string;
  onConfirmed?: (sub: QueuedSubmission, response: any) => void;
  onPermanentFailure?: (sub: QueuedSubmission, error: any) => void;
}

const BACKOFF_SCHEDULE_MS = [
  0,
  5_000,
  30_000,
  2 * 60_000,
  10 * 60_000,
  60 * 60_000,
];

const MAX_ATTEMPTS_BEFORE_PERMANENT = 12;

function nextBackoff(attempts: number): number {
  const base =
    BACKOFF_SCHEDULE_MS[
      Math.min(attempts, BACKOFF_SCHEDULE_MS.length - 1)
    ];

  const jitter = Math.random() * 0.3 * base;
  return base + jitter;
}

const PERMANENT_ERROR_CODES = new Set([
  "INVALID_PAYLOAD",
  "TEST_NOT_FOUND",
  "NO_STUDENT_PROFILE",
  "TIME_ELAPSED",
]);

let syncing = false;

export async function runSync(deps: SyncDeps): Promise<void> {
  if (syncing) return;
  if (typeof navigator !== "undefined" && !navigator.onLine) return;

  syncing = true;

  try {
    const queued = await listSubmissions("queued");
    const now = Date.now();

    const due = queued
      .filter((s) => s.nextAttemptAt <= now)
      .sort((a, b) => a.createdAt - b.createdAt);

    for (const sub of due) {
      await processOne(sub, deps);
    }
  } finally {
    syncing = false;
  }
}

async function processOne(
  sub: QueuedSubmission,
  deps: SyncDeps
): Promise<void> {
  const claimed = await transitionSubmission(
    sub.clientSubmissionId,
    ["queued"],
    { state: "uploading" }
  );

  if (!claimed) return;

  try {
    const res = await fetch(`/api/student/cbt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Session-Token": deps.sessionToken,
        "X-Device-Id": deps.deviceId,
        "X-Idempotency-Key": sub.clientSubmissionId,
      },
      body: JSON.stringify({
        ...sub.payload,
        currentTest: sub.testId,
      }),
    });

    if (res.ok) {
      const data = await res.json().catch(() => ({}));

      await transitionSubmission(
        sub.clientSubmissionId,
        ["uploading"],
        {
          state: "confirmed",
          serverResponse: data,
        }
      );

      await updateCompletedSyncStatus(sub.testId, sub.userId, {
        syncStatus: "confirmed",
        serverAttemptId: data?.attempt_id ?? null,
        serverResponse: data,
      });

      deps.onConfirmed?.(sub, data);
      return;
    }

    let errCode: string | undefined;
    let errDetail: string | undefined;

    try {
      const body = await res.json();
      errCode = body?.code;
      errDetail = body?.detail;
    } catch {
      // Not JSON.
    }

    // Already exists on server → treat as confirmed.
    if (
      errCode === "ATTEMPT_ALREADY_SUBMITTED" ||
      errCode === "DUPLICATE_REPLAY"
    ) {
      const serverResponse = {
        code: errCode,
        detail: errDetail,
      };

      await transitionSubmission(
        sub.clientSubmissionId,
        ["uploading"],
        {
          state: "confirmed",
          serverResponse,
        }
      );

      await updateCompletedSyncStatus(sub.testId, sub.userId, {
        syncStatus: "confirmed",
        serverResponse,
      });

      deps.onConfirmed?.(sub, serverResponse);
      return;
    }

    // Known permanent failure → stop retrying, but keep completed registry row.
    if (errCode && PERMANENT_ERROR_CODES.has(errCode)) {
      await transitionSubmission(
        sub.clientSubmissionId,
        ["uploading"],
        {
          state: "permanent_failure",
          lastError: errDetail || `HTTP ${res.status}`,
        }
      );

      await updateCompletedSyncStatus(sub.testId, sub.userId, {
        syncStatus: "failed",
      });

      deps.onPermanentFailure?.(sub, {
        code: errCode,
        detail: errDetail,
      });

      return;
    }

    // Other 4xx, except timeout/rate-limit, are permanent.
    if (
      res.status >= 400 &&
      res.status < 500 &&
      res.status !== 408 &&
      res.status !== 429
    ) {
      await transitionSubmission(
        sub.clientSubmissionId,
        ["uploading"],
        {
          state: "permanent_failure",
          lastError: errDetail || `HTTP ${res.status}`,
        }
      );

      await updateCompletedSyncStatus(sub.testId, sub.userId, {
        syncStatus: "failed",
      });

      deps.onPermanentFailure?.(sub, {
        code: errCode,
        detail: errDetail,
        status: res.status,
      });

      return;
    }

    // 5xx, 408, 429 → retryable.
    await scheduleRetry(sub, errDetail || `HTTP ${res.status}`);
  } catch (networkErr: any) {
    await scheduleRetry(sub, networkErr?.message || "Network error");
  }
}

async function scheduleRetry(
  sub: QueuedSubmission,
  errorMessage: string
): Promise<void> {
  const nextAttempts = sub.attempts + 1;

  if (nextAttempts >= MAX_ATTEMPTS_BEFORE_PERMANENT) {
    await transitionSubmission(
      sub.clientSubmissionId,
      ["uploading"],
      {
        state: "permanent_failure",
        attempts: nextAttempts,
        lastError: errorMessage,
      }
    );

    await updateCompletedSyncStatus(sub.testId, sub.userId, {
      syncStatus: "failed",
    });

    return;
  }

  await transitionSubmission(sub.clientSubmissionId, ["uploading"], {
    state: "queued",
    attempts: nextAttempts,
    nextAttemptAt: Date.now() + nextBackoff(nextAttempts),
    lastError: errorMessage,
  });
}

/** Periodically clear old confirmed rows so the queue stays small. */
export async function gcConfirmed(maxAgeMs = 60_000): Promise<void> {
  const confirmed = await listSubmissions("confirmed");
  const cutoff = Date.now() - maxAgeMs;

  for (const sub of confirmed) {
    if (sub.updatedAt < cutoff) {
      await deleteSubmission(sub.clientSubmissionId);
    }
  }
}
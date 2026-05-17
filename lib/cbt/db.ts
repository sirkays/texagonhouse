// lib/cbt/db.ts
import { openDB, type DBSchema, type IDBPDatabase } from "idb";

export interface InProgressAttempt {
  testId: string;
  userId?: string; // scoping field — filters prevent cross-user bleed
  clientSubmissionId: string;
  mode: "online" | "offline";
  questions: any[];
  answers: Record<number, any>;
  startedAt: string;
  initialTimeSeconds: number;
  timeLeftSeconds: number;
  suspiciousActivity: number;
  lastSavedAt: string;
  onlineAttemptId?: number | null;
  onlineExpiresAtMs?: number | null;
  clockSkewMs?: number;
  testTitle?: string;
}

export type QueueState =
  | "queued"
  | "uploading"
  | "confirmed"
  | "permanent_failure";

export interface QueuedSubmission {
  clientSubmissionId: string;
  testId: string;
  testTitle?: string;
  userId: string;
  payload: any;
  state: QueueState;
  attempts: number;
  nextAttemptAt: number;
  lastError?: string;
  createdAt: number;
  updatedAt: number;
  serverResponse?: any;
}

export type NewQueuedSubmission = Omit<
  QueuedSubmission,
  "createdAt" | "updatedAt" | "attempts" | "state" | "nextAttemptAt"
>;

export interface CompletedTestRecord {
  testId: string;
  userId?: string; // scoping field — filters prevent cross-user bleed
  clientSubmissionId: string;
  completedAt: number;
  syncStatus: "pending" | "confirmed" | "failed";
  serverAttemptId?: number | null;
  serverResponse?: any;

  // Snapshot we can show locally even before/without sync.
  testTitle?: string;
  localScore?: number | null;
  localTotalPoints?: number | null;
}

interface CBTDB extends DBSchema {
  in_progress: {
    key: string;
    value: InProgressAttempt;
  };
  submission_queue: {
    key: string;
    value: QueuedSubmission;
    indexes: {
      "by-state": QueueState;
      "by-test": string;
    };
  };
  completed_tests: {
    key: string;
    value: CompletedTestRecord;
  };
}

const DB_NAME = "cbt-db";
const DB_VERSION = 2;

let dbPromise: Promise<IDBPDatabase<CBTDB>> | null = null;

function notifyCbtChanged(type: "queue-changed" | "completed-changed") {
  if (typeof window === "undefined" || !("BroadcastChannel" in window)) return;

  try {
    const ch = new BroadcastChannel("cbt-queue");
    ch.postMessage({ type });
    ch.close();
  } catch {
    // Ignore notification failures. IndexedDB is still the source of truth.
  }
}

function getDb(): Promise<IDBPDatabase<CBTDB>> {
  if (typeof window === "undefined") {
    throw new Error("CBT DB used outside the browser");
  }

  if (!dbPromise) {
    dbPromise = openDB<CBTDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          db.createObjectStore("in_progress", {
            keyPath: "testId",
          });

          const store = db.createObjectStore("submission_queue", {
            keyPath: "clientSubmissionId",
          });

          store.createIndex("by-state", "state");
          store.createIndex("by-test", "testId");
        }

        if (oldVersion < 2) {
          if (!db.objectStoreNames.contains("completed_tests")) {
            db.createObjectStore("completed_tests", {
              keyPath: "testId",
            });
          }
        }
      },
      blocking() {
        dbPromise?.then((db) => db.close());
        dbPromise = null;
      },
    });
  }

  return dbPromise;
}

// ---------- In-progress ----------

export async function saveInProgress(
  attempt: InProgressAttempt
): Promise<void> {
  const db = await getDb();

  await db.put("in_progress", {
    ...attempt,
    lastSavedAt: new Date().toISOString(),
  });
}

/**
 * Load an in-progress attempt for a specific user.
 * Returns undefined if no record exists OR if the record belongs to a different user.
 */
export async function loadInProgress(
  testId: string,
  userId: string
): Promise<InProgressAttempt | undefined> {
  const db = await getDb();
  const record = await db.get("in_progress", testId);

  // Ownership check: prevent cross-user data bleed.
  // Only return the record if its userId matches the caller.
  // Legacy records without userId are NOT returned — they must not
  // block a different user from starting the same test.
  if (!record || record.userId !== userId) {
    return undefined;
  }

  return record;
}

export async function listAllInProgress(): Promise<InProgressAttempt[]> {
  const db = await getDb();
  return db.getAll("in_progress");
}

/**
 * Return only in-progress records that belong to the given userId.
 * Records without a userId (legacy) are excluded to prevent cross-user bleed.
 */
export async function listAllInProgressForUser(
  userId: string
): Promise<InProgressAttempt[]> {
  const all = await listAllInProgress();
  return all.filter((r) => r.userId === userId);
}

/**
 * Clear an in-progress record only if it belongs to the given user.
 * This prevents one user from accidentally clearing another user's in-progress attempt.
 */
export async function clearInProgress(testId: string, userId: string): Promise<void> {
  const db = await getDb();

  // Only clear if the record belongs to this user (or has no userId — legacy)
  const existing = await db.get("in_progress", testId);
  if (existing && existing.userId && existing.userId !== userId) {
    return; // Don't delete another user's record
  }

  await db.delete("in_progress", testId);
}

export async function clearAllInProgress(): Promise<void> {
  const db = await getDb();
  await db.clear("in_progress");
}

// ---------- Submission queue ----------

export async function enqueueSubmission(
  sub: NewQueuedSubmission
): Promise<QueuedSubmission> {
  const db = await getDb();
  const now = Date.now();

  const record: QueuedSubmission = {
    ...sub,
    state: "queued",
    attempts: 0,
    nextAttemptAt: now,
    createdAt: now,
    updatedAt: now,
  };

  const completedRecord: CompletedTestRecord = {
    testId: sub.testId,
    userId: sub.userId,
    clientSubmissionId: sub.clientSubmissionId,
    completedAt: now,
    syncStatus: "pending",
    testTitle: sub.testTitle,
    localScore: sub.payload?.localScore ?? null,
    localTotalPoints: sub.payload?.localTotalPoints ?? null,
  };

  const tx = db.transaction(
    ["submission_queue", "completed_tests"],
    "readwrite"
  );

  await tx.objectStore("submission_queue").put(record);
  await tx.objectStore("completed_tests").put(completedRecord);
  await tx.done;

  notifyCbtChanged("queue-changed");
  notifyCbtChanged("completed-changed");

  return record;
}

export async function getQueuedSubmission(
  clientSubmissionId: string
): Promise<QueuedSubmission | undefined> {
  const db = await getDb();
  return db.get("submission_queue", clientSubmissionId);
}

export async function getSubmissionForTest(
  testId: string
): Promise<QueuedSubmission | undefined> {
  const db = await getDb();
  return db.getFromIndex("submission_queue", "by-test", testId);
}

export async function listSubmissions(
  state?: QueueState
): Promise<QueuedSubmission[]> {
  const db = await getDb();

  if (state) {
    return db.getAllFromIndex("submission_queue", "by-state", state);
  }

  return db.getAll("submission_queue");
}

/**
 * Atomic state transition. Returns the updated record, or null if preconditions
 * weren't met, for example another tab already moved this submission forward.
 */
export async function transitionSubmission(
  clientSubmissionId: string,
  expectedFromStates: QueueState[],
  patch: Partial<QueuedSubmission>
): Promise<QueuedSubmission | null> {
  const db = await getDb();
  const tx = db.transaction("submission_queue", "readwrite");
  const store = tx.store;

  const existing = await store.get(clientSubmissionId);

  if (!existing || !expectedFromStates.includes(existing.state)) {
    await tx.done;
    return null;
  }

  const updated: QueuedSubmission = {
    ...existing,
    ...patch,
    updatedAt: Date.now(),
  };

  await store.put(updated);
  await tx.done;

  notifyCbtChanged("queue-changed");

  return updated;
}

export async function deleteSubmission(
  clientSubmissionId: string
): Promise<void> {
  const db = await getDb();
  await db.delete("submission_queue", clientSubmissionId);

  notifyCbtChanged("queue-changed");
}

// ---------- Completed tests registry ----------

export async function markTestCompleted(
  record: CompletedTestRecord
): Promise<void> {
  const db = await getDb();
  await db.put("completed_tests", record);

  notifyCbtChanged("completed-changed");
}

/**
 * Get a completed test record only if it belongs to the given user.
 * Returns undefined if no record exists OR if the record belongs to a different user.
 * This prevents cross-user bleed when two students share the same browser.
 */
export async function getCompletedTest(
  testId: string,
  userId: string
): Promise<CompletedTestRecord | undefined> {
  const db = await getDb();
  const record = await db.get("completed_tests", testId);

  // Ownership check: prevent cross-user data bleed.
  // Only return the record if its userId matches the caller.
  // Legacy records without userId are NOT returned — they must not
  // block a different user from starting the same test.
  if (!record || record.userId !== userId) {
    return undefined;
  }

  return record;
}

export async function listCompletedTests(): Promise<CompletedTestRecord[]> {
  const db = await getDb();
  return db.getAll("completed_tests");
}

/**
 * Return only completed-test records that belong to the given userId.
 * Records written before the userId field was introduced (legacy) are
 * excluded so they don't bleed across accounts.
 */
export async function listCompletedTestsForUser(
  userId: string
): Promise<CompletedTestRecord[]> {
  const all = await listCompletedTests();
  return all.filter((r) => r.userId === userId);
}

export async function updateCompletedSyncStatus(
  testId: string,
  userId: string,
  patch: Partial<CompletedTestRecord>
): Promise<void> {
  const db = await getDb();
  const existing = await db.get("completed_tests", testId);

  if (!existing) return;

  // Only update if the record belongs to this user
  if (existing.userId && existing.userId !== userId) return;

  await db.put("completed_tests", {
    ...existing,
    ...patch,
  });

  notifyCbtChanged("completed-changed");
}

export async function deleteCompletedTest(testId: string, userId?: string): Promise<void> {
  const db = await getDb();

  // If userId provided, verify ownership before deleting
  if (userId) {
    const existing = await db.get("completed_tests", testId);
    if (existing && existing.userId && existing.userId !== userId) return;
  }

  await db.delete("completed_tests", testId);

  notifyCbtChanged("completed-changed");
}
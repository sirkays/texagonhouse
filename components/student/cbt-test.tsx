/* cbt-test.tsx — IndexedDB queue + idempotent submissions + local completed registry */

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Clock,
  CheckCircle,
  Play,
  RotateCcw,
  Shield,
  AlertTriangle,
  LogIn,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Spinner } from "@/components/ui/spinner";
import { useSession } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStudentTheme } from "@/components/student/useStudentTheme";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { cn } from "@/lib/utils";
import { useCourseAccess } from "@/providers/CourseAccessProvider";
import { CourseLockedOverlay } from "@/components/student/course-locked-overlay";

import {
  saveInProgress,
  loadInProgress,
  clearInProgress,
  listAllInProgressForUser,
  enqueueSubmission,
  getSubmissionForTest,
  markTestCompleted,
  getCompletedTest,
  listCompletedTestsForUser,
  deleteCompletedTest,
  type InProgressAttempt,
  type CompletedTestRecord,
} from "@/lib/cbt/db";
import { useSubmissionQueue } from "@/lib/cbt/useSubmissionQueue";
import { migrateLegacyCBTState } from "@/lib/cbt/migrate";
import { checkHeartbeat } from "@/lib/cbt/heartbeat";

/* ---------- types ---------- */

type Attempt = {
  id: number;
  test_id: number;
  test?: {
    id: number;
    title: string;
    duration_minutes?: number;
    total_marks?: string | number;
    visibility?: string;
    show_score?: boolean;
    start_at?: string | null;
    end_at?: string | null;
    course_id?: number;
    course_name?: string;
  };
  student?: number;
  started_at?: string | null;
  submitted_at?: string | null;
  score?: string | number | null;
  status?: string;
  answers?: Record<string, any>;
  is_submitted?: boolean;
  is_graded?: boolean;
  is_open_now?: boolean;
  created_at?: string;
  updated_at?: string;
};

type AttemptsPayload = {
  count: number;
  page: number;
  page_size: number;
  results: Attempt[];
};

type ForcedSubmitReason = "time_elapsed" | "suspicious_threshold" | null;

const TERMINAL_SUBMISSION_CODES = new Set([
  "ATTEMPT_ALREADY_SUBMITTED",
  "DUPLICATE_REPLAY",
  "TIME_ELAPSED",
  "ATTEMPT_NOT_FOUND",
  "NO_ACTIVE_ATTEMPT",
  "ATTEMPT_NOT_STARTED",
]);

/* ---------- helpers ---------- */

/** Sentinel so callers can distinguish a client-side timeout from other errors. */
class SubmitTimeoutError extends Error {
  isTimeout = true as const;
  constructor() {
    super("Request timed out or was aborted. Please try again.");
    this.name = "SubmitTimeoutError";
  }
}

async function fetchWithTimeout(url: string, options: any = {}, timeout = 90_000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timer);
    return response;
  } catch (err: any) {
    clearTimeout(timer);
    if (err?.name === "AbortError" || err?.message?.includes("aborted")) {
      throw new SubmitTimeoutError();
    }
    throw err;
  }
}

function getOrCreateDeviceId(userId?: string | number) {
  if (typeof window === "undefined") return "";

  const STORAGE_KEY = `cbt:${userId ?? "anon"}:cbtDeviceId`;
  let deviceId = localStorage.getItem(STORAGE_KEY);

  if (!deviceId) {
    deviceId = `cbt-${userId}-${crypto.randomUUID()}`;
    localStorage.setItem(STORAGE_KEY, deviceId);
  }

  return deviceId;
}

const normalizeType = (t: string) => {
  const x = (t || "").toLowerCase();

  if (x === "scq") return "single-choice";
  if (x === "mcq") return "multiple-choice";
  if (x === "tf" || x === "truefalse" || x === "true-false") {
    return "true-false";
  }
  if (x === "short" || x === "short_answer" || x === "short-answer") {
    return "short-answer";
  }
  if (x === "essay" || x === "long" || x === "long_answer" || x === "long-answer") {
    return "essay";
  }

  return x;
};

const mapQuestions = (list: any[]) =>
  (list || []).map((q: any) => ({
    id: q.id,
    type: normalizeType(q.type),
    question: q.question,
    options:
      normalizeType(q.type) === "true-false"
        ? [
          { id: "true", text: "True" },
          { id: "false", text: "False" },
        ]
        : (q.choices || []).map((c: any) => ({
          id: c.id,
          text: c.text,
        })),
    points: q.points,
    image: q.image || null,
  }));

function buildAnswersPayload(questions: any[], answers: Record<number, any>): any[] {
  const out: any[] = [];

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const ans = answers[i];

    if (ans === undefined) continue;

    const entry: any = {
      question: q.id,
    };

    if (Array.isArray(ans)) {
      entry.choices = ans.map((a) => (isNaN(Number(a)) ? a : Number(a)));
    } else if (q.type === "essay" || q.type === "short-answer") {
      entry.text = ans;
    } else if (q.type === "true-false") {
      const option = q.options?.find(
        (o: any) => (o.text || "").toLowerCase() === String(ans).toLowerCase()
      );

      entry.choice = option ? option.id : ans;
    } else {
      const numeric = Number(ans);
      entry.choice = isNaN(numeric) ? ans : numeric;
    }

    out.push(entry);
  }

  return out;
}

/* ---------- component ---------- */

export function CBTTest() {
  const { data: session, status } = useSession();
  const { theme } = useStudentTheme();
  const isAero = theme === "aero-premium";
  const { hasAccess } = useCourseAccess();

  const userId = session?.user?.id?.toString() || "anon";

  // Keep a stable ref of the session token so that background session
  // re-validations don't cause dependency-array changes in effects.
  const sessionTokenRaw = session?.user?.sessionToken || null;
  const sessionTokenRef = useRef(sessionTokenRaw);
  if (sessionTokenRaw) {
    sessionTokenRef.current = sessionTokenRaw;
  }

  // sessionToken used for API calls — always the latest known-good value
  const sessionToken = sessionTokenRef.current;

  const deviceId = useMemo(() => getOrCreateDeviceId(userId), [userId]);

  const { queue, isSyncing, triggerSync } = useSubmissionQueue(
    sessionToken,
    deviceId
  );

  const [completed, setCompleted] = useState<Record<string, CompletedTestRecord>>(
    {}
  );

  const refreshCompleted = useCallback(async () => {
    // Only load records that belong to this user — prevents cross-user bleed
    // when two students share the same browser/device.
    const all = await listCompletedTestsForUser(userId);
    const map: Record<string, CompletedTestRecord> = {};

    for (const item of all) {
      map[item.testId] = item;
    }

    // Only update state if the completed records actually changed.
    // Without this check, every call creates a new object reference
    // which triggers a re-render even when nothing changed.
    setCompleted((prev) => {
      const prevKeys = Object.keys(prev);
      const nextKeys = Object.keys(map);
      if (prevKeys.length !== nextKeys.length) return map;
      for (const key of nextKeys) {
        const p = prev[key];
        const n = map[key];
        if (
          !p ||
          p.syncStatus !== n.syncStatus ||
          p.clientSubmissionId !== n.clientSubmissionId ||
          p.completedAt !== n.completedAt
        ) {
          return map;
        }
      }
      return prev;
    });
  }, [userId]);

  // ---- ui / list state ----
  const [availableTests, setAvailableTests] = useState<any[]>([]);
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [attempts, setAttempts] = useState<AttemptsPayload>({
    count: 0,
    page: 1,
    page_size: 20,
    results: [],
  });
  const [attemptsPage, setAttemptsPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const hasLoadedOnceRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Used when a test is closed from inside the exam screen.
   * Example: TIME_ELAPSED, NO_ACTIVE_ATTEMPT, ATTEMPT_NOT_FOUND.
   * This displays on the CBT test list page instead of trapping the user
   * inside the active test view with a modal.
   */
  const [listNotice, setListNotice] = useState<{
    type: "warning" | "error" | "success";
    title: string;
    message: string;
  } | null>(null);

  // ---- in-test state ----
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [currentMode, setCurrentMode] = useState<"online" | "offline">(
    "offline"
  );
  const [clientSubmissionId, setClientSubmissionId] = useState<string | null>(
    null
  );
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1800);
  const [initialTime, setInitialTime] = useState(0);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [onlineAttemptId, setOnlineAttemptId] = useState<number | null>(null);
  const [onlineExpiresAtMs, setOnlineExpiresAtMs] = useState<number | null>(
    null
  );
  const [clockSkewMs, setClockSkewMs] = useState(0);
  const [resumedFromSnapshot, setResumedFromSnapshot] = useState(false);

  // ---- forced submit state ----
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [pendingForcedSubmit, setPendingForcedSubmit] = useState(false);
  const [forcedSubmitReason, setForcedSubmitReason] =
    useState<ForcedSubmitReason>(null);
  const [forcedSubmitRetries, setForcedSubmitRetries] = useState(0);
  const MAX_FORCED_RETRIES = 6;

  // ---- security ----
  const [isSecureMode, setIsSecureMode] = useState(false);
  const [suspiciousActivity, setSuspiciousActivity] = useState(0);
  const [showSecurityWarning, setShowSecurityWarning] = useState(false);
  const suspiciousRef = useRef(0);
  const lastSuspiciousAtRef = useRef(0);
  const warningOpenRef = useRef(false);
  const autoSubmitTriggeredRef = useRef(false);
  const submitTestRef = useRef<null | (() => void)>(null);

  // ---- post-submit ----
  const [testCompleted, setTestCompleted] = useState(false);
  const [autoReloadSeconds, setAutoReloadSeconds] = useState<number | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ---- modals ----
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorModalTitle, setErrorModalTitle] = useState("Submission error");
  const [errorModalMessage, setErrorModalMessage] = useState("");
  const [showRefreshDeviceDialog, setShowRefreshDeviceDialog] = useState(false);

  // ---- misc ----
  const [activeTab, setActiveTab] = useState<"available" | "past">("available");
  const [pastSortBy, setPastSortBy] = useState<"date" | "score" | "result">(
    "date"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [startingTestIds, setStartingTestIds] = useState<
    Record<string, boolean>
  >({});
  const testsPerPage = 3;

  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  const isSubscriber = true;
  const examAttempts = 0;
  const maxAttempts = 3;

  const isOnlineMode = currentMode === "online";

  // Only locked when submission MUST happen but cannot happen yet.
  // A normal internet drop during an online test does not freeze the UI.
  const isAwaitingForcedSubmit = isOnlineMode && pendingForcedSubmit;

  /* ---------- one-time legacy migration ---------- */

  useEffect(() => {
    if (status !== "authenticated") return;

    migrateLegacyCBTState(userId).catch(() => { });
  }, [status, userId]);

  /* ---------- online/offline listeners ---------- */

  useEffect(() => {
    const onOnline = () => {
      setIsOnline(true);
      triggerSync();
    };

    const onOffline = () => setIsOnline(false);

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [triggerSync]);

  /* ---------- completed registry refresh + cross-tab updates ---------- */

  useEffect(() => {
    refreshCompleted().catch(() => { });
  }, [refreshCompleted]);

  useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) return;

    const channel = new BroadcastChannel("cbt-queue");

    channel.onmessage = (event) => {
      if (
        event.data?.type === "queue-changed" ||
        event.data?.type === "completed-changed"
      ) {
        refreshCompleted().catch(() => { });
      }
    };

    return () => channel.close();
  }, [refreshCompleted]);

  /* ---------- helpers ---------- */

  const showErrorModal = (title: string, message: string) => {
    setErrorModalTitle(title);
    setErrorModalMessage(message);
    setErrorModalOpen(true);
  };

  const parseApiErrorMessage = (raw: string) => {
    try {
      const outer = JSON.parse(raw);
      return outer?.detail || outer?.error || raw;
    } catch {
      return raw;
    }
  };

  const lockStart = (testId: string) =>
    setStartingTestIds((p) => ({
      ...p,
      [testId]: true,
    }));

  const unlockStart = (testId: string) =>
    setStartingTestIds((p) => {
      const next = { ...p };
      delete next[testId];
      return next;
    });

  const resetSecurityState = () => {
    setIsSecureMode(true);
    suspiciousRef.current = 0;
    setSuspiciousActivity(0);
    warningOpenRef.current = false;
    lastSuspiciousAtRef.current = 0;
    autoSubmitTriggeredRef.current = false;
  };

  const bumpSuspicious = useCallback(
    (_reason?: string) => {
      const now = Date.now();

      if (now - lastSuspiciousAtRef.current < 800) return;

      lastSuspiciousAtRef.current = now;

      suspiciousRef.current += 1;
      setSuspiciousActivity(suspiciousRef.current);

      if (!warningOpenRef.current) {
        warningOpenRef.current = true;
        setShowSecurityWarning(true);
      }

      if (suspiciousRef.current >= 3 && !autoSubmitTriggeredRef.current) {
        autoSubmitTriggeredRef.current = true;

        if (isOnlineMode && !navigator.onLine) {
          setPendingForcedSubmit(true);
          setForcedSubmitReason("suspicious_threshold");
        } else {
          submitTestRef.current?.();
        }
      }
    },
    [isOnlineMode]
  );

  const getAdjustedNowMs = () => Date.now() - clockSkewMs;

  const isOnlineSubmissionStillValid = () => {
    if (!onlineExpiresAtMs) return true;
    return getAdjustedNowMs() <= onlineExpiresAtMs + 30_000;
  };

  /**
   * Submit a test from a snapshot, NOT from React state.
   * Used by resume/forced-submit paths where state may not have settled yet.
   * Returns true if submission succeeded or reached a terminal state.
   */
  const submitFromSnapshot = useCallback(
    async (snap: InProgressAttempt): Promise<boolean> => {
      const test = availableTests.find(
        (t) => t.pk?.toString() === snap.testId
      );

      const submitAnswers = buildAnswersPayload(snap.questions, snap.answers || {});
      const payload = {
        client_submission_id: snap.clientSubmissionId,
        currentTest: snap.testId,
        answers: submitAnswers,
        started_at: snap.startedAt,
        duration_seconds: snap.initialTimeSeconds,
        suspicious_activity: snap.suspiciousActivity || 0,
        attempt_id: snap.onlineAttemptId,
        expires_at_ms: snap.onlineExpiresAtMs,
        mode: snap.mode,
        auto_submitted: true,
      };

      const markTerminal = async (
        data: any,
        reason: "submitted" | "expired" | "already_submitted"
      ) => {
        await markTestCompleted({
          testId: snap.testId,
          userId,
          clientSubmissionId: snap.clientSubmissionId,
          completedAt: Date.now(),
          syncStatus: "confirmed",
          serverAttemptId: data?.attempt_id ?? null,
          serverResponse: { ...data, _resolvedReason: reason },
          testTitle: test?.title || snap.testTitle,
          localScore: typeof data?.score === "number" ? data.score : null,
          localTotalPoints:
            typeof data?.total_points === "number" ? data.total_points : null,
        });

        await clearInProgress(snap.testId, userId);
        await refreshCompleted();

        if (reason === "expired") {
          setTestResults((p) => ({
            ...p,
            [snap.testId]: {
              title: test?.title || snap.testTitle,
              code: "TIME_ELAPSED",
              detail: "Time elapsed before submission could complete.",
            },
          }));
        } else {
          setTestResults((p) => ({
            ...p,
            [snap.testId]: {
              ...data,
              title: test?.title || snap.testTitle,
              code:
                reason === "already_submitted"
                  ? data?.code || "ATTEMPT_ALREADY_SUBMITTED"
                  : data?.code,
            },
          }));
        }
      };

      if (snap.mode === "online") {
        if (!navigator.onLine) return false;

        try {
          const res = await fetchWithTimeout(
            `/api/student/cbt`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Session-Token": sessionToken!,
                "X-Device-Id": deviceId,
                "X-Idempotency-Key": snap.clientSubmissionId,
              },
              body: JSON.stringify(payload),
            },
            90_000
          );

          let data: any = {};
          let rawText = "";
          const clonedResponse = res.clone();

          try {
            data = await res.json();
          } catch {
            try {
              rawText = await clonedResponse.text();
            } catch {
              rawText = "";
            }
          }

          if (res.ok) {
            await markTerminal(data, "submitted");
            return true;
          }

          const code = data?.code;

          if (code === "TIME_ELAPSED") {
            await markTerminal(data, "expired");
            return true;
          }

          if (
            code === "ATTEMPT_ALREADY_SUBMITTED" ||
            code === "DUPLICATE_REPLAY" ||
            code === "ATTEMPT_NOT_FOUND" ||
            code === "NO_ACTIVE_ATTEMPT" ||
            code === "ATTEMPT_NOT_STARTED"
          ) {
            await markTerminal(data, "already_submitted");
            return true;
          }

          if (res.status >= 400 && res.status < 500) {
            const dataText = JSON.stringify(data || {}).toLowerCase();
            const blob = `${rawText} ${dataText}`.toLowerCase();

            const looksTerminal =
              blob.includes("time elapsed") ||
              blob.includes("time has elapsed") ||
              blob.includes("time is up") ||
              blob.includes("time is up") ||
              blob.includes("already performed") ||
              blob.includes("already submitted") ||
              blob.includes("not started") ||
              blob.includes("no active attempt") ||
              blob.includes("attempt not found") ||
              blob.includes("expired");

            if (looksTerminal) {
              await markTerminal(data, "expired");
              return true;
            }

            try {
              const hb = await checkHeartbeat(
                snap.testId,
                sessionToken!,
                deviceId
              );

              if (hb && (hb.status === "submitted" || hb.status === "expired")) {
                await markTerminal(
                  { attempt_id: hb.attempt_id, status: hb.status },
                  hb.status === "expired" ? "expired" : "already_submitted"
                );
                return true;
              }
            } catch {
              /* ignore */
            }
          }

          return false;
        } catch {
          return false;
        }
      }

      await enqueueSubmission({
        clientSubmissionId: snap.clientSubmissionId,
        testId: snap.testId,
        userId,
        payload,
        testTitle: test?.title || snap.testTitle,
      });

      await markTestCompleted({
        testId: snap.testId,
        userId,
        clientSubmissionId: snap.clientSubmissionId,
        completedAt: Date.now(),
        syncStatus: "pending",
        testTitle: test?.title || snap.testTitle,
        localScore: null,
        localTotalPoints: null,
      });

      await clearInProgress(snap.testId, userId);
      await refreshCompleted();

      if (navigator.onLine) triggerSync();

      return true;
    },
    [
      availableTests,
      sessionToken,
      deviceId,
      userId,
      refreshCompleted,
      triggerSync,
    ]
  );

  const recoverForcedSubmitState = useCallback(async () => {
    if (!currentTest) return;

    const alreadyDone = await getCompletedTest(currentTest, userId);

    if (alreadyDone) {
      setPendingForcedSubmit(false);
      setForcedSubmitReason(null);
      setForcedSubmitRetries(0);
      setTestCompleted(true);
      setIsSecureMode(false);
      setResumedFromSnapshot(false);
      return;
    }

    const snap = await loadInProgress(currentTest, userId);

    if (!snap) {
      setPendingForcedSubmit(false);
      setForcedSubmitReason(null);
      setForcedSubmitRetries(0);
      handleResetToList();
      showErrorModal(
        "Submission state lost",
        "We couldn’t find your in-progress test data on this device. Please contact support if your attempt isn’t reflected in past attempts."
      );
      return;
    }

    if (!navigator.onLine) {
      showErrorModal(
        "Still offline",
        "Your submission will retry automatically when your connection returns."
      );
      return;
    }

    const ok = await submitFromSnapshot(snap);

    if (ok) {
      setPendingForcedSubmit(false);
      setForcedSubmitReason(null);
      setForcedSubmitRetries(0);
      setTestCompleted(true);
      setIsSecureMode(false);
      setResumedFromSnapshot(false);
    } else {
      setForcedSubmitRetries((n) => n + 1);
      showErrorModal(
        "Still trying",
        "We could not finalize your submission yet. Keep this tab open; it will retry automatically."
      );
    }
  }, [currentTest, submitFromSnapshot]);

  /* ---------- fetch list + attempts ---------- */

  useEffect(() => {
    hasLoadedOnceRef.current = hasLoadedOnce;
  }, [hasLoadedOnce]);

  const initialFetchDoneRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    if (status !== "authenticated" || !sessionToken) {
      if (!hasLoadedOnceRef.current) {
        setError("Not authenticated");
        setLoading(false);
      }
      setRefreshing(false);
      return;
    }

    if (lastUserIdRef.current !== null && lastUserIdRef.current !== userId) {
      initialFetchDoneRef.current = false;
    }
    lastUserIdRef.current = userId;

    if (initialFetchDoneRef.current) return;

    initialFetchDoneRef.current = true;
    fetchData(hasLoadedOnceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, sessionToken, userId]);

  useEffect(() => {
    if (!initialFetchDoneRef.current) return;
    if (!sessionToken) return;
    fetchData(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptsPage]);

  const fetchData = async (silent = false) => {
    if (!silent) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    if (!isOnline) {
      loadCachedData();
      setHasLoadedOnce(true);
      if (!silent) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
      return;
    }

    try {
      const qs = new URLSearchParams();
      qs.set("page", String(attemptsPage));
      qs.set("page_size", "20");

      const res = await fetchWithTimeout(
        `/api/student/cbt?${qs.toString()}`,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Session-Token": sessionToken!,
            "X-Device-Id": deviceId,
          },
        },
        40000
      );

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          setError("Session expired");
          setHasLoadedOnce(true);
          return;
        }

        throw new Error(`HTTP ${res.status}`);
      }

      const d = await res.json();

      const tests = Array.isArray(d.tests)
        ? d.tests
        : Array.isArray(d.available_tests)
          ? d.available_tests
          : [];

      const untakenTests = tests.filter(
        (t: any) => !(d.results || {})[t.id || t.pk]
      );

      setAvailableTests(untakenTests);
      setTestResults(d.results || {});

      const offlineOnly = (tests || []).filter(
        (t: any) => (t?.mode || "online") === "offline"
      );

      const rawAttempts =
        d.attempts && typeof d.attempts === "object"
          ? d.attempts
          : typeof d.count === "number" && Array.isArray(d.results)
            ? {
              count: d.count,
              page: d.page ?? attemptsPage,
              page_size: d.page_size ?? 20,
              results: d.results,
            }
            : {
              count: 0,
              page: 1,
              page_size: 20,
              results: [],
            };

      setAttempts({
        count: Number(rawAttempts.count ?? rawAttempts.results?.length ?? 0),
        page: Number(rawAttempts.page ?? 1),
        page_size: Number(rawAttempts.page_size ?? 20),
        results: Array.isArray(rawAttempts.results) ? rawAttempts.results : [],
      });

      localStorage.setItem(
        `cbt:${userId}:cachedCBTData`,
        JSON.stringify({
          tests: offlineOnly,
          results: d.results || {},
          attempts: rawAttempts,
        })
      );

      // ── Prune stale local locks ─────────────────────────────────────────
      try {
        const inProgressList = await listAllInProgressForUser(userId);
        for (const snap of inProgressList) {
          const testId = snap.testId;
          const hasResult = !!(d.results || {})[testId];
          const hasAttempt = (rawAttempts.results || []).some(
            (a: any) => String(a.test_id) === String(testId)
          );
          const testDef = tests.find(
            (t: any) => String(t.id || t.pk) === String(testId)
          );
          const isOfflineTest = testDef?.mode === "offline";

          if (hasResult) {
            // Test is finished and graded
            await clearInProgress(testId, userId);
          } else if (!hasResult && !hasAttempt) {
            // Server doesn't know about this attempt
            if (isOfflineTest) {
              continue; // Keep offline tests, server wouldn't know yet
            }
            // Online test that server forgot about (deleted attempt)
            await clearInProgress(testId, userId);
          }
        }

        // Also prune completed test records that were deleted on the server
        const completedTests = await listCompletedTestsForUser(userId);
        let prunedCompleted = false;
        
        for (const ct of completedTests) {
          const testId = ct.testId;
          const hasResult = !!(d.results || {})[testId];
          const hasAttempt = (rawAttempts.results || []).some(
            (a: any) => String(a.test_id) === String(testId)
          );

          if (!hasResult && !hasAttempt && ct.syncStatus !== "pending") {
            await deleteCompletedTest(testId, userId);
            prunedCompleted = true;
          }
        }
        
        if (prunedCompleted) {
          await refreshCompleted();
        }
      } catch (e) {
        console.error("Failed to prune stale local locks", e);
      }

      setError(null);
      setHasLoadedOnce(true);
    } catch (err: any) {
      if (!isOnline) {
        loadCachedData();
      } else {
        setError(err.message || "Failed to load assessments");
      }
      setHasLoadedOnce(true);
    } finally {
      if (!silent) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  };

  const loadCachedData = () => {
    const cached = localStorage.getItem(`cbt:${userId}:cachedCBTData`);

    if (cached) {
      const data = JSON.parse(cached);

      setAvailableTests(data.tests || []);
      setTestResults(data.results || {});
      setAttempts(
        data.attempts || {
          count: 0,
          page: 1,
          page_size: 20,
          results: [],
        }
      );
      setError("Offline: Showing cached data");
    } else {
      setError("Offline and no cached data available");
    }
  };

  useEffect(() => {
    if (status !== "authenticated") return;
    if (currentTest) return;

    let cancelled = false;

    (async () => {
      const inProgressList = await listAllInProgressForUser(userId);

      if (cancelled || inProgressList.length === 0) return;

      const snap = inProgressList.sort(
        (a, b) =>
          new Date(b.lastSavedAt).getTime() - new Date(a.lastSavedAt).getTime()
      )[0];

      const completedRecord = await getCompletedTest(snap.testId, userId);

      if (completedRecord) {
        await clearInProgress(snap.testId, userId);
        return;
      }

      const startedMs = new Date(snap.startedAt).getTime();
      const elapsedSec = Math.floor((Date.now() - startedMs) / 1000);
      const remainingSec = Math.max(0, snap.initialTimeSeconds - elapsedSec);

      if (remainingSec <= 0) {
        const ok = await submitFromSnapshot(snap);

        if (cancelled) return;

        if (ok) {
          setCurrentTest(snap.testId);
          setClientSubmissionId(snap.clientSubmissionId);
          setCurrentMode(snap.mode);
          setTestCompleted(true);
          setIsSecureMode(false);
          setPendingForcedSubmit(false);
          setForcedSubmitReason(null);
          setForcedSubmitRetries(0);
          setResumedFromSnapshot(false);

          showErrorModal(
            "Time’s up",
            "The time for this test has ended. Your submission has been recorded."
          );
          return;
        }

        if (snap.mode !== "online") {
          await clearInProgress(snap.testId, userId);
          return;
        }

        setCurrentTest(snap.testId);
        setClientSubmissionId(snap.clientSubmissionId);
        setCurrentMode(snap.mode);
        setQuestions(snap.questions);
        setAnswers(snap.answers || {});
        setStartTime(snap.startedAt);
        setInitialTime(snap.initialTimeSeconds);
        setTimeLeft(0);
        setSuspiciousActivity(snap.suspiciousActivity || 0);
        suspiciousRef.current = snap.suspiciousActivity || 0;
        setOnlineAttemptId(snap.onlineAttemptId ?? null);
        setOnlineExpiresAtMs(snap.onlineExpiresAtMs ?? null);
        setClockSkewMs(snap.clockSkewMs ?? 0);
        setIsSecureMode(true);
        setCurrentQuestion(0);
        setPendingForcedSubmit(true);
        setForcedSubmitReason("time_elapsed");
        setResumedFromSnapshot(false);

        return;
      }

      setClientSubmissionId(snap.clientSubmissionId);
      setCurrentMode(snap.mode);
      setQuestions(snap.questions);
      setAnswers(snap.answers || {});
      setStartTime(snap.startedAt);
      setInitialTime(snap.initialTimeSeconds);
      setTimeLeft(remainingSec);
      setSuspiciousActivity(snap.suspiciousActivity || 0);
      suspiciousRef.current = snap.suspiciousActivity || 0;
      setOnlineAttemptId(snap.onlineAttemptId ?? null);
      setOnlineExpiresAtMs(snap.onlineExpiresAtMs ?? null);
      setClockSkewMs(snap.clockSkewMs ?? 0);
      setIsSecureMode(true);
      setCurrentTest(snap.testId);
      setCurrentQuestion(0);
      setResumedFromSnapshot(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [status, currentTest, submitFromSnapshot]);

  const lastConfirmedCountRef = useRef(0);

  useEffect(() => {
    const confirmedCount = queue.filter((q) => q.state === "confirmed").length;

    if (confirmedCount > lastConfirmedCountRef.current) {
      lastConfirmedCountRef.current = confirmedCount;
      refreshCompleted().catch(() => { });
    }
  }, [queue, refreshCompleted]);

  useEffect(() => {
    if (!isOnline) return;
    if (!isOnlineMode) return;
    if (!pendingForcedSubmit) return;
    if (!currentTest) return;

    let cancelled = false;

    const timer = setTimeout(async () => {
      if (cancelled) return;

      const alreadyDone = await getCompletedTest(currentTest, userId);

      if (cancelled) return;

      if (alreadyDone) {
        setPendingForcedSubmit(false);
        setForcedSubmitReason(null);
        setForcedSubmitRetries(0);
        setTestCompleted(true);
        setIsSecureMode(false);
        setResumedFromSnapshot(false);
        return;
      }

      const snap = await loadInProgress(currentTest, userId);

      if (cancelled) return;

      if (!snap) {
        setPendingForcedSubmit(false);
        setForcedSubmitReason(null);
        setForcedSubmitRetries(0);
        handleResetToList();
        return;
      }

      const ok = await submitFromSnapshot(snap);

      if (cancelled) return;

      if (ok) {
        setPendingForcedSubmit(false);
        setForcedSubmitReason(null);
        setForcedSubmitRetries(0);
        setTestCompleted(true);
        setIsSecureMode(false);
        setResumedFromSnapshot(false);
      } else {
        setForcedSubmitRetries((n) => n + 1);
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isOnline, isOnlineMode, pendingForcedSubmit, currentTest, submitFromSnapshot]);

  useEffect(() => {
    if (!pendingForcedSubmit) return;
    if (!currentTest) return;
    if (forcedSubmitRetries >= MAX_FORCED_RETRIES) return;

    const interval = setInterval(async () => {
      if (!navigator.onLine) return;

      const alreadyDone = await getCompletedTest(currentTest, userId);

      if (alreadyDone) {
        setPendingForcedSubmit(false);
        setForcedSubmitReason(null);
        setForcedSubmitRetries(0);
        setTestCompleted(true);
        setIsSecureMode(false);
        setResumedFromSnapshot(false);
        return;
      }

      const snap = await loadInProgress(currentTest, userId);

      if (!snap) {
        setPendingForcedSubmit(false);
        setForcedSubmitReason(null);
        setForcedSubmitRetries(0);
        handleResetToList();
        return;
      }

      const ok = await submitFromSnapshot(snap);

      if (ok) {
        setPendingForcedSubmit(false);
        setForcedSubmitReason(null);
        setForcedSubmitRetries(0);
        setTestCompleted(true);
        setIsSecureMode(false);
        setResumedFromSnapshot(false);
      } else {
        setForcedSubmitRetries((n) => n + 1);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [
    pendingForcedSubmit,
    currentTest,
    submitFromSnapshot,
    forcedSubmitRetries,
    MAX_FORCED_RETRIES,
  ]);

  const startTest = async (testPk: string | number) => {
    const testId = testPk?.toString();

    if (!testId || startingTestIds[testId]) return;

    const inProgressList = await listAllInProgressForUser(userId);

    if (inProgressList.length > 0) {
      const snap = inProgressList[0];

      if (snap.testId === testId) {
        showErrorModal(
          "Resume your test",
          "You already have this test in progress. Please reload the page to continue."
        );
      } else {
        showErrorModal(
          "Another test in progress",
          "You have another test in progress. Please complete or submit it before starting a new one."
        );
      }

      return;
    }

    const alreadyDone = await getCompletedTest(testId, userId);

    if (alreadyDone) {
      showErrorModal(
        "Already submitted",
        alreadyDone.syncStatus === "pending"
          ? "You completed this test offline. It will sync when you’re back online."
          : "You’ve already submitted this test."
      );
      await refreshCompleted();
      return;
    }

    const pendingWork = queue.some(
      (q) =>
        (q.state === "queued" || q.state === "uploading") &&
        q.payload?.mode === "online"
    );

    if (pendingWork || (isSyncing && isOnline)) {
      showErrorModal(
        "Sync in progress",
        "Please wait until your previous submission finishes syncing before starting another test."
      );
      return;
    }

    const existingQueued = await getSubmissionForTest(testId);

    if (existingQueued && existingQueued.state !== "confirmed") {
      showErrorModal(
        "Pending submission",
        "A previous attempt for this test is still pending sync. Please wait until it completes."
      );
      return;
    }

    lockStart(testId);

    const test = availableTests.find((t) => t.pk?.toString() === testId);

    if (!test) {
      unlockStart(testId);
      return;
    }

    if ((test.mode || "online") === "online" && !navigator.onLine) {
      showErrorModal("Offline", "This test is online-only. Please connect first.");
      unlockStart(testId);
      return;
    }

    await handleStartTestProceed(testId, test);
  };

  const handleStartTestProceed = async (testId: string, test: any) => {
    const mode: "online" | "offline" = (test.mode || "online") as any;

    if (mode === "offline") {
      const items = Array.isArray(test.items)
        ? test.items
        : test.items
          ? Object.values(test.items)
          : [];

      const mapped = mapQuestions(items);
      const startedIso = new Date().toISOString();
      const duration = parseInt(test.duration) * 60 || 1800;
      const csid = crypto.randomUUID();

      setClientSubmissionId(csid);
      setCurrentMode("offline");
      setQuestions(mapped);
      setCurrentTest(testId);
      resetSecurityState();
      setCurrentQuestion(0);
      setAnswers({});
      setInitialTime(duration);
      setTimeLeft(duration);
      setStartTime(startedIso);
      setOnlineAttemptId(null);
      setOnlineExpiresAtMs(null);
      setClockSkewMs(0);
      setPendingForcedSubmit(false);
      setForcedSubmitReason(null);
      setForcedSubmitRetries(0);
      setResumedFromSnapshot(false);

      await saveInProgress({
        testId,
        userId,
        clientSubmissionId: csid,
        mode: "offline",
        questions: mapped,
        answers: {},
        startedAt: startedIso,
        initialTimeSeconds: duration,
        timeLeftSeconds: duration,
        suspiciousActivity: 0,
        lastSavedAt: startedIso,
        testTitle: test.title,
      });

      unlockStart(testId);
      return;
    }

    if (!navigator.onLine) {
      showErrorModal("Offline", "This online test requires an internet connection.");
      unlockStart(testId);
      return;
    }

    try {
      const res = await fetchWithTimeout("/api/student/cbt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Token": sessionToken!,
          "X-Device-Id": deviceId,
        },
        body: JSON.stringify({
          action: "start",
          currentTest: testId,
        }),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        showErrorModal(
          "Cannot start test",
          parseApiErrorMessage(txt || `HTTP ${res.status}`)
        );
        unlockStart(testId);
        return;
      }

      const data = await res.json();
      const mapped = mapQuestions(data.questions || []);
      const duration = Number(data.duration_seconds || 1800);
      const expiresMs =
        typeof data.expires_at_ms === "number" ? data.expires_at_ms : null;
      const skew =
        typeof data.server_now_ms === "number"
          ? Date.now() - data.server_now_ms
          : 0;
      const csid = crypto.randomUUID();

      setClientSubmissionId(csid);
      setCurrentMode("online");
      setQuestions(mapped);
      setCurrentTest(testId);
      resetSecurityState();
      setCurrentQuestion(0);
      setAnswers({});
      setInitialTime(duration);
      setTimeLeft(duration);
      setStartTime(data.started_at);
      setOnlineAttemptId(Number(data.attempt_id ?? null));
      setOnlineExpiresAtMs(expiresMs);
      setClockSkewMs(skew);
      setPendingForcedSubmit(false);
      setForcedSubmitReason(null);
      setForcedSubmitRetries(0);
      setResumedFromSnapshot(false);

      await saveInProgress({
        testId,
        userId,
        clientSubmissionId: csid,
        mode: "online",
        questions: mapped,
        answers: {},
        startedAt: data.started_at,
        initialTimeSeconds: duration,
        timeLeftSeconds: duration,
        suspiciousActivity: 0,
        lastSavedAt: new Date().toISOString(),
        onlineAttemptId: Number(data.attempt_id ?? null),
        onlineExpiresAtMs: expiresMs,
        clockSkewMs: skew,
        testTitle: test.title,
      });
    } catch {
      showErrorModal("Network error", "Unable to start online test. Please try again.");
    } finally {
      unlockStart(testId);
    }
  };

  useEffect(() => {
    if (!currentTest || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (isOnlineMode && !navigator.onLine) {
            setPendingForcedSubmit(true);
            setForcedSubmitReason("time_elapsed");
          } else {
            submitTestRef.current?.();
          }

          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentTest, timeLeft, isOnlineMode]);

  useEffect(() => {
    if (!currentTest || !clientSubmissionId || !startTime) return;

    const timer = setTimeout(() => {
      saveInProgress({
        testId: currentTest,
        userId,
        clientSubmissionId,
        mode: currentMode,
        questions,
        answers,
        startedAt: startTime,
        initialTimeSeconds: initialTime,
        timeLeftSeconds: timeLeft,
        suspiciousActivity,
        lastSavedAt: new Date().toISOString(),
        onlineAttemptId,
        onlineExpiresAtMs,
        clockSkewMs,
      }).catch(() => { });
    }, 250);

    return () => clearTimeout(timer);
  }, [
    currentTest,
    clientSubmissionId,
    currentMode,
    questions,
    answers,
    startTime,
    initialTime,
    timeLeft,
    suspiciousActivity,
    onlineAttemptId,
    onlineExpiresAtMs,
    clockSkewMs,
  ]);

  useEffect(() => {
    if (!currentTest || !clientSubmissionId || !startTime) return;

    saveInProgress({
      testId: currentTest,
      userId,
      clientSubmissionId,
      mode: currentMode,
      questions,
      answers,
      startedAt: startTime,
      initialTimeSeconds: initialTime,
      timeLeftSeconds: timeLeft,
      suspiciousActivity,
      lastSavedAt: new Date().toISOString(),
      onlineAttemptId,
      onlineExpiresAtMs,
      clockSkewMs,
    }).catch(() => { });
  }, [answers]);

  useEffect(() => {
    if (!currentTest) return;

    const handler = (e: BeforeUnloadEvent) => {
      if (clientSubmissionId && startTime) {
        saveInProgress({
          testId: currentTest,
          userId,
          clientSubmissionId,
          mode: currentMode,
          questions,
          answers,
          startedAt: startTime,
          initialTimeSeconds: initialTime,
          timeLeftSeconds: timeLeft,
          suspiciousActivity,
          lastSavedAt: new Date().toISOString(),
          onlineAttemptId,
          onlineExpiresAtMs,
          clockSkewMs,
        }).catch(() => { });
      }

      e.preventDefault();
      e.returnValue =
        "You have a test in progress. Leaving this page will not pause the timer.";
      return e.returnValue;
    };

    window.addEventListener("beforeunload", handler);

    return () => window.removeEventListener("beforeunload", handler);
  }, [
    currentTest,
    clientSubmissionId,
    currentMode,
    questions,
    answers,
    startTime,
    initialTime,
    timeLeft,
    suspiciousActivity,
    onlineAttemptId,
    onlineExpiresAtMs,
    clockSkewMs,
  ]);

  useEffect(() => {
    if (!currentTest || !isSecureMode) return;

    const onVisibilityChange = () => {
      if (document.hidden) bumpSuspicious("visibility");
    };

    const onBlur = () => bumpSuspicious("blur");

    const onKey = (e: KeyboardEvent) => {
      if (!e.ctrlKey) return;

      const k = e.key.toLowerCase();

      if (["c", "v", "p", "a", "s"].includes(k)) {
        e.preventDefault();
        bumpSuspicious(`ctrl+${k}`);
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", onBlur);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("keydown", onKey);
    };
  }, [currentTest, isSecureMode, bumpSuspicious]);

  useEffect(() => {
    if (!currentTest || currentMode !== "online" || !sessionToken) return;

    let cancelled = false;

    const tick = async () => {
      const hb = await checkHeartbeat(currentTest, sessionToken, deviceId);

      if (cancelled || !hb) return;

      setClockSkewMs(Date.now() - hb.server_now_ms);

      if (hb.status === "expired") {
        showErrorModal(
          "Time’s up",
          "The server reports this attempt has expired. Submitting now."
        );

        if (!navigator.onLine) {
          setPendingForcedSubmit(true);
          setForcedSubmitReason("time_elapsed");
        } else {
          submitTestRef.current?.();
        }
      } else if (hb.status === "submitted") {
        await clearInProgress(currentTest, userId);
        handleResetToList();
        await refreshCompleted();
      }
    };

    const id = setInterval(tick, 30_000);

    tick();

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [currentTest, currentMode, sessionToken, deviceId, refreshCompleted]);

  const getTerminalSubmissionNotice = (code?: string, detail?: string) => {
    switch (code) {
      case "TIME_ELAPSED":
        return {
          type: "warning" as const,
          title: "Time elapsed",
          message:
            detail ||
            "The time for this test has expired. The attempt has been closed.",
        };

      case "ATTEMPT_ALREADY_SUBMITTED":
      case "DUPLICATE_REPLAY":
        return {
          type: "success" as const,
          title: "Test already submitted",
          message:
            detail ||
            "This test has already been submitted. You can continue with another available test.",
        };

      case "NO_ACTIVE_ATTEMPT":
      case "ATTEMPT_NOT_FOUND":
      case "ATTEMPT_NOT_STARTED":
        return {
          type: "warning" as const,
          title: "Attempt no longer active",
          message:
            detail ||
            "This test attempt no longer exists or is no longer active. You can start another available test.",
        };

      case "TEST_NOT_FOUND":
        return {
          type: "error" as const,
          title: "Test not found",
          message:
            detail ||
            "This test could not be found. Please select another available test.",
        };

      default:
        return {
          type: "warning" as const,
          title: "Attempt closed",
          message:
            detail ||
            "This attempt has been closed. You can continue with another available test.",
        };
    }
  };

  const closeAttemptAndReturnToList = useCallback(async ({
    code,
    detail,
    data,
    testId,
    clientSubmissionId,
    testTitle,
    markCompleted,
  }: {
    code?: string;
    detail?: string;
    data?: any;
    testId: string;
    clientSubmissionId?: string | null;
    testTitle?: string;
    markCompleted: boolean;
  }) => {
    if (markCompleted && clientSubmissionId) {
      await markTestCompleted({
        testId,
        userId,
        clientSubmissionId,
        completedAt: Date.now(),
        syncStatus: "confirmed",
        serverAttemptId: data?.attempt_id ?? data?.existing_attempt_id ?? null,
        serverResponse: data || {},
        testTitle,
        localScore: typeof data?.score === "number" ? data.score : null,
        localTotalPoints:
          typeof data?.total_points === "number" ? data.total_points : null,
      });
    }

    await clearInProgress(testId, userId);
    await refreshCompleted();

    setListNotice(getTerminalSubmissionNotice(code, detail));

    setTestResults((p) => ({
      ...p,
      [testId]: {
        ...(data || {}),
        title: testTitle,
      },
    }));

    setAttemptsPage(1);

    handleResetToList();
    fetchData(true);
  }, [userId, refreshCompleted]);

  const submitTest = useCallback(async () => {
    if (!currentTest || isSubmitting) return;

    setIsSubmitting(true);

    try {
      let csid = clientSubmissionId;

      if (!csid) {
        const snap = await loadInProgress(currentTest, userId);
        csid = snap?.clientSubmissionId ?? crypto.randomUUID();
        setClientSubmissionId(csid);
      }

      const test = availableTests.find(
        (t) => t.pk?.toString() === currentTest
      );

      const mode: "online" | "offline" = (test?.mode || currentMode) as any;

      const submitAnswers = buildAnswersPayload(questions, answers);

      const payload = {
        client_submission_id: csid,
        currentTest,
        answers: submitAnswers,
        started_at: startTime,
        duration_seconds: initialTime - timeLeft,
        suspicious_activity: suspiciousActivity || 0,
        attempt_id: onlineAttemptId,
        expires_at_ms: onlineExpiresAtMs,
        mode,
        auto_submitted: autoSubmitTriggeredRef.current || pendingForcedSubmit,
        forced_submit_reason: forcedSubmitReason,
      };

      if (mode === "online") {
        if (!navigator.onLine) {
          setPendingForcedSubmit(true);
          setForcedSubmitReason(
            forcedSubmitReason ||
            (timeLeft <= 0 ? "time_elapsed" : "suspicious_threshold")
          );
          return;
        }

        const res = await fetchWithTimeout(
          `/api/student/cbt`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Session-Token": sessionToken!,
              "X-Device-Id": deviceId,
              "X-Idempotency-Key": csid,
            },
            body: JSON.stringify(payload),
          },
          90_000
        );

        let data: any = {};
        let rawText = "";

        try {
          rawText = await res.text();
          data = rawText ? JSON.parse(rawText) : {};
        } catch {
          data = {};
        }

        if (!data?.code && typeof data?.error === "string") {
          const match = data.error.match(/\{.*\}/);

          if (match?.[0]) {
            try {
              const inner = JSON.parse(match[0]);
              data = {
                ...inner,
                _proxyWrappedError: data.error,
              };
            } catch {
              /* ignore */
            }
          }
        }

        const code = data?.code;
        const detail =
          data?.detail ||
          data?.details ||
          data?.message ||
          data?.error ||
          rawText ||
          `HTTP ${res.status}`;

        if (!res.ok) {
          if (TERMINAL_SUBMISSION_CODES.has(code)) {
            const shouldMarkCompleted =
              code === "TIME_ELAPSED" ||
              code === "ATTEMPT_ALREADY_SUBMITTED" ||
              code === "DUPLICATE_REPLAY";

            await closeAttemptAndReturnToList({
              code,
              detail,
              data,
              testId: currentTest,
              clientSubmissionId: csid,
              testTitle: test?.title,
              markCompleted: shouldMarkCompleted,
            });

            return;
          }

          const lowered = String(detail || "").toLowerCase();

          const looksTerminal =
            lowered.includes("time elapsed") ||
            lowered.includes("time has elapsed") ||
            lowered.includes("time is up") ||
            lowered.includes("already expired") ||
            lowered.includes("already submitted") ||
            lowered.includes("no active attempt") ||
            lowered.includes("attempt not found") ||
            lowered.includes("not started");

          if (looksTerminal && res.status >= 400 && res.status < 500) {
            const inferredCode = lowered.includes("time")
              ? "TIME_ELAPSED"
              : lowered.includes("already")
                ? "ATTEMPT_ALREADY_SUBMITTED"
                : lowered.includes("not found")
                  ? "ATTEMPT_NOT_FOUND"
                  : "NO_ACTIVE_ATTEMPT";

            const shouldMarkCompleted =
              inferredCode === "TIME_ELAPSED" ||
              inferredCode === "ATTEMPT_ALREADY_SUBMITTED";

            await closeAttemptAndReturnToList({
              code: inferredCode,
              detail,
              data: {
                ...data,
                code: inferredCode,
                detail,
                _inferredFromText: true,
              },
              testId: currentTest,
              clientSubmissionId: csid,
              testTitle: test?.title,
              markCompleted: shouldMarkCompleted,
            });

            return;
          }

          showErrorModal("Submission failed", detail);
          return;
        }

        await markTestCompleted({
          testId: currentTest,
          userId,
          clientSubmissionId: csid,
          completedAt: Date.now(),
          syncStatus: "confirmed",
          serverAttemptId: data?.attempt_id ?? null,
          serverResponse: data,
          testTitle: test?.title,
          localScore: typeof data?.score === "number" ? data.score : null,
          localTotalPoints:
            typeof data?.total_points === "number" ? data.total_points : null,
        });

        await clearInProgress(currentTest, userId);
        await refreshCompleted();

        setTestResults((p) => ({
          ...p,
          [currentTest]: {
            ...data,
            title: test?.title,
          },
        }));

        setListNotice({
          type: "success",
          title: "Test submitted",
          message: "Your test has been submitted successfully.",
        });

        setAttemptsPage(1);

        handleResetToList();

        fetchData(true);

        return;
      }

      await enqueueSubmission({
        clientSubmissionId: csid,
        testId: currentTest,
        userId,
        payload,
        testTitle: test?.title,
      });

      await markTestCompleted({
        testId: currentTest,
        userId,
        clientSubmissionId: csid,
        completedAt: Date.now(),
        syncStatus: "pending",
        testTitle: test?.title,
        localScore: null,
        localTotalPoints: null,
      });

      if (typeof BroadcastChannel !== "undefined") {
        const channel = new BroadcastChannel("cbt-queue");
        channel.postMessage({ type: "completed-changed" });
        channel.close();
      }

      await clearInProgress(currentTest, userId);
      await refreshCompleted();

      setListNotice({
        type: "success",
        title: "Test saved",
        message:
          "Your offline test has been saved and will sync automatically when internet is available.",
      });

      handleResetToList();

      if (navigator.onLine) {
        triggerSync();
      }
    } catch (err: any) {
      const test = availableTests.find(
        (t) => t.pk?.toString() === currentTest
      );

      const mode: "online" | "offline" = (test?.mode || currentMode) as any;

      if (mode === "offline") {
        setListNotice({
          type: "success",
          title: "Test saved",
          message:
            "Your offline test has been saved locally and will sync automatically.",
        });

        handleResetToList();
        await refreshCompleted();
      } else if (!navigator.onLine) {
        setPendingForcedSubmit(true);
        setForcedSubmitReason(
          forcedSubmitReason ||
          (timeLeft <= 0 ? "time_elapsed" : "suspicious_threshold")
        );
      } else if (err?.isTimeout && currentTest) {
        // The request timed out on the client, but the server may have already
        // recorded the submission. Query the heartbeat to find out.
        try {
          const hb = await checkHeartbeat(currentTest, sessionToken!, deviceId);

          if (hb && (hb.status === "submitted" || hb.status === "graded")) {
            // Server confirms it went through — mark locally and move on.
            let csid = clientSubmissionId;
            if (!csid) {
              const snap = await loadInProgress(currentTest, userId);
              csid = snap?.clientSubmissionId ?? null;
            }

            await markTestCompleted({
              testId: currentTest,
              userId,
              clientSubmissionId: csid ?? crypto.randomUUID(),
              completedAt: Date.now(),
              syncStatus: "confirmed",
              serverAttemptId: hb.attempt_id ?? null,
              serverResponse: { status: hb.status, _recoveredAfterTimeout: true },
              testTitle: test?.title,
              localScore: null,
              localTotalPoints: null,
            });

            await clearInProgress(currentTest, userId);
            await refreshCompleted();

            setListNotice({
              type: "success",
              title: "Test submitted",
              message: "Your test was submitted successfully.",
            });

            setAttemptsPage(1);
            handleResetToList();
            fetchData(true);
            return;
          }
        } catch {
          /* heartbeat itself failed — fall through to the error modal */
        }

        // Heartbeat didn't confirm — let the student retry.
        showErrorModal(
          "Network error",
          "The request timed out. Please check your connection and try submitting again. " +
          "If this keeps happening your answers are saved and will sync automatically."
        );
      } else {
        showErrorModal(
          "Network error",
          err?.message ||
          "Unable to submit this online test right now. Please reconnect and try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [
    currentTest,
    currentMode,
    clientSubmissionId,
    isSubmitting,
    availableTests,
    questions,
    answers,
    startTime,
    initialTime,
    timeLeft,
    suspiciousActivity,
    onlineAttemptId,
    onlineExpiresAtMs,
    sessionToken,
    deviceId,
    userId,
    triggerSync,
    refreshCompleted,
    pendingForcedSubmit,
    forcedSubmitReason,
    closeAttemptAndReturnToList,
  ]);

  useEffect(() => {
    submitTestRef.current = submitTest;
  }, [submitTest]);

  useEffect(() => {
    if (!testCompleted) return;

    setAutoReloadSeconds(120);

    const timer = setInterval(() => {
      setAutoReloadSeconds((s) => {
        if (s == null) return s;

        if (s <= 1) {
          clearInterval(timer);

          setTimeout(() => {
            handleResetToList();
            refreshCompleted().catch(() => { });
            fetchData(true);
          }, 0);

          return null;
        }

        return s - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testCompleted]);

  const handleResetToList = () => {
    setCurrentTest(null);
    setClientSubmissionId(null);
    setTestCompleted(false);
    setQuestions([]);
    setAnswers({});
    setCurrentQuestion(0);
    setTimeLeft(1800);
    setInitialTime(0);
    setStartTime(null);
    setSuspiciousActivity(0);
    setIsSecureMode(false);
    setOnlineAttemptId(null);
    setOnlineExpiresAtMs(null);
    setClockSkewMs(0);
    setPendingForcedSubmit(false);
    setForcedSubmitReason(null);
    setForcedSubmitRetries(0);
    setShowSubmitConfirm(false);
    setResumedFromSnapshot(false);

    suspiciousRef.current = 0;
    warningOpenRef.current = false;
    lastSuspiciousAtRef.current = 0;
    autoSubmitTriggeredRef.current = false;
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const handleAnswerChangeLocal = (value: any) => {
    if (isAwaitingForcedSubmit) return;

    setAnswers((p) => ({
      ...p,
      [currentQuestion]: value,
    }));
  };

  const previousQuestion = () => {
    if (isAwaitingForcedSubmit) return;
    setCurrentQuestion((p) => Math.max(0, p - 1));
  };

  const nextQuestion = () => {
    if (isAwaitingForcedSubmit) return;
    setCurrentQuestion((p) => Math.min(questions.length - 1, p + 1));
  };

  const confirmRefreshDeviceId = () => {
    localStorage.removeItem(`cbt:${userId}:cbtDeviceId`);
    window.location.reload();
  };

  const queueByTestId = useMemo(() => {
    const map: Record<string, (typeof queue)[number]> = {};

    for (const item of queue) {
      map[item.testId] = item;
    }

    return map;
  }, [queue]);

  function TruncatedDescription({
    text,
    limit = 200,
    title = "Description",
  }: any) {
    const [open, setOpen] = useState(false);
    const value = (text ?? "").trim();

    if (!value) return null;

    const isLong = value.length > limit;
    const shortText = isLong ? value.slice(0, limit).trimEnd() + "…" : value;

    return (
      <>
        <CardDescription className="leading-relaxed">
          {shortText}{" "}
          {isLong && (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="ml-1 inline p-0 align-baseline text-xs font-medium text-[#EF7B55] underline underline-offset-2 hover:text-[#F79771]"
            >
              Read more
            </button>
          )}
        </CardDescription>

        {isLong && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription className="pt-2 leading-relaxed">
                  {value}
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        )}
      </>
    );
  }

  const ErrorModal = (
    <Dialog open={errorModalOpen} onOpenChange={setErrorModalOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{errorModalTitle}</DialogTitle>
          <DialogDescription>{errorModalMessage}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => setErrorModalOpen(false)}>OK</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  if (!hasLoadedOnce && (status === "loading" || loading)) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (status !== "authenticated") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogIn className="h-5 w-5" />
            Sign in required
          </CardTitle>
          <CardDescription>
            Please sign in to access your CBT tests.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (testCompleted) {
    return (
      <div className="space-y-6">
        {ErrorModal}

        <Card className="border-emerald-200 bg-emerald-50/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-700">
              <CheckCircle className="h-5 w-5" />
              Test submitted
            </CardTitle>
            <CardDescription>
              Your test has been saved. If it was completed offline, it will sync
              automatically when internet is available.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {autoReloadSeconds !== null && (
              <p className="text-sm text-muted-foreground">
                This page will return to the test list in {autoReloadSeconds} seconds.
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              <Button onClick={handleResetToList}>Back to tests</Button>
              <Button
                variant="outline"
                disabled={refreshing}
                onClick={() => {
                  refreshCompleted().catch(() => { });
                  fetchData(true);
                }}
              >
                {refreshing && <Spinner size="sm" className="mr-2" />}
                Refresh now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentTest) {
    const test = availableTests.find((t) => t.pk?.toString() === currentTest);
    const currentQ = questions[currentQuestion];
    const progress =
      questions.length > 0
        ? ((currentQuestion + 1) / questions.length) * 100
        : 0;

    return (
      <div className="space-y-6">
        {isAwaitingForcedSubmit && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="max-w-md w-full">
              <CardHeader className="text-center">
                <div className="mx-auto mb-3">
                  <Clock className="h-12 w-12 text-amber-500" />
                </div>

                <CardTitle>
                  {forcedSubmitReason === "time_elapsed"
                    ? "Time’s up — finalizing submission"
                    : "Test ended — finalizing submission"}
                </CardTitle>

                <CardDescription className="mt-2">
                  {forcedSubmitReason === "time_elapsed" ? (
                    <>Your test time has ended.</>
                  ) : (
                    <>Your test has ended due to repeated security alerts.</>
                  )}{" "}
                  The submission will go through automatically once your
                  connection returns.
                  <span className="block mt-2 text-xs text-slate-500">
                    Please don’t close this tab.
                  </span>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-sm">
                  <Spinner size="sm" />
                  <span className="text-slate-600">
                    {isOnline
                      ? "Reconnected — submitting…"
                      : "Waiting for connection…"}
                  </span>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={recoverForcedSubmitState}
                >
                  Check status / retry now
                </Button>

                {forcedSubmitRetries >= MAX_FORCED_RETRIES && (
                  <>
                    <p className="mt-2 text-xs text-amber-700">
                      The server isn’t accepting this submission. Your attempt
                      may already have been recorded as expired. You can return
                      to the test list; your local record will be marked so this
                      screen does not keep trapping you here.
                    </p>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={async () => {
                        if (currentTest && clientSubmissionId) {
                          await markTestCompleted({
                            testId: currentTest,
                            userId,
                            clientSubmissionId,
                            completedAt: Date.now(),
                            syncStatus: "failed",
                            testTitle: availableTests.find(
                              (t) => t.pk?.toString() === currentTest
                            )?.title,
                            localScore: null,
                            localTotalPoints: null,
                          });

                          await clearInProgress(currentTest, userId);
                          await refreshCompleted();
                        }

                        setPendingForcedSubmit(false);
                        setForcedSubmitReason(null);
                        setForcedSubmitRetries(0);
                        handleResetToList();
                      }}
                    >
                      Return to test list
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {ErrorModal}

        <Dialog
          open={showSecurityWarning}
          onOpenChange={setShowSecurityWarning}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Security Warning
              </DialogTitle>
              <DialogDescription>
                Leaving the test window or using restricted shortcuts may submit
                the test automatically.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                onClick={() => {
                  warningOpenRef.current = false;
                  setShowSecurityWarning(false);
                }}
              >
                I Understand
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showSubmitConfirm} onOpenChange={setShowSubmitConfirm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Submit your test?</DialogTitle>
              <DialogDescription>
                You have answered {Object.keys(answers).length} of{" "}
                {questions.length} questions.
                {Object.keys(answers).length < questions.length && (
                  <span className="block mt-1 text-amber-700">
                    {questions.length - Object.keys(answers).length} unanswered
                    questions will be marked incorrect.
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowSubmitConfirm(false)}
              >
                Keep Working
              </Button>

              <Button
                className="bg-[#EF7B55] text-white hover:bg-[#F79771]"
                onClick={() => {
                  setShowSubmitConfirm(false);
                  submitTest();
                }}
              >
                Yes, Submit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className={isAero 
          ? "relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-[#e26d47] p-6 text-white shadow-lg flex items-center sm:flex-row flex-col gap-4 justify-between"
          : "flex items-center sm:flex-row flex-col gap-4 justify-between"
        }>
          <div className="flex sm:self-auto self-start items-start sm:items-center flex-col sm:flex-row gap-2">
            <h1 className={isAero 
              ? "text-2xl font-black bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent" 
              : "text-3xl font-bold"
            }>
              {test?.title}
            </h1>
            <p className={isAero ? "text-orange-200/90 text-sm font-semibold" : "text-muted-foreground"}>
              Question {currentQuestion + 1} of {questions.length}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row self-start sm:self-auto items-start sm:items-center gap-4">
            {isSecureMode && (
              <div className={isAero ? "flex items-center gap-2 text-red-200" : "flex items-center gap-2 text-red-600"}>
                <Shield className="h-4 w-4" />
                <span className="text-sm font-bold">Secure Mode</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Clock className={isAero ? "h-4 w-4 text-orange-200" : "h-4 w-4"} />
              <span
                className={`font-mono ${timeLeft < 300 ? "text-red-450 font-bold" : (isAero ? "text-white font-bold" : "")}`}
              >
                {formatTime(timeLeft)}
              </span>
            </div>

            <Badge className={isAero ? "bg-[#EF7B55] hover:bg-[#e26d47] text-white font-bold rounded-full border-none" : ""} variant="outline">
              {Math.round(progress)}% Complete
            </Badge>
          </div>
        </div>

        <Progress value={progress} className="h-2" />

        <div className="grid gap-6 lg:grid-cols-4">
          <div className="lg:col-span-3 space-y-4">
            {resumedFromSnapshot && (
              <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-900">
                <RotateCcw className="h-3.5 w-3.5" />
                <span>
                  You resumed an in-progress test. Your previous answers and
                  remaining time have been restored.
                </span>
              </div>
            )}

            {isOnlineMode && !isOnline && !isAwaitingForcedSubmit && (
              <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>
                  You’re offline. Keep working — your test will submit
                  automatically when your connection returns.
                </span>
              </div>
            )}

            <Card className={isAero
              ? "border border-[#EF7B55]/30 bg-white/60 backdrop-blur-md rounded-2xl shadow-sm"
              : "border-[#EF7B55]/40 bg-gradient-to-r from-[#EF7B55]/5 to-transparent"
            }>
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span className="text-slate-700">
                    <span className="font-semibold">
                      {Object.keys(answers).length}
                    </span>
                    <span className="text-slate-500">
                      {" "}
                      of {questions.length} answered
                    </span>
                  </span>
                </div>

                <Button
                  onClick={() => setShowSubmitConfirm(true)}
                  disabled={isSubmitting || isAwaitingForcedSubmit}
                  className="h-10 px-5 bg-[#EF7B55] text-white hover:bg-[#F79771] disabled:bg-slate-200 disabled:text-slate-400 font-bold rounded-xl shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Submitting…
                    </>
                  ) : (
                    <>Submit Test</>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className={isAero 
              ? "bg-white/60 backdrop-blur-md border border-slate-200/40 shadow-sm rounded-2xl" 
              : ""
            }>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Question {currentQuestion + 1}</CardTitle>
                  <Badge variant="secondary">{currentQ?.points} points</Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <p className="text-lg">{currentQ?.question}</p>

                {currentQ?.image && (
                  <div className="relative w-full max-w-xl h-64 border border-slate-200/40 rounded-xl overflow-hidden bg-muted/30 flex items-center justify-center p-2">
                    <img
                      src={currentQ.image}
                      alt="Question illustration"
                      className="max-h-full max-w-full object-contain rounded-lg"
                    />
                  </div>
                )}

                {currentQ?.type === "single-choice" ||
                  currentQ?.type === "true-false" ? (
                  <RadioGroup
                    value={answers[currentQuestion] || ""}
                    onValueChange={(val) =>
                      !isAwaitingForcedSubmit &&
                      setAnswers((p) => ({
                        ...p,
                        [currentQuestion]: val,
                      }))
                    }
                    disabled={isAwaitingForcedSubmit}
                  >
                    {currentQ.options?.map((option: any) => (
                      <div
                        key={option.id}
                        className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50"
                      >
                        <RadioGroupItem
                          value={option.id.toString()}
                          id={`option-${option.id}`}
                          disabled={isAwaitingForcedSubmit}
                        />
                        <Label
                          htmlFor={`option-${option.id}`}
                          className="flex-1 cursor-pointer"
                        >
                          {option.text}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                ) : currentQ?.type === "short-answer" ? (
                  <div className="space-y-2">
                    <Label htmlFor="short-answer">Your Answer:</Label>
                    <Input
                      id="short-answer"
                      value={answers[currentQuestion] || ""}
                      onChange={(e) => handleAnswerChangeLocal(e.target.value)}
                      placeholder="Type your answer here..."
                      disabled={isAwaitingForcedSubmit}
                    />
                  </div>
                ) : currentQ?.type === "essay" ? (
                  <div className="space-y-2">
                    <Label htmlFor="essay-answer">Your Essay:</Label>
                    <Textarea
                      id="essay-answer"
                      value={answers[currentQuestion] || ""}
                      onChange={(e) => handleAnswerChangeLocal(e.target.value)}
                      placeholder="Write your detailed answer here..."
                      rows={6}
                      disabled={isAwaitingForcedSubmit}
                    />
                  </div>
                ) : null}

                <div className="flex justify-between pt-2 border-t">
                  <Button
                    variant="outline"
                    onClick={previousQuestion}
                    disabled={currentQuestion === 0 || isAwaitingForcedSubmit}
                    className="h-10 bg-transparent border border-[#EF7B55] text-[#EF7B55] hover:bg-[#F79771] hover:text-white disabled:opacity-50"
                  >
                    Previous
                  </Button>

                  <Button
                    onClick={nextQuestion}
                    disabled={
                      currentQuestion === questions.length - 1 ||
                      isAwaitingForcedSubmit
                    }
                    className="h-10 bg-transparent border border-[#EF7B55] text-[#EF7B55] hover:bg-[#F79771] hover:text-white disabled:opacity-50"
                  >
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Question Navigator</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((_, index) => (
                    <Button
                      key={index}
                      variant={
                        currentQuestion === index
                          ? "default"
                          : answers[index]
                            ? "secondary"
                            : "outline"
                      }
                      size="sm"
                      onClick={() => setCurrentQuestion(index)}
                      disabled={isAwaitingForcedSubmit}
                    >
                      {index + 1}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Test Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Questions:</span>
                  <span>{questions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Answered:</span>
                  <span>{Object.keys(answers).length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Remaining:</span>
                  <span>{questions.length - Object.keys(answers).length}</span>
                </div>

                {isSecureMode && (
                  <div className="flex justify-between text-red-600">
                    <span>Security Alerts:</span>
                    <span>{suspiciousActivity}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const safeNum = (v: any) => {
    const n = typeof v === "string" ? parseFloat(v) : Number(v);
    return isNaN(n) ? 0 : n;
  };

  const percentFromAttempt = (attempt: Attempt) => {
    const score = safeNum(attempt.score);
    const total = safeNum(attempt.test?.total_marks ?? 0);

    return total <= 0 ? 0 : Math.round((score / total) * 100);
  };

  const sortedAttempts = [...(attempts.results || [])].sort((a, b) => {
    if (pastSortBy === "score") return safeNum(b.score) - safeNum(a.score);

    if (pastSortBy === "result") {
      return (b.status || "").localeCompare(a.status || "");
    }

    const da = new Date(
      a.submitted_at || a.started_at || a.created_at || 0
    ).getTime();
    const db = new Date(
      b.submitted_at || b.started_at || b.created_at || 0
    ).getTime();

    return db - da;
  });

  const totalPages = Math.max(
    1,
    Math.ceil((availableTests?.length || 0) / testsPerPage)
  );

  const pastCurrentPage = attempts.page || attemptsPage || 1;
  const pastTotalPages = Math.max(
    1,
    Math.ceil((attempts.count || 0) / (attempts.page_size || 20))
  );

  const hasTests = Array.isArray(availableTests) && availableTests.length > 0;

  const hasPendingSyncWork = queue.some(
    (q) =>
      (q.state === "queued" || q.state === "uploading") &&
      q.payload?.mode === "online"
  );
  const isSyncBlocked = hasPendingSyncWork;

  return (
    <div className="space-y-6">
      {ErrorModal}

      <Dialog
        open={showRefreshDeviceDialog}
        onOpenChange={setShowRefreshDeviceDialog}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Refresh device ID?</DialogTitle>
            <DialogDescription>
              This will reset the local CBT device identifier on this browser.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRefreshDeviceDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={confirmRefreshDeviceId}>Refresh</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">CBT Tests</h1>
          <p className="text-muted-foreground">
            Complete available tests and review your past attempts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={isOnline ? "default" : "destructive"}>
            {isOnline ? "Online" : "Offline"}
          </Badge>

          {isSyncing && (
            <Badge variant="secondary">
              <Spinner size="sm" className="mr-1" />
              Syncing
            </Badge>
          )}

          <Button
            variant="outline"
            disabled={refreshing}
            onClick={() => {
              refreshCompleted().catch(() => { });
              fetchData(true);
              triggerSync();
            }}
          >
            {refreshing ? (
              <Spinner size="sm" className="mr-2" />
            ) : (
              <RotateCcw className="mr-2 h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {listNotice && (
        <div
          className={`rounded-lg border p-3 text-sm ${listNotice.type === "success"
            ? "border-emerald-200 bg-emerald-50 text-emerald-900"
            : listNotice.type === "error"
              ? "border-red-200 bg-red-50 text-red-900"
              : "border-amber-200 bg-amber-50 text-amber-900"
            }`}
        >
          <div className="font-semibold">{listNotice.title}</div>
          <div className="mt-0.5">{listNotice.message}</div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          {error}
        </div>
      )}

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "available" | "past")}
      >
        <TabsList className={isAero
          ? "flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white/20 p-1.5 border border-slate-200/50 rounded-2xl w-full mb-6"
          : "flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-[#f797711a] p-1.5 border border-slate-200/60 rounded-xl w-full mb-6"
        }>
          <TabsTrigger value="available" className={isAero
            ? "flex-1 w-full text-center data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white font-bold rounded-xl px-4 py-2.5 text-sm transition-all duration-300"
            : "flex-1 w-full text-center data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white font-semibold rounded-lg px-4 py-2 text-sm transition-all duration-200"
          }>Available Tests</TabsTrigger>
          <TabsTrigger value="past" className={isAero
            ? "flex-1 w-full text-center data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white font-bold rounded-xl px-4 py-2.5 text-sm transition-all duration-300"
            : "flex-1 w-full text-center data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white font-semibold rounded-lg px-4 py-2 text-sm transition-all duration-200"
          }>Past Attempts</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          {isSyncBlocked && (
            <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <Spinner size="sm" className="text-amber-700" />
              <div className="flex-1">
                <div className="font-medium">Syncing your previous submission</div>
                <div className="text-xs text-amber-800/80 mt-0.5">
                  New tests are temporarily unavailable until sync completes.
                  {hasPendingSyncWork &&
                    ` (${queue.filter(
                      (q) => q.state === "queued" || q.state === "uploading"
                    ).length
                    } pending)`}
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="border-amber-300 text-amber-900 hover:bg-amber-100"
                onClick={() => triggerSync()}
                disabled={isSyncing}
              >
                Sync now
              </Button>
            </div>
          )}

          {!hasTests ? (
            <Card>
              <CardHeader>
                <CardTitle>No tests available</CardTitle>
                <CardDescription>
                  There are no available tests right now.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {availableTests.slice((currentPage - 1) * testsPerPage, currentPage * testsPerPage).map((test: any) => {
                  const testId = test.pk?.toString();
                  const submission = queueByTestId[testId];
                  const completedRecord = completed[testId];

                  const isLocallyCompleted = !!completedRecord;

                  const syncStatus = completedRecord?.syncStatus;
                  const isPendingSync = syncStatus === "pending";
                  const isFailedSync = syncStatus === "failed";
                  const isConfirmedSync = syncStatus === "confirmed";

                  const res = testResults[testId];
                  const isStarting = !!startingTestIds[testId];

                  const isLocked = !hasAccess(test.course_id);

                  return (
                    <Card
                      key={test.pk}
                      className={cn(
                        "relative",
                        isAero
                          ? `group flex flex-col h-full overflow-hidden transition-all duration-300 bg-white/60 backdrop-blur-md rounded-2xl hover:translate-y-[-2px] ${isLocallyCompleted
                            ? "border-emerald-250 bg-emerald-50/30 opacity-90"
                            : "border-slate-200/50 hover:shadow-lg hover:border-[#EF7B55]/50 shadow-sm"
                            }`
                          : `group flex flex-col h-full overflow-hidden transition-all duration-200 ${isLocallyCompleted
                            ? "border-emerald-200 bg-emerald-50/30 opacity-90"
                            : "hover:shadow-lg hover:border-[#EF7B55]/40 border-slate-200"
                            }`
                      )}
                    >
                      {isLocked && (
                        <CourseLockedOverlay
                          message="Course access has expired."
                          subMessage="Please renew your subscription"
                        />
                      )}
                      <div
                        className={`h-1 w-full ${isPendingSync
                          ? "bg-amber-400"
                          : isConfirmedSync
                            ? "bg-emerald-400"
                            : isFailedSync
                              ? "bg-red-400"
                              : "bg-gradient-to-r from-[#EF7B55] to-[#F79771]"
                          }`}
                      />

                      <CardHeader className="space-y-3 pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-base font-semibold leading-snug line-clamp-2">
                            {test.title}
                          </CardTitle>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-medium uppercase tracking-wide ${(test.mode || "online") === "offline"
                              ? "border-emerald-200 text-emerald-700 bg-emerald-50"
                              : "border-blue-200 text-blue-700 bg-blue-50"
                              }`}
                          >
                            {test.mode || "online"}
                          </Badge>

                          <Badge
                            variant="outline"
                            className="text-[10px] uppercase tracking-wide border-slate-200 text-slate-600"
                          >
                            {test.difficulty}
                          </Badge>

                          {test.type === "exam" && (
                            <Badge
                              variant="outline"
                              className="text-[10px] text-red-600 border-red-200 bg-red-50"
                            >
                              <Shield className="h-2.5 w-2.5 mr-0.5" />
                              Secure
                            </Badge>
                          )}
                        </div>

                        <TruncatedDescription
                          text={test.description}
                          limit={140}
                          title={test.title}
                        />
                      </CardHeader>

                      <CardContent className="flex-1 flex flex-col gap-3 pt-0">
                        <div className={isAero
                          ? "grid grid-cols-2 gap-3 rounded-lg bg-white/40 border border-slate-200/30 p-3 text-xs"
                          : "grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3 text-xs"
                        }>
                          <div>
                            <div className="text-slate-500">Questions</div>
                            <div className="font-semibold text-slate-900">
                              {test.questions ||
                                (Array.isArray(test.items)
                                  ? test.items.length
                                  : "—")}
                            </div>
                          </div>

                          <div>
                            <div className="text-slate-500">Duration</div>
                            <div className="font-semibold text-slate-900">
                              {test.duration || "—"}
                            </div>
                          </div>
                        </div>

                        {res && !isLocallyCompleted && test.show_score !== false && (
                          <p className="text-sm text-green-600">
                            Previous Score: {res.score} / {res.total_points}
                          </p>
                        )}
                        {res && !isLocallyCompleted && test.show_score === false && (
                          <p className="text-sm text-green-600">
                            You have completed this test
                          </p>
                        )}

                        {test.requiresSubscription && !isSubscriber && (
                          <div className="rounded-md bg-yellow-50 border border-yellow-200 px-3 py-2 text-xs text-yellow-900">
                            <Shield className="h-3 w-3 inline mr-1" />
                            Requires active subscription.
                          </div>
                        )}

                        {isPendingSync && (
                          <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-900">
                            Completed offline. Will sync automatically.
                            {submission?.attempts && submission.attempts > 0 && (
                              <span className="block mt-1 opacity-75">
                                Sync attempt #{submission.attempts}
                              </span>
                            )}
                          </div>
                        )}

                        {isConfirmedSync && (
                          <div className="rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-900">
                            See your result in{" "}
                            <span className="font-medium">Past Attempts</span>.
                          </div>
                        )}

                        {isFailedSync && (
                          <div
                            className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-900"
                            title={submission?.lastError}
                          >
                            Contact admin. Ref:{" "}
                            <code className="font-mono">
                              {completedRecord?.clientSubmissionId.slice(0, 8)}
                            </code>
                          </div>
                        )}

                        <div className="mt-auto pt-2">
                          <Button
                            onClick={() => startTest(test.pk)}
                            className="w-full h-9 bg-[#EF7B55] text-white hover:bg-[#F79771] disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200"
                            disabled={
                              isStarting ||
                              isLocallyCompleted ||
                              isLocked ||
                              (isSyncBlocked && (test.mode ?? "online") !== "offline") ||
                              (test.type === "exam" &&
                                examAttempts >= maxAttempts) ||
                              (test.requiresSubscription && !isSubscriber)
                            }
                          >
                            {isStarting ? (
                              <>
                                <Spinner size="sm" className="mr-2" />
                                Starting…
                              </>
                            ) : isSyncBlocked ? (
                              <>
                                <Spinner size="sm" className="mr-2" />
                                Syncing previous submission…
                              </>
                            ) : isLocallyCompleted ? (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                {isPendingSync
                                  ? "Awaiting sync"
                                  : isConfirmedSync
                                    ? "Submitted"
                                    : "Sync failed"}
                              </>
                            ) : (
                              <>
                                <Play className="mr-2 h-4 w-4" />
                                {test.type === "exam"
                                  ? "Start Secure Exam"
                                  : "Start Test"}
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage((p) => Math.max(1, p - 1));
                        }}
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }).map((_, index) => {
                      const page = index + 1;

                      if (
                        page !== 1 &&
                        page !== totalPages &&
                        Math.abs(page - currentPage) > 1
                      ) {
                        if (page === 2 || page === totalPages - 1) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }

                        return null;
                      }

                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            isActive={page === currentPage}
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(page);
                            }}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage((p) => Math.min(totalPages, p + 1));
                        }}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Past Attempts</h2>
              <p className="text-sm text-muted-foreground">
                Review submitted CBT attempts.
              </p>
            </div>

            <Select
              value={pastSortBy}
              onValueChange={(value) =>
                setPastSortBy(value as "date" | "score" | "result")
              }
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="score">Score</SelectItem>
                <SelectItem value="result">Result</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {sortedAttempts.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No attempts yet</CardTitle>
                <CardDescription>
                  Completed tests will appear here after submission.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="space-y-3">
              {sortedAttempts.map((attempt) => {
                const percent = percentFromAttempt(attempt);

                return (
                  <Card key={attempt.id}>
                    <CardHeader className="pb-2">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <CardTitle className="text-base">
                            {attempt.test?.title || `Test #${attempt.test_id}`}
                          </CardTitle>
                          <CardDescription>
                            Submitted:{" "}
                            {attempt.submitted_at
                              ? new Date(attempt.submitted_at).toLocaleString()
                              : attempt.started_at
                                ? new Date(attempt.started_at).toLocaleString()
                                : "—"}
                          </CardDescription>
                        </div>

                        <Badge variant="outline">{attempt.status || "Attempt"}</Badge>
                      </div>
                    </CardHeader>

                      {attempt.test?.show_score !== false ? (
                        <CardContent className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Score</span>
                            <span className="font-semibold">
                              {attempt.score ?? "—"} /{" "}
                              {attempt.test?.total_marks ?? "—"}
                            </span>
                          </div>

                          <Progress value={percent} className="h-2" />

                          <p className="text-xs text-muted-foreground">
                            {percent}% score
                          </p>
                        </CardContent>
                      ) : (
                        <CardContent className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            You have completed this test
                          </p>
                        </CardContent>
                      )}
                  </Card>
                );
              })}
            </div>
          )}

          {pastTotalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setAttemptsPage((p) => Math.max(1, p - 1));
                    }}
                  />
                </PaginationItem>

                <PaginationItem>
                  <PaginationLink href="#" isActive>
                    {pastCurrentPage}
                  </PaginationLink>
                </PaginationItem>

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setAttemptsPage((p) => Math.min(pastTotalPages, p + 1));
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

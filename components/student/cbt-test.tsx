/* cbt-test.tsx — fully patched version with robust sync handling */
import { useState, useEffect, useMemo, useRef } from "react";
import localforage from "localforage";
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
  ArrowLeft,
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
import { v4 as uuidv4 } from "uuid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Workbox } from "workbox-window";

const MAX_RETRY_ATTEMPTS = 5; // 🔧 Max retry limit

/* ---------- localforage setup ---------- */
localforage.config({
  name: "studentCBTApp",
  storeName: "cbt_storage",
  description: "Offline storage for CBT tests",
});

const TESTS_KEY = "tests_cache_v1";
const ANSWERS_KEY = "answers_v1";
const PENDING_KEY = "pending_submissions_v1";
const RESULTS_KEY = "results_v1";

/* ---------- utility helpers ---------- */

async function fetchWithTimeout(
  url: string,
  options: any = {},
  timeout = 10000
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timer);
    return response;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

// 🔧 Enhanced pending entry type
type PendingEntry = {
  id: string;
  testPk: string | number;
  body: any;
  queuedAt: number;
  attempts?: number;
  lastAttemptAt?: number;
  maxAttemptsReached?: boolean;
};

/* --- cache / answers / queue helpers using localforage --- */

async function getTestsFromCache() {
  const t = (await localforage.getItem(TESTS_KEY)) || [];
  return Array.isArray(t) ? t : [];
}

async function saveTestsToCache(tests: any[]) {
  if (!Array.isArray(tests)) return;
  await localforage.setItem(TESTS_KEY, tests);
}

async function saveAnswersLocally(testPk: string | number, payload: any) {
  const all = (await localforage.getItem(ANSWERS_KEY)) || {};
  const obj = typeof all === "object" && !Array.isArray(all) ? all : {};
  obj[testPk] = payload;
  await localforage.setItem(ANSWERS_KEY, obj);
}

async function getSavedAnswers(testPk: string | number) {
  const all = (await localforage.getItem(ANSWERS_KEY)) || {};
  return (all && all[testPk]) || null;
}

async function deleteSavedAnswers(testPk: string | number) {
  const all = (await localforage.getItem(ANSWERS_KEY)) || {};
  if (all && all[testPk]) {
    delete all[testPk];
    await localforage.setItem(ANSWERS_KEY, all);
  }
}

async function saveResultLocally(testPk: string | number, data: any) {
  const all = (await localforage.getItem(RESULTS_KEY)) || {};
  const obj = typeof all === "object" && !Array.isArray(all) ? all : {};
  obj[testPk] = data;
  await localforage.setItem(RESULTS_KEY, obj);
}

// 🔧 Enhanced enqueue with validation and deduplication
async function enqueueSubmission(body: any) {
  // Validate body structure
  if (!body.currentTest || !body.answers) {
    console.error("[CBTTest] Invalid submission body:", body);
    return null;
  }

  const pending = (await localforage.getItem(PENDING_KEY)) || [];
  const arr = Array.isArray(pending) ? pending : [];
  
  // Check if already pending for same test
  const existing = arr.find(p => p.testPk?.toString() === body.currentTest?.toString());
  if (existing && !existing.maxAttemptsReached) {
    console.warn("[CBTTest] Submission already queued for test:", body.currentTest);
    return existing;
  }

  const entry: PendingEntry = {
    id: uuidv4(),
    testPk: body.currentTest,
    body: { ...body }, // deep copy
    queuedAt: Date.now(),
    attempts: 0,
    lastAttemptAt: 0,
    maxAttemptsReached: false,
  };
  
  // Remove existing failed entry for this test
  const cleanArr = arr.filter(p => p.testPk?.toString() !== body.currentTest?.toString() || p.maxAttemptsReached);
  cleanArr.push(entry);
  await localforage.setItem(PENDING_KEY, cleanArr);
  return entry;
}

async function getPendingSubmissions(): Promise<PendingEntry[]> {
  const pending = (await localforage.getItem(PENDING_KEY)) || [];
  return Array.isArray(pending) ? pending : [];
}

// 🔧 Enhanced delete with comprehensive cleanup
async function deletePendingSubmissionById(id: string, testPk?: string | number) {
  let pending = await getPendingSubmissions();
  let changed = false;
  
  // Remove by ID
  const newPending = pending.filter((p) => p.id !== id);
  changed = newPending.length !== pending.length;
  
  // Clean related data if testPk provided
  if (testPk && newPending.length !== pending.length) {
    await deleteSavedAnswers(testPk);
    // Remove any other corrupted entries for this test
    const furtherClean = newPending.filter(p => 
      !p.testPk?.toString() || p.testPk.toString() === testPk.toString() || !p.maxAttemptsReached
    );
    if (furtherClean.length !== newPending.length) {
      changed = true;
      pending = furtherClean;
    }
  }
  
  if (changed) {
    await localforage.setItem(PENDING_KEY, pending);
  }
  
  return pending;
}

/* ---------- CBTTest component ---------- */

export function CBTTest() {
  const { data: session, status } = useSession();
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [timeLeft, setTimeLeft] = useState(1800);
  const [initialTime, setInitialTime] = useState(0);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [testCompleted, setTestCompleted] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [isSecureMode, setIsSecureMode] = useState(false);
  const [suspiciousActivity, setSuspiciousActivity] = useState(0);
  const [showSecurityWarning, setShowSecurityWarning] = useState(false);
  const [isSubscriber, setIsSubscriber] = useState(true);
  const [examAttempts, setExamAttempts] = useState(0);
  const [maxAttempts] = useState(3);
  const [currentPage, setCurrentPage] = useState(1);
  const [testsPerPage] = useState(3);
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [pendingTestId, setPendingTestId] = useState<string | null>(null);
  const [availableTests, setAvailableTests] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showSyncMessage, setShowSyncMessage] = useState(false);
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);
  const [showAnswersModal, setShowAnswersModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [hasPendingSubmission, setHasPendingSubmission] = useState(false);
  const [pendingStartTestPk, setPendingStartTestPk] = useState<
    string | number | null
  >(null);
  const [syncProgress, setSyncProgress] = useState<{
    processed: number;
    total: number;
  } | null>(null);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [view, setView] = useState<"available" | "past">("available");

  const sessionToken = useMemo(
    () => session?.user?.sessionToken || null,
    [session?.user?.sessionToken]
  );
  const isProcessingRef = useRef(false);
  const syncIntervalRef = useRef<number | null>(null);
  const wbRef = useRef<Workbox | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);

  // 🔧 Enhanced startup migration and cleanup
  useEffect(() => {
    (async () => {
      let pending = (await localforage.getItem(PENDING_KEY)) || [];
      let changed = false;

      if (Array.isArray(pending)) {
        // Migrate old format and clean dead entries
        pending = pending.map((p: any) => {
          if (p.body?.test && !p.body.currentTest) {
            p.body.currentTest = p.body.test;
            delete p.body.test;
            changed = true;
          }
          if (!p.testPk && p.body?.currentTest) {
            p.testPk = p.body.currentTest;
            changed = true;
          }
          // Mark old entries with high attempts as dead
          if ((p.attempts || 0) >= MAX_RETRY_ATTEMPTS) {
            p.maxAttemptsReached = true;
            changed = true;
          }
          // Ensure valid structure
          if (!p.body?.answers || !p.body.currentTest) {
            p.maxAttemptsReached = true;
            changed = true;
          }
          return p;
        });

        // Clean dead and corrupted entries
        const liveOnly = pending.filter((p: any) => !p.maxAttemptsReached);
        if (liveOnly.length < pending.length) {
          await localforage.setItem(PENDING_KEY, liveOnly);
          changed = true;
          console.log("[CBTTest] Cleaned dead/corrupted pending submissions");
        }

        if (changed) {
          console.log("[CBTTest] Migrated and cleaned pending submissions");
        }

        // Update UI state based on live pending
        const livePending = liveOnly.filter((p: any) => !p.maxAttemptsReached);
        setHasPendingSubmission(livePending.length > 0);
        setShowSyncMessage(livePending.length > 0 && navigator.onLine);
      }
    })();
  }, []);

  /* ---------- Load results on mount ---------- */
  useEffect(() => {
    const loadResults = async () => {
      const all = (await localforage.getItem(RESULTS_KEY)) || {};
      setTestResults(typeof all === "object" ? all : {});
    };
    loadResults();
  }, []);

  /* ---------- Register Service Worker ---------- */
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const wb = new Workbox("/sw.js");
      wb.register();
      wbRef.current = wb;
    }
  }, []);

  /* ---------- Broadcast channel for sync updates ---------- */
  useEffect(() => {
    const channel = new BroadcastChannel("cbt-channel");
    channel.onmessage = async (e) => {
      if (e.data.type === "SYNC_SUCCESS") {
        setShowSyncSuccess(true);
        setTimeout(() => setShowSyncSuccess(false), 5000);
        // Trigger cleanup and UI refresh
        await processQueue();
      }
    };
    channelRef.current = channel;
    return () => channel.close();
  }, []);

  /* ---------- 🔧 Enhanced Sync queue processing ---------- */
  async function processQueue({
    onProgress,
  }: { onProgress?: (processed: number, total: number) => void } = {}) {
    if (!navigator.onLine || !sessionToken || isProcessingRef.current) {
      return false;
    }

    const pending = await getPendingSubmissions();
    const livePending = pending.filter(p => !p.maxAttemptsReached);
    
    if (livePending.length === 0) {
      // Clear UI state when no live pending
      setShowSyncMessage(false);
      setHasPendingSubmission(false);
      // Final cleanup of dead entries
      await localforage.setItem(PENDING_KEY, []);
      return true;
    }

    isProcessingRef.current = true;
    setIsSyncing(true);
    let success = false;

    try {
      const total = livePending.length;
      let processed = 0;
      setSyncProgress({ processed, total });
      setShowSyncMessage(true);

      for (let entry of livePending) {
        if (!navigator.onLine) break;

        const attempts = entry.attempts || 0;
        if (attempts >= MAX_RETRY_ATTEMPTS) {
          entry.maxAttemptsReached = true;
          continue;
        }

        const now = Date.now();
        const delay = Math.min(1000 * Math.pow(2, attempts), 30_000);
        if (entry.lastAttemptAt && now - entry.lastAttemptAt < delay) {
          continue;
        }

        entry.attempts = attempts + 1;
        entry.lastAttemptAt = now;

        // Persist state
        const allPending = await getPendingSubmissions();
        const idx = allPending.findIndex((p: any) => p.id === entry.id);
        if (idx >= 0) {
          allPending[idx] = entry;
          await localforage.setItem(PENDING_KEY, allPending);
        }

        try {
          const res = await fetchWithTimeout(
            "/api/student/cbt",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Session-Token": sessionToken,
              },
              body: JSON.stringify(entry.body),
            },
            15000
          );

          if (res.ok) {
            const data = await res.json();
            await saveResultLocally(entry.testPk, data);
            setTestResults((prev) => ({ ...prev, [entry.testPk]: data }));
            
            // Comprehensive cleanup
            await deletePendingSubmissionById(entry.id, entry.testPk);
            processed++;
            onProgress?.(processed, total);
            setSyncProgress({ processed, total });
            
            await new Promise((r) => setTimeout(r, 500));
            success = true;
          } else {
            console.error("[CBTTest] Server rejected:", await res.text());
            if (attempts + 1 >= MAX_RETRY_ATTEMPTS) {
              entry.maxAttemptsReached = true;
              await localforage.setItem(PENDING_KEY, allPending);
            }
            break;
          }
        } catch (err: any) {
          console.warn("[CBTTest] Network error:", err?.message);
        }
      }

      const remainingLive = (await getPendingSubmissions()).filter(p => !p.maxAttemptsReached).length;
      
      if (processed > 0 && remainingLive === 0) {
        setShowSyncMessage(false);
        setShowSyncSuccess(true);
        setTimeout(() => setShowSyncSuccess(false), 5000);
        // Final cleanup
        const finalPending = await getPendingSubmissions();
        if (finalPending.every(p => p.maxAttemptsReached)) {
          await localforage.setItem(PENDING_KEY, []);
        }
        setHasPendingSubmission(false);
        success = true;
      } else if (remainingLive > 0) {
        setShowSyncMessage(true);
      }

    } finally {
      isProcessingRef.current = false;
      setIsSyncing(false);
      setSyncProgress(null);
    }

    return success;
  }

  /* ---------- 🔧 Enhanced Network listeners ---------- */
  useEffect(() => {
    const onOnline = async () => {
      setIsOffline(false);
      // Clear stale sync UI first
      const pending = await getPendingSubmissions();
      const livePending = pending.filter(p => !p.maxAttemptsReached);
      
      if (livePending.length === 0) {
        setShowSyncMessage(false);
        setHasPendingSubmission(false);
        await localforage.setItem(PENDING_KEY, []);
      } else {
        setShowSyncMessage(true);
        const success = await processQueue();
        if (success) {
          setHasPendingSubmission(false);
        }
      }
      
      if (wbRef.current) {
        wbRef.current.messageSW({ type: "REPLAY_QUEUE" });
      }
    };

    const onOffline = () => {
      setIsOffline(true);
      setIsSyncing(false);
    };

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    // Periodic sync check
    syncIntervalRef.current = window.setInterval(async () => {
      const pending = await getPendingSubmissions();
      const livePending = pending.filter(p => !p.maxAttemptsReached);
      
      if (livePending.length === 0) {
        setShowSyncMessage(false);
        return;
      }
      
      if (navigator.onLine && sessionToken && !isProcessingRef.current) {
        await processQueue();
      }
    }, 10000);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
    };
  }, [sessionToken]);

  /* ---------- Fetch tests list and cache ---------- */
  useEffect(() => {
    if (status === "loading") return;
    if (status !== "authenticated" || !sessionToken) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    const fetchTests = async () => {
      setLoading(true);
      try {
        const res = await fetchWithTimeout(
          "/api/student/cbt",
          {
            headers: {
              "Content-Type": "application/json",
              "X-Session-Token": sessionToken,
            },
          },
          10000
        );

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            setError("Session expired");
            setLoading(false);
            return;
          }
          throw new Error(`HTTP ${res.status}`);
        }

        const d = await res.json();
        const tests = Array.isArray(d.tests) ? d.tests : [];
        await saveTestsToCache(tests);
        setAvailableTests(tests);
        setError(null);
      } catch (err: any) {
        const cached = await getTestsFromCache();
        setAvailableTests(cached);
        setIsOffline(true);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, [sessionToken, status]);

  /* ---------- start / resume logic ---------- */
  const startTest = async (testPk: string | number) => {
    const test = (availableTests || []).find(
      (t) => t.pk?.toString() === testPk?.toString()
    );
    if (!test) return;
    
    if (test.requiresSubscription && !isSubscriber) {
      setShowStartDialog(true);
      setPendingTestId(null);
      return;
    }
    if (test.type === "exam" && examAttempts >= maxAttempts) {
      setShowStartDialog(true);
      setPendingTestId(null);
      return;
    }

    // 🔧 Check for live pending submissions first
    const pending = await getPendingSubmissions();
    const livePending = pending.filter(p => !p.maxAttemptsReached);
    const hasLivePending = livePending.find(
      (p) => p.testPk?.toString() === testPk.toString()
    );
    const saved = await getSavedAnswers(testPk);

    if (hasLivePending) {
      setHasPendingSubmission(true);
      setShowResumeDialog(true);
      setPendingStartTestPk(testPk);
      return;
    } else if (saved) {
      setHasPendingSubmission(false);
      setShowResumeDialog(true);
      setPendingStartTestPk(testPk);
      return;
    }

    await handleStartTestProceed(testPk, false);
  };

  const handleStartTestProceed = async (
    testPk: string | number,
    clear = false
  ) => {
    const test = (availableTests || []).find(
      (t) => t.pk?.toString() === testPk?.toString()
    );
    if (!test) return;

    if (clear) {
      await deleteSavedAnswers(testPk);
      // Clean any pending for this test (keep only dead ones)
      let pending = await getPendingSubmissions();
      const cleanPending = pending.filter(p => 
        p.testPk?.toString() !== testPk.toString() || p.maxAttemptsReached
      );
      await localforage.setItem(PENDING_KEY, cleanPending);
    }

    const items = Array.isArray(test.items)
      ? test.items
      : test.items
      ? Object.values(test.items)
      : [];
    const mappedQuestions = items.map((item: any) => ({
      id: item.id,
      type: item.type === "scq" ? "single-choice" : item.type,
      question: item.question,
      options:
        item.type === "true-false"
          ? [
              { id: "true", text: "True" },
              { id: "false", text: "False" },
            ]
          : item.choices
          ? item.choices.map((c: any) => ({ id: c.id, text: c.text }))
          : [],
      points: item.points,
    }));

    const saved = await getSavedAnswers(testPk);

    setQuestions(mappedQuestions);
    setCurrentTest(testPk?.toString());
    setCurrentQuestion(0);
    setAnswers(saved?.answers || {});
    const duration = parseInt(test.duration) * 60 || 1800;
    setInitialTime(duration);
    setTimeLeft(saved?.duration || duration);
    setStartTime(saved?.startTime || new Date().toISOString());
    setSuspiciousActivity(saved?.suspiciousActivity || 0);
    setIsSecureMode(true);
    if (test.type === "exam") setExamAttempts((p) => p + 1);
  };

  const handleDialogConfirm = async (
    choice: "resume" | "restart" | "discard"
  ) => {
    setShowResumeDialog(false);
    if (!pendingStartTestPk) return;
    const clear = choice === "restart" || hasPendingSubmission;
    await handleStartTestProceed(pendingStartTestPk, clear);
    setPendingStartTestPk(null);
    setHasPendingSubmission(false);
  };

  /* ---------- saving progress periodically ---------- */
  useEffect(() => {
    if (!currentTest) return;
    saveAnswersLocally(currentTest, {
      answers,
      startTime,
      duration: initialTime - timeLeft,
      suspiciousActivity,
      savedAt: Date.now(),
    });
  }, [
    answers,
    timeLeft,
    suspiciousActivity,
    currentTest,
    startTime,
    initialTime,
  ]);

  /* ---------- timer ---------- */
  useEffect(() => {
    if (!currentTest || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          submitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [currentTest, timeLeft]);

  /* ---------- suspicious activity detection ---------- */
  useEffect(() => {
    if (!isSecureMode) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setSuspiciousActivity((prev) => prev + 1);
        setShowSecurityWarning(true);
      }
    };

    const handleBlur = () => {
      setSuspiciousActivity((prev) => prev + 1);
      setShowSecurityWarning(true);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.ctrlKey &&
        ["c", "v", "p", "a", "s"].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
        setSuspiciousActivity((prev) => prev + 1);
        setShowSecurityWarning(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSecureMode]);

  useEffect(() => {
    if (suspiciousActivity >= 3) {
      submitTest();
    }
  }, [suspiciousActivity]);

  /* ---------- 🔧 Enhanced submitTest ---------- */
  const submitTest = async () => {
    if (!currentTest) return;

    // Normalize answers
    const submitAnswers: any[] = [];
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const ans = answers[i];

      if (ans === undefined) continue;

      const entry: any = { question: q.id };

      if (Array.isArray(ans)) {
        entry.choices = ans.map((a) => (isNaN(Number(a)) ? a : Number(a)));
      } else if (q.type === "essay" || q.type === "short-answer") {
        entry.text = ans;
      } else {
        const numeric = Number(ans);
        entry.choice = isNaN(numeric) ? ans : numeric;
      }

      submitAnswers.push(entry);
    }

    const cleanedBody = {
      answers: submitAnswers,
      started_at: startTime,
      duration_seconds: initialTime - timeLeft,
      suspicious_activity: suspiciousActivity || 0,
      currentTest: currentTest,
    };

    console.log("[CBTTest] Submitting test payload:", cleanedBody);

    setTestCompleted(true);
    setIsSecureMode(false);
    setSuspiciousActivity(0);

    let data = null;
    try {
      if (navigator.onLine && sessionToken) {
        const res = await fetchWithTimeout(
          "/api/student/cbt",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Session-Token": sessionToken,
            },
            body: JSON.stringify(cleanedBody),
          },
          15000
        );

        if (res.ok) {
          data = await res.json();
          const test = availableTests.find(
            (t) => t.pk.toString() === currentTest
          );
          await saveResultLocally(currentTest, { ...data, title: test?.title });
          setTestResults((prev) => ({
            ...prev,
            [currentTest]: { ...data, title: test?.title },
          }));
          
          // Clean any stale pending entries
          let pending = await getPendingSubmissions();
          const cleanPending = pending.filter(p => 
            p.testPk?.toString() !== currentTest.toString()
          );
          await localforage.setItem(PENDING_KEY, cleanPending);
          
          await deleteSavedAnswers(currentTest);
        } else {
          throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        }
      } else {
        await enqueueSubmission(cleanedBody);
        setShowSyncMessage(true);
      }
    } catch (err: any) {
      console.warn("[CBTTest] Submit failed, queuing:", err);
      await enqueueSubmission(cleanedBody);
      setShowSyncMessage(true);
      setTimeout(() => processQueue(), 1000);
    }

    // Always cleanup local answers after submit attempt
    await deleteSavedAnswers(currentTest);
  };

  const handleResetToList = async () => {
    setCurrentTest(null);
    setTestCompleted(false);
    setQuestions([]);
    setAnswers({});
    setCurrentQuestion(0);
    setTimeLeft(1800);
    setInitialTime(0);
    setStartTime(null);
    setSuspiciousActivity(0);
    setIsSecureMode(false);
    setShowSyncMessage(false);
    processQueue();
    setIsOffline(!navigator.onLine);
  };

  /* ---------- 🔧 Enhanced manual retry ---------- */
  const handleManualRetry = async () => {
    const pending = await getPendingSubmissions();
    const livePending = pending.filter(p => !p.maxAttemptsReached);
    
    if (livePending.length === 0) {
      await localforage.setItem(PENDING_KEY, []);
      setShowSyncMessage(false);
      setHasPendingSubmission(false);
      return;
    }

    setShowSyncMessage(true);
    const success = await processQueue({
      onProgress: (processed, total) => setSyncProgress({ processed, total }),
    });
    
    if (success) {
      setHasPendingSubmission(false);
    }
  };

  /* ---------- 🔧 Enhanced dismiss with validation ---------- */
  const handleDismissSync = async () => {
    const pending = await getPendingSubmissions();
    const livePending = pending.filter(p => !p.maxAttemptsReached);
    
    if (livePending.length === 0) {
      await localforage.setItem(PENDING_KEY, []);
      setShowSyncMessage(false);
      setHasPendingSubmission(false);
    }
  };

  /* ---------- UI helpers ---------- */
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  function handleAnswerChangeLocal(value: any) {
    setAnswers((prev) => {
      const newAnswers = { ...prev, [currentQuestion]: value };
      if (currentTest) {
        saveAnswersLocally(currentTest, {
          answers: newAnswers,
          startTime,
          duration: initialTime - timeLeft,
          suspiciousActivity,
          savedAt: Date.now(),
        });
      }
      return newAnswers;
    });
  }

  function previousQuestion() {
    setCurrentQuestion((prev) => Math.max(0, prev - 1));
  }

  function nextQuestion() {
    setCurrentQuestion((prev) => Math.min(questions.length - 1, prev + 1));
  }

  // Initial cache hydration
  useEffect(() => {
    (async () => {
      const cached = await getTestsFromCache();
      if (cached?.length) setAvailableTests(cached);
    })();
  }, []);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="md" className="text-orange-500" />
      </div>
    );
  }

  if (status === "unauthenticated" || error === "Not authenticated") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Not Authenticated
            </CardTitle>
            <CardDescription className="text-center">
              Please log in to access the assessments.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button
              onClick={() => {
                window.location.href = "/login";
              }}
              className="flex items-center gap-2"
            >
              <LogIn className="h-4 w-4" />
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error === "Session expired") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Session Expired
            </CardTitle>
            <CardDescription className="text-center">
              Your session has expired. Please log in again to continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button
              onClick={() => (window.location.href = "/login")}
              className="flex items-center gap-2"
            >
              <LogIn className="h-4 w-4" />
              Log In Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ---------- Completed view ---------- */
  if (testCompleted) {
    const Icon = CheckCircle;
    const iconColor = "text-green-500";
    const result = testResults[currentTest ?? ""] ?? null;

    return (
      <div className="space-y-6">
        {isOffline && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">You are working offline.</p>
          </div>
        )}

        {showSyncSuccess && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg transition-all duration-700 ease-in-out opacity-100">
            <p className="text-sm font-medium text-green-800">
              All progress synced successfully!
            </p>
          </div>
        )}

        {showSyncMessage && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Syncing submissions in progress…
                </p>
                {syncProgress && (
                  <p className="text-xs text-muted-foreground">{`Processed ${syncProgress.processed} of ${syncProgress.total}`}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleManualRetry}
                  disabled={isSyncing}
                >
                  Retry Sync
                </Button>
                <Button size="sm" variant="outline" onClick={handleDismissSync}>
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        )}

        <div>
          <h1 className="text-3xl font-bold">Test Submitted</h1>
          <p className="text-muted-foreground">
            {result
              ? `Your result: ${result.result}`
              : "Your answers are saved locally and will sync automatically."}
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Icon className={`h-16 w-16 ${iconColor}`} />
            </div>
            <CardTitle className="text-2xl">Test Completed</CardTitle>
            <CardDescription>
              {result
                ? "Thank you for completing the test."
                : "Answers stored locally – they will upload when you regain connectivity."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {result && (
              <div className="text-center space-y-2">
                <p className="text-4xl font-bold">{result.percentage}%</p>
                <p className="text-xl">
                  Score: {result.score} / {result.total_points}
                </p>
                <p>Answered: {result.answered}</p>
                {result.pending_manual > 0 && (
                  <p>{result.pending_manual} questions pending manual review</p>
                )}
                <p>
                  {result.result === "PASS"
                    ? "Congratulations! You have passed the test."
                    : "Unfortunately, you did not pass. Better luck next time!"}
                </p>
              </div>
            )}

            {!result && (
              <div className="text-center">
                <Button
                  onClick={async () => {
                    const r = testResults[currentTest ?? ""] ?? null;
                    if (r)
                      setTestResults((prev) => ({
                        ...prev,
                        [currentTest ?? ""]: r,
                      }));
                  }}
                >
                  Check for Score
                </Button>
              </div>
            )}

            {suspiciousActivity > 0 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Security Notice</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  {suspiciousActivity} suspicious activities detected during the
                  test.
                </p>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <Button
                className="h-10 bg-transparent border border-[#EF7B55] text-[#EF7B55] hover:bg-[#F79771] hover:text-white"
                onClick={handleResetToList}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Take Next Test
              </Button>

              {result && (
                <Button
                  variant="outline"
                  onClick={() => setShowAnswersModal(true)}
                >
                  View Submitted Answers
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Dialog open={showAnswersModal} onOpenChange={setShowAnswersModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submitted Answers</DialogTitle>
              <DialogDescription>
                <pre className="mt-2 whitespace-pre-wrap text-sm">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                className="h-10 bg-transparent border border-[#EF7B55] text-[#EF7B55] hover:bg-[#F79771] hover:text-white"
                onClick={() => setShowAnswersModal(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  /* ---------- active test UI ---------- */
  if (currentTest) {
    const progress = questions.length
      ? ((currentQuestion + 1) / questions.length) * 100
      : 0;
    const currentQ = questions[currentQuestion];
    const test = (availableTests || []).find(
      (t) => t.pk?.toString() === currentTest?.toString()
    );

    return (
      <div className="space-y-6">
        {isOffline && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">You are working offline.</p>
          </div>
        )}

        <Dialog
          open={showSecurityWarning}
          onOpenChange={setShowSecurityWarning}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Security Warning
              </DialogTitle>
              <DialogDescription>
                Suspicious activity detected! Switching tabs, opening new tabs,
                or using keyboard shortcuts is not allowed during the test.
                {suspiciousActivity >= 2 &&
                  " Your test will be auto-submitted if this continues."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                className="h-10 bg-transparent border border-[#EF7B55] text-[#EF7B55] hover:bg-[#F79771] hover:text-white"
                onClick={() => setShowSecurityWarning(false)}
              >
                I Understand
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showResumeDialog} onOpenChange={setShowResumeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {hasPendingSubmission ? "Pending Submission" : "Resume Test"}
              </DialogTitle>
              <DialogDescription>
                {hasPendingSubmission
                  ? "Your previous attempt was submitted offline and is waiting to sync. Starting a new attempt will discard the previous one."
                  : "You have saved progress for this test. Would you like to resume or start over?"}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowResumeDialog(false);
                  setPendingStartTestPk(null);
                  setHasPendingSubmission(false);
                }}
                className="h-10 bg-transparent border border-[#EF7B55] text-[#EF7B55] hover:bg-[#F79771] hover:text-white"
              >
                Cancel
              </Button>
              {hasPendingSubmission ? (
                <Button
                  onClick={() => handleDialogConfirm("restart")}
                  className="h-10 bg-transparent border border-[#EF7B55] text-[#EF7B55] hover:bg-[#F79771] hover:text-white"
                >
                  Start New Attempt
                </Button>
              ) : (
                <>
                  <Button
                    onClick={() => handleDialogConfirm("resume")}
                    className="h-10 bg-transparent border border-[#EF7B55] text-[#EF7B55] hover:bg-[#F79771] hover:text-white"
                  >
                    Resume
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDialogConfirm("restart")}
                    className="h-10 bg-transparent border border-[#EF7B55] text-[#EF7B55] hover:bg-[#F79771] hover:text-white"
                  >
                    Restart
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Leave Test?</DialogTitle>
              <DialogDescription>
                Are you sure you want to leave? Your progress will be saved.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowLeaveDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setShowLeaveDialog(false);
                  handleResetToList();
                }}
              >
                Leave
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{test?.title}</h1>
            <p className="text-muted-foreground">
              Question {currentQuestion + 1} of {questions.length}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {isSecureMode && (
              <div className="flex items-center gap-2 text-red-600">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">Secure Mode</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span
                className={`font-mono ${timeLeft < 300 ? "text-red-600" : ""}`}
              >
                {formatTime(timeLeft)}
              </span>
            </div>
            <Badge variant="outline">{Math.round(progress)}% Complete</Badge>
          </div>
        </div>

        <Progress value={progress} className="h-2" />

        <div className="grid gap-6 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Question {currentQuestion + 1}</CardTitle>
                  <Badge variant="secondary">{currentQ?.points} points</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-lg">{currentQ?.question}</p>

                {currentQ?.type === "single-choice" ||
                currentQ?.type === "true-false" ? (
                  <RadioGroup
                    value={answers[currentQuestion] || ""}
                    onValueChange={(val) => {
                      setAnswers((prev) => {
                        const newAnswers = { ...prev, [currentQuestion]: val };
                        if (currentTest) {
                          saveAnswersLocally(currentTest, {
                            answers: newAnswers,
                            startTime,
                            duration: initialTime - timeLeft,
                            suspiciousActivity,
                            savedAt: Date.now(),
                          });
                        }
                        return newAnswers;
                      });
                    }}
                  >
                    {currentQ.options?.map((option: any) => (
                      <div
                        key={option.id}
                        className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50"
                      >
                        <RadioGroupItem
                          value={option.id.toString()}
                          id={`option-${option.id}`}
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
                      onChange={(e) => {
                        handleAnswerChangeLocal(e.target.value);
                      }}
                      placeholder="Type your answer here..."
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
                    />
                  </div>
                ) : null}

                <div className="flex justify-between">
                  <Button
                    className="h-10 bg-transparent border border-[#EF7B55] text-[#EF7B55] hover:bg-[#F79771] hover:text-white"
                    variant="outline"
                    onClick={previousQuestion}
                    disabled={currentQuestion === 0}
                  >
                    Previous
                  </Button>
                  <div className="flex gap-2">
                    {currentQuestion === questions.length - 1 ? (
                      <Button
                        className="h-10 bg-transparent border border-[#EF7B55] text-[#EF7B55] hover:bg-[#F79771] hover:text-white"
                        onClick={submitTest}
                      >
                        Submit Test
                      </Button>
                    ) : (
                      <Button
                        className="h-10 bg-transparent border border-[#EF7B55] text-[#EF7B55] hover:bg-[#F79771] hover:text-white"
                        onClick={nextQuestion}
                      >
                        Next
                      </Button>
                    )}
                    <Button
                      className="h-10 bg-transparent border border-[#EF7B55] text-[#EF7B55] hover:bg-[#F79771] hover:text-white"
                      variant="destructive"
                      onClick={() => {
                        setShowLeaveDialog(true);
                      }}
                    >
                      Leave Test
                    </Button>
                  </div>
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

  /* ---------- default tests list ---------- */
  const indexOfLastTest = currentPage * testsPerPage;
  const indexOfFirstTest = indexOfLastTest - testsPerPage;
  const currentTests = Array.isArray(availableTests)
    ? availableTests.slice(indexOfFirstTest, indexOfLastTest)
    : [];
  const totalPages = Math.max(
    1,
    Math.ceil((availableTests?.length || 0) / testsPerPage)
  );

  const pastTests = availableTests.filter(
    (test) => testResults[test.pk?.toString()]
  );

  return (
    <div className="space-y-6">
      {isOffline && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">You are working offline.</p>
        </div>
      )}

      {showSyncSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg transition-all duration-700 ease-in-out opacity-100">
          <p className="text-sm font-medium text-green-800">
            All progress synced successfully!
          </p>
        </div>
      )}

      {showSyncMessage && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800">
                Syncing submissions in progress…
              </p>
              {syncProgress && (
                <p className="text-xs text-muted-foreground">
                  Processed {syncProgress.processed} of {syncProgress.total}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleManualRetry}
                disabled={isSyncing}
                className="text-blue-700 border-blue-300 hover:bg-blue-100"
              >
                Retry Now
              </Button>
              <Button size="sm" variant="outline" onClick={handleDismissSync}>
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={showResumeDialog} onOpenChange={setShowResumeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {hasPendingSubmission ? "Pending Submission" : "Resume Test"}
            </DialogTitle>
            <DialogDescription>
              {hasPendingSubmission
                ? "Your previous attempt was submitted offline and is waiting to sync. Starting a new attempt will discard the previous one."
                : "You have saved progress for this test. Would you like to resume or start over?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowResumeDialog(false);
                setPendingStartTestPk(null);
                setHasPendingSubmission(false);
              }}
              className="h-10 bg-transparent border border-[#EF7B55] text-[#EF7B55] hover:bg-[#F79771] hover:text-white"
            >
              Cancel
            </Button>
            {hasPendingSubmission ? (
              <Button
                onClick={() => handleDialogConfirm("restart")}
                className="h-10 bg-transparent border border-[#EF7B55] text-[#EF7B55] hover:bg-[#F79771] hover:text-white"
              >
                Start New Attempt
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => handleDialogConfirm("resume")}
                  className="h-10 bg-transparent border border-[#EF7B55] text-[#EF7B55] hover:bg-[#F79771] hover:text-white"
                >
                  Resume
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDialogConfirm("restart")}
                  className="h-10 bg-transparent border border-[#EF7B55] text-[#EF7B55] hover:bg-[#F79771] hover:text-white"
                >
                  Restart
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              {pendingTestId
                ? `Start ${
                    availableTests.find(
                      (t) => t.pk.toString() === pendingTestId
                    )?.type === "exam"
                      ? "Secure Exam"
                      : "Quiz"
                  }`
                : "Cannot Start Test"}
            </DialogTitle>
            <DialogDescription>
              {pendingTestId
                ? `Are you ready to start the ${
                    availableTests.find(
                      (t) => t.pk.toString() === pendingTestId
                    )?.title
                  }? During the test, you must remain on this tab.`
                : examAttempts >= maxAttempts
                ? `You have reached the maximum number of attempts (${maxAttempts}) for this exam.`
                : "This exam requires an active subscription."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              className="h-10 bg-transparent border border-[#EF7B55] text-[#EF7B55] hover:bg-[#F79771] hover:text-white"
              variant="outline"
              onClick={() => {
                setShowStartDialog(false);
                setPendingTestId(null);
              }}
            >
              Cancel
            </Button>
            {pendingTestId && (
              <Button
                className="h-10 bg-transparent border border-[#EF7B55] text-[#EF7B55] hover:bg-[#F79771] hover:text-white"
                onClick={() => {
                  startTest(pendingTestId);
                  setShowStartDialog(false);
                  setPendingTestId(null);
                }}
              >
                Start Test
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div>
        <h1 className="text-3xl font-bold">TECHXAGON Assessments</h1>
        <p className="text-muted-foreground">
          Quizzes and secure semester exams with comprehensive feedback
        </p>
      </div>

      <Tabs defaultValue="available" className="space-y-4">
        <TabsList className="bg-[#f797712e] text-slate-700 flex flex-col lg:flex-row w-full gap-2 mb-14">
          <TabsTrigger
            value="available"
            className="bg-transparent w-full justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3"
          >
            Available Tests
          </TabsTrigger>
          <TabsTrigger
            value="past"
            className="bg-transparent w-full justify-center py-2 data-[state=active]:bg-[#EF7B55] data-[state=active]:text-white gap-3"
          >
            Past Attempts
          </TabsTrigger>
        </TabsList>
        <TabsContent value="available" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {currentTests.map((test) => {
              const res = testResults[test.pk?.toString()] ?? null;
              return (
                <Card
                  key={test.pk}
                  className="hover:shadow-lg transition-shadow flex flex-col h-full"
                >
                  <CardHeader>
                    <div className="sm:flex items-center justify-between">
                      <CardTitle className="text-lg">{test.title}</CardTitle>
                      <div className="flex gap-2">
                        <Badge
                          variant={
                            test.difficulty === "Beginner"
                              ? "default"
                              : test.difficulty === "Intermediate"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {test.difficulty}
                        </Badge>
                        {test.type === "exam" && (
                          <Badge
                            variant="outline"
                            className="text-red-600 border-red-200"
                          >
                            <Shield className="h-3 w-3 mr-1" />
                            Secure Exam
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardDescription>{test.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col gap-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>
                        {test.questions ||
                          (Array.isArray(test.items)
                            ? test.items.length
                            : "-")}{" "}
                        questions
                      </span>
                      <span>{test.duration}</span>
                    </div>

                    {res && (
                      <p className="text-sm text-green-600">
                        Previous Score: {res.score} / {res.total_points}
                      </p>
                    )}

                    {test.requiresSubscription && !isSubscriber && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          <Shield className="h-4 w-4 inline mr-1" />
                          Requires active subscription
                        </p>
                      </div>
                    )}

                    <div className="mt-auto">
                      <Button
                        onClick={() => startTest(test.pk)}
                        className="w-full h-10 bg-transparent border border-[#EF7B55] text-[#EF7B55] hover:bg-[#F79771] hover:text-white"
                        disabled={
                          (test.type === "exam" &&
                            examAttempts >= maxAttempts) ||
                          (test.requiresSubscription && !isSubscriber)
                        }
                      >
                        <Play className="mr-2 h-4 w-4" />
                        {test.type === "exam"
                          ? "Start Secure Exam"
                          : "Start Quiz"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                  className={
                    currentPage === 1 ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>
              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      isActive={currentPage === page}
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
              {totalPages > 5 && <PaginationEllipsis />}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages)
                      setCurrentPage(currentPage + 1);
                  }}
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </TabsContent>
        <TabsContent value="past" className="space-y-4">
          {pastTests.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No past attempts yet.
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pastTests.map((test) => {
                const res = testResults[test.pk.toString()];
                return (
                  <Card key={test.pk} className="flex flex-col h-full">
                    <CardHeader>
                      <CardTitle className="text-lg">{test.title}</CardTitle>
                      <CardDescription>{test.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-4">
                      <p className="text-sm text-green-600">
                        Score: {res.score} / {res.total_points} (
                        {res.percentage}%)
                      </p>
                      <p className="text-sm">Result: {res.result}</p>
                      <p className="text-sm">Answered: {res.answered}</p>
                      {res.pending_manual > 0 && (
                        <p className="text-sm">
                          {res.pending_manual} pending manual review
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
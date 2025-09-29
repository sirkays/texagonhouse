import { useState, useEffect, useMemo } from "react";
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

async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("studentDB", 4);
    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains("tests")) {
        db.createObjectStore("tests", { keyPath: "pk" });
      }
      if (!db.objectStoreNames.contains("answers")) {
        db.createObjectStore("answers", { keyPath: "testPk" });
      }
      if (!db.objectStoreNames.contains("pendingSubmissions")) {
        db.createObjectStore("pendingSubmissions", { keyPath: "testPk" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

async function cacheTests(tests) {
  if (!Array.isArray(tests)) {
    console.error("[CBTTest] cacheTests: Input is not an array:", tests);
    return;
  }
  console.log("[CBTTest] cacheTests: Raw input tests:", JSON.stringify(tests, null, 2));
  const validTests = tests
    .filter((test) => {
      const isValid =
        test &&
        typeof test === "object" &&
        (typeof test.pk === "number" || typeof test.pk === "string") &&
        typeof test.id === "string" &&
        typeof test.title === "string" &&
        Array.isArray(test.items) &&
        typeof test.duration === "string" &&
        typeof test.difficulty === "string" &&
        typeof test.description === "string" &&
        typeof test.type === "string" &&
        typeof test.requiresSubscription === "boolean";
      if (!isValid) {
        console.warn("[CBTTest] Invalid test filtered out:", test);
      }
      return isValid;
    })
    .map((test) => ({
      pk: test.pk,
      id: test.id,
      title: test.title,
      questions: Array.isArray(test.items) ? test.items : [],
      duration: test.duration || "30 minutes",
      difficulty: test.difficulty || "Unknown",
      description: test.description || "",
      type: test.type || "quiz",
      requiresSubscription: test.requiresSubscription || false,
      course: test.course || null,
      startsAt: test.startsAt || null,
      endsAt: test.endsAt || null,
      cachedAt: Date.now(),
    }));
  if (validTests.length === 0) {
    console.log("[CBTTest] cacheTests: No valid tests to cache");
    return;
  }
  try {
    const db = await openDB();
    const tx = db.transaction("tests", "readwrite");
    const store = tx.objectStore("tests");
    const existingKeysRequest = store.getAllKeys();
    const existingKeys = await new Promise((resolve, reject) => {
      existingKeysRequest.onsuccess = () => resolve(existingKeysRequest.result || []);
      existingKeysRequest.onerror = () => reject(existingKeysRequest.error);
    });
    const testsToStore = validTests.filter((test) => !existingKeys.includes(test.pk));
    if (testsToStore.length === 0) {
      console.log("[CBTTest] cacheTests: All tests already cached, skipping");
      await tx.done;
      return;
    }
    console.log("[CBTTest] cacheTests: Storing tests:", JSON.stringify(testsToStore, null, 2));
    await Promise.all(
      testsToStore.map((test) => {
        console.log("[CBTTest] Attempting to store test with pk:", test.pk, "Data:", JSON.stringify(test, null, 2));
        return store.put(test).catch((err) => {
          console.error("[CBTTest] Error caching test with pk:", test.pk, "Error:", err);
          throw err;
        });
      })
    );
    await tx.done;
    console.log("[CBTTest] Cached tests:", testsToStore.length);
  } catch (err) {
    console.error("[CBTTest] cacheTests: Failed to cache tests:", err);
  }
}

async function loadTestsFromCache() {
  const db = await openDB();
  const tx = db.transaction("tests", "readonly");
  const store = tx.objectStore("tests");
  const cachedTests = await store.getAll();
  await tx.done;
  console.log("[CBTTest] Loaded cached tests:", cachedTests?.length || 0);
  return Array.isArray(cachedTests) ? cachedTests : [];
}

async function saveAnswers(testPk, answers, startTime, initialTime, timeLeft, suspiciousActivity) {
  const db = await openDB();
  const tx = db.transaction("answers", "readwrite");
  const store = tx.objectStore("answers");
  await store.put({
    testPk,
    answers,
    startTime,
    duration: initialTime - timeLeft,
    suspiciousActivity,
  });
  await tx.done;
  console.log("[CBTTest] Saved answers for test:", testPk);
}

async function queueSubmission(body) {
  const db = await openDB();
  const tx = db.transaction("pendingSubmissions", "readwrite");
  const store = tx.objectStore("pendingSubmissions");
  await store.put({ testPk: body.currentTest, ...body, queuedAt: Date.now() });
  await tx.done;
  console.log("[CBTTest] Queued submission for test:", body.currentTest);
}

export function CBTTest() {
  const { data: session, status } = useSession();
  const [currentTest, setCurrentTest] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(1800);
  const [initialTime, setInitialTime] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [testCompleted, setTestCompleted] = useState(false);
  const [result, setResult] = useState(null);
  const [isSecureMode, setIsSecureMode] = useState(false);
  const [browserLocked, setBrowserLocked] = useState(false);
  const [suspiciousActivity, setSuspiciousActivity] = useState(0);
  const [showSecurityWarning, setShowSecurityWarning] = useState(false);
  const [isSubscriber, setIsSubscriber] = useState(true);
  const [examAttempts, setExamAttempts] = useState(0);
  const [maxAttempts] = useState(3);
  const [currentPage, setCurrentPage] = useState(1);
  const [testsPerPage] = useState(3);
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [pendingTestId, setPendingTestId] = useState(null);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [availableTests, setAvailableTests] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const sessionToken = useMemo(() => session?.user?.sessionToken || null, [session?.user?.sessionToken]);

  async function syncSubmissions() {
    if (!navigator.onLine || !sessionToken) return;
    const db = await openDB();
    const tx = db.transaction("pendingSubmissions", "readwrite");
    const store = tx.objectStore("pendingSubmissions");
    const pending = await store.getAll();
    const submissions = Array.isArray(pending) ? pending : [];
    if (submissions.length === 0) {
      console.log("[CBTTest] syncSubmissions: No pending submissions");
      setError(null);
      return;
    }
    let allSynced = true;
    for (const submission of submissions) {
      try {
        const res = await fetchWithTimeout(`/api/student/cbt`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Session-Token": sessionToken,
          },
          body: JSON.stringify(submission),
          timeout: 5000,
        });
        if (res.ok) {
          await store.delete(submission.testPk);
          console.log("[CBTTest] Synced submission for test:", submission.testPk);
          setError(null);
          setTestCompleted(true);
        } else {
          allSynced = false;
          console.error("[CBTTest] Sync failed for test:", submission.testPk, "Status:", res.status);
        }
      } catch (err) {
        allSynced = false;
        console.error("[CBTTest] Error syncing submission:", submission.testPk, err);
      }
    }
    await tx.done;
    if (allSynced && submissions.length > 0) {
      setShowSuccessModal(true);
    }
  }

  const handleSuccessModalClose = (refresh = false) => {
    setShowSuccessModal(false);
    if (refresh) {
      window.location.reload();
    } else {
      setCurrentTest(null);
      setTestCompleted(false);
      setResult(null);
      setQuestions([]);
      setAnswers({});
      setCurrentQuestion(0);
      setTimeLeft(1800);
      setInitialTime(0);
      setStartTime(null);
      setSuspiciousActivity(0);
      setIsSecureMode(false);
      setBrowserLocked(false);
    }
  };

  const handleLogout = async () => {
    console.log("[CBTTest] Initiating logout, sessionToken:", session?.user?.sessionToken);
    try {
      const response = await fetch("/api/auth/logout-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      console.log("[CBTTest] Logout API response status:", response.status);
      const data = await response.json();
      console.log("[CBTTest] Logout API response:", data);
      if (!response.ok) {
        console.error("[CBTTest] Logout failed:", data);
        throw new Error(data.error || "Logout failed");
      }
      document.cookie = "next-auth.session-token=; Max-Age=0; path=/; secure; SameSite=Strict";
      document.cookie = "next-auth.csrf-token=; Max-Age=0; path=/; secure; SameSite=Strict";
      console.log("[CBTTest] Logout successful, redirecting to /login");
      window.location.href = "/login";
    } catch (error) {
      console.error("[CBTTest] Logout error:", error);
      document.cookie = "next-auth.session-token=; Max-Age=0; path=/; secure; SameSite=Strict";
      document.cookie = "next-auth.csrf-token=; Max-Age=0; path=/; secure; SameSite=Strict";
      window.location.href = "/login";
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      syncSubmissions();
    };
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    syncSubmissions();
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [sessionToken]);

  useEffect(() => {
    if (status === "loading") {
      console.log("[CBTTest] Session still loading, skipping fetch");
      return;
    }
    if (status !== "authenticated" || !session?.user?.sessionToken) {
      console.log("[CBTTest] Not authenticated or no session token, status:", status, "sessionToken:", session?.user?.sessionToken);
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    const fetchTests = async () => {
      console.log("[CBTTest] Fetching tests with sessionToken:", session.user.sessionToken);
      setLoading(true);
      try {
        const response = await fetchWithTimeout("/api/student/cbt", {
          headers: {
            "Content-Type": "application/json",
            "X-Session-Token": session.user.sessionToken,
          },
          timeout: 5000,
        });
        if (!response.ok) {
          const errorText = await response.text();
          console.error("[CBTTest] Fetch failed with status:", response.status, "Response:", errorText);
          if (response.status === 401 || response.status === 403) {
            setError("Session expired");
          } else {
            throw new Error("Failed to fetch tests");
          }
        } else {
          const data = await response.json();
          console.log("[CBTTest] Fetch response data:", data);
          const tests = Array.isArray(data.tests) ? data.tests : [];
          await cacheTests(tests);
          setAvailableTests(tests);
          setError(null);
        }
      } catch (err) {
        console.error("[CBTTest] Fetch error:", err);
        const cachedTests = await loadTestsFromCache();
        setAvailableTests(cachedTests);
        setError("Offline mode: Showing cached tests");
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, [sessionToken, status]);

  useEffect(() => {
    if (currentTest) {
      const handleVisibilityChange = () => {
        if (document.hidden) {
          setSuspiciousActivity((prev) => {
            const newCount = prev + 1;
            saveAnswers(currentTest, answers, startTime, initialTime, timeLeft, newCount);
            return newCount;
          });
          setShowSecurityWarning(true);
          if (suspiciousActivity >= 2) {
            submitTest();
          }
        }
      };

      const handleBlur = () => {
        setSuspiciousActivity((prev) => {
          const newCount = prev + 1;
          saveAnswers(currentTest, answers, startTime, initialTime, timeLeft, newCount);
          return newCount;
        });
        setShowSecurityWarning(true);
        if (suspiciousActivity >= 2) {
          submitTest();
        }
      };

      const handleKeyDown = (e) => {
        if (
          e.key === "F12" ||
          (e.ctrlKey && (e.key === "u" || e.key === "i" || e.key === "s" || e.key === "t")) ||
          (e.ctrlKey && e.shiftKey && e.key === "I")
        ) {
          e.preventDefault();
          setSuspiciousActivity((prev) => {
            const newCount = prev + 1;
            saveAnswers(currentTest, answers, startTime, initialTime, timeLeft, newCount);
            return newCount;
          });
          setShowSecurityWarning(true);
        }
      };

      const handleContextMenu = (e) => {
        e.preventDefault();
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);
      window.addEventListener("blur", handleBlur);
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("contextmenu", handleContextMenu);

      return () => {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        window.removeEventListener("blur", handleBlur);
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("contextmenu", handleContextMenu);
      };
    }
  }, [currentTest, suspiciousActivity, answers, startTime, initialTime, timeLeft]);

  useEffect(() => {
    if (currentTest && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            submitTest();
            return 0;
          }
          saveAnswers(currentTest, answers, startTime, initialTime, prev - 1, suspiciousActivity);
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentTest, timeLeft, answers, startTime, initialTime, suspiciousActivity]);

  const startTest = async (testPk) => {
    const test = availableTests.find((t) => t.pk.toString() === testPk);
    if (test?.requiresSubscription && !isSubscriber) {
      setShowStartDialog(true);
      setPendingTestId(null);
      return;
    }
    if (test?.type === "exam" && examAttempts >= maxAttempts) {
      setShowStartDialog(true);
      setPendingTestId(null);
      return;
    }

    const mappedQuestions = test.items.map((item) => ({
      id: item.id,
      type: item.type === "scq" ? "multiple-choice" : item.type,
      question: item.question,
      options: item.type === "true-false" 
        ? [{ id: "true", text: "True" }, { id: "false", text: "False" }]
        : item.choices 
          ? item.choices.map((c) => ({ id: c.id, text: c.text })) 
          : [],
      points: item.points,
    }));

    const db = await openDB();
    const tx = db.transaction("answers", "readonly");
    const store = tx.objectStore("answers");
    const saved = await store.get(testPk);
    await tx.done;

    setQuestions(mappedQuestions);
    setCurrentTest(testPk);
    setCurrentQuestion(0);
    setAnswers(saved?.answers || {});
    setTestCompleted(false);
    const duration =
      test?.id === "semester-exam-math" ? 7200 :
      test?.id === "semester-exam-physics" ? 5400 :
      parseInt(test.duration) * 60 || 1800;
    setInitialTime(duration);
    setTimeLeft(saved?.duration || duration);
    setStartTime(saved?.startTime || new Date().toISOString());
    setSuspiciousActivity(saved?.suspiciousActivity || 0);
    setIsSecureMode(true);
    setBrowserLocked(true);
    if (test?.type === "exam") {
      setExamAttempts((prev) => prev + 1);
    }
  };

  const handleStartTest = (testPk) => {
    setPendingTestId(testPk);
    setShowStartDialog(true);
  };

  const confirmStartTest = () => {
    if (pendingTestId) {
      startTest(pendingTestId);
    }
    setShowStartDialog(false);
    setPendingTestId(null);
  };

  const handleLeaveTest = () => {
    setShowLeaveDialog(true);
  };

  const confirmLeaveTest = async () => {
    setShowLeaveDialog(false);
    setCurrentTest(null);
    setIsSecureMode(false);
    setBrowserLocked(false);
    setSuspiciousActivity(0);
    setCurrentQuestion(0);
    setAnswers({});
    setQuestions([]);
    if (currentTest) {
      await saveAnswers(currentTest, answers, startTime, initialTime, timeLeft, suspiciousActivity);
    }
  };

  const handleAnswerChange = async (value) => {
    setAnswers((prev) => {
      const newAnswers = { ...prev, [currentQuestion]: value };
      if (currentTest) {
        saveAnswers(currentTest, newAnswers, startTime, initialTime, timeLeft, suspiciousActivity);
      }
      return newAnswers;
    });
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const submitTest = async () => {
    const submitAnswers = [];
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const ans = answers[i];
      if (ans !== undefined) {
        if (q.type === "multiple-choice" || q.type === "true-false") {
          submitAnswers.push({ question: q.id, choice: ans });
        } else {
          submitAnswers.push({ question: q.id, text: ans });
        }
      }
    }

    const body = {
      answers: submitAnswers,
      started_at: startTime,
      duration_seconds: initialTime - timeLeft,
      suspicious_activity: suspiciousActivity,
      currentTest,
    };

    if (navigator.onLine && sessionToken) {
      try {
        const res = await fetchWithTimeout(`/api/student/cbt`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Session-Token": sessionToken,
          },
          body: JSON.stringify(body),
          timeout: 5000,
        });
        if (!res.ok) throw new Error("Failed to submit test");
        const data = await res.json();
        setResult(data);
        const db = await openDB();
        const tx = db.transaction("answers", "readwrite");
        await tx.objectStore("answers").delete(currentTest);
        await tx.done;
      } catch (err) {
        console.error("[CBTTest] Error submitting test:", err);
        await queueSubmission(body);
        setError("Offline mode: Test saved locally, will submit when online");
      }
    } else {
      await queueSubmission(body);
      setError("Offline mode: Test saved locally, will submit when online");
    }

    setTestCompleted(true);
    setIsSecureMode(false);
    setBrowserLocked(false);
    setSuspiciousActivity(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const indexOfLastTest = currentPage * testsPerPage;
  const indexOfFirstTest = indexOfLastTest - testsPerPage;
  const currentTests = Array.isArray(availableTests)
    ? availableTests.slice(indexOfFirstTest, indexOfLastTest)
    : [];
  const totalPages = Math.ceil((availableTests?.length || 0) / testsPerPage);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="md" className="text-black" />
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
            <Button onClick={handleLogout} className="flex items-center gap-2">
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
            <Button onClick={handleLogout} className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Log In Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              {error === "Session expired" ? "Session Expired" : "Error"}
            </CardTitle>
            <CardDescription className="text-center">
              {error === "Session expired"
                ? "Your session has expired. Please log in again to continue."
                : error === "Not authenticated"
                ? "Please log in to access the assessments."
                : error}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button
              onClick={() =>
                error === "Session expired" || error === "Not authenticated"
                  ? handleLogout()
                  : syncSubmissions()
              }
              className="flex items-center gap-2"
            >
              <LogIn className="h-4 w-4" />
              {error === "Session expired" || error === "Not authenticated"
                ? "Log In Again"
                : "Retry"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (testCompleted) {
    const Icon = CheckCircle;
    const iconColor = "text-green-500";

    return (
      <div className="space-y-6">
        {isOffline && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">Offline mode: Test saved locally, will submit when online.</p>
          </div>
        )}
        <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                Submission Successful
              </DialogTitle>
              <DialogDescription>
                Your test has been successfully submitted. You can refresh to load updated data or return to the test selection.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                className="h-10 bg-transparent border border-[#EF7B55] text-[#EF7B55] hover:bg-[#F79771] hover:text-white"
                variant="outline"
                onClick={() => handleSuccessModalClose(false)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                className="h-10 bg-transparent border border-[#EF7B55] text-[#EF7B55] hover:bg-[#F79771] hover:text-white"
                onClick={() => handleSuccessModalClose(true)}
              >
                OK
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <div>
          <h1 className="text-3xl font-bold">Test Submitted</h1>
          <p className="text-muted-foreground">
            {navigator.onLine && result
              ? `Your result: ${result.result}`
              : "Your test has been submitted. Results will be available soon."}
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Icon className={`h-16 w-16 ${iconColor}`} />
            </div>
            <CardTitle className="text-2xl">Test Completed</CardTitle>
            <CardDescription>
              {navigator.onLine
                ? "Thank you for completing the test."
                : "Test saved locally. It will be submitted when your connection is restored."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {result && navigator.onLine && (
              <div className="text-center space-y-2">
                <p className="text-4xl font-bold">{result.percentage}%</p>
                <p className="text-xl">Score: {result.score} / {result.total_points}</p>
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
            {suspiciousActivity > 0 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Security Notice</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  {suspiciousActivity} suspicious activities detected during the test.
                </p>
              </div>
            )}
            <div className="flex gap-4 justify-center">
              <Button
                className="h-10 bg-transparent border border-[#EF7B55] text-[#EF7B55] hover:bg-[#F79771] hover:text-white"
                onClick={() => setCurrentTest(null)}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Take Another Test
              </Button>
              {navigator.onLine && (
                <Button variant="outline">View Submitted Answers</Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentTest) {
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    const currentQ = questions[currentQuestion];
    const test = availableTests.find((t) => t.pk.toString() === currentTest);

    return (
      <div className="space-y-6">
        {isOffline && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">Offline mode: Answers will be saved locally.</p>
          </div>
        )}
        <Dialog open={showSecurityWarning} onOpenChange={setShowSecurityWarning}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Security Warning
              </DialogTitle>
              <DialogDescription>
                Suspicious activity detected! Switching tabs, opening new tabs, or using keyboard shortcuts is not allowed during the test.
                {suspiciousActivity >= 2 && " Your test will be auto-submitted if this continues."}
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

        <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Leave Test
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to leave? Your test progress will be saved locally.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                className="h-10 bg-transparent border border-[#EF7B55] text-[#EF7B55] hover:bg-[#F79771] hover:text-white"
                variant="outline"
                onClick={() => setShowLeaveDialog(false)}
              >
                Cancel
              </Button>
              <Button
                className="h-10 bg-transparent border border-[#EF7B55] text-[#EF7B55] hover:bg-[#F79771] hover:text-white"
                variant="destructive"
                onClick={confirmLeaveTest}
              >
                Leave Test
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
              <span className={`font-mono ${timeLeft < 300 ? "text-red-600" : ""}`}>
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

                {currentQ?.type === "multiple-choice" || currentQ?.type === "true-false" ? (
                  <RadioGroup
                    value={answers[currentQuestion] || ""}
                    onValueChange={handleAnswerChange}
                  >
                    {currentQ.options?.map((option) => (
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
                      onChange={(e) => handleAnswerChange(e.target.value)}
                      placeholder="Type your answer here..."
                    />
                  </div>
                ) : currentQ?.type === "essay" ? (
                  <div className="space-y-2">
                    <Label htmlFor="essay-answer">Your Essay:</Label>
                    <Textarea
                      id="essay-answer"
                      value={answers[currentQuestion] || ""}
                      onChange={(e) => handleAnswerChange(e.target.value)}
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
                      onClick={handleLeaveTest}
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

  return (
    <div className="space-y-6">
      {isOffline && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">Offline mode: Using cached tests. Answers will be saved locally.</p>
        </div>
      )}
      <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              {pendingTestId
                ? `Start ${
                    availableTests.find((t) => t.pk.toString() === pendingTestId)?.type === "exam"
                      ? "Secure Exam"
                      : "Quiz"
                  }`
                : "Cannot Start Test"}
            </DialogTitle>
            <DialogDescription>
              {pendingTestId
                ? `Are you ready to start the ${
                    availableTests.find((t) => t.pk.toString() === pendingTestId)?.title
                  }? During the test, you must remain on this tab. Switching tabs or opening new tabs will be flagged as suspicious activity.`
                : examAttempts >= maxAttempts
                ? `You have reached the maximum number of attempts (${maxAttempts}) for this exam.`
                : "This exam requires an active subscription. Please upgrade your plan to access semester exams."}
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
                onClick={confirmStartTest}
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {currentTests.map((test) => (
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
                <span>{test.questions} questions</span>
                <span>{test.duration}</span>
              </div>
              {test.requiresSubscription && !isSubscriber && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <Shield className="h-4 w-4 inline mr-1" />
                    Requires active subscription
                  </p>
                </div>
              )}
              {test.type === "exam" && (
                <div className="text-sm text-muted-foreground">
                  <p>
                    Attempts: {examAttempts}/{maxAttempts}
                  </p>
                </div>
              )}
              <div className="mt-auto">
                <Button
                  onClick={() => handleStartTest(test.pk.toString())}
                  className="w-full h-10 bg-transparent border border-[#EF7B55] text-[#EF7B55] hover:bg-[#F79771] hover:text-white"
                  disabled={
                    (test.type === "exam" && examAttempts >= maxAttempts) ||
                    (test.requiresSubscription && !isSubscriber)
                  }
                >
                  <Play className="mr-2 h-4 w-4" />
                  {test.type === "exam" ? "Start Secure Exam" : "Start Quiz"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) handlePageChange(currentPage - 1);
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
                    handlePageChange(page);
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
                if (currentPage < totalPages) handlePageChange(currentPage + 1);
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
    </div>
  );
}
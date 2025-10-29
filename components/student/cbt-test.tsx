/* cbt-test.tsx — online-only version WITH server-backed Past Attempts */
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

/* ---------- lightweight types for attempts ---------- */
type Attempt = {
  id: number;
  test_id: number;
  test?: {
    id: number;
    title: string;
    duration_minutes?: number;
    total_marks?: string | number;
    visibility?: string;
    start_at?: string | null;
    end_at?: string | null;
    course_id?: number;
    course_name?: string;
  };
  student?: number;
  started_at?: string | null;
  submitted_at?: string | null;
  score?: string | number | null;
  status?: "in_progress" | "submitted" | "graded" | string;
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

/* ---------- CBTTest component ---------- */

export function CBTTest() {
  const [autoReloadSeconds, setAutoReloadSeconds] = useState<number | null>(null);
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
  // Split the two modals to avoid type clashes:
  const [showSubmittedAnswersModal, setShowSubmittedAnswersModal] =
    useState(false); // for "Test Completed" view
  const [pastAttemptModalId, setPastAttemptModalId] = useState<string | null>(
    null
  ); // for "Past Attempts" details
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [pastSortBy, setPastSortBy] = useState<"date" | "score" | "result">(
    "date"
  );

  // NEW: attempts state (from backend)
  const [attempts, setAttempts] = useState<AttemptsPayload>({
    count: 0,
    page: 1,
    page_size: 20,
    results: [],
  });
  const [attemptsPage, setAttemptsPage] = useState(1);

  const sessionToken = useMemo(
    () => session?.user?.sessionToken || null,
    [session?.user?.sessionToken]
  );

  /* ---------- Fetch tests list + server attempts ---------- */
useEffect(() => {
  if (!testCompleted) return;
  setAutoReloadSeconds(120); // 2 minutes

  const interval = setInterval(() => {
    setAutoReloadSeconds((s) => {
      if (s == null) return s;
      if (s <= 1) {
        clearInterval(interval);
        if (typeof window !== "undefined") {
          window.location.reload(); // hard reload to fetch fresh tests & attempts
        }
        return 0;
      }
      return s - 1;
    });
  }, 1000);

  return () => clearInterval(interval);
}, [testCompleted]);


  useEffect(() => {
    if (status === "loading") return;
    if (status !== "authenticated" || !sessionToken) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const qs = new URLSearchParams();
        qs.set("page", String(attemptsPage));
        qs.set("page_size", "20");

        const res = await fetchWithTimeout(
          `/api/student/cbt?${qs.toString()}`,
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
        setAvailableTests(tests);
        setTestResults(d.results || {});

        if (d.attempts?.results) {
          setAttempts({
            count: Number(d.attempts.count ?? d.attempts.results.length ?? 0),
            page: Number(d.attempts.page ?? 1),
            page_size: Number(d.attempts.page_size ?? 20),
            results: Array.isArray(d.attempts.results)
              ? d.attempts.results
              : [],
          });
        } else {
          setAttempts({ count: 0, page: 1, page_size: 20, results: [] });
        }

        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sessionToken, status, attemptsPage]);

  /* ---------- start logic ---------- */
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

    await handleStartTestProceed(testPk);
  };

  const handleStartTestProceed = async (testPk: string | number) => {
    const test = (availableTests || []).find(
      (t) => t.pk?.toString() === testPk?.toString()
    );
    if (!test) return;

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

    setQuestions(mappedQuestions);
    setCurrentTest(testPk?.toString());
    setCurrentQuestion(0);
    setAnswers({});
    const duration = parseInt(test.duration) * 60 || 1800;
    setInitialTime(duration);
    setTimeLeft(duration);
    setStartTime(new Date().toISOString());
    setSuspiciousActivity(0);
    setIsSecureMode(true);
    if (test.type === "exam") setExamAttempts((p) => p + 1);
  };

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

  /* ---------- submitTest ---------- */
  const submitTest = async () => {
    if (!currentTest) return;

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
      } else if (q.type === "true-false") {
        const option = q.options.find(
          (opt: any) => opt.text.toLowerCase() === ans.toLowerCase()
        );
        entry.choice = option ? option.id : ans;
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

    try {
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
        const data = await res.json();
        const test = availableTests.find(
          (t) => t.pk.toString() === currentTest
        );
        setTestResults((prev) => ({
          ...prev,
          [currentTest!]: { ...data, title: test?.title },
        }));
        // refresh attempts list (resets to first page)
        setAttemptsPage(1);
      } else {
        console.error(`HTTP ${res.status}: ${await res.text()}`);
      }
    } catch (err: any) {
      console.error("[CBTTest] Submit failed:", err);
    }
  };

  const handleResetToList = () => {
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
  };

  /* ---------- UI helpers ---------- */
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  function handleAnswerChangeLocal(value: any) {
    setAnswers((prev) => ({ ...prev, [currentQuestion]: value }));
  }

  function previousQuestion() {
    setCurrentQuestion((prev) => Math.max(0, prev - 1));
  }

  function nextQuestion() {
    setCurrentQuestion((prev) => Math.min(questions.length - 1, prev + 1));
  }

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
        <div>
          <h1 className="text-3xl font-bold">Test Submitted</h1>
          <p className="text-muted-foreground">
            {result ? `Your result: ${result.result}` : ""}
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Icon className={`h-16 w-16 ${iconColor}`} />
            </div>
            <CardTitle className="text-2xl">Test Completed</CardTitle>
            <CardDescription>
              {result ? "Thank you for completing the test." : ""}
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
                  onClick={() => {
                    // hard reload ensures we return to the Available Tests tab and refetch everything
                    if (typeof window !== "undefined") window.location.reload();
                  }}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Go back to Test
                </Button>


              {result && (
                <Button
                  variant="outline"
                  onClick={() => setShowSubmittedAnswersModal(true)}
                >
                  View Submitted Answers
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Dialog
          open={showSubmittedAnswersModal}
          onOpenChange={setShowSubmittedAnswersModal}
        >
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
                onClick={() => setShowSubmittedAnswersModal(false)}
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

        <div className="flex items-center sm:flex-row flex-col gap-4 justify-between">
          <div className=" flex sm:self-auto self-start items-start sm:items-center flex-col sm:flex-row gap-2">
            <h1 className="text-3xl font-bold">{test?.title}</h1>
            <p className="text-muted-foreground">
              Question {currentQuestion + 1} of {questions.length}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row self-start sm:self-auto items-start sm:items-center gap-4">
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
                      setAnswers((prev) => ({
                        ...prev,
                        [currentQuestion]: val,
                      }));
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

  /* ---------- helpers for past attempts ---------- */
  const safeNum = (v: any) => {
    const n = typeof v === "string" ? parseFloat(v) : Number(v);
    return isNaN(n) ? 0 : n;
  };
  const percentFromAttempt = (a: Attempt) => {
    const score = safeNum(a.score);
    const total = safeNum(a.test?.total_marks ?? 0);
    if (total <= 0) return 0;
    return Math.round((score / total) * 100);
  };

  // Sort attempts by selected sort
  const sortedAttempts = [...(attempts.results || [])].sort((a, b) => {
    if (pastSortBy === "score") {
      return safeNum(b.score) - safeNum(a.score);
    } else if (pastSortBy === "result") {
      return (b.status || "").localeCompare(a.status || "");
    } else {
      // date: by submitted_at (fallback to started_at/created_at)
      const da =
        new Date(a.submitted_at || a.started_at || a.created_at || 0).getTime();
      const db =
        new Date(b.submitted_at || b.started_at || b.created_at || 0).getTime();
      return db - da;
    }
  });

  // Attempts pagination (server-backed)
  const pastTotalPages = Math.max(
    1,
    Math.ceil((attempts.count || 0) / (attempts.page_size || 20))
  );
  const pastCurrentPage = attempts.page || 1;

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

  const hasTests =
    Array.isArray(availableTests) && (availableTests?.length || 0) > 0;

  return (
    <div className="space-y-6">
      {/* ---------- Start dialog (unchanged behavior) ---------- */}
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

        {/* ---------- Available Tests ---------- */}
        <TabsContent value="available" className="space-y-4">
          {/* Loading state for tests fetch */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <Spinner size="md" className="text-orange-500" />
                <p className="text-sm text-muted-foreground">
                  Loading tests…
                </p>
              </div>
            </div>
          ) : !hasTests ? (
            // ---------- EMPTY STATE WHEN NO TESTS ----------
            <Card className="max-w-2xl mx-auto">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4">
                  <AlertTriangle className="h-12 w-12 text-amber-500" />
                </div>
                <CardTitle className="text-2xl">No tests available</CardTitle>
                <CardDescription>
                  We couldn’t find any assessments for you right now.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <p className="text-sm text-muted-foreground text-center">
                  If you think this is a mistake, try refreshing. You can also
                  check back later or contact your instructor.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    className="h-10 bg-transparent border border-[#EF7B55] text-[#EF7B55] hover:bg-[#F79771] hover:text-white"
                    onClick={() => window.location.reload()}
                  >
                    Refresh
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
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
            </>
          )}
        </TabsContent>

        {/* ---------- Past Attempts (server-backed) ---------- */}
        <TabsContent value="past" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Past Attempts</h2>
            <Select
              value={pastSortBy}
              onValueChange={(value) =>
                setPastSortBy(value as "date" | "score" | "result")
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Sort by Date</SelectItem>
                <SelectItem value="score">Sort by Score</SelectItem>
                <SelectItem value="result">Sort by Result</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {sortedAttempts.length === 0 ? (
            <div className="text-center text-muted-foreground">
              <p>No past attempts yet.</p>
              <Button
                variant="link"
                onClick={() =>
                  document
                    .querySelector('button[data-state="available"]')
                    //@ts-ignore
                    ?.click()
                }
              >
                Start a test now
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sortedAttempts.map((a) => {
                const pct = percentFromAttempt(a);
                const submittedDate = a.submitted_at
                  ? new Date(a.submitted_at).toLocaleDateString()
                  : a.started_at
                  ? new Date(a.started_at).toLocaleDateString()
                  : "";
                return (
                  <Card
                    key={a.id}
                    className="flex flex-col h-full cursor-pointer hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {a.test?.title || `Test #${a.test_id}`}
                      </CardTitle>
                      <CardDescription>
                        {a.test?.course_name || "—"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-3">
                      <p className="text-sm">
                        <span className="font-medium">Status: </span>
                        <Badge variant="outline">{a.status || "—"}</Badge>
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Score: </span>
                        {a.score ?? "—"} / {a.test?.total_marks ?? "—"}{" "}
                        {a.score != null && a.test?.total_marks ? `(${pct}%)` : ""}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Submitted: {submittedDate || "—"}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {attempts.count > attempts.page_size && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (pastCurrentPage > 1)
                        setAttemptsPage(pastCurrentPage - 1);
                    }}
                    className={
                      pastCurrentPage === 1
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
                {[...Array(pastTotalPages)].map((_, index) => {
                  const page = index + 1;
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        isActive={pastCurrentPage === page}
                        onClick={(e) => {
                          e.preventDefault();
                          setAttemptsPage(page);
                        }}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                {pastTotalPages > 5 && <PaginationEllipsis />}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (pastCurrentPage < pastTotalPages)
                        setAttemptsPage(pastCurrentPage + 1);
                    }}
                    className={
                      pastCurrentPage === pastTotalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
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

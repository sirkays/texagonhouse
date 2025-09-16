"use client";

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
  XCircle,
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

export function CBTTest() {
  const { data: session, status } = useSession();
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
  const [initialTime, setInitialTime] = useState(0);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [testCompleted, setTestCompleted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isSecureMode, setIsSecureMode] = useState(false);
  const [browserLocked, setBrowserLocked] = useState(false);
  const [suspiciousActivity, setSuspiciousActivity] = useState(0);
  const [showSecurityWarning, setShowSecurityWarning] = useState(false);
  const [isSubscriber, setIsSubscriber] = useState(true); // Mock subscription status
  const [examAttempts, setExamAttempts] = useState(0);
  const [maxAttempts] = useState(3);
  const [currentPage, setCurrentPage] = useState(1);
  const [testsPerPage] = useState(3); // Show 3 tests per page
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [pendingTestId, setPendingTestId] = useState<string | null>(null);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [availableTests, setAvailableTests] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sessionToken = useMemo(
    () => session?.user?.sessionToken || null,
    [session?.user?.sessionToken]
  );

  const handleLogout = async () => {
    console.log(
      "[CBTTest] Initiating logout, sessionToken:",
      session?.user?.sessionToken
    );
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
      document.cookie =
        "next-auth.session-token=; Max-Age=0; path=/; secure; SameSite=Strict";
      document.cookie =
        "next-auth.csrf-token=; Max-Age=0; path=/; secure; SameSite=Strict";
      console.log("[CBTTest] Logout successful, redirecting to /login");
      window.location.href = "/login";
    } catch (error) {
      console.error("[CBTTest] Logout error:", error);
      document.cookie =
        "next-auth.session-token=; Max-Age=0; path=/; secure; SameSite=Strict";
      document.cookie =
        "next-auth.csrf-token=; Max-Age=0; path=/; secure; SameSite=Strict";
      window.location.href = "/login";
    }
  };

  useEffect(() => {
    if (status === "loading") {
      console.log("[CBTTest] Session still loading, skipping fetch");
      return;
    }
    if (status !== "authenticated" || !session?.user?.sessionToken) {
      console.log(
        "[CBTTest] Not authenticated or no session token, status:",
        status,
        "sessionToken:",
        session?.user?.sessionToken
      );
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    const fetchTests = async () => {
      console.log(
        "[CBTTest] Fetching tests with sessionToken:",
        session.user.sessionToken
      );
      setLoading(true);
      try {
        const response = await fetch("/api/student/cbt", {
          headers: {
            "Content-Type": "application/json",
            "X-Session-Token": session.user.sessionToken,
          },
        });
        console.log("[CBTTest] Fetch response status:", response.status);
        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            "[CBTTest] Fetch failed with status:",
            response.status,
            "Response:",
            errorText
          );
          if (response.status === 401 || response.status === 403) {
            setError("Session expired");
          } else if (response.status === 500) {
            setError(
              "Server error: Unable to fetch tests. Please try again later."
            );
          } else {
            setError("Failed to fetch tests");
          }
          setAvailableTests([]);
          setLoading(false);
          return;
        }
        const data = await response.json();
        console.log("[CBTTest] Fetch response data:", data);
        setAvailableTests(data.tests || []);
        setError(null);
      } catch (err) {
        console.error("[CBTTest] Fetch error:", err);
        setError(
          "Server error: Unable to fetch tests. Please try again later."
        );
        setAvailableTests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, [sessionToken, status]);

  // Pagination logic
  const indexOfLastTest = currentPage * testsPerPage;
  const indexOfFirstTest = indexOfLastTest - testsPerPage;
  const currentTests = availableTests.slice(indexOfFirstTest, indexOfLastTest);
  const totalPages = Math.ceil(availableTests.length / testsPerPage);

  useEffect(() => {
    if (currentTest) {
      const handleVisibilityChange = () => {
        if (document.hidden) {
          setSuspiciousActivity((prev) => prev + 1);
          setShowSecurityWarning(true);
          if (suspiciousActivity >= 2) {
            submitTest();
          }
        }
      };

      const handleBlur = () => {
        setSuspiciousActivity((prev) => prev + 1);
        setShowSecurityWarning(true);
        if (suspiciousActivity >= 2) {
          submitTest();
        }
      };

      const handleKeyDown = (e: KeyboardEvent) => {
        if (
          e.key === "F12" ||
          (e.ctrlKey &&
            (e.key === "u" ||
              e.key === "i" ||
              e.key === "s" ||
              e.key === "t")) ||
          (e.ctrlKey && e.shiftKey && e.key === "I")
        ) {
          e.preventDefault();
          setSuspiciousActivity((prev) => prev + 1);
          setShowSecurityWarning(true);
        }
      };

      const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);
      window.addEventListener("blur", handleBlur);
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("contextmenu", handleContextMenu);

      return () => {
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );
        window.removeEventListener("blur", handleBlur);
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("contextmenu", handleContextMenu);
      };
    }
  }, [currentTest, suspiciousActivity]);

  useEffect(() => {
    if (currentTest && timeLeft > 0) {
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
    }
  }, [currentTest, timeLeft]);

  const startTest = (testPk: string) => {
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

    const mappedQuestions = test.items.map((item: any) => ({
      id: item.id,
      type: item.type === "scq" ? "multiple-choice" : item.type,
      question: item.question,
      options: item.choices
        ? item.choices.map((c: any) => ({ id: c.id, text: c.text }))
        : [],
      points: item.points,
    }));

    setQuestions(mappedQuestions);
    setCurrentTest(testPk);
    setCurrentQuestion(0);
    setAnswers({});
    setTestCompleted(false);
    const duration =
      test?.id === "semester-exam-math"
        ? 7200
        : test?.id === "semester-exam-physics"
        ? 5400
        : parseInt(test.duration) * 60 || 1800;
    setInitialTime(duration);
    setTimeLeft(duration);
    setStartTime(new Date().toISOString());

    setIsSecureMode(true);
    setBrowserLocked(true);
    if (test?.type === "exam") {
      setExamAttempts((prev) => prev + 1);
    }
  };

  const handleStartTest = (testPk: string) => {
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

  const confirmLeaveTest = () => {
    setShowLeaveDialog(false);
    setCurrentTest(null);
    setIsSecureMode(false);
    setBrowserLocked(false);
    setSuspiciousActivity(0);
    setCurrentQuestion(0);
    setAnswers({});
    setQuestions([]);
  };

  const handleAnswerChange = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion]: value,
    }));
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
        if (q.type === "multiple-choice") {
          submitAnswers.push({ question: q.id, choice: parseInt(ans) });
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
      currentTest: currentTest,
    };

    try {
      const res = await fetch(`/api/student/cbt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Token": session?.user?.sessionToken || "",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error("Failed to submit test");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error("[CBTTest] Error submitting test:", err);
    } finally {
      setTestCompleted(true);
      setIsSecureMode(false);
      setBrowserLocked(false);
      setSuspiciousActivity(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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
                  : window.location.reload()
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
    // const Icon = result?.result === "PASS" ? CheckCircle : XCircle;
    // const iconColor =
    //   result?.result === "PASS" ? "text-green-500" : "text-red-500";

    const Icon = CheckCircle;
    const iconColor = "text-green-500";

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Test Submitted</h1>
          <p className="text-muted-foreground">
            {result
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
              Thank you for completing the test.
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
                <p className="">
                  {result.result === "PASS"
                    ? "Congratulations! You have passed the test." :
                    "Unfortunately, you did not pass. Better luck next time!"}
                </p>
                {/* <p className="text-sm text-muted-foreground">
                  Note: Detailed results will be available in your dashboard.
                </p> */}
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
                onClick={() => setCurrentTest(null)}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Take Another Test
              </Button>
              <Button variant="outline">View Submitted Answers</Button>
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
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Leave Test
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to leave? Your test progress will be lost.
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

                {currentQ?.type === "multiple-choice" ? (
                  <RadioGroup
                    value={answers[currentQuestion] || ""}
                    onValueChange={handleAnswerChange}
                  >
                    {currentQ.options?.map(
                      (option: { id: number; text: string }, index: number) => (
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
                      )
                    )}
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

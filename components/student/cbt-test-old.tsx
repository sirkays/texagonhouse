"use client";

import {useState, useEffect} from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Label} from "@/components/ui/label";
import {Progress} from "@/components/ui/progress";
import {Badge} from "@/components/ui/badge";
import {Textarea} from "@/components/ui/textarea";
import {Input} from "@/components/ui/input";
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

export function CBTTest() {
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
  const [testCompleted, setTestCompleted] = useState(false);
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

  const availableTests = [
    {
      id: "react-basics",
      title: "React Fundamentals",
      questions: 20,
      duration: "30 mins",
      difficulty: "Beginner",
      description:
        "Test your knowledge of React components, props, and state management.",
      type: "quiz",
      requiresSubscription: false,
    },
    {
      id: "javascript-advanced",
      title: "Advanced JavaScript",
      questions: 25,
      duration: "45 mins",
      difficulty: "Advanced",
      description:
        "Closures, prototypes, async/await, and modern ES6+ features.",
      type: "quiz",
      requiresSubscription: false,
    },
    {
      id: "semester-exam-math",
      title: "Mathematics Semester Exam",
      questions: 50,
      duration: "120 mins",
      difficulty: "Advanced",
      description:
        "Comprehensive semester examination covering all mathematics topics.",
      type: "exam",
      requiresSubscription: true,
    },
    {
      id: "semester-exam-physics",
      title: "Physics Semester Exam",
      questions: 45,
      duration: "90 mins",
      difficulty: "Advanced",
      description:
        "Final examination for physics covering mechanics, thermodynamics, and waves.",
      type: "exam",
      requiresSubscription: true,
    },
  ];

  const sampleQuestions = [
    {
      id: 1,
      type: "multiple-choice",
      question: "What is the correct way to create a React component?",
      options: [
        "function MyComponent() { return <div>Hello</div>; }",
        "const MyComponent = () => <div>Hello</div>;",
        "class MyComponent extends React.Component { render() { return <div>Hello</div>; } }",
        "All of the above",
      ],
      correct: 3,
      points: 2,
      explanation:
        "All three methods are valid ways to create React components.",
    },
    {
      id: 2,
      type: "multiple-choice",
      question:
        "Which hook is used for managing state in functional components?",
      options: ["useEffect", "useState", "useContext", "useReducer"],
      correct: 1,
      points: 2,
      explanation:
        "useState is the primary hook for managing local state in functional components.",
    },
    {
      id: 3,
      type: "true-false",
      question: "JSX is mandatory for React development.",
      options: ["True", "False"],
      correct: 1,
      points: 1,
      explanation:
        "JSX is not mandatory but is the recommended way to write React components.",
    },
    {
      id: 4,
      type: "short-answer",
      question: "What does the 'key' prop do in React lists?",
      correct: "helps react identify which items have changed",
      points: 3,
      explanation:
        "The key prop helps React identify which items have changed, are added, or are removed.",
    },
    {
      id: 5,
      type: "essay",
      question:
        "Explain the concept of Virtual DOM and its benefits in React applications.",
      points: 5,
      explanation:
        "Virtual DOM is a programming concept where a virtual representation of UI is kept in memory and synced with the real DOM.",
    },
  ];

  // Pagination logic
  const indexOfLastTest = currentPage * testsPerPage;
  const indexOfFirstTest = indexOfLastTest - testsPerPage;
  const currentTests = availableTests.slice(indexOfFirstTest, indexOfLastTest);
  const totalPages = Math.ceil(availableTests.length / testsPerPage);

  useEffect(() => {
    if (currentTest) {
      // Secure mode for all tests (quizzes and exams)
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
        // Prevent common shortcuts including new tab (Ctrl+T)
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
            submitTest(); // Auto-submit when time runs out
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentTest, timeLeft]);

  const startTest = (testId: string) => {
    const test = availableTests.find((t) => t.id === testId);

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

    setCurrentTest(testId);
    setCurrentQuestion(0);
    setAnswers({});
    setTestCompleted(false);
    setTimeLeft(
      test?.id === "semester-exam-math"
        ? 7200
        : test?.id === "semester-exam-physics"
        ? 5400
        : 1800
    );

    setIsSecureMode(true); // Enable secure mode for all tests
    setBrowserLocked(true);
    if (test?.type === "exam") {
      setExamAttempts((prev) => prev + 1);
    }
  };

  const handleStartTest = (testId: string) => {
    setPendingTestId(testId);
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
  };

  const handleAnswerChange = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion]: value,
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < sampleQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const submitTest = () => {
    setTestCompleted(true);
    setIsSecureMode(false);
    setBrowserLocked(false);
    setSuspiciousActivity(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (testCompleted) {
    const score = Object.entries(answers).reduce(
      (total, [questionIndex, answer]) => {
        const question = sampleQuestions[Number.parseInt(questionIndex)];
        if (!question) return total;

        if (
          question.type === "multiple-choice" ||
          question.type === "true-false"
        ) {
          return (
            total +
            (Number.parseInt(answer) === question.correct ? question.points : 0)
          );
        } else if (question.type === "short-answer") {
          const correctAnswer = question.correct as string;
          return (
            total +
            (answer.toLowerCase().includes(correctAnswer.toLowerCase())
              ? question.points
              : 0)
          );
        }
        return total;
      },
      0
    );

    const totalPoints = sampleQuestions.reduce((sum, q) => sum + q.points, 0);
    const percentage = Math.round((score / totalPoints) * 100);

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Test Results</h1>
          <p className="text-muted-foreground">
            Your performance summary with detailed feedback
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              {percentage >= 70 ? (
                <CheckCircle className="h-16 w-16 text-green-500" />
              ) : (
                <XCircle className="h-16 w-16 text-red-500" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {percentage >= 70 ? "Congratulations!" : "Keep Learning!"}
            </CardTitle>
            <CardDescription>
              You scored {score} out of {totalPoints} points
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">{percentage}%</div>
              <Progress value={percentage} className="h-3" />
            </div>

            <div className="grid gap-4 md:grid-cols-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{score}</div>
                <div className="text-sm text-muted-foreground">
                  Points Earned
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {totalPoints}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Points
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {Object.keys(answers).length}
                </div>
                <div className="text-sm text-muted-foreground">Answered</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {percentage >= 70 ? "PASS" : "FAIL"}
                </div>
                <div className="text-sm text-muted-foreground">Result</div>
              </div>
            </div>

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
              <Button onClick={() => setCurrentTest(null)}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Take Another Test
              </Button>
              <Button variant="outline">Review Answers</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentTest) {
    const progress = ((currentQuestion + 1) / sampleQuestions.length) * 100;
    const currentQ = sampleQuestions[currentQuestion];
    const test = availableTests.find((t) => t.id === currentTest);

    return (
      <div className="space-y-6">
        <Dialog
          open={showSecurityWarning}
          onOpenChange={setShowSecurityWarning}>
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
              <Button onClick={() => setShowSecurityWarning(false)}>
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
                variant="outline"
                onClick={() => setShowLeaveDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmLeaveTest}>
                Leave Test
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{test?.title}</h1>
            <p className="text-muted-foreground">
              Question {currentQuestion + 1} of {sampleQuestions.length}
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
                className={`font-mono ${timeLeft < 300 ? "text-red-600" : ""}`}>
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

                {currentQ?.type === "multiple-choice" ||
                currentQ?.type === "true-false" ? (
                  <RadioGroup
                    value={answers[currentQuestion] || ""}
                    onValueChange={handleAnswerChange}>
                    {currentQ.options?.map((option, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                        <RadioGroupItem
                          value={index.toString()}
                          id={`option-${index}`}
                        />
                        <Label
                          htmlFor={`option-${index}`}
                          className="flex-1 cursor-pointer">
                          {option}
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
                    variant="outline"
                    onClick={previousQuestion}
                    disabled={currentQuestion === 0}>
                    Previous
                  </Button>
                  <div className="flex gap-2">
                    {currentQuestion === sampleQuestions.length - 1 ? (
                      <Button onClick={submitTest}>Submit Test</Button>
                    ) : (
                      <Button onClick={nextQuestion}>Next</Button>
                    )}
                    <Button variant="destructive" onClick={handleLeaveTest}>
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
                  {sampleQuestions.map((_, index) => (
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
                      onClick={() => setCurrentQuestion(index)}>
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
                  <span>{sampleQuestions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Answered:</span>
                  <span>{Object.keys(answers).length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Remaining:</span>
                  <span>
                    {sampleQuestions.length - Object.keys(answers).length}
                  </span>
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
                    availableTests.find((t) => t.id === pendingTestId)?.type ===
                    "exam"
                      ? "Secure Exam"
                      : "Quiz"
                  }`
                : "Cannot Start Test"}
            </DialogTitle>
            <DialogDescription>
              {pendingTestId
                ? `Are you ready to start the ${
                    availableTests.find((t) => t.id === pendingTestId)?.title
                  }? During the test, you must remain on this tab. Switching tabs or opening new tabs will be flagged as suspicious activity.`
                : examAttempts >= maxAttempts
                ? `You have reached the maximum number of attempts (${maxAttempts}) for this exam.`
                : "This exam requires an active subscription. Please upgrade your plan to access semester exams."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowStartDialog(false);
                setPendingTestId(null);
              }}>
              Cancel
            </Button>
            {pendingTestId && (
              <Button onClick={confirmStartTest}>Start Test</Button>
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
            key={test.id}
            className="hover:shadow-lg transition-shadow flex flex-col h-full">
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
                    }>
                    {test.difficulty}
                  </Badge>

                  {test.type === "exam" && (
                    <Badge
                      variant="outline"
                      className="text-red-600 border-red-200">
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
                  onClick={() => handleStartTest(test.id)}
                  className="w-full h-11"
                  disabled={
                    (test.type === "exam" && examAttempts >= maxAttempts) ||
                    (test.requiresSubscription && !isSubscriber)
                  }>
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
          <PaginationPrevious
            onClick={() => handlePageChange(currentPage - 1)}
            className={
              currentPage === 1 ? "pointer-events-none opacity-50" : ""
            }
          />
          {[...Array(totalPages)].map((_, index) => {
            const page = index + 1;
            return (
              <PaginationItem key={page}>
                <PaginationLink
                  isActive={currentPage === page}
                  onClick={() => handlePageChange(page)}>
                  {page}
                </PaginationLink>
              </PaginationItem>
            );
          })}
          {totalPages > 5 && <PaginationEllipsis />}
          <PaginationNext
            onClick={() => handlePageChange(currentPage + 1)}
            className={
              currentPage === totalPages ? "pointer-events-none opacity-50" : ""
            }
          />
        </PaginationContent>
      </Pagination>
    </div>
  );
}

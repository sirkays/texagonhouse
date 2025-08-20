"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, XCircle, Play, RotateCcw } from "lucide-react"

export function CBTTest() {
  const [currentTest, setCurrentTest] = useState<string | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [timeLeft, setTimeLeft] = useState(1800) // 30 minutes
  const [testCompleted, setTestCompleted] = useState(false)

  const availableTests = [
    {
      id: "react-basics",
      title: "React Fundamentals",
      questions: 20,
      duration: "30 mins",
      difficulty: "Beginner",
      description: "Test your knowledge of React components, props, and state management.",
    },
    {
      id: "javascript-advanced",
      title: "Advanced JavaScript",
      questions: 25,
      duration: "45 mins",
      difficulty: "Advanced",
      description: "Closures, prototypes, async/await, and modern ES6+ features.",
    },
    {
      id: "python-data",
      title: "Python for Data Science",
      questions: 30,
      duration: "60 mins",
      difficulty: "Intermediate",
      description: "Pandas, NumPy, data manipulation, and basic machine learning.",
    },
  ]

  const sampleQuestions = [
    {
      question: "What is the correct way to create a React component?",
      options: [
        "function MyComponent() { return <div>Hello</div>; }",
        "const MyComponent = () => <div>Hello</div>;",
        "class MyComponent extends React.Component { render() { return <div>Hello</div>; } }",
        "All of the above",
      ],
      correct: 3,
    },
    {
      question: "Which hook is used for managing state in functional components?",
      options: ["useEffect", "useState", "useContext", "useReducer"],
      correct: 1,
    },
    {
      question: "What does JSX stand for?",
      options: ["JavaScript XML", "Java Syntax Extension", "JavaScript Extension", "JSON XML"],
      correct: 0,
    },
  ]

  const startTest = (testId: string) => {
    setCurrentTest(testId)
    setCurrentQuestion(0)
    setAnswers({})
    setTestCompleted(false)
    setTimeLeft(1800)
  }

  const handleAnswerChange = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion]: value,
    }))
  }

  const nextQuestion = () => {
    if (currentQuestion < sampleQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
    }
  }

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1)
    }
  }

  const submitTest = () => {
    setTestCompleted(true)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (testCompleted) {
    const score = Object.values(answers).filter(
      (answer, index) => Number.parseInt(answer) === sampleQuestions[index]?.correct,
    ).length
    const percentage = Math.round((score / sampleQuestions.length) * 100)

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Test Results</h1>
          <p className="text-muted-foreground">Your performance summary</p>
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
            <CardTitle className="text-2xl">{percentage >= 70 ? "Congratulations!" : "Keep Learning!"}</CardTitle>
            <CardDescription>
              You scored {score} out of {sampleQuestions.length} questions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">{percentage}%</div>
              <Progress value={percentage} className="h-3" />
            </div>

            <div className="grid gap-4 md:grid-cols-3 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{score}</div>
                <div className="text-sm text-muted-foreground">Correct</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{sampleQuestions.length - score}</div>
                <div className="text-sm text-muted-foreground">Incorrect</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{percentage >= 70 ? "PASS" : "FAIL"}</div>
                <div className="text-sm text-muted-foreground">Result</div>
              </div>
            </div>

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
    )
  }

  if (currentTest) {
    const progress = ((currentQuestion + 1) / sampleQuestions.length) * 100

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">React Fundamentals Test</h1>
            <p className="text-muted-foreground">
              Question {currentQuestion + 1} of {sampleQuestions.length}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="font-mono">{formatTime(timeLeft)}</span>
            </div>
            <Badge variant="outline">{Math.round(progress)}% Complete</Badge>
          </div>
        </div>

        <Progress value={progress} className="h-2" />

        <div className="grid gap-6 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Question {currentQuestion + 1}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-lg">{sampleQuestions[currentQuestion]?.question}</p>

                <RadioGroup value={answers[currentQuestion] || ""} onValueChange={handleAnswerChange}>
                  {sampleQuestions[currentQuestion]?.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={previousQuestion} disabled={currentQuestion === 0}>
                    Previous
                  </Button>

                  {currentQuestion === sampleQuestions.length - 1 ? (
                    <Button onClick={submitTest}>Submit Test</Button>
                  ) : (
                    <Button onClick={nextQuestion}>Next</Button>
                  )}
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
                      variant={currentQuestion === index ? "default" : answers[index] ? "secondary" : "outline"}
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
                  <span>{sampleQuestions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Answered:</span>
                  <span>{Object.keys(answers).length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Remaining:</span>
                  <span>{sampleQuestions.length - Object.keys(answers).length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">CBT Tests</h1>
        <p className="text-muted-foreground">Test your knowledge with computer-based assessments</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {availableTests.map((test) => (
          <Card key={test.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{test.title}</CardTitle>
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
              </div>
              <CardDescription>{test.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{test.questions} questions</span>
                <span>{test.duration}</span>
              </div>
              <Button onClick={() => startTest(test.id)} className="w-full">
                <Play className="mr-2 h-4 w-4" />
                Start Test
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Test Results</CardTitle>
          <CardDescription>Your performance history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { test: "JavaScript Basics", score: 85, date: "Dec 20, 2024", status: "Passed" },
              { test: "HTML/CSS Fundamentals", score: 92, date: "Dec 18, 2024", status: "Passed" },
              { test: "Python Basics", score: 67, date: "Dec 15, 2024", status: "Failed" },
            ].map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{result.test}</h4>
                  <p className="text-sm text-muted-foreground">{result.date}</p>
                </div>
                <div className="text-right">
                  <div className="font-bold">{result.score}%</div>
                  <Badge variant={result.status === "Passed" ? "default" : "destructive"}>{result.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client";

import {useEffect, useState} from "react";
import {useRouter, useParams} from "next/navigation";
import {Card, CardHeader, CardTitle, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {Download, ArrowLeft} from "lucide-react";
import {Spinner} from "@/components/ui/spinner";

const saveAs = require("file-saver").saveAs;
const html2pdf = require("html2pdf.js");

interface StudentPerformance {
  id: string;
  studentName: string;
  studentId: string;
  email: string;
  classGrade: string;
  score: number;
  totalMarks: number;
  percentage: number;
  completionTime: number;
  status: "Passed" | "Failed";
  submittedAt: string;
  testId: string;
  answers: {
    question: string;
    selected: string;
    correct: string;
    status: "Correct" | "Incorrect";
  }[];
}

interface CBTTest {
  id: string;
  title: string;
  description: string;
  instructions: string;
  duration: number;
  totalPoints: number;
  questions: any[];
  difficulty: string;
  category: string;
  courseId?: string;
  isPublished: boolean;
  questionsCount: number;
  createdAt: string;
  updatedAt: string;
  start_at?: string;
  end_at?: string;
  total_marks?: number;
}

export default function StudentPerformancePage() {
  const router = useRouter();
  const params = useParams();
  const [performance, setPerformance] = useState<StudentPerformance | null>(
    null
  );
  const [test, setTest] = useState<CBTTest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Mock data (replace with actual API call in a real app)
  const mockStudentPerformances: StudentPerformance[] = [
    {
      id: "1",
      studentName: "John Doe",
      studentId: "S001",
      email: "john.doe@example.com",
      classGrade: "Grade 10",
      score: 85,
      totalMarks: 100,
      percentage: 85,
      completionTime: 25,
      status: "Passed",
      submittedAt: "2025-10-15T10:30:00Z",
      testId: "1",
      answers: [
        {
          question: "What is 2 + 2?",
          selected: "4",
          correct: "4",
          status: "Correct",
        },
        {
          question: "What is the capital of France?",
          selected: "Paris",
          correct: "Paris",
          status: "Correct",
        },
        {
          question: "What is 5 x 3?",
          selected: "12",
          correct: "15",
          status: "Incorrect",
        },
      ],
    },
    {
      id: "2",
      studentName: "Jane Smith",
      studentId: "S002",
      email: "jane.smith@example.com",
      classGrade: "Grade 10",
      score: 92,
      totalMarks: 100,
      percentage: 92,
      completionTime: 22,
      status: "Passed",
      submittedAt: "2025-10-15T11:00:00Z",
      testId: "1",
      answers: [
        {
          question: "What is 2 + 2?",
          selected: "4",
          correct: "4",
          status: "Correct",
        },
        {
          question: "What is the capital of France?",
          selected: "Paris",
          correct: "Paris",
          status: "Correct",
        },
        {
          question: "What is 5 x 3?",
          selected: "15",
          correct: "15",
          status: "Correct",
        },
      ],
    },
  ];

  const mockTests: CBTTest[] = [
    {
      id: "1",
      title: "Math Quiz",
      description: "Basic math quiz",
      instructions: "Answer all questions",
      duration: 30,
      totalPoints: 100,
      questions: [],
      difficulty: "Medium",
      category: "Math",
      isPublished: true,
      questionsCount: 3,
      createdAt: "2025-10-01",
      updatedAt: "2025-10-01",
      start_at: "2025-10-15",
      end_at: "2025-10-16",
      total_marks: 100,
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const performanceId = params.id as string;
      // In a real app, fetch from API: /api/teacher/assessments/performance/${performanceId}
      const foundPerformance = mockStudentPerformances.find(
        (p) => p.id === performanceId
      );
      if (foundPerformance) {
        setPerformance(foundPerformance);
        const foundTest = mockTests.find(
          (t) => t.id === foundPerformance.testId
        );
        setTest(foundTest || null);
      }
      setIsLoading(false);
    };

    fetchData();
  }, [params.id]);

  const exportToCSV = (performance: StudentPerformance) => {
    if (!test) return;

    let csvContent =
      "Student Name,Student ID,Email,Class,Test Title,Date,Duration,Total Questions,Passing Score,Total Score,Percentage,Status\n";
    csvContent += `"${performance.studentName}","${performance.studentId}","${
      performance.email
    }","${performance.classGrade}","${test.title}","${
      test.start_at ? new Date(test.start_at).toLocaleDateString() : "N/A"
    }","${test.duration} minutes",${test.questionsCount},${
      (test.total_marks || 0) * 0.7
    },${performance.score},${performance.percentage},"${
      performance.status
    }"\n\n`;
    csvContent += "Question,Selected Option,Correct Option,Status\n";
    performance.answers.forEach((answer) => {
      csvContent += `"${answer.question.replace(/"/g, '""')}","${
        answer.selected
      }","${answer.correct}","${answer.status}"\n`;
    });

    const blob = new Blob([csvContent], {type: "text/csv;charset=utf-8;"});
    saveAs(blob, `${performance.studentName}_${test.title}_performance.csv`);
  };

  const exportToPDF = (performance: StudentPerformance) => {
    if (!test) return;

    const element = document.getElementById("studentPerformanceDetails");
    if (!element) return;

    const opt = {
      margin: 1,
      filename: `${performance.studentName}_${test.title}_performance.pdf`,
      image: {type: "jpeg", quality: 0.98},
      html2canvas: {scale: 2},
      jsPDF: {unit: "in", format: "letter", orientation: "portrait"},
    };
    html2pdf().from(element).set(opt).save();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="md" className="text-[#f79771]" />
      </div>
    );
  }

  if (!performance || !test) {
    return (
      <div className="min-h-screen p-6">
        <Button
          variant="outline"
          onClick={() => router.push("/teacher/student-performance")}
          className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Student Performance
        </Button>
        <p className="text-red-500">Performance data not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="mx-auto">
        <Button
          variant="outline"
          onClick={() => router.push("/teacher/student-performance")}
          className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Student Performance
        </Button>
        <h1 className="text-3xl font-bold mb-4">Student Performance Details</h1>
        <p className="text-muted-foreground mb-6">
          View detailed performance for {performance.studentName}
        </p>
        <div id="studentPerformanceDetails" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Student Name</p>
                <p className="text-lg font-medium">{performance.studentName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Student ID</p>
                <p className="text-lg font-medium">{performance.studentId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-lg font-medium">{performance.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Class</p>
                <p className="text-lg font-medium">{performance.classGrade}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Test Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Test Title</p>
                <p className="text-lg font-medium">{test.title}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Score</p>
                <p className="text-lg font-medium">
                  {performance.score}/{performance.totalMarks} (
                  {performance.percentage}%)
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge
                  variant={
                    performance.status === "Passed" ? "default" : "destructive"
                  }
                  className={
                    performance.status === "Passed"
                      ? "bg-[#EF7B55]"
                      : "bg-red-500"
                  }>
                  {performance.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completion Time</p>
                <p className="text-lg font-medium">
                  {performance.completionTime} minutes
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Submitted At</p>
                <p className="text-lg font-medium">
                  {new Date(performance.submittedAt).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Answer Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Question</TableHead>
                    <TableHead>Selected Answer</TableHead>
                    <TableHead>Correct Answer</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {performance.answers.map((answer, index) => (
                    <TableRow key={index}>
                      <TableCell>{answer.question}</TableCell>
                      <TableCell>{answer.selected}</TableCell>
                      <TableCell>{answer.correct}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            answer.status === "Correct"
                              ? "default"
                              : "destructive"
                          }
                          className={
                            answer.status === "Correct"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }>
                          {answer.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => exportToCSV(performance)}
              disabled={isSaving}>
              <Download className="mr-2 h-4 w-4" />
              Export to CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => exportToPDF(performance)}
              disabled={isSaving}>
              <Download className="mr-2 h-4 w-4" />
              Export to PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

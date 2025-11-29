"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Download, ArrowLeft } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

interface StudentPerformanceDetail {
  student: {
    studentName: string;
    studentId: string;
    email: string;
    classGrade: string;
  };
  test: {
    testTitle: string;
    score: number;
    totalMarks: number;
    percentage: number;
    status: string;
    completionTime: number;
    submittedAt: string;
  };
  answers: {
    question: string;
    selected: string;
    correct: string;
    status: string;
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
  const [performanceDetail, setPerformanceDetail] =
    useState<StudentPerformanceDetail | null>(null);
  const [test, setTest] = useState<CBTTest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const performanceId = params.id as string;
      const res = await fetch(
        `/api/teacher/performance-detail?id=${performanceId}`,
      );
      if (!res.ok) {
        console.error("Failed to fetch performance detail");
        setIsLoading(false);
        return;
      }
      const data = await res.json();
      if (data.error === "Session expired") {
        router.push("/login");
        setIsLoading(false);
        return;
      }
      setPerformanceDetail(data);

      // Fetch the test using testId from the detail response
      const testRes = await fetch(
        `/api/teacher/assessments/tests/${data.test.testId}`,
      ); // assumes backend provides testId
      const testData = await testRes.json();
      setTest(testData);
      setIsLoading(false);
    };

    fetchData();
  }, [params.id, router]);

  const exportToCSV = async (detail: StudentPerformanceDetail) => {
    if (!test) return;

    setIsSaving(true);
    try {
      // ✅ load file-saver only in the browser, on demand
      const { saveAs } = await import("file-saver");

      let csvContent =
        "Student Name,Student ID,Email,Class,Test Title,Date,Duration,Total Questions,Passing Score,Total Score,Percentage,Status\n";
      csvContent += `"${detail.student.studentName}","${
        detail.student.studentId
      }","${detail.student.email}","${detail.student.classGrade}","${
        detail.test.testTitle
      }","${
        test.start_at ? new Date(test.start_at).toLocaleDateString() : "N/A"
      }","${test.duration} minutes",${test.questionsCount},${
        (detail.test.totalMarks || 0) * 0.7
      },${detail.test.score},${detail.test.percentage},"${
        detail.test.status
      }"\n\n`;
      csvContent += "Question,Selected Option,Correct Option,Status\n";
      detail.answers.forEach((answer) => {
        csvContent += `"${answer.question.replace(/"/g, '""')}","${
          answer.selected
        }","${answer.correct}","${answer.status}"\n`;
      });

      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      saveAs(
        blob,
        `${detail.student.studentName}_${detail.test.testTitle}_performance.csv`,
      );
    } finally {
      setIsSaving(false);
    }
  };

  const exportToPDF = async (detail: StudentPerformanceDetail) => {
    if (!test) return;

    const element = document.getElementById("studentPerformanceDetails");
    if (!element) return;

    setIsSaving(true);
    try {
      // ✅ load html2pdf only in the browser, on demand
      const html2pdfModule = await import("html2pdf.js");
      const html2pdf = html2pdfModule.default || html2pdfModule;

      const opt = {
        margin: 1,
        filename: `${detail.student.studentName}_${detail.test.testTitle}_performance.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      };

      html2pdf().from(element).set(opt).save();
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="md" className="text-[#f79771]" />
      </div>
    );
  }

  if (!performanceDetail || !test) {
    return (
      <div className="min-h-screen p-6">
        <Button
          variant="outline"
          onClick={() => router.push("/teacher/student-performance")}
          className="mb-4"
        >
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
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Student Performance
        </Button>
        <h1 className="text-3xl font-bold mb-4">Student Performance Details</h1>
        <p className="text-muted-foreground mb-6">
          View detailed performance for {performanceDetail.student.studentName}
        </p>
        <div id="studentPerformanceDetails" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Student Name</p>
                <p className="text-lg font-medium">
                  {performanceDetail.student.studentName}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Student ID</p>
                <p className="text-lg font-medium">
                  {performanceDetail.student.studentId}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-lg font-medium">
                  {performanceDetail.student.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Class</p>
                <p className="text-lg font-medium">
                  {performanceDetail.student.classGrade}
                </p>
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
                <p className="text-lg font-medium">
                  {performanceDetail.test.testTitle}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Score</p>
                <p className="text-lg font-medium">
                  {performanceDetail.test.score}/
                  {performanceDetail.test.totalMarks} (
                  {performanceDetail.test.percentage}
                  %)
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge
                  variant={
                    performanceDetail.test.status === "Passed"
                      ? "default"
                      : "destructive"
                  }
                  className={
                    performanceDetail.test.status === "Passed"
                      ? "bg-[#EF7B55]"
                      : "bg-red-500"
                  }
                >
                  {performanceDetail.test.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Completion Time
                </p>
                <p className="text-lg font-medium">
                  {performanceDetail.test.completionTime} minutes
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Submitted At</p>
                <p className="text-lg font-medium">
                  {new Date(
                    performanceDetail.test.submittedAt,
                  ).toLocaleString()}
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
                  {performanceDetail.answers.map((answer, index) => (
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
                          }
                        >
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
              onClick={() =>
                performanceDetail && exportToCSV(performanceDetail)
              }
              disabled={isSaving}
            >
              <Download className="mr-2 h-4 w-4" />
              Export to CSV
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                performanceDetail && exportToPDF(performanceDetail)
              }
              disabled={isSaving}
            >
              <Download className="mr-2 h-4 w-4" />
              Export to PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

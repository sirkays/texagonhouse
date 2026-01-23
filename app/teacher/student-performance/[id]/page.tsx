"use client";
import {useEffect, useState} from "react";
import {useRouter, useParams} from "next/navigation";
import {Card, CardHeader, CardTitle, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
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
        `/api/teacher/performance-detail?id=${performanceId}`
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

      const testRes = await fetch(
        `/api/teacher/assessments/tests/${data.test.testId}`
      );
      const testData = await testRes.json();
      setTest(testData);
      setIsLoading(false);
    };

    fetchData();
  }, [params.id, router]);

  const exportToCSV = async (detail: StudentPerformanceDetail) => {
    setIsSaving(true);
    try {
      let csvContent = "";

      csvContent += "=== STUDENT INFORMATION ===\n";
      csvContent += "Field,Value\n";
      csvContent += `"Student Name","${detail.student.studentName}"\n`;
      csvContent += `"Student ID","${detail.student.studentId}"\n`;
      csvContent += `"Email","${detail.student.email}"\n`;
      csvContent += `"Class","${detail.student.classGrade}"\n`;
      csvContent += "\n";

      csvContent += "=== TEST SUMMARY ===\n";
      csvContent += "Field,Value\n";
      csvContent += `"Test Title","${detail.test.testTitle}"\n`;
      csvContent += `"Score","${detail.test.score} out of ${detail.test.totalMarks}"\n`;
      csvContent += `"Percentage","${detail.test.percentage}%"\n`;
      csvContent += `"Status","${detail.test.status}"\n`;
      csvContent += `"Completion Time","${detail.test.completionTime} minutes"\n`;
      csvContent += `"Submitted At","${new Date(
        detail.test.submittedAt
      ).toLocaleString()}"\n`;
      csvContent += `"Total Questions","${detail.answers.length}"\n`;
      csvContent += "\n";

      csvContent += "=== ANSWER DETAILS ===\n";
      csvContent += "Question,Selected Option,Correct Option,Status\n";
      detail.answers.forEach((answer) => {
        const questionText = answer.question
          .replace(/"/g, '""')
          .replace(/\n/g, " ");
        csvContent += `"${questionText}","${answer.selected}","${answer.correct}","${answer.status}"\n`;
      });

      const blob = new Blob(["\ufeff" + csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${detail.student.studentName}_${detail.test.testTitle}_performance.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting CSV:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const exportToPDF = async (detail: StudentPerformanceDetail) => {
    const element = document.getElementById("studentPerformanceDetails");
    if (!element) return;

    setIsSaving(true);
    try {
      const html2pdfModule = await import("html2pdf.js");
      const html2pdf = html2pdfModule.default || html2pdfModule;

      const opt = {
        margin: [0.3, 0.3, 0.3, 0.3],
        filename: `${detail.student.studentName}_${detail.test.testTitle}_performance.pdf`,
        image: {type: "jpeg" as "jpeg" | "png" | "webp", quality: 0.98},
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          windowWidth: 800,
        },
        jsPDF: {
          unit: "in" as const,
          format: "a4" as const,
          orientation: "portrait" as const,
        },
        pagebreak: {mode: ["avoid-all", "css", "legacy"]},
      };

      await html2pdf().from(element).set(opt).save();
    } catch (error) {
      console.error("Error exporting PDF:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // PDF-friendly badge style
  const getBadgeStyle = (isSuccess: boolean) => ({
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: "9999px",
    fontSize: "12px",
    fontWeight: 500,
    color: "white",
    backgroundColor: isSuccess ? "#22c55e" : "#ef4444",
    overflow: "visible",
    whiteSpace: "nowrap" as const,
  });

  const getStatusBadgeStyle = (isPassed: boolean) => ({
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: "9999px",
    fontSize: "12px",
    fontWeight: 500,
    color: "white",
    backgroundColor: isPassed ? "#EF7B55" : "#ef4444",
    overflow: "visible",
    whiteSpace: "nowrap" as const,
  });

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
          onClick={() => router.push("/teacher/create-cbt?tab=performance")}
          className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Student Performance
        </Button>
        <p className="text-red-500">Performance data not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl">
        <Button
          variant="outline"
          onClick={() => router.push("/teacher/create-cbt?tab=performance")}
          className="mb-6 hover:text-[#f79771] bg-transparent hover:bg-transparent border-none">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Student Performance
        </Button>
        <h1 className="text-3xl font-bold mb-4">Student Performance Details</h1>
        <p className="text-muted-foreground mb-6">
          View detailed performance for {performanceDetail.student.studentName}
        </p>
        <div
          id="studentPerformanceDetails"
          className="space-y-6 bg-white p-6 rounded-lg"
          style={{maxWidth: "800px"}}>
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
                  {performanceDetail.test.percentage}%)
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <span
                  style={getStatusBadgeStyle(
                    performanceDetail.test.status === "Passed"
                  )}>
                  {performanceDetail.test.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completion Time</p>
                <p className="text-lg font-medium">
                  {performanceDetail.test.completionTime} minutes
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Submitted At</p>
                <p className="text-lg font-medium">
                  {new Date(
                    performanceDetail.test.submittedAt
                  ).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
          {/* 
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
                        <span
                          style={getBadgeStyle(answer.status === "Correct")}>
                          {answer.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card> */}

          <Card>
            <CardHeader>
              <CardTitle>Answer Details</CardTitle>
            </CardHeader>

            <CardContent className="p-0 sm:p-6">
              <div className="overflow-x-auto">
                <Table className="w-full">
                  {/* Desktop Header */}
                  <TableHeader className="hidden sm:table-header-group">
                    <TableRow>
                      <TableHead>Question</TableHead>
                      <TableHead>Selected Answer</TableHead>
                      <TableHead>Correct Answer</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {performanceDetail.answers.map((answer, index) => (
                      <TableRow
                        key={index}
                        className="
                block border-b last:border-b-0
                sm:table-row sm:border-0
              ">
                        {/* Question */}
                        <TableCell className="block sm:table-cell px-4 py-3">
                          <span className="text-xs font-semibold text-muted-foreground sm:hidden">
                            Question
                          </span>
                          <p className="mt-1 sm:mt-0">{answer.question}</p>
                        </TableCell>

                        {/* Selected Answer */}
                        <TableCell className="block sm:table-cell px-4 py-3">
                          <span className="text-xs font-semibold text-muted-foreground sm:hidden">
                            Selected Answer
                          </span>
                          <p className="mt-1 sm:mt-0">{answer.selected}</p>
                        </TableCell>

                        {/* Correct Answer */}
                        <TableCell className="block sm:table-cell px-4 py-3">
                          <span className="text-xs font-semibold text-muted-foreground sm:hidden">
                            Correct Answer
                          </span>
                          <p className="mt-1 sm:mt-0">{answer.correct}</p>
                        </TableCell>

                        {/* Status */}
                        <TableCell className="block sm:table-cell px-4 py-3">
                          <span className="text-xs font-semibold text-muted-foreground sm:hidden">
                            Status
                          </span>
                          <div className="mt-1 sm:mt-0">
                            <span
                              style={getBadgeStyle(
                                answer.status === "Correct"
                              )}>
                              {answer.status}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button
            variant="outline"
            className="hover:bg-[#f79771]/20"
            onClick={() => performanceDetail && exportToCSV(performanceDetail)}
            disabled={isSaving}>
            <Download className="mr-2 h-4 w-4" />
            Export to CSV
          </Button>
          <Button
            variant="outline"
            className="hover:bg-[#f79771]/20"
            onClick={() => performanceDetail && exportToPDF(performanceDetail)}
            disabled={isSaving}>
            <Download className="mr-2 h-4 w-4" />
            Export to PDF
          </Button>
        </div>
      </div>
    </div>
  );
}

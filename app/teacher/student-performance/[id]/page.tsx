"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Download,
  FileText,
  User,
  Mail,
  BookOpen,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  Award,
  Target,
  ArrowLeft,
} from "lucide-react";
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
      console.log("[DEBUG] performance detail answers:", data.answers);

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
        image: { type: "jpeg" as "jpeg" | "png" | "webp", quality: 0.98 },
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
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
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
    <div className="min-h-screen bg-gray-50/50 pb-12 pt-6">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        
        {/* Top Header & Actions */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <button
                onClick={() => router.push("/teacher/create-cbt?tab=performance")}
                className="hover:text-foreground transition-colors flex items-center text-sm font-medium"
              >
                 <ArrowLeft className="w-4 h-4 mr-1" />
                 Back to Student Performance
              </button>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
              <Award className="w-8 h-8 text-[#EF7B55]" />
              Performance Report
            </h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              Detailed assessment analysis for <span className="font-semibold text-foreground">{performanceDetail.student.studentName}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="shadow-sm hover:bg-slate-50 bg-white"
              onClick={() => performanceDetail && exportToCSV(performanceDetail)}
              disabled={isSaving}
            >
              <FileText className="mr-2 h-4 w-4 text-green-600" />
              CSV
            </Button>
            <Button
              className="shadow-sm bg-[#EF7B55] hover:bg-[#d66a47] text-white"
              onClick={() => performanceDetail && exportToPDF(performanceDetail)}
              disabled={isSaving}
            >
              <Download className="mr-2 h-4 w-4" />
              PDF Report
            </Button>
          </div>
        </div>

        <div id="studentPerformanceDetails" className="space-y-8">
          {/* Overview Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Student Profile Card */}
            <Card className="md:col-span-1 shadow-md border-t-4 border-t-blue-500 overflow-hidden border-x-0 border-b-0 md:border-x md:border-b">
              <CardHeader className="bg-slate-50/50 pb-4 border-b">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-500" />
                  Student Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold shrink-0">
                    {performanceDetail.student.studentName.charAt(0)}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold text-lg text-foreground truncate">{performanceDetail.student.studentName}</p>
                    <p className="text-sm text-muted-foreground truncate">{performanceDetail.student.studentId}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 pt-4 border-t">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="font-medium truncate">{performanceDetail.student.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <BookOpen className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="font-medium">{performanceDetail.student.classGrade}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Assessment Summary Card */}
            <Card className="md:col-span-2 shadow-md border-t-4 border-t-[#EF7B55] overflow-hidden border-x-0 border-b-0 md:border-x md:border-b">
              <CardHeader className="bg-slate-50/50 pb-4 border-b">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#EF7B55]" />
                  Assessment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Left col: Score & Chart */}
                  <div className="flex items-center justify-center md:justify-start gap-6 border-r-0 md:border-r border-slate-100 pr-0 md:pr-6">
                    <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="64" cy="64" r="56" className="text-slate-100" strokeWidth="12" stroke="currentColor" fill="transparent" />
                        <circle 
                          cx="64" cy="64" r="56" 
                          className={performanceDetail.test.percentage >= 70 ? "text-green-500" : performanceDetail.test.percentage >= 50 ? "text-yellow-500" : "text-red-500"} 
                          strokeWidth="12" 
                          strokeDasharray={56 * 2 * Math.PI} 
                          strokeDashoffset={56 * 2 * Math.PI - (performanceDetail.test.percentage / 100) * (56 * 2 * Math.PI)} 
                          strokeLinecap="round" 
                          stroke="currentColor" 
                          fill="transparent" 
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center text-center">
                        <span className="text-3xl font-extrabold">{performanceDetail.test.percentage}%</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Total Score</p>
                      <p className="text-3xl font-bold text-foreground">
                        {performanceDetail.test.score} <span className="text-lg font-normal text-muted-foreground">/ {performanceDetail.test.totalMarks}</span>
                      </p>
                      <div className="pt-2">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold shadow-sm inline-block ${
                            performanceDetail.test.status === "Passed"
                              ? "bg-green-100 text-green-700 border border-green-200"
                              : "bg-red-100 text-red-700 border border-red-200"
                          }`}
                        >
                          {performanceDetail.test.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right col: Details */}
                  <div className="flex flex-col justify-center space-y-5">
                    <div className="flex items-start gap-3">
                      <div className="bg-orange-100 p-2 rounded-md text-orange-600 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-semibold">Test Name</p>
                        <p className="font-medium text-foreground">
                          {performanceDetail.test.testTitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 p-2 rounded-md text-blue-600 shrink-0">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-semibold">Time Taken</p>
                        <p className="font-medium text-foreground">
                          {performanceDetail.test.completionTime} minutes
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="bg-purple-100 p-2 rounded-md text-purple-600 shrink-0">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-semibold">Submitted On</p>
                        <p className="font-medium text-foreground">
                          {new Date(performanceDetail.test.submittedAt).toLocaleString(undefined, {
                            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              </CardContent>
            </Card>
          </div>

          {/* Answers Table */}
          <Card className="shadow-md border-0 overflow-hidden rounded-xl">
            <CardHeader className="bg-white border-b px-6 py-5">
              <CardTitle className="text-lg font-semibold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Question Breakdown
                </span>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full font-medium text-xs border">
                  {performanceDetail.answers.length} Questions
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 bg-white">
              <div className="overflow-x-auto">
                <Table className="w-full">
                  <TableHeader className="bg-slate-50/80">
                    <TableRow className="hover:bg-transparent border-b">
                      <TableHead className="w-[60px] text-center font-bold text-slate-600">#</TableHead>
                      <TableHead className="font-semibold text-slate-600 w-[45%]">Question</TableHead>
                      <TableHead className="font-semibold text-slate-600">Student's Answer</TableHead>
                      <TableHead className="font-semibold text-slate-600">Correct Answer</TableHead>
                      <TableHead className="text-right font-semibold text-slate-600 pr-6">Result</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {performanceDetail.answers.map((answer, index) => (
                      <TableRow key={index} className="transition-colors hover:bg-slate-50/50 group border-b last:border-b-0">
                        <TableCell className="text-center font-medium text-muted-foreground/70 align-top pt-4">
                          {index + 1}
                        </TableCell>
                        <TableCell className="font-medium leading-relaxed text-slate-700 align-top pt-4 pb-4">
                          {answer.question}
                        </TableCell>
                        <TableCell className="align-top pt-4 pb-4">
                          <span className={`px-2.5 py-1.5 rounded-md text-sm font-medium inline-block ${
                            answer.status === "Correct" 
                              ? "bg-green-50 text-green-700 border border-green-100" 
                              : "bg-red-50 text-red-700 border border-red-100"
                          }`}>
                            {answer.selected || "No Answer"}
                          </span>
                        </TableCell>
                        <TableCell className="align-top pt-4 pb-4">
                          <span className="text-sm font-medium text-foreground bg-slate-100 px-2.5 py-1.5 rounded-md border border-slate-200 inline-block">
                            {answer.correct}
                          </span>
                        </TableCell>
                        <TableCell className="text-right pr-6 align-top pt-4 pb-4">
                          {answer.status === "Correct" ? (
                            <div className="flex items-center justify-end gap-1.5 text-green-600 font-bold text-sm">
                              <CheckCircle className="w-4 h-4" />
                              Correct
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5 text-red-600 font-bold text-sm">
                              <XCircle className="w-4 h-4" />
                              Incorrect
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

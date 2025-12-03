// "use client";

// import {useState} from "react";
// import DashboardLayout from "@/app/admin/layout";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {Button} from "@/components/ui/button";
// import {Badge} from "@/components/ui/badge";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {Download} from "lucide-react";

// export default function StudentPerformancePage() {
//   const [isSaving, setIsSaving] = useState(false);

//   // Sample data for demonstration; in a real app, this would come from props, context, or API
//   const selectedStudentPerformance = {
//     studentName: "John Doe",
//     studentId: "12345",
//     email: "john@example.com",
//     classGrade: "A",
//     testId: 1,
//     score: 85,
//     totalMarks: 100,
//     percentage: 85,
//     status: "Passed",
//     completionTime: 45,
//     submittedAt: new Date().toISOString(),
//     answers: [
//       {
//         question: "What is 2 + 2?",
//         selected: "4",
//         correct: "4",
//         status: "Correct",
//       },
//       {
//         question: "What is the capital of France?",
//         selected: "London",
//         correct: "Paris",
//         status: "Incorrect",
//       },
//       // Add more sample answers as needed
//     ],
//   };

//   const tests = [
//     {
//       id: 1,
//       title: "Sample Test Title",
//     },
//     // Add more sample tests as needed
//   ];

//   const exportToCSV = (data: any) => {
//     // Placeholder for CSV export logic
//     console.log("Exporting to CSV:", data);
//     // Implement actual CSV export here
//   };

//   const exportToPDF = (data: any) => {
//     // Placeholder for PDF export logic
//     console.log("Exporting to PDF:", data);
//     // Implement actual PDF export here (e.g., using jsPDF)
//   };

//   return (
//     <>
//       <div className="space-y-6">
//         {/* Header */}
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-bold tracking-tight text-foreground">
//               Student Performance Details
//             </h1>
//             <p className="text-muted-foreground mt-1">
//               View detailed performance for{" "}
//               {selectedStudentPerformance?.studentName}
//             </p>
//           </div>
//         </div>

//         {selectedStudentPerformance && (
//           <div id="studentPerformanceDetails" className="space-y-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Student Information</CardTitle>
//               </CardHeader>
//               <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <p className="text-sm text-muted-foreground">Student Name</p>
//                   <p className="text-lg font-medium">
//                     {selectedStudentPerformance.studentName}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-muted-foreground">Student ID</p>
//                   <p className="text-lg font-medium">
//                     {selectedStudentPerformance.studentId}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-muted-foreground">Email</p>
//                   <p className="text-lg font-medium">
//                     {selectedStudentPerformance.email}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-muted-foreground">Class</p>
//                   <p className="text-lg font-medium">
//                     {selectedStudentPerformance.classGrade}
//                   </p>
//                 </div>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardHeader>
//                 <CardTitle>Test Summary</CardTitle>
//               </CardHeader>
//               <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div>
//                   <p className="text-sm text-muted-foreground">Test Title</p>
//                   <p className="text-lg font-medium">
//                     {tests.find(
//                       (test) => test.id === selectedStudentPerformance.testId
//                     )?.title || "Unknown Test"}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-muted-foreground">Score</p>
//                   <p className="text-lg font-medium">
//                     {selectedStudentPerformance.score}/
//                     {selectedStudentPerformance.totalMarks} (
//                     {selectedStudentPerformance.percentage}%)
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-muted-foreground">Status</p>
//                   <Badge
//                     variant={
//                       selectedStudentPerformance.status === "Passed"
//                         ? "default"
//                         : "destructive"
//                     }
//                     className={
//                       selectedStudentPerformance.status === "Passed"
//                         ? "bg-[#EF7B55]"
//                         : "bg-red-500"
//                     }>
//                     {selectedStudentPerformance.status}
//                   </Badge>
//                 </div>
//                 <div>
//                   <p className="text-sm text-muted-foreground">
//                     Completion Time
//                   </p>
//                   <p className="text-lg font-medium">
//                     {selectedStudentPerformance.completionTime} minutes
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-muted-foreground">Submitted At</p>
//                   <p className="text-lg font-medium">
//                     {new Date(
//                       selectedStudentPerformance.submittedAt
//                     ).toLocaleString()}
//                   </p>
//                 </div>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardHeader>
//                 <CardTitle>Answer Details</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead>Question</TableHead>
//                       <TableHead>Selected Answer</TableHead>
//                       <TableHead>Correct Answer</TableHead>
//                       <TableHead>Status</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {selectedStudentPerformance.answers.map((answer, index) => (
//                       <TableRow key={index}>
//                         <TableCell>{answer.question}</TableCell>
//                         <TableCell>{answer.selected}</TableCell>
//                         <TableCell>{answer.correct}</TableCell>
//                         <TableCell>
//                           <Badge
//                             variant={
//                               answer.status === "Correct"
//                                 ? "default"
//                                 : "destructive"
//                             }
//                             className={
//                               answer.status === "Correct"
//                                 ? "bg-green-500"
//                                 : "bg-red-500"
//                             }>
//                             {answer.status}
//                           </Badge>
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </CardContent>
//             </Card>
//             <div className="flex justify-end gap-2">
//               <Button
//                 variant="outline"
//                 onClick={() => exportToCSV(selectedStudentPerformance)}
//                 disabled={isSaving}>
//                 <Download className="mr-2 h-4 w-4" />
//                 Export to CSV
//               </Button>
//               <Button
//                 variant="outline"
//                 onClick={() => exportToPDF(selectedStudentPerformance)}
//                 disabled={isSaving}>
//                 <Download className="mr-2 h-4 w-4" />
//                 Export to PDF
//               </Button>
//             </div>
//           </div>
//         )}
//       </div>
//     </>
//   );
// }
"use client";

import {useState, useEffect} from "react";
import {useParams} from "next/navigation";
import DashboardLayout from "@/app/admin/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {Download} from "lucide-react";

// Add type declarations for file-saver and html2pdf
// declare module "file-saver" {
//   export function saveAs(
//     data: Blob | string,
//     filename?: string,
//     options?: any
//   ): void;
// }

// declare module "html2pdf.js" {
//   const html2pdf: any;
//   export default html2pdf;
// }

// Import with type assertions
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

interface Test {
  id: string;
  title: string;
  start_at?: string;
  duration: number;
  questionsCount: number;
  total_marks?: number;
}

export default function StudentPerformancePage() {
  const {performanceId} = useParams<{performanceId: string}>();
  const [isSaving, setIsSaving] = useState(false);
  const [selectedStudentPerformance, setSelectedStudentPerformance] =
    useState<StudentPerformance | null>(null);
  const [tests, setTests] = useState<Test[]>([]);

  // Mock data for demonstration; in a real app, fetch from API using performanceId
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
    // Add more mock performances as needed
  ];

  const mockTests: Test[] = [
    {
      id: "1",
      title: "Sample Test Title",
      start_at: "2025-10-15T09:00:00Z",
      duration: 60,
      questionsCount: 20,
      total_marks: 100,
    },
    // Add more mock tests as needed
  ];

  useEffect(() => {
    // In a real app, fetch data using performanceId
    const performance = mockStudentPerformances.find(
      (p) => p.id === performanceId
    );
    setSelectedStudentPerformance(performance || null);
    setTests(mockTests);
  }, [performanceId]);

  const exportToCSV = (performance: StudentPerformance) => {
    const test = tests.find((t) => t.id === performance.testId);
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
    const test = tests.find((t) => t.id === performance.testId);
    if (!test) return;

    const element = document.getElementById("studentPerformanceDetails");
    if (!element) return;

    const opt = {
      margin: 1,
      filename: `${performance.studentName}_${test.title}_performance.pdf`,
      image: {type: "jpeg" as const, quality: 0.98},
      html2canvas: {scale: 2},
      jsPDF: {unit: "in", format: "letter", orientation: "portrait"},
    };
    html2pdf().from(element).set(opt).save();
  };

  if (!selectedStudentPerformance) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Student Performance Details
        </h1>
        <p className="text-muted-foreground mt-1">Performance not found.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Student Performance Details
            </h1>
            <p className="text-muted-foreground mt-1">
              View detailed performance for{" "}
              {selectedStudentPerformance?.studentName}
            </p>
          </div>
        </div>

        <div id="studentPerformanceDetails" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Information.....</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Student Name</p>
                <p className="text-lg font-medium">
                  {selectedStudentPerformance.studentName}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Student ID</p>
                <p className="text-lg font-medium">
                  {selectedStudentPerformance.studentId}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-lg font-medium">
                  {selectedStudentPerformance.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Class</p>
                <p className="text-lg font-medium">
                  {selectedStudentPerformance.classGrade}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Test Summary..</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Test Title</p>
                <p className="text-lg font-medium">
                  {tests.find(
                    (test) => test.id === selectedStudentPerformance.testId
                  )?.title || "Unknown Test"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Score</p>
                <p className="text-lg font-medium">
                  {selectedStudentPerformance.score}/
                  {selectedStudentPerformance.totalMarks} (
                  {selectedStudentPerformance.percentage}%)
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge
                  variant={
                    selectedStudentPerformance.status === "Passed"
                      ? "default"
                      : "destructive"
                  }
                  className={
                    selectedStudentPerformance.status === "Passed"
                      ? "bg-[#EF7B55]"
                      : "bg-red-500"
                  }>
                  {selectedStudentPerformance.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completion Time</p>
                <p className="text-lg font-medium">
                  {selectedStudentPerformance.completionTime} minutes
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Submitted At</p>
                <p className="text-lg font-medium">
                  {new Date(
                    selectedStudentPerformance.submittedAt
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
                  {selectedStudentPerformance.answers.map((answer, index) => (
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
              onClick={() => exportToCSV(selectedStudentPerformance)}
              disabled={isSaving}>
              <Download className="mr-2 h-4 w-4" />
              Export to CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => exportToPDF(selectedStudentPerformance)}
              disabled={isSaving}>
              <Download className="mr-2 h-4 w-4" />
              Export to PDF
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

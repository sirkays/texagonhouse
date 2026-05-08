"use client";

import React, { useState, useEffect } from "react";
import { UploadCloud, FileDown, Info, Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Classroom {
  id: number;
  name: string;
  class_type?: "public" | "private";
}

interface StudentResult {
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  classroom: string;
  admission_no: string;
}

export default function LoginGenerationPage() {
  const [activeTab, setActiveTab] = useState("excel");
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<string>("");

  const [file, setFile] = useState<File | null>(null);
  const [manualInput, setManualInput] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<StudentResult[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [duplicates, setDuplicates] = useState<{ name: string; classroom: string; reason: string }[]>([]);

  // Fetch Classrooms on mount
  useEffect(() => {
    async function fetchClassrooms() {
      try {
        const res = await fetch("/api/admin/classrooms?page_size=100&class_type=public");
        if (res.ok) {
          const data = await res.json();
          // Handle both paginated { results: [] } and flat array responses
          const list: Classroom[] = Array.isArray(data)
            ? data
            : Array.isArray(data.results)
              ? data.results
              : [];
          setClassrooms(list);
        } else {
          console.error("Failed to fetch classrooms", res.status);
        }
      } catch (error) {
        console.error("Failed to fetch classrooms", error);
      }
    }
    fetchClassrooms();
  }, []);

  const handleDownloadTemplate = async () => {
    try {
      const res = await fetch("/api/admin/login-generation/template");
      if (!res.ok) throw new Error("Failed to download template");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "student_login_template.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      toast.error("Template Download Failed", {
        description: "Could not retrieve the Excel template.",
      });
    }
  };

  const handleGenerateLogins = async () => {
    if (!selectedClassroom) {
      toast.error("Classroom Required", {
        description: "Please select a classroom for these students.",
      });
      return;
    }

    if (activeTab === "excel" && !file) {
      toast.error("File Required", {
        description: "Please upload an Excel file.",
      });
      return;
    }

    if (activeTab === "manual" && !manualInput.trim()) {
      toast.error("Input Required", {
        description: "Please enter student names.",
      });
      return;
    }

    setIsGenerating(true);
    setResults([]);
    setStats(null);
    setDuplicates([]);

    // Keep page alive warning (beforeunload event)
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    try {
      let res;

      if (activeTab === "excel") {
        const formData = new FormData();
        formData.append("mode", "excel");
        formData.append("classroom_id", selectedClassroom);
        formData.append("file", file!);

        res = await fetch("/api/admin/login-generation/generate", {
          method: "POST",
          body: formData,
        });
      } else {
        // Parse manual input (one name per line)
        const names = manualInput
          .split("\n")
          .map((n) => n.trim())
          .filter((n) => n.length > 0);

        const studentsData = names.map((name) => ({
          name,
          classroom_id: parseInt(selectedClassroom),
        }));

        res = await fetch("/api/admin/login-generation/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "manual",
            students: studentsData,
          }),
        });
      }

      // Safely parse the response — the backend may return non-JSON
      // (e.g. HTML error page) on production, which would crash res.json().
      const rawText = await res.text();
      let data: any;
      try {
        data = JSON.parse(rawText);
      } catch (_parseErr) {
        console.error("Non-JSON response from backend:", rawText.slice(0, 500));
        throw new Error(
          `Server returned an invalid response (status ${res.status}). ` +
          `This may indicate a timeout or server error on production. ` +
          `Please try again or contact support.`
        );
      }

      if (!res.ok) {
        throw new Error(data.detail || data.error || "Generation failed.");
      }

      setResults(data.students || []);
      setStats(data.stats || null);
      setDuplicates(data.duplicates || []);

      // Handle fallback case where the proxy couldn't parse the backend's
      // response (DRF browsable API HTML) but the operation likely succeeded.
      if (data.error === "non_json_response") {
        toast.warning("Accounts Likely Created", {
          description:
            "The server response could not be fully parsed. Please check the admin panel to verify accounts were created, then re-download credentials if needed.",
        });
      } else {
        const dupCount = data.duplicates?.length || 0;
        toast.success("Generation Successful!", {
          description: `Created ${data.students?.length || 0} account(s).${dupCount > 0 ? ` ${dupCount} duplicate(s) skipped — see results panel.` : ""
            }`,
        });
      }

    } catch (error: any) {
      toast.error("Generation Failed", {
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
      setIsGenerating(false);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    }
  };

  const handleDownloadResults = () => {
    if (!results || results.length === 0) return;

    // Format data for Excel
    const dataForExcel = results.map((r) => ({
      "Student Name": r.name,
      "Admission Number": r.admission_no,
      Classroom: r.classroom,
      "Login Email": r.email,
      "Default Password": r.password,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Generated Logins");

    // Adjust column widths
    const maxWidths = [25, 20, 15, 35, 20];
    worksheet["!cols"] = maxWidths.map((w) => ({ wch: w }));

    XLSX.writeFile(workbook, `student_logins_${new Date().getTime()}.xlsx`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Student Login Generation
        </h1>
        <p className="text-muted-foreground mt-1">
          Generate accounts and default credentials for students in bulk. Accounts
          automatically receive a 1-month Free tier subscription.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-4 border-b border-border/40">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Setup Generation
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">

              <div className="space-y-3">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Target Classroom
                </label>
                <Select
                  value={selectedClassroom}
                  onValueChange={setSelectedClassroom}
                  disabled={isGenerating}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select classroom..." />
                  </SelectTrigger>
                  <SelectContent>
                    {classrooms.length === 0 && (
                      <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                        No classrooms found.
                      </div>
                    )}
                    {classrooms.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id.toString()}>
                        <span className="flex items-center gap-2">
                          {cls.class_type === "public" && (
                            <span className="text-xs bg-blue-100 text-blue-700 rounded px-1.5 py-0.5 font-medium shrink-0">
                              🌐 Online
                            </span>
                          )}
                          {cls.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  All students in this batch will be assigned to this classroom.
                </p>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="excel" disabled={isGenerating}>Excel Upload</TabsTrigger>
                  <TabsTrigger value="manual" disabled={isGenerating}>Manual Entry</TabsTrigger>
                </TabsList>

                <TabsContent value="excel" className="space-y-4 outline-none">
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 bg-muted/40 rounded-lg border border-border/50">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">1. Download Template</p>
                      <p className="text-xs text-muted-foreground">
                        Get the structured Excel file format.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadTemplate}
                      disabled={isGenerating}
                      className="shrink-0"
                    >
                      <FileDown className="mr-2 h-4 w-4" />
                      Template
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">2. Upload Filled Template</p>
                    <div className="border-2 border-dashed border-border rounded-lg p-8 transition-colors hover:bg-muted/30 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                      <div className="flex flex-col items-center justify-center text-center gap-3">
                        <div className="p-3 bg-primary/10 text-primary rounded-full">
                          <UploadCloud className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            Drag & drop your Excel file here
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Only .xlsx files are supported
                          </p>
                        </div>
                        <input
                          type="file"
                          accept=".xlsx, .xls"
                          className="block w-full text-sm text-slate-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-primary/10 file:text-primary
                            hover:file:bg-primary/20
                            cursor-pointer mt-2"
                          onChange={(e) => setFile(e.target.files?.[0] || null)}
                          disabled={isGenerating}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="manual" className="space-y-4 outline-none">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Student Names</label>
                    <Textarea
                      placeholder="John Doe&#10;Jane Smith&#10;Alex Johnson"
                      className="min-h-[200px] resize-y font-mono text-sm"
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      disabled={isGenerating}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter one student name per line.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="pt-2 pb-6 px-6">
              <div className="flex flex-col w-full gap-3">
                {isGenerating && (
                  <Alert className="bg-primary/5 border-primary/20">
                    <Info className="h-4 w-4 text-primary" />
                    <AlertTitle className="text-primary">Generation in Progress</AlertTitle>
                    <AlertDescription className="text-xs">
                      Please do not close or refresh this page. This process runs within a secure transaction and may take a few moments.
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleGenerateLogins}
                  disabled={isGenerating || !selectedClassroom || (activeTab === "excel" && !file) || (activeTab === "manual" && !manualInput)}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating Accounts...
                    </>
                  ) : (
                    "Generate Logins"
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Results Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="h-full flex flex-col shadow-sm">
            <CardHeader className="bg-muted/30 border-b pb-4">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Generation Results</span>
                {results.length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                    {results.length} Success
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 pt-6 overflow-hidden flex flex-col">
              {!stats && results.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center space-y-3 opacity-60">
                  <FileDown className="h-10 w-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground max-w-[200px]">
                    Results and downloadable credentials will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-6 flex-1 overflow-y-auto pr-2">
                  {/* Stats Overview */}
                  {stats && (
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="p-3 bg-muted rounded-md flex flex-col">
                        <span className="text-xs text-muted-foreground">Accounts</span>
                        <span className="font-semibold">{stats.users_created}</span>
                      </div>
                      <div className="p-3 bg-muted rounded-md flex flex-col">
                        <span className="text-xs text-muted-foreground">Skipped (Exist)</span>
                        <span className="font-semibold text-amber-600">{stats.skipped_existing}</span>
                      </div>
                      {stats.duplicates > 0 && (
                        <div className="col-span-2 p-3 bg-red-50 border border-red-200 rounded-md flex flex-col">
                          <span className="text-xs text-red-500">Duplicates Skipped</span>
                          <span className="font-semibold text-red-600">{stats.duplicates}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Preview List */}
                  {results.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-foreground">Account Preview (First 5)</p>
                      <div className="space-y-2">
                        {results.slice(0, 5).map((r, i) => (
                          <div key={i} className="text-xs p-3 rounded border border-border/50 bg-background shadow-sm space-y-1.5">
                            <div className="font-semibold text-foreground truncate">{r.name}</div>
                            <div className="text-muted-foreground truncate font-mono text-[11px]">{r.email}</div>
                          </div>
                        ))}
                        {results.length > 5 && (
                          <div className="text-center text-xs text-muted-foreground pt-1">
                            + {results.length - 5} more students
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Duplicates Warning */}
                  {duplicates.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-red-600 flex items-center gap-1.5">
                        <span>⚠️</span> Duplicates Skipped ({duplicates.length})
                      </p>
                      <div className="space-y-1.5">
                        {duplicates.map((d, i) => (
                          <div key={i} className="text-xs p-2.5 rounded border border-red-200 bg-red-50 space-y-0.5">
                            <div className="font-semibold text-red-700 truncate">{d.name}</div>
                            <div className="text-red-500 truncate">{d.classroom}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>

            {results.length > 0 && (
              <CardFooter className="pt-4 border-t border-border/40 bg-muted/10">
                <Button
                  onClick={handleDownloadResults}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  Download Credentials
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

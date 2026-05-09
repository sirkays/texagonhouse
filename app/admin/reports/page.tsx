"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Download,
  FileText,
  BarChart3,
  TrendingUp,
  Users,
  BookOpen,
  DollarSign,
  Loader2,
  Calendar,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
  RefreshCw,
  Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

type ReportType = "student-performance" | "revenue" | "course-completion";
type ReportStatus = "idle" | "generating" | "success" | "error";

interface ReportDefinition {
  id: ReportType;
  name: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  gradientFrom: string;
  gradientTo: string;
  columns: string[];
  filename: string;
}

interface GenerationState {
  status: ReportStatus;
  message?: string;
}

// ─── Report definitions ───────────────────────────────────────────────────────

const REPORTS: ReportDefinition[] = [
  {
    id: "student-performance",
    name: "Student Performance",
    description:
      "Comprehensive analysis of student grades, test scores, assignment submissions, and course progress.",
    icon: Users,
    iconColor: "text-violet-500",
    gradientFrom: "from-violet-500/10",
    gradientTo: "to-purple-500/10",
    columns: [
      "Student ID",
      "Full Name",
      "Email",
      "Classroom",
      "Courses Enrolled",
      "Avg Progress",
      "Tests Attempted",
      "Avg Score",
      "Assignments Submitted",
    ],
    filename: "student_performance_report.csv",
  },
  {
    id: "revenue",
    name: "Revenue Report",
    description:
      "Financial overview including invoice history, subscription plans, payment statuses, and collection rates.",
    icon: DollarSign,
    iconColor: "text-emerald-500",
    gradientFrom: "from-emerald-500/10",
    gradientTo: "to-green-500/10",
    columns: [
      "Invoice #",
      "Issued Date",
      "Due Date",
      "Payer Name",
      "Payer Email",
      "Plan",
      "Amount",
      "Currency",
      "Status",
    ],
    filename: "revenue_report.csv",
  },
  {
    id: "course-completion",
    name: "Course Completion",
    description:
      "Track course progress, completion rates, enrollment counts, and student engagement per course.",
    icon: BookOpen,
    iconColor: "text-sky-500",
    gradientFrom: "from-sky-500/10",
    gradientTo: "to-blue-500/10",
    columns: [
      "Course ID",
      "Course Name",
      "Subject",
      "Teacher",
      "Classroom",
      "Status",
      "Total Enrolled",
      "New Enrollments",
      "Completed",
      "Completion Rate",
      "Avg Progress",
    ],
    filename: "course_completion_report.csv",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function firstDayOfMonthStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

function formatDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Quick-range presets ──────────────────────────────────────────────────────

const DATE_PRESETS = [
  {
    label: "This Month",
    from: () => firstDayOfMonthStr(),
    to: () => todayStr(),
  },
  {
    label: "Last 7 Days",
    from: () => {
      const d = new Date();
      d.setDate(d.getDate() - 6);
      return d.toISOString().slice(0, 10);
    },
    to: () => todayStr(),
  },
  {
    label: "Last 30 Days",
    from: () => {
      const d = new Date();
      d.setDate(d.getDate() - 29);
      return d.toISOString().slice(0, 10);
    },
    to: () => todayStr(),
  },
  {
    label: "Last 90 Days",
    from: () => {
      const d = new Date();
      d.setDate(d.getDate() - 89);
      return d.toISOString().slice(0, 10);
    },
    to: () => todayStr(),
  },
];

// ─── ReportCard component ─────────────────────────────────────────────────────

function ReportCard({
  report,
  dateFrom,
  dateTo,
}: {
  report: ReportDefinition;
  dateFrom: string;
  dateTo: string;
}) {
  const { toast } = useToast();
  const [state, setState] = useState<GenerationState>({ status: "idle" });
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);

  const Icon = report.icon;

  const handleGenerate = async () => {
    if (state.status === "generating") return;
    setState({ status: "generating" });

    try {
      const params = new URLSearchParams({
        type: report.id,
        ...(dateFrom ? { date_from: dateFrom } : {}),
        ...(dateTo ? { date_to: dateTo } : {}),
      });

      const response = await fetch(`/api/admin/reports?${params.toString()}`);

      if (!response.ok) {
        let errMsg = "Failed to generate report";
        try {
          const data = await response.json();
          errMsg = data?.error || errMsg;
        } catch {}
        setState({ status: "error", message: errMsg });
        toast({ title: "Error", description: errMsg, variant: "destructive" });
        return;
      }

      // Trigger browser download
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = report.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      const now = new Date().toISOString();
      setLastGenerated(now);
      setState({ status: "success" });

      toast({
        title: "Report Downloaded",
        description: `${report.name} has been downloaded successfully.`,
      });

      // Reset back to idle after 3 s
      setTimeout(() => setState({ status: "idle" }), 3000);
    } catch (err) {
      const msg = "An unexpected error occurred. Please try again.";
      setState({ status: "error", message: msg });
      toast({ title: "Error", description: msg, variant: "destructive" });
    }
  };

  const isGenerating = state.status === "generating";
  const isSuccess = state.status === "success";
  const isError = state.status === "error";

  return (
    <div className="group relative rounded-2xl border border-border/60 bg-card overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-border">
      {/* Gradient accent top */}
      <div
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${report.gradientFrom.replace("/10", "")} ${report.gradientTo.replace("/10", "")}`}
      />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div
            className={`h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br ${report.gradientFrom} ${report.gradientTo} border border-border/60 flex items-center justify-center`}
          >
            <Icon className={`h-6 w-6 ${report.iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-base leading-tight">
              {report.name}
            </h3>
            <p className="text-muted-foreground text-sm mt-0.5 leading-relaxed">
              {report.description}
            </p>
          </div>
        </div>

        {/* Columns preview */}
        <div className="mb-5">
          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
            Included columns
          </p>
          <div className="flex flex-wrap gap-1.5">
            {report.columns.slice(0, 6).map((col) => (
              <span
                key={col}
                className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-muted/70 text-muted-foreground"
              >
                {col}
              </span>
            ))}
            {report.columns.length > 6 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-muted/70 text-muted-foreground">
                +{report.columns.length - 6} more
              </span>
            )}
          </div>
        </div>

        {/* Last generated */}
        {lastGenerated && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
            <Clock className="h-3 w-3" />
            <span>Last generated: {formatDate(lastGenerated)}</span>
          </div>
        )}

        {/* Error message */}
        {isError && state.message && (
          <div className="flex items-center gap-2 text-xs text-destructive mb-4 p-2.5 rounded-lg bg-destructive/10">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{state.message}</span>
          </div>
        )}

        {/* Action */}
        <Button
          id={`generate-${report.id}`}
          onClick={handleGenerate}
          disabled={isGenerating}
          className={`w-full font-medium transition-all ${
            isSuccess
              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
              : isError
              ? "bg-destructive/90 hover:bg-destructive text-destructive-foreground"
              : ""
          }`}
          variant={isSuccess || isError ? "default" : "default"}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating…
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Downloaded!
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Generate &amp; Download CSV
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [dateFrom, setDateFrom] = useState(firstDayOfMonthStr());
  const [dateTo, setDateTo] = useState(todayStr());
  const [activePreset, setActivePreset] = useState("This Month");

  const applyPreset = (preset: (typeof DATE_PRESETS)[number]) => {
    setDateFrom(preset.from());
    setDateTo(preset.to());
    setActivePreset(preset.label);
  };

  // When user manually changes dates, clear preset highlight
  const handleDateChange =
    (setter: typeof setDateFrom) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      setActivePreset("");
    };

  const dateLabel =
    dateFrom && dateTo
      ? `${formatDate(dateFrom)} – ${formatDate(dateTo)}`
      : "All time";

  return (
    <>
      <div className="space-y-8">
        {/* ── Page Header ──────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Reports &amp; Analytics
            </h1>
            <p className="text-muted-foreground mt-1.5">
              Generate and download detailed CSV reports for your organisation.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 border border-border/60 rounded-lg px-3 py-2">
            <FileSpreadsheet className="h-4 w-4 shrink-0 text-primary" />
            <span>Reports export as CSV files</span>
          </div>
        </div>

        {/* ── Date Range ───────────────────────────────────────────────────── */}
        <Card className="border-border/60">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Date Range Filter</CardTitle>
            </div>
            <CardDescription>
              Select the period to include in all reports. Currently:{" "}
              <span className="font-medium text-foreground">{dateLabel}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Preset pills */}
            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">
                Quick Presets
              </Label>
              <div className="flex flex-wrap gap-2">
                {DATE_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    id={`preset-${p.label.toLowerCase().replace(/\s+/g, "-")}`}
                    onClick={() => applyPreset(p)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                      activePreset === p.label
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/50 text-muted-foreground border-border/60 hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual pickers */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="date-from" className="text-sm">
                  From Date
                </Label>
                <Input
                  id="date-from"
                  type="date"
                  value={dateFrom}
                  max={dateTo || todayStr()}
                  onChange={handleDateChange(setDateFrom)}
                  className="bg-background"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="date-to" className="text-sm">
                  To Date
                </Label>
                <Input
                  id="date-to"
                  type="date"
                  value={dateTo}
                  min={dateFrom}
                  max={todayStr()}
                  onChange={handleDateChange(setDateTo)}
                  className="bg-background"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Summary Stats ────────────────────────────────────────────────── */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-border/60">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-violet-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Student Report</p>
                  <p className="text-xs text-muted-foreground/70">
                    Performance &amp; progress
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Revenue Report</p>
                  <p className="text-xs text-muted-foreground/70">
                    Billing &amp; invoices
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-sky-500/10 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-sky-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Course Report</p>
                  <p className="text-xs text-muted-foreground/70">
                    Completion &amp; enrollment
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Report Cards ─────────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              Available Reports
            </h2>
            <Badge variant="secondary" className="ml-1">
              {REPORTS.length}
            </Badge>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {REPORTS.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                dateFrom={dateFrom}
                dateTo={dateTo}
              />
            ))}
          </div>
        </div>

        {/* ── How it works ─────────────────────────────────────────────────── */}
        <Card className="border-border/60 bg-muted/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">How Report Generation Works</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {[
                "Select your desired date range using the presets or custom date pickers above.",
                'Click "Generate & Download CSV" on the report you need.',
                "The system queries live data from your organisation's database.",
                "A CSV file is automatically downloaded to your device — open it in Excel, Google Sheets, or any spreadsheet app.",
              ].map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                  <span className="h-5 w-5 shrink-0 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

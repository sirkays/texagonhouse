"use client";

import {useState} from "react";
import DashboardLayout from "@/app/admin/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {
  Download,
  FileText,
  BarChart3,
  PieChart,
  TrendingUp,
} from "lucide-react";
import {GenerateReportModal} from "@/components/admin/modals/generate-report-modal";

export default function ReportsPage() {
  const [generatingReport, setGeneratingReport] = useState<any>(null);

  const reports = [
    {
      id: 1,
      name: "Student Performance Report",
      description: "Comprehensive analysis of student grades and progress",
      icon: BarChart3,
      lastGenerated: "2024-03-15",
    },
    {
      id: 2,
      name: "Revenue Report",
      description: "Financial overview and subscription analytics",
      icon: TrendingUp,
      lastGenerated: "2024-03-16",
    },
    {
      id: 3,
      name: "Course Completion",
      description: "Track course progress and completion rates",
      icon: FileText,
      lastGenerated: "2024-03-13",
    },
  ];

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Generate and download comprehensive reports
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Reports Generated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">234</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">45</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Scheduled Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">12</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Data Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">1.2M</div>
            </CardContent>
          </Card>
        </div>

        {/* Available Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Available Reports</CardTitle>
            <CardDescription>
              Generate custom reports for your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <report.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">
                      {report.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {report.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Last generated: {report.lastGenerated}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setGeneratingReport(report)}>
                    <Download className="mr-2 h-3 w-3" />
                    Generate
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generate Report Modal */}
      <GenerateReportModal
        open={!!generatingReport}
        onOpenChange={(open) => !open && setGeneratingReport(null)}
        report={generatingReport}
      />
    </>
  );
}

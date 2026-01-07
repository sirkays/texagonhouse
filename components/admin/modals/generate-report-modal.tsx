"use client";

import {useState} from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {Calendar} from "@/components/ui/calendar";
import {Checkbox} from "@/components/ui/checkbox";
import {Download, FileText} from "lucide-react";
import {useToast} from "@/hooks/use-toast";

interface GenerateReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: any;
}

export function GenerateReportModal({
  open,
  onOpenChange,
  report,
}: GenerateReportModalProps) {
  const {toast} = useToast();
  const [dateFrom, setDateFrom] = useState<Date | undefined>(new Date());
  const [dateTo, setDateTo] = useState<Date | undefined>(new Date());
  const [format, setFormat] = useState("pdf");
  const [includeCharts, setIncludeCharts] = useState(true);

  const handleGenerate = () => {
    toast({
      title: "Generating Report",
      description: `${report.name} is being generated. This may take a moment...`,
    });

    setTimeout(() => {
      toast({
        title: "Report Ready",
        description: "Your report has been generated and downloaded.",
      });
      onOpenChange(false);
    }, 2000);
  };

  if (!report) return null;

  return (
    // <Dialog open={open} onOpenChange={onOpenChange}>
    //   <DialogContent className="max-w-2xl">
    //     <DialogHeader>
    //       <div className="flex items-start gap-4">
    //         <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
    //           <report.icon className="h-6 w-6 text-primary" />
    //         </div>
    //         <div>
    //           <DialogTitle className="text-xl">{report.name}</DialogTitle>
    //           <DialogDescription>{report.description}</DialogDescription>
    //         </div>
    //       </div>
    //     </DialogHeader>

    //     <div className="space-y-6 mt-6">
    //       {/* Date Range */}
    //       <div className="grid grid-cols-2 gap-4">
    //         <div className="space-y-2">
    //           <Label>From Date</Label>
    //           <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} className="rounded-md border" />
    //         </div>
    //         <div className="space-y-2">
    //           <Label>To Date</Label>
    //           <Calendar mode="single" selected={dateTo} onSelect={setDateTo} className="rounded-md border" />
    //         </div>
    //       </div>

    //       {/* Format Selection */}
    //       <div className="space-y-2">
    //         <Label>Export Format</Label>
    //         <Select value={format} onValueChange={setFormat}>
    //           <SelectTrigger>
    //             <SelectValue />
    //           </SelectTrigger>
    //           <SelectContent>
    //             <SelectItem value="pdf">PDF Document</SelectItem>
    //             <SelectItem value="excel">Excel Spreadsheet</SelectItem>
    //             <SelectItem value="csv">CSV File</SelectItem>
    //           </SelectContent>
    //         </Select>
    //       </div>

    //       {/* Options */}
    //       <div className="space-y-3">
    //         <Label>Report Options</Label>
    //         <div className="flex items-center space-x-2">
    //           <Checkbox
    //             id="charts"
    //             checked={includeCharts}
    //             onCheckedChange={(checked) => setIncludeCharts(checked as boolean)}
    //           />
    //           <label
    //             htmlFor="charts"
    //             className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
    //           >
    //             Include charts and visualizations
    //           </label>
    //         </div>
    //       </div>

    //       {/* Preview Info */}
    //       <div className="p-4 rounded-lg bg-muted">
    //         <div className="flex items-center gap-2 mb-2">
    //           <FileText className="h-4 w-4 text-muted-foreground" />
    //           <span className="text-sm font-medium">Report Preview</span>
    //         </div>
    //         <p className="text-sm text-muted-foreground">
    //           This report will include data from {dateFrom?.toLocaleDateString()} to {dateTo?.toLocaleDateString()}
    //         </p>
    //       </div>
    //     </div>

    //     <DialogFooter>
    //       <Button variant="outline" onClick={() => onOpenChange(false)}>
    //         Cancel
    //       </Button>
    //       <Button onClick={handleGenerate}>
    //         <Download className="mr-2 h-4 w-4" />
    //         Generate Report
    //       </Button>
    //     </DialogFooter>
    //   </DialogContent>
    // </Dialog>

    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] h-[90dvh] max-w-2xl p-4 sm:p-6 overflow-auto">
        <DialogHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="h-12 w-12 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
              <report.icon className="h-6 w-6 text-primary" />
            </div>

            <div>
              <DialogTitle className="text-lg sm:text-xl">
                {report.name}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {report.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {/* Date Range */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>From Date</Label>
              <Calendar
                mode="single"
                selected={dateFrom}
                onSelect={setDateFrom}
                className="w-full rounded-md border"
              />
            </div>

            <div className="space-y-2">
              <Label>To Date</Label>
              <Calendar
                mode="single"
                selected={dateTo}
                onSelect={setDateTo}
                className="w-full rounded-md border"
              />
            </div>
          </div>

          {/* Format Selection */}
          <div className="space-y-2">
            <Label>Export Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF Document</SelectItem>
                <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                <SelectItem value="csv">CSV File</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <Label>Report Options</Label>
            <div className="flex items-start gap-2">
              <Checkbox
                id="charts"
                checked={includeCharts}
                onCheckedChange={(checked) =>
                  setIncludeCharts(checked as boolean)
                }
              />
              <label
                htmlFor="charts"
                className="text-sm font-medium leading-tight">
                Include charts and visualizations
              </label>
            </div>
          </div>

          {/* Preview Info */}
          <div className="rounded-lg bg-muted p-4">
            <div className="mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Report Preview</span>
            </div>
            <p className="text-sm text-muted-foreground">
              This report will include data from{" "}
              {dateFrom?.toLocaleDateString()} to {dateTo?.toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto">
            Cancel
          </Button>

          <Button onClick={handleGenerate} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

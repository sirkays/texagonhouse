"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Upload,
  Printer,
  AlertCircle,
  Download,
  Eye,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import Image from "next/image";

type ManualCertificate = {
  id: number;
  student_name: string;
  course_name: string;
  school_name: string;
  number: string;
  created_at: string;
  issued_by: string;
};

/* ───────────────────────────────────────────────────────────
   Certificate Preview Component — uses certificate.png
   as background with details overlaid at correct positions
   ─────────────────────────────────────────────────────────── */
function CertificatePreview({
  cert,
}: {
  cert: ManualCertificate;
}) {
  return (
    <div className="relative w-full aspect-[1260/820] select-none">
      {/* Background image — the actual Techxagon certificate */}
      <Image
        src="/certificate.png"
        fill
        className="object-contain"
        alt="Certificate background"
        priority
      />

      {/* Student Name — positioned between "This is to certify that" and "has successfully completed" */}
      <div
        className="absolute flex items-center justify-center"
        style={{ top: "37%", left: "35%", right: "8%", height: "12%" }}
      >
        <p
          className="text-center w-full"
          style={{
            fontFamily: "'Dancing Script', 'Brush Script MT', cursive",
            fontSize: "clamp(0.8rem, 3.5vw, 2.8rem)",
            lineHeight: "1.1",
            color: "#000000",
            fontWeight: 400,
          }}
        >
          {cert.student_name}
        </p>
      </div>

      {/* Course Name — positioned below "has successfully completed the program" */}
      <div
        className="absolute flex items-start justify-center"
        style={{ top: "57%", left: "35%", right: "8%", height: "10%" }}
      >
        <p
          className="text-center w-full"
          style={{
            fontSize: "clamp(0.45rem, 1.6vw, 1.1rem)",
            lineHeight: "1.4",
            color: "#000000",
            fontWeight: 800,
          }}
        >
          {cert.course_name}
        </p>
      </div>

      {/* School Name — if provided, below the course name */}
      {cert.school_name && (
        <div
          className="absolute flex items-start justify-center"
          style={{ top: "63%", left: "35%", right: "8%", height: "6%" }}
        >
          <p
            className="text-center w-full"
            style={{
              fontSize: "clamp(0.4rem, 1.3vw, 0.9rem)",
              lineHeight: "1.4",
              color: "#333333",
              fontWeight: 700,
            }}
          >
            at {cert.school_name}
          </p>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────────────────────────────────────────
   Main Page Component
   ─────────────────────────────────────────────────────────── */
export default function ManualCertificatePage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [certificates, setCertificates] = useState<ManualCertificate[]>([]);
  const { toast } = useToast();

  // Preview state — when set, full-page preview is shown
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const fetchCertificates = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/certificates/manual-list");
      const data = await res.json();
      if (!res.ok)
        throw new Error(
          data.error || data.detail || "Failed to fetch certificates"
        );
      setCertificates(data.results || []);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/certificates/manual-upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.detail || "Failed to upload file");
      }

      toast({
        title: "Success",
        description: data.detail || "Certificates imported successfully.",
      });

      setFile(null);
      fetchCertificates();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handlePrintSingle = () => {
    window.print();
  };

  const handleDownloadTemplate = () => {
    const wsData = [
      ["Student Name", "Course Name", "School Name"],
      ["John Doe", "Introduction to Python", "Techxagon Academy"],
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws["!cols"] = [{ wch: 20 }, { wch: 30 }, { wch: 25 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Manual_Certificate_Template.xlsx");
  };

  const previewCert =
    previewIndex !== null ? certificates[previewIndex] : null;

  /* ─── PREVIEW MODE (full-page, responsive) ─── */
  if (previewCert !== null && previewIndex !== null) {
    const hasPrev = previewIndex > 0;
    const hasNext = previewIndex < certificates.length - 1;

    return (
      <div className="min-h-[80vh] flex flex-col">
        {/* Top bar — hidden in print */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 print:hidden">
          <Button
            variant="ghost"
            onClick={() => setPreviewIndex(null)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to list
          </Button>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Navigate between certificates */}
            <Button
              variant="outline"
              size="sm"
              disabled={!hasPrev}
              onClick={() => setPreviewIndex(previewIndex - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {previewIndex + 1} of {certificates.length}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasNext}
              onClick={() => setPreviewIndex(previewIndex + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>

            <Button variant="outline" size="sm" onClick={handlePrintSingle}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
          </div>
        </div>

        {/* Certificate details bar — hidden in print */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-6 mb-4 px-1 print:hidden">
          <div>
            <span className="text-xs text-muted-foreground">Student</span>
            <p className="text-sm font-semibold">{previewCert.student_name}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Course</span>
            <p className="text-sm font-semibold">{previewCert.course_name}</p>
          </div>
          {previewCert.school_name && (
            <div>
              <span className="text-xs text-muted-foreground">School</span>
              <p className="text-sm font-semibold">
                {previewCert.school_name}
              </p>
            </div>
          )}
          <div>
            <span className="text-xs text-muted-foreground">Cert No</span>
            <p className="text-sm font-mono">{previewCert.number}</p>
          </div>
        </div>

        {/* The certificate itself — fills the available width responsively */}
        <div className="flex-1 flex items-start justify-center">
          <div className="w-full max-w-5xl">
            <CertificatePreview cert={previewCert} />
          </div>
        </div>
      </div>
    );
  }

  /* ─── LIST MODE ─── */
  return (
    <div className="space-y-6 px-2 sm:px-0 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between print:hidden">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Manual Certificates
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Generate and manage certificates manually via Excel upload.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              if (certificates.length > 0) setPreviewIndex(0);
            }}
            variant="outline"
            disabled={certificates.length === 0}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview All
          </Button>
          <Button
            onClick={() => window.print()}
            variant="outline"
            disabled={certificates.length === 0}
          >
            <Printer className="w-4 h-4 mr-2" />
            Print All
          </Button>
        </div>
      </div>

      {/* Upload Section */}
      <Card className="print:hidden">
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            Upload Excel Sheet
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadTemplate}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </Button>
          </CardTitle>
          <CardDescription>
            Upload an <code>.xlsx</code> file with columns: &quot;Student
            Name&quot;, &quot;Course Name&quot;, and optionally &quot;School
            Name&quot;.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="excel">Excel File</Label>
              <Input
                id="excel"
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
              />
            </div>
            <Button
              onClick={handleUpload}
              disabled={!file || isUploading}
            >
              {isUploading ? (
                "Uploading..."
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" /> Upload
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated Certificates List */}
      <div className="print:hidden">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Previously Generated
        </h2>
        {isLoading ? (
          <div className="text-muted-foreground text-sm">
            Loading certificates...
          </div>
        ) : certificates.length === 0 ? (
          <div className="p-8 text-center border rounded-lg bg-muted/10 text-muted-foreground flex flex-col items-center justify-center">
            <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
            No manual certificates found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {certificates.map((cert, idx) => (
              <Card key={cert.id} className="overflow-hidden">
                <CardHeader className="p-4 pb-2 bg-muted/10 border-b">
                  <CardTitle className="text-base truncate">
                    {cert.student_name}
                  </CardTitle>
                  <CardDescription className="text-xs truncate">
                    {cert.number} •{" "}
                    {new Date(cert.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="text-sm">
                    <strong>Course:</strong> {cert.course_name}
                  </div>
                  {cert.school_name && (
                    <div className="text-sm">
                      <strong>School:</strong> {cert.school_name}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-xs text-muted-foreground">
                      Issued by {cert.issued_by}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewIndex(idx)}
                    >
                      <Eye className="w-4 h-4 mr-1" /> Preview
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Print-only layout */}
      <div className="hidden print:block print:w-full">
        {certificates.map((cert, index) => (
          <div
            key={cert.id}
            className="w-full flex items-center justify-center"
            style={{
              pageBreakAfter:
                index === certificates.length - 1 ? "auto" : "always",
            }}
          >
            <CertificatePreview cert={cert} />
          </div>
        ))}
      </div>
    </div>
  );
}

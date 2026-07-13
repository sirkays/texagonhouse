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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import Image from "next/image";

type TemplateType = "techxagon" | "akure";

type ManualCertificate = {
  id: number;
  student_name: string;
  course_name: string;
  school_name: string;
  template: TemplateType;
  number: string;
  created_at: string;
  issued_by: string;
};

const TEMPLATE_LABELS: Record<TemplateType, string> = {
  techxagon: "Techxagon (Completion)",
  akure: "Akure (Achievement)",
};

/* ───────────────────────────────────────────────────────────
   Techxagon Certificate Preview — certificate.png
   ─────────────────────────────────────────────────────────── */
function TechxagonCertPreview({ cert }: { cert: ManualCertificate }) {
  return (
    <div className="relative w-full aspect-[1260/820] select-none">
      <Image
        src="/certificate.png"
        fill
        className="object-contain"
        alt="Techxagon Certificate"
        priority
      />

      {/* Student Name */}
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

      {/* Course Name */}
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

      {/* Center Name */}
      {cert.school_name && (
        <div
          className="absolute flex items-center justify-center"
          style={{ bottom: "5%", left: "35%", right: "8%", height: "6%" }}
        >
          <p
            style={{
              fontFamily: "'Georgia', 'Times New Roman', serif",
              fontSize: "clamp(0.85rem, 1.8vw, 1.3rem)",
              color: "#1a1a1a",
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              textAlign: "center",
            }}
          >
            <span style={{ opacity: 0.7, fontWeight: 600, marginRight: "0.2em" }}>CENTER:</span>
            {cert.school_name}
          </p>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────────────────────────────────────────
   Akure Certificate Preview — akure_cert_image.png
   With CEO + FEO signatures
   ─────────────────────────────────────────────────────────── */
function AkureCertPreview({ cert }: { cert: ManualCertificate }) {
  return (
    <div className="relative w-full aspect-[1260/880] select-none">
      <Image
        src="/akure_cert_image.png"
        fill
        className="object-contain"
        alt="Akure Certificate of Achievement"
        priority
      />

      {/* Student Name — on the line below "THIS CERTIFICATE IS PROUDLY PRESENTED TO" */}
      <div
        className="absolute flex items-center justify-start"
        style={{ top: "35%", left: "3%", right: "40%", height: "14%" }}
      >
        <p
          className="w-full"
          style={{
            fontFamily: "'Dancing Script', 'Brush Script MT', cursive",
            fontSize: "clamp(0.7rem, 3vw, 2.5rem)",
            lineHeight: "1.1",
            color: "#000000",
            fontWeight: 400,
            textAlign: "center",
          }}
        >
          {cert.student_name}
        </p>
      </div>

      {/* Course Name — elegant certificate typography below the name underline */}
      <div
        className="absolute flex flex-col items-center justify-start"
        style={{ top: "49%", left: "1%", right: "40%", height: "14%" }}
      >
        {/* Thin decorative rule */}
        <div style={{
          width: "38%",
          height: "1px",
          background: "linear-gradient(to right, transparent, #b5561a, transparent)",
          marginBottom: "clamp(2px, 0.6vw, 6px)",
        }} />

        {/* Intro phrase — light italic serif */}
        <p style={{
          fontFamily: "'Georgia', 'Times New Roman', serif",
          fontSize: "clamp(0.55rem, 1.6vw, 1.15rem)",
          fontStyle: "italic",
          fontWeight: 400,
          letterSpacing: "0.12em",
          color: "#6b3a1f",
          textAlign: "center",
          margin: 0,
          lineHeight: 1.3,
        }}>
          for successfully completing
        </p>

        {/* Course name — bold uppercase with tracking */}
        <p style={{
          fontFamily: "'Georgia', 'Times New Roman', serif",
          fontSize: "clamp(0.7rem, 2.2vw, 1.65rem)",
          fontWeight: 700,
          letterSpacing: "0.18em",
          color: "#1a1a1a",
          textAlign: "center",
          textTransform: "uppercase",
          margin: "clamp(1px, 0.3vw, 4px) 0 0",
          lineHeight: 1.25,
          paddingLeft: "0.05em",
        }}>
          {cert.course_name}
        </p>
      </div>

      {/* CEO Signature — above "CEO TECHXAGON ACADEMY" */}
      <div
        className="absolute"
        style={{ bottom: "25%", left: "9%", width: "16%", height: "12%" }}
      >
        <Image
          src="/ceo.png"
          fill
          className="object-contain"
          alt="CEO Signature"
        />
      </div>

      {/* FEO Signature — above "FORCE EDUCATION OFFICER" */}
      <div
        className="absolute"
        style={{ bottom: "25%", left: "48%", width: "16%", height: "12%" }}
      >
        <Image
          src="/feo.png"
          fill
          className="object-contain"
          alt="FEO Signature"
        />
      </div>

      {/* Center Name */}
      {cert.school_name && (
        <div
          className="absolute flex items-center justify-center"
          style={{ bottom: "5%", left: "3%", right: "40%", height: "6%" }}
        >
          <p
            style={{
              fontFamily: "'Georgia', 'Times New Roman', serif",
              fontSize: "clamp(0.85rem, 1.8vw, 1.3rem)",
              color: "#1a1a1a",
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              textAlign: "center",
            }}
          >
            <span style={{ opacity: 0.7, fontWeight: 600, marginRight: "0.2em" }}>CENTER:</span>
            {cert.school_name}
          </p>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────────────────────────────────────────
   Unified Certificate Preview — picks the right template
   ─────────────────────────────────────────────────────────── */
function CertificatePreview({ cert }: { cert: ManualCertificate }) {
  if (cert.template === "akure") {
    return <AkureCertPreview cert={cert} />;
  }
  return <TechxagonCertPreview cert={cert} />;
}

/* ───────────────────────────────────────────────────────────
   Main Page Component
   ─────────────────────────────────────────────────────────── */
export default function ManualCertificatePage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [certificates, setCertificates] = useState<ManualCertificate[]>([]);
  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateType>("techxagon");
  const { toast } = useToast();

  const [selectedCerts, setSelectedCerts] = useState<number[]>([]);

  // Preview state
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
      setSelectedCerts([]);
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
    formData.append("template", selectedTemplate);

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
        {/* Top bar */}
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

        {/* Certificate details bar */}
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
          <div>
            <span className="text-xs text-muted-foreground">Template</span>
            <Badge variant="secondary" className="block mt-0.5">
              {TEMPLATE_LABELS[previewCert.template] || previewCert.template}
            </Badge>
          </div>
        </div>

        {/* The certificate itself — use full available width */}
        <div className="flex-1 flex items-start justify-center overflow-x-auto">
          <div id="cert-print-area" className="w-full">
            <CertificatePreview cert={previewCert} />
          </div>
        </div>

        {/* Global print override — hide sidebar/header added by layout */}
        <style>{`
          @media print {
            @page { margin: 0; size: landscape; }
            body * { visibility: hidden; }
            #cert-print-area, #cert-print-area * { visibility: visible; }
            #cert-print-area {
              position: fixed;
              top: 0; left: 0;
              width: 100vw;
              height: 100vh;
              margin: 0;
              padding: 0;
              display: flex;
              align-items: center;
              justify-content: center;
            }
          }
        `}</style>
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
            disabled={selectedCerts.length === 0}
          >
            <Printer className="w-4 h-4 mr-2" />
            Print Selected ({selectedCerts.length})
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
          <div className="space-y-4">
            {/* Template Selector */}
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="template-select">Certificate Template</Label>
              <Select
                value={selectedTemplate}
                onValueChange={(v) => setSelectedTemplate(v as TemplateType)}
              >
                <SelectTrigger id="template-select" className="w-full">
                  <SelectValue placeholder="Select a template..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="techxagon">
                    Techxagon — Certificate of Completion
                  </SelectItem>
                  <SelectItem value="akure">
                    Akure — Certificate of Achievement
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Template Preview Thumbnails */}
            <div className="flex gap-4 flex-wrap">
              <button
                type="button"
                onClick={() => setSelectedTemplate("techxagon")}
                className={`relative w-48 aspect-[3/2] rounded-lg overflow-hidden border-2 transition-all ${
                  selectedTemplate === "techxagon"
                    ? "border-[#EF7B55] ring-2 ring-[#EF7B55]/30"
                    : "border-border hover:border-muted-foreground/50"
                }`}
              >
                <Image
                  src="/certificate.png"
                  fill
                  className="object-contain"
                  alt="Techxagon Template"
                />
                {selectedTemplate === "techxagon" && (
                  <div className="absolute top-1 right-1 bg-[#EF7B55] text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                    Selected
                  </div>
                )}
              </button>
              <button
                type="button"
                onClick={() => setSelectedTemplate("akure")}
                className={`relative w-48 aspect-[3/2] rounded-lg overflow-hidden border-2 transition-all ${
                  selectedTemplate === "akure"
                    ? "border-[#EF7B55] ring-2 ring-[#EF7B55]/30"
                    : "border-border hover:border-muted-foreground/50"
                }`}
              >
                <Image
                  src="/akure_cert_image.png"
                  fill
                  className="object-contain"
                  alt="Akure Template"
                />
                {selectedTemplate === "akure" && (
                  <div className="absolute top-1 right-1 bg-[#EF7B55] text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                    Selected
                  </div>
                )}
              </button>
            </div>

            {/* File + Upload */}
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
              <Button onClick={handleUpload} disabled={!file || isUploading}>
                {isUploading ? (
                  "Uploading..."
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" /> Upload &amp; Generate
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generated Certificates List */}
      {/* Generated Certificates List */}
      <div className="print:hidden">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            Previously Generated
          </h2>
          {certificates.length > 0 && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="select-all"
                checked={
                  selectedCerts.length > 0 &&
                  selectedCerts.length === certificates.length
                }
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedCerts(certificates.map((c) => c.id));
                  } else {
                    setSelectedCerts([]);
                  }
                }}
              />
              <Label htmlFor="select-all" className="cursor-pointer">
                Select All
              </Label>
            </div>
          )}
        </div>
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Checkbox
                        checked={selectedCerts.includes(cert.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedCerts((prev) => [...prev, cert.id]);
                          } else {
                            setSelectedCerts((prev) =>
                              prev.filter((id) => id !== cert.id)
                            );
                          }
                        }}
                      />
                      <CardTitle className="text-base truncate">
                        {cert.student_name}
                      </CardTitle>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        cert.template === "akure"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-orange-50 text-orange-700 border-orange-200"
                      }
                    >
                      {cert.template === "akure" ? "Akure" : "Techxagon"}
                    </Badge>
                  </div>
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
      {/* Print-only layout */}
      <div className="hidden print:block print:w-full" id="batch-print-area">
        <style>{`
          @media print {
            @page { margin: 0; size: landscape; }
            body * { visibility: hidden; }
            #batch-print-area, #batch-print-area * { visibility: visible; }
            #batch-print-area {
              position: absolute;
              top: 0; left: 0;
              width: 100vw;
              margin: 0;
              padding: 0;
            }
          }
        `}</style>
        {certificates
          .filter((cert) => selectedCerts.includes(cert.id))
          .map((cert, index, array) => (
          <div
            key={cert.id}
            className="w-full flex items-center justify-center overflow-hidden"
            style={{
              height: "100vh",
              pageBreakAfter: index === array.length - 1 ? "auto" : "always",
              pageBreakInside: "avoid",
            }}
          >
            <CertificatePreview cert={cert} />
          </div>
        ))}
      </div>
    </div>
  );
}

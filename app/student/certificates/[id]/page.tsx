"use client";

import {getCertificateById} from "@/lib/certificate-data";
import {CertificateTemplate} from "@/components/student/certificate-template";
import {downloadCertificateAsPDF} from "@/lib/pdf-utils";
import {ArrowLeft, Download, Share2, Printer} from "lucide-react";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {useState, useRef} from "react";
import {useParams} from "next/navigation";

export default function CertificatePage() {
  const params = useParams();
  const certificateId = params.id as string;
  const result = getCertificateById(certificateId);
  const [isDownloading, setIsDownloading] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  if (!result) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Certificate Not Found
          </h1>
          <p className="text-muted-foreground mb-6">
            The certificate you're looking for doesn't exist.
          </p>
          <Link href="/">
            <Button>Back to Certificates</Button>
          </Link>
        </div>
      </div>
    );
  }

  const {certificate, student} = result;
  const isDownloadable = certificate.isVerified && certificate.isTested;

  const handleDownload = async () => {
    if (!isDownloadable || !certificateRef.current) return;

    setIsDownloading(true);
    try {
      await downloadCertificateAsPDF(
        certificateRef.current,
        student.name,
        certificate.verificationId
      );
    } catch (error) {
      console.error("[v0] Download error:", error);
      alert("Failed to download certificate. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <main className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Certificates
            </Button>
          </Link>

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-2 bg-transparent">
              <Printer className="w-4 h-4" />
              Print
            </Button>
            <Button
              disabled={!isDownloadable || isDownloading}
              size="sm"
              onClick={handleDownload}
              className="gap-2">
              <Download className="w-4 h-4" />
              {isDownloading ? "Downloading..." : "Download PDF"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-transparent">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>
        </div>

        {/* Certificate Display */}
        <div className="mb-8" ref={certificateRef}>
          <CertificateTemplate
            className="mx-auto h-[600px] pb-5"
            certificate={certificate}
            student={student}
          />
        </div>

        {/* Certificate Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Student Info */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4 uppercase text-sm">
              Student Info
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Full Name</p>
                <p className="font-semibold text-foreground">{student.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-semibold text-foreground text-sm break-all">
                  {student.email}
                </p>
              </div>
            </div>
          </div>

          {/* Course Info */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4 uppercase text-sm">
              Course Info
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Course Name</p>
                <p className="font-semibold text-foreground">
                  {certificate.courseName}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Completion Date</p>
                <p className="font-semibold text-foreground">
                  {new Date(certificate.issuedDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Verification Status */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4 uppercase text-sm">
              Verification Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Student Verified
                </span>
                <span
                  className={`inline-block w-3 h-3 rounded-full ${
                    certificate.isVerified ? "bg-accent" : "bg-muted"
                  }`}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Test Passed
                </span>
                <span
                  className={`inline-block w-3 h-3 rounded-full ${
                    certificate.isTested ? "bg-primary" : "bg-muted"
                  }`}
                />
              </div>
              <div className="pt-3 mt-3 border-t border-border">
                <p
                  className={`text-sm font-semibold ${
                    isDownloadable ? "text-accent" : "text-muted-foreground"
                  }`}>
                  {isDownloadable
                    ? "✓ Ready for Download"
                    : "⊘ Pending Requirements"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Certificate ID */}
        <div className="mt-6 bg-muted/30 border border-border rounded-xl p-6 text-center">
          <p className="text-xs text-muted-foreground mb-2">
            Certificate Verification ID
          </p>
          <p className="text-lg font-mono font-bold text-foreground">
            {certificate.verificationId}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Use this ID to verify the authenticity of this certificate
          </p>
        </div>
      </div>
    </main>
  );
}

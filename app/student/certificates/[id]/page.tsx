"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Download, Share2, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { downloadCertificateAsPDF } from "@/lib/pdf-utils";
import { fetchCertificateById, type CertificateListItem } from "@/lib/certificates-api";
import { CertificateTemplate } from "@/components/student/certificate-template";

export default function CertificatePage() {
  const params = useParams();
  const certificateId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [certificate, setCertificate] = useState<CertificateListItem | null>(null);

  const [isDownloading, setIsDownloading] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const { certificate } = await fetchCertificateById(certificateId);
        if (!mounted) return;

        setCertificate(certificate);
        if (!certificate) setError("Certificate not found.");
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "Failed to load certificate");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [certificateId]);

  const isDownloadable = Boolean(certificate?.can_download);

  const handleDownload = async () => {
    if (!isDownloadable || !certificateRef.current || !certificate) return;

    setIsDownloading(true);
    try {
      // If you prefer server-generated PDF when available:
      // if (certificate.pdf_url) return window.open(certificate.pdf_url, "_blank");

      // Otherwise client-side PDF from the rendered template:
      await downloadCertificateAsPDF(
        certificateRef.current,
        certificate.student_name,
        certificate.number
      );
    } catch (error) {
      console.error("[v0] Download error:", error);
      alert("Failed to download certificate. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <main className="min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-5xl text-muted-foreground">
          Loading certificate…
        </div>
      </main>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Certificate Not Found
          </h1>
          <p className="text-muted-foreground mb-6">
            {error ?? "The certificate you're looking for doesn't exist."}
          </p>
          <Link href="/student/certificate">
            <Button>Back to Certificates</Button>
          </Link>
        </div>
      </div>
    );
  }

  const issuedDate = new Date(certificate.acquired_at).toLocaleDateString();
  const downloadableAt = certificate.downloadable_at
    ? new Date(certificate.downloadable_at).toLocaleDateString()
    : null;

  return (
    <main className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/student/certificate">
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
              className="gap-2 bg-transparent"
            >
              <Printer className="w-4 h-4" />
              Print
            </Button>

            <Button
              disabled={!isDownloadable || isDownloading}
              size="sm"
              onClick={handleDownload}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              {isDownloading ? "Downloading..." : "Download PDF"}
            </Button>

            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>
        </div>

        {/* Certificate Display */}
        <div className="mb-8" ref={certificateRef}>
          <CertificateTemplate
            className="mx-auto h-[600px] pb-5"
            // adapt your template props to accept backend item:
            certificate={certificate}
          />
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4 uppercase text-sm">
              Student Info
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Full Name</p>
                <p className="font-semibold text-foreground">{certificate.student_name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Student ID</p>
                <p className="font-semibold text-foreground">{certificate.student_id}</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4 uppercase text-sm">
              Course Info
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Course Name</p>
                <p className="font-semibold text-foreground">{certificate.course_name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Completion Date</p>
                <p className="font-semibold text-foreground">{issuedDate}</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4 uppercase text-sm">
              Download Status
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Can Download</span>
                <span
                  className={`inline-block w-3 h-3 rounded-full ${
                    isDownloadable ? "bg-primary" : "bg-muted"
                  }`}
                />
              </div>

              <div className="pt-3 mt-3 border-t border-border">
                <p
                  className={`text-sm font-semibold ${
                    isDownloadable ? "text-accent" : "text-muted-foreground"
                  }`}
                >
                  {isDownloadable
                    ? "✓ Ready for Download"
                    : downloadableAt
                      ? `⊘ Available on ${downloadableAt}`
                      : "⊘ Not yet available"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Certificate No */}
        <div className="mt-6 bg-muted/30 border border-border rounded-xl p-6 text-center">
          <p className="text-xs text-muted-foreground mb-2">
            Certificate Number
          </p>
          <p className="text-lg font-mono font-bold text-foreground">
            {certificate.number}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Use this number to verify authenticity
          </p>
        </div>
      </div>
    </main>
  );
}

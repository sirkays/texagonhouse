// components\student\certificate-card.tsx
"use client";

import Link from "next/link";
import type {Certificate, Student} from "@/lib/certificate-data";
import {Check, AlertCircle, Eye, Download} from "lucide-react";
import {Button} from "@/components/ui/button";

interface CertificateCardProps {
  certificate: Certificate;
  student: Student;
}

export function CertificateCard({certificate, student}: CertificateCardProps) {
  const isDownloadable = certificate.isVerified && certificate.isTested;
  const statusIcon = isDownloadable ? (
    <Check className="w-5 h-5 text-accent" />
  ) : (
    <AlertCircle className="w-5 h-5 text-muted-foreground" />
  );

  return (
    <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {statusIcon}
            <span
              className={`text-sm font-semibold ${
                isDownloadable ? "text-accent" : "text-muted-foreground"
              }`}>
              {isDownloadable ? "Ready for Download" : "Pending Verification"}
            </span>
          </div>
          <h3 className="text-lg font-bold text-card-foreground group-hover:text-primary transition-colors">
            {certificate.courseName}
          </h3>
        </div>
      </div>

      <div className="space-y-2 mb-6 text-sm text-muted-foreground">
        <p>
          <span className="font-semibold">Issued:</span>{" "}
          {new Date(certificate.issuedDate).toLocaleDateString()}
        </p>
        <p>
          <span className="font-semibold">ID:</span>{" "}
          {certificate.verificationId}
        </p>
        <div className="flex gap-3 pt-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              certificate.isVerified
                ? "bg-accent/10 text-accent"
                : "bg-muted text-muted-foreground"
            }`}>
            {certificate.isVerified ? "✓ Verified" : "Verification Pending"}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              certificate.isTested
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
            }`}>
            {certificate.isTested ? "✓ Tested" : "Test Pending"}
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        <Link
          href={`/student/certificates/${certificate.id}`}
          className="flex-1">
          <Button variant="outline" className="w-full gap-2 bg-transparent">
            <Eye className="w-4 h-4" />
            Preview
          </Button>
        </Link>
        <Button
          disabled={!isDownloadable}
          className="flex-1 gap-2"
          variant={isDownloadable ? "default" : "secondary"}>
          <Download className="w-4 h-4" />
          Download
        </Button>
      </div>
    </div>
  );
}

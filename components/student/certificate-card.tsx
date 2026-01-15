"use client";

import Link from "next/link";
import {Check, AlertCircle, Eye, Download} from "lucide-react";
import {Button} from "@/components/ui/button";
import type {CertificateListItem} from "@/lib/certificates-api";

interface CertificateCardProps {
  certificate: CertificateListItem;
}

export function CertificateCard({certificate}: CertificateCardProps) {
  const isDownloadable = Boolean(certificate.can_download);

  const statusIcon = isDownloadable ? (
    <Check className="w-5 h-5 text-[#f57c50]/70" />
  ) : (
    <AlertCircle className="w-5 h-5 text-muted-foreground" />
  );

  const issuedDate = new Date(certificate.acquired_at).toLocaleDateString();
  const downloadableAt = certificate.downloadable_at
    ? new Date(certificate.downloadable_at).toLocaleDateString()
    : null;

  return (
    <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 text-[#f57c50]/70">
            {statusIcon}
            <span
              className={`text-sm font-semibold ${
                isDownloadable ? "text-[#f57c50]/70" : "text-muted-foreground"
              }`}>
              {isDownloadable ? "Ready for Download" : "Pending Requirements"}
            </span>
          </div>

          <h3 className="text-lg font-bold text-card-foreground group-hover:text-primary transition-colors">
            {certificate.course_name}
          </h3>
        </div>
      </div>

      <div className="space-y-2 mb-6 text-sm text-muted-foreground">
        <p>
          <span className="font-semibold">Issued:</span> {issuedDate}
        </p>
        <p>
          <span className="font-semibold">Certificate No:</span>{" "}
          {certificate.number}
        </p>

        <div className="flex gap-3 pt-2 flex-wrap">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              certificate.status === "issued"
                ? "bg-[#f57c50]/20 text-slate-700"
                : "bg-[#f57c50]/10 text-[#f57c50"
            }`}>
            {certificate.status === "issued" ? "✓ Issued" : certificate.status}
          </span>

          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              isDownloadable
                ? "bg-[#f57c50]/20 text-slate-700"
                : "bg-[#f57c50]/10 text-[#f57c50"
            }`}>
            {isDownloadable
              ? "✓ Downloadable"
              : downloadableAt
              ? `Available: ${downloadableAt}`
              : "Not yet downloadable"}
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        <Link
          href={`/student/certificates/${certificate.id}`}
          className="flex-1">
          <Button
            variant="outline"
            className="mt-3 w-full flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium hover:bg-[#f57c50]/20 hover:text-accent-foreground transition-colors">
            <Eye className="w-4 h-4" />
            Preview
          </Button>
        </Link>
      </div>
    </div>
  );
}

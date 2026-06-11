"use client";

import Link from "next/link";
import {Check, AlertCircle, Eye, Download} from "lucide-react";
import {Button} from "@/components/ui/button";
import type {CertificateListItem} from "@/lib/certificates-api";
import {useStudentTheme} from "@/components/student/useStudentTheme";

interface CertificateCardProps {
  certificate: CertificateListItem;
}

export function CertificateCard({certificate}: CertificateCardProps) {
  const {theme} = useStudentTheme();
  const isAero = theme === "aero-premium";
  const isDownloadable = Boolean(certificate.can_download);

  const statusIcon = isDownloadable ? (
    <Check className={`w-5 h-5 ${isAero ? "text-[#EF7B55]" : "text-[#f57c50]/70"}`} />
  ) : (
    <AlertCircle className="w-5 h-5 text-muted-foreground" />
  );

  const issuedDate = new Date(certificate.acquired_at).toLocaleDateString();
  const downloadableAt = certificate.downloadable_at
    ? new Date(certificate.downloadable_at).toLocaleDateString()
    : null;

  return (
    <div className={isAero 
      ? "bg-white/60 backdrop-blur-md border border-slate-200/40 rounded-2xl p-6 hover:shadow-lg hover:border-[#EF7B55]/50 hover:translate-y-[-2px] transition-all duration-300 group flex flex-col justify-between h-full"
      : "bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 group"
    }>
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {statusIcon}
              <span
                className={`text-sm font-semibold ${
                  isDownloadable 
                    ? (isAero ? "text-[#EF7B55]" : "text-[#f57c50]/70") 
                    : "text-muted-foreground"
                }`}>
                {isDownloadable ? "Ready for Download" : "Pending Requirements"}
              </span>
            </div>

            <h3 className={`text-lg font-bold transition-colors ${
              isAero 
                ? "text-slate-800 group-hover:text-[#EF7B55]" 
                : "text-card-foreground group-hover:text-primary"
            }`}>
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
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                isAero
                  ? (certificate.status === "issued"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100/50"
                    : "bg-amber-50 text-amber-700 border border-amber-100/50")
                  : (certificate.status === "issued"
                    ? "bg-[#f57c50]/20 text-slate-700"
                    : "bg-[#f57c50]/10 text-[#f57c50]")
              }`}>
              {certificate.status === "issued" ? "✓ Issued" : certificate.status}
            </span>

            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                isAero
                  ? (isDownloadable
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100/50"
                    : "bg-slate-50 text-slate-550 border border-slate-200/50")
                  : (isDownloadable
                    ? "bg-[#f57c50]/20 text-slate-700"
                    : "bg-[#f57c50]/10 text-[#f57c50]")
              }`}>
              {isDownloadable
                ? "✓ Downloadable"
                : downloadableAt
                ? `Available: ${downloadableAt}`
                : "Not yet downloadable"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Link
          href={`/student/certificates/${certificate.id}`}
          className="flex-1">
          <Button
            variant="outline"
            className={isAero
              ? "mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold border-[#EF7B55] text-[#EF7B55] hover:bg-[#EF7B55] hover:text-white rounded-xl shadow-sm transition-all duration-300 bg-white/40"
              : "mt-3 w-full flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium hover:bg-[#f57c50]/20 hover:text-accent-foreground transition-colors"
            }>
            <Eye className="w-4 h-4" />
            Preview
          </Button>
        </Link>
      </div>
    </div>
  );
}


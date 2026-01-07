// components/student/certificate-card.tsx
"use client";

import Link from "next/link";
import { Check, AlertCircle, Eye, Download, Calendar, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiCertificate } from "@/lib/certificate-service";

interface CertificateCardProps {
  certificate: ApiCertificate;
}

export function CertificateCard({ certificate }: CertificateCardProps) {
  const isDownloadable = certificate.can_download;
  const isVerified = certificate.status === "issued";

  // Format date nicely
  const formattedDate = new Date(certificate.acquired_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300 group flex flex-col h-full">
      {/* Header / Status */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-background border border-border">
          {isDownloadable ? (
            <Check className="w-4 h-4 text-accent" />
          ) : (
            <AlertCircle className="w-4 h-4 text-muted-foreground" />
          )}
          <span className={`text-xs font-semibold ${
            isDownloadable ? "text-accent" : "text-muted-foreground"
          }`}>
            {isDownloadable ? "Ready" : "Pending"}
          </span>
        </div>
      </div>

      {/* Course Title */}
      <div className="mb-6 flex-1">
        <h3 className="text-xl font-bold text-card-foreground group-hover:text-primary transition-colors leading-tight mb-2">
          {certificate.course_name}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {certificate.title}
        </p>
      </div>

      {/* Metadata */}
      <div className="space-y-3 mb-6 pt-4 border-t border-border/50">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Issued</span>
          </div>
          <span className="font-medium text-foreground">{formattedDate}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Hash className="w-4 h-4" />
            <span>ID</span>
          </div>
          <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
            {certificate.number}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-auto">
        <Link
          href={`/student/certificates/${certificate.id}`}
          className="flex-1"
        >
          <Button variant="outline" className="w-full gap-2 bg-transparent hover:bg-primary/5 hover:text-primary border-border">
            <Eye className="w-4 h-4" />
            Preview
          </Button>
        </Link>
        
        {isDownloadable && certificate.pdf_url ? (
          <a 
            href={certificate.pdf_url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex-1"
          >
            <Button className="w-full gap-2 shadow-sm" variant="default">
              <Download className="w-4 h-4" />
              Download
            </Button>
          </a>
        ) : (
          <Button disabled className="flex-1 gap-2 opacity-80" variant="secondary">
            <Download className="w-4 h-4" />
            Download
          </Button>
        )}
      </div>
    </div>
  );
}
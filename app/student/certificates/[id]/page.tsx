// app/student/certificates/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  ApiCertificate, 
  ApiSignatures, 
  fetchCertificateById 
} from "@/lib/certificate-service";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Download, 
  CheckCircle, 
  Calendar, 
  Hash, 
  ShieldCheck, 
  FileText,
  Loader2,
  AlertCircle
} from "lucide-react";

export default function CertificateDetailPage() {
  const params = useParams();
  const [certificate, setCertificate] = useState<ApiCertificate | null>(null);
  const [signatures, setSignatures] = useState<ApiSignatures | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!params.id) return;
      
      const id = parseInt(params.id as string, 10);
      const data = await fetchCertificateById(id);
      
      if (data.certificate) {
        setCertificate(data.certificate);
        setSignatures(data.signatures);
      } else {
        setError(true);
      }
      setLoading(false);
    }
    loadData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <h1 className="text-2xl font-bold">Certificate Not Found</h1>
        <Link href="/student/certificate">
          <Button variant="outline">Back to My Certificates</Button>
        </Link>
      </div>
    );
  }

  const isIssued = certificate.status === "issued";
  const formattedDate = new Date(certificate.acquired_at).toLocaleDateString("en-US", {
    year: "numeric", 
    month: "long", 
    day: "numeric"
  });

  return (
    <main className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Navigation */}
        <Link 
          href="/student/certificate" 
          className="inline-flex items-center text-muted-foreground hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Certificates
        </Link>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: Certificate Preview / Details */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-primary/5 border-b border-border p-6 flex items-center gap-3">
                 <FileText className="w-5 h-5 text-primary" />
                 <h2 className="font-semibold text-lg">Certificate Preview</h2>
              </div>
              
              {/* Certificate Visual Representation */}
              <div className="p-8 md:p-12 text-center bg-white dark:bg-zinc-900 min-h-[400px] flex flex-col justify-center border-b border-border relative">
                 {/* Watermark / Decoration */}
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
                    <ShieldCheck className="w-64 h-64 text-primary" />
                 </div>

                 <div className="relative z-10 space-y-6">
                    <div className="inline-block px-4 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase tracking-widest mb-4">
                        Official Credential
                    </div>
                    
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
                        {certificate.title || "Certificate of Completion"}
                    </h1>
                    
                    <p className="text-muted-foreground">This certifies that</p>
                    
                    <h3 className="text-2xl font-bold text-primary">
                        {certificate.student_name}
                    </h3>
                    
                    <p className="text-muted-foreground">
                        has successfully completed the course
                    </p>
                    
                    <h2 className="text-xl md:text-2xl font-bold text-foreground">
                        {certificate.course_name}
                    </h2>

                    <p className="text-sm text-muted-foreground pt-4">
                        Issued on {formattedDate}
                    </p>
                    
                    {/* Signatures Section  */}
                    {signatures && (
                      <div className="grid grid-cols-2 gap-8 mt-12 pt-8 border-t border-dashed border-border/60 max-w-md mx-auto">
                        {signatures.director_1 && (
                          <div className="flex flex-col items-center">
                            {signatures.director_1.signature_url ? (
                              <img 
                                src={signatures.director_1.signature_url} 
                                alt="Signature" 
                                className="h-12 object-contain mb-2"
                              />
                            ) : (
                              <div className="h-12 w-24 bg-muted/30 mb-2 rounded" />
                            )}
                            <div className="h-px w-full bg-border mb-2" />
                            <p className="text-xs font-bold">{signatures.director_1.name}</p>
                            <p className="text-[10px] text-muted-foreground uppercase">{signatures.director_1.title}</p>
                          </div>
                        )}
                        
                        {signatures.director_2 && (
                          <div className="flex flex-col items-center">
                            {signatures.director_2.signature_url ? (
                              <img 
                                src={signatures.director_2.signature_url} 
                                alt="Signature" 
                                className="h-12 object-contain mb-2"
                              />
                            ) : (
                              <div className="h-12 w-24 bg-muted/30 mb-2 rounded" />
                            )}
                            <div className="h-px w-full bg-border mb-2" />
                            <p className="text-xs font-bold">{signatures.director_2.name}</p>
                            <p className="text-[10px] text-muted-foreground uppercase">{signatures.director_2.title}</p>
                          </div>
                        )}
                      </div>
                    )}
                 </div>
              </div>

              {/* Action Footer */}
              <div className="p-6 bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                 <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ShieldCheck className="w-4 h-4 text-green-600" />
                    <span>This certificate is cryptographically signed.</span>
                 </div>
                 
                 {certificate.can_download && certificate.pdf_url ? (
                    <a href={certificate.pdf_url} target="_blank" rel="noopener noreferrer">
                      <Button className="w-full sm:w-auto gap-2">
                        <Download className="w-4 h-4" />
                        Download PDF
                      </Button>
                    </a>
                 ) : (
                    <Button disabled variant="secondary" className="gap-2">
                       <Loader2 className="w-4 h-4 animate-spin" />
                       Generating PDF...
                    </Button>
                 )}
              </div>
            </div>
          </div>

          {/* RIGHT: Metadata Sidebar */}
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-accent" />
                    Verification Details
                </h3>
                
                <div className="space-y-4">
                    <div className="pb-4 border-b border-border/50">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Status</p>
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-sm font-medium ${
                            isIssued ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700"
                        }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {isIssued ? "Verified & Issued" : "Revoked"}
                        </div>
                    </div>

                    <div className="pb-4 border-b border-border/50">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                            <Hash className="w-3 h-3" /> Certificate ID
                        </p>
                        <p className="font-mono text-sm break-all">{certificate.number}</p>
                    </div>

                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Acquired Date
                        </p>
                        <p className="text-sm font-medium">{formattedDate}</p>
                    </div>
                </div>
            </div>

            {/* Verification Link Card */}
            <div className="bg-primary/5 border border-primary/10 rounded-xl p-6">
                <h4 className="font-semibold text-primary mb-2 text-sm">Verify Authenticity</h4>
                <p className="text-xs text-muted-foreground mb-4">
                    Employers can verify this certificate ID by visiting our public verification portal.
                </p>
                <div className="bg-background p-3 rounded border border-border/60 font-mono text-xs text-muted-foreground truncate">
                    {/* Placeholder URL structure */}
                    https://texagon.com/verify/{certificate.number}
                </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
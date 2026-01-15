// "use client";

// import {useEffect, useRef, useState} from "react";
// import Link from "next/link";
// import {useParams} from "next/navigation";
// import {ArrowLeft, Download, Share2, Printer} from "lucide-react";

// import {Button} from "@/components/ui/button";
// import {downloadCertificateAsPDF} from "@/lib/pdf-utils";
// import {
//   fetchCertificateById,
//   type CertificateListItem,
// } from "@/lib/certificates-api";
// import {CertificateTemplate} from "@/components/student/certificate-template";

// export default function CertificatePage() {
//   const params = useParams();
//   const certificateId = params.id as string;

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [certificate, setCertificate] = useState<CertificateListItem | null>(
//     null
//   );

//   const [isDownloading, setIsDownloading] = useState(false);
//   const certificateRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     let mounted = true;

//     (async () => {
//       setLoading(true);
//       setError(null);

//       try {
//         const {certificate} = await fetchCertificateById(certificateId);
//         if (!mounted) return;

//         setCertificate(certificate);
//         if (!certificate) setError("Certificate not found.");
//       } catch (e: any) {
//         if (!mounted) return;
//         setError(e?.message || "Failed to load certificate");
//       } finally {
//         if (!mounted) return;
//         setLoading(false);
//       }
//     })();

//     return () => {
//       mounted = false;
//     };
//   }, [certificateId]);

//   const isDownloadable = Boolean(certificate?.can_download);

//   const handleDownload = async () => {
//     if (!isDownloadable || !certificateRef.current || !certificate) return;

//     setIsDownloading(true);
//     try {
//       // If you prefer server-generated PDF when available:
//       // if (certificate.pdf_url) return window.open(certificate.pdf_url, "_blank");

//       // Otherwise client-side PDF from the rendered template:
//       await downloadCertificateAsPDF(
//         certificateRef.current,
//         certificate.student_name,
//         certificate.number
//       );
//     } catch (error) {
//       console.error("[v0] Download error:", error);
//       alert("Failed to download certificate. Please try again.");
//     } finally {
//       setIsDownloading(false);
//     }
//   };

//   const handlePrint = () => window.print();

//   if (loading) {
//     return (
//       <main className="min-h-screen py-8">
//         <div className="container mx-auto px-4 max-w-5xl text-muted-foreground">
//           Loading certificate…
//         </div>
//       </main>
//     );
//   }

//   if (error || !certificate) {
//     return (
//       <div className="min-h-screen bg-background flex items-center justify-center">
//         <div className="text-center max-w-md">
//           <h1 className="text-2xl font-bold text-foreground mb-2">
//             Certificate Not Found
//           </h1>
//           <p className="text-muted-foreground mb-6">
//             {error ?? "The certificate you're looking for doesn't exist."}
//           </p>
//           <Link href="/student/certificate">
//             <Button>Back to Certificates</Button>
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   const issuedDate = new Date(certificate.acquired_at).toLocaleDateString();
//   const downloadableAt = certificate.downloadable_at
//     ? new Date(certificate.downloadable_at).toLocaleDateString()
//     : null;

//   return (
//     <main className="min-h-screen py-8">
//       <div className="container mx-auto px-4 max-w-5xl">
//         {/* Header */}
//         <div className="flex items-center justify-between mb-8">
//           <Link href="/student/certificate">
//             <Button
//               // variant="ghost"
//               className="gap-2 bg-transparent hover:bg-transparent text-[#f57c50] hover:text-[#f57c50]/70">
//               <ArrowLeft className="w-4 h-4" />
//               Back to Certificates
//             </Button>
//           </Link>

//           <div className="flex gap-3">
//             <Button
//               disabled={!isDownloadable || isDownloading}
//               size="sm"
//               onClick={handleDownload}
//               variant="outline"
//               className="mt-3 w-full sm:w-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium hover:bg-[#f57c50]/20 hover:text-accent-foreground transition-colors">
//               <Download className="w-4 h-4" />
//               {isDownloading ? "Downloading..." : "Download PDF"}
//             </Button>
//           </div>
//         </div>

//         {/* Certificate Display */}
//         <div className="mb-8" ref={certificateRef}>
//           <CertificateTemplate
//             className="mx-auto h-[600px] pb-5"
//             // adapt your template props to accept backend item:
//             certificate={certificate}
//           />
//         </div>

//         {/* Details */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           <div className="bg-card border border-[#f57c50]/30 rounded-xl p-6">
//             <h3 className="font-semibold text-foreground mb-4 uppercase text-sm">
//               Student Info
//             </h3>
//             <div className="space-y-3">
//               <div>
//                 <p className="text-xs text-muted-foreground">Full Name</p>
//                 <p className="font-semibold text-foreground">
//                   {certificate.student_name}
//                 </p>
//               </div>
//               <div>
//                 <p className="text-xs text-muted-foreground">Student ID</p>
//                 <p className="font-semibold text-foreground">
//                   {certificate.student_id}
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="bg-card border border-[#f57c50]/30 rounded-xl p-6">
//             <h3 className="font-semibold text-foreground mb-4 uppercase text-sm">
//               Course Info
//             </h3>
//             <div className="space-y-3">
//               <div>
//                 <p className="text-xs text-muted-foreground">Course Name</p>
//                 <p className="font-semibold text-foreground">
//                   {certificate.course_name}
//                 </p>
//               </div>
//               <div>
//                 <p className="text-xs text-muted-foreground">Completion Date</p>
//                 <p className="font-semibold text-foreground">{issuedDate}</p>
//               </div>
//             </div>
//           </div>

//           <div className="bg-card border border-[#f57c50]/30 rounded-xl p-6">
//             <h3 className="font-semibold text-foreground mb-4 uppercase text-sm">
//               Download Status
//             </h3>

//             <div className="space-y-3">
//               <div className="flex items-center justify-between">
//                 <span className="text-sm text-muted-foreground">
//                   Can Download
//                 </span>
//                 <span
//                   className={`inline-block w-3 h-3 rounded-full ${
//                     isDownloadable ? "bg-[#f57c50]" : "bg-muted"
//                   }`}
//                 />
//               </div>

//               <div className="pt-3 mt-3 border-t-[#f57c50] border-border">
//                 <p
//                   className={`text-sm font-semibold ${
//                     isDownloadable ? "text-[#f57c50]" : "text-muted-foreground"
//                   }`}>
//                   {isDownloadable
//                     ? "✓ Ready for Download"
//                     : downloadableAt
//                     ? `⊘ Available on ${downloadableAt}`
//                     : "⊘ Not yet available"}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Certificate No */}
//         <div className="mt-6 bg-muted/30 border border-[#f57c50]/30 rounded-xl p-6 text-center">
//           <p className="text-xs text-muted-foreground mb-2">
//             Certificate Number
//           </p>
//           <p className="text-lg font-mono font-bold text-foreground">
//             {certificate.number}
//           </p>
//           <p className="text-xs text-muted-foreground mt-2">
//             Use this number to verify authenticity
//           </p>
//         </div>
//       </div>
//     </main>
//   );
// }

"use client";

import {useEffect, useRef, useState} from "react";
import Link from "next/link";
import {useParams} from "next/navigation";
import {ArrowLeft, Download, Printer} from "lucide-react";

// Optional lightweight lib → recommended
import {isMobile} from "react-device-detect";

import {Button} from "@/components/ui/button";
import {downloadCertificateAsPDF} from "@/lib/pdf-utils";
import {
  fetchCertificateById,
  type CertificateListItem,
} from "@/lib/certificates-api";
import {CertificateTemplate} from "@/components/student/certificate-template";

export default function CertificatePage() {
  const params = useParams();
  const certificateId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [certificate, setCertificate] = useState<CertificateListItem | null>(
    null
  );
  const [isDownloading, setIsDownloading] = useState(false);

  // Use library (preferred)
  const onMobile = isMobile;

  // Alternative without library (uncomment if you prefer no deps)
  // const [onMobile, setOnMobile] = useState(false);
  // useEffect(() => {
  //   const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
  //   setOnMobile(/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua.toLowerCase()));
  // }, []);

  const certificateRef = useRef<HTMLDivElement>(null);

  // Fetch certificate
  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const {certificate} = await fetchCertificateById(certificateId);
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
    if (!isDownloadable || !certificate) return;

    setIsDownloading(true);
    try {
      if (!onMobile && certificateRef.current) {
        // Client-side PDF from rendered template (desktop only)
        await downloadCertificateAsPDF(
          certificateRef.current,
          certificate.student_name,
          certificate.number
        );
      } else {
        // Mobile → fallback logic
        // Option A: alert user to download directly
        // Option B: if you have server PDF URL → window.open(certificate.pdf_url, '_blank')
        // For now → we assume client-side is not available on mobile
        alert(
          "On mobile, please use the Download button. The preview is hidden for security reasons."
        );
        // If you later implement server-side PDF, do:
        // if (certificate.pdf_url) window.open(certificate.pdf_url, '_blank');
      }
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download certificate. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen py-12 bg-background">
        <div className="container mx-auto px-4 max-w-5xl text-center text-muted-foreground">
          Loading your certificate...
        </div>
      </main>
    );
  }

  if (error || !certificate) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Certificate Not Found</h1>
          <p className="text-muted-foreground mb-6">
            {error ??
              "The certificate you're looking for doesn't exist or is no longer available."}
          </p>
          <Link href="/student/certificate">
            <Button>Back to My Certificates</Button>
          </Link>
        </div>
      </main>
    );
  }

  const issuedDate = new Date(certificate.acquired_at).toLocaleDateString(
    "en-GB"
  );

  return (
    <main className="min-h-screen py-8 bg-background">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <Link href="/student/certificate">
            <Button
              variant="ghost"
              className="gap-2 text-[#f57c50] hover:text-[#f57c50]/80 hover:bg-transparent -ml-3">
              <ArrowLeft className="w-4 h-4" />
              Back to Certificates
            </Button>
          </Link>

          <div className="flex flex-wrap gap-3">
            <Button
              disabled={!isDownloadable || isDownloading}
              onClick={handleDownload}
              variant="outline"
              className="gap-1.5 border-[#f57c50]/40 hover:bg-[#f57c50]/10 hover:text-[#f57c50]">
              <Download className="w-4 h-4" />
              {isDownloading ? "Downloading..." : "Download PDF"}
            </Button>
          </div>
        </div>

        {/* Mobile: hide preview, show message */}
        {onMobile ? (
          <div className="bg-card border border-[#f57c50]/30 rounded-xl p-8 text-center mb-10">
            <h2 className="text-xl font-semibold mb-4 text-foreground">
              Certificate Preview Not Available on Mobile
            </h2>
            <p className="text-muted-foreground mb-6">
              For security reasons, the certificate view is hidden on mobile
              devices.
              <br />
              You can still download your official PDF using the button above.
            </p>
            <p className="text-sm text-muted-foreground">
              Certificate Number: <strong>{certificate.number}</strong>
            </p>
          </div>
        ) : (
          /* Desktop: show preview with watermark */
          <div className="relative mb-10 shadow-2xl rounded-xl overflow-hidden bg-white">
            <div className="hidden sm:block" ref={certificateRef}>
              <CertificateTemplate
                className="w-full aspect-[1/1.414] max-h-[700px] mx-auto"
                certificate={certificate}
              />
            </div>

            {/* Watermark - only visible on desktop preview */}
            <div className="absolute inset-0 pointer-events-none select-none opacity-25 flex items-center justify-center overflow-hidden">
              <div className="text-center transform -rotate-12 text-6xl md:text-8xl font-black text-[#f57c50]/70 tracking-wider leading-none whitespace-nowrap">
                CERTIFICATE #{certificate.number}
                <br />
                {certificate.student_name.toUpperCase()}
                <br />
                DO NOT SHARE
              </div>
            </div>
          </div>
        )}

        {/* Info cards - visible everywhere */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card border border-[#f57c50]/20 rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold uppercase text-sm text-[#f57c50] mb-4">
              Student
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">Full Name</p>
                <p className="font-medium">{certificate.student_name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Student ID</p>
                <p className="font-medium">{certificate.student_id}</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-[#f57c50]/20 rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold uppercase text-sm text-[#f57c50] mb-4">
              Course
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">Course Name</p>
                <p className="font-medium">{certificate.course_name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Issued On</p>
                <p className="font-medium">{issuedDate}</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-[#f57c50]/20 rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold uppercase text-sm text-[#f57c50] mb-4">
              Status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Download Allowed</span>
                <span
                  className={`inline-block w-4 h-4 rounded-full ${
                    isDownloadable ? "bg-[#f57c50]" : "bg-muted-foreground"
                  }`}
                />
              </div>
              <p
                className={`font-medium ${
                  isDownloadable ? "text-[#f57c50]" : "text-muted-foreground"
                }`}>
                {isDownloadable ? "✓ Ready to download" : "Not yet available"}
              </p>
            </div>
          </div>
        </div>

        {/* Certificate number */}
        <div className="bg-muted/40 border border-[#f57c50]/20 rounded-xl p-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Certificate Number
          </p>
          <p className="text-2xl font-mono font-bold tracking-wide">
            {certificate.number}
          </p>
          <p className="text-sm text-muted-foreground mt-3">
            Keep this number safe — use it to verify authenticity.
          </p>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-10">
          This certificate is personal and non-transferable. Unauthorized
          distribution may result in invalidation.
        </p>
      </div>
    </main>
  );
}

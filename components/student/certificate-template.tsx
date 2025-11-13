// "use client";

// import type {Certificate, Student} from "@/lib/certificate-data";
// import {Check} from "lucide-react";
// import Image from "next/image";

// interface CertificateTemplateProps {
//   certificate: Certificate;
//   student: Student;
//   isPrint?: boolean;
//   className?: string;
// }

// export function CertificateTemplate({
//   certificate,
//   student,
//   isPrint = false,
//   className = "",
// }: CertificateTemplateProps) {
//   const navy = "#0a2351";
//   const bronzeGold = "#A07A4B";
//   const deeperBronze = "#8B4513";

//   const formattedDate = new Date(certificate.issuedDate).toLocaleDateString(
//     "en-US",
//     {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     }
//   );

//   const elegantNameStyle = {
//     fontFamily: "'Playfair Display', 'Georgia', serif",
//     fontSize: "3.5rem",
//     lineHeight: "1.2",
//     color: navy,
//     fontWeight: 600,
//   };

//   return (
//     <div
//       className={`relative w-full ${
//         isPrint ? "aspect-video" : "max-w-5xl mx-auto aspect-video"
//       } bg-white overflow-hidden shadow-2xl ${className}`}
//       style={{borderColor: bronzeGold}}>
//       <div
//         className="absolute top-0 left-0 h-1/4 w-3 z-10"
//         style={{backgroundColor: navy}}></div>
//       <div
//         className="absolute top-0 left-0 w-1/4 h-3 z-10"
//         style={{backgroundColor: navy}}></div>

//       <div
//         className="absolute top-0 left-6 h-1/4 w-1 z-10"
//         style={{backgroundColor: bronzeGold}}></div>
//       <div
//         className="absolute top-6 left-0 w-1/4 h-1 z-10"
//         style={{backgroundColor: bronzeGold}}></div>

//       <div
//         className="absolute bottom-0 right-0 h-1/4 w-3 z-10"
//         style={{backgroundColor: navy}}></div>
//       <div
//         className="absolute bottom-0 right-0 w-1/4 h-3 z-10"
//         style={{backgroundColor: navy}}></div>

//       <div
//         className="absolute bottom-0 right-6 h-1/4 w-1 z-10"
//         style={{backgroundColor: bronzeGold}}></div>
//       <div
//         className="absolute bottom-6 right-0 w-1/4 h-1 z-10"
//         style={{backgroundColor: bronzeGold}}></div>

//       {/* Content Area */}
//       <div className="relative h-full flex flex-col px-16 py-12 text-center z-20">
//         {/* Header Section with Badge and Company Logo */}
//         <div className="flex justify-between items-start mb-8">
//           <div className="text-right pt-3 absolute top-5 left-8">
//             <Image
//               src="/seal-gold.png"
//               alt="Golden Seal"
//               width={170}
//               height={170}
//               className="object-contain"
//             />
//           </div>
//           <div className="text-left absolute top-15 right-8">
//             <Image
//               src="/logo.png"
//               alt="Techxagan Logo"
//               width={80}
//               height={80}
//               className="object-contain"
//             />
//           </div>
//         </div>

//         {/* Title Block */}
//         <div className="mb-6">
//           <h1
//             className="text-5xl font-extrabold tracking-widest uppercase"
//             style={{color: navy}}>
//             Certificate
//           </h1>
//           <h2
//             className="text-xl font-light uppercase tracking-widest"
//             style={{color: navy}}>
//             of APPRECIATION
//           </h2>
//           <div
//             className="w-20 h-1 rounded-full mx-auto mt-3"
//             style={{backgroundColor: bronzeGold}}></div>
//         </div>

//         {/* Main Content */}
//         <div className="flex-grow flex flex-col items-center justify-center space-y-4">
//           <p className="text-sm" style={{color: navy, opacity: 0.7}}>
//             PROUDLY PRESENTED TO
//           </p>

//           <p
//             className="font-serif mt-2 border-b-2 pb-2 px-6"
//             style={{...elegantNameStyle, borderColor: "#d4d2cc"}}>
//             {student.name}
//           </p>

//           <div
//             className="w-20 h-0.5 rounded-full"
//             style={{backgroundColor: navy, opacity: 0.3}}></div>

//           <div className="max-w-2xl px-4">
//             <p
//               className="text-sm leading-relaxed"
//               style={{color: navy, opacity: 0.75}}>
//               For successfully completing the course in
//               <br />
//               <span className="font-semibold" style={{color: navy}}>
//                 {certificate.courseName}
//               </span>
//               <br />
//               <span style={{fontSize: "0.875rem", opacity: 0.6}}>
//                 with outstanding dedication and exceptional performance
//                 throughout the program.
//               </span>
//             </p>
//           </div>
//         </div>

//         {/* Footer Section */}
//         <div className="grid grid-cols-2 gap-12 mt-8">
//           <div className="text-center">
//             <p
//               className="border-b-2 border-gray-400 mx-auto w-3/5 pb-1 pt-8 text-xs uppercase tracking-wider font-bold"
//               style={{color: navy}}>
//               Date
//             </p>
//             <p className="mt-1 text-xs" style={{color: navy, opacity: 0.7}}>
//               {formattedDate}
//             </p>
//           </div>
//           <div className="text-center">
//             <p
//               className="border-b-2 border-gray-400 mx-auto w-3/5 pb-1 pt-8 text-xs uppercase tracking-wider font-bold"
//               style={{color: navy}}>
//               Authorized Signature
//             </p>
//             <p className="mt-1 text-xs" style={{color: navy, opacity: 0.7}}>
//               President & CEO
//             </p>
//           </div>
//         </div>

//         <div className="flex items-center justify-center gap-3 mt-6 text-xs">
//           <span style={{color: navy, opacity: 0.5, fontFamily: "monospace"}}>
//             ID: {certificate.verificationId}
//           </span>
//           {certificate.isVerified && certificate.isTested && (
//             <div
//               className="flex items-center gap-1 px-3 py-1 rounded-full"
//               style={{backgroundColor: `${bronzeGold}15`}}>
//               <Check className="w-3 h-3" style={{color: bronzeGold}} />
//               <span className="font-semibold" style={{color: bronzeGold}}>
//                 Verified
//               </span>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import type {Certificate, Student} from "@/lib/certificate-data";
import {Check} from "lucide-react";
import Image from "next/image";
import {forwardRef} from "react";

interface CertificateTemplateProps {
  certificate: Certificate;
  student: Student;
  isPrint?: boolean;
  className?: string;
}

export const CertificateTemplate = forwardRef<
  HTMLDivElement,
  CertificateTemplateProps
>(({certificate, student, isPrint = false, className = ""}, ref) => {
  const navy = "#0a2351";
  const bronzeGold = "#A07A4B";
  const deeperBronze = "#8B4513";

  const formattedDate = new Date(certificate.issuedDate).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  const elegantNameStyle = {
    fontFamily: "'Playfair Display', 'Georgia', serif",
    fontSize: "3.5rem",
    lineHeight: "1.2",
    color: navy,
    fontWeight: 600,
  };

  return (
    <div
      ref={ref}
      className={`relative w-full ${
        isPrint ? "aspect-video" : "max-w-5xl mx-auto aspect-video"
      } bg-white overflow-hidden shadow-2xl ${className}`}
      style={{borderColor: bronzeGold}}>
      <div
        className="absolute top-0 left-0 h-1/4 w-3 z-10"
        style={{backgroundColor: navy}}></div>
      <div
        className="absolute top-0 left-0 w-1/4 h-3 z-10"
        style={{backgroundColor: navy}}></div>

      <div
        className="absolute top-0 left-6 h-1/4 w-1 z-10"
        style={{backgroundColor: bronzeGold}}></div>
      <div
        className="absolute top-6 left-0 w-1/4 h-1 z-10"
        style={{backgroundColor: bronzeGold}}></div>

      <div
        className="absolute bottom-0 right-0 h-1/4 w-3 z-10"
        style={{backgroundColor: navy}}></div>
      <div
        className="absolute bottom-0 right-0 w-1/4 h-3 z-10"
        style={{backgroundColor: navy}}></div>

      <div
        className="absolute bottom-0 right-6 h-1/4 w-1 z-10"
        style={{backgroundColor: bronzeGold}}></div>
      <div
        className="absolute bottom-6 right-0 w-1/4 h-1 z-10"
        style={{backgroundColor: bronzeGold}}></div>

      {/* Content Area */}
      <div className="relative h-full flex flex-col px-16 py-12 text-center z-20">
        {/* Header Section with Badge and Company Logo */}
        <div className="flex justify-between items-start mb-8">
          <div className="text-right pt-3 absolute top-5 left-8">
            <Image
              src="/seal-gold.png"
              alt="Golden Seal"
              width={170}
              height={170}
              className="object-contain"
            />
          </div>
          <div className="text-left absolute top-15 right-8">
            <Image
              src="/logo.png"
              alt="Techxagan Logo"
              width={80}
              height={80}
              className="object-contain"
            />
          </div>
        </div>

        {/* Title Block */}
        <div className="mb-6">
          <h1
            className="text-5xl font-extrabold tracking-widest uppercase"
            style={{color: navy}}>
            Certificate
          </h1>
          <h2
            className="text-xl font-light uppercase tracking-widest"
            style={{color: navy}}>
            of APPRECIATION
          </h2>
          <div
            className="w-20 h-1 rounded-full mx-auto mt-3"
            style={{backgroundColor: bronzeGold}}></div>
        </div>

        {/* Main Content */}
        <div className="flex-grow flex flex-col items-center justify-center space-y-4">
          <p className="text-sm" style={{color: navy, opacity: 0.7}}>
            PROUDLY PRESENTED TO
          </p>

          <p
            className="font-serif mt-2 border-b-2 pb-2 px-6"
            style={{...elegantNameStyle, borderColor: "#d4d2cc"}}>
            {student.name}
          </p>

          <div
            className="w-20 h-0.5 rounded-full"
            style={{backgroundColor: navy, opacity: 0.3}}></div>

          <div className="max-w-2xl px-4">
            <p
              className="text-sm leading-relaxed"
              style={{color: navy, opacity: 0.75}}>
              For successfully completing the course in
              <br />
              <span className="font-semibold" style={{color: navy}}>
                {certificate.courseName}
              </span>
              <br />
              <span style={{fontSize: "0.875rem", opacity: 0.6}}>
                with outstanding dedication and exceptional performance
                throughout the program.
              </span>
            </p>
          </div>
        </div>

        {/* Footer Section */}
        <div className="grid grid-cols-2 gap-12 mt-8">
          <div className="text-center">
            <p
              className="border-b-2 border-gray-400 mx-auto w-3/5 pb-1 pt-8 text-xs uppercase tracking-wider font-bold"
              style={{color: navy}}>
              Date
            </p>
            <p className="mt-1 text-xs" style={{color: navy, opacity: 0.7}}>
              {formattedDate}
            </p>
          </div>
          <div className="text-center">
            <p
              className="border-b-2 border-gray-400 mx-auto w-3/5 pb-1 pt-8 text-xs uppercase tracking-wider font-bold"
              style={{color: navy}}>
              Authorized Signature
            </p>
            <p className="mt-1 text-xs" style={{color: navy, opacity: 0.7}}>
              President & CEO
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 mt-6 text-xs">
          <span style={{color: navy, opacity: 0.5, fontFamily: "monospace"}}>
            ID: {certificate.verificationId}
          </span>
          {certificate.isVerified && certificate.isTested && (
            <div
              className="flex items-center gap-1 px-3 py-1 rounded-full"
              style={{backgroundColor: `${bronzeGold}15`}}>
              <Check className="w-3 h-3" style={{color: bronzeGold}} />
              <span className="font-semibold" style={{color: bronzeGold}}>
                Verified
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

CertificateTemplate.displayName = "CertificateTemplate";

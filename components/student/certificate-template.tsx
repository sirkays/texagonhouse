// texagon_academy\texagonui\components\student\certificate-template.tsx
"use client";

import type {Certificate, Student} from "@/lib/certificate-data";
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
  const elegantNameStyle = {
    fontFamily: "'Dancing Script', 'Brush Script MT', cursive",
    fontSize: "3rem",
    lineHeight: "1",
    color: "#000000",
    fontWeight: 400,
  };

  const elegantCourseStyle = {
    fontSize: "1rem",
    lineHeight: "1.5",
    color: "",
    fontWeight: 900,
  };

  return (
    <div
      ref={ref}
      className={`relative w-full ${
        isPrint ? "aspect-[3/2]" : "max-w-5xl mx-auto aspect-[3/2]"
      } overflow-hidden ${className}`}>
      <Image
        src="/certificate.png"
        fill
        className="object-contain"
        alt="Certificate background"
      />

      {/* Name Overlay */}
      <div
        className="absolute border-b-2 border-slate-950"
        style={{top: "40%", left: "50.9%"}}>
        <p className="" style={elegantNameStyle}>
          {student.name}
        </p>
      </div>

      <div className="">
        {/* Course Overlay */}
        <div className="absolute" style={{top: "58%", left: "42.9%"}}>
          <p className="text-base font-extrabold" style={elegantCourseStyle}>
            {certificate.courseName}
          </p>
        </div>
        {/* School Overlay */}
        <div className="absolute" style={{top: "63%", left: "42.9%"}}>
          <p className="text-base font-extrabold">at {student.school}.</p>
        </div>
      </div>
    </div>
  );
});

CertificateTemplate.displayName = "CertificateTemplate";

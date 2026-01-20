"use client";

import type { CertificateListItem } from "@/lib/certificates-api";
import Image from "next/image";
import { forwardRef } from "react";

interface CertificateTemplateProps {
  certificate: CertificateListItem;

  /**
   * Optional overrides if you still want to show extra info like "school"
   * (because CertificateListItem doesn't include school by default).
   */
  studentNameOverride?: string;
  schoolName?: string;

  isPrint?: boolean;
  className?: string;
}

export const CertificateTemplate = forwardRef<
  HTMLDivElement,
  CertificateTemplateProps
>(
  (
    {
      certificate,
      studentNameOverride,
      schoolName,
      isPrint = false,
      className = "",
    },
    ref
  ) => {
    const elegantNameStyle = {
      fontFamily: "'Dancing Script', 'Brush Script MT', cursive",
      fontSize: "3rem",
      lineHeight: "1",
      color: "#000000",
      fontWeight: 400,
    } as const;

    const elegantCourseStyle = {
      fontSize: "1rem",
      lineHeight: "1.5",
      color: "",
      fontWeight: 900,
    } as const;

    const studentName = studentNameOverride ?? certificate.student_name ?? "";
    const courseName = certificate.title ?? "";

    return (
      <div
        ref={ref}
        className={`relative w-full ${
          isPrint ? "aspect-[3/2]" : "max-w-5xl mx-auto aspect-[3/2]"
        } overflow-hidden ${className}`}
      >
        <Image
          src="/certificate.png"
          fill
          className="object-contain"
          alt="Certificate background"
        />

        {/* Name Overlay */}
        <div
          className="absolute border-b-2 border-slate-950"
          style={{ top: "40%", left: "50.9%" }}
        >
          <p style={elegantNameStyle}>{studentName}</p>
        </div>

        <div>
          {/* Course Overlay */}
          <div className="absolute" style={{ top: "58%", left: "42.9%" }}>
            <p className="text-base font-extrabold" style={elegantCourseStyle}>
              {courseName}
            </p>
          </div>

          {/* School Overlay (optional) */}
          {schoolName ? (
            <div className="absolute" style={{ top: "63%", left: "42.9%" }}>
              <p className="text-base font-extrabold">at {schoolName}.</p>
            </div>
          ) : null}
        </div>
      </div>
    );
  }
);

CertificateTemplate.displayName = "CertificateTemplate";

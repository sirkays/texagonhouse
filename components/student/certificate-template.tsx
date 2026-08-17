"use client";

import type { CertificateListItem } from "@/lib/certificates-api";
import Image from "next/image";
import { forwardRef } from "react";
import { useBrand } from "@/hooks/use-brand";

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
    const brand = useBrand();
    const isNiMet = brand.id === "nimet" || brand.isNiMet;

    const studentName = studentNameOverride ?? certificate.student_name ?? "";
    const courseName = certificate.course_name ?? certificate.title ?? "";

    if (isNiMet) {
      return (
        <div
          ref={ref}
          className={`relative w-full ${
            isPrint ? "aspect-[4/3]" : "max-w-5xl mx-auto aspect-[4/3]"
          } overflow-hidden bg-white select-none ${className}`}
        >
          <Image
            src="/nimet_cert_image.png"
            fill
            className="object-contain"
            alt="NiMet Certificate of Achievement"
            priority
          />

          {/* Student Name */}
          <div
            className="absolute flex items-center justify-center"
            style={{ top: "47.5%", left: "12%", right: "12%", height: "8%" }}
          >
            <p
              className="text-center w-full"
              style={{
                fontFamily: "'Space Grotesk', 'Georgia', serif",
                fontSize: "clamp(0.9rem, 3.2vw, 2.5rem)",
                lineHeight: "1.1",
                color: "#003822",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {studentName}
            </p>
          </div>

          {/* Course Name */}
          <div
            className="absolute flex items-center justify-center"
            style={{ top: "58.5%", left: "12%", right: "12%", height: "8%" }}
          >
            <p
              className="text-center w-full"
              style={{
                fontFamily: "'Space Grotesk', 'Georgia', serif",
                fontSize: "clamp(0.6rem, 1.8vw, 1.3rem)",
                lineHeight: "1.2",
                color: "#006B3E",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              {courseName}
            </p>
          </div>
        </div>
      );
    }

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

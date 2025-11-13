"use client";

import {useRef} from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {CertificateTemplate} from "./certificate-template"; // Adjust path
import type {Certificate, Student} from "@/lib/certificate-data";

interface CertificateExporterProps {
  certificate: Certificate;
  student: Student;
}

export function CertificateExporter({
  certificate,
  student,
}: CertificateExporterProps) {
  const previewRef = useRef<HTMLDivElement>(null);

  const generatePDF = async () => {
    if (!previewRef.current) return;

    // Ensure fonts are loaded
    await document.fonts.ready;

    const canvas = await html2canvas(previewRef.current, {
      scale: 2, // Adjust for quality
      useCORS: true,
      logging: false,
      windowWidth: previewRef.current.scrollWidth,
      windowHeight: previewRef.current.scrollHeight,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [canvas.width / 2, canvas.height / 2],
    });

    pdf.addImage(
      imgData,
      "PNG",
      0,
      0,
      pdf.internal.pageSize.getWidth(),
      pdf.internal.pageSize.getHeight()
    );
    pdf.save(`${student.name.replace(/\s+/g, "_")}-certificate.pdf`);
  };

  return (
    <div>
      <CertificateTemplate
        ref={previewRef}
        certificate={certificate}
        student={student}
        isPrint={false}
      />
      <button
        onClick={generatePDF}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
        Download PDF
      </button>
    </div>
  );
}

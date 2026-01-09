"use client";

import { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { CertificateTemplate } from "./certificate-template";
import type { CertificateListItem } from "@/lib/certificates-api";

interface CertificateExporterProps {
  certificate: CertificateListItem;

  // optional extras (only if you want that “at {school}” line)
  schoolName?: string;
}

export function CertificateExporter({ certificate, schoolName }: CertificateExporterProps) {
  const previewRef = useRef<HTMLDivElement>(null);

  const generatePDF = async () => {
    if (!previewRef.current) return;

    // 1) Ensure fonts are loaded
    await document.fonts.ready;

    // 2) Ensure images inside the certificate are loaded
    const images = Array.from(previewRef.current.querySelectorAll("img"));
    await Promise.all(
      images.map(
        (img) =>
          new Promise<void>((resolve) => {
            if (img.complete) return resolve();
            img.onload = () => resolve();
            img.onerror = () => resolve(); // don't block forever
          })
      )
    );

    // 3) Capture
    const canvas = await html2canvas(previewRef.current, {
      scale: 3, // 3 is usually plenty; 4 can get heavy
      useCORS: true,
      logging: false,
      backgroundColor: null, // keeps transparency if any
      scrollX: 0,
      scrollY: 0,
    });

    const imgData = canvas.toDataURL("image/png");

    // 4) Create PDF sized to the canvas
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save(`${certificate.student_name.replace(/\s+/g, "_")}-certificate.pdf`);
  };

  return (
    <div>
      <CertificateTemplate
        ref={previewRef}
        certificate={certificate}
        schoolName={schoolName}
        isPrint={false}
      />

      <button
        onClick={generatePDF}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Download PDF
      </button>
    </div>
  );
}

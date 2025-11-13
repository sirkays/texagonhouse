// Utility function to generate and download certificate as PDF
export async function downloadCertificateAsPDF(
  certificateElement: HTMLElement,
  studentName: string,
  verificationId: string
) {
  try {
    const html2pdf = (await import("html2pdf.js")).default;

    const opt = {
      margin: 0,
      filename: `${studentName.replace(
        /\s+/g,
        "_"
      )}_Certificate_${verificationId}.pdf`,
      image: {type: "png", quality: 0.98},
      html2canvas: {scale: 2},
      jsPDF: {orientation: "landscape", unit: "mm", format: "a4"},
    };

    html2pdf().set(opt).from(certificateElement).save();
  } catch (error) {
    console.error("[v0] PDF generation failed:", error);
    throw new Error("Failed to generate PDF");
  }
}

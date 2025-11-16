// // Utility function to generate and download certificate as PDF
// export async function downloadCertificateAsPDF(
//   certificateElement: HTMLElement,
//   studentName: string,
//   verificationId: string
// ) {
//   try {
//     const html2pdf = (await import("html2pdf.js")).default;

//     const elementWidth = certificateElement.offsetWidth;
//     const elementHeight = certificateElement.offsetHeight;

//     if (elementWidth === 0 || elementHeight === 0) {
//       throw new Error("Certificate element has zero dimensions");
//     }

//     const dpi = 96;
//     const mmConversion = 25.4 / dpi;
//     const widthMm = elementWidth * mmConversion;
//     const heightMm = elementHeight * mmConversion;

//     const orientation = widthMm > heightMm ? "landscape" : "portrait";

//     const opt = {
//       margin: 0,
//       filename: `${studentName.replace(
//         /\s+/g,
//         "_"
//       )}_Certificate_${verificationId}.pdf`,
//       image: {type: "png", quality: 0.98},
//       html2canvas: {scale: 2},
//       jsPDF: {orientation, unit: "mm", format: [widthMm, heightMm]},
//     };

//     html2pdf().set(opt).from(certificateElement).save();
//   } catch (error) {
//     console.error("[v0] PDF generation failed:", error);
//     throw new Error("Failed to generate PDF");
//   }
// }

// // Utility function to generate and download certificate as PDF
// export async function downloadCertificateAsPDF(
//   certificateElement: HTMLElement,
//   studentName: string,
//   verificationId: string
// ) {
//   try {
//     const html2pdf = (await import("html2pdf.js")).default;

//     const elementWidth = certificateElement.offsetWidth;
//     const elementHeight = certificateElement.offsetHeight;

//     if (elementWidth === 0 || elementHeight === 0) {
//       throw new Error("Certificate element has zero dimensions");
//     }

//     const dpi = 96; // Standard screen DPI
//     const mmConversion = 25.4 / dpi;
//     const widthMm = elementWidth * mmConversion;
//     const heightMm = elementHeight * mmConversion;

//     const orientation = widthMm > heightMm ? "landscape" : "portrait";

//     const opt = {
//       margin: 0,
//       filename: `${studentName.replace(
//         /\s+/g,
//         "_"
//       )}_Certificate_${verificationId}.pdf`,
//       image: {type: "png", quality: 1},
//       html2canvas: {scale: 4, useCORS: true, logging: false},
//       jsPDF: {orientation, unit: "mm", format: [widthMm, heightMm]},
//     };

//     html2pdf().set(opt).from(certificateElement).save();
//   } catch (error) {
//     console.error("[v0] PDF generation failed:", error);
//     throw new Error("Failed to generate PDF");
//   }
// }

// Utility function to generate and download certificate as PDF
export async function downloadCertificateAsPDF(
  certificateElement: HTMLElement,
  studentName: string,
  verificationId: string
) {
  try {
    const html2pdf = (await import("html2pdf.js")).default;

    const elementWidth = certificateElement.offsetWidth;
    const elementHeight = certificateElement.offsetHeight;

    if (elementWidth === 0 || elementHeight === 0) {
      throw new Error("Certificate element has zero dimensions");
    }

    const dpi = 96; // Standard screen DPI
    const mmConversion = 25.4 / dpi;
    const widthMm = elementWidth * mmConversion;
    const heightMm = elementHeight * mmConversion;

    const orientation = widthMm > heightMm ? "landscape" : "portrait";

    const opt = {
      margin: 0,
      filename: `${studentName.replace(
        /\s+/g,
        "_"
      )}_Certificate_${verificationId}.pdf`,
      image: {type: "png", quality: 1},
      html2canvas: {
        scale: 4,
        useCORS: true,
        logging: false,
        scrollX: -window.scrollX,
        scrollY: -window.scrollY,
      },
      jsPDF: {orientation, unit: "mm", format: [widthMm, heightMm]},
    };

    html2pdf().set(opt).from(certificateElement).save();
  } catch (error) {
    console.error("[v0] PDF generation failed:", error);
    throw new Error("Failed to generate PDF");
  }
}

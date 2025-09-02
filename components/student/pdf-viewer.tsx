"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface PDFViewerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  pdfUrl?: string;
}

export function PDFViewer({ isOpen, onClose, title, pdfUrl }: PDFViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 2));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage((prev) => prev + 1);

  const handleDownload = () => {
    if (!pdfUrl) {
      console.error("[PDFViewer] No pdfUrl provided for download");
      setError("No PDF URL available for download");
      return;
    }
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = title || "document.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Construct iframe src with page number
  const iframeSrc = pdfUrl ? `${pdfUrl}#page=${currentPage}` : "";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95%] sm:w-[90%] md:w-[85%] lg:w-[80%] xl:w-[70%] max-w-6xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              {(zoom * 100).toFixed(0)}%
            </span>
            <Button variant="outline" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleRotate}>
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">Page {currentPage}</span>
            <Button variant="outline" size="sm" onClick={handleNextPage}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>

        <div className="flex-1 overflow-auto bg-gray-100 rounded-lg p-4">
          {error ? (
            <div className="w-full h-full flex items-center justify-center text-center text-gray-500">
              <div>
                <div className="text-lg font-semibold mb-2">Error</div>
                <div className="text-sm">{error}</div>
              </div>
            </div>
          ) : !pdfUrl ? (
            <div className="w-full h-full flex items-center justify-center text-center text-gray-500">
              <div>
                <div className="text-lg font-semibold mb-2">
                  No PDF Available
                </div>
                <div className="text-sm">
                  Please check the PDF URL or try again.
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transformOrigin: "center",
                width: "100%",
                height: "100%",
              }}
            >
              <div
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transformOrigin: "center",
                  width: "100%",
                  height: "100%",
                }}
              >
                {pdfUrl && (
                  <object
                    data={pdfUrl}
                    type="application/pdf"
                    className="w-full h-full"
                    onError={() =>
                      setError("Failed to load PDF. Try downloading instead.")
                    }
                  >
                    <iframe
                      src={`https://docs.google.com/viewer?embedded=true&url=${encodeURIComponent(
                        pdfUrl
                      )}`}
                      className="w-full h-full border-0"
                    />
                  </object>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

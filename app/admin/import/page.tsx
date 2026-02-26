// app/admin/import/page.tsx
import React from "react";
import ImportUploader from "@/components/ImportUploader";

export const metadata = {
  title: "Bulk Import - Parents & Students",
};

export default function ImportPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Bulk Import</h1>
      <ImportUploader />
    </div>
  );
}
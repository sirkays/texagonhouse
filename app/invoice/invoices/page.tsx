// app/invoice/invoices/page.tsx
"use client";
import { InvoiceHeader } from "@/components/invoice/invoice-header";
import { InvoiceList } from "@/components/invoice/invoice-list";
import { Spinner } from "@/components/ui/spinner";

export default function InvoicesPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0 animate-fade-in">
      <div className="space-y-8">
        <InvoiceHeader />
        <InvoiceList />
      </div>
    </div>
  );
}
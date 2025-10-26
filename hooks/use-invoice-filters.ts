// components/invoice/use-invoice-filters.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";

interface Invoice {
  id: number;
  number: string;
  amount: string;
  currency: string;
  issued_at: string;
  due_at: string;
  status: "open" | "paid" | "void" | "uncollectible" | "active";
  meta: { generated_for: string; parent_profile_id: number };
}

export function useInvoiceFilters() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch invoices
  useEffect(() => {
    const fetchInvoices = async () => {
      const params = new URLSearchParams();
      if (debouncedSearchTerm) {
        params.append("search", debouncedSearchTerm);
      }

      const res = await fetch(`/api/billing?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setInvoices(data.results || []);
      }
    };
    fetchInvoices();
  }, [debouncedSearchTerm]);

  // Export CSV
  const exportCSV = useCallback(() => {
    if (invoices.length === 0) return;

    const headers = [
      "Invoice #",
      "Amount",
      "Currency",
      "Status",
      "Issued",
      "Due",
      "Profile ID",
    ];

    const rows = invoices.map((inv) => [
      inv.number,
      inv.amount,
      inv.currency,
      inv.status,
      format(new Date(inv.issued_at), "yyyy-MM-dd"),
      format(new Date(inv.due_at), "yyyy-MM-dd"),
      inv.meta.parent_profile_id,
    ]);

    const csv = [headers, ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoices-export-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [invoices]);

  return {
    searchTerm,
    setSearchTerm,
    invoices,
    setInvoices,
    exportCSV,
  };
}
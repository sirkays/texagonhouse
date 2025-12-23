// hooks/use-invoice-filters.tsx
import { createContext, useContext, useState, useEffect, useCallback, ReactNode, FC } from "react";
import { format } from "date-fns";

type InvoiceType = "tutor" | "subscription";

interface Invoice {
  id: number;
  number: string;
  amount: string;
  currency: string;
  issued_at: string;
  due_at: string;
  status: "open" | "paid" | "void" | "uncollectible" | "active";
  meta: { generated_for: string; parent_profile_id: number };
  invoice_type?: InvoiceType;
  invoice_type_object_id?: number | null;
  invoice_type_object_type?: string | null;
}

interface InvoiceFiltersContextType {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  invoices: Invoice[];
  setInvoices: (invoices: Invoice[]) => void;
  triggerSearch: () => void;
  exportCSV: () => void;
  loading: boolean;
  error: string | null;
}

const InvoiceFiltersContext = createContext<InvoiceFiltersContextType | undefined>(undefined);

export const InvoiceFiltersProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch invoices function
  const fetchInvoices = useCallback(async (query = "") => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (query.trim()) params.append("search", query.trim());
    const url = `/api/billing?${params.toString()}`;
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`Failed to fetch invoices: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      setInvoices(data.results || []);
    } catch (err) {
      console.error(err);
      setError((err as Error).message || "Failed to load invoices");
      setInvoices([]); // Clear old data on error
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load (empty search)
  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // Trigger immediate search (for button)
  const triggerSearch = () => {
    fetchInvoices(searchTerm);
  };

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

  return (
    <InvoiceFiltersContext.Provider
      value={{
        searchTerm,
        setSearchTerm,
        invoices,
        setInvoices,
        triggerSearch,
        exportCSV,
        loading,
        error,
      }}
    >
      {children}
    </InvoiceFiltersContext.Provider>
  );
}

export function useInvoiceFilters() {
  const context = useContext(InvoiceFiltersContext);
  if (context === undefined) {
    throw new Error("useInvoiceFilters must be used within an InvoiceFiltersProvider");
  }
  return context;
}
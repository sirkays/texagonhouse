// components/invoice/invoice-header.tsx
"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Download, Search, FileText, CheckCircle, Clock, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useInvoiceFilters } from "@/hooks/use-invoice-filters";

export function InvoiceHeader() {
  const { searchTerm, setSearchTerm, triggerSearch, exportCSV, invoices } = useInvoiceFilters();

  const stats = useMemo(() => {
    const total = invoices.length;
    const paid = invoices.filter(
      (inv: any) => inv.status === "paid" || inv.status === "active"
    ).length;
    const open = invoices.filter(
      (inv: any) => inv.status === "open"
    ).length;
    const totalAmount = invoices.reduce((sum: number, inv: any) => {
      const n = Number(inv.amount);
      return sum + (Number.isFinite(n) ? n : 0);
    }, 0);
    const currency = invoices.length > 0 ? (invoices[0] as any).currency || "" : "";
    return { total, paid, open, totalAmount, currency };
  }, [invoices]);

  const statCards = [
    {
      label: "Total Invoices",
      value: stats.total,
      icon: FileText,
      gradient: "from-blue-500/10 to-blue-500/5",
      iconColor: "text-blue-500",
    },
    {
      label: "Paid",
      value: stats.paid,
      icon: CheckCircle,
      gradient: "from-emerald-500/10 to-emerald-500/5",
      iconColor: "text-emerald-500",
    },
    {
      label: "Open / Pending",
      value: stats.open,
      icon: Clock,
      gradient: "from-amber-500/10 to-amber-500/5",
      iconColor: "text-amber-500",
    },
    {
      label: "Total Amount",
      value: `${stats.currency} ${stats.totalAmount.toLocaleString()}`,
      icon: DollarSign,
      gradient: "from-[#EF7B55]/10 to-[#EF7B55]/5",
      iconColor: "text-[#EF7B55]",
    },
  ];

  return (
    <header className="animate-fade-in z-50 w-full bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-b border-white/20 shadow-lg">
      <div className="container mx-auto px-4 py-5 max-w-7xl">
        <div className="flex flex-col gap-5">
          {/* Title Section */}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Invoice Management
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Track and manage all your invoices
            </p>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {statCards.map((stat, idx) => (
              <div
                key={stat.label}
                className={`animate-fade-in rounded-xl bg-gradient-to-br ${stat.gradient} border border-white/20 p-4 shadow-sm transition-all duration-200 hover:shadow-md`}
                style={{ animationDelay: `${idx * 0.08}s`, animationFillMode: "both" }}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`rounded-lg bg-white/60 dark:bg-gray-800/60 p-2 ${stat.iconColor}`}>
                    <stat.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
                    <p className="text-lg font-bold tracking-tight truncate">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Search & Export */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
            <div className="relative flex-1 sm:max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && triggerSearch()}
                className="pl-10 pr-4 h-10 w-full rounded-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 focus:ring-2 focus:ring-[#EF7B55]/30 focus:border-[#EF7B55]/50 transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={triggerSearch}
                className="rounded-full px-4 hover:bg-[#EF7B55]/10 hover:text-[#EF7B55] hover:border-[#EF7B55]/30 transition-all duration-200"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportCSV}
                className="rounded-full px-4 hover:bg-[#EF7B55]/10 hover:text-[#EF7B55] hover:border-[#EF7B55]/30 transition-all duration-200"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
// components/invoice/invoice-header.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useInvoiceFilters } from "@/hooks/use-invoice-filters";

export function InvoiceHeader() {
  const { searchTerm, setSearchTerm, triggerSearch, exportCSV } = useInvoiceFilters();

  return (
    <header className="z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl lg:text-3xl">
                Invoice Management
              </h1>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                Pro
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm md:text-base">
              Create, track, and manage professional invoices with comprehensive analytics
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none sm:w-48">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && triggerSearch()} // optional: Enter key
                  className="pl-10 w-full bg-background/50 backdrop-blur"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={triggerSearch}
                className="hover-lift bg-transparent w-full sm:w-auto py-2"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              {/* <Button
                variant="outline"
                size="sm"
                className="hover-lift bg-transparent w-full sm:w-auto py-2"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button> */}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportCSV}
                className="hover-lift bg-transparent w-full sm:w-auto py-2"
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
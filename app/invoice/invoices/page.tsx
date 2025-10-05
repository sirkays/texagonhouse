"use client";
import {InvoiceHeader} from "@/components/invoice/invoice-header";
import {InvoiceList} from "@/components/invoice/invoice-list";
import {SidebarTrigger} from "@/components/ui/sidebar";
import {Separator} from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbLink,
} from "@/components/ui/breadcrumb";

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

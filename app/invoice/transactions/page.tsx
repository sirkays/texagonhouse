"use client";

import {useState} from "react";
import {TransactionHistory} from "@/components/invoice/transaction-history";
import {TransactionDetailsModal} from "@/components/invoice/transaction-details-modal";
import {SidebarTrigger} from "@/components/ui/sidebar";
import {Separator} from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function TransactionsPage() {
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelectTransaction = (id: string) => {
    setSelectedTransaction(id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Transactions</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Transaction History
          </h1>
          <p className="text-muted-foreground">
            View and manage all your transaction records. Click on any
            transaction to view details and download PDF.
          </p>
        </div>

        <div className="max-w-4xl">
          <TransactionHistory
            onSelectTransaction={handleSelectTransaction}
            selectedTransaction={selectedTransaction}
          />
        </div>
      </div>

      <TransactionDetailsModal
        transactionId={selectedTransaction}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}

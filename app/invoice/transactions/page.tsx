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
    <div className="flex flex-1 flex-col gap-3 p-3 sm:p-4">
      <div className="space-y-3">
        <div>
          <h1 className="text-lg font-bold tracking-tight md:text-xl lg:text-2xl">
            Transaction History
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            View and manage all your transaction records. Click on any
            transaction to view details and download PDF.
          </p>
        </div>

        <div>
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

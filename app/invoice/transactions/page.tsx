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
    //setSelectedTransaction(id);
    //setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-3 sm:p-5 animate-in fade-in duration-500">
      <div className="space-y-4">
        {/* Page Header */}
        <div className="space-y-1.5">
          <h1 className="text-xl font-bold tracking-tight md:text-2xl lg:text-3xl">
            <span className="bg-gradient-to-r from-[#EF7B55] via-[#e8956f] to-[#d4845e] bg-clip-text text-transparent">
              Transaction
            </span>{" "}
            History
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl">
            View and manage all your transaction records. Click on any
            transaction to view details and download PDF.
          </p>
        </div>

        {/* Transaction History Component */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
          <TransactionHistory
            onSelectTransaction={handleSelectTransaction}
            selectedTransaction={selectedTransaction}
          />
        </div>
      </div>

      {/* <TransactionDetailsModal
        transactionId={selectedTransaction}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      /> */}
    </div>
  );
}

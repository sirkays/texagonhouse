"use client";
import {useParams} from "next/navigation";
import {TransactionDetailsModal} from "@/components/invoice/transaction-details-modal";
import {SidebarTrigger} from "@/components/ui/sidebar";
import {Separator} from "@/components/ui/separator";
import {Button} from "@/components/ui/button";
import {ArrowLeft} from "lucide-react";
import Link from "next/link";
import {useState, useEffect} from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function TransactionDetailPage() {
  const params = useParams();
  const transactionId = params.id as string;
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (transactionId) {
      setIsModalOpen(true);
    }
  }, [transactionId]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Optional: redirect back to transactions page
    window.history.back();
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
                <BreadcrumbLink href="/transactions">
                  Transactions
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{transactionId}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Transaction Details
            </h1>
            <p className="text-muted-foreground">
              Detailed view of transaction {transactionId}
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/transactions">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Transactions
            </Link>
          </Button>
        </div>

        <div className="max-w-4xl">
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Transaction details are displayed in a modal. If the modal didn't
              open automatically, please return to the{" "}
              <Link
                href="/transactions"
                className="text-primary hover:underline">
                transactions page
              </Link>
              .
            </p>
          </div>
        </div>
      </div>

      <TransactionDetailsModal
        transactionId={transactionId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}

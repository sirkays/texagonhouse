// "use client";

// import {useState, useEffect} from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import {Button} from "@/components/ui/button";
// import {Badge} from "@/components/ui/badge";
// import {Separator} from "@/components/ui/separator";
// import {Download, Mail, DollarSign, Calendar, Loader2} from "lucide-react";
// import {useToast} from "@/hooks/use-toast";

// interface InvoiceItem {
//   title: string;
//   description: string;
//   amount: string;
// }

// interface PaymentInfo {
//   paid_at: string;
//   transaction_id: string;
//   method: string;
//   status: string;
// }

// interface InvoiceDetails {
//   id: number;
//   number: string;
//   parent: string;
//   amount: string;
//   currency: string;
//   status: string;
//   issuedAt: string;
//   dueAt: string;
//   items: InvoiceItem[];
//   payment_info?: PaymentInfo;
// }

// interface InvoiceDetailsModalProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   invoice: any;
// }

// export function InvoiceDetailsModal({
//   open,
//   onOpenChange,
//   invoice,
// }: InvoiceDetailsModalProps) {
//   const [invoiceDetails, setInvoiceDetails] = useState<InvoiceDetails | null>(
//     null
//   );
//   const [loading, setLoading] = useState(false);
//   const {toast} = useToast();

//   useEffect(() => {
//     if (open && invoice?.id) {
//       fetchInvoiceDetails(invoice.id);
//     }
//   }, [open, invoice?.id]);

//   const fetchInvoiceDetails = async (invoiceId: number) => {
//     try {
//       setLoading(true);
//       const response = await fetch(`/api/admin/billing/invoices/${invoiceId}`);

//       if (!response.ok) {
//         throw new Error("Failed to fetch invoice details");
//       }

//       const data = await response.json();
//       setInvoiceDetails(data);
//     } catch (error) {
//       console.error("Error fetching invoice details:", error);
//       toast({
//         title: "Error",
//         description: "Failed to load invoice details",
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDownload = () => {
//     toast({
//       title: "Downloading",
//       description: "Invoice PDF is being downloaded...",
//     });
//   };

//   const handleSendEmail = () => {
//     toast({
//       title: "Email Sent",
//       description: `Invoice sent to ${invoiceDetails?.parent}`,
//     });
//   };

//   const formatCurrency = (amount: string, currency: string) => {
//     return new Intl.NumberFormat("en-NG", {
//       style: "currency",
//       currency: currency,
//     }).format(parseFloat(amount));
//   };

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   if (!invoice) return null;

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-2xl">
//         <DialogHeader>
//           <div className="flex items-start justify-between">
//             <div>
//               <DialogTitle className="text-2xl font-mono">
//                 {invoiceDetails?.number || invoice.number}
//               </DialogTitle>
//               <DialogDescription className="mt-2">
//                 <Badge
//                   variant={
//                     invoiceDetails?.status === "paid" ? "default" : "secondary"
//                   }
//                   className="capitalize">
//                   {invoiceDetails?.status || invoice.status}
//                 </Badge>
//               </DialogDescription>
//             </div>
//             <div className="flex gap-2">
//               <Button variant="outline" size="sm" onClick={handleSendEmail}>
//                 <Mail className="h-4 w-4" />
//               </Button>
//               <Button variant="outline" size="sm" onClick={handleDownload}>
//                 <Download className="h-4 w-4" />
//               </Button>
//             </div>
//           </div>
//         </DialogHeader>

//         {loading ? (
//           <div className="flex items-center justify-center h-32">
//             <Loader2 className="h-8 w-8 animate-spin" />
//           </div>
//         ) : (
//           <div className="space-y-6 mt-6">
//             {/* Customer Info */}
//             <div>
//               <p className="text-sm text-muted-foreground mb-1">Bill To</p>
//               <p className="font-semibold text-lg">
//                 {invoiceDetails?.parent || invoice.parent}
//               </p>
//             </div>

//             <Separator />

//             {/* Invoice Details */}
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <div className="flex items-center gap-2 text-muted-foreground mb-1">
//                   <Calendar className="h-4 w-4" />
//                   <span className="text-sm">Issue Date</span>
//                 </div>
//                 <p className="font-medium">
//                   {invoiceDetails
//                     ? formatDate(invoiceDetails.issuedAt)
//                     : formatDate(invoice.issuedAt)}
//                 </p>
//               </div>
//               <div>
//                 <div className="flex items-center gap-2 text-muted-foreground mb-1">
//                   <Calendar className="h-4 w-4" />
//                   <span className="text-sm">Due Date</span>
//                 </div>
//                 <p className="font-medium">
//                   {invoiceDetails
//                     ? formatDate(invoiceDetails.dueAt)
//                     : formatDate(invoice.dueAt)}
//                 </p>
//               </div>
//             </div>

//             <Separator />

//             {/* Line Items */}
//             <div>
//               <h3 className="font-semibold mb-3">Items</h3>
//               <div className="space-y-2">
//                 {invoiceDetails?.items ? (
//                   invoiceDetails.items.map((item, index) => (
//                     <div
//                       key={index}
//                       className="flex justify-between p-3 rounded-lg bg-muted">
//                       <div>
//                         <p className="font-medium">{item.title}</p>
//                         <p className="text-sm text-muted-foreground">
//                           {item.description}
//                         </p>
//                       </div>
//                       <div className="text-right">
//                         <div className="flex items-center gap-1 font-semibold">
//                           <DollarSign className="h-4 w-4" />
//                           <span>
//                             {formatCurrency(
//                               item.amount,
//                               invoiceDetails.currency
//                             )}
//                           </span>
//                         </div>
//                       </div>
//                     </div>
//                   ))
//                 ) : (
//                   <div className="flex justify-between p-3 rounded-lg bg-muted">
//                     <div>
//                       <p className="font-medium">Standard Plan Subscription</p>
//                       <p className="text-sm text-muted-foreground">
//                         Monthly billing period
//                       </p>
//                     </div>
//                     <div className="text-right">
//                       <div className="flex items-center gap-1 font-semibold">
//                         <DollarSign className="h-4 w-4" />
//                         <span>
//                           {formatCurrency(invoice.amount, invoice.currency)}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>

//             <Separator />

//             {/* Total */}
//             <div className="flex justify-between items-center p-4 rounded-lg bg-primary/10">
//               <span className="text-lg font-semibold">Total Amount</span>
//               <div className="flex items-center gap-1 text-2xl font-bold">
//                 <DollarSign className="h-6 w-6" />
//                 <span>
//                   {formatCurrency(
//                     invoiceDetails?.amount || invoice.amount,
//                     invoiceDetails?.currency || invoice.currency
//                   )}
//                 </span>
//               </div>
//             </div>

//             {/* Payment Info */}
//             {invoiceDetails?.payment_info && (
//               <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
//                 <p className="text-sm text-green-700 dark:text-green-400">
//                   Payment received on{" "}
//                   {formatDate(invoiceDetails.payment_info.paid_at)}
//                 </p>
//                 <p className="text-sm text-green-700 dark:text-green-400 mt-1">
//                   Transaction ID: {invoiceDetails.payment_info.transaction_id}
//                 </p>
//               </div>
//             )}
//           </div>
//         )}
//       </DialogContent>
//     </Dialog>
//   );
// }

"use client";

import {useState, useEffect} from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Separator} from "@/components/ui/separator";
import {Download, Mail, DollarSign, Calendar, Loader2} from "lucide-react";
import {useToast} from "@/hooks/use-toast";

interface InvoiceItem {
  title: string;
  description: string;
  amount: string;
}

interface PaymentInfo {
  paid_at: string;
  transaction_id: string;
  method: string;
  status: string;
}

interface InvoiceDetails {
  id: number;
  number: string;
  parent: string;
  amount: string;
  currency: string;
  status: string;
  issuedAt: string;
  dueAt: string;
  items: InvoiceItem[];
  payment_info?: PaymentInfo;
}

interface InvoiceDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: any;
}

export function InvoiceDetailsModal({
  open,
  onOpenChange,
  invoice,
}: InvoiceDetailsModalProps) {
  const [invoiceDetails, setInvoiceDetails] = useState<InvoiceDetails | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const {toast} = useToast();

  useEffect(() => {
    if (open && invoice?.id) {
      fetchInvoiceDetails(invoice.id);
    }
  }, [open, invoice?.id]);

  const fetchInvoiceDetails = async (invoiceId: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/billing/invoices/${invoiceId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch invoice details");
      }

      const data = await response.json();
      setInvoiceDetails(data);
    } catch (error) {
      console.error("Error fetching invoice details:", error);
      toast({
        title: "Error",
        description: "Failed to load invoice details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    toast({
      title: "Downloading",
      description: "Invoice PDF is being downloaded...",
    });
  };

  const handleSendEmail = () => {
    toast({
      title: "Email Sent",
      description: `Invoice sent to ${invoiceDetails?.parent}`,
    });
  };

  const formatCurrency = (amount: string, currency: string) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency,
    }).format(parseFloat(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[90vw] sm:max-w-lg md:max-w-xl lg:max-w-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-0">
            <div>
              <DialogTitle className="text-2xl font-mono">
                {invoiceDetails?.number || invoice.number}
              </DialogTitle>
              <DialogDescription className="mt-2">
                <Badge
                  variant={
                    invoiceDetails?.status === "paid" ? "default" : "secondary"
                  }
                  className="capitalize">
                  {invoiceDetails?.status || invoice.status}
                </Badge>
              </DialogDescription>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSendEmail}
                className="flex-1 sm:flex-none">
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex-1 sm:flex-none">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6 mt-6">
            {/* Customer Info */}
            <div>
              <p className="text-sm text-muted-foreground mb-1">Bill To</p>
              <p className="font-semibold text-lg">
                {invoiceDetails?.parent || invoice.parent}
              </p>
            </div>

            <Separator />

            {/* Invoice Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Issue Date</span>
                </div>
                <p className="font-medium">
                  {invoiceDetails
                    ? formatDate(invoiceDetails.issuedAt)
                    : formatDate(invoice.issuedAt)}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Due Date</span>
                </div>
                <p className="font-medium">
                  {invoiceDetails
                    ? formatDate(invoiceDetails.dueAt)
                    : formatDate(invoice.dueAt)}
                </p>
              </div>
            </div>

            <Separator />

            {/* Line Items */}
            <div>
              <h3 className="font-semibold mb-3">Items</h3>
              <div className="space-y-2">
                {invoiceDetails?.items ? (
                  invoiceDetails.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 rounded-lg bg-muted gap-2 sm:gap-0">
                      <div className="flex-1">
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                      <div className="text-right w-full sm:w-auto">
                        <div className="flex items-center justify-end gap-1 font-semibold">
                          <DollarSign className="h-4 w-4" />
                          <span>
                            {formatCurrency(
                              item.amount,
                              invoiceDetails.currency
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 rounded-lg bg-muted gap-2 sm:gap-0">
                    <div className="flex-1">
                      <p className="font-medium">Standard Plan Subscription</p>
                      <p className="text-sm text-muted-foreground">
                        Monthly billing period
                      </p>
                    </div>
                    <div className="text-right w-full sm:w-auto">
                      <div className="flex items-center justify-end gap-1 font-semibold">
                        <DollarSign className="h-4 w-4" />
                        <span>
                          {formatCurrency(invoice.amount, invoice.currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Total */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-lg bg-primary/10 gap-2 sm:gap-0">
              <span className="text-lg font-semibold">Total Amount</span>
              <div className="flex items-center gap-1 text-2xl font-bold w-full sm:w-auto justify-end">
                <DollarSign className="h-6 w-6" />
                <span>
                  {formatCurrency(
                    invoiceDetails?.amount || invoice.amount,
                    invoiceDetails?.currency || invoice.currency
                  )}
                </span>
              </div>
            </div>

            {/* Payment Info */}
            {invoiceDetails?.payment_info && (
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-sm text-green-700 dark:text-green-400">
                  Payment received on{" "}
                  {formatDate(invoiceDetails.payment_info.paid_at)}
                </p>
                <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                  Transaction ID: {invoiceDetails.payment_info.transaction_id}
                </p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

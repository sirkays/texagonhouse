"use client";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Upload,
  Calendar,
  User,
  Check,
  ChevronsUpDown,
  Trash,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";

interface Complaint {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category?: "Order" | "Subscription";
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  transaction: {
    type: string;
    reference: string;
    invoice: string;
  } | null;
  responses: ComplaintResponse[];
  attachments: Attachment[];
}

interface ComplaintResponse {
  id: string;
  message: string;
  author: string;
  role: string;
  created_at: string;
}

interface Attachment {
  id: string;
  original_name: string;
  content_type: string;
  uploaded_at: string;
  file_url: string;
  uploaded_by: string;
}

interface Transaction {
  id: number;
  type: string; // expect "store" or "subscription"
  reference: string;
  amount: string;
  currency: string;
  status: string;
  date: string;
  customer: string;
  invoice_number: string;
}

interface PaymentComplaintsProps {
  className?: string;
}

export function PaymentComplaints({ className }: PaymentComplaintsProps) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // per-complaint local state for inputs in the expanded area
  const [newComplaint, setNewComplaint] = useState<{
    title: string;
    description: string;
    priority: "low" | "medium" | "high";
    category: "Order" | "Subscription";
    transaction_reference: string;
  }>({
    title: "",
    description: "",
    priority: "medium",
    category: "Order",
    transaction_reference: "",
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // per-complaint quick states (message + additional files)
  // near other local states
  const [submittingComplaint, setSubmittingComplaint] = useState(false);
  const [messageById, setMessageById] = useState<Record<string, string>>({});
  const [additionalFilesById, setAdditionalFilesById] = useState<Record<string, File[]>>({});
  const [loadingDetailsId, setLoadingDetailsId] = useState<string | null>(null);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const [postingId, setPostingId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const formLocked = transactionsLoading || submittingComplaint;


  const searchParams = useSearchParams();


  // keep a map of detailed complaints after expansion (so we don’t lose data when list re-renders)
  const detailsById = useMemo(() => {
    const m = new Map<string, Complaint>();
    for (const c of complaints) m.set(c.id, c);
    return m;
  }, [complaints]);


  const prefillRef = useRef({
    category: searchParams.get("category") || "",
    txRef: searchParams.get("transaction_reference") || "",
    appliedTx: false,
  });

  useEffect(() => {
    const c = prefillRef.current.category;
    if (c === "Order" || c === "Subscription") {
      setNewComplaint((prev) => ({ ...prev, category: c as any }));
    }
  }, []);

  useEffect(() => {
    const invoiceNumberParam = searchParams.get("invoice_number") || "";
    if (!invoiceNumberParam) return;

    if (transactionsLoading) return; // ✅ wait until loaded
    if (newComplaint.transaction_reference) return;

    const match = transactions.find((t) => t.invoice_number === invoiceNumberParam);
    if (match?.reference) {
      setNewComplaint((prev) => ({
        ...prev,
        transaction_reference: match.reference,
      }));
    }
  }, [transactions, transactionsLoading, searchParams, newComplaint.transaction_reference]);


  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await fetch("/api/complaints");
        if (!res.ok) throw new Error("Failed to fetch complaints");
        const data = await res.json();
        setComplaints(data.results || []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchComplaints();
  }, []);
  useEffect(() => {
    const fetchTransactions = async () => {
      setTransactionsLoading(true);
      try {
        const typeParam = newComplaint.category === "Order" ? "store" : "subscription";
        const res = await fetch(`/api/transactions?type=${typeParam}&withPaid=1&page_size=100`);
        if (!res.ok) throw new Error("Failed to fetch transactions");
        const data = await res.json();
        setTransactions(data.results || []);
      } catch (e) {
        console.error(e);
        setTransactions([]);
      } finally {
        setTransactionsLoading(false);
      }
    };

    fetchTransactions();
  }, [newComplaint.category]);






  // Filter transactions by selected category:
  // - "Order" => show only type === "store"
  // - "Subscription" => show only type === "subscription"
  const filteredTransactions = useMemo(() => {
    const want = newComplaint.category === "Order" ? "store" : "subscription";
    return transactions.filter(
      (t) => (t.type || "").toLowerCase() === want
    );
  }, [transactions, newComplaint.category]);


  useEffect(() => {
    const tx = prefillRef.current.txRef;
    if (!tx) return;
    if (prefillRef.current.appliedTx) return;
    if (transactionsLoading) return;

    // only set it if it exists in the currently filtered list
    const exists = filteredTransactions.some((t) => t.reference === tx);
    if (exists) {
      setNewComplaint((prev) => ({ ...prev, transaction_reference: tx }));
      prefillRef.current.appliedTx = true;
    }
  }, [filteredTransactions, transactionsLoading]);


  const getStatusIcon = (status: string) => {
    switch ((status || "").toLowerCase()) {
      case "open":
        return <AlertCircle className="h-4 w-4" />;
      case "in-progress":
        return <Clock className="h-4 w-4" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch ((status || "").toLowerCase()) {
      case "open":
        return "bg-destructive text-destructive-foreground";
      case "in-progress":
        return "bg-warning text-warning-foreground";
      case "resolved":
        return "bg-success text-success-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch ((priority || "").toLowerCase()) {
      case "high":
        return "bg-destructive text-destructive-foreground";
      case "medium":
        return "bg-warning text-warning-foreground";
      case "low":
        return "bg-success text-success-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  // -------- New Complaint (top form) --------
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...files]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const files = Array.from(e.dataTransfer.files);
      setSelectedFiles((prev) => [...prev, ...files]);
    }
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
  const removeFile = (index: number) =>
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));

  const handleSubmitComplaint = async () => {
    if (
      !newComplaint.title.trim() ||
      !newComplaint.description.trim() ||
      !newComplaint.transaction_reference.trim()
    ) return;

    if (submittingComplaint) return;

    const formData = new FormData();
    formData.append("title", newComplaint.title);
    formData.append("description", newComplaint.description);
    formData.append("priority", newComplaint.priority);
    formData.append("category", newComplaint.category);
    formData.append("transaction_reference", newComplaint.transaction_reference); // always present

    selectedFiles.forEach((file) => formData.append("attachments", file));

    setSubmittingComplaint(true);
    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        body: formData,
      });
      const payload = await res.text();
      if (!res.ok) throw new Error(payload || "Failed to create complaint");
      const newComp: Complaint = JSON.parse(payload);
      setComplaints((prev) => [newComp, ...prev]);
      setNewComplaint({
        title: "",
        description: "",
        priority: "medium",
        category: "Order",
        transaction_reference: "",
      });
      setSelectedFiles([]);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingComplaint(false);
    }
  };

  // -------- Inline expansion --------
  const fetchDetails = async (id: string) => {
    setLoadingDetailsId(id);
    try {
      const res = await fetch(`/api/complaints/${id}`);
      const text = await res.text();
      if (!res.ok) throw new Error(text);
      const fullData: Complaint = JSON.parse(text);
      setComplaints((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...fullData } : c))
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDetailsId(null);
    }
  };

  const toggleExpand = async (c: Complaint) => {
    if (expandedId === c.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(c.id);
    // Only fetch if we don't already have responses/attachments (rough heuristic)
    const current = detailsById.get(c.id);
    if (!current || !current.responses || !current.attachments) {
      await fetchDetails(c.id);
    }
  };

  // -------- Actions inside expanded panel --------
  const handleAddResponse = async (complaint: Complaint) => {
    const id = complaint.id;
    const msg = messageById[id];
    if (!msg) return;

    setPostingId(id);
    try {
      const res = await fetch(`/api/complaints/${id}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });
      if (!res.ok) throw new Error(await res.text());
      setMessageById((m) => ({ ...m, [id]: "" }));
      // refresh this complaint details
      setRefreshingId(id);
      await fetchDetails(id);
    } catch (e) {
      console.error(e);
    } finally {
      setPostingId(null);
      setRefreshingId(null);
    }
  };

  const handleAdditionalFileChange = (complaintId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setAdditionalFilesById((m) => ({
      ...m,
      [complaintId]: [...(m[complaintId] || []), ...files],
    }));
  };

  const handleAdditionalDrop = (complaintId: string, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const files = Array.from(e.dataTransfer.files);
      setAdditionalFilesById((m) => ({
        ...m,
        [complaintId]: [...(m[complaintId] || []), ...files],
      }));
    }
  };

  const removeAdditionalFile = (complaintId: string, index: number) => {
    setAdditionalFilesById((m) => ({
      ...m,
      [complaintId]: (m[complaintId] || []).filter((_, i) => i !== index),
    }));
  };

  const handleUploadAdditionalAttachments = async (complaint: Complaint) => {
    const id = complaint.id;
    const files = additionalFilesById[id] || [];
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach((file) => formData.append("attachments", file));

    setUploadingId(id);
    try {
      const res = await fetch(`/api/complaints/${id}/attachments`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error(await res.text());
      // refresh this complaint
      setRefreshingId(id);
      await fetchDetails(id);
      setAdditionalFilesById((m) => ({ ...m, [id]: [] }));
    } catch (e) {
      console.error(e);
    } finally {
      setUploadingId(null);
      setRefreshingId(null);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* New Complaint Form */}

      <Card className="mx-auto max-w-2xl relative">
        {/* Loading overlay that blocks ALL interaction */}
        {formLocked && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/70">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading…
            </div>
          </div>
        )}

        <CardHeader className={formLocked ? "pointer-events-none opacity-60" : ""}>
          <CardTitle className="text-base md:text-lg">Submit New Complaint</CardTitle>
          <p className="text-xs md:text-sm text-muted-foreground">
            Describe your payment-related issue and we&apos;ll help resolve it.
          </p>
        </CardHeader>

        <CardContent className={`${formLocked ? "pointer-events-none opacity-60" : ""} space-y-2 py-2`}>
          <div className="space-y-1">
            <Label htmlFor="title" className="text-xs md:text-sm">Title</Label>
            <Input
              id="title"
              placeholder="Brief description of the issue"
              value={newComplaint.title}
              onChange={(e) => setNewComplaint({ ...newComplaint, title: e.target.value })}
              className="text-sm h-9"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="description" className="text-xs md:text-sm">Description</Label>
            <Textarea
              id="description"
              placeholder="Provide detailed information about your issue..."
              value={newComplaint.description}
              onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })}
              rows={3}
              className="text-sm"
            />
          </div>

          <div className="grid grid-cols-1 gap-2">
            {/* Priority */}
            <div className="space-y-1">
              <Label htmlFor="priority" className="text-xs md:text-sm">Priority</Label>
              <Select
                value={newComplaint.priority}
                onValueChange={(value: "low" | "medium" | "high") =>
                  setNewComplaint({ ...newComplaint, priority: value })
                }
              >
                <SelectTrigger className="text-sm h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div className="space-y-1">
              <Label htmlFor="category" className="text-xs md:text-sm">Category</Label>
              <Select
                value={newComplaint.category}
                onValueChange={(value: "Order" | "Subscription") =>
                  setNewComplaint({ ...newComplaint, category: value })
                }
              >
                <SelectTrigger className="text-sm h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Order">Order</SelectItem>
                  <SelectItem value="Subscription">Subscription</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Transaction Reference (filtered by category) */}
            <div className="space-y-1">
              <Label htmlFor="transaction_reference" className="text-xs md:text-sm">
                Transaction Reference <span className="text-destructive">*</span>
              </Label>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between text-sm h-9"
                    aria-required="true"
                    aria-invalid={!newComplaint.transaction_reference ? "true" : "false"}
                    // while loading, overlay blocks anyway, but keep this clean:
                    disabled={transactionsLoading || filteredTransactions.length === 0}
                  >
                    {newComplaint.transaction_reference
                      ? (
                        filteredTransactions.find((t) => t.reference === newComplaint.transaction_reference)?.reference ??
                        newComplaint.transaction_reference
                      )
                      : transactionsLoading
                        ? "Loading transactions..."
                        : filteredTransactions.length === 0
                          ? (newComplaint.category === "Order"
                            ? "No store transactions"
                            : "No subscription transactions")
                          : (newComplaint.category === "Order"
                            ? "Select order transaction (required)…"
                            : "Select subscription transaction (required)…")}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search transaction..." />
                    <CommandList>
                      <CommandEmpty>No transaction found.</CommandEmpty>
                      <CommandGroup>
                        {filteredTransactions.map((t) => (
                          <CommandItem
                            key={t.reference}
                            value={t.reference}
                            onSelect={(currentValue) => {
                              setNewComplaint((prev) => ({
                                ...prev,
                                transaction_reference: currentValue,
                              }));
                            }}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${newComplaint.transaction_reference === t.reference ? "opacity-100" : "opacity-0"
                                }`}
                            />
                            {t.reference} {t.invoice_number ? `- ${t.invoice_number}` : ""}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {!newComplaint.transaction_reference && filteredTransactions.length > 0 && !transactionsLoading && (
                <p className="text-[11px] text-destructive/90">Transaction reference is required.</p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs md:text-sm">Attachments (Optional)</Label>
            <div
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-3 text-center cursor-pointer"
              onClick={() => document.getElementById("file-upload")?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <Upload className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
              <p className="text-xs text-muted-foreground">Drag and drop files here, or click to browse</p>
              <Input id="file-upload" type="file" multiple className="hidden" onChange={handleFileChange} />
            </div>

            {selectedFiles.length > 0 && (
              <div className="space-y-1 mt-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="truncate max-w-[80%]">{file.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="p-0 h-auto"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <Button
              className="bg-[#f79771] hover:bg-gray-300 shadow-md py-1.5 text-md"
              onClick={handleSubmitComplaint}
              disabled={
                formLocked ||
                !newComplaint.title.trim() ||
                !newComplaint.description.trim() ||
                !newComplaint.transaction_reference.trim()
              }
              aria-busy={submittingComplaint}
            >
              {submittingComplaint ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Complaint"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>


      {/* Complaints List with inline expandable details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Recent Complaints</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea>
            {complaints.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm md:text-base">No complaints submitted yet.</p>
                <p className="text-xs md:text-sm">Submit a complaint if you need help with payments.</p>
              </div>
            ) : (
              <div className="divide-y">
                {complaints.map((complaint) => {
                  const isOpen = expandedId === complaint.id;
                  const extraFiles = additionalFilesById[complaint.id] || [];
                  const message = messageById[complaint.id] || "";

                  return (
                    <div key={complaint.id} className="p-0">
                      {/* Row */}
                      <button
                        onClick={() => toggleExpand(complaint)}
                        className={`w-full text-left p-3 hover:bg-muted/50 transition-colors ${isOpen ? "bg-accent/30" : ""
                          }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-sm md:text-base">{complaint.title}</h4>
                              {loadingDetailsId === complaint.id && (
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2 md:text-sm">
                              {complaint.description}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1 ml-2">
                            <Badge className={getStatusColor(complaint.status)}>
                              {getStatusIcon(complaint.status)}
                              <span className="ml-1 capitalize text-xs md:text-sm">
                                {complaint.status?.replace("-", " ")}
                              </span>
                            </Badge>
                            <div className="flex gap-1">
                              <Badge variant="outline" className={getPriorityColor(complaint.priority)}>
                                <span className="text-xs md:text-sm">{complaint.priority}</span>
                              </Badge>
                              {complaint.category && (
                                <Badge variant="secondary">
                                  <span className="text-xs md:text-sm">{complaint.category}</span>
                                </Badge>
                              )}
                            </div>
                            {isOpen ? <ChevronUp className="h-4 w-4 mt-1" /> : <ChevronDown className="h-4 w-4 mt-1" />}
                          </div>
                        </div>

                        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground md:text-sm">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                              {format(new Date(complaint.created_at), "MMM dd, yyyy")}
                            </span>
                            {complaint.transaction && (
                              <span className="flex items-center gap-1">
                                <FileText className="h-3 w-3 md:h-4 md:w-4" />
                                {complaint.transaction.reference}
                              </span>
                            )}
                            {complaint.assigned_to && (
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3 md:h-4 md:w-4" />
                                {complaint.assigned_to}
                              </span>
                            )}
                          </div>
                          <span>{complaint.responses?.length ?? 0} responses</span>
                        </div>
                      </button>

                      {/* Slide-down details */}
                      <div
                        className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${isOpen ? "max-h-[1200px] opacity-100" : "max-h-0 opacity-0"
                          }`}
                      >
                        <div className="px-3 pb-4 pt-2 bg-accent/10">
                          {/* Description */}
                          <div className="mb-3">
                            <h5 className="font-medium text-sm mb-1 md:text-base">Description</h5>
                            <p className="text-sm text-muted-foreground md:text-base">
                              {complaint.description}
                            </p>
                          </div>

                          {/* Transaction */}
                          {complaint.transaction && (
                            <div className="mb-3">
                              <h5 className="font-medium text-sm mb-1 md:text-base">Transaction</h5>
                              <p className="text-sm text-muted-foreground md:text-base">
                                Reference: {complaint.transaction.reference} <br />
                                Invoice: {complaint.transaction.invoice}
                              </p>
                            </div>
                          )}

                          {/* Attachments */}
                          {complaint.attachments?.length > 0 && (
                            <>
                              <Separator className="my-3" />
                              <div className="mb-2">
                                <h5 className="font-medium text-sm mb-2 md:text-base">
                                  Attachments ({complaint.attachments.length})
                                </h5>
                                <div className="space-y-1">
                                  {complaint.attachments.map((a) => (
                                    <div key={a.id} className="flex items-center justify-between text-sm">
                                      <a
                                        href={a.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 truncate max-w-[80%]"
                                      >
                                        {a.original_name}
                                      </a>
                                      <span className="text-xs text-muted-foreground">
                                        {format(new Date(a.uploaded_at), "MMM dd, yyyy")}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </>
                          )}

                          {/* Responses */}
                          {complaint.responses?.length > 0 && (
                            <>
                              <Separator className="my-3" />
                              <div className="mb-2">
                                <h5 className="font-medium text-sm mb-2 md:text-base">
                                  Responses ({complaint.responses.length})
                                </h5>
                                <ScrollArea className="h-[200px] sm:h-[250px]">
                                  <div className="space-y-2 pr-2">
                                    {complaint.responses.map((r) => (
                                      <div key={r.id} className="p-3 bg-muted/30 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium text-sm md:text-base">{r.author}</span>
                                            <Badge variant="outline" className="text-xs md:text-sm">
                                              {r.role}
                                            </Badge>
                                          </div>
                                          <span className="text-xs text-muted-foreground md:text-sm">
                                            {format(new Date(r.created_at), "MMM dd, h:mm a")}
                                          </span>
                                        </div>
                                        <p className="text-sm md:text-base">{r.message}</p>
                                      </div>
                                    ))}
                                  </div>
                                </ScrollArea>
                              </div>
                            </>
                          )}

                          {/* Add response */}
                          <Separator className="my-3" />
                          <div className="space-y-1">
                            <Label htmlFor={`new-message-${complaint.id}`} className="text-xs md:text-sm">
                              Add Response
                            </Label>
                            <Textarea
                              id={`new-message-${complaint.id}`}
                              placeholder="Type your response here..."
                              value={message}
                              onChange={(e) =>
                                setMessageById((m) => ({ ...m, [complaint.id]: e.target.value }))
                              }
                              rows={3}
                              className="text-sm"
                            />
                            <div className="flex justify-center py-2">
                              <Button onClick={() => handleAddResponse(complaint)} disabled={postingId === complaint.id}>
                                {postingId === complaint.id ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Submitting...
                                  </>
                                ) : (
                                  "Submit Response"
                                )}
                              </Button>
                            </div>
                          </div>

                          {/* Add attachments */}
                          <Separator className="my-3" />
                          <div className="space-y-1">
                            <Label className="text-xs md:text-sm">Add Attachments</Label>
                            <div
                              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-3 text-center cursor-pointer"
                              onClick={() => document.getElementById(`additional-file-upload-${complaint.id}`)?.click()}
                              onDrop={(e) => handleAdditionalDrop(complaint.id, e)}
                              onDragOver={(e) => e.preventDefault()}
                            >
                              <Upload className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                              <p className="text-xs text-muted-foreground">
                                Drag and drop files here, or click to browse
                              </p>
                              <Input
                                id={`additional-file-upload-${complaint.id}`}
                                type="file"
                                multiple
                                className="hidden"
                                onChange={(e) => handleAdditionalFileChange(complaint.id, e)}
                              />
                            </div>
                            {extraFiles.length > 0 && (
                              <div className="space-y-1 mt-2">
                                {extraFiles.map((file, index) => (
                                  <div key={index} className="flex items-center justify-between text-sm">
                                    <span className="truncate max-w-[80%]">{file.name}</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeAdditionalFile(complaint.id, index)}
                                      className="p-0 h-auto"
                                    >
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="flex justify-center py-2">
                              <Button
                                onClick={() => handleUploadAdditionalAttachments(complaint)}
                                disabled={uploadingId === complaint.id}
                              >
                                {uploadingId === complaint.id ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Uploading...
                                  </>
                                ) : (
                                  "Upload Attachments"
                                )}
                              </Button>
                            </div>
                          </div>

                          {/* Meta */}
                          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground pt-2 border-t md:text-sm">
                            <span>
                              Created: {format(new Date(complaint.created_at), "MMM dd, yyyy 'at' h:mm a")}
                            </span>
                            <span>
                              {refreshingId === complaint.id ? (
                                <span className="inline-flex items-center gap-1">
                                  <Loader2 className="h-3 w-3 animate-spin" /> Refreshing…
                                </span>
                              ) : (
                                <>Updated: {format(new Date(complaint.updated_at), "MMM dd, yyyy 'at' h:mm a")}</>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

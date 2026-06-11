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
  Image,
  Search,
  Send,
  Paperclip,
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

  // NEW state variables
  const [showSuccess, setShowSuccess] = useState(false);
  const [listSearchTerm, setListSearchTerm] = useState('');
  const [listStatusFilter, setListStatusFilter] = useState('all');

  const searchParams = useSearchParams();


  // keep a map of detailed complaints after expansion (so we don't lose data when list re-renders)
  const detailsById = useMemo(() => {
    const m = new Map<string, Complaint>();
    for (const c of complaints) m.set(c.id, c);
    return m;
  }, [complaints]);

  // Summary stats
  const stats = useMemo(() => {
    const total = complaints.length;
    const open = complaints.filter(c => (c.status || '').toLowerCase() === 'open').length;
    const inProgress = complaints.filter(c => {
      const s = (c.status || '').toLowerCase().replace(/[_-]/g, '');
      return s === 'inprogress';
    }).length;
    const resolved = complaints.filter(c => (c.status || '').toLowerCase() === 'resolved').length;
    return { total, open, inProgress, resolved };
  }, [complaints]);

  // Filtered complaints for the list
  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      const matchesSearch = !listSearchTerm || c.title.toLowerCase().includes(listSearchTerm.toLowerCase()) || c.description.toLowerCase().includes(listSearchTerm.toLowerCase());
      const matchesStatus = listStatusFilter === 'all' || (c.status || '').toLowerCase().replace(/[_-]/g, '') === listStatusFilter.replace(/[_-]/g, '');
      return matchesSearch && matchesStatus;
    });
  }, [complaints, listSearchTerm, listStatusFilter]);

  // Relative time helper
  const relativeTime = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return format(date, 'MMM dd, yyyy');
  };

  // File size formatter
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // File type icon helper
  const getFileIcon = (contentType: string) => {
    if (contentType.startsWith('image/')) return <Image className="h-4 w-4 text-blue-500" />;
    if (contentType === 'application/pdf') return <FileText className="h-4 w-4 text-red-500" />;
    return <FileText className="h-4 w-4 text-slate-500" />;
  };

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

  const selectedTxDetails = useMemo(() => {
    if (!newComplaint.transaction_reference) return null;
    return transactions.find((t) => t.reference === newComplaint.transaction_reference) || null;
  }, [transactions, newComplaint.transaction_reference]);


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

  const getStatusBorderColor = (status: string) => {
    switch ((status || "").toLowerCase()) {
      case "open":
        return "border-l-rose-500";
      case "in-progress":
      case "in_progress":
        return "border-l-amber-500";
      case "resolved":
        return "border-l-emerald-500";
      default:
        return "border-l-slate-300";
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
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
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
  };  return (
    <div className={`space-y-6 ${className}`}>
      {/* ===== SUMMARY STAT CARDS (MODERN DASHBOARD SLEEK STYLE) ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Card */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 border-l-4 border-l-slate-400">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total</p>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-3xl font-extrabold text-slate-800 dark:text-white">{stats.total}</span>
            <span className="text-xs font-medium text-slate-400">tickets</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2.5 text-slate-500 dark:text-slate-400">
            <div className="rounded-md bg-slate-50 p-1 dark:bg-slate-800">
              <MessageSquare className="h-3.5 w-3.5 text-slate-500" />
            </div>
            <span className="text-xs font-medium">All complaints</span>
          </div>
        </div>

        {/* Open Card */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 border-l-4 border-l-rose-500">
          <p className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Open</p>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-3xl font-extrabold text-rose-600">{stats.open}</span>
            <span className="text-xs font-medium text-rose-400">unresolved</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2.5 text-rose-600/90">
            <div className="rounded-md bg-rose-50 p-1">
              <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
            </div>
            <span className="text-xs font-medium">Needs attention</span>
          </div>
        </div>

        {/* In Progress Card */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 border-l-4 border-l-amber-500">
          <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">In Progress</p>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-3xl font-extrabold text-amber-600">{stats.inProgress}</span>
            <span className="text-xs font-medium text-amber-400">reviewing</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2.5 text-amber-600/90">
            <div className="rounded-md bg-amber-50 p-1">
              <Clock className="h-3.5 w-3.5 text-amber-500" />
            </div>
            <span className="text-xs font-medium">Under active review</span>
          </div>
        </div>

        {/* Resolved Card */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 border-l-4 border-l-emerald-500">
          <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Resolved</p>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-3xl font-extrabold text-emerald-600">{stats.resolved}</span>
            <span className="text-xs font-medium text-emerald-400">closed</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2.5 text-emerald-600/90">
            <div className="rounded-md bg-emerald-50 p-1">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
            </div>
            <span className="text-xs font-medium">Completed tickets</span>
          </div>
        </div>
      </div>

      {/* ===== SUCCESS BANNER ===== */}
      {showSuccess && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300 w-full">
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3.5 flex items-center gap-3 shadow-sm">
            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <Check className="h-4.5 w-4.5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-800">Complaint Submitted Successfully!</p>
              <p className="text-xs text-emerald-600">Your ticket has been recorded. Our team will review the details shortly.</p>
            </div>
          </div>
        </div>
      )}

      {/* ===== RESPONSIVE GRID LAYOUT ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ================= LEFT COLUMN: SUBMIT TICKET FORM (span 5) ================= */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="relative bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl border border-slate-100 rounded-3xl overflow-hidden transition-all duration-300">
            {/* Loading overlay */}
            {formLocked && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm animate-in fade-in duration-300">
                <Loader2 className="h-8 w-8 animate-spin text-[#EF7B55]" />
                <p className="text-xs font-bold text-slate-500 mt-2 tracking-wider">PREPARING TICKET...</p>
              </div>
            )}

            <CardHeader className="pb-4 border-b border-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#EF7B55] to-[#d4533a] flex items-center justify-center shadow-md shadow-orange-500/20 shrink-0">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-slate-800">Submit New Complaint</CardTitle>
                  <p className="text-xs text-slate-400">Describe your payment issues, and we will resolve them.</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-5 pb-6">
              {/* Category selector */}
              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-xs font-bold uppercase tracking-wider text-slate-500">Complaint Category</Label>
                <Select
                  value={newComplaint.category}
                  onValueChange={(value: "Order" | "Subscription") =>
                    setNewComplaint({ ...newComplaint, category: value, transaction_reference: "" })
                  }
                >
                  <SelectTrigger className="text-sm h-11 rounded-xl border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white transition-all duration-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="Order">Order / Store Purchase</SelectItem>
                    <SelectItem value="Subscription">Subscription / Tuition Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Transaction Reference (Combobox select) */}
              <div className="space-y-1.5">
                <Label htmlFor="transaction_reference" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Linked Transaction Reference <span className="text-rose-500">*</span>
                </Label>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between text-sm h-11 rounded-xl border-slate-200 bg-slate-50/50 hover:bg-white hover:border-[#EF7B55]/30 focus:border-[#EF7B55] px-3 font-normal"
                      aria-required="true"
                      disabled={transactionsLoading || filteredTransactions.length === 0}
                    >
                      <span className="truncate max-w-[90%]">
                        {newComplaint.transaction_reference
                          ? (
                            filteredTransactions.find((t) => t.reference === newComplaint.transaction_reference)?.reference ??
                            newComplaint.transaction_reference
                          )
                          : transactionsLoading
                            ? "Loading transactions..."
                            : filteredTransactions.length === 0
                              ? (newComplaint.category === "Order"
                                ? "No store purchases found"
                                : "No subscription records found")
                              : (newComplaint.category === "Order"
                                ? "Select an order purchase..."
                                : "Select a subscription payment...")}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-2xl shadow-xl border border-slate-100 overflow-hidden" align="start">
                    <Command>
                      <CommandInput placeholder="Search references or invoice numbers..." className="h-10 text-sm border-0 border-b border-slate-100 rounded-none focus:ring-0" />
                      <CommandList className="max-h-[220px]">
                        <CommandEmpty>No matching transaction found.</CommandEmpty>
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
                              className="py-2.5 px-3 cursor-pointer hover:bg-orange-50/60 dark:hover:bg-slate-800 transition-colors"
                            >
                              <div className="flex items-center w-full justify-between gap-2">
                                <div className="flex flex-col min-w-0">
                                  <span className="font-semibold text-slate-800 text-sm truncate">{t.reference}</span>
                                  <span className="text-[11px] text-slate-400 truncate">
                                    {t.currency || 'NGN'} {Number(t.amount).toLocaleString()} · {t.date ? format(new Date(t.date), 'MMM dd, yyyy') : ''} {t.invoice_number ? `· ${t.invoice_number}` : ''}
                                  </span>
                                </div>
                                <Check
                                  className={`h-4.5 w-4.5 text-[#EF7B55] shrink-0 ${newComplaint.transaction_reference === t.reference ? "opacity-100" : "opacity-0"}`}
                                />
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {/* ===== DYNAMIC INTUITIVE TRANSACTION PREVIEW CARD ===== */}
                {selectedTxDetails && (
                  <div className="rounded-2xl border border-orange-100 bg-orange-50/20 p-4 space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-300 shadow-inner">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-8 w-8 rounded-xl bg-orange-100/70 flex items-center justify-center shrink-0">
                          <FileText className="h-4.5 w-4.5 text-[#EF7B55]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{selectedTxDetails.invoice_number || "Invoice Attached"}</p>
                          <p className="text-[10px] text-slate-400 font-mono truncate">{selectedTxDetails.reference}</p>
                        </div>
                      </div>
                      <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/20 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide shrink-0">
                        {selectedTxDetails.status || "Paid"}
                      </Badge>
                    </div>
                    
                    <Separator className="bg-orange-100/50" />
                    
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Amount Linked</p>
                        <p className="font-extrabold text-slate-800 text-sm mt-0.5">
                          {selectedTxDetails.currency || "NGN"} {Number(selectedTxDetails.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Transaction Date</p>
                        <p className="font-semibold text-slate-700 mt-0.5">
                          {selectedTxDetails.date ? format(new Date(selectedTxDetails.date), "MMM dd, yyyy") : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Title input */}
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs font-bold uppercase tracking-wider text-slate-500">Complaint Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Charged twice for same month"
                  value={newComplaint.title}
                  onChange={(e) => setNewComplaint({ ...newComplaint, title: e.target.value.slice(0, 200) })}
                  className="text-sm h-11 rounded-xl border-slate-200 focus:border-[#EF7B55] bg-slate-50/50 focus:bg-white focus:ring-0 focus:shadow-sm transition-all duration-200"
                  maxLength={200}
                />
                <p className="text-[10px] text-slate-400 text-right font-medium">{newComplaint.title.length}/200</p>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-slate-500">Detailed Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what occurred, transaction IDs, bank details, and timing to help us solve it faster..."
                  value={newComplaint.description}
                  onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })}
                  rows={4}
                  className="text-sm rounded-xl border-slate-200 focus:border-[#EF7B55] bg-slate-50/50 focus:bg-white focus:ring-0 resize-none focus:shadow-sm transition-all duration-200"
                />
                <p className="text-[10px] text-slate-400 text-right font-medium">{newComplaint.description.length} characters</p>
              </div>

              {/* Priority */}
              <div className="space-y-1.5">
                <Label htmlFor="priority" className="text-xs font-bold uppercase tracking-wider text-slate-500">Ticket Priority</Label>
                <Select
                  value={newComplaint.priority}
                  onValueChange={(value: "low" | "medium" | "high") =>
                    setNewComplaint({ ...newComplaint, priority: value })
                  }
                >
                  <SelectTrigger className="text-sm h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all duration-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="low">Low (Standard Question)</SelectItem>
                    <SelectItem value="medium">Medium (Requires Review)</SelectItem>
                    <SelectItem value="high">High (Urgent Payment Issue)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Attachments Dropzone */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Payment Proof Attachments</Label>
                <div
                  className="border-2 border-dashed border-slate-200 hover:border-[#EF7B55]/50 bg-slate-50/40 hover:bg-orange-50/20 rounded-2xl p-5 text-center cursor-pointer transition-all duration-300 group"
                  onClick={() => document.getElementById("file-upload")?.click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  <div className="h-9 w-9 rounded-full bg-white group-hover:bg-[#EF7B55]/10 flex items-center justify-center mx-auto mb-2 shadow-sm transition-colors duration-300">
                    <Upload className="h-4.5 w-4.5 text-slate-400 group-hover:text-[#EF7B55] transition-colors duration-300" />
                  </div>
                  <p className="text-xs text-slate-700 font-semibold">
                    Drag and drop proof files, or <span className="text-[#EF7B55] font-bold group-hover:underline">browse</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">Upload screenshots, PDF receipts, or PNG bank statements (Max 10MB)</p>
                  <Input id="file-upload" type="file" multiple className="hidden" onChange={handleFileChange} />
                </div>

                {selectedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 bg-white border border-slate-100 rounded-xl pl-3 pr-2 py-1.5 shadow-sm text-sm group/file hover:border-[#EF7B55]/20 transition-colors duration-200">
                        <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[120px] text-xs font-medium text-slate-700">{file.name}</span>
                        <span className="text-[9px] font-bold text-slate-400 shrink-0 bg-slate-50 px-1.5 py-0.5 rounded-md">{formatFileSize(file.size)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                          className="p-1 h-auto w-auto rounded-md opacity-40 hover:opacity-100 hover:bg-rose-50 transition-all"
                        >
                          <Trash className="h-3.5 w-3.5 text-rose-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  className="w-full h-12 bg-gradient-to-r from-[#EF7B55] to-[#d4533a] hover:from-[#e8654a] hover:to-[#c44830] text-white shadow-md hover:shadow-lg hover:shadow-orange-500/10 text-sm font-bold rounded-2xl transition-all duration-300"
                  onClick={handleSubmitComplaint}
                  disabled={
                    formLocked ||
                    !newComplaint.title.trim() ||
                    !newComplaint.description.trim() ||
                    !newComplaint.transaction_reference.trim()
                  }
                >
                  {submittingComplaint ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin text-white" />
                      Submitting Complaint...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      File Complaint Ticket
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ================= RIGHT COLUMN: RECENT COMPLAINTS TICKET LIST (span 7) ================= */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl border border-slate-100 rounded-3xl overflow-hidden transition-all duration-300">
            <CardHeader className="pb-4 border-b border-slate-50/50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center shadow-md">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-slate-800">Support Workspace</CardTitle>
                    <p className="text-xs text-slate-400">Track and respond to your active payment tickets.</p>
                  </div>
                </div>

                {/* Status selection pills */}
                <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-850 p-1 rounded-xl self-start sm:self-auto border border-slate-100">
                  {[
                    { label: 'All', value: 'all' },
                    { label: 'Open', value: 'open' },
                    { label: 'Reviewing', value: 'inprogress' },
                    { label: 'Resolved', value: 'resolved' },
                  ].map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setListStatusFilter(f.value)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold tracking-wide transition-all ${
                        listStatusFilter === f.value
                          ? 'bg-[#EF7B55] text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ticket list Search */}
              <div className="relative mt-4">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by keywords, titles, or descriptions..."
                  value={listSearchTerm}
                  onChange={(e) => setListSearchTerm(e.target.value)}
                  className="pl-10 h-10 text-sm rounded-xl border-slate-200 focus:border-[#EF7B55] focus:ring-0 bg-slate-50/50 focus:bg-white transition-all duration-200"
                />
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <ScrollArea className="max-h-[800px] overflow-y-auto">
                {complaints.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                    <div className="h-16 w-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4 animate-pulse">
                      <MessageSquare className="h-8 w-8 text-[#EF7B55]/60" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700">No support tickets found</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">You have not registered any payment complaints yet. Submit the form on the left to start.</p>
                  </div>
                ) : filteredComplaints.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                    <div className="h-16 w-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4">
                      <Search className="h-8 w-8 text-slate-400/80" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700">No tickets match search filters</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Try typing another keyword or toggling the status category pills above.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50 p-4 space-y-3">
                    {filteredComplaints.map((complaint) => {
                      const isOpen = expandedId === complaint.id;
                      const extraFiles = additionalFilesById[complaint.id] || [];
                      const message = messageById[complaint.id] || "";

                      return (
                        <div
                          key={complaint.id}
                          className={`rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-md border-l-4 ${getStatusBorderColor(complaint.status)} ${
                            isOpen ? "ring-2 ring-orange-500/10 shadow-md" : ""
                          }`}
                        >
                          {/* Ticket Item Header */}
                          <button
                            onClick={() => toggleExpand(complaint)}
                            className={`w-full text-left p-4.5 transition-colors duration-300 ${isOpen ? "bg-orange-50/10" : "hover:bg-slate-50/50"}`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                  <h4 className="font-bold text-slate-800 text-sm md:text-base truncate leading-snug">{complaint.title}</h4>
                                  {loadingDetailsId === complaint.id && (
                                    <Loader2 className="h-4 w-4 animate-spin text-[#EF7B55] shrink-0" />
                                  )}
                                </div>
                                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                                  {complaint.description}
                                </p>
                              </div>
                              
                              {/* Pill Badges */}
                              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 shrink-0">
                                <Badge className={`${getStatusColor(complaint.status)} rounded-full text-[10px] font-bold px-2 py-0.5 tracking-wide flex items-center gap-1 border-0`}>
                                  {getStatusIcon(complaint.status)}
                                  <span className="capitalize">
                                    {complaint.status?.replace("-", " ").replace("_", " ")}
                                  </span>
                                </Badge>
                                <Badge variant="outline" className={`${getPriorityColor(complaint.priority)} rounded-full text-[10px] font-bold px-2.5 py-0.5 border-0 shadow-sm`}>
                                  {complaint.priority}
                                </Badge>
                              </div>
                            </div>

                            {/* Row Meta Footer */}
                            <div className="mt-4 flex items-center justify-between text-xs text-slate-400/90 pt-3 border-t border-slate-50 flex-wrap gap-2">
                              <div className="flex items-center gap-3.5 flex-wrap">
                                <span className="flex items-center gap-1 font-medium">
                                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                  {format(new Date(complaint.created_at), "MMM dd, yyyy")}
                                </span>
                                {complaint.transaction && (
                                  <span className="flex items-center gap-1 font-mono text-[10px] bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md font-semibold text-slate-600">
                                    <FileText className="h-3 w-3 text-slate-400" />
                                    {complaint.transaction.reference}
                                  </span>
                                )}
                                {complaint.assigned_to && (
                                  <span className="flex items-center gap-1 font-medium bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md text-slate-600">
                                    <User className="h-3.5 w-3.5 text-slate-400" />
                                    {complaint.assigned_to}
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-1.5 text-slate-500 font-bold shrink-0">
                                <span className="text-xs bg-[#EF7B55]/10 text-[#EF7B55] px-2.5 py-0.5 rounded-md">
                                  {complaint.responses?.length ?? 0} responses
                                </span>
                                {isOpen ? <ChevronUp className="h-4 w-4 text-[#EF7B55]" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                              </div>
                            </div>
                          </button>

                          {/* Ticket Slide-down Details Workspace */}
                          <div
                            className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-[2500px] opacity-100" : "max-h-0 opacity-0"}`}
                          >
                            <div className="px-5 pb-5 pt-1.5 border-t border-slate-100/70 bg-slate-50/20">
                              
                              {/* Expanded Full Description */}
                              <div className="mb-4 mt-2 p-4 bg-slate-50/60 border border-slate-100 rounded-2xl shadow-inner">
                                <h5 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-1.5">Detailed Complaint Narrative</h5>
                                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                  {complaint.description}
                                </p>
                              </div>

                              {/* Expanded Transaction Context */}
                              {complaint.transaction && (
                                <div className="mb-4 p-4 bg-slate-50/60 border border-slate-100 rounded-2xl">
                                  <h5 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-1.5">Linked Invoice Reference</h5>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600">
                                    <p className="font-semibold text-slate-700">
                                      <span className="text-slate-400 font-medium mr-1.5">Reference ID:</span> 
                                      <span className="font-mono text-xs bg-white border border-slate-100 px-1.5 py-0.5 rounded">{complaint.transaction.reference}</span>
                                    </p>
                                    <p className="font-semibold text-slate-700">
                                      <span className="text-slate-400 font-medium mr-1.5">Invoice Number:</span> 
                                      <span className="font-mono text-xs bg-white border border-slate-100 px-1.5 py-0.5 rounded">{complaint.transaction.invoice}</span>
                                    </p>
                                  </div>
                                </div>
                              )}

                              {/* Attached Files (Download Gallery) */}
                              {complaint.attachments?.length > 0 && (
                                <>
                                  <Separator className="my-4 bg-slate-100" />
                                  <div className="mb-4">
                                    <h5 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-2">
                                      <Paperclip className="h-4 w-4 text-slate-400" />
                                      Evidence Attachments ({complaint.attachments.length})
                                    </h5>
                                    <div className="flex flex-wrap gap-2">
                                      {complaint.attachments.map((a) => (
                                        <a
                                          key={a.id}
                                          href={a.file_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-2.5 bg-white border border-slate-100 rounded-xl px-3 py-2 text-xs font-semibold shadow-sm hover:border-[#EF7B55]/30 hover:bg-orange-50/30 transition-all duration-200 group"
                                        >
                                          {getFileIcon(a.content_type)}
                                          <span className="truncate max-w-[130px] text-slate-700 group-hover:text-[#EF7B55] transition-colors">{a.original_name}</span>
                                          <span className="text-[9px] bg-slate-50 px-1.5 py-0.5 rounded text-slate-400 shrink-0 font-bold">
                                            {format(new Date(a.uploaded_at), "MMM dd")}
                                          </span>
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                </>
                              )}

                              {/* Responses Feed (Sleek Chat Bubble Stream) */}
                              {complaint.responses?.length > 0 && (
                                <>
                                  <Separator className="my-4 bg-slate-100" />
                                  <div className="mb-4">
                                    <h5 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3.5 flex items-center gap-2">
                                      <MessageSquare className="h-4 w-4 text-slate-400" />
                                      Complaint Conversation ({complaint.responses.length})
                                    </h5>
                                    
                                    <div className="bg-slate-50/40 border border-slate-100 rounded-2xl p-3.5">
                                      <ScrollArea className="h-[250px] sm:h-[300px]">
                                        <div className="space-y-4 pr-3.5">
                                          {complaint.responses.map((r) => {
                                            const isUserMsg = r.role === 'user';
                                            return (
                                              <div
                                                key={r.id}
                                                className={`flex w-full ${isUserMsg ? 'justify-end' : 'justify-start'}`}
                                              >
                                                <div
                                                  className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 shadow-sm border ${
                                                    isUserMsg
                                                      ? 'bg-orange-50/80 border-orange-100/50 rounded-3xl rounded-br-sm'
                                                      : 'bg-white border-slate-200/50 rounded-3xl rounded-bl-sm'
                                                  }`}
                                                >
                                                  <div className="flex items-center gap-2 mb-1.5 justify-between">
                                                    <span className="font-bold text-xs text-slate-800">{r.author}</span>
                                                    <Badge className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                                      isUserMsg
                                                        ? 'bg-orange-100 text-[#EF7B55] hover:bg-orange-100/80 border-0'
                                                        : 'bg-slate-100 text-slate-500 hover:bg-slate-100/80 border-0'
                                                    }`}>
                                                      {r.role}
                                                    </Badge>
                                                  </div>
                                                  <p className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">{r.message}</p>
                                                  <p className={`text-[9px] font-bold text-right mt-1.5 uppercase tracking-wide ${isUserMsg ? 'text-[#EF7B55]/70' : 'text-slate-400'}`}>
                                                    {relativeTime(r.created_at)}
                                                  </p>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </ScrollArea>
                                    </div>
                                  </div>
                                </>
                              )}

                              {/* Interactive Chat Response Input */}
                              <Separator className="my-4 bg-slate-100" />
                              <div className="space-y-2">
                                <Label htmlFor={`new-message-${complaint.id}`} className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                  Post Response Update
                                </Label>
                                <div className="flex items-end gap-2.5">
                                  <Textarea
                                    id={`new-message-${complaint.id}`}
                                    placeholder="Add updates, request reviews, or reply to support staff..."
                                    value={message}
                                    onChange={(e) =>
                                      setMessageById((m) => ({ ...m, [complaint.id]: e.target.value }))
                                    }
                                    rows={2}
                                    className="text-sm flex-1 rounded-xl border-slate-200 resize-none focus:border-[#EF7B55] focus:ring-0 bg-white focus:shadow-inner transition-all"
                                  />
                                  <Button
                                    onClick={() => handleAddResponse(complaint)}
                                    disabled={postingId === complaint.id || !message.trim()}
                                    className="h-10 w-10 rounded-xl bg-gradient-to-r from-[#EF7B55] to-[#d4533a] hover:from-[#e8654a] hover:to-[#c44830] text-white shadow-md hover:shadow-lg shrink-0 p-0 transition-all duration-200"
                                  >
                                    {postingId === complaint.id ? (
                                      <Loader2 className="h-4.5 w-4.5 animate-spin text-white" />
                                    ) : (
                                      <Send className="h-4.5 w-4.5 text-white" />
                                    )}
                                  </Button>
                                </div>
                              </div>

                              {/* Ticket Inline Attachments Upload */}
                              <Separator className="my-4 bg-slate-100" />
                              <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Attach Additional Document proofs</Label>
                                <div
                                  className="border-2 border-dashed border-slate-200 hover:border-[#EF7B55]/50 bg-white hover:bg-orange-50/10 rounded-2xl p-4 text-center cursor-pointer transition-all duration-300 group"
                                  onClick={() => document.getElementById(`additional-file-upload-${complaint.id}`)?.click()}
                                  onDrop={(e) => handleAdditionalDrop(complaint.id, e)}
                                  onDragOver={(e) => e.preventDefault()}
                                >
                                  <Upload className="h-4.5 w-4.5 mx-auto text-slate-400 mb-1.5 group-hover:text-[#EF7B55] transition-colors" />
                                  <p className="text-xs text-slate-700 font-semibold">
                                    Drag and drop additional files, or <span className="text-[#EF7B55] font-bold group-hover:underline">browse</span>
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
                                  <div className="flex flex-wrap gap-2 mt-2.5">
                                    {extraFiles.map((file, index) => (
                                      <div key={index} className="flex items-center gap-2 bg-white border border-slate-100 rounded-xl pl-3 pr-2 py-1.5 shadow-sm text-sm">
                                        <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                        <span className="truncate max-w-[120px] text-xs font-medium text-slate-700">{file.name}</span>
                                        <span className="text-[9px] font-bold text-slate-400 shrink-0 bg-slate-50 px-1.5 py-0.5 rounded-md">{formatFileSize(file.size)}</span>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => removeAdditionalFile(complaint.id, index)}
                                          className="p-1 h-auto w-auto rounded-md opacity-40 hover:opacity-100 hover:bg-rose-50 transition-all"
                                        >
                                          <Trash className="h-3.5 w-3.5 text-rose-500" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <div className="flex justify-end pt-1">
                                  <Button
                                    onClick={() => handleUploadAdditionalAttachments(complaint)}
                                    disabled={uploadingId === complaint.id || extraFiles.length === 0}
                                    size="sm"
                                    className="rounded-xl bg-gradient-to-r from-[#EF7B55] to-[#d4533a] hover:from-[#e8654a] hover:to-[#c44830] text-white shadow-md hover:shadow-lg font-bold transition-all px-4 py-2 h-9"
                                  >
                                    {uploadingId === complaint.id ? (
                                      <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin text-white" />
                                        Uploading...
                                      </>
                                    ) : (
                                      <>
                                        <Upload className="h-4 w-4 mr-1.5" />
                                        Upload Proofs
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>

                              {/* Ticket Footer Timestamps */}
                              <div className="mt-4 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 pt-3.5 border-t border-slate-100">
                                <span>
                                  Filed: {format(new Date(complaint.created_at), "MMM dd, yyyy 'at' h:mm a")}
                                </span>
                                <span>
                                  {refreshingId === complaint.id ? (
                                    <span className="inline-flex items-center gap-1 text-[#EF7B55] font-bold">
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Synchronizing...
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

      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Award,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

type TemplateType = "techxagon" | "akure";

type CertRequest = {
  id: number;
  access_id: string;
  student_name: string;
  student_email: string;
  course_name: string;
  status: "pending" | "approved" | "rejected";
  rejection_note: string;
  reviewed_by: string;
  reviewed_at: string | null;
  created_at: string;
  certificate_number: string | null;
};

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All Requests" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

function StatusBadge({ status }: { status: CertRequest["status"] }) {
  if (status === "pending")
    return (
      <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 gap-1">
        <Clock className="w-3 h-3" /> Pending
      </Badge>
    );
  if (status === "approved")
    return (
      <Badge className="bg-green-50 text-green-700 border-green-200 gap-1">
        <CheckCircle2 className="w-3 h-3" /> Approved
      </Badge>
    );
  return (
    <Badge className="bg-red-50 text-red-700 border-red-200 gap-1">
      <XCircle className="w-3 h-3" /> Rejected
    </Badge>
  );
}

export default function CertificateRequestsPage() {
  const [requests, setRequests] = useState<CertRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  // Approve modal
  const [approveTarget, setApproveTarget] = useState<CertRequest | null>(null);
  const [approveTemplate, setApproveTemplate] = useState<TemplateType>("techxagon");
  const [approving, setApproving] = useState(false);

  // Reject modal
  const [rejectTarget, setRejectTarget] = useState<CertRequest | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [rejecting, setRejecting] = useState(false);

  // Detail modal
  const [detailTarget, setDetailTarget] = useState<CertRequest | null>(null);

  const fetchRequests = async (filter = statusFilter) => {
    setLoading(true);
    try {
      const url =
        filter === "all"
          ? "/api/admin/certificate-requests"
          : `/api/admin/certificate-requests?status=${filter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.detail || "Failed to load");
      setRequests(data.results || []);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleFilterChange = (val: string) => {
    setStatusFilter(val);
    fetchRequests(val);
  };

  const handleApprove = async () => {
    if (!approveTarget) return;
    setApproving(true);
    try {
      const res = await fetch(
        `/api/admin/certificate-requests/${approveTarget.id}/approve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ template: approveTemplate }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.detail || "Failed to approve");
      toast({ title: "Approved!", description: `Certificate issued: ${data.certificate_number}` });
      setApproveTarget(null);
      fetchRequests();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    setRejecting(true);
    try {
      const res = await fetch(
        `/api/admin/certificate-requests/${rejectTarget.id}/reject`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rejection_note: rejectNote }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.detail || "Failed to reject");
      toast({ title: "Request Rejected" });
      setRejectTarget(null);
      setRejectNote("");
      fetchRequests();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setRejecting(false);
    }
  };

  const pending = requests.filter((r) => r.status === "pending").length;
  const approved = requests.filter((r) => r.status === "approved").length;
  const rejected = requests.filter((r) => r.status === "rejected").length;

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <Award className="w-6 h-6 text-[#EF7B55]" />
            Certificate Requests
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review and approve public certificate requests from students.
          </p>
        </div>
        <Button variant="outline" onClick={() => fetchRequests()} size="sm">
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Pending", count: pending, color: "bg-yellow-50 border-yellow-200 text-yellow-700" },
          { label: "Approved", count: approved, color: "bg-green-50 border-green-200 text-green-700" },
          { label: "Rejected", count: rejected, color: "bg-red-50 border-red-200 text-red-700" },
        ].map(({ label, count, color }) => (
          <div key={label} className={`rounded-xl border px-4 py-3 ${color}`}>
            <p className="text-2xl font-bold">{count}</p>
            <p className="text-xs font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={handleFilterChange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTER_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {requests.length} request{requests.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-muted-foreground text-sm py-8 text-center">Loading requests…</div>
      ) : requests.length === 0 ? (
        <div className="p-10 text-center border rounded-xl bg-muted/10 text-muted-foreground flex flex-col items-center">
          <AlertCircle className="w-8 h-8 mb-2 opacity-40" />
          No certificate requests found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {requests.map((req) => (
            <Card key={req.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="p-4 pb-2 bg-muted/10 border-b">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <CardTitle className="text-base truncate">{req.student_name}</CardTitle>
                    <CardDescription className="text-xs truncate mt-0.5">
                      {req.access_id}
                    </CardDescription>
                  </div>
                  <StatusBadge status={req.status} />
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                <div className="text-sm">
                  <strong>Course:</strong> {req.course_name}
                </div>
                {req.student_email && (
                  <div className="text-sm text-muted-foreground truncate">
                    ✉ {req.student_email}
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  Submitted {new Date(req.created_at).toLocaleDateString("en-GB", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </div>
                {req.status === "approved" && req.certificate_number && (
                  <div className="text-xs text-green-700 font-mono">
                    Cert: {req.certificate_number}
                  </div>
                )}
                {req.status === "rejected" && req.rejection_note && (
                  <div className="text-xs text-red-600 bg-red-50 rounded p-2 mt-1">
                    Reason: {req.rejection_note}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => setDetailTarget(req)}
                  >
                    <Eye className="w-3.5 h-3.5 mr-1" /> Details
                  </Button>
                  {req.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => {
                          setApproveTarget(req);
                          setApproveTemplate("techxagon");
                        }}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => {
                          setRejectTarget(req);
                          setRejectNote("");
                        }}
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Approve Modal */}
      <Dialog open={!!approveTarget} onOpenChange={(o) => !o && setApproveTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" /> Approve Certificate Request
            </DialogTitle>
            <DialogDescription>
              Approving for <strong>{approveTarget?.student_name}</strong> —{" "}
              {approveTarget?.course_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium block mb-1.5">
                Select Certificate Template
              </label>
              <Select
                value={approveTemplate}
                onValueChange={(v) => setApproveTemplate(v as TemplateType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="techxagon">Techxagon — Certificate of Completion</SelectItem>
                  <SelectItem value="akure">Akure — Certificate of Achievement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {approveTarget?.student_email && (
              <p className="text-xs text-muted-foreground">
                An approval email will be sent to{" "}
                <strong>{approveTarget.student_email}</strong>.
              </p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setApproveTarget(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              disabled={approving}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {approving ? "Approving…" : "Confirm Approval"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={!!rejectTarget} onOpenChange={(o) => !o && setRejectTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" /> Reject Certificate Request
            </DialogTitle>
            <DialogDescription>
              Rejecting request from <strong>{rejectTarget?.student_name}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <label className="text-sm font-medium block mb-1">
              Rejection Reason <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <Textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="e.g. We could not verify your participation in this course."
              rows={3}
            />
            {rejectTarget?.student_email && (
              <p className="text-xs text-muted-foreground">
                A rejection email will be sent to{" "}
                <strong>{rejectTarget.student_email}</strong>.
              </p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRejectTarget(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              disabled={rejecting}
              variant="destructive"
            >
              {rejecting ? "Rejecting…" : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={!!detailTarget} onOpenChange={(o) => !o && setDetailTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
          </DialogHeader>
          {detailTarget && (
            <div className="space-y-3 text-sm py-1">
              {[
                ["Access ID", detailTarget.access_id],
                ["Student Name", detailTarget.student_name],
                ["Email", detailTarget.student_email || "Not provided"],
                ["Course", detailTarget.course_name],
                ["Status", detailTarget.status],
                ["Submitted", new Date(detailTarget.created_at).toLocaleString()],
                ["Reviewed by", detailTarget.reviewed_by || "—"],
                ["Certificate No", detailTarget.certificate_number || "—"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4">
                  <span className="text-muted-foreground shrink-0">{label}</span>
                  <span className="font-medium text-right break-all">{value}</span>
                </div>
              ))}
              {detailTarget.rejection_note && (
                <div className="bg-red-50 rounded-lg p-3 text-red-700">
                  <strong>Rejection note:</strong> {detailTarget.rejection_note}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailTarget(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

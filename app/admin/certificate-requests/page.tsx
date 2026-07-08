"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Award,
  AlertCircle,
  RefreshCw,
  Printer,
  ArrowLeft,
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

type CertificateData = {
  id: number;
  number: string;
  template: TemplateType;
  school_name: string;
};

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
  certificate: CertificateData | null;
};

/* ─── Cert Preview Components ──────────────────────────────── */
function TechxagonPreview({ req }: { req: CertRequest }) {
  return (
    <div className="relative w-full aspect-[1260/820] select-none">
      <Image src="/certificate.png" fill className="object-contain" alt="Techxagon Certificate" priority />

      {/* Student Name */}
      <div className="absolute flex items-center justify-center"
        style={{ top: "37%", left: "35%", right: "8%", height: "12%" }}>
        <p className="text-center w-full" style={{
          fontFamily: "'Dancing Script', 'Brush Script MT', cursive",
          fontSize: "clamp(0.8rem, 3.5vw, 2.8rem)",
          lineHeight: "1.1",
          color: "#000000",
          fontWeight: 400,
        }}>
          {req.student_name}
        </p>
      </div>

      {/* Course Name */}
      <div className="absolute flex items-start justify-center"
        style={{ top: "57%", left: "35%", right: "8%", height: "10%" }}>
        <p className="text-center w-full" style={{
          fontSize: "clamp(0.45rem, 1.6vw, 1.1rem)",
          lineHeight: "1.4",
          color: "#000000",
          fontWeight: 800,
        }}>
          {req.course_name}
        </p>
      </div>

      {/* School Name */}
      {req.certificate?.school_name && (
        <div className="absolute flex items-start justify-center"
          style={{ top: "63%", left: "35%", right: "8%", height: "6%" }}>
          <p className="text-center w-full" style={{
            fontSize: "clamp(0.4rem, 1.3vw, 0.9rem)",
            lineHeight: "1.4",
            color: "#333333",
            fontWeight: 700,
          }}>
            at {req.certificate.school_name}
          </p>
        </div>
      )}
    </div>
  );
}

function AkurePreview({ req }: { req: CertRequest }) {
  return (
    <div className="relative w-full aspect-[1260/880] select-none">
      <Image src="/akure_cert_image.png" fill className="object-contain" alt="Akure Certificate" priority />

      {/* Student Name */}
      <div className="absolute flex items-center justify-start"
        style={{ top: "35%", left: "3%", right: "40%", height: "14%" }}>
        <p className="w-full" style={{
          fontFamily: "'Dancing Script', 'Brush Script MT', cursive",
          fontSize: "clamp(0.7rem, 3vw, 2.5rem)",
          lineHeight: "1.1",
          color: "#000000",
          fontWeight: 400,
          textAlign: "center",
        }}>
          {req.student_name}
        </p>
      </div>

      {/* Course Name — elegant typography */}
      <div className="absolute flex flex-col items-center justify-start"
        style={{ top: "49%", left: "1%", right: "40%", height: "14%" }}>
        <div style={{
          width: "38%", height: "1px",
          background: "linear-gradient(to right, transparent, #b5561a, transparent)",
          marginBottom: "clamp(2px, 0.6vw, 6px)",
        }} />
        <p style={{
          fontFamily: "'Georgia', 'Times New Roman', serif",
          fontSize: "clamp(0.55rem, 1.6vw, 1.15rem)",
          fontStyle: "italic",
          fontWeight: 400,
          letterSpacing: "0.12em",
          color: "#6b3a1f",
          textAlign: "center",
          margin: 0,
          lineHeight: 1.3,
        }}>
          for successfully completing
        </p>
        <p style={{
          fontFamily: "'Georgia', 'Times New Roman', serif",
          fontSize: "clamp(0.7rem, 2.2vw, 1.65rem)",
          fontWeight: 700,
          letterSpacing: "0.18em",
          color: "#1a1a1a",
          textAlign: "center",
          textTransform: "uppercase",
          margin: "clamp(1px, 0.3vw, 4px) 0 0",
          lineHeight: 1.25,
        }}>
          {req.course_name}
        </p>
      </div>

      {/* CEO Signature */}
      <div className="absolute" style={{ bottom: "25%", left: "9%", width: "16%", height: "12%" }}>
        <Image src="/ceo.png" fill className="object-contain" alt="CEO Signature" />
      </div>
      {/* FEO Signature */}
      <div className="absolute" style={{ bottom: "25%", left: "48%", width: "16%", height: "12%" }}>
        <Image src="/feo.png" fill className="object-contain" alt="FEO Signature" />
      </div>
    </div>
  );
}

function CertPreview({ req }: { req: CertRequest }) {
  if (req.certificate?.template === "akure") return <AkurePreview req={req} />;
  return <TechxagonPreview req={req} />;
}

/* ─── Status Badge ─────────────────────────────────────────── */
function StatusBadge({ status }: { status: CertRequest["status"] }) {
  if (status === "pending")
    return <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 gap-1"><Clock className="w-3 h-3" /> Pending</Badge>;
  if (status === "approved")
    return <Badge className="bg-green-50 text-green-700 border-green-200 gap-1"><CheckCircle2 className="w-3 h-3" /> Approved</Badge>;
  return <Badge className="bg-red-50 text-red-700 border-red-200 gap-1"><XCircle className="w-3 h-3" /> Rejected</Badge>;
}

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All Requests" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

/* ─── Main Page ────────────────────────────────────────────── */
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

  // Preview — full-screen overlay
  const [previewTarget, setPreviewTarget] = useState<CertRequest | null>(null);

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

  useEffect(() => { fetchRequests(); }, []);

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

  const pending  = requests.filter((r) => r.status === "pending").length;
  const approved = requests.filter((r) => r.status === "approved").length;
  const rejected = requests.filter((r) => r.status === "rejected").length;

  /* ── Full-screen Certificate Preview ── */
  if (previewTarget) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col -m-6">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 bg-white border-b shadow-sm print:hidden">
          <button
            onClick={() => setPreviewTarget(null)}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Requests
          </button>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-500">
              <span className="font-medium text-gray-800">{previewTarget.student_name}</span>
              {" — "}{previewTarget.course_name}
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 text-sm bg-[#EF7B55] text-white px-4 py-2 rounded-lg hover:bg-[#e06a44] transition-colors"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>
          </div>
        </div>

        {/* Certificate */}
        <div id="cert-print-area" className="flex-1 flex items-start justify-center p-6">
          <div className="w-full max-w-5xl">
            <CertPreview req={previewTarget} />
          </div>
        </div>

        <style>{`
          @media print {
            body * { visibility: hidden; }
            #cert-print-area, #cert-print-area * { visibility: visible; }
            #cert-print-area { position: fixed; top: 0; left: 0; width: 100vw; margin: 0; padding: 0; }
          }
        `}</style>
      </div>
    );
  }

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
          { label: "Pending",  count: pending,  color: "bg-yellow-50 border-yellow-200 text-yellow-700" },
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
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
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
                    <CardDescription className="text-xs truncate mt-0.5">{req.access_id}</CardDescription>
                  </div>
                  <StatusBadge status={req.status} />
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                <div className="text-sm"><strong>Course:</strong> {req.course_name}</div>
                {req.student_email && (
                  <div className="text-sm text-muted-foreground truncate">✉ {req.student_email}</div>
                )}
                <div className="text-xs text-muted-foreground">
                  Submitted {new Date(req.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </div>
                {req.status === "approved" && req.certificate_number && (
                  <div className="text-xs text-green-700 font-mono">Cert: {req.certificate_number}</div>
                )}
                {req.status === "rejected" && req.rejection_note && (
                  <div className="text-xs text-red-600 bg-red-50 rounded p-2 mt-1">
                    Reason: {req.rejection_note}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button variant="ghost" size="sm" className="flex-1" onClick={() => setDetailTarget(req)}>
                    <Eye className="w-3.5 h-3.5 mr-1" /> Details
                  </Button>

                  {/* Preview — only for approved requests */}
                  {req.status === "approved" && req.certificate && (
                    <Button
                      size="sm"
                      className="flex-1 bg-[#EF7B55] hover:bg-[#e06a44] text-white"
                      onClick={() => setPreviewTarget(req)}
                    >
                      <Award className="w-3.5 h-3.5 mr-1" /> Preview
                    </Button>
                  )}

                  {req.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => { setApproveTarget(req); setApproveTemplate("techxagon"); }}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => { setRejectTarget(req); setRejectNote(""); }}
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
              Approving for <strong>{approveTarget?.student_name}</strong> — {approveTarget?.course_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium block mb-1.5">Select Certificate Template</label>
              <Select value={approveTemplate} onValueChange={(v) => setApproveTemplate(v as TemplateType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="techxagon">Techxagon — Certificate of Completion</SelectItem>
                  <SelectItem value="akure">Akure — Certificate of Achievement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {approveTarget?.student_email && (
              <p className="text-xs text-muted-foreground">
                An approval email will be sent to <strong>{approveTarget.student_email}</strong>.
              </p>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setApproveTarget(null)}>Cancel</Button>
            <Button onClick={handleApprove} disabled={approving} className="bg-green-600 hover:bg-green-700 text-white">
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
                A rejection email will be sent to <strong>{rejectTarget.student_email}</strong>.
              </p>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRejectTarget(null)}>Cancel</Button>
            <Button onClick={handleReject} disabled={rejecting} variant="destructive">
              {rejecting ? "Rejecting…" : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={!!detailTarget} onOpenChange={(o) => !o && setDetailTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Request Details</DialogTitle></DialogHeader>
          {detailTarget && (
            <div className="space-y-3 text-sm py-1">
              {([
                ["Access ID",      detailTarget.access_id],
                ["Student Name",   detailTarget.student_name],
                ["Email",          detailTarget.student_email || "Not provided"],
                ["Course",         detailTarget.course_name],
                ["Status",         detailTarget.status],
                ["Submitted",      new Date(detailTarget.created_at).toLocaleString()],
                ["Reviewed by",    detailTarget.reviewed_by || "—"],
                ["Certificate No", detailTarget.certificate_number || "—"],
                ["Template",       detailTarget.certificate?.template ?? "—"],
              ] as [string, string][]).map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4">
                  <span className="text-muted-foreground shrink-0">{label}</span>
                  <span className="font-medium text-right break-all capitalize">{value}</span>
                </div>
              ))}
              {detailTarget.rejection_note && (
                <div className="bg-red-50 rounded-lg p-3 text-red-700">
                  <strong>Rejection note:</strong> {detailTarget.rejection_note}
                </div>
              )}
              {detailTarget.status === "approved" && detailTarget.certificate && (
                <Button
                  className="w-full mt-2 bg-[#EF7B55] hover:bg-[#e06a44] text-white"
                  onClick={() => { setDetailTarget(null); setPreviewTarget(detailTarget); }}
                >
                  <Award className="w-4 h-4 mr-2" /> Preview Certificate
                </Button>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailTarget(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

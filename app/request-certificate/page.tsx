"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Send,
  Award,
  Printer,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";

/* ─── Types ─────────────────────────────────────────────── */
type Org = { id: number; name: string; slug: string };
type CertData = {
  id: number;
  number: string;
  student_name: string;
  course_name: string;
  school_name: string;
  template: "techxagon" | "akure";
  created_at: string;
};
type StatusResult = {
  access_id: string;
  student_name: string;
  course_name: string;
  organization_name: string;
  status: "pending" | "approved" | "rejected";
  rejection_note: string;
  created_at: string;
  certificate: CertData | null;
};

/* ─── Certificate Preview (same logic as admin page) ────── */
function CertificatePreview({ cert }: { cert: CertData }) {
  if (cert.template === "akure") {
    return (
      <div className="relative w-full aspect-[1260/880] select-none">
        <Image
          src="/akure_cert_image.png"
          fill
          className="object-contain"
          alt="Akure Certificate"
          priority
        />
        <div
          className="absolute flex items-center justify-start"
          style={{ top: "35%", left: "3%", right: "40%", height: "14%" }}
        >
          <p
            className="w-full text-center"
            style={{
              fontFamily: "'Dancing Script', cursive",
              fontSize: "clamp(0.7rem, 3vw, 2.5rem)",
              color: "#000",
              fontWeight: 400,
            }}
          >
            {cert.student_name}
          </p>
        </div>

        {/* Course Name — elegant certificate typography below the name underline */}
        <div
          className="absolute flex flex-col items-center justify-start"
          style={{ top: "49%", left: "1%", right: "40%", height: "14%" }}
        >
          {/* Thin decorative gradient rule */}
          <div style={{
            width: "38%",
            height: "1px",
            background: "linear-gradient(to right, transparent, #b5561a, transparent)",
            marginBottom: "clamp(2px, 0.6vw, 6px)",
          }} />

          {/* Intro phrase — light italic serif */}
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

          {/* Course name — bold uppercase with tracking */}
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
            paddingLeft: "0.05em",
          }}>
            {cert.course_name}
          </p>
        </div>

        <div
          className="absolute"
          style={{ bottom: "25%", left: "9%", width: "16%", height: "12%" }}
        >
          <Image src="/ceo.png" fill className="object-contain" alt="CEO Signature" />
        </div>
        <div
          className="absolute"
          style={{ bottom: "25%", left: "48%", width: "16%", height: "12%" }}
        >
          <Image src="/feo.png" fill className="object-contain" alt="FEO Signature" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-[1260/820] select-none">
      <Image src="/certificate.png" fill className="object-contain" alt="Certificate" priority />
      <div
        className="absolute flex items-center justify-center"
        style={{ top: "37%", left: "35%", right: "8%", height: "12%" }}
      >
        <p
          className="text-center w-full"
          style={{
            fontFamily: "'Dancing Script', cursive",
            fontSize: "clamp(0.8rem, 3.5vw, 2.8rem)",
            color: "#000",
            fontWeight: 400,
          }}
        >
          {cert.student_name}
        </p>
      </div>
      <div
        className="absolute flex items-start justify-center"
        style={{ top: "57%", left: "35%", right: "8%", height: "10%" }}
      >
        <p
          className="text-center w-full"
          style={{
            fontSize: "clamp(0.45rem, 1.6vw, 1.1rem)",
            color: "#000",
            fontWeight: 800,
          }}
        >
          {cert.course_name}
        </p>
      </div>
      {cert.school_name && (
        <div
          className="absolute flex items-start justify-center"
          style={{ top: "63%", left: "35%", right: "8%", height: "6%" }}
        >
          <p
            className="text-center w-full"
            style={{
              fontSize: "clamp(0.4rem, 1.3vw, 0.9rem)",
              color: "#333",
              fontWeight: 700,
            }}
          >
            at {cert.school_name}
          </p>
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function RequestCertificatePage() {
  const [tab, setTab] = useState<"request" | "check">("request");

  /* ── Request form state ── */
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [courses, setCourses] = useState<string[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    student_name: "",
    student_email: "",
    org_id: "",
    course_name: "",
  });
  const [submitted, setSubmitted] = useState<{ access_id: string } | null>(null);
  const [formError, setFormError] = useState("");

  /* ── Check status state ── */
  const [accessIdInput, setAccessIdInput] = useState("");
  const [checking, setChecking] = useState(false);
  const [statusResult, setStatusResult] = useState<StatusResult | null>(null);
  const [checkError, setCheckError] = useState("");
  const [showCert, setShowCert] = useState(false);

  /* Load organisations on mount */
  useEffect(() => {
    fetch("/api/certificates/public-orgs")
      .then((r) => r.json())
      .then((d) => setOrgs(d.results || []))
      .catch(() => setOrgs([]))
      .finally(() => setLoadingOrgs(false));
  }, []);

  /* Load courses when org changes */
  useEffect(() => {
    if (!form.org_id) {
      setCourses([]);
      return;
    }
    setLoadingCourses(true);
    setForm((prev) => ({ ...prev, course_name: "" }));
    fetch(`/api/certificates/public-courses?org_id=${form.org_id}`)
      .then((r) => r.json())
      .then((d) => setCourses(d.results || []))
      .catch(() => setCourses([]))
      .finally(() => setLoadingCourses(false));
  }, [form.org_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!form.student_name.trim()) return setFormError("Full name is required.");
    if (!form.org_id) return setFormError("Please select an organisation.");
    if (!form.course_name) return setFormError("Please select a course.");

    setSubmitting(true);
    try {
      const res = await fetch("/api/certificates/public-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.error || "Submission failed");
      setSubmitted({ access_id: data.access_id });
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckError("");
    setStatusResult(null);
    setShowCert(false);
    if (!accessIdInput.trim()) return setCheckError("Please enter your Access ID.");
    setChecking(true);
    try {
      const res = await fetch(`/api/certificates/public-status/${accessIdInput.trim()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.error || "Not found");
      setStatusResult(data);
    } catch (err: any) {
      setCheckError(err.message);
    } finally {
      setChecking(false);
    }
  };

  /* ─── Certificate full-page view ─── */
  if (showCert && statusResult?.certificate) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 bg-white border-b print:hidden">
          <button
            onClick={() => setShowCert(false)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 text-sm bg-[#EF7B55] text-white px-4 py-2 rounded-lg hover:bg-[#e06a44] transition-colors"
          >
            <Printer className="w-4 h-4" /> Print / Save PDF
          </button>
        </div>
        <div id="cert-print-area" className="flex-1 p-4 flex items-start justify-center">
          <div className="w-full max-w-5xl">
            <CertificatePreview cert={statusResult.certificate} />
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
    <div className="min-h-screen bg-gradient-to-br from-[#fff8f5] via-white to-[#f0f4ff] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-9 h-9 relative">
            <Image src="/texagon-logo.png" fill className="object-contain" alt="Techxagon" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-none">Techxagon Academy</h1>
            <p className="text-xs text-gray-500">Certificate Portal</p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 sm:py-12">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#EF7B55] to-[#f5a07a] shadow-lg mb-4">
            <Award className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
            Certificate Request Portal
          </h2>
          <p className="text-gray-500 text-sm sm:text-base max-w-md mx-auto">
            Request your certificate even if you don't have a Techxagon account. Fill in your
            details and we'll notify the organisation.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
          {(["request", "check"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                tab === t
                  ? "bg-white text-[#EF7B55] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "request" ? "Request Certificate" : "Check Status"}
            </button>
          ))}
        </div>

        {/* ── REQUEST TAB ── */}
        {tab === "request" && (
          <>
            {submitted ? (
              /* Success state */
              <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-8 text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50">
                  <CheckCircle2 className="w-9 h-9 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Request Submitted!</h3>
                <p className="text-gray-500 text-sm">
                  Your certificate request has been sent to the organisation. A staff member will
                  review it shortly.
                </p>
                <div className="bg-orange-50 border border-orange-200 rounded-xl px-6 py-4">
                  <p className="text-xs text-orange-600 font-medium mb-1 uppercase tracking-wide">
                    Your Access ID — save this!
                  </p>
                  <p className="text-2xl font-mono font-bold text-orange-700 tracking-widest">
                    {submitted.access_id}
                  </p>
                </div>
                <p className="text-xs text-gray-400">
                  Use this ID in the "Check Status" tab to view your approval status and download
                  your certificate once approved.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <button
                    onClick={() => {
                      setAccessIdInput(submitted.access_id);
                      setTab("check");
                    }}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#EF7B55] text-white rounded-lg text-sm font-medium hover:bg-[#e06a44] transition-colors"
                  >
                    Check Status <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSubmitted(null);
                      setForm({ student_name: "", student_email: "", org_id: "", course_name: "" });
                    }}
                    className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Submit another request
                  </button>
                </div>
              </div>
            ) : (
              /* Request form */
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.student_name}
                      onChange={(e) => setForm((p) => ({ ...p, student_name: e.target.value }))}
                      placeholder="e.g. John Adebayo"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#EF7B55]/40 focus:border-[#EF7B55] transition-colors"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email Address{" "}
                      <span className="text-gray-400 font-normal">(optional — for notifications)</span>
                    </label>
                    <input
                      type="email"
                      value={form.student_email}
                      onChange={(e) => setForm((p) => ({ ...p, student_email: e.target.value }))}
                      placeholder="you@example.com"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#EF7B55]/40 focus:border-[#EF7B55] transition-colors"
                    />
                  </div>

                  {/* Organisation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Organisation <span className="text-red-500">*</span>
                    </label>
                    {loadingOrgs ? (
                      <div className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-400 bg-gray-50">
                        Loading organisations…
                      </div>
                    ) : (
                      <select
                        value={form.org_id}
                        onChange={(e) => setForm((p) => ({ ...p, org_id: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#EF7B55]/40 focus:border-[#EF7B55] transition-colors bg-white"
                      >
                        <option value="">Select organisation…</option>
                        {orgs.map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Course */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Course <span className="text-red-500">*</span>
                    </label>
                    {loadingCourses ? (
                      <div className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-400 bg-gray-50">
                        Loading courses…
                      </div>
                    ) : (
                      <select
                        value={form.course_name}
                        onChange={(e) => setForm((p) => ({ ...p, course_name: e.target.value }))}
                        disabled={!form.org_id || courses.length === 0}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#EF7B55]/40 focus:border-[#EF7B55] transition-colors bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">
                          {!form.org_id
                            ? "Select an organisation first…"
                            : courses.length === 0
                            ? "No courses available"
                            : "Select course…"}
                        </option>
                        {courses.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {formError && (
                    <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                      {formError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#EF7B55] to-[#f5a07a] text-white font-semibold rounded-xl shadow hover:opacity-90 transition-opacity disabled:opacity-60 text-sm"
                  >
                    {submitting ? (
                      "Submitting…"
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> Request Certificate
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </>
        )}

        {/* ── CHECK STATUS TAB ── */}
        {tab === "check" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <form onSubmit={handleCheckStatus} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Enter your Access ID
                  </label>
                  <input
                    type="text"
                    value={accessIdInput}
                    onChange={(e) => setAccessIdInput(e.target.value.toUpperCase())}
                    placeholder="e.g. CREQ-A1B2C3-D4E5F6"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-[#EF7B55]/40 focus:border-[#EF7B55] transition-colors"
                  />
                </div>
                {checkError && (
                  <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                    {checkError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={checking}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#EF7B55] to-[#f5a07a] text-white font-semibold rounded-xl shadow hover:opacity-90 transition-opacity disabled:opacity-60 text-sm"
                >
                  {checking ? (
                    "Checking…"
                  ) : (
                    <>
                      <Search className="w-4 h-4" /> Check Status
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Status result */}
            {statusResult && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                {/* Status badge */}
                <div className="flex items-center gap-3">
                  {statusResult.status === "pending" && (
                    <div className="flex items-center gap-2 bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-full text-sm font-semibold">
                      <Clock className="w-4 h-4" /> Pending Review
                    </div>
                  )}
                  {statusResult.status === "approved" && (
                    <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-semibold">
                      <CheckCircle2 className="w-4 h-4" /> Approved
                    </div>
                  )}
                  {statusResult.status === "rejected" && (
                    <div className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1.5 rounded-full text-sm font-semibold">
                      <XCircle className="w-4 h-4" /> Not Approved
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-400 text-xs">Student</p>
                    <p className="font-semibold text-gray-800">{statusResult.student_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Course</p>
                    <p className="font-semibold text-gray-800">{statusResult.course_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Organisation</p>
                    <p className="font-semibold text-gray-800">{statusResult.organization_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Submitted</p>
                    <p className="font-semibold text-gray-800">
                      {new Date(statusResult.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {statusResult.status === "pending" && (
                  <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 text-sm text-yellow-800">
                    Your request is under review. You'll receive an email notification (if you
                    provided one) once the organisation processes it.
                  </div>
                )}

                {statusResult.status === "rejected" && statusResult.rejection_note && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-800">
                    <strong>Reason:</strong> {statusResult.rejection_note}
                  </div>
                )}

                {statusResult.status === "approved" && statusResult.certificate && (
                  <div className="space-y-3">
                    <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-sm text-green-800">
                      🎉 Congratulations! Your certificate has been approved. Click below to view
                      and print it.
                    </div>
                    <div className="text-xs text-gray-400">
                      Certificate No: <span className="font-mono">{statusResult.certificate.number}</span>
                    </div>
                    <button
                      onClick={() => setShowCert(true)}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#EF7B55] to-[#f5a07a] text-white font-semibold rounded-xl shadow hover:opacity-90 transition-opacity text-sm"
                    >
                      <Award className="w-4 h-4" /> View & Print Certificate
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-gray-400">
        © {new Date().getFullYear()} Techxagon Academy. All rights reserved.
      </footer>
    </div>
  );
}

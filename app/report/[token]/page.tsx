"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  GraduationCap, Award, Code, ClipboardList, Video, BookOpen,
  Eye, EyeOff, User, Mail, Lock, ArrowRight,
  Shield, FileText, CheckCircle, Loader2, AlertCircle,
} from "lucide-react";
import { useBrand } from "@/hooks/use-brand";

const DJANGO_BASE = process.env.NEXT_PUBLIC_DJANGO_BASE_URL || "";

type OrgInfo = {
  report_title: string;
  organization_name: string;
  organization_logo: string | null;
};

export default function ReportGatewayPage({ params }: { params: Promise<{ token: string }> }) {
  const brand = useBrand();
  const { token } = use(params);
  const [phase, setPhase] = useState<"loading" | "verify" | "setup" | "signing_in">("loading");
  const [orgInfo, setOrgInfo] = useState<OrgInfo | null>(null);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [studentId, setStudentId] = useState<number | null>(null);
  const [parentEmail, setParentEmail] = useState("");
  const [useSamePassword, setUseSamePassword] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [setupLoading, setSetupLoading] = useState(false);

  const { data: session, status } = useSession();
  const router = useRouter();

  // If already logged in as parent, go directly to the report in the dashboard
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "parent") {
      router.replace(`/parent/reports/${token}`);
    }
  }, [status, session, token, router]);

  // Load org info for branding
  useEffect(() => {
    fetch(`/api/reports/${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.report_title) setOrgInfo(d);
        setPhase("verify");
      })
      .catch(() => setPhase("verify"));
  }, [token]);

  const handleVerify = async () => {
    setVerifying(true);
    setError("");
    try {
      const res = await fetch(`/api/reports/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || "Verification failed. Please check your credentials.");
        return;
      }
      setStudentId(data.student_id);

      if (data.has_parent && data.parent_email && data.parent_session_token) {
        // Parent account exists — auto sign in and redirect to dashboard report
        setPhase("signing_in");
        const loginRes = await signIn("credentials", {
          redirect: false,
          email: data.parent_email,
          token: data.parent_session_token,
          password: "dummy_password_for_token_auth",
        });
        if (loginRes?.error) {
          setError("Automatic login failed. Please try again.");
          setPhase("verify");
          return;
        }
        router.replace(`/parent/reports/${token}`);
        return;
      }

      if (data.needs_parent_setup) {
        setPhase("setup");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handleParentSetup = async () => {
    setSetupLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/reports/${token}?action=parent-setup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: studentId,
          email: parentEmail,
          use_same_password: useSamePassword,
          new_password: newPassword,
          student_password: password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || "Account setup failed.");
        return;
      }

      if (data.parent_email && data.parent_session_token) {
        setPhase("signing_in");
        const loginRes = await signIn("credentials", {
          redirect: false,
          email: data.parent_email,
          token: data.parent_session_token,
          password: "dummy_password_for_token_auth",
        });
        if (loginRes?.error) {
          setError("Automatic login failed. Please log in manually.");
          setPhase("setup");
          return;
        }
        router.replace(`/parent/reports/${token}`);
        return;
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSetupLoading(false);
    }
  };

  // ── LOADING ────────────────────────────────────────────────
  if (phase === "loading" || status === "loading" || (status === "authenticated" && session?.user?.role === "parent")) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-[#EF7B55]/10 rounded-2xl flex items-center justify-center">
            <Image src={brand.logo} alt={brand.name} width={36} height={36} className="object-contain animate-pulse" />
          </div>
          <Loader2 className="w-6 h-6 text-[#EF7B55] animate-spin mx-auto" />
          <p className="text-sm text-slate-500">Loading report...</p>
        </div>
      </div>
    );
  }

  // ── SIGNING IN ─────────────────────────────────────────────
  if (phase === "signing_in") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-emerald-50 rounded-2xl flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <Loader2 className="w-6 h-6 text-[#EF7B55] animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-700">Signing you in...</p>
          <p className="text-xs text-slate-400">Redirecting to your dashboard</p>
        </div>
      </div>
    );
  }

  // Shared left panel
  const LeftPanel = ({ title, subtitle, features }: { title: string; subtitle: string; features: { icon: any; title: string; desc: string }[] }) => (
    <div className="lg:w-1/2 bg-gradient-to-br from-[#EF7B55] via-[#E96D47] to-[#D85A32] text-white p-8 lg:p-16 flex flex-col justify-center relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 opacity-10">
        <svg viewBox="0 0 200 200" fill="none"><circle cx="150" cy="50" r="120" fill="white" /></svg>
      </div>
      <div className="absolute bottom-0 left-0 w-72 h-72 opacity-5">
        <svg viewBox="0 0 200 200" fill="none"><circle cx="30" cy="170" r="100" fill="white" /></svg>
      </div>
      <div className="relative z-10 max-w-md mx-auto lg:mx-0">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <Image src={brand.logo} alt={brand.name} width={30} height={30} className={`object-contain ${brand.id === "techxagon" ? "brightness-0 invert" : ""}`} />
          </div>
          <div>
            <span className="text-lg font-bold tracking-wide">{brand.name.toUpperCase()}</span>
            <p className="text-white/70 text-xs font-medium">{brand.id === "nimet" ? "Portal" : "Academy"}</p>
          </div>
        </div>
        {orgInfo?.organization_logo && (
          <img src={orgInfo.organization_logo} alt="" className="h-14 rounded-xl bg-white/20 p-1.5 object-contain mb-6" />
        )}
        <h1 className="text-3xl lg:text-4xl font-bold leading-tight mb-3">{title}</h1>
        {subtitle && <p className="text-white/80 text-base mb-8">{subtitle}</p>}
        <div className="space-y-3 mb-8">
          {features.map((f, i) => (
            <div key={i} className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3.5">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <f.icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold">{f.title}</p>
                <p className="text-xs text-white/70">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 text-xs text-white/60">
          <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> Secure Access</span>
          <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> Encrypted</span>
          <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Verified</span>
        </div>
      </div>
    </div>
  );

  // ── VERIFY ─────────────────────────────────────────────────
  if (phase === "verify") return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/20 to-blue-50/20">
      <div className="h-1.5 bg-gradient-to-r from-[#EF7B55] via-[#F79771] to-[#EF9955]" />
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-6px)]">
        <LeftPanel
          title={orgInfo?.report_title || "Student Report"}
          subtitle={orgInfo?.organization_name || ""}
          features={[
            { icon: ClipboardList, title: "Test Scores & Results", desc: "View CBT performance with detailed score breakdowns" },
            { icon: Code, title: "Coding Projects", desc: "See grades and feedback on coding assignments" },
            { icon: Award, title: "Teacher's Remarks", desc: "Read personalised notes and observations" },
            { icon: Video, title: "Lesson Videos", desc: "Watch recorded class videos and learning materials" },
          ]}
        />

        <div className="lg:w-1/2 flex items-center justify-center p-6 lg:p-16">
          <div className="w-full max-w-md space-y-6">
            <div className="lg:hidden text-center mb-4">
              <div className="flex items-center justify-center gap-2">
                <Image src={brand.logo} alt={brand.name} width={28} height={28} className="object-contain" />
                <span className="text-lg font-bold text-slate-800">{brand.name.toUpperCase()}</span>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-1">Access Your Child&apos;s Report</h2>
              <p className="text-sm text-slate-500">Enter the student&apos;s admission number and password. You&apos;ll be taken straight to your parent dashboard.</p>
            </div>
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Admission No / Email</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    value={identifier}
                    onChange={e => { setIdentifier(e.target.value); setError(""); }}
                    onKeyDown={e => e.key === "Enter" && identifier && password && handleVerify()}
                    placeholder="e.g. 2026/A4K9X2 or student@email.com"
                    className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#EF7B55]/30 focus:border-[#EF7B55] transition placeholder:text-slate-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(""); }}
                    onKeyDown={e => e.key === "Enter" && identifier && password && handleVerify()}
                    placeholder="Student password"
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#EF7B55]/30 focus:border-[#EF7B55] transition placeholder:text-slate-400"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {error && (
                <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 rounded-xl px-3 py-2.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /><span>{error}</span>
                </div>
              )}
              <button
                onClick={handleVerify}
                disabled={verifying || !identifier || !password}
                className="w-full py-3 bg-gradient-to-r from-[#EF7B55] to-[#E96D47] text-white rounded-xl hover:from-[#d96a44] hover:to-[#c85a35] disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#EF7B55]/20 hover:shadow-xl hover:shadow-[#EF7B55]/30"
              >
                {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Continue to Dashboard</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
            <div className="bg-[#EF7B55]/5 border border-[#EF7B55]/10 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-[#EF7B55]" /> How to access</p>
              <ul className="text-xs text-slate-500 space-y-1.5 ml-5">
                <li className="list-disc">Enter your child&apos;s <strong className="text-slate-600">admission number</strong> or <strong className="text-slate-600">registered email</strong></li>
                <li className="list-disc">Use the <strong className="text-slate-600">student&apos;s password</strong> provided by the school</li>
                <li className="list-disc">You&apos;ll be signed in and taken directly to the report in your dashboard</li>
              </ul>
            </div>
            <div className="text-center pt-2">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Image src={brand.logo} alt={brand.name} width={14} height={14} className="object-contain opacity-50" />
                <span className="text-xs text-slate-400">Powered by {brand.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── SETUP ──────────────────────────────────────────────────
  if (phase === "setup") return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/20 to-blue-50/20">
      <div className="h-1.5 bg-gradient-to-r from-[#EF7B55] via-[#F79771] to-[#EF9955]" />
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-6px)]">
        <LeftPanel
          title="Set Up Your Parent Account"
          subtitle="Create an account to view reports, track your child's progress, and stay updated with their learning journey."
          features={[
            { icon: FileText, title: "All Reports in One Place", desc: "Access every report shared with you from your dashboard" },
            { icon: BookOpen, title: "Track Progress Over Time", desc: "See how your child improves across terms and courses" },
            { icon: CheckCircle, title: "Get Notified Instantly", desc: "Be the first to know when new reports are published" },
          ]}
        />
        <div className="lg:w-1/2 flex items-center justify-center p-6 lg:p-16">
          <div className="w-full max-w-md space-y-6">
            <div className="lg:hidden text-center mb-4">
              <div className="flex items-center justify-center gap-2">
                <Image src={brand.logo} alt={brand.name} width={28} height={28} className="object-contain" />
                <span className="text-lg font-bold text-slate-800">{brand.name.toUpperCase()}</span>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-1">Create Your Account</h2>
              <p className="text-sm text-slate-500">Just your email — you&apos;ll be signed in and taken to the report right away.</p>
            </div>
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Your Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={parentEmail}
                    onChange={e => { setParentEmail(e.target.value); setError(""); }}
                    placeholder="parent@email.com"
                    className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#EF7B55]/30 focus:border-[#EF7B55] transition placeholder:text-slate-400"
                  />
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <div
                    onClick={() => setUseSamePassword(!useSamePassword)}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition ${useSamePassword ? "bg-[#EF7B55] border-[#EF7B55]" : "border-slate-300"}`}
                  >
                    {useSamePassword && <CheckCircle className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-sm text-slate-600">Use same password as student account</span>
                </label>
              </div>
              {!useSamePassword && (
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Create a new password"
                      className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#EF7B55]/30 focus:border-[#EF7B55] transition placeholder:text-slate-400"
                    />
                  </div>
                </div>
              )}
              {error && (
                <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 rounded-xl px-3 py-2.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /><span>{error}</span>
                </div>
              )}
              <button
                onClick={handleParentSetup}
                disabled={setupLoading || !parentEmail || (!useSamePassword && !newPassword)}
                className="w-full py-3 bg-gradient-to-r from-[#EF7B55] to-[#E96D47] text-white rounded-xl hover:from-[#d96a44] hover:to-[#c85a35] disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#EF7B55]/20"
              >
                {setupLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Create Account & Go to Dashboard</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
            <div className="text-center pt-2">
              <div className="flex items-center justify-center gap-2">
                <Image src={brand.logo} alt={brand.name} width={14} height={14} className="object-contain opacity-50" />
                <span className="text-xs text-slate-400">Powered by {brand.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return null;
}

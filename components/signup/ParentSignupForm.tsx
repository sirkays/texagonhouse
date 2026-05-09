// texagon_academy\texagonui\components\signup\ParentSignupForm.tsx
"use client";

import { useState, useEffect } from "react";

// --- Sub-Component: Signup Form ---
function ParentSignupForm({
  onOtpSent,
  formData,
  setFormData,
}: {
  // Updated signature to pass back the parentProfileId
  onOtpSent: (email: string, parentProfileId: number) => void;
  formData: any;
  setFormData: any;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState<
    "weak" | "medium" | "strong"
  >("weak");
  const [requirements, setRequirements] = useState({
    hasLowercase: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecial: false,
  });
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const checkPasswordStrength = (password: string) => {
    const checks = {
      hasLowercase: /[a-z]/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    setRequirements(checks);
    const met = Object.values(checks).filter(Boolean).length;
    if (met >= 4) setPasswordStrength("strong");
    else if (met >= 3) setPasswordStrength("medium");
    else setPasswordStrength("weak");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    setError("");
    if (name === "password") checkPasswordStrength(value);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // --- Validation ---
    if (!formData.email.includes("@"))
      return setError("Please enter a valid email address");
    if (formData.password !== formData.confirmPassword)
      return setError("Passwords do not match");
    if (passwordStrength !== "strong")
      return setError("Password must be strong");

    const required = ["firstName", "lastName", "email", "password", "phone"];
    for (const field of required) {
      if (!formData[field])
        return setError("Please fill in all required fields");
    }

    setIsSendingOtp(true);

    try {
      // 🚀 API CALL: Create Account
      const res = await fetch("/api/accounts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          address: formData.address,
          account_type: "parent",
        }),
      });

      const data = await res.json();

      console.log("create account response:", data);

      if (!res.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      // Success! Pass email AND the new parentProfileId to the next step
      onOtpSent(formData.email, data.parentProfileId);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsSendingOtp(false);
    }
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSendOtp}>
      {/* ... (Same JSX for inputs as before) ... */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            First Name
          </label>
          <input
            name="firstName"
            type="text"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#f79771] focus:border-[#f79771]"
            placeholder="John"
            value={formData.firstName}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Last Name
          </label>
          <input
            name="lastName"
            type="text"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#f79771] focus:border-[#f79771]"
            placeholder="Doe"
            value={formData.lastName}
            onChange={handleChange}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Phone</label>
        <input
          name="phone"
          type="tel"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#f79771] focus:border-[#f79771]"
          placeholder="+2348000000000"
          value={formData.phone}
          onChange={handleChange}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Address
        </label>
        <input
          name="address"
          type="text"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#f79771] focus:border-[#f79771]"
          placeholder="123 Main St, Lagos"
          value={formData.address}
          onChange={handleChange}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Email Address
        </label>
        <input
          name="email"
          type="email"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#f79771] focus:border-[#f79771]"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
        />
      </div>

      <div className="relative">
        <label className="block text-sm font-medium text-gray-700">
          Password
        </label>

        <input
          name="password"
          type={showPassword ? "text" : "password"}
          required
          className="mt-1 block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md
               focus:outline-none focus:ring-[#f79771] focus:border-[#f79771]"
          placeholder="Create strong password"
          value={formData.password}
          onChange={handleChange}
        />

        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? "🙈" : "👁️"}
        </button>
      </div>


      <div className="relative">
        <label className="block text-sm font-medium text-gray-700">
          Confirm Password
        </label>

        <input
          name="confirmPassword"
          type={showConfirmPassword ? "text" : "password"}
          required
          className="mt-1 block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md
               focus:outline-none focus:ring-[#f79771] focus:border-[#f79771]"
          placeholder="Confirm password"
          value={formData.confirmPassword}
          onChange={handleChange}
        />

        <button
          type="button"
          onClick={() => setShowConfirmPassword((v) => !v)}
          className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700"
          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
        >
          {showConfirmPassword ? "🙈" : "👁️"}
        </button>
      </div>


      {/* Password Requirements UI (Same as before) */}
      <div className="bg-gray-50 p-4 rounded-lg text-xs space-y-2">
        <p className="font-medium text-gray-700">Password must contain:</p>
        {(
          ["hasLowercase", "hasUppercase", "hasNumber", "hasSpecial"] as const
        ).map((key) => (
          <div
            key={key}
            className={`flex items-center ${requirements[key] ? "text-green-600" : "text-gray-500"
              }`}
          >
            <span
              className={`w-2 h-2 rounded-full mr-2 ${requirements[key] ? "bg-green-600" : "bg-gray-300"
                }`}
            />
            {key === "hasLowercase" && "One lowercase letter"}
            {key === "hasUppercase" && "One uppercase letter"}
            {key === "hasNumber" && "One number"}
            {key === "hasSpecial" && "One special character (!@#$ etc.)"}
          </div>
        ))}
        <p
          className={`font-semibold mt-2 ${passwordStrength === "strong"
            ? "text-green-600"
            : passwordStrength === "medium"
              ? "text-yellow-600"
              : "text-red-600"
            }`}
        >
          Strength: {passwordStrength}
        </p>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={isSendingOtp}
        className="w-full py-3 px-4 bg-[#f79771] text-white font-medium rounded-md hover:bg-[#f58667] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition"
      >
        {isSendingOtp ? "Sending OTP..." : "Send OTP & Continue"}
      </button>
    </form>
  );
}

// --- Sub-Component: OTP Verification ---
function OtpVerificationStep({
  email,
  onVerified,
  onBack,
}: {
  email: string;
  onVerified: () => void;
  onBack: () => void;
}) {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");

  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.trim().length !== 6 || !/^\d+$/.test(otp)) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), code: otp.trim() }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.detail || data?.error || "Invalid OTP");
      }

      onVerified();
    } catch (err: any) {
      setError(err?.message || "Verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setError("");
    setIsResending(true);

    try {
      const res = await fetch("/api/auth/resend-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 429 && typeof data?.retry_after === "number") {
          setCooldown(data.retry_after);
        }
        throw new Error(data?.detail || "Failed to resend OTP");
      }

      // start cooldown after success
      setCooldown(30);
    } catch (err: any) {
      setError(err?.message || "Could not resend OTP");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="max-w-md mx-auto text-center">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Check Your Email</h2>
        <p className="mt-2 text-sm text-gray-600">
          We've sent a 6-digit verification code to
        </p>
        <p className="font-semibold text-[#f79771] break-all">{email}</p>
      </div>

      <form onSubmit={handleVerify} className="space-y-6">
        <input
          type="text"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="000000"
          className="w-full px-4 py-4 text-center text-3xl font-mono tracking-widest border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#f79771] focus:ring-4 focus:ring-[#f79771]/20"
          autoFocus
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex flex-col gap-3">
          <button
            type="submit"
            disabled={isVerifying || otp.length !== 6}
            className="w-full py-3 px-4 bg-[#f79771] text-white font-medium rounded-md hover:bg-[#f58667] disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isVerifying ? "Verifying..." : "Verify & Complete Signup"}
          </button>

          <button
            type="button"
            onClick={onBack}
            className="text-sm text-gray-600 hover:text-gray-800 underline"
          >
            ← Back to edit details
          </button>
        </div>
      </form>

      <p className="mt-6 text-xs text-gray-500">
        Didn't receive the code?{" "}
        <button
          type="button"
          onClick={handleResend}
          disabled={isResending || cooldown > 0}
          className="text-[#f79771] font-medium hover:underline disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isResending
            ? "Sending..."
            : cooldown > 0
              ? `Resend in ${cooldown}s`
              : "Resend OTP"}
        </button>
      </p>
    </div>
  );
}
function ParentResumeCard({
  onResume,
}: {
  onResume: (parentProfileId: number, email: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResume = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/accounts/parent-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.detail || data?.error || "Invalid credentials");
      }

      // ✅ Resume with returned parentProfileId
      onResume(data.parentProfileId, data.email);
    } catch (err: any) {
      setError(err?.message || "Could not continue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-10 p-6 border border-gray-200 rounded-lg bg-white">
      <h3 className="text-lg font-semibold text-gray-900">
        Already have a parent account?
      </h3>
      <p className="text-sm text-gray-600 mt-1">
        Continue to add your child.
      </p>

      <form onSubmit={handleResume} className="mt-4 space-y-3">
        <input
          type="email"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value.trim())}
        />
        <input
          type="password"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-gray-900 text-white font-medium rounded-md hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Continuing..." : "Continue to Add Child"}
        </button>
      </form>
    </div>
  );
}

const STORAGE_KEY = "parentSignupFlow";

type FlowState = {
  step: "form" | "otp";
  emailForOtp: string;
  parentProfileId: number | null;
  formData: any;
};


// --- Main Export ---
export default function ParentSignupFlow({
  onComplete,
  onCancel,
}: {
  onComplete: (parentProfileId: number) => void;
  onCancel: () => void;
}) {
  const [step, setStep] = useState<"form" | "otp">("form");
  const [emailForOtp, setEmailForOtp] = useState("");
  const [parentProfileId, setParentProfileId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
  });

  // Load saved state on mount (so refresh continues)
  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const saved: FlowState = JSON.parse(raw);
      setStep(saved.step);
      setEmailForOtp(saved.emailForOtp);
      setParentProfileId(saved.parentProfileId);
      setFormData(saved.formData ?? formData);
    } catch {
      // ignore corrupted storage
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save state whenever it changes
  useEffect(() => {
    const payload: FlowState = { step, emailForOtp, parentProfileId, formData };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [step, emailForOtp, parentProfileId, formData]);

  const handleOtpSent = (email: string, id: number) => {
    setEmailForOtp(email);
    setParentProfileId(id);
    setStep("otp");
  };

  const handleResume = (id: number, email: string) => {
    // store parent id so ParentBiodataForm fallback works even after refresh
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        step: "form",          // doesn't matter much anymore, but keep it valid
        emailForOtp: email,    // optional
        parentProfileId: id,
        formData,
      })
    );

    onComplete(id); // ✅ this should route user to ParentBiodataForm page/step
  };


  const handleVerified = () => {
    if (!parentProfileId) {
      console.error("Missing Parent Profile ID");
      return;
    }

    // Clear after success
    sessionStorage.removeItem(STORAGE_KEY);

    onComplete(parentProfileId);
  };

  return (
    <div className="w-full">
      <div className="w-full">
        {step === "form" ? (
          <div>
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
              Create Parent Account
            </h1>
            <p className="text-center text-gray-600 mb-8">
              Fill in your details to get started
            </p>

            <ParentSignupForm
              onOtpSent={handleOtpSent}
              formData={formData}
              setFormData={setFormData}
            />

            {/* ✅ NEW: Resume / Add Child */}
            <ParentResumeCard onResume={handleResume} />
          </div>
        ) : (
          <OtpVerificationStep
            email={emailForOtp}
            onVerified={handleVerified}
            onBack={() => setStep("form")}
          />
        )}
      </div>
    </div>
  );
}

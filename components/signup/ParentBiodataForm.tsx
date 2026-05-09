// texagon_academy\texagonui\components\signup\ParentBiodataForm.tsx
"use client";

import { useState, useEffect } from "react";

interface ChildData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isEmailVerified: boolean;
}
const JOURNEY_KEY = "parentSignupJourney";

// --- Sub-Component: Add Child Form ---
function AddChildForm({
  onNext,
  currentChild,
  setCurrentChild,
  parentProfileId, // Receives ID
}: {
  onNext: (email: string) => void;
  currentChild: any;
  setCurrentChild: any;
  parentProfileId: number | null;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState<"list" | "form" | "otp">("list");

  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState<
    "weak" | "medium" | "strong"
  >("weak");
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  // (Include checkPasswordStrength & requirements logic here - truncated for brevity as it's same as before)
  const [requirements, setRequirements] = useState({
    hasLowercase: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecial: false,
  });
  const checkPasswordStrength = (password: string) => {
    // ... same logic ...
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
    setCurrentChild((prev: any) => ({ ...prev, [name]: value }));
    setError("");
    if (name === "password") checkPasswordStrength(value);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!parentProfileId)
      return setError("Error: Parent Profile ID missing. Please re-login.");
    if (!currentChild.email.includes("@"))
      return setError("Please enter a valid email");
    if (currentChild.password !== currentChild.confirmPassword)
      return setError("Passwords do not match");
    if (passwordStrength !== "strong")
      return setError("Password must be strong");

    setIsSendingOtp(true);

    try {
      // 🚀 API CALL: Create Child (Student) Account
      const res = await fetch("/api/accounts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: currentChild.email,
          password: currentChild.password,
          first_name: currentChild.firstName,
          last_name: currentChild.lastName,
          phone: "+2348000000000", // Optional/Placeholder if not collecting child phone
          primary_org_id: 1,
          account_type: "student",
          parent_profile_id: parentProfileId, // LINKING TO PARENT
        }),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Failed to create child account");

      onNext(currentChild.email);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsSendingOtp(false);
    }
  };

  return (
    <form onSubmit={handleSendOtp} className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Add New Child</h2>
      {/* ... (Same Inputs as your original code) ... */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            First Name
          </label>
          <input
            name="firstName"
            type="text"
            required
            value={currentChild.firstName}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="Aisha"
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
            value={currentChild.lastName}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="Mohammed"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Email Address
        </label>
        <input
          name="email"
          type="email"
          required
          value={currentChild.email}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          placeholder="child@example.com"
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
          value={currentChild.password || ""}
          className="mt-1 block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md
             focus:outline-none focus:ring-[#f79771] focus:border-[#f79771]"
          placeholder="Create strong password"
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
          value={currentChild.confirmPassword || ""}
          className="mt-1 block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md
             focus:outline-none focus:ring-[#f79771] focus:border-[#f79771]"
          placeholder="Confirm password"
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


      {/* Password Strength UI (Same as before) */}
      <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2">
        {/* ... ui code ... */}
        <p
          className={`font-semibold mt-2 ${passwordStrength === "strong" ? "text-green-600" : "text-red-600"
            }`}
        >
          Strength: {passwordStrength.toUpperCase()}
        </p>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={isSendingOtp}
        className="w-full py-3 rounded-md bg-[#f79771] text-white font-medium hover:bg-[#f58667] disabled:opacity-70 flex items-center justify-center gap-2"
      >
        {isSendingOtp ? "Sending OTP..." : "Send Verification Code"}
      </button>
    </form>
  );
}

// --- Sub-Component: OTP Verification ---
// (Same as Parent version, logic re-used. Call API)
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
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setError("Enter a valid 6-digit code");
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
        throw new Error(data?.detail || "Verification failed");
      }

      onVerified();
    } catch (err: any) {
      setError(err?.message || "Invalid OTP or error verifying");
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

      setCooldown(30);
    } catch (err: any) {
      setError(err?.message || "Could not resend OTP");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="max-w-md mx-auto text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Verify Child&apos;s Email
      </h2>

      <p className="text-gray-600 mb-6">
        We sent a 6-digit code to{" "}
        <span className="text-[#f79771] break-all">{email}</span>
      </p>

      <form onSubmit={handleVerify} className="space-y-6">
        <input
          type="text"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          className="w-full px-6 py-5 text-center text-3xl font-mono border-2 border-gray-300 rounded-lg focus:border-[#f79771] focus:outline-none"
          autoFocus
          placeholder="000000"
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={isVerifying || otp.length !== 6}
          className="w-full py-3 rounded-md bg-[#f79771] text-white font-medium hover:bg-[#f58667] disabled:opacity-60"
        >
          {isVerifying ? "Verifying..." : "Verify & Add Child"}
        </button>
      </form>

      <div className="mt-6 space-y-3">
        <button onClick={onBack} className="text-sm underline">
          ← Back to edit details
        </button>

        <p className="text-xs text-gray-500">
          Didn&apos;t receive the code?{" "}
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
    </div>
  );
}


const STORAGE_KEY = "parentSignupFlow";


// --- Main Export ---
export default function ParentBiodataForm({
  parentProfileId,
  onCancel,
}: {
  parentProfileId: number | null;
  onCancel: () => void;
}) {

  const [resolvedParentId, setResolvedParentId] = useState<number | null>(parentProfileId);
  const [childFormKey, setChildFormKey] = useState(0);

  useEffect(() => {
    if (parentProfileId) {
      setResolvedParentId(parentProfileId);
      return;
    }

    // fallback if page reloaded and prop is now null
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const saved = JSON.parse(raw);
      const id = saved?.parentProfileId;
      setResolvedParentId(typeof id === "number" ? id : Number(id) || null);
    } catch {
      // ignore
    }
  }, [parentProfileId]);

  const [children, setChildren] = useState<ChildData[]>([]);
  const [step, setStep] = useState<"list" | "form" | "otp">("list");
  const [currentEmail, setCurrentEmail] = useState("");
  const [currentChild, setCurrentChild] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const raw = sessionStorage.getItem(JOURNEY_KEY);
    if (!raw) return;
    try {
      const saved = JSON.parse(raw);
      if (saved.biodataStep) setStep(saved.biodataStep);
      if (saved.childEmailForOtp) setCurrentEmail(saved.childEmailForOtp);

      // optionally restore currentChild draft so it doesn't wipe on refresh:
      if (saved.currentChild) setCurrentChild(saved.currentChild);
    } catch { }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const raw = sessionStorage.getItem(JOURNEY_KEY);
    const prev = raw ? JSON.parse(raw) : {};
    sessionStorage.setItem(
      JOURNEY_KEY,
      JSON.stringify({
        ...prev,
        pageStep: "biodata",
        biodataStep: step,
        childEmailForOtp: currentEmail,
        currentChild,
      })
    );
  }, [step, currentEmail, currentChild]);


  const handleOtpSent = (email: string) => {
    setCurrentEmail(email);
    setStep("otp");
  };


  const handleVerified = () => {
    const newChild: ChildData = {
      firstName: currentChild.firstName,
      lastName: currentChild.lastName,
      email: currentChild.email,
      password: currentChild.password,
      isEmailVerified: true,
    };
    setChildren((prev) => [...prev, newChild]);
    setStep("list");

    // clear child otp state after success (optional)
    const raw = sessionStorage.getItem(JOURNEY_KEY);
    const prev = raw ? JSON.parse(raw) : {};
    sessionStorage.setItem(
      JOURNEY_KEY,
      JSON.stringify({
        ...prev,
        biodataStep: "list",
        childEmailForOtp: "",
        currentChild: {
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
        },
      })
    );
  };

  const removeChild = (index: number) => {
    setChildren((prev) => prev.filter((_, i) => i !== index));
  };

  const emptyChild = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  };


  return (
    <div className="mt-8 space-y-8">

      <div>
        <h3 className="text-2xl font-bold text-gray-900">Your Children</h3>
        <p className="text-gray-600 mt-2">
          Add your children to give them access to personalized learning.
        </p>
      </div>
      {/* ... Info Box ... */}

      {/* Children List */}
      {children.length > 0 && (
        <div className="space-y-3">
          {children.map((child, i) => (
            <div
              key={i}
              className="flex justify-between items-center p-4 bg-green-50 border border-green-200 rounded-lg"
            >
              <div>
                <span className="font-medium">
                  {child.firstName} {child.lastName}
                </span>
                <span className="text-gray-600 ml-3">— {child.email}</span>
                <span className="text-green-600 text-sm ml-3">Verified</span>
              </div>
              <button
                onClick={() => removeChild(i)}
                className="text-red-600 text-sm font-medium"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Step Renderer */}
      {step === "list" && (
        <button
          onClick={() => {
            setCurrentChild(emptyChild);
            setCurrentEmail("");
            setStep("form");

            // also clear any saved child draft in storage (optional but recommended)
            const raw = sessionStorage.getItem("parentSignupJourney");
            const prev = raw ? JSON.parse(raw) : {};
            sessionStorage.setItem(
              "parentSignupJourney",
              JSON.stringify({
                ...prev,
                biodataStep: "form",
                childEmailForOtp: "",
                currentChild: emptyChild,
              })
            );
          }}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-700 font-medium hover:border-[#f79771] hover:text-[#f79771] transition"
        >
          + Add Another Child
        </button>
      )}


      {step === "form" && (
        <div className="">
          {/* PASS PARENT ID HERE */}
          <AddChildForm
            key={childFormKey}
            onNext={handleOtpSent}
            currentChild={currentChild}
            setCurrentChild={setCurrentChild}
            parentProfileId={resolvedParentId}
          />

          <button
            onClick={() => {
              setChildFormKey((k) => k + 1);
              setStep("form");
            }}

            className="mt-4 text-sm text-gray-600 underline"
          >
            ← Cancel
          </button>
        </div>
      )}

      {step === "otp" && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <OtpVerificationStep
            email={currentEmail}
            onVerified={handleVerified}
            onBack={() => setStep("form")}
          />
        </div>
      )}
    </div>
  );
}

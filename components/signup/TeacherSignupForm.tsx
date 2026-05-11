// texagon_academy\texagonui\components\signup\TeacherSignupForm.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Step 1: Teacher Registration Form
function TeacherSignupForm({
  onOtpRequested,
  formData,
  setFormData,
}: {
  /** Called when the OTP has been sent. resuming=true means a pre-existing unverified account was found. */
  onOtpRequested: (email: string, resuming?: boolean) => void;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}) {
  const [error, setError] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const getPasswordStrength = (pwd: string) => {
    const hasLower = /[a-z]/.test(pwd);
    const hasUpper = /[A-Z]/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    const length = pwd.length >= 8;
    const score = [hasLower, hasUpper, hasNumber, hasSpecial, length].filter(Boolean).length;

    if (score === 5) return "strong";
    if (score >= 3) return "medium";
    return "weak";
  };

  const passwordStrength = getPasswordStrength(formData.password || "");

  const canSendOtp =
    formData.firstName?.trim() &&
    formData.lastName?.trim() &&
    formData.email?.includes("@") &&
    formData.email?.includes(".") &&
    formData.password?.length >= 8 &&
    formData.password === formData.confirmPassword &&
    passwordStrength === "strong";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSendOtp) {
      setError("Please fix the errors above before continuing");
      return;
    }

    setError("");
    setIsSendingOtp(true);

    try {
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
          account_type: "teacher",
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // Prefer backend message if it exists
        throw new Error(data?.message || data?.detail || "Failed to create account");
      }

      // ✅ If account already existed but was not verified, backend returns existing_inactive=true
      // with HTTP 200 — skip straight to OTP step so the user can complete verification.
      onOtpRequested(formData.email, data.existing_inactive === true);
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  return (
    <form onSubmit={handleSendOtp} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">First Name</label>
          <input
            name="firstName"
            type="text"
            required
            value={formData.firstName}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#f79771] focus:ring-[#f79771] focus:outline-none"
            placeholder="John"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Last Name</label>
          <input
            name="lastName"
            type="text"
            required
            value={formData.lastName}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#f79771] focus:ring-[#f79771] focus:outline-none"
            placeholder="Doe"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Phone <span className="text-gray-500 font-normal">(optional)</span>
        </label>
        <input
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#f79771] focus:ring-[#f79771] focus:outline-none"
          placeholder="+2348012345678"
        />
        <p className="text-xs text-gray-500 mt-1">Use international format</p>
      </div>

      {/* Address (required by your create account payload) */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Address <span className="text-gray-500 font-normal">(optional)</span>
        </label>
        <input
          name="address"
          type="text"
          value={formData.address}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#f79771] focus:ring-[#f79771] focus:outline-none"
          placeholder="e.g. Ikeja, Lagos"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Email Address</label>
        <input
          name="email"
          type="email"
          required
          value={formData.email}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#f79771] focus:ring-[#f79771] focus:outline-none"
          placeholder="teacher@school.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Password</label>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          value={formData.password}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#f79771] focus:ring-[#f79771] focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
        <input
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          value={formData.confirmPassword}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#f79771] focus:ring-[#f79771] focus:outline-none"
        />
        {formData.password && formData.password !== formData.confirmPassword && (
          <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
        )}
      </div>

      {formData.password && (
        <div className="bg-gray-50 p-4 rounded-lg text-xs">
          <p className="font-medium text-gray-700">Password Strength:</p>
          <p
            className={`font-semibold ${passwordStrength === "strong"
              ? "text-green-600"
              : passwordStrength === "medium"
                ? "text-yellow-600"
                : "text-red-600"
              }`}
          >
            {passwordStrength.toUpperCase()}
          </p>
          <p className="text-gray-600 mt-1">
            Must include uppercase, lowercase, number, special character, and ≥8 characters
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!canSendOtp || isSendingOtp}
        className="w-full flex justify-center items-center gap-2 rounded-md bg-[#f79771] py-3 text-white font-medium hover:bg-[#f58667] disabled:opacity-60 disabled:cursor-not-allowed transition"
      >
        {isSendingOtp ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Creating Account...
          </>
        ) : (
          "Send Verification Code"
        )}
      </button>
    </form>
  );
}

// Step 2: OTP Verification
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

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const verifyOtp = async () => {
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setError("");
    setIsVerifying(true);

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: otp.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || data?.detail || "Invalid verification code");
      } else {
        // ✅ clear persisted flow state
        localStorage.removeItem("teacher_signup_step");
        localStorage.removeItem("teacher_signup_email");
        localStorage.removeItem("teacher_signup_name");

        onVerified(); // set step "done" or redirect
      }

    } catch (err: any) {
      setError(err?.message || "Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const resendOtp = async () => {
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
        // If backend returns retry_after on 429, use it to set cooldown
        if (res.status === 429 && typeof data?.retry_after === "number") {
          setCooldown(data.retry_after);
        }
        throw new Error(data?.detail || data?.message || "Failed to resend code");
      }

      // Start cooldown after successful resend
      setCooldown(30);
    } catch (err: any) {
      setError(err?.message || "Could not resend code. Try again.");
    } finally {
      setIsResending(false);
    }
  };


  return (
    <div className="max-w-md mx-auto text-center">
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900">Verify Your Email</h2>
        <p className="mt-2 text-gray-600">We sent a 6-digit code to</p>
        <p className="text-lg font-semibold text-[#f79771] break-all">{email}</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          verifyOtp();
        }}
        className="space-y-6"
      >
        <input
          type="text"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="000000"
          className="w-full px-6 py-5 text-center text-3xl font-mono tracking-widest border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#f79771] focus:ring-4 focus:ring-[#f79771]/20"
          autoFocus
        />
        <p className="text-xs text-gray-500">
          Code expires in 10 minutes. You can request a new one if needed.
        </p>


        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={isVerifying || otp.length !== 6}
          className="w-full py-3 rounded-md bg-[#f79771] text-white font-medium hover:bg-[#f58667] disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
        >
          {isVerifying ? "Verifying..." : "Verify & Continue"}
        </button>
      </form>

      <div className="mt-8 space-y-4">
        <button onClick={onBack} className="text-sm text-gray-600 hover:text-gray-900 underline">
          Back to edit details
        </button>

        <div className="text-sm text-gray-500">
          Didn't receive the code?{" "}
          <button
            onClick={resendOtp}
            type="button"
            disabled={isResending || cooldown > 0}
            className="font-medium text-[#f79771] hover:underline disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isResending
              ? "Sending..."
              : cooldown > 0
                ? `Resend in ${cooldown}s`
                : "Resend Code"}
          </button>
        </div>

      </div>
    </div>
  );
}

// Main Flow Component
export default function TeacherSignupFlow({ onComplete }: { onComplete?: () => void }) {
  const [step, setStep] = useState<"form" | "otp" | "done">(() => {
    if (typeof window === "undefined") return "form";
    return (localStorage.getItem("teacher_signup_step") as any) || "form";
  });
  const [isResuming, setIsResuming] = useState(false); // true when re-activating an existing unverified account
  const router = useRouter();



  const [registrationData, setRegistrationData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
  });
  const STORAGE_KEY_STEP = "teacher_signup_step";
  const STORAGE_KEY_EMAIL = "teacher_signup_email";
  const STORAGE_KEY_NAME = "teacher_signup_name";


  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("teacher_signup_step", step);
    }
  }, [step]);
  const handleOtpRequested = (email?: string, resuming = false) => {
    setStep("otp");
    setIsResuming(resuming);
    localStorage.setItem("teacher_signup_step", "otp");
    localStorage.setItem("teacher_signup_email", registrationData.email);
    if (!localStorage.getItem("teacher_signup_name")) {
      localStorage.setItem("teacher_signup_name", registrationData.firstName || "");
    }
  };
  const handleVerified = () => {
    localStorage.removeItem("teacher_signup_step");
    localStorage.removeItem("teacher_signup_email");
    localStorage.removeItem("teacher_signup_name");
    setStep("done");

  };

  useEffect(() => {
    if (step !== "done") return;

    const t = setTimeout(() => {
      localStorage.removeItem("teacher_signup_step");
      router.replace("/login"); // replace is often better for "flow complete" redirects
    }, 2000);

    return () => clearTimeout(t);
  }, [step, router]);


  const handleBack = () => {
    setStep("form");
    localStorage.removeItem("teacher_signup_step");
  };


  return (
    <div className="w-full py-12 px-4">
      <div className="w-full max-w-3xl mx-auto">
        {/* (Keep your fixed Progress Bar here) */}

        {step === "form" && (
          <div>
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
              Create Teacher Account
            </h1>
            <p className="text-center text-gray-600 mb-8">Join thousands of educators</p>

            <TeacherSignupForm
              onOtpRequested={(email, resuming) => handleOtpRequested(email, resuming)}
              formData={registrationData}
              setFormData={setRegistrationData}
            />
          </div>
        )}

        {step === "otp" && (
          <div>
            {isResuming && (
              <div className="mb-6 rounded-md bg-blue-50 border border-blue-200 p-4 text-sm text-blue-800">
                <strong>Welcome back!</strong> We found your existing account and sent a new verification
                code to your email. Please check your inbox and enter the code below.
              </div>
            )}
            <OtpVerificationStep
              email={
                registrationData.email ||
                (typeof window !== "undefined"
                  ? localStorage.getItem("teacher_signup_email") || ""
                  : "")
              }
              onVerified={handleVerified}
              onBack={handleBack}
            />
          </div>
        )}
        {step === "done" && (
          <div className="text-center py-10">
            <h2 className="text-2xl font-bold">Email verified ✅</h2>
            <p className="text-gray-600 mt-2">Redirecting you to login...</p>
          </div>
        )}



      </div>
    </div>
  );
}

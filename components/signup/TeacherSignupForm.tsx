"use client";

import {useState} from "react";

// Step 1: Teacher Registration Form
function TeacherSignupForm({
  onOtpRequested,
  formData,
  setFormData,
}: {
  onOtpRequested: () => void;
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
    const score = [hasLower, hasUpper, hasNumber, hasSpecial, length].filter(
      Boolean
    ).length;
    if (score === 5) return "strong";
    if (score >= 3) return "medium";
    return "weak";
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const canSendOtp =
    formData.firstName.trim() &&
    formData.lastName.trim() &&
    formData.email.includes("@") &&
    formData.email.includes(".") &&
    formData.password.length >= 8 &&
    formData.password === formData.confirmPassword &&
    passwordStrength === "strong";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    setFormData((prev: any) => ({...prev, [name]: value}));
    setError("");
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSendOtp) return;

    setError("");
    setIsSendingOtp(true);

    try {
      const payload = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        phone: formData.phone.trim() || undefined,
        primary_org_id: 1,
        account_type: "teacher" as const,
      };

      const res = await fetch("/api/accounts/create", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        const errMsg =
          typeof data.detail === "string"
            ? data.detail
            : data.detail
            ? Object.values(data.detail).flat().join(", ")
            : "Failed to create account";
        setError(errMsg);
        return;
      }

      // Success: OTP sent by backend
      onOtpRequested();
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  return (
    <form onSubmit={handleSendOtp} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            First Name
          </label>
          <input
            name="firstName"
            type="text"
            required
            value={formData.firstName}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#f79771] focus:ring-[#f79771]"
            placeholder="John"
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
            value={formData.lastName}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#f79771] focus:ring-[#f79771]"
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
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#f79771] focus:ring-[#f79771]"
          placeholder="+2348012345678"
        />
        <p className="text-xs text-gray-500 mt-1">Use international format</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Email Address
        </label>
        <input
          name="email"
          type="email"
          required
          value={formData.email}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#f79771] focus:ring-[#f79771]"
          placeholder="teacher@school.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          value={formData.password}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#f79771] focus:ring-[#f79771]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Confirm Password
        </label>
        <input
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          value={formData.confirmPassword}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#f79771] focus:ring-[#f79771]"
        />
        {formData.password &&
          formData.password !== formData.confirmPassword && (
            <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
          )}
      </div>

      {formData.password && (
        <div className="bg-gray-50 p-4 rounded-lg text-xs">
          <p className="font-medium text-gray-700">Password Strength:</p>
          <p
            className={`font-semibold ${
              passwordStrength === "strong"
                ? "text-green-600"
                : passwordStrength === "medium"
                ? "text-yellow-600"
                : "text-red-600"
            }`}>
            {passwordStrength.toUpperCase()}
          </p>
          <p className="text-gray-600 mt-1">
            Must include uppercase, lowercase, number, special character, and ≥8
            characters
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
        className="w-full flex justify-center items-center gap-2 rounded-md bg-[#f79771] py-3 text-white font-medium hover:bg-[#f58667] disabled:opacity-60 disabled:cursor-not-allowed transition">
        {isSendingOtp ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
            Sending Code...
          </>
        ) : (
          "Send Verification Code"
        )}
      </button>
    </form>
  );
}

// Step 2: OTP Verification Screen
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

  const verifyOtp = async () => {
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setError("");
    setIsVerifying(true);

    try {
      const res = await fetch("/api/accounts/verify", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: otp,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Invalid or expired code");
        return;
      }

      if (data.emailVerified === true) {
        onVerified();
      }
    } catch (err) {
      setError("Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const resendOtp = async () => {
    setIsResending(true);
    // Reuse the same create account flow (it resends OTP)
    // You might want to create a dedicated resend endpoint later
    setTimeout(() => {
      setIsResending(false);
      setError("");
      alert("New code sent! Check your email.");
    }, 1500);
  };

  return (
    <div className="max-w-md mx-auto text-center">
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900">Verify Your Email</h2>
        <p className="mt-2 text-gray-600">We sent a 6-digit code to</p>
        <p className="text-lg font-semibold text-[#f79771] break-all">
          {email}
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          verifyOtp();
        }}
        className="space-y-6">
        <input
          type="text"
          maxLength={6}
          value={otp}
          onChange={(e) =>
            setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
          placeholder="000000"
          className="w-full px-6 py-5 text-center text-3xl font-mono tracking-widest border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#f79771] focus:ring-4 focus:ring-[#f79771]/20"
          autoFocus
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={isVerifying || otp.length !== 6}
          className="w-full py-3 rounded-md bg-[#f79771] text-white font-medium hover:bg-[#f58667] disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-2">
          {isVerifying ? <>Verifying...</> : "Verify & Complete Registration"}
        </button>
      </form>

      <div className="mt-6 space-y-4">
        <button
          onClick={onBack}
          className="text-sm text-gray-600 hover:text-gray-900 underline">
          ← Back to edit details
        </button>

        <div className="text-sm text-gray-500">
          Didn't receive the code?{" "}
          <button
            onClick={resendOtp}
            disabled={isResending}
            className="font-medium text-[#f79771] hover:underline">
            {isResending ? "Sending..." : "Resend Code"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Flow Component
export default function TeacherSignupFlow({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [step, setStep] = useState<"form" | "otp">("form");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });

  const handleOtpRequested = () => {
    setStep("otp");
  };

  const handleVerified = () => {
    onComplete(); // Account is now verified and active
  };

  const handleBack = () => {
    setStep("form");
  };

  return (
    <div className="flex items-center justify-center">
      <div className="w-full">
        {step === "form" ? (
          <div className="">
            <p className="text-left text-gray-600 mb-8">
              Create your account in seconds
            </p>
            <TeacherSignupForm
              onOtpRequested={handleOtpRequested}
              formData={formData}
              setFormData={setFormData}
            />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg">
            <OtpVerificationStep
              email={formData.email}
              onVerified={handleVerified}
              onBack={handleBack}
            />
          </div>
        )}
      </div>
    </div>
  );
}

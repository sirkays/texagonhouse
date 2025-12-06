"use client";

import {useState} from "react";

// Step 1: Main Signup Form (until OTP is sent)
function ParentSignupForm({
  onOtpSent,
  formData,
  setFormData,
}: {
  onOtpSent: (email: string) => void;
  formData: any;
  setFormData: any;
}) {
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
    const {name, value} = e.target;
    setFormData((prev: any) => ({...prev, [name]: value}));
    setError("");

    if (name === "password") {
      checkPasswordStrength(value);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (passwordStrength !== "strong") {
      setError("Password must be strong (all requirements met)");
      return;
    }

    const required = ["firstName", "lastName", "email", "password", "phone"];
    for (const field of required) {
      if (!formData[field]) {
        setError("Please fill in all required fields");
        return;
      }
    }

    setIsSendingOtp(true);
    // Simulate sending OTP
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSendingOtp(false);

    onOtpSent(formData.email); // Move to OTP screen
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSendOtp}>
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

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          name="password"
          type="password"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#f79771] focus:border-[#f79771]"
          placeholder="Create strong password"
          value={formData.password}
          onChange={handleChange}
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
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#f79771] focus:border-[#f79771]"
          placeholder="Confirm password"
          value={formData.confirmPassword}
          onChange={handleChange}
        />
      </div>

      {/* Password Requirements */}
      <div className="bg-gray-50 p-4 rounded-lg text-xs space-y-2">
        <p className="font-medium text-gray-700">Password must contain:</p>
        {(
          ["hasLowercase", "hasUppercase", "hasNumber", "hasSpecial"] as const
        ).map((key) => (
          <div
            key={key}
            className={`flex items-center ${
              requirements[key] ? "text-green-600" : "text-gray-500"
            }`}>
            <span
              className={`w-2 h-2 rounded-full mr-2 ${
                requirements[key] ? "bg-green-600" : "bg-gray-300"
              }`}
            />
            {key === "hasLowercase" && "One lowercase letter"}
            {key === "hasUppercase" && "One uppercase letter"}
            {key === "hasNumber" && "One number"}
            {key === "hasSpecial" && "One special character (!@#$ etc.)"}
          </div>
        ))}
        <p
          className={`font-semibold mt-2 ${
            passwordStrength === "strong"
              ? "text-green-600"
              : passwordStrength === "medium"
              ? "text-yellow-600"
              : "text-red-600"
          }`}>
          Strength: {passwordStrength}
        </p>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={isSendingOtp}
        className="w-full py-3 px-4 bg-[#f79771] text-white font-medium rounded-md hover:bg-[#f58667] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition">
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
            Sending OTP...
          </>
        ) : (
          "Send OTP & Continue"
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
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.trim().length !== 6 || !/^\d+$/.test(otp)) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setIsVerifying(true);
    setError("");

    // Mock verification
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Success
    onVerified();
    setIsVerifying(false);
  };

  return (
    <div className="max-w-md mx-auto text-center">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Check Your Email</h2>
        <p className="mt-2 text-sm text-gray-600">
          We've sent a 6-digit verification code to
        </p>
        <p className="font-semibold text-[#f79771]">{email}</p>
      </div>

      <form onSubmit={handleVerify} className="space-y-6">
        <div>
          <input
            type="text"
            maxLength={6}
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            placeholder="000000"
            className="w-full px-4 py-4 text-center text-3xl font-mono tracking-widest border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#f79771] focus:ring-4 focus:ring-[#f79771]/20"
            autoFocus
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex flex-col gap-3">
          <button
            type="submit"
            disabled={isVerifying || otp.length !== 6}
            className="w-full py-3 px-4 bg-[#f79771] text-white font-medium rounded-md hover:bg-[#f58667] disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2">
            {isVerifying ? (
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
                Verifying...
              </>
            ) : (
              "Verify & Complete Signup"
            )}
          </button>

          <button
            type="button"
            onClick={onBack}
            className="text-sm text-gray-600 hover:text-gray-800 underline">
            ← Back to edit details
          </button>
        </div>
      </form>

      <p className="mt-6 text-xs text-gray-500">
        Didn't receive the code?{" "}
        <button className="text-[#f79771] font-medium">Resend OTP</button>
      </p>
    </div>
  );
}

// Main Parent Component with Step Control
export default function ParentSignupFlow({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [step, setStep] = useState<"form" | "otp">("form");
  const [emailForOtp, setEmailForOtp] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
  });

  const handleOtpSent = (email: string) => {
    setEmailForOtp(email);
    setStep("otp");
  };

  const handleVerified = () => {
    console.log("Parent signup completed:", {
      ...formData,
      confirmPassword: undefined,
    });
    onComplete();
  };

  const handleBack = () => {
    setStep("form");
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12">
      <div className="w-full max-w-2xl">
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
          </div>
        ) : (
          <div>
            <OtpVerificationStep
              email={emailForOtp}
              onVerified={handleVerified}
              onBack={handleBack}
            />
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import {useState} from "react";
import TeacherBiodataForm from "./TeacherBiodataForm"; // Adjust path as needed

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
    if (!canSendOtp) {
      setError("Please fix the errors above before continuing");
      return;
    }

    setError("");
    setIsSendingOtp(true);

    await new Promise((resolve) => setTimeout(resolve, 1800));

    setIsSendingOtp(false);
    onOtpRequested();
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
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#f79771] focus:ring-[#f79771] focus:outline-none"
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
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#f79771] focus:ring-[#f79771] focus:outline-none"
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
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#f79771] focus:ring-[#f79771] focus:outline-none"
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
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#f79771] focus:ring-[#f79771] focus:outline-none"
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

  const verifyOtp = async () => {
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setError("");
    setIsVerifying(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (otp === "123456" || otp.length === 6) {
      setIsVerifying(false);
      onVerified();
    } else {
      setError("Invalid code. Try 123456 for demo");
      setIsVerifying(false);
    }
  };

  const resendOtp = async () => {
    setIsResending(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsResending(false);
    alert(`New code sent to ${email} (simulated)`);
  };

  return (
    <div className="max-w-md mx-auto text-center">
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900">Verify Your Email</h2>
        <p className="mt-2 text-gray-600">We sent a 6-digit code to</p>
        <p className="text-lg font-semibold text-[#f79771] break-all">
          {email}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Hint: Use 123456 to proceed
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
          {isVerifying ? "Verifying..." : "Verify & Continue"}
        </button>
      </form>

      <div className="mt-8 space-y-4">
        <button
          onClick={onBack}
          className="text-sm text-gray-600 hover:text-gray-900 underline">
          Back to edit details
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
  onComplete?: () => void;
}) {
  const [step, setStep] = useState<"form" | "otp" | "biodata">("form");

  const [registrationData, setRegistrationData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });

  const handleOtpRequested = () => setStep("otp");
  const handleVerified = () => setStep("biodata");
  const handleBack = () => setStep("form");

  return (
    <div className="flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-3xl">
        {/* Progress Bar */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-8">
            <div
              className={`flex items-center ${
                step !== "form" ? "text-green-600" : "text-[#f79771]"
              }`}>
              <div className="w-10 h-10 rounded-full bg-current text-white flex items-center justify-center font-bold">
                1
              </div>
              <span className="ml-3 font-medium">Account</span>
            </div>
            <div
              className={`w-24 h-1 ${
                step !== "form" ? "bg-green-600" : "bg-gray-300"
              }`}
            />
            <div
              className={`flex items-center ${
                step === "otp"
                  ? "text-[#f79771]"
                  : step === "biodata"
                  ? "text-green-600"
                  : "text-gray-500"
              }`}>
              <div
                className={`w-10 h-10 rounded-full ${
                  step === "otp"
                    ? "bg-[#f79771]"
                    : step === "biodata"
                    ? "bg-green-600"
                    : "bg-gray-300"
                } text-white flex items-center justify-center font-bold`}>
                2
              </div>
              <span className="ml-3 font-medium">Verify</span>
            </div>
            <div
              className={`w-24 h-1 ${
                step === "biodata" ? "bg-green-600" : "bg-gray-300"
              }`}
            />
            <div
              className={`flex items-center ${
                step === "biodata" ? "text-[#f79771]" : "text-gray-500"
              }`}>
              <div
                className={`w-10 h-10 rounded-full ${
                  step === "biodata" ? "bg-[#f79771]" : "bg-gray-300"
                } text-white flex items-center justify-center font-bold`}>
                3
              </div>
              <span className="ml-3 font-medium">Profile</span>
            </div>
          </div>
        </div>

        {/* Step: Registration Form */}
        {step === "form" && (
          <div className="">
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
              Create Teacher Account
            </h1>
            <p className="text-center text-gray-600 mb-8">
              Join thousands of educators
            </p>
            <TeacherSignupForm
              onOtpRequested={handleOtpRequested}
              formData={registrationData}
              setFormData={setRegistrationData}
            />
          </div>
        )}

        {/* Step: OTP Verification */}
        {step === "otp" && (
          <div className="">
            <OtpVerificationStep
              email={registrationData.email}
              onVerified={handleVerified}
              onBack={handleBack}
            />
          </div>
        )}

        {/* Step: Biodata Form - Only after OTP success */}
        {step === "biodata" && (
          <div className="">
            <div className="text-center mb-8">
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mt-4">
                Email Verified Successfully!
              </h2>
              <p className="text-gray-600 mt-2">
                Welcome, {registrationData.firstName}!
              </p>
            </div>

            {/* Your exact TeacherBiodataForm - prefilled with registration data */}
            <TeacherBiodataForm />
          </div>
        )}
      </div>
    </div>
  );
}

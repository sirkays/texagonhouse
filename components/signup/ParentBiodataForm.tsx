"use client";

import {useState} from "react";

interface ChildData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isEmailVerified: boolean;
}

interface ParentBiodataData {
  children: ChildData[];
}

// Step 1: Add Child Form (Details + Send OTP)
function AddChildForm({
  onNext,
  currentChild,
  setCurrentChild,
}: {
  onNext: (email: string) => void;
  currentChild: any;
  setCurrentChild: any;
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
    setCurrentChild((prev: any) => ({...prev, [name]: value}));
    setError("");
    if (name === "password") checkPasswordStrength(value);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!currentChild.email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }
    if (currentChild.password !== currentChild.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (passwordStrength !== "strong") {
      setError("Password must be strong");
      return;
    }
    if (!currentChild.firstName || !currentChild.lastName) {
      setError("Please fill all required fields");
      return;
    }

    setIsSendingOtp(true);
    // Simulate real OTP send
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSendingOtp(false);

    onNext(currentChild.email);
  };

  return (
    <form onSubmit={handleSendOtp} className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Add New Child</h2>
      <p className="text-gray-600">Fill in your child's details below</p>

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
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#f79771] focus:ring-[#f79771]"
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
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#f79771] focus:ring-[#f79771]"
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
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#f79771] focus:ring-[#f79771]"
          placeholder="child@example.com"
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
          value={currentChild.password}
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
          value={currentChild.confirmPassword || ""}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#f79771] focus:ring-[#f79771]"
        />
      </div>

      {/* Password Strength */}
      <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2">
        <p className="font-medium">Password must contain:</p>
        {Object.entries(requirements).map(([key, met]) => (
          <div
            key={key}
            className={`flex items-center ${
              met ? "text-green-600" : "text-gray-500"
            }`}>
            <span
              className={`w-2 h-2 rounded-full mr-2 ${
                met ? "bg-green-600" : "bg-gray-300"
              }`}
            />
            {key === "hasLowercase" && "One lowercase letter"}
            {key === "hasUppercase" && "One uppercase letter"}
            {key === "hasNumber" && "One number"}
            {key === "hasSpecial" && "One special character"}
          </div>
        ))}
        <p
          className={`font-semibold mt-2 ${
            passwordStrength === "strong" ? "text-green-600" : "text-red-600"
          }`}>
          Strength: {passwordStrength.toUpperCase()}
        </p>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={isSendingOtp}
        className="w-full py-3 rounded-md bg-[#f79771] text-white font-medium hover:bg-[#f58667] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition">
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

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setError("Enter a valid 6-digit code");
      return;
    }

    setIsVerifying(true);
    await new Promise((resolve) => setTimeout(resolve, 1200)); // Simulate API
    setIsVerifying(false);

    // Mock success
    onVerified();
  };

  return (
    <div className="max-w-md mx-auto text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Verify Child's Email
      </h2>
      <p className="text-gray-600 mb-6">We sent a 6-digit code to</p>
      <p className="text-lg font-semibold text-[#f79771] break-all mb-8">
        {email}
      </p>

      <form onSubmit={handleVerify} className="space-y-6">
        <input
          type="text"
          maxLength={6}
          value={otp}
          onChange={(e) =>
            setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
          placeholder="000000"
          className="w-full px-6 py-5 text-center text-3xl font-mono tracking-widest border-2 border-gray-300 rounded-lg focus:border-[#f79771] focus:ring-4 focus:ring-[#f79771]/20"
          autoFocus
        />

        {error && <p className="text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isVerifying || otp.length !== 6}
          className="w-full py-3 rounded-md bg-[#f79771] text-white font-medium hover:bg-[#f58667] disabled:opacity-60 transition">
          {isVerifying ? "Verifying..." : "Verify & Add Child"}
        </button>
      </form>

      <button
        onClick={onBack}
        className="mt-6 text-sm text-gray-600 hover:text-gray-900 underline">
        ← Back to edit details
      </button>
    </div>
  );
}

// Main Component
export default function ParentBiodataForm() {
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
    setCurrentChild({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  const removeChild = (index: number) => {
    setChildren((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="mt-8 space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-gray-900">Your Children</h3>
        <p className="text-gray-600 mt-2">
          Add your children to give them access to personalized learning.
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Each child gets their own secure account with
          progress tracking, assignments, and communication with teachers.
        </p>
      </div>

      {/* Children List */}
      {children.length > 0 && (
        <div className="space-y-3">
          {children.map((child, i) => (
            <div
              key={i}
              className="flex justify-between items-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <div>
                <span className="font-medium">
                  {child.firstName} {child.lastName}
                </span>
                <span className="text-gray-600 ml-3">— {child.email}</span>
                <span className="text-green-600 text-sm ml-3">Verified</span>
              </div>
              <button
                onClick={() => removeChild(i)}
                className="text-red-600 hover:text-red-800 text-sm font-medium">
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Step Renderer */}
      {step === "list" && (
        <button
          onClick={() => setStep("form")}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-700 font-medium hover:border-[#f79771] hover:text-[#f79771] transition">
          + Add Another Child
        </button>
      )}

      {step === "form" && (
        <div className="">
          <AddChildForm
            onNext={handleOtpSent}
            currentChild={currentChild}
            setCurrentChild={setCurrentChild}
          />
          <button
            onClick={() => setStep("list")}
            className="mt-4 text-sm text-gray-600 hover:text-gray-900 underline">
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

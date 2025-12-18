"use client";

import { useState } from "react";

interface ChildData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isEmailVerified: boolean;
}

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
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
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
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>

      {/* Password Strength UI (Same as before) */}
      <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2">
        {/* ... ui code ... */}
        <p
          className={`font-semibold mt-2 ${
            passwordStrength === "strong" ? "text-green-600" : "text-red-600"
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

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6 || !/^\d+$/.test(otp))
      return setError("Enter a valid 6-digit code");

    setIsVerifying(true);
    try {
      // 🚀 API CALL: Verify Child Email
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, code: otp }),
      });
      if (!res.ok) throw new Error("Verification failed");

      onVerified();
    } catch (err) {
      setError("Invalid OTP or error verifying");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-md mx-auto text-center">
      {/* ... Same JSX ... */}
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Verify Child's Email
      </h2>
      <p className="text-gray-600 mb-6">
        We sent a 6-digit code to{" "}
        <span className="text-[#f79771]">{email}</span>
      </p>
      <form onSubmit={handleVerify} className="space-y-6">
        <input
          type="text"
          maxLength={6}
          value={otp}
          onChange={(e) =>
            setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
          className="w-full px-6 py-5 text-center text-3xl font-mono border-2 border-gray-300 rounded-lg focus:border-[#f79771]"
          autoFocus
          placeholder="000000"
        />
        {error && <p className="text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={isVerifying || otp.length !== 6}
          className="w-full py-3 rounded-md bg-[#f79771] text-white font-medium hover:bg-[#f58667] disabled:opacity-60"
        >
          {isVerifying ? "Verifying..." : "Verify & Add Child"}
        </button>
      </form>
      <button onClick={onBack} className="mt-6 text-sm underline">
        ← Back to edit details
      </button>
    </div>
  );
}

// --- Main Export ---
export default function ParentBiodataForm({
  parentProfileId, // Accepts ID from ParentSignupPage
}: {
  parentProfileId: number | null;
}) {
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
          onClick={() => setStep("form")}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-700 font-medium hover:border-[#f79771] hover:text-[#f79771] transition"
        >
          + Add Another Child
        </button>
      )}

      {step === "form" && (
        <div className="">
          {/* PASS PARENT ID HERE */}
          <AddChildForm
            onNext={handleOtpSent}
            currentChild={currentChild}
            setCurrentChild={setCurrentChild}
            parentProfileId={parentProfileId}
          />
          <button
            onClick={() => setStep("list")}
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

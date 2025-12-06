"use client";

import {useState} from "react";

interface ParentSignupFormProps {
  onComplete: () => void;
}

interface ParentSignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  address: string;
}

export default function ParentSignupForm({onComplete}: ParentSignupFormProps) {
  const [formData, setFormData] = useState<ParentSignupData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
  });

  const [error, setError] = useState<string>("");
  const [passwordStrength, setPasswordStrength] = useState<
    "weak" | "medium" | "strong"
  >("weak");

  const requirementsState = {
    hasLowercase: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecial: false,
  };
  const [requirements, setRequirements] = useState(requirementsState);

  const [emailVerified, setEmailVerified] = useState(false);
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [otpInput, setOtpInput] = useState("");

  // New states for Send OTP button
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSentMessage, setOtpSentMessage] = useState(false);

  // Password strength checker
  const checkPasswordStrength = (password: string) => {
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    setRequirements({hasLowercase, hasUppercase, hasNumber, hasSpecial});

    const metCount = [hasLowercase, hasUppercase, hasNumber, hasSpecial].filter(
      Boolean
    ).length;
    if (metCount >= 4) setPasswordStrength("strong");
    else if (metCount >= 3) setPasswordStrength("medium");
    else setPasswordStrength("weak");
  };

  // Handle Send OTP with loading → success → open modal
  const requestOtp = async () => {
    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setError("");
    setIsSendingOtp(true);
    setOtpSentMessage(false);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSendingOtp(false);
    setOtpSentMessage(true);

    // Auto show OTP modal after "sent" message
    setTimeout(() => {
      setShowOtpDialog(true);
      setOtpInput("");
    }, 800);
  };

  // Verify OTP (mock)
  const handleVerifyOtp = () => {
    if (otpInput.trim().length === 6) {
      setEmailVerified(true);
      setShowOtpDialog(false);
      setOtpInput("");
      setOtpSentMessage(false); // Clear message after verification
    } else {
      setError("Please enter a valid 6-digit OTP");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!emailVerified) {
      setError("Please verify your email with OTP");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password
    ) {
      setError("Please fill in all fields");
      return;
    }

    if (passwordStrength !== "strong") {
      setError("Password must meet all strength requirements");
      return;
    }

    console.log("Parent signup submitted:", {
      ...formData,
      confirmPassword: undefined,
    });
    onComplete();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    setFormData((prev) => ({...prev, [name]: value}));
    setError("");

    if (name === "password") {
      checkPasswordStrength(value);
    }
  };

  return (
    <>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {/* First Name */}
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-gray-700">
            First Name
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#f79771] focus:border-[#f79771] sm:text-sm"
            placeholder="Enter your first name"
            value={formData.firstName}
            onChange={handleChange}
          />
        </div>

        {/* Last Name */}
        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-gray-700">
            Last Name
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#f79771] focus:border-[#f79771] sm:text-sm"
            placeholder="Enter your last name"
            value={formData.lastName}
            onChange={handleChange}
          />
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#f79771] focus:border-[#f79771] sm:text-sm"
            placeholder="e.g. +2348000000000"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700">
            Address
          </label>
          <input
            id="address"
            name="address"
            type="text"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#f79771] focus:border-[#f79771] sm:text-sm"
            placeholder="Enter your address"
            value={formData.address}
            onChange={handleChange}
          />
        </div>

        {/* Email + OTP Section */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            disabled={emailVerified}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#f79771] focus:border-[#f79771] sm:text-sm disabled:bg-gray-100"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
          />

          <div className="mt-3">
            {!emailVerified ? (
              <>
                {otpSentMessage ? (
                  <p className="text-green-600 text-sm font-medium flex items-center animate-fade-in">
                    <span className="mr-2">Sent</span> OTP sent! Check your
                    email
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={requestOtp}
                    disabled={isSendingOtp || !formData.email}
                    className="text-xs bg-[#f79771] text-white py-2 px-5 rounded hover:bg-[#f58667] disabled:opacity-70 disabled:cursor-not-allowed transition flex items-center gap-2">
                    {isSendingOtp ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4"
                          viewBox="0 0 24 24">
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
                        Sending...
                      </>
                    ) : (
                      "Send OTP"
                    )}
                  </button>
                )}
              </>
            ) : (
              <p className="text-green-600 text-sm font-medium flex items-center">
                <span className="mr-2">Checkmark</span> Email verified
              </p>
            )}
          </div>
        </div>

        {/* Password Fields - Show only after email verified */}
        {emailVerified && (
          <>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#f79771] focus:border-[#f79771] sm:text-sm"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
              />
              <div className="mt-3 space-y-1 text-xs">
                {(
                  [
                    "hasLowercase",
                    "hasUppercase",
                    "hasNumber",
                    "hasSpecial",
                  ] as const
                ).map((key) => {
                  const met = requirements[key];
                  const labels: Record<string, string> = {
                    hasLowercase: "One lowercase letter",
                    hasUppercase: "One uppercase letter",
                    hasNumber: "One number",
                    hasSpecial: "One special character (!@#$ etc.)",
                  };
                  return (
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
                      {labels[key]}
                    </div>
                  );
                })}
                <div
                  className={`font-semibold mt-2 ${
                    passwordStrength === "strong"
                      ? "text-green-600"
                      : passwordStrength === "medium"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}>
                  Password strength: {passwordStrength}
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#f79771] focus:border-[#f79771] sm:text-sm"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </>
        )}

        {/* Global Error */}
        {error && <p className="text-red-600 text-sm -mt-4">{error}</p>}

        {/* Submit */}
        <button
          type="submit"
          disabled={!emailVerified || passwordStrength !== "strong"}
          className="w-full py-3 px-4 bg-[#f79771] text-white font-medium rounded-md hover:bg-[#f58667] disabled:opacity-50 disabled:cursor-not-allowed transition">
          Sign up as Parent
        </button>
      </form>

      {/* OTP Modal */}
      {showOtpDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Verify Your Email
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Enter the 6-digit code sent to <strong>{formData.email}</strong>
            </p>
            <input
              type="text"
              maxLength={6}
              placeholder="000000"
              value={otpInput}
              onChange={(e) =>
                setOtpInput(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f79771] focus:border-[#f79771]"
              autoFocus
            />
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowOtpDialog(false);
                  setOtpInput("");
                  setError("");
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleVerifyOtp}
                className="px-6 py-2 text-sm font-medium text-white bg-[#f79771] rounded hover:bg-[#f58667]">
                Verify
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

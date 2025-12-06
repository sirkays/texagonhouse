// components/ParentBiodataForm.tsx
"use client";

import {useState} from "react";

interface ChildData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isEmailVerified: boolean;
  confirmPassword?: string;
}

interface ParentBiodataData {
  children: ChildData[];
}

export default function ParentBiodataForm() {
  const [formData, setFormData] = useState<ParentBiodataData>({
    children: [],
  });
  const [addingChild, setAddingChild] = useState(false);
  const [currentChild, setCurrentChild] = useState<ChildData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    isEmailVerified: false,
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

  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSentMessage, setOtpSentMessage] = useState(false);
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [otpInput, setOtpInput] = useState("");

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

  const handleChildChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    setCurrentChild((prev) => ({...prev, [name]: value}));
    setError("");

    if (name === "password") {
      checkPasswordStrength(value);
    }
  };

  // Handle Send OTP with loading → success → open modal
  const requestOtp = async () => {
    if (!currentChild.email.includes("@")) {
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
      setCurrentChild((prev) => ({...prev, isEmailVerified: true}));
      setShowOtpDialog(false);
      setOtpInput("");
      setOtpSentMessage(false);
      setError("");
    } else {
      setError("Please enter a valid 6-digit OTP");
    }
  };

  const addChild = () => {
    setError("");

    if (!currentChild.isEmailVerified) {
      setError("Please verify the email with OTP");
      return;
    }

    if (currentChild.password !== currentChild.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (
      !currentChild.firstName ||
      !currentChild.lastName ||
      !currentChild.email ||
      !currentChild.password
    ) {
      setError("Please fill in all fields");
      return;
    }

    if (passwordStrength !== "strong") {
      setError("Password must meet all strength requirements");
      return;
    }

    // Simulate adding child (no API call)
    setFormData({
      ...formData,
      children: [
        ...formData.children,
        {
          firstName: currentChild.firstName,
          lastName: currentChild.lastName,
          email: currentChild.email,
          password: currentChild.password,
          isEmailVerified: true,
        },
      ],
    });

    setCurrentChild({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      isEmailVerified: false,
    });
    setPasswordStrength("weak");
    setRequirements(requirementsState);
    setAddingChild(false);
    setError("");
  };

  const removeChild = (index: number) => {
    const updatedChildren = formData.children.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      children: updatedChildren,
    });
  };

  return (
    <div className="mt-8 space-y-6">
      <h3 className="text-lg font-medium text-gray-900">
        Register Your Children
      </h3>
      <div className="mb-4 p-4 bg-blue-50 rounded-md">
        <p className="text-sm text-gray-700 mb-2">
          To add a child, click "Add Child", fill in their details, and click
          "Add This Child". You will then verify their email via OTP in a popup
          dialog. You can add or remove children anytime.
        </p>
        <p className="text-sm text-gray-700">
          <strong>Benefits:</strong> Registering your children provides access
          to personalized learning plans, progress tracking, teacher
          communication, and a secure educational platform tailored to their
          needs.
        </p>
      </div>
      <form className="space-y-4">
        <div className="border-t pt-4">
          <h4 className="text-md font-medium text-gray-900 mb-4">
            Children Registration
          </h4>
          {formData.children.length > 0 && (
            <div className="space-y-4 mb-4">
              {formData.children.map((child, index) => (
                <div key={index} className="border p-4 rounded-md bg-gray-50">
                  <div className="flex justify-between items-center">
                    <span>
                      {child.firstName} {child.lastName} - {child.email}{" "}
                      (Verified)
                    </span>
                    <button
                      type="button"
                      onClick={() => removeChild(index)}
                      className="text-red-600 hover:text-red-800">
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => setAddingChild(!addingChild)}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
            {addingChild ? "Cancel" : "Add Child"}
          </button>
        </div>

        {addingChild && (
          <div className="space-y-6">
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
                placeholder="Enter child's first name"
                value={currentChild.firstName}
                onChange={handleChildChange}
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
                placeholder="Enter child's last name"
                value={currentChild.lastName}
                onChange={handleChildChange}
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
                disabled={currentChild.isEmailVerified}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#f79771] focus:border-[#f79771] sm:text-sm disabled:bg-gray-100"
                placeholder="Enter child's email"
                value={currentChild.email}
                onChange={handleChildChange}
              />

              <div className="mt-3">
                {!currentChild.isEmailVerified ? (
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
                        disabled={isSendingOtp || !currentChild.email}
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
            {currentChild.isEmailVerified && (
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
                    value={currentChild.password}
                    onChange={handleChildChange}
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
                    value={currentChild.confirmPassword || ""}
                    onChange={handleChildChange}
                  />
                </div>
              </>
            )}

            {/* Global Error */}
            {error && <p className="text-red-600 text-sm -mt-4">{error}</p>}

            {/* Add Button */}
            <button
              type="button"
              onClick={addChild}
              disabled={
                !currentChild.isEmailVerified ||
                passwordStrength !== "strong" ||
                currentChild.password !== currentChild.confirmPassword
              }
              className="w-full py-3 px-4 bg-[#f79771] text-white font-medium rounded-md hover:bg-[#f58667] disabled:opacity-50 disabled:cursor-not-allowed transition">
              Add This Child
            </button>
          </div>
        )}
      </form>

      {/* OTP Modal */}
      {showOtpDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Verify Your Email
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Enter the 6-digit code sent to{" "}
              <strong>{currentChild.email}</strong>
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
    </div>
  );
}

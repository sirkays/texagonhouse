// components/ParentSignupForm.tsx
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
}

export default function ParentSignupForm({onComplete}: ParentSignupFormProps) {
  const [formData, setFormData] = useState<ParentSignupData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string>("");
  const [passwordStrength, setPasswordStrength] = useState<
    "weak" | "medium" | "strong"
  >("weak");
  const [requirements, setRequirements] = useState({
    hasLowercase: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecial: false,
  });
  const [emailVerified, setEmailVerified] = useState(false);
  const [tempOtp, setTempOtp] = useState<string>("");
  const [otpInput, setOtpInput] = useState<string>("");

  const checkPasswordStrength = (password: string) => {
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    setRequirements({hasLowercase, hasUppercase, hasNumber, hasSpecial});

    const count =
      (hasLowercase ? 1 : 0) +
      (hasUppercase ? 1 : 0) +
      (hasNumber ? 1 : 0) +
      (hasSpecial ? 1 : 0);
    if (count >= 3) {
      setPasswordStrength("strong");
    } else if (count >= 2) {
      setPasswordStrength("medium");
    } else {
      setPasswordStrength("weak");
    }
  };

  const sendOtp = (email: string) => {
    if (!email) return;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setTempOtp(otp);
    setOtpInput("");
    // Simulate sending OTP
    alert(`OTP sent to ${email}: ${otp}`); // In real app, send via API
  };

  const verifyOtp = () => {
    if (otpInput === tempOtp) {
      setEmailVerified(true);
      alert("Email verified successfully!");
    } else {
      alert("Invalid OTP");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailVerified) {
      setError("Please verify your email");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (
      !formData.email ||
      !formData.password ||
      !formData.firstName ||
      !formData.lastName
    ) {
      setError("Please fill in all fields");
      return;
    }
    if (passwordStrength !== "strong") {
      setError(
        "Password must include at least one lowercase letter, one uppercase letter, one number, and one special character"
      );
      return;
    }
    // Simulate API call
    console.log("Parent signup data:", formData);
    onComplete();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
    if (e.target.name === "password") {
      checkPasswordStrength(e.target.value);
    }
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
          className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#f79771] focus:border-[#f79771] focus:z-10 sm:text-sm"
          placeholder="Enter your first name"
          value={formData.firstName}
          onChange={handleChange}
        />
      </div>
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
          className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#f79771] focus:border-[#f79771] focus:z-10 sm:text-sm"
          placeholder="Enter your last name"
          value={formData.lastName}
          onChange={handleChange}
        />
      </div>
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
          className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#f79771] focus:border-[#f79771] focus:z-10 sm:text-sm"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
        />
        <div className="mt-2 space-y-2">
          <button
            type="button"
            onClick={() => sendOtp(formData.email)}
            disabled={!formData.email || emailVerified}
            className="text-xs bg-[#f79771] text-white py-1 px-3 rounded disabled:opacity-50">
            {emailVerified ? "Verified" : "Send OTP"}
          </button>
          {tempOtp && !emailVerified && (
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Enter OTP"
                className="w-20 px-2 py-1 border rounded"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
              />
              <button
                type="button"
                onClick={verifyOtp}
                className="text-xs bg-green-600 text-white py-1 px-3 rounded">
                Verify
              </button>
            </div>
          )}
          {emailVerified && (
            <p className="text-green-600 text-xs mt-1">Email verified</p>
          )}
        </div>
      </div>
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
          className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#f79771] focus:border-[#f79771] focus:z-10 sm:text-sm"
          placeholder="Enter password"
          value={formData.password}
          onChange={handleChange}
        />
        <div className="mt-2 space-y-1 text-xs">
          <div
            className={`flex items-center ${
              requirements.hasLowercase ? "text-green-600" : "text-gray-500"
            }`}>
            <span
              className={`w-2 h-2 rounded-full mr-2 ${
                requirements.hasLowercase ? "bg-green-600" : "bg-gray-300"
              }`}></span>
            One lowercase letter
          </div>
          <div
            className={`flex items-center ${
              requirements.hasUppercase ? "text-green-600" : "text-gray-500"
            }`}>
            <span
              className={`w-2 h-2 rounded-full mr-2 ${
                requirements.hasUppercase ? "bg-green-600" : "bg-gray-300"
              }`}></span>
            One uppercase letter
          </div>
          <div
            className={`flex items-center ${
              requirements.hasNumber ? "text-green-600" : "text-gray-500"
            }`}>
            <span
              className={`w-2 h-2 rounded-full mr-2 ${
                requirements.hasNumber ? "bg-green-600" : "bg-gray-300"
              }`}></span>
            One number
          </div>
          <div
            className={`flex items-center ${
              requirements.hasSpecial ? "text-green-600" : "text-gray-500"
            }`}>
            <span
              className={`w-2 h-2 rounded-full mr-2 ${
                requirements.hasSpecial ? "bg-green-600" : "bg-gray-300"
              }`}></span>
            One special character
          </div>
          <div
            className={`font-medium ${
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
          className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#f79771] focus:border-[#f79771] focus:z-10 sm:text-sm"
          placeholder="Confirm password"
          value={formData.confirmPassword}
          onChange={handleChange}
        />
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div>
        <button
          type="submit"
          disabled={!emailVerified}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#f79771] hover:bg-[#f79771] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f79771] disabled:opacity-50">
          Sign up as Parent
        </button>
      </div>
    </form>
  );
}

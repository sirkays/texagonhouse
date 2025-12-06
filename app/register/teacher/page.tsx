// app/register/teacher/page.tsx
"use client";

import {useState} from "react";
import OTPDialog from "../../../components/OTPDialog";
import {createAccount, verifyOTP} from "@/lib/api";

export default function TeacherRegister() {
  const [step, setStep] = useState<"email" | "otp" | "complete">("email");
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "your-api-key-here";

  const handleSendOTP = async () => {
    if (!email) return setError("Email is required");
    setLoading(true);
    setError("");

    try {
      await createAccount(
        {
          email,
          password: "temp123", // dummy, will be updated later
          account_type: "teacher",
          first_name: "",
          last_name: "",
        },
        API_KEY
      );
      setOtpSent(true);
      setStep("otp");
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (code: string) => {
    try {
      await verifyOTP(email, code, API_KEY);
      setStep("complete");
    } catch (err: any) {
      throw new Error(err.message || "Invalid OTP");
    }
  };

  if (step === "complete") {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="bg-white p-12 rounded-2xl shadow-xl text-center max-w-md">
          <div className="text-6xl mb-6">Success</div>
          <h2 className="text-3xl font-bold">Teacher Account Created!</h2>
          <p className="text-gray-600 mt-4">You can now log in with {email}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-8">
          Teacher Registration
        </h1>

        {step === "email" && (
          <div className="space-y-6">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-5 py-4 border border-gray-300 rounded-xl text-lg focus:ring-4 focus:ring-indigo-300 focus:border-indigo-500 outline-none"
            />
            {error && <p className="text-red-500 text-center">{error}</p>}
            <button
              onClick={handleSendOTP}
              disabled={loading || !email}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-indigo-700 disabled:opacity-50">
              {loading ? "Sending OTP..." : "Send OTP to Email"}
            </button>
          </div>
        )}

        {step === "otp" && (
          <div>
            <p className="text-center text-gray-600 mb-6">
              We sent a 6-digit code to <strong>{email}</strong>
            </p>
            <OTPDialog onVerify={handleVerify} />
          </div>
        )}
      </div>
    </div>
  );
}

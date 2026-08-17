"use client";

import {useState, useEffect} from "react";
import {useSearchParams, useRouter} from "next/navigation";
import {Lock, Eye, EyeOff, Mail} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Spinner} from "@/components/ui/spinner";
import Link from "next/link";
import Image from "next/image";
import {useBrand} from "@/hooks/use-brand";

export default function ResetPasswordContent() {
  const brand = useBrand();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [waitingForEmail, setWaitingForEmail] = useState(false);

  const resetToken = searchParams.get("token");

  useEffect(() => {
    if (resetToken) {
      setWaitingForEmail(false);
    } else {
      setWaitingForEmail(true);
      setError("");
    }
  }, [resetToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!resetToken) {
      setError("Reset token is required");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resetToken,
          new_password: newPassword,
          re_new_password: confirmPassword,
          issue_session_hours: 24,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to reset password");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login?reset=success");
      }, 2000);
    } catch (err) {
      console.error("[ResetPassword] Error:", err);
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            Password Reset Successful!
          </h2>
          <p className="text-gray-600 mb-6">
            You can now log in with your new password.
          </p>
          <Link href="/login">
            <Button variant="gradient">Go to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Waiting for email state
  if (waitingForEmail) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row">
        {/* Your existing waitingForEmail JSX */}
        <div className="w-full md:w-[40%] flex flex-col justify-center items-center bg-white p-10 md:p-8 min-h-screen md:min-h-auto">
          <div className="max-w-sm mx-auto w-full">
            {brand.id === "nimet" ? (
              <div className="mb-8 flex flex-col items-start">
                <Image
                  src="/nimet-logo.png"
                  alt="Nigerian Meteorological Agency"
                  width={240}
                  height={70}
                  priority
                  className="object-contain h-14 sm:h-16 w-auto mb-2"
                />
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  Official Learning Portal
                </span>
              </div>
            ) : (
              <div className="flex items-center mb-8">
                <Image
                  src="/logo.png"
                  alt="TechXagon Logo"
                  width={64}
                  height={64}
                  priority
                  className="rounded-lg mr-4 object-contain shrink-0"
                />
                <div className="flex flex-col min-w-0">
                  <h6 className="text-gray-900 font-extrabold text-xl sm:text-2xl tracking-tight leading-tight">
                    TECHXAGON ACADEMY
                  </h6>
                  <hr className="w-full my-2 border-gray-900" />
                  <p className="text-gray-600 italic text-sm">
                    Readying the Future
                  </p>
                </div>
              </div>
            )}

            <h2 className="text-2xl text-center sm:text-3xl font-bold mb-6">
              Check Your Email
            </h2>

            <div className="text-center space-y-4">
              <Mail className="mx-auto text-gray-400" size={48} />
              <p className="text-gray-600">
                We've sent a password reset link to your email. Please click the
                link in the email to reset your password.
              </p>
              <p className="text-sm text-gray-500">
                Didn't receive the email? Check your spam folder or{" "}
                <button
                  onClick={() => router.push("/login")}
                  className="text-blue-600 hover:underline font-semibold">
                  request a new one
                </button>
                .
              </p>
            </div>

            <div className="text-center text-sm text-gray-700 mt-8">
              <Link
                href="/login"
                className="text-blue-600 hover:underline font-semibold">
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>

        <div
          className={`w-full md:w-[60%] flex-col justify-center items-center relative overflow-hidden mt-6 md:mt-0 md:p-4 hidden sm:flex bg-cover bg-center ${
            brand.id === "nimet" ? "bg-gradient-to-br from-[#071a47] via-[#006B3E] to-[#04331e]" : ""
          }`}
          style={brand.id === "techxagon" ? {backgroundImage: "url('/texagon_sva.svg')"} : {}}>
          <div className="text-center z-10 px-4" />
        </div>
      </div>
    );
  }

  // Main reset form
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Your existing main form JSX - exactly the same */}
      <div className="w-full md:w-[40%] flex flex-col justify-center items-center bg-white p-10 md:p-8 min-h-screen md:min-h-auto">
        <div className="max-w-sm mx-auto w-full">
          {brand.id === "nimet" ? (
            <div className="mb-8 flex flex-col items-start">
              <Image
                src="/nimet-logo.png"
                alt="Nigerian Meteorological Agency"
                width={240}
                height={70}
                priority
                className="object-contain h-14 sm:h-16 w-auto mb-2"
              />
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                Official Learning Portal
              </span>
            </div>
          ) : (
            <div className="flex items-center mb-8">
              <Image
                src="/logo.png"
                alt="TechXagon Logo"
                width={64}
                height={64}
                priority
                className="rounded-lg mr-4 object-contain shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <h6 className="text-gray-900 font-extrabold text-xl sm:text-2xl tracking-tight leading-tight">
                  TECHXAGON ACADEMY
                </h6>
                <hr className="w-full my-2 border-gray-900" />
                <p className="text-gray-600 italic text-sm">
                  Readying the Future
                </p>
              </div>
            </div>
          )}

          <h2 className="text-2xl sm:text-3xl font-bold mb-6">
            Reset Your Password
          </h2>

          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-1">
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New Password*"
                  className="pl-12 pr-12 border border-gray-300 placeholder:text-gray-400 rounded-lg h-14 text-gray-900 text-lg focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                  autoComplete="new-password"
                  required
                />
                <Lock
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  aria-label={
                    showNewPassword ? "Hide password" : "Show password"
                  }>
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm New Password*"
                  className="pl-12 pr-12 border border-gray-300 placeholder:text-gray-400 rounded-lg h-14 text-gray-900 text-lg focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                  autoComplete="new-password"
                  required
                />
                <Lock
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }>
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-400 text-center bg-red-500/10 px-3 py-2 rounded-md">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className={`w-full py-6 text-lg font-bold text-white transition-all shadow-md cursor-pointer ${
                brand.id === "nimet"
                  ? "bg-gradient-to-r from-[#006B3E] via-[#005230] to-[#006B3E] hover:from-[#005230] hover:to-[#006B3E]"
                  : "bg-gradient-to-r from-orange-400 via-red-500 to-orange-400 hover:opacity-90"
              }`}
              disabled={loading}>
              {loading ? (
                <Spinner size="md" className="text-white" />
              ) : (
                "Reset Password"
              )}
            </Button>

            <div className="text-center text-sm text-gray-700">
              Remember your password?{" "}
              <Link
                href="/login"
                className="text-blue-600 hover:underline font-semibold">
                Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>

      <div
        className="w-full md:w-[60%] flex-col justify-center items-center relative overflow-hidden mt-6 md:mt-0 md:p-4 hidden sm:flex bg-cover bg-center"
        style={{backgroundImage: "url('/texagon_sva.svg')"}}>
        <div className="text-center z-10 px-4" />
      </div>
    </div>
  );
}

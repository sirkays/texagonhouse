// File: app/reset-password/page.tsx
"use client";

import {useState, useEffect} from "react";
import {useSearchParams} from "next/navigation";
import {Lock, Eye, EyeOff, Mail} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Spinner} from "@/components/ui/spinner";
import {useRouter} from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function ResetPasswordPage() {
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
      setError(""); // Clear any errors when waiting
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
          issue_session_hours: 24, // Optional: issue a session for 24 hours
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to reset password");
      }

      console.log("[ResetPassword] Reset successful:", result);
      setSuccess(true);
      // Optionally auto-redirect after a delay
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

  if (waitingForEmail) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row">
        <div className="w-full md:w-[40%] flex flex-col justify-center items-center bg-white p-10 md:p-8 min-h-screen md:min-h-auto">
          <div className="max-w-sm mx-auto w-full">
            <div className="flex items-center mb-10">
              <Image
                src="/logo.png"
                alt="TechXagon Logo"
                width={64}
                height={64}
                className="rounded-lg mr-4"
              />
              <div className="flex flex-col">
                <h6 className="text-gray-900 font-extrabold text-xl sm:text-2xl whitespace-nowrap">
                  TECHXAGON ACADEMY
                </h6>
                <hr className="w-full my-2 border-gray-900" />
                <p className="text-gray-600 italic text-lg">
                  Readying the Future
                </p>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
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
          className="w-full md:w-[60%] flex-col justify-center items-center relative overflow-hidden mt-6 md:mt-0 md:p-4 hidden sm:flex bg-cover bg-center"
          style={{backgroundImage: "url('/texagon_sva.svg')"}}>
          <div className="text-center z-10 px-4">
            {/* Placeholder for additional content */}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="w-full md:w-[40%] flex flex-col justify-center items-center bg-white p-10 md:p-8 min-h-screen md:min-h-auto">
        <div className="max-w-sm mx-auto w-full">
          <div className="flex items-center mb-10">
            <Image
              src="/logo.png"
              alt="TechXagon Logo"
              width={64}
              height={64}
              className="rounded-lg mr-4"
            />
            <div className="flex flex-col">
              <h6 className="text-gray-900 font-extrabold text-xl sm:text-2xl whitespace-nowrap">
                TECHXAGON ACADEMY
              </h6>
              <hr className="w-full my-2 border-gray-900" />
              <p className="text-gray-600 italic text-lg">
                Readying the Future
              </p>
            </div>
          </div>

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
              variant="gradient"
              className="w-full py-6 text-lg font-bold"
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
        <div className="text-center z-10 px-4">
          {/* Placeholder for additional content */}
        </div>
      </div>
    </div>
  );
}

"use client";

import {useState} from "react";
import {Lock, Eye, EyeOff} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Spinner} from "@/components/ui/spinner";
import {useRouter} from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    // Add your password reset logic here, e.g., API call with token from URL params
    // For example: const token = searchParams.get('token');
    console.log("[ResetPassword] Resetting password with:", newPassword);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
    // On success, clear form and redirect
    setNewPassword("");
    setConfirmPassword("");
    router.push("/login?reset=success");
  };

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
                  type={showPassword ? "text" : "password"}
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
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
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
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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

// app/change-password/page.tsx
"use client";

import {useMemo, useState} from "react";
import {useSession, signOut, signIn} from "next-auth/react";
import {useRouter} from "next/navigation";
import {Eye, EyeOff, Lock} from "lucide-react";
import Image from "next/image";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Spinner} from "@/components/ui/spinner";

export default function ChangePassword() {
  const {data: session, status} = useSession();
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Memoize session token — only recomputes when it actually changes
  const sessionToken = useMemo(
    () => session?.user?.sessionToken ?? null,
    [session?.user?.sessionToken],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Client-side validation
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      setLoading(false);
      return;
    }

    if (!sessionToken) {
      setError("Session expired. Please sign in again.");
      setLoading(false);
      router.push("/login");
      return;
    }

    if (!session?.user?.email) {
      setError("Unable to retrieve your email. Please sign in again.");
      setLoading(false);
      return;
    }

    try {

      const response = await fetch("/api/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Token": sessionToken,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle structured backend validation errors
        if (data.current_password) {
          setError(data.current_password);
        } else if (data.new_password?.length) {
          setError(data.new_password[0]);
        } else if (data.detail) {
          setError(data.detail);
        } else {
          setError("Failed to change password. Please try again.");
        }
        setLoading(false);
        return;
      }

      // Success → sign out → sign in with new password → redirect
      const email = session.user.email;

      // await signOut({redirect: false});

      // const signInResult = await signIn("credentials", {
      //   redirect: false,
      //   email,
      //   password: newPassword,
      // });

      // if (signInResult?.error) {
      //   setError(
      //     "Password changed successfully, but automatic login failed. " +
      //       "Please sign in manually with your new password.",
      //   );
      //   router.push("/login");
      //   return;
      // }

      if(session.user.role == 'student'){
        router.push("/student"); 
      }else if(session.user.role == 'parent'){
        router.push("/parent"); 
      }else if(session.user.role == 'teacher'){
        router.push("/teacher"); 
      }else{
        router.push("/admin"); 
      }

    } catch (err) {
      console.error("Password change error:", err);
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // ────────────────────────────────────────────────
  // Loading & Auth guards
  // ────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-2xl font-bold mb-4">Please Sign In</h2>
          <p className="text-gray-600 mb-6">
            You need to be signed in to change your password.
          </p>
          <Button onClick={() => router.push("/login")}>Go to Login</Button>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────
  // Main UI (your original layout preserved)
  // ────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="w-full md:w-[40%] flex flex-col justify-center items-center bg-white p-10 md:p-8 min-h-screen md:min-h-auto">
        <div className="max-w-sm mx-auto w-full">
          {/* Logo + Branding */}
          <div className="flex items-center mb-10">
            <Image
              src="/logo.png"
              alt="TechXagon Logo"
              width={64}
              height={64}
              className="rounded-lg mr-4"
              priority
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

          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900">
            Change your password
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Password */}
            <div className="space-y-1">
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Current Password*"
                  className="pl-12 pr-12 border border-gray-300 placeholder:text-gray-400 rounded-lg h-14 text-gray-900 text-lg focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                  autoComplete="current-password"
                  required
                  disabled={loading}
                />
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showCurrent ? "Hide password" : "Show password"}
                  disabled={loading}>
                  {showCurrent ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1">
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New Password*"
                  className="pl-12 pr-12 border border-gray-300 placeholder:text-gray-400 rounded-lg h-14 text-gray-900 text-lg focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                  autoComplete="new-password"
                  required
                  disabled={loading}
                />
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showNew ? "Hide password" : "Show password"}
                  disabled={loading}>
                  {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm New Password*"
                  className="pl-12 pr-12 border border-gray-300 placeholder:text-gray-400 rounded-lg h-14 text-gray-900 text-lg focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                  autoComplete="new-password"
                  required
                  disabled={loading}
                />
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                  disabled={loading}>
                  {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
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
              variant="gradient" // assuming this is your custom gradient variant
              className="w-full py-6 text-lg font-bold"
              disabled={loading}>
              {loading ? (
                <Spinner size="md" className="text-white" />
              ) : (
                "Change Password"
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Right-side branding panel – hidden on mobile */}
      <div
        className="w-full md:w-[60%] flex flex-col justify-center items-center relative overflow-hidden mt-6 md:mt-0 md:p-4 hidden sm:flex bg-cover bg-center"
        style={{backgroundImage: "url('/texagon_sva.svg')"}}
      />
    </div>
  );
}

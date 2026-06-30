"use client";

import { useMemo, useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export default function ChangePassword() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // OTP flow
  const [otpRequired, setOtpRequired] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpMessage, setOtpMessage] = useState<string | null>(null);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [skipping, setSkipping] = useState(false);

  const sessionToken = useMemo(() => session?.user?.sessionToken ?? null, [session?.user?.sessionToken]);

  // Dismiss the password change prompt on mount so the user is never
  // redirected here again, even if they don't actually change their password.
  useEffect(() => {
    if (status === "authenticated" && sessionToken) {
      fetch("/api/dismiss-password-change", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Token": sessionToken,
        },
      })
        .then(() => update({ isGenerated: false }))
        .catch((err) => console.error("Failed to dismiss password prompt:", err));
    }
  }, [status, sessionToken]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (session?.user?.email) {
      setEmail(session.user.email);
    }
  }, [session?.user?.email]);

  const redirectToDashboard = () => {
    const role = session?.user?.role;
    const rolePaths: Record<string, string> = {
      student: "/student",
      parent: "/parent",
      teacher: "/teacher",
      admin: "/admin",
    };
    window.location.href = rolePaths[role || ""] || "/login";
  };

  const validateEmailFormat = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOtpMessage(null);
    setLoading(true);

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

  
    // Prevent user from re-using current password (only possible for self-change on client)
    // session.user.email exists -> session implies signed-in user; we only know the current password on the client via the currentPassword field
    if (currentPassword && newPassword === currentPassword) {
      setError("New password must be different from your current password.");
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

    if (email && !validateEmailFormat(email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      const body: any = {
        current_password: currentPassword,
        new_password: newPassword,
      };

      if (email && email !== session.user.email) {
        body.new_email = email;
      }

      const response = await fetch("/api/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Token": sessionToken,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      console.log(data, " res.. ", response.status)
      if (!response.ok) {
        if (data.current_password) {
          setError(data.current_password);
        } else if (data.new_password?.length) {
          setError(data.new_password[0]);
        } else if (data.new_email) {
          setError(data.new_email);
        } else if (data.detail) {
          setError(data.detail);
        } else {
          setError("Failed to change password. Please try again.");
        }
        setLoading(false);
        return;
      }

      // If the backend requests email verification (OTP)
      if (data.email_verification_required) {
        setOtpRequired(true);
        setOtpMessage("A verification code has been sent to the new email. Enter it below to confirm.");
        setLoading(false);
        return;
      }

      // If the backend changed the email immediately for the current user, sign out to refresh session
      if (data.email_changed && session?.user?.email && email !== session.user.email) {
        await signOut({ redirect: false });
        router.push("/login");
        return;
      }

      // Normal success redirect
      await update({ isGenerated: false });

      redirectToDashboard();
    } catch (err) {
      console.log("Password change error:", err);
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOtp = async () => {
    setOtpLoading(true);
    setError(null);
    setOtpMessage(null);

    if (!otpCode || otpCode.length < 4) {
      setError("Please enter the verification code.");
      setOtpLoading(false);
      return;
    }

    if (!sessionToken) {
      setError("Session expired. Please sign in again.");
      setOtpLoading(false);
      router.push("/login");
      return;
    }

    try {
      const response = await fetch("/api/confirm-email-change", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Token": sessionToken,
        },
        body: JSON.stringify({
          code: otpCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code) {
          setError(data.code);
        } else if (data.detail) {
          setError(data.detail);
        } else {
          setError("Failed to confirm email. Please try again.");
        }
        setOtpLoading(false);
        return;
      }

      // After successful confirmation we sign out so session reflects new email.
      await signOut({ redirect: false });
      router.push("/login");
    } catch (err) {
      console.error("OTP confirm error:", err);
      setError("An unexpected error occurred while confirming. Please try again later.");
    } finally {
      setOtpLoading(false);
    }
  };

  // Loading & Auth guards
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // if (!session) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-gray-50">
  //       <div className="text-center p-8 max-w-md">
  //         <h2 className="text-2xl font-bold mb-4">Please Sign In</h2>
  //         <p className="text-gray-600 mb-6">You need to be signed in to change your password.</p>
  //         <Button onClick={() => router.push("/login")}>Go to Login</Button>
  //       </div>
  //     </div>
  //   );
  // }

  // Main UI
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="w-full md:w-[40%] flex flex-col justify-center items-center bg-white p-10 md:p-8 min-h-screen md:min-h-auto">
        <div className="max-w-sm mx-auto w-full">
          {/* Branding */}
          <div className="flex items-center mb-10">
            <Image src="/logo.png" alt="TechXagon Logo" width={64} height={64} className="rounded-lg mr-4" priority />
            <div className="flex flex-col">
              <h6 className="text-gray-900 font-extrabold text-xl sm:text-2xl whitespace-nowrap">TECHXAGON ACADEMY</h6>
              <hr className="w-full my-2 border-gray-900" />
              <p className="text-gray-600 italic text-lg">Readying the Future</p>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900">Change your password</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-1">
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email (optional)"
                  className="pl-12 pr-12 border border-gray-300 placeholder:text-gray-400 rounded-lg h-14 text-gray-900 text-lg focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                  autoComplete="email"
                  disabled={loading || otpRequired}
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              </div>
              <p className="text-xs text-gray-500">Leave unchanged to keep your current email.</p>
            </div>

            {/* Current Password */}
            <div className="space-y-1">
              <div className="relative">
                <Input id="current-password" type={showCurrent ? "text" : "password"} value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current Password*"
                  className="pl-12 pr-12 border border-gray-300 placeholder:text-gray-400 rounded-lg h-14 text-gray-900 text-lg focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                  autoComplete="current-password" required disabled={loading || otpRequired} />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showCurrent ? "Hide password" : "Show password"} disabled={loading || otpRequired}>
                  {showCurrent ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1">
              <div className="relative">
                <Input id="new-password" type={showNew ? "text" : "password"} value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)} placeholder="New Password*"
                  className="pl-12 pr-12 border border-gray-300 placeholder:text-gray-400 rounded-lg h-14 text-gray-900 text-lg focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                  autoComplete="new-password" required disabled={loading || otpRequired} />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <button type="button" onClick={() => setShowNew(!showNew)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showNew ? "Hide password" : "Show password"} disabled={loading || otpRequired}>
                  {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <div className="relative">
                <Input id="confirm-password" type={showConfirm ? "text" : "password"} value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm New Password*"
                  className="pl-12 pr-12 border border-gray-300 placeholder:text-gray-400 rounded-lg h-14 text-gray-900 text-lg focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                  autoComplete="new-password" required disabled={loading || otpRequired} />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showConfirm ? "Hide password" : "Show password"} disabled={loading || otpRequired}>
                  {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-400 text-center bg-red-500/10 px-3 py-2 rounded-md">{error}</p>
            )}

            {!otpRequired ? (
              <Button type="submit" variant="gradient" className="w-full py-6 text-lg font-bold" disabled={loading}>
                {loading ? <Spinner size="md" className="text-white" /> : "Change Password"}
              </Button>
            ) : (
              <>
                <p className="text-sm text-gray-700 text-center">{otpMessage}</p>

                <div className="space-y-4 mt-4">
                  <div className="relative">
                    <Input id="otp-code" type="text" value={otpCode} onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="Verification code" className="pl-4 pr-4 border border-gray-300 rounded-lg h-12"
                      disabled={otpLoading} />
                  </div>

                  <Button onClick={handleConfirmOtp} className="w-full py-3" disabled={otpLoading}>
                    {otpLoading ? <Spinner size="sm" /> : "Confirm Email"}
                  </Button>

                  <Button variant="ghost" onClick={() => { setOtpRequired(false); setOtpCode(""); }}>
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </form>

          <div className="flex items-center justify-center" style={{ marginTop: "19px" }}>
            <button
              type="button"
              onClick={() => {
                setSkipping(true);
                redirectToDashboard();
              }}
              disabled={skipping}
              className="text-sm text-blue-600 hover:underline focus:outline-none disabled:opacity-50"
            >
              {skipping ? "Redirecting…" : "Skip for now"}
            </button>
          </div>
        </div>
      </div>

      <div className="w-full md:w-[60%] flex flex-col justify-center items-center relative overflow-hidden mt-6 md:mt-0 md:p-4 hidden sm:flex bg-cover bg-center"
        style={{ backgroundImage: "url('/texagon_sva.svg')" }} />
    </div>
  );
}
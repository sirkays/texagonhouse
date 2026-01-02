"use client";

import {useState, useEffect, useCallback} from "react";
import {Mail, Lock, Eye, EyeOff} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Spinner} from "@/components/ui/spinner";
import Link from "next/link";
import {signIn, useSession} from "next-auth/react";
import {useRouter, useSearchParams} from "next/navigation";
import Image from "next/image";

export default function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [pastEmails, setPastEmails] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [forgotSuggestions, setForgotSuggestions] = useState<string[]>([]);
  const [showForgotSuggestions, setShowForgotSuggestions] = useState(false);
  const {data: session, status} = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetSuccess = searchParams.get("reset") === "success";

  // Load past emails from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("pastEmails");
    if (saved) {
      setPastEmails(JSON.parse(saved));
    }
  }, []);

  const saveEmail = useCallback(
    (newEmail: string) => {
      if (newEmail && !pastEmails.includes(newEmail)) {
        const updated = [...pastEmails, newEmail].slice(-5); // Keep last 5
        setPastEmails(updated);
        localStorage.setItem("pastEmails", JSON.stringify(updated));
      }
    },
    [pastEmails]
  );

  // Handle email suggestions for login
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (value) {
      const filtered = pastEmails.filter((em) =>
        em.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions(pastEmails);
      setShowSuggestions(true);
    }
  };

  const handleEmailFocus = () => {
    setSuggestions(pastEmails);
    setShowSuggestions(true);
  };

  const handleEmailBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const selectSuggestion = (sug: string) => {
    setEmail(sug);
    setShowSuggestions(false);
  };

  // Handle forgot email suggestions
  const handleForgotEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setForgotEmail(value);
    if (value) {
      const filtered = pastEmails.filter((em) =>
        em.toLowerCase().includes(value.toLowerCase())
      );
      setForgotSuggestions(filtered);
      setShowForgotSuggestions(true);
    } else {
      setForgotSuggestions(pastEmails);
      setShowForgotSuggestions(true);
    }
  };

  const handleForgotEmailFocus = () => {
    setForgotSuggestions(pastEmails);
    setShowForgotSuggestions(true);
  };

  const handleForgotEmailBlur = () => {
    setTimeout(() => setShowForgotSuggestions(false), 200);
  };

  const selectForgotSuggestion = (sug: string) => {
    setForgotEmail(sug);
    setShowForgotSuggestions(false);
  };

  // Handle role-based redirection after successful login
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      console.log(
        "[LoginPage] Session authenticated, role:",
        session.user.role
      );
      const role = session.user.role;
      if (role === "admin") {
        router.push("/admin");
      } else if (role === "student") {
        router.push("/student");
      } else if (role === "teacher") {
        router.push("/teacher");
      } else if (role === "parent") {
        router.push("/parent");
      } else {
        router.push("/login");
      }
    }
  }, [status, session, router]);

  const handleForgotPasswordSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: forgotEmail,
          hours_valid: 1,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to send reset email");
      }

      saveEmail(forgotEmail);
      setShowDialog(false);
      setForgotEmail("");
      router.push("/reset-password");
    } catch (err) {
      console.error("[LoginPage] Forgot password error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to send reset email"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setForgotEmail("");
    setError("");
    setShowForgotSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (!result?.error) {
      saveEmail(email);
    } else {
      console.error("[LoginPage] Sign-in error:", result.error);
      setError(result.error);
    }
    setLoading(false);
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
            Log in to your account
          </h2>

          {resetSuccess && (
            <div className="text-sm text-green-600 text-center bg-green-500/10 px-3 py-2 rounded-md mb-4">
              Password reset successful! You can now sign in.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-1 relative">
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  onFocus={handleEmailFocus}
                  onBlur={handleEmailBlur}
                  placeholder="Email Address*"
                  className="pl-12 pr-4 border border-gray-300 placeholder:text-gray-400 rounded-lg h-14 text-gray-900 text-lg focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                  autoComplete="off"
                  required
                />
                <Mail
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
              </div>
              {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-40 overflow-y-auto">
                  {suggestions.map((sug) => (
                    <li
                      key={sug}
                      onClick={() => selectSuggestion(sug)}
                      className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm text-gray-900">
                      {sug}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-1">
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password*"
                  className="pl-12 pr-12 border border-gray-300 placeholder:text-gray-400 rounded-lg h-14 text-gray-900 text-lg focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                  autoComplete="off"
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
                "Sign In"
              )}
            </Button>

            <div
              className="flex items-center justify-center"
              style={{marginTop: "19px"}}>
              <button
                onClick={() => setShowDialog(true)}
                className="text-sm text-blue-600 hover:underline focus:outline-none">
                Forgotten password?
              </button>
            </div>
          </form>
        </div>
      </div>

      <div
        className="w-full md:w-[60%] flex-col justify-center items-center relative overflow-hidden mt-6 md:mt-0 md:p-4 hidden sm:flex bg-cover bg-center"
        style={{backgroundImage: "url('/texagon_sva.svg')"}}>
        <div className="text-center z-10 px-4" />
      </div>

      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg max-w-md w-full max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Forgot Password</h2>
            <form onSubmit={handleForgotPasswordSubmit}>
              <div className="mb-4 relative">
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  type="email"
                  value={forgotEmail}
                  onChange={handleForgotEmailChange}
                  onFocus={handleForgotEmailFocus}
                  onBlur={handleForgotEmailBlur}
                  required
                  placeholder="Enter email"
                  className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                />
                {showForgotSuggestions && forgotSuggestions.length > 0 && (
                  <ul className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-40 overflow-y-auto mt-1">
                    {forgotSuggestions.map((sug) => (
                      <li
                        key={sug}
                        onClick={() => selectForgotSuggestion(sug)}
                        className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm text-gray-900">
                        {sug}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {error && (
                <p className="text-sm text-red-400 text-center bg-red-500/10 px-3 py-2 rounded-md mb-4">
                  {error}
                </p>
              )}
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  onClick={handleCloseDialog}
                  variant="outline"
                  className="px-4 py-2">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="gradient"
                  className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  disabled={loading}>
                  {loading ? (
                    <Spinner size="sm" className="text-white" />
                  ) : (
                    "Submit"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

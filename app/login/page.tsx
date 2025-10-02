"use client";

import { useState, useEffect } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

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
        console.log("[LoginPage] Unknown role, redirecting to /student");
        router.push("/login");
      }
    }
  }, [status, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    console.log("[LoginPage] Submitting login with email:", email);

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setLoading(false);
    if (result?.error) {
      console.error("[LoginPage] Sign-in error:", result.error);
      setError(result.error);
    } else {
      console.log("[LoginPage] Sign-in successful");
    }
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
              <h6 className="text-gray-900 font-extrabold text-xl sm:text-2xl whitespace-nowrap">TECHXAGON ACADEMY</h6>
              <hr className="w-full my-2 border-gray-900" />
              <p className="text-gray-600 italic text-lg">Readying the Future</p>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold mb-6">Log in to your account</h2>

          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-1">
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address*"
                  className="pl-12 pr-4 border border-gray-300 placeholder:text-gray-400 rounded-lg h-14 text-gray-900 text-lg focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                  autoComplete="off"
                  required
                />
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>
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
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {/* <div className="text-right">
                <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                  Forgot Password?
                </Link>
              </div> */}
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
              disabled={loading}
            >
              {loading ? <Spinner size="md" className="text-white" /> : "Sign In"}
            </Button>
            {/* <div className="text-center text-sm text-gray-700">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-blue-600 hover:underline font-semibold">
                Sign Up
              </Link>
            </div> */}
          </form>
        </div>
      </div>

      <div className="w-full md:w-[60%] flex-col justify-center items-center relative overflow-hidden mt-6 md:mt-0 md:p-4 hidden sm:flex bg-cover bg-center" style={{backgroundImage: "url('/texagon_sva.svg')"}}>
        <div className="text-center z-10 px-4">
          {/* <h2 className="text-white font-bold mb-2">Placeholder</h2>
          <p className="text-white mb-4 opacity-90">content</p>
          <Button variant="gradient" className="px-4 py-2 rounded text-base hover:border-white hover:border">
            Learn More →
          </Button> */}
        </div>
      </div>
    </div>
  );
}
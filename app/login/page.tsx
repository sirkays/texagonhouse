"use client";

import {useState, useEffect} from "react";
import {GraduationCap, Mail, Lock, Eye, EyeOff} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Spinner} from "@/components/ui/spinner";
import Link from "next/link";
import {signIn, useSession} from "next-auth/react";
import {useRouter} from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const {data: session, status} = useSession();
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
    <div
      className="flex min-h-screen w-full items-center justify-center px-4 sm:px-6 lg:px-8"
      style={{
        backgroundImage: "url('/landing.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "#",
      }}>
      {/* Glassy Blur Overlay */}
      <div className="absolute inset-0 backdrop-blur-sm bg-black/50"></div>

      <div
        className="backdrop-blur-md bg-white w-full max-w-[90vw] sm:max-w-md lg:max-w-lg rounded-xl p-6 sm:p-8"
        style={{boxShadow: "0 4px 15px rgba(225, 225, 225)"}}>
        <div className="flex flex-col items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex flex-wrap justify-center gap-5">
            <Image
              src="/logo.png"
              alt="TechXagon Logo"
              width={70}
              height={70}
            />
            <div className="gap-5 pt-2 text-gray-800">
              <h1 className="font-bold sm:text-xl">TECHXAGON ACADEMY</h1>

              <hr className="mt-1 mb-1 border-t border-gray-800 " />

              <h4 className=" text-[14px]">Readying the Future</h4>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-3 top-4 h-5 w-5" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent focus:bg-transparent md:text-md text-black pl-12 pr-3 py-6 border border-[#E95F39]/90 rounded-lg focus:ring-2 focus:ring-[#EF7B55] focus:border-transparent transition-all duration-200"
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <Lock className="absolute left-3 top-4 h-5 w-5" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent focus:bg-transparent md:text-md text-black pl-12 pr-10 py-6 border border-[#E95F39]/90 rounded-lg focus:ring-2 focus:ring-[#EF7B55] focus:border-transparent transition-all duration-200"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-4 h-5 w-5 transition-colors">
                {showPassword ? (
                  <EyeOff className="h-4" />
                ) : (
                  <Eye className="h-4" />
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
            className="w-full py-7 text-[18px] font-bold bg-gradient-to-r from-[#DD2701] to-[#F9D282] hover:from-[#DD2701]/90 hover:to-[#F9D282]/100 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            disabled={loading}>
            {loading ? <Spinner size="md" className="text-white" /> : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { GraduationCap, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  // Handle role-based redirection after successful login
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      console.log("[LoginPage] Session authenticated, role:", session.user.role);
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
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-[90vw] sm:max-w-md lg:max-w-lg rounded-lg border border-border bg-background shadow-md p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-primary" />
          <h1 className="font-semibold text-base sm:text-lg lg:text-xl">EduPlatform</h1>
          <h2 className="text-xs sm:text-sm lg:text-base text-muted-foreground">Sign in to your account</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs sm:text-sm lg:text-base">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-2.5 top-2.5 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-8 sm:pl-9 lg:pl-10 text-xs sm:text-sm lg:text-base h-9 sm:h-10 lg:h-11"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs sm:text-sm lg:text-base">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-2.5 top-2.5 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-8 sm:pl-9 lg:pl-10 text-xs sm:text-sm lg:text-base h-9 sm:h-10 lg:h-11"
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-xs sm:text-sm lg:text-base text-destructive text-center">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full text-xs sm:text-sm lg:text-base bg-primary text-primary-foreground hover:bg-primary/90 h-9 sm:h-10 lg:h-11"
            disabled={loading}
          >
            {loading ? <Spinner size="md" className="text-white" /> : "Sign In"}
          </Button>
        </form>

        <div className="mt-3 sm:mt-4 lg:mt-5 text-center">
          {/* <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">
            Don’t have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p> */}
        </div>
      </div>
    </div>
  );
}
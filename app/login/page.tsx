"use client";

import { useState, useEffect } from "react";
import { GraduationCap, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { data: session, status } = useSession();
  const router = useRouter();

  // Handle role-based redirection after successful login
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      const role = session.user.role;
      if (role === "admin") {
        router.push("/admin");
      } else if (role === "student") {
        router.push("/student");
      } else {
        // Fallback for unknown roles
        router.push("/student");
      }
    }
  }, [status, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError(result.error);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-3 xs:p-4 sm:p-6">
      <div className="w-full max-w-[90vw] md:max-w-[50vw] xs:max-w-md rounded-lg border border-border bg-background shadow-md p-4 xs:p-6 sm:p-8">
        <div className="flex flex-col items-center gap-3 xs:gap-4 mb-4 xs:mb-6">
          <GraduationCap className="h-5 w-5 xs:h-6 xs:w-6 text-primary" />
          <h1 className="font-semibold text-base xs:text-lg sm:text-xl">EduPlatform</h1>
          <h2 className="text-[0.65rem] xs:text-xs sm:text-sm text-muted-foreground">Sign in to your account</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 xs:space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[0.65rem] xs:text-xs sm:text-sm">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-2 xs:left-2.5 top-2 xs:top-2.5 h-3 w-3 xs:h-4 xs:w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-7 xs:pl-8 text-[0.65rem] xs:text-xs sm:text-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-[0.65rem] xs:text-xs sm:text-sm">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-2 xs:left-2.5 top-2 xs:top-2.5 h-3 w-3 xs:h-4 xs:w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-7 xs:pl-8 text-[0.65rem] xs:text-xs sm:text-sm"
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-[0.65rem] xs:text-xs sm:text-sm text-destructive text-center">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full text-[0.65rem] xs:text-xs sm:text-sm bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Sign In
          </Button>
        </form>

        <div className="mt-3 xs:mt-4 text-center">
          <p className="text-[0.65rem] xs:text-xs sm:text-sm text-muted-foreground">
            Don’t have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
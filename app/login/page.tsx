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
        backgroundImage: "url('./login-background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}>
      <div className="bg-[#ffffff19] w-full max-w-[90vw] sm:max-w-md lg:max-w-lg rounded-lg shadow-[#ffffff3f] shadow-lg p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex flex-wrap justify-center gap-5">
            <Image
              src="/logo.png"
              alt="TechXagon Logo"
              width={70}
              height={70}
            />
            <div className="gap-5 pt-2">
              <h1 className="font-bold sm:text-xl text-[#ffffff]">
                TECHXAGON ACADEMY
              </h1>

              <hr className="mt-1 mb-1" />

              <h4 className=" text-[14px] text-[#ffffff]">
                Readying the Future
              </h4>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div className="space-y-2">
            <div className="relative">
              <Mail className="absolute left-2.5 top-2.5 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent text-[#e0c4be] pl-8 sm:pl-9 lg:pl-10 text-xs sm:text-sm lg:text-base h-9 sm:h-10 lg:h-11"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Lock className="absolute left-2.5 top-2.5 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent text-[#e0c4be] pl-8 sm:pl-9 lg:pl-10 text-xs sm:text-sm lg:text-base h-9 sm:h-10 lg:h-11 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-2.5 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-muted-foreground hover:text-gray-300 focus:outline-none">
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs sm:text-sm lg:text-base text-destructive text-center">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full text-xs sm:text-sm lg:text-base bg-[#EF7B55] hover:bg-[#ef7c55d1] h-9 sm:h-10 lg:h-11"
            disabled={loading}>
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

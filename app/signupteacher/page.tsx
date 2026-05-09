// texagon_academy\texagonui\app\signupteacher\page.tsx
"use client";

import { useState } from "react";
import ParentSignupForm from "@/components/signup/ParentSignupForm";
import ParentBiodataForm from "@/components/signup/ParentBiodataForm";
import Image from "next/image";
import TeacherSignupForm from "@/components/signup/TeacherSignupForm";
import Link from "next/link";

export default function ParentSignupPage() {
  const [step, setStep] = useState<"signup" | "biodata">("signup");

  const handleSignupComplete = () => {
    setStep("biodata");
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-white">
      {/* Decorative Background Section (Hidden on mobile) */}
      <div
        className="hidden lg:flex lg:w-[55%] xl:w-[60%] justify-center items-center bg-cover bg-center relative"
        style={{ backgroundImage: "url('/texagon_sva.svg')" }}>
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* Scrollable Form Section (Mobile-First Priority) */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-10 sm:px-8 lg:px-12 xl:px-18 scrollbar-hide">
        <div className="w-full max-w-md mx-auto">
          {/* Logo/Brand */}
          <div className="flex items-center justify-center mb-8">
            <Image
              src="/logo.png"
              alt="TechXagon Logo"
              width={56}
              height={56}
              className="rounded-lg mr-3 sm:mr-4"
            />
            <div>
              <h6 className="text-gray-900 font-extrabold text-lg sm:text-2xl whitespace-nowrap">
                TECHXAGON ACADEMY
              </h6>
              <hr className="w-full my-1 sm:my-2 border-gray-900" />
              <p className="text-gray-600 italic text-sm sm:text-lg">
                Readying the Future
              </p>
            </div>
          </div>

          <TeacherSignupForm onComplete={handleSignupComplete} />

          <p className="mt-6 text-center text-sm sm:text-base">
            Already have an account?{" "}
            <Link href="/login" className="font-medium hover:text-red-600 transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
}

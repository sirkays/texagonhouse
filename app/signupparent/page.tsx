//texagon_academy\texagonui\app\signupparent\page.tsx
"use client";

import { useEffect, useState } from "react";
import ParentSignupFlow from "@/components/signup/ParentSignupForm"; // this is your flow component export
import ParentBiodataForm from "@/components/signup/ParentBiodataForm";
import Image from "next/image";

const STORAGE_KEY = "parentSignupJourney";

type JourneyState = {
  pageStep: "signup" | "biodata";
  parentProfileId: number | null;

  // parent signup flow
  signupStep?: "form" | "otp";
  signupEmailForOtp?: string;

  // child flow
  biodataStep?: "list" | "form" | "otp";
  childEmailForOtp?: string;
};

export default function ParentSignupPage() {
  const [step, setStep] = useState<"signup" | "biodata">("signup");
  const [parentProfileId, setParentProfileId] = useState<number | null>(null);
  const cancelRegistration = () => {
    sessionStorage.removeItem("parentSignupJourney");
    sessionStorage.removeItem("parentSignupFlow"); // if you still use this key anywhere

    setStep("signup");
    setParentProfileId(null);

    // optional: also reload the route to fully reset UI
    // window.location.href = "/signupparent";
  };

  // restore page-level state on reload
  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const saved: JourneyState = JSON.parse(raw);

      if (saved.pageStep) setStep(saved.pageStep);
      if (typeof saved.parentProfileId === "number") setParentProfileId(saved.parentProfileId);
    } catch {
      // ignore
    }
  }, []);

  // persist page-level state
  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const prev: JourneyState = raw ? JSON.parse(raw) : ({} as JourneyState);

    const next: JourneyState = {
      ...prev,
      pageStep: step,
      parentProfileId,
    };

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, [step, parentProfileId]);

  // When parent is verified, move to biodata and store id
  const handleSignupComplete = (id: number) => {
    setParentProfileId(id);
    setStep("biodata");

    const raw = sessionStorage.getItem(STORAGE_KEY);
    const prev: JourneyState = raw ? JSON.parse(raw) : ({} as JourneyState);

    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...prev,
        pageStep: "biodata",
        parentProfileId: id,
      } satisfies JourneyState)
    );
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-white">
      <div
        className="hidden lg:flex lg:w-[55%] xl:w-[60%] justify-center items-center bg-cover bg-center relative"
        style={{ backgroundImage: "url('/texagon_sva.svg')" }}
      >
        <div className="absolute inset-0 bg-black/10" />
      </div>

      <div className="flex-1 min-h-0 flex items-start justify-center px-4 py-10 sm:px-8 lg:px-12 xl:px-18 overflow-y-auto scrollbar-hide">
        <div className="w-full max-w-md">
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
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
            Sign up to your account
          </h1>

          <button
            type="button"
            onClick={cancelRegistration}
            className="mb-6 text-sm text-gray-600 hover:text-red-600 underline"
          >
            Cancel registration
          </button>


          {step === "signup" ? (
            <ParentSignupFlow onComplete={handleSignupComplete} onCancel={cancelRegistration} />
          ) : (
            <ParentBiodataForm parentProfileId={parentProfileId} onCancel={cancelRegistration} />
          )}

          <p className="mt-6 text-center text-sm sm:text-base">
            Already have an account?{" "}
            <a href="/login" className="font-medium hover:text-red-600 transition-colors">
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

// app/signup/teacher/page.tsx
"use client";

import {useState} from "react";
import TeacherSignupForm from "@/components/signup/TeacherSignupForm";
import TeacherBiodataForm from "@/components/signup/TeacherBiodataForm";

export default function TeacherSignupPage() {
  const [step, setStep] = useState<"signup" | "biodata">("signup");

  const handleSignupComplete = () => {
    setStep("biodata");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign Up as Teacher
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create your teacher account.
          </p>
        </div>
        {step === "signup" ? (
          <TeacherSignupForm onComplete={handleSignupComplete} />
        ) : (
          <TeacherBiodataForm />
        )}
      </div>
    </div>
  );
}

import { Suspense } from "react";
import ResetPasswordContent from "@/components/reset-password/reset-password";
import { Spinner } from "@/components/ui/spinner";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Spinner /></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
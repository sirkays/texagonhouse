import { Suspense } from "react";
import LoginContent from "@/components/login/login-content";
import { Spinner } from "@/components/ui/spinner";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Spinner /></div>}>
      <LoginContent />
    </Suspense>
  );
}
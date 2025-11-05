"use client";

import {useEffect} from "react";
import {AlertCircle} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation";

export default function UnauthorizedPage() {
  const {data: session, status} = useSession();
  const router = useRouter();

  console.log("[UnauthorizedPage] Session status:", status);
  console.log("[UnauthorizedPage] Session data:", session);

  // Redirect based on role after session is loaded
  useEffect(() => {
    if (status === "loading") {
      console.log("[UnauthorizedPage] Session is loading");
      return;
    }
    if (status === "authenticated" && session?.user?.role) {
      console.log(
        "[UnauthorizedPage] Redirecting based on role:",
        session.user.role
      );
      if (session.user.role === "admin") {
        router.push("/admin");
      } else if (session.user.role === "student") {
        router.push("/student");
      } else {
        console.log("[UnauthorizedPage] Unknown role, redirecting to /login");
        router.push("/login");
      }
    } else {
      console.log("[UnauthorizedPage] Redirecting to /login: unauthenticated");
      router.push("/login");
    }
  }, [status, session, router]);

  const handleRedirect = () => {
    if (status === "authenticated" && session?.user?.role) {
      console.log(
        "[UnauthorizedPage] Button clicked, redirecting based on role:",
        session.user.role
      );
      if (session.user.role === "admin") {
        router.push("/admin");
      } else if (session.user.role === "student") {
        router.push("/student");
      } else {
        router.push("/login");
      }
    } else {
      console.log(
        "[UnauthorizedPage] Button clicked, redirecting to /login: unauthenticated"
      );
      router.push("/login");
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-3 xs:p-4 sm:p-6 font-sans">
      <Card className="w-full max-w-[90vw] xs:max-w-md md:max-w-[50vw] rounded-lg border border-border shadow-md">
        <CardHeader className="flex flex-col items-center gap-3 xs:gap-4">
          <AlertCircle className="h-5 w-5 xs:h-6 xs:w-6 text-destructive" />
          <CardTitle className="text-base xs:text-lg sm:text-xl font-semibold">
            Unauthorized Access
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 xs:space-y-5 text-center">
          <p className="text-[0.85rem] xs:text-xs sm:text-sm text-muted-foreground">
            You do not have permission to access this page.
          </p>
          <Button
            onClick={handleRedirect}
            className="w-full text-[0.85rem] xs:text-xs sm:text-sm bg-primary text-primary-foreground hover:bg-primary/90">
            {status === "authenticated" && session?.user?.role
              ? `Go to ${
                  session.user.role === "admin" ? "Admin" : "Student"
                } Dashboard`
              : "Go to Login"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}


"use client";

import { SessionProvider } from "next-auth/react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      // Disable automatic session refetch on window focus.
      // This prevents the /api/auth/session call every time the user
      // switches tabs or returns to the page, which was causing
      // components to re-render (and briefly flash loading spinners).
      refetchOnWindowFocus={false}
      // Only re-check the session every 5 minutes instead of the default.
      // The middleware already verifies the session on each navigation,
      // so client-side polling can be less aggressive.
      refetchInterval={5 * 60}
    >
      {children}
    </SessionProvider>
  );
}
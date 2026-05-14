"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

/**
 * Global 401 Interceptor
 *
 * Patches window.fetch so that ANY request to /api/* that returns 401
 * triggers an automatic logout + redirect to /login.
 *
 * Place this component once in the app tree (already done via SessionGuardProvider).
 */
let isIntercepting = false;
let isPatched = false;

export function useFetchInterceptor() {
  const pathname = usePathname();

  useEffect(() => {
    // Don't intercept on public pages
    if (pathname === "/login" || pathname?.startsWith("/report/") || pathname?.startsWith("/signup")) {
      return;
    }

    // Only patch once globally
    if (isPatched) return;
    isPatched = true;

    const originalFetch = window.fetch;

    window.fetch = async function patchedFetch(
      input: RequestInfo | URL,
      init?: RequestInit
    ): Promise<Response> {
      const response = await originalFetch.call(window, input, init);

      // Only intercept API calls
      const url = typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;

      const isApiCall = url.startsWith("/api/") || url.includes("/api/");
      // Don't intercept auth endpoints themselves
      const isAuthCall = url.includes("/api/auth/");
      // Don't intercept code execution proxy — upstream 401s are provider
      // errors (expired API key, rate-limit), NOT session expiry.
      const isExecuteCall = url.includes("/api/code-ide/execute");

      if (response.status === 401 && isApiCall && !isAuthCall && !isExecuteCall && !isIntercepting) {
        isIntercepting = true;
        console.warn("[SessionGuard] 401 detected on", url, "— triggering logout");

        // Notify other tabs
        try {
          localStorage.setItem("session_expired", Date.now().toString());
        } catch { /* ignore */ }

        // Perform logout
        try {
          await originalFetch("/api/auth/logout-route", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });
        } catch { /* ignore */ }

        await signOut({ redirect: false });

        const callbackUrl = window.location.pathname + window.location.search;
        window.location.href = `/login?reason=revoked&callbackUrl=${encodeURIComponent(callbackUrl)}`;
      }

      return response;
    };

    // Cleanup: restore on unmount (edge case, mainly for HMR)
    return () => {
      window.fetch = originalFetch;
      isPatched = false;
    };
  }, [pathname]);
}

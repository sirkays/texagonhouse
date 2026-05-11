"use client";

import { createContext, useContext, useCallback, useEffect, useRef, useState, ReactNode } from "react";
import { signOut, useSession } from "next-auth/react";
import { useFetchInterceptor } from "@/hooks/use-fetch-interceptor";

// ── Context ──
type SessionGuardContextType = {
  /** Wraps fetch() — if the response is 401, triggers logout automatically */
  authFetch: typeof fetch;
};

const SessionGuardContext = createContext<SessionGuardContextType | null>(null);

export function useAuthFetch() {
  const ctx = useContext(SessionGuardContext);
  // Fallback to native fetch if used outside provider (e.g. public pages)
  return ctx?.authFetch ?? fetch;
}

// ── Redirect helper (works anywhere) ──
function redirectToLogin(reason: string) {
  // Prevent multiple redirects
  if (typeof window === "undefined") return;
  if (window.location.pathname === "/login") return;

  const callbackUrl = window.location.pathname + window.location.search;
  const url = `/login?reason=${encodeURIComponent(reason)}&callbackUrl=${encodeURIComponent(callbackUrl)}`;
  window.location.href = url;
}

async function performLogout(reason: string) {
  try {
    await fetch("/api/auth/logout-route", { method: "POST", headers: { "Content-Type": "application/json" } });
  } catch { /* ignore */ }
  await signOut({ redirect: false });
  redirectToLogin(reason);
}

// ── Provider ──
export function SessionGuardProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const isRedirecting = useRef(false);

  // ── 0. Global fetch interceptor (catches 401 from ANY fetch call) ──
  useFetchInterceptor();

  // ── 1. Client-side expiry check (runs every 60s) ──
  useEffect(() => {
    if (status !== "authenticated") return;

    const check = () => {
      const expiresAt = (session?.user as any)?.expiresAt;
      if (expiresAt) {
        const exp = new Date(expiresAt).getTime();
        if (!Number.isNaN(exp) && exp < Date.now() && !isRedirecting.current) {
          isRedirecting.current = true;
          performLogout("expired");
        }
      }
    };

    check(); // immediate
    const interval = setInterval(check, 60_000); // every minute
    return () => clearInterval(interval);
  }, [status, session]);

  // ── 2. Listen for "session expired" events from other tabs ──
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === "session_expired" && e.newValue && !isRedirecting.current) {
        isRedirecting.current = true;
        performLogout("expired");
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  // ── 3. authFetch: wraps fetch() to intercept 401 ──
  const authFetch = useCallback(async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const response = await fetch(input, init);

    if (response.status === 401 && !isRedirecting.current) {
      // Check if this is an API call (not a page navigation)
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
      if (url.startsWith("/api/") || url.includes("/api/")) {
        isRedirecting.current = true;
        // Notify other tabs
        localStorage.setItem("session_expired", Date.now().toString());
        performLogout("revoked");
      }
    }

    return response;
  }, []);

  return (
    <SessionGuardContext.Provider value={{ authFetch }}>
      {children}
    </SessionGuardContext.Provider>
  );
}

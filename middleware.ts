import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const DJANGO_BASE_URL = process.env.BASE_URL;

// how long you’re willing to wait for verify (edge fetch can hang)
const VERIFY_TIMEOUT_MS = 2500;

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/student") ||
    pathname.startsWith("/teacher") ||
    pathname.startsWith("/parent") ||
    pathname.startsWith("/invoice"); // <-- Add this line

  if (!isProtected) return NextResponse.next();

  const token = await getToken({
    req,
    secret: process.env.SECRET_KEY,
  });

  const sessionToken = (token as any)?.sessionToken as string | undefined;

  // Only logout if there is truly no session
  if (!token || !sessionToken) {
    return redirectToLogin(req, "no_session", true);
  }

  // Optional: expiry check first (fast, no network)
  const expiresAt = (token as any).expiresAt as string | undefined;
  if (expiresAt) {
    const exp = new Date(expiresAt).getTime();
    if (!Number.isNaN(exp) && exp < Date.now()) {
      return redirectToLogin(req, "expired", true);
    }
  }

  // Verify with Django: ONLY act on 401. Everything else should NOT log the user out.
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), VERIFY_TIMEOUT_MS);

    const verifyRes = await fetch(`${DJANGO_BASE_URL}/api/auth/session/verify/`, {
      method: "GET",
      headers: {
        "X-Session-Token": sessionToken,
      },
      cache: "no-store",
      signal: controller.signal,
    });

    clearTimeout(t);

    // Only a 401 is proof the session is revoked/invalid
    if (verifyRes.status === 401) {
      return redirectToLogin(req, "revoked", true);
    }

    // For 5xx/4xx (except 401): treat as “backend issue” not “logout”
    // Fail-open: allow request to proceed
    return NextResponse.next();
  } catch {
    // Network/timeout/DNS: do NOT log out
    // Fail-open: allow request to proceed
    return NextResponse.next();
  }
}

function redirectToLogin(req: NextRequest, reason: string, clearCookies: boolean) {
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("reason", reason);

  const res = NextResponse.redirect(url);

  // Clear cookies ONLY when you truly want to end the session
  if (clearCookies) {
    const names = [
      "next-auth.session-token",
      "__Secure-next-auth.session-token",
      "next-auth.csrf-token",
      "__Host-next-auth.csrf-token",
      "next-auth.callback-url",
    ];
    for (const name of names) {
      res.cookies.set(name, "", { maxAge: 0, path: "/" });
    }
  }

  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/student/:path*", "/teacher/:path*", "/parent/:path*", "/invoice/:path*"],
};

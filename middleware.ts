import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const DJANGO_BASE_URL = "http://127.0.0.1:9098"
//const DJANGO_BASE_URL = "https://texagonbackend.onrender.com";

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/student") ||
    pathname.startsWith("/teacher") ||
    pathname.startsWith("/parent");

  if (!isProtected) return NextResponse.next();

  const token = await getToken({
    req,
    secret: "aVeryStrongSecretKeyAtLeast32Chars", // you’ll env this later
  });

  const sessionToken = (token as any)?.sessionToken as string | undefined;
  if (!token || !sessionToken) {
    return redirectToLogin(req, "no_session");
  }

  // 1) Check Django revocation (THE missing piece)
  try {
    const verifyRes = await fetch(`${DJANGO_BASE_URL}/api/auth/session/verify/`, {
      method: "GET",
      headers: {
        "X-Session-Token": sessionToken,
        // if your verify endpoint also needs API key:
        // Authorization: `Api-Key ${process.env.TEXAGON_API_KEY!}`,
      },
      // avoid caching
      cache: "no-store",
    });

    if (verifyRes.status === 401) {
      return redirectToLogin(req, "revoked");
    }

    // if Django is down, you can either fail-open or fail-closed
    // I'd recommend fail-closed for dashboards:
    if (!verifyRes.ok) {
      return redirectToLogin(req, "verify_failed");
    }
  } catch {
    return redirectToLogin(req, "verify_error");
  }

  // 2) Optional: still keep expiry check as backup
  const expiresAt = (token as any).expiresAt as string | undefined;
  if (expiresAt) {
    const exp = new Date(expiresAt).getTime();
    if (!Number.isNaN(exp) && exp < Date.now()) {
      return redirectToLogin(req, "expired");
    }
  }

  return NextResponse.next();
}

function redirectToLogin(req: NextRequest, reason: string) {
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("reason", reason);

  const res = NextResponse.redirect(url);

  // Optional but helpful: clear NextAuth cookies to stop bounce
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

  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/student/:path*", "/teacher/:path*", "/parent/:path*"],
};

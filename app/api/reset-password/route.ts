// File: app/api/reset-password/route.ts
import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

function safeJsonParse<T = any>(text: string): T | null {
  try {
    return text ? (JSON.parse(text) as T) : null;
  } catch {
    return null;
  }
}

function withTimeout(timeoutMs: number) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  return { signal: controller.signal, clear: () => clearTimeout(id) };
}

function attachSetCookie(res: NextResponse, setCookie?: string) {
  if (setCookie) res.headers.set("set-cookie", setCookie);
  return res;
}

type ResetPasswordRequest = {
  resetToken: string;
  new_password: string;
  re_new_password: string;
  issue_session_hours?: number;
};

type ResetPasswordResponseData = {
  detail?: string;
  sessionToken?: string;
  expiresAt?: string;
  userId?: number;
};

export async function POST(request: Request): Promise<NextResponse> {
  let payload: ResetPasswordRequest;

  try {
    payload = (await request.json()) as ResetPasswordRequest;
  } catch (e: any) {
    return NextResponse.json(
      { message: "Invalid JSON body", details: e?.message || String(e) },
      { status: 400 }
    );
  }

  const { resetToken, new_password, re_new_password, issue_session_hours } = payload;

  if (!resetToken) {
    return NextResponse.json({ message: "Reset token is required" }, { status: 400 });
  }

  if (!new_password || new_password !== re_new_password) {
    return NextResponse.json({ message: "Passwords do not match" }, { status: 400 });
  }

  const body: any = { resetToken, new_password, re_new_password };
  if (issue_session_hours !== undefined) body.issue_session_hours = issue_session_hours;

  const t = withTimeout(15000);

  try {
    const startFetch = await djangoFetch(`/api/auth/reset-password/`, {
      method: "POST",
      signal: t.signal,
      body: JSON.stringify(body),
      // Api-Key handled by proxy.ts
    });

    const data =
      safeJsonParse<ResetPasswordResponseData>(startFetch.text) ??
      ({ detail: startFetch.text ? "Invalid response format" : "Password has been reset successfully." } as ResetPasswordResponseData);

    if (!startFetch.response.ok) {
      console.error("[ResetPasswordRoute] Reset failed:", startFetch.response.status, data);
      const res = NextResponse.json(
        { message: data.detail || "Failed to reset password" },
        { status: 400 }
      );
      return attachSetCookie(res, startFetch.setCookie);
    }

    const res = NextResponse.json(
      {
        message: "Password reset successfully",
        detail: data.detail,
        ...(data.sessionToken && {
          sessionToken: data.sessionToken,
          expiresAt: data.expiresAt,
          userId: data.userId,
        }),
      },
      { status: 200 }
    );

    // Preserve any backend Set-Cookie too (if backend issues it)
    attachSetCookie(res, startFetch.setCookie);

    // Keep your local cookie behavior (only if you really want NextAuth cookie set here)
    if (data.sessionToken) {
      res.cookies.set("next-auth.session-token", data.sessionToken, {
        maxAge: issue_session_hours ? issue_session_hours * 60 * 60 : 24 * 60 * 60,
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "lax",
      });
    }

    return res;
  } catch (error: any) {
    const isTimeout = error?.name === "AbortError";
    console.error("[ResetPasswordRoute] Error:", error);

    return NextResponse.json(
      {
        message: isTimeout ? "Connection timeout" : "Failed to reset password",
        details: error?.message || String(error),
      },
      { status: isTimeout ? 504 : 500 }
    );
  } finally {
    t.clear();
  }
}

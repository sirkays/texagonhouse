import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

function safeJsonParse(text: string) {
  try {
    return text ? JSON.parse(text) : null;
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

// ✅ GET endpoint - fetch children
export async function GET(request: Request) {
  const t = withTimeout(12000);

  try {
    const startFetch = await djangoFetch(`/accounts/api/parent/children/`, {
      method: "GET",
      signal: t.signal,
      // headers/session/cookies handled by proxy.ts
    });

    const data = safeJsonParse(startFetch.text);

    if (!startFetch.response.ok) {
      const res = NextResponse.json(
        { detail: data?.detail || "Failed to fetch children data", raw: startFetch.text },
        { status: startFetch.response.status }
      );
      return attachSetCookie(res, startFetch.setCookie);
    }

    const res = NextResponse.json(data, { status: 200 });
    return attachSetCookie(res, startFetch.setCookie);
  } catch (error: any) {
    const isTimeout = error?.name === "AbortError";
    console.error("[Route] Error fetching children data:", error);

    return NextResponse.json(
      {
        detail: isTimeout ? "Connection timeout" : "Internal server error",
        error: error?.message || String(error),
      },
      { status: isTimeout ? 504 : 500 }
    );
  } finally {
    t.clear();
  }
}

// ✅ POST endpoint - reset password or update child profile
export async function POST(request: Request) {
  const url = new URL(request.url);
  const action = url.pathname.split("/").pop();

  let body: any;
  try {
    body = await request.json();
  } catch (error: any) {
    return NextResponse.json(
      { detail: "Invalid JSON body", error: error?.message || String(error) },
      { status: 400 }
    );
  }

  const t = withTimeout(15000);

  try {
    if (action === "update-profile") {
      const { childId, fullName, dob, gender } = body || {};
      if (!childId) {
        return NextResponse.json(
          { detail: "childId is required." },
          { status: 400 }
        );
      }

      const startFetch = await djangoFetch(`/accounts/api/parent/update-child-profile/`, {
        method: "POST",
        signal: t.signal,
        body: JSON.stringify({
          childId,
          fullName,
          dob,
          gender,
        }),
      });

      const data = safeJsonParse(startFetch.text);

      if (!startFetch.response.ok) {
        const res = NextResponse.json(
          { detail: data?.detail || "Failed to update child profile", raw: startFetch.text },
          { status: startFetch.response.status }
        );
        return attachSetCookie(res, startFetch.setCookie);
      }

      const res = NextResponse.json(data, { status: 200 });
      return attachSetCookie(res, startFetch.setCookie);

    } else {
      // Default to Reset Password behavior
      const { childId, newPassword } = body || {};

      if (!childId || !newPassword) {
        return NextResponse.json(
          { detail: "childId and newPassword are required." },
          { status: 400 }
        );
      }

      if (String(newPassword).length < 8) {
        return NextResponse.json(
          { detail: "Password must be at least 8 characters." },
          { status: 400 }
        );
      }

      const startFetch = await djangoFetch(`/accounts/api/parent/reset-child-password/`, {
        method: "POST",
        signal: t.signal,
        body: JSON.stringify({
          childId,
          newPassword,
        }),
      });

      const data = safeJsonParse(startFetch.text);

      if (!startFetch.response.ok) {
        const res = NextResponse.json(
          { detail: data?.detail || "Failed to reset password", raw: startFetch.text },
          { status: startFetch.response.status }
        );
        return attachSetCookie(res, startFetch.setCookie);
      }

      const res = NextResponse.json(data, { status: 200 });
      return attachSetCookie(res, startFetch.setCookie);
    }
  } catch (error: any) {
    const isTimeout = error?.name === "AbortError";
    console.error(`[Route] Error executing action ${action}:`, error);

    return NextResponse.json(
      {
        detail: isTimeout ? "Connection timeout" : "Internal server error",
        error: error?.message || String(error),
      },
      { status: isTimeout ? 504 : 500 }
    );
  } finally {
    t.clear();
  }
}

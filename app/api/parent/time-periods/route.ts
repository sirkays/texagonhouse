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

export async function GET() {
  const t = withTimeout(12000);

  try {
    const startFetch = await djangoFetch(`/accounts/api/parent/time-periods/`, {
      method: "GET",
      signal: t.signal,
      // headers/session/cookies handled by proxy.ts
    });

    const data = safeJsonParse(startFetch.text);

    // Keep your debug log

    // If backend returned non-JSON but claimed success, treat as bad gateway
    const respCT = startFetch.response.headers.get("content-type") || "";
    const shouldBeJson = respCT.includes("application/json");

    if (shouldBeJson && data === null && startFetch.text) {
      const res = NextResponse.json(
        { detail: "External API returned non-JSON response", raw: startFetch.text.slice(0, 500) },
        { status: 502 }
      );
      return attachSetCookie(res, startFetch.setCookie);
    }

    const res = NextResponse.json(data, { status: startFetch.response.status });
    return attachSetCookie(res, startFetch.setCookie);
  } catch (error: any) {
    const isTimeout = error?.name === "AbortError";
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

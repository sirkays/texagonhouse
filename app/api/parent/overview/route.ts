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

export async function GET(request: Request) {
  const t = withTimeout(12000);

  try {
    const startFetch = await djangoFetch(`/accounts/api/dashboard/parent/overview/`, {
      method: "GET",
      signal: t.signal,
      // headers/session/cookies handled by proxy.ts
    });

    const data = safeJsonParse(startFetch.text);

    if (!startFetch.response.ok) {
      const res = NextResponse.json(
        { error: data?.detail || "Failed to fetch data", raw: startFetch.text },
        { status: startFetch.response.status }
      );
      return attachSetCookie(res, startFetch.setCookie);
    }

    const res = NextResponse.json(data, { status: 200 });
    return attachSetCookie(res, startFetch.setCookie);
  } catch (error: any) {
    const isTimeout = error?.name === "AbortError";
    console.error("[Route] Error fetching data:", error);

    return NextResponse.json(
      {
        error: isTimeout ? "Connection timeout" : "Internal server error",
        details: error?.message || String(error),
      },
      { status: isTimeout ? 504 : 500 }
    );
  } finally {
    t.clear();
  }
}

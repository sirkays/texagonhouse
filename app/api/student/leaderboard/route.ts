import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

function withTimeout(timeoutMs: number) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  return { signal: controller.signal, clear: () => clearTimeout(id) };
}

function safeJsonParse<T = any>(text: string): T | null {
  try {
    if (!text) return null;
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function attachSetCookie(res: NextResponse, setCookie?: string) {
  if (setCookie) res.headers.set("set-cookie", setCookie);
  return res;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const topGlobal = searchParams.get("top_global") || "10";
    const topSchool = searchParams.get("top_school") || "10";
    const topWeekly = searchParams.get("top_weekly") || "10";
    const debug = searchParams.get("debug") || "0";

    let path = `/gamification/api/leaderboard/?top_global=${encodeURIComponent(
      topGlobal
    )}&top_school=${encodeURIComponent(topSchool)}&top_weekly=${encodeURIComponent(
      topWeekly
    )}`;

    if (debug === "1" || debug === "true") path += `&debug=1`;

    const t = withTimeout(80000);

    try {
      const { response, text, setCookie } = await djangoFetch(path, {
        method: "GET",
        signal: t.signal,
      });

      if (!response.ok) {
        const parsed = safeJsonParse<any>(text);

        const res = NextResponse.json(
          {
            error: "Failed to fetch leaderboard",
            details: parsed?.detail || parsed?.error || (text || "").slice(0, 300),
          },
          { status: response.status }
        );
        return attachSetCookie(res, setCookie);
      }

      const data = safeJsonParse<any>(text);
      if (data === null) {
        const res = NextResponse.json(
          { error: "Invalid response format", raw: (text || "").slice(0, 300) },
          { status: 502 }
        );
        return attachSetCookie(res, setCookie);
      }

      const res = NextResponse.json(data, { status: 200 });
      return attachSetCookie(res, setCookie);
    } finally {
      t.clear();
    }
  } catch (error: any) {
    const isTimeout = error?.name === "AbortError";
    console.error("[Route] Error fetching leaderboard:", error?.message || String(error));
    return NextResponse.json(
      {
        error: isTimeout ? "Connection timeout" : "Internal server error",
        details: error?.message || String(error),
      },
      { status: isTimeout ? 504 : 500 }
    );
  }
}

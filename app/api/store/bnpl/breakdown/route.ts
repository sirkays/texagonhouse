// app/api/store/bnpl/breakdown/route.ts
import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetch } from "@/app/api/_lib/proxy";

function safeJsonParse<T = unknown>(text: string): T | null {
  try {
    if (!text) return null;
    return JSON.parse(text) as T;
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

export async function POST(req: Request) {
  noStore();

  // accept empty/invalid json body gracefully
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const t = withTimeout(15000);

  try {
    const startFetch = await djangoFetch(`/store/api/bnpl/breakdown/`, {
      method: "POST",
      signal: t.signal,
      body: JSON.stringify(body),
    });

    // ---- Error responses ----
    if (!startFetch.response.ok) {
      if (startFetch.response.status === 401) {
        const res = NextResponse.json(
          { error: "Session expired", redirect: "/login" },
          { status: 401 }
        );
        return attachSetCookie(res, startFetch.setCookie);
      }

      if (startFetch.response.status === 403) {
        const res = NextResponse.json({ error: "Forbidden" }, { status: 403 });
        return attachSetCookie(res, startFetch.setCookie);
      }

      // try to extract backend message (if JSON), else use raw text
      const parsed = safeJsonParse<any>(startFetch.text);
      const msg =
        parsed?.detail ||
        parsed?.error ||
        (startFetch.text ? startFetch.text : "Failed to fetch BNPL breakdown");

      const res = NextResponse.json(
        { error: msg, raw: startFetch.text },
        { status: startFetch.response.status }
      );
      return attachSetCookie(res, startFetch.setCookie);
    }

    // ---- Success response ----
    const data = safeJsonParse<any>(startFetch.text);
    if (data === null) {
      const res = NextResponse.json(
        {
          error: "Invalid response format",
          raw: (startFetch.text || "").slice(0, 300),
        },
        { status: 502 }
      );
      return attachSetCookie(res, startFetch.setCookie);
    }

    const res = NextResponse.json(data, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
    return attachSetCookie(res, startFetch.setCookie);
  } catch (error: any) {
    const isTimeout = error?.name === "AbortError";
    return NextResponse.json(
      {
        error: isTimeout ? "Connection timeout" : "Failed to fetch BNPL breakdown",
        details: error?.message || String(error),
      },
      { status: isTimeout ? 504 : 500 }
    );
  } finally {
    t.clear();
  }
}

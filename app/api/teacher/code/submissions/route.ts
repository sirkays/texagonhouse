// app/code-ide/api/teacher/submissions/route.ts
import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

function safeJsonParse<T = unknown>(text: string): T | null {
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

function withTimeout(timeoutMs: number) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  return { signal: controller.signal, clear: () => clearTimeout(id) };
}

async function djangoFetchWithRetry(
  pathWithQuery: string,
  init: RequestInit,
  retries = 5,
  delayMs = 2000,
  timeoutMs = 20000
) {
  let lastErr: any = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const t = withTimeout(timeoutMs);

    try {
      const res = await djangoFetch(pathWithQuery, {
        ...init,
        signal: t.signal,
      });
      t.clear();

      // Retry only on 5xx (cold starts / transient backend errors)
      if (res.response.status >= 500 && res.response.status <= 599 && attempt < retries) {
        await new Promise((r) => setTimeout(r, delayMs));
        continue;
      }

      return res;
    } catch (err: any) {
      t.clear();
      lastErr = err;

      // AbortError / network errors -> retry (unless last attempt)
      if (attempt >= retries) throw err;
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  // should never hit
  throw lastErr || new Error("Retry loop exited unexpectedly");
}

export async function GET(request: Request) {
  try {
    // Forward query params
    const { searchParams } = new URL(request.url);
    const qs = searchParams.toString();
    const path = `/code-ide/api/teacher/submissions/${qs ? `?${qs}` : ""}`;

    const startFetch = await djangoFetchWithRetry(
      path,
      {
        method: "GET",
        headers: {
          // ensure JSON response expectations
          "Content-Type": "application/json",
        },
      },
      5,
      2000,
      20000
    );

    const raw = startFetch.text || "";
    const data = safeJsonParse<any>(raw);

    if (!startFetch.response.ok) {
      const msg = data?.detail || data?.error || "Failed to fetch data";
      const res = NextResponse.json(
        { error: msg, raw },
        { status: startFetch.response.status }
      );
      return attachSetCookie(res, startFetch.setCookie);
    }

    if (data === null) {
      const res = NextResponse.json(
        { error: "External API returned non-JSON response", raw: raw.slice(0, 500) },
        { status: 502 }
      );
      return attachSetCookie(res, startFetch.setCookie);
    }

    const res = NextResponse.json(data, { status: 200 });
    return attachSetCookie(res, startFetch.setCookie);
  } catch (error: any) {
    const isTimeout = error?.name === "AbortError";
    console.error("[TeacherSubmissionsRoute] Error fetching data:", error);

    return NextResponse.json(
      {
        error: isTimeout ? "Connection timeout" : "Internal server error",
        details: error?.message || String(error),
      },
      { status: isTimeout ? 504 : 500 }
    );
  }
}

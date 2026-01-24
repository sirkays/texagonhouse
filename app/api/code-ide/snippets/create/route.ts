// app/api/code-ide/snippets/create/route.ts
import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

function withTimeout(timeoutMs: number) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  return {
    signal: controller.signal,
    clear: () => clearTimeout(id),
  };
}

function attachSetCookie(res: NextResponse, setCookie?: string) {
  if (setCookie) res.headers.set("set-cookie", setCookie);
  return res;
}

export async function POST(request: Request) {
  console.groupCollapsed("[Route: /api/code-ide/snippets/create] POST - Create snippet");

  let body: any;
  try {
    body = await request.json();
    console.info("[Route] Request body:", body);
  } catch (err: any) {
    console.error("[Route] Invalid JSON body:", err?.message || String(err));
    console.groupEnd();
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const t = withTimeout(8000);

  try {
    const startFetch = await djangoFetch(`/code-ide/api/ide/snippets/create/`, {
      method: "POST",
      signal: t.signal,
      body: JSON.stringify(body),
      // headers/session/cookies handled by proxy.ts
    });

    console.info("[Route] External API response status:", startFetch.response.status);

    // Backend might not always return JSON, so parse safely
    let result: any = null;
    try {
      result = startFetch.text ? JSON.parse(startFetch.text) : null;
    } catch {
      result = { detail: startFetch.text };
    }

    console.info("[Route] External API result:", result);

    if (!startFetch.response.ok) {
      console.error("[Route] Failed to create snippet:", result);
      console.groupEnd();
      const res = NextResponse.json(result, { status: startFetch.response.status });
      return attachSetCookie(res, startFetch.setCookie);
    }

    console.groupEnd();
    const res = NextResponse.json(result, { status: 201 });
    return attachSetCookie(res, startFetch.setCookie);
  } catch (error: any) {
    const isTimeout = error?.name === "AbortError";
    console.error("[Route] Internal server error:", error?.message || String(error));
    console.groupEnd();

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

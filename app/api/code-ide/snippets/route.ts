// app/api/ide/snippets/route.ts
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lesson = searchParams.get("lesson");

  const path =
    `/code-ide/api/ide/snippets/` + (lesson ? `?lesson=${encodeURIComponent(lesson)}` : "");

  const t = withTimeout(8000);
  try {
    const startFetch = await djangoFetch(path, {
      method: "GET",
      signal: t.signal,
      // headers/session/cookies handled by proxy.ts
    });

    if (!startFetch.response.ok) {
      console.error("[Route] External API error response (GET):", startFetch.text);
      const res = NextResponse.json(
        { error: `Failed to fetch data: ${startFetch.text}` },
        { status: startFetch.response.status }
      );
      return attachSetCookie(res, startFetch.setCookie);
    }

    const data = startFetch.text ? JSON.parse(startFetch.text) : null;
    const res = NextResponse.json(data, { status: 200 });
    return attachSetCookie(res, startFetch.setCookie);
  } catch (err: any) {
    // AbortController timeout lands here too
    const isTimeout = err?.name === "AbortError";
    const res = NextResponse.json(
      {
        error: isTimeout ? "Connection timeout" : "Internal server error",
        details: err?.message || String(err),
      },
      { status: isTimeout ? 504 : 500 }
    );
    return res;
  } finally {
    t.clear();
  }
}

export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch (err: any) {
    return NextResponse.json(
      { error: "Invalid request body", details: err?.message || String(err) },
      { status: 400 }
    );
  }

  const t = withTimeout(20000);
  try {
    const startFetch = await djangoFetch(`/code-ide/api/ide/snippets/create/`, {
      method: "POST",
      signal: t.signal,
      body: JSON.stringify(body),
    });

    if (!startFetch.response.ok) {
      console.error("[Route] External API error response (POST):", startFetch.text);
      const res = NextResponse.json(
        { error: `Failed to create snippet: ${startFetch.text}` },
        { status: startFetch.response.status }
      );
      return attachSetCookie(res, startFetch.setCookie);
    }

    const data = startFetch.text ? JSON.parse(startFetch.text) : null;
    const res = NextResponse.json(data, { status: 201 });
    return attachSetCookie(res, startFetch.setCookie);
  } catch (err: any) {
    const isTimeout = err?.name === "AbortError";
    return NextResponse.json(
      {
        error: isTimeout ? "Connection timeout" : "Internal server error",
        details: err?.message || String(err),
      },
      { status: isTimeout ? 504 : 500 }
    );
  } finally {
    t.clear();
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  // Next.js 15+ can pass params as a Promise
  const { id } = await params;

  const t = withTimeout(12000);
  try {
    const startFetch = await djangoFetch(`/code-ide/api/ide/snippets/${id}/delete/`, {
      method: "DELETE",
      signal: t.signal,
      // body not needed
    });

    if (startFetch.response.status === 204) {
      // No content success
      const res = new NextResponse(null, { status: 204 });
      return attachSetCookie(res, startFetch.setCookie);
    }

    if (!startFetch.response.ok) {
      const res = NextResponse.json(
        { error: `Delete failed: ${startFetch.text}` },
        { status: startFetch.response.status }
      );
      return attachSetCookie(res, startFetch.setCookie);
    }

    const res = new NextResponse(null, { status: 204 });
    return attachSetCookie(res, startFetch.setCookie);
  } catch (err: any) {
    const isTimeout = err?.name === "AbortError";
    return NextResponse.json(
      { error: isTimeout ? "Connection timeout" : "Internal server error", details: err?.message || String(err) },
      { status: isTimeout ? 504 : 500 }
    );
  } finally {
    t.clear();
  }
}

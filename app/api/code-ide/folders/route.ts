// app/api/code-ide/folders/route.ts
//
// Proxy for /code-ide/api/ide/folders/{,create/,<id>/,<id>/delete/}
// Mirrors the conventions used in the existing snippets route.ts.

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

// GET /api/code-ide/folders[?parent=<id|null>]
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parent = searchParams.get("parent");

  const path =
    `/code-ide/api/ide/folders/` +
    (parent !== null ? `?parent=${encodeURIComponent(parent)}` : "");

  const t = withTimeout(8000);
  try {
    const r = await djangoFetch(path, { method: "GET", signal: t.signal });
    if (!r.response.ok) {
      const res = NextResponse.json(
        { error: `Failed to fetch folders: ${r.text}` },
        { status: r.response.status }
      );
      return attachSetCookie(res, r.setCookie);
    }
    const data = r.text ? JSON.parse(r.text) : [];
    return attachSetCookie(NextResponse.json(data, { status: 200 }), r.setCookie);
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

// POST /api/code-ide/folders   { name, parent? }
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

  const t = withTimeout(12000);
  try {
    const r = await djangoFetch(`/code-ide/api/ide/folders/create/`, {
      method: "POST",
      signal: t.signal,
      body: JSON.stringify(body),
    });
    if (!r.response.ok) {
      const res = NextResponse.json(
        { error: `Failed to create folder: ${r.text}` },
        { status: r.response.status }
      );
      return attachSetCookie(res, r.setCookie);
    }
    const data = r.text ? JSON.parse(r.text) : null;
    return attachSetCookie(NextResponse.json(data, { status: 201 }), r.setCookie);
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
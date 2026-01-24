// app/api/ide/submissions/[id]/comments/route.ts
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

export async function POST(
  request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: any;
  try {
    body = await request.json();
  } catch (err: any) {
    console.error("[Route] Error parsing request body:", err?.message || String(err));
    return NextResponse.json(
      { error: "Invalid request body", details: err?.message || String(err) },
      { status: 400 }
    );
  }

  if (!body?.message) {
    console.error("[Route] Missing required field: message");
    return NextResponse.json({ error: "Missing message" }, { status: 400 });
  }

  const t = withTimeout(20000);
  try {
    // backend: /code-ide/api/ide/submissions/{id}/comments/
    const startFetch = await djangoFetch(`/code-ide/api/ide/submissions/${id}/comments/`, {
      method: "POST",
      signal: t.signal,
      body: JSON.stringify(body),
    });

    if (!startFetch.response.ok) {
      console.error("[Route] External API error response (POST):", startFetch.text);
      const res = NextResponse.json(
        { error: `Failed to add comment: ${startFetch.text}` },
        { status: startFetch.response.status }
      );
      return attachSetCookie(res, startFetch.setCookie);
    }

    const data = startFetch.text ? JSON.parse(startFetch.text) : null;
    const res = NextResponse.json(data, { status: 201 });
    return attachSetCookie(res, startFetch.setCookie);
  } catch (err: any) {
    const isTimeout = err?.name === "AbortError";
    console.error("[Route] Error adding comment:", err?.message || String(err));

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

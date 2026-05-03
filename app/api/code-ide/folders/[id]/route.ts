// app/api/code-ide/folders/[id]/route.ts
//
// PATCH = rename / move folder
// DELETE = delete folder (supports ?force=1)
//
// Path conventions match the rest of the IDE proxy: PATCH targets
// /code-ide/api/ide/folders/<id>/, DELETE targets the explicit
// /code-ide/api/ide/folders/<id>/delete/ Django route.

import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

function withTimeout(ms: number) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  return { signal: ctrl.signal, clear: () => clearTimeout(id) };
}

function attachSetCookie(res: NextResponse, setCookie?: string) {
  if (setCookie) res.headers.set("set-cookie", setCookie);
  return res;
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: any;
  try {
    body = await request.json();
  } catch (err: any) {
    return NextResponse.json(
      { error: "Invalid request body", details: err?.message || String(err) },
      { status: 400 }
    );
  }

  const t = withTimeout(10000);
  try {
    const r = await djangoFetch(`/code-ide/api/ide/folders/${id}/`, {
      method: "PATCH",
      signal: t.signal,
      body: JSON.stringify(body),
    });
    if (!r.response.ok) {
      const res = NextResponse.json(
        { error: `Folder update failed: ${r.text}` },
        { status: r.response.status }
      );
      return attachSetCookie(res, r.setCookie);
    }
    const data = r.text ? JSON.parse(r.text) : null;
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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const force = searchParams.get("force");

  // Forward the ?force=1 flag so the backend recurses into contents.
  const path =
    `/code-ide/api/ide/folders/${id}/delete/` +
    (force ? `?force=${encodeURIComponent(force)}` : "");

  const t = withTimeout(15000);
  try {
    const r = await djangoFetch(path, { method: "DELETE", signal: t.signal });
    if (r.response.status === 204) {
      const res = new NextResponse(null, { status: 204 });
      return attachSetCookie(res, r.setCookie);
    }
    if (!r.response.ok) {
      const res = NextResponse.json(
        { error: `Folder delete failed: ${r.text}` },
        { status: r.response.status }
      );
      return attachSetCookie(res, r.setCookie);
    }
    return attachSetCookie(new NextResponse(null, { status: 204 }), r.setCookie);
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
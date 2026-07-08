// app/api/opw/works/[id]/route.ts
import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetch } from "@/app/api/_lib/proxy";

function safeJson(text: string) {
  try { return JSON.parse(text); } catch { return null; }
}

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  noStore();
  const { id } = await params;
  try {
    const { response, text, setCookie } = await djangoFetch(`/opw/api/works/${id}/`, { method: "GET" });
    if (!response.ok) {
      return NextResponse.json({ error: safeJson(text)?.detail || text }, { status: response.status });
    }
    const res = NextResponse.json(safeJson(text), { status: 200 });
    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  } catch (error: any) {
    return NextResponse.json({ error: String(error?.message ?? error) }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: Params) {
  noStore();
  const { id } = await params;
  try {
    const body = await req.json();
    const { response, text, setCookie } = await djangoFetch(`/opw/api/works/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      return NextResponse.json({ error: safeJson(text)?.detail || text }, { status: response.status });
    }
    const res = NextResponse.json(safeJson(text), { status: 200 });
    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  } catch (error: any) {
    return NextResponse.json({ error: String(error?.message ?? error) }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  noStore();
  const { id } = await params;
  try {
    const { response, setCookie } = await djangoFetch(`/opw/api/works/${id}/`, { method: "DELETE" });
    if (!response.ok) {
      return NextResponse.json({ error: "Delete failed" }, { status: response.status });
    }
    const res = new NextResponse(null, { status: 204 });
    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  } catch (error: any) {
    return NextResponse.json({ error: String(error?.message ?? error) }, { status: 500 });
  }
}

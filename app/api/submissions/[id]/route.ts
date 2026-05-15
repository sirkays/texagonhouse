// app/api/submissions/[id]/route.ts
import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetch } from "@/app/api/_lib/proxy";

function safeJson(text: string) {
  try { return JSON.parse(text); } catch { return null; }
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  noStore();
  try {
    const { response, text, setCookie } = await djangoFetch(`/api/submissions/${params.id}/`, { method: "GET" });
    if (!response.ok) return NextResponse.json({ error: safeJson(text)?.detail || text }, { status: response.status });
    const res = NextResponse.json(safeJson(text), { status: 200 });
    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  noStore();
  try {
    const body = await req.json();
    const { response, text, setCookie } = await djangoFetch(`/api/submissions/${params.id}/`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    if (!response.ok) return NextResponse.json({ error: safeJson(text)?.detail || text }, { status: response.status });
    const res = NextResponse.json(safeJson(text), { status: response.status });
    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  noStore();
  try {
    const body = await req.json();
    const { response, text, setCookie } = await djangoFetch(`/api/submissions/${params.id}/`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    if (!response.ok) return NextResponse.json({ error: safeJson(text)?.detail || text }, { status: response.status });
    const res = NextResponse.json(safeJson(text), { status: response.status });
    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 });
  }
}

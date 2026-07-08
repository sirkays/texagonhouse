// app/api/opw/works/route.ts
import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetch } from "@/app/api/_lib/proxy";

function safeJson(text: string) {
  try { return JSON.parse(text); } catch { return null; }
}

export async function GET(req: Request) {
  noStore();
  try {
    const { searchParams } = new URL(req.url);
    const qs = searchParams.toString();
    const { response, text, setCookie } = await djangoFetch(
      `/opw/api/works/${qs ? `?${qs}` : ""}`,
      { method: "GET" }
    );
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch OPW list", detail: safeJson(text)?.detail || text },
        { status: response.status }
      );
    }
    const res = NextResponse.json(safeJson(text), { status: 200 });
    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  } catch (error: any) {
    return NextResponse.json({ error: String(error?.message ?? error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  noStore();
  try {
    const body = await req.json();
    const { response, text, setCookie } = await djangoFetch(`/opw/api/works/`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to create OPW", detail: safeJson(text)?.detail || text },
        { status: response.status }
      );
    }
    const res = NextResponse.json(safeJson(text), { status: response.status });
    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  } catch (error: any) {
    return NextResponse.json({ error: String(error?.message ?? error) }, { status: 500 });
  }
}

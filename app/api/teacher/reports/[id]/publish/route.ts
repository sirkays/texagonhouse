import { NextResponse, NextRequest } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const { response, text, setCookie } = await djangoFetch(`/academics/api/reports/${id}/publish/`, { method: "POST" });
    let data: any = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
    const res = NextResponse.json(response.ok ? data : { error: data?.error ?? "Failed", details: data }, { status: response.status });
    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

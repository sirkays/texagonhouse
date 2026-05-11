import { NextResponse, NextRequest } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function GET() {
  try {
    const { response, text, setCookie } = await djangoFetch("/academics/api/reports/", { method: "GET" });
    let data: any = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
    const res = NextResponse.json(response.ok ? data : { error: data?.error ?? "Failed", details: data }, { status: response.status });
    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  } catch (error) {
    console.error("[teacher/reports] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { response, text, setCookie } = await djangoFetch("/academics/api/reports/create/", {
      method: "POST",
      body: JSON.stringify(body),
    });
    let data: any = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
    const res = NextResponse.json(response.ok ? data : { error: data?.error ?? "Failed", details: data }, { status: response.status });
    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  } catch (error) {
    console.error("[teacher/reports/create] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

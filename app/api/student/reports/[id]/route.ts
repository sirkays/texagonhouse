import { NextResponse, NextRequest } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const studentId = request.nextUrl.searchParams.get("student_id") || "";
    const qs = studentId ? `?student_id=${studentId}` : "";
    const { response, text, setCookie } = await djangoFetch(`/academics/api/my-reports/${id}/${qs}`, { method: "GET" });
    let data: any = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
    const res = NextResponse.json(response.ok ? data : { error: data?.error ?? "Failed", details: data }, { status: response.status });
    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextResponse, NextRequest } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function GET(request: NextRequest) {
  try {
    const courseId = request.nextUrl.searchParams.get("course_id") || "";
    const { response, text, setCookie } = await djangoFetch(`/academics/api/reports/student-data/?course_id=${courseId}`, { method: "GET" });
    let data: any = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
    const res = NextResponse.json(response.ok ? data : { error: data?.error ?? "Failed", details: data }, { status: response.status });
    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

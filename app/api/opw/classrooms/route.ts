// app/api/opw/classrooms/route.ts
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
    const courseId = searchParams.get("course_id") || "";
    const { response, text, setCookie } = await djangoFetch(
      `/opw/api/classrooms/?course_id=${courseId}`,
      { method: "GET" }
    );
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

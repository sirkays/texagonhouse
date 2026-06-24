// app/api/submissions/by-assignment/[id]/route.ts
import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetch } from "@/app/api/_lib/proxy";

function safeJson(text: string) {
  try { return JSON.parse(text); } catch { return null; }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  noStore();
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") || "1";
    const page_size = searchParams.get("page_size") || "10";
    const classroom = searchParams.get("classroom") || "";

    let djangoPath = `/api/submissions/?assignment=${id}&page=${page}&page_size=${page_size}`;
    if (classroom) {
      djangoPath += `&classroom=${encodeURIComponent(classroom)}`;
    }

    const { response, text, setCookie } = await djangoFetch(
      djangoPath,
      { method: "GET" }
    );
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch submissions", detail: safeJson(text)?.detail || text },
        { status: response.status }
      );
    }
    const data = safeJson(text);
    const res = NextResponse.json(data, { status: 200 });
    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch submissions", detail: String(error?.message ?? error) },
      { status: 500 }
    );
  }
}

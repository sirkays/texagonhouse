// app/api/student/lesson-media-url/[lessonId]/route.ts
import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

function attachSetCookie(res: NextResponse, setCookie?: string) {
  if (setCookie) res.headers.set("set-cookie", setCookie);
  return res;
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await ctx.params;

  if (!lessonId || Number.isNaN(Number(lessonId))) {
    return NextResponse.json({ detail: "Invalid lessonId" }, { status: 400 });
  }

  // Django endpoint: learning/api/lesson-media-url/<int:lesson_id>/
  const path = `/learning/api/lesson-media-url/${lessonId}/`;

  try {
    const dj = await djangoFetch(path, { method: "GET" });

    // Django may return JSON. We already got .text
    if (!dj.response.ok) {
      // Try return Django JSON if possible, else fallback to text
      let payload: any = { detail: dj.text || "Upstream error" };
      try {
        payload = JSON.parse(dj.text || "{}");
      } catch {}
      const res = NextResponse.json(payload, { status: dj.response.status });
      return attachSetCookie(res, dj.setCookie);
    }

    // Parse success payload and return to client
    let data: any = {};
    try {
      data = JSON.parse(dj.text || "{}");
    } catch {
      // If Django somehow returns non-JSON, still pass it through
      data = { url: dj.text };
    }

    const res = NextResponse.json(data, { status: 200 });
    return attachSetCookie(res, dj.setCookie);
  } catch (e: any) {
    // Network / timeout / unexpected
    const res = NextResponse.json(
      { detail: e?.message || "Failed to reach backend" },
      { status: 502 }
    );
    return res;
  }
}
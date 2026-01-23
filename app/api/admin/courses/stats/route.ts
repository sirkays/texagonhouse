// app/api/admin/courses/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

function safeJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const qs = searchParams.toString();

    const path = qs
      ? `/orgs/api/admin/courses/stats/?${qs}`
      : `/orgs/api/admin/courses/stats/?org_id=1`;

    const { response, text, setCookie } = await djangoFetch(path, {
      method: "GET",
    });

    const data = safeJson(text);

    const res = NextResponse.json(
      response.ok
        ? (data ?? { raw: text })
        : { error: data?.detail || data || "Failed to fetch course stats" },
      { status: response.status }
    );

    // Forward Django cookies (sessionid, etc.)
    if (setCookie) res.headers.set("set-cookie", setCookie);

    return res;
  } catch (error) {
    console.error("[Courses Stats Route] Error fetching course stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

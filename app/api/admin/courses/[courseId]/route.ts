// app/api/admin/courses/[courseId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

function safeJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;

  try {
    const { searchParams } = new URL(request.url);
    const qs = searchParams.toString();

    const path = qs
      ? `/orgs/api/admin/courses/${courseId}/?${qs}`
      : `/orgs/api/admin/courses/${courseId}/`;

    const { response, text, setCookie } = await djangoFetch(path, {
      method: "GET",
    });

    const data = safeJson(text);

    const res = NextResponse.json(
      response.ok
        ? (data ?? { raw: text })
        : { error: data?.detail || data || "Failed to fetch course" },
      { status: response.status }
    );

    // Forward Django cookies (sessionid, etc.)
    if (setCookie) res.headers.set("set-cookie", setCookie);

    return res;
  } catch (error) {
    console.error("[Courses Route] Error fetching course:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

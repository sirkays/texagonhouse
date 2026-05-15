// texagonui/app/api/admin/courses/[courseId]/enroll-classroom/route.ts
import { NextRequest, NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const body = await request.text();

    const { response, text, setCookie } = await djangoFetch(
      `/orgs/api/admin/courses/${params.courseId}/enroll-classroom/`,
      { method: "POST", body }
    );

    const res = new NextResponse(text, { status: response.status });
    if (setCookie) res.headers.set("set-cookie", setCookie);
    res.headers.set(
      "content-type",
      response.headers.get("content-type") || "application/json"
    );
    return res;
  } catch (error) {
    console.error("[Enroll Classroom Route] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// app/api/admin/courses/[courseId]/route.ts (or wherever this PATCH lives)
import { NextRequest, NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

function safeJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;

  try {
    const contentType = request.headers.get("content-type") || "";

    // Build body for upstream (djangoFetch sets JSON Content-Type unless FormData)
    let body: BodyInit;

    if (contentType.includes("multipart/form-data")) {
      body = await request.formData();
    } else {
      const jsonBody = await request.json();
      body = JSON.stringify(jsonBody);
    }

    // Preserve any query params from the incoming request,
    // otherwise default org_id=1 like your original code
    const { searchParams } = new URL(request.url);
    const qs = searchParams.toString();

    const path = qs
      ? `/orgs/api/admin/courses/${courseId}/update/?${qs}`
      : `/orgs/api/admin/courses/${courseId}/update/?org_id=1`;

    const { response, text, setCookie } = await djangoFetch(path, {
      method: "PATCH",
      body,
    });

    const data = safeJson(text);

    const res = NextResponse.json(
      response.ok
        ? (data ?? { raw: text })
        : { error: data?.detail || data || "Failed to update course" },
      { status: response.status }
    );

    // Forward Django cookies back to browser (sessionid, etc.)
    if (setCookie) res.headers.set("set-cookie", setCookie);

    return res;
  } catch (error) {
    console.error("[Courses Route] Error updating course:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

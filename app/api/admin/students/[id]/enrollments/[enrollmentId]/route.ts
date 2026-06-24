// texagonui/app/api/admin/students/[id]/enrollments/[enrollmentId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; enrollmentId: string } }
) {
  try {
    const { response, text, setCookie } = await djangoFetch(
      `/orgs/api/admin/students/${params.id}/enrollments/${params.enrollmentId}/delete/`,
      { method: "DELETE" }
    );
    const res = new NextResponse(text, { status: response.status });
    if (setCookie) res.headers.set("set-cookie", setCookie);
    res.headers.set("content-type", response.headers.get("content-type") || "application/json");
    return res;
  } catch (error) {
    console.error("[De-Enroll Single Route] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

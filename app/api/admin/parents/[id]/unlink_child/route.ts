// app/api/orgs/api/parents/[id]/unlink_child/route.ts
import { NextRequest, NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log(
    "[Route] Received POST request to /api/admin/parents/[id]/unlink_child"
  );

  try {
    const { id } = await params; // ✅ await params
    const body = await request.json();

    if (!body.student_id) {
      return NextResponse.json(
        { error: "student_id is required" },
        { status: 400 }
      );
    }

    const { response, text, setCookie } = await djangoFetch(
      `/orgs/api/parents/${id}/unlink_child/`,
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    );

    let data: any;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { raw: text };
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.detail || "Failed to unlink child" },
        { status: response.status }
      );
    }

    const res = NextResponse.json(data, { status: response.status });
    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  } catch (error) {
    console.error("[Route] Error unlinking child:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// app/api/admin/parents/[id]/set_status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // 👈 params is a Promise
) {
  try {
    const { id } = await params; // 👈 await before reading id
    const body = await request.json();

    if (!body.status) {
      return NextResponse.json({ error: "status is required" }, { status: 400 });
    }

    if (!["active", "inactive", "suspended"].includes(body.status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    const { response, text, setCookie } = await djangoFetch(
      `/orgs/api/parents/${id}/set_status/`,
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
        { error: data?.detail || "Failed to set status" },
        { status: response.status }
      );
    }

    const res = NextResponse.json(data, { status: response.status });
    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  } catch (error) {
    console.error("[Route] Error setting status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

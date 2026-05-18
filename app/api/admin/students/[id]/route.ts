// app/api/students/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

type Ctx = { params: Promise<{ id: string }> | { id: string } };

function parseJsonSafely(text: string) {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

export async function PUT(request: NextRequest, ctx: Ctx) {
  try {
    const { id } = await Promise.resolve(ctx.params);

    if (!id) {
      return NextResponse.json({ detail: "Student ID is required" }, { status: 400 });
    }

    const contentType = request.headers.get("content-type") || "";
    const isMultipart = contentType.includes("multipart/form-data");

    let proxyBody: BodyInit;

    if (isMultipart) {
      // Forward raw FormData (includes avatar file if present)
      proxyBody = await request.formData();
    } else {
      let body: unknown;
      try {
        body = await request.json();
      } catch {
        return NextResponse.json({ detail: "Invalid JSON in request body" }, { status: 400 });
      }
      proxyBody = JSON.stringify(body);
    }

    const { response, text, setCookie } = await djangoFetch(
      `/orgs/api/admin/students/${encodeURIComponent(id)}/`,
      {
        method: "PUT",
        body: proxyBody,
      }
    );

    const data = parseJsonSafely(text);

    if (!response.ok) {
      const msg =
        data?.detail || data?.error || data?.message || "Failed to update student";

      const res = NextResponse.json({ detail: msg }, { status: response.status });
      if (setCookie) res.headers.set("set-cookie", setCookie);
      return res;
    }

    const res = NextResponse.json(data, { status: 200 });
    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  } catch (error) {
    console.error("[Student PUT] Error updating student:", error);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, ctx: Ctx) {
  try {
    const { id } = await Promise.resolve(ctx.params);

    if (!id) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 });
    }

    const { response, text, setCookie } = await djangoFetch(
      `/orgs/api/admin/students/${encodeURIComponent(id)}/`,
      { method: "DELETE" }
    );

    if (!response.ok) {
      const data = parseJsonSafely(text);
      const msg =
        data?.detail || data?.error || data?.message || "Failed to delete student";

      const res = NextResponse.json({ error: msg }, { status: response.status });
      if (setCookie) res.headers.set("set-cookie", setCookie);
      return res;
    }

    const res = new NextResponse(null, { status: 204 });
    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  } catch (error) {
    console.error("[Student DELETE] Error deleting student:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

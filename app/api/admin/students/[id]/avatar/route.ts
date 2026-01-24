// app/api/students/[id]/avatar/route.ts
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

export async function POST(request: NextRequest, ctx: Ctx) {
  try {
    const { id } = await Promise.resolve(ctx.params);

    if (!id) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Student ID and image file are required" },
        { status: 400 }
      );
    }

    // Rebuild FormData for forwarding
    const uploadFormData = new FormData();
    uploadFormData.append("image", file);

    const { response, text, setCookie } = await djangoFetch(
      `/orgs/api/admin/students/${encodeURIComponent(id)}/set-avatar/`,
      {
        method: "POST",
        body: uploadFormData,
        // IMPORTANT: do NOT set Content-Type; fetch will set multipart boundary
      }
    );

    const data = parseJsonSafely(text);

    if (!response.ok) {
      const msg =
        data?.detail || data?.error || data?.message || "Failed to upload avatar";

      const res = NextResponse.json({ error: msg }, { status: response.status });
      if (setCookie) res.headers.set("set-cookie", setCookie);
      return res;
    }

    const res = NextResponse.json(data, { status: 200 });
    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  } catch (error) {
    console.error("[Student Avatar POST] Error uploading avatar:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

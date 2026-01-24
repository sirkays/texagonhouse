// app/api/admin/teachers/[id]/avatar/route.ts
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
      return NextResponse.json({ error: "Teacher ID is required" }, { status: 400 });
    }

    const formData = await request.formData();
    const avatarFile = formData.get("avatar") as File | null;

    if (!avatarFile) {
      return NextResponse.json({ error: "Avatar file is required" }, { status: 400 });
    }

    const uploadFormData = new FormData();
    uploadFormData.append("avatar", avatarFile);

    const { response, text, setCookie } = await djangoFetch(
      `/orgs/api/admin/teachers/${encodeURIComponent(id)}/avatar/`,
      {
        method: "POST",
        body: uploadFormData,
        // IMPORTANT: don't set Content-Type for multipart; fetch adds boundary
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
    console.error("[Teacher Avatar POST] Error uploading avatar:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

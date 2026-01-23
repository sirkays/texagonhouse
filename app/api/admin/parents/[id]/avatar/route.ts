// app/api/orgs/api/parents/[id]/avatar/route.ts
import { NextRequest, NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const formData = await request.formData();
    const avatarFile = formData.get("avatar") as File | null;

    if (!avatarFile) {
      return NextResponse.json(
        { error: "Avatar file is required" },
        { status: 400 }
      );
    }

    // Re-create FormData to forward to Django
    const uploadFormData = new FormData();
    uploadFormData.append("avatar", avatarFile);

    const { response, text, setCookie } = await djangoFetch(
      `/orgs/api/parents/${id}/`,
      {
        method: "PATCH",
        body: uploadFormData, // proxy.ts correctly avoids forcing JSON headers
      }
    );

    // Safe JSON parsing
    let data: any;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { raw: text };
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.detail || "Failed to upload avatar" },
        { status: response.status }
      );
    }

    // Forward Django cookies if present
    const res = NextResponse.json(data, { status: response.status });
    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  } catch (error) {
    console.error("[Route] Error uploading avatar:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

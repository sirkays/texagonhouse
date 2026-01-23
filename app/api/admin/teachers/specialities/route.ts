// app/api/admin/teachers/specialties/route.ts
import { NextRequest, NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function GET(_request: NextRequest) {
  try {
    // Your proxy BASE_URL already points to the backend,
    // so we only pass the backend path here.
    const { response, text, setCookie } = await djangoFetch(`/api/subjects/`, {
      method: "GET",
    });

    let data: any;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: (data && data.detail) || "Failed to fetch data" },
        { status: response.status }
      );
    }

    // Map to array of names
    const specialties = Array.isArray(data)
      ? data.map((item: any) => item?.name).filter(Boolean)
      : [];

    const nextRes = NextResponse.json(specialties, { status: 200 });
    if (setCookie) nextRes.headers.set("set-cookie", setCookie);
    return nextRes;
  } catch (error) {
    console.error("[Route] Error fetching specialties:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// app/api/notifications/[id]/read/route.ts
import { NextRequest, NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body.is_read !== "boolean") {
    return NextResponse.json(
      { error: "Body must contain: { is_read: boolean }" },
      { status: 400 }
    );
  }

  try {
    // IMPORTANT:
    // use relative path here; proxy.ts will prefix BASE_URL automatically
    const { response, text, setCookie } = await djangoFetch(
      `/notifications/api/my-notifications/${id}/read/`,
      {
        method: "PATCH",
        body: JSON.stringify({ is_read: body.is_read }),
      }
    );

    // If backend returns JSON, parse it. Otherwise return text.
    const contentType = response.headers.get("content-type") || "";
    const payload =
      contentType.includes("application/json") && text
        ? JSON.parse(text)
        : text;

    // Mirror backend status; also forward any Django cookies back
    const nextRes = NextResponse.json(
      typeof payload === "string" ? { data: payload } : payload,
      { status: response.status }
    );

    if (setCookie) {
      nextRes.headers.set("set-cookie", setCookie);
    }

    // Optional: keep your nicer 401 shape
    if (response.status === 401) {
      return NextResponse.json(
        { error: "Session expired", redirect: "/login" },
        { status: 401 }
      );
    }

    return nextRes;
  } catch (err) {
    console.error("PATCH single notification error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

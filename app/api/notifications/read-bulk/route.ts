// app/api/notifications/read-bulk/route.ts
import { NextRequest, NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function PATCH(req: NextRequest) {
  let body: any;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!Array.isArray(body.ids) || typeof body.is_read !== "boolean") {
    return NextResponse.json(
      { error: "Body must contain: { ids: number[], is_read: boolean }" },
      { status: 400 }
    );
  }

  try {
    // Use proxy.ts
    const { response, text, setCookie } = await djangoFetch(
      "/notifications/api/my-notifications/read-bulk/",
      {
        method: "PATCH",
        body: JSON.stringify(body),
      }
    );

    const contentType = response.headers.get("content-type") || "";
    const payload =
      contentType.includes("application/json") && text
        ? JSON.parse(text)
        : text;

    // Preserve backend status
    const nextRes = NextResponse.json(
      typeof payload === "string" ? { data: payload } : payload,
      { status: response.status }
    );

    // Forward Django cookies if any
    if (setCookie) {
      nextRes.headers.set("set-cookie", setCookie);
    }

    if (response.status === 401) {
      return NextResponse.json(
        { error: "Session expired", redirect: "/login" },
        { status: 401 }
      );
    }

    return nextRes;
  } catch (err) {
    console.error("Bulk PATCH error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

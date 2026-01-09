// texagon_academy\texagonui\app\api\certificate\create\route.ts
import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function POST(request: Request) {
  console.groupCollapsed(
    "[Route: /api/academics/certificate/create] POST - Create certificate"
  );

  let body: any;
  try {
    body = await request.json();
    console.info("[Route] Request body:", body);
  } catch (err: any) {
    console.error("[Route] Invalid JSON body:", err?.message || err);
    console.groupEnd();
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const { response, text, setCookie } = await djangoFetch(
      "/academics/api/certificate/create/",
      {
        method: "POST",
        body: JSON.stringify(body),
        // Content-Type is already set in djangoFetch base headers,
        // but leaving this here is harmless if you prefer:
        // headers: { "Content-Type": "application/json" },
      }
    );

    console.info("[Route] External API response status:", response.status);

    // Parse JSON safely (don’t assume Django always returns JSON)
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { raw: text };
    }

    console.info("[Route] External API result:", data);

    // Error passthrough
    if (!response.ok) {
      console.error("[Route] Failed to create certificate:", data);

      const res = NextResponse.json(data, { status: response.status });
      if (setCookie) res.headers.set("set-cookie", setCookie);

      console.groupEnd();
      return res;
    }

    // Success: Django likely returns 201; we’ll mirror it (fallback to 201)
    const res = NextResponse.json(data, {
      status: response.status || 201,
    });

    if (setCookie) res.headers.set("set-cookie", setCookie);

    console.groupEnd();
    return res;
  } catch (error: any) {
    console.error("[Route] Internal server error:", error?.message || error);
    console.groupEnd();
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}

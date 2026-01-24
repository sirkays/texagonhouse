// app/api/teacher/overview/route.ts
import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function GET() {
  try {
    const { response, text, setCookie } = await djangoFetch(
      "/accounts/api/teacher/overview/",
      { method: "GET" }
    );

    // Try to parse JSON, but don't crash if backend returns non-JSON
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { raw: text };
    }

    const nextRes = NextResponse.json(
      response.ok ? data : { error: data?.error ?? "Failed to fetch data", details: data },
      { status: response.status }
    );

    // Forward Django session cookie back to browser (if present)
    if (setCookie) {
      nextRes.headers.set("set-cookie", setCookie);
    }

    return nextRes;
  } catch (error) {
    console.error("[teacher/overview] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

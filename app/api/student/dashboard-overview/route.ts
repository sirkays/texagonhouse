// app/api/student/dashboard-overview/route.ts
import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function GET() {
  try {
    const { response, text, setCookie } = await djangoFetch(
      "/accounts/api/dashboard/overview/",
      { method: "GET" }
    );

    // If backend sets cookies (like sessionid), forward them to the browser
    const headers = new Headers();
    if (setCookie) headers.set("Set-Cookie", setCookie);

    // Try to return JSON if possible, otherwise return raw text
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = text ? JSON.parse(text) : null;

      if (!response.ok) {
        return NextResponse.json(
          { error: "Failed to fetch data", backend: data },
          { status: response.status, headers }
        );
      }

      return NextResponse.json(data, { status: response.status, headers });
    }

    // Non-JSON fallback
    return new NextResponse(text, { status: response.status, headers });
  } catch (error) {
    console.error("[Route] Error fetching data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

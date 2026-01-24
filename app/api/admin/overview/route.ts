import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

function parseJsonSafely(text: string) {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

export async function GET(_request: Request) {
  try {
    // This endpoint lives under /orgs (matches original BASE_URL=/orgs)
    const { response, text, setCookie } = await djangoFetch(
      "/orgs/api/admin/dashboard/summary/",
      { method: "GET" }
    );

    const data = parseJsonSafely(text);

    if (!response.ok) {
      const msg =
        data?.detail ||
        data?.error ||
        data?.message ||
        "Failed to fetch data";

      const res = NextResponse.json(
        { error: msg },
        { status: response.status }
      );
      if (setCookie) res.headers.set("set-cookie", setCookie);
      return res;
    }

    const res = NextResponse.json(data, { status: 200 });
    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  } catch (error) {
    console.error("[Dashboard Summary] Error fetching data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

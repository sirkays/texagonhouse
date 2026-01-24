import { NextRequest, NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

function parseJsonSafely(text: string) {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const q = searchParams.get("q") ?? "";
  const page = searchParams.get("page") ?? "1";
  const page_size = searchParams.get("page_size") ?? "20";

  const query = new URLSearchParams();
  if (q.trim()) query.set("q", q.trim());
  query.set("page", page);
  query.set("page_size", page_size);

  // NOTE: this endpoint is NOT under /orgs in your original code
  const path = `/api/languages/?${query.toString()}`;

  try {
    const { response, text, setCookie } = await djangoFetch(path, {
      method: "GET",
    });

    const data = parseJsonSafely(text);

    if (!response.ok) {
      const msg = data?.detail || data?.error || data?.message || "Failed to fetch languages";

      const res = NextResponse.json({ error: msg }, { status: response.status });
      if (setCookie) res.headers.set("set-cookie", setCookie);
      return res;
    }

    const res = NextResponse.json(data, { status: 200 });
    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  } catch (error: any) {
    console.error("[Languages Route] Error fetching languages:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

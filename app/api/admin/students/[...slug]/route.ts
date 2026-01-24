// app/api/students/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

type Ctx = { params: Promise<{ slug: string }> | { slug: string } };

function parseJsonSafely(text: string) {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest, ctx: Ctx) {
  try {
    const { slug } = await Promise.resolve(ctx.params);

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();

    // Always include q=slug, plus any extra query params from the request
    const q = `q=${encodeURIComponent(slug)}`;
    const path = queryString
      ? `/orgs/api/admin/students/?${q}&${queryString}`
      : `/orgs/api/admin/students/?${q}`;

    const { response, text, setCookie } = await djangoFetch(path, { method: "GET" });

    const data = parseJsonSafely(text);

    if (!response.ok) {
      const msg =
        data?.detail || data?.error || data?.message || "Failed to fetch data";

      const res = NextResponse.json({ error: msg }, { status: response.status });
      if (setCookie) res.headers.set("set-cookie", setCookie);
      return res;
    }

    const res = NextResponse.json(data, { status: 200 });
    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  } catch (error) {
    console.error("[Students Slug GET] Error fetching data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

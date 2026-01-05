// app/api/store/categories/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetch } from "@/app/api/_lib/proxy";

interface Category {
  id: string;
  name: string;
  slug: string;
  parent: string | null;
}

interface CategoriesResponse {
  results: Category[];
}

export async function GET(req: Request) {
  noStore();

  try {
    const { response, text, setCookie } = await djangoFetch(
      "/store/api/categories",
      { method: "GET" }
    );

    if (!response.ok) {
      let payload: any = { error: "Failed to fetch categories" };

      if (response.status === 401)
        payload = { error: "Session expired", redirect: "/login" };
      else if (response.status === 403)
        payload = { error: "Forbidden" };
      else if (response.status === 404)
        payload = { error: "Categories not found" };

      const err = NextResponse.json(payload, { status: response.status });
      if (setCookie) err.headers.set("set-cookie", setCookie);
      return err;
    }

    let data: CategoriesResponse;
    try {
      data = JSON.parse(text);
    } catch {
      const bad = NextResponse.json(
        { error: "Invalid response format" },
        { status: 500 }
      );
      if (setCookie) bad.headers.set("set-cookie", setCookie);
      return bad;
    }

    const normalizedCategories: Category[] = (data.results || []).map((item) => ({
      id: item.id || "",
      name: item.name || "",
      slug: item.slug || "",
      parent: item.parent || null,
    }));

    const ok = NextResponse.json(
      { results: normalizedCategories },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
    if (setCookie) ok.headers.set("set-cookie", setCookie);
    return ok;
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

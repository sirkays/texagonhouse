// app/api/store/products/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetch } from "@/app/api/_lib/proxy";

interface Product {
  id: string;
  title: string;
  slug: string;
  type: string;
  category: string;
  price: string;
  rating: number;
  rating_count: number;
  image: string | null;
  bnpl_enabled: boolean;
  description: string;
  pay_in_4_amount: string;
}

interface ProductsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: { results: Product[] };
}

export async function GET(req: Request) {
  noStore();

  const { searchParams } = new URL(req.url);
  const params = new URLSearchParams();

  const keys = [
    "page",
    "page_size",
    "q",
    "category",
    "type",
    "sort",
    "min_price",
    "max_price",
  ] as const;

  for (const k of keys) {
    const v = searchParams.get(k);
    if (v) params.append(k, v);
  }

  const queryString = params.toString();
  const path = `/store/api/products/${queryString ? `?${queryString}` : ""}`;

  try {
    const { response, text, setCookie } = await djangoFetch(path, { method: "GET" });

    if (!response.ok) {
      let payload: any = { error: "Failed to fetch products" };

      if (response.status === 401)
        payload = { error: "Session expired", redirect: "/login" };
      else if (response.status === 403)
        payload = { error: "Forbidden" };
      else if (response.status === 404)
        payload = { error: "Products not found" };

      const err = NextResponse.json(payload, { status: response.status });
      if (setCookie) err.headers.set("set-cookie", setCookie);
      return err;
    }

    let data: ProductsResponse;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error("Fetch error for products:", parseError);
      const bad = NextResponse.json(
        { error: "Backend service unavailable" },
        { status: 503 }
      );
      if (setCookie) bad.headers.set("set-cookie", setCookie);
      return bad;
    }

    const normalizedProducts: Product[] = (data?.results?.results || []).map((item: any) => ({
      id: item.id || "",
      title: item.title || "",
      slug: item.slug || "",
      type: item.type || "",
      category: item.category || "",
      price: item.price || "0",
      rating: item.rating || 0,
      rating_count: item.rating_count || 0,
      image: item.image || null,
      bnpl_enabled: item.bnpl_enabled || false,
      description: item.description || "",
      pay_in_4_amount: item.pay_in_4_amount || "",
    }));

    const normalizedData = {
      count: data?.count || 0,
      next: data?.next || null,
      previous: data?.previous || null,
      results: { results: normalizedProducts },
    };

    const ok = NextResponse.json(normalizedData, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
    if (setCookie) ok.headers.set("set-cookie", setCookie);
    return ok;
  } catch {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

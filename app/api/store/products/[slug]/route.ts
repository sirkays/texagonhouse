// app/api/store/products/[slug]/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetch } from "@/app/api/_lib/proxy";

interface ProductImage {
  id: string;
  url: string;
  alt_text: string;
  sort_order: number;
}

interface ProductReview {
  id: string;
  rating: number;
  title: string;
  body: string;
  user_name: string;
  created_at: string;
}

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
  images: ProductImage[];
  reviews: ProductReview[];
  bnpl_enabled: boolean;
  description: string;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  noStore();

  const { slug } = await params;

  try {
    const { response, text, setCookie } = await djangoFetch(
      `/store/api/products/${slug}`,
      { method: "GET" }
    );

    if (!response.ok) {
      let payload: any = { error: "Failed to fetch product" };

      if (response.status === 401)
        payload = { error: "Session expired", redirect: "/login" };
      else if (response.status === 403)
        payload = { error: "Forbidden" };
      else if (response.status === 404)
        payload = { error: "Product not found" };

      const err = NextResponse.json(payload, { status: response.status });
      if (setCookie) err.headers.set("set-cookie", setCookie);
      return err;
    }

    let data: any;
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

    const normalizedProduct: Product = {
      id: data?.id || "",
      title: data?.title || "",
      slug: data?.slug || "",
      type: data?.type || "",
      category: data?.category || "",
      price: data?.price || "0",
      rating: Number(data?.rating || 0),
      rating_count: Number(data?.rating_count || 0),
      image: data?.image || null,
      images: Array.isArray(data?.images) ? data.images : [],
      reviews: Array.isArray(data?.reviews) ? data.reviews : [],
      bnpl_enabled: Boolean(data?.bnpl_enabled),
      description: data?.description || "",
    };

    const ok = NextResponse.json(normalizedProduct, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
    if (setCookie) ok.headers.set("set-cookie", setCookie);
    return ok;
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

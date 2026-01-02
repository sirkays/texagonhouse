// app/api/store/products/[slug]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { unstable_noStore as noStore } from "next/cache";

const BASE_URL = "https://texagonbackend.onrender.com/store/api";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

const headers = (sessionToken: string | undefined) => ({
  Authorization: `Api-Key ${API_KEY}`,
  "Content-Type": "application/json",
  ...(sessionToken && { "X-Session-Token": sessionToken }),
});

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
  { params }: { params: Promise<{ slug: string }> } // ✅ params is async in your Next version
) {
  noStore();

  const { slug } = await params; // ✅ await before using properties
  const fullUrl = `${BASE_URL}/products/${slug}`;

  const session = await getServerSession(authOptions);
  const sessionToken = session?.user?.sessionToken;

  try {
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: headers(sessionToken ?? undefined),
    });

    const rawResponse = await response.text();

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { error: "Session expired", redirect: "/login" },
          { status: 401 }
        );
      }
      if (response.status === 403) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      if (response.status === 404) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
      return NextResponse.json(
        { error: "Failed to fetch product" },
        { status: response.status }
      );
    }

    let data: any;
    try {
      data = JSON.parse(rawResponse);
    } catch {
      return NextResponse.json({ error: "Invalid response format" }, { status: 500 });
    }

    const normalizedProduct: Product = {
      id: data.id || "",
      title: data.title || "",
      slug: data.slug || "",
      type: data.type || "",
      category: data.category || "",
      price: data.price || "0",
      rating: Number(data.rating || 0),
      rating_count: Number(data.rating_count || 0),
      image: data.image || null,
      images: Array.isArray(data.images) ? data.images : [],
      reviews: Array.isArray(data.reviews) ? data.reviews : [],
      bnpl_enabled: Boolean(data.bnpl_enabled),
      description: data.description || "",
    };


    console.log(normalizedProduct, " app llllll .... ")

    return NextResponse.json(normalizedProduct, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

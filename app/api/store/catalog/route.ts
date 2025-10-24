import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://texagonbackend.epichouse.online/store/api";
const API_KEY =
  process.env.API_KEY || "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

export async function GET(request: Request) {
  console.log("[Route] Received GET request to /api/store/catalog");
  const session = await getServerSession(authOptions);
  console.log("[Route] Session data:", {
    sessionToken: session?.user?.sessionToken,
  });

  try {
    const {searchParams} = new URL(request.url);
    const endpoint = searchParams.get("endpoint");

    if (endpoint === "categories") {
      console.log(
        "[Route] Fetching categories from",
        `${BASE_URL}/categories/`
      );
      const res = await fetch(`${BASE_URL}/categories/`, {
        headers: {
          Authorization: `Api-Key ${API_KEY}`,
          "Content-Type": "application/json",
          ...(session?.user?.sessionToken && {
            "X-Session-Token": session.user.sessionToken,
          }),
        },
      });

      console.log("[Route] API response status:", res.status);
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok) {
        console.log("[Route] API fetch failed:", data);
        return NextResponse.json(
          {error: data.detail || "Failed to fetch categories"},
          {status: res.status}
        );
      }

      return NextResponse.json(data);
    }

    if (endpoint === "products") {
      const params = new URLSearchParams();
      searchParams.forEach((value, key) => {
        if (key !== "endpoint") params.append(key, value);
      });

      console.log(
        "[Route] Fetching products from",
        `${BASE_URL}/products/?${params.toString()}`
      );
      const res = await fetch(`${BASE_URL}/products/?${params.toString()}`, {
        headers: {
          Authorization: `Api-Key ${API_KEY}`,
          "Content-Type": "application/json",
          ...(session?.user?.sessionToken && {
            "X-Session-Token": session.user.sessionToken,
          }),
        },
      });

      console.log("[Route] API response status:", res.status);
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok) {
        console.log("[Route] API fetch failed:", data);
        return NextResponse.json(
          {error: data.detail || "Failed to fetch products"},
          {status: res.status}
        );
      }

      return NextResponse.json(data);
    }

    if (endpoint === "product-detail") {
      const slug = searchParams.get("slug");
      console.log(
        "[Route] Fetching product detail from",
        `${BASE_URL}/products/${slug}/`
      );
      const res = await fetch(`${BASE_URL}/products/${slug}/`, {
        headers: {
          Authorization: `Api-Key ${API_KEY}`,
          "Content-Type": "application/json",
          ...(session?.user?.sessionToken && {
            "X-Session-Token": session.user.sessionToken,
          }),
        },
      });

      console.log("[Route] API response status:", res.status);
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok) {
        console.log("[Route] API fetch failed:", data);
        return NextResponse.json(
          {error: data.detail || "Failed to fetch product"},
          {status: res.status}
        );
      }

      return NextResponse.json(data);
    }

    return NextResponse.json({error: "Invalid endpoint"}, {status: 400});
  } catch (error) {
    console.error("[Route] Error:", error);
    return NextResponse.json(
      {error: error instanceof Error ? error.message : "Internal server error"},
      {status: 500}
    );
  }
}

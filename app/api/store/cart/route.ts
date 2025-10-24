import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://texagonbackend.epichouse.online/store/api";
const API_KEY =
  process.env.API_KEY || "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

export async function GET() {
  console.log("[Route] Received GET request to /api/store/cart");
  const session = await getServerSession(authOptions);
  console.log("[Route] Session data:", {
    sessionToken: session?.user?.sessionToken,
  });

  if (!session?.user?.sessionToken) {
    console.log("[Route] No session token found");
    return NextResponse.json({error: "No session token"}, {status: 401});
  }

  try {
    console.log("[Route] Fetching cart from", `${BASE_URL}/cart/`);
    const res = await fetch(`${BASE_URL}/cart/`, {
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "Content-Type": "application/json",
        "X-Session-Token": session.user.sessionToken,
      },
    });

    console.log("[Route] API response status:", res.status);
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};

    if (!res.ok) {
      console.log("[Route] API fetch failed:", data);
      return NextResponse.json(
        {error: data.detail || "Failed to fetch cart"},
        {status: res.status}
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Route] Error:", error);
    return NextResponse.json(
      {error: error instanceof Error ? error.message : "Internal server error"},
      {status: 500}
    );
  }
}

export async function POST(request: Request) {
  console.log("[Route] Received POST request to /api/store/cart");
  const session = await getServerSession(authOptions);
  console.log("[Route] Session data:", {
    sessionToken: session?.user?.sessionToken,
  });

  if (!session?.user?.sessionToken) {
    console.log("[Route] No session token found");
    return NextResponse.json({error: "No session token"}, {status: 401});
  }

  try {
    const body = await request.json();
    const {action} = body;

    if (action === "add") {
      console.log("[Route] Adding item to cart");
      const res = await fetch(`${BASE_URL}/cart/add/`, {
        method: "POST",
        headers: {
          Authorization: `Api-Key ${API_KEY}`,
          "Content-Type": "application/json",
          "X-Session-Token": session.user.sessionToken,
        },
        body: JSON.stringify({
          product_id: body.product_id,
          quantity: body.quantity || 1,
        }),
      });

      console.log("[Route] API response status:", res.status);
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok) {
        console.log("[Route] API fetch failed:", data);
        return NextResponse.json(
          {error: data.detail || "Failed to add item to cart"},
          {status: res.status}
        );
      }

      return NextResponse.json(data, {status: 201});
    }

    if (action === "apply-coupon") {
      console.log("[Route] Applying coupon to cart");
      const res = await fetch(`${BASE_URL}/cart/apply-coupon/`, {
        method: "POST",
        headers: {
          Authorization: `Api-Key ${API_KEY}`,
          "Content-Type": "application/json",
          "X-Session-Token": session.user.sessionToken,
        },
        body: JSON.stringify({code: body.code}),
      });

      console.log("[Route] API response status:", res.status);
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok) {
        console.log("[Route] API fetch failed:", data);
        return NextResponse.json(
          {error: data.detail || "Failed to apply coupon"},
          {status: res.status}
        );
      }

      return NextResponse.json(data);
    }

    return NextResponse.json({error: "Invalid action"}, {status: 400});
  } catch (error) {
    console.error("[Route] Error:", error);
    return NextResponse.json(
      {error: error instanceof Error ? error.message : "Internal server error"},
      {status: 500}
    );
  }
}

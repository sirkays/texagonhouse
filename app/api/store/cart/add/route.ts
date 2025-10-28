import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { unstable_noStore as noStore } from "next/cache";

// const BASE_URL = "https://texagonbackend.epichouse.online/store/api";
const BASE_URL = "http://127.0.0.1:9098/store/api";
const API_KEY = "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

const headers = (sessionToken: string | undefined) => ({
  Authorization: `Api-Key ${API_KEY}`,
  "Content-Type": "application/json",
  ...(sessionToken && { "X-Session-Token": sessionToken }),
});

interface CartItem {
  id: string;
  product_id: string;
  title: string;
  price: string;
  quantity: number;
  line_total: string;
}

interface CartResponse {
  id: string;
  items: CartItem[];
  coupon: string | null;
  subtotal: string;
}

export async function POST(req: Request) {
  noStore();
  const session = await getServerSession(authOptions);

  if (!session?.user?.sessionToken) {
    return NextResponse.json(
      { error: "Not authenticated", redirect: "/login" },
      { status: 401 }
    );
  }

  const sessionToken = session.user.sessionToken;

  let body: { product_id?: string; quantity?: number } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Basic validation (ensure product_id exists)
  if (!body?.product_id) {
    return NextResponse.json(
      { error: "product_id is required" },
      { status: 400 }
    );
  }

  // Default quantity if not sent / invalid
  const quantity =
    typeof body.quantity === "number" && body.quantity > 0
      ? Math.floor(body.quantity)
      : 1;

  const forwardPayload = {
    product_id: body.product_id,
    quantity,
  };

  const fullUrl = `${BASE_URL}/cart/add/`;
  console.log("[StoreCartAddAPI] Initiating POST to:", fullUrl);
  console.log("[StoreCartAddAPI] Received body:", forwardPayload);

  try {
    const response = await fetch(fullUrl, {
      method: "POST",
      headers: headers(sessionToken),
      body: JSON.stringify(forwardPayload),
    });

    console.log("[StoreCartAddAPI] Backend response status:", response.status);

    const rawResponse = await response.text();
    console.log("[StoreCartAddAPI] Backend raw response:", rawResponse);

    if (!response.ok) {
      if (response.status === 401)
        return NextResponse.json(
          { error: "Session expired", redirect: "/login" },
          { status: 401 }
        );
      if (response.status === 403)
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      if (response.status === 404)
        return NextResponse.json({ error: "Not found" }, { status: 404 });

      return NextResponse.json(
        { error: "Failed to add to cart" },
        { status: response.status }
      );
    }

    let data: CartResponse;
    try {
      data = JSON.parse(rawResponse);
    } catch (parseError) {
      console.error("[StoreCartAddAPI] Parse error:", parseError);
      return NextResponse.json(
        { error: "Invalid response format" },
        { status: 500 }
      );
    }

    const normalizedData: CartResponse = {
      id: data.id || "",
      items: (data.items || []).map((item) => ({
        id: item.id || "",
        product_id: item.product_id || "",
        title: item.title || "",
        price: item.price || "0",
        quantity: item.quantity || 0,
        line_total: item.line_total || "0",
      })),
      coupon: data.coupon || null,
      subtotal: data.subtotal || "0",
    };

    return NextResponse.json(normalizedData, {
      status: 201,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("[StoreCartAddAPI] Fetch error:", error);
    return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 });
  }
}

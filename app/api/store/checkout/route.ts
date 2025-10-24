import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://texagonbackend.epichouse.online/store/api";
const API_KEY =
  process.env.API_KEY || "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

export async function POST(request: Request) {
  console.log("[Route] Received POST request to /api/store/checkout");
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
    console.log("[Route] Creating order");
    const res = await fetch(`${BASE_URL}/checkout/create-order/`, {
      method: "POST",
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "Content-Type": "application/json",
        "X-Session-Token": session.user.sessionToken,
      },
      body: JSON.stringify({
        billing_address_id: body.billing_address_id,
        shipping_address_id: body.shipping_address_id,
      }),
    });

    console.log("[Route] API response status:", res.status);
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};

    if (!res.ok) {
      console.log("[Route] API fetch failed:", data);
      return NextResponse.json(
        {error: data.detail || "Failed to create order"},
        {status: res.status}
      );
    }

    return NextResponse.json(data, {status: 201});
  } catch (error) {
    console.error("[Route] Error:", error);
    return NextResponse.json(
      {error: error instanceof Error ? error.message : "Internal server error"},
      {status: 500}
    );
  }
}

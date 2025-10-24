import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://texagonbackend.epichouse.online/store/api";
const API_KEY =
  process.env.API_KEY || "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

export async function POST(request: Request) {
  console.log("[Route] Received POST request to /api/store/payments");
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
    const {action, orderId, paymentId} = body;

    if (action === "start-card-payment") {
      console.log("[Route] Starting card payment for order", orderId);
      const res = await fetch(`${BASE_URL}/payments/card/${orderId}/start/`, {
        method: "POST",
        headers: {
          Authorization: `Api-Key ${API_KEY}`,
          "Content-Type": "application/json",
          "X-Session-Token": session.user.sessionToken,
        },
        body: JSON.stringify({
          provider: body.provider || "stripe",
          currency: body.currency || "NGN",
        }),
      });

      console.log("[Route] API response status:", res.status);
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok) {
        console.log("[Route] API fetch failed:", data);
        return NextResponse.json(
          {error: data.detail || "Failed to start payment"},
          {status: res.status}
        );
      }

      return NextResponse.json(data);
    }

    if (action === "mark-captured") {
      console.log("[Route] Marking payment as captured", paymentId);
      const res = await fetch(
        `${BASE_URL}/payments/${paymentId}/mark-captured/`,
        {
          method: "POST",
          headers: {
            Authorization: `Api-Key ${API_KEY}`,
            "Content-Type": "application/json",
            "X-Session-Token": session.user.sessionToken,
          },
          body: JSON.stringify({provider_ref: body.provider_ref}),
        }
      );

      console.log("[Route] API response status:", res.status);
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok) {
        console.log("[Route] API fetch failed:", data);
        return NextResponse.json(
          {error: data.detail || "Failed to mark payment as captured"},
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

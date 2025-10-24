import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://texagonbackend.epichouse.online/store/api";
const API_KEY =
  process.env.API_KEY || "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

export async function GET(request: Request) {
  console.log("[Route] Received GET request to /api/store/shipments");
  const session = await getServerSession(authOptions);
  console.log("[Route] Session data:", {
    sessionToken: session?.user?.sessionToken,
  });

  try {
    const {searchParams} = new URL(request.url);
    const endpoint = searchParams.get("endpoint");

    if (endpoint === "order-shipments") {
      const orderId = searchParams.get("orderId");
      if (!orderId) {
        return NextResponse.json(
          {error: "Order ID is required"},
          {status: 400}
        );
      }

      console.log("[Route] Fetching shipments for order", orderId);
      const res = await fetch(`${BASE_URL}/orders/${orderId}/shipments/`, {
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
          {error: data.detail || "Failed to fetch shipments"},
          {status: res.status}
        );
      }

      return NextResponse.json(data);
    }

    if (endpoint === "shipment-detail") {
      const shipmentId = searchParams.get("id");
      if (!shipmentId) {
        return NextResponse.json(
          {error: "Shipment ID is required"},
          {status: 400}
        );
      }

      console.log(
        "[Route] Fetching shipment detail from",
        `${BASE_URL}/shipments/${shipmentId}/`
      );
      const res = await fetch(`${BASE_URL}/shipments/${shipmentId}/`, {
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
          {error: data.detail || "Failed to fetch shipment"},
          {status: res.status}
        );
      }

      return NextResponse.json(data);
    }

    if (endpoint === "track") {
      const trackingNumber = searchParams.get("tracking_number");
      const last4 = searchParams.get("last4");
      const params = new URLSearchParams({
        tracking_number: trackingNumber || "",
      });
      if (last4) params.append("last4", last4);

      console.log("[Route] Tracking shipment with number", trackingNumber);
      const res = await fetch(
        `${BASE_URL}/shipments/track/?${params.toString()}`,
        {
          headers: {
            Authorization: `Api-Key ${API_KEY}`,
            "Content-Type": "application/json",
            ...(session?.user?.sessionToken && {
              "X-Session-Token": session.user.sessionToken,
            }),
          },
        }
      );

      console.log("[Route] API response status:", res.status);
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok) {
        console.log("[Route] API fetch failed:", data);
        return NextResponse.json(
          {error: data.detail || "Failed to track shipment"},
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

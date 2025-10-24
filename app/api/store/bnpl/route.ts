import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://texagonbackend.epichouse.online/store/api";
const API_KEY =
  process.env.API_KEY || "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

export async function GET(request: Request) {
  console.log("[Route] Received GET request to /api/store/bnpl");
  const session = await getServerSession(authOptions);
  console.log("[Route] Session data:", {
    sessionToken: session?.user?.sessionToken,
  });

  try {
    const {searchParams} = new URL(request.url);
    const endpoint = searchParams.get("endpoint");

    if (endpoint === "plans") {
      console.log(
        "[Route] Fetching BNPL plans from",
        `${BASE_URL}/bnpl/plans/`
      );
      const res = await fetch(`${BASE_URL}/bnpl/plans/`, {
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
          {error: data.detail || "Failed to fetch BNPL plans"},
          {status: res.status}
        );
      }

      return NextResponse.json(data);
    }

    if (endpoint === "agreement") {
      const agreementId = searchParams.get("id");
      if (!agreementId) {
        return NextResponse.json(
          {error: "Agreement ID is required"},
          {status: 400}
        );
      }

      console.log(
        "[Route] Fetching BNPL agreement from",
        `${BASE_URL}/bnpl/agreements/${agreementId}/`
      );
      const res = await fetch(`${BASE_URL}/bnpl/agreements/${agreementId}/`, {
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
          {error: data.detail || "Failed to fetch BNPL agreement"},
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

export async function POST(request: Request) {
  console.log("[Route] Received POST request to /api/store/bnpl");
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
    const {action, orderId, planId} = body;

    if (action === "start") {
      console.log("[Route] Starting BNPL for order", orderId);
      const res = await fetch(`${BASE_URL}/bnpl/${orderId}/start/`, {
        method: "POST",
        headers: {
          Authorization: `Api-Key ${API_KEY}`,
          "Content-Type": "application/json",
          "X-Session-Token": session.user.sessionToken,
        },
        body: JSON.stringify({plan_id: planId}),
      });

      console.log("[Route] API response status:", res.status);
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok) {
        console.log("[Route] API fetch failed:", data);
        return NextResponse.json(
          {error: data.detail || "Failed to start BNPL"},
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

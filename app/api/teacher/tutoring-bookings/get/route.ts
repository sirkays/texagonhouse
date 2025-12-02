import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

//const BASE_URL = "http://127.0.0.1:9098";
const BASE_URL = "https://texagonbackend.epichouse.online";
const API_KEY = "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";
const ENDPOINT = `${BASE_URL}/api/teacher/tutoring-bookings/`;

export async function GET(request: Request) {
  console.log("[Route] Received GET request to /api/teacher/tutoring-bookings");
  const session = await getServerSession(authOptions);
  console.log("[Route] Session data:", {
    sessionToken: session?.user?.sessionToken,
  });

  if (!session?.user?.sessionToken) {
    console.log("[Route] No session token found");
    return NextResponse.json({ error: "No session token" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const tab = searchParams.get("tab") || "upcoming";
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "3";

  try {
    console.log("[Route] Fetching data from", `${ENDPOINT}?tab=${tab}&page=${page}&limit=${limit}`);
    const res = await fetch(`${ENDPOINT}?tab=${tab}&page=${page}&limit=${limit}`, {
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "Content-Type": "application/json",
        "X-Session-Token": session.user.sessionToken,
      },
    });

    const text = await res.text();
    console.log("[Route] Raw backend response:", text);

    // Check if response is JSON
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error("[Route] Response is not JSON, content-type:", contentType);
      return NextResponse.json(
        { error: `Backend returned non-JSON response (status: ${res.status})` },
        { status: res.status }
      );
    }

    const data = JSON.parse(text);
    console.log("[Route] API response status:", res.status);
    console.log("[Route] API response data:", data);

    if (!res.ok) {
      console.log("[Route] API fetch failed:", data);
      return NextResponse.json(
        { error: data.detail || `Failed to fetch data (status: ${res.status})` },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Route] Error fetching data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

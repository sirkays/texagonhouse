import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const BASE_URL = "https://texagonbackend.epichouse.online/gamification/api/leaderboard";
const API_KEY = "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

async function fetchWithTimeout(url: string, options: any) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

export async function GET(request: Request) {
  console.log("[Route] Received GET request to /api/student/leaderboard");
  const session = await getServerSession(authOptions);

  if (!session?.user?.sessionToken) {
    console.error("[Route] No session token found, session:", session);
    return NextResponse.json({ error: "No session token" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const topGlobal = searchParams.get("top_global") || "10";
    const topSchool = searchParams.get("top_school") || "10";
    const topWeekly = searchParams.get("top_weekly") || "10";
    const debug = searchParams.get("debug") || "0";

    let url = `${BASE_URL}?top_global=${topGlobal}&top_school=${topSchool}&top_weekly=${topWeekly}`;
    if (debug === "1" || debug === "true") {
      url += "&debug=1";
    }
    console.log("[Route] Fetching leaderboard from:", url);

    const res = await fetchWithTimeout(url, {
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "Content-Type": "application/json",
        "X-Session-Token": session.user.sessionToken,
      },
      timeout: 8000,
    });

    console.log("[Route] External API response status:", res.status);
    if (!res.ok) {
      const errorData = await res.json();
      console.error("[Route] External API error response:", errorData);
      return NextResponse.json(
        { error: "Failed to fetch leaderboard", details: errorData.detail || errorData.error },
        { status: res.status }
      );
    }

    const data = await res.json();
    console.log("[Route] External API response data:", data);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("[Route] Error fetching leaderboard:", (error as Error).message);
    return NextResponse.json(
      { error: "Internal server error", details: (error as Error).message },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const BASE_URL = "https://texagonbackend.epichouse.online";
const API_KEY = "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

export async function GET(request) {
  console.log("[Route] Received GET request to /api/student/cbt");
  const session = await getServerSession(authOptions);

  if (!session?.user?.sessionToken) {
    console.error("[Route] No session token found, session:", session);
    return NextResponse.json({ error: "No session token" }, { status: 401 });
  }

  try {
    console.log("[Route] Fetching tests from:", `${BASE_URL}/assessments/api/tests/available/`);
    console.log("[Route] Using sessionToken:", session.user.sessionToken);
    const res = await fetchWithTimeout(`${BASE_URL}/assessments/api/tests/available/`, {
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "Content-Type": "application/json",
        "X-Session-Token": session.user.sessionToken,
      },
      timeout: 5000,
    });

    console.log("[Route] External API response status:", res.status);
    if (!res.ok) {
      const errorText = await res.text();
      console.error("[Route] External API error response:", errorText);
      return NextResponse.json(
        { error: `Failed to fetch data: ${errorText}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    console.log("[Route] External API response data:", data);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("[Route] Error fetching data:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  console.log("[Route] Received POST request to /api/student/cbt");
  const session = await getServerSession(authOptions);
  if (!session?.user?.sessionToken) {
    console.error("[Route] No session token found, session:", session);
    return NextResponse.json({ error: "No session token" }, { status: 401 });
  }

  const maxRetries = 3;
  let attempt = 0;
  let body;
  try {
    body = await request.json();
    console.log("[Route] POST request body:", body);
  } catch (err) {
    console.error("[Route] Error parsing request body:", err);
    return NextResponse.json(
      { error: "Invalid request body", details: err.message },
      { status: 400 }
    );
  }

  while (attempt < maxRetries) {
    try {
      console.log("[Route] Submitting to:", `${BASE_URL}/assessments/api/tests/${body.currentTest}/submit/`);
      const res = await fetchWithTimeout(
        `${BASE_URL}/assessments/api/tests/${body.currentTest}/submit/`,
        {
          method: "POST",
          headers: {
            Authorization: `Api-Key ${API_KEY}`,
            "Content-Type": "application/json",
            "X-Session-Token": session.user.sessionToken,
          },
          body: JSON.stringify(body),
          timeout: 5000,
        }
      );

      console.log("[Route] External API response status:", res.status);
      if (!res.ok) {
        const errorText = await res.text();
        console.error("[Route] External API error response:", errorText);
        return NextResponse.json(
          { error: `Failed to submit test: ${errorText}` },
          { status: res.status }
        );
      }

      const data = await res.json();
      console.log("[Route] External API response data:", data);
      return NextResponse.json(data, { status: 200 });
    } catch (err) {
      console.error("[Route] Error submitting test (attempt", attempt + 1, "):", err);
      attempt++;
      if (attempt === maxRetries) {
        return NextResponse.json(
          { error: "Internal server error", details: err.message },
          { status: 500 }
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
    }
  }
}
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const BASE_URL = "https://texagonbackend.onrender.com";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

async function fetchWithTimeout(url: string, options: any) {
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

export async function POST(request: Request) {
  console.groupCollapsed("[Route: /api/academics/certificate/create] POST - Create certificate");

  const session = await getServerSession(authOptions);
  if (!session?.user?.sessionToken) {
    console.error("[Route] Missing session token. Session:", session);
    console.groupEnd();
    return NextResponse.json({ error: "No session token" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
    console.info("[Route] Request body:", body);
  } catch (err: any) {
    console.error("[Route] Invalid JSON body:", err.message);
    console.groupEnd();
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const res = await fetchWithTimeout(`${BASE_URL}/academics/api/certificate/create/`, {
      method: "POST",
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "X-Session-Token": session.user.sessionToken, // [cite: 6]
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      timeout: 8000,
    });

    console.info("[Route] External API response status:", res.status);
    const result = await res.json();
    console.info("[Route] External API result:", result);

    if (!res.ok) {
      // Possible errors: 400 (Missing fields), 409 (Already exists) [cite: 156, 159]
      console.error("[Route] Failed to create certificate:", result);
      console.groupEnd();
      return NextResponse.json(result, { status: res.status });
    }

    console.groupEnd();
    // Returns 201 on success [cite: 134]
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("[Route] Internal server error:", error.message);
    console.groupEnd();
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 });
  }
}
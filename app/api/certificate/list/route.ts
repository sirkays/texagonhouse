import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Base URL from the PDF [cite: 3] and your snippet
const BASE_URL = "https://texagonbackend.onrender.com";
// Using the API Key from your provided snippet
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

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
  console.groupCollapsed(
    "[Route: /api/academics/certificate/list] GET - Fetch certificates"
  );

  const session = await getServerSession(authOptions);
  if (!session?.user?.sessionToken) {
    console.error("[Route] Missing session token. Session:", session);
    console.groupEnd();
    return NextResponse.json({ error: "No session token" }, { status: 401 });
  }

  try {
    // Extract query parameters from the request URL
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const targetUrl = `${BASE_URL}/academics/api/certificate/list/?${queryString}`;

    console.info("[Route] Forwarding to Backend URL:", targetUrl);

    const res = await fetchWithTimeout(targetUrl, {
      method: "GET",
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "X-Session-Token": session.user.sessionToken,
        "Content-Type": "application/json",
      },
      timeout: 15000,
    });

    console.info("[Route] External API response status:", res.status);
    const result = await res.json();

    // Log the count and simplified results for debugging
    if (result.results) {
      console.info(`[Route] Found ${result.count || 0} certificates`);
    } else {
      console.info("[Route] External API result:", result);
    }

    if (!res.ok) {
      // Read the text body to see the specific error message from the server
      const errorText = await res.text();
      console.error(`[Route] Backend Error (${res.status}):`, errorText);

      return NextResponse.json({ error: errorText }, { status: res.status });
    }

    console.groupEnd();
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("[Route] Internal server error:", error.message);
    console.groupEnd();
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

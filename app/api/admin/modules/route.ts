import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const BASE_URL = "https://texagonbackend.onrender.com/orgs";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

export async function GET(request: Request) {
  console.log("[Admin Modules] Received GET request to /api/admin/modules");

  const session = await getServerSession(authOptions);
  const sessionToken = session?.user?.sessionToken;

  console.log(
    "[Admin Modules] Session token:",
    sessionToken ? "Present" : "Missing"
  );

  if (!sessionToken) {
    console.warn("[Admin Modules] No session token found");
    return NextResponse.json(
      { detail: "Invalid or missing session token." },
      { status: 401 }
    );
  }

  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const queryString = searchParams.toString();

    let endpoint = `${BASE_URL}/api/admin/module/list/`;
    if (queryString) {
      endpoint += `?${queryString}`;
    }

    console.log("[Admin Modules] Fetching from:", endpoint);

    const headers: HeadersInit = {
      Authorization: `Api-Key ${API_KEY}`,
      "Content-Type": "application/json",
    };

    // Add session token as both header options
    headers["X-Session-Key"] = sessionToken;
    headers["Session-Token"] = sessionToken;
    headers["X-Session-Token"] = sessionToken;

    console.log("[Admin Modules] Request headers:", {
      Authorization: `Api-Key ${API_KEY.substring(0, 10)}...`,
      "X-Session-Key": sessionToken.substring(0, 10) + "...",
      "Session-Token": sessionToken.substring(0, 10) + "...",
      "X-Session-Token": sessionToken.substring(0, 10) + "...",
    });

    const res = await fetchWithRetry(endpoint, {
      method: "GET",
      headers: headers,
    });

    console.log("[Admin Modules] Response status:", res.status);
    console.log(
      "[Admin Modules] Response headers:",
      Object.fromEntries(res.headers.entries())
    );

    const text = await res.text();
    console.log(
      "[Admin Modules] Response text:",
      text.substring(0, 500) + "..."
    );

    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error("[Admin Modules] Non-JSON response:", text);
      return NextResponse.json(
        { detail: "Invalid response format from backend" },
        { status: 500 }
      );
    }

    if (!res.ok) {
      console.error("[Admin Modules] Backend error:", data);
      if (res.status === 403) {
        return NextResponse.json(
          { detail: data.detail || "Authentication failed" },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { detail: data.detail || "Failed to fetch modules" },
        { status: res.status }
      );
    }

    console.log("[Admin Modules] Successfully fetched modules");
    return NextResponse.json(data);
  } catch (error) {
    console.error("[Admin Modules] Error fetching modules:", error);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 3,
  timeout = 30000
) {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(id);
      return response;
    } catch (err: any) {
      console.error(
        "[Admin Modules] Fetch attempt",
        i + 1,
        "failed:",
        err.message
      );
      if (i === retries - 1) throw err;
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error("Max retries reached");
}

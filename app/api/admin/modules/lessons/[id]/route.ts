import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

const BASE_URL = "https://texagonbackend.epichouse.online/orgs";
const API_KEY = "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: Request, {params}: RouteParams) {
  // Await the params for Next.js 15
  const {id} = await params;

  console.log(`[Admin Module Lessons] Received GET request for module ${id}`);

  const session = await getServerSession(authOptions);
  const sessionToken = session?.user?.sessionToken;

  console.log(
    "[Admin Module Lessons] Session token:",
    sessionToken ? "Present" : "Missing"
  );

  if (!sessionToken) {
    console.warn("[Admin Module Lessons] No session token found");
    return NextResponse.json(
      {detail: "Invalid or missing session token."},
      {status: 401}
    );
  }

  try {
    // Validate module ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({detail: "Invalid module ID"}, {status: 400});
    }

    const endpoint = `${BASE_URL}/api/admin/module/lessons/${id}/`;
    console.log("[Admin Module Lessons] Fetching from:", endpoint);

    const headers: HeadersInit = {
      Authorization: `Api-Key ${API_KEY}`,
      "Content-Type": "application/json",
    };

    // Add session token as both header options
    headers["X-Session-Key"] = sessionToken;
    headers["Session-Token"] = sessionToken;
    headers["X-Session-Token"] = sessionToken;

    console.log("[Admin Module Lessons] Request headers:", {
      Authorization: `Api-Key ${API_KEY.substring(0, 10)}...`,
      "X-Session-Key": sessionToken.substring(0, 10) + "...",
      "Session-Token": sessionToken.substring(0, 10) + "...",
      "X-Session-Token": sessionToken.substring(0, 10) + "...",
    });

    const res = await fetchWithRetry(endpoint, {
      method: "GET",
      headers: headers,
    });

    console.log("[Admin Module Lessons] Response status:", res.status);

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error("[Admin Module Lessons] Non-JSON response:", text);
      return NextResponse.json(
        {detail: "Invalid response format from backend"},
        {status: 500}
      );
    }

    if (!res.ok) {
      console.error("[Admin Module Lessons] Backend error:", data);
      if (res.status === 403) {
        return NextResponse.json(
          {detail: data.detail || "Authentication failed"},
          {status: 403}
        );
      }
      if (res.status === 404) {
        return NextResponse.json(
          {detail: data.detail || "Module not found"},
          {status: 404}
        );
      }
      return NextResponse.json(
        {detail: data.detail || "Failed to fetch module lessons"},
        {status: res.status}
      );
    }

    console.log("[Admin Module Lessons] Successfully fetched module lessons");
    return NextResponse.json(data);
  } catch (error) {
    console.error(
      "[Admin Module Lessons] Error fetching module lessons:",
      error
    );
    return NextResponse.json({detail: "Internal server error"}, {status: 500});
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
        "[Admin Module Lessons] Fetch attempt",
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

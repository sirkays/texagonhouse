import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

const BASE_URL = "https://texagonbackend.onrender.com";
const API_KEY =
  process.env.TEXAGON_API_KEY || "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const session = await getServerSession(authOptions);

  if (!session?.user?.sessionToken) {
    return NextResponse.json(
      {detail: "Invalid or missing session token."},
      {status: 401}
    );
  }

  const headers = {
    Authorization: `Api-Key ${API_KEY}`,
    "Content-Type": "application/json",
    "X-Session-Token": session.user.sessionToken,
  };

  try {
    let apiUrl: string;
    switch (url.pathname) {
      case "/api/parent/children-progress":
        const childId = url.searchParams.get("child_id") || "all";
        const timePeriod = url.searchParams.get("time_period") || "week";
        apiUrl = `${BASE_URL}/accounts/api/parent/children-progress/?child_id=${childId}&time_period=${timePeriod}`;

        break;
      case "/api/parent/children-list":
        apiUrl = `${BASE_URL}/accounts/api/parent/children-list/`;

        break;
      case "/api/parent/time-periods":
        apiUrl = `${BASE_URL}/accounts/api/parent/time-periods/`;

        break;
      default:
        return NextResponse.json({detail: "Endpoint not found"}, {status: 404});
    }

    const res = await fetchWithRetry(apiUrl, {
      method: "GET",
      headers,
    });

    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("[Route] Failed to parse JSON:", e);
      return NextResponse.json(
        {detail: "External API returned an invalid response"},
        {status: 502}
      );
    }

    if (!res.ok) {
      if (res.status === 403) {
        return NextResponse.json(
          {detail: "Unauthorized: Invalid session token or API key"},
          {status: 403}
        );
      }
      return NextResponse.json(
        {detail: data.detail || "Failed to fetch data"},
        {status: res.status}
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[Route] Error fetching data:", error.message);
    return NextResponse.json({detail: "Internal server error"}, {status: 500});
  }
}

// Reusable fetch with retry logic
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
      console.error("[Route] Fetch attempt", i + 1, "failed:", err.message);
      if (i === retries - 1) throw err;
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error("Max retries reached");
}

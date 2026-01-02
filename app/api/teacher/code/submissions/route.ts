// app/code-ide/api/teacher/submissions/route.ts
import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

//const BASE_URL = "http://127.0.0.1:9098";
const BASE_URL = "https://texagonbackend.onrender.com";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

async function fetchWithRetry(
  url: string,
  options: any,
  retries = 5,
  delay = 2000
) {
  for (let i = 0; i <= retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout per attempt

      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Successfully connected
      return res;
    } catch (err: any) {
      console.error(`[Fetch] Attempt ${i + 1} failed:`, err.message);

      // Only retry on network errors (fetch failed) or 5xx server errors
      // If it's the last attempt, throw
      if (i === retries) throw err;

      // Wait before retrying (exponential backoff optional, here simple constant)
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error("Filtered out by loop logic");
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.sessionToken) {
    return NextResponse.json({error: "No session token"}, {status: 401});
  }

  try {
    const backendUrl = new URL(`${BASE_URL}/code-ide/api/teacher/submissions/`);
    const {searchParams} = new URL(request.url);

    searchParams.forEach((value, key) => {
      backendUrl.searchParams.append(key, value);
    });

    // Use retry logic for cold starts (Render.com)
    const res = await fetchWithRetry(backendUrl.toString(), {
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "X-Session-Token": session.user.sessionToken, // Fixed syntax error here too
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        {error: data.detail || "Failed to fetch data"},
        {status: res.status}
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[Route] Error fetching data:", error);
    return NextResponse.json(
      {error: "Internal server error", details: error.message},
      {status: 500}
    );
  }
}

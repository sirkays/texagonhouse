// app/api/admin/gamification/leaderboard/route.ts
import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {unstable_noStore as noStore} from "next/cache";

const BASE_URL = "https://texagonbackend.onrender.com";
const API_KEY =
  process.env.GAMIFICATION_API_KEY ||
  "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

const noCacheHeaders = () => ({
  "Content-Type": "application/json",
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
});

async function fetchFromBackend(
  endpoint: string,
  options: RequestInit = {},
  sessionToken: string
) {
  const fullUrl = `${BASE_URL}${endpoint}`;
  const response = await fetch(fullUrl, {
    ...options,
    headers: {
      Authorization: `Api-Key ${API_KEY}`,
      "Content-Type": "application/json",
      "X-Session-Token": sessionToken,
      ...(options.headers || {}),
    },
  });

  const contentType = response.headers.get("content-type") || "";
  const rawResponse = await response.text();

  if (!response.ok) {
    let errorDetail = rawResponse;
    try {
      const errObj = JSON.parse(rawResponse);
      errorDetail =
        errObj.detail || errObj.error || errObj.message || rawResponse;
    } catch {}
    throw new Error(errorDetail, {cause: {status: response.status}});
  }

  if (!contentType.includes("application/json")) {
    throw new Error(`Invalid content type: ${contentType}`);
  }

  let data;
  try {
    data = JSON.parse(rawResponse);
  } catch {
    throw new Error("Invalid JSON response");
  }

  return data;
}

interface LeaderboardRow {
  rank: number;
  studentId: number;
  student: string;
  points: number;
  badges: number;
  streak: number;
}

export async function GET(req: Request) {
  noStore();
  const session = await getServerSession(authOptions);

  if (!session?.user?.sessionToken) {
    return NextResponse.json(
      {error: "Not authenticated", redirect: "/login"},
      {status: 401, headers: noCacheHeaders()}
    );
  }

  try {
    const data = await fetchFromBackend(
      "/orgs/api/admin/gamification/leaderboard",
      {method: "GET"},
      session.user.sessionToken
    );
    if (!Array.isArray(data)) {
      return NextResponse.json(
        {error: "Invalid response format, expected leaderboard array"},
        {status: 500, headers: noCacheHeaders()}
      );
    }
    return NextResponse.json(data, {status: 200, headers: noCacheHeaders()});
  } catch (error) {
    const cause = (error as Error).cause as {status?: number} | undefined;
    const status = cause?.status || 500;
    let errorResp = {error: "Failed to fetch leaderboard"};

    if (status === 401) {
      errorResp = {error: "Session expired", redirect: "/login"};
    } else if (status === 403) {
      errorResp = {error: "Forbidden - not an org admin/teacher"};
    } else {
      errorResp.details = (error as Error).message;
    }

    return NextResponse.json(errorResp, {status, headers: noCacheHeaders()});
  }
}

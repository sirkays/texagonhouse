// app/api/admin/gamification/achievements/[achievement_id]/route.ts
import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {unstable_noStore as noStore} from "next/cache";

const BASE_URL = "https://texagonbackend.onrender.com";
const API_KEY =
  process.env.GAMIFICATION_API_KEY ||
  "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

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

interface AchievementDefinition {
  id: number;
  organizationId: number | null;
  code: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  target_value: number | null;
  points: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function PATCH(
  req: Request,
  {params}: {params: {achievement_id: string}}
) {
  noStore();
  const achievementId = params.achievement_id;
  const session = await getServerSession(authOptions);

  if (!session?.user?.sessionToken) {
    return NextResponse.json(
      {error: "Not authenticated", redirect: "/login"},
      {status: 401}
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      {error: "Invalid JSON in request body"},
      {status: 400}
    );
  }

  try {
    const data = await fetchFromBackend(
      `/orgs/api/admin/gamification/achievements/${achievementId}`,
      {
        method: "PATCH",
        body: JSON.stringify(body),
      },
      session.user.sessionToken
    );
    return NextResponse.json(data, {status: 200});
  } catch (error) {
    const cause = (error as Error).cause as {status?: number} | undefined;
    const status = cause?.status || 500;
    let errorResp = {error: "Failed to update achievement"};

    if (status === 401) {
      errorResp = {error: "Session expired", redirect: "/login"};
    } else if (status === 403) {
      errorResp = {error: "Forbidden - not an org admin/teacher"};
    } else if (status === 404) {
      errorResp = {error: "Achievement not found"};
    } else if (status === 400) {
      errorResp = {error: "Bad request (validation error)"};
    } else {
      errorResp.details = (error as Error).message;
    }

    return NextResponse.json(errorResp, {status});
  }
}

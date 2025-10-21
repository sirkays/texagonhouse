// // app/api/admin/gamification/achievements/[achievement_id]/route.ts
// import {NextResponse} from "next/server";
// import {getServerSession} from "next-auth";
// import {authOptions} from "@/app/api/auth/[...nextauth]/route";
// import {unstable_noStore as noStore} from "next/cache";

// const BASE_URL = "https://texagonbackend.epichouse.online";
// const API_KEY = "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

// const headers = (sessionToken: string | undefined) => ({
//   Authorization: `Api-Key ${API_KEY}`,
//   "Content-Type": "application/json",
//   ...(sessionToken && {"X-Session-Token": sessionToken}),
// });

// interface AchievementDefinition {
//   id: number;
//   organizationId: number | null;
//   code: string;
//   title: string;
//   description: string;
//   icon: string;
//   category: string;
//   target_value: number | null;
//   points: number;
//   is_active: boolean;
//   created_at: string;
//   updated_at: string;
// }

// export async function PATCH(
//   req: Request,
//   {params}: {params: {achievement_id: string}}
// ) {
//   noStore();
//   const achievementId = params.achievement_id;
//   const endpoint = `/orgs/api/admin/gamification/achievements/${achievementId}`;
//   const fullUrl = `${BASE_URL}${endpoint}`;
//   console.log("[GamificationAchievementsAPI] Initiating PATCH to:", fullUrl);

//   const session = await getServerSession(authOptions);
//   console.log("[GamificationAchievementsAPI] Session retrieved:", {
//     sessionToken: session?.user?.sessionToken,
//     user: session?.user ? {id: session.user.id, role: session.user.role} : null,
//   });

//   if (!session?.user?.sessionToken) {
//     console.log("[GamificationAchievementsAPI] No session token found");
//     return NextResponse.json(
//       {error: "Not authenticated", redirect: "/login"},
//       {status: 401}
//     );
//   }

//   let body;
//   try {
//     body = await req.json();
//   } catch (error) {
//     console.error(
//       "[GamificationAchievementsAPI] Failed to parse request body:",
//       error
//     );
//     return NextResponse.json(
//       {error: "Invalid JSON in request body"},
//       {status: 400}
//     );
//   }

//   try {
//     console.log(
//       "[GamificationAchievementsAPI] Patching",
//       fullUrl,
//       "with token:",
//       session.user.sessionToken,
//       "body:",
//       body
//     );
//     const response = await fetch(fullUrl, {
//       method: "PATCH",
//       headers: headers(session.user.sessionToken),
//       body: JSON.stringify(body),
//     });

//     console.log(
//       "[GamificationAchievementsAPI] PATCH response status:",
//       response.status
//     );

//     const contentType = response.headers.get("content-type") || "";
//     const rawResponse = await response.text();
//     console.log(
//       "[GamificationAchievementsAPI] PATCH raw response:",
//       rawResponse.slice(0, 200) + (rawResponse.length > 200 ? "..." : "")
//     );

//     if (!response.ok) {
//       console.error(
//         "[GamificationAchievementsAPI] PATCH failed:",
//         response.status,
//         rawResponse.slice(0, 100)
//       );
//       if (response.status === 401) {
//         return NextResponse.json(
//           {error: "Session expired", redirect: "/login"},
//           {status: 401}
//         );
//       }
//       if (response.status === 403) {
//         return NextResponse.json(
//           {error: "Forbidden - not an org admin/teacher"},
//           {status: 403}
//         );
//       }
//       if (response.status === 404) {
//         return NextResponse.json(
//           {error: "Achievement not found"},
//           {status: 404}
//         );
//       }
//       return NextResponse.json(
//         {error: "Failed to update achievement"},
//         {status: response.status}
//       );
//     }

//     if (!contentType.includes("application/json")) {
//       console.error(
//         "[GamificationAchievementsAPI] Non-JSON response received:",
//         contentType
//       );
//       return NextResponse.json(
//         {error: "Invalid response format, expected JSON"},
//         {status: 500}
//       );
//     }

//     let data: AchievementDefinition;
//     try {
//       data = JSON.parse(rawResponse);
//     } catch (parseError) {
//       console.error(
//         "[GamificationAchievementsAPI] Failed to parse JSON:",
//         parseError
//       );
//       return NextResponse.json(
//         {error: "Invalid response format"},
//         {status: 500}
//       );
//     }

//     console.log(
//       "[GamificationAchievementsAPI] PATCH successful, updated achievement:",
//       data
//     );
//     return NextResponse.json(data, {status: 200});
//   } catch (error) {
//     console.error("[GamificationAchievementsAPI] PATCH error:", error);
//     return NextResponse.json(
//       {
//         error: "Failed to update achievement",
//         details: (error as Error).message,
//       },
//       {status: 500}
//     );
//   }
// }

// app/api/admin/gamification/achievements/[achievement_id]/route.ts
import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {unstable_noStore as noStore} from "next/cache";

const BASE_URL = "https://texagonbackend.epichouse.online";
const API_KEY =
  process.env.GAMIFICATION_API_KEY ||
  "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

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

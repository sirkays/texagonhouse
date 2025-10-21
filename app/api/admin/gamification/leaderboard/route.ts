// // app/api/admin/gamification/leaderboard/route.ts
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

// interface LeaderboardRow {
//   rank: number;
//   studentId: number;
//   student: string;
//   points: number;
//   badges: number;
//   streak: number;
// }

// export async function GET(req: Request) {
//   noStore();
//   const endpoint = "/orgs/api/admin/gamification/leaderboard";
//   const fullUrl = `${BASE_URL}${endpoint}`;
//   console.log("[GamificationLeaderboardAPI] Initiating fetch for:", fullUrl);

//   const session = await getServerSession(authOptions);
//   console.log("[GamificationLeaderboardAPI] Session retrieved:", {
//     sessionToken: session?.user?.sessionToken,
//     user: session?.user ? {id: session.user.id, role: session.user.role} : null,
//   });

//   if (!session?.user?.sessionToken) {
//     console.log("[GamificationLeaderboardAPI] No session token found");
//     return NextResponse.json(
//       {error: "Not authenticated", redirect: "/login"},
//       {
//         status: 401,
//         headers: {
//           "Content-Type": "application/json",
//           "Cache-Control":
//             "no-store, no-cache, must-revalidate, proxy-revalidate",
//           Pragma: "no-cache",
//           Expires: "0",
//         },
//       }
//     );
//   }

//   try {
//     console.log(
//       "[GamificationLeaderboardAPI] Fetching from",
//       fullUrl,
//       "with token:",
//       session.user.sessionToken
//     );
//     const response = await fetch(fullUrl, {
//       method: "GET",
//       headers: headers(session.user.sessionToken),
//     });

//     console.log(
//       "[GamificationLeaderboardAPI] Fetch response status:",
//       response.status
//     );
//     console.log(
//       "[GamificationLeaderboardAPI] Fetch response headers:",
//       Object.fromEntries(response.headers)
//     );
//     console.log(
//       "[GamificationLeaderboardAPI] Fetch response content-type:",
//       response.headers.get("content-type")
//     );

//     const contentType = response.headers.get("content-type") || "";
//     const rawResponse = await response.text();
//     console.log(
//       "[GamificationLeaderboardAPI] Raw response:",
//       rawResponse.slice(0, 200) + (rawResponse.length > 200 ? "..." : "")
//     );

//     if (!response.ok) {
//       console.error(
//         "[GamificationLeaderboardAPI] Fetch failed:",
//         response.status,
//         rawResponse.slice(0, 100)
//       );
//       if (response.status === 401) {
//         return NextResponse.json(
//           {error: "Session expired", redirect: "/login"},
//           {
//             status: 401,
//             headers: {
//               "Content-Type": "application/json",
//               "Cache-Control": "no-store",
//             },
//           }
//         );
//       }
//       if (response.status === 403) {
//         return NextResponse.json(
//           {error: "Forbidden - not an org admin/teacher"},
//           {
//             status: 403,
//             headers: {
//               "Content-Type": "application/json",
//               "Cache-Control": "no-store",
//             },
//           }
//         );
//       }
//       return NextResponse.json(
//         {error: "Failed to fetch leaderboard"},
//         {
//           status: response.status,
//           headers: {
//             "Content-Type": "application/json",
//             "Cache-Control": "no-store",
//           },
//         }
//       );
//     }

//     if (!contentType.includes("application/json")) {
//       console.error(
//         "[GamificationLeaderboardAPI] Non-JSON response received:",
//         contentType
//       );
//       return NextResponse.json(
//         {error: "Invalid response format, expected JSON"},
//         {
//           status: 500,
//           headers: {
//             "Content-Type": "application/json",
//             "Cache-Control": "no-store",
//           },
//         }
//       );
//     }

//     let data: LeaderboardRow[];
//     try {
//       data = JSON.parse(rawResponse);
//     } catch (parseError) {
//       console.error(
//         "[GamificationLeaderboardAPI] Failed to parse JSON:",
//         parseError
//       );
//       return NextResponse.json(
//         {error: "Invalid response format"},
//         {
//           status: 500,
//           headers: {
//             "Content-Type": "application/json",
//             "Cache-Control": "no-store",
//           },
//         }
//       );
//     }

//     if (!Array.isArray(data)) {
//       console.error(
//         "[GamificationLeaderboardAPI] Response does not contain a leaderboard array:",
//         data
//       );
//       return NextResponse.json(
//         {error: "Invalid response format, expected leaderboard array"},
//         {
//           status: 500,
//           headers: {
//             "Content-Type": "application/json",
//             "Cache-Control": "no-store",
//           },
//         }
//       );
//     }

//     console.log(
//       "[GamificationLeaderboardAPI] Fetch successful, leaderboard count:",
//       data.length
//     );
//     return NextResponse.json(data, {
//       status: 200,
//       headers: {
//         "Content-Type": "application/json",
//         "Cache-Control":
//           "no-store, no-cache, must-revalidate, proxy-revalidate",
//         Pragma: "no-cache",
//         Expires: "0",
//       },
//     });
//   } catch (error) {
//     console.error("[GamificationLeaderboardAPI] Fetch error:", error);
//     return NextResponse.json(
//       {error: "Failed to fetch leaderboard", details: (error as Error).message},
//       {
//         status: 500,
//         headers: {
//           "Content-Type": "application/json",
//           "Cache-Control": "no-store",
//         },
//       }
//     );
//   }
// }

// app/api/admin/gamification/leaderboard/route.ts
import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {unstable_noStore as noStore} from "next/cache";

const BASE_URL = "https://texagonbackend.epichouse.online";
const API_KEY =
  process.env.GAMIFICATION_API_KEY ||
  "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

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

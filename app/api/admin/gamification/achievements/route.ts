// // app/api/admin/gamification/achievements/route.ts
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

// export async function GET(req: Request) {
//   noStore();
//   const endpoint = "/orgs/api/admin/gamification/achievements";
//   const fullUrl = `${BASE_URL}${endpoint}`;
//   console.log(
//     "[GamificationAchievementsAPI] Initiating GET fetch for:",
//     fullUrl
//   );

//   const session = await getServerSession(authOptions);
//   console.log("[GamificationAchievementsAPI] Session retrieved:", {
//     sessionToken: session?.user?.sessionToken,
//     user: session?.user ? {id: session.user.id, role: session.user.role} : null,
//   });

//   if (!session?.user?.sessionToken) {
//     console.log("[GamificationAchievementsAPI] No session token found");
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
//       "[GamificationAchievementsAPI] Fetching from",
//       fullUrl,
//       "with token:",
//       session.user.sessionToken
//     );
//     const response = await fetch(fullUrl, {
//       method: "GET",
//       headers: headers(session.user.sessionToken),
//     });

//     console.log(
//       "[GamificationAchievementsAPI] Fetch response status:",
//       response.status
//     );
//     console.log(
//       "[GamificationAchievementsAPI] Fetch response headers:",
//       Object.fromEntries(response.headers)
//     );
//     console.log(
//       "[GamificationAchievementsAPI] Fetch response content-type:",
//       response.headers.get("content-type")
//     );

//     const contentType = response.headers.get("content-type") || "";
//     const rawResponse = await response.text();
//     console.log(
//       "[GamificationAchievementsAPI] Raw response:",
//       rawResponse.slice(0, 200) + (rawResponse.length > 200 ? "..." : "")
//     );

//     if (!response.ok) {
//       console.error(
//         "[GamificationAchievementsAPI] Fetch failed:",
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
//         {error: "Failed to fetch achievements"},
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
//         "[GamificationAchievementsAPI] Non-JSON response received:",
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

//     let data: AchievementDefinition[];
//     try {
//       data = JSON.parse(rawResponse);
//     } catch (parseError) {
//       console.error(
//         "[GamificationAchievementsAPI] Failed to parse JSON:",
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
//         "[GamificationAchievementsAPI] Response does not contain an achievements array:",
//         data
//       );
//       return NextResponse.json(
//         {error: "Invalid response format, expected achievements array"},
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
//       "[GamificationAchievementsAPI] Fetch successful, achievements count:",
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
//     console.error("[GamificationAchievementsAPI] Fetch error:", error);
//     return NextResponse.json(
//       {
//         error: "Failed to fetch achievements",
//         details: (error as Error).message,
//       },
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

// export async function POST(req: Request) {
//   noStore();
//   const endpoint = "/orgs/api/admin/gamification/achievements";
//   const fullUrl = `${BASE_URL}${endpoint}`;
//   console.log("[GamificationAchievementsAPI] Initiating POST to:", fullUrl);

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
//       "[GamificationAchievementsAPI] Posting to",
//       fullUrl,
//       "with token:",
//       session.user.sessionToken,
//       "body:",
//       body
//     );
//     const response = await fetch(fullUrl, {
//       method: "POST",
//       headers: headers(session.user.sessionToken),
//       body: JSON.stringify(body),
//     });

//     console.log(
//       "[GamificationAchievementsAPI] POST response status:",
//       response.status
//     );

//     const contentType = response.headers.get("content-type") || "";
//     const rawResponse = await response.text();
//     console.log(
//       "[GamificationAchievementsAPI] POST raw response:",
//       rawResponse.slice(0, 200) + (rawResponse.length > 200 ? "..." : "")
//     );

//     if (!response.ok) {
//       console.error(
//         "[GamificationAchievementsAPI] POST failed:",
//         response.status,
//         rawResponse.slice(0, 100)
//       );
//       if (response.status === 400) {
//         return NextResponse.json(
//           {error: "Bad request (validation error)"},
//           {status: 400}
//         );
//       }
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
//       return NextResponse.json(
//         {error: "Failed to create achievement"},
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
//       "[GamificationAchievementsAPI] POST successful, created achievement:",
//       data
//     );
//     return NextResponse.json(data, {status: 201});
//   } catch (error) {
//     console.error("[GamificationAchievementsAPI] POST error:", error);
//     return NextResponse.json(
//       {
//         error: "Failed to create achievement",
//         details: (error as Error).message,
//       },
//       {status: 500}
//     );
//   }
// }

// app/api/admin/gamification/achievements/route.ts
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
      "/orgs/api/admin/gamification/achievements",
      {method: "GET"},
      session.user.sessionToken
    );
    if (!Array.isArray(data)) {
      return NextResponse.json(
        {error: "Invalid response format, expected achievements array"},
        {status: 500, headers: noCacheHeaders()}
      );
    }
    return NextResponse.json(data, {status: 200, headers: noCacheHeaders()});
  } catch (error) {
    const cause = (error as Error).cause as {status?: number} | undefined;
    const status = cause?.status || 500;
    let errorResp = {error: "Failed to fetch achievements"};

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

export async function POST(req: Request) {
  noStore();
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
      "/orgs/api/admin/gamification/achievements",
      {
        method: "POST",
        body: JSON.stringify(body),
      },
      session.user.sessionToken
    );
    return NextResponse.json(data, {status: 201});
  } catch (error) {
    const cause = (error as Error).cause as {status?: number} | undefined;
    const status = cause?.status || 500;
    let errorResp = {error: "Failed to create achievement"};

    if (status === 400) {
      errorResp = {error: "Bad request (validation error)"};
    } else if (status === 401) {
      errorResp = {error: "Session expired", redirect: "/login"};
    } else if (status === 403) {
      errorResp = {error: "Forbidden - not an org admin/teacher"};
    } else {
      errorResp.details = (error as Error).message;
    }

    return NextResponse.json(errorResp, {status});
  }
}

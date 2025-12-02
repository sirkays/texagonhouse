// import {NextRequest, NextResponse} from "next/server";
// import {getServerSession} from "next-auth";
// import {authOptions} from "@/app/api/auth/[...nextauth]/route";

// const BASE_URL = "https://texagonbackend.epichouse.online/orgs";
// const API_KEY = "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

// async function getSession() {
//   return await getServerSession(authOptions);
// }

// export async function GET(request: NextRequest) {
//   console.log(
//     "[Courses Route] Received GET request to /api/admin/courses/stats"
//   );
//   const session = await getSession();
//   console.log("[Courses Route] Session data:", {
//     sessionToken: session?.user?.sessionToken,
//   });

//   if (!session?.user?.sessionToken) {
//     console.log("[Courses Route] No session token found");
//     return NextResponse.json({error: "No session token"}, {status: 401});
//   }

//   try {
//     const {searchParams} = new URL(request.url);
//     const queryString = searchParams.toString();
//     const url = queryString
//       ? `${BASE_URL}/api/admin/courses/stats/?${queryString}`
//       : `${BASE_URL}/api/admin/courses/stats/`;
//     console.log("[Courses Route] Fetching data from", url);
//     const res = await fetch(url, {
//       headers: {
//         Authorization: `Api-Key ${API_KEY}`,
//         "X-Session-Token": session.user.sessionToken,
//       },
//     });

//     console.log("[Courses Route] API response status:", res.status);
//     const data = await res.json();
//     console.log("[Courses Route] API response data:", data);

//     if (!res.ok) {
//       console.log("[Courses Route] API fetch failed:", data);
//       return NextResponse.json(
//         {error: data.detail || "Failed to fetch course stats"},
//         {status: res.status}
//       );
//     }

//     return NextResponse.json(data);
//   } catch (error) {
//     console.error("[Courses Route] Error fetching course stats:", error);
//     return NextResponse.json({error: "Internal server error"}, {status: 500});
//   }
// }

import {NextRequest, NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

const BASE_URL = "https://texagonbackend.epichouse.online/orgs";
const API_KEY = "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

async function getSession() {
  return await getServerSession(authOptions);
}

export async function GET(request: NextRequest) {
  console.log(
    "[Courses Route] Received GET request to /api/admin/courses/stats"
  );
  const session = await getSession();
  console.log("[Courses Route] Session data:", {
    sessionToken: session?.user?.sessionToken,
  });

  if (!session?.user?.sessionToken) {
    console.log("[Courses Route] No session token found");
    return NextResponse.json({error: "No session token"}, {status: 401});
  }

  try {
    const {searchParams} = new URL(request.url);
    const queryString = searchParams.toString();
    const url = queryString
      ? `${BASE_URL}/api/admin/courses/stats/?${queryString}`
      : `${BASE_URL}/api/admin/courses/stats/?org_id=1`;
    console.log("[Courses Route] Fetching data from", url);
    const res = await fetch(url, {
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "X-Session-Token": session.user.sessionToken,
      },
    });

    console.log("[Courses Route] API response status:", res.status);
    const data = await res.json();
    console.log("[Courses Route] API response data:", data);

    if (!res.ok) {
      console.log("[Courses Route] API fetch failed:", data);
      return NextResponse.json(
        {error: data.detail || "Failed to fetch course stats"},
        {status: res.status}
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Courses Route] Error fetching course stats:", error);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}

// import {NextRequest, NextResponse} from "next/server";
// import {getServerSession} from "next-auth";
// import {authOptions} from "@/lib/auth";

// const BASE_URL = "https://texagonbackend.onrender.com/orgs";
// const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

// async function getSession() {
//   return await getServerSession(authOptions);
// }

// export async function GET(request: NextRequest) {
//   console.log("[Courses Route] Received GET request to /api/admin/courses");
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
//       ? `${BASE_URL}/api/admin/courses/?${queryString}`
//       : `${BASE_URL}/api/admin/courses/`;
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
//         {error: data.detail || "Failed to fetch courses"},
//         {status: res.status}
//       );
//     }

//     return NextResponse.json(data);
//   } catch (error) {
//     console.error("[Courses Route] Error fetching courses:", error);
//     return NextResponse.json({error: "Internal server error"}, {status: 500});
//   }
// }

// export async function POST(request: NextRequest) {
//   console.log("[Courses Route] Received POST request to /api/admin/courses");
//   const session = await getSession();
//   console.log("[Courses Route] Session data:", {
//     sessionToken: session?.user?.sessionToken,
//   });

//   if (!session?.user?.sessionToken) {
//     console.log("[Courses Route] No session token found");
//     return NextResponse.json({error: "No session token"}, {status: 401});
//   }

//   try {
//     const contentType = request.headers.get("content-type") || "";
//     let fetchBody: BodyInit | null = null;
//     const headers: HeadersInit = {
//       Authorization: `Api-Key ${API_KEY}`,
//       "X-Session-Token": session.user.sessionToken,
//     };

//     if (contentType.includes("multipart/form-data")) {
//       const formData = await request.formData();
//       if (!formData.get("name")) {
//         return NextResponse.json({error: "Name is required"}, {status: 400});
//       }
//       fetchBody = formData;
//     } else {
//       const jsonBody = await request.json();
//       console.log("[Courses Route] Request body:", jsonBody);
//       if (!jsonBody.name) {
//         return NextResponse.json({error: "Name is required"}, {status: 400});
//       }
//       fetchBody = JSON.stringify(jsonBody);
//       headers["Content-Type"] = "application/json";
//     }

//     console.log(
//       "[Courses Route] Creating course at",
//       `${BASE_URL}/api/admin/courses/create/`
//     );
//     const res = await fetch(`${BASE_URL}/api/admin/courses/create/`, {
//       method: "POST",
//       headers,
//       body: fetchBody,
//     });

//     console.log("[Courses Route] API response status:", res.status);
//     const data = await res.json();
//     console.log("[Courses Route] API response data:", data);

//     if (!res.ok) {
//       console.log("[Courses Route] API post failed:", data);
//       return NextResponse.json(
//         {error: data.detail || "Failed to create course"},
//         {status: res.status}
//       );
//     }

//     return NextResponse.json(data, {status: 201});
//   } catch (error) {
//     console.error("[Courses Route] Error creating course:", error);
//     return NextResponse.json({error: "Internal server error"}, {status: 500});
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const BASE_URL = "https://texagonbackend.onrender.com/orgs";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

async function getSession() {
  return await getServerSession(authOptions);
}

export async function GET(request: NextRequest) {
  console.log("[Courses Route] Received GET request to /api/admin/courses");
  const session = await getSession();
  console.log("[Courses Route] Session data:", {
    sessionToken: session?.user?.sessionToken,
  });

  if (!session?.user?.sessionToken) {
    console.log("[Courses Route] No session token found");
    return NextResponse.json({ error: "No session token" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const url = queryString
      ? `${BASE_URL}/api/admin/courses/?${queryString}`
      : `${BASE_URL}/api/admin/courses/`;
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
        { error: data.detail || "Failed to fetch courses" },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Courses Route] Error fetching courses:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  console.log("[Courses Route] Received POST request to /api/admin/courses");
  const session = await getSession();
  console.log("[Courses Route] Session data:", {
    sessionToken: session?.user?.sessionToken,
  });

  if (!session?.user?.sessionToken) {
    console.log("[Courses Route] No session token found");
    return NextResponse.json({ error: "No session token" }, { status: 401 });
  }

  try {
    const contentType = request.headers.get("content-type") || "";
    let fetchBody: BodyInit | null = null;
    const headers: HeadersInit = {
      Authorization: `Api-Key ${API_KEY}`,
      "X-Session-Token": session.user.sessionToken,
    };

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      if (!formData.get("name")) {
        return NextResponse.json({ error: "Name is required" }, { status: 400 });
      }
      fetchBody = formData;
    } else {
      const jsonBody = await request.json();
      console.log("[Courses Route] Request body:", jsonBody);
      if (!jsonBody.name) {
        return NextResponse.json({ error: "Name is required" }, { status: 400 });
      }
      fetchBody = JSON.stringify(jsonBody);
      headers["Content-Type"] = "application/json";
    }

    const url = new URL(`${BASE_URL}/api/admin/courses/create/`);
    url.searchParams.append("org_id", "1");
    console.log("[Courses Route] Creating course at", url.toString());
    const res = await fetch(url.toString(), {
      method: "POST",
      headers,
      body: fetchBody,
    });

    console.log("[Courses Route] API response status:", res.status);
    const data = await res.json();
    console.log("[Courses Route] API response data:", data);

    if (!res.ok) {
      console.log("[Courses Route] API post failed:", data);
      return NextResponse.json(
        { error: data.detail || "Failed to create course" },
        { status: res.status }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("[Courses Route] Error creating course:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

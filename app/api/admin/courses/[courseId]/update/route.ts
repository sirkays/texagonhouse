// import {NextRequest, NextResponse} from "next/server";
// import {getServerSession} from "next-auth";
// import {authOptions} from "@/app/api/auth/[...nextauth]/route";

// const BASE_URL = "https://texagonbackend.onrender.com/orgs";
// const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

// async function getSession() {
//   return await getServerSession(authOptions);
// }

// export async function PATCH(
//   request: NextRequest,
//   {params}: {params: {courseId: string}}
// ) {
//   console.log(
//     `[Courses Route] Received PATCH request to /api/admin/courses/${params.courseId}/update`
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
//     const contentType = request.headers.get("content-type") || "";
//     let fetchBody: BodyInit | null = null;
//     const headers: HeadersInit = {
//       Authorization: `Api-Key ${API_KEY}`,
//       "X-Session-Token": session.user.sessionToken,
//     };

//     if (contentType.includes("multipart/form-data")) {
//       const formData = await request.formData();
//       fetchBody = formData;
//     } else {
//       const jsonBody = await request.json();
//       console.log("[Courses Route] Request body:", jsonBody);
//       fetchBody = JSON.stringify(jsonBody);
//       headers["Content-Type"] = "application/json";
//     }

//     const {searchParams} = new URL(request.url);
//     const queryString = searchParams.toString();
//     const url = queryString
//       ? `${BASE_URL}/api/admin/courses/${params.courseId}/update/?${queryString}`
//       : `${BASE_URL}/api/admin/courses/${params.courseId}/update/`;
//     console.log("[Courses Route] Updating at", url);
//     const res = await fetch(url, {
//       method: "PATCH",
//       headers,
//       body: fetchBody,
//     });

//     console.log("[Courses Route] API response status:", res.status);
//     const data = await res.json();
//     console.log("[Courses Route] API response data:", data);

//     if (!res.ok) {
//       console.log("[Courses Route] API patch failed:", data);
//       return NextResponse.json(
//         {error: data.detail || "Failed to update course"},
//         {status: res.status}
//       );
//     }

//     return NextResponse.json(data);
//   } catch (error) {
//     console.error("[Courses Route] Error updating course:", error);
//     return NextResponse.json({error: "Internal server error"}, {status: 500});
//   }
// }

import {NextRequest, NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

const BASE_URL = "https://texagonbackend.onrender.com/orgs";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

async function getSession() {
  return await getServerSession(authOptions);
}

export async function PATCH(
  request: NextRequest,
  {params}: {params: Promise<{courseId: string}>}
) {
  const {courseId} = await params;
  console.log(
    `[Courses Route] Received PATCH request to /api/admin/courses/${courseId}/update`
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
    const contentType = request.headers.get("content-type") || "";
    let fetchBody: BodyInit | null = null;
    const headers: HeadersInit = {
      Authorization: `Api-Key ${API_KEY}`,
      "X-Session-Token": session.user.sessionToken,
    };

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      fetchBody = formData;
    } else {
      const jsonBody = await request.json();
      console.log("[Courses Route] Request body:", jsonBody);
      fetchBody = JSON.stringify(jsonBody);
      headers["Content-Type"] = "application/json";
    }

    const {searchParams} = new URL(request.url);
    const queryString = searchParams.toString();
    const url = queryString
      ? `${BASE_URL}/api/admin/courses/${courseId}/update/?${queryString}`
      : `${BASE_URL}/api/admin/courses/${courseId}/update/?org_id=1`;
    console.log("[Courses Route] Updating at", url);
    const res = await fetch(url, {
      method: "PATCH",
      headers,
      body: fetchBody,
    });

    console.log("[Courses Route] API response status:", res.status);
    const data = await res.json();
    console.log("[Courses Route] API response data:", data);

    if (!res.ok) {
      console.log("[Courses Route] API patch failed:", data);
      return NextResponse.json(
        {error: data.detail || "Failed to update course"},
        {status: res.status}
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Courses Route] Error updating course:", error);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}

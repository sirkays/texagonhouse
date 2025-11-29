// import {NextRequest, NextResponse} from "next/server";
// import {getServerSession} from "next-auth";
// import {authOptions} from "@/app/api/auth/[...nextauth]/route";

// const BASE_URL = "https://texagonbackend.onrender.com/orgs";
// const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

// async function getSession() {
//   return await getServerSession(authOptions);
// }

// export async function DELETE(
//   request: NextRequest,
//   {params}: {params: {courseId: string}}
// ) {
//   console.log(
//     `[Courses Route] Received DELETE request to /api/admin/courses/${params.courseId}/delete`
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
//       ? `${BASE_URL}/api/admin/courses/${params.courseId}/delete/?${queryString}`
//       : `${BASE_URL}/api/admin/courses/${params.courseId}/delete/`;
//     console.log("[Courses Route] Deleting from", url);
//     const res = await fetch(url, {
//       method: "DELETE",
//       headers: {
//         Authorization: `Api-Key ${API_KEY}`,
//         "X-Session-Token": session.user.sessionToken,
//       },
//     });

//     console.log("[Courses Route] API response status:", res.status);
//     const data = await res.json();
//     console.log("[Courses Route] API response data:", data);

//     if (!res.ok) {
//       console.log("[Courses Route] API delete failed:", data);
//       return NextResponse.json(
//         {error: data.detail || "Failed to delete course"},
//         {status: res.status}
//       );
//     }

//     return NextResponse.json(data);
//   } catch (error) {
//     console.error("[Courses Route] Error deleting course:", error);
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

export async function DELETE(
  request: NextRequest,
  {params}: {params: Promise<{courseId: string}>}
) {
  const {courseId} = await params;
  console.log(
    `[Courses Route] Received DELETE request to /api/admin/courses/${courseId}/delete`
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
      ? `${BASE_URL}/api/admin/courses/${courseId}/delete/?${queryString}`
      : `${BASE_URL}/api/admin/courses/${courseId}/delete/?org_id=1`;
    console.log("[Courses Route] Deleting from", url);
    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        "X-Session-Token": session.user.sessionToken,
      },
    });

    console.log("[Courses Route] API response status:", res.status);
    const data = await res.json();
    console.log("[Courses Route] API response data:", data);

    if (!res.ok) {
      console.log("[Courses Route] API delete failed:", data);
      return NextResponse.json(
        {error: data.detail || "Failed to delete course"},
        {status: res.status}
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Courses Route] Error deleting course:", error);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { unstable_noStore as noStore } from "next/cache";

const BASE_URL = "https://texagonbackend.epichouse.online";
const API_KEY = "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

const headers = (sessionToken: string | undefined) => ({
  "Authorization": `Api-Key ${API_KEY}`,
  ...(sessionToken && { "X-Session-Token": sessionToken }),
});

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  noStore();
  const params = await context.params; // Await params
  const id = params.id;
  const endpoint = `/learning/api/teacher/modules/${id}/`;
  const fullUrl = `${BASE_URL}${endpoint}`;
  console.log("[TeacherModuleDetailsAPI] Initiating fetch for:", fullUrl);

  const session = await getServerSession(authOptions);
  console.log("[TeacherModuleDetailsAPI] Session retrieved:", {
    sessionToken: session?.user?.sessionToken,
    user: session?.user ? { id: session.user.id, role: session.user.role } : null,
  });

  if (!session?.user?.sessionToken) {
    console.log("[TeacherModuleDetailsAPI] No session token found");
    return NextResponse.json(
      { error: "Not authenticated", redirect: "/auth/signin" },
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  }

  try {
    console.log("[TeacherModuleDetailsAPI] Fetching from", fullUrl, "with token:", session.user.sessionToken);
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: headers(session.user.sessionToken),
    });

    console.log("[TeacherModuleDetailsAPI] Fetch response status:", response.status);
    console.log("[TeacherModuleDetailsAPI] Fetch response headers:", Object.fromEntries(response.headers));

    const contentType = response.headers.get("content-type") || "";
    console.log("[TeacherModuleDetailsAPI] Fetch response content-type:", contentType);

    const rawResponse = await response.text();
    console.log("[TeacherModuleDetailsAPI] Raw response:", rawResponse.slice(0, 200) + (rawResponse.length > 200 ? "..." : ""));

    if (!response.ok) {
      console.error("[TeacherModuleDetailsAPI] Fetch failed:", response.status, rawResponse.slice(0, 100));
      if (response.status === 401) {
        return NextResponse.json(
          { error: "Session expired", redirect: "/auth/signin" },
          {
            status: 401,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-store",
            },
          }
        );
      }
      if (response.status === 404) {
        return NextResponse.json(
          { error: `Module with ID ${id} not found` },
          {
            status: 404,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-store",
            },
          }
        );
      }
      return NextResponse.json(
        { error: "Failed to fetch module", details: rawResponse.slice(0, 100) },
        {
          status: response.status,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        }
      );
    }

    if (!contentType.includes("application/json")) {
      console.error("[TeacherModuleDetailsAPI] Non-JSON response received:", contentType);
      return NextResponse.json(
        { error: "Invalid response format, expected JSON" },
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        }
      );
    }

    let data;
    try {
      data = JSON.parse(rawResponse);
    } catch (parseError) {
      console.error("[TeacherModuleDetailsAPI] Failed to parse JSON:", parseError);
      return NextResponse.json(
        { error: "Invalid response format" },
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        }
      );
    }

    // Normalize data if needed
    const normalizedData = {
      id: data.module.id.toString(),
      title: data.module.title,
      description: data.module.description,
      difficulty: data.module.difficulty,
      category: data.module.category,
      estimatedDuration: data.module.estimatedDuration,
      order: data.module.order,
      active: data.module.active,
      isPublished: data.module.isPublished,
      course: data.module.course,
      createdAt: data.module.createdAt,
      updatedAt: data.module.updatedAt,
      lessons: data.module.lessons || [],
      lessonCount: data.module.lessons?.length || 0,
    };

    console.log("[TeacherModuleDetailsAPI] Fetch successful, normalized data:", normalizedData);
    return NextResponse.json(normalizedData, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("[TeacherModuleDetailsAPI] Fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch module", details: (error as Error).message },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
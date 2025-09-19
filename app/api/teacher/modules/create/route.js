
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { unstable_noStore as noStore } from "next/cache";

const BASE_URL = "https://texagonbackend.epichouse.online";
const API_KEY = "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

const headers = (sessionToken) => ({
  "Authorization": `Api-Key ${API_KEY}`,
  "Content-Type": "application/json",
  ...(sessionToken && { "X-Session-Token": sessionToken }),
});

export async function POST(req) {
  noStore();
  const endpoint = "/learning/api/teacher/modules/create/";
  const fullUrl = `${BASE_URL}${endpoint}`;
  console.log("[TeacherModulesCreateAPI] Initiating fetch for:", fullUrl);

  const session = await getServerSession(authOptions);
  console.log("[TeacherModulesCreateAPI] Session retrieved:", {
    sessionToken: session?.user?.sessionToken,
    user: session?.user ? { id: session.user.id, role: session.user.role } : null,
  });

  if (!session?.user?.sessionToken) {
    console.log("[TeacherModulesCreateAPI] No session token found");
    return NextResponse.json(
      { error: "Not authenticated", redirect: "/login" },
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
    const body = await req.json();
    console.log("[TeacherModulesCreateAPI] Request body:", body);

    // Validate required fields
    const { title, course_id, categoryId, difficulty, estimatedDuration, order } = body;
    if (!title || !course_id || !categoryId || !difficulty || !estimatedDuration || !order) {
      console.log("[TeacherModulesCreateAPI] Missing required fields");
      return NextResponse.json(
        { error: "Missing required fields" },
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        }
      );
    }

    console.log("[TeacherModulesCreateAPI] Fetching from", fullUrl, "with token:", session.user.sessionToken);
    const response = await fetch(fullUrl, {
      method: "POST",
      headers: headers(session.user.sessionToken),
      body: JSON.stringify(body),
    });

    console.log("[TeacherModulesCreateAPI] Fetch response status:", response.status);
    console.log("[TeacherModulesCreateAPI] Fetch response headers:", Object.fromEntries(response.headers));
    console.log("[TeacherModulesCreateAPI] Fetch response content-type:", response.headers.get("content-type"));

    const contentType = response.headers.get("content-type") || "";
    const rawResponse = await response.text();
    console.log("[TeacherModulesCreateAPI] Raw response:", rawResponse.slice(0, 200) + (rawResponse.length > 200 ? "..." : ""));

    if (!response.ok) {
      console.error("[TeacherModulesCreateAPI] Fetch failed:", response.status, rawResponse.slice(0, 100));
      if (response.status === 401) {
        return NextResponse.json(
          { error: "Session expired", redirect: "/login" },
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
          { error: "Module create endpoint not found" },
          {
            status: 404,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-store",
            },
          }
        );
      }
      // Handle duplicate order error
      if (response.status === 400 && rawResponse.includes("duplicate key value violates unique constraint")) {
        return NextResponse.json(
          { error: "Duplicate order for this course" },
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-store",
            },
          }
        );
      }
      return NextResponse.json(
        { error: "Failed to create module", details: rawResponse },
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
      console.error("[TeacherModulesCreateAPI] Non-JSON response received:", contentType);
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
      console.error("[TeacherModulesCreateAPI] Failed to parse JSON:", parseError);
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

    if (!data.module) {
      console.error("[TeacherModulesCreateAPI] Response does not contain a module object:", data);
      return NextResponse.json(
        { error: "Invalid response format, expected module object" },
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        }
      );
    }

    const normalizedData = {
      id: data.module.id.toString(),
      title: data.module.title,
      description: data.module.description,
      difficulty: data.module.difficulty,
      category: {
        id: data.module.category?.id?.toString() || "",
        name: data.module.category?.name || "",
      },
      estimatedDuration: data.module.estimatedDuration,
      order: data.module.order,
      active: data.module.active,
      isPublished: data.module.isPublished,
      course: {
        id: data.module.course?.id?.toString() || "",
        name: data.module.course?.name || "",
      },
      createdAt: data.module.createdAt,
      updatedAt: data.module.updatedAt,
      lessons: data.module.lessons || [],
      lessonCount: data.module.lessonCount || 0,
    };

    console.log("[TeacherModulesCreateAPI] Fetch successful, normalized data:", normalizedData);
    return NextResponse.json(normalizedData, {
      status: 201,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("[TeacherModulesCreateAPI] Fetch error:", error);
    return NextResponse.json(
      { error: "Failed to create module", details: error.message },
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

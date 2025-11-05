import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { unstable_noStore as noStore } from "next/cache";

const BASE_URL = "https://texagonbackend.epichouse.online";
const API_KEY = "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

const headers = (sessionToken: string | undefined) => ({
  "Authorization": `Api-Key ${API_KEY}`,
  "Content-Type": "application/json",
  ...(sessionToken && { "X-Session-Token": sessionToken }),
});

export async function DELETE(
  req: Request,
  { params }: { params: { id: string; lessonId: string } }
) {
  noStore();
  const moduleId = params.id;
  const lessonId = params.lessonId;
  const endpoint = `/learning/api/teacher/modules/${moduleId}/lessons/${lessonId}/delete/`;
  const fullUrl = `${BASE_URL}${endpoint}`;
  console.log("[LessonDeleteAPI] Initiating DELETE request for:", fullUrl);

  const session = await getServerSession(authOptions);
  console.log("[LessonDeleteAPI] Session retrieved:", {
    sessionToken: session?.user?.sessionToken,
    user: session?.user ? { id: session.user.id, role: session.user.role } : null,
  });

  if (!session?.user?.sessionToken) {
    console.log("[LessonDeleteAPI] No session token found");
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
    console.log("[LessonDeleteAPI] Sending DELETE to", fullUrl, "with token:", session.user.sessionToken);
    const response = await fetch(fullUrl, {
      method: "DELETE",
      headers: headers(session.user.sessionToken),
    });

    console.log("[LessonDeleteAPI] Response status:", response.status);
    console.log("[LessonDeleteAPI] Response headers:", Object.fromEntries(response.headers));

    const contentType = response.headers.get("content-type") || "";
    const rawResponse = await response.text();
    console.log("[LessonDeleteAPI] Raw response:", rawResponse.slice(0, 200) + (rawResponse.length > 200 ? "..." : ""));

    if (!response.ok) {
      console.error("[LessonDeleteAPI] Fetch failed:", response.status, rawResponse.slice(0, 100));
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
          { error: `Lesson with ID ${lessonId} not found in module ${moduleId}` },
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
        { error: "Failed to delete lesson" },
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
      console.error("[LessonDeleteAPI] Non-JSON response received:", contentType);
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
      console.error("[LessonDeleteAPI] Failed to parse JSON:", parseError);
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

    console.log("[LessonDeleteAPI] Deletion successful, data:", data);
    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("[LessonDeleteAPI] Fetch error:", error);
    return NextResponse.json(
      { error: "Failed to delete lesson", details: (error as Error).message },
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
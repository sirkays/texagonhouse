import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { unstable_noStore as noStore } from "next/cache";

const BASE_URL = "https://texagonbackend.onrender.com";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

const headers = (sessionToken) => ({
  "Authorization": `Api-Key ${API_KEY}`,
  "Content-Type": "application/json",
  ...(sessionToken && { "X-Session-Token": sessionToken }),
});

export async function GET(req) {
  noStore();
  const endpoint = "/academics/teacher-analytics/";
  const fullUrl = `${BASE_URL}${endpoint}`;
  console.log("[TeacherAnalyticsAPI] Initiating fetch for:", fullUrl);

  const session = await getServerSession(authOptions);
  console.log("[TeacherAnalyticsAPI] Session retrieved:", {
    sessionToken: session?.user?.sessionToken,
    user: session?.user
      ? { id: session.user.id, role: session.user.role }
      : null,
  });

  if (!session?.user?.sessionToken) {
    console.log("[TeacherAnalyticsAPI] No session token found");
    return NextResponse.json(
      { error: "Not authenticated" },
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  }

  try {
    console.log(
      "[TeacherAnalyticsAPI] Fetching from",
      fullUrl,
      "with token:",
      session.user.sessionToken
    );
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: headers(session.user.sessionToken),
    });

    console.log(
      "[TeacherAnalyticsAPI] Fetch response status:",
      response.status
    );
    console.log(
      "[TeacherAnalyticsAPI] Fetch response headers:",
      Object.fromEntries(response.headers)
    );
    console.log(
      "[TeacherAnalyticsAPI] Fetch response content-type:",
      response.headers.get("content-type")
    );

    const contentType = response.headers.get("content-type") || "";
    const rawResponse = await response.text();
    console.log(
      "[TeacherAnalyticsAPI] Raw response:",
      rawResponse.slice(0, 200) + (rawResponse.length > 200 ? "..." : "")
    );

    if (!response.ok) {
      console.error(
        "[TeacherAnalyticsAPI] Fetch failed:",
        response.status,
        rawResponse.slice(0, 100)
      );
      if (response.status === 401) {
        return NextResponse.json(
          { error: "Authentication credentials were not provided" },
          {
            status: 401,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-store",
            },
          }
        );
      }
      if (response.status === 403) {
        return NextResponse.json(
          { error: "Forbidden" },
          {
            status: 403,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-store",
            },
          }
        );
      }
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Teacher profile not found" },
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
        { error: "Failed to fetch teacher analytics" },
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
      console.error(
        "[TeacherAnalyticsAPI] Non-JSON response received:",
        contentType
      );
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
      console.error("[TeacherAnalyticsAPI] Failed to parse JSON:", parseError);
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

    console.log("[TeacherAnalyticsAPI] Fetch successful, data:", data);
    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("[TeacherAnalyticsAPI] Fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch teacher analytics", details: error.message },
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

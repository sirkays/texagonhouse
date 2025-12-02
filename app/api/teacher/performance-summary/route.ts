// app/api/teacher/performance-summary/route.ts
import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {unstable_noStore as noStore} from "next/cache";

const BASE_URL = "https://texagonbackend.onrender.com/assessments";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

const headers = (sessionToken: string | undefined) => ({
  Authorization: `Api-Key ${API_KEY}`,
  "Content-Type": "application/json",
  ...(sessionToken && {"X-Session-Token": sessionToken}),
});

interface PerformanceSummary {
  totalAttempts: number;
  averageScore: number;
  passRate: number;
  averageCompletionTime: number;
}

export async function GET(req: Request) {
  noStore();
  const {searchParams} = new URL(req.url);
  const test_id = searchParams.get("test_id") || "";
  const endpoint = `/api/student/performance-summary/${
    test_id ? `?test_id=${test_id}` : ""
  }`;
  const fullUrl = `${BASE_URL}${endpoint}`;
  console.log("[TeacherPerformanceSummaryAPI] Initiating fetch for:", fullUrl);

  const session = await getServerSession(authOptions);
  console.log("[TeacherPerformanceSummaryAPI] Session retrieved:", {
    sessionToken: session?.user?.sessionToken,
    user: session?.user ? {id: session.user.id, role: session.user.role} : null,
  });

  if (!session?.user?.sessionToken) {
    console.log("[TeacherPerformanceSummaryAPI] No session token found");
    return NextResponse.json(
      {error: "Not authenticated", redirect: "/login"},
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
      "[TeacherPerformanceSummaryAPI] Fetching from",
      fullUrl,
      "with token:",
      session.user.sessionToken
    );
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: headers(session.user.sessionToken),
    });

    console.log(
      "[TeacherPerformanceSummaryAPI] Fetch response status:",
      response.status
    );
    console.log(
      "[TeacherPerformanceSummaryAPI] Fetch response headers:",
      Object.fromEntries(response.headers)
    );
    console.log(
      "[TeacherPerformanceSummaryAPI] Fetch response content-type:",
      response.headers.get("content-type")
    );

    const contentType = response.headers.get("content-type") || "";
    const rawResponse = await response.text();
    console.log(
      "[TeacherPerformanceSummaryAPI] Raw response:",
      rawResponse.slice(0, 200) + (rawResponse.length > 200 ? "..." : "")
    );

    if (!response.ok) {
      console.error(
        "[TeacherPerformanceSummaryAPI] Fetch failed:",
        response.status,
        rawResponse.slice(0, 100)
      );
      if (response.status === 401) {
        return NextResponse.json(
          {error: "Session expired", redirect: "/login"},
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
          {error: "Forbidden"},
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
          {error: "Performance summary endpoint not found"},
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
        {error: "Failed to fetch performance summary"},
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
        "[TeacherPerformanceSummaryAPI] Non-JSON response received:",
        contentType
      );
      return NextResponse.json(
        {error: "Invalid response format, expected JSON"},
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        }
      );
    }

    let data: PerformanceSummary;
    try {
      data = JSON.parse(rawResponse);
    } catch (parseError) {
      console.error(
        "[TeacherPerformanceSummaryAPI] Failed to parse JSON:",
        parseError
      );
      return NextResponse.json(
        {error: "Invalid response format"},
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        }
      );
    }

    const normalizedData: PerformanceSummary = {
      totalAttempts: data.totalAttempts || 0,
      averageScore: data.averageScore || 0,
      passRate: data.passRate || 0,
      averageCompletionTime: data.averageCompletionTime || 0,
    };

    console.log(
      "[TeacherPerformanceSummaryAPI] Fetch successful, normalized data:",
      normalizedData
    );
    return NextResponse.json(normalizedData, {
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
    console.error("[TeacherPerformanceSummaryAPI] Fetch error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch performance summary",
        details: (error as Error).message,
      },
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

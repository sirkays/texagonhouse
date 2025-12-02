// app/api/teacher/performance-list/route.ts
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

interface PerformanceItem {
  id: string;
  studentName: string;
  studentId: string;
  email: string;
  classGrade: string;
  score: number;
  totalMarks: number;
  percentage: number;
  completionTime: number;
  status: string;
  submittedAt: string;
  testId: string;
  testTitle: string;
}

interface PerformanceListResponse {
  performances: PerformanceItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export async function GET(req: Request) {
  noStore();
  const {searchParams} = new URL(req.url);
  const params = new URLSearchParams();
  if (searchParams.get("test_id"))
    params.append("test_id", searchParams.get("test_id")!);
  if (searchParams.get("student_filter"))
    params.append("student_filter", searchParams.get("student_filter")!);
  if (searchParams.get("sort_field"))
    params.append("sort_field", searchParams.get("sort_field")!);
  if (searchParams.get("sort_order"))
    params.append("sort_order", searchParams.get("sort_order")!);
  if (searchParams.get("page"))
    params.append("page", searchParams.get("page")!);
  if (searchParams.get("limit"))
    params.append("limit", searchParams.get("limit")!);

  const queryString = params.toString();
  const endpoint = `/api/student-list/performance/${
    queryString ? `?${queryString}` : ""
  }`;
  const fullUrl = `${BASE_URL}${endpoint}`;
  console.log("[TeacherPerformanceListAPI] Initiating fetch for:", fullUrl);

  const session = await getServerSession(authOptions);
  console.log("[TeacherPerformanceListAPI] Session retrieved:", {
    sessionToken: session?.user?.sessionToken,
    user: session?.user ? {id: session.user.id, role: session.user.role} : null,
  });

  if (!session?.user?.sessionToken) {
    console.log("[TeacherPerformanceListAPI] No session token found");
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
      "[TeacherPerformanceListAPI] Fetching from",
      fullUrl,
      "with token:",
      session.user.sessionToken
    );
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: headers(session.user.sessionToken),
    });

    console.log(
      "[TeacherPerformanceListAPI] Fetch response status:",
      response.status
    );
    console.log(
      "[TeacherPerformanceListAPI] Fetch response headers:",
      Object.fromEntries(response.headers)
    );
    console.log(
      "[TeacherPerformanceListAPI] Fetch response content-type:",
      response.headers.get("content-type")
    );

    const contentType = response.headers.get("content-type") || "";
    const rawResponse = await response.text();
    console.log(
      "[TeacherPerformanceListAPI] Raw response:",
      rawResponse.slice(0, 200) + (rawResponse.length > 200 ? "..." : "")
    );

    if (!response.ok) {
      console.error(
        "[TeacherPerformanceListAPI] Fetch failed:",
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
          {error: "Performance list endpoint not found"},
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
        {error: "Failed to fetch performance list"},
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
        "[TeacherPerformanceListAPI] Non-JSON response received:",
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

    let data: PerformanceListResponse;
    try {
      data = JSON.parse(rawResponse);
    } catch (parseError) {
      console.error(
        "[TeacherPerformanceListAPI] Failed to parse JSON:",
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

    if (!Array.isArray(data.performances)) {
      console.error(
        "[TeacherPerformanceListAPI] Response does not contain a performances array:",
        data
      );
      return NextResponse.json(
        {error: "Invalid response format, expected performances array"},
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        }
      );
    }

    const normalizedPerformances: PerformanceItem[] = data.performances.map(
      (item) => ({
        id: item.id || "",
        studentName: item.studentName || "",
        studentId: item.studentId || "",
        email: item.email || "",
        classGrade: item.classGrade || "N/A",
        score: item.score || 0,
        totalMarks: item.totalMarks || 0,
        percentage: item.percentage || 0,
        completionTime: item.completionTime || 0,
        status: item.status || "",
        submittedAt: item.submittedAt || "",
        testId: item.testId || "",
        testTitle: item.testTitle || "",
      })
    );

    const normalizedData: PerformanceListResponse = {
      performances: normalizedPerformances,
      pagination: {
        page: data.pagination.page || 1,
        limit: data.pagination.limit || 10,
        total: data.pagination.total || 0,
        pages: data.pagination.pages || 1,
      },
    };

    console.log(
      "[TeacherPerformanceListAPI] Fetch successful, normalized data:",
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
    console.error("[TeacherPerformanceListAPI] Fetch error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch performance list",
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

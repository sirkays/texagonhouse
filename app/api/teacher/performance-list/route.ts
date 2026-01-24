// app/api/teacher/performance-list/route.ts
import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetch } from "@/app/api/_lib/proxy";

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

  const { searchParams } = new URL(req.url);
  const params = new URLSearchParams();

  const passthroughKeys = [
    "test_id",
    "student_filter",
    "sort_field",
    "sort_order",
    "page",
    "limit",
  ] as const;

  for (const key of passthroughKeys) {
    const val = searchParams.get(key);
    if (val) params.append(key, val);
  }

  const queryString = params.toString();

  // Note: proxy.ts BASE_URL should be domain only, so include /assessments here.
  const endpoint = `/assessments/api/student-list/performance/${
    queryString ? `?${queryString}` : ""
  }`;

  try {
    const { response, text, setCookie } = await djangoFetch(endpoint, {
      method: "GET",
    });

    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
      console.error(
        "[TeacherPerformanceListAPI] Fetch failed:",
        response.status,
        (text || "").slice(0, 100)
      );

      let payload: any = { error: "Failed to fetch performance list" };

      if (response.status === 401)
        payload = { error: "Session expired", redirect: "/login" };
      if (response.status === 403) payload = { error: "Forbidden" };
      if (response.status === 404)
        payload = { error: "Performance list endpoint not found" };

      const nextRes = NextResponse.json(payload, { status: response.status });
      if (setCookie) nextRes.headers.set("set-cookie", setCookie);
      nextRes.headers.set("Cache-Control", "no-store");
      return nextRes;
    }

    if (!contentType.includes("application/json")) {
      console.error(
        "[TeacherPerformanceListAPI] Non-JSON response received:",
        contentType
      );

      const nextRes = NextResponse.json(
        { error: "Invalid response format, expected JSON" },
        { status: 500 }
      );
      if (setCookie) nextRes.headers.set("set-cookie", setCookie);
      nextRes.headers.set("Cache-Control", "no-store");
      return nextRes;
    }

    let data: PerformanceListResponse;
    try {
      data = text ? (JSON.parse(text) as PerformanceListResponse) : ({} as any);
    } catch (parseError) {
      console.error(
        "[TeacherPerformanceListAPI] Failed to parse JSON:",
        parseError
      );

      const nextRes = NextResponse.json(
        { error: "Invalid response format" },
        { status: 500 }
      );
      if (setCookie) nextRes.headers.set("set-cookie", setCookie);
      nextRes.headers.set("Cache-Control", "no-store");
      return nextRes;
    }

    if (!Array.isArray((data as any).performances)) {
      console.error(
        "[TeacherPerformanceListAPI] Response does not contain a performances array:",
        data
      );

      const nextRes = NextResponse.json(
        { error: "Invalid response format, expected performances array" },
        { status: 500 }
      );
      if (setCookie) nextRes.headers.set("set-cookie", setCookie);
      nextRes.headers.set("Cache-Control", "no-store");
      return nextRes;
    }

    const normalizedPerformances: PerformanceItem[] = data.performances.map(
      (item: any) => ({
        id: item?.id || "",
        studentName: item?.studentName || "",
        studentId: item?.studentId || "",
        email: item?.email || "",
        classGrade: item?.classGrade || "N/A",
        score: item?.score || 0,
        totalMarks: item?.totalMarks || 0,
        percentage: item?.percentage || 0,
        completionTime: item?.completionTime || 0,
        status: item?.status || "",
        submittedAt: item?.submittedAt || "",
        testId: item?.testId || "",
        testTitle: item?.testTitle || "",
      })
    );

    const normalizedData: PerformanceListResponse = {
      performances: normalizedPerformances,
      pagination: {
        page: data?.pagination?.page || 1,
        limit: data?.pagination?.limit || 10,
        total: data?.pagination?.total || 0,
        pages: data?.pagination?.pages || 1,
      },
    };

    const nextRes = NextResponse.json(normalizedData, { status: 200 });
    if (setCookie) nextRes.headers.set("set-cookie", setCookie);
    nextRes.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    nextRes.headers.set("Pragma", "no-cache");
    nextRes.headers.set("Expires", "0");
    return nextRes;
  } catch (error) {
    console.error("[TeacherPerformanceListAPI] Fetch error:", error);

    const nextRes = NextResponse.json(
      {
        error: "Failed to fetch performance list",
        details: (error as Error).message,
      },
      { status: 500 }
    );
    nextRes.headers.set("Cache-Control", "no-store");
    return nextRes;
  }
}

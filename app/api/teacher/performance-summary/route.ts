// app/api/teacher/performance-summary/route.ts
import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetch } from "@/app/api/_lib/proxy";

interface PerformanceSummary {
  totalAttempts: number;
  averageScore: number;
  passRate: number;
  averageCompletionTime: number;
}

export async function GET(req: Request) {
  noStore();

  const { searchParams } = new URL(req.url);
  const test_id = searchParams.get("test_id") || "";

  const endpoint = `/assessments/api/student/performance-summary/${
    test_id ? `?test_id=${encodeURIComponent(test_id)}` : ""
  }`;

  try {
    const { response, text, setCookie } = await djangoFetch(endpoint, {
      method: "GET",
    });

    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
      console.error(
        "[TeacherPerformanceSummaryAPI] Fetch failed:",
        response.status,
        (text || "").slice(0, 100)
      );

      let payload: any = { error: "Failed to fetch performance summary" };

      if (response.status === 401)
        payload = { error: "Session expired", redirect: "/login" };
      if (response.status === 403) payload = { error: "Forbidden" };
      if (response.status === 404)
        payload = { error: "Performance summary endpoint not found" };

      const nextRes = NextResponse.json(payload, { status: response.status });
      if (setCookie) nextRes.headers.set("set-cookie", setCookie);
      nextRes.headers.set("Cache-Control", "no-store");
      return nextRes;
    }

    if (!contentType.includes("application/json")) {
      console.error(
        "[TeacherPerformanceSummaryAPI] Non-JSON response received:",
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

    let data: PerformanceSummary;
    try {
      data = text ? (JSON.parse(text) as PerformanceSummary) : ({} as any);
    } catch (parseError) {
      console.error(
        "[TeacherPerformanceSummaryAPI] Failed to parse JSON:",
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

    const normalizedData: PerformanceSummary = {
      totalAttempts: data?.totalAttempts || 0,
      averageScore: data?.averageScore || 0,
      passRate: data?.passRate || 0,
      averageCompletionTime: data?.averageCompletionTime || 0,
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
    console.error("[TeacherPerformanceSummaryAPI] Fetch error:", error);

    const nextRes = NextResponse.json(
      {
        error: "Failed to fetch performance summary",
        details: (error as Error).message,
      },
      { status: 500 }
    );
    nextRes.headers.set("Cache-Control", "no-store");
    return nextRes;
  }
}

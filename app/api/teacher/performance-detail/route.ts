// app/api/teacher/performance-detail/route.ts
import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetch } from "@/app/api/_lib/proxy";

interface Student {
  studentName: string;
  studentId: string;
  email: string;
  classGrade: string;
}

interface Test {
  testTitle: string;
  testId: string;
  score: number;
  totalMarks: number;
  percentage: number;
  status: string;
  completionTime: number;
  submittedAt: string | null;
}

interface Answer {
  question: string;
  selected: string;
  correct: string;
  status: string;
}

interface PerformanceDetail {
  student: Student;
  test: Test;
  answers: Answer[];
}

export async function GET(req: Request) {
  noStore();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { detail: "id required." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  // Note: proxy.ts BASE_URL should be the domain only (no /assessments),
  // so we include /assessments in the path here.
  const endpoint = `/assessments/api/student-detail/performance/?id=${encodeURIComponent(
    id
  )}`;

  try {
    const { response, text, setCookie } = await djangoFetch(endpoint, {
      method: "GET",
    });

    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
      console.error(
        "[TeacherPerformanceDetailAPI] Fetch failed:",
        response.status,
        (text || "").slice(0, 100)
      );

      let payload: any = { error: "Failed to fetch performance detail" };

      if (response.status === 400) payload = { detail: "id required." };
      if (response.status === 401)
        payload = { error: "Session expired", redirect: "/login" };
      if (response.status === 403) payload = { detail: "Forbidden." };
      if (response.status === 404) payload = { detail: "Not found." };

      const nextRes = NextResponse.json(payload, { status: response.status });
      if (setCookie) nextRes.headers.set("set-cookie", setCookie);
      nextRes.headers.set("Cache-Control", "no-store");
      return nextRes;
    }

    if (!contentType.includes("application/json")) {
      console.error(
        "[TeacherPerformanceDetailAPI] Non-JSON response received:",
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

    let data: PerformanceDetail;
    try {
      data = text ? (JSON.parse(text) as PerformanceDetail) : ({} as any);
      console.log("[DEBUG proxy] Received answers from backend:", JSON.stringify(data.answers, null, 2));
    } catch (parseError) {
      console.error(
        "[TeacherPerformanceDetailAPI] Failed to parse JSON:",
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

    const normalizedData: PerformanceDetail = {
      student: {
        studentName: data?.student?.studentName || "",
        studentId: data?.student?.studentId || "",
        email: data?.student?.email || "",
        classGrade: data?.student?.classGrade || "N/A",
      },
      test: {
        testTitle: data?.test?.testTitle || "",
        testId: data?.test?.testId || "",
        score: data?.test?.score || 0,
        totalMarks: data?.test?.totalMarks || 0,
        percentage: data?.test?.percentage || 0,
        status: data?.test?.status || "",
        completionTime: data?.test?.completionTime || 0,
        submittedAt: data?.test?.submittedAt || null,
      },
      answers: Array.isArray(data?.answers)
        ? data.answers.map((answer) => ({
            question: answer?.question || "",
            selected: answer?.selected || "",
            correct: answer?.correct || "",
            status: answer?.status || "",
          }))
        : [],
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
    console.error("[TeacherPerformanceDetailAPI] Fetch error:", error);
    const nextRes = NextResponse.json(
      {
        error: "Failed to fetch performance detail",
        details: (error as Error).message,
      },
      { status: 500 }
    );
    nextRes.headers.set("Cache-Control", "no-store");
    return nextRes;
  }
}

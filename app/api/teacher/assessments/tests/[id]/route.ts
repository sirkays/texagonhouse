// texagon_academy\texagonui\app\api\teacher\assessments\tests\[id]\route.ts
import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetch } from "@/app/api/_lib/proxy";
import { normalizeMedia } from "@/lib/utils";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  noStore();

  const { id } = await context.params;
  const path = `/assessments/api/teacher/tests/${id}/`;

  try {
    const { response, text, setCookie } = await djangoFetch(path, {
      method: "GET",
    });

    const contentType = response.headers.get("content-type") || "";

    const baseHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    };
    if (setCookie) baseHeaders["Set-Cookie"] = setCookie;

    if (!response.ok) {
      console.error(
        "[TestDetailAPI] Request failed:",
        response.status,
        text.slice(0, 100)
      );

      if (response.status === 401) {
        // covers both "not authenticated" and "session expired" cases
        return NextResponse.json({ error: "Session expired" }, { status: 401, headers: baseHeaders });
      }
      if (response.status === 404) {
        return NextResponse.json({ error: "Test not found" }, { status: 404, headers: baseHeaders });
      }

      return NextResponse.json(
        { error: "Failed to fetch test" },
        { status: response.status, headers: baseHeaders }
      );
    }

    if (!contentType.includes("application/json")) {
      console.error("[TestDetailAPI] Non-JSON response received:", contentType);
      return NextResponse.json(
        { error: "Invalid response format, expected JSON" },
        { status: 500, headers: baseHeaders }
      );
    }

    let data: any;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error("[TestDetailAPI] Failed to parse JSON:", parseError);
      return NextResponse.json(
        { error: "Invalid response format" },
        { status: 500, headers: baseHeaders }
      );
    }

    const processedData = {
      test: {
        id: data.test?.id || "",
        course_id: data.test?.course_id || "",
        mode: data.test?.mode || "",
        courseId: data.test?.course_id || "",
        title: data.test?.title || "",
        instructions: data.test?.instructions || "",
        duration: data.test?.duration || 0,
        total_marks: data.test?.total_marks || 0,
        totalPoints: data.test?.totalPoints || 0,
        difficulty: data.test?.difficulty || "Medium",
        category: data.test?.category || "",
        isPublished: data.test?.isPublished || false,
        questionsCount: data.test?.questionsCount || 0,
        createdAt: data.test?.createdAt || "",
        updatedAt: data.test?.updatedAt || "",
        start_at: data.test?.start_at || null,
        end_at: data.test?.end_at || null,
        excluded_students: data.test?.excluded_students || null,
        require_browser_code: data.test?.require_browser_code ?? false,
        questions: Array.isArray(data.test?.questions)
          ? data.test.questions.map((q: any) => ({
              id: q.id || "",
              type: q.type || "",
              question: q.question || "",
              points: q.points || 0,
              options: q.options || [],
              explanation: q.explanation || "",
              difficulty: q.difficulty || "Medium",
              correctAnswer:
                q.correctAnswer ??
                (q.type === "multiple-choice"
                  ? 0
                  : q.type === "true-false"
                  ? false
                  : q.type === "short-answer"
                  ? ""
                  : ""),
              image: q.image ? normalizeMedia(q.image) : null,
            }))
          : [],
      },
    };

    return NextResponse.json(processedData, {
      status: 200,
      headers: baseHeaders,
    });
  } catch (error) {
    console.error("[TestDetailAPI] Request error:", error);
    return NextResponse.json(
      { error: "Failed to fetch test", details: (error as Error).message },
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

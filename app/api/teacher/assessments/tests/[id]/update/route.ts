// texagon_academy\texagonui\app\api\teacher\assessments\tests\[id]\update\route.ts
import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetch } from "@/app/api/_lib/proxy";
import { normalizeMedia } from "@/lib/utils";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  noStore();

  const { id } = await context.params;
  const endpoint = `/assessments/api/teacher/tests/${id}/update/`;

  try {
    const body = await req.json();

    const { response, text, setCookie } = await djangoFetch(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
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
        "[TestUpdateAPI] Request failed:",
        response.status,
        text.slice(0, 100)
      );

      if (response.status === 401) {
        return NextResponse.json(
          { error: "Session expired" },
          { status: 401, headers: baseHeaders }
        );
      }

      if (response.status === 404) {
        return NextResponse.json(
          { error: "Test update endpoint not found" },
          { status: 404, headers: baseHeaders }
        );
      }

      return NextResponse.json(
        { error: "Failed to update test" },
        { status: response.status, headers: baseHeaders }
      );
    }

    if (!contentType.includes("application/json")) {
      console.error("[TestUpdateAPI] Non-JSON response received:", contentType);
      return NextResponse.json(
        { error: "Invalid response format, expected JSON" },
        { status: 500, headers: baseHeaders }
      );
    }

    let data: any;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error("[TestUpdateAPI] Failed to parse JSON:", parseError);
      return NextResponse.json(
        { error: "Invalid response format" },
        { status: 500, headers: baseHeaders }
      );
    }

    // Validate and transform response to match test specification
    const processedData = {
      test: {
        id: data.test?.id || "",
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
        mode: data.test?.mode || "online",
        excluded_students: data.test?.excluded_students || null,
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
                  : ""),
              image: q.image ? normalizeMedia(q.image) : null,
            }))
          : [],
      },
      message: data.message || "Test updated successfully.",
    };

    return NextResponse.json(processedData, {
      status: 200,
      headers: baseHeaders,
    });
  } catch (error) {
    console.error("[TestUpdateAPI] Request error:", error);
    return NextResponse.json(
      { error: "Failed to update test", details: (error as Error).message },
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

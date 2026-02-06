// texagon_academy\texagonui\app\api\teacher\assessments\tests\create\route.ts
import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function POST(
  req: Request,
  { params }: { params: { path?: string[] } }
) {
  noStore();

  const endpoint = "/assessments/api/teacher/tests/create/";

  try {
    const body = await req.json();

    // Validate and transform request body
    const processedBody = {
      title: body.title || "",
      description: body.description || "",
      instructions: body.instructions || "",
      duration: body.duration || 0,
      difficulty: body.difficulty || "Medium",
      course_id: body.course_id || 0,
      category: body.category || "",
      start_at: body.start_at || null,
      end_at: body.end_at || null,
      total_marks: body.total_marks || 0,
      mode: body.mode || "online",
    };

    const { response, text, setCookie } = await djangoFetch(endpoint, {
      method: "POST",
      body: JSON.stringify(processedBody),
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
      console.error("[TestCreateAPI] Request failed:", response.status, text.slice(0, 100));

      if (response.status === 401) {
        return NextResponse.json({ error: "Session expired" }, { status: 401, headers: baseHeaders });
      }
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Test creation endpoint not found" },
          { status: 404, headers: baseHeaders }
        );
      }

      return NextResponse.json(
        { error: "Failed to create test" },
        { status: response.status, headers: baseHeaders }
      );
    }

    if (!contentType.includes("application/json")) {
      console.error("[TestCreateAPI] Non-JSON response received:", contentType);
      return NextResponse.json(
        { error: "Invalid response format, expected JSON" },
        { status: 500, headers: baseHeaders }
      );
    }

    let data: any;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error("[TestCreateAPI] Failed to parse JSON:", parseError);
      return NextResponse.json(
        { error: "Invalid response format" },
        { status: 500, headers: baseHeaders }
      );
    }

    // Validate and transform response
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
            }))
          : [],
      },
      message: data.message || "Test created successfully.",
    };

    return NextResponse.json(processedData, { status: 201, headers: baseHeaders });
  } catch (error) {
    console.error("[TestCreateAPI] Request error:", error);
    return NextResponse.json(
      { error: "Failed to create test", details: (error as Error).message },
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

export async function PUT(req: Request, { params }: { params: { path: string[] } }) {
  noStore();

  const [segment1, testId, segment2, questionId] = params.path || [];
  let endpoint: string;
  let logPrefix: string;

  if (segment1 === "assessments" && segment2 === "questions") {
    endpoint = `/assessments/api/teacher/tests/${testId}/questions/${questionId}/update/`;
    logPrefix = "[QuestionUpdateAPI]";
  } else if (segment1 === "assessments" && !segment2) {
    endpoint = `/assessments/api/teacher/tests/${testId}/update/`;
    logPrefix = "[TestUpdateAPI]";
  } else {
    return NextResponse.json(
      { error: "Invalid endpoint" },
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      }
    );
  }

  try {
    const body = await req.json();

    // Process request body
    let processedBody: any = body;

    if (endpoint.includes("/tests/") && !endpoint.includes("/questions/")) {
      processedBody = {
        start_at: body.start_at || null,
        end_at: body.end_at || null,
      };
    } else if (endpoint.includes("/questions/")) {
      processedBody = {
        type: body.type || "",
        question: body.question || "",
        options: body.options || [],
        correctAnswer:
          body.correctAnswer ??
          (body.type === "multiple-choice"
            ? 0
            : body.type === "true-false"
            ? false
            : ""),
        points: body.points || 0,
        explanation: body.explanation || "",
        difficulty: body.difficulty || "Medium",
      };
    }

    const { response, text, setCookie } = await djangoFetch(endpoint, {
      method: "PUT",
      body: JSON.stringify(processedBody),
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
      console.error(`${logPrefix} Request failed:`, response.status, text.slice(0, 100));

      if (response.status === 401) {
        return NextResponse.json({ error: "Session expired" }, { status: 401, headers: baseHeaders });
      }
      if (response.status === 404) {
        return NextResponse.json(
          { error: `Endpoint not found: ${endpoint}` },
          { status: 404, headers: baseHeaders }
        );
      }

      return NextResponse.json(
        {
          error: `Failed to ${endpoint.includes("/questions/") ? "update question" : "update test"}`,
        },
        { status: response.status, headers: baseHeaders }
      );
    }

    if (!contentType.includes("application/json")) {
      console.error(`${logPrefix} Non-JSON response received:`, contentType);
      return NextResponse.json(
        { error: "Invalid response format, expected JSON" },
        { status: 500, headers: baseHeaders }
      );
    }

    let data: any;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error(`${logPrefix} Failed to parse JSON:`, parseError);
      return NextResponse.json(
        { error: "Invalid response format" },
        { status: 500, headers: baseHeaders }
      );
    }

    // Process response
    let processedData: any = data;

    if (endpoint.includes("/tests/") && !endpoint.includes("/questions/")) {
      processedData = {
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
              }))
            : [],
        },
        message: data.message || "Test updated successfully.",
      };
    } else if (endpoint.includes("/questions/")) {
      processedData = {
        question: {
          id: data.question?.id || "",
          type: data.question?.type || "",
          question: data.question?.question || "",
          points: data.question?.points || 0,
          options: data.question?.options || [],
          explanation: data.question?.explanation || "",
          difficulty: data.question?.difficulty || "Medium",
          correctAnswer:
            data.question?.correctAnswer ??
            (data.question?.type === "multiple-choice"
              ? 0
              : data.question?.type === "true-false"
              ? false
              : ""),
        },
        message: data.message || "Question updated successfully.",
      };
    }

    return NextResponse.json(processedData, { status: 200, headers: baseHeaders });
  } catch (error) {
    console.error(`${logPrefix} Request error:`, error);
    return NextResponse.json(
      {
        error: `Failed to ${endpoint.includes("/questions/") ? "update question" : "update test"}`,
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

import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetch } from "@/app/api/_lib/proxy";

const NO_STORE_HEADERS = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

function attachSetCookie(res: NextResponse, setCookie?: string) {
  if (setCookie) res.headers.set("set-cookie", setCookie);
  return res;
}

export async function POST(
  _req: Request,
  context: { params: Promise<{ testId: string }> }
) {
  noStore();

  const params = await context.params;
  const endpoint = `/assessments/api/teacher/tests/${params.testId}/duplicate/`;

  try {
    const { response, text, setCookie } = await djangoFetch(endpoint, {
      method: "POST",
    });

    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
      console.error(
        "[TestDuplicateAPI] Request failed:",
        response.status,
        (text || "").slice(0, 100)
      );

      if (response.status === 401) {
        const res = NextResponse.json(
          { error: "Session expired" },
          {
            status: 401,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-store",
            },
          }
        );
        return attachSetCookie(res, setCookie);
      }

      if (response.status === 404) {
        const res = NextResponse.json(
          { error: "Test not found" },
          {
            status: 404,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-store",
            },
          }
        );
        return attachSetCookie(res, setCookie);
      }

      const res = NextResponse.json(
        { error: "Failed to duplicate test" },
        {
          status: response.status,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        }
      );
      return attachSetCookie(res, setCookie);
    }

    if (!contentType.includes("application/json")) {
      console.error("[TestDuplicateAPI] Non-JSON response received:", contentType);
      const res = NextResponse.json(
        { error: "Invalid response format, expected JSON" },
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        }
      );
      return attachSetCookie(res, setCookie);
    }

    let data: any;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (parseError) {
      console.error("[TestDuplicateAPI] Failed to parse JSON:", parseError);
      const res = NextResponse.json(
        { error: "Invalid response format" },
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        }
      );
      return attachSetCookie(res, setCookie);
    }

    const processedData = {
      test: {
        id: data?.test?.id || "",
        title: data?.test?.title || "",
        instructions: data?.test?.instructions || "",
        duration: data?.test?.duration || 0,
        total_marks: data?.test?.total_marks || 0,
        totalPoints: data?.test?.totalPoints || 0,
        difficulty: data?.test?.difficulty || "Medium",
        category: data?.test?.category || "",
        isPublished: data?.test?.isPublished || false,
        questionsCount: data?.test?.questionsCount || 0,
        createdAt: data?.test?.createdAt || "",
        updatedAt: data?.test?.updatedAt || "",
        start_at: data?.test?.start_at || null,
        end_at: data?.test?.end_at || null,
        questions: Array.isArray(data?.test?.questions)
          ? data.test.questions.map((q: any) => ({
              id: q?.id || "",
              type: q?.type || "",
              question: q?.question || "",
              points: q?.points || 0,
              options: q?.options || [],
              explanation: q?.explanation || "",
              difficulty: q?.difficulty || "Medium",
              correctAnswer:
                q?.correctAnswer ??
                (q?.type === "multiple-choice"
                  ? 0
                  : q?.type === "true-false"
                  ? false
                  : q?.type === "short-answer"
                  ? ""
                  : ""),
            }))
          : [],
      },
      message: data?.message || "Test duplicated successfully.",
    };

    const res = NextResponse.json(processedData, {
      status: 201,
      headers: NO_STORE_HEADERS,
    });
    return attachSetCookie(res, setCookie);
  } catch (error) {
    console.error("[TestDuplicateAPI] Request error:", error);
    return NextResponse.json(
      { error: "Failed to duplicate test", details: (error as Error).message },
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

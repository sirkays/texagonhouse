import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetch } from "@/app/api/_lib/proxy";

function safeJsonParse<T = unknown>(text: string): T | null {
  try {
    if (!text) return null;
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function withTimeout(timeoutMs: number) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  return { signal: controller.signal, clear: () => clearTimeout(id) };
}

function attachSetCookie(res: NextResponse, setCookie?: string) {
  if (setCookie) res.headers.set("set-cookie", setCookie);
  return res;
}

export async function POST(
  req: Request,
  context: { params: Promise<{ testId: string }> }
) {
  noStore();

  const { testId } = await context.params;

  let body: any;
  try {
    body = await req.json();
  } catch (error: any) {
    return NextResponse.json(
      { error: "Invalid JSON body", details: error?.message || String(error) },
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      }
    );
  }

  // Validate and transform request body
  const processedBody = {
    isPublished: typeof body?.isPublished === "boolean" ? body.isPublished : false,
  };

  const t = withTimeout(20000);

  try {
    const startFetch = await djangoFetch(
      `/assessments/api/teacher/tests/${testId}/publish/`,
      {
        method: "POST",
        signal: t.signal,
        body: JSON.stringify(processedBody),
      }
    );

    const contentType =
      startFetch.response.headers.get("content-type") || "";
    const rawResponse = startFetch.text || "";

    if (!startFetch.response.ok) {
      console.error(
        "[TestPublishAPI] Request failed:",
        startFetch.response.status,
        rawResponse.slice(0, 100)
      );

      if (startFetch.response.status === 401) {
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
        return attachSetCookie(res, startFetch.setCookie);
      }

      if (startFetch.response.status === 404) {
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
        return attachSetCookie(res, startFetch.setCookie);
      }

      const parsedErr = safeJsonParse<any>(rawResponse);
      const msg =
        parsedErr?.detail ||
        parsedErr?.error ||
        "Failed to publish/unpublish test";

      const res = NextResponse.json(
        { error: msg, raw: rawResponse },
        {
          status: startFetch.response.status,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        }
      );
      return attachSetCookie(res, startFetch.setCookie);
    }

    if (!contentType.includes("application/json")) {
      console.error("[TestPublishAPI] Non-JSON response received:", contentType);

      const res = NextResponse.json(
        { error: "Invalid response format, expected JSON" },
        {
          status: 502,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        }
      );
      return attachSetCookie(res, startFetch.setCookie);
    }

    const data = safeJsonParse<any>(rawResponse);
    if (data === null) {
      const res = NextResponse.json(
        { error: "Invalid response format", raw: rawResponse.slice(0, 300) },
        {
          status: 502,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        }
      );
      return attachSetCookie(res, startFetch.setCookie);
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
        test_type: data.test?.mode || "online",
        questions: Array.isArray(data.test?.questions)
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
      message: data.message || "Test published/unpublished successfully.",
    };

    const res = NextResponse.json(processedData, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });

    return attachSetCookie(res, startFetch.setCookie);
  } catch (error: any) {
    const isTimeout = error?.name === "AbortError";
    console.error("[TestPublishAPI] Request error:", error);

    return NextResponse.json(
      {
        error: isTimeout ? "Connection timeout" : "Failed to publish/unpublish test",
        details: error?.message || String(error),
      },
      {
        status: isTimeout ? 504 : 500,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      }
    );
  } finally {
    t.clear();
  }
}

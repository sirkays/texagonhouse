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

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ testId: string; questionId: string }> }
) {
  noStore();

  const { testId, questionId } = await context.params;

  const t = withTimeout(15000);

  try {
    const startFetch = await djangoFetch(
      `/assessments/api/teacher/tests/${testId}/questions/${questionId}/delete/`,
      {
        method: "DELETE",
        signal: t.signal,
      }
    );

    const contentType =
      startFetch.response.headers.get("content-type") || "";
    const rawResponse = startFetch.text || "";

    if (!startFetch.response.ok) {
      console.error(
        "[QuestionDeleteAPI] Request failed:",
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
          { error: "Question not found" },
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
        "Failed to delete question";

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
      console.error(
        "[QuestionDeleteAPI] Non-JSON response received:",
        contentType
      );

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

    const processedData = {
      message: data.message || "Question deleted successfully.",
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
    console.error("[QuestionDeleteAPI] Request error:", error);

    return NextResponse.json(
      {
        error: isTimeout ? "Connection timeout" : "Failed to delete question",
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

// texagon_academy\texagonui\app\api\teacher\assessments\courses\route.ts
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

export async function GET(req: Request) {
  noStore();

  const t = withTimeout(15000);

  try {
    // proxy.ts handles Api-Key + X-Session-Token + cookies
    const startFetch = await djangoFetch(`/assessments/api/teacher/courses/`, {
      method: "GET",
      signal: t.signal,
    });

    const contentType =
      startFetch.response.headers.get("content-type") || "";
    const rawResponse = startFetch.text || "";

    if (!startFetch.response.ok) {
      console.error(
        "[TeacherCoursesAPI] Fetch failed:",
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
          { error: "Teacher courses endpoint not found" },
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

      const res = NextResponse.json(
        { error: "Failed to fetch teacher courses", raw: rawResponse },
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
        "[TeacherCoursesAPI] Non-JSON response received:",
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

    // Validate and transform response to match expected structure
    const processedData = {
      courses: Array.isArray(data.courses)
        ? data.courses.map((course: any) => ({
            id: course?.id || 0,
            name: course?.name || "",
            subject: course?.subject || "",
            classroom: course?.classroom || "",
            description: course?.description || "",
          }))
        : [],
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
    console.error("[TeacherCoursesAPI] Fetch error:", error);

    return NextResponse.json(
      {
        error: isTimeout ? "Connection timeout" : "Failed to fetch teacher courses",
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

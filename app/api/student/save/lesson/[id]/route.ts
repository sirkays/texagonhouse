import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  noStore();

  const lessonId = params.id;
  const path = `/learning/api/save/lesson/${lessonId}/`;

  try {
    const { response, text, setCookie } = await djangoFetch(path, {
      method: "POST",
      // keep same behavior: empty JSON body
      body: JSON.stringify({}),
    });

    const outHeaders = new Headers({
      "Content-Type": "application/json",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    });
    if (setCookie) outHeaders.set("Set-Cookie", setCookie);

    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
      console.error(
        "[SaveLessonAPI] Fetch failed:",
        response.status,
        (text || "").slice(0, 100)
      );

      if (response.status === 401) {
        return NextResponse.json({ error: "Session expired" }, { status: 401, headers: outHeaders });
      }
      if (response.status === 404) {
        return NextResponse.json({ error: "Lesson not found" }, { status: 404, headers: outHeaders });
      }

      // If backend returned JSON, include it for debugging
      if (contentType.includes("application/json")) {
        try {
          const backend = text ? JSON.parse(text) : null;
          return NextResponse.json(
            { error: "Failed to save lesson", backend },
            { status: response.status, headers: outHeaders }
          );
        } catch {
          // ignore
        }
      }

      return NextResponse.json(
        { error: "Failed to save lesson" },
        { status: response.status, headers: outHeaders }
      );
    }

    if (!contentType.includes("application/json")) {
      console.error("[SaveLessonAPI] Non-JSON response received:", contentType);
      return NextResponse.json(
        { error: "Invalid response format, expected JSON" },
        { status: 500, headers: outHeaders }
      );
    }

    let data: any;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (parseError) {
      console.error("[SaveLessonAPI] Failed to parse JSON:", parseError);
      return NextResponse.json({ error: "Invalid response format" }, { status: 500, headers: outHeaders });
    }

    // Keep your original 201
    return NextResponse.json(data, { status: 201, headers: outHeaders });
  } catch (error: any) {
    console.error("[SaveLessonAPI] Fetch error:", error);
    return NextResponse.json(
      { error: "Failed to save lesson", details: error?.message },
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

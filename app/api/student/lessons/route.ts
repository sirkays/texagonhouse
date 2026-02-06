// app/api/student/lessons/route.ts
import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function GET(req: Request) {
  noStore();

  const { searchParams } = new URL(req.url);
  const moduleId = searchParams.get("module");
  const courseId = searchParams.get("course");
  const freezed = searchParams.get("freezed");

  let path = "/api/lessons/";
  if (moduleId || courseId || freezed) {
    const params = new URLSearchParams();
    if (moduleId) params.append("module", moduleId);
    if (courseId) params.append("course", courseId);
    if (freezed) params.append("freezed", freezed);
    path += `?${params.toString()}`;
  }

  try {
    const { response, text, setCookie } = await djangoFetch(path, {
      method: "GET",
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
        "[Lessons API] Fetch failed:",
        response.status,
        (text || "").slice(0, 100)
      );

      if (response.status === 401) {
        return NextResponse.json({ error: "Session expired" }, { status: 401, headers: outHeaders });
      }
      if (response.status === 403) {
        return NextResponse.json(
          { error: "Forbidden: No student or teacher profile" },
          { status: 403, headers: outHeaders }
        );
      }
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Lessons endpoint not found" },
          { status: 404, headers: outHeaders }
        );
      }

      // If backend returned JSON, include it (useful for debugging)
      if (contentType.includes("application/json")) {
        try {
          const backend = text ? JSON.parse(text) : null;
          return NextResponse.json(
            { error: "Failed to fetch lessons", backend },
            { status: response.status, headers: outHeaders }
          );
        } catch {
          // ignore parse errors and fall back
        }
      }

      return NextResponse.json(
        { error: "Failed to fetch lessons" },
        { status: response.status, headers: outHeaders }
      );
    }

    if (!contentType.includes("application/json")) {
      console.error("[Lessons API] Non-JSON response received:", contentType);
      return NextResponse.json(
        { error: "Invalid response format, expected JSON" },
        { status: 500, headers: outHeaders }
      );
    }

    let data: any;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (parseError) {
      console.error("[Lessons API] Failed to parse JSON:", parseError);
      return NextResponse.json(
        { error: "Invalid response format" },
        { status: 500, headers: outHeaders }
      );
    }

    return NextResponse.json(data, { status: 200, headers: outHeaders });
  } catch (error: any) {
    console.error("[Lessons API] Fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch lessons", details: error?.message },
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

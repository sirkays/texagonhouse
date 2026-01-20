// app/api/student/learning-modules/route.ts (or wherever this file lives)
import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetch } from "@/app/api/_lib/proxy";

// ✅ export it
export const BASE_URL =
  process.env.STORE_BASE_URL || "http://127.0.0.1:9098";



function normalizeMedia(media: string | null | undefined) {
  if (!media) return null;
  const cleaned = media.replace(/^\/*(?:media\/)+|\/+$/g, "");
  if (cleaned.startsWith("http")) return cleaned;
  return `${BASE_URL}/media/${cleaned}`;
}

export async function GET(req: Request) {
  noStore();

  const url = new URL(req.url);
  const qs = url.searchParams.toString(); // e.g. module_id=12
  const path = `/learning/api/modules/learning/${qs ? `?${qs}` : ""}`;

  try {
    const { response, text, setCookie } = await djangoFetch(path, {
      method: "GET",
      // If you still want this, keep it. Otherwise you can remove it.
      headers: { "Access-Control-Allow-Origin": "*" } as any,
    });

    // Forward Django cookies (sessionid, etc.) back to browser
    const outHeaders = new Headers({
      "Content-Type": "application/json",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
      "Access-Control-Allow-Origin": "*",
    });
    if (setCookie) outHeaders.set("Set-Cookie", setCookie);

    const contentType = response.headers.get("content-type") || "";

    // Handle non-OK responses similarly to your original code
    if (!response.ok) {
      console.error(
        "[LearningModulesAPI] Fetch failed:",
        response.status,
        (text || "").slice(0, 100)
      );

      if (response.status === 401) {
        return NextResponse.json({ error: "Session expired" }, { status: 401, headers: outHeaders });
      }
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Learning modules endpoint not found" },
          { status: 404, headers: outHeaders }
        );
      }

      // Try to pass backend JSON if it is JSON
      if (contentType.includes("application/json")) {
        try {
          const backend = text ? JSON.parse(text) : null;
          return NextResponse.json(
            { error: "Failed to fetch learning modules", backend },
            { status: response.status, headers: outHeaders }
          );
        } catch {
          // fall through
        }
      }

      return NextResponse.json(
        { error: "Failed to fetch learning modules" },
        { status: response.status, headers: outHeaders }
      );
    }

    // Ensure JSON
    if (!contentType.includes("application/json")) {
      console.error("[LearningModulesAPI] Non-JSON response received:", contentType);
      return NextResponse.json(
        { error: "Invalid response format, expected JSON" },
        { status: 500, headers: outHeaders }
      );
    }

    let data: any;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (parseError) {
      console.error("[LearningModulesAPI] Failed to parse JSON:", parseError);
      return NextResponse.json({ error: "Invalid response format" }, { status: 500, headers: outHeaders });
    }

    const safeArr = (v: any) => (Array.isArray(v) ? v : []);

    const normalizedData = {
      ...data,
      videos: safeArr(data?.videos).map((video: any) => ({
        ...video,
        url: normalizeMedia(video?.url),
      })),
      audio: safeArr(data?.audio).map((audio: any) => ({
        ...audio,
        url: normalizeMedia(audio?.url),
      })),
      pdfs: safeArr(data?.pdfs).map((pdf: any) => ({
        ...pdf,
        url: normalizeMedia(pdf?.url),
      })),
      docs: safeArr(data?.docs).map((doc: any) => ({
        ...doc,
        url: normalizeMedia(doc?.url),
      })),
      links: safeArr(data?.links).map((link: any) => ({
        ...link,
        url: normalizeMedia(link?.url),
      })),
      tutorials: safeArr(data?.tutorials).map((tutorial: any) => ({
        ...tutorial,
        url: normalizeMedia(tutorial?.url),
      })),
    };

    return NextResponse.json(normalizedData, { status: 200, headers: outHeaders });
  } catch (error: any) {
    console.error("[LearningModulesAPI] Fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch learning modules", details: error?.message },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}

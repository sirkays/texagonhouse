import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function GET(req: Request) {
  noStore();

  const path = "/academics/api/gamification/achievements/";

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
        "[AchievementsAPI] Fetch failed:",
        response.status,
        (text || "").slice(0, 100)
      );

      if (response.status === 401) {
        return NextResponse.json(
          { error: "Session expired" },
          { status: 401, headers: outHeaders }
        );
      }
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Achievements endpoint not found" },
          { status: 404, headers: outHeaders }
        );
      }

      // If backend returned JSON, include it for debugging
      if (contentType.includes("application/json")) {
        try {
          const backend = text ? JSON.parse(text) : null;
          return NextResponse.json(
            { error: "Failed to fetch achievements", backend },
            { status: response.status, headers: outHeaders }
          );
        } catch {
          // ignore parse errors
        }
      }

      return NextResponse.json(
        { error: "Failed to fetch achievements" },
        { status: response.status, headers: outHeaders }
      );
    }

    if (!contentType.includes("application/json")) {
      console.error("[AchievementsAPI] Non-JSON response received:", contentType);
      return NextResponse.json(
        { error: "Invalid response format, expected JSON" },
        { status: 500, headers: outHeaders }
      );
    }

    let data: any;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (parseError) {
      console.error("[AchievementsAPI] Failed to parse JSON:", parseError);
      return NextResponse.json(
        { error: "Invalid response format" },
        { status: 500, headers: outHeaders }
      );
    }

    return NextResponse.json(data, { status: 200, headers: outHeaders });
  } catch (error: any) {
    console.error("[AchievementsAPI] Fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch achievements", details: error?.message },
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

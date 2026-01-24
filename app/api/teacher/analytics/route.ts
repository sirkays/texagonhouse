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

export async function GET(_req: Request) {
  noStore();

  try {
    const { response, text, setCookie } = await djangoFetch(
      `/academics/teacher-analytics/`,
      { method: "GET" }
    );

    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
      console.error(
        "[TeacherAnalyticsAPI] Fetch failed:",
        response.status,
        (text || "").slice(0, 100)
      );

      if (response.status === 401) {
        const res = NextResponse.json(
          { error: "Authentication credentials were not provided" },
          { status: 401, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
        );
        return attachSetCookie(res, setCookie);
      }

      if (response.status === 403) {
        const res = NextResponse.json(
          { error: "Forbidden" },
          { status: 403, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
        );
        return attachSetCookie(res, setCookie);
      }

      if (response.status === 404) {
        const res = NextResponse.json(
          { error: "Teacher profile not found" },
          { status: 404, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
        );
        return attachSetCookie(res, setCookie);
      }

      const res = NextResponse.json(
        { error: "Failed to fetch teacher analytics" },
        {
          status: response.status,
          headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        }
      );
      return attachSetCookie(res, setCookie);
    }

    if (!contentType.includes("application/json")) {
      console.error(
        "[TeacherAnalyticsAPI] Non-JSON response received:",
        contentType
      );
      const res = NextResponse.json(
        { error: "Invalid response format, expected JSON" },
        { status: 500, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
      );
      return attachSetCookie(res, setCookie);
    }

    let data: any;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (parseError) {
      console.error("[TeacherAnalyticsAPI] Failed to parse JSON:", parseError);
      const res = NextResponse.json(
        { error: "Invalid response format" },
        { status: 500, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
      );
      return attachSetCookie(res, setCookie);
    }

    const res = NextResponse.json(data, { status: 200, headers: NO_STORE_HEADERS });
    return attachSetCookie(res, setCookie);
  } catch (error) {
    console.error("[TeacherAnalyticsAPI] Fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch teacher analytics", details: "" },
      { status: 500, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
    );
  }
}

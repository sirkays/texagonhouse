// app/api/teacher/fetch-my-tests/route.ts
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

export async function GET() {
  noStore();

  // Django view is POST, we keep GET externally
  const endpoint = `/assessments/api/teacher/fetch-my-test/`;

  try {
    const { response, text, setCookie } = await djangoFetch(endpoint, {
      method: "POST",
      body: JSON.stringify({}), // empty body is fine
    });

    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
      console.error(
        "[FetchMyTestsAPI] Failed:",
        response.status,
        (text || "").slice(0, 200)
      );

      if (response.status === 401) {
        const res = NextResponse.json(
          { error: "Session expired", redirect: "/login" },
          {
            status: 401,
            headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
          }
        );
        return attachSetCookie(res, setCookie);
      }

      const res = NextResponse.json(
        { error: "Failed to fetch teacher tests" },
        {
          status: response.status,
          headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        }
      );
      return attachSetCookie(res, setCookie);
    }

    if (!contentType.includes("application/json")) {
      console.error("[FetchMyTestsAPI] Non-JSON response:", contentType);
      const res = NextResponse.json(
        { error: "Invalid response format, expected JSON" },
        {
          status: 500,
          headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        }
      );
      return attachSetCookie(res, setCookie);
    }

    let data: any;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (err) {
      console.error("[FetchMyTestsAPI] JSON parse error:", err);
      const res = NextResponse.json(
        { error: "Invalid response format" },
        {
          status: 500,
          headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        }
      );
      return attachSetCookie(res, setCookie);
    }

    const res = NextResponse.json(data, { status: 200, headers: NO_STORE_HEADERS });
    return attachSetCookie(res, setCookie);
  } catch (error: any) {
    console.error("[FetchMyTestsAPI] Fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch teacher tests", details: error?.message },
      {
        status: 500,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      }
    );
  }
}

// app/api/assessments/teacher/module-analytics/route.ts
import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetch } from "@/app/api/_lib/proxy";

function attachSetCookie(res: NextResponse, setCookie?: string) {
  if (setCookie) res.headers.set("set-cookie", setCookie);
  return res;
}

export async function GET(req: Request) {
  noStore();

  const endpoint = `/assessments/api/teacher/module-analytics/`;
  const { searchParams } = new URL(req.url);

  // If query params ever matter, append them transparently
  const qs = searchParams.toString();
  const path = qs ? `${endpoint}?${qs}` : endpoint;

  try {
    const { response, text, setCookie } = await djangoFetch(path, {
      method: "GET",
    });

    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
      if (response.status === 401) {
        const res = NextResponse.json(
          { error: "Session expired", redirect: "/login" },
          { status: 401, headers: { "Cache-Control": "no-store" } }
        );
        return attachSetCookie(res, setCookie);
      }

      if (response.status === 403) {
        const res = NextResponse.json(
          { error: "Access denied. Teacher profile required." },
          { status: 403, headers: { "Cache-Control": "no-store" } }
        );
        return attachSetCookie(res, setCookie);
      }

      const res = NextResponse.json(
        { error: "Failed to fetch module analytics" },
        { status: response.status, headers: { "Cache-Control": "no-store" } }
      );
      return attachSetCookie(res, setCookie);
    }

    if (!contentType.includes("application/json")) {
      const res = NextResponse.json(
        { error: "Invalid response format" },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
      return attachSetCookie(res, setCookie);
    }

    let data: any;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      const res = NextResponse.json(
        { error: "Invalid response format" },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
      return attachSetCookie(res, setCookie);
    }

    const res = NextResponse.json(data, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
    return attachSetCookie(res, setCookie);
  } catch (error) {
    return NextResponse.json(
      { error: "Server error", details: (error as Error).message },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

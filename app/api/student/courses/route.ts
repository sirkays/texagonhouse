import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function GET(req: Request) {
  noStore();

  const path = `/learning/api/student/courses/`;

  try {
    const { response, text, setCookie } = await djangoFetch(path, {
      method: "GET",
      headers: { "Access-Control-Allow-Origin": "*" } as any,
    });

    const outHeaders = new Headers({
      "Content-Type": "application/json",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
      "Access-Control-Allow-Origin": "*",
    });
    if (setCookie) outHeaders.set("Set-Cookie", setCookie);

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json({ error: "Session expired" }, { status: 401, headers: outHeaders });
      }
      return NextResponse.json(
        { error: "Failed to fetch student courses" },
        { status: response.status, headers: outHeaders }
      );
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Invalid response format" },
        { status: 500, headers: outHeaders }
      );
    }

    const data = text ? JSON.parse(text) : null;
    return NextResponse.json(data, { status: 200, headers: outHeaders });
  } catch (error: any) {
    console.error("[StudentCoursesAPI] Fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch student courses", details: error?.message },
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

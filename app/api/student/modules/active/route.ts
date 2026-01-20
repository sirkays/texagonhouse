import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function GET(req: Request) {
  noStore();

  const path = "/core/api/academics/modules/active/";

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
        "[ActiveModulesAPI] Fetch failed:",
        response.status,
        (text || "").slice(0, 100)
      );

      // mirror your previous behavior
      if (response.status === 401) {
        return NextResponse.json({ error: "Session expired" }, { status: 401, headers: outHeaders });
      }
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Modules endpoint not found" },
          { status: 404, headers: outHeaders }
        );
      }

      // include backend JSON if possible (useful for debugging)
      if (contentType.includes("application/json")) {
        try {
          const backend = text ? JSON.parse(text) : null;
          return NextResponse.json(
            { error: "Failed to fetch modules", backend },
            { status: response.status, headers: outHeaders }
          );
        } catch {
          // ignore parse errors
        }
      }

      return NextResponse.json(
        { error: "Failed to fetch modules" },
        { status: response.status, headers: outHeaders }
      );
    }

    if (!contentType.includes("application/json")) {
      console.error("[ActiveModulesAPI] Non-JSON response received:", contentType);
      return NextResponse.json(
        { error: "Invalid response format, expected JSON" },
        { status: 500, headers: outHeaders }
      );
    }

    let data: any;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (parseError) {
      console.error("[ActiveModulesAPI] Failed to parse JSON:", parseError);
      return NextResponse.json(
        { error: "Invalid response format" },
        { status: 500, headers: outHeaders }
      );
    }

    // Return only the results array with id, name, and course.name
    const normalizedData = Array.isArray(data?.results)
      ? data.results.map((module: any) => ({
          id: module?.id,
          name: module?.name,
          courseName: module?.course?.name ?? null,
        }))
      : [];

    return NextResponse.json(normalizedData, { status: 200, headers: outHeaders });
  } catch (error: any) {
    console.error("[ActiveModulesAPI] Fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch modules", details: error?.message },
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

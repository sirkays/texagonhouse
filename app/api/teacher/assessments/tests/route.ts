//texagon_academy\texagonui\app\api\teacher\assessments\tests\route.ts
import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function GET(req: Request) {
  noStore();

  const url = new URL(req.url);
  
  // Adjust this path to your actual Django list endpoint
  const path = `/assessments/api/teacher/tests/${url.search}`;

  try {
    const { response, text, setCookie } = await djangoFetch(path, { method: "GET" });
    const contentType = response.headers.get("content-type") || "";

    const baseHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    };
    if (setCookie) baseHeaders["Set-Cookie"] = setCookie;

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json({ error: "Session expired" }, { status: 401, headers: baseHeaders });
      }
      return NextResponse.json(
        { error: "Failed to fetch tests" },
        { status: response.status, headers: baseHeaders }
      );
    }

    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Invalid response format, expected JSON" },
        { status: 500, headers: baseHeaders }
      );
    }

    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: "Invalid response format" }, { status: 500, headers: baseHeaders });
    }

    return NextResponse.json(data, { status: 200, headers: baseHeaders });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch tests", details: (error as Error).message },
      { status: 500, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
    );
  }
}

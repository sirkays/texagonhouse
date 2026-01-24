// app/api/teacher/tutoring-bookings/patch/route.ts
import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

function attachSetCookie(res: NextResponse, setCookie?: string) {
  if (setCookie) res.headers.set("set-cookie", setCookie);
  return res;
}

function safeJsonParse(text: string) {
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return null;
  }
}

export async function PATCH(request: Request) {
  const { searchParams } = new URL(request.url);
  const tab = searchParams.get("tab") || "upcoming";

  try {
    const body = await request.json();

    const result = await djangoFetch(
      `/api/teacher/tutoring-bookings/?tab=${encodeURIComponent(tab)}`,
      {
        method: "PATCH",
        body: JSON.stringify(body),
      }
    );

    const contentType = result.response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      console.error("[Route] PATCH response is not JSON, content-type:", contentType);
      return attachSetCookie(
        NextResponse.json(
          { error: `Backend returned non-JSON response (status: ${result.response.status})` },
          { status: result.response.status }
        ),
        result.setCookie
      );
    }

    const data = safeJsonParse(result.text);
    if (data === null) {
      return attachSetCookie(
        NextResponse.json({ error: "Invalid JSON from backend" }, { status: 502 }),
        result.setCookie
      );
    }

    if (!result.response.ok) {
      return attachSetCookie(
        NextResponse.json(
          { error: (data as any).detail || "Failed to update session" },
          { status: result.response.status }
        ),
        result.setCookie
      );
    }

    return attachSetCookie(NextResponse.json(data), result.setCookie);
  } catch (error) {
    console.error("[Route] PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

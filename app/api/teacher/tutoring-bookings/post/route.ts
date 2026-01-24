// app/api/teacher/tutoring-bookings/post/route.ts
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

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = await djangoFetch("/api/teacher/tutoring-bookings/", {
      method: "POST",
      body: JSON.stringify(body),
    });

    const contentType = result.response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      console.error("[Route] POST response is not JSON, content-type:", contentType);
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
          { error: (data as any).detail || "Failed to create tutoring offering" },
          { status: result.response.status }
        ),
        result.setCookie
      );
    }

    return attachSetCookie(NextResponse.json(data), result.setCookie);
  } catch (error) {
    console.error("[Route] POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

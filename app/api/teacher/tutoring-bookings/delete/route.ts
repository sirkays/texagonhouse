// app/api/teacher/tutoring-bookings/delete/route.ts
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

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const tab = searchParams.get("tab") || "upcoming";
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    const result = await djangoFetch(
      `/api/teacher/tutoring-bookings/?tab=${encodeURIComponent(tab)}&id=${encodeURIComponent(id)}`,
      { method: "DELETE" }
    );

    // 204 No Content: Success, no body
    if (result.response.status === 204) {
      const res = new NextResponse(null, { status: 204 });
      if (result.setCookie) res.headers.set("set-cookie", result.setCookie);
      return res;
    }

    const contentType = result.response.headers.get("content-type") || "";
    if (!contentType.includes("application/json") && result.text) {
      console.error("[Route] Non-JSON response:", result.text);
      return attachSetCookie(
        NextResponse.json(
          { error: "Backend returned invalid response" },
          { status: 502 }
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
          { error: (data as any).detail || "Failed to delete" },
          { status: result.response.status }
        ),
        result.setCookie
      );
    }

    return attachSetCookie(NextResponse.json(data), result.setCookie);
  } catch (error) {
    console.error("[Route] DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

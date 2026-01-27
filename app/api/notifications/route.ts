// app/api/notifications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function GET(req: NextRequest) {
  noStore();

  const { searchParams } = new URL(req.url);
  const unread = searchParams.get("unread");

  // Build Django path (relative; proxy.ts adds BASE_URL)
  let path = "/notifications/api/my-notifications/";
  if (unread !== null) {
    path += `?unread=${encodeURIComponent(unread)}`;
  }

  try {
    const { response, text, setCookie } = await djangoFetch(path, {
      method: "GET",
      cache: "no-store",
    });

    // Keep your friendly 401 response shape
    if (response.status === 401) {
      return NextResponse.json(
        { error: "Session expired", redirect: "/login" },
        { status: 401 }
      );
    }

    if (!response.ok) {
      if (response.status === 403) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return NextResponse.json(
        { error: "Failed to fetch notifications" },
        { status: response.status }
      );
    }

    // Parse JSON safely
    const contentType = response.headers.get("content-type") || "";
    let data: any = null;

    if (contentType.includes("application/json") && text) {
      try {
        data = JSON.parse(text);
      } catch {
        return NextResponse.json({ error: "Invalid JSON from backend" }, { status: 502 });
      }
    }

    // Normalize: backend may return { notifications: [...] } or just []
    const notifications = Array.isArray(data)
      ? data
      : Array.isArray(data?.notifications)
        ? data.notifications
        : [];

    const nextRes = NextResponse.json(notifications, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });

    // Forward Django cookies if any
    if (setCookie) {
      nextRes.headers.set("set-cookie", setCookie);
    }

    return nextRes;
  } catch (err) {
    console.error("GET notifications error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// app/api/tutor/tutoring/stats/route.ts
import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetch } from "@/app/api/_lib/proxy";

function attachSetCookie(res: NextResponse, setCookie?: string) {
  if (setCookie) res.headers.set("set-cookie", setCookie);
  res.headers.set("Cache-Control", "no-store");
  return res;
}

function jsonOrThrow(text: string) {
  if (!text) return null;
  return JSON.parse(text);
}

export async function GET(req: Request) {
  noStore();
  try {
    const { searchParams } = new URL(req.url);
    const queryString = searchParams.toString();
    const endpoint = `/api/tutor/tutoring/stats/${queryString ? `?${queryString}` : ""}`;

    const result = await djangoFetch(endpoint, {
      method: "GET",
    });

    const contentType = result.response.headers.get("content-type") || "";

    if (!result.response.ok) {
      if (result.response.status === 401) {
        return attachSetCookie(
          NextResponse.json({ error: "Session expired", redirect: "/login" }, { status: 401 }),
          result.setCookie
        );
      }
      if (result.response.status === 403) {
        return attachSetCookie(
          NextResponse.json({ error: "Access denied. Parent profile required." }, { status: 403 }),
          result.setCookie
        );
      }
      return attachSetCookie(
        NextResponse.json({ error: "Failed to fetch tutoring stats" }, { status: result.response.status }),
        result.setCookie
      );
    }

    if (!contentType.includes("application/json")) {
      return attachSetCookie(
        NextResponse.json({ error: "Invalid response format" }, { status: 500 }),
        result.setCookie
      );
    }

    const data = jsonOrThrow(result.text);
    return attachSetCookie(NextResponse.json(data, { status: 200 }), result.setCookie);
  } catch (error) {
    return NextResponse.json(
      { error: "Server error", details: (error as Error).message },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

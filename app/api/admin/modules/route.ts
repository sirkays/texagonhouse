import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

function parseJsonSafely(text: string) {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const queryString = url.searchParams.toString();

    // This endpoint is under /orgs (matches your original BASE_URL=/orgs)
    const path = queryString
      ? `/orgs/api/admin/module/list/?${queryString}`
      : `/orgs/api/admin/module/list/`;

    const { response, text, setCookie } = await djangoFetch(path, {
      method: "GET",
    });

    const data = parseJsonSafely(text);

    if (!response.ok) {
      if (response.status === 403) {
        const res = NextResponse.json(
          { detail: data?.detail || "Authentication failed" },
          { status: 403 }
        );
        if (setCookie) res.headers.set("set-cookie", setCookie);
        return res;
      }

      const res = NextResponse.json(
        { detail: data?.detail || "Failed to fetch modules" },
        { status: response.status }
      );
      if (setCookie) res.headers.set("set-cookie", setCookie);
      return res;
    }

    const res = NextResponse.json(data, { status: 200 });
    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  } catch (error) {
    console.error("[Admin Modules] Error fetching modules:", error);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}

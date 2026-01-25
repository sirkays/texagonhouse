import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetch } from "@/app/api/_lib/proxy";

const noCacheHeaders = () => ({
  "Content-Type": "application/json",
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
});

function parseJsonSafely(text: string) {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

export async function GET(_req: Request) {
  noStore();

  try {
    const { response, text, setCookie } = await djangoFetch(
      "/gamification/api/admin/gamification/badges",
      { method: "GET" }
    );

    const data = parseJsonSafely(text);

    if (!response.ok) {
      const status = response.status;

      let errorResp: any = { error: "Failed to fetch badges" };
      if (status === 401) {
        errorResp = { error: "Session expired", redirect: "/login" };
      } else if (status === 403) {
        errorResp = { error: "Forbidden - not an org admin/teacher" };
      } else {
        const msg = data?.detail || data?.error || data?.message || text;
        errorResp.details = msg;
      }

      const res = NextResponse.json(errorResp, {
        status,
        headers: noCacheHeaders(),
      });
      if (setCookie) res.headers.set("set-cookie", setCookie);
      return res;
    }

    if (!Array.isArray(data)) {
      const res = NextResponse.json(
        { error: "Invalid response format, expected badges array" },
        { status: 500, headers: noCacheHeaders() }
      );
      if (setCookie) res.headers.set("set-cookie", setCookie);
      return res;
    }

    const res = NextResponse.json(data, { status: 200, headers: noCacheHeaders() });
    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  } catch (error) {
    console.error("[Badges GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch badges" },
      { status: 500, headers: noCacheHeaders() }
    );
  }
}

export async function POST(req: Request) {
  noStore();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
  }

  try {
    const { response, text, setCookie } = await djangoFetch(
      "/gamification/api/admin/gamification/badges",
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    );

    const data = parseJsonSafely(text);

    if (!response.ok) {
      const status = response.status;

      let errorResp: any = { error: "Failed to create badge" };
      if (status === 400) {
        errorResp = { error: "Bad request (validation error)" };
      } else if (status === 401) {
        errorResp = { error: "Session expired", redirect: "/login" };
      } else if (status === 403) {
        errorResp = { error: "Forbidden - not an org admin/teacher" };
      } else {
        const msg = data?.detail || data?.error || data?.message || text;
        errorResp.details = msg;
      }

      const res = NextResponse.json(errorResp, { status });
      if (setCookie) res.headers.set("set-cookie", setCookie);
      return res;
    }

    const res = NextResponse.json(data, { status: 201 });
    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  } catch (error) {
    console.error("[Badges POST] Error:", error);
    return NextResponse.json({ error: "Failed to create badge" }, { status: 500 });
  }
}

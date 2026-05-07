import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetch, djangoFetchRaw } from "@/app/api/_lib/proxy";

// If this file is under a catch-all route, keep it as-is.
// Works for GET/POST and preserves your cache headers behavior.

function safeJsonParse(text: string) {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

function withTimeout(timeoutMs: number) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  return { signal: controller.signal, clear: () => clearTimeout(id) };
}

function attachSetCookie(res: NextResponse, setCookie?: string) {
  if (setCookie) res.headers.set("set-cookie", setCookie);
  return res;
}

function noStoreHeaders() {
  return {
    "Content-Type": "application/json",
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  };
}

async function handler(req: any) {
  noStore();

  const localPrefix = "/api/parent/tutoring";
  let backendPath = "/api/tutor/tutoring";

  const path = req.nextUrl.pathname.substring(localPrefix.length) || "/";

  // special case you already had
  if (path === "/children" || path === "/children/") {
    backendPath = "/accounts/api/parent";
  }

  const backendUrlPath = `${backendPath}${path}${req.nextUrl.search || ""}`;

  const method = String(req.method || "GET").toUpperCase();
  const hasBody = !["GET", "HEAD"].includes(method);
  const reqCt = (req.headers?.get?.("content-type") || "").toLowerCase();

  let body: BodyInit | undefined;

  if (hasBody) {
    // keep it simple: your current handler only expects JSON bodies
    if (reqCt.includes("application/json")) {
      try {
        const json = await req.json();
        body = JSON.stringify(json);
      } catch {
        return NextResponse.json(
          { error: "Invalid request body" },
          { status: 400, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
        );
      }
    } else {
      // if you ever need non-json here, switch to djangoFetchRaw and preserve content-type
      try {
        const buf = await req.arrayBuffer();
        if (buf.byteLength > 0) body = Buffer.from(buf);
      } catch {
        return NextResponse.json(
          { error: "Invalid request body" },
          { status: 400, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
        );
      }
    }
  }

  const t = withTimeout(20000);

  try {
    // If it isn't JSON (and not FormData), use Raw so proxy.ts doesn't force Content-Type json.
    const useRaw = hasBody && reqCt && !reqCt.includes("application/json") && !reqCt.startsWith("multipart/form-data");

    const result = useRaw
      ? await djangoFetchRaw(backendUrlPath, {
        method,
        signal: t.signal,
        body,
        headers: reqCt ? { "Content-Type": req.headers.get("content-type") as string } : {},
      })
      : await djangoFetch(backendUrlPath, {
        method,
        signal: t.signal,
        body,
      });

    const response = result.response;
    const rawResponse = await response.text();
    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
      console.error("[TutoringAPI] Fetch failed:", response.status, rawResponse.slice(0, 100));

      let errorMsg = "Failed to process tutoring request";
      if (response.status === 400) errorMsg = rawResponse || "Bad request - Invalid parameters";
      else if (response.status === 401) errorMsg = "Authentication credentials were not provided";
      else if (response.status === 403) errorMsg = "Forbidden - Not a parent or insufficient permissions";
      else if (response.status === 404) errorMsg = "Resource not found - Student, tutor, or booking not found";

      const res = NextResponse.json(
        { error: errorMsg },
        { status: response.status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
      );
      return attachSetCookie(res, result.setCookie);
    }

    if (!contentType.includes("application/json")) {
      console.error("[TutoringAPI] Non-JSON response received:", contentType);
      const res = NextResponse.json(
        { error: "Invalid response format, expected JSON" },
        { status: 500, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
      );
      return attachSetCookie(res, result.setCookie);
    }

    const data = safeJsonParse(rawResponse);
    if (data === null && rawResponse) {
      console.error("[TutoringAPI] Failed to parse JSON");
      const res = NextResponse.json(
        { error: "Invalid response format" },
        { status: 500, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
      );
      return attachSetCookie(res, result.setCookie);
    }

    const res = NextResponse.json(data, { status: 200, headers: noStoreHeaders() });
    return attachSetCookie(res, result.setCookie);
  } catch (error: any) {
    const isTimeout = error?.name === "AbortError";
    console.error("[TutoringAPI] Fetch error:", error);

    return NextResponse.json(
      {
        error: isTimeout ? "Connection timeout" : "Failed to process tutoring request",
        details: error?.message || String(error),
      },
      { status: isTimeout ? 504 : 500, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
    );
  } finally {
    t.clear();
  }
}

export { handler as GET, handler as POST };

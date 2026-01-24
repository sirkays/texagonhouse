import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetch, djangoFetchRaw } from "@/app/api/_lib/proxy";

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

async function handler(req: any, { params }: { params: { path?: string[] } | Promise<{ path?: string[] }> }) {
  noStore();

  const resolved = await params;
  const pathSegments = resolved?.path || [];
  const path = pathSegments.join("/");

  let backendPath = `/api/tutor/tutoring/${path ? `${path}/` : ""}`; // align with docs prefix + trailing slash
  if (path === "children" || path === "children/") {
    backendPath = `/api/tutor/tutoring/children/`;
  } else if (path === "reset-child-password") {
    backendPath = `/accounts/api/parent/reset-child-password/`;
  }

  // include query string
  const qs = req?.nextUrl?.search || "";
  const fullPath = `${backendPath}${qs}`;

  const method = String(req.method || "GET").toUpperCase();
  const hasBody = !["GET", "HEAD"].includes(method);
  const reqCt = (req.headers?.get?.("content-type") || "").toLowerCase();

  let body: BodyInit | undefined;

  if (hasBody) {
    // your original handler expects JSON bodies; keep that behavior
    if (reqCt.includes("application/json") || !reqCt) {
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
      // fallback: forward bytes and preserve content-type
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
    // For non-json bodies, use Raw so proxy.ts doesn't force Content-Type json
    const useRaw =
      hasBody &&
      reqCt &&
      !reqCt.includes("application/json") &&
      !reqCt.startsWith("multipart/form-data");

    const result = useRaw
      ? await djangoFetchRaw(fullPath, {
          method,
          signal: t.signal,
          body,
          headers: reqCt ? { "Content-Type": req.headers.get("content-type") as string } : {},
        })
      : await djangoFetch(fullPath, {
          method,
          signal: t.signal,
          body,
        });

    const response = result.response;
    const contentType = response.headers.get("content-type") || "";
    const rawResponse = await response.text();

    if (!response.ok) {
      let errorMsg = "Failed to process request";
      if (response.status === 400) errorMsg = rawResponse || "Bad request - Invalid parameters";
      else if (response.status === 401) errorMsg = "Authentication credentials were not provided";
      else if (response.status === 403) errorMsg = "Forbidden - Not a parent or insufficient permissions";
      else if (response.status === 404) errorMsg = "Resource not found";

      const res = NextResponse.json(
        { error: errorMsg },
        { status: response.status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
      );
      return attachSetCookie(res, result.setCookie);
    }

    if (!contentType.includes("application/json")) {
      const res = NextResponse.json(
        { error: "Invalid response format, expected JSON" },
        { status: 500, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
      );
      return attachSetCookie(res, result.setCookie);
    }

    const data = safeJsonParse(rawResponse);
    if (data === null && rawResponse) {
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
    console.error("[ParentAPI] Fetch error:", error);

    return NextResponse.json(
      {
        error: isTimeout ? "Connection timeout" : "Failed to process request",
        details: error?.message || String(error),
      },
      { status: isTimeout ? 504 : 500, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
    );
  } finally {
    t.clear();
  }
}

export { handler as GET, handler as POST };

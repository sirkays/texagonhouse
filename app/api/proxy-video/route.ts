import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetchRaw } from "@/app/api/_lib/proxy";

// IMPORTANT: keep this in sync with proxy.ts BASE_URL env (STORE_BASE_URL)
const BACKEND_ORIGIN =
  process.env.STORE_BASE_URL || "https://texagonbackend.onrender.com";

function normalizeMedia(media: string | null): string | null {
  if (!media) return null;

  // strip leading /media/ (repeated) and trailing slashes
  const cleaned = media.replace(/^\/*(?:media\/)+|\/+$/g, "");

  // if it's already an absolute url, keep it
  if (/^https?:\/\//i.test(cleaned)) return cleaned;

  // normalize to absolute media URL
  return `${BACKEND_ORIGIN}/media/${cleaned}`;
}

function withTimeout(timeoutMs: number) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  return { signal: controller.signal, clear: () => clearTimeout(id) };
}

function jsonNoStore(error: any, status = 500) {
  return NextResponse.json(error, {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(req: Request) {
  noStore();

  const url = new URL(req.url).searchParams.get("url");
  const normalizedUrl = normalizeMedia(url);

  if (!normalizedUrl) {
    console.error("[ProxyVideo] Invalid media URL:", url);
    return jsonNoStore({ error: "Invalid media URL" }, 400);
  }

  // Only allow media from our backend (avoid open proxy abuse)
  let remoteUrl: URL;
  try {
    remoteUrl = new URL(normalizedUrl);
  } catch {
    return jsonNoStore({ error: "Invalid media URL" }, 400);
  }

  const backendHost = new URL(BACKEND_ORIGIN).host;
  if (remoteUrl.host !== backendHost) {
    return jsonNoStore({ error: "Host not allowed" }, 403);
  }

  // Convert absolute URL -> relative path for proxy.ts
  const backendPath = `${remoteUrl.pathname}${remoteUrl.search || ""}`;

  const t = withTimeout(30000);

  try {
    const range = req.headers.get("range");

    const result = await djangoFetchRaw(backendPath, {
      method: "GET",
      signal: t.signal,
      // forward Range for video seeking
      headers: range ? { Range: range } : {},
    });

    if (!result.response.ok) {
      const rawResponse = await result.response.text().catch(() => "");
      console.error("[ProxyVideo] Fetch failed:", {
        status: result.response.status,
        statusText: result.response.statusText,
        url: normalizedUrl,
        body: rawResponse.slice(0, 200),
      });

      return jsonNoStore(
        {
          error: `Failed to fetch media: ${result.response.status} ${result.response.statusText}`,
          details: rawResponse,
        },
        result.response.status
      );
    }

    const stream = result.response.body;
    if (!stream) {
      console.error("[ProxyVideo] No response body:", normalizedUrl);
      return jsonNoStore({ error: "No response body" }, 500);
    }

    // Pass through important headers for streaming/seek
    const contentType =
      result.response.headers.get("content-type") || "application/octet-stream";
    const acceptRanges = result.response.headers.get("accept-ranges");
    const contentRange = result.response.headers.get("content-range");
    const contentLength = result.response.headers.get("content-length");

    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD",
    };

    if (acceptRanges) headers["Accept-Ranges"] = acceptRanges;
    if (contentRange) headers["Content-Range"] = contentRange;
    if (contentLength) headers["Content-Length"] = contentLength;

    // If backend returned 206 (partial content), preserve it
    const status = result.response.status;

    const res = new NextResponse(stream, { status, headers });

    // Forward cookies if backend sets any
    if (result.setCookie) res.headers.set("set-cookie", result.setCookie);

    return res;
  } catch (error: any) {
    const isTimeout = error?.name === "AbortError";
    console.error("[ProxyVideo] Fetch error:", normalizedUrl, error);
    return jsonNoStore(
      { error: isTimeout ? "Connection timeout" : "Failed to fetch media", details: String(error) },
      isTimeout ? 504 : 500
    );
  } finally {
    t.clear();
  }
}

export async function HEAD(req: Request) {
  noStore();

  const url = new URL(req.url).searchParams.get("url");
  const normalizedUrl = normalizeMedia(url);

  if (!normalizedUrl) {
    console.error("[ProxyVideo] Invalid media URL for HEAD:", url);
    return jsonNoStore({ error: "Invalid media URL" }, 400);
  }

  let remoteUrl: URL;
  try {
    remoteUrl = new URL(normalizedUrl);
  } catch {
    return jsonNoStore({ error: "Invalid media URL" }, 400);
  }

  const backendHost = new URL(BACKEND_ORIGIN).host;
  if (remoteUrl.host !== backendHost) {
    return jsonNoStore({ error: "Host not allowed" }, 403);
  }

  const backendPath = `${remoteUrl.pathname}${remoteUrl.search || ""}`;

  const t = withTimeout(20000);

  try {
    const range = req.headers.get("range");

    const result = await djangoFetchRaw(backendPath, {
      method: "HEAD",
      signal: t.signal,
      headers: range ? { Range: range } : {},
    });

    if (!result.response.ok) {
      const rawResponse = await result.response.text().catch(() => "");
      console.error("[ProxyVideo] HEAD failed:", {
        status: result.response.status,
        statusText: result.response.statusText,
        url: normalizedUrl,
        body: rawResponse.slice(0, 200),
      });

      return jsonNoStore(
        {
          error: `HEAD request failed: ${result.response.status} ${result.response.statusText}`,
          details: rawResponse,
        },
        result.response.status
      );
    }

    const contentType =
      result.response.headers.get("content-type") || "application/octet-stream";
    const acceptRanges = result.response.headers.get("accept-ranges");
    const contentRange = result.response.headers.get("content-range");
    const contentLength = result.response.headers.get("content-length");

    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD",
    };

    if (acceptRanges) headers["Accept-Ranges"] = acceptRanges;
    if (contentRange) headers["Content-Range"] = contentRange;
    if (contentLength) headers["Content-Length"] = contentLength;

    const res = new NextResponse(null, { status: result.response.status, headers });

    if (result.setCookie) res.headers.set("set-cookie", result.setCookie);

    return res;
  } catch (error: any) {
    const isTimeout = error?.name === "AbortError";
    console.error("[ProxyVideo] HEAD error:", normalizedUrl, error);
    return jsonNoStore(
      { error: isTimeout ? "Connection timeout" : "Failed to perform HEAD request", details: String(error) },
      isTimeout ? 504 : 500
    );
  } finally {
    t.clear();
  }
}

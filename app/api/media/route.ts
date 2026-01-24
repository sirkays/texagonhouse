// app/api/media/route.ts
import { NextResponse } from "next/server";
import { djangoFetchRaw } from "@/app/api/_lib/proxy";

// IMPORTANT: compare hostnames, not full URLs
const ALLOWED_HOSTNAME = "texagonbackend.onrender.com";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": `https://${ALLOWED_HOSTNAME}`,
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Range, Content-Type, Accept, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawUrl = searchParams.get("url");

    if (!rawUrl) {
      return NextResponse.json({ error: "Missing url param" }, { status: 400 });
    }

    let remoteUrl: URL;
    try {
      remoteUrl = new URL(rawUrl);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    // Only allow the specific backend host
    if (remoteUrl.hostname !== ALLOWED_HOSTNAME) {
      return NextResponse.json({ error: "Host not allowed" }, { status: 403 });
    }

    // If your backend `url` is absolute, we can't pass it directly to djangoFetchRaw
    // because proxy.ts expects a PATH (relative). So we convert the remoteUrl to a path.
    // This works as long as the media is served by the same backend BASE_URL.
    const path = `${remoteUrl.pathname}${remoteUrl.search || ""}`;

    const upstream = await djangoFetchRaw(path, {
      method: "GET",
      // session/api-key/cookies handled by proxy.ts
      // Range header: forward it for streaming/seek support
      headers: req.headers.get("range") ? { Range: req.headers.get("range") as string } : {},
    });

    if (!upstream.response.ok) {
      const details = await upstream.response.text().catch(() => upstream.response.statusText);
      console.error(
        `Upstream fetch failed for ${remoteUrl.toString()}: ${upstream.response.status} - ${details}`
      );
      return NextResponse.json(
        {
          error: "Upstream fetch failed",
          status: upstream.response.status,
          details,
        },
        { status: upstream.response.status }
      );
    }

    // Mirror relevant upstream headers
    const headers = new Headers();

    const contentType = upstream.response.headers.get("content-type");
    const contentLength = upstream.response.headers.get("content-length");
    const acceptRanges = upstream.response.headers.get("accept-ranges");
    const contentRange = upstream.response.headers.get("content-range");

    if (contentType) headers.set("content-type", contentType);
    if (contentLength) headers.set("content-length", contentLength);
    if (acceptRanges) headers.set("accept-ranges", acceptRanges);
    if (contentRange) headers.set("content-range", contentRange);

    // CORS headers (if you actually need them)
    headers.set("Access-Control-Allow-Origin", `https://${ALLOWED_HOSTNAME}`);
    headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");

    // Forward set-cookie (if backend sets any session cookies)
    const res = new NextResponse(upstream.response.body, {
      status: upstream.response.status,
      headers,
    });

    if (upstream.setCookie) res.headers.set("set-cookie", upstream.setCookie);

    return res;
  } catch (err: any) {
    console.error("[MEDIA PROXY ERROR]", err);
    return NextResponse.json(
      { error: "Server error", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}

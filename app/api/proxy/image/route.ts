// app/api/media/image/[...path]/route.ts
import { NextResponse } from "next/server";
import { djangoFetchRaw } from "@/app/api/_lib/proxy";

function withTimeout(timeoutMs: number) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  return { signal: controller.signal, clear: () => clearTimeout(id) };
}

export async function GET(
  request: Request,
  { params }: { params: { path?: string[] } | Promise<{ path?: string[] }> }
) {
  const { path = [] } = await params;
  const imagePath = path.join("/");

  if (!imagePath) {
    return new NextResponse(null, { status: 404 });
  }

  // We only pass a RELATIVE path to proxy.ts
  // proxy.ts already knows the BASE_URL and auth headers
  const backendPath = `/${imagePath}`;

  const t = withTimeout(15000);

  try {
    const result = await djangoFetchRaw(backendPath, {
      method: "GET",
      signal: t.signal,
      // Forward Range if browser asks for it (some image viewers do)
      headers: request.headers.get("range")
        ? { Range: request.headers.get("range") as string }
        : {},
    });

    if (!result.response.ok) {
      console.error("[Image Proxy] Backend returned:", result.response.status, backendPath);
      return new NextResponse(null, { status: 404 });
    }

    const contentType =
      result.response.headers.get("content-type") || "image/png";
    const contentLength =
      result.response.headers.get("content-length");

    // Stream binary data directly
    const res = new NextResponse(result.response.body, {
      status: result.response.status,
      headers: {
        "Content-Type": contentType,
        ...(contentLength ? { "Content-Length": contentLength } : {}),
        "Cache-Control": "public, max-age=86400, s-maxage=86400", // 24h
        "Access-Control-Allow-Origin": "*",
      },
    });

    // Forward any backend cookies (if ever set)
    if (result.setCookie) res.headers.set("set-cookie", result.setCookie);

    return res;
  } catch (error: any) {
    const isTimeout = error?.name === "AbortError";
    console.error("[Image Proxy] Error:", error?.message || String(error));

    return new NextResponse(null, { status: isTimeout ? 504 : 500 });
  } finally {
    t.clear();
  }
}

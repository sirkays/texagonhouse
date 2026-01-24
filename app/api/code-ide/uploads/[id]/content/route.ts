// app/api/code-ide/uploads/[id]/content/route.ts
import { NextResponse } from "next/server";
import { djangoFetch, djangoFetchRaw } from "@/app/api/_lib/proxy";

function withTimeout(timeoutMs: number) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  return {
    signal: controller.signal,
    clear: () => clearTimeout(id),
  };
}

function attachSetCookie(res: NextResponse, setCookie?: string) {
  if (setCookie) res.headers.set("set-cookie", setCookie);
  return res;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  // 1) fetch file details (JSON) via djangoFetch
  const t1 = withTimeout(15000);
  try {
    const detailPath = `/code-ide/api/ide/files/${id}/`;
    console.log(`[Content Route] Fetching file details: ${detailPath}`);

    const detailFetch = await djangoFetch(detailPath, {
      method: "GET",
      signal: t1.signal,
    });

    if (!detailFetch.response.ok) {
      console.error(
        `[Content Route] File details failed ${detailFetch.response.status}:`,
        detailFetch.text
      );
      const res = NextResponse.json(
        { error: `File not found: ${detailFetch.text}` },
        { status: detailFetch.response.status === 404 ? 404 : detailFetch.response.status }
      );
      return attachSetCookie(res, detailFetch.setCookie);
    }

    const fileData = detailFetch.text ? JSON.parse(detailFetch.text) : null;
    const fileUrl: string | undefined = fileData?.url;
    const contentType: string = fileData?.content_type || "text/plain";

    if (!fileUrl) {
      return NextResponse.json(
        { error: "File URL missing from backend response" },
        { status: 502 }
      );
    }

    console.log(`[Content Route] File details fetched, URL: ${fileUrl}`);

    // 2) fetch the actual content
    // If the backend returns a FULL url (e.g. https://.../media/...),
    // we can hit it directly with fetchRaw so headers/session are still reused.
    // If it’s a relative path, we normalize to a path and still use djangoFetchRaw.
    const t2 = withTimeout(20000);
    try {
      const isAbsolute = /^https?:\/\//i.test(fileUrl);

      const contentFetch = isAbsolute
        ? await (async () => {
            // Use fetch directly so we can keep the exact absolute URL.
            // We still reuse headers via djangoFetchRaw by passing the absolute path through proxy
            // only if your proxy supports absolute URLs; if not, fallback to direct fetch.
            // Safe fallback: direct fetch with cookie/token handled by proxy is not possible for absolute URLs.
            // So we do direct fetch without duplicating headers by calling djangoFetchRaw on a special route? Not available.
            // => best: if URL is absolute and hosted by your backend, prefer returning a relative "url" from backend.
            return await fetch(fileUrl, {
              method: "GET",
              signal: t2.signal,
              // NOTE: if this URL is protected, make sure backend allows token/cookie auth on this endpoint
            });
          })()
        : (await djangoFetchRaw(fileUrl, {
            method: "GET",
            signal: t2.signal,
          })).response;

      if (!contentFetch.ok) {
        const errorText = await contentFetch.text().catch(() => "");
        console.error(
          `[Content Route] Content fetch failed ${contentFetch.status}:`,
          errorText
        );
        return NextResponse.json(
          { error: `Failed to fetch content: ${errorText || contentFetch.statusText}` },
          { status: 500 }
        );
      }

      const contentBuffer = await contentFetch.arrayBuffer();
      console.log(`[Content Route] Content fetched: ${contentBuffer.byteLength} bytes`);

      // Return raw bytes (works for text + binary)
      const res = new NextResponse(contentBuffer, {
        headers: {
          "Content-Type": contentType,
          "Content-Length": contentBuffer.byteLength.toString(),
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });

      // forward cookies from the detail call (if any)
      return attachSetCookie(res, detailFetch.setCookie);
    } catch (err: any) {
      const isTimeout = err?.name === "AbortError";
      console.error("[Content Route] Content fetch error:", err?.message || String(err));
      return NextResponse.json(
        {
          error: isTimeout ? "Connection timeout" : "Internal server error",
          details: err?.message || String(err),
        },
        { status: isTimeout ? 504 : 500 }
      );
    } finally {
      t2.clear();
    }
  } catch (error: any) {
    const isTimeout = error?.name === "AbortError";
    console.error("[Content Route] Error:", error?.message || String(error));
    return NextResponse.json(
      {
        error: isTimeout ? "Connection timeout" : "Internal server error",
        details: error?.message || String(error),
      },
      { status: isTimeout ? 504 : 500 }
    );
  } finally {
    t1.clear();
  }
}

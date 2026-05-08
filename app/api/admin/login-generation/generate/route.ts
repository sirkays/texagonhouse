// app/api/admin/login-generation/generate/route.ts
export const runtime = "nodejs";

import { djangoFetch } from "@/app/api/_lib/proxy";

function copyAllowedHeaders(from: Headers, to: Headers) {
  const skip = new Set([
    "transfer-encoding",
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailer",
    "upgrade",
  ]);
  from.forEach((value, key) => {
    if (!skip.has(key.toLowerCase())) {
      to.set(key, value);
    }
  });
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let result;

    if (contentType.includes("multipart/form-data")) {
      // Excel upload mode — forward FormData
      const formData = await req.formData();
      result = await djangoFetch("/core/api/admin/login-generation/generate/", {
        method: "POST",
        body: formData,
      });
    } else {
      // Manual mode — forward JSON
      const body = await req.text();
      result = await djangoFetch("/core/api/admin/login-generation/generate/", {
        method: "POST",
        body: body,
      });
    }

    const backendRes = result.response;

    // Log non-2xx responses so we can diagnose production issues
    if (!backendRes.ok) {
      console.error(
        `[login-generation] Backend returned ${backendRes.status}:`,
        result.text?.slice(0, 500)
      );
    }

    const respHeaders = new Headers();
    copyAllowedHeaders(backendRes.headers, respHeaders);

    // Ensure the response always has a JSON content-type so the client
    // doesn't choke on HTML error pages from upstream proxies (Render).
    const backendCT = backendRes.headers.get("content-type") || "";
    if (backendCT.includes("application/json")) {
      respHeaders.set("content-type", "application/json");
    } else {
      // The backend returned something other than JSON (HTML error page, etc.).
      // Wrap it in a JSON error envelope so the client can always JSON.parse.
      respHeaders.set("content-type", "application/json");
      if (!backendRes.ok) {
        const errorPayload = JSON.stringify({
          detail: `Backend error (HTTP ${backendRes.status}). The server may be overloaded or the request timed out.`,
          error: result.text?.slice(0, 200) || "Unknown error",
        });
        return new Response(errorPayload, {
          status: backendRes.status,
          headers: respHeaders,
        });
      }
    }

    return new Response(result.text, {
      status: backendRes.status,
      headers: respHeaders,
    });
  } catch (err: any) {
    console.error("login-generation generate proxy error:", err);
    return new Response(
      JSON.stringify({ error: err?.message || "Proxy error" }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}

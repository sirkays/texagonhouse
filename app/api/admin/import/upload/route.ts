// app/api/admin/import/upload/route.ts
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
    // Read incoming request's FormData (preserves multipart boundary & files)
    // NOTE: in Node runtime FormData is available (Next's nodejs runtime supports formData())
    const formData = await req.formData();

    // Call djangoFetch — it will attach API key, cookies, and choose content-type properly
    const result = await djangoFetch("/core/api/import/upload/parents-students/", {
      method: "POST",
      body: formData,
      // no need to set Content-Type here; djangoFetch detects FormData and avoids forcing JSON header
    });

    const backendRes = result.response;

    // We already have text (djangoFetch reads response.text()), but we still forward status and headers
    const respHeaders = new Headers();
    copyAllowedHeaders(backendRes.headers, respHeaders);

    // Determine content-type and return textual body
    const contentType = backendRes.headers.get("content-type") ?? "application/json";
    respHeaders.set("content-type", contentType);

    return new Response(result.text, {
      status: backendRes.status,
      headers: respHeaders,
    });
  } catch (err: any) {
    console.error("upload proxy error:", err);
    return new Response(JSON.stringify({ error: err?.message || "Proxy error" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
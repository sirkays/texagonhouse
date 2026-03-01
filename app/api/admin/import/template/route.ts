// app/api/admin/import/template/route.ts
export const runtime = "nodejs";

import { djangoFetchRaw } from "@/app/api/_lib/proxy";

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

export async function GET(req: Request) {
  try {
    // path should match your Django endpoint path
    const backend = await djangoFetchRaw("/core/api/import/template/parents-students/", {
      method: "GET",
      // no extra headers needed — djangoFetchRaw will attach API key and cookies/session
    });

    const backendRes = backend.response;

    // Read response as arrayBuffer (binary CSV)
    const arr = await backendRes.arrayBuffer();

    // Prepare response headers to forward (exclude hop-by-hop)
    const respHeaders = new Headers();
    copyAllowedHeaders(backendRes.headers, respHeaders);

    return new Response(arr, {
      status: backendRes.status,
      headers: respHeaders,
    });
  } catch (err: any) {
    console.error("template proxy error:", err);
    return new Response(JSON.stringify({ error: err?.message || "Proxy error" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
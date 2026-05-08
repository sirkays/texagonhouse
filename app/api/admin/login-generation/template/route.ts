// app/api/admin/login-generation/template/route.ts
export const runtime = "nodejs";

import { djangoFetchBinary } from "@/app/api/_lib/proxy";

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

export async function GET() {
  try {
    const backend = await djangoFetchBinary(
      "/core/api/admin/login-generation/template/",
      { method: "GET" }
    );

    const respHeaders = new Headers();
    copyAllowedHeaders(backend.response.headers, respHeaders);

    return new Response(backend.buffer, {
      status: backend.response.status,
      headers: respHeaders,
    });
  } catch (err: any) {
    console.error("login-generation template proxy error:", err);
    return new Response(
      JSON.stringify({ error: err?.message || "Proxy error" }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}

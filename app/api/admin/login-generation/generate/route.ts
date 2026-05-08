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
    const respHeaders = new Headers();
    copyAllowedHeaders(backendRes.headers, respHeaders);

    const resContentType =
      backendRes.headers.get("content-type") ?? "application/json";
    respHeaders.set("content-type", resContentType);

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

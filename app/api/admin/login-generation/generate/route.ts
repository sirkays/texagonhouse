// app/api/admin/login-generation/generate/route.ts
export const runtime = "nodejs";

import { djangoFetch } from "@/app/api/_lib/proxy";

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

    const backendStatus = result.response.status;
    const rawBody = result.text || "";

    // Always try to parse the response as JSON.
    // DRF can return HTML (browsable API) instead of JSON when the
    // Accept header is missing — validate before forwarding.
    try {
      JSON.parse(rawBody);
    } catch {
      // Response is NOT valid JSON (likely DRF browsable HTML page).
      console.error(
        `[login-generation] Backend returned non-JSON (status ${backendStatus}):`,
        rawBody.slice(0, 300)
      );

      // If the backend said 2xx, the operation likely succeeded but
      // we can't parse the result. Return a helpful message.
      if (backendStatus >= 200 && backendStatus < 300) {
        return new Response(
          JSON.stringify({
            detail: "Login generation completed, but the server returned an unparseable response. Please check the admin panel to verify accounts were created.",
            error: "non_json_response",
            stats: null,
            students: [],
            duplicates: [],
          }),
          { status: 200, headers: { "content-type": "application/json" } }
        );
      }

      // Non-2xx non-JSON → wrap the error
      return new Response(
        JSON.stringify({
          detail: `Backend error (HTTP ${backendStatus}). The server may be overloaded or the request timed out.`,
          error: rawBody.slice(0, 200) || "Unknown error",
        }),
        { status: backendStatus, headers: { "content-type": "application/json" } }
      );
    }

    // Valid JSON — forward it as-is
    return new Response(rawBody, {
      status: backendStatus,
      headers: { "content-type": "application/json" },
    });
  } catch (err: any) {
    console.error("login-generation generate proxy error:", err);
    return new Response(
      JSON.stringify({ error: err?.message || "Proxy error" }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}

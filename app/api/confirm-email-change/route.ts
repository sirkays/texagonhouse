// app/api/confirm-email-change/route.ts
import { NextRequest, NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const { response, text, setCookie } = await djangoFetch(
    "/accounts/api/confirm-email-change/",
    {
      method: "POST",
      body: JSON.stringify(body),
    }
  );

  // Optional short debug: shows upstream status/content-type/body length in server logs.
  // Remove or lower verbosity in production once confident.
  console.log(
    "[proxy-confirm-email] upstream",
    response.status,
    response.headers.get("content-type"),
    "body_len:",
    text?.length ?? 0
  );

  // Build a minimal, safe set of headers to forward.
  const headers = new Headers();

  // Forward content-type if upstream provided it; otherwise try to detect JSON
  const upstreamCt = response.headers.get("content-type");
  if (upstreamCt) {
    headers.set("content-type", upstreamCt);
  } else {
    try {
      JSON.parse(text ?? "");
      headers.set("content-type", "application/json; charset=utf-8");
    } catch (err) {
      headers.set("content-type", "text/plain; charset=utf-8");
    }
  }

  // Forward Allow header if present (useful for 405/OPTIONS)
  const allow = response.headers.get("allow");
  if (allow) headers.set("allow", allow);

  // If you need to forward caching or CORS headers, add them intentionally here:
  const cacheControl = response.headers.get("cache-control");
  if (cacheControl) headers.set("cache-control", cacheControl);

  // Create the NextResponse using the upstream body (text may be empty)
  const proxyResponse = new NextResponse(text ?? "", {
    status: response.status,
    statusText: response.statusText,
    headers,
  });

  // Forward Set-Cookie correctly (handle multiple cookies)
  if (setCookie) {
    if (Array.isArray(setCookie)) {
      setCookie.forEach((c) => proxyResponse.headers.append("Set-Cookie", c));
    } else {
      proxyResponse.headers.append("Set-Cookie", setCookie);
    }
  }

  return proxyResponse;
}
// app/api/change-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const { response, text, setCookie } = await djangoFetch(
    "/accounts/api/reset-password/",
    {
      method: "POST",
      body: JSON.stringify(body),
    }
  );

  // debug log
  //console.log("[proxy] upstream status", response.status, "content-type:", response.headers.get("content-type"), "body_len:", text?.length ?? 0);

  // Build safe headers to forward
  const headers = new Headers();
  // forward content-type if present, otherwise deduce it from text
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

  // forward caching/allow headers that are useful
  const allow = response.headers.get("allow");
  if (allow) headers.set("allow", allow);

  // Create response body as text (may be empty)
  const proxyResponse = new NextResponse(text ?? "", {
    status: response.status,
    statusText: response.statusText,
    headers,
  });

  // Forward set-cookie properly
  if (setCookie) {
    if (Array.isArray(setCookie)) {
      setCookie.forEach((c) => proxyResponse.headers.append("Set-Cookie", c));
    } else {
      proxyResponse.headers.append("Set-Cookie", setCookie);
    }
  }

  return proxyResponse;
}
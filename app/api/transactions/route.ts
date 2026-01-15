// app/api/transactions/route.ts
import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetch } from "@/app/api/_lib/proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function GET(req: Request) {
  noStore();

  // Preserve the original query string (?type=...&page=... etc.)
  const { searchParams } = new URL(req.url);
  const path = `/billing/api/transactions-list/?${searchParams.toString()}`;

  const { response, text, setCookie } = await djangoFetch(path, {
    method: "GET",
  });

  const contentType = response.headers.get("content-type") || "";

  // If backend errors, forward status + details like before
  if (!response.ok) {
    const res = NextResponse.json(
      { error: `Backend returned ${response.status}`, details: text },
      { status: response.status }
    );

    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  }

  // JSON response
  if (contentType.includes("application/json")) {
    try {
      const data = JSON.parse(text);
      const res = NextResponse.json(data, { status: 200 });
      if (setCookie) res.headers.set("set-cookie", setCookie);
      return res;
    } catch {
      const res = NextResponse.json(
        { error: "Invalid JSON from backend", details: text.slice(0, 300) },
        { status: 502 }
      );
      if (setCookie) res.headers.set("set-cookie", setCookie);
      return res;
    }
  }

  // Non-JSON response
  const res = new NextResponse(text, {
    status: 200,
    headers: { "Content-Type": contentType || "text/plain; charset=utf-8" },
  });

  if (setCookie) res.headers.set("set-cookie", setCookie);
  return res;
}

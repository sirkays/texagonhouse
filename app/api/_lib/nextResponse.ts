// app/api/_lib/nextResponse.ts
import { NextResponse } from "next/server";

const NO_STORE_HEADERS = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

export function jsonWithDjangoCookie(
  body: any,
  opts: { status?: number; setCookie?: string } = {}
) {
  const res = NextResponse.json(body, {
    status: opts.status ?? 200,
    headers: NO_STORE_HEADERS,
  });

  if (opts.setCookie) res.headers.set("set-cookie", opts.setCookie);
  return res;
}

import { NextRequest, NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function GET(req: NextRequest) {
  const qs = req.nextUrl.searchParams.toString();
  const path = `/orgs/api/admin/complaints/${qs ? `?${qs}` : ""}`;

  const { response, text, setCookie } = await djangoFetch(path, { method: "GET" });
  const data = text ? JSON.parse(text) : null;

  const res = NextResponse.json(data, { status: response.status });
  if (setCookie) res.headers.set("set-cookie", setCookie);
  return res;
}

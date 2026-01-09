import { NextRequest, NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function GET() {
  const { response, text, setCookie } = await djangoFetch(`/orgs/api/admin/billing/plans/`, {
    method: "GET",
  });

  const data = text ? JSON.parse(text) : null;
  const res = NextResponse.json(data, { status: response.status });
  if (setCookie) res.headers.set("set-cookie", setCookie);
  return res;
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const { response, text, setCookie } = await djangoFetch(`/orgs/api/admin/billing/plans/`, {
    method: "POST",
    body: JSON.stringify(body),
  });

  const data = text ? JSON.parse(text) : null;
  const res = NextResponse.json(data, { status: response.status });
  if (setCookie) res.headers.set("set-cookie", setCookie);
  return res;
}

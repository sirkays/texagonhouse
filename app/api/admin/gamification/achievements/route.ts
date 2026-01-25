import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const qs = searchParams.toString();
  const { response, text, setCookie } = await djangoFetch(`/gamification/api/admin/gamification/achievements${qs ? `?${qs}` : ""}`, {
    method: "GET",
  });
  const res = new NextResponse(text, { status: response.status });
  if (setCookie) res.headers.set("set-cookie", setCookie);
  res.headers.set("Content-Type", "application/json");
  return res;
}

export async function POST(req: Request) {
  const body = await req.json();
  const { response, text, setCookie } = await djangoFetch("/gamification/api/admin/gamification/achievements", {
    method: "POST",
    body: JSON.stringify(body),
  });
  const res = new NextResponse(text, { status: response.status });
  if (setCookie) res.headers.set("set-cookie", setCookie);
  res.headers.set("Content-Type", "application/json");
  return res;
}

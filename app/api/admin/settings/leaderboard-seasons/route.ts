import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function GET() {
  const { response, text, setCookie } = await djangoFetch(
    "/core/api/admin/settings/leaderboard-seasons/",
    { method: "GET" }
  );

  const res = new NextResponse(text, { status: response.status });
  if (setCookie) res.headers.set("set-cookie", setCookie);
  res.headers.set("Content-Type", "application/json");
  return res;
}

export async function POST(req: Request) {
  const body = await req.text();

  const { response, text, setCookie } = await djangoFetch(
    "/core/api/admin/settings/leaderboard-seasons/",
    { method: "POST", body }
  );

  const res = new NextResponse(text, { status: response.status });
  if (setCookie) res.headers.set("set-cookie", setCookie);
  res.headers.set("Content-Type", "application/json");
  return res;
}

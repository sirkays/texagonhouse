// app/api/admin/leaderboard/seasons/route.ts
import { djangoFetch } from "@/app/api/_lib/proxy";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const qs = url.searchParams.toString();

  const { response, text, setCookie } = await djangoFetch(
    `/gamification/api/admin/leaderboard/seasons/?${qs}`,
    { method: "GET" }
  );

  const res = new NextResponse(text, { status: response.status });
  if (setCookie) res.headers.set("set-cookie", setCookie);
  return res;
}

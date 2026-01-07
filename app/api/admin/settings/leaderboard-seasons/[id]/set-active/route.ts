import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function POST(_: Request, ctx: { params: { id: string } }) {
  const { response, text, setCookie } = await djangoFetch(
    `/core/api/admin/settings/leaderboard-seasons/${ctx.params.id}/set-active/`,
    { method: "POST" }
  );

  const res = new NextResponse(text, { status: response.status });
  if (setCookie) res.headers.set("set-cookie", setCookie);
  res.headers.set("Content-Type", "application/json");
  return res;
}

import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function GET(_: Request, ctx: { params: { id: string } }) {
  const { response, text, setCookie } = await djangoFetch(
    `/core/api/admin/settings/leaderboard-seasons/${ctx.params.id}/`,
    { method: "GET" }
  );
  const res = new NextResponse(text, { status: response.status });
  if (setCookie) res.headers.set("set-cookie", setCookie);
  res.headers.set("Content-Type", "application/json");
  return res;
}

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  const body = await req.text();
  const { response, text, setCookie } = await djangoFetch(
    `/core/api/admin/settings/leaderboard-seasons/${ctx.params.id}/`,
    { method: "PATCH", body }
  );
  const res = new NextResponse(text, { status: response.status });
  if (setCookie) res.headers.set("set-cookie", setCookie);
  res.headers.set("Content-Type", "application/json");
  return res;
}

export async function DELETE(_: Request, ctx: { params: { id: string } }) {
  const { response, text, setCookie } = await djangoFetch(
    `/core/api/admin/settings/leaderboard-seasons/${ctx.params.id}/`,
    { method: "DELETE" }
  );
  const res = new NextResponse(text, { status: response.status });
  if (setCookie) res.headers.set("set-cookie", setCookie);
  res.headers.set("Content-Type", "application/json");
  return res;
}

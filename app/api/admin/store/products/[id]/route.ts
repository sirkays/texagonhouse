import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  const body = await req.text();
  const r = await djangoFetch(`/core/api/admin/store/products/${ctx.params.id}`, { method: "PATCH", body });
  if (!r.response.ok) {
    return NextResponse.json({ detail: r.text || "Failed" }, { status: r.response.status });
  }
  const res = NextResponse.json(JSON.parse(r.text), { status: 200 });
  if (r.setCookie) res.headers.set("set-cookie", r.setCookie);
  return res;
}

export async function DELETE(_: Request, ctx: { params: { id: string } }) {
  const r = await djangoFetch(`/core/api/admin/store/products/${ctx.params.id}`, { method: "DELETE" });
  if (!r.response.ok) {
    return NextResponse.json({ detail: r.text || "Failed" }, { status: r.response.status });
  }
  const res = NextResponse.json({}, { status: 204 });
  if (r.setCookie) res.headers.set("set-cookie", r.setCookie);
  return res;
}

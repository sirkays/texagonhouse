// app/api/admin/store/products/[id]/route.ts
import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

type Params = { id: string };

export async function PATCH(req: Request, ctx: { params: Promise<Params> }) {
  const { id } = await ctx.params;

  const body = await req.text();

  const r = await djangoFetch(`/core/api/admin/store/products/${id}`, {
    method: "PATCH",
    body,
  });

  if (!r.response.ok) {
    const res = NextResponse.json(
      { detail: r.text || "Failed" },
      { status: r.response.status }
    );
    if (r.setCookie) res.headers.set("set-cookie", r.setCookie);
    return res;
  }

  const res = NextResponse.json(JSON.parse(r.text), { status: 200 });
  if (r.setCookie) res.headers.set("set-cookie", r.setCookie);
  return res;
}

export async function DELETE(_req: Request, ctx: { params: Promise<Params> }) {
  const { id } = await ctx.params;

  const r = await djangoFetch(`/core/api/admin/store/products/${id}`, {
    method: "DELETE",
  });

  if (!r.response.ok) {
    const res = NextResponse.json(
      { detail: r.text || "Failed" },
      { status: r.response.status }
    );
    if (r.setCookie) res.headers.set("set-cookie", r.setCookie);
    return res;
  }

  const res = NextResponse.json({}, { status: 204 });
  if (r.setCookie) res.headers.set("set-cookie", r.setCookie);
  return res;
}

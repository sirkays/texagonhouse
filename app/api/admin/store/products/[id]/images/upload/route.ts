import { NextResponse } from "next/server";
import { djangoFetchRaw } from "@/app/api/_lib/proxy";

export async function POST(req: Request, ctx: { params: { id: string } }) {
  const form = await req.formData();

  const r = await djangoFetchRaw(`/core/api/admin/store/products/${ctx.params.id}/images/upload`, {
    method: "POST",
    body: form,
  });

  const text = await r.response.text();

  if (!r.response.ok) {
    return NextResponse.json({ detail: text || "Upload failed" }, { status: r.response.status });
  }

  const res = NextResponse.json(JSON.parse(text), { status: 201 });
  if (r.setCookie) res.headers.set("set-cookie", r.setCookie);
  return res;
}

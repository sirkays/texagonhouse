import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const q = searchParams.get("q") || "";
  const product_type = searchParams.get("product_type") || "";
  const category_id = searchParams.get("category_id") || "";
  const is_active = searchParams.get("is_active") || "";
  const page = searchParams.get("page") || "1";
  const page_size = searchParams.get("page_size") || "20";

  const qs = new URLSearchParams({
    q,
    product_type,
    category_id,
    is_active,
    page,
    page_size,
  });

  const r = await djangoFetch(`/core/api/admin/store/products?${qs.toString()}`, { method: "GET" });
  if (!r.response.ok) {
    return NextResponse.json({ detail: r.text || "Failed" }, { status: r.response.status });
  }
  const res = NextResponse.json(JSON.parse(r.text), { status: 200 });
  if (r.setCookie) res.headers.set("set-cookie", r.setCookie);
  return res;
}

export async function POST(req: Request) {
  const body = await req.text();
  const r = await djangoFetch(`/core/api/admin/store/products`, { method: "POST", body });
  if (!r.response.ok) {
    return NextResponse.json({ detail: r.text || "Failed" }, { status: r.response.status });
  }
  const res = NextResponse.json(JSON.parse(r.text), { status: 201 });
  if (r.setCookie) res.headers.set("set-cookie", r.setCookie);
  return res;
}

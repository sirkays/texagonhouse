import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function GET() {
  const r = await djangoFetch(`/core/api/admin/store/categories?page=1&page_size=200`, { method: "GET" });
  if (!r.response.ok) return NextResponse.json({ detail: r.text }, { status: r.response.status });
  return NextResponse.json(JSON.parse(r.text), { status: 200 });
}

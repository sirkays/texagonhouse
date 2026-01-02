// app/api/store/products/[slug]/reviews/route.ts
import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> } // ✅
) {
  const { slug } = await params; // ✅
  const { res, text } = await djangoFetch(`/store/api/products/${slug}/reviews/`, {
    method: "GET",
  });
  return new NextResponse(text, { status: res.status });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> } // ✅
) {
  const { slug } = await params; // ✅
  const body = await req.text();

  const { res, text } = await djangoFetch(`/store/api/products/${slug}/reviews/`, {
    method: "POST",
    body,
    headers: { "Content-Type": "application/json" },
  });

  return new NextResponse(text, { status: res.status });
}

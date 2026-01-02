import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const { res, text } = await djangoFetch(
    `/store/api/products/${slug}/reviews/my-review/`,
    { method: "GET" }
  );

  return new NextResponse(text, { status: res.status });
}

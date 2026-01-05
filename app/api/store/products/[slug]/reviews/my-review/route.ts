// app/api/store/products/[slug]/reviews/my-review/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  const { response, text, setCookie } = await djangoFetch(
    `/store/api/products/${slug}/reviews/my-review/`,
    { method: "GET" }
  );

  const res = new NextResponse(text, { status: response.status });
  if (setCookie) res.headers.set("set-cookie", setCookie);
  return res;
}

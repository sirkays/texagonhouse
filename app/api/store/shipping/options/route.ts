import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function GET() {
  const { res, text } = await djangoFetch(`/store/api/shipping/options/`, {
    method: "GET",
  });

  return new NextResponse(text, { status: res.status });
}

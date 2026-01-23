import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function GET() {
  const { response, text } = await djangoFetch(`/store/api/shipping/options/`, {
    method: "GET",
  });

  return new NextResponse(text, { status: response.status });
}

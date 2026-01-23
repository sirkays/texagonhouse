import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const tracking_number = (url.searchParams.get("tracking_number") || "").trim();
  const last4 = (url.searchParams.get("last4") || "").trim();

  const qs = new URLSearchParams();
  if (tracking_number) qs.set("tracking_number", tracking_number);
  if (last4) qs.set("last4", last4);

  const { response, text } = await djangoFetch(
    `/store/api/shipments/track/?${qs.toString()}/`,
    { method: "GET" }
  );

  return new NextResponse(text, { status: response.status });
}

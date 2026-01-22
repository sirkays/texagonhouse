import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ shipment_id: string }> }
) {
  const { shipment_id } = await params;

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const { response, text } = await djangoFetch(`/store/api/shipments/${shipment_id}/set-tracking/`, {
    method: "POST",
    body: JSON.stringify(body),
  });

  return new NextResponse(text, { status: response.status });
}

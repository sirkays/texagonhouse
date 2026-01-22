import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ order_id: string }> }
) {
  const { order_id } = await params;

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const { response, text } = await djangoFetch(`/store/api/orders/${order_id}/shipments/create/`, {
    method: "POST",
    body: JSON.stringify(body),
  });

  // pass-through response
  return new NextResponse(text, { status: response.status });
}

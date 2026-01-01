// texagon_academy\texagonui\app\api\store\orders\[order_id]\shipments\route.ts
import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ order_id: string }> }
) {
  const { order_id } = await params;

  const { res, text } = await djangoFetch(
    `/store/api/orders/${order_id}/shipments/`,
    { method: "GET" }
  );


  return new NextResponse(text, { status: res.status });
}

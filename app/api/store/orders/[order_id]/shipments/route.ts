// texagon_academy\texagonui\app\api\store\orders\[order_id]\shipments\route.ts
import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ order_id: string }> }
) {
  const { order_id } = await params;

  const { response, text, setCookie } = await djangoFetch(
    `/store/api/orders/${order_id}/shipments/`,
    { method: "GET" }
  );

  const nextRes = new NextResponse(text, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "application/json",
      "Cache-Control": "no-store",
    },
  });

  if (setCookie) nextRes.headers.set("set-cookie", setCookie);

  return nextRes;
}

// texagonui/app/api/store/shipments/[shipment_id]/events/route.ts
import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

/* =========================
   GET – list tracking events
   ========================= */
export async function GET(
  _req: Request,
  { params }: { params: { shipment_id: string } }
) {
  const shipmentId = params.shipment_id;

  if (!shipmentId || shipmentId === "undefined") {
    return NextResponse.json(
      { detail: "Missing shipment_id in route params", params },
      { status: 400 }
    );
  }

  const { res, text } = await djangoFetch(
    `/store/api/shipments/${shipmentId}/events/`,
    { method: "GET" }
  );

  return new NextResponse(text, { status: res.status });
}

/* =========================
   POST – add tracking event
   ========================= */
export async function POST(
  req: Request,
  { params }: { params: { shipment_id: string } }
) {
  const shipmentId = params.shipment_id;

  if (!shipmentId || shipmentId === "undefined") {
    return NextResponse.json(
      { detail: "Missing shipment_id in route params", params },
      { status: 400 }
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { detail: "Invalid JSON body" },
      { status: 400 }
    );
  }

  // Forward payload exactly as Django expects
  const { res, text } = await djangoFetch(
    `/store/api/shipments/${shipmentId}/events/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event_code: body.event_code,
        description: body.description,
        occurred_at: body.occurred_at,
        city: body.city,
        state: body.state,
        country: body.country,
        postal_code: body.postal_code,
        carrier_status: body.carrier_status,
      }),
    }
  );

  return new NextResponse(text, { status: res.status });
}

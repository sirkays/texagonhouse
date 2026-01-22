// texagonui/app/api/store/shipments/[shipment_id]/events/route.ts
import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

type Params = { shipment_id: string };

function normalizeShipmentId(id: unknown) {
  const s = typeof id === "string" ? id : "";
  if (!s || s === "undefined" || s === "null") return null;
  return s;
}

/* =========================
   GET – list tracking events
   ========================= */
export async function GET(
  _req: Request,
  { params }: { params: Promise<Params> }
) {
  const { shipment_id } = await params;
  const shipmentId = normalizeShipmentId(shipment_id);

  if (!shipmentId) {
    return NextResponse.json(
      { detail: "Missing shipment_id in route params" },
      { status: 400 }
    );
  }

  const { response, text, setCookie } = await djangoFetch(
    `/store/api/shipments/${shipmentId}/events/`,
    { method: "GET" }
  );

  const res = new NextResponse(text, { status: response.status });

  const ct = response.headers.get("content-type");
  if (ct) res.headers.set("content-type", ct);
  if (setCookie) res.headers.set("set-cookie", setCookie);

  return res;
}

/* =========================
   POST – add tracking event
   ========================= */
export async function POST(
  req: Request,
  { params }: { params: Promise<Params> }
) {
  const { shipment_id } = await params;
  const shipmentId = normalizeShipmentId(shipment_id);

  if (!shipmentId) {
    return NextResponse.json(
      { detail: "Missing shipment_id in route params" },
      { status: 400 }
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ detail: "Invalid JSON body" }, { status: 400 });
  }

  const { response, text, setCookie } = await djangoFetch(
    `/store/api/shipments/${shipmentId}/events/`,
    {
      method: "POST",
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

  const res = new NextResponse(text, { status: response.status });

  const ct = response.headers.get("content-type");
  if (ct) res.headers.set("content-type", ct);
  if (setCookie) res.headers.set("set-cookie", setCookie);

  return res;
}

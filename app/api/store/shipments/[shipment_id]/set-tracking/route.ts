// app/api/store/shipments/[shipment_id]/set-tracking/route.ts
import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

type Params = { shipment_id: string };

interface ShipmentItem {
  order_item_id: string;
  title: string;
  quantity: number;
}

interface ShipmentEvent {
  id: string;
  code: string;
  desc: string;
  occurred_at: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  carrier_status: string;
}

interface ShipmentAddress {
  name: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
  email: string;
}

interface Shipment {
  id: string;
  order_id: string;
  status: string;
  carrier: string | null;
  method: string | null;
  tracking_number: string;
  tracking_url: string | null;
  label_url: string | null;
  label_cost: string;
  currency: string;
  to: ShipmentAddress;
  shipped_at: string | null;
  delivered_at: string | null;
  items: ShipmentItem[];
  events: ShipmentEvent[];
}

function normalizeShipmentId(id: unknown) {
  const s = typeof id === "string" ? id : "";
  if (!s || s === "undefined" || s === "null") return null;
  return s;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<Params> }
) {
  // ✅ Next.js requires awaiting params
  const { shipment_id } = await params;
  const shipmentId = normalizeShipmentId(shipment_id);

  if (!shipmentId) {
    return NextResponse.json(
      { error: "Missing shipment_id in route params" },
      { status: 400 }
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const { response, text, setCookie } = await djangoFetch(
      `/store/api/shipments/${shipmentId}/set-tracking/`,
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    );

    // Handle common status codes like your old route
    if (!response.ok) {
      let details: any = null;
      try {
        details = text ? JSON.parse(text) : null;
      } catch {
        // ignore
      }

      let res: NextResponse;
      if (response.status === 401) {
        res = NextResponse.json(
          { error: "Session expired", redirect: "/login", details },
          { status: 401 }
        );
      } else if (response.status === 400) {
        res = NextResponse.json({ error: "Invalid request", details }, { status: 400 });
      } else if (response.status === 403) {
        res = NextResponse.json({ error: "Forbidden", details }, { status: 403 });
      } else if (response.status === 404) {
        res = NextResponse.json({ error: "Shipment not found", details }, { status: 404 });
      } else {
        res = NextResponse.json(
          { error: "Failed to set tracking", details },
          { status: response.status }
        );
      }

      if (setCookie) res.headers.set("set-cookie", setCookie);
      return res;
    }

    // Parse + normalize response
    let data: Shipment;
    try {
      data = JSON.parse(text);
    } catch {
      const res = NextResponse.json({ error: "Invalid response format" }, { status: 500 });
      if (setCookie) res.headers.set("set-cookie", setCookie);
      return res;
    }

    const normalizedData: Shipment = {
      id: data?.id || "",
      order_id: data?.order_id || "",
      status: data?.status || "",
      carrier: data?.carrier ?? null,
      method: data?.method ?? null,
      tracking_number: data?.tracking_number || "",
      tracking_url: data?.tracking_url ?? null,
      label_url: data?.label_url ?? null,
      label_cost: data?.label_cost || "0",
      currency: data?.currency || "",
      to: {
        name: data?.to?.name || "",
        line1: data?.to?.line1 || "",
        line2: data?.to?.line2 || "",
        city: data?.to?.city || "",
        state: data?.to?.state || "",
        postal_code: data?.to?.postal_code || "",
        country: data?.to?.country || "",
        phone: data?.to?.phone || "",
        email: data?.to?.email || "",
      },
      shipped_at: data?.shipped_at ?? null,
      delivered_at: data?.delivered_at ?? null,
      items: (data?.items || []).map((item) => ({
        order_item_id: item?.order_item_id || "",
        title: item?.title || "",
        quantity: item?.quantity || 0,
      })),
      events: (data?.events || []).map((event) => ({
        id: event?.id || "",
        code: event?.code || "",
        desc: event?.desc || "",
        occurred_at: event?.occurred_at || "",
        city: event?.city || "",
        state: event?.state || "",
        country: event?.country || "",
        postal_code: event?.postal_code || "",
        carrier_status: event?.carrier_status || "",
      })),
    };

    const res = NextResponse.json(normalizedData, { status: 200 });
    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  } catch {
    return NextResponse.json({ error: "Failed to set tracking" }, { status: 500 });
  }
}

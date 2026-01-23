// app/api/store/shipments/[shipment_id]/status/route.ts
import { NextResponse } from "next/server";
import { djangoFetch } from "@/app/api/_lib/proxy";

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

export async function POST(
  req: Request,
  { params }: { params: { shipment_id: string } }
) {
  try {
    const body = await req.json();

    // Django endpoint path (proxy will add BASE_URL)
    const path = `/store/api/shipments/${params.shipment_id}/status/`;

    const { response, text, setCookie } = await djangoFetch(path, {
      method: "POST",
      body: JSON.stringify(body),
      // no need to set headers here unless you want extras;
      // proxy.ts already sets Api-Key, Content-Type, X-Session-Token, Cookie
    });

    // Map Django errors to your API errors
    if (!response.ok) {
      let payload: any = null;
      try {
        payload = text ? JSON.parse(text) : null;
      } catch {
        // ignore parse failure
      }

      if (response.status === 401) {
        const res = NextResponse.json(
          { error: "Session expired", redirect: "/login", details: payload },
          { status: 401 }
        );
        if (setCookie) res.headers.set("set-cookie", setCookie);
        return res;
      }

      if (response.status === 400) {
        const res = NextResponse.json(
          { error: "Invalid request", details: payload },
          { status: 400 }
        );
        if (setCookie) res.headers.set("set-cookie", setCookie);
        return res;
      }

      if (response.status === 403) {
        const res = NextResponse.json(
          { error: "Forbidden", details: payload },
          { status: 403 }
        );
        if (setCookie) res.headers.set("set-cookie", setCookie);
        return res;
      }

      if (response.status === 404) {
        const res = NextResponse.json(
          { error: "Shipment not found", details: payload },
          { status: 404 }
        );
        if (setCookie) res.headers.set("set-cookie", setCookie);
        return res;
      }

      const res = NextResponse.json(
        { error: "Failed to update shipment status", details: payload },
        { status: response.status }
      );
      if (setCookie) res.headers.set("set-cookie", setCookie);
      return res;
    }

    // Parse response JSON
    let data: Shipment;
    try {
      data = JSON.parse(text);
    } catch {
      const res = NextResponse.json(
        { error: "Invalid response format" },
        { status: 500 }
      );
      if (setCookie) res.headers.set("set-cookie", setCookie);
      return res;
    }

    // Normalize like before (with safe fallbacks)
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
    return NextResponse.json(
      { error: "Failed to update shipment status" },
      { status: 500 }
    );
  }
}

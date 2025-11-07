// app/api/store/shipments/[shipment_id]/set-tracking/route.ts
import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

const BASE_URL = "https://texagonbackend.epichouse.online/store/api";
const API_KEY = "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

const headers = (sessionToken: string | undefined) => ({
  Authorization: `Api-Key ${API_KEY}`,
  "Content-Type": "application/json",
  ...(sessionToken && {"X-Session-Token": sessionToken}),
});

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
  {params}: {params: {shipment_id: string}}
) {
  const body = await req.json();
  const fullUrl = `${BASE_URL}/shipments/${params.shipment_id}/set-tracking/`;
  const session = await getServerSession(authOptions);
  const sessionToken = session?.user?.sessionToken;
  try {
    const response = await fetch(fullUrl, {
      method: "POST",
      headers: headers(sessionToken ? sessionToken : undefined),
      body: JSON.stringify(body),
    });
    const rawResponse = await response.text();
    if (!response.ok) {
      if (response.status === 401)
        return NextResponse.json(
          {error: "Session expired", redirect: "/login"},
          {status: 401}
        );
      if (response.status === 400)
        return NextResponse.json({error: "Invalid request"}, {status: 400});
      if (response.status === 403)
        return NextResponse.json({error: "Forbidden"}, {status: 403});
      if (response.status === 404)
        return NextResponse.json({error: "Shipment not found"}, {status: 404});
      return NextResponse.json(
        {error: "Failed to set tracking"},
        {status: response.status}
      );
    }
    let data: Shipment;
    try {
      data = JSON.parse(rawResponse);
    } catch (parseError) {
      return NextResponse.json(
        {error: "Invalid response format"},
        {status: 500}
      );
    }
    const normalizedData: Shipment = {
      id: data.id || "",
      order_id: data.order_id || "",
      status: data.status || "",
      carrier: data.carrier || null,
      method: data.method || null,
      tracking_number: data.tracking_number || "",
      tracking_url: data.tracking_url || null,
      label_url: data.label_url || null,
      label_cost: data.label_cost || "0",
      currency: data.currency || "",
      to: {
        name: data.to.name || "",
        line1: data.to.line1 || "",
        line2: data.to.line2 || "",
        city: data.to.city || "",
        state: data.to.state || "",
        postal_code: data.to.postal_code || "",
        country: data.to.country || "",
        phone: data.to.phone || "",
        email: data.to.email || "",
      },
      shipped_at: data.shipped_at || null,
      delivered_at: data.delivered_at || null,
      items: data.items.map((item) => ({
        order_item_id: item.order_item_id || "",
        title: item.title || "",
        quantity: item.quantity || 0,
      })),
      events: data.events.map((event) => ({
        id: event.id || "",
        code: event.code || "",
        desc: event.desc || "",
        occurred_at: event.occurred_at || "",
        city: event.city || "",
        state: event.state || "",
        country: event.country || "",
        postal_code: event.postal_code || "",
        carrier_status: event.carrier_status || "",
      })),
    };
    return NextResponse.json(normalizedData, {status: 200});
  } catch (error) {
    return NextResponse.json({error: "Failed to set tracking"}, {status: 500});
  }
}

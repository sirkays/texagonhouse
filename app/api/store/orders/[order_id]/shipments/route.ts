import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {unstable_noStore as noStore} from "next/cache";

const BASE_URL = "https://texagonbackend.onrender.com/store/api";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

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

interface ShipmentTo {
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
  to: ShipmentTo;
  shipped_at: string | null;
  delivered_at: string | null;
  items: ShipmentItem[];
  events: ShipmentEvent[];
}

interface ShipmentsResponse {
  results: Shipment[];
}

export async function GET(
  req: Request,
  {params}: {params: {order_id: string}}
) {
  noStore();
  const session = await getServerSession(authOptions);

  if (!session?.user?.sessionToken) {
    return NextResponse.json(
      {error: "Not authenticated", redirect: "/login"},
      {status: 401}
    );
  }

  const sessionToken = session.user.sessionToken;

  const fullUrl = `${BASE_URL}/orders/${params.order_id}/shipments/`;
  console.log("[StoreShipmentsListAPI] Initiating fetch for:", fullUrl);

  try {
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: headers(sessionToken),
    });

    const rawResponse = await response.text();

    if (!response.ok) {
      if (response.status === 401)
        return NextResponse.json(
          {error: "Session expired", redirect: "/login"},
          {status: 401}
        );
      if (response.status === 403)
        return NextResponse.json({error: "Forbidden"}, {status: 403});
      if (response.status === 404)
        return NextResponse.json({error: "Shipments not found"}, {status: 404});
      return NextResponse.json(
        {error: "Failed to fetch shipments"},
        {status: response.status}
      );
    }

    let data: ShipmentsResponse;
    try {
      data = JSON.parse(rawResponse);
    } catch (parseError) {
      return NextResponse.json(
        {error: "Invalid response format"},
        {status: 500}
      );
    }

    const normalizedData: ShipmentsResponse = {
      results: data.results.map((shipment) => ({
        id: shipment.id || "",
        order_id: shipment.order_id || "",
        status: shipment.status || "",
        carrier: shipment.carrier || null,
        method: shipment.method || null,
        tracking_number: shipment.tracking_number || "",
        tracking_url: shipment.tracking_url || null,
        label_url: shipment.label_url || null,
        label_cost: shipment.label_cost || "0",
        currency: shipment.currency || "",
        to: {
          name: shipment.to.name || "",
          line1: shipment.to.line1 || "",
          line2: shipment.to.line2 || "",
          city: shipment.to.city || "",
          state: shipment.to.state || "",
          postal_code: shipment.to.postal_code || "",
          country: shipment.to.country || "",
          phone: shipment.to.phone || "",
          email: shipment.to.email || "",
        },
        shipped_at: shipment.shipped_at || null,
        delivered_at: shipment.delivered_at || null,
        items: shipment.items.map((item) => ({
          order_item_id: item.order_item_id || "",
          title: item.title || "",
          quantity: item.quantity || 0,
        })),
        events: shipment.events.map((event) => ({
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
      })),
    };

    return NextResponse.json(normalizedData, {
      status: 200,
      headers: {"Cache-Control": "no-store"},
    });
  } catch (error) {
    return NextResponse.json(
      {error: "Failed to fetch shipments"},
      {status: 500}
    );
  }
}

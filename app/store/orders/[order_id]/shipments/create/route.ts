// app/api/store/orders/[orderId]/shipments/create/route.ts
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
  {params}: {params: {orderId: string}}
) {
  const {orderId} = params;
  const body = await req.json();
  const fullUrl = `${BASE_URL}/orders/${orderId}/shipments/create/`;
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
        return NextResponse.json({error: "Invalid carrier"}, {status: 400});
      if (response.status === 403)
        return NextResponse.json({error: "Forbidden"}, {status: 403});
      if (response.status === 404)
        return NextResponse.json({error: "Order not found"}, {status: 404});
      return NextResponse.json(
        {error: "Failed to create shipment"},
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
    return NextResponse.json(data, {status: 201});
  } catch (error) {
    return NextResponse.json(
      {error: "Failed to create shipment"},
      {status: 500}
    );
  }
}

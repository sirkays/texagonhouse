// app/api/store/orders/[orderId]/route.ts
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

interface OrderItem {
  title: string;
  qty: number;
  price: string;
}

interface ShipmentEvent {
  code: string;
  desc: string;
  at: string;
  city: string;
  state: string;
  country: string;
}

interface Shipment {
  id: string;
  status: string;
  tracking_number: string;
  tracking_url: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  events: ShipmentEvent[];
}

interface Order {
  id: string;
  status: string;
  grand_total: string;
  items: OrderItem[];
  shipments: Shipment[];
}

export async function GET(
  _req: Request,
  {params}: {params: {orderId: string}}
) {
  const {orderId} = params;
  const fullUrl = `${BASE_URL}/orders/${orderId}`;
  const session = await getServerSession(authOptions);
  const sessionToken = session?.user?.sessionToken;
  try {
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: headers(sessionToken ? sessionToken : undefined),
    });
    const rawResponse = await response.text();
    if (!response.ok) {
      if (response.status === 401)
        return NextResponse.json(
          {error: "Session expired", redirect: "/login"},
          {status: 401}
        );
      if (response.status === 404)
        return NextResponse.json({error: "Not found"}, {status: 404});
      if (response.status === 403)
        return NextResponse.json({error: "Forbidden"}, {status: 403});
      return NextResponse.json(
        {error: "Failed to fetch order"},
        {status: response.status}
      );
    }
    let data: Order;
    try {
      data = JSON.parse(rawResponse);
    } catch (parseError) {
      return NextResponse.json(
        {error: "Invalid response format"},
        {status: 500}
      );
    }
    const normalizedOrder: Order = {
      id: data.id || "",
      status: data.status || "",
      grand_total: data.grand_total || "0",
      items: data.items.map((i) => ({
        title: i.title || "",
        qty: i.qty || 0,
        price: i.price || "0",
      })),
      shipments: data.shipments || [],
    };
    return NextResponse.json(normalizedOrder, {status: 200});
  } catch (error) {
    return NextResponse.json({error: "Failed to fetch order"}, {status: 500});
  }
}

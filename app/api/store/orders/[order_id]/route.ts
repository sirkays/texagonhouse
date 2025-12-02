import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {unstable_noStore as noStore} from "next/cache";

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

interface OrderDetailResponse {
  id: string;
  status: string;
  grand_total: string;
  items: OrderItem[];
  shipments: Shipment[];
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

  const fullUrl = `${BASE_URL}/orders/${params.order_id}`;
  console.log("[StoreOrderDetailAPI] Initiating fetch for:", fullUrl);

  try {
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: headers(sessionToken),
    });

    const rawResponse = await response.text();

    console.log(
      "Raw response:uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu",
      rawResponse
    );

    if (!response.ok) {
      if (response.status === 401)
        return NextResponse.json(
          {error: "Session expired", redirect: "/login"},
          {status: 401}
        );
      if (response.status === 403)
        return NextResponse.json({error: "Forbidden"}, {status: 403});
      if (response.status === 404)
        return NextResponse.json({error: "Order not found"}, {status: 404});
      return NextResponse.json(
        {error: "Failed to fetch order"},
        {status: response.status}
      );
    }

    let data: OrderDetailResponse;
    try {
      data = JSON.parse(rawResponse);
    } catch (parseError) {
      return NextResponse.json(
        {error: "Invalid response format"},
        {status: 500}
      );
    }

    const normalizedData: OrderDetailResponse = {
      id: data.id || "",
      status: data.status || "",
      grand_total: data.grand_total || "0",
      items: data.items.map((item) => ({
        title: item.title || "",
        qty: item.qty || 0,
        price: item.price || "0",
      })),
      shipments: data.shipments.map((shipment) => ({
        id: shipment.id || "",
        status: shipment.status || "",
        tracking_number: shipment.tracking_number || "",
        tracking_url: shipment.tracking_url || null,
        shipped_at: shipment.shipped_at || null,
        delivered_at: shipment.delivered_at || null,
        events: shipment.events.map((event) => ({
          code: event.code || "",
          desc: event.desc || "",
          at: event.at || "",
          city: event.city || "",
          state: event.state || "",
          country: event.country || "",
        })),
      })),
    };

    return NextResponse.json(normalizedData, {
      status: 200,
      headers: {"Cache-Control": "no-store"},
    });
  } catch (error) {
    return NextResponse.json({error: "Failed to fetch order"}, {status: 500});
  }
}

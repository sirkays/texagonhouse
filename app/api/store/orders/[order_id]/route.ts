import {NextRequest, NextResponse} from "next/server";
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
  req: NextRequest,
  { params }: { params: Promise<{ order_id: string }> }
) {
  noStore();

  const { order_id } = await params; // ✅ await params
  const orderId = order_id;

  if (!orderId) {
    return NextResponse.json(
      { error: "Missing order_id in route params" },
      { status: 400 }
    );
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.sessionToken) {
    return NextResponse.json(
      { error: "Not authenticated", redirect: "/login" },
      { status: 401 }
    );
  }

  const sessionToken = session.user.sessionToken;
  const fullUrl = `${BASE_URL}/orders/${orderId}`;

  const response = await fetch(fullUrl, {
    method: "GET",
    headers: headers(sessionToken),
  });

  const rawResponse = await response.text();

  if (!response.ok) {
    if (response.status === 401)
      return NextResponse.json(
        { error: "Session expired", redirect: "/login" },
        { status: 401 }
      );
    if (response.status === 403)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (response.status === 404)
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: response.status }
    );
  }

  let data: OrderDetailResponse;
  try {
    data = JSON.parse(rawResponse);
  } catch {
    return NextResponse.json({ error: "Invalid response format" }, { status: 500 });
  }

  // normalize + return...
  return NextResponse.json(data, { status: 200, headers: { "Cache-Control": "no-store" } });
}
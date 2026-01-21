// app/api/orders/[order_id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { djangoFetch } from "@/app/api/_lib/proxy";

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

  const { order_id } = await params;
  const orderId = order_id;

  if (!orderId) {
    return NextResponse.json(
      { error: "Missing order_id in route params" },
      { status: 400 }
    );
  }

  // Keep your explicit auth response (even though proxy.ts also reads session)
  const session = await getServerSession(authOptions);
  if (!session?.user?.sessionToken) {
    return NextResponse.json(
      { error: "Not authenticated", redirect: "/login" },
      { status: 401 }
    );
  }

  // IMPORTANT:
  // proxy.ts BASE_URL is just the host, so include the full API path here.
  const { response, text, setCookie } = await djangoFetch(
    `/store/api/orders/${orderId}`,
    { method: "GET" }
  );

  if (!response.ok) {
    if (response.status === 401) {
      const res = NextResponse.json(
        { error: "Session expired", redirect: "/login" },
        { status: 401 }
      );
      if (setCookie) res.headers.set("set-cookie", setCookie);
      return res;
    }

    if (response.status === 403) {
      const res = NextResponse.json({ error: "Forbidden" }, { status: 403 });
      if (setCookie) res.headers.set("set-cookie", setCookie);
      return res;
    }

    if (response.status === 404) {
      const res = NextResponse.json({ error: "Order not found" }, { status: 404 });
      if (setCookie) res.headers.set("set-cookie", setCookie);
      return res;
    }

    const res = NextResponse.json(
      { error: "Failed to fetch order" },
      { status: response.status }
    );
    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;
  }

  let data: OrderDetailResponse;
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

  const res = NextResponse.json(data, {
    status: 200,
    headers: { "Cache-Control": "no-store" },
  });

  // Forward Django session cookie back to browser
  if (setCookie) res.headers.set("set-cookie", setCookie);

  return res;
}

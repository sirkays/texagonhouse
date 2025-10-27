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

// Use the same Shipment interface as above

export async function POST(
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

  const body = await req.json();

  const fullUrl = `${BASE_URL}/orders/${params.order_id}/shipments/create/`;
  console.log("[StoreShipmentCreateAPI] Initiating POST to:", fullUrl);

  try {
    const response = await fetch(fullUrl, {
      method: "POST",
      headers: headers(sessionToken),
      body: JSON.stringify(body),
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
      items: data.items.map((item: any) => ({
        order_item_id: item.order_item_id || "",
        title: item.title || "",
        quantity: item.quantity || 0,
      })),
      events: data.events.map((event: any) => ({
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

    return NextResponse.json(normalizedData, {
      status: 201,
      headers: {"Cache-Control": "no-store"},
    });
  } catch (error) {
    return NextResponse.json(
      {error: "Failed to create shipment"},
      {status: 500}
    );
  }
}

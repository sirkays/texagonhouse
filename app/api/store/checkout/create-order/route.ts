// app/api/store/checkout/create-order/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { unstable_noStore as noStore } from "next/cache";

//const BASE_URL = "http://127.0.0.1:9098/store/api";
const BASE_URL = "https://texagonbackend.onrender.com/store/api";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

const headers = (sessionToken: string | undefined) => ({
  Authorization: `Api-Key ${API_KEY}`,
  "Content-Type": "application/json",
  ...(sessionToken && { "X-Session-Token": sessionToken }),
});

interface CreateOrderRequest {
  billing_address_id?: string | null;
  shipping_address_id?: string | null;
  phone_number?: string | null;

  // ✅ BNPL additions
  is_bnpl?: boolean;
  bnpl_plan_id?: string | null;
  product_id?: string | null;
  quantity?: number | null;
}

type AnyJson = Record<string, any>;

export async function POST(req: Request) {
  noStore();

  const session = await getServerSession(authOptions);
  const sessionToken = session?.user?.sessionToken;

  if (!sessionToken) {
    return NextResponse.json(
      { error: "Session expired", redirect: "/login" },
      { status: 401 }
    );
  }

  let body: CreateOrderRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const fullUrl = `${BASE_URL}/checkout/create-order/`; // keep trailing slash

  try {
    const response = await fetch(fullUrl, {
      method: "POST",
      headers: headers(sessionToken),
      body: JSON.stringify(body), // ✅ forwards BNPL product_id + qty
    });

    const rawResponse = await response.text();

    if (!response.ok) {
      // pass through backend message if possible
      let backend: AnyJson = {};
      try {
        backend = JSON.parse(rawResponse);
      } catch {}

      if (response.status === 401) {
        return NextResponse.json(
          { error: "Session expired", redirect: "/login" },
          { status: 401 }
        );
      }
      if (response.status === 400) {
        return NextResponse.json(
          { error: backend?.detail || backend?.error || "Invalid request" },
          { status: 400 }
        );
      }
      if (response.status === 403) {
        return NextResponse.json(
          { error: backend?.detail || backend?.error || "Forbidden" },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { error: backend?.detail || backend?.error || "Failed to create order" },
        { status: response.status }
      );
    }

    let data: AnyJson;
    try {
      data = JSON.parse(rawResponse);
    } catch {
      return NextResponse.json(
        { error: "Invalid response format" },
        { status: 500 }
      );
    }

    // ✅ Normalize to match your CheckoutClient usage:
    // it checks: orderData?.id || orderData?.order_id
    const normalized = {
      id: data?.id || data?.order_id || data?.orderId || "",
      order_id: data?.order_id || data?.id || "",
      grand_total: data?.grand_total || data?.grandTotal || data?.total_amount || "0.00",
      total_amount: data?.total_amount || data?.grand_total || "0.00",
    };

    return NextResponse.json(normalized, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

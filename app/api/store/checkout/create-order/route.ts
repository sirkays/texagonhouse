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
  billing_address_id?: string;
  shipping_address_id?: string;
}

interface CreateOrderResponse {
  order_id: string;
  grand_total: string;
}

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

  const fullUrl = `${BASE_URL}/checkout/create-order/`; // ✅ trailing slash

  try {
    const response = await fetch(fullUrl, {
      method: "POST",
      headers: headers(sessionToken),
      body: JSON.stringify(body),
    });

    const rawResponse = await response.text();

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { error: "Session expired", redirect: "/login" },
          { status: 401 }
        );
      }
      if (response.status === 400) {
        return NextResponse.json(
          { error: "Cart is empty or invalid addresses" },
          { status: 400 }
        );
      }
      if (response.status === 403) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      return NextResponse.json(
        { error: "Failed to create order" },
        { status: response.status }
      );
    }

    let data: CreateOrderResponse;
    try {
      data = JSON.parse(rawResponse);
    } catch {
      return NextResponse.json(
        { error: "Invalid response format" },
        { status: 500 }
      );
    }

    const normalized: CreateOrderResponse = {
      order_id: data.order_id || "",
      grand_total: data.grand_total || "0",
    };

    return NextResponse.json(normalized, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

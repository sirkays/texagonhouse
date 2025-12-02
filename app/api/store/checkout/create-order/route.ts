// app/api/store/checkout/create-order/route.ts
import {NextResponse} from "next/server";

const BASE_URL = "https://texagonbackend.onrender.com/store/api";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

const headers = (sessionToken: string | undefined) => ({
  "X-API-KEY": API_KEY,
  "Content-Type": "application/json",
  ...(sessionToken && {"X-SESSION-TOKEN": sessionToken}),
});

interface CreateOrderRequest {
  billing_address_id?: string;
  shipping_address_id?: string;
}

interface CreateOrderResponse {
  order_id: string;
  grand_total: string;
}

const getSessionToken = (req: Request): string | undefined => {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return req.headers.get("x-session-token") || undefined;
};

export async function POST(req: Request) {
  try {
    const sessionToken = getSessionToken(req);

    if (!sessionToken) {
      return NextResponse.json(
        {error: "Authentication required"},
        {status: 401}
      );
    }

    const body: CreateOrderRequest = await req.json();

    const response = await fetch(`${BASE_URL}/checkout/create-order`, {
      method: "POST",
      headers: headers(sessionToken),
      body: JSON.stringify(body),
    });

    const rawResponse = await response.text();

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          {error: "Session expired", redirect: "/login"},
          {status: 401}
        );
      }
      if (response.status === 400) {
        return NextResponse.json(
          {error: "Cart is empty or invalid addresses"},
          {status: 400}
        );
      }
      return NextResponse.json(
        {error: "Failed to create order"},
        {status: response.status}
      );
    }

    let data: CreateOrderResponse;
    try {
      data = JSON.parse(rawResponse);
    } catch (parseError) {
      return NextResponse.json(
        {error: "Invalid response format"},
        {status: 500}
      );
    }

    const normalizedData: CreateOrderResponse = {
      order_id: data.order_id || "",
      grand_total: data.grand_total || "0",
    };

    return NextResponse.json(normalizedData, {status: 201});
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json({error: "Failed to create order"}, {status: 500});
  }
}

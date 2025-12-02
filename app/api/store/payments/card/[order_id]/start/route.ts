// app/api/store/payments/card/[orderId]/start/route.ts
import {NextResponse} from "next/server";

const BASE_URL = "https://texagonbackend.epichouse.online/store/api";
const API_KEY = "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

const headers = (sessionToken: string | undefined) => ({
  "X-API-KEY": API_KEY,
  "Content-Type": "application/json",
  ...(sessionToken && {"X-SESSION-TOKEN": sessionToken}),
});

interface PaymentStartRequest {
  provider?: "stripe" | "paystack";
  currency?: string;
}

interface PaymentStartResponse {
  payment_id: string;
  status: string;
  amount: string;
}

const getSessionToken = (req: Request): string | undefined => {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return req.headers.get("x-session-token") || undefined;
};

export async function POST(
  req: Request,
  {params}: {params: {orderId: string}}
) {
  const {orderId} = params;

  try {
    const sessionToken = getSessionToken(req);

    if (!sessionToken) {
      return NextResponse.json(
        {error: "Authentication required"},
        {status: 401}
      );
    }

    const body: PaymentStartRequest = await req.json();

    const response = await fetch(`${BASE_URL}/payments/card/${orderId}/start`, {
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
      if (response.status === 404) {
        return NextResponse.json({error: "Order not found"}, {status: 404});
      }
      return NextResponse.json(
        {error: "Failed to start payment"},
        {status: response.status}
      );
    }

    let data: PaymentStartResponse;
    try {
      data = JSON.parse(rawResponse);
    } catch (parseError) {
      return NextResponse.json(
        {error: "Invalid response format"},
        {status: 500}
      );
    }

    return NextResponse.json(data, {status: 200});
  } catch (error) {
    console.error("Payment start error:", error);
    return NextResponse.json({error: "Failed to start payment"}, {status: 500});
  }
}

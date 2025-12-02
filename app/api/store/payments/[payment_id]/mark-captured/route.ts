// app/api/store/payments/[paymentId]/mark-captured/route.ts
import {NextResponse} from "next/server";

const BASE_URL = "https://texagonbackend.onrender.com/store/api";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

const headers = (sessionToken: string | undefined) => ({
  "X-API-KEY": API_KEY,
  "Content-Type": "application/json",
  ...(sessionToken && {"X-SESSION-TOKEN": sessionToken}),
});

interface MarkCapturedRequest {
  provider_ref?: string;
}

interface MarkCapturedResponse {
  detail: string;
  order_status: string;
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
  {params}: {params: {paymentId: string}}
) {
  const {paymentId} = params;

  try {
    const sessionToken = getSessionToken(req);

    if (!sessionToken) {
      return NextResponse.json(
        {error: "Authentication required"},
        {status: 401}
      );
    }

    const body: MarkCapturedRequest = await req.json();

    const response = await fetch(
      `${BASE_URL}/payments/${paymentId}/mark-captured`,
      {
        method: "POST",
        headers: headers(sessionToken),
        body: JSON.stringify(body),
      }
    );

    const rawResponse = await response.text();

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({error: "Payment not found"}, {status: 404});
      }
      return NextResponse.json(
        {error: "Failed to capture payment"},
        {status: response.status}
      );
    }

    let data: MarkCapturedResponse;
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
    console.error("Mark captured error:", error);
    return NextResponse.json(
      {error: "Failed to mark payment as captured"},
      {status: 500}
    );
  }
}

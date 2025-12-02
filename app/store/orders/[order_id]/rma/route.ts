// app/api/store/orders/[orderId]/rma/route.ts
import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";

const BASE_URL = "https://texagonbackend.onrender.com/store/api";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

const headers = (sessionToken: string | undefined) => ({
  Authorization: `Api-Key ${API_KEY}`,
  "Content-Type": "application/json",
  ...(sessionToken && {"X-Session-Token": sessionToken}),
});

interface RMAResponse {
  rma_id: string;
  rma_number: string;
}

export async function POST(
  req: Request,
  {params}: {params: {orderId: string}}
) {
  const {orderId} = params;
  const body = await req.json();
  const fullUrl = `${BASE_URL}/orders/${orderId}/rma`;
  const session = await getServerSession(authOptions);
  const sessionToken = session?.user?.sessionToken;
  try {
    const response = await fetch(fullUrl, {
      method: "POST",
      headers: headers(sessionToken ? sessionToken : undefined),
      body: JSON.stringify(body),
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
        {error: "Failed to create RMA"},
        {status: response.status}
      );
    }
    let data: RMAResponse;
    try {
      data = JSON.parse(rawResponse);
    } catch (parseError) {
      return NextResponse.json(
        {error: "Invalid response format"},
        {status: 500}
      );
    }
    const normalizedData: RMAResponse = {
      rma_id: data.rma_id || "",
      rma_number: data.rma_number || "",
    };
    return NextResponse.json(normalizedData, {status: 201});
  } catch (error) {
    return NextResponse.json({error: "Failed to create RMA"}, {status: 500});
  }
}

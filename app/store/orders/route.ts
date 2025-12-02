// app/api/store/orders/route.ts
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

interface OrderItem {
  title: string;
  qty: number;
  price: string;
}

interface Order {
  id: string;
  status: string;
  grand_total: string;
  created_at: string;
  items: OrderItem[];
}

interface OrdersResponse {
  results: Order[];
}

export async function GET() {
  const fullUrl = `${BASE_URL}/orders`;
  const session = await getServerSession(authOptions);
  const sessionToken = session?.user?.sessionToken;
  try {
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: headers(sessionToken ? sessionToken : undefined),
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
      return NextResponse.json(
        {error: "Failed to fetch orders"},
        {status: response.status}
      );
    }
    let data: OrdersResponse;
    try {
      data = JSON.parse(rawResponse);
    } catch (parseError) {
      return NextResponse.json(
        {error: "Invalid response format"},
        {status: 500}
      );
    }
    const normalizedOrders: Order[] = data.results.map((item) => ({
      id: item.id || "",
      status: item.status || "",
      grand_total: item.grand_total || "0",
      created_at: item.created_at || "",
      items: item.items.map((i) => ({
        title: i.title || "",
        qty: i.qty || 0,
        price: i.price || "0",
      })),
    }));
    return NextResponse.json({results: normalizedOrders}, {status: 200});
  } catch (error) {
    return NextResponse.json({error: "Failed to fetch orders"}, {status: 500});
  }
}

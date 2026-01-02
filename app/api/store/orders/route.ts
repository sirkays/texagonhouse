//texagon_academy\texagonui\app\api\store\orders\route.ts
import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {unstable_noStore as noStore} from "next/cache";

//const BASE_URL = "http://127.0.0.1:9098/store/api";
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

interface Customer {
  id?: string | null;
  full_name?: string;
  email?: string;
  phone?: string;
}

interface Address {
  full_name?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  phone?: string;
}

interface OrderItem {
  id?: string; // ✅ add
  title: string;
  qty: number;
  price: string;
  sku?: string; // ✅ add
}

interface Order {
  id: string;
  status: string;
  grand_total: string;
  created_at: string;

  customer?: Customer; // ✅ add
  shipping_address?: Address | null; // ✅ add
  billing_address?: Address | null; // ✅ add

  items: OrderItem[];

  is_bnpl?: boolean;
  agreement_id?: string | null;
  bnpl_status?: string | null;
  bnpl_provider?: string | null;
  next_payment?: string | null;
  remaining_payments?: number | null;
}

interface OrdersResponse {
  results: Order[];
}

interface CreateOrderResponse {
  id: string;
}

export async function GET(req: Request) {
  noStore();
  const session = await getServerSession(authOptions);

  if (!session?.user?.sessionToken) {
    return NextResponse.json(
      {error: "Not authenticated", redirect: "/login"},
      {status: 401}
    );
  }

  const sessionToken = session.user.sessionToken;

  const url = new URL(req.url);
  const status = url.searchParams.get("status"); // "paid" etc.

  const fullUrl = status
    ? `${BASE_URL}/orders/?status=${encodeURIComponent(status)}`
    : `${BASE_URL}/orders/`;

  try {
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: headers(sessionToken),
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
        return NextResponse.json({error: "Orders not found"}, {status: 404});
      return NextResponse.json(
        {error: "Failed to fetch orders"},
        {status: response.status}
      );
    }

    let data: OrdersResponse;
    try {
      data = JSON.parse(rawResponse);
    } catch {
      return NextResponse.json(
        {error: "Invalid response format"},
        {status: 500}
      );
    }
    const normalizedData: OrdersResponse = {
      results: (data.results || []).map((item: any) => ({
        id: item.id || "",
        status: item.status || "",
        grand_total: item.grand_total || "0",
        created_at: item.created_at || "",

        shipments_count: item.shipments_count || "0",
        has_shipment: item.has_shipment || false,

        // ✅ pass through customer + addresses
        customer: item.customer
          ? {
              id: String(item.customer.id ?? ""),
              full_name: String(item.customer.full_name ?? ""),
              email: String(item.customer.email ?? ""),
              phone: String(item.customer.phone ?? ""),
            }
          : undefined,

        shipping_address: item.shipping_address
          ? {
              full_name: String(item.shipping_address.full_name ?? ""),
              line1: String(item.shipping_address.line1 ?? ""),
              line2: String(item.shipping_address.line2 ?? ""),
              city: String(item.shipping_address.city ?? ""),
              state: String(item.shipping_address.state ?? ""),
              postal_code: String(item.shipping_address.postal_code ?? ""),
              country: String(item.shipping_address.country ?? ""),
              phone: String(item.shipping_address.phone ?? ""),
            }
          : null,

        billing_address: item.billing_address
          ? {
              full_name: String(item.billing_address.full_name ?? ""),
              line1: String(item.billing_address.line1 ?? ""),
              line2: String(item.billing_address.line2 ?? ""),
              city: String(item.billing_address.city ?? ""),
              state: String(item.billing_address.state ?? ""),
              postal_code: String(item.billing_address.postal_code ?? ""),
              country: String(item.billing_address.country ?? ""),
              phone: String(item.billing_address.phone ?? ""),
            }
          : null,

        items: (item.items || []).map((subItem: any) => ({
          id: String(subItem.id ?? ""), // ✅ now included
          title: String(subItem.title ?? ""),
          qty: Number(subItem.qty ?? 0),
          price: String(subItem.price ?? "0"),
          sku: String(subItem.sku ?? ""), // ✅ now included
        })),

        is_bnpl: !!item.is_bnpl,
        agreement_id: item.agreement_id ?? null,
        bnpl_status: item.bnpl_status ?? null,
        bnpl_provider: item.bnpl_provider ?? null,
        next_payment: item.next_payment ?? null,
        remaining_payments: item.remaining_payments ?? null,
      })),
    };

    return NextResponse.json(normalizedData, {
      status: 200,
      headers: {"Cache-Control": "no-store"},
    });
  } catch {
    return NextResponse.json({error: "Failed to fetch orders"}, {status: 500});
  }
}

export async function POST(req: Request) {
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

  const fullUrl = `${BASE_URL}/orders/`;

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
      id: data.id || "",
    };

    return NextResponse.json(normalizedData, {
      status: 200,
      headers: {"Cache-Control": "no-store"},
    });
  } catch (error) {
    return NextResponse.json({error: "Failed to create order"}, {status: 500});
  }
}

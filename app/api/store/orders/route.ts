// texagon_academy/texagonui/app/api/store/orders/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { unstable_noStore as noStore } from "next/cache";
import { djangoFetch } from "@/app/api/_lib/proxy";

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
  id?: string;
  title: string;
  qty: number;
  price: string;
  sku?: string;
  product_slug: string;
}

interface Order {
  id: string;
  status: string;
  grand_total: string;
  created_at: string;

  shipments_count?: string;
  has_shipment?: boolean;

  customer?: Customer;
  shipping_address?: Address | null;
  billing_address?: Address | null;

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

function withForwardedCookie(res: NextResponse, setCookie?: string) {
  if (setCookie) {
    // Forward Django session cookies back to browser
    res.headers.set("Set-Cookie", setCookie);
  }
  return res;
}

export async function GET(req: Request) {
  noStore();

  // keep the same auth behavior you had
  const session = await getServerSession(authOptions);
  if (!session?.user?.sessionToken) {
    return NextResponse.json(
      { error: "Not authenticated", redirect: "/login" },
      { status: 401 }
    );
  }

  const url = new URL(req.url);
  const status = url.searchParams.get("status");

  const path = status
    ? `/store/api/orders/?status=${encodeURIComponent(status)}`
    : `/store/api/orders/`;

  try {
    const { response, text, setCookie } = await djangoFetch(path, {
      method: "GET",
    });

    if (!response.ok) {
      if (response.status === 401) {
        const res = NextResponse.json(
          { error: "Session expired", redirect: "/login" },
          { status: 401 }
        );
        return withForwardedCookie(res, setCookie);
      }
      if (response.status === 403) {
        const res = NextResponse.json({ error: "Forbidden" }, { status: 403 });
        return withForwardedCookie(res, setCookie);
      }
      if (response.status === 404) {
        const res = NextResponse.json(
          { error: "Orders not found" },
          { status: 404 }
        );
        return withForwardedCookie(res, setCookie);
      }

      const res = NextResponse.json(
        { error: "Failed to fetch orders" },
        { status: response.status }
      );
      return withForwardedCookie(res, setCookie);
    }

    let data: OrdersResponse;
    try {
      data = JSON.parse(text);
    } catch {
      const res = NextResponse.json(
        { error: "Invalid response format" },
        { status: 500 }
      );
      return withForwardedCookie(res, setCookie);
    }

    const normalizedData: OrdersResponse = {
      results: (data.results || []).map((item: any) => ({
        id: item.id || "",
        status: item.status || "",
        grand_total: item.grand_total || "0",
        created_at: item.created_at || "",

        shipments_count: String(item.shipments_count ?? "0"),
        has_shipment: !!item.has_shipment,

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
          id: String(subItem.id ?? ""),
          title: String(subItem.title ?? ""),
          qty: Number(subItem.qty ?? 0),
          price: String(subItem.price ?? "0"),
          sku: String(subItem.sku ?? ""),
          product_slug: String(subItem.product_slug ?? ""),
        })),

        is_bnpl: !!item.is_bnpl,
        agreement_id: item.agreement_id ?? null,
        bnpl_status: item.bnpl_status ?? null,
        bnpl_provider: item.bnpl_provider ?? null,
        next_payment: item.next_payment ?? null,
        remaining_payments: item.remaining_payments ?? null,
      })),
    };

    const res = NextResponse.json(normalizedData, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
    return withForwardedCookie(res, setCookie);
  } catch {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  noStore();

  // keep the same auth behavior you had
  const session = await getServerSession(authOptions);
  if (!session?.user?.sessionToken) {
    return NextResponse.json(
      { error: "Not authenticated", redirect: "/login" },
      { status: 401 }
    );
  }

  const body = await req.json();

  try {
    const { response, text, setCookie } = await djangoFetch(`/store/api/orders/`, {
      method: "POST",
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      if (response.status === 401) {
        const res = NextResponse.json(
          { error: "Session expired", redirect: "/login" },
          { status: 401 }
        );
        return withForwardedCookie(res, setCookie);
      }
      if (response.status === 403) {
        const res = NextResponse.json({ error: "Forbidden" }, { status: 403 });
        return withForwardedCookie(res, setCookie);
      }

      const res = NextResponse.json(
        { error: "Failed to create order" },
        { status: response.status }
      );
      return withForwardedCookie(res, setCookie);
    }

    let data: CreateOrderResponse;
    try {
      data = JSON.parse(text);
    } catch {
      const res = NextResponse.json(
        { error: "Invalid response format" },
        { status: 500 }
      );
      return withForwardedCookie(res, setCookie);
    }

    const normalizedData: CreateOrderResponse = { id: data.id || "" };

    const res = NextResponse.json(normalizedData, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
    return withForwardedCookie(res, setCookie);
  } catch {
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
